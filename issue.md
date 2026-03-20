# Design System CSS nicht angebunden — UI komplett ungestylt

## Problem

Die Demo-App ("Construct PM") rendert ohne jegliche Component-Styles. Buttons, Toolbar, Sidebar, Tabellen, Modals, Badges usw. erscheinen als rohes, ungestyltes HTML.

### Ursache

Die CSS-Integration ist auf **zwei Ebenen** kaputt:

### 1. CSS-Klassen-Prefix-Mismatch

Die Angular-Komponenten (`projects/angular/`) verwenden durchgängig den **`ct-`** Prefix (Construct Design System), z.B.:

```
ct-button, ct-toolbar, ct-sidebar, ct-modal, ct-table, ct-badge, ct-tabs, ...
```

Die lokal kopierten CSS-Dateien unter `projects/demo/src/assets/css/components.css` definieren jedoch alle Selektoren mit dem **`af-`** Prefix:

```
.af-button, .af-toolbar, .af-sidebar, .af-modal, .af-table, .af-badge, .af-tabs, ...
```

**Kein einziger CSS-Selektor greift**, weil die Klassennamen im DOM (`ct-*`) nicht mit den CSS-Selektoren (`.af-*`) übereinstimmen.

### 2. Fehlende Component-Styles

Selbst wenn der Prefix stimmen würde, fehlen in der lokalen `components.css` die Styles für mehrere Komponenten komplett:

- Toolbar (`ct-toolbar`, `ct-toolbar__brand`, `ct-toolbar__actions`, ...)
- Sidebar (`ct-sidebar`, `ct-sidebar-layout`, `ct-nav-list`, `ct-nav-item`, ...)
- Badge (`ct-badge`, `ct-badge--info`, `ct-badge--success`, ...)
- Accordion, Avatar, Alert, Progress, ...

Das Design System unter `@neuravision/construct` enthält **25+ Component-CSS-Dateien** — die lokale Kopie deckt nur einen Bruchteil davon ab.

### 3. Root Cause: Manuell kopierte und umbenannte CSS-Dateien

Die Design-System-CSS wurde **manuell** aus `@neuravision/construct` nach `projects/demo/src/assets/css/` kopiert und dabei der Prefix von `ct-` auf `af-` geändert. Dieses Vorgehen hat:

- den Prefix-Mismatch erzeugt
- Komponenten beim Kopieren ausgelassen
- eine zweite, veraltete "Wahrheit" für die Styles geschaffen

### Betroffene Dateien

| Datei | Problem |
|-------|---------|
| `projects/demo/src/assets/css/components.css` | Falscher `af-` Prefix, fehlende Komponenten |
| `projects/demo/src/assets/css/foundations.css` | Falscher `af-` Prefix bei Utility-Klassen |
| `projects/demo/src/assets/css/tokens.css` | Redundante Kopie der Design Tokens |
| `projects/demo/src/styles.css` | Importiert die lokalen Kopien statt das Package |
| `angular.json` (demo styles) | Kein Verweis auf `@neuravision/construct` |

---

## Lösung: Direct Package Import (Single Source of Truth)

### Prinzip

Die Design-System-CSS wird **direkt aus dem `@neuravision/construct` Package** importiert — keine lokalen Kopien, kein manuelles Umbenennen, keine Lücken.

```
@neuravision/construct (ct-* prefix)
        ↓ direkt importiert
angular.json styles array
        ↓
Angular Komponenten (ct-* prefix)  ✓ Match
```

### Schritt 1: `angular.json` — Design System CSS als globale Styles einbinden

```json
"styles": [
  "@neuravision/construct/tokens/tokens.css",
  "@neuravision/construct/foundations.css",
  "@neuravision/construct/components/components.css",
  "projects/demo/src/styles.css"
]
```

Angular CLI resolved Package-Pfade automatisch über `node_modules`. Die drei Imports laden:

- **tokens.css** — alle CSS Custom Properties (Farben, Spacing, Typography, Shadows, ...)
- **foundations.css** — Reset, Typografie-Basis, Layout-Utilities (`.ct-container`, `.ct-grid`, `.ct-stack`, ...)
- **components.css** — alle 25+ Component-Styles (`.ct-button`, `.ct-toolbar`, `.ct-sidebar`, ...)

### Schritt 2: `styles.css` — auf App-spezifische Overrides reduzieren

Die lokalen Design-System-Imports entfernen. `styles.css` enthält danach **nur noch app-eigene Styles**:

```css
/* App-specific overrides and additions only.
   Design system CSS is loaded via angular.json styles array. */
```

### Schritt 3: Lokale CSS-Kopien entfernen

Folgende Dateien löschen, da sie durch die Package-Imports ersetzt werden:

- `projects/demo/src/assets/css/tokens.css`
- `projects/demo/src/assets/css/foundations.css`
- `projects/demo/src/assets/css/components.css`

### Schritt 4: Utility-Klassen in Templates prüfen

Falls in Demo-App-Templates Utility-Klassen mit `af-` Prefix direkt verwendet werden (z.B. `af-card`, `af-grid`, `af-sr-only`), müssen diese auf den `ct-` Prefix des Design Systems angepasst werden (`ct-card`, `ct-grid`, `ct-sr-only`).

### Ergebnis

| Kriterium | Vorher (kopierte Dateien) | Nachher (Package Import) |
|-----------|--------------------------|-------------------------|
| Single Source of Truth | Nein — 2 Kopien, 2 Prefixes | Ja — Design System Package |
| Vollständigkeit | Fehlende Komponenten | Alle 25+ Komponenten |
| Prefix-Konsistenz | `af-` vs `ct-` Mismatch | Durchgängig `ct-` |
| Wartbarkeit | Manuelles Nachziehen | Updates propagieren automatisch |
| DRY | Verletzt | Eingehalten |
