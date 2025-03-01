<template>
  <div
    class="player-progress-area"
    @mousedown="handleDragStart"
    @touchstart.passive="handleDragStart"
  >
    <div class="player-progress-wrap" @mouseenter="isActive = true" @mouseleave="isActive = false">
      <div class="player-progress" :class="{ 'state-active': isActive }">
        <div class="player-progress-schedule-wrap">
          <div class="player-progress-schedule">
            <div class="player-progress-schedule-buffer" :style="bufferStyle"></div>
            <div class="player-progress-schedule-current" :style="currentStyle"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  bufferPer: { type: Number, default: 0.00001 },
  currentPer: { type: Number, default: 0.00001 },
  activing: { type: Boolean, default: false },
})

const emit = defineEmits(['changeCurrent'])

const isActive = ref(false)
const isDragging = ref(false)
const progressRef = ref(null)

// 计算样式
const bufferStyle = computed(() => ({ transform: `scaleX(${props.bufferPer})` }))
const currentStyle = computed(() => ({ transform: `scaleX(${props.currentPer})` }))

// 统一处理拖动逻辑
const handleDrag = (clientX) => {
  if (!progressRef.value || !isDragging.value) return

  const rect = progressRef.value.getBoundingClientRect()
  let currPer = (clientX - rect.left) / rect.width
  currPer = Math.max(0.00001, Math.min(0.99999, currPer))
  emit('changeCurrent', currPer)
}

// 事件处理
const handleDragStart = (e) => {
  isDragging.value = true
  isActive.value = true
  handleDrag(e.clientX ?? e.touches[0].clientX)
}

// 全局事件监听
const setupListeners = () => {
  const moveHandler = (e) => handleDrag(e.clientX ?? e.touches[0]?.clientX)
  const endHandler = () => {
    isDragging.value = false
    isActive.value = false
  }

  document.addEventListener('mousemove', moveHandler)
  document.addEventListener('touchmove', moveHandler, { passive: false })
  document.addEventListener('mouseup', endHandler)
  document.addEventListener('touchend', endHandler)

  return () => {
    document.removeEventListener('mousemove', moveHandler)
    document.removeEventListener('touchmove', moveHandler)
    document.removeEventListener('mouseup', endHandler)
    document.removeEventListener('touchend', endHandler)
  }
}

// 生命周期
onMounted(() => {
  const cleanup = setupListeners()
  onUnmounted(cleanup)
})
</script>

<style scoped>
.player-progress-area {
  position: relative;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.player-progress-wrap {
  -webkit-box-align: end;
  -ms-flex-align: end;
  align-items: flex-end;
  cursor: pointer;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  height: 16px;
  padding-bottom: 6px;
}

.player-progress {
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  height: 2px;
  position: relative;
  width: 100%;
}

.state-active {
  height: 4px;
}

.player-progress-schedule-wrap {
  position: absolute;
  height: 100%;
  width: 100%;
}

.player-progress-schedule {
  background-color: hsla(0, 0%, 100%, 0.2);
  border-radius: 1.5px;
  bottom: 0;
  left: 0;
  overflow: hidden;
  position: absolute;
  right: 0;
  top: 0;
}

.player-progress-schedule-buffer {
  background-color: hsla(0, 0%, 100%, 0.3);
}

.player-progress-schedule-buffer,
.player-progress-schedule-current {
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  -webkit-transform: scaleX(0);
  transform: scaleX(0);
  -webkit-transform-origin: 0 0;
  transform-origin: 0 0;
}
</style>
