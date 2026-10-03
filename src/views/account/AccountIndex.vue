<template>
  <header style="min-height: 64px" class="hiri-header__bar">
    <HeaderBar />
  </header>
  <main class="account-container">
    <aside class="account-aside">
      <!-- 用户卡片 -->
      <div class="aside-user-card">
        <img class="aside-avatar" :src="userStore.user.avatar || DEFAULT_AVATAR" alt="" />
        <div class="aside-nickname">{{ getUserDisplayName(userStore.user) }}</div>
        <div class="aside-uid">UID: {{ userStore.user.uid }}</div>
      </div>
      <!-- 左侧 tab -->
      <el-menu :default-active="$route.path" class="aside-menu" :collapse="false" :router="true">
        <el-menu-item index="/account/home">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/account/setting">
          <el-icon><User /></el-icon>
          <span>我的信息</span>
        </el-menu-item>
        <el-menu-item index="/account/avatar">
          <el-icon><PictureFilled /></el-icon>
          <span>我的头像</span>
        </el-menu-item>
        <el-menu-item index="/account/blacklist">
          <el-icon><CircleClose /></el-icon>
          <span>黑名单管理</span>
        </el-menu-item>
        <el-menu-item index="/account/coin">
          <el-icon><Coin /></el-icon>
          <span>我的硬币</span>
        </el-menu-item>
        <el-menu-item index="/account/record">
          <el-icon><Clock /></el-icon>
          <span>我的记录</span>
        </el-menu-item>
      </el-menu>
      <!-- 底部跳转 -->
      <div class="aside-footer">
        <a
          v-if="userStore.user.uid"
          :href="`/space/${userStore.user.uid}`"
          target="_blank"
          class="aside-footer-link"
        >
          <el-icon><Position /></el-icon>
          <span>个人空间</span>
        </a>
        <a href="/platform/home" target="_blank" class="aside-footer-link">
          <el-icon><Edit /></el-icon>
          <span>创作中心</span>
        </a>
      </div>
    </aside>
    <section class="account-main">
      <router-view></router-view>
    </section>
  </main>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import {
  HomeFilled,
  User,
  PictureFilled,
  CircleClose,
  Coin,
  Clock,
  Position,
  Edit,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/userStore.ts'
import { DEFAULT_AVATAR } from '@/utils/constants'
import { getUserDisplayName } from '@/utils/utils.ts'

const userStore = useUserStore()

onMounted(() => {
  document.body.style.backgroundColor = '#f4f5f7'
  // 直开 /account 时（未走全局 getUserInfo）兜底拉取当前用户信息
  if (!userStore.user?.uid) {
    userStore.getUserInfo()
  }
})
</script>

<style scoped lang="less">
.account-container {
  display: flex;
  align-items: flex-start;
  width: 1170px;
  margin: 0 auto;
  padding-top: 20px;
}

.account-aside {
  position: sticky;
  top: 84px;
  flex-shrink: 0;
  width: 200px;
  background: #fff;
  border-radius: 8px;
  padding: 20px 0 8px;

  .aside-user-card {
    padding: 0 20px 16px;
    text-align: center;

    .aside-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      object-fit: cover;
    }

    .aside-nickname {
      margin-top: 8px;
      font-size: 15px;
      font-weight: 600;
      color: @text-1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .aside-uid {
      margin-top: 2px;
      font-size: 12px;
      color: #9499a0;
    }
  }

  .aside-menu {
    border-right: none;

    :deep(.el-menu-item) {
      height: 44px;
      line-height: 44px;

      span {
        margin-left: 8px;
      }
    }
  }

  .aside-footer {
    border-top: 1px solid @border-color;
    margin-top: 8px;
    padding-top: 8px;

    .aside-footer-link {
      display: flex;
      align-items: center;
      height: 40px;
      padding-left: 20px;
      font-size: 14px;
      color: #61666d;
      border-radius: 6px;
      transition: background-color 0.3s;

      .el-icon {
        margin-right: 8px;
      }

      &:hover {
        background-color: #f6f7f8;
        color: @blue;
      }
    }
  }
}

.account-main {
  flex: 1;
  min-width: 0;
  margin-left: 20px;
}
</style>
