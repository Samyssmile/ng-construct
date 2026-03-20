import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';

/**
 * Pagination component
 *
 * @example
 * <af-pagination
 *   [currentPage]="page"
 *   [totalPages]="10"
 *   (pageChange)="onPageChange($event)">
 * </af-pagination>
 */
@Component({
  selector: 'af-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="ct-pagination" aria-label="Pagination">
      <ul class="ct-pagination__list">
        <li>
          <button
            class="ct-pagination__link"
            [attr.aria-disabled]="currentPage() === 1 ? 'true' : null"
            [disabled]="currentPage() === 1"
            type="button"
            (click)="goToPage(currentPage() - 1)">
            {{ previousLabel() }}
          </button>
        </li>
        @for (page of visiblePages(); track page) {
          <li>
            @if (page === '...') {
              <span class="ct-pagination__ellipsis">…</span>
            } @else {
              <button
                class="ct-pagination__link"
                [attr.aria-current]="currentPage() === page ? 'page' : null"
                type="button"
                (click)="goToPage(page)">
                {{ page }}
              </button>
            }
          </li>
        }
        <li>
          <button
            class="ct-pagination__link"
            [attr.aria-disabled]="currentPage() === totalPages() ? 'true' : null"
            [disabled]="currentPage() === totalPages()"
            type="button"
            (click)="goToPage(currentPage() + 1)">
            {{ nextLabel() }}
          </button>
        </li>
      </ul>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AfPaginationComponent {
  /** Current page number (1-indexed) */
  currentPage = input(1);

  /** Total number of pages */
  totalPages = input(1);

  /** Label for previous button */
  previousLabel = input('Prev');

  /** Label for next button */
  nextLabel = input('Next');

  /** Maximum number of page buttons to show */
  maxVisiblePages = input(7);

  /** Page change event */
  pageChange = output<number>();

  visiblePages = computed(() => {
    const pages: (number | string)[] = [];
    const halfMax = Math.floor(this.maxVisiblePages() / 2);

    let start = Math.max(1, this.currentPage() - halfMax);
    let end = Math.min(this.totalPages(), start + this.maxVisiblePages() - 1);

    if (end - start < this.maxVisiblePages() - 1) {
      start = Math.max(1, end - this.maxVisiblePages() + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < this.totalPages()) {
      if (end < this.totalPages() - 1) pages.push('...');
      pages.push(this.totalPages());
    }

    return pages;
  });

  goToPage(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }
}
