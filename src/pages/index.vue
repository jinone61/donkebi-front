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
          <button type="button" class="icon-button" aria-label="검색">
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <circle cx="10.5" cy="10.5" r="5.5" />
              <path d="m15 15 4.5 4.5" />
            </svg>
          </button>
          <button
            type="button"
            class="icon-button menu-button"
            :aria-expanded="mobileMenuOpen"
            aria-controls="mobile-navigation"
            aria-label="메뉴 열기"
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
import { ref } from 'vue'
import { navigationItems } from '@/content/home.js'

const mobileMenuOpen = ref(false)

function scrollTo(selector) {
  mobileMenuOpen.value = false
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
  background: rgba(244, 241, 234, 0.94);
  color: var(--dk-ink);
  backdrop-filter: blur(12px);

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
    padding-block: 18px 30px;
    border-top: 1px solid var(--dk-line);

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
