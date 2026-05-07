import { InjectionToken } from '@angular/core';

/** Translatable strings used by the tree component. */
export interface AfTreeI18n {
  /** Screen-reader announcement when a node is expanded. Use `{label}` placeholder. */
  expanded: string;
  /** Screen-reader announcement when a node is collapsed. Use `{label}` placeholder. */
  collapsed: string;
  /** Screen-reader announcement when a node is selected. Use `{label}` placeholder. */
  selected: string;
  /** `aria-label` for the chevron toggle button (button is `aria-hidden`, used as fallback). */
  toggleLabel: string;
  /** Visually-hidden text inside the `aria-busy` row announcing async loading. */
  loadingLabel: string;
  /** Default `<af-empty-state>` message when the tree has zero nodes (and no `empty` slot). */
  emptyMessage: string;
  /** Tooltip / aria-label on the orphan warning marker. */
  orphanLabel: string;
}

/**
 * Injection token to override tree screen-reader announcements
 * and visible labels for i18n.
 *
 * @example
 * providers: [{
 *   provide: AF_TREE_I18N,
 *   useValue: {
 *     expanded: '{label} ausgeklappt',
 *     collapsed: '{label} eingeklappt',
 *     selected: '{label} ausgewählt',
 *     toggleLabel: 'Aufklappen / Zuklappen',
 *     loadingLabel: 'Lädt …',
 *     emptyMessage: 'Keine Einträge',
 *     orphanLabel: 'Übergeordneter Eintrag fehlt',
 *   },
 * }]
 */
export const AF_TREE_I18N = new InjectionToken<AfTreeI18n>('AfTreeI18n', {
  factory: () => ({
    expanded: '{label} expanded',
    collapsed: '{label} collapsed',
    selected: '{label} selected',
    toggleLabel: 'Toggle',
    loadingLabel: 'Loading…',
    emptyMessage: 'No entries',
    orphanLabel: 'Parent missing',
  }),
});
