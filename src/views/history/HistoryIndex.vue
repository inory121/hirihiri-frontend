<template>
  <header style="min-height: 64px" class="hiri-header__bar">
    <HeaderBar/>
  </header>
  <main class="history-record">
    <div class="main-head">
      <div class="main-title">
        <el-icon>
          <Clock/>
        </el-icon>
        <span class="title">历史记录</span>
      </div>
      <div class="main-actions">
        <el-switch v-model="historyRecordSwitch"/>
        <span>记录浏览历史</span>
      </div>
    </div>
    <div class="main-breadcrumbs">
      <el-menu default-active="1" class="el-menu-demo" mode="horizontal">
        <el-menu-item index="1">综合</el-menu-item>
        <el-menu-item index="2">视频</el-menu-item>
        <el-menu-item index="3">直播</el-menu-item>
        <el-menu-item index="4">专栏</el-menu-item>
      </el-menu>
    </div>
    <div class="main-content">
      <div v-if="historyStore.loading" class="loading">
        <div class="loading-spinner"></div>
        <span class="loading-text">加载中...</span>
      </div>
      <div v-else-if="historyStore.historyList.length === 0" class="empty">
        <el-empty description="暂无浏览历史"/>
      </div>
      <el-timeline v-else style="max-width: 1000px">
        <el-timeline-item
          v-for="group in groupedHistory"
          :key="group.label"
          :timestamp="group.label"
          placement="top"
          :hollow="true"
        >
          <div class="history-group">
            <div
              v-for="item in group.items"
              :key="item.id"
              class="history-item"
              @click="router.push(`/video/${item.vid}`)"
            >
              <a :href="`/video/${item.vid}`">
                <div class="item-cover">
                  <img :src="item.coverUrl" :alt="item.title"/>
                  <div class="cover-bottom">
                  <span class="progress-text"
                  >{{ formatDuration(item.progress) }}/{{ formatDuration(item.duration) }}</span
                  >
                    <div
                      class="progress-bar"
                      :style="{ width: (item.progress / item.duration) * 100 + '%' }"
                    ></div>
                  </div>
                </div>
              </a>

              <div class="item-info">
                <a :href="`/video/${item.vid}`"><h3 class="item-title">{{ item.title }}</h3></a>
                <div class="item-meta">
                  <a :href="`/space/${item.authorUid}`">
                     <span class="item-author">
                    <img
                      src="https://hirihiri.oss-cn-nanjing.aliyuncs.com/up_pb.svg"
                      class="video-card__avatar"
                    />
                    {{ item.authorUsername }}</span
                     >
                  </a>

                  <span class="item-time">{{ formatBrowseTime(item.browseTime) }}</span>
                </div>
              </div>
              <div class="item-delete" @click.stop="deleteHistory(item.id)">
                <el-icon>
                  <Delete/>
                </el-icon>
              </div>
            </div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </div>
    <div class="main-head"></div>
  </main>
</template>

<script setup lang="ts">
import {onMounted, ref, computed} from 'vue'
import {useRouter} from 'vue-router'
import {Delete} from '@element-plus/icons-vue'
import type {HistoryVideoDTO} from '@/types/api.ts'
import {useHistoryStore} from '@/stores/historyStore.ts'
import {formatDuration} from '@/utils/utils.ts'

const router = useRouter()
const historyRecordSwitch = ref(true)
const historyStore = useHistoryStore()

const groupedHistory = computed(() => {
  const groups: { label: string; items: HistoryVideoDTO[] }[] = [
    {label: '今天', items: []},
    {label: '昨天', items: []},
    {label: '近一周', items: []},
    {label: '近一个月', items: []},
    {label: '近一年', items: []},
    {label: '更早', items: []},
  ]

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const yesterday = today - 24 * 60 * 60 * 1000
  const oneWeekAgo = today - 7 * 24 * 60 * 60 * 1000
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime()
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).getTime()

  historyStore.historyList.forEach((item) => {
    const browseTime = new Date(item.browseTime).getTime()
    if (browseTime >= today) {
      groups[0].items.push(item)
    } else if (browseTime >= yesterday) {
      groups[1].items.push(item)
    } else if (browseTime >= oneWeekAgo) {
      groups[2].items.push(item)
    } else if (browseTime >= oneMonthAgo) {
      groups[3].items.push(item)
    } else if (browseTime >= oneYearAgo) {
      groups[4].items.push(item)
    } else {
      groups[5].items.push(item)
    }
  })

  return groups.filter((g) => g.items.length > 0)
})

const formatBrowseTime = (time: string): string => {
  const date = new Date(time)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diff = date.getTime() - today.getTime()
  if (diff >= 0) {
    return `今天${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  if (diff >= -24 * 60 * 60 * 1000) {
    return `昨天${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const deleteHistory = async (id: number) => {
  historyStore.historyList = historyStore.historyList.filter((item) => item.id !== id)
}

onMounted(async () => {
  await historyStore.getHistoryList()
})
</script>

<style scoped lang="less">
.hiri-header__bar {
  --text-color: #18191c;
  --header-shadow: 0 2px 4px #00000014;
  --bg-color: #fff;
}

.history-record {
  padding-top: 30px;
  margin: 0 300px;
  min-width: 800px;

  .main-head {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;

    .main-title {
      display: flex;
      align-items: center;
      font-size: 28px;
      font-weight: 600;

      .title {
        margin-left: 16px;
      }
    }

    .main-actions {
      display: flex;
      align-items: center;

      .el-switch {
        margin-right: 6px;
      }
    }
  }

  .main-content {
    margin-top: 20px;

    .loading {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 40px;

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #fb7299;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .loading-text {
        margin-top: 16px;
        font-size: 14px;
        color: #9499a0;
      }
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }

      100% {
        transform: rotate(360deg);
      }
    }

    .empty {
      padding: 40px;
    }

    .history-group {
      .history-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;

        .item-cover {
          position: relative;
          width: 240px;
          height: 135px;
          flex-shrink: 0;
          border-radius: 6px;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .cover-bottom {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding-right: 12px;
            background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 100%);

            .progress-text {
              display: flex;
              justify-content: flex-end;
              color: #fff;
              font-size: 13px;
              text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
            }

            .progress-bar {
              height: 3px;
              background-color: #fb7299;
              margin-top: 4px;
            }
          }
        }

        .item-info {
          flex: 1;
          margin-left: 16px;
          min-width: 0;

          .item-title {
            font-size: 16px;
            font-weight: 500;
            color: #18191c;
            line-height: 22px;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
            margin: 0 0 8px 0;
            transition: color .2s linear;

            &:hover {
              color: #ff6699;
            }
          }

          .item-meta {
            display: flex;
            flex-direction: column;
            gap: 16px;

            .item-author {
              font-size: 13px;
              color: #9499a0;
              display: flex;
              flex-wrap: wrap;
              align-items: center;
              transition: color .2s linear;

              &:hover {
                color: #ff6699;
              }
            }

            .item-time {
              font-size: 13px;
              color: #9499a0;
            }
          }
        }

        .item-delete {
          flex-shrink: 0;
          padding: 8px;
          color: #9499a0;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;

          &:hover {
            color: #fb7299;
          }
        }

        &:hover .item-delete {
          opacity: 1;
        }
      }
    }
  }
}
</style>
