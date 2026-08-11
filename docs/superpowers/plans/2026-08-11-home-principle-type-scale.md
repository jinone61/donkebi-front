# Home Principle Type Scale Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the visual dominance of the home page `Our Principle` statement across desktop and mobile.

**Architecture:** Keep the existing section markup and editorial styling. Protect the agreed responsive scale with a source regression test, replace the base blockquote clamp, and remove the mobile override that currently enlarges the statement.

**Tech Stack:** Vue 3 Single-File Components, Quasar, SCSS, Node.js test runner

## Global Constraints

- Keep the eyebrow, English statement, Korean note, divider, spacing, background, typeface, and line height unchanged.
- Use `clamp(3.1rem, 5.7vw, 6rem)` for the principle blockquote, matching the `Shannon’s Devil` heading.
- Remove the mobile-only `clamp(3.5rem, 15vw, 5rem)` override.
- Do not modify other home sections or either backtest implementation.

---

### Task 1: Rescale the Our Principle statement

**Files:**

- Modify: `tests/brand-pages.test.mjs`
- Modify: `src/pages/index/(home).vue:634-642`
- Modify: `src/pages/index/(home).vue:876-880`

**Interfaces:**

- Consumes: Existing `.principle blockquote` styles and the `brand-pages.test.mjs` source-regression pattern.
- Produces: One responsive blockquote scale shared by desktop and mobile.

- [ ] **Step 1: Write the failing regression test**

Add this test to `tests/brand-pages.test.mjs`:

```js
test('home principle matches the Shannon heading type scale', async () => {
  const source = await readSource('src/pages/index/(home).vue')

  assert.match(
    source,
    /\.principle \{[\s\S]*?blockquote \{[^}]*font-size: clamp\(3\.1rem, 5\.7vw, 6rem\);[^}]*\}/
  )
  assert.doesNotMatch(source, /clamp\(3\.5rem, 15vw, 5rem\)/)
})
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test --test-name-pattern="home principle" tests/brand-pages.test.mjs`

Expected: FAIL because the source still contains the old base scale and mobile override.

- [ ] **Step 3: Apply the minimal SCSS change**

In the base `.principle blockquote` rule, replace the font size with:

```scss
font-size: clamp(3.1rem, 5.7vw, 6rem);
```

Inside `@media (max-width: 767px)`, remove only this nested rule:

```scss
.principle {
  blockquote {
    font-size: clamp(3.5rem, 15vw, 5rem);
  }
}
```

Keep the adjacent mobile `.principle__note` rule in place.

- [ ] **Step 4: Run automated verification**

Run:

```bash
node --test --test-name-pattern="home principle" tests/brand-pages.test.mjs
pnpm lint:check
pnpm build
```

Expected: The focused test passes, lint reports no errors, and Quasar completes the production build.

- [ ] **Step 5: Verify responsive presentation**

Run `pnpm dev`, then inspect the `Our Principle` section at approximately `1440px` and `390px` viewport widths. Confirm that the statement no longer dominates adjacent sections, wraps without horizontal overflow, and retains its existing text, typeface, line height, spacing, divider, and Korean note.

- [ ] **Step 6: Commit the implementation**

```bash
git add tests/brand-pages.test.mjs 'src/pages/index/(home).vue'
git commit -m "Refine home principle type scale"
```
