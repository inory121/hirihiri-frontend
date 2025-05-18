<template>
  <div style="min-height: 64px" class="hiri-header__bar">
    <HeaderBar />
  </div>
  <div class="search-header">
    <div class="search-input">
      <el-input
        v-model="input"
        style="max-width: 600px; height: 44px; --el-input-border-radius: 6px"
        placeholder="输入关键词搜索"
        @keyup.enter="getSearchVideo"
      >
        <template #prepend>
          <el-button :icon="Search" />
        </template>
        <template #append>
          <el-button type="primary" @click="getSearchVideo">搜索</el-button>
        </template>
      </el-input>
    </div>
    <div class="search-tabs">
      <el-tabs v-model="activeName" class="demo-tabs">
        <el-tab-pane name="first" style="width: 90px">
          <template #label>
            <span class="custom-tabs-label">
              <span>视频</span>
              <el-tag type="info" style="padding: 1px 6px; height: 17px; margin-left: 5px">{{
                searchVideoList.length
              }}</el-tag>
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane name="second">
          <template #label>
            <span class="custom-tabs-label">
              <span>用户</span>
              <el-tag type="info" style="padding: 1px 6px; height: 17px; margin-left: 5px"
                >99+</el-tag
              >
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
  <div class="search-content">
    <div class="search-page-video">
      <div class="video-list">
        <div class="card-box" v-for="list in searchVideoList" :key="list.video.vid">
          <div class="pic-box">
            <router-link :to="`/video/${list.video.vid}`">
              <img alt="" :src="list.video.coverUrl" />
            </router-link>
            <div class="mask"></div>
            <div class="playinfo">
              <el-icon class="icon" style="font-size: 16px">
                <View />
              </el-icon>
              <span class="text">{{ list.stat.view }}</span>
              <el-icon class="icon" style="margin-left: 10px; font-size: 16px">
                <Comment />
              </el-icon>
              <span class="text">{{ list.stat.danmaku }}</span>
            </div>
            <span class="duration">{{ formatDuration(list.video.duration) }}</span>
          </div>
          <div class="info">
            <a href="#">
              <p class="title" v-html="list.video.title"></p>
            </a>
            <div class="upname">
              <a href="#">
                <span class="up">up</span>
                <span class="name">{{ list.user.username }}</span>
                <span class="create_date"> · {{ formatTime(list.video.createDate) }}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { ref, onMounted, watch } from 'vue'
import { useVideoStore } from '@/stores/videoStore.ts'
import { storeToRefs } from 'pinia'
import { formatTime, formatDuration } from '@/utils/utils.ts'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const videoStore = useVideoStore()
const { searchVideoList } = storeToRefs(videoStore)
const input = ref('')
const activeName = ref('first')
const getSearchVideo = async () => {
  const keyword = input.value.trim()
  await router.push({ query: { keyword } })
  await videoStore.getSearchVideo(input.value)
}
onMounted(() => {
  const keyword = route.query.keyword as string
  if (keyword) {
    input.value = keyword
    getSearchVideo()
  }
})
watch(
  () => route.query.keyword,
  async (newKeyword) => {
    if (typeof newKeyword === 'string') {
      input.value = newKeyword
      await videoStore.getSearchVideo(newKeyword)
    }
  },
  { immediate: true },
)
</script>

<style scoped lang="less">
.hiri-header__bar {
  --text-color: #18191c;
  --header-shadow: 0 2px 4px #00000014;
  --bg-color: #fff;
  --position: fixed;
  --search-display: none;
}

.search-header {
  .search-input {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 25px 0 15px;
  }

  .search-tabs {
    padding: 0 64px;

    :deep(.el-tabs__active-bar) {
      width: 32px !important;
    }

    :deep(.el-tabs__item) {
      padding: 20px;
      font-size: 16px;
      user-select: none;
    }

    :deep(.custom-tabs-label) {
      display: flex;
      align-items: center;
    }
  }
}

.search-content {
  .video-list {
    display: flex;
    flex-wrap: wrap;
    margin: 0 64px;

    .card-box {
      display: flex;
      flex-direction: column;
      margin-bottom: 40px;
      flex: 0 0 20%;
      max-width: 20%;
      padding: 0 8px;

      .pic-box {
        flex: 0 0 auto;
        width: 100%;
        position: relative;

        a {
          display: block;
          width: 100%;
          height: 100%;
        }

        img {
          width: 100%;
          height: 100%;
          border-radius: 6px;
          object-fit: cover;
          aspect-ratio: 16/9;
        }

        .mask {
          width: 100%;
          height: 25px;
          position: absolute;
          bottom: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
          z-index: 1;
        }

        .duration,
        .playinfo {
          position: absolute;
          bottom: 4px;
          right: 6px;
          height: 20px;
          font-size: 13px;
          color: #fff;
          border-radius: 2px;
          padding: 0 4px;
          transition: opacity 0.3s;
          z-index: 2;
        }

        .playinfo {
          left: 6px;
        }
      }

      .info {
        font-size: 13px;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        margin-top: 8px;

        :deep(.title em.keyword) {
          color: #f25d8e !important;
          font-style: normal;
        }

        .title {
          display: -webkit-box;
          font-size: 15px;
          font-weight: 500;
          transition: color 0.3s;
          overflow: hidden;
          text-overflow: ellipsis;
          word-break: break-all;
          line-break: anywhere;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;

          //em.keyword {
          //  color: #f25d8e !important;
          //  font-style: normal; /* 取消斜体 */
          //}

          &:hover {
            color: #fb7299;
          }
        }

        .upname {
          height: 20px;
          margin: 2px 0;

          .up {
            display: flex;
            align-items: flex-end;
            justify-content: center;
            font-size: 10px;
            height: 15px;
            width: 16px;
            border: 1px solid #9499a0;
            border-radius: 5px;
            margin-right: 5px;
          }

          a {
            color: #9499a0;
            display: flex;
            align-items: center;
            transition: color 0.3s;

            &:hover {
              color: #fb7299;
            }

            .icon {
              margin-right: 4px;
            }

            .name {
              line-clamp: 1;
              overflow: hidden;
              text-overflow: ellipsis;
              word-break: break-all;
              line-break: anywhere;
            }
          }
        }

        .playinfo {
          color: #9499a0;
          display: flex;
          align-items: flex-start;

          .icon {
            margin-right: 4px;
          }

          .text:first-of-type {
            margin-right: 12px;
          }
        }
      }
    }
  }
}
</style>
