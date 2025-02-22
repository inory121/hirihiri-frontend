import { defineStore } from 'pinia'
import { post } from '@/utils/request'

export interface User {
  auth: number
  authMsg: string
  avatar: string
  background: string
  coin: number
  createDate: string
  description: string
  exp: number
  nickname: string
  sex: number
  uid: number
  username: string
  vip: number
}

export interface UserData {
  user: User
  token: string
}

interface UserDataApiResponse {
  data: UserData
  code: number
  message: string
}

interface UserApiResponse {
  data: User
  code: number
  message: string
}

export const useUserStore = defineStore('user', {
  state: () => {
    return {
      user: {} as User,
      isLogin: false,
      password: '',
      showLoginWindow: false,
    }
  },
  getters: {},
  actions: {
    async login() {
      await post<UserDataApiResponse>('/user/login', {
        username: this.user.username,
        password: this.password,
      })
        .then((res) => {
          if (res.code === 200) {
            ElMessage.success(res.message)
            this.user = res.data.user
            localStorage.setItem('hiri_token', res.data.token)
            this.showLoginWindow = false
            this.isLogin = true
          }
        })
        .catch((err) => {
          ElMessage.error(err.response.data.message)
        })
    },
    async register() {
      await post<UserDataApiResponse>('/user/register', {
        username: this.user.username,
        password: this.password,
      }).then((res) => {
        if (res.code === 500) {
          ElMessage.error(res.message)
        } else {
          ElMessage.success(res.message)
        }
      })
    },
    async logout() {
      await post<UserDataApiResponse>('/user/logout')
      localStorage.removeItem('hiri_token')
      this.isLogin = false
    },

    async getUserInfo() {
      if (localStorage.getItem('hiri_token')) {
        await post<UserApiResponse>('/user/info')
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

    setLoginState() {
      this.isLogin = !!localStorage.getItem('hiri_token')
    },
  },
})
