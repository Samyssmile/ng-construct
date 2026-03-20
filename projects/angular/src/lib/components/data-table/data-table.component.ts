import {
  Component,
  TemplateRef,
  input,
  output,
  computed,
  effect,
  contentChildren,
  ChangeDetectionStrategy
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { AfCellDefDirective } from './cell-def.directive';

export interface AfColumn {
  key: string;
  header: string;
  sortable?: boolean;
  /** CSS class(es) for the cell */
  cellClass?: string;
}

export interface AfDataTableConfig {
  striped?: boolean;
  compact?: boolean;
  /** Whether to show the selection checkbox column */
  selectable?: boolean;
}

/** Row type for the data table — uses `any` values to allow typed interfaces without index signatures. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AfDataRow = Record<string, any>;

export type AfSortDirection = 'asc' | 'desc';

export interface AfSortState {
  key: string;
  direction: AfSortDirection;
}

/**
 * Data table with sorting, selection, and custom cell templates.
 *
 * @example
 * <af-data-table
 *   [data]="items()"
 *   [columns]="columns"
 *   [config]="{ striped: true, selectable: true }"
 *   rowId="id"
 *   (sortChange)="onSort($event)"
 *   (selectionChange)="onSelect($event)">
 *
 *   <ng-template afCellDef="status" let-row>
 *     <af-badge [variant]="getVariant(row.status)">
 *       {{ row.status | afFormatLabel }}
 *     </af-badge>
 *   </ng-template>
 *
 *   <ng-template afCellDef="actions" let-row>
 *     <af-button variant="ghost" iconOnly (clicked)="onDelete(row)">
 *       <af-icon name="delete" />
 *     </af-button>
 *   </ng-template>
 * </af-data-table>
 */
@Component({
  selector: 'af-data-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css'
})
export class AfDataTableComponent {
  data = input<AfDataRow[]>([]);
  columns = input<AfColumn[]>([]);
  config = input<AfDataTableConfig>({ striped: true, compact: true });

  /** Sort state (controlled). */
  sort = input<AfSortState | null>(null);

  /** Row id key or accessor for stable selection. */
  rowId = input<string | ((row: AfDataRow) => string | number) | null>(null);

  rowClick = output<AfDataRow>();
  selectionChange = output<AfDataRow[]>();
  sortChange = output<AfSortState | null>();

  cellDefs = contentChildren(AfCellDefDirective);

  private selectedRowIds = new Set<unknown>();
  private internalSort: AfSortState | null = null;
  private cellTemplateMap = new Map<string, TemplateRef<unknown>>();

  allSelected = false;
  someSelected = false;

  private cellDefsEffect = effect(() => {
    const defs = this.cellDefs();
    this.cellTemplateMap.clear();
    defs.forEach(def => {
      this.cellTemplateMap.set(def.columnKey(), def.templateRef);
    });
  });

  private dataEffect = effect(() => {
    this.data();
    this.rowId();
    this.syncSelectionWithData();
    this.updateSelectionState();
  });

  isSelectable = computed(() => {
    return this.config().selectable !== false;
  });

  tableClasses = computed(() => {
    const classes = ['ct-table'];
    if (this.config().striped) classes.push('ct-table--striped');
    if (this.config().compact) classes.push('ct-table--compact');
    return classes.join(' ');
  });

  sortedData = computed(() => {
    const sort = this.activeSort();
    if (!sort) return [...this.data()];
    if (!this.columns().some(column => column.key === sort.key)) return [...this.data()];
    const sorted = [...this.data()];
    sorted.sort((a, b) => this.compareValues(a?.[sort.key], b?.[sort.key], sort.direction));
    return sorted;
  });

  activeSort = computed(() => {
    return this.sort() ?? this.internalSort;
  });

  /** Returns the custom cell template for a column, or null for default rendering. */
  getCellTemplate(columnKey: string): TemplateRef<unknown> | null {
    return this.cellTemplateMap.get(columnKey) ?? null;
  }

  getAriaSort(column: AfColumn): string | null {
    if (!column.sortable) return null;
    const sort = this.activeSort();
    if (!sort || sort.key !== column.key) return 'none';
    return sort.direction === 'asc' ? 'ascending' : 'descending';
  }

  toggleSort(column: AfColumn): void {
    if (!column.sortable) return;
    const current = this.activeSort();
    let next: AfSortState | null;

    if (!current || current.key !== column.key) {
      next = { key: column.key, direction: 'asc' };
    } else if (current.direction === 'asc') {
      next = { key: column.key, direction: 'desc' };
    } else {
      next = null;
    }

    if (this.sort()) {
      this.sortChange.emit(next);
    } else {
      this.internalSort = next;
      this.sortChange.emit(next);
    }
  }

  onRowClick(row: AfDataRow): void {
    this.rowClick.emit(row);
  }

  toggleSelection(row: AfDataRow, event: Event): void {
    event.stopPropagation();
    const rowId = this.getRowId(row);
    if (this.selectedRowIds.has(rowId)) {
      this.selectedRowIds.delete(rowId);
    } else {
      this.selectedRowIds.add(rowId);
    }
    this.updateSelectionState();
    this.selectionChange.emit(this.getSelectedRows());
  }

  toggleAll(checked: boolean): void {
    if (checked) {
      this.data().forEach(row => this.selectedRowIds.add(this.getRowId(row)));
    } else {
      this.selectedRowIds.clear();
    }
    this.updateSelectionState();
    this.selectionChange.emit(this.getSelectedRows());
  }

  isSelected(row: AfDataRow): boolean {
    return this.selectedRowIds.has(this.getRowId(row));
  }

  private updateSelectionState(): void {
    const data = this.data();
    const hasData = data.length > 0;
    const selectedCount = data.filter(row => this.selectedRowIds.has(this.getRowId(row))).length;
    this.allSelected = hasData && selectedCount === data.length;
    this.someSelected = hasData && selectedCount > 0 && selectedCount < data.length;
  }

  private getRowId(row: AfDataRow): unknown {
    const rowId = this.rowId();
    if (typeof rowId === 'function') {
      return rowId(row);
    }
    if (typeof rowId === 'string' && row && row[rowId] !== undefined) {
      return row[rowId];
    }
    return row;
  }

  private getSelectedRows(): AfDataRow[] {
    return this.data().filter(row => this.selectedRowIds.has(this.getRowId(row)));
  }

  private syncSelectionWithData(): void {
    if (!this.rowId()) {
      this.selectedRowIds.clear();
      return;
    }
    const validIds = new Set(this.data().map(row => this.getRowId(row)));
    this.selectedRowIds.forEach(id => {
      if (!validIds.has(id)) {
        this.selectedRowIds.delete(id);
      }
    });
  }

  private compareValues(a: unknown, b: unknown, direction: AfSortDirection): number {
    const sortFactor = direction === 'asc' ? 1 : -1;
    if (a == null && b == null) return 0;
    if (a == null) return 1 * sortFactor;
    if (b == null) return -1 * sortFactor;

    if (typeof a === 'number' && typeof b === 'number') {
      return (a - b) * sortFactor;
    }
    if (a instanceof Date && b instanceof Date) {
      return (a.getTime() - b.getTime()) * sortFactor;
    }

    return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' }) * sortFactor;
  }
}
