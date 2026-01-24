<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { ref } from 'vue'

const userStore = useUserStore()
const isShow = ref(true)
if (!userStore.isLogin) {
  // 清除本地用户数据
  userStore.clearUserInfo()
}
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <div v-show="isShow">
      <keep-alive>
        <component v-if="route.meta.keepAlive" :is="Component" :key="route.name?.toString()" />
      </keep-alive>
      <component v-if="!route.meta.keepAlive" :is="Component" :key="route.name?.toString() || ''" />
    </div>
  </router-view>
</template>

<style></style>
