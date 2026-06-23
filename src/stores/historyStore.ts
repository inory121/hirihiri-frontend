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
        if (!userStore.user?.uid) {
          this.historyList = []
          this.loading = false
          return
        }
        // uid 由后端从请求头获取，前端无需传递，防止越权
        const res = await get<HistoryApiResponse>('/history', {
          params: { pageNum, pageSize }
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
      if (!userStore.user?.uid) return

      try {
        // uid 由后端从请求头获取，前端无需传递，防止越权
        await post('/history', null, {
          params: { vid, progress }
        })
      } catch (error) {
        console.error('保存浏览历史失败:', error)
      }
    },

    async getVideoProgress(vid: number): Promise<number> {
      const userStore = useUserStore()
      if (!userStore.user?.uid) return 0

      try {
        // uid 由后端从请求头获取，前端无需传递，防止越权
        const res = await get<{ code: number; data: { progress: number } }>('/history/progress', {
          params: { vid }
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