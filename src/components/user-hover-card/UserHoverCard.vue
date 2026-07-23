<template>
  <div ref="wrapperRef" class="user-hover-card-wrapper" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <div class="user-hover-card-reference">
      <slot></slot>
    </div>
    <Transition name="hover-card">
      <div v-show="visible" class="user-hover-card" :class="`placement-${computedPlacement}`" :style="cardStyle">
        <div class="user-hover-card__inner">
          <div class="user-hover-card__bg">
            <img :src="user.background || 'https://hirihiri.oss-cn-nanjing.aliyuncs.com/background.png'" alt="" class="user-hover-card__bg-img" />
          </div>
          <div class="user-hover-card__body">
            <div class="user-hover-card__avatar-col">
              <router-link :to="`/space/${user.uid}`">
                <img :src="user.avatar" alt="" class="user-hover-card__avatar" />
              </router-link>
            </div>
            <div class="user-hover-card__content-col">
              <div class="user-hover-card__name-row">
                <router-link :to="`/space/${user.uid}`" class="user-hover-card__name">{{ user.username }}</router-link>
                <span v-if="user.sex === 1" class="user-hover-card__sex male">♂</span>
                <span v-else-if="user.sex === 2" class="user-hover-card__sex female">♀</span>
                <img
                  class="user-hover-card__level-icon"
                  :src="getLevelIconUrl(getLevelByExp(user.exp))"
                  :alt="`Lv${getLevelByExp(user.exp)}`"
                />
              </div>
              <div class="user-hover-card__stats">
                <router-link :to="`/space/${user.uid}/following`" class="stat-item">
                  <span class="stat-num">{{ formatNumber(user.videoCount ?? 0) }}</span>
                  <span class="stat-label">关注</span>
                </router-link>
                <span class="stat-divider"> </span>
                <router-link :to="`/space/${user.uid}/fans`" class="stat-item">
                  <span class="stat-num">{{ formatNumber(user.fanCount ?? 0) }}</span>
                  <span class="stat-label">粉丝</span>
                </router-link>
                <span class="stat-divider"> </span>
                <span class="stat-item">
                  <span class="stat-num">{{ formatNumber(likeCount ?? 0) }}</span>
                  <span class="stat-label">获赞</span>
                </span>
              </div>

              <div v-if="user.authMsg" class="user-hover-card__auth">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="#fb7299">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                <span class="auth-text">{{ user.authMsg }}</span>
              </div>

              <div v-if="user.description" class="user-hover-card__desc">
                {{ user.description }}
              </div>

              <div class="user-hover-card__actions">
                <el-button type="primary" size="default" @click="handleFollow">
                  {{ isFollowing ? '已关注' : '+ 关注' }}
                </el-button>
                <router-link :to="`/space/${user.uid}`">
                  <el-button size="default" :icon="ChatDotRound">发消息</el-button>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChatDotRound } from '@element-plus/icons-vue'
import type { User } from '@/types/api'
import { getLevelByExp, getLevelIconUrl } from '@/utils/utils.ts'

interface Props {
  user: User
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'right-top' | 'right-bottom'
  offsetX?: number
  offsetY?: number
  likeCount?: number
  isFollowing?: boolean
  autoAdjust?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'bottom',
  offsetX: 0,
  offsetY: 8,
  likeCount: 0,
  isFollowing: false,
  autoAdjust: false,
})

const emit = defineEmits(['follow'])

const visible = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)
const adjustedPlacement = ref<string>('')
let enterTimer: ReturnType<typeof setTimeout> | undefined
let leaveTimer: ReturnType<typeof setTimeout> | undefined

const computedPlacement = computed(() => {
  return adjustedPlacement.value || props.placement
})

const cardStyle = computed(() => {
  const p = computedPlacement.value
  const style: Record<string, string> = {}
  if (props.offsetX) {
    if (p === 'left' || p === 'left-top' || p === 'left-bottom') {
      style.marginRight = `${props.offsetX}px`
    } else if (p === 'right' || p === 'right-top' || p === 'right-bottom') {
      style.marginLeft = `${props.offsetX}px`
    }
  }
  if (props.offsetY) {
    if (p.startsWith('top')) {
      style.marginBottom = `${props.offsetY}px`
    } else if (p.startsWith('bottom')) {
      style.marginTop = `${props.offsetY}px`
    } else if (p === 'right-top') {
      style.marginBottom = `${props.offsetY}px`
    } else if (p === 'right-bottom') {
      style.marginTop = `${props.offsetY}px`
    }
  }
  return style
})

const CARD_MIN_HEIGHT = 240

const checkSpace = () => {
  if (!props.autoAdjust || !wrapperRef.value) return
  const rect = wrapperRef.value.getBoundingClientRect()
  const topSpace = rect.top
  const needTop = props.placement.startsWith('top') || props.placement === 'right-top'
  if (needTop && topSpace < CARD_MIN_HEIGHT + props.offsetY) {
    // 上方空间不足，翻转为 bottom 版本
    if (props.placement === 'top') adjustedPlacement.value = 'bottom'
    else if (props.placement === 'top-left') adjustedPlacement.value = 'bottom-left'
    else if (props.placement === 'top-right') adjustedPlacement.value = 'bottom-right'
    else if (props.placement === 'right-top') adjustedPlacement.value = 'right-bottom'
    else adjustedPlacement.value = 'bottom'
  } else {
    adjustedPlacement.value = ''
  }
}

const formatNumber = (num: number): string => {
  if (num >= 100000000) {
    return (num / 100000000).toFixed(1) + '亿'
  }
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return String(num)
}

const handleMouseEnter = () => {
  clearTimeout(leaveTimer)
  checkSpace()
  enterTimer = setTimeout(() => {
    visible.value = true
  }, 150)
}

const handleMouseLeave = () => {
  clearTimeout(enterTimer)
  leaveTimer = setTimeout(() => {
    visible.value = false
  }, 200)
}

const handleFollow = () => {
  emit('follow', props.user.uid)
}
</script>

<style scoped lang="less">
.user-hover-card-wrapper {
  position: relative;
  display: inline-block;
}

.user-hover-card {
  position: absolute;
  z-index: 1000;
  width: 360px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #e3e5e7;

  &.placement-bottom {
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
  }

  &.placement-bottom-left {
    top: 100%;
    left: 0;
  }

  &.placement-bottom-right {
    top: 100%;
    right: 0;
  }

  &.placement-top {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
  }

  &.placement-top-left {
    bottom: 100%;
    left: 0;
  }

  &.placement-top-right {
    bottom: 100%;
    right: 0;
  }

  &.placement-left {
    top: 50%;
    right: 100%;
    transform: translateY(-50%);
  }

  &.placement-right {
    top: 50%;
    left: 100%;
    transform: translateY(-50%);
  }

  &.placement-right-top {
    bottom: 100%;
    left: 100%;
  }

  &.placement-right-bottom {
    top: 100%;
    left: 100%;
  }

  &__inner {
    padding: 0;
    position: relative;
  }

  &__bg {
    height: 100px;
    overflow: hidden;
    border-radius: 8px 8px 0 0;

    &-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  &__body {
    display: flex;
    gap: 12px;
    padding: 16px 20px 20px;
  }

  &__avatar-col {
    flex-shrink: 0;
  }

  &__content-col {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  &__avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    object-fit: cover;
  }

  &__name-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 10px;
  }

  &__name {
    font-size: 18px;
    font-weight: 600;
    color: #18191c;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-decoration: none;
  }

  &__sex {
    font-size: 14px;
    font-weight: 600;

    &.male {
      color: #00aeec;
    }

    &.female {
      color: #fb7299;
    }
  }

  &__level-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }

  &__stats {
    display: flex;
    align-items: center;
    color: #9499a0;
    font-size: 13px;
    margin-bottom: 14px;
  }

  .stat-item {
    display: flex;
    align-items: baseline;
    gap: 4px;
    text-decoration: none;
    color: inherit;
  }

  .stat-num {
    font-size: 14px;
    font-weight: 600;
    color: #18191c;
  }

  .stat-label {
    font-size: 13px;
    color: #9499a0;
  }

  .stat-divider {
    width: 1px;
    height: 12px;
    background: #e3e5e7;
    margin: 0 12px;
  }

  &__auth {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: #fff1f0;
    border-radius: 4px;
    margin: 0 0 14px;
    font-size: 13px;
    color: #61666d;
    width: 100%;
    box-sizing: border-box;

    .auth-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__desc {
    font-size: 13px;
    color: #61666d;
    line-height: 1.5;
    margin-bottom: 16px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__actions {
    display: flex;
    gap: 12px;
  }
}

.hover-card-enter-active,
.hover-card-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.hover-card-enter-from,
.hover-card-leave-to {
  opacity: 0;

  .user-hover-card.placement-bottom,
  .user-hover-card.placement-bottom-left,
  .user-hover-card.placement-bottom-right {
    transform: translateX(var(--tw-translate-x, 0)) translateY(-6px);
  }

  .user-hover-card.placement-top,
  .user-hover-card.placement-top-left,
  .user-hover-card.placement-top-right {
    transform: translateX(var(--tw-translate-x, 0)) translateY(6px);
  }

  .user-hover-card.placement-left {
    transform: translateY(-50%) translateX(6px);
  }

  .user-hover-card.placement-right {
    transform: translateY(-50%) translateX(-6px);
  }

  .user-hover-card.placement-right-top {
    transform: translateX(-6px);
  }

  .user-hover-card.placement-right-bottom {
    transform: translateX(-6px);
  }
}
</style>
