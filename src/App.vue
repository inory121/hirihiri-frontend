<template>
  <router-view></router-view>
</template>

<script setup lang="ts">
import { onMounted, onBeforeMount } from 'vue'
import { useUserStore } from '@/stores/userStore.ts'
import { useCategoryStore } from '@/stores/categoryStore.ts'
import { useVideoStore } from '@/stores/videoStore.ts'

const userStore = useUserStore()
const categoryStore = useCategoryStore()
const videoStore = useVideoStore()
onBeforeMount(() => {
  userStore.setLoginState() // 同步的本地状态检查
})

onMounted(async () => {
  await categoryStore.getCategory()
  await videoStore
    .getRecommendVideo()
    .then(() => {
      videoStore.loading = false
    })
    .catch(() => {
      videoStore.loading = true
    })
  if (userStore.isLogin) {
    await userStore.getUserInfo() // 异步获取远程数据
  }
})
</script>

<style></style>
