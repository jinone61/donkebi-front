# Mobile Navigation and Backtest Routing Design

## Scope

Improve the existing editorial homepage without revisiting its visual system. The mobile menu must overlay the page instead of changing document flow, and Backtest must be the only navigation item that opens a separate page. Backtest functionality and final branding are intentionally deferred.

## Mobile Menu

On screens below 768px, the menu opens directly beneath the 68px header. The opaque paper-colored panel is only as tall as its navigation content and slides down from behind the header without changing document flow or painting over the header. A fixed backdrop covers the rest of the viewport with a 4px blur and a 14% charcoal tint, keeping the page visible while clearly separating it from the menu.

While open, the backdrop blocks page interaction and background scrolling. Tapping the backdrop closes only the menu. Opening and closing use matching 180ms panel and backdrop transitions, and the hamburger lines animate into an X while open. Covered page content is removed from keyboard navigation, while Escape closes the layer and restores focus to the menu button. Choosing any item closes the layer before scrolling or navigating.

Locking scroll must not change the page width or hide the scrollbar. Keep the root vertical scrollbar visible and reserve its gutter so the homepage and fixed header retain identical horizontal geometry before, during, and after menu use. Close and clean up the menu automatically when the viewport enters the desktop breakpoint.

Desktop navigation remains unchanged.

## Navigation Model

Navigation data will distinguish same-page anchors from application routes:

- 시장, 리서치, 테마, 아카이브 continue to scroll to sections on `/`.
- BACKTEST navigates to `/backtest` through Vue Router.

Both desktop and mobile navigation render the appropriate control for each destination. Section actions remain buttons; when used from Backtest they return to the homepage before scrolling to their target. Backtest is a router link with normal browser navigation semantics.

## Backtest Placeholder

Add `src/pages/index/backtest.vue` as a temporary page nested under the shared site layout by the existing file-based router. It keeps the `/backtest` URL while reusing the site header and uses the current paper, ink, serif typography, and spacing tokens, with a short “preparing” message and a link back home. The future imported Backtest page can replace this file without changing the homepage navigation contract.

## Verification

Browser checks will confirm that the panel height follows its content, the transparent backdrop reaches the bottom of the viewport, and opening the menu does not change homepage width or position. They will also verify background scroll and focus locking, backdrop dismissal, Escape focus restoration, desktop-breakpoint cleanup, and the absence of horizontal overflow. Route checks will confirm that BACKTEST resolves to `/backtest`, the placeholder renders, and its home link returns to `/`. Existing lint and production build commands must remain green.
