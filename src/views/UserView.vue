<script setup lang="ts">
import {NButton, useMessage, useDialog} from 'naive-ui'
import type {DataTableColumns} from 'naive-ui'
import {ref, h, onMounted, computed} from "vue";
import * as clipboard from 'clipboard-polyfill'
import {useGlobalLoading} from '@/composables/useGlobalLoading'
import {addRuleAPI, deleteRuleAPI, listAPI} from "@/apis/api";
import type {IpData} from "@/types/type";
import {useUserStore} from "@/stores/userStore";

const {startLoading, stopLoading} = useGlobalLoading()
const ipAddress = ref('')
const items = ref<IpData[]>([])
const isLock = ref(false)
const dialog = useDialog()
const message = useMessage()
const userStore = useUserStore()
const port = ref<string | null>(null)

const pasteContent = async () => {
  try {
    const text = await clipboard.readText()
    if (text) {
      ipAddress.value = text
    }
  } catch (err) {
    console.error('paste failed: ', err)
  }
}

function createColumns({play}: {
  play: (row: IpData) => void
}): DataTableColumns<IpData> {
  return [
    {
      title: '类型',
      key: 'type',
      align: 'center',
    },
    {
      title: '协议',
      key: 'protocol',
      align: 'center',
    },
    {
      title: '端口号',
      key: 'portRange',
      align: 'center',
    },
    {
      title: 'IP',
      key: 'source',
      align: 'center',
    },
    {
      title: '操作',
      key: 'actions',
      align: 'center',
      render(row) {
        return h(
            NButton,
            {
              strong: true,
              tertiary: true,
              size: 'small',
              onClick: () => play(row)
            },
            {default: () => '删除'}
        )
      }
    }
  ]
}

const columns = createColumns({
  play(row: IpData) {
    dialog.create({
      title: '删除确认',
      content: `确定要删除IP: ${row.source} 吗？`,
      positiveText: '确认',
      negativeText: '取消',
      onPositiveClick: () => {
        deleteIp(row.source, row.portRange)
      }
    })
  }
})

const pagination = false as const

const onGetPublicIp = async () => {
  try {
    startLoading('获取中...')
    // 使用 ipify 的免费接口 (支持 HTTPS 和 CORS)
    const response = await fetch('https://api.ipify.org?format=json')
    if (!response.ok) {
      message.error("获取失败")
      return
    }

    const data = await response.json()
    message.success("获取成功")
    ipAddress.value = data.ip
  } finally {
    stopLoading()
  }
}

const onAddIp = () => {
  if (isLock.value) {
    return
  }
  isLock.value = true

  startLoading()

  addRuleAPI(ipAddress.value, port.value ?? '').then(() => {
    ipAddress.value = ''
    message.success("添加成功")
    getList()
  }).finally(() => {
    stopLoading()
    isLock.value = false
  })
}

const deleteIp = (source: string, port: string) => {
  if (isLock.value) {
    return
  }
  isLock.value = true

  startLoading()

  deleteRuleAPI(source, port).then(() => {
    message.success("删除成功")
    getList()
  }).finally(() => {
    stopLoading()
    isLock.value = false
  })
}

const getList = () => {
  listAPI().then((res) => {
    items.value = res.data
  }).finally(() => {
    stopLoading()
  })
}

const onRefresh = () => {
  startLoading()
  userStore.updateUserInfo()
  getList()
}

const onLogout = () => {
  dialog.create({
    title: '退出登录确认',
    content: `确定要退出登录吗？`,
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: () => {
      userStore.clearUserInfo()
    }
  })
}

const options = computed(() => {
  const ports = new Set<string>()
  userStore.userInfo.ports.forEach(item => {
    ports.add(item.toString())
  })
  return Array.from(ports).map(port => ({label: port, value: port}))
})

onMounted(() => {
  getList()
})
</script>

<template>
  <main class="pt-[5vh] flex flex-col justify-center items-center gap-4 h-screen">
    <div class="flex gap-2">
      <n-input v-model:value.trim="ipAddress" class="w-[40vw]!" type="text" clearable placeholder="请输入IP地址">
        <template #suffix>
          <div @click="pasteContent" class="ml-2 text-sm cursor-pointer">
            粘贴
          </div>
        </template>
      </n-input>
      <div class="w-20">
        <n-select v-model:value="port" placeholder="端口号" :options="options"/>
      </div>
      <div class="flex gap-2 text-sm items-center">
        <n-button @click="onAddIp" type="primary">
          添加
        </n-button>
        <n-button @click="onGetPublicIp" type="info">
          获取本机IP
        </n-button>
        <n-button @click="onRefresh" type="tertiary">
          刷新
        </n-button>
        <n-button @click="onLogout" type="warning">
          退出登录
        </n-button>
      </div>
    </div>
    <n-data-table
        class="w-full flex-1"
        flex-height
        :columns="columns"
        :data="items"
        :pagination="pagination"
        :bordered="false"
    />
    <div></div>
  </main>
</template>

<style scoped>

</style>