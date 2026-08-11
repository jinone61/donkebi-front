# Backtest Tier Ratio Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the tier buy-ratio section with the defense-mode fields by removing its horizontal inset.

**Architecture:** Keep the existing Quasar structure and add one purpose-specific class to the ratio `q-card-section`. Scope the CSS change to that class so all other cards retain their current spacing.

**Tech Stack:** Vue 3 Single-File Components, Quasar 2, CSS, Node.js test runner

## Global Constraints

- Leave `src/pages/index/BacktestPage.vue` byte-for-byte unchanged.
- Do not change backtest form state, validation, or API behavior.
- Preserve existing vertical spacing in the tier-ratio section.

---

### Task 1: Align the tier-ratio section

**Files:**
- Modify: `src/components/backtest/BacktestPage.vue:294`
- Modify: `src/components/backtest/BacktestPage.vue:2556`
- Test: `tests/brand-pages.test.mjs`

**Interfaces:**
- Consumes: the existing tier-ratio `q-card-section` and `.ratio-grid`
- Produces: `.tier-ratio-section`, whose horizontal padding is zero

- [ ] **Step 1: Write the failing regression test**

```js
test('tier ratio section aligns with the defense settings grid', async () => {
  const source = await readSource('src/components/backtest/BacktestPage.vue')

  assert.match(source, /q-card-section class="q-pt-none tier-ratio-section"/)
  assert.match(
    source,
    /\.tier-ratio-section \{[\s\S]*?padding-inline: 0;/
  )
})
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- --test-name-pattern="tier ratio section"`

Expected: FAIL because `tier-ratio-section` does not exist.

- [ ] **Step 3: Add the dedicated class and remove its horizontal padding**

```vue
<q-card-section class="q-pt-none tier-ratio-section">
```

```css
.tier-ratio-section {
  padding-inline: 0;
}
```

- [ ] **Step 4: Verify the focused test and project checks**

Run: `npm test -- --test-name-pattern="tier ratio section"`

Expected: PASS.

Run: `npm test && npm run lint:check && npm run build && git diff --check`

Expected: all commands exit successfully.

- [ ] **Step 5: Inspect the authenticated SETUP layout**

Open `http://127.0.0.1:9000/#/backtest`, authenticate, expand defense mode, and confirm the ratio heading and fields align with the fields above on desktop and mobile.

- [ ] **Step 6: Commit the implementation**

```bash
git add src/components/backtest/BacktestPage.vue tests/brand-pages.test.mjs
git commit -m "Align backtest tier ratio fields"
```
