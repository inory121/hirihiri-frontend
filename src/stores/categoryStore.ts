import { defineStore } from 'pinia'
import { get } from '@/utils/request'
import type { CategoryApiResponse } from '@/types/api.ts'

export const useCategoryStore = defineStore('category', {
  state: () => {
    return {
      mcNames: [] as string[],
      scNames: new Map<string, string[][]>(),
      maxVisibleColumns: 0,
    }
  },
  getters: {
    visibleItems(): string[] {
      return this.mcNames.slice(0, this.maxVisibleColumns * 2)
    },
  },
  actions: {
    async getCategory() {
      const res = await get<CategoryApiResponse>('/category/get/all')
      this.mcNames = res.data.map((item) => item.mcName)
      this.scNames = res.data.reduce((acc, item) => {
        // 提取 scList 中的所有 scName
        const scNames = item.scList.map((subItem) => subItem.scName)

        // 对 scNames 进行分组（每 4 个元素一组）
        const groupedScNames = []
        for (let i = 0; i < scNames.length; i += 4) {
          groupedScNames.push(scNames.slice(i, i + 4))
        }

        // 将 mcName 作为键，分组后的 scNames 作为值存入 Map
        acc.set(item.mcName, groupedScNames)
        return acc
      }, new Map<string, string[][]>())
    },
  },
})
