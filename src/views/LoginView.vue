<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useGlobalLoading } from '@/composables/useGlobalLoading'
import { useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'
import { UserType } from '@/types/user'

const reqData = reactive<{ username: string; password: string }>({
  username: '',
  password: '',
})

const isLock = ref(false)
const userStore = useUserStore()
const { startLoading, stopLoading } = useGlobalLoading()
const message = useMessage()
const router = useRouter()

const onLogin = () => {
  if (reqData.username === '' || reqData.password === '') {
    return
  }

  if (isLock.value) {
    return
  }
  isLock.value = true

  startLoading()

  userStore
    .userLogin(reqData.username, reqData.password)
    .then(() => {
      userStore.setUserAccount({ username: reqData.username, password: reqData.password })

      message.success('登录成功')
      if (userStore.userInfo.type == UserType.User) {
        router.replace({ path: '/' })
      } else if (userStore.userInfo.type == UserType.Admin) {
        router.replace({ path: '/admin' })
      }
    })
    .finally(() => {
      stopLoading()
      isLock.value = false
    })
}

const onClear = () => {
  reqData.username = ''
  reqData.password = ''
}

onMounted(() => {
  if (userStore.userAccount) {
    reqData.username = userStore.userAccount.username
    reqData.password = userStore.userAccount.password
  }
})
</script>

<template>
  <div class="flex h-screen flex-col items-center justify-center">
    <div class="flex flex-col items-center gap-4">
      <h1 class="mb-4 text-4xl">IP Whitelist</h1>
      <n-input
        v-model:value.trim="reqData.username"
        autocapitalize="off"
        autocorrect="off"
        spellcheck="false"
        autocomplete="off"
        type="text"
        clearable
        placeholder="请输入用户名"
      />
      <n-input
        v-model:value.trim="reqData.password"
        autocapitalize="off"
        autocorrect="off"
        spellcheck="false"
        autocomplete="off"
        type="password"
        clearable
        placeholder="请输入密码"
      />
      <n-button @click="onLogin" type="primary" block>登录</n-button>
      <n-button @click="onClear" type="tertiary" block>清空</n-button>
    </div>
  </div>
</template>

<style scoped></style>
