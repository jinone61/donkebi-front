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

function routeScrollKey(route, activeUserId) {
  const scope = activeUserId ? `account:${activeUserId}` : 'public'
  return `${scope}:${route.fullPath}`
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
  const authStore = useAuthStore(store)
  const routeScrollPositions = new Map()

  const Router = createRouter({
    scrollBehavior: (to, _from, savedPosition) =>
      savedPosition ||
      routeScrollPositions.get(routeScrollKey(to, authStore.activeUserId)) || {
        left: 0,
        top: 0
      },
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE)
  })

  Router.beforeEach((to, from) => {
    if (!import.meta.env.QUASAR_SERVER && from.fullPath) {
      routeScrollPositions.set(routeScrollKey(from, authStore.activeUserId), {
        left: window.scrollX,
        top: window.scrollY
      })
    }

    const isAuthenticated = authStore.hasValidSession()
    const hasStoredAccounts = authStore.hasStoredSessions

    if (to.path === '/' && isStandalonePwa()) {
      if (isAuthenticated) return { path: '/operation', replace: true }
      if (hasStoredAccounts) return { path: '/profile', replace: true }

      return {
        path: '/login',
        query: { redirect: '/operation' },
        replace: true
      }
    }

    if (to.path === '/login') {
      if (isAuthenticated) return { path: '/operation', replace: true }
      if (hasStoredAccounts) return { path: '/profile', replace: true }
    }

    if (to.path === '/profile' && hasStoredAccounts) return true
    if (PUBLIC_PATHS.has(to.path) || isAuthenticated) return true

    if (hasStoredAccounts) {
      return { path: '/profile', replace: true }
    }

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
