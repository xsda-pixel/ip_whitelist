<script setup lang="ts">
import {NConfigProvider, NMessageProvider, NDialogProvider, NSpin} from 'naive-ui'
import {useGlobalLoading} from './composables/useGlobalLoading'
import {RouterView} from 'vue-router'

// 获取状态，绑定到 n-spin 上
const {isLoading, loadingText} = useGlobalLoading()

</script>

<template>
  <n-config-provider>
    <n-message-provider>
      <n-dialog-provider>
        <n-modal-provider>
          <n-spin
              :show="isLoading"
              :description="loadingText"
              class="global-spin-container"
          >
            <RouterView/>
          </n-spin>
        </n-modal-provider>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<style scoped>
/* ✅ 强制让 n-spin 的容器占满全屏 */
.global-spin-container {
  height: 100vh; /* 视口高度 */
  width: 100vw; /* 视口宽度 */
}

/* ✅ 修复 n-spin 生成的遮罩层级问题
   确保它足够高，能挡住页面上的其他元素
*/
.n-spin-content {
  height: 100%;
  width: 100%;
}
</style>
