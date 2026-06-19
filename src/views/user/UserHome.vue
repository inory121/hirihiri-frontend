<template>
  <div style="min-height: 64px" class="hiri-header__bar">
    <HeaderBar />
  </div>
  <div class="user-home__banner">
    <div class="user-home__banner-bg" :style="{
      backgroundImage: userStore.targetUser?.background
        ? `url(${userStore.targetUser.background})`
        : `url('https://hirihiri.oss-cn-nanjing.aliyuncs.com/banner.png')`,
    }"></div>
    <div class="user-home__banner-mask"></div>
  </div>

  <main class="user-home__main">
    <div class="user-home__info">
      <div class="user-home__avatar-wrap">
        <img class="user-home__avatar"
          :src="userStore.targetUser.avatar || 'https://hirihiri.oss-cn-nanjing.aliyuncs.com/up_pb.svg'" />
      </div>
      <div class="user-home__details">
        <h1 class="user-home__name">
          {{ userStore.targetUser.username }}
          <span v-if="userStore.targetUser.vip === 1" class="user-home__badge user-home__badge--vip1">月度会员</span>
          <span v-else-if="userStore.targetUser.vip === 2" class="user-home__badge user-home__badge--vip2">年度会员</span>
          <span v-if="userStore.targetUser.auth === 1" class="user-home__badge user-home__badge--auth">个人认证</span>
          <span v-else-if="userStore.targetUser.auth === 2" class="user-home__badge user-home__badge--auth">机构认证</span>
        </h1>
        <p class="user-home__description">{{ userStore.targetUser.description || '这个人很懒，什么都没有写~' }}</p>
        <div class="user-home__meta">
          <span class="user-home__meta-item">
            <el-icon>
              <Medal />
            </el-icon>
            经验值：{{ userStore.targetUser.exp }}
          </span>
          <span class="user-home__meta-item">
            <el-icon>
              <Coin />
            </el-icon>
            硬币：{{ userStore.targetUser.coin }}
          </span>
          <span v-if="userStore.targetUser.sex === 1" class="user-home__meta-item">
            <el-icon>
              <Male />
            </el-icon>
            男
          </span>
          <span v-else-if="userStore.targetUser.sex === 2" class="user-home__meta-item">
            <el-icon>
              <Female />
            </el-icon>
            女
          </span>
          <span v-if="userStore.targetUser.createDate" class="user-home__meta-item">
            <el-icon>
              <Calendar />
            </el-icon>
            {{ formatDateTime(userStore.targetUser.createDate, 'YYYY-MM-DD') }} 加入
          </span>
        </div>
      </div>
      <div class="user-home__actions">
        <div class="user-home__stats">
          <div
            class="user-home__stat-item user-home__stat-item--link"
            :class="{ 'user-home__stat-item--active': activeTab === 'video' }"
            @click="switchTab('video')"
          >
            <div class="user-home__stat-value">{{ videoStore.userVideoList.length }}</div>
            <div class="user-home__stat-label">投稿</div>
          </div>
          <div
            class="user-home__stat-item user-home__stat-item--link"
            :class="{ 'user-home__stat-item--active': activeTab === 'followings' }"
            @click="switchTab('followings')"
          >
            <div class="user-home__stat-value">{{ formatNumber(userStore.targetFollow.followings) }}</div>
            <div class="user-home__stat-label">关注</div>
          </div>
          <div
            class="user-home__stat-item user-home__stat-item--link"
            :class="{ 'user-home__stat-item--active': activeTab === 'followers' }"
            @click="switchTab('followers')"
          >
            <div class="user-home__stat-value">{{ formatNumber(userStore.targetFollow.followers) }}</div>
            <div class="user-home__stat-label">粉丝</div>
          </div>
        </div>
        <div v-if="userStore.isLogin && userStore.user.uid !== userStore.targetUser.uid" class="user-home__follow-btn">
          <el-button
            :type="userStore.targetFollow.isFollowing ? 'default' : 'primary'"
            @click="userStore.toggleFollow(userStore.targetUser.uid)"
          >
            {{ userStore.targetFollow.isFollowing ? '已关注' : '+ 关注' }}
          </el-button>
        </div>
      </div>
    </div>

    <div class="user-home__tabs">
      <div class="user-home__tab" :class="{ 'user-home__tab--active': activeTab === 'video' }"
        @click="switchTab('video')">
        投稿
      </div>
      <div class="user-home__tab" :class="{ 'user-home__tab--active': activeTab === 'followings' }"
        @click="switchTab('followings')">
        关注
      </div>
      <div class="user-home__tab" :class="{ 'user-home__tab--active': activeTab === 'followers' }"
        @click="switchTab('followers')">
        粉丝
      </div>
    </div>

    <div class="user-home__content">
      <div v-if="activeTab === 'video'" class="user-home__video">
        <template v-if="videoStore.userVideoList.length > 0 || videoStore.userVideoLoading">
          <VideoCard :data="videoStore.userVideoList" :loading="videoStore.userVideoLoading" :hide-author="true" />
        </template>
        <template v-else>
          <el-empty description="暂无投稿视频" />
        </template>
      </div>

      <div v-else-if="activeTab === 'followings' || activeTab === 'followers'" class="user-home__follow">
        <template v-if="userStore.followListLoading">
          <el-skeleton :rows="6" animated />
        </template>
        <template v-else-if="userStore.followList.length > 0">
          <div class="user-home__follow-grid">
            <div v-for="user in userStore.followList" :key="user.uid" class="user-home__follow-item">
              <a :href="`/space/${user.uid}`" target="_blank" class="user-home__follow-item-link">
                <img
                  class="user-home__follow-item-avatar"
                  :src="user.avatar || 'https://hirihiri.oss-cn-nanjing.aliyuncs.com/up_pb.svg'"
                />
                <div class="user-home__follow-item-info">
                  <div class="user-home__follow-item-name">{{ user.username }}</div>
                  <div class="user-home__follow-item-desc">{{ user.description || '这个人很懒，什么都没有写~' }}</div>
                </div>
              </a>
              <div v-if="shouldShowFollowBtn(user.uid)" class="user-home__follow-item-action">
                <el-button
                  :type="isFollowingInList(user.uid) ? 'default' : 'primary'"
                  size="small"
                  @click="handleToggleFollow(user.uid)"
                >
                  {{ getFollowBtnText(user.uid) }}
                </el-button>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <el-empty :description="activeTab === 'followers' ? '还没有粉丝' : '还没有关注任何人'" />
        </template>
      </div>
    </div>
  </main>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatDateTime, formatNumber } from '@/utils/utils.ts'
import { useUserStore } from '@/stores/userStore'
import { useVideoStore } from '@/stores/videoStore'
import HeaderBar from '@/components/header-bar/HeaderBar.vue'
import VideoCard from '@/components/video-card/VideoCard.vue'
import { Medal, Coin, Male, Female, Calendar } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const videoStore = useVideoStore()
const activeTab = ref<'video' | 'followings' | 'followers'>('video')

// 从 URL query 中读取初始 tab，不匹配时回退到 video
const initTabFromQuery = () => {
  const tab = route.query.tab as string
  if (tab === 'followings' || tab === 'followers') {
    activeTab.value = tab
    const uid = Number(route.params.uid)
    if (tab === 'followings') {
      userStore.getFollowings(uid)
    } else if (tab === 'followers') {
      userStore.getFollowers(uid)
    }
  }
}

// 判断列表中某用户项是否显示关注按钮（已登录 & 不是自己）
const shouldShowFollowBtn = (itemUid: number) =>
  userStore.isLogin && userStore.user.uid && userStore.user.uid !== itemUid

// 读取关注状态映射，判断列表中某用户是否已被关注
const isFollowingInList = (itemUid: number) => {
  return userStore.followStatusMap[itemUid] === true
}

// 根据当前 tab 返回关注按钮文案
// 粉丝列表：已关注 -> 已互粉，未关注 -> 回关
// 关注列表：已关注 -> 已关注，未关注 -> + 关注
const getFollowBtnText = (itemUid: number) => {
  const isFollowing = isFollowingInList(itemUid)
  if (activeTab.value === 'followers') {
    return isFollowing ? '已互粉' : '回关'
  }
  return isFollowing ? '已关注' : '+ 关注'
}

// 列表项的关注 / 取消关注入口
const handleToggleFollow = async (itemUid: number) => {
  await userStore.toggleFollow(itemUid)
}

// 切换投稿 / 关注 / 粉丝 tab，并按需加载对应列表，同步到 URL query
const switchTab = (tab: 'video' | 'followings' | 'followers') => {
  activeTab.value = tab
  const uid = Number(route.params.uid)
  // 同步 URL：video 为默认值时不写 query，其他 tab 带上 ?tab=xxx
  const query: Record<string, string> = tab === 'video' ? {} : { tab }
  router.replace({ path: `/space/${uid}`, query })
  if (tab === 'followings') {
    userStore.getFollowings(uid)
  } else if (tab === 'followers') {
    userStore.getFollowers(uid)
  }
}

onMounted(() => {
  const uid = Number(route.params.uid)
  if (uid) {
    userStore.getTargetUserInfo(uid)
    userStore.getTargetFollowInfo(uid)
    videoStore.getUserVideos(uid)
    initTabFromQuery()
  }
  document.body.style.backgroundColor = '#f4f5f7'
})

watch(
  () => route.params.uid,
  (newUid) => {
    if (newUid) {
      const parsedUid = Number(newUid)
      userStore.getTargetUserInfo(parsedUid)
      userStore.getTargetFollowInfo(parsedUid)
      videoStore.getUserVideos(parsedUid)
      initTabFromQuery()
    }
  }
)

// 监听 URL query.tab 变化，例如从头像悬浮窗点击"关注/粉丝"时切换内容
watch(
  () => route.query.tab,
  () => {
    initTabFromQuery()
  }
)
</script>

<style scoped lang="less">
.hiri-header__bar {
  --text-color: #18191c;
  --header-shadow: 0 2px 4px #00000014;
  --bg-color: #fff;
  --position: fixed;
}

.user-home__banner {
  position: relative;
  min-height: 200px;
  height: 15vw;
  max-height: 280px;
  overflow: hidden;
}

.user-home__banner-bg {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.user-home__banner-mask {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(to bottom, transparent, rgba(244, 245, 247, 1));
}

.user-home__main {
  margin: -80px auto 0;
  padding: 0 20px 40px;
  position: relative;
}

.user-home__info {
  display: flex;
  gap: 24px;
  background: #fff;
  border-radius: 8px;
  padding: 24px 32px;
  margin-bottom: 20px;
  align-items: flex-start;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.user-home__avatar-wrap {
  flex-shrink: 0;
  margin-top: -60px;
}

.user-home__avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid #fff;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-home__details {
  flex: 1;
  min-width: 0;
  padding-top: 12px;
}

.user-home__name {
  font-size: 24px;
  font-weight: 600;
  color: #222;
  margin: 0 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.user-home__badge {
  display: inline-block;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: normal;

  &--vip1 {
    background: linear-gradient(135deg, #ffb74d, #fb8c00);
    color: #fff;
  }

  &--vip2 {
    background: linear-gradient(135deg, #ce93d8, #7b1fa2);
    color: #fff;
  }

  &--auth {
    background: #e8f5e9;
    color: #2e7d32;
  }
}

.user-home__description {
  font-size: 14px;
  color: #61666d;
  margin: 0 0 16px;
  line-height: 1.6;
}

.user-home__meta {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.user-home__meta-item {
  font-size: 13px;
  color: #9499a0;
  display: flex;
  align-items: center;
  gap: 4px;

  .el-icon {
    font-size: 14px;
  }
}

.user-home__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
  flex-shrink: 0;
  padding-top: 12px;
}

.user-home__stats {
  display: flex;
  gap: 24px;
}

.user-home__stat-item {
  text-align: center;
  min-width: 60px;

  &--link {
    text-decoration: none;
    border-radius: 6px;
    padding: 4px 8px;
    transition: background 0.2s, color 0.2s;
    cursor: pointer;

    &:hover {
      background: #f7f8fa;

      .user-home__stat-value,
      .user-home__stat-label {
        color: #fb7299;
      }
    }
  }

  &--active {
    background: #ffe6ef;

    .user-home__stat-value,
    .user-home__stat-label {
      color: #fb7299;
    }
  }
}

.user-home__stat-value {
  font-size: 22px;
  font-weight: 600;
  color: #222;
  line-height: 1.2;
}

.user-home__stat-label {
  font-size: 12px;
  color: #61666d;
  margin-top: 4px;
}

.user-home__follow-btn {
  .el-button {
    min-width: 96px;
  }
}

.user-home__tabs {
  display: flex;
  gap: 8px;
  background: #fff;
  border-radius: 8px;
  padding: 0 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.user-home__tab {
  padding: 16px 20px;
  font-size: 15px;
  color: #61666d;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;

  &:hover {
    color: #fb7299;
  }

  &--active {
    color: #222;
    font-weight: 500;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 20px;
      right: 20px;
      height: 3px;
      background: #fb7299;
      border-radius: 2px;
    }
  }
}

.user-home__content {
  background: #fff;
  border-radius: 8px;
  padding: 40px 20px;
  min-height: 300px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.user-home__video {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 20px;
}

.user-home__follow {
  display: block;
}

.user-home__follow-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.user-home__follow-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  transition: background 0.2s;

  &:hover {
    background: #f7f8fa;
  }
}

.user-home__follow-item-link {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}

.user-home__follow-item-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.user-home__follow-item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.user-home__follow-item-name {
  font-size: 15px;
  font-weight: 500;
  color: #222;

  .user-home__follow-item-link:hover & {
    color: #fb7299;
  }
}

.user-home__follow-item-desc {
  font-size: 12px;
  color: #9499a0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-home__follow-item-action {
  flex-shrink: 0;
}

@media (min-width: 1200px) {
  .user-home__follow-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1400px) {
  .user-home__video {
    grid-template-columns: repeat(5, 1fr);
  }

  .user-home__main {
    padding: 0 60px 40px;
  }
}

@media (min-width: 1560px) {
  .user-home__main {
    padding: 0 140px 40px;
  }
}
</style>
