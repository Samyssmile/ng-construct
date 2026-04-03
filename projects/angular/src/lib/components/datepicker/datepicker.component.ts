import {
  Component,
  forwardRef,
  signal,
  computed,
  ElementRef,
  viewChild,
  input,
  output,
  model,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  Validator,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

/** Supported calendar views */
export type AfDatepickerView = 'days' | 'months' | 'years';

/** Selection mode */
export type AfDatepickerMode = 'single' | 'range';

/** Value format emitted by ControlValueAccessor */
export type AfDatepickerValueFormat = 'date' | 'iso';

/** Date range value for range mode */
export interface AfDateRange {
  start: Date | null;
  end: Date | null;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  isUnavailable: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
}

interface MonthItem {
  index: number;
  label: string;
  shortLabel: string;
  isSelected: boolean;
  isDisabled: boolean;
}

interface YearItem {
  value: number;
  isSelected: boolean;
  isDisabled: boolean;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/**
 * Datepicker component with calendar popup, month/year views, range selection,
 * min/max constraints, disabled dates, and full keyboard navigation.
 *
 * Implements WAI-ARIA Date Picker Dialog pattern with roving tabindex.
 *
 * @example
 * <af-datepicker
 *   label="Start date"
 *   placeholder="Pick a date"
 *   [(ngModel)]="selectedDate"
 *   [min]="minDate"
 *   [max]="maxDate"
 *   hint="Choose a date within the project timeline"
 * />
 *
 * @example
 * <af-datepicker
 *   label="Period"
 *   mode="range"
 *   [(ngModel)]="dateRange"
 *   valueFormat="iso"
 * />
 */
@Component({
  selector: 'af-datepicker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AfDatepickerComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AfDatepickerComponent),
      multi: true,
    },
  ],
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
  template: `
    <div class="ct-field" [class.ct-field--error]="error()">
      @if (label()) {
        <label class="ct-field__label" [attr.for]="inputId()">
          {{ label() }}
          @if (required()) {
            <span aria-label="required"> *</span>
          }
        </label>
      }

      <div class="ct-datepicker" [attr.data-state]="isOpen() ? 'open' : 'closed'">
        <div class="ct-datepicker__input-wrap">
          <input
            #inputEl
            class="ct-input"
            type="text"
            [id]="inputId()"
            [placeholder]="placeholder()"
            [value]="formattedValue()"
            [disabled]="disabled()"
            [required]="required()"
            [attr.aria-haspopup]="'dialog'"
            [attr.aria-expanded]="isOpen()"
            [attr.aria-controls]="popoverId()"
            [attr.aria-invalid]="error() ? true : null"
            [attr.aria-describedby]="ariaDescribedBy()"
            [attr.aria-label]="label() ? null : (placeholder() || 'Select date')"
            (click)="toggle()"
            (keydown)="onInputKeydown($event)"
            (blur)="onTouched()"
            readonly
          />
          @if (hasClearableValue() && !disabled()) {
            <button
              class="ct-datepicker__clear"
              type="button"
              aria-label="Clear date"
              (click)="clearValue($event)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          }
        </div>

        <div
          #popoverEl
          class="ct-datepicker__popover"
          role="dialog"
          [id]="popoverId()"
          [attr.aria-label]="dialogAriaLabel()"
          [attr.aria-hidden]="!isOpen() || null">

          <div class="ct-datepicker__header">
            <button
              class="ct-button ct-button--ghost ct-button--icon"
              type="button"
              [attr.aria-label]="prevButtonAriaLabel()"
              (click)="navigatePrevious()">
              &#8249;
            </button>
            <button
              class="ct-datepicker__title"
              type="button"
              [attr.aria-label]="titleAriaLabel()"
              (click)="drillUp()">
              {{ headerTitle() }}
            </button>
            <button
              class="ct-button ct-button--ghost ct-button--icon"
              type="button"
              [attr.aria-label]="nextButtonAriaLabel()"
              (click)="navigateNext()">
              &#8250;
            </button>
          </div>

          @switch (currentView()) {
            @case ('days') {
              <div
                class="ct-datepicker__grid"
                role="grid"
                [attr.aria-label]="gridAriaLabel()"
                (keydown)="onDayGridKeydown($event)">
                <div class="ct-datepicker__row" role="row">
                  @for (day of weekdayLabels; track $index) {
                    <div class="ct-datepicker__weekday" role="columnheader" [attr.aria-label]="weekdayFullLabels[$index]">
                      {{ day }}
                    </div>
                  }
                </div>
                @for (day of calendarDays(); track day.date.getTime()) {
                  <button
                    class="ct-datepicker__day"
                    [attr.data-date]="getDateKey(day.date)"
                    [attr.data-outside]="!day.isCurrentMonth || null"
                    [attr.data-today]="day.isToday || null"
                    [attr.data-unavailable]="day.isUnavailable || null"
                    [attr.data-highlighted]="isDayHighlighted(day) || null"
                    [attr.data-in-range]="day.isInRange || null"
                    [attr.data-range-start]="day.isRangeStart || null"
                    [attr.data-range-end]="day.isRangeEnd || null"
                    [attr.aria-selected]="day.isSelected ? 'true' : null"
                    [attr.aria-current]="day.isToday ? 'date' : null"
                    [attr.aria-disabled]="day.isDisabled || day.isUnavailable ? 'true' : null"
                    [disabled]="day.isDisabled || day.isUnavailable"
                    [attr.tabindex]="getDayTabIndex(day)"
                    role="gridcell"
                    type="button"
                    (click)="onDayClick(day)">
                    {{ day.date.getDate() }}
                  </button>
                }
              </div>
              <div class="ct-datepicker__footer">
                <button
                  class="ct-datepicker__today"
                  type="button"
                  [disabled]="isTodayDisabled()"
                  (click)="goToToday()">
                  Today
                </button>
              </div>
            }
            @case ('months') {
              <div
                class="ct-datepicker__month-grid"
                role="grid"
                aria-label="Select month"
                (keydown)="onMonthGridKeydown($event)">
                @for (m of monthItems(); track m.index) {
                  <button
                    class="ct-datepicker__month"
                    [attr.aria-selected]="m.isSelected ? 'true' : null"
                    [attr.data-highlighted]="isMonthHighlighted(m.index) || null"
                    [disabled]="m.isDisabled"
                    [attr.tabindex]="getMonthTabIndex(m.index)"
                    role="gridcell"
                    type="button"
                    (click)="selectMonth(m.index)">
                    {{ m.shortLabel }}
                  </button>
                }
              </div>
            }
            @case ('years') {
              <div
                class="ct-datepicker__year-grid"
                role="grid"
                aria-label="Select year"
                (keydown)="onYearGridKeydown($event)">
                @for (y of yearItems(); track y.value) {
                  <button
                    class="ct-datepicker__year"
                    [attr.aria-selected]="y.isSelected ? 'true' : null"
                    [attr.data-highlighted]="isYearHighlighted(y.value) || null"
                    [disabled]="y.isDisabled"
                    [attr.tabindex]="getYearTabIndex(y.value)"
                    role="gridcell"
                    type="button"
                    (click)="selectYear(y.value)">
                    {{ y.value }}
                  </button>
                }
              </div>
            }
          }
        </div>
      </div>

      @if (hint() && !error()) {
        <div class="ct-field__hint" [id]="hintId()">{{ hint() }}</div>
      }
      @if (error()) {
        <div class="ct-field__error" [id]="errorId()">{{ error() }}</div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ct-datepicker__input-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }
      .ct-datepicker__input-wrap .ct-input {
        width: 100%;
        padding-inline-end: 2.25rem;
      }
      .ct-datepicker__clear {
        position: absolute;
        inset-inline-end: 0.5rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: transparent;
        cursor: pointer;
        color: var(--color-text-muted);
        padding: 0.25rem;
        border-radius: var(--radius-sm);
      }
      .ct-datepicker__clear:hover {
        color: var(--color-text-primary);
      }
      .ct-datepicker__clear:focus-visible {
        outline: var(--border-medium) solid var(--color-focus-ring);
        outline-offset: 2px;
      }
      .ct-datepicker__footer {
        display: flex;
        justify-content: center;
      }
      .ct-datepicker__today {
        appearance: none;
        border: none;
        background: transparent;
        color: var(--color-brand-primary);
        cursor: pointer;
        font-size: var(--font-size-sm);
        padding: var(--space-1) var(--space-3);
        border-radius: var(--radius-sm);
        font-weight: var(--font-weight-medium, 500);
      }
      .ct-datepicker__today:hover:not(:disabled) {
        background: var(--color-bg-muted);
      }
      .ct-datepicker__today:focus-visible {
        outline: var(--border-medium) solid var(--color-focus-ring);
        outline-offset: 2px;
      }
      .ct-datepicker__today:disabled {
        opacity: var(--opacity-disabled, 0.5);
        cursor: not-allowed;
      }
    `,
  ],
})
export class AfDatepickerComponent implements ControlValueAccessor, Validator {
  private static nextId = 0;

  // ── Public Inputs ────────────────────────────────────────────

  /** Field label */
  label = input('');

  /** Input placeholder text */
  placeholder = input('Select date');

  /** Whether the datepicker is disabled */
  disabled = model(false);

  /** Display format for the selected date */
  dateFormat = input('MMM dd, yyyy');

  /** Unique ID for the input element */
  inputId = input(`af-datepicker-${AfDatepickerComponent.nextId++}`);

  /** Minimum selectable date */
  min = input<Date | string | null>(null);

  /** Maximum selectable date */
  max = input<Date | string | null>(null);

  /** Array of specific dates that cannot be selected */
  disabledDates = input<Date[]>([]);

  /**
   * Predicate function to determine if a date is selectable.
   * Return `true` to allow selection, `false` to disable.
   */
  dateFilter = input<((date: Date) => boolean) | null>(null);

  /** Hint text displayed below the input */
  hint = input('');

  /** Error message — displays error state and message */
  error = input('');

  /** Whether the field is required */
  required = input(false);

  /** Selection mode: single date or date range */
  mode = input<AfDatepickerMode>('single');

  /**
   * Value format for ControlValueAccessor.
   * `'date'` emits `Date` objects, `'iso'` emits ISO date strings (`yyyy-MM-dd`).
   */
  valueFormat = input<AfDatepickerValueFormat>('date');

  /** Emitted when a single date is selected */
  dateChange = output<Date>();

  /** Emitted when a date range is selected (range mode only) */
  rangeChange = output<AfDateRange>();

  // ── Template References ──────────────────────────────────────

  inputRef = viewChild<ElementRef<HTMLInputElement>>('inputEl');
  popoverRef = viewChild<ElementRef<HTMLDivElement>>('popoverEl');

  // ── Constants ────────────────────────────────────────────────

  weekdayLabels = WEEKDAY_LABELS;
  weekdayFullLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // ── Internal State ───────────────────────────────────────────

  selectedDate = signal<Date | null>(null);
  rangeStart = signal<Date | null>(null);
  rangeEnd = signal<Date | null>(null);
  rangeSelecting = signal(false);

  currentMonth = signal(new Date().getMonth());
  currentYear = signal(new Date().getFullYear());
  isOpen = signal(false);
  focusedDate = signal<Date | null>(null);
  currentView = signal<AfDatepickerView>('days');
  focusedMonth = signal(new Date().getMonth());
  focusedYear = signal(new Date().getFullYear());
  yearPageStart = signal(Math.floor(new Date().getFullYear() / 12) * 12);

  onChange: (value: unknown) => void = () => {};
  onTouched: () => void = () => {};
  private onValidatorChange: () => void = () => {};

  // ── Computed ─────────────────────────────────────────────────

  parsedMin = computed(() => this.parseDate(this.min()));
  parsedMax = computed(() => this.parseDate(this.max()));

  popoverId = computed(() => `${this.inputId()}-popover`);
  hintId = computed(() => `${this.inputId()}-hint`);
  errorId = computed(() => `${this.inputId()}-error`);

  ariaDescribedBy = computed(() => {
    if (this.error()) return this.errorId();
    if (this.hint()) return this.hintId();
    return null;
  });

  dialogAriaLabel = computed(() => {
    if (this.mode() === 'range') return 'Choose date range';
    return 'Choose date';
  });

  headerTitle = computed(() => {
    switch (this.currentView()) {
      case 'days':
        return `${MONTH_NAMES[this.currentMonth()]} ${this.currentYear()}`;
      case 'months':
        return `${this.currentYear()}`;
      case 'years':
        return `${this.yearPageStart()} – ${this.yearPageStart() + 11}`;
    }
  });

  titleAriaLabel = computed(() => {
    switch (this.currentView()) {
      case 'days':
        return 'Switch to month view';
      case 'months':
        return 'Switch to year view';
      case 'years':
        return null;
    }
  });

  prevButtonAriaLabel = computed(() => {
    switch (this.currentView()) {
      case 'days':
        return 'Previous month';
      case 'months':
        return 'Previous year';
      case 'years':
        return 'Previous 12 years';
    }
  });

  nextButtonAriaLabel = computed(() => {
    switch (this.currentView()) {
      case 'days':
        return 'Next month';
      case 'months':
        return 'Next year';
      case 'years':
        return 'Next 12 years';
    }
  });

  gridAriaLabel = computed(
    () => `${MONTH_NAMES[this.currentMonth()]} ${this.currentYear()}`
  );

  hasClearableValue = computed(() => {
    if (this.mode() === 'range') {
      return this.rangeStart() !== null || this.rangeEnd() !== null;
    }
    return this.selectedDate() !== null;
  });

  formattedValue = computed(() => {
    if (this.mode() === 'range') {
      const start = this.rangeStart();
      const end = this.rangeEnd();
      if (!start && !end) return '';
      const startStr = start ? this.formatDate(start) : '...';
      const endStr = end ? this.formatDate(end) : '...';
      return `${startStr} – ${endStr}`;
    }
    const date = this.selectedDate();
    return date ? this.formatDate(date) : '';
  });

  isTodayDisabled = computed(() => this.isDateDisabled(new Date()));

  calendarDays = computed((): CalendarDay[] => {
    const year = this.currentYear();
    const month = this.currentMonth();
    const today = new Date();
    const selected = this.selectedDate();
    const rStart = this.rangeStart();
    const rEnd = this.rangeEnd();
    const previewEnd =
      this.mode() === 'range' && this.rangeSelecting() ? this.focusedDate() : null;
    const effectiveEnd = rEnd ?? previewEnd;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: CalendarDay[] = [];

    let startPad = firstDay.getDay() - 1;
    if (startPad < 0) startPad = 6;

    const prevLast = new Date(year, month, 0).getDate();
    for (let i = startPad - 1; i >= 0; i--) {
      days.push(this.buildDay(new Date(year, month - 1, prevLast - i), false, today, selected, rStart, effectiveEnd));
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(this.buildDay(new Date(year, month, i), true, today, selected, rStart, effectiveEnd));
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(this.buildDay(new Date(year, month + 1, i), false, today, selected, rStart, effectiveEnd));
    }

    return days;
  });

  monthItems = computed((): MonthItem[] => {
    const year = this.currentYear();
    const selected = this.selectedDate();
    const min = this.parsedMin();
    const max = this.parsedMax();

    return Array.from({ length: 12 }, (_, i) => {
      const isDisabled = this.isMonthDisabled(year, i, min, max);
      return {
        index: i,
        label: MONTH_NAMES[i],
        shortLabel: MONTH_SHORT[i],
        isSelected: selected ? selected.getMonth() === i && selected.getFullYear() === year : false,
        isDisabled,
      };
    });
  });

  yearItems = computed((): YearItem[] => {
    const start = this.yearPageStart();
    const selected = this.selectedDate();
    const min = this.parsedMin();
    const max = this.parsedMax();

    return Array.from({ length: 12 }, (_, i) => {
      const value = start + i;
      return {
        value,
        isSelected: selected ? selected.getFullYear() === value : false,
        isDisabled: this.isYearDisabled(value, min, max),
      };
    });
  });

  // ── Open / Close ─────────────────────────────────────────────

  toggle(): void {
    if (this.isOpen()) {
      this.close(true);
    } else {
      this.open();
    }
  }

  /** Opens the calendar popover */
  open(): void {
    if (this.disabled() || this.isOpen()) return;
    const selected = this.selectedDate();
    const focusDate = selected ?? new Date();
    this.currentMonth.set(focusDate.getMonth());
    this.currentYear.set(focusDate.getFullYear());
    this.focusedDate.set(focusDate);
    this.focusedMonth.set(focusDate.getMonth());
    this.focusedYear.set(focusDate.getFullYear());
    this.currentView.set('days');
    this.isOpen.set(true);
    queueMicrotask(() => this.focusDayButton(focusDate));
  }

  /** Closes the calendar popover */
  close(returnFocus = false): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.onTouched();
    if (returnFocus) {
      this.inputRef()?.nativeElement.focus();
    }
  }

  // ── Day Selection ────────────────────────────────────────────

  /** Handles click on a calendar day */
  onDayClick(day: CalendarDay): void {
    if (day.isDisabled || day.isUnavailable) return;
    if (this.mode() === 'range') {
      this.selectRangeDate(day.date);
    } else {
      this.selectSingleDate(day.date);
    }
  }

  /** Selects a single date and closes the popover */
  selectSingleDate(date: Date): void {
    this.selectedDate.set(date);
    this.focusedDate.set(date);
    this.emitSingleValue(date);
    this.dateChange.emit(date);
    this.close(true);
  }

  /** Handles range date selection (two-click: start then end) */
  selectRangeDate(date: Date): void {
    if (!this.rangeSelecting()) {
      this.rangeStart.set(date);
      this.rangeEnd.set(null);
      this.rangeSelecting.set(true);
      this.focusedDate.set(date);
    } else {
      let start = this.rangeStart()!;
      let end = date;
      if (this.compareDays(end, start) < 0) {
        [start, end] = [end, start];
      }
      this.rangeStart.set(start);
      this.rangeEnd.set(end);
      this.rangeSelecting.set(false);
      this.emitRangeValue(start, end);
      this.rangeChange.emit({ start, end });
      this.close(true);
    }
  }

  /** Navigates to today and selects it (single mode) or focuses it */
  goToToday(): void {
    const today = new Date();
    if (this.isDateDisabled(today)) return;

    this.currentMonth.set(today.getMonth());
    this.currentYear.set(today.getFullYear());
    this.focusedDate.set(today);

    if (this.mode() === 'single') {
      this.selectSingleDate(today);
    } else {
      this.selectRangeDate(today);
    }
  }

  /** Clears the selected value */
  clearValue(event: Event): void {
    event.stopPropagation();
    if (this.mode() === 'range') {
      this.rangeStart.set(null);
      this.rangeEnd.set(null);
      this.rangeSelecting.set(false);
      this.emitRangeValue(null, null);
    } else {
      this.selectedDate.set(null);
      this.emitSingleValue(null);
    }
    this.inputRef()?.nativeElement.focus();
  }

  // ── View Navigation ──────────────────────────────────────────

  /** Drills up: days -> months -> years */
  drillUp(): void {
    const view = this.currentView();
    if (view === 'days') {
      this.focusedMonth.set(this.currentMonth());
      this.currentView.set('months');
      queueMicrotask(() => this.focusMonthButton(this.focusedMonth()));
    } else if (view === 'months') {
      this.focusedYear.set(this.currentYear());
      this.yearPageStart.set(Math.floor(this.currentYear() / 12) * 12);
      this.currentView.set('years');
      queueMicrotask(() => this.focusYearButton(this.focusedYear()));
    }
  }

  /** Navigates to previous period based on current view */
  navigatePrevious(): void {
    switch (this.currentView()) {
      case 'days':
        this.shiftMonth(-1);
        break;
      case 'months':
        this.currentYear.update((y) => y - 1);
        break;
      case 'years':
        this.yearPageStart.update((s) => s - 12);
        break;
    }
  }

  /** Navigates to next period based on current view */
  navigateNext(): void {
    switch (this.currentView()) {
      case 'days':
        this.shiftMonth(1);
        break;
      case 'months':
        this.currentYear.update((y) => y + 1);
        break;
      case 'years':
        this.yearPageStart.update((s) => s + 12);
        break;
    }
  }

  /** Selects a month from the month view and switches to days */
  selectMonth(monthIndex: number): void {
    this.currentMonth.set(monthIndex);
    this.focusedMonth.set(monthIndex);
    this.currentView.set('days');
    const focusDate = new Date(this.currentYear(), monthIndex, 1);
    this.focusedDate.set(focusDate);
    queueMicrotask(() => this.focusDayButton(focusDate));
  }

  /** Selects a year from the year view and switches to months */
  selectYear(year: number): void {
    this.currentYear.set(year);
    this.focusedYear.set(year);
    this.currentView.set('months');
    queueMicrotask(() => this.focusMonthButton(this.focusedMonth()));
  }

  // ── Day Helpers for Template ─────────────────────────────────

  /** Returns true if the given day matches the keyboard-focused date */
  isDayHighlighted(day: CalendarDay): boolean {
    const focused = this.focusedDate();
    return focused !== null && this.isSameDay(day.date, focused);
  }

  /** Returns the tabindex for a day button (roving tabindex pattern) */
  getDayTabIndex(day: CalendarDay): number {
    const focused = this.focusedDate();
    if (focused && this.isSameDay(day.date, focused)) return 0;
    if (!focused && day.isSelected) return 0;
    return -1;
  }

  /** Returns true if the given month index matches the keyboard-focused month */
  isMonthHighlighted(monthIndex: number): boolean {
    return this.currentView() === 'months' && this.focusedMonth() === monthIndex;
  }

  /** Returns the tabindex for a month button */
  getMonthTabIndex(monthIndex: number): number {
    return this.focusedMonth() === monthIndex ? 0 : -1;
  }

  /** Returns true if the given year matches the keyboard-focused year */
  isYearHighlighted(year: number): boolean {
    return this.currentView() === 'years' && this.focusedYear() === year;
  }

  /** Returns the tabindex for a year button */
  getYearTabIndex(year: number): number {
    return this.focusedYear() === year ? 0 : -1;
  }

  /** Returns a date key string for DOM identification */
  getDateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  // ── Keyboard Handlers ────────────────────────────────────────

  onInputKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    switch (event.key) {
      case 'ArrowDown':
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.open();
        break;
      case 'Escape':
        if (this.isOpen()) {
          event.preventDefault();
          this.close(true);
        }
        break;
      case 'Delete':
      case 'Backspace':
        if (this.hasClearableValue()) {
          event.preventDefault();
          this.clearValue(event);
        }
        break;
    }
  }

  /** Keyboard navigation within the day grid */
  onDayGridKeydown(event: KeyboardEvent): void {
    if (!this.isOpen()) return;
    const focused =
      this.focusedDate() ??
      this.selectedDate() ??
      new Date(this.currentYear(), this.currentMonth(), 1);

    let nextDate: Date | null = null;

    switch (event.key) {
      case 'ArrowRight':
        nextDate = this.findNextEnabledDate(focused, 1);
        break;
      case 'ArrowLeft':
        nextDate = this.findNextEnabledDate(focused, -1);
        break;
      case 'ArrowDown':
        nextDate = this.findNextEnabledDate(focused, 7);
        break;
      case 'ArrowUp':
        nextDate = this.findNextEnabledDate(focused, -7);
        break;
      case 'Home':
        nextDate = this.addDays(focused, -this.getWeekdayIndex(focused));
        break;
      case 'End':
        nextDate = this.addDays(focused, 6 - this.getWeekdayIndex(focused));
        break;
      case 'PageUp':
        nextDate = event.shiftKey ? this.addYears(focused, -1) : this.addMonths(focused, -1);
        break;
      case 'PageDown':
        nextDate = event.shiftKey ? this.addYears(focused, 1) : this.addMonths(focused, 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!this.isDateDisabled(focused)) {
          this.onDayClick({ date: focused } as CalendarDay);
        }
        return;
      case 'Escape':
        event.preventDefault();
        this.close(true);
        return;
      default:
        return;
    }

    if (nextDate) {
      event.preventDefault();
      this.setFocusedDate(nextDate);
    }
  }

  /** Keyboard navigation within the month grid */
  onMonthGridKeydown(event: KeyboardEvent): void {
    let nextMonth = this.focusedMonth();

    switch (event.key) {
      case 'ArrowRight':
        nextMonth = Math.min(11, nextMonth + 1);
        break;
      case 'ArrowLeft':
        nextMonth = Math.max(0, nextMonth - 1);
        break;
      case 'ArrowDown':
        nextMonth = Math.min(11, nextMonth + 3);
        break;
      case 'ArrowUp':
        nextMonth = Math.max(0, nextMonth - 3);
        break;
      case 'Home':
        nextMonth = 0;
        break;
      case 'End':
        nextMonth = 11;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!this.isMonthDisabled(this.currentYear(), nextMonth, this.parsedMin(), this.parsedMax())) {
          this.selectMonth(nextMonth);
        }
        return;
      case 'Escape':
        event.preventDefault();
        this.currentView.set('days');
        queueMicrotask(() => this.focusDayButton(this.focusedDate() ?? new Date()));
        return;
      default:
        return;
    }

    event.preventDefault();
    this.focusedMonth.set(nextMonth);
    queueMicrotask(() => this.focusMonthButton(nextMonth));
  }

  /** Keyboard navigation within the year grid */
  onYearGridKeydown(event: KeyboardEvent): void {
    let nextYear = this.focusedYear();
    const pageStart = this.yearPageStart();

    switch (event.key) {
      case 'ArrowRight':
        nextYear += 1;
        break;
      case 'ArrowLeft':
        nextYear -= 1;
        break;
      case 'ArrowDown':
        nextYear += 3;
        break;
      case 'ArrowUp':
        nextYear -= 3;
        break;
      case 'Home':
        nextYear = pageStart;
        break;
      case 'End':
        nextYear = pageStart + 11;
        break;
      case 'PageUp':
        nextYear -= 12;
        break;
      case 'PageDown':
        nextYear += 12;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!this.isYearDisabled(nextYear, this.parsedMin(), this.parsedMax())) {
          this.selectYear(nextYear);
        }
        return;
      case 'Escape':
        event.preventDefault();
        this.currentView.set('months');
        queueMicrotask(() => this.focusMonthButton(this.focusedMonth()));
        return;
      default:
        return;
    }

    event.preventDefault();
    if (nextYear < pageStart) {
      this.yearPageStart.update((s) => s - 12);
    } else if (nextYear >= pageStart + 12) {
      this.yearPageStart.update((s) => s + 12);
    }
    this.focusedYear.set(nextYear);
    queueMicrotask(() => this.focusYearButton(nextYear));
  }

  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.isOpen() && !target.closest('.ct-datepicker')) {
      this.close(false);
    }
  }

  // ── ControlValueAccessor ─────────────────────────────────────

  writeValue(value: unknown): void {
    if (this.mode() === 'range') {
      this.writeRangeValue(value);
    } else {
      this.writeSingleValue(value);
    }
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  // ── Validator ────────────────────────────────────────────────

  validate(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (this.mode() === 'range') {
      return this.validateRange(value);
    }
    return this.validateSingle(value);
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  // ── Private: Value Handling ──────────────────────────────────

  private writeSingleValue(value: unknown): void {
    const date = this.coerceToDate(value);
    this.selectedDate.set(date);
    if (date) {
      this.currentMonth.set(date.getMonth());
      this.currentYear.set(date.getFullYear());
      this.focusedDate.set(date);
    } else {
      this.focusedDate.set(null);
    }
  }

  private writeRangeValue(value: unknown): void {
    if (!value || typeof value !== 'object') {
      this.rangeStart.set(null);
      this.rangeEnd.set(null);
      this.rangeSelecting.set(false);
      return;
    }
    const range = value as Record<string, unknown>;
    this.rangeStart.set(this.coerceToDate(range['start']));
    this.rangeEnd.set(this.coerceToDate(range['end']));
    this.rangeSelecting.set(false);

    const focus = this.rangeStart() ?? this.rangeEnd();
    if (focus) {
      this.currentMonth.set(focus.getMonth());
      this.currentYear.set(focus.getFullYear());
    }
  }

  private emitSingleValue(date: Date | null): void {
    if (this.valueFormat() === 'iso') {
      this.onChange(date ? this.toIsoString(date) : null);
    } else {
      this.onChange(date);
    }
    this.onValidatorChange();
  }

  private emitRangeValue(start: Date | null, end: Date | null): void {
    if (this.valueFormat() === 'iso') {
      this.onChange({
        start: start ? this.toIsoString(start) : null,
        end: end ? this.toIsoString(end) : null,
      });
    } else {
      this.onChange({ start, end });
    }
    this.onValidatorChange();
  }

  // ── Private: Validation ──────────────────────────────────────

  private validateSingle(value: unknown): ValidationErrors | null {
    if (!value) return null;
    const date = this.coerceToDate(value);
    if (!date) return null;

    const min = this.parsedMin();
    const max = this.parsedMax();

    if (min && this.compareDays(date, min) < 0) {
      return { afDatepickerMin: { min, actual: date } };
    }
    if (max && this.compareDays(date, max) > 0) {
      return { afDatepickerMax: { max, actual: date } };
    }
    if (this.isDateUnavailable(date)) {
      return { afDatepickerFilter: true };
    }
    return null;
  }

  private validateRange(value: unknown): ValidationErrors | null {
    if (!value || typeof value !== 'object') return null;
    const range = value as Record<string, unknown>;
    const start = this.coerceToDate(range['start']);
    const end = this.coerceToDate(range['end']);

    const errors: ValidationErrors = {};
    const min = this.parsedMin();
    const max = this.parsedMax();

    if (start && min && this.compareDays(start, min) < 0) {
      errors['afDatepickerMin'] = { min, actual: start };
    }
    if (end && max && this.compareDays(end, max) > 0) {
      errors['afDatepickerMax'] = { max, actual: end };
    }
    if (start && end && this.compareDays(start, end) > 0) {
      errors['afDatepickerRange'] = { start, end };
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  // ── Private: Calendar Building ───────────────────────────────

  private buildDay(
    date: Date,
    isCurrentMonth: boolean,
    today: Date,
    selected: Date | null,
    rangeStart: Date | null,
    rangeEnd: Date | null,
  ): CalendarDay {
    const isToday = this.isSameDay(date, today);
    const isSelected =
      this.mode() === 'single' && selected !== null ? this.isSameDay(date, selected) : false;
    const isDisabled = this.isDateDisabled(date);
    const isUnavailable = this.isDateUnavailable(date);

    let isInRange = false;
    let isRangeStart = false;
    let isRangeEnd = false;

    if (this.mode() === 'range' && rangeStart) {
      isRangeStart = this.isSameDay(date, rangeStart);
      if (rangeEnd) {
        const [lo, hi] =
          this.compareDays(rangeStart, rangeEnd) <= 0
            ? [rangeStart, rangeEnd]
            : [rangeEnd, rangeStart];
        isRangeStart = this.isSameDay(date, lo);
        isRangeEnd = this.isSameDay(date, hi);
        isInRange =
          !isRangeStart &&
          !isRangeEnd &&
          this.compareDays(date, lo) > 0 &&
          this.compareDays(date, hi) < 0;
      }
    }

    return {
      date,
      isCurrentMonth,
      isToday,
      isSelected,
      isDisabled,
      isUnavailable,
      isInRange,
      isRangeStart,
      isRangeEnd,
    };
  }

  // ── Private: Disability Checks ───────────────────────────────

  /** Checks whether a date falls outside min/max bounds */
  isDateDisabled(date: Date): boolean {
    const min = this.parsedMin();
    const max = this.parsedMax();
    if (min && this.compareDays(date, min) < 0) return true;
    if (max && this.compareDays(date, max) > 0) return true;
    return false;
  }

  /** Checks whether a date is explicitly unavailable (disabledDates or dateFilter) */
  private isDateUnavailable(date: Date): boolean {
    const disabled = this.disabledDates();
    if (disabled.some((d) => this.isSameDay(d, date))) return true;
    const filter = this.dateFilter();
    if (filter && !filter(date)) return true;
    return false;
  }

  private isMonthDisabled(
    year: number,
    month: number,
    min: Date | null,
    max: Date | null,
  ): boolean {
    if (min) {
      const minMonth = new Date(min.getFullYear(), min.getMonth(), 1);
      if (new Date(year, month + 1, 0) < minMonth) return true;
    }
    if (max) {
      const maxMonth = new Date(max.getFullYear(), max.getMonth() + 1, 0);
      if (new Date(year, month, 1) > maxMonth) return true;
    }
    return false;
  }

  private isYearDisabled(year: number, min: Date | null, max: Date | null): boolean {
    if (min && year < min.getFullYear()) return true;
    if (max && year > max.getFullYear()) return true;
    return false;
  }

  // ── Private: Focus Management ────────────────────────────────

  private setFocusedDate(date: Date): void {
    this.currentMonth.set(date.getMonth());
    this.currentYear.set(date.getFullYear());
    this.focusedDate.set(date);
    queueMicrotask(() => this.focusDayButton(date));
  }

  private focusDayButton(date: Date): void {
    const popover = this.popoverRef()?.nativeElement;
    if (!popover) return;
    const key = this.getDateKey(date);
    const button = popover.querySelector<HTMLButtonElement>(
      `.ct-datepicker__day[data-date="${key}"]`,
    );
    button?.focus();
  }

  private focusMonthButton(monthIndex: number): void {
    const popover = this.popoverRef()?.nativeElement;
    if (!popover) return;
    const buttons = popover.querySelectorAll<HTMLButtonElement>('.ct-datepicker__month');
    buttons[monthIndex]?.focus();
  }

  private focusYearButton(year: number): void {
    const popover = this.popoverRef()?.nativeElement;
    if (!popover) return;
    const buttons = popover.querySelectorAll<HTMLButtonElement>('.ct-datepicker__year');
    const pageStart = this.yearPageStart();
    const index = year - pageStart;
    if (index >= 0 && index < buttons.length) {
      buttons[index]?.focus();
    }
  }

  /** Finds the next non-disabled date in the given direction */
  private findNextEnabledDate(from: Date, step: number): Date {
    let next = this.addDays(from, step);
    let attempts = 0;
    const singleStep = step > 0 ? 1 : -1;
    while (this.isDateDisabled(next) && attempts < 365) {
      next = this.addDays(next, singleStep);
      attempts++;
    }
    return next;
  }

  // ── Private: Date Arithmetic ─────────────────────────────────

  private shiftMonth(delta: number): void {
    const base =
      this.focusedDate() ?? new Date(this.currentYear(), this.currentMonth(), 1);
    const next = this.addMonths(base, delta);
    this.setFocusedDate(next);
  }

  private addDays(date: Date, delta: number): Date {
    const next = new Date(date);
    next.setDate(date.getDate() + delta);
    return next;
  }

  private addMonths(date: Date, delta: number): Date {
    const next = new Date(date);
    next.setMonth(date.getMonth() + delta);
    return next;
  }

  private addYears(date: Date, delta: number): Date {
    const next = new Date(date);
    next.setFullYear(date.getFullYear() + delta);
    return next;
  }

  private getWeekdayIndex(date: Date): number {
    const day = date.getDay();
    return day === 0 ? 6 : day - 1;
  }

  // ── Private: Date Comparison & Parsing ───────────────────────

  private isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  private compareDays(a: Date, b: Date): number {
    const da = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
    const db = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
    return da - db;
  }

  private parseDate(value: Date | string | null | undefined): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'string') {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  }

  private coerceToDate(value: unknown): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'string') {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  }

  private toIsoString(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  private formatDate(date: Date): string {
    const tokens: Record<string, string> = {
      yyyy: String(date.getFullYear()),
      MMM: MONTH_SHORT[date.getMonth()],
      MM: String(date.getMonth() + 1).padStart(2, '0'),
      dd: String(date.getDate()).padStart(2, '0'),
      d: String(date.getDate()),
    };
    return this.dateFormat().replace(/yyyy|MMM|MM|dd|d/g, (token) => tokens[token] ?? token);
  }
}
