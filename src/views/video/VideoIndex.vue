<template>
  <div style="min-height: 64px">
    <HeaderBar
      text-color="#18191C"
      header-shadow="0 2px 4px #00000014"
      bg-color="#fff"
      position="fixed"
    />
  </div>
  <div class="video-container" v-show="isShow">
    <div class="left-container">
      <div class="video-info-container">
        <div class="video-info-title">
          <h1 class="video-title">{{ videoInfo.video.title }}</h1>
        </div>
        <div class="video-info-meta">
          <div class="view-item item">
            <el-icon>
              <View />
            </el-icon>
            <span class="text">{{ videoInfo.stat.view }}</span>
          </div>
          <div class="dm-item item">
            <el-icon>
              <Comment />
            </el-icon>
            <span class="text">{{ videoInfo.stat.danmaku }}</span>
          </div>
          <div class="createDate-item item">
            {{ formatDateTime(videoInfo.video.createDate) }}
          </div>
          <div class="copyright-item item">
            <el-icon>
              <CircleClose />
            </el-icon>
            <span class="text">未经作者授权，禁止转载</span>
          </div>
        </div>
      </div>
      <!--播放器-->
      <div class="player-wrap">
        <div ref="playerPlaceholder" class="player-placeholder"></div>
        <div v-if="true" ref="danmakuContainer" class="danmaku-wrap">
          <video ref="plyrPlayer" controls>
            <source :src="videoInfo.video.videoUrl" type="video/mp4" />
          </video>
        </div>
      </div>
      <div class="sending-bar">
        <div class="video-info">
          <div class="video-info-online">999人正在看，</div>
          <div class="video-info-dm">已装填{{ danmakuList.length }}条弹幕</div>
        </div>
        <div class="dm-root">
          <el-input
            placeholder="发个友善的弹幕见证当下"
            maxlength="100"
            minlength="1"
            v-model="danmaku"
            prefix-icon="Operation"
          ></el-input>
          <el-button type="primary" style="border-radius: 0 8px 8px 0" @click="sendDanmaku"
            >发送
          </el-button>
        </div>
      </div>
      <div class="video-toolbar-container">
        <div class="video-toolbar-left">
          <div class="toolbar-left-item-wrap">
            <div class="toolbar-left-item">
              <el-icon class="icon">
                <Star />
              </el-icon>
              <span>{{ videoInfo.stat.like }}</span>
            </div>
            <div class="toolbar-left-item">
              <el-icon class="icon">
                <Star />
              </el-icon>
              <span>{{ videoInfo.stat.coin }}</span>
            </div>
            <div class="toolbar-left-item">
              <el-icon class="icon">
                <Star />
              </el-icon>
              <span>{{ videoInfo.stat.favorite }}</span>
            </div>
            <div class="toolbar-left-item">
              <el-icon class="icon">
                <Share />
              </el-icon>
              <span>{{ videoInfo.stat.share }}</span>
            </div>
          </div>
        </div>
        <div class="video-toolbar-right"></div>
      </div>
      <el-divider style="margin: 0" />
      <div class="video-desc-container" v-if="videoInfo.video.descr">
        <div ref="descText" class="desc-info-text" :class="{ expand: isExpanded }">
          {{ videoInfo.video.descr }}
        </div>
        <div class="toggle-btn" @click="toggle" v-if="showToggleBtn">
          <span class="toggle-btn-text">{{ isExpanded ? '收起' : '展开更多' }}</span>
        </div>
      </div>
      <div class="video-tag-container">
        <el-tag v-for="tag in rcmTags" :key="tag" :disable-transitions="false">
          {{ tag }}
        </el-tag>
      </div>
      <el-divider style="margin: 10px" />
      <div class="comment-wrap">
        <div class="header">
          <div class="navbar">
            <div class="title">
              <h2>评论</h2>
              <span class="count">{{ commentList.length }}</span>
            </div>
            <div class="sort-actions">
              <el-button link class="sort">最热</el-button>
              <el-divider direction="vertical" />
              <el-button link class="sort">最新</el-button>
            </div>
          </div>
          <div class="commentbox">
            <div class="user-avatar">
              <img
                v-if="userStore.isLogin"
                src="https://hirihiri.oss-cn-nanjing.aliyuncs.com/05b340832a490209f185542bb9690fc748bc08f7.png"
                alt=""
              />
              <img v-else src="https://hirihiri.oss-cn-nanjing.aliyuncs.com/noface.jpg" alt="" />
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
          <div class="feed">
            <div class="comment" v-for="(comment, index) in commentList" :key="index">
              <div class="user-avatar">
                <a href="#">
                  <img
                    src="https://hirihiri.oss-cn-nanjing.aliyuncs.com/05b340832a490209f185542bb9690fc748bc08f7.png"
                    alt=""
                  />
                </a>
              </div>
              <div class="comment-main">
                <div class="comment-header">
                  <div class="user-name"><a href="#">username</a></div>
                  <div class="user-level">
                    <img
                      width="30"
                      height="30"
                      src="https://hirihiri.oss-cn-nanjing.aliyuncs.com/level_6.svg"
                      alt=""
                    />
                  </div>
                </div>
                <div class="comment-content">
                  <p>
                    {{ comment.content }}
                  </p>
                </div>
                <div class="comment-footer">
                  <div class="createDate">
                    {{ formatDateTime(comment.createDate, 'YYYY-MM-DD HH:mm') }}
                  </div>
                  <div class="like">
                    <el-icon>
                      <CircleCheck />
                    </el-icon>
                    {{ comment.like }}
                  </div>
                  <div class="dislike">
                    <el-icon>
                      <CircleClose />
                    </el-icon>
                  </div>
                  <div class="reply">回复</div>
                </div>
              </div>
            </div>
            <div class="replies"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="right-container">
      <div class="right-container-inner">
        <div class="up-info-container">
          <div class="up-info-left">
            <div class="up-avatar-wrap">
              <a href="#"
                ><img
                  src="https://hirihiri.oss-cn-nanjing.aliyuncs.com/05b340832a490209f185542bb9690fc748bc08f7.png"
                  alt=""
              /></a>
            </div>
          </div>
          <div class="up-info-right">
            <div class="up-info__detail">
              <a href="#" class="up-name">{{ videoInfo.user.username }}</a>
              <a href="#" class="send-msg">
                <el-icon>
                  <Message />
                </el-icon>
                发消息
              </a>
              <div class="up-description">Debug the World！.商务合作请加V：maguabd01</div>
            </div>
            <div class="up-info__btn-panel">
              <span class="charge-btn default-btn">
                <el-icon> <CoffeeCup /> </el-icon>充电
              </span>
              <span class="follow-btn default-btn">
                <el-icon>
                  <Operation />
                </el-icon>
                已关注999万
              </span>
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
                <el-table-column prop="content" label="弹幕内容" sortable show-overflow-tooltip />
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
                <img :src="list.video.coverUrl" alt="" />
              </router-link>
              <span class="duration">{{ formatDuration(list.video.duration) }}</span>
            </div>
            <div class="info">
              <a href="#">
                <p class="title">{{ list.video.title }}</p>
              </a>
              <div class="upname">
                <a href="#">
                  <!--                  <el-icon class="icon">-->
                  <!--                    <User />-->
                  <!--                  </el-icon>-->
                  <span class="up">up</span>
                  <span class="name">{{ list.user.username }}</span>
                </a>
              </div>
              <div class="playinfo">
                <el-icon class="icon">
                  <View />
                </el-icon>
                <span class="text">{{ list.stat.view }}</span>
                <el-icon class="icon">
                  <Comment />
                </el-icon>
                <span class="text">{{ list.stat.danmaku }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
// import { useDanmakuStore } from '@/stores/danmakuStore'
import { formatDateTime, formatDuration } from '@/utils/utils'
// 引入Plyr播放器
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'
// 引入弹幕组件
import Danmaku from 'danmaku'
import type { Comment, Danmu } from '@/types/api.ts'
import { CoffeeCup, Operation } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import { useVideoStore } from '@/stores/videoStore'
import { useDanmakuStore } from '@/stores/danmakuStore.ts'
import { useCommentStore } from '@/stores/commentStore.ts'
import { useUserStore } from '@/stores/userStore.ts'

const route = useRoute()
const videoStore = useVideoStore()
const danmakuStore = useDanmakuStore()
const commentStore = useCommentStore()
const userStore = useUserStore()
const { videoInfo, videoList, isShow } = storeToRefs(videoStore)
const { commentList } = storeToRefs(commentStore)
const { danmakuList } = storeToRefs(danmakuStore)
const { user } = storeToRefs(userStore)
const danmuList = ref([])
const rcmTags = ref<string[] | undefined>()
const danmaku = ref('')
const comment = ref('')
const danmakuContainer = ref<HTMLElement>()
const plyrPlayer = ref<HTMLVideoElement>()
const playerPlaceholder = ref<HTMLElement>()
const isExpanded = ref(false) // 视频信息收起状态
const descText = ref<HTMLElement | null>(null)
const showToggleBtn = ref(false)
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

const sendComment = async () => {
  if (!videoInfo.value.video.vid || !comment.value.trim()) return
  const newComment = await commentStore.sendComment({
    vid: videoInfo.value.video.vid,
    uid: user.value.uid,
    content: comment.value,
    isTop: 1,
    rootId: 0,
    parentId: 0,
    toUserId: 1,
  })
  if (newComment) {
    commentList.value.unshift(newComment) // 添加到列表头部
    comment.value = ''
  }
}
// 初始化播放器
const initPlayer = async () => {
  try {
    console.log('开始创建播放器')
    if (!plyrPlayer.value) return

    player = new Plyr(plyrPlayer.value, {
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
    player.on('loadedmetadata', () => {
      player?.play()
      // danmakuInstance?.seek(player?.currentTime || 0) // 同步弹幕时间轴
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
    color: '#FFFFFF',
    state: 1,
    mode: 1,
    fontsize: 25,
  })
  if (newDanmaku) {
    danmakuList.value.push(newDanmaku)
    danmaku.value = ''
  }
}
watch(
  // 同时监听 vid 和 videoUrl
  [
    () => route.params.vid,
    () => videoInfo.value.video?.videoUrl,
    () => videoInfo.value.video.descr,
  ],
  ([newVid, newUrl], [oldVid, oldUrl]) => {
    if (newVid && newVid !== oldVid) {
      location.reload()
      resizeObserver?.disconnect()
      disposeDanmaku()
      // disposePlayer()
      videoStore.getVideo(Number(newVid))
      // initPlayer()
      initDanmaku(Number(newVid))
      rcmTags.value = videoInfo.value.video?.tags?.split('\n')
    }
    if (newUrl && newUrl !== oldUrl) {
      if (!player || !videoInfo.value.video?.videoUrl) return
      // 先暂停并重置播放器
      player.pause()
      player.source = {
        type: 'video',
        sources: [
          {
            src: videoInfo.value.video.videoUrl,
            type: 'video/mp4',
          },
        ],
      }
      // 强制重新加载
      // player.on('loadedmetadata', () => player?.play())
    }
    if (descText.value) {
      const height = descText.value.scrollHeight
      showToggleBtn.value = height > 84
      isExpanded.value = false
    }
  },
  {}, // 初始加载触发
)
const initDanmaku = async (vid: number) => {
  console.log('开始创建弹幕实例')
  // 初始化弹幕
  if (danmakuContainer.value && plyrPlayer.value) {
    // isDestroyed.value = false
    resizeObserver = new ResizeObserver(() => {
      danmakuInstance?.resize()
    })
    resizeObserver.observe(danmakuContainer.value)
    await danmakuStore.getDanmaku(vid)
    danmakuInstance = new Danmaku({
      container: danmakuContainer.value,
      media: plyrPlayer.value,
      engine: 'canvas',
      speed: 60,
      comments: danmakuList.value.map((dm) => {
        // 创建模式映射表
        const modeMap = {
          1: 'rtl', // 从右到左
          2: 'ltr', // 从左到右
          3: 'top', // 顶部
          4: 'bottom', // 底部
        } as const

        return {
          mode: modeMap[dm.mode] || 'rtl', // 默认rtl
          text: dm.content,
          time: dm.time,
          style: {
            font: `${dm.fontsize}px sans-serif`,
            fillStyle: dm.color,
            // 根据模式调整基线对齐
            textBaseline: dm.mode > 2 ? 'top' : 'bottom',
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
    // isDestroyed.value = true
    danmakuInstance.destroy()
    danmakuInstance = null
  }
  console.log('销毁弹幕实例成功')
}
onMounted(async () => {
  const vid = Number(route.params.vid)
  if (!isNaN(vid)) {
    await videoStore.getVideo(vid)
    await commentStore.getComment(vid)
  }
  rcmTags.value = videoInfo.value.video.tags?.split('\n')
  await initPlayer()
  await initDanmaku(vid)
  if (descText.value) {
    const height = descText.value.scrollHeight
    showToggleBtn.value = height > 84
  }
})
onUnmounted(() => {
  resizeObserver?.disconnect() // 清理监听
  danmakuInstance?.destroy()
  disposePlayer()
})
</script>
<style scoped lang="less">
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
      justify-content: space-between;

      .video-info {
        display: flex;
        margin-right: 24px;
        flex-shrink: 1;
      }

      .dm-root {
        display: flex;
        align-items: center;
        flex: auto;
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

            .icon {
              font-size: 28px;
              margin-right: 5px;
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
        cursor: pointer;
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
          .comment {
            display: flex;
            padding-left: 80px;
            padding-top: 22px;
            position: relative;

            .user-avatar {
              position: absolute;
              left: 20px;

              img {
                width: 40px;
                height: 40px;
                border-radius: 50%;
              }
            }

            .comment-main {
              .comment-header {
                display: flex;
                align-items: center;

                .user-name {
                  font-size: 13px;
                  font-weight: 500;

                  a {
                    color: #61666d;
                  }
                }

                .user-level {
                  width: 30px;
                  height: 30px;
                  margin-left: 5px;
                }
              }

              .comment-content {
                font-size: 15px;
                margin-top: 10px;
                line-height: 24px;
                word-break: break-word;
              }

              .comment-footer {
                display: flex;
                align-items: center;
                color: #9499a0;
                font-size: 13px;
                margin-top: 5px;

                > :not(:first-child) {
                  margin-left: 20px;
                }
              }
            }
          }
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

            .follow-btn {
              flex: 1 1 auto;
              max-width: 200px;
              color: #9499a0;
              background-color: #e3e5e7;

              &:hover {
                background-color: #f1f2f3;
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
  .right-container {
    width: 411px !important;
  }

  .pic-box {
    width: 190px !important;
    height: 106.8px !important;
  }
}
</style>
