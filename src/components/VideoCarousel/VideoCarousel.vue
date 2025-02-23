<template>
  <!-- 轮播图 -->
  <div class="carousel">
    <el-carousel :autoplay="false" @change="handleCarouselChange">
      <el-carousel-item v-for="(item, index) in videoStore.videoList" :key="index">
        <img class="carousel-img" :src="item.coverUrl" alt="" />
      </el-carousel-item>
    </el-carousel>
    <!-- 当前标题 -->
    <a href="#" class="carousel-title">{{ currentTitle }}</a>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { useVideoStore } from '@/stores/videoStore.ts'

const videoStore = useVideoStore()
// 定义当前标题和当前索引
const currentIndex = ref(0)
const currentTitle = ref('')
// 监听 currentIndex 变化，更新 currentTitle
watch(
  [() => videoStore.videoList, currentIndex],
  ([newList, newIndex]) => {
    currentTitle.value = newList[newIndex]?.title || ''
  },
  { immediate: true, deep: true },
)
// 处理轮播图变化事件
const handleCarouselChange = (current: number) => {
  currentIndex.value = current // 更新当前索引
}
onMounted(() => {
  videoStore.getRecommendVideo()
})
</script>

<style lang="less" scoped>
.carousel {
  grid-column: 1 / 3;
  grid-row: 1 / 3;
  height: 100%;

  .carousel-img {
    width: 100%;
    height: 100%;
    border-radius: 6px;
  }

  .carousel-title {
    display: flex;
    align-items: center;
    padding-left: 10px;
    height: 10%;
    font-size: 18px;
    color: #333;
    transition: color 0.2s linear;
    &:hover {
      color: #ff6699 !important;
    }
  }
}

:deep(.el-carousel__container) {
  height: 100%;
  aspect-ratio: 16 / 10;
}

:deep(.el-carousel__indicators.el-carousel__indicators--horizontal) {
  min-width: 266px;
}
</style>
