<script setup lang="ts">

</script>

<template>
  <div class="h-screen flex items-center justify-center">
    <n-empty description="404 找不到页面">
      <template #extra>
        <n-button @click="$router.replace('/login')" type="error" size="small">
          返回
        </n-button>
      </template>
    </n-empty>
  </div>
</template>

<style scoped>

</style>