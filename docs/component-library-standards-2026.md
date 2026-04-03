# State of the Art: Angular Component Library — Standards & Richtlinien 2026

> Dieses Dokument definiert, was eine moderne Angular Component Library (Framework Binding für ein Design System) im Jahr 2026 erfüllen muss, um als **State of the Art** zu gelten. Es dient als verbindliche Referenz für die Entwicklung von `@neuravision/ng-construct`.

---

## Inhaltsverzeichnis

1. [Architektur & Paketstruktur](#1-architektur--paketstruktur)
2. [API-Design](#2-api-design)
3. [Barrierefreiheit (Accessibility)](#3-barrierefreiheit-accessibility)
4. [Theming & Design Tokens](#4-theming--design-tokens)
5. [Formular-Integration](#5-formular-integration)
6. [Performance](#6-performance)
7. [Testing](#7-testing)
8. [Dokumentation](#8-dokumentation)
9. [Internationalisierung (i18n)](#9-internationalisierung-i18n)
10. [Developer Experience (DX)](#10-developer-experience-dx)
11. [Versionierung & Release](#11-versionierung--release)
12. [Checkliste: Angular Wrapper Component](#12-checkliste-angular-wrapper-component)

---

## 1. Architektur & Paketstruktur

### Angular Package Format (APF)

Die Library MUSS dem **Angular Package Format** entsprechen. Das wird durch `ng-packagr` sichergestellt.

### Tree-Shaking

- `"sideEffects": false` in `package.json`
- Services mit `providedIn: 'root'` (ungenutzte Services werden automatisch eliminiert)
- Standalone Components sind inhärent tree-shakeable
- Keine Barrel-Exporte, die gesamte Modulgraphen mitziehen

### Verzeichnisstruktur pro Komponente

```
button/
  index.ts                       # Barrel-Export
  button.component.ts
  button.component.html          # (optional, bei komplexem Template)
  button.component.spec.ts
  button.harness.ts              # Component Test Harness
```

---

## 2. API-Design

### Signal-basierte Inputs & Outputs (Angular 21+)

Alle Komponenten MÜSSEN die Signal-API verwenden — keine Decorators (`@Input`, `@Output`).

```typescript
// Standard-Input mit Default
variant = input<'primary' | 'secondary' | 'ghost'>('primary');

// Boolean mit Transform
disabled = input(false, { transform: booleanAttribute });

// Pflicht-Input
label = input.required<string>();

// Two-Way Binding via model()
value = model<string>('');

// Output
closed = output<void>();
selectionChange = output<string[]>();

// Abgeleiteter Zustand
buttonClasses = computed(() => { /* ... */ });
```

### linkedSignal für abhängigen Zustand

Für Zustand, der sich automatisch zurücksetzt, wenn eine Abhängigkeit sich ändert, aber vom Nutzer überschrieben werden kann:

```typescript
selectedOption = linkedSignal(() => this.options()[0]);
```

### Content Projection

Drei Ebenen der Flexibilität:

| Stufe | Mechanismus | Anwendungsfall |
|-------|-------------|----------------|
| Einfach | `<ng-content select="[header]">` | Statische Slots |
| Template-basiert | `TemplateRef`-Input + `NgTemplateOutlet` | Rendering mit Context |
| Direktiven-basiert | `contentChildren(SomeDirective)` | Deklarative Definitionen (z. B. Tabellenspalten) |

### Namenskonventionen

| Element | Konvention | Beispiel |
|---------|------------|---------|
| Input-Name | camelCase, deskriptiv | `variant`, `disabled`, `closeOnBackdropClick` |
| Output-Name | camelCase, Vergangenheitsform, **kein** `on`-Prefix | `closed` (nicht `onClose`) |
| Selektor-Prefix | Konsistent in der Library | `af-` |
| Dateiname | kebab-case | `data-table.component.ts` |
| CSS-Klassen-Prefix | Konsistent im Design System | `ct-` |

### Generische Typisierung

Datengetriebene Komponenten MÜSSEN TypeScript-Generics für Typsicherheit verwenden:

```typescript
export class AfDataTableComponent<T extends Record<string, unknown>> {
  data = input<T[]>([]);
  columns = input<{ key: keyof T; header: string }[]>([]);
}
```

---

## 3. Barrierefreiheit (Accessibility)

### WCAG 2.2 Level AA ist Pflicht

WCAG 2.2 (Oktober 2023) ist der rechtliche Standard, referenziert durch ADA, Section 508 und den **European Accessibility Act (EAA)**, der seit Juni 2025 durchsetzbar ist. **Level AA ist das Minimum.**

### Relevante WCAG 2.2 Kriterien für Component Libraries

| Kriterium | Level | Auswirkung |
|-----------|-------|------------|
| 2.4.11 Focus Not Obscured (Minimum) | AA | Sticky-Header, Drawer und Modals DÜRFEN fokussierte Elemente nicht verdecken |
| 2.5.7 Dragging Movements | AA | Alle Drag-Operationen MÜSSEN eine Single-Pointer-Alternative haben |
| 2.5.8 Target Size (Minimum) | AA | Interaktive Ziele ≥ 24×24 CSS-Pixel |
| 3.3.7 Redundant Entry | A | Formulare DÜRFEN nicht nach bereits eingegebenen Informationen fragen |
| 3.3.8 Accessible Authentication | AA | Keine kognitiven Funktionstests zur Authentifizierung |

### WAI-ARIA Authoring Practices Guide (APG)

Jede interaktive Komponente MUSS dem entsprechenden **APG-Pattern** folgen:

| Komponente | APG-Pattern | Pflicht-ARIA |
|------------|-------------|--------------|
| Dialog / Modal | Dialog (Modal) | `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, Focus-Trap, Escape |
| Combobox / Autocomplete | Combobox | `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant` |
| Tabs | Tabs | `role="tablist/tab/tabpanel"`, `aria-selected`, Pfeiltasten, Home/End |
| Akkordeon | Accordion | `aria-expanded`, `aria-controls`, Pfeiltasten, Home/End |
| Menü | Menu | `role="menu/menuitem"`, `aria-haspopup`, Roving Tabindex |
| Dropdown / Listbox | Listbox | `role="listbox/option"`, `aria-selected`, `aria-activedescendant` |
| Tabelle | Table / Grid | `role="table/grid"`, `aria-sort`, `aria-rowcount`, `aria-colcount` |
| Toast / Notification | Alert | `role="alert"` oder `role="status"`, `aria-live` |

### Angular CDK a11y Utilities

State-of-the-Art Libraries nutzen `@angular/cdk/a11y`:

| Utility | Zweck |
|---------|-------|
| `cdkTrapFocus` | Focus-Trapping in Modals und Drawern |
| `LiveAnnouncer` | Screen-Reader-Ankündigungen für dynamische Inhalte |
| `FocusMonitor` | Erkennung des Focus-Ursprungs (Keyboard, Maus, Touch) |
| `ListKeyManager` | Keyboard-Navigation in Listen und Menüs |
| `ActiveDescendantKeyManager` | Keyboard-Navigation mit `aria-activedescendant` |

### Pflichtanforderungen pro Komponente

Jede Komponente MUSS:

- [ ] Korrekte ARIA-Rollen und -Attribute implementieren
- [ ] Keyboard-Navigation gemäß APG-Spezifikation unterstützen
- [ ] Focus-Management implementieren (Trapping für Overlays, Restauration beim Schließen)
- [ ] Screen-Reader-Ankündigungen für dynamische Zustandsänderungen bereitstellen
- [ ] Ausreichenden Farbkontrast gewährleisten (4.5:1 Text, 3:1 UI-Controls und Focus-Indikatoren)
- [ ] `aria-describedby` für Fehler-/Hinweismeldungen bei Formularfeldern verlinken
- [ ] `aria-invalid` für Fehlerzustände setzen
- [ ] Focus-Indikatoren mit ≥ 2px Rahmen und 3:1 Kontrast anzeigen

---

## 4. Theming & Design Tokens

### Drei-Schichten-Token-Architektur

| Schicht | Zweck | Beispiel |
|---------|-------|---------|
| **Primitive Tokens** | Rohe Werte | `--color-ocean-500: #2E7E96` |
| **Semantic Tokens** | Zweckgebunden | `--color-brand-primary: var(--color-ocean-500)` |
| **Component Tokens** | Komponentenspezifisch | `--ct-button-bg: var(--color-brand-primary)` |

### CSS Custom Properties für Anpassung

```css
.ct-button {
  background: var(--ct-button-bg, var(--color-brand-primary));
  color: var(--ct-button-text, var(--color-text-on-primary));
  border-radius: var(--ct-button-radius, var(--radius-md));
}
```

Konsumenten können auf jeder Ebene überschreiben, ohne Spezifitätskonflikte.

### Dark Mode & High Contrast

- `color-scheme: light dark` mit Semantic-Token-Overrides
- Theme-Dateien als separate CSS-Imports oder `data-theme`-Attribut
- High-Contrast-Theme für WCAG-Konformität

### CSS `@property` für typsichere Tokens

```css
@property --ct-progress-value {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}
```

---

## 5. Formular-Integration

### ControlValueAccessor (CVA)

Jede Formularkomponente MUSS `ControlValueAccessor` implementieren:

```typescript
export class AfSelectComponent implements ControlValueAccessor {
  disabled = model(false);

  writeValue(value: unknown): void { /* ... */ }
  registerOnChange(fn: (value: unknown) => void): void { /* ... */ }
  registerOnTouched(fn: () => void): void { /* ... */ }
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}

// Provider-Registrierung
providers: [{
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AfSelectComponent),
  multi: true,
}]
```

### Custom Validation

Komplexe Formularkomponenten KÖNNEN `Validator` implementieren:

```typescript
providers: [{
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => AfDatepickerComponent),
  multi: true,
}]
```

### Fehler- und Zustandsverwaltung

- `error`-Input für externe Fehlermeldungen
- `aria-invalid` und `aria-describedby`-Verknüpfung zu Fehlertext
- Unterstützung für Template-driven (`ngModel`) und Reactive Forms (`formControl`)
- `compareWith`-Input für Objekt-Wertvergleiche
- Disabled-State über `setDisabledState` synchronisieren

---

## 6. Performance

### Zoneless Change Detection (Angular 21 Standard)

- Angular 21 hat `zone.js` als Standard entfernt
- Alle Komponenten MÜSSEN `ChangeDetectionStrategy.OnPush` verwenden
- Alle Zustandsänderungen MÜSSEN über Signals oder `ChangeDetectorRef.markForCheck()` erfolgen
- Vorteil: ~33 KB Bundle-Einsparung, 30–40 % Rendering-Verbesserung

### Signal-basierte Reaktivität

| Pattern | Verwendung |
|---------|------------|
| `computed()` | Abgeleiteter Zustand (CSS-Klassen, Sichtbarkeit, gefilterte Daten) |
| `effect()` | **Nur** für Seiteneffekte, die nicht als `computed` ausdrückbar sind |
| `linkedSignal()` | Abhängiger, überschreibbarer Zustand |
| `toSignal()` | Brücke von RxJS-Observables zu Signals |

**Verboten:**
- Keine `subscribe()`-Aufrufe in Komponenten
- Kein `effect()` für Zustandssynchronisation — stattdessen `linkedSignal()`
- Kein `mutate()` — stattdessen `update()` oder `set()`

### Bundle-Optimierung

- Secondary Entrypoints für selektiven Import
- `"sideEffects": false` in `package.json`
- Keine großen Third-Party-Dependencies auf Library-Ebene
- `@defer`-Blöcke in Konsumenten-Apps für Lazy Loading schwerer Komponenten

---

## 7. Testing

### Mehrschichtige Teststrategie

#### Unit Tests (Vitest + TestBed)

- Jede Komponente isoliert mit `TestBed` und `ComponentFixture` testen
- Test-Host-Komponenten für realistische Input/Output-Szenarien
- Abdeckung: Rendering, CSS-Klassen-Berechnung, ARIA-Attribute, Keyboard-Navigation, CVA-Integration, Disabled-States, Randfälle

#### Component Test Harnesses (`@angular/cdk/testing`)

State-of-the-Art Libraries liefern `ComponentHarness`-Klassen **mit der Library aus**:

```typescript
export class AfButtonHarness extends ComponentHarness {
  static hostSelector = 'af-button';

  async click(): Promise<void> {
    return (await this.host()).click();
  }

  async getText(): Promise<string> {
    return (await this.host()).text();
  }

  async isDisabled(): Promise<boolean> {
    const host = await this.host();
    return (await host.getAttribute('aria-disabled')) === 'true';
  }
}
```

Harnesses abstrahieren DOM-Interaktionen hinter einer semantischen API und funktionieren in Unit- und E2E-Tests gleichermaßen.

#### Accessibility-Tests (axe-core)

- `@axe-core/playwright` in E2E-Tests integrieren
- axe-Checks auf jeden Komponentenzustand ausführen (offen, geschlossen, Fehler, disabled, fokussiert)
- Automatisierte WCAG-Prüfung fängt ~50 % der Probleme ab
- In CI/CD-Pipeline für jeden Pull Request integrieren

#### Visual Regression Tests

- Playwright Screenshot-Vergleich oder Tools wie Chromatic/Percy
- Komponentenzustände erfassen: Default, Hover, Focus, Active, Disabled, Error, Loading
- Baseline-Vergleich erkennt unbeabsichtigte visuelle Änderungen

#### E2E-Tests (Playwright)

- Komplexe Interaktionsmuster testen (Drag-and-Drop, Combobox, Modal Focus-Trap)
- Echtes Browser-Verhalten, das Unit Tests nicht simulieren können

### Testabdeckungsziele

- 100 % Abdeckung aller ARIA-Attribut-Anwendungen
- 100 % Abdeckung aller Keyboard-Navigationspfade
- Alle CVA-Methoden mit Reactive Forms getestet
- Jede Variante/Größe/Zustand-Kombination verifiziert

---

## 8. Dokumentation

### Storybook (Industriestandard)

- `@storybook/angular` mit Compodoc-Integration für automatisch generierte API-Docs
- Stories für jede Variante, Größe und Zustand
- Interaktive Controls für Live-Manipulation
- Accessibility-Addon für inline axe-Checks

### Dokumentationsstruktur pro Komponente

Jede Komponente MUSS dokumentieren:

1. **Überblick** — Zweck und wann zu verwenden
2. **API-Referenz** — Alle Inputs, Outputs, Content-Projection-Slots (auto-generiert)
3. **Verwendungsbeispiele** — Basis, mit Formular, mit Custom Templates
4. **Barrierefreiheit** — Tastenkürzel, ARIA-Verhalten, Screen-Reader-Erlebnis
5. **Design-Richtlinien** — Variantenwahl, Größen, Do's und Don'ts

### JSDoc für Public API

Jede öffentliche Klasse, jeder Input und Output MUSS mit JSDoc dokumentiert sein:

```typescript
/**
 * Combobox mit Keyboard-Navigation und Screen-Reader-Unterstützung.
 * Implementiert das WAI-ARIA Combobox Pattern mit List Autocomplete.
 *
 * @example
 * <af-combobox
 *   label="Land"
 *   [options]="countries"
 *   [(ngModel)]="selected"
 *   hint="Eingabe zum Suchen starten"
 * />
 */
```

---

## 9. Internationalisierung (i18n)

### RTL-Unterstützung

- **CSS Logical Properties** verwenden: `margin-inline-start` statt `margin-left`
- `dir="rtl"`-Attribut respektieren
- Alle Komponenten in LTR und RTL testen

### Übersetzbarer Text

Libraries bündeln **keine** Übersetzungen. Stattdessen:

```typescript
export interface AfI18nStrings {
  noResults: string;
  close: string;
  loading: string;
  // ...
}

export const AF_I18N = new InjectionToken<AfI18nStrings>('AF_I18N', {
  factory: () => ({
    noResults: 'No results found',
    close: 'Close',
    loading: 'Loading...',
  }),
});
```

Konsumenten überschreiben über DI:

```typescript
providers: [{ provide: AF_I18N, useValue: { noResults: 'Keine Ergebnisse', /* ... */ } }]
```

### Locale-Aware Formatting

- Datums-, Zahlen- und Währungsformatierung über `Intl`-APIs
- Locale-String oder `Intl.DateTimeFormatOptions` als Inputs akzeptieren

---

## 10. Developer Experience (DX)

### Schematics

| Schematic | Zweck |
|-----------|-------|
| `ng add` | Automatische Installation, CSS-Imports hinzufügen, Theming konfigurieren |
| `ng generate` | Komponentennutzungsmuster scaffolden |
| `ng update` | Migrations-Schematics für Breaking Changes (AST-Transformation) |

```json
{
  "schematics": "./schematics/collection.json",
  "ng-update": {
    "migrations": "./schematics/migrations.json"
  }
}
```

### TypeScript-Strenge

- `strict: true` in der gesamten Library
- Alle Interfaces, Types und Enums exportieren, die Konsumenten brauchen
- Union-Types für Varianten: `'primary' | 'secondary' | 'ghost'`
- Keine `any`-Types — `unknown` wenn Typ unsicher

### IDE-Unterstützung

- Alles über `public-api.ts` exportieren für Auto-Import
- JSDoc auf allen öffentlichen APIs für Inline-Dokumentation
- `strictTemplates: true` für typsichere Template-Prüfung

---

## 11. Versionierung & Release

### Semantic Versioning (SemVer)

| Version | Wann |
|---------|------|
| **Patch** (0.4.x) | Bugfixes, keine API-Änderungen |
| **Minor** (0.x.0) | Neue Features, abwärtskompatibel |
| **Major** (x.0.0) | Breaking Changes |

### Deprecation Policy

- Deprecate **vor** dem Entfernen
- Deprecated APIs mindestens **eine Major-Version** beibehalten
- `@deprecated`-JSDoc-Tag verwenden
- Migrations-Schematics für Breaking Changes bereitstellen

### Changelog

- `CHANGELOG.md` mit jeder Release aktualisieren
- Kategorien: Added, Changed, Fixed, Deprecated, Removed, Breaking Changes

---

## 12. Checkliste: Angular Wrapper Component

Diese Checkliste definiert, was **jede einzelne Angular Wrapper Component** erfüllen MUSS, um State of the Art zu sein.

### Grundstruktur

- [ ] Standalone Component (kein `standalone: true` setzen — ist Angular 21+ Default)
- [ ] `ChangeDetectionStrategy.OnPush`
- [ ] Signal-basierte Inputs via `input()` / `input.required()`
- [ ] Signal-basierte Outputs via `output()`
- [ ] `computed()` für abgeleiteten Zustand (CSS-Klassen, etc.)
- [ ] Host Bindings im `host`-Objekt des Decorators (keine `@HostBinding`/`@HostListener`)
- [ ] `inject()` statt Constructor Injection

### Barrierefreiheit

- [ ] WAI-ARIA APG Pattern implementiert (wenn interaktiv)
- [ ] Korrekte ARIA-Rollen und -Attribute
- [ ] Vollständige Keyboard-Navigation
- [ ] Focus-Management (Trapping, Restauration)
- [ ] Screen-Reader-kompatibel (Live Regions für dynamische Änderungen)
- [ ] Farbkontrast ≥ 4.5:1 (Text) / ≥ 3:1 (UI-Controls, Focus)
- [ ] Target Size ≥ 24×24 CSS-Pixel
- [ ] Focus-Indikator ≥ 2px, ≥ 3:1 Kontrast
- [ ] `aria-describedby` für Fehler/Hints (bei Formularkomponenten)
- [ ] `aria-invalid` für Fehlerzustände (bei Formularkomponenten)

### Formular-Integration (wenn Formularkomponente)

- [ ] `ControlValueAccessor` implementiert
- [ ] `NG_VALUE_ACCESSOR` Provider registriert
- [ ] `writeValue`, `registerOnChange`, `registerOnTouched`, `setDisabledState` implementiert
- [ ] Funktioniert mit `ngModel` und `formControl`
- [ ] `compareWith`-Input (bei Objekt-Werten)
- [ ] Error-State und Validation-Support

### Theming

- [ ] CSS-Klassen über Design System Tokens (`ct-`-Prefix)
- [ ] Component Tokens als CSS Custom Properties
- [ ] Dark Mode unterstützt
- [ ] High Contrast unterstützt

### Testing

- [ ] Unit Tests mit TestBed und Test-Host-Komponenten
- [ ] ARIA-Attribute in Tests verifiziert
- [ ] Keyboard-Navigation in Tests verifiziert
- [ ] CVA-Integration mit Reactive Forms getestet (wenn Formularkomponente)
- [ ] Alle Varianten/Zustände abgedeckt
- [ ] Component Test Harness bereitgestellt
- [ ] axe-core Accessibility-Test bestanden

### Dokumentation

- [ ] JSDoc auf der Klasse und allen öffentlichen Inputs/Outputs
- [ ] Storybook Story mit interaktiven Controls
- [ ] Verwendungsbeispiele (Basis, Formular, Templates)
- [ ] Barrierefreiheitshinweise dokumentiert

### Internationalisierung

- [ ] CSS Logical Properties (kein `margin-left`, etc.)
- [ ] RTL-Layout getestet
- [ ] Hardcodierte Strings über `InjectionToken` konfigurierbar

---

## Referenzen

- [Angular Package Format](https://angular.dev/tools/libraries/angular-package-format)
- [ng-packagr Secondary Entrypoints](https://github.com/ng-packagr/ng-packagr/blob/main/docs/secondary-entrypoints.md)
- [WCAG 2.2 Specification](https://www.w3.org/TR/WCAG22/)
- [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/patterns/)
- [Angular CDK a11y](https://material.angular.dev/cdk/a11y/overview)
- [Angular Component Harnesses](https://angular.dev/guide/testing/component-harnesses-overview)
- [Storybook for Angular](https://storybook.js.org/docs/get-started/frameworks/angular)
- [European Accessibility Act (EAA)](https://ec.europa.eu/social/main.jsp?catId=1202)
- [Angular Signals](https://angular.dev/guide/signals)
- [Semantic Versioning 2.0.0](https://semver.org/)
- [Angular Style Guide](https://angular.dev/style-guide)
