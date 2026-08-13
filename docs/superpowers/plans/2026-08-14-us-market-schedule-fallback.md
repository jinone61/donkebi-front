# US Market Schedule Fallback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show one upcoming Agent Operation date when the API's latest target date has completed every operation phase.

**Architecture:** Add a dependency-free US market calendar utility that calculates the next regular trading date. Add a small operation scheduling utility that decides whether to prepend that date, then let `AgentPage.vue` continue building the existing missing-phase cards and estimated times from the returned date list.

**Tech Stack:** Vue 3, Quasar, JavaScript ES modules, Node.js test runner, Oxfmt/Oxlint

## Global Constraints

- Use the client-side fallback only when the API has not supplied an in-progress or future operation date.
- Always show the next US market date after a fully completed latest date, including across weekends and recurring regular US market holidays.
- Do not add a runtime dependency.
- Preserve the existing operation card layout, ordering, labels, and previous-session estimated-time behavior.
- Treat irregular exchange closures as server-owned data outside this fallback's scope.

---

### Task 1: US Market Calendar Utility

**Files:**
- Create: `src/utils/us-market-calendar.js`
- Create: `tests/us-market-calendar.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `isUsMarketDate(dateString: string): boolean`
- Produces: `getNextUsMarketDate(dateString: string): string`

- [ ] **Step 1: Register all Node test files and write failing calendar tests**

Change the test script to `node --test tests/*.test.mjs`. Add tests that import the wished-for utility and assert normal weekdays, weekends, fixed-date observed holidays, Good Friday, Thanksgiving, and year-boundary New Year's observance:

```js
import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getNextUsMarketDate,
  isUsMarketDate
} from '../src/utils/us-market-calendar.js'

test('moves from Friday to the following Monday', () => {
  assert.equal(getNextUsMarketDate('2026-08-14'), '2026-08-17')
})

test('skips recurring US market holidays', () => {
  assert.equal(getNextUsMarketDate('2026-07-02'), '2026-07-06')
  assert.equal(getNextUsMarketDate('2026-04-02'), '2026-04-06')
  assert.equal(getNextUsMarketDate('2026-11-25'), '2026-11-27')
  assert.equal(getNextUsMarketDate('2021-12-30'), '2022-01-03')
})

test('identifies regular market dates', () => {
  assert.equal(isUsMarketDate('2026-08-14'), true)
  assert.equal(isUsMarketDate('2026-08-15'), false)
  assert.equal(isUsMarketDate('2026-12-25'), false)
})
```

- [ ] **Step 2: Run the calendar test and verify RED**

Run: `node --test tests/us-market-calendar.test.mjs`

Expected: FAIL because `src/utils/us-market-calendar.js` does not exist.

- [ ] **Step 3: Implement the dependency-free calendar**

Implement UTC-only ISO date parsing/formatting, nth/last weekday helpers, Gregorian Easter calculation, fixed-holiday observance, and public functions:

```js
export function isUsMarketDate(dateString) {
  const date = parseIsoDate(dateString)
  const day = date.getUTCDay()
  return day !== 0 && day !== 6 && !getUsMarketHolidays(date).has(dateString)
}

export function getNextUsMarketDate(dateString) {
  const date = parseIsoDate(dateString)
  do date.setUTCDate(date.getUTCDate() + 1)
  while (!isUsMarketDate(formatIsoDate(date)))
  return formatIsoDate(date)
}
```

The holiday set must cover New Year's Day, MLK Day, Presidents Day, Good Friday, Memorial Day, Juneteenth from 2022, Independence Day, Labor Day, Thanksgiving Day, and Christmas Day. Include the following year's New Year's observance so a Friday, December 31 closure is recognized.

- [ ] **Step 4: Run the calendar tests and verify GREEN**

Run: `node --test tests/us-market-calendar.test.mjs`

Expected: all calendar tests PASS.

- [ ] **Step 5: Commit the calendar utility**

```bash
git add package.json src/utils/us-market-calendar.js tests/us-market-calendar.test.mjs
git commit -m "Add US market calendar fallback"
```

### Task 2: Agent Operation Upcoming-Date Fallback

**Files:**
- Create: `src/utils/operation-schedule.js`
- Create: `tests/operation-schedule.test.mjs`
- Modify: `src/components/agent/AgentPage.vue:1590-1766`

**Interfaces:**
- Consumes: `getNextUsMarketDate(dateString: string): string`
- Produces: `getOperationTargetDates(jobs: object[], requiredJobTypes: string[]): string[]`

- [ ] **Step 1: Write failing operation scheduling tests**

Test the pure scheduling decision with concise job fixtures:

```js
import assert from 'node:assert/strict'
import test from 'node:test'
import { getOperationTargetDates } from '../src/utils/operation-schedule.js'

const phases = ['PREPARE', 'APPLY', 'PLAN', 'SUBMIT']
const jobsFor = (targetDate, jobTypes) =>
  jobTypes.map((jobType, index) => ({ id: index + 1, targetDate, jobType }))

test('prepends the next market date after a complete latest date', () => {
  assert.deepEqual(
    getOperationTargetDates(jobsFor('2026-08-13', phases), phases),
    ['2026-08-14', '2026-08-13']
  )
})

test('uses Monday as the upcoming date after a completed Friday', () => {
  assert.deepEqual(
    getOperationTargetDates(jobsFor('2026-08-14', phases), phases),
    ['2026-08-17', '2026-08-14']
  )
})

test('does not add another date while the latest date is in progress', () => {
  assert.deepEqual(
    getOperationTargetDates(
      jobsFor('2026-08-14', ['PREPARE', 'APPLY']),
      phases
    ),
    ['2026-08-14']
  )
})
```

- [ ] **Step 2: Run the operation scheduling test and verify RED**

Run: `node --test tests/operation-schedule.test.mjs`

Expected: FAIL because `src/utils/operation-schedule.js` does not exist.

- [ ] **Step 3: Implement the operation date decision**

Create a focused utility that sorts unique recorded dates descending and prepends one computed date only when every required job type exists on the latest recorded date:

```js
import { getNextUsMarketDate } from './us-market-calendar.js'

export function getOperationTargetDates(jobs = [], requiredJobTypes = []) {
  const dates = [...new Set(jobs.map(job => job.targetDate).filter(Boolean))]
    .sort((left, right) => right.localeCompare(left))
  const latestDate = dates[0]
  if (!latestDate) return dates

  const latestTypes = new Set(
    jobs
      .filter(job => job.targetDate === latestDate)
      .map(job => job.jobType)
  )
  const isComplete = requiredJobTypes.every(jobType => latestTypes.has(jobType))
  return isComplete ? [getNextUsMarketDate(latestDate), ...dates] : dates
}
```

- [ ] **Step 4: Run the operation scheduling test and verify GREEN**

Run: `node --test tests/operation-schedule.test.mjs`

Expected: all operation scheduling tests PASS.

- [ ] **Step 5: Connect AgentPage to the scheduling utility**

Import `getOperationTargetDates` and replace the locally constructed `dates` array in `normalizeOperationResult`:

```js
const dates = getOperationTargetDates(
  jobs,
  OPERATION_PHASES.map(phase => phase.jobType)
)
```

Do not alter `getPreviousOperationTime`: for the synthesized first date, `dates[1]` is the latest recorded date, so the existing previous-session estimate remains valid.

- [ ] **Step 6: Run focused and full verification**

Run:

```bash
node --test tests/us-market-calendar.test.mjs tests/operation-schedule.test.mjs
pnpm test
pnpm lint:check
pnpm build
```

Expected: every command exits 0 with no test, lint, or build failures.

- [ ] **Step 7: Commit Agent integration**

```bash
git add src/utils/operation-schedule.js tests/operation-schedule.test.mjs src/components/agent/AgentPage.vue
git commit -m "Show next Agent operation date"
```
