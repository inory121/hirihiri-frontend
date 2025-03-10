import { defineStore } from 'pinia'
import { get } from '@/utils/request'
import router from '@/router'
import type {
  OneVideoApiResponse,
  SubCategory,
  User,
  Video,
  VideoApiResponse,
  VideoInfo,
  VideoStat,
} from '@/types/api.ts'
import ColorThief from 'colorthief'

const colorThief = new ColorThief()

export const useVideoStore = defineStore('video', {
  state: () => {
    return {
      videoInfo: {
        video: {} as Video,
        stat: {} as VideoStat,
        category: {} as SubCategory,
        user: {} as User,
      },
      videoList: [] as VideoInfo[], // 推荐视频列表
      loading: true, // 骨架屏显示
      isShow: false, // 是否显示视频详情
      pageNum: 0,
      pageSize: 0,
    }
  },
  getters: {
    videoDuration(state) {
      return state.videoInfo.video.duration
    },
  },
  actions: {
    async getRecommendVideo() {
      await get<VideoApiResponse>('/video/get/recommend', {
        params: {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
        },
      }).then(async (res) => {
        this.videoList = res.data
        await this.preloadDominantColors()
      })
    },
    async preloadDominantColors() {
      await Promise.all(
        this.videoList.map(
          (videoInfo) =>
            new Promise<void>((resolve) => {
              const img = new Image()
              img.crossOrigin = 'anonymous'
              // img.src = `${video.coverUrl}?t=${Date.now()}` // 防止缓存
              img.src = videoInfo.video.coverUrl

              img.onload = () => {
                try {
                  videoInfo.video.dominantColor = colorThief.getColor(img)
                } catch (e) {
                  console.error(e)
                  videoInfo.video.dominantColor = [255, 255, 255]
                }
                resolve()
              }

              img.onerror = () => {
                videoInfo.video.dominantColor = [255, 255, 255]
                resolve()
              }
            }),
        ),
      )
    },
    async getVideo(vid: number) {
      await get<OneVideoApiResponse>(`/video/get/one/${vid}`).then((res) => {
        if (res.code === 200) {
          this.isShow = true
          this.videoInfo = res.data
          console.log(res.data)
          console.log(this.videoInfo)
        } else {
          ElMessage.error('视频不存在,3秒后跳转到首页')
          router.replace({
            path: '/404',
            query: { from: 'video', vid: vid.toString() },
          })
          setTimeout(() => {
            router.replace({
              path: '/',
            })
          }, 3000)
        }
      })
    },
  },
})
