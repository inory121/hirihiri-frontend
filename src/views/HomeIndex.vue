<template>
  <!-- 主页主体 -->
  <div class="index">
    <header class="hiri-header__bar">
      <HeaderBar />
      <!-- 头部banner -->
      <div class="hiri-header__banner"></div>
      <HeaderChannel />
    </header>
    <!-- 主体 -->
    <main>
      <!-- 推荐 -->
      <div class="recommended-container">
        <VideoCarousel :loading="videoStore.loading" />
        <!-- 视频卡片 -->
        <VideoCard
          :data="
            videoStore.videoList.length > 0
              ? videoStore.videoList
              : Array.from({ length: 11 }, () => ({}) as VideoInfo)
          "
          :loading="videoStore.loading"
        />
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { useVideoStore } from '@/stores/videoStore.ts'
import type { VideoInfo } from '@/types/api.ts'
import { onMounted } from 'vue'

const videoStore = useVideoStore()
onMounted(() => {
  document.body.style.backgroundColor = '#fff'
})
</script>
<style scoped lang="less">
.hiri-header__bar {
  --position: absolute;

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
