<template>
  <div class="account-coin">
    <!-- 余额卡 -->
    <div class="coin-balance-card">
      <div class="balance-left">
        <span class="balance-label">当前硬币余额</span>
        <span class="balance-num">{{ userStore.user.coin ?? 0 }}</span>
      </div>
      <div class="balance-right">
        <p class="balance-tip">每日登录可获得硬币，硬币可用于给喜欢的视频投币</p>
        <el-button type="primary" plain @click="router.push('/')">去逛视频</el-button>
      </div>
    </div>

    <!-- 最近投币 -->
    <div class="page-card">
      <h2 class="page-title">最近投币的视频</h2>
      <div v-if="loading && list.length === 0" class="list-status">加载中...</div>
      <div v-else-if="list.length === 0" class="list-status">
        <el-empty description="还没有投过币的视频" />
      </div>
      <div v-else class="coin-video-list">
        <a
          v-for="item in list"
          :key="item.video.vid"
          :href="`/video/${item.video.vid}`"
          target="_blank"
          class="coin-video-item"
        >
          <div class="coin-video-cover">
            <img :src="item.video.coverUrl" alt="" />
            <span v-if="item.stat?.coin" class="coin-count">投币 x{{ item.stat.coin }}</span>
          </div>
          <div class="coin-video-info">
            <h3 class="coin-video-title" :title="item.video.title">{{ item.video.title }}</h3>
            <span class="coin-video-author">{{ getUserDisplayName(item.user) }}</span>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { VideoInfo } from '@/types/api'
import { useUserStore } from '@/stores/userStore.ts'
import { useVideoStore } from '@/stores/videoStore.ts'
import { getUserDisplayName } from '@/utils/utils.ts'

const router = useRouter()
const userStore = useUserStore()
const videoStore = useVideoStore()

const list = ref<VideoInfo[]>([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    list.value = await videoStore.getRecentCoinVideos(10)
  } catch (e) {
    console.log('加载最近投币视频失败:', e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="less">
.coin-balance-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(90deg, #4cafe8 0%, #00a1d6 100%);
  border-radius: 8px;
  padding: 24px;
  color: #fff;

  .balance-left {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .balance-label {
      font-size: 13px;
      opacity: 0.9;
    }

    .balance-num {
      font-size: 34px;
      font-weight: 700;
    }
  }

  .balance-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;

    .balance-tip {
      margin: 0;
      font-size: 12px;
      opacity: 0.85;
    }
  }
}

.page-card {
  margin-top: 16px;
  background: #fff;
  border-radius: 8px;
  padding: 24px;

  .page-title {
    margin: 0 0 16px;
    font-size: 18px;
    font-weight: 600;
    color: @text-1;
  }
}

.list-status {
  padding: 24px 0;
  text-align: center;
  font-size: 14px;
  color: #9499a0;
}

.coin-video-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  .coin-video-item {
    display: flex;
    gap: 12px;

    .coin-video-cover {
      position: relative;
      width: 140px;
      height: 88px;
      flex-shrink: 0;
      border-radius: 6px;
      overflow: hidden;
      background: #f6f7f8;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .coin-count {
        position: absolute;
        left: 0;
        bottom: 0;
        padding: 2px 8px;
        font-size: 12px;
        color: #fff;
        background: rgba(0, 0, 0, 0.6);
        border-radius: 0 6px 0 0;
      }
    }

    .coin-video-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 4px 0;

      .coin-video-title {
        margin: 0;
        font-size: 14px;
        font-weight: 500;
        color: @text-1;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }

      .coin-video-author {
        font-size: 12px;
        color: #9499a0;
      }
    }

    &:hover .coin-video-title {
      color: @blue;
    }
  }
}
</style>
