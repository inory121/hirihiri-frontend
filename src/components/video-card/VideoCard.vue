<template>
  <!-- 视频卡片 -->
  <div
    class="video-card-container"
    v-for="(videoInfo, index) in props.data"
    :key="videoInfo.video?.vid ?? index"
    :data-vid="videoInfo.video?.vid"
    :data-index="index"
  >
    <el-skeleton :loading="props.loading" animated :throttle="{ leading: 500, trailing: 500, initVal: true }">
      <!-- 骨架屏内容 -->
      <template #template>
        <a href="#">
          <el-skeleton-item variant="image" style="padding-top: 55%; border-radius: 6px"></el-skeleton-item>
        </a>
        <a href="#">
          <el-skeleton-item variant="text" style="height: 25px; margin-top: 10px"></el-skeleton-item>
          <el-skeleton-item variant="text" style="height: 15px; margin-top: 10px; width: 40%"></el-skeleton-item>
        </a>
      </template>
      <template #default>
        <!-- 真实数据内容 -->
        <div class="video-card">
          <div class="video-card__wrapper">
            <router-link
              :to="`/video/${videoInfo.video.vid}`"
              target="_blank"
              class="video-card__link"
              @click="handleClick(videoInfo, index)"
            >
              <div class="video-card__cover">
                <img :src="videoInfo.video.coverUrl" alt="" class="video-card__image" />
                <div class="video-card__stats">
                  <div class="video-card__stat-left">
                    <span class="video-card__stat-item">
                      <el-icon>
                        <VideoPlay />
                      </el-icon>
                      {{ formatNumber(videoInfo.stat.view) }}
                    </span>
                    <span class="video-card__stat-item">
                      <el-icon>
                        <ChatDotRound />
                      </el-icon>
                      {{ formatNumber(videoInfo.stat.danmaku) }}
                    </span>
                  </div>
                  <span class="video-card__duration">{{
                    formatDuration(videoInfo.video.duration)
                  }}</span>
                </div>
              </div>
            </router-link>
            <div class="video-card__content">
              <h3 class="video-card__title">
                <router-link
                  :to="`/video/${videoInfo.video.vid}`"
                  target="_blank"
                  class="video-card__title-link"
                  :title="videoInfo.video.title"
                  @click="handleClick(videoInfo, index)"
                >{{
                  videoInfo.video.title }}
                </router-link>
              </h3>
              <div class="video-card__meta">
                <template v-if="!props.hideAuthor">
                  <router-link :to="`/space/${videoInfo.video.uid}`" target="_blank" class="video-card__author"
                    style="display: flex; align-items: center">
                    <img src="https://hirihiri.oss-cn-nanjing.aliyuncs.com/up_pb.svg" class="video-card__avatar" />
                    <span class="video-card__username" style="margin-left: 3px">{{
                      videoInfo.user.username
                    }}</span>
                    <span v-if="!props.hideTime" class="video-card__time" style="margin-left: 10px">{{
                      formatTime(videoInfo.video.createDate)
                    }}</span>
                  </router-link>
                </template>
                <template v-else>
                  <span v-if="!props.hideTime" class="video-card__time">{{
                    formatTime(videoInfo.video.createDate)
                  }}</span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<script setup lang="ts">
import { VideoPlay, ChatDotRound } from '@element-plus/icons-vue'
import { formatTime, formatDuration, formatNumber } from '@/utils/utils.ts'
import type { VideoInfo } from '@/types/api'

const props = withDefaults(
  defineProps<{
    data: VideoInfo[]
    loading?: boolean
    hideAuthor?: boolean
    hideTime?: boolean
  }>(),
  {
    loading: false,
    hideAuthor: false,
    hideTime: false,
  },
)

const emit = defineEmits<{
  (e: 'card-click', videoInfo: VideoInfo, index: number): void
}>()

const handleClick = (videoInfo: VideoInfo, index: number) => {
  emit('card-click', videoInfo, index)
}
</script>

<style scoped lang="less">
.video-card {
  width: 100%;

  &__link {
    display: block;
  }

  &__cover {
    position: relative;
    overflow: hidden;
    border-radius: 6px;
  }

  &__image {
    display: block;
    width: 100%;
    height: 100%;
    aspect-ratio: 16/9;
    object-fit: cover;
  }

  &__stats {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 8px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 100%);
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    font-size: 12px;
  }

  &__stat-left {
    display: flex;
    align-items: center;
    justify-content: left;
  }

  &__stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-right: 12px;

    .el-icon {
      font-size: 14px;
    }
  }

  &__duration {
    font-weight: 500;
  }

  &__title {
    height: 44px;
    line-height: 22px;
  }

  &__title-link {
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

  &__author {
    font-size: 13px;
    color: #9499a0;
    transition: color 0.2s linear;

    &:hover {
      color: #ff6699 !important;
    }
  }

  &__time {
    font-size: 13px;
  }
}
</style>
