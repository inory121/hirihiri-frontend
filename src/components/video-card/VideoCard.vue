<template>
  <!-- 视频卡片 -->
  <div class="video-card-container" v-for="(videoInfo, index) in props.data" :key="index">
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
            style="padding-top: 55%; border-radius: 6px"
          ></el-skeleton-item>
        </a>
        <a href="#">
          <el-skeleton-item
            variant="text"
            style="height: 25px; margin-top: 10px"
          ></el-skeleton-item>
          <el-skeleton-item
            variant="text"
            style="height: 15px; margin-top: 10px; width: 40%"
          ></el-skeleton-item>
        </a>
      </template>
      <template #default>
        <!-- 真实数据内容 -->
        <div class="video-card">
          <div class="video-card__wrap">
            <router-link :to="`/video/${videoInfo.video.vid}`" target="_blank">
              <div class="video-card__image">
                <img :src="videoInfo.video.coverUrl" alt="" class="video-card-img" />
              </div>
            </router-link>
            <div class="video-card__info">
              <h3 class="video-card__info--title">
                <router-link :to="`/video/${videoInfo.video.vid}`" target="_blank"
                  >{{ videoInfo.video.title }}
                </router-link>
              </h3>
              <div class="video-card__info--bottom">
                <router-link :to="`/space/${videoInfo.video.uid}`" target="_blank">
                  up
                  <span>{{ videoInfo.user.username }}</span
                  >&nbsp;
                  <span>{{ formatTime(videoInfo.video.pubDate) }}</span>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<script setup lang="ts">
import { formatTime } from '@/utils/utils.ts'

const props = defineProps(['data', 'loading'])
</script>

<style scoped lang="less">
.video-card {
  width: 100%;

  .video-card-img {
    width: 100%;
    height: 100%;
    border-radius: 6px;
    aspect-ratio: 16/9;
    object-fit: cover;
  }

  .video-card__info {
    a {
      color: #000000;
      font-size: 15px;
      font-weight: 500;
      transition: color 0.2s linear;
      text-overflow: ellipsis;
      word-break: break-all;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-top: 7px;

      &:hover {
        color: #ff6699 !important;
      }
    }

    .video-card__info--bottom {
      a {
        font-size: 13px;
        color: #9499a0;
      }
    }

    .video-card__info--title {
      height: 44px;
    }
  }
}
</style>
