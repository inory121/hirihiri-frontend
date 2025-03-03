import { defineStore } from 'pinia'
import { get } from '@/utils/request'
import router from '@/router'
import type { OneVideoApiResponse, Video, VideoApiResponse } from '@/types/api.ts'

export const useVideoStore = defineStore('video', {
  state: () => {
    return {
      video: {} as Video,
      videoList: [] as Video[], // 推荐视频列表
      loading: true, // 骨架屏显示
      isShow: false, // 是否显示视频详情
    }
  },
  getters: {},
  actions: {
    async getRecommendVideo() {
      await get<VideoApiResponse>('/video/get/recommend').then((res) => (this.videoList = res.data))
    },
    async getVideo(vid: number) {
      await get<OneVideoApiResponse>(`/video/get/one/${vid}`).then((res) => {
        if (res.code === 4002) {
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
        } else if (res.code === 200) {
          this.isShow = true
          this.video = res.data
        }
      })
    },
  },
})
