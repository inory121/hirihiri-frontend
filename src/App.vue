<template>
  <router-view></router-view>
  <BackToTop />
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { useUserStore } from '@/stores/userStore.ts'
import { useMessageStore } from '@/stores/messageStore.ts'
import BackToTop from '@/components/back-to-top/BackToTop.vue'

const userStore = useUserStore()
const messageStore = useMessageStore()
// 必须在 watch 建立前同步读取登录态，否则 watch 会把首屏的 isLogin 变化
// 误判为“登录事件”，导致 startLoggedInInit 重复触发、请求发两遍。
userStore.setLoginState()
let unreadRefreshTimer: ReturnType<typeof setInterval> | null = null

// 登录态相关初始化：拉未读数、会话列表，建立 WebSocket，并开启兜底轮询。
// 未登录 -> 登录 时必须重新触发，否则头部红点和实时消息要刷新页面才出现。
function startLoggedInInit() {
  Promise.all([
    userStore.getUserInfo(),
    messageStore.fetchUnreadSummary(),
    messageStore.fetchSessions(),
  ])
  messageStore.connectWebSocket()
  if (!unreadRefreshTimer) {
    // WebSocket 是主通道，UNREAD_UPDATED 已实时驱动头部红点；
    // 仅在 WS 断开时才低频兜底，避免连接正常时还每几秒打一次 unread 请求。
    unreadRefreshTimer = setInterval(() => {
      if (!messageStore.wsConnected) {
        messageStore.fetchUnreadSummary()
      }
    }, 10000)
  }
}

function stopLoggedInInit() {
  if (unreadRefreshTimer) {
    clearInterval(unreadRefreshTimer)
    unreadRefreshTimer = null
  }
  messageStore.disconnectWebSocket()
}

onMounted(async () => {
  if (userStore.isLogin) {
    startLoggedInInit()
  }
  // 检查是否是退出登录后跳转，需要显示登录框
  const showLogin = localStorage.getItem('showLoginAfterLogout')
  if (showLogin === 'true') {
    localStorage.removeItem('showLoginAfterLogout')
    userStore.showLoginWindow = true
  }
})

// 关键修复：登录态切换（如从未登录点开登录框登录）时同步未读初始化与 WebSocket。
watch(
  () => userStore.isLogin,
  (loggedIn) => {
    if (loggedIn) startLoggedInInit()
    else stopLoggedInInit()
  },
)

onBeforeUnmount(() => {
  stopLoggedInInit()
})
</script>

<style>
@import 'https://at.alicdn.com/t/c/font_4827454_3pmca177kzu.css';
:root {
  --text-color: #18191c;
  --header-shadow: 0 2px 4px #00000014;
  --bg-color: #fff;
  --position: fixed;
  --search-display: block;
}
</style>
