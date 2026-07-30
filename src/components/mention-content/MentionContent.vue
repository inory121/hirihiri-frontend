<template>
  <template v-for="(part, index) in contentParts" :key="`${part.type}-${index}-${part.text}`">
    <UserHoverCard
      v-if="part.type === 'mention' && part.user"
      :user="part.user"
      placement="right-top"
      :auto-adjust="true"
      :is-following="userStore.followStatusMap[part.user.uid] === true"
      :like-count="part.user.like ?? 0"
      @follow="handleMentionFollow"
      class="mention-hover-wrapper"
    >
      <a
        :href="`/space/${part.user.uid}`"
        class="mention-link"
        target="_blank"
      >
        @{{ part.username }}
      </a>
    </UserHoverCard>
    <span v-else>{{ part.text }}</span>
  </template>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'
import type { User } from '@/types/api'
import UserHoverCard from '@/components/user-hover-card/UserHoverCard.vue'

interface ContentPart {
  type: 'text' | 'mention'
  text: string
  username?: string
  user?: User
}

const props = defineProps<{
  content: string
  // 后端随包返回的结构化 @用户（参考 B站 at_details），优先用于本地解析，避免逐个请求
  mentionUsers?: Array<{ uid: number; username: string; nickname?: string; avatar?: string }>
}>()

const userStore = useUserStore()
const resolvedUsers = ref<Record<string, User | null>>({})
const mentionUserCache = new Map<string, User | null>()
const pendingUserRequests = new Map<string, Promise<User | null>>()
// 兼容 @<uid>（后端存储的提及，数字形式）与 @<username>（旧内容/第三方来源）两种格式。
// 纯数字 @<uid> 不受前导字符边界限制，避免 "hello@uid" 这类紧跟字母的场景漏匹配；
// @<username> 形式仍要求前导边界（行首或非字母数字），以兼容邮箱地址。
const mentionPattern = /(?:^|[^\p{L}\p{N}])@([\p{L}\p{N}_.-]+)|@(\d+)/gu

const isUid = (s: string) => /^\d+$/.test(s)

// 后端随包用户：uid -> User，命中后零网络请求
const mentionUserMap = computed<Map<number, User>>(() => {
  const map = new Map<number, User>()
  for (const m of props.mentionUsers ?? []) {
    map.set(m.uid, { uid: m.uid, username: m.username, nickname: m.nickname, avatar: m.avatar } as User)
  }
  return map
})

// 后端随包用户：username(小写) -> User，供手打 @用户名 形式零请求匹配（与 @<uid> 统一）
const mentionUserByName = computed<Map<string, User>>(() => {
  const map = new Map<string, User>()
  for (const m of props.mentionUsers ?? []) {
    if (m.username) {
      map.set(m.username.toLowerCase(), { uid: m.uid, username: m.username, nickname: m.nickname, avatar: m.avatar } as User)
    }
  }
  return map
})

// 调用方是否显式提供了 mentionUsers（含空数组）。提供后严格按列表渲染提及，
// 未提供则走旧的自动反查兜底（兼容未升级的调用方）。
const mentionUsersProvided = computed(() => Array.isArray(props.mentionUsers))

const resolveMentionUser = (token: string): Promise<User | null> => {
  const cached = mentionUserCache.get(token)
  if (cached !== undefined) {
    return Promise.resolve(cached)
  }

  const pending = pendingUserRequests.get(token)
  if (pending) return pending

  const request = (async () => {
    try {
      let user: User | null = null
      if (isUid(token)) {
        // 优先使用后端随包返回的结构化用户（mentionUsers），无需请求
        const fromMap = mentionUserMap.value.get(Number(token))
        if (fromMap) {
          mentionUserCache.set(token, fromMap)
          return fromMap
        }
        user = await userStore.getUserByUid(Number(token))
          } else {
            // 优先使用后端随包返回的结构化用户（按用户名匹配），无需请求
            const byName = mentionUserByName.value.get(token.toLowerCase())
            if (byName) {
              mentionUserCache.set(token, byName)
              return byName
            }
        await userStore.getSearchUsers(token, 'default', 1, 10)
            user =
              userStore.searchUserList.find((item) => item.username === token) ?? null
          }
      mentionUserCache.set(token, user)
      return user
    } catch (e) {
      mentionUserCache.set(token, null)
      return null
    }
  })()

  pendingUserRequests.set(token, request)
  request.finally(() => pendingUserRequests.delete(token))
  return request
}

const getMentionTokens = (content: string): string[] => {
  const tokens: string[] = []
  for (const match of content.matchAll(mentionPattern)) {
    const token = match[1] ?? match[2]
    if (!token) continue
    // 严格模式：mentionUsers 已提供时，只有其中的 @uid / @username 才是真实提及，
    // 其余（如邮箱 a@123.com 或无关 @词）按纯文本处理，避免误渲染成链接
    if (mentionUsersProvided.value) {
      if (isUid(token) && !mentionUserMap.value.has(Number(token))) continue
      if (!isUid(token) && !mentionUserByName.value.has(token.toLowerCase())) continue
    }
    if (!tokens.includes(token)) tokens.push(token)
  }
  return tokens
}

watch(
  () => [props.content, props.mentionUsers],
  () => {
    for (const token of getMentionTokens(props.content)) {
      if (token in resolvedUsers.value) continue
      resolvedUsers.value = { ...resolvedUsers.value, [token]: undefined as unknown as User | null }
      void resolveMentionUser(token).then((user) => {
        resolvedUsers.value = { ...resolvedUsers.value, [token]: user }
      })
    }
  },
  { immediate: true },
)

const contentParts = computed<ContentPart[]>(() => {
  const content = props.content || ''
  const parts: ContentPart[] = []
  let lastIndex = 0

  for (const match of content.matchAll(mentionPattern)) {
    const fullMatch = match[0]
    const matchIndex = match.index ?? 0
    const token = match[1] ?? match[2]
    if (!token) continue
    const prefixLength = fullMatch.length - token.length - 1
    const atIndex = matchIndex + prefixLength

    if (atIndex > lastIndex) {
      parts.push({ type: 'text', text: content.slice(lastIndex, atIndex) })
    }

    const user = resolvedUsers.value[token]
    if (user) {
      parts.push({ type: 'mention', text: fullMatch, username: user.username, user })
    } else {
      // 解析未完成前先按原文渲染，解析完成后再升级为 mention
      parts.push({ type: 'text', text: fullMatch })
    }
    lastIndex = atIndex + 1 + token.length
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'text', text: content.slice(lastIndex) })
  }

  return parts
})

const handleMentionFollow = async (uid: number) => {
  await userStore.toggleFollow(uid)
}
</script>

<style scoped lang="less">
.mention-hover-wrapper {
  display: inline-block;
}

.mention-link {
  color: #409eff;
  font-weight: 500;
  text-decoration: none;

  &:hover {
    color: #00baf0;
  }
}
</style>
