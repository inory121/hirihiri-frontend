import type { AxiosRequestConfig } from 'axios'
import axios from 'axios'

const instance = axios.create({
  baseURL: 'http://localhost:8082',
  // baseURL: 'http://localhost:7070',
  timeout: 5000,
  // 其他配置项...
})
/**
 * 发起 GET 请求
 * @param url 请求地址
 * @param config 请求配置
 * @returns 请求结果
 */
const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return await instance.get(url, config) // 返回响应数据
}
const post = async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
  return await instance.post(url, data, config)
}

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 添加请求头（示例：添加 token）
    const token = localStorage.getItem('hiri_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  },
)

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    // 直接返回 response.data，简化调用方的代码
    return response.data
  },
  (error) => {
    // 统一处理错误响应
    if (error.response) {
      switch (error.response.status) {
        case 401:
          ElMessage.error("授权失败，请登录！")
          console.error('shou')
          break
        case 404:
          ElMessage.error("资源不存在！")
          console.error('Resource not found')
          break
        case 500:
          ElMessage.error("服务器错误！")
          console.error('Server error')
          break
        default:
          console.error('Request failed with status:', error.response.status)
      }
    } else if (error.request) {
      ElMessage.error("No response received")
      console.error('No response received:', error.request)
    } else {
      ElMessage.error("Request setup error")
      console.error('Request setup error:', error.message)
    }

    // 抛出错误，方便调用方处理
    return Promise.reject(error)
  },
)
export { get, post }
