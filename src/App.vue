<template>
  <router-view></router-view>
  <BackToTop />
</template>

<script setup lang="ts">
import { onMounted, onBeforeMount } from 'vue'
import { useUserStore } from '@/stores/userStore.ts'
import BackToTop from '@/components/back-to-top/BackToTop.vue'

const userStore = useUserStore()

onBeforeMount(() => {
  userStore.setLoginState() // 同步的本地状态检查
})

onMounted(async () => {
  if (userStore.isLogin) {
    await userStore.getUserInfo()
  }
  // 检查是否是退出登录后跳转，需要显示登录框
  const showLogin = localStorage.getItem('showLoginAfterLogout')
  if (showLogin === 'true') {
    localStorage.removeItem('showLoginAfterLogout')
    userStore.showLoginWindow = true
  }
})
</script>

<style>
@import 'https://at.alicdn.com/t/c/font_4827454_3pmca177kzu.css';
:root {
  --text-color: #fff;
  --header-shadow: none;
  --bg-color: transparent;
  --position: fixed;
  --search-display: block;
}
</style>
