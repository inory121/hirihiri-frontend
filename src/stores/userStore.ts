import { defineStore } from 'pinia'
import { get, post } from '@/utils/request'
import { USER_API } from '@/api/user'
import { FOLLOW_API } from '@/api/follow'
import type {
  searchUserApiResponse,
  User,
  UserApiResponse,
  UserDataApiResponse,
  FollowCountApiResponse,
  FollowStatusApiResponse,
  FollowListApiResponse,
} from '@/types/api'
import { hashPassword } from '@/utils/utils.ts'

export const useUserStore = defineStore('user', {
  state: () => {
    return {
      user: {} as User, // 当前登录用户信息
      targetUser: {} as User, // 正在查看的目标用户信息（如他人空间）
      isLogin: false, // 是否登录
      password: '',
      showLoginWindow: false, // 是否显示登录弹窗
      searchUserList: [] as User[], // 用户搜索结果列表
      searchUserTotal: 0, // 用户搜索结果总数
      targetUserLoading: true, // 目标用户信息加载状态
      targetFollow: {
        // 目标用户的关注统计与当前登录用户的关注状态
        followers: 0, // 粉丝数
        followings: 0, // 关注数
        isFollowing: false, // 当前登录用户是否关注目标用户
      },
      targetFollowLoading: true, // 目标用户关注信息加载状态
      currentUserFollow: {
        // 当前登录用户的关注统计
        followers: 0, // 粉丝数
        followings: 0, // 关注数
      },
      currentUserFollowLoading: false, // 当前登录用户关注信息加载状态
      followList: [] as User[], // 当前 tab 下展示的关注/粉丝用户列表
      followListLoading: false, // followList 加载状态
      followStatusMap: {} as Record<number, boolean>, // 用户 uid -> 是否已关注 的映射
    }
  },
  getters: {},
  actions: {
    async login() {
      await post<UserDataApiResponse>(USER_API.USER_LOGIN, {
        username: this.user.username,
        password: hashPassword(this.password),
      })
        .then((res) => {
          if (res.code === 200) {
            ElMessage.success(res.message)
            this.user = res.data.user
            localStorage.setItem('hiri_token', res.data.token)
            if (res.data.user && res.data.user.uid) {
              localStorage.setItem('hiri_uid', String(res.data.user.uid))
              this.getCurrentUserFollowCount(res.data.user.uid)
            }
            this.showLoginWindow = false
            this.isLogin = true
          } else {
            ElMessage.error(res.message)
          }
        })
        .catch((err) => {
          ElMessage.error(err.response.data.message)
        })
    },
    async register() {
      await post<UserDataApiResponse>(USER_API.USER_REGISTER, {
        username: this.user.username,
        password: hashPassword(this.password),
      }).then((res) => {
        if (res.code === 500) {
          ElMessage.error(res.message)
        } else {
          ElMessage.success(res.message)
        }
      })
    },
    async logout() {
      await post<UserDataApiResponse>(USER_API.USER_LOGOUT)
      localStorage.removeItem('hiri_token')
      localStorage.removeItem('hiri_uid')
      this.isLogin = false
      localStorage.setItem('showLoginAfterLogout', 'true')
      window.location.href = '/'
    },

    async getUserInfo() {
      if (localStorage.getItem('hiri_token')) {
        await get<UserApiResponse>(USER_API.USER_INFO)
          .then(async (res) => {
            if (res.code === 200) {
              this.user = res.data
              if (res.data && res.data.uid) {
                localStorage.setItem('hiri_uid', String(res.data.uid))
                await this.getCurrentUserFollowCount(res.data.uid)
              }
              this.isLogin = true
            }
          })
          .catch(() => {
            localStorage.removeItem('hiri_token')
            localStorage.removeItem('hiri_uid')
            this.isLogin = false
            ElMessage.error('请求用户信息失败，请重新登录')
          })
      }
    },
    async getSearchUsers(keyword: string, order = 'default', pageNum = 1, pageSize = 36) {
      await get<{ code: number; data: { records: User[]; total: number } }>(
        `${USER_API.GET_SEARCH_USER}?keyword=${encodeURIComponent(keyword)}&order=${order}&pageNum=${pageNum}&pageSize=${pageSize}`,
      ).then(
        (res) => {
          if (res.code === 200) {
            this.searchUserList = res.data.records
            this.searchUserTotal = res.data.total || 0
            if (this.isLogin) {
              for (const item of res.data.records) {
                this.followStatusMap[item.uid] = !!item.isFollowing
              }
            }
          } else {
            this.searchUserList = []
            this.searchUserTotal = 0
            ElMessage.error('没有搜索到用户')
          }
        },
      )
    },
    setLoginState() {
      this.isLogin = !!localStorage.getItem('hiri_token')
    },
    // 根据 uid 获取目标用户信息（他人空间）
    async getTargetUserInfo(uid: number) {
      this.targetUserLoading = true
      try {
        const res = await get<UserApiResponse>(`${USER_API.USER_INFO}/${uid}`)
        if (res.code === 200) {
          this.targetUser = res.data
        } else {
          this.targetUser = {} as User
        }
      } catch (e) {
        console.log('加载用户信息失败:', e)
        this.targetUser = {} as User
      } finally {
        this.targetUserLoading = false
      }
    },
    // 获取当前登录用户的关注数/粉丝数
    async getCurrentUserFollowCount(targetUid: number) {
      this.currentUserFollowLoading = true
      try {
        const res = await get<FollowCountApiResponse>(`${FOLLOW_API.COUNT}/${targetUid}`)
        if (res.code === 200) {
          this.currentUserFollow.followers = res.data.followers
          this.currentUserFollow.followings = res.data.followings
        }
      } catch (e) {
        console.log('加载当前用户关注信息失败:', e)
      } finally {
        this.currentUserFollowLoading = false
      }
    },
    // 获取指定用户的粉丝数（供非主页场景调用，返回纯数字）
    async getFollowCount(targetUid: number): Promise<number | null> {
      try {
        const res = await get<FollowCountApiResponse>(`${FOLLOW_API.COUNT}/${targetUid}`)
        if (res.code === 200) {
          return res.data.followers
        }
        return null
      } catch (e) {
        console.log('获取关注数失败:', e)
        return null
      }
    },
    // 查询当前登录用户是否关注指定用户（供非主页场景调用，返回布尔值）
    async getFollowStatus(targetUid: number): Promise<boolean | null> {
      try {
        const res = await get<FollowStatusApiResponse>(`${FOLLOW_API.STATUS}/${targetUid}`)
        if (res.code === 200) {
          return res.data
        }
        return null
      } catch (e) {
        console.log('查询关注状态失败:', e)
        return null
      }
    },
    // 获取目标用户的关注数/粉丝数及当前登录用户的关注状态
    async getTargetFollowInfo(targetUid: number) {
      this.targetFollowLoading = true
      try {
        const countRes = await get<FollowCountApiResponse>(`${FOLLOW_API.COUNT}/${targetUid}`)
        if (countRes.code === 200) {
          this.targetFollow.followers = countRes.data.followers
          this.targetFollow.followings = countRes.data.followings
        }
        if (this.isLogin && this.user.uid && this.user.uid !== targetUid) {
          const statusRes = await get<FollowStatusApiResponse>(`${FOLLOW_API.STATUS}/${targetUid}`)
          if (statusRes.code === 200) {
            this.targetFollow.isFollowing = statusRes.data
          }
        } else {
          this.targetFollow.isFollowing = false
        }
      } catch (e) {
        console.log('加载关注信息失败:', e)
      } finally {
        this.targetFollowLoading = false
      }
    },
    // 关注 / 取消关注指定用户
    // - 如果被操作的用户恰好是当前页面展示的目标用户，同步更新其关注状态与粉丝数
    // - 如果当前页面展示的目标用户就是当前登录用户自己，同步更新其关注数
    async toggleFollow(targetUid: number) {
      try {
        const res = await post<{ code: number; data: string; message: string }>(
          `${FOLLOW_API.TOGGLE}/${targetUid}`,
        )
        if (res.code === 200) {
          ElMessage.success(res.message)
          const isTargetUser = this.targetUser.uid && this.targetUser.uid === targetUid
          const isViewingSelf =
            this.targetUser.uid && this.user.uid && this.targetUser.uid === this.user.uid
          const wasFollowing = isTargetUser
            ? this.targetFollow.isFollowing
            : this.followStatusMap[targetUid] === true
          this.followStatusMap[targetUid] = !wasFollowing
          // 如果是当前登录用户自己，同步更新他的关注数（任何页面都有效）
          if (wasFollowing) {
            this.currentUserFollow.followings -= 1
          } else {
            this.currentUserFollow.followings += 1
          }
          // 如果正在看的是目标用户自己的主页，同步更新目标页面上的统计
          if (isTargetUser) {
            this.targetFollow.isFollowing = !wasFollowing
            if (wasFollowing) {
              this.targetFollow.followers -= 1
            } else {
              this.targetFollow.followers += 1
            }
          } else if (isViewingSelf) {
            if (wasFollowing) {
              this.targetFollow.followings -= 1
            } else {
              this.targetFollow.followings += 1
            }
          }
        } else {
          ElMessage.error(res.message)
        }
      } catch (e) {
        console.log('关注操作失败:', e)
        ElMessage.error('操作失败，请稍后重试')
      }
    },
    // 将列表中的 isFollowing 字段同步到 followStatusMap
    syncFollowStatusFromList(list: User[]) {
      if (!this.isLogin || !list || list.length === 0) return
      for (const item of list) {
        if (item.isFollowing !== undefined) {
          this.followStatusMap[item.uid] = item.isFollowing
        }
      }
    },
    // 获取指定用户的粉丝列表，并同步每位用户的关注状态
    async getFollowers(uid: number) {
      this.followListLoading = true
      try {
        const res = await get<FollowListApiResponse>(`${FOLLOW_API.FOLLOWERS}/${uid}`)
        if (res.code === 200) {
          this.followList = res.data
          this.syncFollowStatusFromList(res.data)
        } else {
          this.followList = []
        }
      } catch (e) {
        console.log('加载粉丝列表失败:', e)
        this.followList = []
      } finally {
        this.followListLoading = false
      }
    },
    // 获取指定用户的关注列表，并同步每位用户的关注状态
    async getFollowings(uid: number) {
      this.followListLoading = true
      try {
        const res = await get<FollowListApiResponse>(`${FOLLOW_API.FOLLOWINGS}/${uid}`)
        if (res.code === 200) {
          this.followList = res.data
          this.syncFollowStatusFromList(res.data)
        } else {
          this.followList = []
        }
      } catch (e) {
        console.log('加载关注列表失败:', e)
        this.followList = []
      } finally {
        this.followListLoading = false
      }
    },
  },
})
