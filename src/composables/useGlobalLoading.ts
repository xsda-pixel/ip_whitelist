import { ref } from 'vue'

// 定义一个全局的响应式变量
const isLoading = ref(false)
const loadingText = ref('加载中...')

export function useGlobalLoading() {
  // 开启 Loading
  const startLoading = (text = '加载中...') => {
    loadingText.value = text
    isLoading.value = true
  }

  // 关闭 Loading
  const stopLoading = () => {
    isLoading.value = false
  }

  return {
    isLoading,
    loadingText,
    startLoading,
    stopLoading,
  }
}
