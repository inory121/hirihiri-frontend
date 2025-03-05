<template>
  <div style="min-height: 64px">
    <HeaderBar
      text-color="#18191C"
      header-shadow="0 2px 4px #00000014"
      bg-color="#fff"
      position="fixed"
    />
  </div>
  <div class="video-container">
    <div class="left-container">
      <div class="video-info-container">
        <div class="video-info-title">
          <h1 class="video-title">{{ videoStore.video.title }}</h1>
        </div>
        <div class="video-info-meta">
          <div class="view-item item">
            <el-icon>
              <View />
            </el-icon>
            <span class="text">9999</span>
          </div>
          <div class="dm-item item">
            <el-icon>
              <Comment />
            </el-icon>
            <span class="text">9999</span>
          </div>
          <div class="pubdate-item item">{{ videoStore.video.pubDate }}</div>
          <div class="copyright-item item">
            <el-icon>
              <CircleClose />
            </el-icon>
            <span class="text">未经作者授权，禁止转载</span>
          </div>
        </div>
      </div>
      <div class="player-wrap">
        <div ref="danmakuContainer" style="position: absolute; width: 100%; height: 100%">
          <video ref="plyrPlayer" controls autoplay>
            <source :src="videoStore.video.videoUrl" type="video/mp4" />
          </video>
        </div>
      </div>
      <div class="sending-bar">
        <div class="video-info">
          <div class="video-info-online">999人正在看，</div>
          <div class="video-info-dm">已装填9999条弹幕</div>
        </div>
        <div class="dm-root">
          <el-input
            placeholder="发个友善的弹幕见证当下"
            maxlength="100"
            minlength="1"
            v-model="danmaku"
            prefix-icon="Operation"
          ></el-input>
          <el-button type="primary" style="border-radius: 0 8px 8px 0">发送</el-button>
        </div>
      </div>
      <div class="video-toolbar-container">
        <div class="video-toolbar-left">
          <div class="toolbar-left-item-wrap">
            <div class="toolbar-left-item">
              <el-icon class="icon">
                <Star />
              </el-icon>
              <span>9999</span>
            </div>
            <div class="toolbar-left-item">
              <el-icon class="icon">
                <Star />
              </el-icon>
              <span>9999</span>
            </div>
            <div class="toolbar-left-item">
              <el-icon class="icon">
                <Star />
              </el-icon>
              <span>9999</span>
            </div>
            <div class="toolbar-left-item">
              <el-icon class="icon">
                <Share />
              </el-icon>
              <span>9999</span>
            </div>
          </div>
        </div>
        <div class="video-toolbar-right"></div>
      </div>
      <el-divider style="margin: 0" />
      <div class="video-desc-container">
        <div class="desc-info-text">{{ videoStore.video.descr }}</div>
      </div>

      <!--        <vue-danmaku-->
      <!--          v-model:danmus="danmus"-->
      <!--          loop-->
      <!--          :channels="5"-->
      <!--          class="danmaku-wrap"-->
      <!--          :speeds="100"-->
      <!--          :top="10"-->
      <!--          :right="10"-->
      <!--          :random-channel="true"-->
      <!--        />-->
    </div>
    <div class="right-container"></div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useVideoStore } from '@/stores/videoStore'
// 引入弹幕组件
// import vueDanmaku from 'vue3-danmaku'
// 引入Plyr播放器
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'
// 引入弹幕组件
import Danmaku from 'danmaku'

const videoStore = useVideoStore()
const route = useRoute()

const danmaku = ref('')
const danmakuContainer = ref<HTMLElement>()
let danmakuInstance: Danmaku | null = null
let resizeObserver: ResizeObserver | null = null

// const danmus = ref(['danmu1', 'danmu2', 'danmu3', 'danmu4'])
const plyrPlayer = ref<HTMLVideoElement>()
let player: Plyr | null = null

// 初始化播放器
const initPlayer = () => {
  if (!plyrPlayer.value) return

  player = new Plyr(plyrPlayer.value, {
    controls: [
      'play-large', // 大型播放按钮，通常位于视频中心
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
    // disableContextMenu:false // 禁用右键菜单
    tooltips: {
      controls: true, // 显示控制栏提示
      seek: true, // 显示快进提示
    },
    loop: {
      active: true, // 循环播放
    },
  })
}
// 销毁播放器
const disposePlayer = () => {
  player?.destroy()
  player = null
}

watch(
  () => videoStore.video?.videoUrl,
  (newUrl) => {
    if (newUrl && player) {
      player.source = {
        type: 'video',
        sources: [
          {
            src: newUrl,
            type: 'video/mp4',
          },
        ],
      }
    }
  },
)
onMounted(async () => {
  const vid = Number(route.params.vid)
  if (!isNaN(vid)) {
    await videoStore.getVideo(vid)
  }
  initPlayer()
  // 初始化弹幕
  if (danmakuContainer.value && plyrPlayer.value) {
    resizeObserver = new ResizeObserver(() => {
      danmakuInstance?.resize()
    })
    resizeObserver.observe(danmakuContainer.value)
    danmakuInstance = new Danmaku({
      container: danmakuContainer.value,
      media: plyrPlayer.value,
      engine: 'canvas',
      speed: 144,
    })
    // 测试弹幕
    danmakuInstance.emit({
      text: '测试弹幕',
      style: {
        font: '20px sans-serif',
        fillStyle: '#ff0000', // 红色弹幕
        textBaseline: 'bottom', // 基线对齐
      },
    })
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
      }

      .dm-root {
        display: flex;
        align-items: center;
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
      .desc-info-text{

      }
    }
  }

  .right-container {
    width: 350px;
    margin-left: 30px;
    border: 1px solid red;
  }
}

@media (min-width: 1681px) {
  .right-container {
    width: 411px !important;
  }
}
</style>
