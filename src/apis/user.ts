import httpInstance from '@/utils/http'
import type { UserRequestData, UserStatus } from '@/types/user'

export const userInfoAPI = () => {
  return httpInstance({
    url: '/user',
  })
}

export const createUserAPI = (data: UserRequestData) => {
  return httpInstance({
    url: '/admin/user',
    method: 'POST',
    data,
  })
}

export const updateUserAPI = (data: UserRequestData) => {
  return httpInstance({
    url: '/admin/user',
    method: 'PUT',
    data,
  })
}

export const updateUserStatusAPI = (userId: number, status: UserStatus) => {
  return httpInstance({
    url: '/admin/user/status',
    method: 'PUT',
    data: { userId, status },
  })
}

export const deleteUserAPI = (userId: number) => {
  return httpInstance({
    url: '/admin/user',
    method: 'DELETE',
    data: { userId },
  })
}

export const getUserListAPI = () => {
  return httpInstance({
    url: '/admin/user',
    method: 'GET',
  })
}
