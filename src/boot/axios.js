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
    if (config.url === LOGIN_URL) return config

    if (authStore.hasValidSession()) {
      config.headers.Authorization = authStore.authorizationHeader
      config.donkebiAuthUserId = authStore.activeUserId
      config.donkebiAuthToken = authStore.session.accessToken
    }

    return config
  })

  api.interceptors.response.use(
    response => response,
    async error => {
      if (error.response?.status !== 401 || error.config?.url === LOGIN_URL) {
        return Promise.reject(error)
      }

      const requestUserId = error.config?.donkebiAuthUserId
      const requestToken = error.config?.donkebiAuthToken
      const wasActive =
        requestUserId &&
        String(requestUserId) === String(authStore.activeUserId) &&
        requestToken === authStore.session?.accessToken

      const wasInvalidated =
        requestUserId &&
        authStore.invalidateSession(requestUserId, requestToken)

      if (!wasInvalidated || !wasActive) return Promise.reject(error)

      if (authStore.hasStoredSessions) {
        if (
          router.currentRoute.value.path !== '/profile' ||
          router.currentRoute.value.query.session !== 'expired'
        ) {
          await router.replace({
            path: '/profile',
            query: { session: 'expired' }
          })
        }
      } else if (router.currentRoute.value.path !== '/login') {
        await router.replace({
          path: '/login',
          query: { redirect: router.currentRoute.value.fullPath }
        })
      }

      return Promise.reject(error)
    }
  )

  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api, axios }
