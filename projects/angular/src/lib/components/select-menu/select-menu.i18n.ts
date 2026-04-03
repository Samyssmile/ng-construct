import { InjectionToken } from '@angular/core';

/** Translatable strings used by the select-menu component. */
export interface AfSelectMenuI18n {
  /** Fallback `aria-label` when no `label` input is provided. */
  selectOption: string;
  /** Announcement when the listbox opens. Use `{count}` as placeholder. */
  opened: string;
  /** Announcement when the listbox closes. */
  closed: string;
  /** Announcement when an option is selected. Use `{label}` as placeholder. */
  selected: string;
  /** Announcement when an option is deselected (multi-select). Use `{label}` as placeholder. */
  deselected: string;
  /** Announcement for the number of selected options (multi-select). Use `{count}` as placeholder. */
  countSelected: string;
}

/**
 * Injection token to override select-menu screen-reader announcements
 * and the fallback `aria-label`.
 *
 * @example
 * providers: [{
 *   provide: AF_SELECT_MENU_I18N,
 *   useValue: {
 *     selectOption: 'Option auswählen',
 *     opened: '{count} Optionen verfügbar',
 *     closed: 'Auswahl geschlossen',
 *     selected: '{label} ausgewählt',
 *     deselected: '{label} abgewählt',
 *     countSelected: '{count} Optionen ausgewählt',
 *   },
 * }]
 */
export const AF_SELECT_MENU_I18N = new InjectionToken<AfSelectMenuI18n>('AfSelectMenuI18n', {
  factory: () => ({
    selectOption: 'Select option',
    opened: '{count} options available',
    closed: 'Selection closed',
    selected: '{label} selected',
    deselected: '{label} deselected',
    countSelected: '{count} options selected',
  }),
});
