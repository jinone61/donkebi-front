# Agent World Clock Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add aligned Seoul and New York clocks to the Agent workspace header, with independent API update controls on each data card.

**Architecture:** Keep the feature inside `AgentPage.vue`, matching the existing single-file Agent workspace. Use one reactive clock value, timezone-aware `Intl.DateTimeFormat` helpers, and a single component-owned minute timer. Each data card owns its API timestamp, loading state, and refresh action.

**Tech Stack:** Vue 3, Quasar, JavaScript `Intl`, Node test runner, Oxfmt/Oxlint

## Global Constraints

- Display header rows in `NEW YORK`, `SEOUL` order.
- Render clock and update values as `YYYY.MM.DD DDD · HH:mm ZONE`.
- Align labels, separators, and timestamps in fixed grid columns.
- Place the Operation update line below its description and the Performance update line below its source tags.
- Right-align card metadata on desktop, left-align it on mobile, and avoid horizontal scrolling.
- Use a 22px row height and `0` row gap.
- Leave all changes uncommitted for the user to commit together.

---

### Task 1: Add the aligned world clock

**Files:**

- Modify: `src/components/agent/AgentPage.vue`
- Test: `tests/brand-pages.test.mjs`

**Interfaces:**

- Consumes: the browser clock and `lastUpdatedAt` computed value.
- Produces: `formatZonedDateTime(value, timeZone, zoneLabel)` strings and an aligned `.workspace-intro__times` block.

- [x] **Step 1: Write the failing test**

Assert the Seoul/New York/Updated DOM order, `Asia/Seoul` and `America/New_York` format calls, Vue timer lifecycle hooks, weekday formatting, and fixed CSS grid columns.

- [x] **Step 2: Verify the test fails**

Run `node tests/brand-pages.test.mjs`; the new world-clock assertion must fail because the rows and formatter are absent.

- [x] **Step 3: Implement the clock and layout**

Import `onMounted` and `onBeforeUnmount`, maintain `clockNow`, update it every 60 seconds, format timezone parts with `Intl.DateTimeFormat`, and render the three aligned rows above the existing refresh action.

- [x] **Step 4: Verify behavior and regressions**

Run `npm test`, `npm run lint:check`, and `npm run build`. Inspect desktop and 390px mobile Agent headers for ordering, alignment, timezone labels, and overflow.

### Task 2: Reorder and compact the clock rows

**Files:**

- Modify: `src/components/agent/AgentPage.vue`
- Test: `tests/brand-pages.test.mjs`

**Interfaces:**

- Consumes: the existing `.workspace-intro__times` rows.
- Produces: `NEW YORK`, `SEOUL`, `UPDATED` ordering with 22px rows and no row gap.

- [x] **Step 1: Write the failing layout test**

Assert the revised row order and exact compact spacing values.

- [x] **Step 2: Verify the test fails**

Run `node tests/brand-pages.test.mjs`; the order and spacing assertions must fail against the current layout.

- [x] **Step 3: Apply the minimal template and CSS changes**

Move the New York row before Seoul, change row `min-height` from `28px` to `22px`, and change the clock block gap from `4px` to `0`.

- [x] **Step 4: Verify behavior and regressions**

Run `npm test`, `npm run lint:check`, and `npm run build`. Confirm the three rows remain aligned without horizontal overflow at 390px.

### Task 3: Label the update timezone

**Files:**

- Modify: `src/components/agent/AgentPage.vue`
- Test: `tests/brand-pages.test.mjs`

**Interfaces:**

- Consumes: `formatDateTime(date)` for the active tab's last update.
- Produces: an `UPDATED` value ending in `KST`.

- [x] **Step 1: Write the failing formatter test**

Assert that `formatDateTime` delegates to the Seoul formatter with the fixed `KST` suffix.

- [x] **Step 2: Verify the test fails**

Run `node tests/brand-pages.test.mjs`; the `KST` delegation assertion must fail against the current formatter.

- [x] **Step 3: Apply the minimal formatter change**

Pass `'KST'` as the third argument when `formatDateTime` calls `formatZonedDateTime`.

- [x] **Step 4: Verify behavior and regressions**

Run `npm test`, `npm run lint:check`, and `npm run build`. Confirm the `UPDATED` row ends in `KST` on desktop and mobile without changing alignment.

### Task 4: Move update status into each data card

**Files:**

- Modify: `src/components/agent/AgentPage.vue`
- Test: `tests/brand-pages.test.mjs`

**Interfaces:**

- Consumes: `operationUpdatedAt`, `performanceUpdatedAt`, their loading states, and their fetch actions.
- Produces: independent `.section-heading__updated` captions in each card heading.

- [x] **Step 1: Write the failing ownership test**

Assert that the header has only two clocks and each card renders its own timestamp, loading state, accessible refresh label, and direct refresh action.

- [x] **Step 2: Verify the test fails**

Run `node tests/brand-pages.test.mjs`; the ownership assertions must fail while `UPDATED` remains tied to the active tab in the header.

- [x] **Step 3: Move the controls and remove common state**

Render the Operation update caption beneath its description and the Performance caption beneath its source tags, add responsive alignment, and remove `lastUpdatedAt`, `isRefreshing`, and `refreshActiveTab`.

- [x] **Step 4: Verify behavior and regressions**

Run the targeted test, full test suite, lint check, and production build. Inspect desktop and 390px mobile layouts for compact spacing, alignment, and overflow.

### Task 5: Quiet the Operation update caption

**Files:**

- Modify: `src/components/agent/AgentPage.vue`
- Test: `tests/brand-pages.test.mjs`

**Interfaces:**

- Consumes: the Operation `.section-heading__updated` row.
- Produces: an Operation-only `.section-heading__updated--quiet` treatment with subdued typography and an inherited icon color.

- [x] **Step 1: Write the failing style test**

Assert that the Operation update row has the quiet modifier while the Performance update row does not, and that the modifier lowers letter spacing and lets the refresh action inherit its color.

- [x] **Step 2: Verify the test fails**

Run `node tests/brand-pages.test.mjs`; the new quiet-caption assertion must fail because the modifier is absent.

- [x] **Step 3: Apply the Operation-only treatment**

Add the modifier to the Operation update row, remove its explicit Quasar button color, and define the quieter letter spacing and inherited refresh color without changing the shared Performance style.

- [x] **Step 4: Verify behavior and regressions**

Run the targeted test, full test suite, lint check, and production build. Inspect desktop and 390px mobile layouts to confirm the caption blends with its description and the refresh action remains legible.

### Task 6: Refine the Operation caption scale and position

**Files:**

- Modify: `src/components/agent/AgentPage.vue`
- Test: `tests/brand-pages.test.mjs`

**Interfaces:**

- Consumes: `.section-heading__updated--quiet` and its adjacent description spacing rule.
- Produces: a `0.63rem` caption positioned 3px closer to the description.

- [ ] **Step 1: Write the failing scale and spacing test**

Assert that the quiet modifier uses `font-size: 0.63rem` and the adjacent update row uses `margin-top: -1px`.

- [ ] **Step 2: Verify the test fails**

Run `node tests/brand-pages.test.mjs`; the new scale and spacing assertions must fail against the current `0.59rem` inherited size and `2px` margin.

- [ ] **Step 3: Apply the two value changes**

Set the Operation quiet modifier to `font-size: 0.63rem` and change the adjacent row margin to `-1px`, without changing the Performance update treatment.

- [ ] **Step 4: Verify behavior and regressions**

Run the targeted test, full test suite, lint check, and production build. Inspect desktop and 390px mobile layouts for vertical alignment, legibility, and overflow.

### Task 7: Combine the Operation metadata row

**Files:**

- Modify: `src/components/agent/AgentPage.vue`
- Test: `tests/brand-pages.test.mjs`

**Interfaces:**

- Consumes: the Operation source tags and quiet update caption.
- Produces: a single `.section-heading__meta--operation` row with tags first and the update caption right-aligned.

- [ ] **Step 1: Write and verify the failing layout test**

Assert the source tags and update caption share the Operation metadata container and that its desktop and mobile alignment rules are present. Run `node tests/brand-pages.test.mjs` and confirm failure against the split layout.

- [ ] **Step 2: Implement the shared row**

Move the update caption after the source tags inside `.section-heading__meta--operation`, align the row to the right on desktop, and use full-width `space-between` alignment on mobile.

- [ ] **Step 3: Verify behavior and regressions**

Run the targeted test, full test suite, lint check, and production build. Inspect 390px mobile layout for a single metadata row and no horizontal overflow.
