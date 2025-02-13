<template>
  <!-- 主页主体 -->
  <div class="index">
    <HeaderBar />
    <HeaderChannel />
    <!-- 主体 -->
    <main>
      <!-- 推荐 -->
      <div class="recommended-container">
        <Carousel />
        <!-- 视频卡片 -->
        <div class="video-card" v-for="(item, index) in videoStore.videoList" :key="index">
          <img :src="item.coverUrl" alt="" class="video-card-img" />
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import HeaderBar from '@/components/HeaderBar/HeaderBar.vue'
import HeaderChannel from '@/components/HeaderChannel/HeaderChannel.vue'
import Carousel from '@/components/Carousel/Carousel.vue'
import { useVideoStore } from '@/stores/videoStore.ts'
import { onMounted } from 'vue'
const videoStore = useVideoStore()
onMounted(() => {
  videoStore.getRecommendVideo()
})
</script>
<style scoped lang="less">
// 推荐
.recommended-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 20px;
  margin: 0 auto;

  .video-card {
    width: 100%;
    border: 1px solid red;

    .video-card-img {
      width: 100%;
      height: 100%;
    }
  }
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
