<template>
  <div class="header">
    <div class="left-block">
      <span class="hiri-logo">HiriHiri创作中心</span>
      <router-link to="/" target="_blank" class="main-site">
        <el-icon class="hiri-icon">
          <SwitchFilled />
        </el-icon>
        主站
      </router-link>
    </div>
    <div class="right-block">
      <MyPopover class="avatar-popover-login">
        <template #content>
          <div class="avatar-popover-container">
            <a href="#" class="popover-link-item">
              <div class="link-title">
                <span>个人中心</span>
              </div>
            </a>
            <a href="#" class="popover-link-item">
              <div class="link-title">
                <span>投稿管理</span>
              </div>
            </a>
            <a href="#" class="popover-link-item">
              <div class="link-title">
                <span>H币钱包</span>
              </div>
            </a>
            <a href="#" class="popover-link-item">
              <div class="link-title">
                <span>订单中心</span>
              </div>
            </a>
            <a href="#" class="popover-link-item">
              <div class="link-title">
                <span>直播中心</span>
              </div>
            </a>
            <el-divider style="margin: 5px 0 0 0" />
            <a href="#" class="popover-link-item popover-logout-item">
              <div @click="userStore.logout()">
                <span>退出登录</span>
              </div>
            </a>
          </div>
        </template>
        <template #reference>
          <!--头像-->
          <a href="#" class="avatar-img">
            <img
              class="hiri-avatar-img"
              src="https://i0.hdslb.com/bfs/baselabs/05b340832a490209f185542bb9690fc748bc08f7.png@56w_56h.png"
              alt=""
            />
          </a>
        </template>
      </MyPopover>
      <div class="tips">成为UP主的第3126天</div>
      <el-divider direction="vertical" />
      <a href="#">
        <svg class="icon right-icon" aria-hidden="true">
          <use xlink:href="#icon-xiaoxi"></use>
        </svg>
      </a>
    </div>
  </div>

  <el-container style="height: 100%">
    <el-aside width="200">
      <el-menu
        default-active="0"
        class="el-menu-vertical-demo"
        :collapse="false"
        @open="handleOpen"
        @close="handleClose"
      >
        <div class="nav-upload-btn">
          <router-link to="/platform/upload">
            <el-button
              type="primary"
              color="#00a1d6"
              class="upload-btn"
              style="width: 136px; height: 45px; font-size: 16px"
            >
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-upload"></use>
              </svg>
              <span class="upload-text">投稿</span>
            </el-button>
          </router-link>
        </div>
        <el-menu-item index="0">
          <template #title>
            <el-icon>
              <House />
            </el-icon>
            <span>首页</span>
          </template>
        </el-menu-item>

        <el-sub-menu index="1">
          <template #title>
            <el-icon>
              <Document />
            </el-icon>
            <span>内容管理</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="1-1">稿件管理</el-menu-item>
            <el-menu-item index="1-2">申诉管理</el-menu-item>
            <el-menu-item index="1-3">字幕管理</el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>
        <el-menu-item index="2">
          <template #title>
            <el-icon>
              <DataAnalysis />
            </el-icon>
            <span>数据中心</span>
          </template>
        </el-menu-item>
        <el-menu-item index="3">
          <template #title>
            <el-icon>
              <User />
            </el-icon>
            <span>粉丝管理</span>
          </template>
        </el-menu-item>
        <el-sub-menu index="4">
          <template #title>
            <el-icon>
              <ChatDotRound />
            </el-icon>
            <span>互动管理</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="4-1">评论管理</el-menu-item>
            <el-menu-item index="4-2">弹幕管理</el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    <el-main class="main-content">
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script lang="ts" setup>
import MyPopover from '@/components/MyPopover/MyPopover.vue'
import { useUserStore } from '@/stores/userStore.ts'

const userStore = useUserStore()
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>

<style>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;

  .nav-upload-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 32px 17px 32px;

    .upload-text {
      margin-left: 8px;
    }
  }
}

.header {
  display: flex;
  justify-content: space-between;
  padding: 0 100px 0 32px;
  height: 60px;
  box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.05);

  .left-block {
    display: flex;
    align-items: center;

    .hiri-logo {
      font-size: 22px;
      color: #00aeec;
    }

    .main-site {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: #757575;
      margin-left: 32px;

      .hiri-icon {
        font-size: 18px;
        margin-right: 4px;
      }
    }
  }

  .right-block {
    display: flex;
    align-items: center;

    .avatar-popover-login {
      display: flex;
      align-items: center;

      .avatar-popover-container {
        margin-top: 10px;
        width: 144px;

        .popover-link-item {
          display: flex;
          align-items: center;
          height: 38px;
          border-radius: 6px;
          color: #61666d;
          font-size: 14px;
          transition: background-color 0.3s;
          padding-left: 15px;

          &:hover {
            background-color: #e3e5e7;
          }
        }

        .popover-logout-item {
          padding-bottom: 5px;
        }
      }

      .avatar-img {
        display: block;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
        }
      }
    }

    .tips {
      background: rgba(250, 142, 87, 0.1);
      border-radius: 14px;
      border: 1px solid #fa8e57;
      color: #fa8e57;
      font-size: 12px;
      padding: 5px 12px 5px 16px;
      margin-right: 32px;
      margin-left: 12px;
    }
  }
}
.main-content{
  background: #f6f7f8;
}
</style>
