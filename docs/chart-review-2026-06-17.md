# Adversarial Review — Chart-Komponenten (ng-construct `b0bcd0a` + design `ab6e760`)

**Reviewer:** unabhängig, adversarial · **Datum:** 2026-06-17
**Verifiziert:** `npx ng test angular` → **1160 Specs grün** (30 Files; davon Chart: line 17, bar 27, donut 18, sparkline 10, gauge 21 = **93**) · `build:angular` ✅ (strictTemplates) · `build:demo` ✅ · `design npm run check` ✅ · Kontrast & Geometrie eigenständig nachgerechnet.

---

## 1. Zusammenfassung

**Gesamturteil:** Ein technisch starkes, SSR-sauberes, signal-only Fundament mit gründlichen Harnesses/Specs — die grüne 93-Spec-Suite hat aber **Abdeckungslücken exakt an den Defektstellen** (all-negative Balken, out-of-range `aria-valuenow`, `strokeWidth ≠ 14`), plus eine WCAG-Lücke beim Focus-Ring des Toggles.

| Komponente | Bug/Korrektheit | A11y (WCAG 2.2 AA) | SOTA (§12) | Clean Code |
|---|---|---|---|---|
| `chart-geometry.ts` | ✅ | — | ✅ | ✅ |
| `chart/` Fundament | ✅ | ✅ | ✅ | ✅ |
| line-chart | ✅ | ✅ | ✅ | ✅ |
| **bar-chart** | ❌ **all-negative** | ✅ | ✅ | ⚠️ tote `<g>`/CSS |
| donut-chart | ✅ | ✅ | ✅ | ✅ |
| sparkline | ⚠️ Typ/`null` | ✅ | ✅ | ⚠️ |
| **gauge** | ⚠️ `strokeWidth` wirkungslos | ⚠️ **`aria-valuenow`** | ✅ | ⚠️ |
| `chart.css` (Toggle) | — | ⚠️ **Focus-Ring < 3:1** | — | ⚠️ tote Klassen |

Legende: ✅ sauber · ⚠️ Mangel/Einschränkung · ❌ bestätigter Defekt.

---

## 2. Befunde (nach Schweregrad)

### 🔴 High

#### H1 — Balken-Wertachse schließt 0 nicht ein → all-negative & negative Stacks laufen aus dem Chart
- **Severity:** High · **Dimension:** Bug
- **Ort:** `projects/angular/src/lib/components/bar-chart/bar-chart.component.ts:410-411` (`valueScale`); Auswirkung verstärkt durch `design/components/chart.css:46-51` (`.ct-chart__svg { overflow: visible }`).
- **Beweis (reproduziert, exakte Zahlen via Original-`niceScale`/`scaleLinear`):**
  - `rawMin = Math.min(0, dataMin)` schließt 0 ein, **aber `rawMax = … : dataMax` nicht.** Für **all-negative** Reihen (Default-Layout `grouped`) bleibt 0 außerhalb der Domäne.
  - Input `[{ name:'Net', values:[-5,-10,-3] }]` → Domäne `[-10,-2]`, **`zeroPx = -48`**, Plotbereich `y ∈ [12,252]`. Die Balken werden ab `zeroPx=-48` gezeichnet — d. h. ab **60 px oberhalb der viewBox-Oberkante**. Wegen `overflow: visible` werden sie **nicht geclippt, sondern überlagern Toolbar/Legende**.
  - **Stacked-Sonderfall (zweite Ausprägung, gleiche Wurzel):** `maxStackTotal` summiert nur **positive** Werte; es gibt **kein** `minNegStackTotal`. `rawMin` nutzt den kleinsten *Einzelwert* `dataMin`, nicht das kleinste *Stack-Total*. Input zwei Reihen `[-5]` + `[-10]`, eine Kategorie, `layout="stacked"`: Stack reicht bis **−15**, Domäne-Min ist aber **−10** → `valueScale(-15) = 372` (Plot-Boden = 252) ⇒ Balken läuft 120 px **unten** heraus.
  - Kontrolle (gemischt): `[10,-10]` → `zeroPx = 132` ∈ `[12,252]` ✅ — funktioniert, deshalb fällt es in den Specs nicht auf (`bar-chart.component.spec.ts:75` testet nur gemischt).
- **Fix (zwei Teile, eine Wurzel):**
  ```ts
  // grouped: Domäne-Max muss 0 einschließen
  const rawMax = this.valueMax() ?? Math.max(0, stacked ? maxStackTotal : dataMax);
  // stacked: Domäne-Min muss das kleinste NEGATIVE Stack-Total einschließen
  let minNegStackTotal = 0;
  if (stacked) {
    for (let i = 0; i < categoryCount; i++) {
      let neg = 0;
      for (const s of series) { const v = s.values[i]; if (v != null && v < 0) neg += v; }
      if (neg < minNegStackTotal) minNegStackTotal = neg;
    }
  }
  const rawMin = Math.min(0, stacked ? minNegStackTotal : dataMin);
  ```
  Nur `Math.max(0, dataMax)` allein behebt den Stacked-Fall **nicht**.

---

### 🟠 Medium

#### M1 — Gauge: `aria-valuenow` wird nicht auf `[min,max]` geklemmt (ARIA-`meter`-Verstoß)
- **Severity:** Medium · **Dimension:** A11y
- **Ort:** `projects/angular/src/lib/components/gauge/gauge.component.ts:87`
- **Beweis:** Template bindet **roh**: `[attr.aria-valuenow]="isEmpty() ? null : value()"`. Nur die *Zeichnung* klemmt (`fraction = clamp(...)`, Z. 206). Bei `value=150, min=0, max=100` ist `aria-valuenow="150" > aria-valuemax="100"` — die ARIA-Spez verlangt `valuenow ∈ [min,max]` für `meter`/`progressbar`. Der Spec-Test `gauge.component.spec.ts:93-105` prüft **nur das gezeichnete Pfad-`d`**, nie `aria-valuenow`; der AXE-Test läuft nur mit dem In-Range-Default (82). **axe-core hat keine Regel für `valuenow > valuemax` auf `meter`** — selbst ein Out-of-Range-Test im aktuellen Setup würde es nicht fangen. Genuine manuell-only-Lücke.
- **Fix:** `aria-valuenow` klemmen, `aria-valuetext` aber **wahrheitsgemäß** lassen (SR soll „150 %" weiterhin ansagen):
  ```ts
  protected readonly clampedValue = computed(() => clamp(this.value(), this.min(), this.max()));
  // template: [attr.aria-valuenow]="isEmpty() ? null : clampedValue()"
  ```

#### M2 — Gauge: `strokeWidth`-Input ist visuell wirkungslos (CSS überschreibt Präsentationsattribut)
- **Severity:** Medium · **Dimension:** Bug/Clean Code
- **Ort:** `design/components/chart.css:151-164` vs. `gauge.component.ts:103,108,161,204`
- **Beweis:** Komponente setzt `[attr.stroke-width]="strokeWidth()"`, aber CSS deklariert `.ct-chart__gauge-track / .ct-chart__gauge-value { stroke-width: var(--ct-chart-gauge-width, 14px) }`. Eine Klassen-Regel hat in der CSS-Kaskade **immer** Vorrang vor einem Präsentationsattribut → die gerenderte Strichstärke bleibt **fix 14 px**. Schlimmer: `radius` (Z. 204) rechnet *mit* `strokeWidth()`, die Zeichnung nicht → bei `strokeWidth ≠ 14` **desynchronisieren Geometrie und Strich**. Der Spec-Test `gauge.component.spec.ts:123-127` prüft nur das *Attribut* (=14, Default) und übersieht das. Die Story `gauge.stories.ts:24,32` bietet einen `strokeWidth`-Slider (4–40) an — ein **kaputtes Control**.
- **Fix:** Input über die CSS-Variable führen, statt (oder zusätzlich zum) Attribut:
  ```ts
  // host/style: [style.--ct-chart-gauge-width.px]="strokeWidth()"
  ```
  Dann steuert `strokeWidth` Strich *und* Radius konsistent.

#### M3 — Toggle-Button: Focus-Indikator < 3:1 in Light- und High-Contrast-Theme
- **Severity:** Medium · **Dimension:** A11y (WCAG 2.2 AA · SC 1.4.11; §12 „Focus-Indikator ≥ 2px, ≥ 3:1")
- **Ort:** `design/components/chart.css:310-313` (`.ct-chart__toggle:focus-visible`, neu in diesem Commit)
- **Beweis (Kontrast selbst gerechnet; `outline-offset: 2px` ⇒ Ring liegt auf dem Canvas/Surface-Hintergrund):**
  | Theme | `--color-focus-ring` | vs canvas | vs surface |
  |---|---|---|---|
  | Light | teal-400 `#35B2AA` | **2.59 ❌** | **2.42 ❌** |
  | High-Contrast | amber-400 `#FF9E1A` | **2.07 ❌** | 1.93 ❌ (muted) |
  | Dark | teal-300 `#63C7C1` | 9.01 ✅ | 6.09 ✅ |
- **Einordnung:** Wurzel ist das **geteilte `--color-focus-ring`-Token**, nicht Chart-Logik — betrifft daher **sehr wahrscheinlich alle fokussierbaren Komponenten** der Library, nicht nur das Chart-Toggle (der Chart-Commit fügt nur den neuen `:focus-visible`-Stil hinzu, der das Problem erbt). AXE fängt es nicht (Kontrast in jsdom deaktiviert).
- **Fix:** Auf **Token-Ebene** beheben (Nutzen für die ganze DS): `--color-focus-ring` in Light/HC auf einen Wert mit ≥ 3:1 gegen Canvas anheben (z. B. Light → `teal-600 #167B76` = 5.09:1). Alternativ ein 2-Farben-/Doppel-Ring-Indikator am Toggle.

---

### 🟡 Low

#### L1 — Dark-Serie 5 (pink-300) 2.87:1 gegen `bg-elevated`
- **Dimension:** A11y · **Ort:** `tokens/semantic.dark.json` (`chartSeries.5` = `ocean…`/`pink-300 #DD6F92`)
- **Beweis:** Der geforderte Maßstab (**Canvas + Surface**) ist in **allen drei Themes erfüllt** (Min: pink-300 vs dark-surface = 3.93). Nur gegen das *dritte*, hellere `bg-elevated #364C5F` fällt pink-300 auf **2.87** (series-4 purple 3.05, series-7 red 3.11 grenzwertig). Relevant, wenn ein Chart in Dark-Mode auf einer **elevated Card** sitzt (üblich im Dashboard). Light & High-Contrast durchweg ≥ 3.6.
- **Fix (optional):** pink-300/purple-300/red-300 im Dark-Theme leicht aufhellen, bis ≥ 3:1 gegen `bg-elevated`.

#### L2 — `forced-colors`: Mehr-Serien-**Linien** verlieren Farbunterscheidung
- **Dimension:** A11y · **Ort:** `design/components/chart.css:339-343`
- **Beweis:** In `forced-colors: active` werden `.ct-chart__line` und `.ct-chart__gauge-value` auf `CanvasText` gesetzt → bei Multi-Serien-Linien sind **alle Linien identisch**, während die Legend-Marker via `forced-color-adjust: none` ihre Farben behalten (Inkonsistenz). Balken/Slices behalten korrekt ihre Farben. Datentabelle mildert.
- **Fix:** `.ct-chart__line { forced-color-adjust: none }` (Daten-Viz ist die kanonische Ausnahme, in der Farbe Bedeutung trägt) — analog zu Bars/Slices.

#### L3 — Sparkline: `values: number[]` typt `null` weg, behandelt es aber zur Laufzeit
- **Dimension:** Clean Code/SOTA · **Ort:** `sparkline.component.ts:113,131-134,193`
- **Beweis:** Input ist `number[]`, doch `numericValues` filtert `null`/`NaN` und die Tabelle rendert `—` für `null`. Entweder ist die Defensive tot, oder der Typ ist falsch — inkonsistent mit `AfChartSeries.values: (number|null)[]`. Folge: Lücken stauchen das X-Raster (Positionen kollabieren) und „latest" = letzter **Nicht**-Null-Wert.
- **Fix:** Typ auf `(number|null)[]` weiten (konsistent mit line/bar) oder Null-Handling entfernen.

### ⚪ Nits
- **N1 — tote CSS:** `.ct-chart__series--1…8` (`chart.css:54-61`) wird von **keiner** der 5 Komponenten genutzt — sie binden `[style.color]` direkt mit dem Token. Auch `.ct-chart__dot--hollow`, `.ct-chart__axis-title` sind ungenutzt. Der CSS-Kommentar (Z. 9-12) beschreibt einen `.ct-chart__series--N`-Mechanismus, der nicht zur Umsetzung passt. *DRY/Doku-Drift.*
- **N2 — `<g>`-Wrapper:** `.ct-chart__value-ticks` / `.ct-chart__category-labels` (`bar-chart.component.ts:154,180`) tragen **keine** CSS-Regel (in `chart.css` verifiziert) — reine Harness-Query-Hooks. Vertretbar; `data-*`-Attribute würden „nicht zum Stylen" klarer signalisieren.
- **N3 — `track`-Kollision:** line `track s.name`, donut `track slice.label` → bei doppelten Namen/Labels Render-Glitch; `track $index`/stabile ID wäre robuster.
- **N4 — latent:** `niceScale(maxTicks=NaN)` → `NaN`-Ticks (`chart-geometry.ts:61`, `Math.max(2, NaN)=NaN`). Nicht erreichbar (immer Literal `5`), aber unbewacht.

---

## 3. Was gut ist (knapp, belegt)
- **SSR-sauber:** grep über alle 5 Komponenten + Geometrie → **kein** `window`/`document`/`Date`/`Math.random`/DOM-Messung (nur in Doc-Kommentaren erwähnt). `formatNumber` nutzt `Intl` mit `try/catch`-Fallback.
- **Signal-Disziplin:** ausschließlich `input()/output()/computed()/signal()`; **kein** `effect()` für State, kein `subscribe`, kein `mutate`. Toggle-State sauber via `tableOverride`-Signal + `computed`.
- **`niceScale` robust:** entartete Eingaben (min==max, invertiert, 0, all-zero) durchgespielt — symmetrisches Padding, `step > 0` garantiert, **keine Endlosschleife**.
- **Donut:** Farbzuordnung per **Original-Index** stabil (Slices & Legende divergieren nie); Null-Slices raus aus Ring, drin in Legende+Tabelle (Spec `donut…:57` belegt). Voll-Kreis korrekt in zwei Hälften gesplittet.
- **Gauge:** `meter`-Pattern grundsätzlich korrekt (SVG `aria-hidden`, `valuetext` gespiegelt), 359.999°-Ring-Cap vermeidet Null-Länge-Arc, `large-arc`-Flag bei Sweep > 180° korrekt.
- **Harnesses & i18n:** pro Komponente eine dokumentierte Harness; `AF_CHART_I18N` via `InjectionToken` mit EN-Defaults, in jeder Spec mit DE überschrieben getestet. CSS durchgängig **Logical Properties**.

---

## 4. Checklisten-Abdeckung (§12)

**Erfüllt:** Standalone (kein `standalone:true`), `OnPush`, Signal-`input()/output()`, `computed()`, Host-Bindings im `host`-Objekt (kein `@HostBinding/@HostListener`), `inject()`, keine `any`, Union-Types (`AfBarLayout`, `AfChartStatus`, `'ring'|'semi'`), Generics-Bedarf gering & sinnvoll, **strictTemplates baut**, JSDoc auf Klasse + Inputs/Outputs, **Harness je Komponente**, i18n via `InjectionToken`, CSS Logical Properties, Public-API-Export (5 Komponenten + 5 Harnesses + Fundament in `dist/angular/**/*.d.ts` verifiziert), Theming via `ct-`-Tokens inkl. Dark/HC.

**Teilweise / offen:**
- **A11y-Farbkontrast** (§12 „≥ 3:1"): Serien-Palette erfüllt — **Focus-Ring nicht** (M3). Teilweise.
- **`aria-valuenow`-Korrektheit** (Gauge): out-of-range verletzt ARIA (M1). Offen.
- **Target Size ≥ 24px:** `.ct-chart__toggle { min-block-size: 24px }` trifft den Floor **exakt** (Breite via Padding klar darüber). ✅ erfüllt (knapp).
- **Storybook** (§8): im Workspace **nicht installiert** → Stories werden hier nicht gebaut. Statisch geprüft: alle `args` referenzieren **echte** Inputs (z. B. `gauge.stories.ts:14-27`), `argTypes` plausibel. Der `strokeWidth`-Slider ist jedoch faktisch wirkungslos (M2).
- **Schematics / `ng add`** (§10): nicht vorhanden (gilt library-weit, nicht chart-spezifisch).

---

## 5. Verifikations-Log (tatsächlich gesehen)
```
npx ng test angular        → 30 files, 1160 tests PASSED (5.14 s)
                              chart specs: line 17, bar 27, donut 18, sparkline 10, gauge 21 = 93
npm run build:angular      → exit 0 (ng-packagr, 3011 ms; strictTemplates OK)
npm run build:demo         → exit 0 (nur vorbestehende Bundle-Budget-Warnung, chart-unabhängig)
                              styles-*.css bundle enthält `ct-chart__svg` + `color-chart-series` ✅
design: npm run check      → exit 0 (Token-Outputs aktuell)
SSR-grep                   → keine window/document/Date/Math.random/effect/subscribe/mutate/any
dist d.ts                  → AfLine/Bar/Donut/Sparkline/Gauge*Component + *Harness + AfChartDataTable
                              + AF_CHART_I18N + AfChartSeries/Datum/TableModel/I18n exportiert ✅
Kontrast (eigene Rechnung) → Serien: Light/HC ≥ 3.6 überall; Dark ≥ 3.93 vs canvas/surface,
                              nur pink-300 = 2.87 vs elevated. Focus-Ring: Light 2.59 / HC 2.07 ❌
Geometrie-Repro            → all-negative bar zeroPx=-48 (Plot [12,252]); stacked -15 → y=372 (Boden 252)
```

**Bestätigte Defekte:** H1 (bar all-negative/stacked), M1 (gauge valuenow), M2 (gauge strokeWidth), M3 (focus-ring contrast).
**Stil/Meinung:** L1–L3, N1–N4.
