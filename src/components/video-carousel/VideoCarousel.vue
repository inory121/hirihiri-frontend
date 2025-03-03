<template>
  <!-- 轮播图 -->
  <div class="carousel">
    <el-skeleton
      :loading="props.loading"
      animated
      :throttle="{ leading: 500, trailing: 500, initVal: true }"
    >
      <!-- 骨架屏内容 -->
      <template #template>
        <a href="#">
          <el-skeleton-item
            variant="image"
            style="padding-top: 65%; border-radius: 6px"
          ></el-skeleton-item>
        </a>
        <a href="#">
          <el-skeleton-item
            variant="text"
            style="height: 25px; margin-top: 10px"
          ></el-skeleton-item>
        </a>
      </template>
      <template #default>
        <!-- 真实数据内容 -->
        <el-carousel :autoplay="false" @change="handleCarouselChange">
          <el-carousel-item v-for="(item, index) in videoStore.videoList.slice(0,7)" :key="index">
            <router-link :to="`video/${item.vid}`" target="_blank">
              <img class="carousel-img" :src="item.coverUrl" alt="" />
            </router-link>
          </el-carousel-item>
        </el-carousel>
        <!-- 当前标题 -->
        <a href="#" class="carousel-title">{{ currentTitle }}</a>
      </template>
    </el-skeleton>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps(['loading'])
import {  ref, watch } from 'vue'
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

</script>

<style lang="less" scoped>
.carousel {
  grid-column: 1 / 3;
  grid-row: 1 / 3;
  height: 100%;

  .carousel-img {
    width: 100%;
    height: 100%;
    border-radius: 6px 6px 0 0;
    object-fit: cover;
  }

  .carousel-title {
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 0 0 6px 6px;
    display: flex;
    align-items: center;
    padding-left: 10px;
    height: 8%;
    font-size: 18px;
    color: #333;
    transition: color 0.2s linear;

    &:hover {
      color: #ff6699 !important;
    }
  }
}

:deep(.el-carousel.el-carousel--horizontal) {
  height: 75%;
}

:deep(.el-carousel__container) {
  height: 100%;
  //aspect-ratio: 16 / 10;
}

:deep(.el-carousel__indicators.el-carousel__indicators--horizontal) {
  min-width: 304px;
}
</style>
