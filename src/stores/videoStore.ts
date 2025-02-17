import { defineStore } from 'pinia'
import { get } from '@/utils/request'

export interface Video {
  auth: number
  coverUrl: string
  delDate: string
  descr: string
  duration: number
  mcId: string
  pubDate: string
  scId: string
  status: number
  tags: string
  title: string
  type: number
  uid: number
  vid: number
  videoUrl: string
}

interface ApiResponse {
  data: Video[]
}

export const useVideoStore = defineStore('video', {
  state: () => {
    return {
      videoList: [] as Video[],
    }
  },
  getters: {},
  actions: {
    async getRecommendVideo() {
      const res = await get<ApiResponse>('/video-service/video/get/recommend')
      this.videoList = res.data
    },
  },
})
