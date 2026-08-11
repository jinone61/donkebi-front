# Home Chart Readability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Separate the headline's colliding letter alignment and make the market comparison line resemble a natural fluctuating market.

**Architecture:** Keep the refinement local to the home page component. Add a semantic span for typographic offset and replace only the market SVG path; preserve the reveal observer, animation, labels, and Donkebi path.

**Tech Stack:** Vue 3 SFC, SCSS, inline SVG, Node test runner, Quasar/Vite

## Global Constraints

- Keep the exact copy `AI-powered` and `real-world magic.`.
- Offset the second line by `0.15em` while preserving left alignment.
- The market path must fluctuate and finish below its starting point.
- Do not edit either backtest implementation.

---

### Task 1: Refine the home headline and market line

**Files:**

- Modify: `src/pages/index/(home).vue`
- Test: `tests/brand-pages.test.mjs`

**Interfaces:**

- Consumes: existing `.backtest-section__copy` typography and `.simulation-plate__line--market` SVG styling
- Produces: `.backtest-section__headline-line` for the second headline line and a multi-swing market path

- [ ] **Step 1: Write the failing regression test**

Extend `home backtest story contrasts the market with Donkebi` with assertions for the second-line class and the new market path's hand-checked sequence:

```js
assert.match(source, /class="backtest-section__headline-line"/)
assert.match(source, /M0 128 C38 142 62 146 92 132/)
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test`

Expected: FAIL because the second-line class and fluctuating path are absent.

- [ ] **Step 3: Implement the minimal visual refinement**

Render the second line as a block span:

```vue
<h2 class="dk-serif">
  AI-powered
  <span class="backtest-section__headline-line">real-world magic.</span>
</h2>
```

Add `display: block` and `margin-left: 0.15em` to the line class. Replace only the market path with a smooth sequence beginning `M0 128 C38 142 62 146 92 132` and containing alternating recoveries and pullbacks before ending below the start.

- [ ] **Step 4: Run automated and visual verification**

Run:

```bash
npm test
npm run lint:check
npm run build
git diff --check
```

Then verify desktop and 390 px mobile screenshots. Confirm the heading does not overflow, the `p` and `l` no longer share a vertical axis, both labels remain contained, and reduced motion still reveals both paths.

- [ ] **Step 5: Preserve the existing worktree state**

Confirm `src/pages/index/BacktestPage.vue` retains SHA-256 `c9b6f907b674b112eb634fc8b7b5a6f63eba435c02d75697276bc4e24ef90f19` and leave the user's staged `Built to think.` hunk staged.
