import { defineStore } from 'pinia'
import type { Danmu, DanmakuApiResponse, oneDanmakuApiResponse } from '@/types/api.ts'
import { get, post } from '@/utils/request.ts'

export const useDanmakuStore = defineStore('danmaku', {
  state: () => ({
    danmakuList: [] as Danmu[],
  }),
  getters: {},
  actions: {
    async getDanmaku(vid: number) {
      await get<DanmakuApiResponse>(`/danmaku/get/${vid}`)
        .then((res) => {
          this.danmakuList = res.data
        })
        .catch((err) => {
          console.log(err)
        })
    },
    async sendDanmaku(danmaku: Danmu) {
      try {
        const res = await post<oneDanmakuApiResponse>(`/danmaku/send`, danmaku)
        if (res.code === 200) {
          return res.data
        }
        return null
      } catch (error) {
        console.error('发送弹幕失败:', error)
        return null
      }
    },
  },
})
