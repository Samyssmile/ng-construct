# Construct Design System for Angular

Angular workspace for the **[Construct Design System](https://samyssmile.github.io/construct/)**.

Contains the Angular component library (`@neuravision/ng-construct`) and a demo app for showcasing all components.

## Usage

```bash
npm install @neuravision/ng-construct @neuravision/construct
```

Import the components you need:

```typescript
import { AfButtonComponent, AfInputComponent } from '@neuravision/ng-construct';
```

Include the Construct design tokens globally (e.g. in `styles.css`):

```css
@import '@neuravision/construct/foundations.css';
@import '@neuravision/construct/components/components.css';
```

## Project Structure

- **projects/angular** - `@neuravision/ng-construct` — Angular component library (via ng-packagr)
- **projects/demo** - Demo app showcasing all components

## Prerequisites

- Node.js (see `package.json` > `packageManager`)
- The Construct Design System must be available locally at `../design`

## Installation

```bash
npm install
```

## Development

Start the demo app:

```bash
npm start
```

Runs on `http://localhost:4200/`.

## Build

```bash
# Build everything (library + demo)
npm run build

# Library only
npm run build:angular

# Demo only
npm run build:demo
```

The library is built to `dist/angular/`, the demo to `dist/demo/`.

## Tests

```bash
ng test
```

## Publish

The library is published to npm via `publish.sh`:

```bash
NPM_TOKEN=<token> ./publish.sh
```
