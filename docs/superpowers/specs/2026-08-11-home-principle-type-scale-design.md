# Home Principle Type Scale Design

## Goal

Reduce the visual weight of the home page `Our Principle` statement without changing its message or the surrounding editorial composition.

## Design

Keep the eyebrow, English statement, Korean note, divider, spacing, and section background unchanged. Change the blockquote type scale from `clamp(3.6rem, 7.4vw, 8rem)` to `clamp(2.6rem, 4.2vw, 4.6rem)`. Remove the mobile-only `clamp(3.5rem, 15vw, 5rem)` override so small screens inherit the restrained base scale instead of enlarging the statement again. The statement spans the full content width, so it should remain slightly smaller than the half-width section headings while retaining clear hierarchy.

## Verification

Confirm that the statement remains readable at desktop width, wraps naturally without horizontal overflow on mobile, and retains the existing typeface and line height. Run the page regression tests, lint check, and production build.
