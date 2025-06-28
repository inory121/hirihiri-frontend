<template>
  <router-view></router-view>
</template>

<script setup lang="ts">
import { onMounted, onBeforeMount } from 'vue'
import { useUserStore } from '@/stores/userStore.ts'

const userStore = useUserStore()

onBeforeMount(() => {
  userStore.setLoginState() // 同步的本地状态检查
})

onMounted(async () => {
  if (userStore.isLogin) {
    await userStore.getUserInfo()
  }
})
</script>

<style>
@import 'https://at.alicdn.com/t/c/font_4827454_eeiw191dyt.css';
:root {
  --text-color: #fff;
  --header-shadow: none;
  --bg-color: transparent;
  --position: fixed;
  --search-display: block;
}
</style>
