import { InjectionToken } from '@angular/core';

/** Translatable strings used by the select component. */
export interface AfSelectI18n {
  /** Screen-reader label for the required asterisk. */
  required: string;
  /** Fallback `aria-label` when no `label` input is provided. */
  selectOption: string;
  /** Announcement when an option is selected. Use `{label}` as placeholder. */
  selected: string;
}

/**
 * Injection token to override select screen-reader announcements
 * and the fallback `aria-label`.
 *
 * @example
 * providers: [{
 *   provide: AF_SELECT_I18N,
 *   useValue: {
 *     required: 'Pflichtfeld',
 *     selectOption: 'Option auswählen',
 *     selected: '{label} ausgewählt',
 *   },
 * }]
 */
export const AF_SELECT_I18N = new InjectionToken<AfSelectI18n>('AfSelectI18n', {
  factory: () => ({
    required: 'required',
    selectOption: 'Select option',
    selected: '{label} selected',
  }),
});
