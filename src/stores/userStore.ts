import {defineStore} from 'pinia'
import {computed, reactive, ref} from 'vue'
import {loginAPI} from '@/apis/login'
import router from '@/router'
import type {UserInfoData} from '@/types/user'
import {userInfoAPI} from '@/apis/user'

export const useUserStore = defineStore(
    'user',
    () => {
        const userToken = ref('')
        const userInfo = reactive(<UserInfoData>{})
        const userAccount = ref<{ username: string; password: string } | null>(null)

        // 是否登录
        const isLogin = computed((): boolean => !(userToken.value === ''))

        // 清除用户信息
        const clearUserInfo = () => {
            userToken.value = ''
            Object.assign(userInfo, <UserInfoData>{})
            // 跳转到登录页
            router.replace({path: '/login'}).then()
        }

        const userLogin = async (username: string, password: string) => {
            const res = await loginAPI(username, password)
            if (res.data.token) {
                userToken.value = res.data.token
                Object.assign(userInfo, res.data.userInfo as UserInfoData)
            }
            return res
        }

        const setUserAccount = (info: { username: string; password: string } | null) => {
            userAccount.value = info
        }

        const updateUserInfo = async () => {
            if (!isLogin.value) {
                clearUserInfo()
                return false
            }
            const res = await userInfoAPI()
            if (res.data) {
                Object.assign(userInfo, res.data as UserInfoData)
                // 如果状态异常就退出登录
                if (userInfo.status !== 1) {
                    clearUserInfo()
                    return false
                }
                return true
            }
            return false
        }


        return {
            userLogin,
            userToken,
            userInfo,
            isLogin,
            clearUserInfo,
            updateUserInfo,
            setUserAccount,
            userAccount,
        }
    },
    {
        persist: true, // 数据持久化
    },
)
