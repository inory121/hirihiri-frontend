<template>
  <div
    @mouseleave="handleMouseLeave"
    style="position: relative"
    @mouseenter="handleMouseEnter"
    @click="handleClick"
  >
    <div style="position: relative" ref="vPopRef">
      <slot name="reference"></slot>
    </div>
    <div class="v-popover" :class="'to-' + placement" :style="popStyle">
      <div
        class="v-popover-content"
        ref="vPopCon"
        :class="isPopoverShow ? 'popShow-' + placement : 'popHide-' + placement"
        :style="{ display: popoverDisplay }"
      >
        <slot name="content"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

// Props 定义
interface Props {
  placement?: 'top' | 'bottom' | 'left' | 'right'
  trigger?: 'hover' | 'click'
  popStyle?: string
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'bottom',
  trigger: 'hover',
  popStyle: '',
})

// Refs
const vPopRef = ref<HTMLElement | null>(null)
const vPopCon = ref<HTMLElement | null>(null)
const popoverDisplay = ref('none')
const isPopoverShow = ref(false)

let inTimer: ReturnType<typeof setTimeout> | undefined

// 显示气泡框
const show = () => {
  popoverDisplay.value = ''
  isPopoverShow.value = true
}

// 隐藏气泡框
const hide = () => {
  isPopoverShow.value = false
  setTimeout(() => {
    popoverDisplay.value = 'none'
  }, 300)
}

// 鼠标悬停事件
const handleMouseEnter = () => {
  if (props.trigger === 'hover') {
    inTimer = setTimeout(() => {
      show()
    }, 100)
  }
}

const handleMouseLeave = () => {
  if (props.trigger === 'hover') {
    clearTimeout(inTimer)
    hide()
  }
}

// 点击事件
const handleClick = () => {
  if (props.trigger === 'click') {
    if (isPopoverShow.value) {
      hide()
    } else {
      show()
    }
  }
}

// 点击空白处关闭气泡
const handleOutsideClick = (event: MouseEvent) => {
  if (
    vPopRef.value &&
    vPopCon.value &&
    !vPopRef.value.contains(event.target as Node) &&
    !vPopCon.value.contains(event.target as Node)
  ) {
    hide()
  }
}

// 生命周期钩子
onMounted(() => {
  if (props.trigger === 'click') {
    window.addEventListener('click', handleOutsideClick)
  }
})

onUnmounted(() => {
  if (props.trigger === 'click') {
    window.removeEventListener('click', handleOutsideClick)
  }
})
</script>

<style scoped lang="less">
.v-popover {
  position: absolute;
  transition: 0.8s;
  z-index: 1;

  &-content {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.1);
    border: 1px solid #e3e5e7;
  }

  &.to-bottom {
    top: 100%;
    left: 50%;
    padding-top: 5px;
  }

  &.to-right {
    top: 50%;
    left: 100%;
    padding-left: 5px;
  }

  &.to-top {
    bottom: 100%;
    left: 50%;
    padding-bottom: 5px;
  }

  &.to-left {
    top: 50%;
    right: 100%;
    padding-right: 5px;
  }

  &.to-top,
  &.to-bottom {
    transform: translate3d(-50%, 0, 0);
  }

  &.to-left,
  &.to-right {
    transform: translate3d(0, -50%, 0);
  }
}

.popHide-bottom {
  animation: fade-out-bottom 0.3s ease-out forwards;
  transform-origin: top;
}

.popShow-bottom {
  animation: fade-in-bottom 0.3s ease-out forwards;
  transform-origin: top;
}

@keyframes fade-in-bottom {
  0% {
    opacity: 0;
    transform: translateY(-5px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-out-bottom {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-5px);
  }
}

.popHide-right {
  animation: fade-out-right 0.3s ease-out forwards;
  transform-origin: left;
}

.popShow-right {
  animation: fade-in-right 0.3s ease-out forwards;
  transform-origin: left;
}

@keyframes fade-in-right {
  0% {
    opacity: 0;
    transform: translateX(-5px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fade-out-right {
  0% {
    opacity: 1;
    transform: translateX(0);
  }
  100% {
    opacity: 0;
    transform: translateX(-5px);
  }
}

.popHide-top {
  animation: fade-out-top 0.3s ease-out forwards;
  transform-origin: bottom;
}

.popShow-top {
  animation: fade-in-top 0.3s ease-out forwards;
  transform-origin: bottom;
}

@keyframes fade-in-top {
  0% {
    opacity: 0;
    transform: translateY(5px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-out-top {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(5px);
  }
}

.popHide-left {
  animation: fade-out-left 0.3s ease-out forwards;
  transform-origin: right;
}

.popShow-left {
  animation: fade-in-left 0.3s ease-out forwards;
  transform-origin: right;
}

@keyframes fade-in-left {
  0% {
    opacity: 0;
    transform: translateX(5px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fade-out-left {
  0% {
    opacity: 1;
    transform: translateX(0);
  }
  100% {
    opacity: 0;
    transform: translateX(5px);
  }
}
</style>
