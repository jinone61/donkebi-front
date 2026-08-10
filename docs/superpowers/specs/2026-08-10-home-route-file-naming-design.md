# Home Route File Naming Design

## Goal

Make the default homepage route easier to recognize in `src/pages/` without changing application behavior or URLs.

## Decision

Rename `src/pages/index/(index).vue` to `src/pages/index/(home).vue`. Parentheses define a pathless route group, so both names resolve as the default child of `src/pages/index.vue` at `/`.

The surrounding structure remains unchanged:

- `src/pages/index.vue` provides the shared header layout.
- `src/pages/index/(home).vue` renders the homepage at `/`.
- `src/pages/index/backtest.vue` renders `/backtest` inside the shared layout.
- `src/pages/[...path].vue` remains the global catch-all page.

No component code, navigation behavior, styling, or route URLs will change.

## Verification

Run formatting and lint checks, build the production bundle, and confirm that `/`, `/backtest`, and an unknown route still resolve to the homepage, Backtest page, and 404 page respectively.
