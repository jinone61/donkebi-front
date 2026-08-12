# Backtest Result Density Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adapt summary-card columns to available width and compact long daily backtest histories.

**Architecture:** Keep the existing Vue template and data unchanged. Express both changes as scoped responsive SCSS in the editable backtest component and protect them with source regression tests.

**Tech Stack:** Vue 3, Quasar, scoped SCSS, Node test runner

## Global Constraints

- Preserve `src/pages/index/BacktestPage.vue` byte-for-byte.
- Do not change API, chart, table, or backtest calculation logic.
- Keep mobile history headers at least 48 px tall.

---

### Task 1: Adaptive summary cards and dense history rows

**Files:**

- Modify: `src/components/backtest/BacktestPage.vue`
- Test: `tests/brand-pages.test.mjs`

**Interfaces:**

- Consumes: existing `.summary-grid`, `.metric-card`, `.daily-history`, and `.daily-item-header` classes
- Produces: responsive card layout and compact collapsed history rows

- [ ] **Step 1: Write failing source regression tests**

Assert that `.summary-grid` uses `repeat(auto-fit, minmax(...))`, fixed summary-column breakpoint overrides are absent, desktop `.daily-item-header` is 38 px, and the mobile override is 48 px.

- [ ] **Step 2: Verify the tests fail**

Run `npm test`; expect the new density tests to fail against the existing fixed six-column grid and default Quasar row height.

- [ ] **Step 3: Implement the scoped SCSS changes**

Set the summary minimum to 220 px, reduce it to 150 px below 599 px, set daily-history gap to 2 px, and set expansion header padding/minimum heights to 38 px desktop and 48 px mobile.

- [ ] **Step 4: Verify and inspect**

Run `npm test`, targeted Oxfmt/Oxlint, and `npm run build` using Node 24. Capture desktop and 390 px mobile screens and confirm no horizontal overflow or console errors.
