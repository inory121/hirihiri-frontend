<template>
  <div style="min-height: 64px" class="hiri-header__bar">
    <HeaderBar />
  </div>
  <div class="search-header" :style="isInputSticky ? { paddingTop: inputPlaceholderHeight + 'px' } : {}">
    <div class="search-input" ref="searchInputRef" :class="{ 'is-sticky': isInputSticky }">
      <SearchBox class="search-input__box" :placeholder="keyword || '输入关键词搜索'" :default-value="keyword" />
    </div>
    <div class="search-category-tabs">
      <div class="search-category-tabs-inner">
        <router-link
          :to="{ path: '/search/video', query: { keyword } }"
          class="category-tab"
          :class="{ 'category-tab--active': activeCategory === 'video' }"
        >
          <span class="category-tab__text">视频</span>
          <span class="category-tab__count">{{ formatSearchCount(searchVideoTotal) }}</span>
        </router-link>
        <router-link
          :to="{ path: '/search/user', query: { keyword } }"
          class="category-tab"
          :class="{ 'category-tab--active': activeCategory === 'user' }"
        >
          <span class="category-tab__text">用户</span>
          <span class="category-tab__count">{{ formatSearchCount(searchUserTotal) }}</span>
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
              <span class="text">{{ formatNumber(list.stat.view) }}</span>
              <el-icon class="icon" style="margin-left: 10px; font-size: 16px">
                <Comment />
              </el-icon>
              <span class="text">{{ formatNumber(list.stat.danmaku) }}</span>
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
      <CustomPagination
        v-if="activeCategory === 'user' && searchUserTotal > 0"
        :current-page="userPageNum"
        :page-size="userPageSize"
        :total="searchUserTotal"
        @current-change="handleUserPageChange"
      />
    </div>
    <CustomPagination
      v-if="activeCategory === 'video' && searchVideoTotal > 0"
      :current-page="videoPageNum"
      :page-size="videoPageSize"
      :total="searchVideoTotal"
      @current-change="handleVideoPageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { View, Comment } from '@element-plus/icons-vue'
import { onMounted, onUnmounted, ref, watch, computed, nextTick } from 'vue'
import { useVideoStore } from '@/stores/videoStore.ts'
import { useUserStore } from '@/stores/userStore.ts'
import { storeToRefs } from 'pinia'
import { formatDuration, formatTime, formatNumber, getLevelIconUrl } from '@/utils/utils.ts'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import CustomPagination from '@/components/pagination/CustomPagination.vue'
import SearchBox from '@/components/search/SearchBox.vue'

const route = useRoute()

const videoStore = useVideoStore()
const userStore = useUserStore()
const { searchVideoList, searchVideoTotal } = storeToRefs(videoStore)
const { searchUserList, searchUserTotal, followStatusMap, isLogin, showLoginWindow } = storeToRefs(userStore)
const videoOrder = ref('default')
const userOrder = ref('default')
const videoPageNum = ref(1)
const videoPageSize = ref(36)
const userPageNum = ref(1)
const userPageSize = ref(36)

// 搜索框吸顶：滚动超过搜索框初始位置后切换为fixed
const searchInputRef = ref<HTMLElement | null>(null)
const isInputSticky = ref(false)
const inputPlaceholderHeight = ref(0)
let initialOffsetTop = 0

const measureInitialPosition = () => {
  if (!searchInputRef.value) return
  initialOffsetTop = searchInputRef.value.offsetTop
  inputPlaceholderHeight.value = searchInputRef.value.offsetHeight
}

const handleScroll = () => {
  if (initialOffsetTop === 0) return
  if (window.scrollY >= initialOffsetTop && !isInputSticky.value) {
    isInputSticky.value = true
  } else if (window.scrollY < initialOffsetTop && isInputSticky.value) {
    isInputSticky.value = false
  }
}

const activeCategory = computed<'video' | 'user'>(() => {
  return route.path.startsWith('/search/user') ? 'user' : 'video'
})

const keyword = computed(() => {
  const k = route.query.keyword as string
  try {
    return k ? decodeURIComponent(k) : ''
  } catch {
    return k || ''
  }
})

const formatSearchCount = (count: number | undefined): string => {
  count = count ?? 0
  if (count >= 99) {
    return '99+'
  }
  return String(count)
}

const changeVideoOrder = (order: string) => {
  videoOrder.value = order
  videoPageNum.value = 1
  videoStore.getSearchVideos(keyword.value, order, videoPageNum.value, videoPageSize.value)
}

const changeUserOrder = (order: string) => {
  userOrder.value = order
  userPageNum.value = 1
  userStore.getSearchUsers(keyword.value, order, userPageNum.value, userPageSize.value)
}

const handleVideoPageChange = (pageNum: number) => {
  videoPageNum.value = pageNum
  videoStore.getSearchVideos(keyword.value, videoOrder.value, pageNum, videoPageSize.value)
}

const handleVideoSizeChange = (pageSize: number) => {
  videoPageSize.value = pageSize
  videoPageNum.value = 1
  videoStore.getSearchVideos(keyword.value, videoOrder.value, videoPageNum.value, pageSize)
}

const handleUserPageChange = (pageNum: number) => {
  userPageNum.value = pageNum
  userStore.getSearchUsers(keyword.value, userOrder.value, pageNum, userPageSize.value)
}

const handleUserSizeChange = (pageSize: number) => {
  userPageSize.value = pageSize
  userPageNum.value = 1
  userStore.getSearchUsers(keyword.value, userOrder.value, userPageNum.value, pageSize)
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
    await videoStore.getSearchVideos(keyword, videoOrder.value, videoPageNum.value, videoPageSize.value)
  } else {
    await userStore.getSearchUsers(keyword, userOrder.value, userPageNum.value, userPageSize.value)
  }
}

onMounted(async () => {
  nextTick(() => {
    measureInitialPosition()
  })
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

watch(
  [() => route.path, () => route.query.keyword],
  async ([, newKeyword]) => {
    if (!newKeyword || !keyword.value) {
      return
    }
    videoPageNum.value = 1
    userPageNum.value = 1
    await loadSearchResults(keyword.value)
  },
  { immediate: true },
)
</script>

<style scoped lang="less">
.hiri-header__bar {
  --text-color: #18191c;
  --header-shadow: 0 2px 4px #00000014;
  --bg-color: #fff;
  --position: static;
  --search-display: none;
  position: relative;
  z-index: 2;
}

.search-header {
  background: #fff;
  border-bottom: 1px solid #e3e5e7;

  .search-input {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 25px 64px 15px;
    background: #fff;

    &.is-sticky {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      padding: 10px 64px;
      z-index: 100;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    &__box {
      width: 100%;
      max-width: 640px;
      height: 54px;
      border-radius: 10px;

      :deep(.nav-searchform__input) {
        font-size: 18px;
      }

      @media (max-width: 900px) {
        height: 48px;
        max-width: 640px;
      }

      @media (max-width: 520px) {
        height: 44px;
        max-width: 480px;
      }
    }
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
