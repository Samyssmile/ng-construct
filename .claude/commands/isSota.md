Prüfe die Angular Wrapper Component **$ARGUMENTS** aus `projects/angular/src/lib/components/` gegen die Richtlinien aus `docs/component-library-standards-2026.md`.

## Ablauf

1. Lies die vollständige Richtlinie aus `docs/component-library-standards-2026.md`
2. Lies alle Dateien der Komponente aus `projects/angular/src/lib/components/$ARGUMENTS/` (`.ts`, `.html`, `.spec.ts`, etc.)
3. Lies die zugehörigen CSS/Construct-Dateien aus `/home/caedmon/work/accessful/frontend/design` (z.B. `components/$ARGUMENTS/`, relevante Token-Dateien), um den aktuellen Stand des Design Systems für diese Komponente zu verstehen
4. Prüfe die Komponente Punkt für Punkt gegen **Abschnitt 12 — Checkliste: Angular Wrapper Component** aus der Richtlinie

## ⛔ Construct-Blocker-Regel

Während der Prüfung musst du bei **jedem Kriterium** bewerten, ob die SOTA-Umsetzung im Angular Wrapper **allein** möglich ist oder ob dafür eine Änderung im Construct Design System (`/home/caedmon/work/accessful/frontend/design`) notwendig wäre.

**Wenn eine Construct-Änderung notwendig ist:**

1. **SOFORT unterbrechen** — den Audit nicht weiter fortsetzen
2. Einen **Construct-Blocker-Report** ausgeben (Format siehe unten)
3. **Keine Workarounds vorschlagen** — das Ziel ist, den Construct Design System selbst besser zu machen, nicht ihn im Angular Wrapper zu umgehen

Typische Construct-Blocker:
- Fehlende CSS Custom Properties / Design Tokens für Theming oder Varianten
- Fehlende ARIA-Strukturen die im CSS/HTML-Template des Design Systems verankert sein müssen
- Fehlende Zustände (focus-visible, disabled, error, etc.) auf CSS-Ebene
- Unzureichende Kontrast-Werte oder fehlende High-Contrast-Mode Unterstützung im CSS
- Fehlende Dark-Mode Token
- Fehlende CSS Logical Properties für RTL im Construct
- Strukturelle HTML-Probleme die nur im Construct gelöst werden können

### Construct-Blocker-Report Format

```
# ⛔ SOTA-Audit UNTERBROCHEN: [Komponentenname]

## Construct Design System Änderungen erforderlich

Bevor der Angular Wrapper auf SOTA gebracht werden kann, muss der Construct Design System angepasst werden:

### Blocker 1: [Titel]
- **Datei im Construct:** [Pfad]
- **Problem:** [Was fehlt oder falsch ist]
- **Erforderliche Änderung:** [Konkret was im Construct geändert/ergänzt werden muss]
- **Betrifft SOTA-Kriterium:** [Welches Kriterium dadurch blockiert wird]

### Blocker 2: ...

## Bereits geprüfte Kriterien (vor Unterbrechung)
- ✅/❌ [Kriterien die bis zum Blocker geprüft wurden]

## Nächste Schritte
1. Construct Design System anpassen (Blocker beheben)
2. Danach `/isSota $ARGUMENTS` erneut ausführen
```

**Wichtig:** Erst wenn alle Construct-Blocker behoben sind, darf der vollständige SOTA-Audit durchgeführt werden.

## Prüfbereiche

Gehe jeden Bereich der Checkliste durch:

- **Grundstruktur** — Standalone, OnPush, Signal-Inputs/-Outputs, computed(), host bindings, inject(), Secondary Entrypoint
- **Barrierefreiheit** — ARIA-Rollen, Keyboard-Navigation, Focus-Management, Screen-Reader, Kontrast, Target Size, aria-describedby/aria-invalid
- **Formular-Integration** (nur wenn Formularkomponente) — CVA, NG_VALUE_ACCESSOR, writeValue/registerOnChange/registerOnTouched/setDisabledState, ngModel + formControl Support, compareWith, Error-State
- **Theming** — Design System Tokens, CSS Custom Properties, Dark Mode, High Contrast
- **Testing** — Unit Tests vorhanden, ARIA-Tests, Keyboard-Tests, CVA-Tests, Varianten-Abdeckung, Component Harness, axe-core
- **Dokumentation** — JSDoc auf Klasse und öffentlichen APIs, Storybook Story, Barrierefreiheitshinweise
- **Internationalisierung** — CSS Logical Properties, RTL, InjectionToken für Strings

## Ausgabeformat

Erstelle einen Report im folgenden Format:

```
# SOTA-Audit: [Komponentenname]

## Ergebnis: X / Y Kriterien erfüllt (XX%)

### ✅ Erfüllt
- [Kriterium] — [kurze Begründung]

### ⚠️ Teilweise erfüllt
- [Kriterium] — [was fehlt]

### ❌ Nicht erfüllt
- [Kriterium] — [was fehlt und was zu tun ist]

## Empfohlene nächste Schritte
1. [Wichtigste Verbesserung]
2. [Zweitwichtigste Verbesserung]
3. ...
```

Sei präzise und beziehe dich auf konkrete Codezeilen. Keine vagen Aussagen — belege jede Bewertung mit dem tatsächlichen Code.
