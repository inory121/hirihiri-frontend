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
    <div class="search-category-tabs">
      <div class="search-category-tabs-inner">
        <router-link
          :to="{ path: '/search/video', query: { keyword: input } }"
          class="category-tab"
          :class="{ 'category-tab--active': activeCategory === 'video' }"
        >
          <span class="category-tab__text">视频</span>
          <span class="category-tab__count">{{ formatCount(searchVideoList?.length) }}</span>
        </router-link>
        <router-link
          :to="{ path: '/search/user', query: { keyword: input } }"
          class="category-tab"
          :class="{ 'category-tab--active': activeCategory === 'user' }"
        >
          <span class="category-tab__text">用户</span>
          <span class="category-tab__count">{{ formatCount(searchUserList?.length) }}</span>
        </router-link>
      </div>
    </div>
  </div>

  <div class="search-content">
    <!-- 视频搜索结果 -->
    <div v-if="activeCategory === 'video'" class="search-page-video">
      <div class="sort-bar">
        <span
          class="sort-item"
          :class="{ 'sort-item--active': videoOrder === 'default' }"
          @click="changeVideoOrder('default')"
        >综合排序</span>
        <span
          class="sort-item"
          :class="{ 'sort-item--active': videoOrder === 'view' }"
          @click="changeVideoOrder('view')"
        >最多播放</span>
        <span
          class="sort-item"
          :class="{ 'sort-item--active': videoOrder === 'date' }"
          @click="changeVideoOrder('date')"
        >最新发布</span>
        <span
          class="sort-item"
          :class="{ 'sort-item--active': videoOrder === 'danmaku' }"
          @click="changeVideoOrder('danmaku')"
        >最多弹幕</span>
        <span
          class="sort-item"
          :class="{ 'sort-item--active': videoOrder === 'favorite' }"
          @click="changeVideoOrder('favorite')"
        >最多收藏</span>
      </div>
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
            <router-link :to="`/video/${list.video.vid}`" :title="list.video.title">
              <p class="title" v-html="list.video.title"></p>
            </router-link>
            <div class="upname">
              <router-link :to="`/space/${list.user.uid}`">
                <img src="https://hirihiri.oss-cn-nanjing.aliyuncs.com/up_pb.svg" class="video-card__avatar" />
                <span class="name" style="margin-left: 3px">{{ list.user.username }}</span>
                <span class="create_date"> · {{ formatTime(list.video.createDate) }}</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户搜索结果 -->
    <div v-if="activeCategory === 'user'" class="search-page-user">
      <div class="sort-bar">
        <span
          class="sort-item"
          :class="{ 'sort-item--active': userOrder === 'default' }"
          @click="changeUserOrder('default')"
        >默认排序</span>
        <span
          class="sort-item"
          :class="{ 'sort-item--active': userOrder === 'fan_desc' }"
          @click="changeUserOrder('fan_desc')"
        >粉丝数由高到低</span>
        <span
          class="sort-item"
          :class="{ 'sort-item--active': userOrder === 'fan_asc' }"
          @click="changeUserOrder('fan_asc')"
        >粉丝数由低到高</span>
        <span
          class="sort-item"
          :class="{ 'sort-item--active': userOrder === 'level_desc' }"
          @click="changeUserOrder('level_desc')"
        >Lv等级由高到低</span>
        <span
          class="sort-item"
          :class="{ 'sort-item--active': userOrder === 'level_asc' }"
          @click="changeUserOrder('level_asc')"
        >Lv等级由低到高</span>
      </div>
      <div class="user-list">
        <div class="user-card" v-for="item in searchUserList" :key="item.uid">
          <router-link :to="`/space/${item.uid}`" class="avatar-wrap">
            <img :src="item.avatar" alt="" class="avatar" />
          </router-link>
          <div class="user-info">
            <div class="user-name-row">
              <router-link :to="`/space/${item.uid}`" class="username">{{ item.username }}</router-link>
              <img
                class="level-icon"
                :src="getLevelIconUrl(item.level)"
                :alt="`Lv${item.level}`"
              />
            </div>
            <div class="user-stats-row">
              <div class="user-stats">
                <span class="stat-item">{{ formatCount(item.fanCount) }}粉丝</span>
                <span class="stat-divider">·</span>
                <span class="stat-item">{{ item.videoCount }}个视频</span>
              </div>
              <div class="user-desc">
                {{ item.authMsg || item.description || '暂无简介' }}
              </div>
            </div>
            <el-button
              size="small"
              :type="followStatusMap[item.uid] ? 'info' : 'primary'"
              @click.stop="handleFollow(item.uid)"
            >
              {{ followStatusMap[item.uid] ? '已关注' : '+ 关注' }}
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, View, Comment } from '@element-plus/icons-vue'
import { onMounted, ref, watch, computed } from 'vue'
import { useVideoStore } from '@/stores/videoStore.ts'
import { useUserStore } from '@/stores/userStore.ts'
import { storeToRefs } from 'pinia'
import { formatDuration, formatTime, getLevelIconUrl } from '@/utils/utils.ts'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const videoStore = useVideoStore()
const userStore = useUserStore()
const { searchVideoList } = storeToRefs(videoStore)
const { searchUserList, followStatusMap, isLogin, showLoginWindow } = storeToRefs(userStore)
const input = ref('')
const videoOrder = ref('default')
const userOrder = ref('default')

const activeCategory = computed<'video' | 'user'>(() => {
  return route.path.startsWith('/search/user') ? 'user' : 'video'
})

const searchInfo = async () => {
  const keyword = input.value.trim()
  if (!keyword) return
  const targetPath = activeCategory.value === 'video' ? '/search/video' : '/search/user'
  await router.push({ path: targetPath, query: { keyword } })
  if (activeCategory.value === 'video') {
    await videoStore.getSearchVideos(keyword, videoOrder.value)
  } else {
    await userStore.getSearchUsers(keyword, userOrder.value)
  }
}

const changeVideoOrder = (order: string) => {
  videoOrder.value = order
  videoStore.getSearchVideos(input.value, order)
}

const changeUserOrder = (order: string) => {
  userOrder.value = order
  userStore.getSearchUsers(input.value, order)
}

const handleFollow = (uid: number) => {
  if (!isLogin.value) {
    showLoginWindow.value = true
    ElMessage.warning('请先登录')
    return
  }
  userStore.toggleFollow(uid)
}

const formatCount = (count: number | undefined): string => {
  count = count ?? 0
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return String(count)
}

const loadSearchResults = async (keyword: string) => {
  if (activeCategory.value === 'video') {
    await videoStore.getSearchVideos(keyword, videoOrder.value)
  } else {
    await userStore.getSearchUsers(keyword, userOrder.value)
  }
}

onMounted(async () => {
  const encodedKeyword = route.query.keyword as string
  if (encodedKeyword) {
    try {
      input.value = decodeURIComponent(encodedKeyword)
      await loadSearchResults(input.value)
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

watch(
  () => route.path,
  async () => {
    const keyword = input.value
    if (keyword) {
      await loadSearchResults(keyword)
    }
  },
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
  background: #fff;
  border-bottom: 1px solid #e3e5e7;

  .search-input {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 25px 0 15px;
  }

  .search-category-tabs {
    padding: 0 64px;

    &-inner {
      display: flex;
      gap: 24px;
    }
  }
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 16px 0;
  font-size: 16px;
  color: #61666d;
  text-decoration: none;
  position: relative;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #18191c;
  }

  &--active {
    color: #fb7299;
    font-weight: 500;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: #fb7299;
      border-radius: 2px;
    }
  }

  &__text {
    line-height: 1;
  }

  &__count {
    font-size: 13px;
    color: #9499a0;
    font-weight: normal;
  }
}

.search-content {
  padding: 24px 64px;
  background: #fff;
  min-height: calc(100vh - 260px);

  .sort-bar {
    display: flex;
    gap: 4px;
    margin-bottom: 20px;
    align-items: center;
  }

  .sort-item {
    padding: 6px 16px;
    font-size: 14px;
    color: #61666d;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      color: #18191c;
      background: #e3e5e7;
    }

    &--active {
      color: #00aeec;
      background: #e1f2ff;
      font-weight: 500;

      &:hover {
        color: #00aeec;
        background: #e1f2ff;
      }
    }
  }

  .video-list {
    display: flex;
    flex-wrap: wrap;

    .card-box {
      display: flex;
      flex-direction: column;
      margin-bottom: 40px;
      flex: 0 0 16.666%;
      max-width: 16.666%;
      padding: 0 8px;

      @media (max-width: 1600px) {
        flex: 0 0 20%;
        max-width: 20%;
      }

      @media (max-width: 1200px) {
        flex: 0 0 25%;
        max-width: 25%;
      }

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
    gap: 20px;

    .user-card {
      display: flex;
      align-items: center;
      flex: 0 0 calc(33.333% - 14px);
      max-width: calc(33.333% - 14px);
      padding: 20px;
      box-sizing: border-box;

      @media (max-width: 1200px) {
        flex: 0 0 calc(50% - 10px);
        max-width: calc(50% - 10px);
      }

      .avatar-wrap {
        flex-shrink: 0;
        margin-right: 16px;

        .avatar {
          width: 86px;
          height: 86px;
          border-radius: 50%;
          display: block;
        }
      }

      .user-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;

        .user-name-row {
          display: flex;
          align-items: center;
          gap: 8px;

          .username {
            font-size: 18px;
            font-weight: 600;
            color: #18191c;
            transition: color 0.3s;

            &:hover {
              color: #fb7299;
            }
          }

          .level-icon {
            width: 35px;
            height: auto;
          }
        }

        .user-stats-row {
          display: flex;
          align-items: center;
          gap: 1ch;

          .user-stats {
            font-size: 13px;
            color: #9499a0;
            display: flex;
            align-items: center;
            flex-shrink: 0;

            .stat-item {
              white-space: nowrap;
            }

            .stat-divider {
              margin: 0 6px;
            }
          }

          .user-desc {
            font-size: 13px;
            color: #61666d;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            flex-shrink: 1;
            min-width: 0;
          }
        }

        .el-button {
          margin-top: 6px;
          align-self: flex-start;
        }
      }
    }
  }
}
</style>
