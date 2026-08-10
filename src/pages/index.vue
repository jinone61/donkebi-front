<template>
  <q-layout view="hHh lpR fFf" class="site-layout">
    <q-header class="site-header">
      <div class="site-header__inner dk-container">
        <router-link class="site-header__brand" to="/" aria-label="Donkebi 홈">
          DONKEBI
        </router-link>

        <nav class="site-header__nav" aria-label="주요 메뉴">
          <button
            v-for="item in navigationItems"
            :key="item.href"
            type="button"
            @click="scrollTo(item.href)"
          >
            {{ item.label }}
          </button>
        </nav>

        <div class="site-header__actions">
          <button
            ref="menuButton"
            type="button"
            class="icon-button menu-button"
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
        <nav
          v-if="mobileMenuOpen"
          id="mobile-navigation"
          class="mobile-nav dk-container"
          aria-label="모바일 메뉴"
        >
          <button
            v-for="item in navigationItems"
            :key="item.href"
            type="button"
            @click="scrollTo(item.href)"
          >
            <span>{{ item.label }}</span>
            <span aria-hidden="true">↗</span>
          </button>
        </nav>
      </transition>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { navigationItems } from '@/content/home.js'

const mobileMenuOpen = ref(false)
const menuButton = ref(null)
const previousBodyOverflow = ref('')

function closeMobileMenu({ restoreFocus = false } = {}) {
  mobileMenuOpen.value = false
  if (restoreFocus) requestAnimationFrame(() => menuButton.value?.focus())
}

function handleKeydown(event) {
  if (event.key !== 'Escape' || !mobileMenuOpen.value) return

  closeMobileMenu({ restoreFocus: true })
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
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

function scrollTo(selector) {
  closeMobileMenu()
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

    button {
      padding: 8px 0;
      border: 0;
      background: transparent;
      color: var(--dk-ink);
      cursor: pointer;
      font-size: 0.68rem;
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
  align-content: center;
  gap: 6px;

  span {
    display: block;
    width: 19px;
    height: 1px;
    background: currentColor;
  }
}

.mobile-nav {
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

  .menu-button,
  .mobile-nav {
    display: grid;
  }

  .mobile-nav {
    position: fixed;
    top: 68px;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
    align-content: start;
    padding-block: 18px 30px;
    overflow-y: auto;
    border-top: 1px solid var(--dk-line);
    background: var(--dk-paper);

    button {
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
      opacity var(--dk-fast),
      transform var(--dk-fast);
  }

  .menu-reveal-enter-from,
  .menu-reveal-leave-to {
    opacity: 0;
    transform: translateY(-8px);
  }
}
</style>
