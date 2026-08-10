# Mobile Navigation and Backtest Routing Design

## Scope

Improve the existing editorial homepage without revisiting its visual system. The mobile menu must overlay the page instead of changing document flow, and Backtest must be the only navigation item that opens a separate page. Backtest functionality and final branding are intentionally deferred.

## Mobile Menu

On screens below 768px, the menu opens as a fixed, opaque paper-colored layer directly beneath the 68px header. It fills the remaining viewport height, scrolls internally when necessary, and stays above homepage content. Opening it must not change the homepage position or dimensions.

While open, background scrolling is locked. The menu button exposes the correct expanded state and open/close label. Escape closes the layer and restores focus to the menu button. Choosing any item closes the layer before scrolling or navigating.

Desktop navigation remains unchanged.

## Navigation Model

Navigation data will distinguish same-page anchors from application routes:

- 시장, 리서치, 테마, 아카이브 continue to scroll to sections on `/`.
- BACKTEST navigates to `/backtest` through Vue Router.

Both desktop and mobile navigation render the appropriate control for each destination. Same-page actions remain buttons; Backtest is a router link with normal browser navigation semantics.

## Backtest Placeholder

Add `src/pages/backtest.vue` as a temporary standalone page discovered by the existing file-based router. It uses the current paper, ink, serif typography, and spacing tokens, with a short “preparing” message and a link back home. The future imported Backtest page can replace this file without changing the homepage navigation contract.

## Verification

Browser checks will confirm that opening the menu does not move homepage content, background scrolling is locked, Escape restores focus, and mobile navigation has no horizontal overflow. Route checks will confirm that BACKTEST resolves to `/backtest`, the placeholder renders, and its home link returns to `/`. Existing lint and production build commands must remain green.
