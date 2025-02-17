import type { AxiosRequestConfig } from 'axios'
import axios from 'axios'

const instance = axios.create({
  baseURL: 'http://localhost/api',
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
    // ElMessage.success(response.data.message)
    return response.data
  },
  (error) => {
    // 统一处理错误响应
    // console.log(error, '**********************')
    // switch (error.status) {
    //   case 400:
    //     ElMessage.error('🤔 请求参数迷路了，检查一下再出发？')
    //     break
    //   case 401:
    //     ElMessage.error('🚨 闯入禁区！请先通过身份验证')
    //     break
    //   case 403:
    //     ElMessage.error('🔞 未成年系统禁止访问该区域')
    //     break
    //   case 404:
    //     ElMessage.error('👻 页面被幽灵带走了，试试其他入口？')
    //     break
    //   case 405:
    //     ElMessage.error('🚦 请求方法违规！交警已开出代码罚单')
    //     break
    //   case 429:
    //     ElMessage.error('⚡ 操作太快啦！冷却时间剩余5秒')
    //     break
    //   case 500:
    //     ElMessage.error('🔥 代码着火啦！程序员正在全力灭火中')
    //   default:
    //     ElMessage.error(`🌌 未知异常！错误代码：${error.status}已召唤工程师处理`)
    // }
    // ElMessage.error("🔥 代码着火啦！程序员正在全力灭火中")
    // 抛出错误，方便调用方处理
    return Promise.reject(error)
  },
)
export { get, post }
