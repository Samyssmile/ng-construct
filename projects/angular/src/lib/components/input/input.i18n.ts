import { InjectionToken } from '@angular/core';

/** Translatable strings used by the input component. */
export interface AfInputI18n {
  /** Screen-reader label for the required indicator. */
  required: string;
}

/**
 * Injection token to override input screen-reader announcements.
 *
 * @example
 * providers: [{
 *   provide: AF_INPUT_I18N,
 *   useValue: { required: 'Pflichtfeld' },
 * }]
 */
export const AF_INPUT_I18N = new InjectionToken<AfInputI18n>('AfInputI18n', {
  factory: () => ({
    required: 'required',
  }),
});
