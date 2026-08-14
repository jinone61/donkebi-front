# Operation Date Weekday Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fixed English three-letter weekday to every Agent operation date divider.

**Architecture:** Extend the existing `formatOperationDate` formatter in `AgentPage.vue`; no new component or dependency is needed. Keep parsing date-only values manually so the displayed weekday cannot shift with the browser timezone.

**Tech Stack:** Vue 3, Quasar, JavaScript, Node test runner, Oxfmt/Oxlint

## Global Constraints

- Render `YYYY.MM.DD DDD`, such as `2026.08.14 FRI`.
- Preserve existing divider geometry and timeline continuity.
- Keep the value on one line without mobile horizontal overflow.
- Leave all changes uncommitted for the user to commit together.

---

### Task 1: Add English weekday formatting

**Files:**

- Modify: `src/components/agent/AgentPage.vue`
- Test: `tests/brand-pages.test.mjs`

**Interfaces:**

- Consumes: `formatOperationDate(value)` with an API date string in `YYYY-MM-DD` form.
- Produces: a display string in `YYYY.MM.DD DDD` form, or `-` for an absent/invalid date.

- [x] **Step 1: Write the failing formatter test**

Assert that the Agent source defines fixed weekday labels and maps the known Friday `2026-08-14` to the `FRI` suffix without `Date` timezone conversion.

- [x] **Step 2: Verify the test fails**

Run `node tests/brand-pages.test.mjs` and confirm the new weekday assertion fails.

- [x] **Step 3: Implement minimal formatting**

Split the date into numeric year, month, and day values, calculate the weekday with `Date.UTC`, select from `['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']`, and append it to the existing dotted date.

- [x] **Step 4: Verify behavior and regressions**

Run `npm test`, `npm run lint:check`, and `npm run build`. Inspect the 390px Agent timeline and confirm the date fits its rail with no horizontal overflow.
