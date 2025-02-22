import { defineStore } from 'pinia'
import { get } from '@/utils/request'
import type { Video, VideoApiResponse } from '@/types/api.ts'

export const useVideoStore = defineStore('video', {
  state: () => {
    return {
      videoList: [] as Video[],
    }
  },
  getters: {},
  actions: {
    async getRecommendVideo() {
      const res = await get<VideoApiResponse>('/video/get/recommend')
      this.videoList = res.data
    },
  },
})
