import { Pipe, PipeTransform } from '@angular/core';

/**
 * Transforms snake_case or SCREAMING_SNAKE_CASE strings to Title Case labels.
 *
 * @example
 * {{ 'IN_PROGRESS' | afFormatLabel }}  => 'In Progress'
 * {{ 'pending_review' | afFormatLabel }} => 'Pending Review'
 * {{ null | afFormatLabel }}            => '—'
 */
@Pipe({
  name: 'afFormatLabel'
})
export class AfFormatLabelPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '\u2014';
    return value
      .toLowerCase()
      .split('_')
      .map(chunk => chunk.charAt(0).toUpperCase() + chunk.slice(1))
      .join(' ');
  }
}
