# Home Principle Type Scale Design

## Goal

Reduce the visual weight of the home page `Our Principle` statement without changing its message or the surrounding editorial composition.

## Design

Keep the eyebrow, English statement, Korean note, divider, spacing, and section background unchanged. Change only the blockquote type scale from `clamp(3.6rem, 7.4vw, 8rem)` to `clamp(2.8rem, 5vw, 5.6rem)`. The smaller responsive range should preserve the statement's hierarchy while giving both lines more breathing room on desktop and mobile.

## Verification

Confirm that the statement remains two readable lines at desktop width, fits without horizontal overflow on mobile, and retains the existing typeface and line height. Run the page regression tests, lint check, and production build.
