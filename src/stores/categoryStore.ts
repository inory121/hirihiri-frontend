import { defineStore } from 'pinia'
import { get } from '@/utils/request'
import type { CategoryApiResponse } from '@/types/api.ts'

// 类型声明
interface Category {
  value: string
  label: string
  children: {
    value: string
    label: string
    rcmTag: string[]
  }[]
}

export const useCategoryStore = defineStore('category', {
  state: () => {
    return {
      categories: [] as Category[], // 所有分区信息加上tags
      mcNames: [] as string[], // 所有主分区
      scNames: new Map<string, string[][]>(), // 所有主分区加上子分区
      maxVisibleColumns: 0, //控制主页显示分区有多少列
    }
  },
  getters: {
    // 返回可见的分区名称
    visibleItems(): string[] {
      return this.mcNames.slice(0, this.maxVisibleColumns * 2)
    },
    // 投稿页面标签展示区根据选择的主分区和子分区返回对应的tags
    rcmTags(): (keys: string[]) => string[] | undefined {
      return (keys: string[]) => {
        const mainCategory = this.categories.find((mc) => mc.value === keys[0])
        if (!mainCategory) return undefined
        const subCategory = mainCategory.children.find((sc) => sc.value === keys[1])
        return subCategory?.rcmTag || [] // 返回已过滤空标签的数组
      }
    },
  },
  actions: {
    // 获取分区信息
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

      this.categories = res.data
        .map((mc) => ({
          value: mc.mcId,
          label: mc.mcName,
          children: mc.scList
            .filter((sc) => sc.rcmTag.some((tag) => tag.trim() !== '')) // 过滤空标签项
            .map((sc) => ({
              rcmTag: sc.rcmTag.filter((tag) => tag.trim() !== ''),
              value: sc.scId,
              label: `${sc.scName} ${sc.descr}`, // 组合名称和描述
            })),
        }))
        .filter((mc) => mc.children.length > 0)
    },
  },
})
