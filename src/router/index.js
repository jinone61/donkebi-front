import { defineRouter } from '#q-app'
import { routes, handleHotUpdate } from 'vue-router/auto-routes'
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory
} from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'

const PUBLIC_PATHS = new Set(['/', '/login'])
const PWA_DISPLAY_MODE_QUERY =
  '(display-mode: standalone), (display-mode: fullscreen), (display-mode: minimal-ui)'

function isStandalonePwa() {
  if (import.meta.env.QUASAR_SERVER) return false

  return (
    window.matchMedia(PWA_DISPLAY_MODE_QUERY).matches ||
    window.navigator.standalone === true
  )
}

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(({ store }) => {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory
  const routeScrollPositions = new Map()

  const Router = createRouter({
    scrollBehavior: (to, _from, savedPosition) =>
      savedPosition ||
      routeScrollPositions.get(to.fullPath) || { left: 0, top: 0 },
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE)
  })

  const authStore = useAuthStore(store)

  Router.beforeEach((to, from) => {
    if (!import.meta.env.QUASAR_SERVER && from.fullPath) {
      routeScrollPositions.set(from.fullPath, {
        left: window.scrollX,
        top: window.scrollY
      })
    }

    const isAuthenticated = authStore.hasValidSession()

    if (to.path === '/' && isStandalonePwa()) {
      return isAuthenticated
        ? { path: '/operation', replace: true }
        : {
            path: '/login',
            query: { redirect: '/operation' },
            replace: true
          }
    }

    if (to.path === '/login' && isAuthenticated) {
      return { path: '/operation', replace: true }
    }

    if (PUBLIC_PATHS.has(to.path) || isAuthenticated) return true

    return {
      path: '/login',
      query: { redirect: to.fullPath },
      replace: true
    }
  })

  // enable HMR for it
  if (import.meta.hot) {
    handleHotUpdate(Router)
  }

  return Router
})
