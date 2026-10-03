import { defineStore } from 'pinia'
import { get, post } from '@/utils/request'
import { DYNAMIC_API } from '@/api/dynamic'
import type {
  Dynamic,
  DynamicPageApiResponse,
  DynamicPublishPayload,
  DynamicUp,
  DynamicUpPageApiResponse,
} from '@/types/api'
import { ElMessage, ElMessageBox } from 'element-plus'

export const useDynamicStore = defineStore('dynamic', {
  state: () => {
    return {
      dynamicList: [] as Dynamic[], // 当前页动态列表
      dynamicTotal: 0, // 动态总数（按当前查询条件，如全站或某UP过滤）
      spaceSearchDynamics: [] as Dynamic[], // 空间内搜索命中的动态（独立状态，不污染动态 tab）
      spaceSearchDynamicTotal: 0,
      spaceSearchDynamicLoading: false,
      myDynamicTotal: 0, // 当前登录用户自己发布的动态总数（信息卡展示用）
      dynamicLoading: false, // 动态列表加载状态
      publishLoading: false, // 发布动态加载状态
      deleteLoading: false, // 删除动态加载状态
      repostLoading: false, // 转发动态加载状态
      upList: [] as DynamicUp[], // 发过动态的UP主列表
      upTotal: 0, // UP主总数
      upLoading: false, // UP主列表加载状态
    }
  },
  getters: {},
  actions: {
    // 获取发过动态的UP主列表
    // append=true 时将下一页数据追加到 upList，用于横向滚动"加载更多"
    async getUpList(pageNum = 1, pageSize = 10, append = false) {
      this.upLoading = append ? false : true
      try {
        const res = await get<DynamicUpPageApiResponse>(
          `${DYNAMIC_API.UP_LIST}?pageNum=${pageNum}&pageSize=${pageSize}`,
        )
        if (res.code === 200) {
          const records = res.data.records || []
          if (append) {
            // 按 uid 去重，避免刷新/重复加载出现同一张卡片
            const existed = new Set(this.upList.map(it => it.uid))
            const merged = [...this.upList]
            for (const it of records) {
              if (!existed.has(it.uid)) {
                existed.add(it.uid)
                merged.push(it)
              }
            }
            this.upList = merged
          } else {
            this.upList = records
          }
          this.upTotal = res.data.total || 0
        } else if (!append) {
          this.upList = []
          this.upTotal = 0
        }
      } catch (e) {
        console.log('加载UP主列表失败:', e)
        if (!append) {
          this.upList = []
          this.upTotal = 0
        }
      } finally {
        this.upLoading = false
      }
    },
    // 分页获取动态列表
    // type: 0 全部 2 视频投稿（仅 type=2）
    // uid: 按发布者过滤（undefined 表示全部）
    // append=true 时将下一页数据追加到 dynamicList（滚动懒加载用），按 id 去重
    async getDynamicList(pageNum = 1, pageSize = 10, type: 0 | 2 = 0, uid?: number, append = false) {
      this.dynamicLoading = true
      try {
        const url = uid !== undefined && uid !== null
          ? `${DYNAMIC_API.LIST}?pageNum=${pageNum}&pageSize=${pageSize}&type=${type}&uid=${uid}`
          : `${DYNAMIC_API.LIST}?pageNum=${pageNum}&pageSize=${pageSize}&type=${type}`
        const res = await get<DynamicPageApiResponse>(url)
        if (res.code === 200) {
          const records = res.data.records || []
          if (append) {
            const existed = new Set(this.dynamicList.map(d => d.id))
            const merged = [...this.dynamicList]
            for (const it of records) {
              if (!existed.has(it.id)) {
                existed.add(it.id)
                merged.push(it)
              }
            }
            this.dynamicList = merged
          } else {
            this.dynamicList = records
          }
          this.dynamicTotal = res.data.total || 0
        } else if (!append) {
          this.dynamicList = []
          this.dynamicTotal = 0
        }
      } catch (e) {
        console.log('加载动态列表失败:', e)
        if (!append) {
          this.dynamicList = []
          this.dynamicTotal = 0
        }
      } finally {
        this.dynamicLoading = false
      }
    },
    // 空间内搜索：按关键字过滤该用户动态，结果写入独立状态 spaceSearchDynamics
    // append=true 时追加下一页（用于懒加载），按 id 去重
    async searchSpaceDynamics(uid: number, keyword: string, pageNum = 1, pageSize = 10, append = false) {
      if (!append) this.spaceSearchDynamicLoading = true
      try {
        const res = await get<DynamicPageApiResponse>(
          `${DYNAMIC_API.LIST}?pageNum=${pageNum}&pageSize=${pageSize}&uid=${uid}&keyword=${encodeURIComponent(keyword)}`,
        )
        if (res.code === 200) {
          const records = res.data.records || []
          if (append) {
            const existed = new Set(this.spaceSearchDynamics.map(d => d.id))
            const merged = [...this.spaceSearchDynamics]
            for (const it of records) {
              if (!existed.has(it.id)) {
                existed.add(it.id)
                merged.push(it)
              }
            }
            this.spaceSearchDynamics = merged
          } else {
            this.spaceSearchDynamics = records
          }
          this.spaceSearchDynamicTotal = res.data.total || 0
        } else if (!append) {
          this.spaceSearchDynamics = []
          this.spaceSearchDynamicTotal = 0
        }
      } catch (e) {
        console.log('空间搜索动态失败:', e)
        if (!append) {
          this.spaceSearchDynamics = []
          this.spaceSearchDynamicTotal = 0
        }
      } finally {
        this.spaceSearchDynamicLoading = false
      }
    },
    // 获取当前登录用户自己发布的动态总数（信息卡"动态"统计用，区别于全站总数）
    async getMyDynamicCount(uid: number) {
      try {
        const res = await get<DynamicPageApiResponse>(
          `${DYNAMIC_API.LIST}?pageNum=1&pageSize=1&uid=${uid}`,
        )
        if (res.code === 200) {
          this.myDynamicTotal = res.data.total || 0
        }
      } catch (e) {
        console.log('获取我的动态总数失败:', e)
      }
    },
    // 发布动态，返回是否成功
    async publishDynamic(payload: DynamicPublishPayload): Promise<boolean> {
      this.publishLoading = true
      try {
        const res = await post<{ code: number; message: string; data: string }>(
          DYNAMIC_API.PUBLISH,
          payload,
        )
        if (res.code === 200) {
          ElMessage.success(res.message || '发布成功')
          return true
        }
        ElMessage.error(res.message || '发布失败')
        return false
      } catch (e) {
        console.log('发布动态失败:', e)
        ElMessage.error('发布失败，请稍后重试')
        return false
      } finally {
        this.publishLoading = false
      }
    },
    // 删除动态（仅发布者本人可删），先弹窗确认，再调用接口，成功后从列表移除
    async deleteDynamic(item: Dynamic): Promise<boolean> {
      try {
        await ElMessageBox.confirm('确定要删除这条动态吗？删除后无法恢复。', '删除确认', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning',
        })
      } catch {
        return false
      }
      this.deleteLoading = true
      try {
        const res = await get<{ code: number; message: string; data: string }>(
          `${DYNAMIC_API.DELETE}?id=${item.id}`,
        )
        if (res.code === 200) {
          this.dynamicList = this.dynamicList.filter(d => d.id !== item.id)
          this.dynamicTotal = Math.max(0, this.dynamicTotal - 1)
          this.myDynamicTotal = Math.max(0, this.myDynamicTotal - 1)
          ElMessage.success(res.message || '删除成功')
          return true
        }
        ElMessage.error(res.message || '删除失败')
        return false
      } catch (e) {
        console.log('删除动态失败:', e)
        ElMessage.error('删除失败，请稍后重试')
        return false
      } finally {
        this.deleteLoading = false
      }
    },
    // 点赞/取消点赞动态。不做乐观更新：成功后用服务端返回写回，避免被拉黑拒绝时数字“先加一再回滚”的闪烁。
    // 返回是否成功
    async toggleLike(dynamicId: number): Promise<boolean> {
      const item = this.dynamicList.find(d => d.id === dynamicId)
      if (!item) {
        return false
      }
      try {
        const res = await post<{
          code: number
          message: string
          data: { liked: boolean; likeCount: number }
        }>(`${DYNAMIC_API.LIKE}/${dynamicId}`)
        if (res.code === 200) {
          item.liked = !!res.data.liked
          item.likeCount = res.data.likeCount ?? item.likeCount
          return true
        }
        // 被拒绝（含拉黑：因对方隐私设置，无法进行互动）：不改动本地状态，数字不闪烁
        ElMessage.warning(res.message || '点赞失败')
        return false
      } catch (e) {
        console.log('点赞失败:', e)
        ElMessage.error('点赞失败，请稍后重试')
        return false
      }
    },
  },
})
