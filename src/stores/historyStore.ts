import { defineStore } from 'pinia'
import { get, post } from '@/utils/request'
import type { HistoryApiResponse, HistoryVideoDTO } from '@/types/api.ts'
import { useUserStore } from '@/stores/userStore.ts'

export const useHistoryStore = defineStore('history', {
  state: () => ({
    historyList: [] as HistoryVideoDTO[],
    loading: false
  }),
  actions: {
    async getHistoryList(pageNum: number = 1, pageSize: number = 20) {
      this.loading = true
      try {
        const userStore = useUserStore()
        const uid = userStore.user?.uid
        if (!uid) {
          this.historyList = []
          this.loading = false
          return
        }
        const res = await get<HistoryApiResponse>('/history', {
          params: { uid, pageNum, pageSize }
        })
        if (res.code === 200) {
          this.historyList = res.data
        } else {
          this.historyList = []
        }
      } catch (error) {
        console.error('获取历史记录失败:', error)
        this.historyList = []
      } finally {
        this.loading = false
      }
    },

    async saveHistory(vid: number, progress: number) {
      const userStore = useUserStore()
      const uid = userStore.user?.uid
      if (!uid) return
      
      try {
        await post('/history', null, {
          params: { uid, vid, progress }
        })
      } catch (error) {
        console.error('保存浏览历史失败:', error)
      }
    },

    async getVideoProgress(vid: number): Promise<number> {
      const userStore = useUserStore()
      const uid = userStore.user?.uid
      if (!uid) return 0
      
      try {
        const res = await get<{ code: number; data: { progress: number } }>('/history/progress', {
          params: { uid, vid }
        })
        if (res.code === 200 && res.data) {
          return res.data.progress || 0
        }
      } catch (error) {
        console.error('获取播放进度失败:', error)
      }
      return 0
    }
  }
})