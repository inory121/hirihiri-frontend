<template>
  <!-- 头部 -->
  <div class="hiri-header">
    <div class="hiri-header__bar">
      <!-- 头部左边 -->
      <ul class="left-entry">
        <li>
          <a href="#" class="entry-title">
            <el-icon class="left-icon">
              <SwitchFilled />
            </el-icon>
            <span>首页</span>
          </a>
        </li>
        <li>
          <a href="#" class="left-default-entry"><span>番剧</span></a>
        </li>
        <li>
          <a href="#" class="left-default-entry"><span>直播</span></a>
        </li>
        <li>
          <a href="#" class="left-default-entry"><span>游戏中心</span></a>
        </li>
        <li>
          <a href="#" class="left-default-entry"><span>会员购</span></a>
        </li>
        <li>
          <a href="#" class="left-default-entry"><span>漫画</span></a>
        </li>
        <li>
          <a href="#" class="left-default-entry"><span>赛事</span></a>
        </li>
        <li>
          <a href="#" class="entry-title">
            <el-icon class="left-icon">
              <Download />
            </el-icon>
            <span>下载客户端</span></a>
        </li>
      </ul>
      <!-- 头部中间搜索框 -->
      <div class="center-search-container">
        <div>
          <form action="#" class="nav-searchform">
            <el-input v-model="input" placeholder="请输入内容" :prefix-icon="Search" />
          </form>
        </div>
      </div>
      <!-- 头部右边 -->
      <ul class="right-entry">
        <li>
          <div>
            <a href="#" class="header-entry-mini">
              <img src="https://i0.hdslb.com/bfs/baselabs/05b340832a490209f185542bb9690fc748bc08f7.png@38w_38h_1c"
                alt="" />
            </a>
          </div>
        </li>
        <li>
          <a href="#" class="right-default-entry v-popover-wrap">
            <el-icon class="right-icon">
              <Apple />
            </el-icon>
            <span class="right-entry-text">大会员</span></a>
        </li>
        <li>
          <a href="#" class="right-default-entry v-popover-wrap">
            <el-icon class="right-icon">
              <Message />
            </el-icon>
            <span class="right-entry-text">消息</span></a>
        </li>
        <li>
          <a href="#" class="right-default-entry v-popover-wrap">
            <el-icon class="right-icon">
              <Promotion />
            </el-icon>
            <span class="right-entry-text">动态</span></a>
        </li>
        <li>
          <a href="#" class="right-default-entry v-popover-wrap">
            <el-icon class="right-icon">
              <Star />
            </el-icon>
            <span class="right-entry-text">收藏</span></a>
        </li>
        <li>
          <a href="#" class="right-default-entry v-popover-wrap">
            <el-icon class="right-icon">
              <Clock />
            </el-icon>
            <span class="right-entry-text">历史</span></a>
        </li>
        <li>
          <a href="#" class="right-default-entry v-popover-wrap">
            <el-icon class="right-icon">
              <Cpu />
            </el-icon>
            <span class="right-entry-text">创作中心</span></a>
        </li>
        <li>
          <a href="#" class="right-default-entry v-popover-wrap">
            <el-button type="primary" color="#fb7299"><el-icon class="el-icon--right" size="18px">
                <Upload />
              </el-icon><span class="right-entry-text">投稿</span></el-button>
          </a>
        </li>
      </ul>
    </div>
    <!-- 头部banner -->
    <div class="hiri-header__banner"></div>

  </div>
</template>

<script lang="ts" setup>
import { Search } from '@element-plus/icons-vue'
import { ref } from 'vue'
const input = ref('')
</script>

<style lang="less" scoped>
// 头部
.hiri-header {

  .hiri-header__bar {
    position: absolute;
    top: 0;
    display: flex;
    align-items: center;
    height: 64px;
    width: 100%;
    padding: 0 24px;

    // 左边
    .left-entry {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      margin-right: 30px;

      .entry-title {
        .left-icon {
          font-size: 20px;
          margin-right: 6px;
        }
      }

      .entry-title,
      .left-default-entry {
        display: flex;
        align-items: center;
        color: #fff;
        height: 64px;
        line-height: 64px;
        margin-right: 10px;
        font-size: 14px;
      }

      .left-default-entry:hover {
        animation: jump .3s;
      }
    }

    // 搜索框
    .center-search-container {
      flex: 1 auto;
      height: 40px;

      .nav-searchform {
        display: flex;

        .el-input--prefix {
          justify-content: center;

          :deep(.el-input__wrapper) {
            border-radius: 8px;
            height: 40px;
            min-width: 268px;
            max-width: 500px;

            .el-input__inner:focus {
              background-color: #e3e5e7;
              border-radius: 8px;
              padding: 8px;
            }
          }
        }
      }
    }

    // 右边
    .right-entry {
      display: flex;
      flex-shrink: 1;
      align-items: center;
      margin-left: 30px;

      .el-icon--right{
        margin: 0;
      }

      .header-entry-mini {
        img {
          display: block;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          margin-right: 10px;
        }
      }

      .right-default-entry {
        color: #fff;
        height: 64px;
        margin-right: 15px;
        font-size: 14px;
      }

      .v-popover-wrap {
        display: flex;
        flex-direction: column;
        line-height: normal;
        align-items: center;
        justify-content: center;

        .el-button--primary {
          color: #fff;
          border-radius: 8px;
        }
      }

      .v-popover-wrap:hover .right-icon {
        animation: jump .3s;
      }

      .right-icon {
        font-size: 20px;
      }
    }
  }

}

// banner
.hiri-header__banner {
  min-height: 155px;
  height: 9.375vw;
  background: url('@/assets/img/banner.png');
  background-size: cover;
}

@keyframes jump {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-5px);
    /* 跳跃的高度可以根据需要调整 */
  }
}

@media (max-width: 1099.9px) {

  .hiri-header .left-entry,
  .left-default-entry,
  .entry-title {
    margin-right: 10px !important;
  }
}

@media (min-width: 1100px) and (max-width: 1366.9px) {

  .hiri-header .left-entry,
  .left-default-entry,
  .entry-title {
    margin-right: 10px !important;
  }
}

@media (min-width: 1367px) and (max-width: 1700.9px) {

  .left-default-entry,
  .entry-title {
    margin-right: 15px !important;
  }
}

@media (min-width: 1701px) and (max-width: 2199.9px) {

  .left-default-entry,
  .entry-title {
    margin-right: 20px !important;
  }
}

@media (min-width: 2200px) {

  .left-default-entry,
  .entry-title {
    margin-right: 20px !important;
  }
}

@media (max-width: 1279.9px) {
  .right-entry-text {
    display: none;
  }
}
</style>
