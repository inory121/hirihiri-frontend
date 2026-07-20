<template>
  <div style="min-height: 64px" class="hiri-header__bar">
    <HeaderBar/>
  </div>
  <div class="video-container" v-show="isShow">
    <div class="left-container">
      <div class="video-info-container">
        <div class="video-info-title" :title="videoInfo.video.title">
          <h1 class="video-title">{{ videoInfo.video.title }}</h1>
        </div>
        <div class="video-info-meta">
          <div class="view-item item">
            <el-icon>
              <View/>
            </el-icon>
            <span class="text">{{ videoInfo.stat.view }}</span>
          </div>
          <div class="dm-item item">
            <el-icon>
              <Comment/>
            </el-icon>
            <span class="text">{{ videoInfo.stat.danmaku }}</span>
          </div>
          <div class="createDate-item item">
            {{ formatDateTime(videoInfo.video.createDate) }}
          </div>
          <div class="copyright-item item">
            <el-icon>
              <CircleClose/>
            </el-icon>
            <span class="text">未经作者授权，禁止转载</span>
          </div>
        </div>
      </div>
      <!--播放器-->
      <div class="player-wrap">
        <div ref="playerPlaceholder" class="player-placeholder"></div>
        <div
          :key="videoInfo.video.vid"
          v-if="true"
          ref="danmakuContainer"
          id="danmaku-container"
          class="danmaku-wrap"
          :class="{ 'danmaku-off': !danmakuEnabled }"
        >
          <video ref="plyrPlayer" controls style="width: 100%; height: 100%">
            <source :src="videoInfo.video.videoUrl" type="video/mp4"/>
          </video>
        </div>
      </div>
      <div class="sending-bar">
        <div class="video-info">
          <div class="video-info-online">{{ onlineCount }}人正在看，</div>
          <div class="video-info-dm">已装填{{ danmakuList?.length || 0 }}条弹幕</div>
        </div>
        <div
          class="danmaku-toggle-icon"
          :style="{
            '--icon-url': danmakuEnabled
              ? 'url(https://hirihiri.oss-cn-nanjing.aliyuncs.com/danmuopen.svg)'
              : 'url(https://hirihiri.oss-cn-nanjing.aliyuncs.com/danmuclose.svg)',
          }"
          @click="toggleDanmaku"
          :title="danmakuEnabled ? '关闭弹幕' : '开启弹幕'"
        ></div>
        <div
          class="danmaku-setting-icon"
          @mouseenter="enterSettingsPanel"
          @mouseleave="leaveSettingsPanel"
          title="弹幕设置"
        >
          <div class="setting-icon-mask"></div>
          <div
            v-if="showDanmakuSettings"
            class="danmaku-settings-panel"
            @mouseenter="enterSettingsPanel"
            @mouseleave="leaveSettingsPanel"
          >
            <div class="settings-row">
              <span class="settings-label">字号</span>
              <div class="font-size-buttons">
                <button
                  :class="['font-btn', { active: danmakuFontSize === 18 }]"
                  @click="danmakuFontSize = 18"
                >
                  小
                </button>
                <button
                  :class="['font-btn', { active: danmakuFontSize === 25 }]"
                  @click="danmakuFontSize = 25"
                >
                  标准
                </button>
                <button
                  :class="['font-btn', { active: danmakuFontSize === 32 }]"
                  @click="danmakuFontSize = 32"
                >
                  大
                </button>
              </div>
            </div>
            <div class="settings-row">
              <span class="settings-label">模式</span>
              <div class="mode-buttons">
                <button
                  :class="['mode-btn', { active: danmakuMode === 1 }]"
                  @click="danmakuMode = 1"
                >
                  滚动
                </button>
                <button
                  :class="['mode-btn', { active: danmakuMode === 3 }]"
                  @click="danmakuMode = 3"
                >
                  顶部
                </button>
                <button
                  :class="['mode-btn', { active: danmakuMode === 4 }]"
                  @click="danmakuMode = 4"
                >
                  底部
                </button>
              </div>
            </div>
            <div class="settings-row">
              <span class="settings-label">颜色</span>
              <div class="color-picker">
                <div
                  v-for="color in danmakuColors"
                  :key="color"
                  :class="['color-item', { active: danmakuColor === color }]"
                  :style="{ backgroundColor: color }"
                  @click="danmakuColor = color"
                ></div>
              </div>
            </div>
          </div>
        </div>
        <div class="dm-root">
          <el-input
            style="height: 100%"
            placeholder="发个友善的弹幕见证当下"
            maxlength="100"
            minlength="1"
            v-model="danmaku"
            @keyup.enter="sendDanmaku"
          ></el-input>
          <el-button
            type="primary"
            style="border-radius: 0 8px 8px 0; height: 100%"
            @click="sendDanmaku"
          >发送
          </el-button>
        </div>
      </div>
      <div class="video-toolbar-container">
        <div class="video-toolbar-left">
          <div class="toolbar-left-item-wrap">
            <div class="toolbar-left-item" :class="{ active: videoStore.liked }"
                 @click="handleLike">
              <i class="iconfont icon-dianzan_kuai"
                 :class="{ 'active-icon': videoStore.liked }"></i>
              <span>{{ videoInfo.stat.like }}</span>
            </div>
            <div class="toolbar-left-item" :class="{ active: videoStore.disliked }"
                 @click="handleDislike">
              <i class="iconfont icon-diancai-mian"
                 :class="{ 'active-icon': videoStore.disliked }"></i>
              <span>不喜欢</span>
            </div>
            <div class="toolbar-left-item" :class="{ active: videoStore.coined }"
                 @click="handleCoin">
              <i class="iconfont icon-toubix" :class="{ 'active-icon': videoStore.coined }"></i>
              <span>{{ videoInfo.stat.coin }}</span>
            </div>
            <div class="toolbar-left-item" :class="{ active: videoStore.favorited }"
                 @click="handleCollect">
              <i class="iconfont icon-shoucang1"
                 :class="{ 'active-icon': videoStore.favorited }"></i>
              <span>{{ videoInfo.stat.favorite }}</span>
            </div>
            <div class="toolbar-left-item">
              <i class="iconfont icon-zhuanfa"></i>
              <span>{{ videoInfo.stat.share }}</span>
            </div>
          </div>
        </div>
        <div class="video-toolbar-right"></div>
      </div>
      <el-divider style="margin: 0"/>
      <div class="video-desc-container" v-if="videoInfo.video.descr">
        <div ref="descText" class="desc-info-text" :class="{ expand: isExpanded }">
          {{ videoInfo.video.descr }}
        </div>
        <div class="toggle-btn" @click="toggle" v-if="showToggleBtn">
          <span class="toggle-btn-text">{{ isExpanded ? '收起' : '展开更多' }}</span>
        </div>
      </div>
      <div class="video-tag-container">
        <el-tag v-for="tag in rcmTags" :key="tag" :disable-transitions="false" color="#f5f5f5">
          <router-link :to="`/search/video?keyword=${tag}`">{{ tag }}</router-link>
        </el-tag>
      </div>
      <el-divider style="margin: 10px"/>
      <div class="comment-wrap">
        <div class="header">
          <div class="navbar">
            <div class="title">
              <h2>评论</h2>
              <span class="count">{{ commentStore.total }}</span>
            </div>
            <div class="sort-actions">
              <el-button
                link
                class="sort"
                :class="{ active: commentStore.sort === 'hot' }"
                @click="changeSort('hot')"
              >最热
              </el-button
              >
              <el-divider direction="vertical"/>
              <el-button
                link
                class="sort"
                :class="{ active: commentStore.sort === 'new' }"
                @click="changeSort('new')"
              >最新
              </el-button
              >
            </div>
          </div>
          <div class="commentbox">
            <div class="user-avatar">
              <img v-if="userStore.isLogin" :src="user.avatar" alt=""/>
              <img v-else src="https://hirihiri.oss-cn-nanjing.aliyuncs.com/noface.jpg" alt=""/>
            </div>
            <div class="editor edit" v-if="userStore.isLogin">
              <el-input
                v-model="comment"
                style="height: 50px"
                placeholder="wifi连接中......检测到粉丝评论输出电波......"
              ></el-input>
              <el-button type="primary" size="large" style="margin-left: 10px" @click="sendComment">
                发布
              </el-button>
            </div>
            <div class="edit" v-else>
              <span>请先</span>
              <el-button
                type="primary"
                size="small"
                style="margin: 0 5px"
                @click="userStore.showLoginWindow = !userStore.showLoginWindow"
              >登录
              </el-button>
              <span>后发表评论 (・ω・)</span>
            </div>
          </div>
        </div>
        <div class="contents">
          <div class="feed" :class="{ 'comment-feed--guest': !userStore.isLogin && displayedCommentThreads.length >= 2 }">
            <template v-for="(thread, index) in displayedCommentThreads" :key="thread.rootId">
              <div class="comment-thread" :class="{ 'comment-item-wrapper': !userStore.isLogin && index === 1 }">
                <CommentItem :comment="thread.rootComment"/>
                <CommentItem
                  v-for="reply in thread.visibleReplies"
                  :key="reply.id"
                  :comment="reply"
                />
                <div v-if="thread.totalReplies > COLLAPSED_REPLY_COUNT" class="reply-control">
                  <span v-if="!thread.expanded">共{{ thread.totalReplies }}条回复，</span>
                  <button
                    v-if="!thread.expanded"
                    type="button"
                    class="reply-text-btn expand"
                    @click="expandReplyList(thread.rootId)"
                  >
                    点击查看
                  </button>
                  <div v-else class="reply-pagination">
                    <template v-if="thread.totalPages > 1">
                      <span class="reply-page-total">共{{ thread.totalPages }}页</span>
                      <button
                        v-if="thread.currentPage > 1"
                        type="button"
                        class="reply-text-btn"
                        @click="goPrevReplyPage(thread.rootId, thread.currentPage, thread.totalPages)"
                      >
                        上一页
                      </button>
                      <button
                        v-for="pageItem in thread.pageItems"
                        :key="getReplyPageItemKey(pageItem)"
                        type="button"
                        class="reply-page-btn"
                        :class="{
                          active: pageItem.type === 'page' && pageItem.page === thread.currentPage,
                          ellipsis: pageItem.type === 'ellipsis',
                        }"
                        :disabled="pageItem.type === 'ellipsis'"
                        @click="handleReplyPageItemClick(thread.rootId, pageItem, thread.totalPages)"
                      >
                        {{ getReplyPageItemLabel(pageItem) }}
                      </button>
                      <button
                        v-if="thread.currentPage < thread.totalPages"
                        type="button"
                        class="reply-text-btn"
                        @click="goNextReplyPage(thread.rootId, thread.currentPage, thread.totalPages)"
                      >
                        下一页
                      </button>
                    </template>
                    <button
                      type="button"
                      class="reply-text-btn"
                      @click="collapseReplyList(thread.rootId)"
                    >
                      收起
                    </button>
                  </div>
                </div>
                <div v-if="!userStore.isLogin && index === 1 && commentStore.total > 2" class="comment-fade-mask"></div>
              </div>
            </template>
          </div>
          <!-- 未登录登录提示条 -->
          <div
            v-if="!userStore.isLogin && commentStore.total > 0"
            class="login-comment-tip"
            @click="userStore.showLoginWindow = true"
          >
            登录后查看 {{ commentStore.total }}+ 条评论
          </div>
          <!-- 懒加载哨兵元素 (仅登录用户显示) -->
          <div v-if="userStore.isLogin" ref="commentSentinelRef" class="comment-sentinel"></div>
          <!-- 加载中提示 -->
          <div v-if="commentStore.loading && userStore.isLogin" class="comment-loading">
            <el-icon class="is-loading">
              <Loading/>
            </el-icon>
            <span>加载中...</span>
          </div>
        </div>
        <div class="end" v-if="userStore.isLogin">
          <div v-if="!commentStore.hasMore && commentList.length > 0" class="bottombar">
            没有更多评论
          </div>
          <div v-else-if="!commentStore.loading && commentList.length === 0" class="bottombar">
            暂无评论，快来抢沙发吧~
          </div>
        </div>
      </div>
    </div>
    <div class="right-container">
      <div class="right-container-inner">
        <div class="up-info-container">
          <div class="up-info-left">
            <div class="up-avatar-wrap">
              <UserHoverCard
                :user="videoInfo.user"
                placement="bottom"
                :is-following="upFollowingStatus"
                :like-count="videoInfo.stat?.like ?? 0"
                @follow="handleUpFollow"
              >
                <router-link :to="`/space/${videoInfo.user.uid}`"
                ><img :src="videoInfo.user.avatar" alt=""
                /></router-link>
              </UserHoverCard>
            </div>
          </div>
          <div class="up-info-right">
            <div class="up-info__detail">
              <router-link :to="`/space/${videoInfo.user.uid}`" class="up-name">{{
                  videoInfo.user.username
                }}</router-link>
              <a href="#" class="send-msg">
                <el-icon>
                  <Message/>
                </el-icon>
                发消息
              </a>
              <div class="up-description">{{ videoInfo.user.description }}</div>
            </div>
            <div class="up-info__btn-panel">
              <span class="charge-btn default-btn">
                <el-icon>
                  <CoffeeCup/> </el-icon
                >充电
              </span>
              <el-button
                class="up-follow-btn"
                :type="'default'"
                :disabled="false"
                :plain="false"
                :class="{ 'up-follow-btn--followed': upFollowingStatus }"
                @click="handleUpFollowClick"
              >
                <svg
                  v-if="!upFollowingStatus"
                  class="up-follow-btn__icon"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M7.25098 8.75V13.25C7.25098 13.6642 7.58676 14 8.00098 14C8.41519 14 8.75098 13.6642 8.75098 13.25V8.75H13.251C13.6652 8.75 14.001 8.41421 14.001 8C14.001 7.58579 13.6652 7.25 13.251 7.25H8.75098V2.75C8.75098 2.33579 8.41519 2 8.00098 2C7.58676 2 7.25098 2.33579 7.25098 2.75V7.25H2.75098C2.33676 7.25 2.00098 7.58579 2.00098 8C2.00098 8.41421 2.33676 8.75 2.75098 8.75H7.25098Z"
                    fill="currentColor"
                  />
                </svg>
                <svg
                  v-else
                  class="up-follow-btn__icon"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M2 4C2 3.72386 2.22386 3.5 2.5 3.5H13.5C13.7761 3.5 14 3.72386 14 4C14 4.27614 13.7761 4.5 13.5 4.5H2.5C2.22386 4.5 2 4.27614 2 4ZM2 8C2 7.72386 2.22386 7.5 2.5 7.5H13.5C13.7761 7.5 14 7.72386 14 8C14 8.27614 13.7761 8.5 13.5 8.5H2.5C2.22386 8.5 2 8.27614 2 8ZM2.5 11.5C2.22386 11.5 2 11.7239 2 12C2 12.2761 2.22386 12.5 2.5 12.5H13.5C13.7761 12.5 14 12.2761 14 12C14 11.7239 13.7761 11.5 13.5 11.5H2.5Z"
                    fill="currentColor"
                  />
                </svg>
                {{ upFollowingStatus ? '已关注' : '关注' }} {{ formatNumber(upFanCount) }}
              </el-button>
            </div>
          </div>
        </div>
        <div class="danmaku-box">
          <el-collapse v-model="danmuList">
            <el-collapse-item title="弹幕列表" name="1">
              <el-table
                :data="danmakuList"
                style="width: 100%; font-size: 12px"
                :default-sort="{ prop: 'time', order: 'ascending' }"
                max-height="658px"
              >
                <el-table-column
                  prop="time"
                  label="时间"
                  width="75"
                  sortable
                  show-overflow-tooltip
                  :formatter="timeFormatter"
                />
                <el-table-column prop="content" label="弹幕内容" sortable show-overflow-tooltip/>
                <el-table-column
                  prop="createDate"
                  label="发送时间"
                  width="100"
                  sortable
                  show-overflow-tooltip
                  :formatter="createDateFormatter"
                />
              </el-table>
            </el-collapse-item>
          </el-collapse>
        </div>
        <div class="rec-list">
          <div class="card-box" v-for="list in videoList" :key="list.video.vid">
            <div class="pic-box">
              <router-link :to="`/video/${list.video.vid}`">
                <img :src="list.video.coverUrl" alt=""/>
              </router-link>
              <span class="duration">{{ formatDuration(list.video.duration) }}</span>
            </div>
            <div class="info">
              <router-link :to="`/video/${list.video.vid}`" :title="list.video.title">
                <p class="title">{{ list.video.title }}</p>
              </router-link>
              <div class="upname">
                <router-link :to="`/space/${list.user.uid}`">
                  <!--                  <el-icon class="icon">-->
                  <!--                    <User />-->
                  <!--                  </el-icon>-->
                  <!--                  <span class="up">up</span>-->
                  <img src="https://hirihiri.oss-cn-nanjing.aliyuncs.com/up_pb.svg"/>
                  <span class="name">{{ list.user.username }}</span>
                </router-link>
              </div>
              <div class="playinfo">
                <el-icon class="icon">
                  <View/>
                </el-icon>
                <span class="text">{{ list.stat.view }}</span>
                <el-icon class="icon">
                  <Comment/>
                </el-icon>
                <span class="text">{{ list.stat.danmaku }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 收藏对话框 -->
  <el-dialog
    v-model="showFavoriteDialog"
    title="添加到收藏夹"
    width="420px"
    :close-on-click-modal="false"
  >
    <div class="favorite-dialog-content">
      <div
        v-for="folder in userFavoriteFolders"
        :key="folder.id"
        class="folder-item"
        :class="{ 'folder-item--selected': selectedFolderIds.includes(folder.id) }"
        @click="toggleFolder(folder.id)"
      >
        <el-checkbox
          :model-value="selectedFolderIds.includes(folder.id)"
          class="folder-checkbox"
        >
          <span class="folder-name">{{ folder.name }}</span>
        </el-checkbox>
        <span class="folder-count" @click.stop>{{ folder.isDefault ? folder.videoCount : `${folder.videoCount}/1000` }}</span>
      </div>

      <!-- 新建收藏夹 -->
      <div class="create-folder-section">
        <div v-if="!showCreateFolderForm" class="create-folder-btn" @click="showCreateFolderForm = true">
          <el-icon class="create-folder-icon"><Plus /></el-icon>
          <span>新建收藏夹</span>
        </div>
        <div v-else class="create-folder-form">
          <el-input
            v-model="newFolderName"
            placeholder="请输入收藏夹名称"
            class="folder-name-input"
            @keyup.enter="handleCreateFolder"
          />
          <div class="create-folder-actions">
            <el-button size="small" @click="cancelCreateFolder">取消</el-button>
            <el-button size="small" type="primary" @click="handleCreateFolder">创建</el-button>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <div class="dialog-footer-divider"></div>
        <div class="dialog-footer-actions">
          <el-button @click="showFavoriteDialog = false">取消</el-button>
          <el-button type="primary"  @click="confirmFavorite">确定</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from 'vue'
import {useRoute} from 'vue-router'
import {formatDateTime, formatDuration, formatNumber} from '@/utils/utils'
// 引入Plyr播放器
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'
// 引入弹幕组件
import Danmaku from 'danmaku'
import type {Comment, Danmu, FavoriteFolder} from '@/types/api.ts'
import {CoffeeCup, Loading, Plus} from '@element-plus/icons-vue'
import {ElMessage} from 'element-plus'
import {storeToRefs} from 'pinia'
import {useVideoStore} from '@/stores/videoStore'
import {useDanmakuStore} from '@/stores/danmakuStore.ts'
import {useCommentStore} from '@/stores/commentStore.ts'
import {useUserStore} from '@/stores/userStore.ts'
import {useHistoryStore} from '@/stores/historyStore.ts'
import CommentItem from '@/components/comment-item/CommentItem.vue'
import UserHoverCard from '@/components/user-hover-card/UserHoverCard.vue'

const route = useRoute()
const videoStore = useVideoStore()
const danmakuStore = useDanmakuStore()
const commentStore = useCommentStore()
const userStore = useUserStore()
const historyStore = useHistoryStore()
const {videoInfo, videoList, isShow, onlineCount} = storeToRefs(videoStore)
const {commentList} = storeToRefs(commentStore)
const {danmakuList} = storeToRefs(danmakuStore)
const {user} = storeToRefs(userStore)
const danmuList = ref([])
const rcmTags = ref<string[] | undefined>()
const danmaku = ref('')
const comment = ref('')
const danmakuContainer = ref<HTMLElement>()
const plyrPlayer = ref<HTMLVideoElement>()
const playerPlaceholder = ref<HTMLElement>()
const commentSentinelRef = ref<HTMLElement>()
let commentObserver: IntersectionObserver | null = null
const isExpanded = ref(false) // 视频信息收起状态
const descText = ref<HTMLElement | null>(null)
const showToggleBtn = ref(false)
const hasReportedPlay = ref(false) // 是否已上报播放量
let heartbeatTimer: ReturnType<typeof setInterval> | null = null // 心跳定时器
let handleBeforeUnload: (() => void) | null = null // 页面关闭事件处理函数
let hasSavedInitialRecord = false // 是否已保存过初始历史记录（避免 play 事件重复保存）
let saveDebounceTimer: ReturnType<typeof setTimeout> | null = null // 保存历史记录的防抖计时器
let lastSaveTime = 0 // 上一次保存历史记录的时间戳

const danmakuEnabled = ref(true) // 弹幕开关
const showDanmakuSettings = ref(false) // 设置面板显示状态
let settingsPanelTimer: ReturnType<typeof setTimeout> | null = null

// UP主关注状态和粉丝数
const upFollowingStatus = ref(false)
const upFanCount = ref(0)

// 收藏夹相关状态
const userFavoriteFolders = ref<FavoriteFolder[]>([])
const showFavoriteDialog = ref(false)
const selectedFolderIds = ref<number[]>([])
const showCreateFolderForm = ref(false)
const newFolderName = ref('')

const COLLAPSED_REPLY_COUNT = 2
const REPLY_PAGE_SIZE = 10

type CommentWithLevel = Comment & { level: number }
type ReplyDisplayState = {
  expanded: boolean
  page: number
}
type ReplyPageItem = { type: 'page'; page: number } | { type: 'ellipsis'; key: string }
type CommentThreadView = {
  rootComment: Comment
  rootId: number
  visibleReplies: CommentWithLevel[]
  totalReplies: number
  expanded: boolean
  currentPage: number
  totalPages: number
  pageItems: ReplyPageItem[]
}

const replyDisplayState = ref<Record<number, ReplyDisplayState>>({})

// 加载当前视频 UP主的关注状态和粉丝数
const loadUpFollowInfo = async () => {
  if (!videoInfo.value?.user?.uid) return
  const upUid = videoInfo.value.user.uid
  // 加载粉丝数
  const countRes = await userStore.getFollowCount(upUid)
  if (countRes !== null && countRes !== undefined) {
    upFanCount.value = countRes
  }
  // 加载关注状态（已登录且不是自己时）
  if (userStore.isLogin && user.value.uid && user.value.uid !== upUid) {
    const status = await userStore.getFollowStatus(upUid)
    if (status !== null && status !== undefined) {
      upFollowingStatus.value = status
    }
  } else {
    upFollowingStatus.value = false
  }
}

// 关注按钮点击处理（未登录/自己/他人三种情况）
const handleUpFollowClick = () => {
  // 未登录 → 弹出登录框
  if (!userStore.isLogin) {
    userStore.showLoginWindow = true
    return
  }
  // 自己的视频 → 提示不能关注自己
  if (user.value.uid === videoInfo.value?.user?.uid) {
    ElMessage.warning('不能关注自己')
    return
  }
  // 关注/取消关注
  handleUpFollow()
}

// 点击UP主关注按钮切换关注状态
const handleUpFollow = async () => {
  if (!videoInfo.value?.user?.uid) return
  const upUid = videoInfo.value.user.uid
  const wasFollowing = upFollowingStatus.value
  await userStore.toggleFollow(upUid)
  // 根据之前的状态反转显示和粉丝数
  upFollowingStatus.value = !wasFollowing
  if (wasFollowing) {
    upFanCount.value = Math.max(0, upFanCount.value - 1)
  } else {
    upFanCount.value += 1
  }
}

const enterSettingsPanel = () => {
  if (settingsPanelTimer) {
    clearTimeout(settingsPanelTimer)
    settingsPanelTimer = null
  }
  showDanmakuSettings.value = true
}

const leaveSettingsPanel = () => {
  settingsPanelTimer = setTimeout(() => {
    showDanmakuSettings.value = false
  }, 200)
}
const danmakuFontSize = ref(25) // 弹幕字号：18=小，25=标准，32=大
const danmakuMode = ref<1 | 2 | 3 | 4>(1) // 弹幕模式：1=rtl(从右到左滚动)，2=ltr(从左到右滚动)，3=top(顶部)，4=bottom(底部)
const danmakuColor = ref('#FFFFFF') // 弹幕颜色
const danmakuColors = ref([
  '#FFFFFF',
  '#FE0302',
  '#FF7204',
  '#FFAA02',
  '#FFD302',
  '#FFFF00',
  '#A0EE00',
  '#00CD00',
  '#019899',
  '#4266BE',
  '#89D5FF',
  '#CC0273',
  '#222222',
]) // 弹幕可选颜色

const toggleDanmaku = () => {
  danmakuEnabled.value = !danmakuEnabled.value
}

// 获取或生成观众ID (优先用uid,未登录则用cookie UUID)
const getViewerId = (): string => {
  if (userStore.isLogin && user.value.uid) {
    return `user:${user.value.uid}`
  }
  // 未登录: 使用 localStorage 存储的 UUID
  let viewerId = localStorage.getItem('viewer_id')
  if (!viewerId) {
    viewerId = `guest:${crypto.randomUUID()}`
    localStorage.setItem('viewer_id', viewerId)
  }
  return viewerId
}

function flattenComments(comments: Comment[], level: number = 0): CommentWithLevel[] {
  let result: CommentWithLevel[] = []

  for (const comment of comments) {
    // 添加当前层级信息
    const commentWithLevel = {...comment, level}

    // 如果存在子评论，递归处理
    if (comment.replies && comment.replies.length > 0) {
      result = [...result, commentWithLevel, ...flattenComments(comment.replies, level + 1)]
    } else {
      result = [...result, commentWithLevel]
    }
  }

  return result
}

// 扁平化评论列表（自动响应 commentList 变化）
const flatComments = computed(() => {
  return flattenComments(commentList.value)
})

const clampReplyPage = (page: number, totalPages: number) => {
  return Math.min(Math.max(page, 1), Math.max(totalPages, 1))
}

const getReplyPageItems = (currentPage: number, totalPages: number): ReplyPageItem[] => {
  if (totalPages <= 7) {
    return Array.from({length: totalPages}, (_, index) => ({type: 'page', page: index + 1}))
  }

  if (currentPage <= 4) {
    return [
      ...Array.from({length: 5}, (_, index) => ({type: 'page' as const, page: index + 1})),
      {type: 'ellipsis', key: 'ellipsis-end'},
      {type: 'page', page: totalPages},
    ]
  }

  if (currentPage >= totalPages - 3) {
    return [
      {type: 'page', page: 1},
      {type: 'ellipsis', key: 'ellipsis-start'},
      ...Array.from({length: 5}, (_, index) => ({
        type: 'page' as const,
        page: totalPages - 4 + index,
      })),
    ]
  }

  return [
    {type: 'page', page: 1},
    {type: 'ellipsis', key: 'ellipsis-start'},
    {type: 'page', page: currentPage - 1},
    {type: 'page', page: currentPage},
    {type: 'page', page: currentPage + 1},
    {type: 'ellipsis', key: 'ellipsis-end'},
    {type: 'page', page: totalPages},
  ]
}

const getReplyPageItemKey = (pageItem: ReplyPageItem) => {
  return pageItem.type === 'page' ? `page-${pageItem.page}` : pageItem.key
}

const getReplyPageItemLabel = (pageItem: ReplyPageItem) => {
  return pageItem.type === 'page' ? String(pageItem.page) : '...'
}

const setReplyListState = (rootId: number, expanded: boolean, page: number = 1) => {
  replyDisplayState.value[rootId] = {expanded, page}
}

const expandReplyList = (rootId: number) => {
  setReplyListState(rootId, true)
}

const collapseReplyList = (rootId: number) => {
  setReplyListState(rootId, false)
}

const setReplyPage = (rootId: number, page: number, totalPages: number) => {
  setReplyListState(rootId, true, clampReplyPage(page, totalPages))
}

const goNextReplyPage = (rootId: number, currentPage: number, totalPages: number) => {
  setReplyPage(rootId, currentPage + 1, totalPages)
}

const goPrevReplyPage = (rootId: number, currentPage: number, totalPages: number) => {
  setReplyPage(rootId, currentPage - 1, totalPages)
}

const handleReplyPageItemClick = (rootId: number, pageItem: ReplyPageItem, totalPages: number) => {
  if (pageItem.type === 'page') {
    setReplyPage(rootId, pageItem.page, totalPages)
  }
}

const commentThreads = computed<CommentThreadView[]>(() => {
  return commentList.value.map((rootComment) => {
    const rootId = rootComment.id ?? 0
    const replies = flattenComments(rootComment.replies ?? [], 1)
    const totalReplies = replies.length
    const totalPages = Math.max(1, Math.ceil(totalReplies / REPLY_PAGE_SIZE))
    const state = replyDisplayState.value[rootId] ?? {expanded: false, page: 1}
    const currentPage = clampReplyPage(state.page, totalPages)
    const visibleReplies = state.expanded
      ? replies.slice((currentPage - 1) * REPLY_PAGE_SIZE, currentPage * REPLY_PAGE_SIZE)
      : replies.slice(0, COLLAPSED_REPLY_COUNT)

    return {
      rootComment,
      rootId,
      visibleReplies,
      totalReplies,
      expanded: state.expanded,
      currentPage,
      totalPages,
      pageItems: getReplyPageItems(currentPage, totalPages),
    }
  })
})

const displayedCommentThreads = computed<CommentThreadView[]>(() => {
  if (userStore.isLogin) {
    return commentThreads.value
  }
  return commentThreads.value.slice(0, 2)
})

const createDateFormatter = (row: Danmu) => {
  return formatDateTime(row.createDate, 'MM-DD HH:mm')
}
const timeFormatter = (row: Danmu) => {
  return formatDuration(row.time)
}
// const isDestroyed = ref(false)
let danmakuInstance: Danmaku | null = null
let resizeObserver: ResizeObserver | null = null
let player: Plyr | null = null

// 上报播放量
const reportPlayCount = async () => {
  if (!videoInfo.value.video.vid) return
  await videoStore.reportPlay(videoInfo.value.video.vid)
}

// 保存播放进度（防抖：避免快速操作如进度条跳转触发多次保存）
const savePlayProgress = () => {
  if (!player || !videoInfo.value.video.vid || !userStore.isLogin) return
  const currentTime = Math.floor(player.currentTime)
  if (currentTime <= 0) return
  if (saveDebounceTimer) clearTimeout(saveDebounceTimer)
  saveDebounceTimer = setTimeout(() => {
    historyStore.saveHistory(videoInfo.value.video.vid, currentTime)
  }, 1000)
}

// 立即保存（用于页面离开等不能等待防抖的场景）
const savePlayProgressImmediate = () => {
  if (saveDebounceTimer) {
    clearTimeout(saveDebounceTimer)
    saveDebounceTimer = null
  }
  if (!player || !videoInfo.value.video.vid || !userStore.isLogin) return
  const currentTime = Math.floor(player.currentTime)
  if (currentTime > 0) {
    historyStore.saveHistory(videoInfo.value.video.vid, currentTime)
  }
}

const sendComment = async () => {
  if (!videoInfo.value.video.vid || !comment.value.trim()) return
  const newComment = await commentStore.sendComment({
    vid: videoInfo.value.video.vid,
    uid: user.value.uid,
    content: comment.value,
    isTop: 0,
    rootId: 0,
    parentId: 0,
    toUserId: videoInfo.value.user.uid,
  })
  if (newComment) {
    await commentStore.getComment(videoInfo.value.video.vid)
    comment.value = ''
    // currentReplyCommentId.value = null // 隐藏回复框
  }
}
// 切换评论排序
const changeSort = async (sort: 'hot' | 'new') => {
  if (commentStore.sort === sort) return
  commentStore.setSort(sort)
  if (videoInfo.value.video.vid) {
    await commentStore.getComment(videoInfo.value.video.vid)
  }
}

// 初始化评论懒加载观察器
const initCommentObserver = () => {
  if (commentObserver) {
    commentObserver.disconnect()
    commentObserver = null
  }
  if (!commentSentinelRef.value) return
  const loadMoreIfNeeded = () => {
    if (commentStore.hasMore && !commentStore.loading) {
      const vid = videoInfo.value?.video?.vid
      if (vid) {
        commentStore.loadMoreComments(vid)
      }
    }
  }
  commentObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadMoreIfNeeded()
      }
    },
    {rootMargin: '200px'}
  )
  commentObserver.observe(commentSentinelRef.value)
  setTimeout(() => {
    if (commentSentinelRef.value) {
      const rect = commentSentinelRef.value.getBoundingClientRect()
      const isVisible = rect.top < window.innerHeight + 200 && rect.bottom > 0
      if (isVisible) {
        loadMoreIfNeeded()
      }
    }
  }, 100)
}
// 点赞
const handleLike = () => {
  if (videoInfo.value.video.vid) {
    videoStore.toggleLike(videoInfo.value.video.vid)
  }
}
// 点踩
const handleDislike = () => {
  if (videoInfo.value.video.vid) {
    videoStore.toggleDislike(videoInfo.value.video.vid)
  }
}
// 投币
const handleCoin = () => {
  if (videoInfo.value.video.vid) {
    videoStore.toggleCoin(videoInfo.value.video.vid)
  }
}
// 收藏
const handleCollect = async () => {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    return
  }

  const vid = videoInfo.value.video.vid
  if (!vid) return

  // 加载收藏夹列表（传入当前视频ID以获取收藏状态）
  await loadUserFavoriteFolders(vid)

  // 初始化选中的收藏夹（根据后端返回的 collected 状态）
  selectedFolderIds.value = userFavoriteFolders.value
    .filter(folder => folder.collected)
    .map(folder => folder.id)

  showFavoriteDialog.value = true
}

// 确认收藏操作
const confirmFavorite = async () => {
  const vid = videoInfo.value.video.vid
  if (!vid) return

  try {
    // 获取当前已收藏的收藏夹
    const currentFolders = new Set(selectedFolderIds.value)
    const previousFolders = new Set(
      userFavoriteFolders.value
        .filter(f => f.collected)
        .map(f => f.id)
    )

    // 记录操作前的收藏状态
    const wasFavorited = previousFolders.size > 0

    // 找出需要添加的收藏夹
    const toAdd = selectedFolderIds.value.filter(id => !previousFolders.has(id))
    // 找出需要移除的收藏夹
    const toRemove = userFavoriteFolders.value
      .map(f => f.id)
      .filter(id => !currentFolders.has(id) && previousFolders.has(id))

    // 执行添加操作
    for (const folderId of toAdd) {
      await videoStore.collectToFolder(vid, folderId)
    }

    // 执行移除操作（不更新计数，统一在最后处理）
    for (const folderId of toRemove) {
      await videoStore.removeFromFolder(vid, folderId, false)
    }

    // 更新状态
    const isNowFavorited = selectedFolderIds.value.length > 0
    videoStore.favorited = isNowFavorited

    // 如果从未收藏变为收藏，增加视频收藏数
    if (!wasFavorited && isNowFavorited) {
      videoStore.videoInfo.stat.favorite += 1
    }

    // 如果从收藏变为未收藏，减少视频收藏数
    if (wasFavorited && !isNowFavorited) {
      videoStore.videoInfo.stat.favorite -= 1
    }

    // 重新加载收藏夹列表以更新计数
    await loadUserFavoriteFolders()

    showFavoriteDialog.value = false
    ElMessage.success('操作成功')
  } catch (e) {
    console.error('收藏操作失败:', e)
    ElMessage.error('操作失败')
  }
}

// 切换收藏夹选中状态
const toggleFolder = (folderId: number) => {
  const index = selectedFolderIds.value.indexOf(folderId)
  if (index > -1) {
    selectedFolderIds.value.splice(index, 1)
  } else {
    selectedFolderIds.value.push(folderId)
  }
}

// 创建新收藏夹
const handleCreateFolder = async () => {
  const name = newFolderName.value.trim()
  if (!name) {
    ElMessage.warning('请输入收藏夹名称')
    return
  }

  const newFolder = await videoStore.createFolder(name)
  if (newFolder) {
    // 添加到收藏夹列表
    userFavoriteFolders.value.push(newFolder)
    // 自动选中新创建的收藏夹
    selectedFolderIds.value.push(newFolder.id)
    // 重置表单
    showCreateFolderForm.value = false
    newFolderName.value = ''
  }
}

// 取消创建收藏夹
const cancelCreateFolder = () => {
  showCreateFolderForm.value = false
  newFolderName.value = ''
}

// 加载用户收藏夹列表
const loadUserFavoriteFolders = async (vid?: number) => {
  if (!userStore.isLogin) return

  try {
    userFavoriteFolders.value = await videoStore.getUserFavoriteFolders(vid)
  } catch (e) {
    console.error('加载收藏夹列表失败:', e)
  }
}
// 初始化播放器
const initPlayer = async () => {
  try {
    console.log('开始创建播放器')
    if (!plyrPlayer.value) return

    player = new Plyr(plyrPlayer.value, {
      fullscreen: {
        container: '#danmaku-container', // 使用弹幕容器作为全屏元素，使弹幕一起全屏
      },
      controls: [
        'play-large', // 播放按钮，通常位于视频中心
        'restart', // 重新开始播放的按钮
        'rewind', // 快退按钮，默认快退 10 秒
        'play', // 播放/暂停按钮
        'fast-forward', // 快进按钮，默认快进 10 秒
        'progress', // 进度条，用于显示播放进度和缓冲状态
        'current-time', // 当前播放时间
        'duration', //视频总时长
        'mute', // 静音切换按钮
        'volume', // 音量控制滑块
        'captions', // 字幕切换按钮
        'settings', // 设置菜单（如速度、质量等）
        'pip', // 画中画模式（仅支持部分浏览器，如 Safari）
        'airplay', // AirPlay 按钮（仅支持部分设备，如 Apple 设备）
        'download', //下载按钮，允许用户下载当前视频
        'fullscreen', // 全屏切换按钮
      ],
      ratio: '16:9',
      i18n: {
        restart: '重新开始',
        rewind: '快退 {seektime} 秒',
        play: '播放',
        pause: '暂停',
        fastForward: '快进 {seektime} 秒',
        seek: '跳转',
        played: '已播放',
        buffered: '已缓冲',
        currentTime: '当前时间',
        duration: '总时长',
        volume: '音量',
        mute: '静音',
        unmute: '取消静音',
        enableCaptions: '启用字幕',
        disableCaptions: '关闭字幕',
        enterFullscreen: '进入全屏',
        exitFullscreen: '退出全屏',
        frameTitle: '{title} 的播放器',
        captions: '字幕',
        settings: '设置',
        speed: '播放速度',
        normal: '正常',
        quality: '画质',
        loop: '循环播放',
        start: '开始',
        end: '结束',
        all: '全部',
        reset: '重置',
        disabled: '不可用',
        advertisement: '广告',
        pip: '画中画',
        download: '下载',
      },
      // settings: ['captions', 'quality', 'speed', 'loop'],
      seekTime: 5, // 快进时间
      // disableContextMenu:false, // 禁用右键菜单
      tooltips: {
        controls: true, // 显示控制栏提示
        seek: true, // 显示快进提示
      },
      loop: {
        active: true, // 循环播放
      },
    })

    player.on('ready', () => {
      if (playerPlaceholder.value) {
        playerPlaceholder.value.style.display = 'none' // 隐藏占位元素
      }
    })
    player.on('error', () => {
      if (playerPlaceholder.value) {
        playerPlaceholder.value.style.display = 'block' // 显示占位元素
        playerPlaceholder.value.innerHTML = '视频加载失败，请刷新重试'
      }
    })
    player.on('loadedmetadata', async () => {
      // 恢复播放进度（仅已登录用户）
      if (userStore.isLogin) {
        const progress = await historyStore.getVideoProgress(videoInfo.value.video.vid)
        if (progress > 0 && progress < videoInfo.value.video.duration) {
          player?.forward(progress)
        }
      }
      player?.play()
    })

    // 监听播放进度,当播放达到3秒时上报播放量
    player.on('timeupdate', () => {
      if (player && player.currentTime >= 3 && !hasReportedPlay.value) {
        reportPlayCount()
        hasReportedPlay.value = true
      }
    })

    // 首次播放时立即保存历史记录（绕过 currentTime 检查，避免刚播放时 currentTime=0 导致保存失败）
    player.on('play', () => {
      if (!hasSavedInitialRecord && videoInfo.value.video.vid && userStore.isLogin) {
        hasSavedInitialRecord = true
        historyStore.saveHistory(videoInfo.value.video.vid, 0)
      }
    })

    // 暂停时保存进度（防抖）
    player.on('pause', () => {
      savePlayProgress()
    })

    // 监听播放进度变化，定时保存浏览历史（每30秒）
    player.on('timeupdate', () => {
      if (player && userStore.isLogin) {
        const currentTime = Math.floor(player.currentTime)
        if (currentTime > 0 && currentTime - lastSaveTime >= 30) {
          historyStore.saveHistory(videoInfo.value.video.vid, currentTime)
          lastSaveTime = currentTime
        }
      }
    })

    console.log('创建播放器成功')
  } catch (error) {
    console.error('播放器初始化失败：', error)
  }
}
// 销毁播放器
const disposePlayer = () => {
  console.log('销毁播放器')
  player?.destroy()
  player = null
  console.log('销毁播放器成功')
}

const toggle = () => {
  isExpanded.value = !isExpanded.value
}
const sendDanmaku = async () => {
  if (!videoInfo.value.video.vid || !danmaku.value.trim()) return
  const newDanmaku = await danmakuStore.sendDanmaku({
    vid: videoInfo.value.video.vid,
    uid: videoInfo.value.user.uid,
    content: danmaku.value,
    time: player?.currentTime || 0,
    color: danmakuColor.value,
    state: 1,
    mode: danmakuMode.value,
    fontsize: danmakuFontSize.value,
  })
  if (newDanmaku) {
    danmakuList.value.push(newDanmaku)
    // 立即显示到视频上
    if (danmakuInstance && danmakuEnabled.value) {
      const modeMap: Record<number, 'rtl' | 'ltr' | 'top' | 'bottom'> = {
        1: 'rtl',
        2: 'ltr',
        3: 'top',
        4: 'bottom',
      }
      danmakuInstance.emit({
        mode: modeMap[newDanmaku.mode] ?? 'rtl',
        text: newDanmaku.content,
        style: {
          font: `${newDanmaku.fontsize}px sans-serif`,
          fillStyle: newDanmaku.color,
          textBaseline: newDanmaku.mode === 3 ? 'top' : 'bottom',
        },
      })
    }
    danmaku.value = ''
  }
}
watch([() => route.params.vid], async ([newVid], [oldVid]) => {
  if (newVid && newVid !== oldVid) {
    hasReportedPlay.value = false
    hasSavedInitialRecord = false // 重置历史记录保存标志，新视频可以再次立即保存
    lastSaveTime = 0 // 重置定时保存时间戳
    if (saveDebounceTimer) {
      clearTimeout(saveDebounceTimer) // 清理防抖计时器
      saveDebounceTimer = null
    }

    // 1. 显示占位遮罩，避免看到 DOM 重建时裸 video 的尺寸闪烁
    if (playerPlaceholder.value) {
      playerPlaceholder.value.style.display = 'block'
      playerPlaceholder.value.innerHTML = ''
    }

    // 2. 在旧 DOM 上先清理所有实例（disposeDanmaku 会同时清理 resizeObserver）
    disposeDanmaku()
    disposePlayer()

    // 3. 加载新视频信息和评论
    await videoStore.getVideo(Number(newVid))
    await videoStore.getInteractionStatus(Number(newVid))
    await commentStore.getComment(Number(newVid))
    await loadUpFollowInfo()

    // 3. 等待 Vue 根据 key 完成 DOM 重建（danmaku-wrap 和 video 都是全新的 DOM 元素）
    await nextTick()

    // 4. 在全新的 video 元素上重新初始化 Plyr（不会有样式冲突问题）
    await initPlayer()

    // 5. 初始化弹幕（initDanmaku 内部会等待视频元数据加载完成）
    await initDanmaku(Number(newVid))

    // 6. 重新初始化评论懒加载
    initCommentObserver()

    // 7. 更新其他状态
    rcmTags.value = videoInfo.value.video?.tags?.split('\n')
    if (descText.value) {
      const height = descText.value.scrollHeight
      console.log('评论高度：', height)
      showToggleBtn.value = height > 84
      isExpanded.value = false
    }
  }
})

watch(
  () => userStore.isLogin,
  async (newIsLogin, oldIsLogin) => {
    if (newIsLogin && !oldIsLogin) {
      await nextTick()
      initCommentObserver()
    }
  }
)
const initDanmaku = async (vid: number) => {
  console.log('开始创建弹幕实例')
  if (danmakuContainer.value && plyrPlayer.value) {
    // 等待视频元数据加载完成（danmaku.js 创建时需要正确的 duration）
    if (plyrPlayer.value.readyState < 1) {
      await new Promise<void>((resolve) => {
        const handler = () => {
          plyrPlayer.value?.removeEventListener('loadedmetadata', handler)
          resolve()
        }
        plyrPlayer.value?.addEventListener('loadedmetadata', handler)
        setTimeout(resolve, 2000)
      })
    }

    resizeObserver = new ResizeObserver(() => {
      danmakuInstance?.resize()
    })
    resizeObserver.observe(danmakuContainer.value)
    await danmakuStore.getDanmaku(vid)
    const comments = danmakuList.value || []
    danmakuInstance = new Danmaku({
      container: danmakuContainer.value,
      media: plyrPlayer.value,
      engine: 'canvas',
      speed: 60,
      comments: comments.map((dm) => {
        const modeMap = {
          1: 'rtl',
          2: 'ltr',
          3: 'top',
          4: 'bottom',
        } as const

        return {
          mode: (modeMap[dm.mode as 1 | 2 | 3 | 4] ?? 'rtl') as 'rtl' | 'ltr' | 'top' | 'bottom',
          text: dm.content,
          time: dm.time,
          style: {
            font: `${dm.fontsize}px sans-serif`,
            fillStyle: dm.color,
            textBaseline: dm.mode === 3 ? 'top' : 'bottom',
          },
        }
      }),
    })
  }
  console.log('创建弹幕实例成功')
}
const disposeDanmaku = () => {
  console.log('开始销毁弹幕实例')
  if (danmakuInstance) {
    danmakuInstance.destroy()
    danmakuInstance = null
  }
  // 清理 ResizeObserver（之前未清理，会导致观察者泄漏）
  resizeObserver?.disconnect()
  resizeObserver = null
  console.log('销毁弹幕实例成功')
}
onMounted(async () => {
  const vid = Number(route.params.vid)
  if (!isNaN(vid)) {
    await videoStore.getRecommendVideo()
    await videoStore.getVideo(vid)
    await videoStore.getInteractionStatus(vid)
    await commentStore.getComment(vid)
    await loadUpFollowInfo()
    // 加载用户收藏夹列表
    await loadUserFavoriteFolders()
  }
  rcmTags.value = videoInfo.value.video.tags?.split('\n')
  await initPlayer()
  await initDanmaku(vid)
  if (descText.value) {
    const height = descText.value.scrollHeight
    showToggleBtn.value = height > 84
  }

  // 初始化评论懒加载
  await nextTick()
  initCommentObserver()

  // 启动在线人数心跳 (每30秒一次)
  const viewerId = getViewerId()
  const currentVid = Number(route.params.vid)
  if (!isNaN(currentVid)) {
    // 立即发一次
    await videoStore.sendHeartbeat(currentVid, viewerId)
    // 每30秒发一次
    heartbeatTimer = setInterval(() => {
      videoStore.sendHeartbeat(currentVid, viewerId)
    }, 30_000)
  }

  // 页面关闭/刷新时保存进度（浏览器即将关闭，必须立即保存）
  handleBeforeUnload = () => {
    savePlayProgressImmediate()
  }
  window.addEventListener('beforeunload', handleBeforeUnload)
})
onUnmounted(() => {
  // 离开页面时保存进度（组件即将卸载，必须立即保存）
  savePlayProgressImmediate()
  resizeObserver?.disconnect() // 清理监听
  danmakuInstance?.destroy()
  disposePlayer()
  // 清理评论懒加载观察器
  commentObserver?.disconnect()
  commentObserver = null
  // 清理心跳定时器
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
  // 清理页面关闭事件监听
  if (handleBeforeUnload) {
    window.removeEventListener('beforeunload', handleBeforeUnload)
    handleBeforeUnload = null
  }
})

</script>
<style scoped lang="less">
// 收藏对话框样式
.favorite-dialog-content {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px 0;

  .folder-item {
    padding: 10px 12px;
    cursor: pointer;
    border-radius: 4px;
    margin: 0 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &:hover {
      background-color: #f4f5f7;
    }

    &--selected {
      .folder-checkbox {
        :deep(.el-checkbox__label) {
          .folder-name {
            color: #0077e6;
          }
        }
      }
    }

    .folder-checkbox {
      :deep(.el-checkbox__inner) {
        width: 16px;
        height: 16px;
        border-radius: 4px;
      }

      :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
        background-color: #0077e6;
        border-color: #0077e6;
      }

      :deep(.el-checkbox__label) {
        font-size: 14px;
        color: #18191c;
        padding-left: 10px;
      }

      .folder-name {
        font-size: 14px;
        color: #18191c;
      }
    }

    .folder-count {
      font-size: 14px;
      color: #9499a0;
    }
  }

  // 新建收藏夹区域
  .create-folder-section {
    padding: 10px 12px;
    margin: 0 8px;

    .create-folder-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px;
      border: 1px dashed #d9d9d9;
      border-radius: 4px;
      cursor: pointer;
      color: #9499a0;
      font-size: 14px;
      transition: all 0.2s;

      &:hover {
        border-color: #0077e6;
        color: #0077e6;
      }

      .create-folder-icon {
        font-size: 16px;
      }
    }

    .create-folder-form {
      display: flex;
      flex-direction: column;
      gap: 10px;

      .folder-name-input {
        width: 100%;
      }

      .create-folder-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;

        :deep(.el-button) {
          padding: 6px 16px;
        }
      }
    }
  }
}

// 对话框底部样式
.dialog-footer {
  padding: 0;

  .dialog-footer-divider {
    height: 1px;
    background-color: #f1f2f3;
    margin: 0 -20px;
  }

  .dialog-footer-actions {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 15px 0;

    :deep(.el-button) {
      width: 90px;
      height: 36px;
      border-radius: 4px;

      &--primary:disabled {
        background-color: #f4f5f7;
        border-color: #e5e6eb;
        color: #b8bac3;
        cursor: not-allowed;
      }
    }
  }
}

.iconfont {
  font-size: 28px;
  margin-right: 8px;
}

.hiri-header__bar {
  --text-color: #18191c;
  --header-shadow: 0 2px 4px #00000014;
  --bg-color: #fff;
}

.video-container {
  height: 100%;
  display: flex;
  justify-content: center;
  padding: 0 10px;

  .left-container {
    width: 65%;
    height: 100%;
    min-width: 668px;

    .video-info-container {
      height: 104px;
      padding-top: 22px;

      .video-info-title {
        .video-title {
          font-size: 20px;
          font-weight: 500;
          color: #18191c;
          line-height: 28px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .video-info-meta {
        display: flex;
        font-size: 13px;
        color: #9499a0;
        margin-top: 10px;
        margin-left: 5px;

        .item {
          display: flex;
          align-items: center;
          margin-right: 12px;

          .text {
            margin-left: 5px;
          }
        }
      }
    }

    .player-wrap {
      position: relative;
      height: 0;
      padding-bottom: 56.25%;
      width: 100%;

      .player-placeholder {
        width: 100%;
        height: 100%;
        position: absolute;
        background-color: #000;
        z-index: 1;
      }

      .danmaku-wrap {
        position: absolute;
        width: 100%;
        height: 100%;

        // 全屏时弹幕容器铺满整个视口
        &:fullscreen {
          width: 100%;
          height: 100%;
          position: relative;
          background-color: #000;
        }

        &.danmaku-off :deep(canvas) {
          display: none !important;
        }
      }

      :deep(.plyr) {
        position: absolute;
        width: 100%;
      }
    }

    .sending-bar {
      box-shadow: 0 0 8px var(--bpx-box-shadow, #e5e9ef);
      display: flex;
      align-items: center;
      padding: 0 12px;
      height: 46px;
      font-size: 13px;
      justify-content: flex-start;

      .danmaku-toggle-icon {
        width: 24px;
        height: 24px;
        margin-right: 12px;
        cursor: pointer;
        background-color: #61666d;
        -webkit-mask-image: var(--icon-url);
        mask-image: var(--icon-url);
        -webkit-mask-size: contain;
        mask-size: contain;
        -webkit-mask-repeat: no-repeat;
        mask-repeat: no-repeat;
        -webkit-mask-position: center;
        mask-position: center;
        transition: background-color 0.2s;

        &:hover {
          background-color: #fb7299;
        }
      }

      .danmaku-setting-icon {
        width: 24px;
        height: 24px;
        margin-right: 12px;
        cursor: pointer;
        position: relative;

        .setting-icon-mask {
          width: 100%;
          height: 100%;
          background-color: #61666d;
          -webkit-mask-image: url('https://hirihiri.oss-cn-nanjing.aliyuncs.com/danmusetting.svg');
          mask-image: url('https://hirihiri.oss-cn-nanjing.aliyuncs.com/danmusetting.svg');
          -webkit-mask-size: contain;
          mask-size: contain;
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          -webkit-mask-position: center;
          mask-position: center;
          transition: background-color 0.2s;
        }

        &:hover .setting-icon-mask {
          background-color: #fb7299;
        }

        .danmaku-settings-panel {
          position: absolute;
          bottom: 46px;
          left: 50%;
          transform: translateX(-50%);
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 0 12px rgba(0, 0, 0, 0.2);
          padding: 12px 16px;
          z-index: 100;
          min-width: 260px;

          .settings-row {
            display: flex;
            align-items: center;
            margin-bottom: 10px;

            &:last-child {
              margin-bottom: 0;
            }

            .settings-label {
              font-size: 13px;
              color: #61666d;
              margin-right: 12px;
              min-width: 40px;
            }

            .font-size-buttons,
            .mode-buttons {
              display: flex;
              gap: 4px;
            }

            .font-btn,
            .mode-btn {
              padding: 4px 12px;
              font-size: 12px;
              border: 1px solid #e5e9ef;
              background: #fff;
              color: #61666d;
              border-radius: 4px;
              cursor: pointer;
              transition: all 0.2s;

              &:hover {
                border-color: #fb7299;
                color: #fb7299;
              }

              &.active {
                background: #fb7299;
                color: #fff;
                border-color: #fb7299;
              }
            }

            .color-picker {
              display: flex;
              flex-wrap: wrap;
              gap: 6px;
              max-width: 200px;

              .color-item {
                width: 20px;
                height: 20px;
                border-radius: 4px;
                cursor: pointer;
                border: 1px solid #e5e9ef;
                transition: all 0.2s;

                &:hover {
                  transform: scale(1.15);
                }

                &.active {
                  border-color: #fb7299;
                  box-shadow: 0 0 0 2px rgba(251, 114, 153, 0.3);
                }
              }
            }
          }
        }
      }

      .video-info {
        display: flex;
        margin-right: 24px;
        flex-shrink: 1;
      }

      .dm-root {
        height: 32px;
        display: flex;
        align-items: center;
        flex: auto;

        :deep(.el-input__wrapper) {
          border-radius: 8px 0 0 8px;
        }
      }
    }

    .video-toolbar-container {
      display: flex;
      padding: 16px 0;

      .video-toolbar-left {
        .toolbar-left-item-wrap {
          display: flex;

          .toolbar-left-item {
            width: 92px;
            color: #61666d;
            display: flex;
            align-items: center;
            transition: all 0.3s;
            cursor: pointer;

            &:hover {
              color: #00aeec;
            }

            &.active {
              color: #00aeec;
            }

            .icon {
              font-size: 28px;
              margin-right: 5px;
            }

            .active-icon {
              color: #00aeec;
            }

            span {
              font-size: 13px;
            }
          }
        }
      }
    }

    .video-desc-container {
      white-space: pre-line;
      margin: 16px 0;
      font-size: 15px;
      line-height: 24px;

      .desc-info-text {
        max-height: 84px;
        overflow: hidden;
        transition: height 0.3s ease-out;
      }

      .expand {
        /* 展开时的样式 */
        max-height: none;
        overflow: visible;
      }

      .toggle-btn {
        margin-top: 10px;
        font-size: 13px;
        line-height: 18px;

        .toggle-btn-text {
          color: #61666d;
          cursor: pointer;

          &:hover {
            color: #409eff;
          }
        }
      }
    }

    .video-tag-container {
      margin: 16px 0;

      :deep(.el-tag.el-tag--primary.el-tag--light) {
        margin: 5px;
      }
    }

    .comment-wrap {
      margin-top: 20px;

      .header {
        .navbar {
          display: flex;

          .title {
            display: flex;
            align-items: center;

            h2 {
              font-size: 20px;
              font-weight: 500;
            }

            .count {
              margin: 0 30px 0 6px;
              font-size: 13px;
              color: #9499a0;
            }
          }

          .sort-actions {
            display: flex;
            align-items: center;

            .sort {
              color: #9499a0;

              &.active {
                color: #18191c;
              }
            }

            .sort:hover {
              color: #409eff;
            }
          }
        }

        .commentbox {
          display: flex;
          align-items: center;
          margin-top: 20px;
          height: 50px;

          .user-avatar {
            img {
              width: 48px;
              height: 48px;
              margin-right: 20px;
              border-radius: 50%;
            }
          }
        }

        .edit {
          flex: 1 1 0;
          height: 100%;
          border-radius: 6px;
          font-size: 12px;
          color: #9499a0;
          background-color: #f1f2f3;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .editor {
          background-color: #fff;
        }
      }

      .contents {
        .feed {
          .comment-thread {
            padding-bottom: 10px;
            border-bottom: 1px solid #e3e5e7;
            margin-top: 10px;

            &:first-child {
              margin-top: 32px;
            }
          }

          .reply-control {
            margin: 8px 0 2px 67px;
            min-height: 22px;
            font-size: 13px;
            line-height: 22px;
            color: #9499a0;
          }

          .reply-pagination {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 4px;
            color: #18191c;
          }

          .reply-page-total {
            margin-right: 4px;
          }

          .reply-text-btn,
          .reply-page-btn {
            border: 0;
            padding: 0 4px;
            height: 22px;
            line-height: 22px;
            color: #18191C;
            background: transparent;
            font: inherit;
            cursor: pointer;
          }

          .reply-text-btn.expand {
            color: #9499a0;
          }

          .reply-text-btn:hover,
          .reply-page-btn:hover,
          .reply-page-btn.active {
            color: #409eff;
          }

          .reply-page-btn {
            min-width: 18px;
          }

          .reply-page-btn.ellipsis {
            cursor: default;
          }

          .reply-page-btn.ellipsis:hover {
            color: #9499a0;
          }
        }
      }

      .end {
        .bottombar {
          width: 100%;
          margin-top: 20px;
          font-size: 13px;
          color: #9499a0;
          text-align: center;
          user-select: none;
          padding-bottom: 100px;
        }
      }

      .comment-sentinel {
        height: 1px;
        width: 100%;
      }

      .comment-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 20px 0;
        color: #9499a0;
        font-size: 13px;
      }

      .comment-item-wrapper {
        position: relative;
      }

      .comment-fade-mask {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 150px;
        background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
        pointer-events: none;
        z-index: 10;
      }

      .login-comment-tip {
        margin-top: 20px;
        margin-left: 65px;
        margin-bottom: 100px;
        padding: 16px;
        background-color: #e3f4fd;
        border-radius: 8px;
        text-align: center;
        color: #00aeec;
        font-size: 15px;
        cursor: pointer;
        transition: background-color 0.2s;

        &:hover {
          background-color: #d0ecfb;
        }
      }
    }
  }

  .right-container {
    min-width: 350px;
    width: 350px;
    margin-left: 30px;

    .right-container-inner {
      position: sticky;
      top: -800px;

      .up-info-container {
        display: flex;
        height: 104px;
        align-items: center;

        .up-info-left {
          .up-avatar-wrap {
            img {
              width: 48px;
              height: 48px;
              border-radius: 50%;
            }
          }
        }

        .up-info-right {
          margin-left: 12px;
          overflow: auto;
          flex: 1;

          .up-info__detail {
            .up-name {
              font-size: 15px;
              color: #fb7299;
              margin-right: 12px;
              font-weight: 500;
            }

            .send-msg {
              font-size: 13px;
              color: #61666d;
            }

            .up-description {
              font-size: 13px;
              margin-top: 2px;
              color: #9499a0;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }

          .up-info__btn-panel {
            display: flex;
            margin-top: 5px;

            .default-btn {
              height: 30px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              border-radius: 6px;
              font-size: 14px;
              transition: 0.3s all;
            }

            .charge-btn {
              width: 109px;
              border: 1px solid #ff6699;
              color: #ff6699;
              margin-right: 12px;

              &:hover {
                background-color: #ffecf1;
              }
            }

            .up-follow-btn {
              flex: 1 1 auto;
              max-width: 200px;
              height: 30px !important;
              background-color: #00a1d6 !important;
              border-color: #00a1d6 !important;
              color: #fff !important;
              border-radius: 6px !important;
              font-size: 14px !important;
              display: inline-flex !important;
              align-items: center;
              justify-content: center;
              padding: 0 15px !important;
              cursor: pointer;
              transition: background-color 0.2s,
              border-color 0.2s;
              gap: 4px;
              line-height: 1;

              &__icon {
                display: inline-block;
                vertical-align: middle;
                flex-shrink: 0;
                margin-right: 4px;
              }

              &:hover {
                background-color: #00b5e5 !important;
                border-color: #00b5e5 !important;
                color: #fff !important;
              }

              &--followed {
                background-color: #e3e5e7 !important;
                border-color: #e3e5e7 !important;
                color: #9499a0 !important;

                &:hover {
                  background-color: #f1f2f3 !important;
                  border-color: #f1f2f3 !important;
                  color: #9499a0 !important;
                }
              }
            }

            //button {
            //  :nth-of-type(1):hover {
            //    background-color: #ffecf1;
            //  }
            //
            //  :nth-of-type(2):hover {
            //    background-color: #f1f2f3;
            //  }
            //}
          }
        }
      }

      .danmaku-box {
        min-height: 44px;
        background: #f1f2f3;
        border-radius: 6px;
      }

      .rec-list {
        margin-top: 18px;

        .card-box {
          display: flex;
          margin-bottom: 12px;

          .pic-box {
            flex: 0 0 auto;
            width: 141px;
            height: 80px;
            position: relative;

            &:hover .duration {
              opacity: 0;
            }

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
            }

            .duration {
              position: absolute;
              bottom: 6px;
              right: 6px;
              height: 20px;
              background-color: rgba(0, 0, 0, 0.4);
              font-size: 13px;
              color: #fff;
              border-radius: 2px;
              padding: 0 4px;
              transition: opacity 0.3s;
            }
          }

          .info {
            font-size: 13px;
            margin-left: 10px;
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;

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
    }
  }
}

@media (min-width: 1681px) {
  .video-container {
    .left-container {
      .sending-bar {
        font-size: 14px;
        height: 56px;

        .dm-root {
          height: 40px;
        }
      }
    }

    .right-container {
      width: 411px !important;
    }

    .pic-box {
      width: 190px !important;
      height: 106.8px !important;
    }
  }
}
</style>
