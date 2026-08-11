# Home Chart Readability Design

## Goal

Improve the home backtest story without changing its editorial composition or the real backtest workspace.

## Headline

Keep the copy `AI-powered / real-world magic.` on two authored lines. Wrap the second line in a dedicated inline element and offset it by `0.15em` so the `p` in `powered` no longer sits directly above the `l` in `real`. Increase line-height only slightly if needed; the heading must remain left-aligned and retain its oversized serif character.

## Market Chart

Replace the market's uniformly descending curve with an irregular, market-like path. It should move through a sequence of declines, recoveries, and pullbacks while finishing below its shared starting point. Use a restrained smooth path rather than a sharp sawtooth so it continues to feel like an editorial graphic. Keep the market line muted and dashed, and keep the Donkebi line bright, solid, and upward-trending.

## Motion and Responsive Behavior

Preserve the existing one-time reveal animation and reduced-motion fallback. The headline offset must work at desktop and mobile widths without causing horizontal overflow. Both chart labels must remain inside the graph.

## Scope and Verification

Modify only the home page and its regression coverage. Do not edit `src/pages/index/BacktestPage.vue` or the editable backtest workspace. Verify with the existing test suite, lint check, production build, and browser screenshots at desktop and mobile sizes.
