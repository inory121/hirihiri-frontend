<template>
  <!-- 视频卡片 -->
  <div
    class="video-card-container"
    v-for="(videoInfo, index) in props.data"
    :key="videoInfo.video?.vid ?? index"
    :data-vid="videoInfo.video?.vid"
    :data-index="index"
    :class="{ 'is-selected': props.selectable && isSelected(videoInfo.video.vid) }"
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
            <a
              :href="`/video/${videoInfo.video.vid}`"
              target="_blank"
              class="video-card__link"
              @click="handleCardClick($event, videoInfo, index)"
            >
              <div class="video-card__cover">
                <img :src="isInvalid(videoInfo) ? DEFAULT_INVALID_COVER : videoInfo.video.coverUrl" alt="" class="video-card__image" />
                <!-- 多选勾选框（仅多选模式显示，左上角） -->
                <div
                  v-if="props.selectable"
                  class="video-card__select"
                  :class="{ 'is-checked': isSelected(videoInfo.video.vid) }"
                >
                  <el-icon v-if="isSelected(videoInfo.video.vid)"><Check /></el-icon>
                </div>
                <div v-if="!isInvalid(videoInfo)" class="video-card__stats">
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
            </a>
            <div class="video-card__content">
              <h3 class="video-card__title">
              <a
                :href="`/video/${videoInfo.video.vid}`"
                target="_blank"
                class="video-card__title-link"
                :title="isInvalid(videoInfo) ? '已失效视频' : videoInfo.video.title"
                :class="{ 'is-invalid': isInvalid(videoInfo) }"
                @click="handleCardClick($event, videoInfo, index)"
              >{{
                  isInvalid(videoInfo) ? '已失效视频' : videoInfo.video.title }}
                </a>
                <!-- 更多操作：hover 标题区域时显示，hover 三个点时弹出菜单 -->
                <el-popover
                  v-if="props.showMoreMenu"
                  v-model:visible="moreVisibleMap[index]"
                  trigger="hover"
                  placement="bottom-end"
                  :width="160"
                  :offset="4"
                  popper-class="video-card__more-popover"
                >
                  <template #reference>
                    <button
                      class="video-card__more-btn"
                      :class="{ 'is-active': moreVisibleMap[index] }"
                      @click.stop
                      aria-label="更多操作"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <circle cx="12" cy="5" r="2"/>
                        <circle cx="12" cy="12" r="2"/>
                        <circle cx="12" cy="19" r="2"/>
                      </svg>
                    </button>
                  </template>
                  <div class="video-card__more-menu">
                    <template v-for="item in props.moreMenuItems" :key="item.key">
                      <div
                        v-if="item.divider"
                        class="video-card__more-divider"
                      ></div>
                      <div
                        class="video-card__more-item"
                        :class="{
                          'is-danger': item.danger,
                          'is-disabled': item.disabled,
                        }"
                        @click.stop="item.disabled || handleMoreMenuSelect(item.key, videoInfo, index)"
                      >{{ item.label }}</div>
                    </template>
                  </div>
                </el-popover>
              </h3>
              <div
                class="video-card__meta"
                :title="props.hideAuthor ? undefined : `${getUserDisplayName(videoInfo.user)} · ${displayTimeText(videoInfo)}`"
              >
                <template v-if="!props.hideAuthor">
                  <a :href="`/space/${videoInfo.video.uid}`" target="_blank" class="video-card__author"
                    style="display: flex; align-items: center">
                    <img :src="DEFAULT_AVATAR" class="video-card__avatar" />
                    <span class="video-card__username" style="margin-left: 3px">{{
                      getUserDisplayName(videoInfo.user)
                    }}</span>
                    <span v-if="!props.hideTime" class="video-card__dot">·</span>
                    <span v-if="!props.hideTime" class="video-card__time">{{
                      displayTimeText(videoInfo)
                    }}</span>
                  </a>
                </template>
                <template v-else>
                  <span v-if="!props.hideTime" class="video-card__time">{{
                    displayTimeText(videoInfo)
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
import { reactive } from 'vue'
import { VideoPlay, ChatDotRound, Check } from '@element-plus/icons-vue'
import { formatTime, formatDuration, formatNumber, formatCollectTime, getUserDisplayName } from '@/utils/utils.ts'
import type { VideoInfo } from '@/types/api'
import { useRecommendStore } from '@/stores/recommendStore'
import { DEFAULT_AVATAR, DEFAULT_INVALID_COVER } from '@/utils/constants'

const recommendStore = useRecommendStore()
// 控制"更多"弹窗显隐；弹窗打开（含鼠标在弹窗上）时三个点保持可见。
// 注意：v-for 写在组件内部，单个组件实例渲染多张卡片，必须用 index 区分，
// 否则 hover 一张卡片会让所有卡片的弹窗一起弹出。
const moreVisibleMap = reactive<Record<number, boolean>>({})

interface MoreMenuItem {
  key: string
  label: string
  danger?: boolean
  disabled?: boolean
  divider?: boolean
}

const props = withDefaults(
  defineProps<{
    data: VideoInfo[]
    loading?: boolean
    hideAuthor?: boolean
    hideTime?: boolean
    showMoreMenu?: boolean
    moreMenuItems?: MoreMenuItem[]
    showCollectTime?: boolean
    selectable?: boolean
    selected?: number[]
  }>(),
  {
    loading: false,
    hideAuthor: false,
    hideTime: false,
    showMoreMenu: false,
    showCollectTime: false,
    selectable: false,
    selected: () => [],
    moreMenuItems: () => [
      { key: 'notInterested', label: '内容不感兴趣' },
      { key: 'blockAuthor', label: '不想看此UP主' },
    ],
  },
)

const emit = defineEmits<{
  (e: 'card-click', videoInfo: VideoInfo, index: number): void
  (e: 'more-select', key: string, videoInfo: VideoInfo, index: number): void
  (e: 'toggle-select', vid: number): void
}>()

// 视频是否已失效（status 2 未通过 / 3 已删除）
const isInvalid = (videoInfo: VideoInfo): boolean =>
  videoInfo.video?.status === 2 || videoInfo.video?.status === 3

// 卡片时间文案：收藏模式且存在收藏时间时显示“收藏于…”，否则显示发布时间
const displayTimeText = (videoInfo: VideoInfo): string => {
  if (props.showCollectTime && videoInfo.collectTime) {
    return `收藏于${formatCollectTime(videoInfo.collectTime)}`
  }
  return formatTime(videoInfo.video.createTime)
}

const isSelected = (vid: number): boolean => props.selected.includes(vid)

const handleCardClick = (e: MouseEvent, videoInfo: VideoInfo, index: number) => {
  // 多选模式：点击切换选中，不跳转
  if (props.selectable) {
    e.preventDefault()
    emit('toggle-select', videoInfo.video.vid)
    return
  }
  // 失效视频无对应详情页，阻止跳转
  if (isInvalid(videoInfo)) {
    e.preventDefault()
    return
  }
  emit('card-click', videoInfo, index)
}

const handleMoreMenuSelect = async (key: string, videoInfo: VideoInfo, index: number) => {
  if (key === 'notInterested') {
    await recommendStore.notInterested(videoInfo.video.vid)
  } else if (key === 'blockAuthor') {
    await recommendStore.blockAuthor(videoInfo.video.uid)
  }
  emit('more-select', key, videoInfo, index)
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

  &__select {
    position: absolute;
    top: 8px;
    left: 8px;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 1.5px solid rgba(255, 255, 255, 0.9);
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 14px;
    z-index: 2;
    transition: background 0.15s, border-color 0.15s;

    &.is-checked {
      background: #ff6699;
      border-color: #ff6699;
    }
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
    height: 54px;
    line-height: 22px;
    display: flex;
    align-items: flex-start;
    gap: 4px;
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
    flex: 1;
    min-width: 0;

    &:hover {
      color: #ff6699 !important;
      // hover 标题时显示更多按钮
      + .el-popover__reference-wrapper,
      ~ .el-popover__reference-wrapper {
        .video-card__more-btn {
          opacity: 1;
        }
      }
    }
  }

  // 更多操作按钮（三个竖点）
  &__more-btn {
    flex-shrink: 0;
    opacity: 0;
    margin-top: 7px;
    padding: 4px;
    border: none;
    background: transparent;
    color: @text-3;
    cursor: pointer;
    border-radius: 4px;
    transition: opacity 0.2s, color 0.2s, background-color 0.2s;
    line-height: 1;

    &:hover {
      color: @text-1;
      background-color: rgba(0, 0, 0, 0.06);
    }
  }

  // hover 整个卡片标题区域时也显示按钮
  &__title:hover &__more-btn {
    opacity: 1;
  }

  // 弹窗打开时（含鼠标在弹窗上）保持三个点可见
  &__more-btn.is-active {
    opacity: 1;
  }

  &__author {
    font-size: 13px;
    color: @text-3;
    transition: color 0.2s linear;
    min-width: 0;
    overflow: hidden;

    &:hover {
      color: #ff6699 !important;
    }
  }

  &__meta {
    display: flex;
    align-items: center;
    min-width: 0;
    overflow: hidden;
  }

  &__avatar {
    flex-shrink: 0;
  }

  &__username {
    flex-shrink: 0;
  }

  &__dot {
    margin: 0 4px;
    color: @text-3;
    flex-shrink: 0;
  }

  &__time {
    font-size: 13px;
    color: @text-3;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

/* 多选选中态：封面描边高亮 */
.video-card-container.is-selected {
  .video-card__cover {
    box-shadow: 0 0 0 2px #ff6699;
  }
}

/* 失效视频标题置灰、不可点击 */
.video-card__title-link.is-invalid {
  color: #999;
  cursor: default;

  &:hover {
    color: #999 !important;
  }
}
</style>

<!-- 弹窗菜单样式：el-popover 渲染到 body，不能用 scoped -->
<style lang="less">
.video-card__more-popover {
  padding: 6px 0 !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12) !important;

  .video-card__more-menu {
    .video-card__more-divider {
      height: 1px;
      background-color: #ebecef;
      margin: 4px 0;
    }

    .video-card__more-item {
      padding: 10px 14px;
      font-size: 14px;
      color: @text-1;
      cursor: pointer;
      transition: background-color 0.15s;

      &:hover {
        background-color: #f5f6f7;
        color: #ff6699;
      }

      &:active {
        background-color: #e8e9eb;
      }

      &.is-danger {
        color: #f53f3f;

        &:hover {
          background-color: #ffece8;
          color: #f53f3f;
        }
      }

      &.is-disabled {
        color: #c9cdd4;
        cursor: not-allowed;
        pointer-events: none;
      }
    }
  }
}
</style>
