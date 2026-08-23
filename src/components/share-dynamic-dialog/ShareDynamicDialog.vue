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
      <!-- 视频预览卡片 -->
      <div v-if="videoInfo" class="share-dynamic__video">
        <img class="share-dynamic__video-cover" :src="videoInfo.video.coverUrl" alt="" />
        <div class="share-dynamic__video-info">
          <div class="share-dynamic__video-title">{{ videoInfo.video.title }}</div>
          <div class="share-dynamic__video-meta">
            <el-icon><VideoPlay /></el-icon>
            {{ formatNumber(videoInfo.stat.view) }}播放
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
import { formatNumber } from '@/utils/utils'
import { Close, VideoPlay } from '@element-plus/icons-vue'
import type { User, VideoInfo } from '@/types/api'

const defaultAvatar = 'https://hirihiri2.oss-cn-shanghai.aliyuncs.com/up_pb.svg'

const userStore = useUserStore()
const dynamicStore = useDynamicStore()

const visible = ref(false)
const videoInfo = ref<VideoInfo | null>(null)
const content = ref('')

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
  const success = await dynamicStore.publishDynamic({
    title: '',
    content: content.value.trim(),
    type: 1,
    vid: videoInfo.value?.video.vid ?? null,
    images: [],
  })
  if (success) {
    visible.value = false
    content.value = ''
    mentionInput.value?.clear()
    showAtPanel.value = false
    // 分享数 +1（前端本地刷新即可）
    if (videoInfo.value?.stat) {
      videoInfo.value.stat.share = (videoInfo.value.stat.share || 0) + 1
    }
  }
}

// 打开弹窗（由外部调用）
const open = (video: VideoInfo) => {
  if (!userStore.isLogin) {
    userStore.showLoginWindow = true
    return
  }
  videoInfo.value = video
  content.value = ''
  visible.value = true
  nextTick(() => mentionInput.value?.focus())
}

defineExpose({ open })
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
