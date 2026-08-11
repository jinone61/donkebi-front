# Home Principle Type Scale Design

## Goal

Reduce the visual weight of the home page `Our Principle` statement without changing its message or the surrounding editorial composition.

## Design

Keep the eyebrow, English statement, Korean note, divider, spacing, and section background unchanged. Change the blockquote type scale from `clamp(3.6rem, 7.4vw, 8rem)` to `clamp(3.1rem, 5.7vw, 6rem)`, matching the `Shannon’s Devil` heading scale. Remove the mobile-only `clamp(3.5rem, 15vw, 5rem)` override so small screens inherit the shared base scale instead of enlarging the statement again. This keeps the full-width statement consistent with the home page heading system without returning to its former oversized maximum.

## Verification

Confirm that the statement remains readable at desktop width, wraps naturally without horizontal overflow on mobile, and retains the existing typeface and line height. Run the page regression tests, lint check, and production build.
