<template>
  <!-- 主页主体 -->
  <div class="index">
    <header>
      <HeaderBar />
      <HeaderChannel />
    </header>
    <!-- 主体 -->
    <main>
      <!-- 推荐 -->
      <div class="recommended-container">
        <VideoCarousel />
        <!-- 视频卡片 -->
        <VideoCard
          :count="
            videoStore.videoList.length > 0
              ? videoStore.videoList
              : Array.from({ length: 11 }, () => ({}) as Video)
          "
          :loading="loading"
        />
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { useVideoStore } from '@/stores/videoStore.ts'
import { onMounted, ref } from 'vue'
import type { Video } from '@/types/api.ts'

const videoStore = useVideoStore()
const loading = ref(true)
onMounted(() => {
  videoStore
    .getRecommendVideo()
    .then(() => {
      loading.value = false
    })
    .catch(() => {
      loading.value = true
    })
})
</script>
<style scoped lang="less">
// 推荐
.recommended-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 20px;
  margin: 0 auto;
}

@media (min-width: 1400px) {
  .recommended-container {
    grid-template-columns: repeat(5, 1fr);
    padding: 0 60px;
  }
}

@media (min-width: 1560px) {
  .recommended-container {
    padding: 0 140px;
  }
}

@media (max-width: 1139.9px) {
  .recommended-container {
    width: 1020px;
  }
}

@media (min-width: 1139.9px) {
  .recommended-container {
    padding: 0 60px;
  }
}

@media (min-width: 1400px) {
  .recommended-container {
    padding: 0 60px;
  }
}

@media (min-width: 1560px) {
  .recommended-container {
    padding: 0 140px;
  }
}
</style>
