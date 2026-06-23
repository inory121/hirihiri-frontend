<template>
  <Transition name="back-to-top-fade">
    <div v-if="visible" class="back-to-top" @click="scrollToTop" title="回到顶部">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 4L4 12H9V20H15V12H20L12 4Z"
          fill="currentColor"
        />
      </svg>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const visible = ref(false)
const threshold = 300 // 滚动超过 300px 时显示

const handleScroll = () => {
  visible.value = window.scrollY > threshold
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll() // 初始化检查
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped lang="less">
.back-to-top {
  position: fixed;
  right: 32px;
  bottom: 60px;
  z-index: 999;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #9499a0;
  transition: all 0.25s ease;

  &:hover {
    color: #00a1d6;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
}

.back-to-top-fade-enter-active,
.back-to-top-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.back-to-top-fade-enter-from,
.back-to-top-fade-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
