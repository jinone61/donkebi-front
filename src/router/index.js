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

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE)
  })

  const authStore = useAuthStore(store)

  Router.beforeEach(to => {
    const isAuthenticated = authStore.hasValidSession()

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
