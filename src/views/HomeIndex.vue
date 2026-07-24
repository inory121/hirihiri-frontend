<template>
  <!-- 主页主体 -->
  <div class="index">
    <header class="hiri-header__bar" :class="{ 'is-scrolled': isScrolled }">
      <HeaderBar />
      <!-- 头部banner -->
      <div class="hiri-header__banner"></div>
      <HeaderChannel />
    </header>
    <!-- 主体 -->
    <main>
      <!-- 推荐 -->
      <div class="recommended-container">
        <VideoCarousel :loading="recommendStore.feedLoading && recommendStore.feedList.length === 0" />
        <!-- 视频卡片 -->
        <VideoCard
          :data="
            recommendStore.feedList.length > 0
              ? recommendStore.feedList
              : recommendStore.feedLoading
                ? Array.from({ length: 11 }, () => ({ video: {}, stat: {}, user: {}, category: {} }) as VideoInfo)
                : []
          "
          :loading="recommendStore.feedLoading && recommendStore.feedList.length === 0"
          @card-click="handleCardClick"
        />
      </div>
      <!-- 加载更多触发器 -->
      <div ref="loadMoreRef" class="load-more-sentinel"></div>
      <div v-if="recommendStore.feedLoading && recommendStore.feedList.length > 0" class="loading-tip">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
      <div v-if="!recommendStore.feedHasMore && recommendStore.feedList.length > 0" class="no-more-tip">
        没有更多了
      </div>
      <div v-if="recommendStore.feedError && recommendStore.feedList.length === 0" class="error-tip">
        <span>推荐加载失败</span>
        <el-button type="primary" size="small" @click="retryFeed">重试</el-button>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import type { VideoInfo } from '@/types/api.ts'
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRecommendStore } from '@/stores/recommendStore.ts'
import { useCategoryStore } from '@/stores/categoryStore.ts'
import { useUserStore } from '@/stores/userStore.ts'
import { Loading } from '@element-plus/icons-vue'

const recommendStore = useRecommendStore()
const categoryStore = useCategoryStore()
const userStore = useUserStore()

const loadMoreRef = ref<HTMLElement>()
let loadMoreObserver: IntersectionObserver | null = null
let impressionObserver: IntersectionObserver | null = null

// 头部吸顶：滚动超过 80px 后切换为固定白底黑字
const isScrolled = ref(false)
const handleScroll = () => {
  isScrolled.value = window.scrollY > 80
}

/**
 * 处理视频卡片点击：上报 click 事件
 */
const handleCardClick = (videoInfo: VideoInfo, index: number) => {
  recommendStore.reportClick(videoInfo.video.vid, index)
}

/**
 * 重试加载推荐流
 */
const retryFeed = () => {
  recommendStore.getFeed(true, 20, 'home')
}

/**
 * 初始化曝光观察器：卡片进入可视区时上报 impression
 */
const initImpressionObserver = () => {
  if (impressionObserver) return
  impressionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement
          const vid = Number(el.dataset.vid)
          const index = Number(el.dataset.index)
          if (!isNaN(vid) && !isNaN(index)) {
            recommendStore.reportImpression(vid, index)
          }
          // 上报一次后即可取消观察
          impressionObserver?.unobserve(entry.target)
        }
      })
    },
    { rootMargin: '0px', threshold: 0.5 },
  )

  observeVideoCards()
}

/**
 * 观察所有视频卡片元素
 */
const observeVideoCards = () => {
  if (!impressionObserver) return
  const cards = document.querySelectorAll('.video-card-container[data-vid]')
  cards.forEach((card) => {
    impressionObserver?.observe(card)
  })
}

/**
 * 初始化无限滚动观察器
 */
const initLoadMoreObserver = () => {
  if (!loadMoreRef.value) return
  loadMoreObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        recommendStore.getFeed(false, 20, 'home')
      }
    },
    { rootMargin: '200px' },
  )
  loadMoreObserver.observe(loadMoreRef.value)
}

// 监听 feedList 变化，对新加载的卡片重新绑定曝光观察
watch(
  () => recommendStore.feedList.length,
  () => {
    nextTick(() => {
      observeVideoCards()
    })
  },
)

// 监听登录状态变化：登录/登出后重新获取推荐
watch(
  () => userStore.isLogin,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      recommendStore.getFeed(true, 20, 'home')
    }
  },
)

onMounted(async () => {
  document.body.style.backgroundColor = '#fff'
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
  // 注册页面生命周期监听（visibilitychange + pagehide，用 sendBeacon 兜底事件上报）
  recommendStore.initPageLifecycleListeners()
  // 重试上次失败的事件
  recommendStore.retryFailedEvents()
  try {
    await Promise.all([categoryStore.getCategory(), recommendStore.getFeed(true, 20, 'home')])
    initImpressionObserver()
    initLoadMoreObserver()
  } catch (e) {
    console.log(e)
  }
})

onUnmounted(() => {
  loadMoreObserver?.disconnect()
  impressionObserver?.disconnect()
  window.removeEventListener('scroll', handleScroll)
  // 页面离开时 flush 事件（页面真正关闭由 visibilitychange/pagehide 兜底）
  recommendStore.flushEvents()
})
</script>
<style scoped lang="less">
.hiri-header__bar {
  --position: absolute;
  --text-color: #fff;
  --bg-color: transparent;
  --header-shadow: none;

  // 滚动后切换为固定白底黑字
  &.is-scrolled {
    --position: fixed;
    --text-color: #18191c;
    --bg-color: #fff;
    --header-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  }

  // banner
  .hiri-header__banner {
    min-height: 155px;
    height: 9.375vw;
    background: url('@/assets/img/banner.png');
    background-size: cover;
  }
}

// 推荐
.recommended-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 20px;
  margin: 0 auto;
}

.load-more-sentinel {
  height: 20px;
  width: 100%;
}

.loading-tip,
.no-more-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 0;
  color: #9499a0;
  font-size: 14px;
}

.error-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 0;
  color: #9499a0;
  font-size: 14px;
}

@media (min-width: 1400px) {
  .recommended-container {
    grid-template-columns: repeat(5, 1fr);
    padding: 0 60px;
  }
}

@media (min-width: 1560px) {
  .recommended-container {
    padding: 0 140px 20px;
  }
}

@media (max-width: 1139.9px) {
  .recommended-container {
    width: 1020px;
  }
}

@media (min-width: 1139.9px) {
  .recommended-container {
    padding: 0 60px 20px;
  }
}

@media (min-width: 1400px) {
  .recommended-container {
    padding: 0 60px 20px;
  }
}

@media (min-width: 1560px) {
  .recommended-container {
    padding: 0 140px 20px;
  }
}
</style>
