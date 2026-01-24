import httpInstance from '@/utils/http'

export const loginAPI = (username: string, password: string) => {
  return httpInstance({
    url: '/login',
    method: 'POST',
    data: { username, password },
  })
}
