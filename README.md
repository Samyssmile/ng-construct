# @neuravision/ng-construct

Angular Component Library for the [Construct Design System](https://samyssmile.github.io/construct/).

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![npm](https://img.shields.io/npm/v/@neuravision/ng-construct)](https://www.npmjs.com/package/@neuravision/ng-construct)

## Install

```bash
npm install @neuravision/ng-construct @neuravision/construct
```

Add global styles to your `styles.css`:

```css
@import '@neuravision/construct/foundations.css';
@import '@neuravision/construct/components/components.css';
```

## Usage

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

| Component | Selector | Kategorie |
|-----------|----------|-----------|
| Accordion | `af-accordion` | Layout |
| Alert | `af-alert` | Feedback |
| App Shell | `af-app-shell` | Layout |
| App Shell V2 | `af-app-shell-v2` | Layout |
| Avatar | `af-avatar` | Data Display |
| Badge | `af-badge` | Data Display |
| Banner | `af-banner` | Feedback |
| Breadcrumbs | `af-breadcrumbs` | Navigation |
| Button | `af-button` | Actions |
| Card | `af-card` | Layout |
| Checkbox | `af-checkbox` | Data Entry |
| Chip | `af-chip` | Data Display |
| Chip Input | `af-chip-input` | Data Entry |
| Combobox | `af-combobox` | Data Entry |
| Data Table | `af-data-table` | Data Display |
| Datepicker | `af-datepicker` | Data Entry |
| Divider | `af-divider` | Layout |
| Drawer | `af-drawer` | Overlays |
| Dropdown | `af-dropdown` | Overlays |
| Empty State | `af-empty-state` | Feedback |
| Field | `af-field` | Form |
| File Upload | `af-file-upload` | Data Entry |
| Icon | `af-icon` | Data Display |
| Input | `af-input` | Data Entry |
| List | `af-list` | Data Display |
| Modal | `af-modal` | Overlays |
| Navbar | `af-navbar` | Navigation |
| Nav Tabs | `af-nav-tabs` | Navigation |
| Pagination | `af-pagination` | Navigation |
| Popover | `af-popover` | Overlays |
| Progress Bar | `af-progress-bar` | Feedback |
| Radio | `af-radio` | Data Entry |
| Select | `af-select` | Data Entry |
| Select Menu | `af-select-menu` | Data Entry |
| Sidebar | `af-sidebar` | Layout |
| Skeleton | `af-skeleton` | Feedback |
| Skip Link | `af-skip-link` | Navigation |
| Slider | `af-slider` | Data Entry |
| Spinner | `af-spinner` | Feedback |
| Switch | `af-switch` | Data Entry |
| Table | `af-table` | Data Display |
| Tabs | `af-tabs` | Layout |
| Textarea | `af-textarea` | Data Entry |
| Toast | `AfToastService` | Feedback |
| Toggle Group | `af-toggle-group` | Actions |
| Toolbar | `af-toolbar` | Actions |
| Tooltip | `af-tooltip` | Overlays |

### Services & Pipes

| Export | Beschreibung |
|--------|-------------|
| `AfToastService` | Programmatische Toast-Benachrichtigungen |
| `AfFormatLabelPipe` | Transformiert `snake_case` zu Title Case |

## Development

```bash
npm install              # Setup
npm start                # Demo-App (localhost:4200)
npm run build            # Library + Demo bauen
ng test                  # Tests (Vitest)
```
