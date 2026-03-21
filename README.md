# @neuravision/ng-construct

Angular component library for the [Construct Design System](https://samyssmile.github.io/construct/). Provides 44 ready-to-use, accessible Angular components built on top of `@neuravision/construct` CSS foundations.

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![npm](https://img.shields.io/npm/v/@neuravision/ng-construct)](https://www.npmjs.com/package/@neuravision/ng-construct)

## Quick Start

### Install

```bash
npm install @neuravision/ng-construct @neuravision/construct
```

### Add Global Styles

Include the design tokens and component styles in your `styles.css`:

```css
@import '@neuravision/construct/foundations.css';
@import '@neuravision/construct/components/components.css';
```

### Use Components

All components are standalone — import only what you need:

```typescript
import { AfButtonComponent, AfInputComponent } from '@neuravision/ng-construct';

@Component({
  imports: [AfButtonComponent, AfInputComponent],
  template: `
    <af-input label="Email" type="email" />
    <af-button variant="primary" (click)="onSubmit()">Submit</af-button>
  `,
})
export class MyComponent {}
```

## Components

| Category | Components |
|----------|-----------|
| **Actions** | Button, Toggle Group, Toolbar |
| **Data Display** | Data Table, Table, List, Badge, Chip Input, Avatar, Icon |
| **Data Entry** | Input, Textarea, Select, Select Menu, Combobox, Checkbox, Radio, Switch, Slider, Datepicker, File Upload |
| **Feedback** | Alert, Banner, Toast, Progress Bar, Spinner, Skeleton, Empty State |
| **Layout** | Card, Divider, Accordion, Tabs, Sidebar, Drawer |
| **Navigation** | Navbar, Breadcrumbs, Pagination, Skip Link |
| **Overlays** | Modal, Popover, Tooltip, Dropdown |
| **Form** | Field |

All components follow Angular best practices:
- Signal-based inputs/outputs (`input()` / `output()`)
- `ChangeDetectionStrategy.OnPush`
- Form controls implement `ControlValueAccessor`
- WCAG AA accessible

### Services & Pipes

| Export | Description |
|--------|-------------|
| `AfToastService` | Programmatic toast notifications with signal-based state |
| `AfFormatLabelPipe` | Transforms `snake_case` identifiers to Title Case labels |

## Workspace Structure

```
projects/
  angular/          @neuravision/ng-construct (library, built with ng-packagr)
  demo/             Showcase app for development and visual testing
```

## Development

### Prerequisites

- **Node.js** with npm 11.7+ (pinned via `packageManager`)
- **Construct Design System** available at `../design` (linked via `file:` dependency)

### Setup

```bash
npm install
```

### Serve Demo App

```bash
npm start
```

Opens at [localhost:4200](http://localhost:4200).

### Build

```bash
npm run build            # Library + Demo (sequential)
npm run build:angular    # Library only  → dist/angular/
npm run build:demo       # Demo only     → dist/demo/
```

> **Note:** The demo depends on the library build output. Always build the library first.

### Test

```bash
ng test                  # Run all tests (Vitest)
npx ng test angular      # Run library tests only
```

### Publish

```bash
NPM_TOKEN=<token> ./publish.sh
```

The script builds, runs tests, and publishes `dist/angular/` to npm with `--access public`. Falls back to interactive OTP if no token is provided.

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Angular | 21 | Component framework |
| TypeScript | 5.9 | Language |
| Vitest | 4 | Unit testing |
| ng-packagr | 21 | Library packaging |
| Prettier | — | Code formatting (100 chars, single quotes) |
