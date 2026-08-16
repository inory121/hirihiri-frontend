<template>
  <div class="like-detail">
    <!-- 顶部：被赞内容信息栏 -->
    <div v-if="targetInfo" class="target-bar">
      <div class="target-info">
        <span class="target-label">{{ targetInfo.typeLabel }}：</span>
        <span class="target-title">{{ targetInfo.title }}</span>
      </div>
      <div v-if="targetInfo.cover" class="target-cover" @click="goTarget">
        <img :src="targetInfo.cover" alt=""/>
      </div>
    </div>

    <!-- 点赞用户列表 -->
    <div class="liker-list">
      <div v-if="loading" class="liker-loading">加载中...</div>
      <template v-else-if="likers.length > 0">
        <div
          v-for="item in likers"
          :key="item.notice.id"
          class="liker-row"
          @click.stop="goUserSpace(item.notice.actorUser?.uid ?? 0)"
        >
          <img
            class="liker-avatar"
            :src="item.notice.actorUser?.avatar || defaultAvatar"
            alt=""
          />
          <div class="liker-body">
            <p class="liker-name-line">
              <span class="liker-name">{{ item.notice.actorUser?.username || '未知用户' }}</span>
              <span class="liker-action">赞了我</span>
            </p>
            <p class="liker-time">{{ formatTime(item.notice.createTime) }}</p>
          </div>
          <button
            v-if="item.notice.actorUser && !isSelf(item.notice.actorUser.uid)"
            class="follow-btn"
            :class="{ followed: item.followed }"
            @click.stop="toggleFollow(item)"
          >{{ item.followed ? '已关注' : '关注' }}</button>
        </div>
      </template>
      <div v-else class="liker-empty">暂无点赞记录</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessageStore } from '@/stores/messageStore'
import { useUserStore } from '@/stores/userStore'
import { post, get } from '@/utils/request'
import { FOLLOW_API } from '@/api/follow'
import type { MessageNotice } from '@/types/api'

const props = defineProps<{
  bizType: string
  bizId: number
}>()
const router = useRouter()
const messageStore = useMessageStore()
const userStore = useUserStore()

const defaultAvatar = 'https://cdn.hirihiri.com/default_avatar.png'

const loading = ref(true)
const likers = ref<{ notice: MessageNotice; followed: boolean }[]>([])
const followStatusMap = ref<Record<number, boolean>>({})

// 被赞目标信息（从第一条通知中提取）
const targetInfo = computed(() => {
  const first = likers.value[0]?.notice
  if (!first) return null
  let extJson = {}
  try {
    extJson = first.extJson ? JSON.parse(first.extJson) : {}
  } catch {
    // ignore
  }
  const ext = extJson as Record<string, unknown>
  const typeLabel = first.bizType === 'video' ? '视频' : first.bizType === 'comment' ? '评论' : '内容'
  // 评论点赞：显示评论内容（后端放在 contentSummary）；视频点赞：显示视频标题（ext.videoTitle）
  const title = first.bizType === 'comment'
    ? (first.contentSummary || first.title || '')
    : ((ext.videoTitle as string) || first.title || '')
  return {
    typeLabel,
    title,
    cover: (ext.videoCover as string) || undefined,
  }
})

function isSelf(uid: number): boolean {
  return uid === (userStore.user?.uid ?? 0)
}

function formatTime(timeStr: string): string {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const oneDay = 86400000
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < oneDay) {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  if (diff < 2 * oneDay) return '昨天'
  if (diff < 365 * oneDay) {
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

function goTarget() {
  const first = likers.value[0]?.notice
  if (!first) return
  const extJson = first.extJson ? JSON.parse(first.extJson) : {} as Record<string, unknown>
  const videoId = (extJson.videoId as number) || props.bizId
  const href = router.resolve({
    path: `/video/${videoId}`,
    query: first.bizType === 'comment' && first.bizId ? { commentId: String(first.bizId) } : {},
  }).href
  window.open(href, '_blank')
}

function goUserSpace(uid: number) {
  if (!uid) return
  const href = router.resolve({ path: `/space/${uid}` }).href
  window.open(href, '_blank')
}

async function toggleFollow(item: { notice: MessageNotice; followed: boolean }) {
  const uid = item.notice.actorUser?.uid
  if (!uid) return
  try {
    await post(`${FOLLOW_API.TOGGLE}/${uid}`)
    item.followed = !item.followed
    followStatusMap.value[uid] = item.followed
  } catch {
    // ignore
  }
}

async function checkFollowStatus(uids: number[]) {
  for (const uid of uids) {
    if (uid === userStore.user?.uid) continue
    try {
      const res = await get<{ code: number; data: boolean }>(`${FOLLOW_API.STATUS}/${uid}`)
      if (res.code === 200) {
        followStatusMap.value[uid] = res.data
      }
    } catch {
      followStatusMap.value[uid] = false
    }
  }
}

async function loadLikers() {
  loading.value = true
  try {
    if (messageStore.notices.length === 0 || messageStore.currentNoticeType !== 'like') {
      await messageStore.fetchNotices('like', 1, 100)
    }

    const matched = messageStore.notices.filter(
      (n) => n.noticeType === 'like' &&
        (n.bizType || '') === props.bizType &&
        (n.bizId || 0) === props.bizId,
    )
    matched.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())

    const uids = [...new Set(matched.map((n) => n.actorUser?.uid).filter(Boolean))] as number[]
    await checkFollowStatus(uids)

    likers.value = matched.map((notice) => ({
      notice,
      followed: notice.actorUser ? (followStatusMap.value[notice.actorUser.uid] ?? false) : false,
    }))
  } finally {
    loading.value = false
  }
}

onMounted(loadLikers)
// 同一详情页内 props 变化（如从列表来回切换不同分组）时重新加载
watch(() => [props.bizType, props.bizId], loadLikers)
</script>

<style scoped lang="less">
@import '@/assets/style/variables.less';

.like-detail {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px;
}

.target-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #eef1f3;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.target-info {
  flex: 1;
  min-width: 0;

  .target-label {
    font-size: 14px;
    color: @text-2;
    font-weight: 500;
  }

  .target-title {
    font-size: 15px;
    color: @text-1;
    font-weight: 600;
  }
}

.target-cover {
  width: 80px;
  height: 54px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity 0.15s;

    &:hover {
      opacity: 0.85;
    }
  }
}

.liker-list {
  background: #fff;
  border-radius: 10px;
  border: 1px solid #eef1f3;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.liker-loading,
.liker-empty {
  padding: 40px;
  text-align: center;
  font-size: 13px;
  color: @text-3;
}

.liker-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: background 0.12s;
  border-bottom: 1px solid #f4f6f7;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f7f8f9;
  }
}

.liker-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.liker-body {
  flex: 1;
  min-width: 0;
}

.liker-name-line {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;

  .liker-name {
    color: @text-1;
    font-weight: 600;
  }

  .liker-action {
    color: @text-2;
    margin-left: 4px;
  }
}

.liker-time {
  margin: 4px 0 0;
  font-size: 12px;
  color: #c9cdd4;
}

.follow-btn {
  flex-shrink: 0;
  padding: 5px 16px;
  border: 1px solid @border-color;
  border-radius: 6px;
  background: #fff;
  font-size: 13px;
  color: @text-1;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: @pink;
    color: @pink;
  }

  &.followed {
    border-color: transparent;
    background: #f5f5f5;
    color: @text-3;
    cursor: default;

    &:hover {
      border-color: transparent;
      background: #f5f5f5;
      color: @text-3;
    }
  }
}
</style>
