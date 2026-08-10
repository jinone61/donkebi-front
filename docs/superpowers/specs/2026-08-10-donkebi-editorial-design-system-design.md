# Donkebi Editorial Design System

## Intent

Donkebi should feel like an investment research magazine rather than a conventional trading terminal. The visual balance is editorial emotion 60% and data precision 40%, aimed at design-conscious individual investors.

## Visual Language

Use warm paper and ivory surfaces, charcoal text and sections, thin rules, generous whitespace, and an asymmetric 12-column grid. Noto Serif KR carries Korean display copy; Pretendard carries interface text and tabular numbers. Muted red and blue appear only as market-status accents. Avoid elevation, gradients, glass effects, large radii, and generic finance imagery.

## Home Experience

The responsive showcase home contains a minimal global header, editorial hero with market snapshot, architectural feature story, market pulse chart, research index, and charcoal footer. Korean copy leads, with English eyebrow labels. Desktop preserves the asymmetric editorial composition; mobile follows the reading order message, market summary, feature, chart, and insights.

## System Boundaries

Quasar remains the layout and accessibility foundation while brand presentation lives in CSS tokens and focused `Dk*` components. Static content is separated from templates. The SVG chart handles empty data and exposes a text summary. The architectural image is an original project asset rather than the supplied reference.

## Acceptance

The page must build and lint cleanly, remain free of horizontal overflow at 1440, 1024, 768, and 390 pixels, support keyboard navigation and reduced motion, maintain readable contrast, and survive long Korean titles or missing market values. API integration, dark mode, and importing the external page remain follow-up work.
