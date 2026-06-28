# Contributing to ng-construct

Thanks for your interest in improving **ng-construct**, the Angular component library for the
[Construct](https://github.com/Samyssmile/construct) design system!

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). By participating, you agree to uphold it.

## Getting Started

```bash
git clone https://github.com/Samyssmile/ng-construct.git
cd ng-construct
npm install
npm start          # demo app at http://localhost:4200
```

## Workspace Layout

```
projects/
  angular/   @neuravision/ng-construct — the library (ng-packagr)
  demo/      showcase app that consumes the library
```

> The demo imports from `@neuravision/ng-construct` (resolved to `dist/angular`), so build the
> **library first**: `npm run build`.

## Angular Conventions

These are enforced across the library — please follow them:

- **Standalone** components only (no `NgModule`); don't set `standalone: true` (it's the default)
- Use `input()` / `output()` **functions**, never the `@Input()` / `@Output()` decorators
- Use **signals** for state and `computed()` for derived values — never `mutate()`, use `set()` / `update()`
- `ChangeDetectionStrategy.OnPush` on every component
- Host bindings go in the `host` object — not `@HostBinding` / `@HostListener`
- Native control flow (`@if`, `@for`, `@switch`), `class`/`style` bindings (not `ngClass`/`ngStyle`)
- `inject()` over constructor injection; services are `providedIn: 'root'`
- Form controls implement `ControlValueAccessor`
- **Selector prefix:** `af-`; everything public is exported from `projects/angular/src/public-api.ts`

## Accessibility Is Required

Every component must pass AXE checks and meet **WCAG 2.1 AA** — focus management, color contrast,
and ARIA attributes included. This builds on Construct's accessibility guarantees.

## Testing

```bash
ng test            # Vitest (vitest/globals — no manual describe/it/expect imports)
```

Please add or update tests for the component you change.

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`,
`chore:`, `refactor:`, `test:` — e.g. `feat(datepicker): add range selection`.

## Pull Requests

1. Branch from `main`
2. Build the library, run `ng test`, verify the demo app
3. Open a PR using the template, describing the change & motivation

Thank you for contributing! 🧡
