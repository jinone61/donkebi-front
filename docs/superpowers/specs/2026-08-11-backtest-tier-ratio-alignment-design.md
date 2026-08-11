# Backtest Tier Ratio Alignment

## Scope

Align the authenticated SETUP panel's tier buy-ratio section with the defense-mode fields above it. The original comparison page and all backtest behavior remain unchanged.

## Design

Add a dedicated class to the `q-card-section` that contains the tier-ratio heading, total badge, and inputs. Remove only that section's horizontal padding while preserving its existing top-spacing utility and vertical rhythm. This makes the ratio heading and fields share the same left and right edges as the defense settings grid on desktop and mobile.

## Verification

Add a source-level regression assertion for the dedicated class and zero horizontal padding. Run the existing test suite, lint check, and production build, then inspect the authenticated SETUP layout at mobile width.
