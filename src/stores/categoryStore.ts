import { defineStore } from 'pinia'
import { get } from '@/utils/request'

interface SubCategory {
  rcmTag: string[]
  descr: string
  mcId: string
  scId: string
  scName: string
  cid: number
}

interface MainCategory {
  mcId: string
  mcName: string
  scList: SubCategory[]
}

interface ApiResponse {
  data: MainCategory[]
}

export const useCategoryStore = defineStore('category', {
  state: () => {
    return {
      mcNames: [] as string[],
      // visibleItems: [],
      maxVisibleColumns: 9,
    }
  },
  getters: {
    getVisibleItems(state) {
      // 监听窗口大小变化，动态调整最大列数
      window.addEventListener('resize', () => {
        const width = window.innerWidth
        if (width <= 1366.9) {
          state.maxVisibleColumns = 8
        } else if (width > 1366.9 && width <= 1700.9) {
          state.maxVisibleColumns = 10
        } else if (width > 1700.9 && width <= 2199.9) {
          state.maxVisibleColumns = 11
        } else {
          state.maxVisibleColumns = 13
        }
      })
      window.dispatchEvent(new Event('resize')) // 初始化一次
      return state.mcNames.slice(0, state.maxVisibleColumns * 2)
    },
  },
  actions: {
    async getCategory() {
      const res = await get<ApiResponse>('/category/get/all')
      this.mcNames = res.data.map((item) => item.mcName)
      console.log(this.mcNames)
    },
  },
})
