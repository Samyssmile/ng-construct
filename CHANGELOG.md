# Changelog

All notable changes to `@neuravision/ng-construct` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.10.0] - 2026-06-23

### Added

- **autocomplete:** New `AfAutocompleteComponent` (`af-autocomplete`) — an accessible async/remote
  autocomplete (typeahead) following the WAI-ARIA 1.2 combobox-with-listbox pattern. Unlike
  `AfCombobox` (which owns a static option list and filters it by label substring), this component is
  **external-filter only**: the consumer fetches and filters, then feeds the resolved results in via
  `options` and toggles `loading`. This makes it suitable for remote search across multiple sources,
  where a hit may have matched on a field that is not part of its visible label (e.g. a user matched
  by e-mail) — such hits would be wrongly dropped by `AfCombobox`'s internal substring filter.
  - Emits a selection **event** (`optionSelected`) instead of binding a value, so the same box can
    drive an action (apply a filter, navigate) while keeping the free text.
  - Option **groups** with headings (`group` key + `groupLabels`/`groupOrder`), a **loading** row, an
    **empty** row, and rich rows via the `*afAutocompleteOption` template directive.
  - Full keyboard support (Arrow/Home/End/Enter/Escape/Tab) using the WAI-ARIA manual-selection
    pattern — nothing is highlighted until the user navigates, so a free-text Enter never hijacks
    into a selection. Screen-reader announcements via a polite live region.
  - `hideOnEmpty` keeps the panel closed (rather than showing the empty row) while there are no
    options and no fetch is in flight — for boxes that also drive a live side effect (e.g. a text
    filter) so an empty suggestion list stays silent.
  - Standalone, OnPush, signal-based, SSR-safe; ships its own scoped styles built on the Construct
    control/`--ct-*` tokens. 21 new specs, axe-core verified.

## [0.9.0] - 2026-06-17

### Added

- **charts:** New SVG chart family wrapping the Construct `ct-chart` styling layer — the foundation the data dashboard work depends on. All components are standalone, OnPush, signal-based, SSR-safe (no DOM/`window`/`Date`), and accessible: every chart exposes `role="img"` + a descriptive `aria-label` and an always-present, visually-hidden data-table fallback (toggleable) so information is never conveyed by colour alone (WCAG 1.4.1); series colours come from the contrast-checked `--color-chart-series-*` tokens, and all strings are configurable via `AF_CHART_I18N`.
  - `AfLineChartComponent` (`af-line-chart`) — line / area, multi-series, nice axis ticks, null-gap handling.
  - `AfBarChartComponent` (`af-bar-chart`) — grouped & stacked, vertical & horizontal, gap-free histogram mode.
  - `AfDonutChartComponent` (`af-donut-chart`) — donut / pie with centre label and per-slice percentages.
  - `AfSparklineComponent` (`af-sparkline`) — compact inline trend line for KPI tiles.
  - `AfGaugeComponent` (`af-gauge`) — ring / semi gauge using the WAI-ARIA `meter` role with threshold-driven status colours.
  - Shared foundation: `AfChartDataTableComponent`, `AF_CHART_I18N`, the `AfChartSeries` / `AfChartDatum` / `AfGaugeThreshold` data contracts, the SSR-safe `chart-geometry` helpers, and a component test harness per chart. 93 new specs (axe-core verified) and Storybook stories under `Angular/Charts/*`.
- **construct:** Bumped peer dependency `@neuravision/construct` to `^1.3.0` (ships `chart.css` and the `--color-chart-series-*` palette tokens required by the charts).

### Fixed

- **bar-chart:** The value axis now always includes the zero baseline. Previously a chart whose every value (grouped) — or every stack total (stacked) — was negative produced a domain that excluded `0`, so bars were drawn from an off-canvas origin and, with `overflow: visible`, leaked over the toolbar/legend. The domain now reaches `max(0, …)`/`min(0, …)`, and stacked layouts use the smallest *negative stack total* rather than the smallest single value, keeping every bar on-canvas.
- **gauge:** `aria-valuenow` is now clamped into `[min, max]` as the WAI-ARIA `meter` role requires (an out-of-range `value` previously exposed `aria-valuenow > aria-valuemax`); `aria-valuetext` keeps the raw value so assistive tech still announces e.g. `"150%"`.
- **gauge:** The `strokeWidth` input now drives the rendered arc thickness via the `--ct-chart-gauge-width` custom property. It was previously bound as an SVG presentation attribute that the `ct-chart` class selector overrode, so the input changed only the arc radius — desyncing the geometry from the (fixed 14px) stroke.

## [0.8.0] - 2026-06-05

### Changed

- **peer-deps:** Widened the `@angular/*` peer dependency range to `^21.1.0 || ^22.0.0` so the library can be consumed from Angular 22 projects. The library uses only stable Angular APIs (signals, `input()`/`output()`, `computed()`, `ControlValueAccessor`); no source changes were required. Angular 21 remains supported.

## [0.7.0] - 2026-05-07

## [0.6.0] - 2026-05-07

### Added

- **tree:** New `AfTreeComponent` (`af-tree`) implementing the WAI-ARIA Tree View pattern over the Construct `ct-tree` CSS component. Signal-based, OnPush, generic over the node payload. Supports n-level nesting, single/multi selection, async lazy-load (`loadChildren`), client-side substring filtering with auto-expand and `<mark>` highlighting, content slots (`nodeContent`, `nodeActions`, `nodeWarning`, `empty`), and configurable i18n via `AF_TREE_I18N`. Full keyboard pattern (↑/↓/←/→/Home/End/Enter/Space/`*` and A–Z type-ahead) on a roving tabindex anchored to each `<li role="treeitem">`. Includes `AfTreeHarness` and `AfTreeNodeHarness` test helpers, 26 specs (axe-core a11y verified), Storybook stories and a `Tree` showcase view in the demo app. ([#23](https://github.com/Samyssmile/ng-construct/issues/23))
- **construct:** Bumped peer dependency `@neuravision/construct` to `^1.2.0` (ships `tree.css`).

## [0.5.1] - 2026-04-09

### Added

- **avatar:** Optional `colorSeed` input on `AfAvatarComponent` for deterministic per-user avatar colors. Pass a stable identifier (userUUID, email, …); the component hashes it locally and binds the resulting palette index to `data-seed-color`, so the same person always renders in the same color across the app. Empty/missing seed leaves the attribute off and the avatar keeps its default background — fully backwards compatible. Pairs with `Samyssmile/construct#85`. ([#22](https://github.com/Samyssmile/ng-construct/issues/22))
- **avatar:** Exported `AVATAR_SEED_PALETTE_SIZE` constant so consumers can introspect the palette size in sync with the underlying Construct DS.
- **demo:** New "Team" tab in Settings showcasing seeded avatars across the mock team members.

## [0.5.0] - 2026-04-03

### Added

- **input:** SOTA-Audit — 65 Unit Tests, Test Harness, 6 Storybook Stories, i18n InjectionToken, axe-core a11y
- **button:** SOTA-Audit — Tests, Harness, Stories, a11y-Warnung
- **badge:** SOTA-Audit — Tests, Harness, Stories, Host-Bindings, a11y
- **alert:** SOTA-Audit — Harness, axe-core, Stories, i18n, a11y
- **accordion:** SOTA-Audit — Harness, axe-core, Stories, a11y-Announcer, i18n
- **chip:** New chip component

## [0.4.1] - 2026-04-02

### Fixed

- **table:** Remove unused component imports in test hosts to resolve NG8113 compiler warnings

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
