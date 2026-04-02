# Changelog

All notable changes to `@neuravision/ng-construct` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-04-02

### Added

- **nav-tabs:** New `af-nav-tabs` component for router-based tab navigation with `routerLink` + `routerLinkActive` ([#19](https://github.com/Samyssmile/ng-construct/issues/19))
- **breadcrumbs:** `routerLink` input for SPA navigation without page reload

### Fixed

- **breadcrumbs:** Add `aria-current="page"` on current item and `aria-hidden="true"` on separators
- **breadcrumbs:** Incorrect `ct-breadcrumbs__current` CSS class on non-link fallback items
- **nav-tabs:** Use correct ARIA navigation pattern (`<nav>` + links + `aria-current`) instead of tabs pattern (`role="tablist/tab"`)

## [0.3.6] - 2026-03-31

### Fixed

- **navbar:** Fix navbar layout and content projection

## [0.3.5] - 2026-03-30

### Added

- **app-shell:** Add App Shell V1 and V2 wrapper components

## [0.3.2] - 2026-03-28

### Added

- **dropdown, navbar:** Add alignment/side inputs for dropdown and fix navbar content projection

### Fixed

- **dropdown:** Add size input, fix `aria-labelledby` and document click handling

## [0.3.1] - 2026-03-27

### Changed

- Migrate to Lucide icons and update `@neuravision/construct` to ^1.1.2

## [0.3.0] - 2026-03-26

### Added

- **nav-item:** Extend `af-nav-item` with `routerLink`, content projection, and active CSS
- **table:** Add `af-table` Angular wrapper components
- **list:** Add `af-list` and `af-list-item` Angular wrapper components
- **field:** Add `af-field` Angular wrapper component
- **divider:** Add `af-divider` Angular wrapper component
- **empty-state:** Add `af-empty-state` Angular wrapper component
- **avatar:** Add `af-avatar` Angular wrapper component
- **navbar:** Add `af-navbar` and `af-nav-item` Angular wrapper components
- **popover:** Add `af-popover` component with trigger directive and auto-flip positioning
- **select-menu:** Add `af-select-menu` component with single/multi-select and full keyboard navigation
- **accordion:** Add `af-accordion` and `af-accordion-item` Angular wrapper components
- **drawer:** Add `af-drawer` Angular wrapper component
- **combobox:** Add `af-combobox` component with full a11y support
- **file-upload:** Add `af-file-upload` Angular wrapper component

## [0.1.0] - 2026-03-20

### Added

- Initial release with core components (button, input, modal, data-table, tabs, pagination, toast, breadcrumbs)
