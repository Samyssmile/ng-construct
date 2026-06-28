# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Angular workspace for the **Construct Design System**. Contains two projects:

- **`projects/angular`** — `@neuravision/ng-construct` component library (built with ng-packagr)
- **`projects/demo`** — Demo/showcase app consuming the library

The library wraps the CSS-based design system [`@neuravision/construct`](https://github.com/Samyssmile/construct) into Angular components. During local development it is linked from a sibling `../design` checkout.

## Commands

```bash
npm start                # Serve demo app at localhost:4200
npm run build:angular    # Build library → dist/angular/
npm run build:demo       # Build demo app → dist/demo/
npm run build            # Build library then demo (sequential)
ng test                  # Run unit tests (Vitest)
```

To run a single test file, use `npx ng test angular` (the library is the only project with tests). Tests use Vitest with `vitest/globals` — no explicit imports of `describe`/`it`/`expect` needed.

**Important:** The demo app must be built *after* the library because it imports from `@neuravision/ng-construct` which resolves to `./dist/angular` (see `tsconfig.json` paths).

## Architecture

### Monorepo Layout

```
projects/
  angular/src/lib/
    components/    # ~26 library components (button, input, modal, data-table, etc.)
    pipes/         # FormatLabel pipe
    services/      # AfToastService
  demo/src/app/
    components/    # Dashboard, Tasks, CreateTaskModal, Settings
    services/      # PmDataService (mock data management)
    data/          # Models (Task, Project, TeamMember) and mock data
```

### Library Component Conventions

- **Selector prefix:** `af-` (library) / `app-` (demo)
- **CSS classes:** Design system uses `ct-` prefix (e.g., `ct-button`, `ct-table`)
- **Public API:** Everything exported through `projects/angular/src/public-api.ts`
- Components build CSS class strings via `computed()` signals that combine the `ct-` design token classes based on input values

### Component Pattern

Every library component follows this structure:
- `input()` / `output()` functions (never decorators)
- `computed()` for derived class lists and state
- `ChangeDetectionStrategy.OnPush`
- Inline templates for simple components, external for complex ones
- Form controls implement `ControlValueAccessor` with `NG_VALUE_ACCESSOR` provider

### State Management

Signals-only approach (no NgRx or other state library):
- Services hold `signal()` for mutable state, expose `.asReadonly()`
- Components use `computed()` for derived values
- Update via `signal.update()` or `signal.set()` — never `mutate()`

### Design System Integration

Global styles must include:
```css
@import '@neuravision/construct/foundations.css';
@import '@neuravision/construct/components/components.css';
```

### No Router

The demo app uses manual view switching via a `currentView` signal (not Angular Router), so there are no route definitions.

## Tooling

- **Angular** 21 / **TypeScript** 5.9 / **Vitest** 4
- **Prettier** configured in `package.json` (100 char width, single quotes, angular HTML parser)
- **ng-packagr** for library builds
- **npm** 11.7 (pinned via `packageManager` field)
- No ESLint configured

## Publishing

Library published to npm as `@neuravision/ng-construct` via `./publish.sh`. The script builds, tests, then publishes from `dist/angular/` (supports `NPM_TOKEN` env var or interactive OTP).
