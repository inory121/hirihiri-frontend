<template>
  <!-- 轮播图 -->
  <div class="carousel">
    <el-carousel autoplay >
      <el-carousel-item v-for="(item,index) in videoStore.videoList" :key="index">
        <img class="carousel-img" :src="item.coverUrl" alt="" />
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { useVideoStore } from '@/stores/videoStore.ts'

const videoStore = useVideoStore()
onMounted(() => {
  videoStore.getRecommendVideo()
})
</script>

<style lang="less" scoped>
.carousel {
  grid-column: 1/3;
  grid-row: 1/3;
  height: 100%;
  border: 1px solid red;

  .carousel-img {
    width: 100%;
    height: 100%;
  }
}

:deep(.el-carousel__container) {
  height: 100%;
}

:deep(.el-carousel.el-carousel--horizontal) {
  height: 100%;
}
:deep(.el-carousel__indicators.el-carousel__indicators--horizontal){
  min-width: 266px;
}
</style>
