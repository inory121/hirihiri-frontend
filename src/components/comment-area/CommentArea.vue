<template>
  <div class="comment-wrap">
    <div class="header">
      <div class="navbar">
        <div class="title">
          <h2>评论</h2>
          <span class="count">{{ store.total }}</span>
        </div>
        <div class="sort-actions">
          <el-button
            link
            class="sort"
            :class="{ active: store.sort === 'hot' }"
            @click="changeSort('hot')"
          >最热
          </el-button
          >
          <el-divider direction="vertical"/>
          <el-button
            link
            class="sort"
            :class="{ active: store.sort === 'new' }"
            @click="changeSort('new')"
          >最新
          </el-button
          >
        </div>
      </div>
      <div class="commentbox">
        <div class="user-avatar">
          <img v-if="userStore.isLogin" :src="user.avatar" alt=""/>
          <img v-else :src="DEFAULT_NOFACE_AVATAR" alt=""/>
        </div>
        <div class="editor edit" v-if="userStore.isLogin" @focusout="onEditorFocusOut">
          <div class="at-input-wrap">
            <MentionInput
              ref="rootMentionInput"
              v-model="comment"
              :active="isRootFocused || comment.trim().length > 0 || (showSyncToDynamic && syncToDynamic)"
              placeholder="说点什么吧..."
              @atTrigger="onRootAtTrigger"
              @focus="onRootCommentFocus"
            />
            <div
              v-if="showRootAtPanel"
              class="at-panel"
              :class="{ 'is-above': rootAtPanelPlacement === 'above' }"
              @mousedown.prevent
            >
              <div class="at-panel-header">选择或输入你想@的人</div>
              <div class="at-section">
                <div class="at-section-title">我的关注</div>
                <div v-if="rootFollowings.length === 0" class="at-empty">暂无关注</div>
                <div
                  v-for="u in filteredRootFollowings"
                  :key="u.uid"
                  class="at-user-item"
                  @click="selectAtUser(u)"
                >
                  <img :src="u.avatar || defaultAvatar" class="at-avatar" alt=""/>
                  <div class="at-info">
                    <span class="at-name">{{ u.username }}</span>
                    <span class="at-fans">{{ u.fanCount || 0 }}粉丝</span>
                  </div>
                </div>
              </div>
              <div v-if="rootAtSearchKeyword" class="at-section">
                <div class="at-section-title">其他</div>
                <div v-if="rootSearchUsers.length === 0" class="at-empty">未找到用户</div>
                <div
                  v-for="u in rootSearchUsers"
                  :key="u.uid"
                  class="at-user-item"
                  @click="selectAtUser(u)"
                >
                  <img :src="u.avatar || defaultAvatar" class="at-avatar" alt=""/>
                  <div class="at-info">
                    <span class="at-name">{{ u.username }}</span>
                    <span class="at-fans">{{ u.fanCount || 0 }}粉丝</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            v-show="isRootFocused || comment.trim().length > 0 || (showSyncToDynamic && syncToDynamic)"
            class="editor-actions"
            @mousedown.prevent
          >
            <div class="toolbar-icons">
              <span class="tool-icon at-trigger" title="@用户" @click.stop="onRootAtButtonClick">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
                </svg>
              </span>
              <el-checkbox
                v-if="showSyncToDynamic"
                v-model="syncToDynamic"
                label="同时转发到我的动态"
                style="margin-left: 12px"
              />
            </div>
            <el-button type="primary" class="publish-btn" :loading="sending" @click="sendComment">
              发布
            </el-button>
          </div>
        </div>
        <div class="edit" v-else>
          <span>请先</span>
          <el-button
            type="primary"
            size="small"
            style="margin: 0 5px"
            @click="userStore.showLoginWindow = !userStore.showLoginWindow"
          >登录
          </el-button>
          <span>后发表评论 (・ω・)</span>
        </div>
      </div>
    </div>
    <div class="contents">
      <div
        class="feed"
        :class="{ 'comment-feed--guest': guestMask && !userStore.isLogin && displayedCommentThreads.length >= 2 }"
      >
        <template v-for="(thread, index) in displayedCommentThreads" :key="thread.rootId">
          <div class="comment-thread" :class="{ 'comment-item-wrapper': guestMask && !userStore.isLogin && index === 1 }">
            <CommentItem
              :comment="thread.rootComment"
              :owner-uid="ownerUidForItem"
              :biz-id="bizId"
              :biz-type="bizType"
              :store="storeName"
              @avatar-hover="emitAvatarHover"
              @avatar-leave="emitAvatarLeave"
            />
            <CommentItem
              v-for="reply in thread.visibleReplies"
              :key="reply.id"
              :comment="reply"
              :owner-uid="ownerUidForItem"
              :biz-id="bizId"
              :biz-type="bizType"
              :store="storeName"
              @avatar-hover="emitAvatarHover"
              @avatar-leave="emitAvatarLeave"
            />
            <div v-if="thread.totalReplies > COLLAPSED_REPLY_COUNT && (!thread.expanded || thread.totalPages > 1)" class="reply-control">
              <span v-if="!thread.expanded">共{{ thread.totalReplies }}条回复，</span>
              <button
                v-if="!thread.expanded"
                type="button"
                class="reply-text-btn expand"
                @click="expandReplyList(thread.rootId)"
              >
                点击查看
              </button>
              <div v-else class="reply-pagination">
                <template v-if="thread.totalPages > 1">
                  <span class="reply-page-total">共{{ thread.totalPages }}页</span>
                  <button
                    v-if="thread.currentPage > 1"
                    type="button"
                    class="reply-text-btn"
                    @click="goPrevReplyPage(thread.rootId, thread.currentPage, thread.totalPages)"
                  >
                    上一页
                  </button>
                  <button
                    v-for="pageItem in thread.pageItems"
                    :key="getReplyPageItemKey(pageItem)"
                    type="button"
                    class="reply-page-btn"
                    :class="{
                      active: pageItem.type === 'page' && pageItem.page === thread.currentPage,
                      ellipsis: pageItem.type === 'ellipsis',
                    }"
                    :disabled="pageItem.type === 'ellipsis'"
                    @click="handleReplyPageItemClick(thread.rootId, pageItem, thread.totalPages)"
                  >
                    {{ getReplyPageItemLabel(pageItem) }}
                  </button>
                  <button
                    v-if="thread.currentPage < thread.totalPages"
                    type="button"
                    class="reply-text-btn"
                    @click="goNextReplyPage(thread.rootId, thread.currentPage, thread.totalPages)"
                  >
                    下一页
                  </button>
                </template>
                <button
                  v-if="thread.totalPages > 1"
                  type="button"
                  class="reply-text-btn"
                  @click="collapseReplyList(thread.rootId)"
                >
                  收起
                </button>
              </div>
            </div>
            <!-- 回复输入框：放在 reply-control 之下（回复列表/分页控件下方） -->
            <div
              v-if="userStore.isLogin && isReplyActiveInThread(thread)"
              class="thread-reply-box"
              @focusout="onReplyEditorFocusOut"
            >
              <div class="thread-reply-avatar">
                <img :src="user.avatar" alt=""/>
              </div>
              <div class="thread-reply-editor">
                <div class="at-input-wrap">
                  <MentionInput
                    ref="replyMentionInput"
                    v-model="replyContent"
                    :no-bg-change="true"
                    :placeholder="`回复 @${getReplyTargetName(activeReplyCommentId)}`"
                    @atTrigger="onReplyAtTrigger"
                    @focus="onReplyFocus"
                  />
                  <div
                    v-if="showReplyAtPanel"
                    class="at-panel"
                    :class="{ 'is-above': replyAtPanelPlacement === 'above' }"
                    @mousedown.prevent
                  >
                    <div class="at-panel-header">选择或输入你想@的人</div>
                    <div class="at-section">
                      <div class="at-section-title">我的关注</div>
                      <div v-if="replyFollowings.length === 0" class="at-empty">暂无关注</div>
                      <div
                        v-for="u in filteredReplyFollowings"
                        :key="u.uid"
                        class="at-user-item"
                        @click="selectReplyAtUser(u)"
                      >
                        <img :src="u.avatar || defaultAvatar" class="at-avatar" alt=""/>
                        <div class="at-info">
                          <span class="at-name">{{ u.username }}</span>
                          <span class="at-fans">{{ u.fanCount || 0 }}粉丝</span>
                        </div>
                      </div>
                    </div>
                    <div v-if="replyAtSearchKeyword" class="at-section">
                      <div class="at-section-title">其他</div>
                      <div v-if="replySearchUsers.length === 0" class="at-empty">未找到用户</div>
                      <div
                        v-for="u in replySearchUsers"
                        :key="u.uid"
                        class="at-user-item"
                        @click="selectReplyAtUser(u)"
                      >
                        <img :src="u.avatar || defaultAvatar" class="at-avatar" alt=""/>
                        <div class="at-info">
                          <span class="at-name">{{ u.username }}</span>
                          <span class="at-fans">{{ u.fanCount || 0 }}粉丝</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="editor-actions" v-show="isReplyFocused || replyContent.trim().length > 0" @mousedown.prevent>
                  <div class="toolbar-icons">
                    <span class="tool-icon at-trigger" title="@用户" @click.stop="onReplyAtButtonClick">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                           stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
                        <circle cx="12" cy="12" r="4"/>
                        <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
                      </svg>
                    </span>
                  </div>
                  <div class="reply-actions-right">
                    <el-button type="primary" class="publish-btn" :loading="sending" @click="sendReply()">发布</el-button>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="guestMask && !userStore.isLogin && index === 1 && store.total > 2" class="comment-fade-mask"></div>
          </div>
        </template>
      </div>
      <!-- 未登录登录提示条 -->
      <div
        v-if="guestMask && !userStore.isLogin && store.total > 0"
        class="login-comment-tip"
        @click="userStore.showLoginWindow = true"
      >
        登录后查看 {{ store.total }}+ 条评论
      </div>
      <!-- 懒加载哨兵元素 (仅登录用户显示) -->
      <div v-if="userStore.isLogin" ref="commentSentinelRef" class="comment-sentinel"></div>
      <!-- 加载中提示 -->
      <div v-if="store.loading && userStore.isLogin" class="comment-loading">
        <el-icon class="is-loading">
          <Loading/>
        </el-icon>
        <span>加载中...</span>
      </div>
    </div>
    <div class="end" v-if="userStore.isLogin">
      <div v-if="!store.hasMore && commentList.length > 0" class="bottombar">
        没有更多评论
      </div>
      <div v-else-if="!store.loading && commentList.length === 0" class="bottombar">
        暂无评论，快来抢沙发吧~
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, nextTick, onBeforeUnmount, onMounted, ref, watch} from 'vue'
import {storeToRefs} from 'pinia'
import {useUserStore} from '@/stores/userStore'
import {useCommentStore} from '@/stores/commentStore'
import {useDynamicCommentStore} from '@/stores/dynamicCommentStore'
import {useVideoStore} from '@/stores/videoStore'
import CommentItem from '@/components/comment-item/CommentItem.vue'
import MentionInput from '@/components/mention-input/MentionInput.vue'
import type {Comment, User} from '@/types/api'
import {DEFAULT_NOFACE_AVATAR} from '@/utils/constants'
import {getUserDisplayName} from '@/utils/utils'

const props = defineProps<{
  // 业务类型：video 视频 | dynamic 动态（未来可扩展 column 专栏）
  bizType: 'video' | 'dynamic'
  // 业务资源id：视频用 vid，动态用 dynamicId
  bizId: number
  // 资源UP主uid（动态评论必须传入；视频评论缺省时回退到 videoStore.videoInfo）
  ownerUid?: number
  // 是否显示"同时转发到我的动态"（仅视频页使用）
  showSyncToDynamic?: boolean
  // 未登录时是否只展示前2条并显示登录遮罩（视频页使用）
  guestMask?: boolean
  // 跳转定位的评论id（从通知页跳转时传入，仅视频评论支持）
  highlightCommentId?: number
  // bottombar 底部间距（px）：视频页保留 100，动态页 10
  bottomPadding?: number
}>()

const emit = defineEmits<{
  (e: 'avatar-hover', user: User): void
  (e: 'avatar-leave'): void
}>()

const emitAvatarHover = (user: User) => emit('avatar-hover', user)
const emitAvatarLeave = () => emit('avatar-leave')

const userStore = useUserStore()
const videoCommentStore = useCommentStore()
const dynamicCommentStore = useDynamicCommentStore()
const videoStore = useVideoStore()

// 根据 bizType 选择 store（视频/动态方法签名不同，通过下方适配函数统一调用）
const store = computed(() => (props.bizType === 'video' ? videoCommentStore : dynamicCommentStore))
const storeName = computed<'comment' | 'dynamicComment'>(() =>
  props.bizType === 'video' ? 'comment' : 'dynamicComment',
)

// UP主uid：动态用传入的 ownerUid，视频回退到 videoStore.videoInfo
const ownerUidForItem = computed<number | undefined>(() => {
  if (props.bizType === 'dynamic') return props.ownerUid
  return (videoStore.videoInfo?.video?.uid as number | undefined) ?? props.ownerUid
})

// 分别解构两个 store 的响应式状态，再按 bizType 选取（避免 storeToRefs(computed) 不稳定）
const {commentList: videoCommentList, activeReplyCommentId: videoActiveReplyId} = storeToRefs(videoCommentStore)
const {commentList: dynamicCommentList, activeReplyCommentId: dynamicActiveReplyId} = storeToRefs(dynamicCommentStore)
const commentList = computed(() =>
  props.bizType === 'video' ? videoCommentList.value : dynamicCommentList.value,
)
const activeReplyCommentId = computed(() =>
  props.bizType === 'video' ? videoActiveReplyId.value : dynamicActiveReplyId.value,
)
const setActiveReplyCommentId = (id: number | null) => {
  if (props.bizType === 'video') {
    videoCommentStore.setActiveReplyCommentId(id)
  } else {
    dynamicCommentStore.setActiveReplyCommentId(id)
  }
}
const {user} = storeToRefs(userStore)

const comment = ref('')
const replyContent = ref('')
const sending = ref(false)
const defaultAvatar = DEFAULT_NOFACE_AVATAR

// ===== 加载 =====
const loadComments = async () => {
  if (!props.bizId) return
  if (props.bizType === 'video') {
    await videoCommentStore.getComment(props.bizId)
  } else {
    await dynamicCommentStore.getComments(props.bizId)
  }
  await nextTick()
  if (props.highlightCommentId) {
    await scrollToAndHighlightComment(props.highlightCommentId)
  }
}

onMounted(() => {
  loadComments()
  initCommentObserver()
  window.addEventListener('resize', handleAtPanelViewportChange)
  window.addEventListener('scroll', handleAtPanelViewportChange, true)
})

watch(
  () => props.bizId,
  () => {
    loadComments()
    nextTick(() => initCommentObserver())
  },
)

// 登录状态变化时重建懒加载观察器（未登录时哨兵不存在，登录后需要重建）
watch(
  () => userStore.isLogin,
  async (newIsLogin, oldIsLogin) => {
    if (newIsLogin && !oldIsLogin) {
      await nextTick()
      initCommentObserver()
    }
  },
)

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleAtPanelViewportChange)
  window.removeEventListener('scroll', handleAtPanelViewportChange, true)
  Object.values(atPanelPlacementRaf).forEach((rafId) => {
    if (rafId !== null) cancelAnimationFrame(rafId)
  })
  if (commentObserver) {
    commentObserver.disconnect()
    commentObserver = null
  }
  if (rootAtSearchTimer) clearTimeout(rootAtSearchTimer)
  if (replyAtSearchTimer) clearTimeout(replyAtSearchTimer)
})

// ===== 排序 =====
const changeSort = async (sort: 'hot' | 'new') => {
  if (store.value.sort === sort) return
  store.value.setSort(sort)
  if (props.bizId) {
    await loadComments()
  }
}

// ===== 加载更多（懒加载哨兵）=====
const commentSentinelRef = ref<HTMLElement>()
let commentObserver: IntersectionObserver | null = null

const initCommentObserver = () => {
  if (commentObserver) {
    commentObserver.disconnect()
    commentObserver = null
  }
  if (!commentSentinelRef.value) return
  const loadMoreIfNeeded = () => {
    if (store.value.hasMore && !store.value.loading) {
      if (props.bizType === 'video') {
        videoCommentStore.loadMoreComments(props.bizId)
      } else {
        dynamicCommentStore.loadMoreComments(props.bizId)
      }
    }
  }
  commentObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadMoreIfNeeded()
      }
    },
    {rootMargin: '200px'},
  )
  commentObserver.observe(commentSentinelRef.value)
  setTimeout(() => {
    if (commentSentinelRef.value) {
      const rect = commentSentinelRef.value.getBoundingClientRect()
      const isVisible = rect.top < window.innerHeight + 200 && rect.bottom > 0
      if (isVisible) {
        loadMoreIfNeeded()
      }
    }
  }, 100)
}

// ===== 根评论 @ 功能 =====
const showRootAtPanel = ref(false)
const isRootFocused = ref(false)
const rootFollowings = ref<User[]>([])
const rootAtSearchKeyword = ref('')
const rootSearchUsers = ref<User[]>([])
const syncToDynamic = ref(false)
const rootMentionInput = ref<InstanceType<typeof MentionInput> | null>(null)
let rootAtSearchTimer: ReturnType<typeof setTimeout> | null = null

// ===== 回复框 @ 功能 =====
const isReplyFocused = ref(false)
const showReplyAtPanel = ref(false)
const replyFollowings = ref<User[]>([])
const replyAtSearchKeyword = ref('')
const replySearchUsers = ref<User[]>([])
// v-for 内的 ref 会自动变成数组，取第 0 个即当前唯一激活的回复框
const replyMentionInput = ref<InstanceType<typeof MentionInput>[]>([])
let replyAtSearchTimer: ReturnType<typeof setTimeout> | null = null

// 便捷访问器：当前活跃的回复 MentionInput 实例
// 兼容 Vue 对非 v-for ref 的两种绑定形态（单实例或数组）
const activeReplyInput = () => {
  const v = replyMentionInput.value
  if (Array.isArray(v)) {
    return v[0] ?? null
  }
  return v ?? null
}

type AtPanelPlacement = 'above' | 'below'
type AtPanelTarget = 'root' | 'reply'
const rootAtPanelPlacement = ref<AtPanelPlacement>('below')
const replyAtPanelPlacement = ref<AtPanelPlacement>('below')
const atPanelPlacementRaf: Record<AtPanelTarget, number | null> = {
  root: null,
  reply: null,
}

// 根据输入框上下方的可视空间决定候选弹窗方向
const updateAtPanelPlacement = (target: AtPanelTarget) => {
  nextTick(() => {
    const pendingRaf = atPanelPlacementRaf[target]
    if (pendingRaf !== null) cancelAnimationFrame(pendingRaf)

    atPanelPlacementRaf[target] = requestAnimationFrame(() => {
      atPanelPlacementRaf[target] = null
      const input = target === 'root' ? rootMentionInput.value : activeReplyInput()
      const inputElement = input?.$el as HTMLElement | undefined
      const panel = inputElement?.parentElement?.querySelector<HTMLElement>('.at-panel')
      if (!inputElement || !panel) return

      const inputRect = inputElement.getBoundingClientRect()
      const panelHeight = Math.min(panel.scrollHeight, 260)
      const gap = 8
      const spaceAbove = Math.max(0, inputRect.top - gap)
      const spaceBelow = Math.max(0, window.innerHeight - inputRect.bottom - gap)
      const placement: AtPanelPlacement =
        spaceBelow >= panelHeight || spaceBelow >= spaceAbove ? 'below' : 'above'

      if (target === 'root') {
        rootAtPanelPlacement.value = placement
      } else {
        replyAtPanelPlacement.value = placement
      }
    })
  })
}

watch(
  [showRootAtPanel, rootAtSearchKeyword, () => rootFollowings.value.length, () => rootSearchUsers.value.length],
  ([visible]) => {
    if (visible) updateAtPanelPlacement('root')
  },
  {flush: 'post'},
)

watch(
  [showReplyAtPanel, replyAtSearchKeyword, () => replyFollowings.value.length, () => replySearchUsers.value.length],
  ([visible]) => {
    if (visible) updateAtPanelPlacement('reply')
  },
  {flush: 'post'},
)

const handleAtPanelViewportChange = () => {
  if (showRootAtPanel.value) updateAtPanelPlacement('root')
  if (showReplyAtPanel.value) updateAtPanelPlacement('reply')
}

// 首次打开面板时加载关注列表
const ensureRootFollowings = async () => {
  if (rootFollowings.value.length === 0 && userStore.isLogin) {
    await userStore.getFollowings(user.value.uid)
    rootFollowings.value = [...userStore.followList]
  }
}

// MentionInput 检测到 @ 及其后的搜索关键词时触发
const onRootAtTrigger = async (keyword: string | null) => {
  if (rootAtSearchTimer) {
    clearTimeout(rootAtSearchTimer)
    rootAtSearchTimer = null
  }

  if (keyword === null) {
    showRootAtPanel.value = false
    rootAtSearchKeyword.value = ''
    rootSearchUsers.value = []
    return
  }

  showRootAtPanel.value = true
  rootAtSearchKeyword.value = keyword
  await ensureRootFollowings()

  const searchKeyword = keyword.trim()
  if (!searchKeyword) {
    rootSearchUsers.value = []
    return
  }

  rootAtSearchTimer = setTimeout(async () => {
    await userStore.getSearchUsers(searchKeyword, 'default', 1, 10)
    if (rootAtSearchKeyword.value === searchKeyword && showRootAtPanel.value) {
      rootSearchUsers.value = [...userStore.searchUserList]
    }
  }, 300)
}

// 点击根评论 @ 按钮：在 MentionInput 中插入 @ 字符并弹出面板
const onRootAtButtonClick = async () => {
  showRootAtPanel.value = true
  await ensureRootFollowings()
  await nextTick()
  const editor = rootMentionInput.value?.$el?.querySelector('.mention-editor') as HTMLElement | null
  if (editor) {
    editor.focus()
    document.execCommand('insertText', false, '@')
  }
}

// 输入框获得焦点：显示工具栏
const onRootCommentFocus = () => {
  isRootFocused.value = true
}

// 焦点离开整个编辑器区域时：若焦点仍落在编辑器内部，不隐藏工具栏
const onEditorFocusOut = (e: FocusEvent) => {
  const related = e.relatedTarget as HTMLElement | null
  if (related && related.closest('.editor.edit')) return
  isRootFocused.value = false
  showRootAtPanel.value = false
}

// 过滤后的关注列表（按搜索关键词）
const filteredRootFollowings = computed(() => {
  if (!rootAtSearchKeyword.value) return rootFollowings.value
  const kw = rootAtSearchKeyword.value.toLowerCase()
  return rootFollowings.value.filter(u => u.username?.toLowerCase().includes(kw))
})

// 选中一个用户：通过 MentionInput 插入 @username mention
const selectAtUser = (u: User) => {
  rootMentionInput.value?.insertMention(u.username!, u.uid!)
  showRootAtPanel.value = false
  rootAtSearchKeyword.value = ''
}

// 关注列表确保加载（回复框）
const ensureReplyFollowings = async () => {
  if (replyFollowings.value.length === 0 && userStore.isLogin) {
    await userStore.getFollowings(user.value.uid)
    replyFollowings.value = [...userStore.followList]
  }
}

// MentionInput 在回复框中检测到 @ 及其后的搜索关键词时触发
const onReplyAtTrigger = async (keyword: string | null) => {
  if (replyAtSearchTimer) {
    clearTimeout(replyAtSearchTimer)
    replyAtSearchTimer = null
  }

  if (keyword === null) {
    showReplyAtPanel.value = false
    replyAtSearchKeyword.value = ''
    replySearchUsers.value = []
    return
  }

  showReplyAtPanel.value = true
  replyAtSearchKeyword.value = keyword
  await ensureReplyFollowings()

  const searchKeyword = keyword.trim()
  if (!searchKeyword) {
    replySearchUsers.value = []
    return
  }

  replyAtSearchTimer = setTimeout(async () => {
    await userStore.getSearchUsers(searchKeyword, 'default', 1, 10)
    if (replyAtSearchKeyword.value === searchKeyword && showReplyAtPanel.value) {
      replySearchUsers.value = [...userStore.searchUserList]
    }
  }, 300)
}

// 点击回复框 @ 按钮
const onReplyAtButtonClick = async () => {
  showReplyAtPanel.value = true
  await ensureReplyFollowings()
  await nextTick()
  const editor = activeReplyInput()?.$el?.querySelector('.mention-editor') as HTMLElement | null
  if (editor) {
    editor.focus()
    document.execCommand('insertText', false, '@')
  }
}

const onReplyFocus = () => {
  isReplyFocused.value = true
}

// 点击"回复"打开回复框时自动聚焦输入框，从而自动显示工具栏（@用户等功能）
watch(activeReplyCommentId, async (id) => {
  if (id == null) return
  await nextTick()
  const editor = activeReplyInput()?.$el?.querySelector('.mention-editor') as HTMLElement | null
  if (editor) editor.focus()
})

const onReplyEditorFocusOut = (e: FocusEvent) => {
  const related = e.relatedTarget as HTMLElement | null
  if (related && related.closest('.thread-reply-box')) return
  // 仅关闭 @ 面板，保留工具栏显示
  showReplyAtPanel.value = false
}

const filteredReplyFollowings = computed(() => {
  if (!replyAtSearchKeyword.value) return replyFollowings.value
  const kw = replyAtSearchKeyword.value.toLowerCase()
  return replyFollowings.value.filter(u => u.username?.toLowerCase().includes(kw))
})

const selectReplyAtUser = (u: User) => {
  activeReplyInput()?.insertMention(u.username!, u.uid!)
  showReplyAtPanel.value = false
  replyAtSearchKeyword.value = ''
}

// ===== 发送根评论 =====
const sendComment = async () => {
  if (!comment.value.trim() || sending.value) return
  sending.value = true
  // 提交时把 mention span 替换为 @<uid> 数字形式，后端按 @\d+ 解析生成 at 通知
  const submitContent = rootMentionInput.value?.getSubmitContent?.() ?? comment.value
  const newComment = await (props.bizType === 'video'
    ? videoCommentStore.sendComment({
      vid: props.bizId,
      uid: user.value.uid,
      content: submitContent,
      isTop: 0,
      rootId: 0,
      parentId: 0,
      toUserId: (videoStore.videoInfo?.user?.uid as number) || 0,
    })
    : dynamicCommentStore.sendComment(props.bizId, submitContent))
  sending.value = false
  if (newComment) {
    insertRootCommentLocally(newComment as Comment)
    comment.value = ''
    rootMentionInput.value?.clear()
    isRootFocused.value = false
  }
}

// 新根评论本地插入为列表最前（临时评论第一，置顶第二）
const insertRootCommentLocally = (root: Comment) => {
  const normalized: Comment = {
    ...root,
    replies: root.replies ?? [],
    liked: root.liked ?? false,
    disliked: root.disliked ?? false,
    like: root.like ?? 0,
    dislike: root.dislike ?? 0,
    isTop: root.isTop ?? 0,
    user: root.user ?? ({ uid: user.value.uid, username: user.value.username, nickname: user.value.nickname, avatar: user.value.avatar } as User),
  }
  const rest = store.value.commentList.filter(c => c.id !== normalized.id)
  rest.unshift(normalized)
  store.value.commentList = rest
}

// ===== 回复 =====
const findCommentInfo = (commentId: number): { rootId: number; toUserId: number; parentId: number } | null => {
  const findInList = (list: Comment[], rootId: number): { rootId: number; toUserId: number; parentId: number } | null => {
    for (const c of list) {
      if (c.id === commentId) {
        return { rootId: rootId || c.id!, toUserId: c.user!.uid, parentId: c.id! }
      }
      if (c.replies?.length) {
        const found = findInList(c.replies, c.id!)
        if (found) return found
      }
    }
    return null
  }
  return findInList(store.value.commentList, 0)
}

const sendReply = async () => {
  if (!replyContent.value.trim() || !activeReplyCommentId.value || sending.value) return
  const info = findCommentInfo(activeReplyCommentId.value)
  if (!info) return

  const targetComment = (() => {
    const findInList = (list: Comment[]): Comment | null => {
      for (const c of list) {
        if (c.id === activeReplyCommentId.value) return c
        if (c.replies?.length) { const f = findInList(c.replies); if (f) return f }
      }
      return null
    }
    return findInList(store.value.commentList)
  })()

  // 提交时把 mention span 替换为 @<uid> 数字形式，后端按 @\d+ 解析生成 at 通知
  const submitContent = activeReplyInput()?.getSubmitContent?.() ?? replyContent.value

  sending.value = true
  const newComment = await (props.bizType === 'video'
    ? videoCommentStore.sendComment({
      vid: props.bizId,
      uid: user.value.uid,
      content: submitContent,
      isTop: 0,
      rootId: info.rootId,
      parentId: info.parentId,
      toUserId: targetComment?.user?.uid ?? info.toUserId,
    })
    : dynamicCommentStore.sendComment(props.bizId, submitContent, info.parentId, info.rootId, info.toUserId))
  sending.value = false

  if (newComment) {
    // 本地插入回复到评论树，避免整页 getComment 刷新把临时置顶/置顶楼层冲掉
    const inserted = insertReplyToTree(newComment as Comment)
    if (!inserted) {
      // 父评论不在本地列表（如处于分页之外），退化为整页刷新
      await loadComments()
    }
    replyContent.value = ''
    activeReplyInput()?.clear()
    setActiveReplyCommentId(null)
    // 展开并翻到最后一页，确保新回复可见
    setReplyListState(info.rootId || (newComment.id as number), true, Number.MAX_SAFE_INTEGER)
  }
}

// 将新回复插入本地评论树，返回是否找到父节点
const insertReplyToTree = (reply: Comment): boolean => {
  const walk = (list: Comment[]): boolean => {
    for (const c of list) {
      if (c.id === reply.parentId) {
        if (!c.replies) c.replies = []
        c.replies.push(reply)
        return true
      }
      if (c.replies?.length && walk(c.replies)) return true
    }
    return false
  }
  return walk(store.value.commentList)
}

// ===== 回复分页/展开 =====
const COLLAPSED_REPLY_COUNT = 2
const REPLY_PAGE_SIZE = 10

type CommentWithLevel = Comment & { level: number }
type ReplyDisplayState = {
  expanded: boolean
  page: number
}
type ReplyPageItem = { type: 'page'; page: number } | { type: 'ellipsis'; key: string }
type CommentThreadView = {
  rootComment: Comment
  rootId: number
  visibleReplies: CommentWithLevel[]
  totalReplies: number
  expanded: boolean
  currentPage: number
  totalPages: number
  pageItems: ReplyPageItem[]
}

const replyDisplayState = ref<Record<number, ReplyDisplayState>>({})

function flattenComments(comments: Comment[], level: number = 0): CommentWithLevel[] {
  let result: CommentWithLevel[] = []

  for (const comment of comments) {
    // 添加当前层级信息
    const commentWithLevel = {...comment, level}

    // 如果存在子评论，递归处理
    if (comment.replies && comment.replies.length > 0) {
      result = [...result, commentWithLevel, ...flattenComments(comment.replies, level + 1)]
    } else {
      result = [...result, commentWithLevel]
    }
  }

  return result
}

const clampReplyPage = (page: number, totalPages: number) => {
  return Math.min(Math.max(page, 1), Math.max(totalPages, 1))
}

const getReplyPageItems = (currentPage: number, totalPages: number): ReplyPageItem[] => {
  if (totalPages <= 7) {
    return Array.from({length: totalPages}, (_, index) => ({type: 'page', page: index + 1}))
  }

  if (currentPage <= 4) {
    return [
      ...Array.from({length: 5}, (_, index) => ({type: 'page' as const, page: index + 1})),
      {type: 'ellipsis', key: 'ellipsis-end'},
      {type: 'page', page: totalPages},
    ]
  }

  if (currentPage >= totalPages - 3) {
    return [
      {type: 'page', page: 1},
      {type: 'ellipsis', key: 'ellipsis-start'},
      ...Array.from({length: 5}, (_, index) => ({
        type: 'page' as const,
        page: totalPages - 4 + index,
      })),
    ]
  }

  return [
    {type: 'page', page: 1},
    {type: 'ellipsis', key: 'ellipsis-start'},
    {type: 'page', page: currentPage - 1},
    {type: 'page', page: currentPage},
    {type: 'page', page: currentPage + 1},
    {type: 'ellipsis', key: 'ellipsis-end'},
    {type: 'page', page: totalPages},
  ]
}

const getReplyPageItemKey = (pageItem: ReplyPageItem) => {
  return pageItem.type === 'page' ? `page-${pageItem.page}` : pageItem.key
}

const getReplyPageItemLabel = (pageItem: ReplyPageItem) => {
  return pageItem.type === 'page' ? String(pageItem.page) : '...'
}

const setReplyListState = (rootId: number, expanded: boolean, page: number = 1) => {
  replyDisplayState.value[rootId] = {expanded, page}
}

const expandReplyList = (rootId: number) => {
  setReplyListState(rootId, true)
}

const collapseReplyList = (rootId: number) => {
  setReplyListState(rootId, false)
}

const setReplyPage = (rootId: number, page: number, totalPages: number) => {
  setReplyListState(rootId, true, clampReplyPage(page, totalPages))
}

const goNextReplyPage = (rootId: number, currentPage: number, totalPages: number) => {
  setReplyPage(rootId, currentPage + 1, totalPages)
}

const goPrevReplyPage = (rootId: number, currentPage: number, totalPages: number) => {
  setReplyPage(rootId, currentPage - 1, totalPages)
}

const handleReplyPageItemClick = (rootId: number, pageItem: ReplyPageItem, totalPages: number) => {
  if (pageItem.type === 'page') {
    setReplyPage(rootId, pageItem.page, totalPages)
  }
}

const commentThreads = computed<CommentThreadView[]>(() => {
  return commentList.value.map((rootComment) => {
    const rootId = rootComment.id ?? 0
    const replies = flattenComments(rootComment.replies ?? [], 1)
    const totalReplies = replies.length
    const totalPages = Math.max(1, Math.ceil(totalReplies / REPLY_PAGE_SIZE))
    const state = replyDisplayState.value[rootId] ?? {expanded: false, page: 1}
    const currentPage = clampReplyPage(state.page, totalPages)
    const visibleReplies = state.expanded
      ? replies.slice((currentPage - 1) * REPLY_PAGE_SIZE, currentPage * REPLY_PAGE_SIZE)
      : replies.slice(0, COLLAPSED_REPLY_COUNT)

    return {
      rootComment,
      rootId,
      visibleReplies,
      totalReplies,
      expanded: state.expanded,
      currentPage,
      totalPages,
      pageItems: getReplyPageItems(currentPage, totalPages),
    }
  })
})

// 未登录时只展示前 2 条（视频页 guestMask 开启时生效）
const displayedCommentThreads = computed<CommentThreadView[]>(() => {
  if (props.guestMask && !userStore.isLogin) {
    return commentThreads.value.slice(0, 2)
  }
  return commentThreads.value
})

// 判断该 thread 是否有激活的回复框
const isReplyActiveInThread = (thread: CommentThreadView): boolean => {
  if (activeReplyCommentId.value === null) return false
  // 根评论本身
  if (thread.rootComment.id === activeReplyCommentId.value) return true
  // 任意子评论
  const allReplies = flattenComments(thread.rootComment.replies ?? [], 1)
  return allReplies.some(r => r.id === activeReplyCommentId.value)
}

// 获取回复目标用户名
const getReplyTargetName = (commentId: number | null): string => {
  if (commentId === null) return ''
  // 在所有评论中查找
  const findInList = (list: Comment[]): Comment | null => {
    for (const c of list) {
      if (c.id === commentId) return c
      if (c.replies?.length) {
        const found = findInList(c.replies)
        if (found) return found
      }
    }
    return null
  }
  const target = findInList(store.value.commentList)
  return getUserDisplayName(target?.user, '')
}

// ===== 滚动到目标评论并高亮（从通知页跳转时使用，视频/动态评论通用）=====
const scrollToAndHighlightComment = async (commentId: number) => {
  // 1. 拉取目标评论树并置顶插入 commentList
  const thread = await store.value.pinCommentThread(commentId)
  if (!thread) return

  // 2. 如果目标是子评论，展开该楼层回复列表并翻到目标所在页
  const isRootTarget = thread.id === commentId
  if (!isRootTarget) {
    const replies = thread.replies ?? []
    const replyIndex = replies.findIndex((r) => r.id === commentId)
    if (replyIndex === -1) return // 目标子评论已被删除
    const page = Math.floor(replyIndex / REPLY_PAGE_SIZE) + 1
    setReplyListState(thread.id!, true, page)
  }

  // 3. 等 Vue 渲染后在 DOM 中定位元素并滚动高亮
  await nextTick()
  await new Promise((resolve) => setTimeout(resolve, 100))

  const threadIndex = displayedCommentThreads.value.findIndex((t) => t.rootId === thread.id)
  if (threadIndex === -1) return
  const threadEl = document.querySelectorAll('.comment-thread')[threadIndex] as HTMLElement | undefined
  if (!threadEl) return

  let targetEl: HTMLElement | null
  if (isRootTarget) {
    targetEl = threadEl.querySelector(':scope > .comment:not(.sub)')
  } else {
    // 子评论：按当前页内的相对索引定位
    const replies = thread.replies ?? []
    const replyIndex = replies.findIndex((r) => r.id === commentId)
    const pageIndex = replyIndex % REPLY_PAGE_SIZE
    const subEls = threadEl.querySelectorAll(':scope > .comment.sub')
    targetEl = (subEls[pageIndex] as HTMLElement) || null
  }

  if (targetEl) {
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    targetEl.classList.add('comment--highlighted')
    setTimeout(() => {
      targetEl.classList.remove('comment--highlighted')
    }, 4000)
  }
}
</script>

<style scoped lang="less">
.comment-wrap {
  margin-top: 20px;

  // 根评论和回复框共用的 @ 候选弹窗
  .at-panel {
    position: absolute;
    top: calc(100% + 6px);
    bottom: auto;
    left: 0;
    width: 280px;
    max-width: calc(100vw - 24px);
    max-height: 260px;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
    z-index: 100;
    overflow-y: auto;
    animation: atPanelInBelow 0.15s ease-out;

    &.is-above {
      top: auto;
      bottom: calc(100% + 6px);
      animation-name: atPanelInAbove;
    }

    .at-panel-header {
      padding: 10px 14px 6px;
      font-size: 13px;
      color: @text-3;
    }

    .at-section {
      .at-section-title {
        padding: 8px 14px 4px;
        font-size: 12px;
        color: @text-3;
      }

      .at-empty {
        padding: 8px 14px;
        font-size: 13px;
        color: #c9cdd4;
      }

      .at-user-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 7px 14px;
        cursor: pointer;
        transition: background 0.12s;

        &:hover { background: @bg-gray; }

        .at-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
        }

        .at-info {
          display: flex;
          flex-direction: column;
          min-width: 0;

          .at-name {
            font-size: 13px;
            color: @text-1;
            .ellipsis();
          }

          .at-fans {
            font-size: 11px;
            color: @text-3;
          }
        }
      }
    }
  }

  @keyframes atPanelInBelow {
    from { opacity: 0; transform: translateY(-6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes atPanelInAbove {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .header {
    .navbar {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 16px;

      .title {
        display: flex;
        align-items: center;

        h2 {
          font-size: 20px;
          font-weight: 500;
          margin: 0;
        }

        .count {
          margin: 0 10px 0 6px;
          font-size: 13px;
          color: @text-3;
        }
      }

      .sort-actions {
        display: flex;
        align-items: center;

        .sort {
          color: @text-3;

          &.active {
            color: @text-1;
          }
        }

        .sort:hover {
          color: #409eff;
        }
      }
    }

    .commentbox {
      display: flex;
      align-items: flex-start;
      margin-top: 20px;
      min-height: 50px;

      .user-avatar {
        flex-shrink: 0;

        img {
          width: 48px;
          height: 48px;
          margin-right: 20px;
          border-radius: 50%;
        }
      }
    }

    .edit {
      flex: 1 1 0;
      height: 100%;
      border-radius: 6px;
      font-size: 12px;
      color: @text-3;
      background-color: @bg-gray;
      .flex-center();
    }

    .editor {
      background-color: #fff;
      flex-direction: column;
      align-items: stretch;
      justify-content: flex-start;
      gap: 8px;
      height: auto;

      // @ 输入区域
      .at-input-wrap {
        position: relative;
        flex: 1;
        min-width: 0;

        .el-input { width: 100%; }
      }

      // 焦点显示的工具栏（@按钮/复选框/发布）
      .editor-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;

        .toolbar-icons {
          display: flex;
          align-items: center;
        }
      }
    }
  }

  .contents {
    .feed {
      .comment-thread {
        padding-bottom: 10px;
        border-bottom: 1px solid #e3e5e7;
        margin-top: 10px;

        &:first-child {
          margin-top: 18px;
        }
      }

      .reply-control {
        margin: 8px 0 2px 67px;
        min-height: 22px;
        font-size: 13px;
        line-height: 22px;
        color: @text-3;
      }

      .reply-pagination {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 4px;
        color: @text-1;
      }

      .reply-page-total {
        margin-right: 4px;
      }

      .reply-text-btn,
      .reply-page-btn {
        border: 0;
        padding: 0 4px;
        height: 22px;
        line-height: 22px;
        color: @text-1;
        background: transparent;
        font: inherit;
        cursor: pointer;
      }

      .reply-text-btn.expand {
        color: @text-3;
      }

      .reply-text-btn:hover,
      .reply-page-btn:hover,
      .reply-page-btn.active {
        color: #409eff;
      }

      .reply-page-btn {
        min-width: 18px;
      }

      .reply-page-btn.ellipsis {
        cursor: default;
      }

      .reply-page-btn.ellipsis:hover {
        color: @text-3;
      }

      // 回复输入框（统一放在 thread 末尾）
      .thread-reply-box {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        margin: 10px 0 6px 65px;
        padding-top: 8px;

        .thread-reply-avatar {
          flex-shrink: 0;
          width: 32px;
          height: 32px;

          img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
          }
        }

        .thread-reply-editor {
          flex: 1;
          min-width: 0;

          .at-input-wrap {
            position: relative;
            width: 100%;
          }

          .editor-actions {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 8px;

            .toolbar-icons {
              display: flex;
              align-items: center;
            }

            .reply-actions-right {
              display: flex;
              align-items: center;
              gap: 8px;
            }
          }
        }
      }
    }
  }

  .end {
    .bottombar {
      width: 100%;
      margin-top: 20px;
      font-size: 13px;
      color: @text-3;
      text-align: center;
      user-select: none;
      padding-bottom: v-bind('`${props.bottomPadding ?? 100}px`');
    }
  }

  .comment-sentinel {
    height: 1px;
    width: 100%;
  }

  .comment-loading {
    .flex-center();
    gap: 8px;
    padding: 20px 0;
    color: @text-3;
    font-size: 13px;
  }

  .comment-item-wrapper {
    position: relative;
  }

  .comment-fade-mask {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 150px;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
    pointer-events: none;
    z-index: 10;
  }

  .login-comment-tip {
    margin-top: 20px;
    margin-left: 65px;
    margin-bottom: 100px;
    padding: 16px;
    background-color: #e3f4fd;
    border-radius: 8px;
    text-align: center;
    color: @blue;
    font-size: 15px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: #d0ecfb;
    }
  }
}

// === @ 按钮（根评论 / 子评论回复框共用）===
.commentbox .tool-icon.at-trigger,
.thread-reply-box .tool-icon.at-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 26px;
  padding: 0;
  border: 1px solid #e3e5e7;
  border-radius: 6px;
  background-color: #fff;
  color: @text-2;
  font-size: 16px;
  cursor: pointer;
  flex-shrink: 0;
  transition: border-color 0.2s, color 0.2s;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    border-color: @blue;
    color: @blue;
  }
}

// 发布按钮统一尺寸 70x32（根评论 / 子评论共用）
.commentbox .publish-btn.el-button,
.thread-reply-box .publish-btn.el-button {
  width: 70px;
  height: 32px;
  padding: 0;
  margin: 0;
}

// 通知跳转时评论高亮动画
.comment--highlighted {
  animation: comment-highlight-pulse 4s ease-out;
  background-color: #e8f4fd !important;
  border-radius: 6px;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: @blue-deep;
    border-radius: 3px 0 0 3px;
  }

  @keyframes comment-highlight-pulse {
    0% { background-color: #b3e5fc; box-shadow: 0 0 12px rgba(0, 161, 214, 0.35); }
    30% { background-color: #e8f4fd; box-shadow: none; }
    100% { background-color: transparent; box-shadow: none; }
  }
}
</style>
