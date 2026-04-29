import axios from 'axios'
import { createDiscreteApi } from 'naive-ui'
import { useUserStore } from '@/stores/userStore'

const { message } = createDiscreteApi(['message'])

const httpInstance = axios.create({
  baseURL: 'https://ipwl.zoneairs.com', // http://127.0.0.1:17778', // TODO location.origin + '/apis',
  // baseURL: 'http://127.0.0.1:17778',
  timeout: 40000,
})

// 拦截器
// axios请求拦截器
httpInstance.interceptors.request.use(
  (config) => {
    // 1、从pinia获取token数据
    const userStore = useUserStore()
    if (userStore.isLogin) {
      config.headers.Token = userStore.userToken
    }
    return config
  },
  (e) => Promise.reject(e),
)

// axios相应拦截器
httpInstance.interceptors.response.use(
  (res) => res.data,
  (e) => {
    switch (e.response?.status) {
      case 401: // 401token失效处理
        //清除本地用户数据
        const userStore = useUserStore()
        userStore.clearUserInfo()
        break
      default:
        if (e.code === 'ECONNABORTED' && e.message.includes('timeout')) {
          // 请求超时处理
          message.error('请求超时，请稍后重试')
        } else {
          message.error(
            e.response?.data?.msg ??
              e.response.status + ' ' + e.response.statusText + ' ' + '请求失败',
          )
        }
    }

    return Promise.reject(e)
  },
)

export default httpInstance
