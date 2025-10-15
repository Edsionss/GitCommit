import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api', // 统一的 API 前缀
  timeout: 10000 // 设置超时时间
})

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    // 后端返回的数据结构是 { success: boolean, data: any, message?: string }
    // 如果请求成功，直接返回 data 字段的内容
    if (response.data && response.data.success) {
      return response.data.data
    }
    // 如果 success 为 false，或数据结构不匹配，则拒绝 Promise
    return Promise.reject(new Error(response.data.message || 'Request failed with no message'))
  },
  (error) => {
    // 处理网络错误等
    console.error('API Client Error:', error)
    const message = error.response?.data?.message || error.message || 'An unknown error occurred'
    return Promise.reject(new Error(message))
  }
)

export default apiClient
