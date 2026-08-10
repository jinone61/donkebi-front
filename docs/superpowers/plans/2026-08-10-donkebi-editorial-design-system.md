# Donkebi Editorial Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Quasar starter with a responsive editorial investment design system and showcase home.

**Architecture:** Keep Quasar for layout and accessibility while owning brand presentation through global CSS tokens and focused Vue components. Render realistic static content through reusable component contracts and a dependency-free SVG chart.

**Tech Stack:** Vue 3, Quasar 2, Vite, SCSS, Fontsource, inline SVG

## Global Constraints

- Use paper `#f4f1ea`, surface `#fbfaf7`, ink `#171717`, and muted `#74736f`.
- Use Noto Serif KR for display copy and Pretendard for interface text and numbers.
- Do not add a chart library, API integration, dark mode, or automated test stack.
- Complete desktop layouts at 1440 and 1024 pixels and mobile layouts at 768 and 390 pixels.

---

### Task 1: Foundation

- [x] Self-host the approved fonts and remove Quasar's Roboto extra.
- [x] Define design tokens, base typography, focus states, grid, responsive spacing, and reduced-motion behavior.
- [x] Map Quasar theme variables to the Donkebi palette.

### Task 2: Content and Components

- [x] Create static home content for the market snapshot, chart series, featured research, and research index.
- [x] Implement section header, text link, market metric, SVG trend chart, research item, and editorial image components.
- [x] Support missing metrics, empty chart data, accessible labels, and controlled chart periods.

### Task 3: Showcase Experience

- [x] Replace the starter shell with the responsive Donkebi header and navigation.
- [x] Assemble the six approved home sections and an original monochrome architectural asset.
- [x] Replace the starter 404 and remove unused demo pages, components, store, and logo.

### Task 4: Verification

- [x] Run Oxfmt/Oxlint and the production build.
- [x] Inspect desktop, tablet, and mobile screenshots for overflow and hierarchy.
- [x] Verify keyboard focus, empty content, long copy, and reduced-motion behavior.
