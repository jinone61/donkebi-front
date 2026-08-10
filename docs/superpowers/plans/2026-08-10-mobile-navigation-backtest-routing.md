# Mobile Navigation and Backtest Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the mobile menu overlay the homepage without layout movement and provide a real `/backtest` destination from desktop and mobile navigation.

**Architecture:** Keep the homepage's anchor navigation and extend each navigation item with either `href` or `to`. Render anchor items as buttons and Backtest as a router link. Place a content-height paper menu inside a transparent fixed viewport layer, lock covered page interaction without changing its width, and keep the replaceable file-based Backtest page.

**Tech Stack:** Vue 3 Composition API, Quasar 2, Vue Router file-based pages, scoped SCSS, Node-driven Chrome DevTools Protocol browser checks

## Global Constraints

- Preserve the existing editorial visual system and desktop homepage layout.
- Below 768px, the menu panel begins under the 68px header and is only as tall as its content.
- A transparent backdrop fills the remaining viewport, blocks background interaction, and closes the menu when tapped.
- Scroll locking must not change the homepage or header width.
- 시장, 리서치, 테마, 아카이브 remain same-page actions; only BACKTEST opens a separate route.
- Backtest functionality and final branding remain outside this implementation.
- Add no runtime dependency or test framework.

---

### Task 1: Content-Height Mobile Menu Overlay

**Files:**

- Modify: `src/pages/index.vue`
- Modify: `src/css/app.scss`
- Test: `/tmp/donkebi-navigation-regression.mjs` (ephemeral browser check; do not commit)

**Interfaces:**

- Consumes: `navigationItems` entries containing either `href: string` or `to: string`.
- Produces: `closeMobileMenu({ restoreFocus?: boolean })`, `.mobile-menu-layer`, content-height `#mobile-navigation`, stable scrollbar geometry, and restored body overflow on close/unmount.

- [ ] **Step 1: Write the failing browser check**

Create an ephemeral CDP check that loads the mobile homepage, records `.hero` geometry and `document.body.style.overflow`, clicks `.menu-button`, then asserts:

```js
const before = document.querySelector('.hero').getBoundingClientRect()
document.querySelector('.menu-button').click()
await new Promise(resolve => setTimeout(resolve, 240))
const after = document.querySelector('.hero').getBoundingClientRect()
const panel = document.querySelector('.mobile-nav').getBoundingClientRect()
const layer = document.querySelector('.mobile-menu-layer').getBoundingClientRect()

if (before.top !== after.top || before.width !== after.width) {
  throw new Error('mobile menu changed homepage geometry')
}
if (document.body.style.overflow !== 'hidden') {
  throw new Error('mobile menu did not lock background scrolling')
}
if (panel.bottom >= innerHeight) throw new Error('menu panel is full height')
if (layer.bottom !== innerHeight) throw new Error('backdrop is incomplete')
```

- [ ] **Step 2: Run the check to verify RED**

Run: `node /tmp/donkebi-navigation-regression.mjs`

Expected: FAIL because the current opaque menu panel extends to the bottom of the viewport and has no separate transparent backdrop.

- [ ] **Step 3: Implement the overlay and lifecycle**

In `src/pages/index.vue`, keep the single close function, body-scroll lifecycle, inert page binding, Escape focus restoration, and desktop-breakpoint cleanup. Wrap the navigation panel in a fixed layer:

```vue
<transition name="menu-reveal">
  <div
    v-if="mobileMenuOpen"
    class="mobile-menu-layer"
    @click.self="closeMobileMenu()"
  >
    <nav id="mobile-navigation" class="mobile-nav dk-container">
      <!-- existing navigation controls -->
    </nav>
  </div>
</transition>
```

Reserve scrollbar space globally in `src/css/app.scss`:

```scss
html {
  scrollbar-gutter: stable;
}
```

Use a fixed transparent layer and a natural-height paper panel:

```scss
.mobile-menu-layer {
  position: fixed;
  top: 68px;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
}

.mobile-nav {
  max-height: calc(100dvh - 68px);
  overflow-y: auto;
  background: var(--dk-paper);
}
```

Animate only `.mobile-nav` from `translateY(-100%)` so the transparent backdrop itself remains stationary. Preserve the body overflow watcher:

```js
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const previousBodyOverflow = ref('')

function closeMobileMenu({ restoreFocus = false } = {}) {
  mobileMenuOpen.value = false
  if (restoreFocus) requestAnimationFrame(() => menuButton.value?.focus())
}

watch(mobileMenuOpen, isOpen => {
  if (isOpen) {
    previousBodyOverflow.value = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = previousBodyOverflow.value
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = previousBodyOverflow.value
})
```

- [ ] **Step 4: Run the check to verify GREEN**

Run: `node /tmp/donkebi-navigation-regression.mjs`

Expected: PASS; panel height follows content, transparent backdrop reaches the viewport bottom, backdrop tap only closes the menu, homepage geometry is unchanged, body scrolling is locked, and Escape restores focus.

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.vue src/css/app.scss
git commit -m "fix: refine mobile navigation overlay"
```

### Task 2: Backtest Route Contract

**Files:**

- Modify: `src/content/home.js`
- Modify: `src/pages/index.vue`
- Create: `src/pages/backtest.vue`
- Test: `/tmp/donkebi-navigation-regression.mjs` (extend the Task 1 check)

**Interfaces:**

- Consumes: Vue Router's generated `/backtest` route from `src/pages/backtest.vue`.
- Produces: `{ label: 'BACKTEST', to: '/backtest' }` in `navigationItems` and a replaceable Backtest page contract.

- [ ] **Step 1: Extend the browser check and verify RED**

Add assertions that a Backtest router link exists in both navigation contexts and resolves after activation:

```js
const desktopLink = document.querySelector(
  '.site-header__nav a[href*="backtest"]'
)
const mobileLink = document.querySelector('.mobile-nav a[href*="backtest"]')
if (!desktopLink || !mobileLink) throw new Error('Backtest links are missing')

mobileLink.click()
await new Promise(resolve => setTimeout(resolve, 250))
if (location.hash !== '#/backtest')
  throw new Error('Backtest route did not resolve')
if (!document.querySelector('.backtest-placeholder')) {
  throw new Error('Backtest placeholder did not render')
}
```

Run: `node /tmp/donkebi-navigation-regression.mjs`

Expected: FAIL because neither the links nor the route exists.

- [ ] **Step 2: Add the route-aware navigation item**

Append this entry in `src/content/home.js`:

```js
{ label: 'BACKTEST', to: '/backtest' }
```

In each navigation loop, render `router-link` when `item.to` exists and the existing button when `item.href` exists. Both controls must call the same close behavior on mobile; only anchor buttons call `scrollTo(item.href)`.

- [ ] **Step 3: Add the replaceable Backtest page**

Create `src/pages/backtest.vue` with this semantic structure:

```vue
<template>
  <main class="backtest-placeholder">
    <div class="backtest-placeholder__inner dk-container">
      <p class="dk-eyebrow">Backtest · In Preparation</p>
      <h1 class="dk-serif">전략을 검증하는<br />새로운 공간.</h1>
      <p>백테스트 페이지를 준비하고 있습니다.</p>
      <router-link to="/"
        >홈으로 돌아가기 <span aria-hidden="true">→</span></router-link
      >
    </div>
  </main>
</template>
```

Style it with `min-height: 100dvh`, existing paper/ink tokens, responsive typography, and a visible current-color focus state inherited from global styles.

- [ ] **Step 4: Run focused and project verification**

Run:

```bash
node /tmp/donkebi-navigation-regression.mjs
npm run lint:check
npm run build
git diff --check
```

Expected: browser check PASS, lint exits 0, Quasar production build succeeds, and `git diff --check` emits no output.

- [ ] **Step 5: Commit**

```bash
git add src/content/home.js src/pages/index.vue src/pages/backtest.vue
git commit -m "feat: add backtest route entry"
```
