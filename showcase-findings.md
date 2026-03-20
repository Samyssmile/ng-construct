# Showcase Findings - Construct Design System

| # | Komponente | Finding | Kategorie | Status |
|---|-----------|---------|-----------|--------|
| 1 | Modal / Dialog (Close-Button) | Das "x"-Icon im Close-Button ist zu klein. Der Button selbst hat eine ausreichende Klickfläche, aber das Icon darin ist visuell kaum erkennbar. | Construct Design System | Offen |
| 2 | Chip / Tag | Asymmetrisches Padding im Chip: Links (Text-Seite) deutlich weniger Abstand als rechts (x-Icon-Seite). | Construct Design System | Offen |
| 3 | List Item (Sidebar) | Zu wenig Abstand zwischen Icon und Text in List Items. Besonders auffällig bei breiteren Icons (z.B. Gamma, Delta). Es fehlt ein konsistenter gap/margin zwischen Icon und Label. | Construct Design System | Offen |
| 4 | Navigation (Toolbar) | "Tasks" und "Settings" wurden mit Bullet-Points dargestellt. Ursache: Falsche CSS-Klasse `ct-toolbar__nav-list` statt `ct-toolbar__nav`. **Fix:** Klasse korrigiert in `app.html`. | Angular Showcase Bug | Behoben |
