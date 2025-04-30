import { defineStore } from 'pinia'
import type { Danmu, DanmakuApiResponse, oneDanmakuApiResponse } from '@/types/api'
import { get, post } from '@/utils/request'
import { DANMAKU_API } from '@/api/danmaku'
export const useDanmakuStore = defineStore('danmaku', {
  state: () => ({
    danmakuList: [] as Danmu[],
  }),
  getters: {},
  actions: {
    async getDanmaku(vid: number) {
      await get<DanmakuApiResponse>(`${DANMAKU_API.VIDEO_DANMAKU}/${vid}`)
        .then((res) => {
          this.danmakuList = res.data
        })
        .catch((err) => {
          console.log(err)
        })
    },
    async sendDanmaku(danmaku: Danmu) {
      try {
        const res = await post<oneDanmakuApiResponse>(DANMAKU_API.SEND_DANMAKU, danmaku)
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
