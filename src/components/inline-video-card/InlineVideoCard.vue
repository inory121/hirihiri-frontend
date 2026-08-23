<template>
  <a
    class="inline-video-card"
    :href="`/video/${video.vid}`"
    target="_blank"
  >
    <div class="inline-video-card__cover">
      <img class="inline-video-card__image" :src="video.coverUrl" alt="" />
      <span class="inline-video-card__duration">{{ formatDuration(video.duration) }}</span>
    </div>
    <div class="inline-video-card__info">
      <div class="inline-video-card__title" :title="video.title">{{ video.title }}</div>
      <div v-if="video.descr" class="inline-video-card__descr" :title="video.descr">{{ video.descr }}</div>
      <div class="inline-video-card__meta">
        <span class="inline-video-card__stat">
          <el-icon><VideoPlay /></el-icon>
          {{ formatNumber(stat.view) }}
        </span>
        <span class="inline-video-card__stat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" width="13" height="13">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          {{ formatNumber(stat.reply ?? 0) }}
        </span>
      </div>
    </div>
  </a>
</template>

<script setup lang="ts">
import { VideoPlay } from '@element-plus/icons-vue'
import { formatDuration, formatNumber } from '@/utils/utils.ts'
import type { Video, VideoStat } from '@/types/api'

defineProps<{
  video: Video
  stat: VideoStat
}>()
</script>

<style scoped lang="less">
.inline-video-card {
  display: flex;
  width: 100%;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.2s;
  box-sizing: border-box;

  &:hover {
    background: #f0f1f2;

    .inline-video-card__title {
      color: @pink;
    }
  }

  &__cover {
    position: relative;
    width: 200px;
    height: 120px;
    flex-shrink: 0;
    border-radius: 6px;
    overflow: hidden;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &__duration {
    position: absolute;
    right: 6px;
    bottom: 6px;
    padding: 1px 6px;
    font-size: 12px;
    color: #fff;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 4px;
    line-height: 1.4;
  }

  &__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 16px 10px;
  }

  &__title {
    font-size: 15px;
    color: @text-1;
    line-height: 1.5;
    transition: color 0.2s;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-all;
  }

  &__descr {
    height: 34px;
    font-size: 13px;
    color: @text-3;
    line-height: 28px;
    margin-top: 6px;
    // 强制合并换行符与空白，避免视频简介自带的 \n 被渲染成真实换行/空白行
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-all;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: @text-3;
    margin-top: auto;
  }

  &__stat {
    width: 80px;
    display: inline-flex;
    align-items: center;
    gap: 3px;

    .el-icon {
      font-size: 13px;
    }
  }

  &__divider {
    width: 1px;
    height: 12px;
    background: #dcdfe6;
    margin: 0 4px;
  }
}
</style>
