import { defineStore } from 'pinia'
import { del, get, post, put } from '@/utils/request'
import router from '@/router'
import { VIDEO_API } from '@/api/video'
import type {
  OneVideoApiResponse,
  SubCategory,
  User,
  Video,
  VideoInfo,
  VideoStat,
  FavoriteFolder,
  FavoriteFolderApiResponse,
  FavoriteFolderItemApiResponse,
  FavoriteVideoListApiResponse,
  FavoriteVideoPageApiResponse,
} from '@/types/api.ts'
import { useUserStore } from '@/stores/userStore'

export const useVideoStore = defineStore('video', {
  state: () => {
    return {
      videoInfo: {
        video: {} as Video,
        stat: {} as VideoStat,
        category: {} as SubCategory,
        user: {} as User,
      },
      videoList: [] as VideoInfo[], // 推荐视频列表
      searchVideoList: [] as VideoInfo[],
      searchVideoTotal: 0,
      hotSearchList: [] as string[],
      searchSuggestList: [] as string[],
      userVideoList: [] as VideoInfo[], // 用户投稿视频列表
      userVideoTotal: 0,
      spaceSearchVideos: [] as VideoInfo[], // 空间内搜索命中的投稿视频（独立状态，不污染投稿 tab）
      spaceSearchVideoTotal: 0,
      spaceSearchVideoLoading: false,
      userVideoStats: {
        totalVideos: 0,
        totalViews: 0,
        totalLikes: 0,
        totalCoins: 0,
        totalFavorites: 0,
        totalDanmaku: 0,
      } as {
        totalVideos: number
        totalViews: number
        totalLikes: number
        totalCoins: number
        totalFavorites: number
        totalDanmaku: number
      },
      pinnedVideo: null as VideoInfo | null, // 用户置顶视频
      loading: true, // 骨架屏显示
      userVideoLoading: true, // 用户投稿视频加载状态
      pinnedVideoLoading: false, // 置顶视频加载状态
      isShow: false, // 是否显示视频详情
      pageNum: 0,
      pageSize: 20,
      onlineCount: 0, // 当前视频在线人数
      // 视频互动状态
      liked: false,
      disliked: false,
      coined: 0, // 当前用户对本视频的已投币数（0/1/2）
      favorited: false,
    }
  },
  getters: {
    videoDuration(state) {
      return state.videoInfo.video.duration
    },
  },
  actions: {
    async getVideo(vid: number) {
      try {
        const res = await get<OneVideoApiResponse>(`${VIDEO_API.GET_BY_ID}/${vid}`)
        if (res.code === 200 && res.data?.video?.vid) {
          this.isShow = true
          this.videoInfo = res.data
          return
        }
        // 视频不存在或已被删除：重置残留数据并跳转 404
        this.isShow = false
        this.videoInfo = {
          video: {} as Video,
          stat: {} as VideoStat,
          category: {} as SubCategory,
          user: {} as User,
        }
        ElMessage.error('视频不存在或已被删除')
        router.replace({ name: 'NotFound' })
      } catch (e) {
        // 请求异常同样按无效处理，避免页面停在空状态
        console.log('获取视频信息失败:', e)
        this.isShow = false
        ElMessage.error('视频加载失败')
        router.replace({ name: 'NotFound' })
      }
    },
    async getSearchVideos(keyword: string, order = 'default', pageNum = 1, pageSize = 36) {
      await get<{ code: number; data: { records: VideoInfo[]; total: number } }>(
        `${VIDEO_API.GET_SEARCH_VIDEO}?keyword=${keyword}&order=${order}&pageNum=${pageNum}&pageSize=${pageSize}`,
      ).then(
        (res) => {
          if (res.code === 200) {
            this.searchVideoList = res.data.records
            this.searchVideoTotal = res.data.total || 0
          } else {
            this.searchVideoList = []
            this.searchVideoTotal = 0
            ElMessage.error('没有搜索到视频')
          }
        },
      )
    },
    async getHotSearchList(limit = 10) {
      const res = await get<{ code: number; data: string[] }>(
        `${VIDEO_API.GET_HOT_SEARCH}?limit=${limit}`,
      )
      this.hotSearchList = res.code === 200 ? res.data || [] : []
    },
    async getSearchSuggest(keyword: string, limit = 10): Promise<string[]> {
      if (!keyword.trim()) {
        this.searchSuggestList = []
        return []
      }
      try {
        const res = await get<{ code: number; data: string[] }>(
          `${VIDEO_API.GET_SEARCH_SUGGEST}?keyword=${encodeURIComponent(keyword)}&limit=${limit}`,
        )
        this.searchSuggestList = res.code === 200 ? res.data || [] : []
      } catch (e) {
        console.error('获取搜索建议失败', e)
        this.searchSuggestList = []
      }
      return this.searchSuggestList
    },
    async getUserVideos(uid: number, pageNum = 1, pageSize = 100, order = 'date') {
      this.userVideoLoading = true
      try {
        const res = await get<{ code: number; data: { records: VideoInfo[]; total: number } }>(`${VIDEO_API.GET_BY_UID}/${uid}`, {
          params: { pageNum, pageSize, order },
        })
        if (res.code === 200) {
          this.userVideoList = res.data.records
          this.userVideoTotal = res.data.total || 0
        } else {
          this.userVideoList = []
          this.userVideoTotal = 0
        }
      } catch (e) {
        console.log('加载用户投稿视频失败:', e)
        this.userVideoList = []
        this.userVideoTotal = 0
      } finally {
        this.userVideoLoading = false
      }
    },
    // 空间内搜索：按关键字过滤该用户投稿视频，结果写入独立状态 spaceSearchVideos
    async searchSpaceVideos(uid: number, keyword: string, pageNum = 1, pageSize = 20, order = 'date') {
      this.spaceSearchVideoLoading = true
      try {
        const res = await get<{ code: number; data: { records: VideoInfo[]; total: number } }>(`${VIDEO_API.GET_BY_UID}/${uid}`, {
          params: { pageNum, pageSize, order, keyword },
        })
        if (res.code === 200) {
          this.spaceSearchVideos = res.data.records
          this.spaceSearchVideoTotal = res.data.total || 0
        } else {
          this.spaceSearchVideos = []
          this.spaceSearchVideoTotal = 0
        }
      } catch (e) {
        console.log('空间搜索投稿视频失败:', e)
        this.spaceSearchVideos = []
        this.spaceSearchVideoTotal = 0
      } finally {
        this.spaceSearchVideoLoading = false
      }
    },
    async getUserVideoStats(uid: number) {
      try {
        const res = await get<{
          code: number
          data: {
            totalVideos: number
            totalViews: number
            totalLikes: number
            totalCoins: number
            totalFavorites: number
            totalDanmaku: number
          }
        }>(`${VIDEO_API.GET_BY_UID}/stats/${uid}`)
        if (res.code === 200 && res.data) {
          this.userVideoStats = {
            totalVideos: Number(res.data.totalVideos) || 0,
            totalViews: Number(res.data.totalViews) || 0,
            totalLikes: Number(res.data.totalLikes) || 0,
            totalCoins: Number(res.data.totalCoins) || 0,
            totalFavorites: Number(res.data.totalFavorites) || 0,
            totalDanmaku: Number(res.data.totalDanmaku) || 0,
          }
        }
      } catch (e) {
        console.log('加载用户视频统计数据失败:', e)
      }
    },
    async getPinnedVideo(uid: number) {
      this.pinnedVideoLoading = true
      try {
        const res = await get<OneVideoApiResponse>(`${VIDEO_API.GET_PINNED}/${uid}`)
        if (res.code === 200 && res.data) {
          this.pinnedVideo = res.data
        } else {
          this.pinnedVideo = null
        }
      } catch (e) {
        console.log('加载置顶视频失败:', e)
        this.pinnedVideo = null
      } finally {
        this.pinnedVideoLoading = false
      }
    },
    async setPinnedVideo(vid: number): Promise<boolean> {
      try {
        const res = await post<{ code: number; data: string; message: string }>(
          `${VIDEO_API.SET_PINNED}/${vid}`,
        )
        if (res.code === 200) {
          ElMessage.success(res.message || '设置置顶成功')
          return true
        }
        ElMessage.error(res.message || '设置置顶失败')
        return false
      } catch (e) {
        console.error('设置置顶失败:', e)
        ElMessage.error('设置置顶失败')
        return false
      }
    },
    async cancelPinnedVideo(vid: number): Promise<boolean> {
      try {
        const res = await post<{ code: number; data: string; message: string }>(
          `${VIDEO_API.CANCEL_PINNED}/${vid}`,
        )
        if (res.code === 200) {
          ElMessage.success(res.message || '取消置顶成功')
          return true
        }
        ElMessage.error(res.message || '取消置顶失败')
        return false
      } catch (e) {
        console.error('取消置顶失败:', e)
        ElMessage.error('取消置顶失败')
        return false
      }
    },
    async reportPlay(vid: number) {
      try {
        const res = await post<{ code: number; data: boolean }>(VIDEO_API.REPORT_PLAY, null, {
          params: { vid },
        })
        // 只在后端真正计数了时才更新前端显示
        if (res.data) {
          this.videoInfo.stat.view += 1
        }
        console.log('播放量上报成功')
      } catch (e) {
        console.error('播放量上报失败', e)
      }
    },
    async sendHeartbeat(vid: number, viewerId: string) {
      try {
        const res = await post<{ code: number; data: number }>(VIDEO_API.HEARTBEAT, null, {
          params: { vid, viewerId },
        })
        this.onlineCount = res.data || 0
      } catch (e) {
        console.error('心跳上报失败', e)
      }
    },
    // 获取互动状态
    async getInteractionStatus(vid: number) {
      const userStore = useUserStore()
      if (!userStore.isLogin) {
        this.liked = false
        this.coined = 0
        this.favorited = false
        return
      }
      try {
        const res = await get<{ code: number; data: [boolean, boolean, number, boolean] }>(
          `${VIDEO_API.GET_INTERACTION_STATUS}/${vid}`
        )
        if (res.code === 200) {
          this.liked = res.data[0]
          this.disliked = res.data[1]
          this.coined = res.data[2]
          this.favorited = res.data[3]
        }
      } catch (e) {
        console.error('获取互动状态失败', e)
      }
    },
    // 点赞/取消点赞
    async toggleLike(vid: number) {
      const userStore = useUserStore()
      if (!userStore.isLogin) {
        ElMessage.warning('请先登录')
        return
      }
      try {
        const res = await post<{ code: number; data: string; message?: string }>(
          `${VIDEO_API.TOGGLE_LIKE}/${vid}`
        )
        if (res.code === 200) {
          this.liked = !this.liked
          if (this.liked) {
            this.videoInfo.stat.like += 1
            ElMessage.success('点赞成功')
          } else {
            this.videoInfo.stat.like -= 1
            ElMessage.success('取消点赞')
          }
        } else {
          // 被后端拒绝（含拉黑：因对方隐私设置，无法进行互动）
          ElMessage.warning(res.message || '操作失败')
        }
      } catch (e) {
        console.error('点赞操作失败', e)
      }
    },
    // 投币/取消投币
    async toggleDislike(vid: number) {
      const userStore = useUserStore()
      if (!userStore.isLogin) {
        ElMessage.warning('璇峰厛鐧诲綍')
        return
      }
      try {
        const res = await post<{ code: number; data: string; message?: string }>(
          `${VIDEO_API.TOGGLE_DISLIKE}/${vid}`,
        )
        if (res.code === 200) {
          this.disliked = !this.disliked
          this.videoInfo.stat.dislike = Math.max(
            0,
            this.videoInfo.stat.dislike + (this.disliked ? 1 : -1),
          )
        } else {
          // 被后端拒绝（含拉黑：因对方隐私设置，无法进行互动）
          ElMessage.warning(res.message || '操作失败')
        }
      } catch (e) {
        console.error('涓嶅枩娆㈡搷浣滃け璐?', e)
      }
    },
    async toggleCoin(vid: number, count = 1) {
      const userStore = useUserStore()
      if (!userStore.isLogin) {
        ElMessage.warning('请先登录')
        return
      }
      try {
        const res = await post<{ code: number; data: string; message: string }>(
          `${VIDEO_API.TOGGLE_COIN}/${vid}?count=${count}`
        )
        if (res.code === 200) {
          // 投币为累加（非开关）：已投币数 +count，上限 2
          this.coined = Math.min(2, (Number(this.coined) || 0) + count)
          this.videoInfo.stat.coin += count
          ElMessage.success('投币成功')
        } else {
          // 后端业务失败（如硬币不足、不能给自己投币、投币枚数已用完等）：弹出后端 message
          ElMessage.error(res.message || '投币失败')
        }
      } catch (e) {
        console.error('投币操作失败', e)
        ElMessage.error('投币失败，请稍后重试')
      }
    },
// 收藏/取消收藏
    async getUserFavoriteFolders(vid?: number, targetUid?: number): Promise<FavoriteFolder[]> {
      const res = await get<FavoriteFolderApiResponse>(VIDEO_API.GET_FAVORITE_FOLDERS, {
        params: { vid, uid: targetUid },
      })
      if (res.code !== 200) throw new Error(res.message)
      return res.data || []
    },
    async createFolder(name: string, description?: string): Promise<FavoriteFolder | null> {
      const res = await post<FavoriteFolderItemApiResponse>(VIDEO_API.CREATE_FAVORITE_FOLDER, {
        folderName: name,
        description: description || undefined,
      })
      if (res.code !== 200) throw new Error(res.message)
      return res.data || null
    },
    async updateFolder(folderId: number, name: string, description?: string): Promise<boolean> {
      const res = await put<{ code: number; message: string }>(
        `${VIDEO_API.UPDATE_FAVORITE_FOLDER}/${folderId}`,
        { folderName: name, description: description || undefined },
      )
      if (res.code !== 200) throw new Error(res.message)
      return true
    },
    async deleteFolder(folderId: number): Promise<boolean> {
      const res = await del<{ code: number; message: string }>(
        `${VIDEO_API.DELETE_FAVORITE_FOLDER}/${folderId}`,
      )
      if (res.code !== 200) throw new Error(res.message)
      return true
    },
    async collectToFolder(vid: number, folderId: number): Promise<boolean> {
      const res = await post<{ code: number; message: string }>(
        `${VIDEO_API.COLLECT_TO_FOLDER}/${vid}/folder/${folderId}`,
      )
      if (res.code !== 200) throw new Error(res.message)
      return true
    },
    async removeFromFolder(vid: number, folderId: number, updateStat = true): Promise<boolean> {
      const result = await this.collectToFolder(vid, folderId)
      if (updateStat && this.favorited) {
        this.favorited = false
        this.videoInfo.stat.favorite = Math.max(0, this.videoInfo.stat.favorite - 1)
      }
      return result
    },
    async getFolderVideos(folderId: number, pageNum = 1, pageSize = 36): Promise<VideoInfo[]> {
      const res = await get<FavoriteVideoPageApiResponse>(
        `${VIDEO_API.GET_FOLDER_VIDEOS}/${folderId}/videos`,
        { params: { pageNum, pageSize } },
      )
      if (res.code !== 200) throw new Error(res.message)
      return res.data?.records || []
    },
    async getRecentCoinVideos(limit = 10, targetUid?: number): Promise<VideoInfo[]> {
      const res = await get<FavoriteVideoListApiResponse>(VIDEO_API.GET_RECENT_COINS, {
        params: { limit, uid: targetUid },
      })
      if (res.code !== 200) throw new Error(res.message)
      return res.data || []
    },
    async getRecentLikeVideos(limit = 10, targetUid?: number): Promise<VideoInfo[]> {
      const res = await get<FavoriteVideoListApiResponse>(VIDEO_API.GET_RECENT_LIKES, {
        params: { limit, uid: targetUid },
      })
      if (res.code !== 200) throw new Error(res.message)
      return res.data || []
    },
  },
})
