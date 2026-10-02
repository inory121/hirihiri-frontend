<template>
  <div style="min-height: 64px" class="hiri-header__bar">
    <HeaderBar/>
  </div>
  <div class="user-home__banner">
    <div class="user-home__banner-bg" :style="{
      backgroundImage: userStore.targetUser?.background
        ? `url(${userStore.targetUser.background})`
        : `url('${DEFAULT_BACKGROUND}')`,
    }"></div>
    <div class="user-home__banner-mask"></div>
  </div>

  <main class="user-home__main">
    <div class="user-home__info">
      <div class="user-home__avatar-wrap">
        <img class="user-home__avatar"
             :src="userStore.targetUser.avatar || DEFAULT_AVATAR" alt=""/>
      </div>
      <div class="user-home__details">
        <h1 class="user-home__name">
          {{ getUserDisplayName(userStore.targetUser) }}
          <span v-if="userStore.targetUser.vip === 1"
                class="user-home__badge user-home__badge--vip1">月度大会员</span>
          <span v-else-if="userStore.targetUser.vip === 2"
                class="user-home__badge user-home__badge--vip2">年度大会员</span>
          <span v-if="userStore.targetUser.auth === 1"
                class="user-home__badge user-home__badge--auth">个人认证</span>
          <span v-else-if="userStore.targetUser.auth === 2"
                class="user-home__badge user-home__badge--auth">机构认证</span>
        </h1>
        <p class="user-home__description">{{
            userStore.targetUser.description || '这个人很懒，什么都没有写~'
          }}</p>
        <div class="user-home__meta">
          <span class="user-home__meta-item">
            <img
              class="user-home__level-icon"
              :src="getLevelIconUrl(getLevelByExp(userStore.targetUser.exp))"
              :alt="`Lv${getLevelByExp(userStore.targetUser.exp)}`"
            />
            经验值：{{ userStore.targetUser.exp }}
          </span>
          <span class="user-home__meta-item">
            <el-icon>
              <Coin/>
            </el-icon>
            硬币：{{ userStore.targetUser.coin }}
          </span>
          <span v-if="userStore.targetUser.sex === 1" class="user-home__meta-item">
            <el-icon>
              <Male/>
            </el-icon>
            男
          </span>
          <span v-else-if="userStore.targetUser.sex === 2" class="user-home__meta-item">
            <el-icon>
              <Female/>
            </el-icon>
            女
          </span>
          <span v-if="userStore.targetUser.createTime" class="user-home__meta-item">
            <el-icon>
              <Calendar/>
            </el-icon>
            {{ formatDateTime(userStore.targetUser.createTime, 'YYYY-MM-DD') }} 加入
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
            <div class="user-home__stat-value">{{ videoStore.userVideoTotal }}</div>
            <div class="user-home__stat-label">投稿</div>
          </div>
          <div
            class="user-home__stat-item user-home__stat-item--link"
            :class="{ 'user-home__stat-item--active': activeTab === 'followings' }"
            @click="switchTab('followings')"
          >
            <div class="user-home__stat-value">{{
                formatNumber(userStore.targetFollow.followings)
              }}
            </div>
            <div class="user-home__stat-label">关注</div>
          </div>
          <div
            class="user-home__stat-item user-home__stat-item--link"
            :class="{ 'user-home__stat-item--active': activeTab === 'followers' }"
            @click="switchTab('followers')"
          >
            <div class="user-home__stat-value">{{
                formatNumber(userStore.targetFollow.followers)
              }}
            </div>
            <div class="user-home__stat-label">粉丝</div>
          </div>
          <div class="user-home__stat-item">
            <div class="user-home__stat-value">{{ formatNumber(videoStore.userVideoStats.totalLikes) }}</div>
            <div class="user-home__stat-label">获赞</div>
          </div>
          <div class="user-home__stat-item">
            <div class="user-home__stat-value">{{ formatNumber(videoStore.userVideoStats.totalViews) }}</div>
            <div class="user-home__stat-label">播放</div>
          </div>
        </div>
        <div v-if="userStore.isLogin && userStore.user.uid !== userStore.targetUser.uid"
             class="user-home__follow-btn">
          <el-button
            :type="userStore.targetFollow.isFollowing ? 'default' : 'primary'"
            @click="userStore.toggleFollow(userStore.targetUser.uid)"
          >
            {{ userStore.targetFollow.isFollowing ? '已关注' : '+ 关注' }}
          </el-button>
          <a
            :href="`/message?target=${userStore.targetUser.uid}`"
            class="user-home__msg-link"
            target="_blank"
          >
            <el-button :icon="ChatDotRound">发消息</el-button>
          </a>
        </div>
      </div>
    </div>

    <div class="user-home__tabs">
      <div class="user-home__tab" :class="{ 'user-home__tab--active': activeTab === 'home' }"
           @click="switchTab('home')">
        <el-icon class="user-home__tab-icon">
          <HomeFilled/>
        </el-icon>
        <span>主页</span>
      </div>
      <div class="user-home__tab" :class="{ 'user-home__tab--active': activeTab === 'dynamic' }"
           @click="switchTab('dynamic')">
        <el-icon class="user-home__tab-icon">
          <ChatDotRound/>
        </el-icon>
        <span>动态</span>
        <span class="user-home__tab-count">{{ dynamicTabTotal }}</span>
      </div>
      <div class="user-home__tab" :class="{ 'user-home__tab--active': activeTab === 'video' }"
           @click="switchTab('video')">
        <el-icon class="user-home__tab-icon">
          <VideoCameraFilled/>
        </el-icon>
        <span>投稿</span>
        <span class="user-home__tab-count">{{ videoStore.userVideoTotal }}</span>
      </div>
      <div class="user-home__tab" :class="{ 'user-home__tab--active': activeTab === 'favorites' }"
           @click="switchTab('favorites')">
        <el-icon class="user-home__tab-icon">
          <StarFilled/>
        </el-icon>
        <span>收藏</span>
        <span class="user-home__tab-count">{{ folderCount }}</span>
      </div>
      <div class="user-home__tab" :class="{ 'user-home__tab--active': activeTab === 'followings' }"
           @click="switchTab('followings')">
        <el-icon class="user-home__tab-icon">
          <UserFilled/>
        </el-icon>
        <span>关注</span>
        <span class="user-home__tab-count">{{ userStore.targetFollow.followings }}</span>
      </div>
      <div class="user-home__tab" :class="{ 'user-home__tab--active': activeTab === 'followers' }"
           @click="switchTab('followers')">
        <el-icon class="user-home__tab-icon">
          <Avatar/>
        </el-icon>
        <span>粉丝</span>
        <span class="user-home__tab-count">{{ userStore.targetFollow.followers }}</span>
      </div>
    </div>

    <div class="user-home__content">
      <!-- 主页 Tab -->
      <div v-if="activeTab === 'home'" class="user-home__home">
        <div class="user-home__home-main">
        <!-- 置顶视频 -->
        <section class="user-home__section">
          <div class="user-home__section-header">
            <h3 class="user-home__section-title">置顶视频</h3>
          </div>
          <div class="user-home__pinned-video">
            <template v-if="videoStore.pinnedVideo">
              <div class="user-home__pinned-card">
                <div class="user-home__pinned-link">
                  <div class="user-home__pinned-cover-wrap">
                    <a :href="`/video/${videoStore.pinnedVideo.video.vid}`" target="_blank">
                      <img :src="videoStore.pinnedVideo.video.coverUrl" alt="" class="user-home__pinned-cover"/>
                      <span class="user-home__pinned-duration">{{
                        formatDuration(videoStore.pinnedVideo.video.duration)
                      }}</span>
                    </a>
                  </div>
                  <div class="user-home__pinned-info">
                    <a :href="`/video/${videoStore.pinnedVideo.video.vid}`" target="_blank">
                      <h4 class="user-home__pinned-title">{{ videoStore.pinnedVideo.video.title }}</h4>
                    </a>
                    <div class="user-home__pinned-stats">
                      <span class="user-home__pinned-stat">
                        <el-icon><VideoPlay /></el-icon>
                        {{ formatNumber(videoStore.pinnedVideo.stat.view) }}
                      </span>
                      <span class="user-home__pinned-stat">
                        <el-icon><ChatDotRound /></el-icon>
                        {{ formatNumber(videoStore.pinnedVideo.stat.danmaku ?? 0) }}
                      </span>
                      <span class="user-home__pinned-stat">
                        {{ formatTime(videoStore.pinnedVideo.video.createTime) }}
                      </span>
                    </div>
                    <p class="user-home__pinned-descr">{{ videoStore.pinnedVideo.video.descr }}</p>
                    <div v-if="isOwnHome" class="user-home__pinned-actions">
                      <el-button type="primary" size="default" @click="showPinnedDialog = true">编辑置顶</el-button>
                      <el-button size="default" @click="handleCancelPinned">取消置顶</el-button>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <div v-if="isOwnHome" class="user-home__pinned-empty-self">
                <el-empty description="暂无置顶视频，快去设置你的置顶视频吧" :image-size="80">
                  <el-button type="primary" size="default" @click="showPinnedDialog = true">设置置顶</el-button>
                </el-empty>
              </div>
              <el-empty v-else description="暂无置顶视频" :image-size="80"/>
            </template>
          </div>
        </section>

        <!-- 视频列表 -->
        <section class="user-home__section">
          <div class="user-home__section-header">
            <div class="user-home__section-title-with-sort">
              <h3 class="user-home__section-title">视频 <span class="user-home__section-title-separator">·</span> <span class="user-home__section-title-count">{{ videoStore.userVideoList.length }}</span></h3>
              <div class="user-home__video-sort">
                <span
                  class="user-home__video-sort-item"
                  :class="{ 'user-home__video-sort-item--active': homeVideoSort === 'date' }"
                  @click="homeVideoSort = 'date'"
                >最新发布</span>
                <span
                  class="user-home__video-sort-item"
                  :class="{ 'user-home__video-sort-item--active': homeVideoSort === 'view' }"
                  @click="homeVideoSort = 'view'"
                >最多播放</span>
                <span
                  class="user-home__video-sort-item"
                  :class="{ 'user-home__video-sort-item--active': homeVideoSort === 'favorite' }"
                  @click="homeVideoSort = 'favorite'"
                >最多收藏</span>
              </div>
            </div>
            <el-button text type="primary" @click="switchTab('video')">查看更多</el-button>
          </div>
          <div class="user-home__video-grid">
            <template v-if="!videoStore.userVideoLoading && sortedHomeVideos.length === 0">
              <el-empty description="暂无投稿视频" :image-size="80"/>
            </template>
            <template v-else>
              <VideoCard
                :data="sortedHomeVideos.slice(0, 10)"
                :loading="videoStore.userVideoLoading"
                :hide-author="true"
              />
            </template>
          </div>
        </section>

        <!-- 收藏夹 -->
        <section class="user-home__section">
          <div class="user-home__section-header">
            <h3 class="user-home__section-title">收藏夹 <span class="user-home__section-title-separator">·</span> <span class="user-home__section-title-count">{{ favoriteFolders.length }}</span></h3>
            <el-button text type="primary" @click="switchTab('favorites')">查看更多</el-button>
          </div>
          <div class="user-home__folder-grid">
            <div v-for="folder in displayedHomeFolders" :key="folder.id"
                 class="user-home__folder-item">
              <a :href="`/space/${route.params.uid}?tab=favorites&folder=${folder.id}`"
                           class="user-home__folder-link"
                           target="_blank">
                <div class="user-home__folder-cover">
                  <img :src="folder.coverUrl || DEFAULT_FOLDER_COVER" alt=""
                       class="user-home__folder-image"/>
                </div>
                <div class="user-home__folder-info">
                  <h4 class="user-home__folder-name">{{ folder.name }}</h4>
                  <span class="user-home__folder-count">{{ folder.videoCount }}个视频</span>
                </div>
              </a>
            </div>
          </div>
        </section>

        <!-- 最近投币的视频 -->
        <section class="user-home__section">
          <div class="user-home__section-header">
            <h3 class="user-home__section-title">最近投币的视频</h3>
          </div>
          <div class="user-home__coin-video-grid">
            <template v-if="recentCoinVideos.length > 0">
              <VideoCard
                :data="recentCoinVideos.slice(0, 10)"
                :loading="false"
                :hide-time="true"
              />
            </template>
            <template v-else>
              <el-empty description="暂无投币记录" :image-size="60"/>
            </template>
          </div>
        </section>

        <!-- 最近点赞的视频 -->
        <section class="user-home__section">
          <div class="user-home__section-header">
            <h3 class="user-home__section-title">最近点赞的视频</h3>
          </div>
          <div class="user-home__like-video-grid">
            <template v-if="recentLikeVideos.length > 0">
              <VideoCard
                :data="recentLikeVideos.slice(0, 10)"
                :loading="false"
                :hide-time="true"
              />
            </template>
            <template v-else>
              <el-empty description="暂无点赞记录" :image-size="60"/>
            </template>
          </div>
        </section>
        </div>
        <RightPlaceholder/>
      </div>

      <!-- 收藏 Tab -->
      <div v-else-if="activeTab === 'favorites'" class="user-home__favorites">
        <div class="user-home__favorites-layout">
          <!-- 左侧收藏夹列表 -->
          <aside class="user-home__favorites-sidebar">
            <div class="user-home__favorites-header">
              <h3>{{ isOwnHome ? '我创建的收藏夹' : 'TA的收藏夹' }}</h3>
            </div>
            <div class="user-home__favorites-list">
              <!-- 新建收藏夹（放在第一个位置，仅本人可见）-->
              <div
                v-if="isOwnHome"
                class="user-home__favorites-item user-home__favorites-item--create"
                @click="handleCreateFolder"
              >
                <div class="user-home__favorites-cover-wrap">
                  <el-icon class="user-home__favorites-icon">
                    <Plus/>
                  </el-icon>
                </div>
                <span>新建收藏夹</span>
                <span class="user-home__favorites-count"></span>
              </div>

              <div
                v-for="folder in favoriteFolders"
                :key="folder.id"
                class="user-home__favorites-item"
                :class="{ 'user-home__favorites-item--active': selectedFolderId === folder.id }"
                @click="selectFolder(folder.id)"
              >
                <div class="user-home__favorites-cover-wrap">
                  <img
                    class="user-home__favorites-cover"
                    :src="folder.coverUrl || DEFAULT_FOLDER_COVER"
                    :alt="folder.name"
                  />
                </div>
                <span>{{ folder.name }}</span>
                <span class="user-home__favorites-count">{{ folder.videoCount }}</span>

                <!-- 更多按钮（仅本人可见，且默认收藏夹不显示）-->
                <div
                  v-if="isOwnHome && !folder.isDefault"
                  class="user-home__favorites-more"
                  @click.stop="toggleFolderMenu(folder.id)"
                  @mouseenter="showFolderMenu(folder.id)"
                  @mouseleave="hideFolderMenu"
                >
<!--                  <el-icon class="user-home__favorites-more-icon">-->
<!--                    <More/>-->
<!--                  </el-icon>-->
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" class="user-home__favorites-more-icon">
                    <circle cx="512" cy="256" r="112" fill="currentColor"/>
                    <circle cx="512" cy="512" r="112" fill="currentColor"/>
                    <circle cx="512" cy="768" r="112" fill="currentColor"/>
                  </svg>

                  <!-- 操作菜单 -->
                  <div
                    v-if="activeFolderMenuId === folder.id"
                    class="user-home__favorites-menu"
                    @click.stop
                    @mouseenter="cancelHideMenu"
                    @mouseleave="hideFolderMenu"
                  >
                    <div class="user-home__favorites-menu-item" @click="handleEditFolder(folder)">
                      编辑信息
                    </div>
                    <div v-if="!folder.isDefault" class="user-home__favorites-menu-item" @click="handleDeleteFolder(folder)">
                      删除
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <!-- 右侧视频内容 -->
          <main class="user-home__favorites-content">
            <div class="user-home__favorites-toolbar">
              <div class="user-home__video-sort">
                <span
                  class="user-home__video-sort-item"
                  :class="{ 'user-home__video-sort-item--active': favoritesViewMode === 'recent' }"
                  @click="favoritesViewMode = 'recent'"
                >最近收藏</span>
                <span
                  class="user-home__video-sort-item"
                  :class="{ 'user-home__video-sort-item--active': favoritesViewMode === 'most-played' }"
                  @click="favoritesViewMode = 'most-played'"
                >最多播放</span>
                <span
                  class="user-home__video-sort-item"
                  :class="{ 'user-home__video-sort-item--active': favoritesViewMode === 'latest-upload' }"
                  @click="favoritesViewMode = 'latest-upload'"
                >最新投稿</span>
              </div>
              <div class="user-home__favorites-actions">
                <el-input
                  v-model="favoritesSearchKeyword"
                  placeholder="请输入关键词"
                  size="small"
                  style="width: 200px"
                  clearable
                >
                  <template #prefix>
                    <el-icon>
                      <Search/>
                    </el-icon>
                  </template>
                </el-input>
                <el-dropdown v-if="isOwnHome">
                  <el-button size="small">
                    批量操作
                    <el-icon class="el-icon--right">
                      <ArrowDown/>
                    </el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item>删除</el-dropdown-item>
                      <el-dropdown-item>移动到</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
            <div class="user-home__favorites-videos">
              <template v-if="sortedFolderVideos.length > 0">
                <VideoCard
                  :data="sortedFolderVideos"
                  :loading="false"
                />
              </template>
              <template v-else>
                <el-empty description="该收藏夹暂无视频"/>
              </template>
            </div>
          </main>
        </div>
      </div>

      <!-- 投稿 Tab -->
      <div v-else-if="activeTab === 'video'" class="user-home__video-tab">
        <div class="user-home__video-sort-bar">
          <span
            class="user-home__video-sort-item"
            :class="{ 'user-home__video-sort-item--active': userVideoSort === 'date' }"
            @click="handleUserVideoSortChange('date')"
          >最新发布</span>
          <span
            class="user-home__video-sort-item"
            :class="{ 'user-home__video-sort-item--active': userVideoSort === 'view' }"
            @click="handleUserVideoSortChange('view')"
          >最多播放</span>
          <span
            class="user-home__video-sort-item"
            :class="{ 'user-home__video-sort-item--active': userVideoSort === 'favorite' }"
            @click="handleUserVideoSortChange('favorite')"
          >最多收藏</span>
        </div>
        <template v-if="videoStore.userVideoLoading">
          <el-skeleton :rows="6" animated/>
        </template>
        <template v-else-if="videoStore.userVideoList.length > 0">
          <div class="user-home__video-grid user-home__video-grid--full">
            <VideoCard
              :data="videoStore.userVideoList"
              :loading="false"
              :hide-author="true"
            />
          </div>
          <CustomPagination
            v-if="videoStore.userVideoTotal > userVideoPageSize"
            :current-page="userVideoPageNum"
            :page-size="userVideoPageSize"
            :total="videoStore.userVideoTotal"
            @current-change="handleUserVideoPageChange"
          />
        </template>
        <template v-else>
          <el-empty description="暂无投稿视频" :image-size="80"/>
        </template>
      </div>

      <div v-else-if="activeTab === 'dynamic'" class="user-home__dynamic-tab">
        <div class="user-home__dynamic-layout">
          <!-- 左侧：全部 / 视频 切换（参考收藏页切换 tab） -->
          <aside class="user-home__dynamic-sidebar">
            <div class="user-home__dynamic-sort">
              <span
                class="user-home__video-sort-item user-home__dynamic-sort-item"
                :class="{ 'user-home__video-sort-item--active': dynamicType === 0 }"
                @click="handleDynamicTypeChange(0)"
              >全部</span>
              <span
                class="user-home__video-sort-item user-home__dynamic-sort-item"
                :class="{ 'user-home__video-sort-item--active': dynamicType === 2 }"
                @click="handleDynamicTypeChange(2)"
              >视频</span>
            </div>
          </aside>
          <main class="user-home__dynamic-content">
            <template v-if="dynamicStore.dynamicLoading && dynamicStore.dynamicList.length === 0">
              <el-skeleton :rows="6" animated/>
            </template>
            <template v-else-if="dynamicStore.dynamicList.length > 0">
              <div class="user-home__dynamic-list">
                <DynamicCard
                  v-for="item in dynamicStore.dynamicList"
                  :key="item.id"
                  :item="item"
                  @refresh="resetUserDynamic"
                />
              </div>
              <div v-if="dynamicStore.dynamicList.length > 0" class="user-home__dynamic-more">
                <span v-if="dynamicLoadingMore" class="user-home__dynamic-more-tip">
                  <el-icon class="is-loading"><Loading/></el-icon>
                  加载中…
                </span>
                <span v-else-if="!dynamicHasMore" class="user-home__dynamic-more-tip">没有更多动态了</span>
              </div>
            </template>
            <template v-else>
              <el-empty description="TA 还没有发布过动态" :image-size="80"/>
            </template>
          </main>
          <RightPlaceholder/>
        </div>
      </div>

      <div v-else-if="activeTab === 'followings' || activeTab === 'followers'"
           class="user-home__follow">
        <template v-if="userStore.followListLoading">
          <el-skeleton :rows="6" animated/>
        </template>
        <template v-else-if="userStore.followList.length > 0">
          <div class="user-home__follow-grid">
            <div v-for="user in userStore.followList" :key="user.uid"
                 class="user-home__follow-item">
              <div class="user-home__follow-item-link">
                <UserHoverCard
                  :user="user"
                  :is-following="isFollowingInList(user.uid)"
                  placement="right-top"
                  auto-adjust
                  :offset-x="12"
                  :offset-y="0"
                  @follow="handleToggleFollow"
                >
                  <a :href="`/space/${user.uid}`" target="_blank">
                    <img
                      class="user-home__follow-item-avatar"
                      :src="user.avatar || DEFAULT_AVATAR"
                     alt="avatar"/>
                  </a>
                </UserHoverCard>
                <div class="user-home__follow-item-info">
                  <a class="user-home__follow-item-name" :href="`/space/${user.uid}`" target="_blank">{{ getUserDisplayName(user) }}</a>
                  <div class="user-home__follow-item-desc">{{
                      user.description || '这个人很懒，什么都没有写~'
                    }}
                  </div>
                </div>
              </div>
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
          <el-empty :description="activeTab === 'followers' ? '还没有粉丝' : '还没有关注任何人'"/>
        </template>
      </div>
    </div>
  </main>

  <!-- 新建收藏夹弹窗 -->
  <el-dialog
    v-model="showCreateFolderDialog"
    title="新建收藏夹"
    width="400px"
    :close-on-click-modal="false"
    :show-close="true"
    @close="handleCloseCreateFolder"
  >
    <div class="create-folder-dialog">
      <!-- 图标占位区域 -->
      <div class="create-folder-dialog__icon-wrap">
        <div class="create-folder-dialog__icon">
          <el-icon>
            <Plus/>
          </el-icon>
        </div>
      </div>

      <!-- 名称输入 -->
      <div class="create-folder-dialog__form-item">
        <label class="create-folder-dialog__label">
          名称 <span class="create-folder-dialog__required">*</span>
        </label>
        <el-input
          v-model="newFolderName"
          placeholder="快来给你的收藏夹命名吧"
          maxlength="20"
          class="create-folder-dialog__input"
        >
          <template #append>
            <span class="create-folder-dialog__input-suffix">{{ newFolderName.length }}/20</span>
          </template>
        </el-input>
      </div>

      <!-- 简介输入 -->
      <div class="create-folder-dialog__form-item">
        <label class="create-folder-dialog__label">简介</label>
        <el-input
          v-model="newFolderDescription"
          type="textarea"
          placeholder="可以简单描述下你的收藏夹"
          maxlength="200"
          :rows="3"
          class="create-folder-dialog__textarea"
        />
        <span class="create-folder-dialog__textarea-suffix">{{
            newFolderDescription.length
          }}/200</span>
      </div>
    </div>

    <template #footer>
      <div class="create-folder-dialog__footer">
        <el-button
          class="create-folder-dialog__btn create-folder-dialog__btn--cancel"
          @click="handleCloseCreateFolder"
        >取消
        </el-button>
        <el-button
          type="primary"
          class="create-folder-dialog__btn create-folder-dialog__btn--create"
          :disabled="!newFolderName.trim()"
          @click="handleCreateFolderConfirm"
        >创建
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 编辑收藏夹弹窗 -->
  <el-dialog
    v-model="showEditFolderDialog"
    title="收藏夹信息"
    width="400px"
    :close-on-click-modal="false"
    :show-close="true"
    @close="handleCloseEditFolder"
  >
    <div class="create-folder-dialog">
      <!-- 图标占位区域 -->
      <div class="create-folder-dialog__icon-wrap">
        <div class="create-folder-dialog__icon">
          <el-icon>
            <Folder/>
          </el-icon>
        </div>
      </div>

      <!-- 名称输入 -->
      <div class="create-folder-dialog__form-item">
        <label class="create-folder-dialog__label">
          名称 <span class="create-folder-dialog__required">*</span>
        </label>
        <el-input
          v-model="editFolderName"
          placeholder="快来给你的收藏夹命名吧"
          maxlength="20"
          class="create-folder-dialog__input"
        >
          <template #append>
            <span class="create-folder-dialog__input-suffix">{{ editFolderName.length }}/20</span>
          </template>
        </el-input>
      </div>

      <!-- 简介输入 -->
      <div class="create-folder-dialog__form-item">
        <label class="create-folder-dialog__label">简介</label>
        <el-input
          v-model="editFolderDescription"
          type="textarea"
          placeholder="可以简单描述下你的收藏夹"
          maxlength="200"
          :rows="3"
          class="create-folder-dialog__textarea"
        />
        <span class="create-folder-dialog__textarea-suffix">{{
            editFolderDescription.length
          }}/200</span>
      </div>
    </div>

    <template #footer>
      <div class="create-folder-dialog__footer">
        <el-button
          class="create-folder-dialog__btn create-folder-dialog__btn--cancel"
          @click="handleCloseEditFolder"
        >取消
        </el-button>
        <el-button
          type="primary"
          class="create-folder-dialog__btn create-folder-dialog__btn--create"
          :disabled="!editFolderName.trim()"
          @click="handleEditFolderConfirm"
        >保存
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 设置置顶视频弹窗 -->
  <el-dialog
    v-model="showPinnedDialog"
    title="设置置顶视频"
    width="640px"
    :close-on-click-modal="false"
    class="pinned-dialog"
  >
    <div class="pinned-dialog__content">
      <div class="pinned-dialog__search">
        <el-input
          v-model="pinnedSearchKeyword"
          placeholder="搜索我投稿的视频"
          clearable
          :prefix-icon="Search"
        />
      </div>
      <div class="pinned-dialog__sort">
        <span class="pinned-dialog__sort-label">投稿视频</span>
        <el-select v-model="pinnedSortOrder" size="default" class="pinned-dialog__sort-select">
          <el-option label="最新发布" value="date" />
          <el-option label="最多播放" value="view" />
          <el-option label="最多收藏" value="favorite" />
        </el-select>
      </div>
      <div class="pinned-dialog__list">
        <div
          v-for="item in sortedPinnedVideos"
          :key="item.video.vid"
          class="pinned-dialog__item"
          :class="{ 'pinned-dialog__item--active': selectedPinnedVid === item.video.vid }"
          @click="selectedPinnedVid = item.video.vid"
        >
          <div class="pinned-dialog__radio-placeholder">
            <div v-if="selectedPinnedVid === item.video.vid" class="pinned-dialog__radio-checked"></div>
          </div>
          <img :src="item.video.coverUrl" alt="" class="pinned-dialog__cover" />
          <div class="pinned-dialog__item-info">
            <div class="pinned-dialog__item-title">{{ item.video.title }}</div>
            <div class="pinned-dialog__item-meta">
              <span class="pinned-dialog__item-stat">
                <el-icon><VideoPlay /></el-icon>
                {{ formatNumber(item.stat.view) }}
              </span>
              <span class="pinned-dialog__item-stat">
                {{ formatTime(item.video.createTime) }}
              </span>
            </div>
          </div>
        </div>
        <el-empty v-if="sortedPinnedVideos.length === 0" description="暂无视频" :image-size="60" />
      </div>
    </div>
    <template #footer>
      <div class="pinned-dialog__footer">
        <el-button @click="showPinnedDialog = false">取消</el-button>
        <el-button type="primary" :disabled="!selectedPinnedVid" @click="handleSetPinned(selectedPinnedVid)">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import {ref, onMounted, onBeforeUnmount, watch, computed} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {
  formatDateTime,
  formatNumber,
  getLevelByExp,
  getLevelIconUrl,
  formatTime,
  formatDuration,
  getUserDisplayName
} from '@/utils/utils.ts'
import {useUserStore} from '@/stores/userStore'
import {useVideoStore} from '@/stores/videoStore'
import {useDynamicStore} from '@/stores/dynamicStore'
import {ElMessage, ElMessageBox} from 'element-plus'
import HeaderBar from '@/components/header-bar/HeaderBar.vue'
import VideoCard from '@/components/video-card/VideoCard.vue'
import UserHoverCard from '@/components/user-hover-card/UserHoverCard.vue'
import DynamicCard from '@/components/dynamic-card/DynamicCard.vue'
import CustomPagination from '@/components/pagination/CustomPagination.vue'
import RightPlaceholder from '@/components/right-placeholder/RightPlaceholder.vue'
import {
  Coin,
  Male,
  Female,
  Calendar,
  Folder,
  Plus,
  Search,
  ArrowDown,
  HomeFilled,
  StarFilled,
  VideoCameraFilled,
  UserFilled,
  Avatar,
  VideoPlay,
  ChatDotRound,
  Loading
} from '@element-plus/icons-vue'
import {get} from '@/utils/request'
import {DYNAMIC_API} from '@/api/dynamic'
import type {VideoInfo, FavoriteFolder, Dynamic, User, DynamicPageApiResponse} from '@/types/api'
import {DEFAULT_AVATAR, DEFAULT_BACKGROUND, DEFAULT_FOLDER_COVER} from '@/utils/constants'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const videoStore = useVideoStore()
const dynamicStore = useDynamicStore()
const activeTab = ref<'home' | 'favorites' | 'video' | 'dynamic' | 'followings' | 'followers'>('home')
const userVideoPageNum = ref(1)
const userVideoPageSize = ref(42)
const dynamicPageNum = ref(1)
const dynamicPageSize = ref(10)
const dynamicTabTotal = ref(0) // 动态 tab 栏显示的用户动态总数
const dynamicType = ref<0 | 2>(0) // 动态列表类型：0 全部 2 视频
// 动态懒加载
const dynamicHasMore = ref(true)
const dynamicLoadingMore = ref(false)
const DYNAMIC_LOAD_MORE_THRESHOLD = 300 // 距底部像素阈值，小于等于开始加载下一页

// 主页相关数据
const favoriteFolders = ref<FavoriteFolder[]>([]) // 收藏夹列表
const recentCoinVideos = ref<VideoInfo[]>([]) // 最近投币的视频
const recentLikeVideos = ref<VideoInfo[]>([]) // 最近点赞的视频
const homeVideoSort = ref<'date' | 'view' | 'favorite'>('date') // 主页视频排序方式
const userVideoSort = ref<'date' | 'view' | 'favorite'>('date') // 投稿tab排序方式
const showPinnedDialog = ref(false) // 是否显示设置置顶弹窗
const pinnedSearchKeyword = ref('') // 置顶搜索关键词
const pinnedSortOrder = ref<'date' | 'view' | 'favorite'>('date') // 置顶视频排序
const selectedPinnedVid = ref<number>(0) // 选中的置顶视频ID

// 过滤和排序后的置顶候选视频列表
const sortedPinnedVideos = computed<VideoInfo[]>(() => {
  let list = [...videoStore.userVideoList]
  if (pinnedSearchKeyword.value.trim()) {
    const kw = pinnedSearchKeyword.value.trim().toLowerCase()
    list = list.filter(item =>
      item.video.title.toLowerCase().includes(kw)
    )
  }
  switch (pinnedSortOrder.value) {
    case 'view':
      list.sort((a, b) => (b.stat.view || 0) - (a.stat.view || 0))
      break
    case 'favorite':
      list.sort((a, b) => (b.stat.favorite || 0) - (a.stat.favorite || 0))
      break
    case 'date':
    default:
      list.sort((a, b) =>
        new Date(b.video.createTime).getTime() - new Date(a.video.createTime).getTime()
      )
  }
  return list
})

// 打开置顶弹窗时默认选中当前置顶视频
watch(showPinnedDialog, (val) => {
  if (val && videoStore.pinnedVideo) {
    selectedPinnedVid.value = videoStore.pinnedVideo.video.vid
  } else if (val) {
    selectedPinnedVid.value = 0
  }
})

// 排序后的主页视频列表
const sortedHomeVideos = computed<VideoInfo[]>(() => {
  const list = [...videoStore.userVideoList]
  switch (homeVideoSort.value) {
    case 'view':
      return list.sort((a, b) => b.stat.view - a.stat.view)
    case 'favorite':
      return list.sort((a, b) => b.stat.favorite - a.stat.favorite)
    case 'date':
    default:
      return list.sort((a, b) =>
        new Date(b.video.createTime).getTime() - new Date(a.video.createTime).getTime()
      )
  }
})

// 是否是访问自己的主页
const isOwnHome = computed(() => {
  return userStore.isLogin && userStore.user.uid === userStore.targetUser.uid
})

// 收藏tab相关数据
const selectedFolderId = ref<number>(0) // 当前选中的收藏夹ID
const favoritesViewMode = ref<'recent' | 'most-played' | 'latest-upload'>('recent') // 收藏视图模式
const favoritesSearchKeyword = ref('') // 收藏搜索关键词
const selectedFolderVideos = ref<VideoInfo[]>([]) // 当前选中收藏夹的视频

// 收藏夹视频排序
const sortedFolderVideos = computed<VideoInfo[]>(() => {
  const list = [...selectedFolderVideos.value]
  switch (favoritesViewMode.value) {
    case 'most-played':
      return list.sort((a, b) => (b.stat.view || 0) - (a.stat.view || 0))
    case 'latest-upload':
      return list.sort((a, b) =>
        new Date(b.video.createTime).getTime() - new Date(a.video.createTime).getTime()
      )
    case 'recent':
    default:
      // 后端返回的顺序即为最近收藏顺序
      return list
  }
})

const folderCount = ref<number>(0) // 收藏夹数量（tab 栏显示）
// 新建收藏夹弹窗
const showCreateFolderDialog = ref(false)
const newFolderName = ref('')
const newFolderDescription = ref('')
// 编辑收藏夹弹窗
const showEditFolderDialog = ref(false)
const editingFolder = ref<FavoriteFolder | null>(null)
const editFolderName = ref('')
const editFolderDescription = ref('')
// 收藏夹菜单
const activeFolderMenuId = ref<number | null>(null)
let hideMenuTimer: ReturnType<typeof setTimeout> | null = null

// 预加载收藏夹数量供 tab 栏显示
const loadFolderCount = async (targetUid?: number) => {
  try {
    const folders = await videoStore.getUserFavoriteFolders(undefined, targetUid)
    folderCount.value = folders.length
  } catch {
    folderCount.value = 0
  }
}

// 收藏夹排序：默认收藏夹永远在第二个位置（新建收藏夹按钮下面），其他按创建时间倒序
const sortFolders = (folders: FavoriteFolder[]): FavoriteFolder[] => {
  // 分离默认收藏夹和非默认收藏夹
  const defaultFolder = folders.find(f => f.isDefault)
  const nonDefaultFolders = folders.filter(f => !f.isDefault)

  // 非默认收藏夹按创建时间倒序（最新创建的在前面）
  const sortedNonDefault = [...nonDefaultFolders].sort((a, b) =>
    new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
  )

  // 组合：默认收藏夹固定在第一位，然后是其他用户创建的收藏夹
  // 注意：模板中第一个位置是固定的"新建收藏夹"按钮，所以这里defaultFolder就是视觉上的第二位
  const result: FavoriteFolder[] = []

  // 默认收藏夹放在列表第一个位置（对应UI上"新建收藏夹"按钮下面的第二个位置）
  if (defaultFolder) {
    result.push(defaultFolder)
  }

  // 其他用户创建的收藏夹按创建时间倒序排在后面
  result.push(...sortedNonDefault)

  return result
}

// 主页显示的收藏夹：至少显示默认收藏夹，最多显示4个
const displayedHomeFolders = computed<FavoriteFolder[]>(() => {
  return favoriteFolders.value.slice(0, 4)
})

// 从 URL query 中读取初始 tab，不匹配时回退到 home
const initTabFromQuery = () => {
  const tab = route.query.tab as string
  const uid = Number(route.params.uid)
  // tab 为 undefined 或不匹配时回退到 home
  if (!tab || (tab !== 'home' && tab !== 'favorites' && tab !== 'video' && tab !== 'dynamic' && tab !== 'followings' && tab !== 'followers')) {
    activeTab.value = 'home'
    loadHomeData(uid)
    return
  }
  activeTab.value = tab
  if (tab === 'home') {
    loadHomeData(uid)
  } else if (tab === 'favorites') {
    // 支持从 URL 直接定位到指定收藏夹
    const folderId = Number(route.query.folder)
    if (folderId > 0) {
      selectedFolderId.value = folderId
    }
    loadFavoritesData(uid)
  } else if (tab === 'video') {
    userVideoPageNum.value = 1
    videoStore.getUserVideos(uid, userVideoPageNum.value, userVideoPageSize.value)
  } else if (tab === 'dynamic') {
    resetUserDynamic(uid)
  } else if (tab === 'followings') {
    userStore.getFollowings(uid)
  } else if (tab === 'followers') {
    userStore.getFollowers(uid)
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

// 切换主页 / 收藏 / 投稿 / 动态 / 关注 / 粉丝 tab，同步到 URL query，数据加载由 watcher 统一处理
const switchTab = (tab: 'home' | 'favorites' | 'video' | 'dynamic' | 'followings' | 'followers') => {
  activeTab.value = tab
  const uid = Number(route.params.uid)
  // 同步 URL：home 为默认值时不写 query，其他 tab 带上 ?tab=xxx
  const query: Record<string, string> = tab === 'home' ? {} : {tab}
  router.replace({path: `/space/${uid}`, query})
  // 如果 tab 没变（重复点击同一个 tab），watcher 不会触发，直接加载
  if (tab === route.query.tab || (tab === 'home' && !route.query.tab)) {
    if (tab === 'home') {
      loadHomeData(uid)
    } else if (tab === 'favorites') {
      loadFavoritesData(uid)
    } else if (tab === 'video') {
      userVideoPageNum.value = 1
      videoStore.getUserVideos(uid, userVideoPageNum.value, userVideoPageSize.value, userVideoSort.value)
    } else if (tab === 'dynamic') {
      resetUserDynamic(uid)
    }
  }
}

// 递归收集动态（含转发链）中的作者，用于同步关注状态
const collectDynamicUsers = (item: Dynamic | null | undefined, acc: User[] = []): User[] => {
  if (!item) {
    return acc
  }
  if (item.user) {
    acc.push(item.user)
  }
  if (item.parent) {
    collectDynamicUsers(item.parent, acc)
  }
  return acc
}

// 加载指定用户的动态列表，并同步所有作者（含转发链）的关注状态
const loadUserDynamic = async (targetUid: number, page: number, append: boolean) => {
  await dynamicStore.getDynamicList(page, dynamicPageSize.value, dynamicType.value, targetUid, append)
  // tab 栏数字保持"全部动态"总数，不随 全部/视频 切换而变化
  if (dynamicType.value === 0) {
    dynamicTabTotal.value = dynamicStore.dynamicTotal
  }
  const users: User[] = []
  for (const item of dynamicStore.dynamicList) {
    collectDynamicUsers(item, users)
  }
  userStore.syncFollowStatusFromList(users)
}

// 动态列表重置到第一页（切 tab / 切换 全部视频 / 删除刷新）
const resetUserDynamic = async (targetUid?: number) => {
  const uid = targetUid ?? Number(route.params.uid)
  dynamicPageNum.value = 1
  dynamicHasMore.value = true
  dynamicLoadingMore.value = false
  await loadUserDynamic(uid, 1, false)
}

// 滚动到底部加载下一页（追加模式）
const loadMoreUserDynamic = async () => {
  if (dynamicLoadingMore.value || !dynamicHasMore.value) return
  if (activeTab.value !== 'dynamic') return
  if (dynamicStore.dynamicList.length === 0) return
  const next = dynamicPageNum.value + 1
  dynamicLoadingMore.value = true
  const prevLen = dynamicStore.dynamicList.length
  await loadUserDynamic(Number(route.params.uid), next, true)
  if (dynamicStore.dynamicList.length === prevLen
      || dynamicStore.dynamicList.length >= dynamicStore.dynamicTotal) {
    dynamicHasMore.value = false
  } else {
    dynamicPageNum.value = next
  }
  dynamicLoadingMore.value = false
}

const onUserHomeScroll = () => {
  const remain = document.documentElement.scrollHeight - window.innerHeight - window.scrollY
  if (remain <= DYNAMIC_LOAD_MORE_THRESHOLD) {
    loadMoreUserDynamic()
  }
}

// 动态列表 全部/视频 切换
const handleDynamicTypeChange = (type: 0 | 2) => {
  if (dynamicType.value === type) return
  dynamicType.value = type
  resetUserDynamic()
}

// 预加载指定用户的动态总数，供 tab 栏展示
const loadUserDynamicCount = async (targetUid: number) => {
  try {
    const res = await get<DynamicPageApiResponse>(
      `${DYNAMIC_API.LIST}?pageNum=1&pageSize=1&uid=${targetUid}`,
    )
    dynamicTabTotal.value = res.code === 200 ? res.data.total || 0 : 0
  } catch (e) {
    console.log('加载动态总数失败:', e)
    dynamicTabTotal.value = 0
  }
}

const handleUserVideoPageChange = (pageNum: number) => {
  userVideoPageNum.value = pageNum
  const uid = Number(route.params.uid)
  videoStore.getUserVideos(uid, pageNum, userVideoPageSize.value, userVideoSort.value)
}

const handleUserVideoSortChange = (sort: 'date' | 'view' | 'favorite') => {
  userVideoSort.value = sort
  userVideoPageNum.value = 1
  const uid = Number(route.params.uid)
  videoStore.getUserVideos(uid, userVideoPageNum.value, userVideoPageSize.value, sort)
}
// 选择收藏夹
const selectFolder = async (folderId: number) => {
  selectedFolderId.value = folderId
  try {
    selectedFolderVideos.value = await videoStore.getFolderVideos(folderId)
  } catch (e) {
    console.error('加载收藏夹视频失败:', e)
  }
}

// 创建新收藏夹
const handleCreateFolder = () => {
  // 重置表单
  newFolderName.value = ''
  newFolderDescription.value = ''
  showCreateFolderDialog.value = true
}

// 关闭新建收藏夹弹窗
const handleCloseCreateFolder = () => {
  showCreateFolderDialog.value = false
}

// 确认创建收藏夹
const handleCreateFolderConfirm = async () => {
  const folderName = newFolderName.value.trim()
  if (!folderName) {
    ElMessage.warning('请输入收藏夹名称')
    return
  }

  try {
    const newFolder = await videoStore.createFolder(folderName, newFolderDescription.value.trim())
    if (newFolder) {
      favoriteFolders.value.push(newFolder)
      selectedFolderId.value = newFolder.id
      selectedFolderVideos.value = []
      showCreateFolderDialog.value = false
    }
  } catch (e) {
    console.error('创建收藏夹失败:', e)
  }
}

// 显示收藏夹菜单
const showFolderMenu = (folderId: number) => {
  if (hideMenuTimer) {
    clearTimeout(hideMenuTimer)
    hideMenuTimer = null
  }
  activeFolderMenuId.value = folderId
}

// 延迟隐藏收藏夹菜单
const hideFolderMenu = () => {
  hideMenuTimer = setTimeout(() => {
    activeFolderMenuId.value = null
    hideMenuTimer = null
  }, 200)
}

// 取消隐藏菜单（鼠标进入菜单时调用）
const cancelHideMenu = () => {
  if (hideMenuTimer) {
    clearTimeout(hideMenuTimer)
    hideMenuTimer = null
  }
}

// 切换收藏夹菜单
const toggleFolderMenu = (folderId: number) => {
  if (activeFolderMenuId.value === folderId) {
    activeFolderMenuId.value = null
  } else {
    activeFolderMenuId.value = folderId
  }
}

// 编辑收藏夹
const handleEditFolder = (folder: FavoriteFolder) => {
  editingFolder.value = folder
  editFolderName.value = folder.name
  editFolderDescription.value = folder.description || ''
  activeFolderMenuId.value = null
  showEditFolderDialog.value = true
}

// 关闭编辑收藏夹弹窗
const handleCloseEditFolder = () => {
  showEditFolderDialog.value = false
  editingFolder.value = null
}

// 确认编辑收藏夹
const handleEditFolderConfirm = async () => {
  if (!editingFolder.value) return

  const folderName = editFolderName.value.trim()
  if (!folderName) {
    ElMessage.warning('请输入收藏夹名称')
    return
  }

  try {
    const res = await videoStore.updateFolder(editingFolder.value.id, folderName, editFolderDescription.value.trim())
    if (res) {
      // 更新本地数据
      const index = favoriteFolders.value.findIndex(f => f.id === editingFolder.value!.id)
      if (index > -1) {
        favoriteFolders.value[index] = {
          ...favoriteFolders.value[index],
          name: folderName,
          description: editFolderDescription.value.trim()
        }
      }
      ElMessage.success('修改成功')
      showEditFolderDialog.value = false
      editingFolder.value = null
    }
  } catch (e) {
    console.error('修改收藏夹失败:', e)
  }
}

// 删除收藏夹
const handleDeleteFolder = async (folder: FavoriteFolder) => {
  if (folder.isDefault) {
    ElMessage.warning('默认收藏夹不能删除')
    return
  }

  try {
    const confirm = await ElMessageBox.confirm(
      `确定要删除收藏夹「${folder.name}」吗？删除后该收藏夹中的视频收藏将一并移除。`,
      '删除收藏夹',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    if (confirm === 'confirm') {
      const res = await videoStore.deleteFolder(folder.id)
      if (res) {
        // 更新本地数据
        const index = favoriteFolders.value.findIndex(f => f.id === folder.id)
        if (index > -1) {
          favoriteFolders.value.splice(index, 1)
        }
        // 如果删除的是当前选中的收藏夹，切换到第一个
        if (selectedFolderId.value === folder.id) {
          if (favoriteFolders.value.length > 0) {
            selectedFolderId.value = favoriteFolders.value[0].id
            selectedFolderVideos.value = await videoStore.getFolderVideos(selectedFolderId.value)
          } else {
            selectedFolderId.value = 0
            selectedFolderVideos.value = []
          }
        }
        ElMessage.success('删除成功')
      }
    }
  } catch (e) {
    // 用户取消
    if (e !== 'cancel') {
      console.error('删除收藏夹失败:', e)
    }
  }
  activeFolderMenuId.value = null
}

// 加载主页数据
const loadHomeData = async (targetUid: number) => {
  try {
    await videoStore.getPinnedVideo(targetUid)

    // 并行加载收藏夹、最近投币、最近点赞
    // 传入目标用户uid，如果是自己访问自己主页，API返回自己的数据也正确
    const [folders, coins, likes] = await Promise.all([
      videoStore.getUserFavoriteFolders(undefined, targetUid),
      videoStore.getRecentCoinVideos(5, targetUid),
      videoStore.getRecentLikeVideos(10, targetUid),
    ])

    favoriteFolders.value = sortFolders(folders)
    recentCoinVideos.value = coins
    recentLikeVideos.value = likes
  } catch (e) {
    console.error('加载主页数据失败:', e)
  }
}

// 取消置顶
const handleCancelPinned = async () => {
  if (!videoStore.pinnedVideo) return
  try {
    await ElMessageBox.confirm('确定要取消置顶该视频吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const vid = videoStore.pinnedVideo.video.vid
  const success = await videoStore.cancelPinnedVideo(vid)
  if (success) {
    await videoStore.getPinnedVideo(userStore.targetUser.uid)
  }
}

// 设置置顶
const handleSetPinned = async (vid: number) => {
  const success = await videoStore.setPinnedVideo(vid)
  if (success) {
    showPinnedDialog.value = false
    await videoStore.getPinnedVideo(userStore.targetUser.uid)
  }
}

// 加载收藏tab数据
const loadFavoritesData = async (targetUid: number) => {
  try {
    // 每次都重新拉取收藏夹列表，保证 videoCount 最新
    const folders = await videoStore.getUserFavoriteFolders(undefined, targetUid)
    favoriteFolders.value = sortFolders(folders)
    // 同步 tab 栏显示的收藏夹数量
    folderCount.value = folders.length

    // 默认选中第一个收藏夹
    if (selectedFolderId.value === 0 && folders.length > 0) {
      selectedFolderId.value = folders[0].id
    }

    // 加载当前选中收藏夹的视频
    if (selectedFolderId.value > 0) {
      selectedFolderVideos.value = await videoStore.getFolderVideos(selectedFolderId.value)
    }
  } catch (e) {
    console.error('加载收藏数据失败:', e)
  }
}

onMounted(() => {
  // onMounted 不再重复调用逻辑 —— watch(uid, { immediate: true }) 已在组件实例化时同步执行一次 initTabFromQuery
  document.body.style.backgroundColor = '#f4f5f7'
  window.addEventListener('scroll', onUserHomeScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onUserHomeScroll)
})

watch(
  () => route.params.uid,
  (newUid) => {
    if (newUid) {
      const parsedUid = Number(newUid)
      // 用户信息单独 await 判断是否存在，不存在则跳转 404；其余加载并行进行，不阻塞 tab 切换
      userStore.getTargetUserInfo(parsedUid).then(() => {
        if (!userStore.targetUser?.uid) {
          router.replace({ name: 'NotFound' })
        }
      })
      userStore.getTargetFollowInfo(parsedUid)
      videoStore.getUserVideoStats(parsedUid)
      selectedFolderId.value = 0
      // 同步先解析 query 设置 tab，不等 getUserVideos 返回 —— 保证打开带 query 的 URL 立即切 tab
      initTabFromQuery()
      // home tab 的 loadHomeData 依赖 userVideoList；其他 tab 让 getUserVideos 在后台跑即可
      const userVideosPromise = videoStore.getUserVideos(parsedUid)
      if (activeTab.value === 'home') {
        userVideosPromise.then(() => loadHomeData(parsedUid))
      }
      loadFolderCount(parsedUid)
      loadUserDynamicCount(parsedUid)
    }
  },
  { immediate: true },
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
  color: @text-2;
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
  color: @text-3;
  display: flex;
  align-items: center;
  gap: 4px;

  .el-icon {
    font-size: 14px;
  }
}

.user-home__level-icon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
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
  padding: 4px 8px;

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
        color: @pink;
      }
    }
  }

  &--active {
    background: #ffe6ef;

    .user-home__stat-value,
    .user-home__stat-label {
      color: @pink;
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
  color: @text-2;
  margin-top: 4px;
}

.user-home__follow-btn {
  display: flex;
  gap: 12px;

  .el-button {
    min-width: 96px;
  }

  .user-home__msg-link {
    text-decoration: none;
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
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 16px 20px;
  font-size: 15px;
  color: @text-2;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;

  &:hover {
    color: @pink;
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
      background: @pink;
      border-radius: 2px;
    }
  }
}

.user-home__tab-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.user-home__tab-count {
  font-size: 12px;
  color: @text-3;
  margin-left: 2px;
  font-weight: normal;
}

.user-home__content {
  background: #fff;
  border-radius: 8px;
  padding: 20px 20px;
  min-height: 300px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.user-home__video {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 20px;
}

/* 主页 Tab 样式：左侧内容 + 右侧占位 */
.user-home__home {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.user-home__home-main {
  flex: 1;
  min-width: 0;
}

.user-home__section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  border-bottom: 1px solid #e5e6eb;

  &:last-child {
    border-bottom: none;
  }
}

.user-home__section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.user-home__section-title {
  font-size: 18px;
  font-weight: 600;
  color: #222;
  margin: 0;
}

.user-home__section-title-separator {
  color: #dcdfe6;
  margin: 0 4px;
}

.user-home__section-title-count {
  color: #909399;
  font-weight: normal;
}

.user-home__section-title-with-sort {
  display: flex;
  align-items: center;
  gap: 24px;
}

.user-home__video-sort {
  display: flex;
  gap: 8px;

  &-item {
    padding: 6px 16px;
    font-size: 13px;
    color: @text-2;
    background: #f4f5f7;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      color: @pink;
    }

    &--active {
      color: #fff;
      background: @pink;

      &:hover {
        color: #fff;
      }
    }
  }
}

.user-home__video-sort-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.user-home__more-link {
  font-size: 13px;
  color: @text-3;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: @pink;
  }
}

/* 置顶视频样式 */
.user-home__pinned-video {
  .user-home__pinned-card {
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
  }

  .user-home__pinned-link {
    display: flex;
    text-decoration: none;
    color: inherit;
    align-items: stretch;
  }

  .user-home__pinned-cover-wrap {
    position: relative;
    width: 25%;
    max-width: 480px;
    min-width: 280px;
    flex-shrink: 0;
    border-radius: 6px;
    overflow: hidden;
    aspect-ratio: 16/9;
  }

  .user-home__pinned-cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .user-home__pinned-duration {
    position: absolute;
    right: 6px;
    bottom: 6px;
    padding: 1px 6px;
    font-size: 12px;
    color: #fff;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 4px;
    line-height: 1.4;
  }

  .user-home__pinned-info {
    flex: 1;
    padding: 12px 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
  }

  .user-home__pinned-title {
    font-size: 18px;
    font-weight: 600;
    color: @text-1;
    margin: 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;

    .user-home__pinned-link:hover & {
      color: #00aeec;
    }
  }

  .user-home__pinned-stats {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 13px;
    color: @text-3;
  }

  .user-home__pinned-stat {
    display: inline-flex;
    align-items: center;
    gap: 4px;

    .el-icon {
      font-size: 14px;
    }
  }

  .user-home__pinned-descr {
    font-size: 13px;
    color: @text-2;
    line-height: 1.6;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .user-home__pinned-actions {
    display: flex;
    gap: 12px;
    margin-top: auto;
    padding-top: 16px;

    .el-button {
      padding: 10px 20px;
    }
  }

  .user-home__pinned-empty-self {
    text-align: center;
    padding: 20px 0;
  }
}

/* 视频网格样式 */
.user-home__video-grid,
.user-home__coin-video-grid,
.user-home__like-video-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  & .el-empty {
    grid-column: 1 / -1;
  }
}

@media (min-width: 1100px) {
  .user-home__video-grid {
    grid-template-columns: repeat(5, 1fr);
  }

  .user-home__video-grid--full {
    grid-template-columns: repeat(5, 1fr);
  }

  .user-home__coin-video-grid,
  .user-home__like-video-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (min-width: 1400px) {
  .user-home__video-grid--full {
    grid-template-columns: repeat(6, 1fr);
  }
}


/* 收藏夹网格样式 */
.user-home__folder-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.user-home__folder-item {
  .user-home__folder-link {
    display: block;
    text-decoration: none;
    color: inherit;
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .user-home__folder-cover {
    position: relative;
    width: 100%;
    aspect-ratio: 16/9;
    background: #f0f0f0;
    overflow: hidden;
  }

  .user-home__folder-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .user-home__folder-placeholder {
    width: 100%;
    height: 100%;
    .flex-center();
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;

    .el-icon {
      font-size: 48px;
    }
  }

  .user-home__folder-info {
    padding: 12px;
  }

  .user-home__folder-name {
    font-size: 14px;
    font-weight: 500;
    color: #222;
    margin: 0 0 4px;
    .ellipsis();
    .user-home__folder-link:hover & {
      color: @pink;
    }
  }

  .user-home__folder-count {
    font-size: 12px;
    color: @text-3;
  }
}

/* 收藏 Tab 样式 */
.user-home__favorites {
  display: flex;
  min-height: 600px;
}

.user-home__favorites-layout {
  display: flex;
  width: 100%;
  gap: 20px;
}

.user-home__favorites-sidebar {
  width: 260px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 8px;
  padding-right: 20px;
  padding-left: 10px;
}

.user-home__favorites-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #222;
    margin: 0;
  }
}

.user-home__favorites-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-home__favorites-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 14px;
  color: @text-2;
  position: relative; /* 添加相对定位 */

  &:hover {
    background: #f7f8fa;
    color: @pink;
  }

  &--active {
    background: #ffe6ef;
    color: @pink;
    font-weight: 500;
  }

  .user-home__favorites-cover-wrap {
    width: 36px;
    height: 36px;
    border-radius: 4px;
    overflow: hidden;
    flex-shrink: 0;
    .flex-center();
    background: #f4f5f7;
  }

  .user-home__favorites-cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .user-home__favorites-icon {
    font-size: 16px;
    color: @text-3;
  }

  .el-icon {
    font-size: 16px;
  }

  .user-home__favorites-count {
    margin-left: auto;
    font-size: 12px;
    color: @text-3;
    opacity: 1;
    transition: opacity 0.2s;
  }

  &:hover .user-home__favorites-count {
    opacity: 0;
  }

  .user-home__favorites-more {
    position: absolute;
    right: 2px;
    width: 28px;
    height: 28px;
    .flex-center();
    opacity: 0;
    transition: opacity 0.2s;
    cursor: pointer;
    color: @text-3;
    border-radius: 4px;
    &-icon{
      width: 15px;
      height: 15px;
    }

    &:hover {
      color: @text-2;
      background: #f4f5f7;
    }
  }

  &:hover .user-home__favorites-more {
    opacity: 1;
  }

  .user-home__favorites-menu {
    position: absolute;
    top: calc(100% + 4px);
    left: 50%;
    transform: translateX(-50%);
    min-width: 120px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    padding: 6px 0;
    z-index: 100;
  }

  .user-home__favorites-menu-item {
    padding: 10px 16px;
    font-size: 15px;
    color: @text-2;
    cursor: pointer;
    text-align: center;
    white-space: nowrap;
    transition: background 0.2s;

    &:hover {
      background: #f7f8fa;
      color: @text-1;
    }
  }

  &--create {
    border: 1px dashed #e5e6eb;

    &:hover {
      background: #f7f8fa;
      border-color: #0077e6;
      color: #0077e6;

      .user-home__favorites-icon {
        color: #0077e6;
      }
    }
  }
}

.user-home__favorites-content {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.user-home__favorites-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e7e7e7;
}

.user-home__favorites-actions {
  display: flex;
  gap: 12px;
}

.user-home__favorites-videos {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.user-home__video-tab {
  display: block;
}

.user-home__dynamic-tab {
  display: block;
}

.user-home__dynamic-layout {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.user-home__dynamic-sidebar {
  width: 150px;
  flex-shrink: 0;
}

.user-home__dynamic-sort {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

// 动态内"全部/视频"两个 tab：高固定 50，宽 150~230
// 宽度按屏幕通过 screen 媒体查询适配（min-width 大的查询写在后面）
.user-home__dynamic-sort-item {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  min-width: 150px;
  max-width: 230px;
}

@media screen and (min-width: 1140px) {
  .user-home__dynamic-sidebar {
    width: 220px;
  }

  .user-home__dynamic-sort-item {
    max-width: 220px;
  }
}

@media screen and (min-width: 1320px) {
  .user-home__dynamic-sidebar {
    width: 230px;
  }

  .user-home__dynamic-sort-item {
    max-width: 230px;
  }
}

.user-home__dynamic-content {
  flex: 1;
  min-width: 0;
}

.user-home__dynamic-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-home__dynamic-more {
  display: flex;
  justify-content: center;
  padding: 16px 0;

  &-tip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #86909c;
  }
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
  text-decoration: none;

  &:hover {
    color: @pink;
  }
}

.user-home__follow-item-desc {
  font-size: 12px;
  color: @text-3;
  .ellipsis();
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

// 新建收藏夹弹窗样式
.create-folder-dialog {
  padding: 20px 0;

  &__icon-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 24px;
  }

  &__icon {
    width: 120px;
    height: 96px;
    background: #f4f5f7;
    border-radius: 8px;
    .flex-center();
    font-size: 32px;
    color: @text-3;
  }

  &__form-item {
    margin-bottom: 20px;
  }

  &__label {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: @text-1;
    margin-bottom: 8px;
  }

  &__required {
    color: #f56c6c;
    margin-left: 4px;
  }

  &__input {
    width: 100%;
  }

  &__input-suffix {
    font-size: 12px;
    color: @text-3;
  }

  &__textarea {
    width: 100%;
    resize: none;
  }

  &__textarea-suffix {
    display: block;
    text-align: right;
    font-size: 12px;
    color: @text-3;
    margin-top: 4px;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 0;
  }

  &__btn {
    width: 110px;
    height: 36px;
    border-radius: 4px;
    font-size: 14px;

    &--cancel {
      border: 1px solid #e5e6eb;
      color: #646a73;
    }

    &--create {
      background: #0077e6;
      border: none;
      color: #fff;

      &:disabled {
        background: #ccc;
        cursor: not-allowed;
      }
    }
  }
}

/* 置顶视频弹窗 */
.pinned-dialog {
  .pinned-dialog__content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .pinned-dialog__search {
    .el-input {
      width: 100%;
    }
  }

  .pinned-dialog__sort {
    display: flex;
    align-items: center;
    justify-content: space-between;

    &-label {
      font-size: 14px;
      font-weight: 600;
      color: @text-1;
    }

    &-select {
      width: 120px;
    }
  }

  .pinned-dialog__list {
    max-height: 400px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .pinned-dialog__item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-bottom: 4px;

    &:hover {
      background-color: #f6f7f8;
    }

    &--active {
      background-color: #e6f4ff;
    }
  }

  .pinned-dialog__radio-placeholder {
    width: 16px;
    height: 16px;
    border: 2px solid #dcdfe6;
    border-radius: 50%;
    flex-shrink: 0;
    .flex-center();
    transition: all 0.2s;
    margin-right: 12px;
  }

  .pinned-dialog__radio-checked {
    width: 8px;
    height: 8px;
    background: #409eff;
    border-radius: 50%;
  }

  .pinned-dialog__item--active .pinned-dialog__radio-placeholder {
    border-color: #409eff;
  }

  .pinned-dialog__cover {
    width: 140px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .pinned-dialog__item-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .pinned-dialog__item-title {
    font-size: 14px;
    color: @text-1;
    font-weight: 500;
    .ellipsis();
  }

  .pinned-dialog__item-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 12px;
    color: @text-3;
  }

  .pinned-dialog__item-stat {
    display: inline-flex;
    align-items: center;
    gap: 3px;

    .el-icon {
      font-size: 13px;
    }
  }

  .pinned-dialog__footer {
    display: flex;
    justify-content: center;
    gap: 20px;

    .el-button {
      min-width: 100px;
    }
  }
}
</style>
