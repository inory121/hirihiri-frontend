<template>
  <div class="account-record">
    <div class="page-card">
      <div class="card-head">
        <h2 class="page-title">我的记录</h2>
        <div class="head-actions">
          <router-link class="history-link" to="/history" target="_blank">前往历史页</router-link>
          <el-popconfirm
            title="确定要清空所有历史记录吗？"
            confirm-button-text="清空"
            cancel-button-text="取消"
            @confirm="handleClearAll"
          >
            <template #reference>
              <el-button type="danger" plain size="small" :disabled="historyStore.historyList.length === 0">
                清空历史
              </el-button>
            </template>
          </el-popconfirm>
        </div>
      </div>

      <div v-if="historyStore.loading && historyStore.historyList.length === 0" class="list-status">
        加载中...
      </div>
      <div v-else-if="historyStore.historyList.length === 0" class="list-status">
        <el-empty description="暂无浏览记录" />
      </div>
      <template v-else>
        <div
          v-for="item in historyStore.historyList"
          :key="item.id"
          class="record-item"
          @click="router.push(`/video/${item.vid}`)"
        >
          <div class="record-cover">
            <img :src="item.coverUrl" :alt="item.title" />
            <span class="record-duration">{{ formatDuration(item.duration) }}</span>
          </div>
          <div class="record-info">
            <h3 class="record-title" :title="item.title">{{ item.title }}</h3>
            <div class="record-meta">
              <span>{{ item.authorUsername }}</span>
              <span class="record-time">{{ formatBrowseTime(item.browseTime) }}</span>
            </div>
            <div v-if="item.progress > 0" class="record-progress">
              <div
                class="progress-inner"
                :style="{ width: Math.min(100, (item.progress / item.duration) * 100) + '%' }"
              ></div>
            </div>
          </div>
          <div class="record-delete" title="删除" @click.stop="handleDelete(item.vid)">
            <el-icon><Delete /></el-icon>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Delete } from '@element-plus/icons-vue'
import { useHistoryStore } from '@/stores/historyStore.ts'
import { formatDuration } from '@/utils/utils.ts'

const router = useRouter()
const historyStore = useHistoryStore()

function formatBrowseTime(time: string): string {
  const date = new Date(time)
  const now = new Date()
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  const hm = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  if (isToday) return `今天 ${hm}`
  return `${date.getMonth() + 1}月${date.getDate()}日 ${hm}`
}

async function handleDelete(vid: number) {
  await historyStore.deleteHistory(vid)
}

async function handleClearAll() {
  await historyStore.clearAllHistory()
  ElMessage.success('已清空历史记录')
}

onMounted(() => {
  historyStore.getHistoryList(1, 50)
})
</script>

<style scoped lang="less">
.page-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;

  .card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    .page-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: @text-1;
    }

    .head-actions {
      display: flex;
      align-items: center;
      gap: 16px;

      .history-link {
        font-size: 13px;
        color: @blue;
      }
    }
  }
}

.list-status {
  padding: 24px 0;
  text-align: center;
  font-size: 14px;
  color: #9499a0;
}

.record-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid #f2f3f5;
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }

  .record-cover {
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

    .record-duration {
      position: absolute;
      right: 6px;
      bottom: 4px;
      font-size: 12px;
      color: #fff;
      text-shadow: 0 0 4px rgba(0, 0, 0, 0.6);
    }
  }

  .record-info {
    flex: 1;
    min-width: 0;
    align-self: stretch;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 6px;
    padding: 4px 0;

    .record-title {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      color: @text-1;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }

    &:hover .record-title {
      color: @blue;
    }

    .record-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 12px;
      color: #9499a0;
    }

    .record-progress {
      height: 3px;
      border-radius: 2px;
      background: #e3e5e7;
      overflow: hidden;

      .progress-inner {
        height: 100%;
        background: @blue;
      }
    }
  }

  .record-delete {
    flex-shrink: 0;
    color: #9499a0;
    padding: 8px;

    &:hover {
      color: #f56c6c;
    }
  }
}
</style>
