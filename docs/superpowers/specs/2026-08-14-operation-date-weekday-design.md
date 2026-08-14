# Operation Date Weekday Design

## Goal

Make each Agent operation date boundary easier to scan by adding an English weekday without changing the established timeline rhythm.

## Display

- Render dates as `YYYY.MM.DD DDD`, for example `2026.08.14 FRI`.
- Use fixed English abbreviations: `SUN`, `MON`, `TUE`, `WED`, `THU`, `FRI`, and `SAT`.
- Derive the weekday from the date-only API value without applying a local timezone conversion.
- Keep the weekday on the same line and in the same visual style as the date.
- Preserve the existing marker position, divider height, and continuous timeline rail on desktop and mobile.

## Validation

- Add a unit-level assertion for a known date and its weekday.
- Confirm the Agent timeline remains free of horizontal overflow at a 390px viewport.
- Run the full tests, lint check, and production build.
