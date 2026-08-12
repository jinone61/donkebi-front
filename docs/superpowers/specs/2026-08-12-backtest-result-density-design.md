# Backtest Result Density Design

## Goal

Make the performance summary adapt naturally to its available width and reduce the vertical cost of long daily histories without changing any backtest data or interactions.

## Design

- Use CSS Grid `auto-fit` with `minmax()` for summary metrics. Cards retain a readable minimum width and share remaining row width evenly. Mobile uses a smaller minimum width so two compact cards can still fit where space allows.
- Remove fixed summary column counts from viewport breakpoints; the grid decides the count from its actual width.
- Reduce desktop daily-history gaps and expansion-header padding to target roughly 38–40 px collapsed rows.
- Preserve a minimum 48 px mobile expansion header for touch usability. Expanded detail spacing and all data fields remain unchanged.

## Verification

Source regression tests protect the adaptive grid and density rules. Browser checks cover desktop and 390 px mobile widths, horizontal overflow, row height, and console errors.
