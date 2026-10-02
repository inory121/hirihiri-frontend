<template>
  <div class="dynamic-page">
    <!-- 页面顶部固定导航（与动态列表页同构） -->
    <div class="hiri-header__bar">
      <HeaderBar />
    </div>

    <div class="dynamic-detail">
    <!-- 加载骨架 -->
    <div v-if="loading" class="dynamic-detail__main">
      <el-skeleton :rows="6" animated class="dynamic-detail__card" />
    </div>

    <!-- 不存在/已删除：重定向到 404 页面，此处仅占位避免详情分支渲染空数据 -->
    <div v-else-if="!item" class="dynamic-detail__main"></div>

    <!-- 详情主体：左内容 + 右浮动操作栏 -->
    <div v-else class="dynamic-detail__layout">
      <main class="dynamic-detail__main">
        <!-- 动态内容卡片（复用动态页 DynamicCard，隐藏底部操作栏，由右侧操作栏替代） -->
        <div class="dynamic-detail__card">
          <DynamicCard :item="item" hide-actions detail @refresh="loadDetail" />
        </div>

        <!-- 评论 / 赞与转发 tabs -->
        <div ref="tabsRef" class="dynamic-detail__card dynamic-detail__tabs-card">
          <div class="dynamic-detail__tabs">
            <span
              class="dynamic-detail__tab"
              :class="{ 'is-active': activeTab === 'comment' }"
              @click="activeTab = 'comment'"
            >评论 <span class="dynamic-detail__tab-count">{{ commentTotal }}</span></span>
            <span
              class="dynamic-detail__tab"
              :class="{ 'is-active': activeTab === 'repost' }"
              @click="activeTab = 'repost'"
            >赞与转发 <span class="dynamic-detail__tab-count">{{ interactionTotal }}</span></span>
          </div>

          <!-- 评论 tab：排序切换 + 评论区（隐藏组件内部标题栏，避免与 tab 重复） -->
          <template v-if="activeTab === 'comment'">
            <div class="dynamic-detail__sort">
              <span
                class="dynamic-detail__sort-item"
                :class="{ 'is-active': commentSort === 'hot' }"
                @click="changeCommentSort('hot')"
              >最热</span>
              <span class="dynamic-detail__sort-divider">|</span>
              <span
                class="dynamic-detail__sort-item"
                :class="{ 'is-active': commentSort === 'new' }"
                @click="changeCommentSort('new')"
              >最新</span>
            </div>
            <div class="dynamic-detail__comments">
              <CommentArea
                biz-type="dynamic"
                :biz-id="item.id"
                :owner-uid="item.uid"
                :highlight-comment-id="highlightCommentId"
              />
            </div>
          </template>

          <!-- 赞与转发 tab：逐条列出点赞/转发用户（赞与转发分开计数、不去重） -->
          <div v-else class="dynamic-detail__interactions">
            <div
              v-for="(row, idx) in interactions"
              :key="`${row.user.uid}-${row.action}-${idx}`"
              class="interaction-row"
              @click="goUserSpace(row.user.uid)"
            >
              <img class="interaction-row__avatar" :src="row.user.avatar || DEFAULT_AVATAR" alt="" />
              <div class="interaction-row__body">
                <p class="interaction-row__name-line">
                  <span class="interaction-row__name">{{ getUserDisplayName(row.user) }}</span>
                  <span class="interaction-row__action">{{ row.action === 'repost' ? '转发了' : '赞了' }}</span>
                </p>
                <p class="interaction-row__time">{{ formatTime(row.time) }}</p>
              </div>
              <button
                v-if="row.user.uid !== userStore.user?.uid"
                class="interaction-row__follow"
                :class="{ followed: isFollowing(row.user.uid) }"
                @click.stop="handleFollow(row.user.uid)"
              >{{ isFollowing(row.user.uid) ? '已关注' : '关注' }}</button>
            </div>

            <div v-if="interactionLoading" class="interaction-tip">加载中...</div>
            <div v-else-if="interactions.length === 0" class="interaction-tip">暂无赞与转发</div>
            <!-- 懒加载哨兵：滚动到底部自动加载下一页 -->
            <div v-else ref="interactionSentinelRef" class="interaction-sentinel"></div>
          </div>
        </div>
      </main>

      <!-- 右侧浮动操作栏（B站式：点赞/转发/评论） -->
      <aside class="dynamic-detail__rail">
        <button
          class="dynamic-detail__rail-btn"
          :class="{ 'is-active': item.liked, 'is-like': item.liked }"
          type="button"
          @click="handleLike"
        >
          <svg viewBox="0 0 24 24" :fill="item.liked ? 'currentColor' : 'none'" width="20" height="20"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path
              d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
          </svg>
          <span>{{ formatNumber(item.likeCount || 0) }}</span>
        </button>
        <button class="dynamic-detail__rail-btn" type="button" @click="openShare">
          <el-icon :size="20"><Share /></el-icon>
          <span>{{ formatNumber(item.repostCount || 0) }}</span>
        </button>
        <button class="dynamic-detail__rail-btn" type="button" @click="scrollToComments">
          <el-icon :size="20"><ChatDotRound /></el-icon>
          <span>{{ formatNumber(commentTotal) }}</span>
        </button>
      </aside>
    </div>

    <!-- 转发弹窗（与视频播放页共用，预览区按动态类型渲染） -->
    <ShareDynamicDialog ref="shareDialogRef" @published="onReposted" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {ChatDotRound, Share} from '@element-plus/icons-vue'
import DynamicCard from '@/components/dynamic-card/DynamicCard.vue'
import CommentArea from '@/components/comment-area/CommentArea.vue'
import ShareDynamicDialog from '@/components/share-dynamic-dialog/ShareDynamicDialog.vue'
import HeaderBar from '@/components/header-bar/HeaderBar.vue'
import {useUserStore} from '@/stores/userStore'
import {useDynamicCommentStore} from '@/stores/dynamicCommentStore'
import {get, post} from '@/utils/request'
import {DYNAMIC_API} from '@/api/dynamic'
import {formatNumber, formatTime, getUserDisplayName} from '@/utils/utils'
import {DEFAULT_AVATAR} from '@/utils/constants'
import type {Dynamic, DynamicApiResponse, DynamicInteraction, DynamicInteractionApiResponse} from '@/types/api'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const dynamicCommentStore = useDynamicCommentStore()

const loading = ref(true)
const item = ref<Dynamic | null>(null)
const activeTab = ref<'comment' | 'repost'>('comment')
const commentSort = ref<'hot' | 'new'>('hot')
const tabsRef = ref<HTMLElement | null>(null)
const shareDialogRef = ref<InstanceType<typeof ShareDynamicDialog> | null>(null)

const dynamicId = computed(() => Number(route.params.dynamicId))

// ===== 赞与转发列表（赞与转发分开计数、不去重，滚动懒加载） =====
const interactions = ref<DynamicInteraction[]>([])
const interactionTotal = ref(0)
const interactionLikeCount = ref(0)
const interactionRepostCount = ref(0)
const interactionLoading = ref(false)
const interactionFinished = ref(false)
const interactionPageNum = ref(1)
const INTERACTION_PAGE_SIZE = 20
const interactionLoaded = ref(false)
const interactionSentinelRef = ref<HTMLElement | null>(null)
let interactionObserver: IntersectionObserver | null = null

// 加载赞与转发列表（append=false 重新加载首页，true 追加载下一页）
const loadInteractions = async (append = false) => {
  if (!item.value || interactionLoading.value) return
  if (append && interactionFinished.value) return
  interactionLoading.value = true
  if (append) {
    interactionPageNum.value += 1
  } else {
    interactionPageNum.value = 1
    interactionFinished.value = false
  }
  try {
    const res = await get<DynamicInteractionApiResponse>(
      `${DYNAMIC_API.DETAIL}/${item.value.id}/interactions`,
      { params: { pageNum: interactionPageNum.value, pageSize: INTERACTION_PAGE_SIZE } },
    )
    if (res.code === 200 && res.data) {
      const records = res.data.records || []
      interactions.value = append ? [...interactions.value, ...records] : records
      interactionTotal.value = res.data.total || 0
      interactionLikeCount.value = res.data.likeCount || 0
      interactionRepostCount.value = res.data.repostCount || 0
      // 同步关注状态到 store，供按钮展示
      userStore.syncFollowStatusFromList(records.map((r) => r.user))
      if (records.length === 0 || interactions.value.length >= interactionTotal.value) {
        interactionFinished.value = true
      }
    } else {
      interactionFinished.value = true
    }
  } catch (e) {
    console.log('获取赞与转发列表失败:', e)
    interactionFinished.value = true
  } finally {
    interactionLoading.value = false
    interactionLoaded.value = true
  }
}

// 当前登录用户是否已关注该互动用户
const isFollowing = (uid: number) => !!userStore.followStatusMap[uid]

// 关注/取消关注互动用户（复用 userStore.toggleFollow，乐观更新 followStatusMap）
const handleFollow = async (uid: number) => {
  if (!userStore.isLogin) {
    userStore.showLoginWindow = true
    return
  }
  await userStore.toggleFollow(uid)
}

// 点击互动用户行跳转其个人空间（新标签页）
const goUserSpace = (uid: number) => {
  if (!uid) return
  const href = router.resolve({ path: `/space/${uid}` }).href
  window.open(href, '_blank')
}

// 消息通知跳转携带的评论 id：评论区加载后自动滚动定位并高亮（由 CommentArea 实现）
const highlightCommentId = computed<number | undefined>(() => {
  const id = Number(route.query.commentId)
  return Number.isFinite(id) && id > 0 ? id : undefined
})

// 评论数：优先用评论组件加载后的实时 total，兜底详情接口回填值
const commentTotal = computed(() =>
  dynamicCommentStore.total || item.value?.commentCount || 0,
)

const loadDetail = async () => {
  if (!dynamicId.value || Number.isNaN(dynamicId.value)) {
    item.value = null
    loading.value = false
    router.replace({ name: 'NotFound' })
    return
  }
  loading.value = true
  try {
    const res = await get<DynamicApiResponse>(`${DYNAMIC_API.DETAIL}/${dynamicId.value}`)
    item.value = res.code === 200 ? res.data : null
    // 动态不存在或已被删除：重定向到 404 页面
    if (!item.value) {
      router.replace({ name: 'NotFound' })
    }
  } catch (e) {
    console.log('获取动态详情失败:', e)
    item.value = null
    router.replace({ name: 'NotFound' })
  } finally {
    loading.value = false
  }
}

// 切换评论排序（重置后重新加载第一页）
const changeCommentSort = (sort: 'hot' | 'new') => {
  if (commentSort.value === sort || !item.value) return
  commentSort.value = sort
  dynamicCommentStore.getComments(item.value.id, sort)
}

// 点赞/取消点赞：详情动态不在 store 列表内，本地乐观更新 + 接口同步（与 dynamicStore.toggleLike 同构）
const handleLike = async () => {
  if (!item.value) return
  if (!userStore.isLogin) {
    userStore.showLoginWindow = true
    return
  }
  const it = item.value
  const prevLiked = !!it.liked
  const prevCount = it.likeCount || 0
  it.liked = !prevLiked
  it.likeCount = Math.max(0, prevCount + (prevLiked ? -1 : 1))
  try {
    const res = await post<{ code: number; message: string; data: { liked: boolean; likeCount: number } }>(
      `${DYNAMIC_API.LIKE}/${it.id}`,
    )
    if (res.code === 200) {
      it.liked = !!res.data.liked
      it.likeCount = res.data.likeCount ?? it.likeCount
      return
    }
    it.liked = prevLiked
    it.likeCount = prevCount
  } catch (e) {
    console.log('动态点赞失败:', e)
    it.liked = prevLiked
    it.likeCount = prevCount
  }
}

// 转发：打开转发弹窗（预览区按动态类型渲染）
const openShare = () => {
  if (!item.value) return
  shareDialogRef.value?.openDynamic(item.value)
}

// 转发成功后本地转发数 +1（赞与转发列表已加载则下次切入时重拉）
const onReposted = () => {
  if (item.value) {
    item.value.repostCount = (item.value.repostCount || 0) + 1
  }
  interactionLoaded.value = false
}

// 评论按钮：滚动到评论区
const scrollToComments = () => {
  activeTab.value = 'comment'
  nextTick(() => {
    tabsRef.value?.scrollIntoView({behavior: 'smooth', block: 'start'})
  })
}

// 切到「赞与转发」tab 时首次加载列表
watch(activeTab, (tab) => {
  if (tab === 'repost' && !interactionLoaded.value) {
    loadInteractions()
  }
})

// 懒加载哨兵进入视口时加载下一页
const ensureObserver = () => {
  if (interactionObserver || typeof IntersectionObserver === 'undefined') return
  interactionObserver = new IntersectionObserver((entries) => {
    if (
      entries[0]?.isIntersecting &&
      activeTab.value === 'repost' &&
      interactionLoaded.value &&
      !interactionFinished.value &&
      !interactionLoading.value
    ) {
      loadInteractions(true)
    }
  }, { rootMargin: '200px' })
}

// 哨兵元素挂载/卸载时（重新）绑定观察（flush: post 确保 DOM 已更新）
watch(interactionSentinelRef, (el) => {
  ensureObserver()
  if (!interactionObserver) return
  interactionObserver.disconnect()
  if (el) interactionObserver.observe(el)
}, { flush: 'post' })

onMounted(loadDetail)

onUnmounted(() => {
  interactionObserver?.disconnect()
  interactionObserver = null
})

// 详情页间跳转（如转发动态跳原动态）时按路由参数重新加载
watch(dynamicId, (val, old) => {
  if (val && val !== old) {
    item.value = null
    dynamicCommentStore.$reset()
    // 重置赞与转发列表状态
    interactions.value = []
    interactionTotal.value = 0
    interactionLoaded.value = false
    interactionFinished.value = false
    interactionPageNum.value = 1
    activeTab.value = 'comment'
    loadDetail()
  }
})
</script>

<style scoped lang="less">
// 页面容器：与动态列表页同款渐变背景
.dynamic-page {
  min-height: 100vh;
  position: relative;
  background: radial-gradient(ellipse at 12% 100%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 40%),
  radial-gradient(ellipse at 92% 6%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 35%),
  radial-gradient(ellipse at 50% 120%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 50%),
  linear-gradient(165deg, #e6f5f6 0%, #d6eef1 45%, #c4e4e9 100%);
}

// 顶部固定导航（同动态列表页）
.hiri-header__bar {
  --search-display: flex;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.dynamic-detail {
  min-height: 100vh;
  padding: 88px 16px 40px;
  box-sizing: border-box;

  &__layout {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    gap: 20px;
    max-width: 780px;
    margin: 0 auto;
    padding: 0 16px;
  }

  &__main {
    flex: 1;
    min-width: 0;
    max-width: 620px;
  }

  &__card {
    background: #fff;
    border: 1px solid var(--line_regular);
    border-radius: 8px;
  }

  // ===== tabs =====
  &__tabs-card {
    margin-top: 10px;
    overflow: hidden;
  }

  &__tabs {
    display: flex;
    gap: 28px;
    padding: 0 20px;
    border-bottom: 1px solid var(--line_regular);
  }

  &__tab {
    position: relative;
    padding: 14px 0 10px;
    font-size: 15px;
    color: @text-2;
    cursor: pointer;
    user-select: none;

    &:hover {
      color: @text-1;
    }

    &.is-active {
      color: @blue;
      font-weight: 500;

      &::after {
        content: '';
        position: absolute;
        left: 50%;
        bottom: 0;
        transform: translateX(-50%);
        width: 32px;
        height: 3px;
        border-radius: 2px;
        background: @blue;
      }
    }
  }

  &__tab-count {
    margin-left: 2px;
    font-size: 14px;
  }

  &__sort {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px 0;
    font-size: 13px;
    color: @text-3;
  }

  &__sort-item {
    cursor: pointer;

    &:hover,
    &.is-active {
      color: @blue;
    }
  }

  &__sort-divider {
    color: @border-color;
  }

  &__comments {
    // 头像左侧与评论框右侧留出边距
    padding: 0 16px 8px;

    // 隐藏 CommentArea 内部标题栏（评论数 + 最热/最新），避免与页面 tabs 重复
    :deep(.comment-wrap > .header > .navbar) {
      display: none;
    }
  }

  &__interactions {
    padding: 4px 0 8px;
  }

  // ===== 赞与转发用户列表 =====
  :deep(.interaction-row) {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    cursor: pointer;
    transition: background 0.12s;

    &:hover {
      background: #f7f8f9;
    }
  }

  :deep(.interaction-row__avatar) {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  :deep(.interaction-row__body) {
    flex: 1;
    min-width: 0;
  }

  :deep(.interaction-row__name-line) {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
  }

  :deep(.interaction-row__name) {
    color: @text-1;
    font-weight: 600;
  }

  :deep(.interaction-row__action) {
    color: @text-2;
    margin-left: 4px;
  }

  :deep(.interaction-row__time) {
    margin: 4px 0 0;
    font-size: 12px;
    color: #c9cdd4;
  }

  :deep(.interaction-row__follow) {
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

      &:hover {
        border-color: transparent;
        background: #f5f5f5;
        color: @text-3;
      }
    }
  }

  :deep(.interaction-tip) {
    padding: 24px;
    text-align: center;
    font-size: 13px;
    color: @text-3;
  }

  :deep(.interaction-sentinel) {
    height: 1px;
  }

  // ===== 右侧浮动操作栏 =====
  &__rail {
    position: sticky;
    top: 80px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px;
    background: #fff;
    border: 1px solid var(--line_regular);
    border-radius: 10px;
  }

  &__rail-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    width: 48px;
    padding: 8px 0;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: @text-2;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;

    &:hover {
      background: #f0f1f2;
      color: @text-1;
    }

    &.is-like.is-active {
      color: @pink;
    }
  }
}
</style>
