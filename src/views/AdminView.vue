<script setup lang="ts">
import {NButton, useMessage, useDialog, NSpace, NSwitch, NText, NIcon} from 'naive-ui'
import type {DataTableColumns} from 'naive-ui'
import {ref, h, onMounted, reactive, toRaw} from 'vue'
import {useGlobalLoading} from '@/composables/useGlobalLoading'
import {useUserStore} from '@/stores/userStore'
import {UserItemData, UserRequestData, UserStatus} from '@/types/user'
import {createUserAPI, deleteUserAPI, getUserListAPI, updateUserAPI, updateUserStatusAPI} from '@/apis/user'
import {CopyOutline} from '@vicons/ionicons5'

const {startLoading, stopLoading} = useGlobalLoading()
const items = ref<UserItemData[]>([])
const isLock = ref(false)
const dialog = useDialog()
const message = useMessage()
const userStore = useUserStore()
const showModal = ref(false)
const reqData = reactive<UserRequestData>({
  provider: null,
  region: '',
  username: '',
  password: '',
  accessKey: '',
  secretKey: '',
  groupId: '',
  ports: [],
  remark: '',
})

const providerOptions = [
  {label: '亚马逊', value: 'aws'},
  {label: '阿里云', value: 'aliyun'},
  // TODO {label: '腾讯云', value: 'tencent'}, 暂不支持
  // TODO {label: '华为云', value: 'huawei'}, 暂不支持
]

function createColumns({del, edit}: {
  del: (row: UserItemData) => void,
  edit: (row: UserItemData) => void
}): DataTableColumns<UserItemData> {
  return [
    {
      title: '服务商',
      key: 'provider',
      align: 'center',
      width: 72,
      ellipsis: {
        tooltip: true
      },
      render: (row) => getProviderName(row.provider),
    },
    {
      title: '区域',
      key: 'region',
      align: 'center',
      width: 80,
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: 'Access Key',
      key: 'accessKey',
      align: 'center',
      width: 120,
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '安全组ID',
      key: 'groupId',
      align: 'center',
      width: 120,
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '端口号',
      key: 'ports',
      align: 'center',
      ellipsis: {
        tooltip: true
      },
      render: (row) => renderCopyableText(row.ports.join(',')),
    },
    {
      title: '状态',
      key: 'status',
      align: 'center',
      width: 80,
      render(row) {
        return h(
            NSwitch,
            {
              value: row.status === UserStatus.Open,
              'onUpdate:value': async (newValue: boolean) => {
                const newStatus = newValue ? UserStatus.Open : UserStatus.Closed
                startLoading()
                // 2. 调用外部函数，通常用来发送 API 请求
                updateUserStatusAPI(row.userId, newStatus).then(() => {
                  row.status = newStatus
                }).finally(() => {
                  stopLoading()
                })
              }
            }
        )
      }
    },
    {
      title: '用户名',
      key: 'username',
      align: 'center',
      width: 150,
      ellipsis: {
        tooltip: true
      },
      render: (row) => renderCopyableText(row.username),
    },
    {
      title: '备注',
      key: 'remark',
      align: 'center',
      ellipsis: {
        tooltip: true
      },
      render: (row) => renderCopyableText(row.remark),
    },
    {
      title: '操作',
      key: 'actions',
      align: 'center',
      width: 140,
      render(row) {
        return h(
            NSpace,
            {justify: 'center'},
            {
              default: () => [
                h(
                    NButton,
                    {
                      strong: true,
                      tertiary: true,
                      size: 'small',
                      type: 'info',
                      onClick: () => edit(row)
                    },
                    {default: () => '编辑'}
                ),
                h(
                    NButton,
                    {
                      strong: true,
                      tertiary: true,
                      size: 'small',
                      type: 'error',
                      onClick: () => del(row)
                    },
                    {default: () => '删除'}
                ),
              ]
            }
        )
      }
    }
  ]
}

const getProviderName = (provider: string) => {
  switch (provider) {
    case 'aws':
      return '亚马逊'
    case 'aliyun':
      return '阿里云'
    case 'tencent':
      return '腾讯云'
    case 'huawei':
      return '华为云'
    default:
      return provider
  }
}

/**
 * 抽象出的通用复制渲染函数
 * @param text 需要显示的文字内容
 */
const renderCopyableText = (text: string | undefined | null) => {
  if (!text) return '-'

  return h(
      NSpace,
      {
        align: 'center',
        justify: 'center',
        inline: true,
        wrap: false,
        size: 6
      },
      {
        default: () => [
          h(
              NText,
              {
                depth: 2,
                // 解决 Tooltip 变灰问题
                style: {color: 'inherit'}
              },
              {default: () => text}
          ),
          h(
              NIcon,
              {
                size: '18',
                component: CopyOutline,
                color: '#18a058',
                style: {
                  cursor: 'pointer',
                  flexShrink: 0,
                  display: 'flex'
                },
                onClick: (e: MouseEvent) => {
                  e.stopPropagation()
                  navigator.clipboard.writeText(text).then(() => {
                    message.success('已成功复制到剪贴板')
                  })
                }
              }
          )
        ]
      }
  )
}

const columns = createColumns({
  del(row: UserItemData) {
    dialog.create({
      title: '删除确认',
      content: `确定要删除用户: ${row.username} 吗？`,
      positiveText: '确认',
      negativeText: '取消',
      onPositiveClick: () => {
        deleteUser(row.userId)
      }
    })
  },
  edit(row: UserItemData) {
    reqData.userId = row.userId
    reqData.provider = row.provider
    reqData.region = row.region
    reqData.username = row.username
    reqData.accessKey = row.accessKey
    reqData.groupId = row.groupId
    reqData.ports = row.ports.join(',')
    reqData.remark = row.remark
    showModal.value = true
  },
})

const pagination = false as const

const deleteUser = (userId: number) => {
  if (isLock.value) {
    return
  }
  isLock.value = true

  startLoading()

  deleteUserAPI(userId).then(() => {
    message.success("删除成功")
    getList()
  }).finally(() => {
    stopLoading()
    isLock.value = false
  })
}

const getList = () => {
  getUserListAPI().then((res) => {
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

const onAddUser = () => {
  if (isLock.value) {
    return
  }
  isLock.value = true

  startLoading()

  const plainCopy = structuredClone(toRaw(reqData))
  if (typeof (plainCopy.ports as any) === 'string') {
    plainCopy.ports = (plainCopy.ports as string)
        .split(',')
        .map(Number)
        .filter(Boolean) // 过滤掉转换出的 0 (比如空字符串或多余的逗号)
  }

  if (reqData.userId) {
    updateUserAPI(plainCopy).then(() => {
      message.success("修改成功")
      onCloseModal()
      getList()
    }).finally(() => {
      stopLoading()
      isLock.value = false
    })
  } else {
    createUserAPI(plainCopy).then(() => {
      message.success("添加成功")
      onCloseModal()
      getList()
    }).finally(() => {
      stopLoading()
      isLock.value = false
    })
  }
}

const onCloseModal = () => {
  showModal.value = false
  Object.assign(reqData, {
    provider: null,
    region: '',
    username: '',
    password: '',
    accessKey: '',
    secretKey: '',
    groupId: '',
    ports: [],
    remark: '',
  })
  delete reqData.userId
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

onMounted(() => {
  getList()
})
</script>

<template>
  <main class="pt-[5vh] flex flex-col justify-center items-center gap-4 h-screen">
    <div class="flex gap-4 justify-end w-full pr-10">
      <div class="flex gap-3 text-sm items-center">
        <n-button @click="showModal = true" type="primary">
          添加
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
  <n-modal
      :mask-closable="false"
      preset="dialog"
      v-model:show="showModal"
      @close="onCloseModal"
  >
    <template #header>
      <div>添加账号</div>
    </template>
    <div class="flex flex-col gap-4 my-4">
      <n-select v-model:value="reqData.provider" :disabled="reqData.userId" placeholder="请选择云服务商"
                :options="providerOptions"/>
      <n-input v-model:value.trim="reqData.region" type="text" clearable placeholder="请输入区域"/>
      <n-input v-model:value.trim="reqData.accessKey" type="text" clearable placeholder="请输入Access key ID"/>
      <n-input v-model:value.trim="reqData.secretKey" type="text" clearable
               :placeholder="`请输入Secret access key${reqData.userId ? '(无需修改时不填)':''}`"/>
      <n-input v-model:value.trim="reqData.groupId" type="text" clearable placeholder="请输入安全组ID(groupId)"/>
      <n-input v-model:value.trim="reqData.ports" type="text" clearable placeholder="请输入端口号"/>
      <n-input v-model:value.trim="reqData.username" :disabled="reqData.userId" type="text" clearable
               placeholder="请输入登录账号"/>
      <n-input v-model:value.trim="reqData.password" type="text" clearable
               :placeholder="`请输入登录密码${reqData.userId ? '(无需修改时不填)':''}`"/>
      <n-input v-model:value.trim="reqData.remark" type="text" clearable placeholder="请输入备注"/>
    </div>
    <template #action>
      <div class="flex gap-4">
        <n-button size="small" @click="onCloseModal" type="tertiary">
          取消
        </n-button>
        <n-button size="small" @click="onAddUser" type="primary">
          确认
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<style scoped>

</style>