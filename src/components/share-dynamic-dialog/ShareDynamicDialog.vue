<template>
  <el-dialog
    v-model="visible"
    title="分享到动态"
    width="560px"
    :close-on-click-modal="false"
    align-center
    class="share-dynamic-dialog"
  >
    <div class="share-dynamic">
      <!-- 转发内容预览：视频动态（type=1/2）复用视频卡，其余类型在下方灰卡渲染 -->
      <div v-if="videoInfo" class="share-dynamic__video">
        <img class="share-dynamic__video-cover" :src="videoInfo.video.coverUrl" alt="" />
        <div class="share-dynamic__video-info">
          <div v-if="previewAuthorName" class="share-dynamic__video-author">@{{ previewAuthorName }}</div>
          <div v-if="previewContent" class="share-dynamic__video-attach">{{ previewContent }}</div>
          <div class="share-dynamic__video-title">{{ videoInfo.video.title }}</div>
          <div class="share-dynamic__video-meta">
            <el-icon><VideoPlay /></el-icon>
            {{ formatNumber(videoInfo.stat.view) }}播放
          </div>
        </div>
      </div>

      <!-- 转发内容预览：文字动态（type=0）= 作者+正文；转发动态（type=3）= 原动态摘要 -->
      <div v-else-if="dynamicInfo" class="share-dynamic__text-preview">
        <div v-if="previewAuthorName" class="share-dynamic__preview-author">
          <img class="share-dynamic__preview-avatar" :src="previewAuthorAvatar" alt="" />
          <span class="share-dynamic__preview-name">{{ previewAuthorName }}</span>
        </div>
        <div v-if="previewContent" class="share-dynamic__preview-text">{{ previewContent }}</div>
        <!-- 原动态为视频动态时附视频缩略卡 -->
        <div v-if="previewParentVideo" class="share-dynamic__video share-dynamic__video--nested">
          <img class="share-dynamic__video-cover" :src="previewParentVideo.video.coverUrl" alt="" />
          <div class="share-dynamic__video-info">
            <div class="share-dynamic__video-title">{{ previewParentVideo.video.title }}</div>
            <div class="share-dynamic__video-meta">
              <el-icon><VideoPlay /></el-icon>
              {{ formatNumber(previewParentVideo.stat.view) }}播放
            </div>
          </div>
        </div>
      </div>

      <!-- 正文输入（MentionInput 支持 @） -->
      <div class="share-dynamic__editor" :class="{ 'share-dynamic__editor--active': isFocused }">
        <MentionInput
          ref="mentionInput"
          v-model="content"
          :active="isFocused"
          placeholder="说点什么吧～"
          @at-trigger="onAtTrigger"
          @focus="isFocused = true"
          @blur="isFocused = false"
        />
        <span
          v-if="content.length > 0"
          class="share-dynamic__editor-clear"
          title="清空"
          @click="clearContent"
        >
          <el-icon><Close /></el-icon>
        </span>
        <div v-if="showAtPanel" class="share-dynamic__at-panel" @mousedown.prevent>
          <div class="share-dynamic__at-section-title">我的关注</div>
          <div v-if="filteredFollowings.length === 0" class="share-dynamic__at-empty">暂无关注</div>
          <div
            v-for="u in filteredFollowings"
            :key="u.uid"
            class="share-dynamic__at-user"
            @click="selectAtUser(u)"
          >
            <img :src="u.avatar || defaultAvatar" class="share-dynamic__at-avatar" alt=""/>
            <div class="share-dynamic__at-info">
              <span class="share-dynamic__at-name">{{ u.username }}</span>
              <span class="share-dynamic__at-fans">{{ u.fanCount || 0 }}粉丝</span>
            </div>
          </div>
          <div v-if="atSearchKeyword" class="share-dynamic__at-section-title">其他</div>
          <div v-if="atSearchKeyword && searchUsers.length === 0" class="share-dynamic__at-empty">未找到用户</div>
          <div
            v-for="u in searchUsers"
            :key="u.uid"
            class="share-dynamic__at-user"
            @click="selectAtUser(u)"
          >
            <img :src="u.avatar || defaultAvatar" class="share-dynamic__at-avatar" alt=""/>
            <div class="share-dynamic__at-info">
              <span class="share-dynamic__at-name">{{ u.username }}</span>
              <span class="share-dynamic__at-fans">{{ u.fanCount || 0 }}粉丝</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="share-dynamic__footer">
        <span class="share-dynamic__count">{{ content.length }}</span>
        <el-button @click="visible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="dynamicStore.publishLoading"
          :disabled="!canPublish"
          @click="handlePublish"
        >发布</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref } from 'vue'
import MentionInput from '@/components/mention-input/MentionInput.vue'
import { useUserStore } from '@/stores/userStore'
import { useDynamicStore } from '@/stores/dynamicStore'
import { formatNumber, getUserDisplayName } from '@/utils/utils'
import { Close, VideoPlay } from '@element-plus/icons-vue'
import type { Dynamic, DynamicPublishPayload, User, VideoInfo } from '@/types/api'
import { DEFAULT_AVATAR } from '@/utils/constants'

const defaultAvatar = DEFAULT_AVATAR

const userStore = useUserStore()
const dynamicStore = useDynamicStore()

const visible = ref(false)
const videoInfo = ref<VideoInfo | null>(null)
// 转发动态时传入（openDynamic）；分享视频时为 null
const dynamicInfo = ref<Dynamic | null>(null)
const content = ref('')

const emit = defineEmits<{
  // 转发动态发布成功（父组件本地刷新转发数）
  (e: 'published'): void
}>()

// ===== 预览内容（按动态类型区分 UI） =====
// 作者名：转发动态显示原动态作者，其余显示动态作者
const previewAuthorName = computed(() => {
  const d = dynamicInfo.value
  if (!d) return ''
  if (d.type === 3 && d.parent) {
    return getUserDisplayName(d.parent.user, '')
  }
  return getUserDisplayName(d.user, '')
})

const previewAuthorAvatar = computed(() => {
  const d = dynamicInfo.value
  const u = d?.type === 3 && d.parent ? d.parent.user : d?.user
  return u?.avatar || DEFAULT_AVATAR
})

// 预览正文：文字动态=正文；分享视频=附言；转发动态=原动态文字（原动态为视频时交给视频卡）
const previewContent = computed(() => {
  const d = dynamicInfo.value
  if (!d) return ''
  if (d.type === 3) {
    const p = d.parent
    if (!p) return '原动态已被删除'
    if (p.video) return p.content && p.content.trim() ? p.content : ''
    return p.content || p.title || ''
  }
  if (d.type === 0) return d.content || d.title || ''
  if (d.type === 1) return d.content && d.content.trim() ? d.content : ''
  return ''
})

// 转发动态的原动态为视频时展示的视频卡数据
const previewParentVideo = computed(() => {
  const d = dynamicInfo.value
  return d?.type === 3 ? (d.parent?.video ?? null) : null
})

// ======================== @ 功能 ========================
const mentionInput = ref<InstanceType<typeof MentionInput> | null>(null)
const isFocused = ref(false)
const showAtPanel = ref(false)
const followings = ref<User[]>([])
const atSearchKeyword = ref('')
const searchUsers = ref<User[]>([])
let atSearchTimer: ReturnType<typeof setTimeout> | null = null

// 不输入内容也可以分享
const canPublish = computed(() => true)

const filteredFollowings = computed(() => {
  if (!atSearchKeyword.value) return followings.value
  const kw = atSearchKeyword.value.toLowerCase()
  return followings.value.filter(u => u.username?.toLowerCase().includes(kw))
})

const ensureFollowings = async () => {
  if (followings.value.length === 0 && userStore.isLogin && userStore.user.uid) {
    await userStore.getFollowings(userStore.user.uid)
    followings.value = [...userStore.followList]
  }
}

const onAtTrigger = async (keyword: string | null) => {
  if (atSearchTimer) {
    clearTimeout(atSearchTimer)
    atSearchTimer = null
  }
  if (keyword === null) {
    showAtPanel.value = false
    atSearchKeyword.value = ''
    searchUsers.value = []
    return
  }
  showAtPanel.value = true
  atSearchKeyword.value = keyword
  await ensureFollowings()
  const searchKeyword = keyword.trim()
  if (!searchKeyword) {
    searchUsers.value = []
    return
  }
  atSearchTimer = setTimeout(async () => {
    await userStore.getSearchUsers(searchKeyword, 'default', 1, 10)
    if (atSearchKeyword.value === searchKeyword && showAtPanel.value) {
      searchUsers.value = [...userStore.searchUserList]
    }
  }, 300)
}

const selectAtUser = (u: User) => {
  mentionInput.value?.insertMention(u.username!, u.uid!)
  showAtPanel.value = false
  atSearchKeyword.value = ''
  searchUsers.value = []
}

const clearContent = () => {
  content.value = ''
  mentionInput.value?.clear()
  showAtPanel.value = false
}

const handlePublish = async () => {
  if (!userStore.isLogin) {
    userStore.showLoginWindow = true
    return
  }
  const success = await (async () => {
    // 转发动态（type=3，parentId 指向被转发动态）；分享视频（type=1）
    const payload: DynamicPublishPayload = dynamicInfo.value
      ? { title: '', content: content.value.trim(), type: 3, vid: null, parentId: dynamicInfo.value.id, images: [] }
      : { title: '', content: content.value.trim(), type: 1, vid: videoInfo.value?.video.vid ?? null, images: [] }
    return dynamicStore.publishDynamic(payload)
  })()
  if (success) {
    visible.value = false
    content.value = ''
    mentionInput.value?.clear()
    showAtPanel.value = false
    if (dynamicInfo.value) {
      emit('published')
    } else if (videoInfo.value?.stat) {
      // 分享数 +1（前端本地刷新即可）
      videoInfo.value.stat.share = (videoInfo.value.stat.share || 0) + 1
    }
  }
}

// 打开弹窗（由外部调用，分享视频）
const open = (video: VideoInfo) => {
  if (!userStore.isLogin) {
    userStore.showLoginWindow = true
    return
  }
  videoInfo.value = video
  dynamicInfo.value = null
  content.value = ''
  visible.value = true
  nextTick(() => mentionInput.value?.focus())
}

// 打开转发动态弹窗：预览区按动态类型渲染（视频动态=视频卡，文字动态=作者+正文，转发动态=原动态摘要）
const openDynamic = (dynamic: Dynamic) => {
  if (!userStore.isLogin) {
    userStore.showLoginWindow = true
    return
  }
  dynamicInfo.value = dynamic
  videoInfo.value = dynamic.video ?? null
  content.value = ''
  visible.value = true
  nextTick(() => mentionInput.value?.focus())
}

defineExpose({ open, openDynamic })
</script>

<style scoped lang="less">
.share-dynamic {
  &__video {
    display: flex;
    gap: 12px;
    padding: 10px;
    background: #f7f8fa;
    border-radius: 8px;
    margin-bottom: 12px;
  }

  &__video--nested {
    margin-top: 8px;
    margin-bottom: 0;
  }

  &__video-author {
    font-size: 12px;
    color: @text-3;
  }

  &__video-attach {
    font-size: 13px;
    color: @text-2;
    line-height: 1.5;
    word-break: break-word;
  }

  &__text-preview {
    padding: 10px;
    background: #f7f8fa;
    border-radius: 8px;
    margin-bottom: 12px;
  }

  &__preview-author {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  &__preview-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  &__preview-name {
    font-size: 13px;
    font-weight: 500;
    color: @text-1;
  }

  &__preview-text {
    font-size: 13px;
    color: @text-2;
    line-height: 1.6;
    word-break: break-word;
  }

  &__video-cover {
    width: 120px;
    height: 68px;
    object-fit: cover;
    border-radius: 4px;
    flex-shrink: 0;
  }

  &__video-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 6px;
  }

  &__video-title {
    font-size: 14px;
    font-weight: 500;
    color: @text-1;
    .ellipsis();
  }

  &__video-meta {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: @text-3;
  }

  &__editor {
    position: relative;
    margin-top: 8px;

    &-clear {
      position: absolute;
      top: 6px;
      right: 6px;
      z-index: 5;
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.45);
      color: #fff;
      cursor: pointer;
      font-size: 12px;
      transition: background-color 0.2s;

      &:hover {
        background: rgba(0, 0, 0, 0.7);
      }
    }

    :deep(.mention-editor) {
      min-height: 80px;
      background: transparent;
      border-color: transparent;
      box-shadow: none;

      &:hover,
      &.focused,
      &.active {
        background-color: transparent;
        border-color: transparent;
        box-shadow: none;
      }

      &.focused {
        border-color: transparent;
        box-shadow: none;
      }

      // 空内容时 placeholder 与 caret 同一行（顶部对齐第一行）
      &.is-empty::before {
        top: 8px;
        bottom: auto;
        height: 34px;
        line-height: 34px;
        left: 11px;
        right: 11px;
        display: flex;
        align-items: center;
      }
    }
  }

  &__at-panel {
    position: absolute;
    top: calc(100% + 6px);
    bottom: auto;
    left: 0;
    right: auto;
    width: 280px;
    max-width: calc(100% - 24px);
    z-index: 100;
    max-height: 260px;
    overflow-y: auto;
    padding: 6px 0;
    background: #fff;
    border: 1px solid #e5e6e7;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  }

  &__at-section-title {
    padding: 6px 12px;
    font-size: 12px;
    color: @text-3;
  }

  &__at-empty {
    padding: 10px 12px;
    font-size: 13px;
    color: @text-3;
  }

  &__at-user {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background: #f7f8fa;
    }
  }

  &__at-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  &__at-info {
    min-width: 0;
  }

  &__at-name {
    display: block;
    font-size: 13px;
    color: @text-1;
    .ellipsis();
  }

  &__at-fans {
    font-size: 12px;
    color: @text-3;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }

  &__count {
    font-size: 12px;
    color: @text-3;
    margin-right: auto;
    min-width: 24px;
    text-align: right;
  }
}
</style>
