# Agent World Clock Design

## Goal

Clarify the relationship between Korean execution time and the New York trading date in the Agent workspace header.

## Header Display

- Keep `AGENT CONNECTED` as the first status line.
- Show time rows in this order: `NEW YORK`, then `SEOUL`.
- Render both values as `YYYY.MM.DD DDD · HH:mm ZONE`; display `KST` on `SEOUL`.
- Use a fixed label column, separator column, and value column so every `·` and timestamp begins at the same horizontal position.
- Stack the same aligned rows on desktop and mobile without horizontal scrolling.
- Use a 22px row height with no gap between rows for a compact clock block.

## Card Update Status

- Keep each API's update status inside the card that owns the data.
- Place the Operation source tags and update line together in the bottom metadata row, with the update line aligned to the right.
- Treat the Operation update line as a quiet caption: retain the muted text color, use a `0.63rem` font size and tighter letter spacing, let the refresh icon inherit the same tone, and pull the row 3px closer to its description.
- Keep the Performance update line below its source tags with a 4px gap.
- Keep the icon-only refresh action directly beside the timestamp.
- Keep the Operation metadata on one row and use the full card width on mobile. Right-align the Performance metadata on desktop and left-align it on mobile.
- The Operation card uses its own timestamp, loading state, and refresh action; the Performance card does the same independently.

## Behavior

- Calculate Seoul with `Asia/Seoul` and display `KST`.
- Calculate New York with `America/New_York` and let `Intl.DateTimeFormat` select `EST` or `EDT`.
- Refresh both clocks once per minute and clean up the timer when the component unmounts.
- Format each card's last successful API refresh in `Asia/Seoul` with `KST`.

## Validation

- Assert the two-row clock order, timezone identifiers, weekday output, and aligned grid structure.
- Assert independent card timestamps, loading states, accessible refresh labels, and actions.
- Verify the desktop and 390px mobile layouts visually.
- Run the full test, lint, and production build commands.
