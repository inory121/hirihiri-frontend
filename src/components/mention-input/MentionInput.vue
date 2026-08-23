<template>
  <div class="mention-input-wrap">
    <div
      ref="editorRef"
      class="mention-editor"
      :class="{ focused: isFocused, 'is-empty': isEmpty, active: isActive, 'no-bg-change': noBgChange }"
      contenteditable="true"
      :data-placeholder="placeholder"
      @input="onInput"
      @keydown="onKeydown"
      @focus="onFocus"
      @blur="onBlur"
      @paste="onPaste"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount,computed } from 'vue'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  /** 是否处于“激活”状态（工具栏可见时）。激活时背景为白色，否则为灰色 */
  active?: boolean
  /** 子评论等场景：禁用灰↔白背景变化，始终为静态白底 */
  noBgChange?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
  (e: 'atTrigger', keyword: string | null, rect: DOMRect | null): void
  (e: 'input', val: string): void
  (e: 'focus'): void
  (e: 'blur'): void
}>()

const editorRef = ref<HTMLDivElement | null>(null)
const isFocused = ref(false)
const isEmpty = ref(true)
const isActive = computed(() => props.active ?? false)

// 递归提取纯文本：<br> 与块级元素视为换行；mention span 在提交时转成 @<uid>，
// 后端 `Pattern.compile("@(\\d+)")` 只会识别 @uid，以此生成 at 通知。
const extractText = (root: Node, forSubmit: boolean): string => {
  let text = ''
  const walk = (node: Node) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        text += child.textContent ?? ''
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement
        if (el.tagName === 'BR') {
          text += '\n'
        } else if (el.classList?.contains('mention')) {
          if (forSubmit) {
            const uid = el.dataset.uid
            text += uid ? `@${uid}` : (el.textContent ?? '')
          } else {
            text += el.textContent ?? ''
          }
        } else if (el.tagName === 'DIV' || el.tagName === 'P') {
          // 浏览器可能把换行渲染成块级元素，前后补换行
          if (text && !text.endsWith('\n')) text += '\n'
          walk(child)
          if (text && !text.endsWith('\n')) text += '\n'
        } else {
          walk(child)
        }
      }
    })
  }
  walk(root)
  return text
}

// 从 DOM 提取纯文本（mention span → @username，文本节点保持原样）
const getPlainText = (): string => {
  if (!editorRef.value) return ''
  return extractText(editorRef.value, false)
}

// 与 B站一致处理换行：
// - 单个空行（\n\n）原样保留；
// - ≥2 个连续空行（≥3 个连续换行）直接去掉空行与换行（避免刷屏式空行）。
const normalizeNewlines = (text: string): string => {
  return text.replace(/[\r\n]{3,}/g, '')
}

// 提交时使用的文本：把 mention span 替换为 @<uid> 数字形式
const getSubmitContent = (): string => {
  if (!editorRef.value) return ''
  // 原样保留用户输入的换行（content.message 存储换行符），展示时由
  // .comment-content 的 white-space: pre-wrap 渲染为换行；仅对超长空行做归一化，
  // 并做首尾 trim 去掉输入结束时残留的尾随 <br> 换行。
  return normalizeNewlines(extractText(editorRef.value, true)).trim()
}

const getAtKeywordBeforeCaret = (): string | null => {
  const editor = editorRef.value
  const selection = window.getSelection()
  if (!editor || !selection || selection.rangeCount === 0) return null

  const range = selection.getRangeAt(0)
  const beforeCaret = document.createRange()
  beforeCaret.selectNodeContents(editor)
  beforeCaret.setEnd(range.startContainer, range.startOffset)
  const textBeforeCaret = beforeCaret.toString()
  const match = textBeforeCaret.match(/@([^@\s\u00a0]*)$/)
  return match ? match[1] : null
}

// 获取光标在视口下的矩形（用于 @ 面板定位）
const getCaretRect = (): DOMRect | null => {
  const editor = editorRef.value
  const selection = window.getSelection()
  if (!editor || !selection || selection.rangeCount === 0) return null
  const range = selection.getRangeAt(0)
  if (!editor.contains(range.startContainer)) return null
  // 克隆一个临时 range，不要改动用户选区
  const tmp = range.cloneRange()
  tmp.collapse(true)
  let rect = tmp.getBoundingClientRect()
  // 空内容时可能是 0 宽高，退回编辑器左上角坐标
  if (!rect || (rect.width === 0 && rect.height === 0)) {
    const er = editor.getBoundingClientRect()
    rect = {
      top: er.top + 10,
      left: er.left + 12,
      right: er.left + 12,
      bottom: er.top + 34,
      x: er.left + 12,
      y: er.top + 10,
      width: 0,
      height: 24,
      toJSON() { return this },
    } as DOMRect
  }
  return rect
}

let lastAtKeyword: string | null | undefined

const emitAtKeywordBeforeCaret = (force = false) => {
  const keyword = getAtKeywordBeforeCaret()
  if (!force && keyword === lastAtKeyword) return
  lastAtKeyword = keyword
  emit('atTrigger', keyword, keyword !== null ? getCaretRect() : null)
}

const onSelectionChange = () => {
  const editor = editorRef.value
  const selection = window.getSelection()
  if (!isFocused.value || !editor || !selection || selection.rangeCount === 0) return

  const range = selection.getRangeAt(0)
  if (!editor.contains(range.startContainer)) return
  emitAtKeywordBeforeCaret()
}

const onInput = () => {
  const text = getPlainText()
  isEmpty.value = text.trim().length === 0
  emit('update:modelValue', text)
  emit('input', text)

  // 只要光标处于 @关键词末尾，就持续触发搜索；离开关键词时通知父组件关闭面板
  emitAtKeywordBeforeCaret()
}

const onKeydown = (e: KeyboardEvent) => {
  // Enter 换行：手动插入 <br>，避免浏览器生成 <div> 导致纯文本提取丢失换行
  if (e.key === 'Enter') {
    e.preventDefault()
    document.execCommand('insertLineBreak')
  }
}

const onFocus = () => {
  isFocused.value = true
  emit('focus')

  // 等待浏览器完成点击后的光标定位，再搜索 @ 到光标之间的字符
  requestAnimationFrame(() => {
    if (isFocused.value) emitAtKeywordBeforeCaret(true)
  })
}

const onBlur = () => {
  isFocused.value = false
  lastAtKeyword = undefined
  emit('blur')
}

// 粘贴时去掉 HTML 格式，只保留纯文本
const onPaste = (e: ClipboardEvent) => {
  e.preventDefault()
  const text = e.clipboardData?.getData('text/plain') ?? ''
  document.execCommand('insertText', false, text)
}

// 向编辑器中插入 mention span
const insertMention = (username: string, uid: number) => {
  const editor = editorRef.value
  if (!editor) return

  editor.focus()
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return

  const range = sel.getRangeAt(0)

  // 找到当前光标所在文本节点，删除 @ 及其后的搜索关键词
  const node = range.startContainer
  let offset = range.startOffset

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? ''
    const atIdx = text.lastIndexOf('@', offset - 1)
    if (atIdx >= 0) {
      // 删除 @ 到光标之间的内容
      const newRange = document.createRange()
      newRange.setStart(node, atIdx)
      newRange.setEnd(node, offset)
      newRange.deleteContents()
      // 更新 offset
      offset = atIdx
    }
  }

  // 创建 mention span
  const span = document.createElement('span')
  span.className = 'mention'
  span.contentEditable = 'false'
  span.dataset.uid = String(uid)
  span.textContent = `@${username}`

  // 在当前光标位置插入 span
  const insertRange = document.createRange()
  insertRange.setStart(node, offset)
  insertRange.collapse(true)
  insertRange.insertNode(span)

  // 在 span 后插入一个空格文本节点，并将光标移到其后
  const space = document.createTextNode('\u00A0') // 使用 non-breaking space 避免浏览器合并
  span.after(space)

  const newSel = window.getSelection()
  if (newSel) {
    const cur = document.createRange()
    cur.setStartAfter(space)
    cur.collapse(true)
    newSel.removeAllRanges()
    newSel.addRange(cur)
  }

  // 同步纯文本给父组件
  nextTick(() => {
    const text = getPlainText()
    emit('update:modelValue', text)
    emit('input', text)
  })
}

// 清空编辑器
const clear = () => {
  if (editorRef.value) {
    editorRef.value.innerHTML = ''
    isEmpty.value = true
    emit('update:modelValue', '')
  }
  // 复位 @ 关键词状态，关闭可能残留的 @ 候选弹窗（如输入 @ 后未选择直接发布）
  lastAtKeyword = undefined
  emit('atTrigger', null, null)
}

// 聚焦
const focus = () => {
  editorRef.value?.focus()
}

onMounted(() => {
  document.addEventListener('selectionchange', onSelectionChange)
})

onBeforeUnmount(() => {
  document.removeEventListener('selectionchange', onSelectionChange)
})

// 监听外部 modelValue 变化（如清空）同步编辑器与 isEmpty 状态
watch(
  () => props.modelValue,
  (val) => {
    const current = getPlainText()
    if (val === '' && current !== '') {
      // 只在编辑器有内容时才清空，避免死循环
      editorRef.value!.innerHTML = ''
    }
    isEmpty.value = getPlainText().trim().length === 0
  }
)

defineExpose({ insertMention, clear, focus, getSubmitContent })
</script>

<style scoped lang="less">
.mention-input-wrap {
  width: 100%;
  position: relative;
}

.mention-editor {
  width: 100%;
  min-height: 50px;
  max-height: 120px;
  overflow-y: auto;
  padding: 8px 11px;
  font-size: 14px;
  // 与内容区高度一致（min-height 50 - 上下 padding 8×2 = 34），让单行文本与空编辑器
  // 聚焦时的光标垂直居中；flex 布局在空内容时没有 flex-item，caret 会落到顶部导致不居中
  line-height: 34px;
  color: #303133;
  background-color: @bg-gray;
  border: 1px solid transparent;
  border-radius: 4px;
  outline: none;
  word-break: break-word;
  white-space: pre-wrap;
  transition: background-color 0.2s, border-color 0.2s;
  box-sizing: border-box;
  position: relative;

  // 激活（工具栏可见）/ 聚焦 / hover 时变白；隐藏时保持灰色
  &:hover,
  &.focused,
  &.active {
    background-color: #fff;
    border-color: #dcdfe6;
  }

  &.focused {
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  }

  // 子评论等：静态白底，无背景变化
  &.no-bg-change {
    background-color: #fff;
    border-color: #dcdfe6;
  }

  // 占位提示：用 is-empty 控制，输入再删除也能恢复
  // 绝对定位脱离文本流，避免空内容时光标落在占位符文字后面；在编辑器内垂直居中
  &.is-empty::before {
    content: attr(data-placeholder);
    color: #a8abb2;
    pointer-events: none;
    user-select: none;
    position: absolute;
    left: 11px;
    right: 11px;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: center;
  }

  // mention 样式：蓝色、不可编辑、整体选中
  :deep(.mention) {
    display: inline;
    color: #409eff;
    font-weight: 500;
    cursor: default;
    border-radius: 2px;
    padding: 0 1px;
    user-select: all;
  }
}
</style>
