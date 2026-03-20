import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  booleanAttribute,
} from '@angular/core';

export type AfTableVariant = 'default' | 'striped' | 'bordered';
export type AfTableCellType = 'text' | 'numeric' | 'checkbox' | 'actions';

/**
 * Lightweight table container wrapping the Construct Design System table styles.
 *
 * @example
 * <af-table variant="striped" caption="Team members">
 *   <af-table-header>
 *     <af-table-row>
 *       <af-table-header-cell>Name</af-table-header-cell>
 *       <af-table-header-cell type="numeric">Age</af-table-header-cell>
 *     </af-table-row>
 *   </af-table-header>
 *   <af-table-body>
 *     <af-table-row>
 *       <af-table-cell>Alice</af-table-cell>
 *       <af-table-cell type="numeric">30</af-table-cell>
 *     </af-table-row>
 *   </af-table-body>
 * </af-table>
 */
@Component({
  selector: 'af-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ct-table-wrap">
      <table [class]="tableClasses()">
        @if (caption()) {
          <caption>{{ caption() }}</caption>
        }
        <ng-content />
      </table>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class AfTableComponent {
  /** Visual variant of the table. */
  variant = input<AfTableVariant>('default');

  /** Use compact cell padding. */
  compact = input(false, { transform: booleanAttribute });

  /** Accessible caption rendered as a `<caption>` element. */
  caption = input('');

  tableClasses = computed(() => {
    const classes = ['ct-table'];
    if (this.variant() !== 'default') {
      classes.push(`ct-table--${this.variant()}`);
    }
    if (this.compact()) {
      classes.push('ct-table--compact');
    }
    return classes.join(' ');
  });
}

/**
 * Table header section rendering a semantic `<thead>` element.
 *
 * @example
 * <af-table-header>
 *   <af-table-row>
 *     <af-table-header-cell>Column</af-table-header-cell>
 *   </af-table-row>
 * </af-table-header>
 */
@Component({
  selector: 'af-table-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<thead><ng-content /></thead>`,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class AfTableHeaderComponent {}

/**
 * Table body section rendering a semantic `<tbody>` element.
 *
 * @example
 * <af-table-body>
 *   <af-table-row>
 *     <af-table-cell>Data</af-table-cell>
 *   </af-table-row>
 * </af-table-body>
 */
@Component({
  selector: 'af-table-body',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<tbody><ng-content /></tbody>`,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class AfTableBodyComponent {}

/**
 * Table row rendering a semantic `<tr>` element.
 */
@Component({
  selector: 'af-table-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<tr><ng-content /></tr>`,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class AfTableRowComponent {}

/**
 * Header cell rendering a semantic `<th>` element.
 *
 * @example
 * <af-table-header>
 *   <af-table-row>
 *     <af-table-header-cell>Name</af-table-header-cell>
 *     <af-table-header-cell type="numeric">Age</af-table-header-cell>
 *   </af-table-row>
 * </af-table-header>
 */
@Component({
  selector: 'af-table-header-cell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <th [class]="cellClasses()" [attr.scope]="scope()">
      <ng-content />
    </th>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class AfTableHeaderCellComponent {
  /** Cell type for specialized styling (numeric, checkbox, actions). */
  type = input<AfTableCellType>('text');

  /** Scope attribute for the header cell. */
  scope = input<'col' | 'row'>('col');

  cellClasses = computed(() => {
    const classes: string[] = [];
    if (this.type() !== 'text') {
      classes.push(`ct-table__cell--${this.type()}`);
    }
    return classes.join(' ');
  });
}

/**
 * Data cell rendering a semantic `<td>` element.
 *
 * @example
 * <af-table-body>
 *   <af-table-row>
 *     <af-table-cell>Alice</af-table-cell>
 *     <af-table-cell type="numeric">42</af-table-cell>
 *   </af-table-row>
 * </af-table-body>
 */
@Component({
  selector: 'af-table-cell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <td [class]="cellClasses()">
      <ng-content />
    </td>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class AfTableCellComponent {
  /** Cell type for specialized styling (numeric, checkbox, actions). */
  type = input<AfTableCellType>('text');

  cellClasses = computed(() => {
    const classes: string[] = [];
    if (this.type() !== 'text') {
      classes.push(`ct-table__cell--${this.type()}`);
    }
    return classes.join(' ');
  });
}
