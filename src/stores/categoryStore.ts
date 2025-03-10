import { defineStore } from 'pinia'
import { get } from '@/utils/request'
import type { Category, CategoryApiResponse } from '@/types/api'

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [] as Category[], // 所有分区信息加上tags
    mcNames: [] as string[], // 所有主分区
    scNames: new Map<string, string[][]>(), // 所有主分区加上子分区
    maxVisibleColumns: 0, // 控制主页显示分区有多少列
  }),
  getters: {
    visibleItems(): string[] {
      return this.mcNames.slice(0, this.maxVisibleColumns * 2)
    },
    rcmTags(): (keys: [string, string]) => string[] | undefined {
      return ([mainCategoryId, subCategoryId]: [string, string]) => {
        const mainCategory = this.categories.find((mc) => mc.value === mainCategoryId)
        if (!mainCategory) return undefined
        const subCategory = mainCategory.children.find((sc) => sc.value === subCategoryId)
        return subCategory?.rcmTag || []
      }
    },
  },
  actions: {
    async getCategory() {
      const res = await get<CategoryApiResponse>('/category/get/all')

      // 更新mcNames
      this.mcNames = res.data.map((item) => item.mcName)

      // 更新scNames
      this.scNames = res.data.reduce((acc, item) => {
        const groupedScNames = item.scList
          .map((subItem) => subItem.scName)
          .reduce(
            (groups, name, i) => (
              i % 4 === 0 ? groups.push([]) : 0, groups[groups.length - 1].push(name), groups
            ),
            [] as string[][],
          )

        acc.set(item.mcName, groupedScNames)
        return acc
      }, new Map<string, string[][]>())

      // 更新categories
      this.categories = res.data
        .map((mc) => ({
          value: mc.mcId,
          label: mc.mcName,
          children: mc.scList
            .filter((sc) => sc.rcmTag.some((tag) => tag.trim() !== ''))
            .map((sc) => ({
              rcmTag: sc.rcmTag.filter((tag) => tag.trim() !== ''),
              value: sc.scId,
              label: `${sc.scName} ${sc.descr}`,
            })),
        }))
        .filter((mc) => mc.children.length > 0)
    },
  },
})
