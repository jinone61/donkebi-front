<template>
  <q-layout view="hHh lpR fFf" class="site-layout">
    <q-header class="site-header">
      <div class="site-header__inner dk-container">
        <router-link class="site-header__brand" to="/" aria-label="Donkebi 홈">
          DONKEBI
        </router-link>

        <nav class="site-header__nav" aria-label="주요 메뉴">
          <template v-for="item in navigationItems" :key="item.href ?? item.to">
            <router-link v-if="item.to" :to="item.to">
              {{ item.label }}
            </router-link>
            <button v-else type="button" @click="scrollTo(item.href)">
              {{ item.label }}
            </button>
          </template>
        </nav>

        <div class="site-header__actions">
          <button
            ref="menuButton"
            type="button"
            class="icon-button menu-button"
            :class="{ 'menu-button--open': mobileMenuOpen }"
            :aria-expanded="mobileMenuOpen"
            aria-controls="mobile-navigation"
            :aria-label="mobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      <transition name="menu-reveal">
        <div
          v-if="mobileMenuOpen"
          class="mobile-menu-layer"
          @click.self="closeMobileMenu()"
        >
          <nav
            id="mobile-navigation"
            class="mobile-nav dk-container"
            aria-label="모바일 메뉴"
          >
            <template
              v-for="item in navigationItems"
              :key="item.href ?? item.to"
            >
              <router-link
                v-if="item.to"
                :to="item.to"
                @click="closeMobileMenu()"
              >
                <span>{{ item.label }}</span>
                <span aria-hidden="true">↗</span>
              </router-link>
              <button v-else type="button" @click="scrollTo(item.href)">
                <span>{{ item.label }}</span>
                <span aria-hidden="true">↗</span>
              </button>
            </template>
          </nav>
        </div>
      </transition>
    </q-header>

    <q-page-container
      class="site-page-container"
      :inert="mobileMenuOpen"
      :aria-hidden="mobileMenuOpen ? 'true' : undefined"
    >
      <router-view />
    </q-page-container>

    <nav class="pwa-bottom-navigation" aria-label="앱 메뉴">
      <router-link
        v-for="item in pwaNavigationItems"
        :key="item.to"
        :to="item.to"
        class="pwa-bottom-navigation__link"
        exact-active-class="pwa-bottom-navigation__link--active"
      >
        <q-icon
          class="pwa-bottom-navigation__icon"
          :name="item.icon"
          aria-hidden="true"
        />
        <span>{{ item.label }}</span>
      </router-link>
    </nav>
  </q-layout>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { navigationItems } from '@/content/home.js'

const pwaNavigationItems = [
  { label: 'HOME', to: '/', icon: 'home' },
  { label: 'BACKTEST', to: '/backtest', icon: 'query_stats' },
  { label: 'AGENT', to: '/agent', icon: 'smart_toy' }
]

const router = useRouter()
const mobileMenuOpen = ref(false)
const menuButton = ref(null)
const previousBodyOverflow = ref('')
let desktopMediaQuery

function closeMobileMenu({ restoreFocus = false } = {}) {
  mobileMenuOpen.value = false
  if (restoreFocus) requestAnimationFrame(() => menuButton.value?.focus())
}

function handleKeydown(event) {
  if (event.key !== 'Escape' || !mobileMenuOpen.value) return

  closeMobileMenu({ restoreFocus: true })
}

function handleDesktopChange(event) {
  if (event.matches) closeMobileMenu()
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  desktopMediaQuery = window.matchMedia('(min-width: 768px)')
  desktopMediaQuery.addEventListener('change', handleDesktopChange)
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  desktopMediaQuery?.removeEventListener('change', handleDesktopChange)
  document.body.style.overflow = previousBodyOverflow.value
})

watch(mobileMenuOpen, isOpen => {
  if (isOpen) {
    previousBodyOverflow.value = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return
  }

  document.body.style.overflow = previousBodyOverflow.value
})

async function scrollTo(selector) {
  closeMobileMenu()

  if (router.currentRoute.value.path !== '/') {
    await router.push('/')
    await nextTick()
  }

  requestAnimationFrame(() => {
    document
      .querySelector(selector)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}
</script>

<style scoped lang="scss">
.site-layout {
  background: var(--dk-paper);
}

.site-header {
  border-bottom: 1px solid var(--dk-line);
  background: var(--dk-paper);
  color: var(--dk-ink);

  &__inner {
    display: grid;
    grid-template-columns: 3fr 6fr 3fr;
    gap: 24px;
    align-items: center;
    min-height: 82px;
  }

  &__brand {
    width: max-content;
    font-family: var(--dk-font-serif);
    font-size: 0.86rem;
    font-weight: 500;
    letter-spacing: 0.18em;
  }

  &__nav {
    display: flex;
    gap: clamp(24px, 3vw, 48px);
    justify-content: center;

    button,
    a {
      padding: 8px 0;
      border: 0;
      background: transparent;
      color: var(--dk-ink);
      cursor: pointer;
      font-size: var(--dk-text-label);
      font-weight: 500;
      letter-spacing: 0.07em;
    }
  }

  &__actions {
    display: flex;
    gap: 18px;
    justify-content: flex-end;
  }
}

.icon-button {
  display: grid;
  width: 32px;
  height: 32px;
  padding: 0;
  place-items: center;
  border: 0;
  background: transparent;
  color: var(--dk-ink);
  cursor: pointer;

  svg {
    width: 17px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.35;
  }
}

.menu-button {
  display: none;
  place-items: center;

  span {
    grid-area: 1 / 1;
    display: block;
    width: 19px;
    height: 1px;
    background: currentColor;
    transition: transform var(--dk-fast);
  }

  span:first-child {
    transform: translateY(-3.5px);
  }

  span:last-child {
    transform: translateY(3.5px);
  }

  &--open {
    span:first-child {
      transform: rotate(45deg);
    }

    span:last-child {
      transform: rotate(-45deg);
    }
  }
}

.mobile-menu-layer,
.mobile-nav {
  display: none;
}

.pwa-bottom-navigation {
  display: none;
}

@media (max-width: 767px) {
  .site-header {
    &__inner {
      grid-template-columns: 1fr auto;
      min-height: 68px;
    }

    &__nav {
      display: none;
    }
  }

  .menu-button {
    display: grid;
  }

  .mobile-menu-layer {
    position: fixed;
    top: 68px;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
    display: block;
    overflow: hidden;
    background: rgba(23, 23, 23, 0.14);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  .mobile-nav {
    display: grid;
    align-content: start;
    max-height: calc(100dvh - 68px);
    padding-block: 18px 30px;
    overflow-y: auto;
    overscroll-behavior: contain;
    border-top: 1px solid var(--dk-line);
    background: var(--dk-paper);

    button,
    a {
      display: flex;
      justify-content: space-between;
      padding: 16px 0;
      border: 0;
      border-bottom: 1px solid var(--dk-line);
      background: transparent;
      color: var(--dk-ink);
      cursor: pointer;
      text-align: left;
    }
  }

  .menu-reveal-enter-active,
  .menu-reveal-leave-active {
    transition:
      background-color var(--dk-fast),
      backdrop-filter var(--dk-fast);
  }

  .menu-reveal-enter-active .mobile-nav,
  .menu-reveal-leave-active .mobile-nav {
    transition:
      opacity var(--dk-fast),
      transform var(--dk-fast);
  }

  .menu-reveal-enter-from,
  .menu-reveal-leave-to {
    background-color: transparent;
    backdrop-filter: blur(0);
    -webkit-backdrop-filter: blur(0);
  }

  .menu-reveal-enter-from .mobile-nav,
  .menu-reveal-leave-to .mobile-nav {
    opacity: 0;
    transform: translateY(-100%);
  }
}

@media (max-width: 767px) and (display-mode: standalone) {
  .site-page-container {
    padding-bottom: calc(64px + env(safe-area-inset-bottom));
  }

  .menu-button,
  .mobile-menu-layer {
    display: none;
  }

  .pwa-bottom-navigation {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 2000;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    padding-bottom: env(safe-area-inset-bottom);
    border-top: 1px solid var(--dk-line);
    background: var(--dk-paper);
    box-shadow: 0 -12px 30px rgba(23, 23, 23, 0.04);

    &__link {
      display: flex;
      min-height: 64px;
      flex-direction: column;
      gap: 4px;
      align-items: center;
      justify-content: center;
      color: rgba(23, 23, 23, 0.42);
      font-size: var(--dk-text-caption);
      font-weight: 600;
      letter-spacing: 0.06em;
      transition: color var(--dk-fast);

      &--active {
        color: var(--dk-ink);
      }
    }

    &__icon {
      font-size: 1.8rem;
    }
  }
}
</style>
