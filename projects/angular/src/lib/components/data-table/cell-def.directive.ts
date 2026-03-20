import { Directive, TemplateRef, input, inject } from '@angular/core';

/**
 * Directive for defining custom cell templates in AfDataTableComponent.
 *
 * @example
 * <af-data-table [data]="items" [columns]="columns">
 *   <ng-template afCellDef="status" let-row>
 *     <af-badge [variant]="getVariant(row.status)">{{ row.status }}</af-badge>
 *   </ng-template>
 *   <ng-template afCellDef="actions" let-row>
 *     <af-button variant="ghost" iconOnly (clicked)="onEdit(row)">
 *       <af-icon name="edit" />
 *     </af-button>
 *   </ng-template>
 * </af-data-table>
 */
@Directive({
  selector: '[afCellDef]'
})
export class AfCellDefDirective {
  /** Column key this template applies to */
  columnKey = input('', { alias: 'afCellDef' });

  readonly templateRef = inject(TemplateRef<unknown>);
}
