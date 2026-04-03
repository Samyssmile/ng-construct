import { InjectionToken } from '@angular/core';

/** Translatable strings used by the accordion component. */
export interface AfAccordionI18n {
  /** Announcement when a section is expanded. Use `{heading}` as placeholder. */
  expanded: string;
  /** Announcement when a section is collapsed. Use `{heading}` as placeholder. */
  collapsed: string;
}

/**
 * Injection token to override accordion screen-reader announcements.
 *
 * @example
 * providers: [{
 *   provide: AF_ACCORDION_I18N,
 *   useValue: { expanded: '{heading} ausgeklappt', collapsed: '{heading} eingeklappt' },
 * }]
 */
export const AF_ACCORDION_I18N = new InjectionToken<AfAccordionI18n>('AfAccordionI18n', {
  factory: () => ({
    expanded: '{heading} expanded',
    collapsed: '{heading} collapsed',
  }),
});
