import { defineStore } from 'pinia'
import { get, post } from '@/utils/request'
import { USER_API } from '@/api/user'
import type { searchUserApiResponse, User, UserApiResponse, UserDataApiResponse } from '@/types/api'
import { hashPassword } from '@/utils/utils.ts'

export const useUserStore = defineStore('user', {
  state: () => {
    return {
      user: {} as User,
      isLogin: false,
      password: '',
      showLoginWindow: false,
      searchUserList: [] as User[],
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
            this.showLoginWindow = false
            this.isLogin = true
          }else {
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
      this.isLogin = false
    },

    async getUserInfo() {
      if (localStorage.getItem('hiri_token')) {
        await get<UserApiResponse>(USER_API.USER_INFO)
          .then((res) => {
            if (res.code === 200) {
              this.user = res.data
            }
          })
          .catch(() => {
            localStorage.removeItem('hiri_token')
            this.isLogin = false
            ElMessage.error('请求用户信息失败，请重新登录')
          })
      }
    },
    async getSearchUsers(keyword: string) {
      await get<searchUserApiResponse>(`${USER_API.GET_SEARCH_USER}?keyword=${keyword}`).then((res) => {
        if (res.code === 200) {
          this.searchUserList = res.data
        } else {
          this.searchUserList = []
          ElMessage.error('没有搜索到结果')
        }
      })
    },
    setLoginState() {
      this.isLogin = !!localStorage.getItem('hiri_token')
    },
  },
})
