import { defineBoot } from '#q-app'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth-store'

const LOGIN_URL = '/api/dualsniper/auth/login'
const api = axios.create({
  baseURL: 'https://api.donkebi.com'
})

export default defineBoot(({ app, router, store }) => {
  const authStore = useAuthStore(store)

  api.interceptors.request.use(config => {
    if (config.url !== LOGIN_URL && authStore.hasValidSession()) {
      config.headers.Authorization = authStore.authorizationHeader
    }

    return config
  })

  api.interceptors.response.use(
    response => response,
    async error => {
      if (error.response?.status === 401) {
        authStore.clearSession()

        if (router.currentRoute.value.path !== '/login') {
          await router.replace({
            path: '/login',
            query: { redirect: router.currentRoute.value.fullPath }
          })
        }
      }

      return Promise.reject(error)
    }
  )

  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api, axios }
