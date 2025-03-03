<template>
  <div style="min-height: 64px">
    <HeaderBar
      text-color="#18191C"
      header-shadow="0 2px 4px #00000014"
      bg-color="#fff"
      position="fixed"
    />
  </div>
  <div class="video-container" v-show="videoStore.isShow">
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
        <video ref="videoPlayer" class="video-js vjs-big-play-centered"></video>
      </div>
    </div>
    <div class="right-container">
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import { useVideoStore } from '@/stores/videoStore'

const videoStore = useVideoStore()
const route = useRoute()
const videoPlayer = ref<HTMLVideoElement>()
let player: ReturnType<typeof videojs> | null = null

// 播放器配置项
const playerOptions = ref({
  controls: true,
  autoplay: true,
  preload: 'auto',
  fluid: true, // 自适应容器
  responsive: true,
  playbackRates: [0.5, 1, 1.5, 2],
  sources: [
    {
      src: '',
      type: 'video/mp4',
    },
  ],
})

// 初始化播放器
const initPlayer = () => {
  if (!videoPlayer.value) return

  player = videojs(videoPlayer.value, playerOptions.value, () => {
    console.log('播放器准备就绪')
    player?.play()
  })
}

// 销毁播放器
const disposePlayer = () => {
  if (player) {
    player.dispose()
    player = null
  }
}

// 监听视频数据加载
watch(
  () => videoStore.video,
  (newVideo) => {
    if (newVideo?.videoUrl) {
      playerOptions.value.sources[0].src = newVideo.videoUrl
      if (player) {
        player.src({ src: newVideo.videoUrl, type: 'video/mp4' })
      } else {
        initPlayer()
      }
    }
  },
)
onMounted(() => {
  const vid = Number(route.params.vid)
  if (!isNaN(vid)) {
    videoStore.getVideo(vid)
  }
})

onUnmounted(() => {
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
    border: 1px solid red;

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
    //.player-wrap {
    //  width: 100%;
    //  height: 0;
    //  padding-bottom: 56.25%; // 16:9 比例
    //  position: relative;
    //
    //  .video-js {
    //    position: absolute;
    //    top: 0;
    //    left: 0;
    //    width: 100%;
    //    height: 100%;
    //  }
    //}
    // 覆盖默认样式
    //:deep(.vjs-big-play-button) {
    //  transform: translate(-50%, -50%);
    //  border: none;
    //  background-color: rgba(0, 174, 236, 0.8);
    //
    //  &:hover {
    //    background-color: rgba(0, 174, 236, 1);
    //  }
    //}
  }

  .right-container {
    width: 430px;
    height: 100%;
    margin-left: 30px;
    border: 1px solid red;
  }
}
</style>
