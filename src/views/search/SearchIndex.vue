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
        @keyup.enter="searchInfo"
      >
        <template #prepend>
          <el-button :icon="Search" />
        </template>
        <template #append>
          <el-button type="primary" @click="searchInfo">搜索</el-button>
        </template>
      </el-input>
    </div>
    <div class="search-tabs">
      <el-tabs v-model="activeName" class="demo-tabs" @tab-change="handleTabChange">
        <el-tab-pane name="first">
          <template #label>
            <span class="custom-tabs-label">
              <span>视频</span>
              <el-tag type="info" style="padding: 1px 6px; height: 17px; margin-left: 5px">{{
                searchVideoList?.length
              }}</el-tag>
            </span>
          </template>
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
        </el-tab-pane>
        <el-tab-pane name="second">
          <template #label>
            <span class="custom-tabs-label">
              <span>用户</span>
              <el-tag type="info" style="padding: 1px 6px; height: 17px; margin-left: 5px">{{
                searchUserList?.length
              }}</el-tag>
            </span>
          </template>
          <div class="search-content">
            <div class="search-page-user">
              <div class="user-list">
                <div class="card-box" v-for="list in searchUserList" :key="list.uid">
                  <div class="pic-box">
<!--                    <router-link :to="`/user/${list.uid}`">-->
                      <img alt="" :src="list.avatar" />
<!--                    </router-link>-->
                  </div>
                  <div class="info">
                    <a href="#">
                      <h2 class="username">{{ list.username }}</h2>
                    </a>
                    <div class="description">
                      <p class="description">{{ list.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { onMounted, ref, watch } from 'vue'
import { useVideoStore } from '@/stores/videoStore.ts'
import { useUserStore } from '@/stores/userStore.ts'
import { storeToRefs } from 'pinia'
import { formatDuration, formatTime } from '@/utils/utils.ts'
import { useRoute, useRouter } from 'vue-router'
import type { TabPaneName } from 'element-plus'

const route = useRoute()
const router = useRouter()

const videoStore = useVideoStore()
const userStore = useUserStore()
const { searchVideoList } = storeToRefs(videoStore)
const { searchUserList } = storeToRefs(userStore)
const input = ref('')
const activeName = ref('first')

const searchInfo = async () => {
  const keyword = input.value.trim()
  await router.push({ query: { keyword } })
  if (activeName.value === 'first') {
    await videoStore.getSearchVideos(input.value)
  } else if (activeName.value === 'second') {
    await userStore.getSearchUsers(input.value)
  }
}

const handleTabChange = (name: TabPaneName) => {
  console.log('当前 tab:', name)
  if (name === 'first') {
    videoStore.getSearchVideos(input.value)
  } else if (name === 'second') {
    userStore.getSearchUsers(input.value)
  }
}

onMounted(async () => {
  const encodedKeyword = route.query.keyword as string
  if (encodedKeyword) {
    try {
      input.value = decodeURIComponent(encodedKeyword)
      await videoStore.getSearchVideos(input.value)
      await userStore.getSearchUsers(input.value)
    } catch (e) {
      console.error('解码失败', e)
      input.value = encodedKeyword
    }
  }
})

watch(
  () => route.query.keyword,
  async (newKeyword) => {
    if (typeof newKeyword === 'string') {
      try {
        input.value = decodeURIComponent(newKeyword)
      } catch (e) {
        console.error('解码失败', e)
        input.value = newKeyword
      }
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

    :deep(.el-tabs__nav-wrap:after) {
      z-index: 0;
    }
  }
}

.search-content {
  .video-list {
    display: flex;
    flex-wrap: wrap;
    //margin: 0 64px;

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
          //z-index: 1;
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

  .user-list {
    display: flex;
    flex-wrap: wrap;
    margin-top: 40px;

    .card-box {
      display: flex;
      flex-direction: row;
      margin-bottom: 60px;
      flex: 0 0 50%;
      max-width: 50%;
      padding: 0 8px;

      .pic-box {
        width: 86px;
        min-width: 86px;
        height: 86px;

        margin-right: 15px;

        a {
          display: block;
          width: 100%;
          height: 100%;
        }
        img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }
      }
      .info{
        .username{
          font-size: 18px;
        }
        .description{
          font-size: 13px;
          color: #61666D;
          margin:5px 0;
        }
      }
    }
  }
}
</style>
