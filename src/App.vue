<script setup lang="ts">
</script>

<template>
  <main class="pt-[10vh] flex flex-col justify-center items-center gap-4 h-screen">
    <div class="flex gap-4">
      <input type="text" placeholder="请输入IP"></input>
      <div class="flex gap-2">
        <button>粘贴</button>
        <button>提交</button>
      </div>
    </div>
    <div class="flex flex-col w-md mt-5 gap-2.5 overflow-hidden">
      <div class="flex text-base font-semibold">
        <div class="flex-1 flex justify-center items-center">IP</div>
        <div class="flex-1 flex justify-center items-center">添加时间</div>
        <div class="flex-1 flex justify-center items-center">操作</div>
      </div>
      <div class="flex flex-col w-full gap-2.5 overflow-y-auto">
        <div :key="i" v-for="i in 20" class="flex">
          <div class="flex-1 flex justify-center items-center">66.249.72.12</div>
          <div class="flex-1 flex justify-center items-center">66.249.72.12</div>
          <div class="flex-1 flex justify-center items-center">
            <button class="py-1! px-2! bg-red-400! text-white! border-0! text-xs!">删除</button>
          </div>
        </div>
        <div></div>
      </div>
      <div></div>
    </div>
  </main>
</template>

<style scoped>
.logo.vite:hover {
  filter: drop-shadow(0 0 2em #747bff);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #249b73);
}

</style>
<style>
:root {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;

  color: #0f0f0f;
  background-color: #f6f6f6;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}
</style>