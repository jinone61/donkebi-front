# Repository Guidelines

## Project Structure & Module Organization

This is a Vue 3 application built with Quasar and Vite. Application code lives in `src/`: route components are under `src/pages/`, reusable UI belongs in `src/components/`, Pinia stores live in `src/stores/`, and global styles are in `src/css/`. Quasar uses filename-based routing, so page paths and special files such as `src/pages/[...path].vue` define routes. Put bundled images in `src/assets/`; place files that must be served unchanged in `public/`. Framework and build settings are centralized in `quasar.config.js`.

## Build, Test, and Development Commands

Use Node.js 22.12 or newer and pnpm, as documented in the project README.

- `pnpm install` installs dependencies and runs Quasar preparation.
- `pnpm dev` starts the Quasar development server with hot reload.
- `pnpm lint:check` verifies formatting and lint rules without changing files.
- `pnpm lint` formats with Oxfmt and applies Oxlint fixes.
- `pnpm build` creates the production build and catches compilation errors.

Run `pnpm lint:check` and `pnpm build` before submitting changes.

## Coding Style & Naming Conventions

Follow the existing Oxfmt/Oxlint output: two-space indentation, single quotes in JavaScript, and no semicolons. Use Vue Single-File Components with `<script setup>` where practical. Name reusable components in PascalCase (for example, `EssentialLink.vue`), stores and utility modules in kebab-case, and route files according to Vue Router's file-routing syntax. Keep components focused; move shared state into Pinia rather than duplicating it across pages.

## Testing Guidelines

No automated test framework or coverage threshold is configured yet. For every change, run lint and production build checks, then verify affected flows in `pnpm dev`. Include concise manual test steps in the pull request. If adding a test runner, colocate tests with source files using `*.spec.js` and add the corresponding command to `package.json` and this guide.

## Commit & Pull Request Guidelines

The history currently contains only an initial project commit, so no established commit convention exists. Use short, imperative subjects such as `Add portfolio summary page`; keep unrelated changes in separate commits. Pull requests should explain the purpose and approach, link relevant issues, list verification steps, and include screenshots or recordings for visible UI changes. Call out configuration changes and any follow-up work explicitly.
