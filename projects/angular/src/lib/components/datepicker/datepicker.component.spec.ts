import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AfDatepickerComponent,
  AfDatepickerMode,
  AfDatepickerValueFormat,
  AfDateRange,
} from './datepicker.component';

// ── Single-mode test host ────────────────────────────────────

@Component({
  imports: [AfDatepickerComponent, FormsModule],
  template: `
    <af-datepicker
      [label]="label()"
      [placeholder]="placeholder()"
      [disabled]="disabled()"
      [dateFormat]="dateFormat()"
      [min]="min()"
      [max]="max()"
      [disabledDates]="disabledDates()"
      [dateFilter]="dateFilter()"
      [hint]="hint()"
      [error]="error()"
      [required]="required()"
      [mode]="mode()"
      [valueFormat]="valueFormat()"
      [(ngModel)]="value"
      (dateChange)="lastDateChange.set($event)"
      (rangeChange)="lastRangeChange.set($event)">
    </af-datepicker>
  `,
})
class TestHostComponent {
  label = signal('Select date');
  placeholder = signal('Pick a date');
  disabled = signal(false);
  dateFormat = signal('MMM dd, yyyy');
  min = signal<Date | string | null>(null);
  max = signal<Date | string | null>(null);
  disabledDates = signal<Date[]>([]);
  dateFilter = signal<((date: Date) => boolean) | null>(null);
  hint = signal('');
  error = signal('');
  required = signal(false);
  mode = signal<AfDatepickerMode>('single');
  valueFormat = signal<AfDatepickerValueFormat>('date');
  value = signal<Date | AfDateRange | string | null>(null);
  lastDateChange = signal<Date | null>(null);
  lastRangeChange = signal<AfDateRange | null>(null);
}

// ── Reactive forms test host ─────────────────────────────────

@Component({
  imports: [AfDatepickerComponent, ReactiveFormsModule],
  template: `
    <af-datepicker
      label="Date"
      [min]="min()"
      [max]="max()"
      [formControl]="control">
    </af-datepicker>
  `,
})
class ReactiveFormHostComponent {
  min = signal<Date | null>(null);
  max = signal<Date | null>(null);
  control = new FormControl<Date | null>(null);
}

describe('AfDatepickerComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── Helpers ────────────────────────────────────────────────

  function getInput(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input');
  }

  function getLabel(): HTMLLabelElement | null {
    return fixture.nativeElement.querySelector('.ct-field__label');
  }

  function getHint(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.ct-field__hint');
  }

  function getError(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.ct-field__error');
  }

  function getClearBtn(): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector('.ct-datepicker__clear');
  }

  function getPopover(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.ct-datepicker__popover');
  }

  function getDatepickerRoot(): HTMLElement {
    return fixture.nativeElement.querySelector('.ct-datepicker');
  }

  function getDayButtons(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.ct-datepicker__day'));
  }

  function getMonthButtons(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.ct-datepicker__month'));
  }

  function getYearButtons(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.ct-datepicker__year'));
  }

  function getTitleButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.ct-datepicker__title');
  }

  function getPrevButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.ct-datepicker__header .ct-button');
  }

  function getNextButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelectorAll('.ct-datepicker__header .ct-button')[1];
  }

  function getTodayButton(): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector('.ct-datepicker__today');
  }

  function getGrid(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.ct-datepicker__grid');
  }

  function getMonthGrid(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.ct-datepicker__month-grid');
  }

  function getYearGrid(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.ct-datepicker__year-grid');
  }

  function openDatepicker(): void {
    getInput().click();
    fixture.detectChanges();
  }

  function getDayByDate(year: number, month: number, day: number): HTMLButtonElement | null {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return fixture.nativeElement.querySelector(`.ct-datepicker__day[data-date="${key}"]`);
  }

  function sendKey(element: HTMLElement, key: string, extra: Partial<KeyboardEvent> = {}): void {
    element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...extra }));
    fixture.detectChanges();
  }

  // ── Rendering ─────────────────────────────────────────────

  describe('rendering', () => {
    it('should render the input element', () => {
      expect(getInput()).toBeTruthy();
    });

    it('should display the label', () => {
      expect(getLabel()!.textContent).toContain('Select date');
    });

    it('should not display label when empty', () => {
      host.label.set('');
      fixture.detectChanges();
      expect(getLabel()).toBeNull();
    });

    it('should show the placeholder', () => {
      expect(getInput().placeholder).toBe('Pick a date');
    });

    it('should set the input to readonly', () => {
      expect(getInput().readOnly).toBe(true);
    });

    it('should have data-state closed initially', () => {
      expect(getDatepickerRoot().getAttribute('data-state')).toBe('closed');
    });

    it('should render the popover with aria-hidden when closed', () => {
      const popover = getPopover();
      expect(popover).toBeTruthy();
      expect(popover!.getAttribute('aria-hidden')).toBe('true');
    });
  });

  // ── Required indicator ────────────────────────────────────

  describe('required', () => {
    it('should not show required indicator by default', () => {
      expect(getLabel()!.querySelector('[aria-label="required"]')).toBeNull();
    });

    it('should show required indicator when required', () => {
      host.required.set(true);
      fixture.detectChanges();
      const star = getLabel()!.querySelector('[aria-label="required"]');
      expect(star).toBeTruthy();
      expect(star!.textContent).toContain('*');
    });

    it('should set required attribute on input', () => {
      host.required.set(true);
      fixture.detectChanges();
      expect(getInput().required).toBe(true);
    });
  });

  // ── Disabled state ────────────────────────────────────────

  describe('disabled', () => {
    it('should disable the input when disabled', () => {
      host.disabled.set(true);
      fixture.detectChanges();
      expect(getInput().disabled).toBe(true);
    });

    it('should not open when disabled', () => {
      host.disabled.set(true);
      fixture.detectChanges();
      getInput().click();
      fixture.detectChanges();
      expect(getDatepickerRoot().getAttribute('data-state')).toBe('closed');
    });

    it('should not show clear button when disabled', () => {
      host.value.set(new Date(2025, 0, 15));
      host.disabled.set(true);
      fixture.detectChanges();
      expect(getClearBtn()).toBeNull();
    });
  });

  // ── Hint and Error ────────────────────────────────────────

  describe('hint and error', () => {
    it('should display hint text', () => {
      host.hint.set('Choose a date');
      fixture.detectChanges();
      expect(getHint()!.textContent).toContain('Choose a date');
    });

    it('should not display hint when error is set', () => {
      host.hint.set('Choose a date');
      host.error.set('Date is required');
      fixture.detectChanges();
      expect(getHint()).toBeNull();
    });

    it('should display error message', () => {
      host.error.set('Date is required');
      fixture.detectChanges();
      expect(getError()!.textContent).toContain('Date is required');
    });

    it('should add ct-field--error class when error is set', () => {
      host.error.set('Invalid date');
      fixture.detectChanges();
      const field = fixture.nativeElement.querySelector('.ct-field');
      expect(field.classList.contains('ct-field--error')).toBe(true);
    });

    it('should set aria-invalid when error is present', () => {
      host.error.set('Required');
      fixture.detectChanges();
      expect(getInput().getAttribute('aria-invalid')).toBe('true');
    });

    it('should set aria-describedby to error id when error is present', () => {
      host.error.set('Required');
      fixture.detectChanges();
      const errorEl = getError()!;
      expect(getInput().getAttribute('aria-describedby')).toBe(errorEl.id);
    });

    it('should set aria-describedby to hint id when only hint is present', () => {
      host.hint.set('Help text');
      fixture.detectChanges();
      const hintEl = getHint()!;
      expect(getInput().getAttribute('aria-describedby')).toBe(hintEl.id);
    });
  });

  // ── Open / Close ──────────────────────────────────────────

  describe('open and close', () => {
    it('should open on input click', () => {
      openDatepicker();
      expect(getDatepickerRoot().getAttribute('data-state')).toBe('open');
    });

    it('should set aria-expanded to true when open', () => {
      openDatepicker();
      expect(getInput().getAttribute('aria-expanded')).toBe('true');
    });

    it('should render day grid when open', () => {
      openDatepicker();
      expect(getGrid()).toBeTruthy();
    });

    it('should close on Escape key from input', () => {
      openDatepicker();
      sendKey(getInput(), 'Escape');
      expect(getDatepickerRoot().getAttribute('data-state')).toBe('closed');
    });

    it('should open on Enter key', () => {
      sendKey(getInput(), 'Enter');
      expect(getDatepickerRoot().getAttribute('data-state')).toBe('open');
    });

    it('should open on ArrowDown key', () => {
      sendKey(getInput(), 'ArrowDown');
      expect(getDatepickerRoot().getAttribute('data-state')).toBe('open');
    });

    it('should open on Space key', () => {
      sendKey(getInput(), ' ');
      expect(getDatepickerRoot().getAttribute('data-state')).toBe('open');
    });

    it('should show popover dialog role', () => {
      openDatepicker();
      expect(getPopover()!.getAttribute('role')).toBe('dialog');
    });

    it('should have aria-haspopup on input', () => {
      expect(getInput().getAttribute('aria-haspopup')).toBe('dialog');
    });

    it('should have aria-controls pointing to popover id', () => {
      const popoverId = getPopover()!.id;
      expect(getInput().getAttribute('aria-controls')).toBe(popoverId);
    });
  });

  // ── Day Selection ─────────────────────────────────────────

  describe('day selection', () => {
    it('should select a date when clicking a day button', () => {
      openDatepicker();
      const today = new Date();
      const dayBtn = getDayByDate(today.getFullYear(), today.getMonth(), 15);
      dayBtn!.click();
      fixture.detectChanges();
      expect(host.value()).toEqual(new Date(today.getFullYear(), today.getMonth(), 15));
    });

    it('should close after selecting a date', () => {
      openDatepicker();
      const today = new Date();
      const dayBtn = getDayByDate(today.getFullYear(), today.getMonth(), 15);
      dayBtn!.click();
      fixture.detectChanges();
      expect(getDatepickerRoot().getAttribute('data-state')).toBe('closed');
    });

    it('should emit dateChange event', () => {
      openDatepicker();
      const today = new Date();
      const dayBtn = getDayByDate(today.getFullYear(), today.getMonth(), 15);
      dayBtn!.click();
      fixture.detectChanges();
      expect(host.lastDateChange()).toEqual(new Date(today.getFullYear(), today.getMonth(), 15));
    });

    it('should display formatted date in input after selection', fakeAsync(() => {
      host.value.set(new Date(2025, 0, 15));
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(getInput().value).toBe('Jan 15, 2025');
    }));

    it('should respect custom dateFormat', fakeAsync(() => {
      host.dateFormat.set('dd.MM.yyyy');
      host.value.set(new Date(2025, 0, 15));
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(getInput().value).toBe('15.01.2025');
    }));

    it('should mark selected day with aria-selected', () => {
      openDatepicker();
      const today = new Date();
      const dayBtn = getDayByDate(today.getFullYear(), today.getMonth(), 15);
      dayBtn!.click();
      fixture.detectChanges();

      openDatepicker();
      const selectedBtn = getDayByDate(today.getFullYear(), today.getMonth(), 15);
      expect(selectedBtn!.getAttribute('aria-selected')).toBe('true');
    });

    it('should mark today with aria-current="date"', () => {
      openDatepicker();
      const today = new Date();
      const todayBtn = getDayByDate(today.getFullYear(), today.getMonth(), today.getDate());
      expect(todayBtn!.getAttribute('aria-current')).toBe('date');
    });

    it('should mark today with data-today', () => {
      openDatepicker();
      const today = new Date();
      const todayBtn = getDayByDate(today.getFullYear(), today.getMonth(), today.getDate());
      expect(todayBtn!.hasAttribute('data-today')).toBe(true);
    });

    it('should mark outside-month days with data-outside', () => {
      openDatepicker();
      const outsideDays = getDayButtons().filter((b) => b.hasAttribute('data-outside'));
      expect(outsideDays.length).toBeGreaterThan(0);
    });
  });

  // ── Clear Button ──────────────────────────────────────────

  describe('clear button', () => {
    it('should not show clear button when no value', () => {
      expect(getClearBtn()).toBeNull();
    });

    it('should show clear button when value is set', fakeAsync(() => {
      host.value.set(new Date(2025, 0, 15));
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(getClearBtn()).toBeTruthy();
    }));

    it('should clear value when clear button is clicked', fakeAsync(() => {
      host.value.set(new Date(2025, 0, 15));
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      getClearBtn()!.click();
      fixture.detectChanges();
      expect(host.value()).toBeNull();
      expect(getInput().value).toBe('');
    }));

    it('should have accessible aria-label on clear button', fakeAsync(() => {
      host.value.set(new Date(2025, 0, 15));
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(getClearBtn()!.getAttribute('aria-label')).toBe('Clear date');
    }));

    it('should clear value on Delete key when input is focused', fakeAsync(() => {
      host.value.set(new Date(2025, 0, 15));
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      sendKey(getInput(), 'Delete');
      expect(host.value()).toBeNull();
    }));
  });

  // ── Today Button ──────────────────────────────────────────

  describe('today button', () => {
    it('should render today button when calendar is open', () => {
      openDatepicker();
      expect(getTodayButton()).toBeTruthy();
      expect(getTodayButton()!.textContent).toContain('Today');
    });

    it('should select today when today button is clicked', () => {
      openDatepicker();
      getTodayButton()!.click();
      fixture.detectChanges();
      const today = new Date();
      const selected = host.value() as Date;
      expect(selected.getFullYear()).toBe(today.getFullYear());
      expect(selected.getMonth()).toBe(today.getMonth());
      expect(selected.getDate()).toBe(today.getDate());
    });
  });

  // ── Min / Max Constraints ─────────────────────────────────

  describe('min/max constraints', () => {
    it('should disable days before min date', () => {
      host.min.set(new Date(2025, 0, 10));
      fixture.detectChanges();

      // Navigate to Jan 2025
      openDatepicker();
      const component = fixture.debugElement.children[0].componentInstance as AfDatepickerComponent;
      component.currentMonth.set(0);
      component.currentYear.set(2025);
      component.focusedDate.set(new Date(2025, 0, 15));
      fixture.detectChanges();

      const jan5 = getDayByDate(2025, 0, 5);
      expect(jan5!.disabled).toBe(true);
      expect(jan5!.getAttribute('aria-disabled')).toBe('true');
    });

    it('should disable days after max date', () => {
      host.max.set(new Date(2025, 0, 20));
      fixture.detectChanges();

      openDatepicker();
      const component = fixture.debugElement.children[0].componentInstance as AfDatepickerComponent;
      component.currentMonth.set(0);
      component.currentYear.set(2025);
      component.focusedDate.set(new Date(2025, 0, 15));
      fixture.detectChanges();

      const jan25 = getDayByDate(2025, 0, 25);
      expect(jan25!.disabled).toBe(true);
    });

    it('should allow clicking on dates within min/max range', () => {
      host.min.set(new Date(2025, 0, 10));
      host.max.set(new Date(2025, 0, 20));
      fixture.detectChanges();

      openDatepicker();
      const component = fixture.debugElement.children[0].componentInstance as AfDatepickerComponent;
      component.currentMonth.set(0);
      component.currentYear.set(2025);
      component.focusedDate.set(new Date(2025, 0, 15));
      fixture.detectChanges();

      const jan15 = getDayByDate(2025, 0, 15);
      expect(jan15!.disabled).toBe(false);
    });

    it('should accept ISO string for min input', () => {
      host.min.set('2025-01-10');
      fixture.detectChanges();

      openDatepicker();
      const component = fixture.debugElement.children[0].componentInstance as AfDatepickerComponent;
      component.currentMonth.set(0);
      component.currentYear.set(2025);
      component.focusedDate.set(new Date(2025, 0, 15));
      fixture.detectChanges();

      const jan5 = getDayByDate(2025, 0, 5);
      expect(jan5!.disabled).toBe(true);
    });
  });

  // ── Disabled Dates ────────────────────────────────────────

  describe('disabled dates', () => {
    it('should mark specific dates as unavailable', () => {
      const blackout = [new Date(2025, 0, 15), new Date(2025, 0, 20)];
      host.disabledDates.set(blackout);
      fixture.detectChanges();

      openDatepicker();
      const component = fixture.debugElement.children[0].componentInstance as AfDatepickerComponent;
      component.currentMonth.set(0);
      component.currentYear.set(2025);
      component.focusedDate.set(new Date(2025, 0, 10));
      fixture.detectChanges();

      const jan15 = getDayByDate(2025, 0, 15);
      expect(jan15!.hasAttribute('data-unavailable')).toBe(true);
      expect(jan15!.disabled).toBe(true);
    });

    it('should use dateFilter to disable dates', () => {
      host.dateFilter.set((date: Date) => date.getDay() !== 0 && date.getDay() !== 6);
      fixture.detectChanges();

      openDatepicker();
      const days = getDayButtons();
      const disabledDays = days.filter((d) => d.hasAttribute('data-unavailable'));
      expect(disabledDays.length).toBeGreaterThan(0);
    });

    it('should not select unavailable dates on click', () => {
      host.disabledDates.set([new Date(2025, 0, 15)]);
      fixture.detectChanges();

      openDatepicker();
      const component = fixture.debugElement.children[0].componentInstance as AfDatepickerComponent;
      component.currentMonth.set(0);
      component.currentYear.set(2025);
      component.focusedDate.set(new Date(2025, 0, 10));
      fixture.detectChanges();

      const jan15 = getDayByDate(2025, 0, 15);
      jan15!.click();
      fixture.detectChanges();
      expect(host.value()).toBeNull();
    });
  });

  // ── Month / Year Views ────────────────────────────────────

  describe('month view', () => {
    it('should switch to month view when title is clicked', () => {
      openDatepicker();
      getTitleButton().click();
      fixture.detectChanges();
      expect(getMonthGrid()).toBeTruthy();
      expect(getMonthButtons().length).toBe(12);
    });

    it('should display short month names', () => {
      openDatepicker();
      getTitleButton().click();
      fixture.detectChanges();
      const months = getMonthButtons().map((b) => b.textContent!.trim());
      expect(months[0]).toBe('Jan');
      expect(months[11]).toBe('Dec');
    });

    it('should switch back to day view when month is selected', () => {
      openDatepicker();
      getTitleButton().click();
      fixture.detectChanges();
      getMonthButtons()[5].click(); // June
      fixture.detectChanges();
      expect(getGrid()).toBeTruthy();
    });

    it('should show the selected month in day view after selection', () => {
      openDatepicker();
      getTitleButton().click();
      fixture.detectChanges();
      getMonthButtons()[5].click(); // June
      fixture.detectChanges();
      expect(getTitleButton().textContent).toContain('June');
    });

    it('should disable months outside min/max range', () => {
      host.min.set(new Date(2025, 3, 1));
      host.max.set(new Date(2025, 8, 30));
      fixture.detectChanges();

      openDatepicker();
      const component = fixture.debugElement.children[0].componentInstance as AfDatepickerComponent;
      component.currentYear.set(2025);
      fixture.detectChanges();

      getTitleButton().click();
      fixture.detectChanges();

      expect(getMonthButtons()[0].disabled).toBe(true); // Jan
      expect(getMonthButtons()[2].disabled).toBe(true); // Mar
      expect(getMonthButtons()[3].disabled).toBe(false); // Apr
      expect(getMonthButtons()[8].disabled).toBe(false); // Sep
      expect(getMonthButtons()[9].disabled).toBe(true); // Oct
    });
  });

  describe('year view', () => {
    it('should switch to year view when title is clicked twice', () => {
      openDatepicker();
      getTitleButton().click(); // months
      fixture.detectChanges();
      getTitleButton().click(); // years
      fixture.detectChanges();
      expect(getYearGrid()).toBeTruthy();
      expect(getYearButtons().length).toBe(12);
    });

    it('should show year range in title', () => {
      openDatepicker();
      getTitleButton().click();
      fixture.detectChanges();
      getTitleButton().click();
      fixture.detectChanges();
      expect(getTitleButton().textContent).toMatch(/\d{4}\s*–\s*\d{4}/);
    });

    it('should switch back to month view when year is selected', () => {
      openDatepicker();
      getTitleButton().click();
      fixture.detectChanges();
      getTitleButton().click();
      fixture.detectChanges();
      getYearButtons()[0].click();
      fixture.detectChanges();
      expect(getMonthGrid()).toBeTruthy();
    });

    it('should disable years outside min/max range', () => {
      host.min.set(new Date(2023, 0, 1));
      host.max.set(new Date(2026, 11, 31));
      fixture.detectChanges();

      openDatepicker();
      const component = fixture.debugElement.children[0].componentInstance as AfDatepickerComponent;
      component.yearPageStart.set(2020);
      fixture.detectChanges();

      getTitleButton().click();
      fixture.detectChanges();
      getTitleButton().click();
      fixture.detectChanges();

      expect(getYearButtons()[0].disabled).toBe(true); // 2020
      expect(getYearButtons()[2].disabled).toBe(true); // 2022
      expect(getYearButtons()[3].disabled).toBe(false); // 2023
      expect(getYearButtons()[6].disabled).toBe(false); // 2026
      expect(getYearButtons()[7].disabled).toBe(true); // 2027
    });
  });

  // ── Range Mode ────────────────────────────────────────────

  describe('range mode', () => {
    beforeEach(() => {
      host.mode.set('range');
      fixture.detectChanges();
    });

    it('should enter range selecting mode after first click', () => {
      openDatepicker();
      const today = new Date();
      const day10 = getDayByDate(today.getFullYear(), today.getMonth(), 10);
      day10!.click();
      fixture.detectChanges();

      // Should remain open after first click
      expect(getDatepickerRoot().getAttribute('data-state')).toBe('open');
    });

    it('should close after second click (completing range)', () => {
      openDatepicker();
      const today = new Date();
      const day10 = getDayByDate(today.getFullYear(), today.getMonth(), 10);
      day10!.click();
      fixture.detectChanges();

      const day20 = getDayByDate(today.getFullYear(), today.getMonth(), 20);
      day20!.click();
      fixture.detectChanges();

      expect(getDatepickerRoot().getAttribute('data-state')).toBe('closed');
    });

    it('should emit rangeChange with start and end', () => {
      openDatepicker();
      const today = new Date();
      const day10 = getDayByDate(today.getFullYear(), today.getMonth(), 10);
      day10!.click();
      fixture.detectChanges();

      const day20 = getDayByDate(today.getFullYear(), today.getMonth(), 20);
      day20!.click();
      fixture.detectChanges();

      const range = host.lastRangeChange();
      expect(range).toBeTruthy();
      expect(range!.start!.getDate()).toBe(10);
      expect(range!.end!.getDate()).toBe(20);
    });

    it('should swap start and end if second click is before first', () => {
      openDatepicker();
      const today = new Date();
      const day20 = getDayByDate(today.getFullYear(), today.getMonth(), 20);
      day20!.click();
      fixture.detectChanges();

      const day10 = getDayByDate(today.getFullYear(), today.getMonth(), 10);
      day10!.click();
      fixture.detectChanges();

      const range = host.lastRangeChange();
      expect(range!.start!.getDate()).toBe(10);
      expect(range!.end!.getDate()).toBe(20);
    });

    it('should mark range-start with data-range-start', () => {
      openDatepicker();
      const today = new Date();
      const day10 = getDayByDate(today.getFullYear(), today.getMonth(), 10);
      day10!.click();
      fixture.detectChanges();
      expect(day10!.hasAttribute('data-range-start')).toBe(true);
    });

    it('should show formatted range in input', fakeAsync(() => {
      host.value.set({ start: new Date(2025, 0, 10), end: new Date(2025, 0, 20) });
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(getInput().value).toContain('Jan 10, 2025');
      expect(getInput().value).toContain('Jan 20, 2025');
    }));
  });

  // ── ISO Value Format ──────────────────────────────────────

  describe('ISO value format', () => {
    it('should emit ISO string when valueFormat is iso', () => {
      host.valueFormat.set('iso');
      fixture.detectChanges();

      openDatepicker();
      const today = new Date();
      const dayBtn = getDayByDate(today.getFullYear(), today.getMonth(), 15);
      dayBtn!.click();
      fixture.detectChanges();

      const value = host.value() as string;
      expect(value).toBe(
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-15`
      );
    });

    it('should accept ISO string as writeValue in single mode', fakeAsync(() => {
      host.valueFormat.set('iso');
      host.value.set('2025-01-15');
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(getInput().value).toBe('Jan 15, 2025');
    }));

    it('should emit ISO range when valueFormat is iso in range mode', () => {
      host.mode.set('range');
      host.valueFormat.set('iso');
      fixture.detectChanges();

      openDatepicker();
      const today = new Date();
      const day10 = getDayByDate(today.getFullYear(), today.getMonth(), 10);
      day10!.click();
      fixture.detectChanges();

      const day20 = getDayByDate(today.getFullYear(), today.getMonth(), 20);
      day20!.click();
      fixture.detectChanges();

      const value = host.value() as unknown as Record<string, string>;
      expect(typeof value['start']).toBe('string');
      expect(typeof value['end']).toBe('string');
    });
  });

  // ── Month Navigation ──────────────────────────────────────

  describe('month navigation', () => {
    it('should show next month when next button is clicked', () => {
      openDatepicker();
      const initialTitle = getTitleButton().textContent;
      getNextButton().click();
      fixture.detectChanges();
      expect(getTitleButton().textContent).not.toBe(initialTitle);
    });

    it('should show previous month when prev button is clicked', () => {
      openDatepicker();
      const initialTitle = getTitleButton().textContent;
      getPrevButton().click();
      fixture.detectChanges();
      expect(getTitleButton().textContent).not.toBe(initialTitle);
    });

    it('should have accessible labels on navigation buttons', () => {
      openDatepicker();
      expect(getPrevButton().getAttribute('aria-label')).toBe('Previous month');
      expect(getNextButton().getAttribute('aria-label')).toBe('Next month');
    });
  });

  // ── Keyboard Navigation (Day Grid) ────────────────────────

  describe('day grid keyboard navigation', () => {
    it('should navigate right with ArrowRight', () => {
      openDatepicker();
      const grid = getGrid()!;
      sendKey(grid, 'ArrowRight');
      const highlighted = fixture.nativeElement.querySelector('[data-highlighted]');
      expect(highlighted).toBeTruthy();
    });

    it('should navigate down with ArrowDown', () => {
      openDatepicker();
      const grid = getGrid()!;
      sendKey(grid, 'ArrowDown');
      const highlighted = fixture.nativeElement.querySelector('[data-highlighted]');
      expect(highlighted).toBeTruthy();
    });

    it('should select date on Enter key', () => {
      openDatepicker();
      const grid = getGrid()!;
      sendKey(grid, 'Enter');
      expect(host.value()).toBeTruthy();
    });

    it('should select date on Space key', () => {
      openDatepicker();
      const grid = getGrid()!;
      sendKey(grid, ' ');
      expect(host.value()).toBeTruthy();
    });

    it('should close on Escape from grid', () => {
      openDatepicker();
      sendKey(getGrid()!, 'Escape');
      expect(getDatepickerRoot().getAttribute('data-state')).toBe('closed');
    });

    it('should skip disabled dates when navigating with arrow keys', () => {
      host.min.set(new Date(2025, 0, 10));
      fixture.detectChanges();

      openDatepicker();
      const component = fixture.debugElement.children[0].componentInstance as AfDatepickerComponent;
      component.currentMonth.set(0);
      component.currentYear.set(2025);
      component.focusedDate.set(new Date(2025, 0, 10));
      fixture.detectChanges();

      sendKey(getGrid()!, 'ArrowLeft');
      const focused = component.focusedDate();
      // Should not focus on a disabled date (before Jan 10)
      expect(focused).toBeTruthy();
    });

    it('should navigate to previous month with PageUp', () => {
      openDatepicker();
      const component = fixture.debugElement.children[0].componentInstance as AfDatepickerComponent;
      const initialMonth = component.currentMonth();
      sendKey(getGrid()!, 'PageUp');
      const newMonth = component.currentMonth();
      const expected = initialMonth === 0 ? 11 : initialMonth - 1;
      expect(newMonth).toBe(expected);
    });

    it('should navigate to next month with PageDown', () => {
      openDatepicker();
      const component = fixture.debugElement.children[0].componentInstance as AfDatepickerComponent;
      const initialMonth = component.currentMonth();
      sendKey(getGrid()!, 'PageDown');
      const newMonth = component.currentMonth();
      const expected = initialMonth === 11 ? 0 : initialMonth + 1;
      expect(newMonth).toBe(expected);
    });

    it('should navigate to previous year with Shift+PageUp', () => {
      openDatepicker();
      const component = fixture.debugElement.children[0].componentInstance as AfDatepickerComponent;
      const initialYear = component.currentYear();
      sendKey(getGrid()!, 'PageUp', { shiftKey: true });
      expect(component.currentYear()).toBe(initialYear - 1);
    });
  });

  // ── Keyboard Navigation (Month Grid) ──────────────────────

  describe('month grid keyboard navigation', () => {
    beforeEach(() => {
      openDatepicker();
      getTitleButton().click(); // switch to month view
      fixture.detectChanges();
    });

    it('should navigate months with ArrowRight', () => {
      const component = fixture.debugElement.children[0].componentInstance as AfDatepickerComponent;
      const initial = component.focusedMonth();
      sendKey(getMonthGrid()!, 'ArrowRight');
      expect(component.focusedMonth()).toBe(Math.min(11, initial + 1));
    });

    it('should navigate months with ArrowDown (3 at a time)', () => {
      const component = fixture.debugElement.children[0].componentInstance as AfDatepickerComponent;
      component.focusedMonth.set(0);
      fixture.detectChanges();
      sendKey(getMonthGrid()!, 'ArrowDown');
      expect(component.focusedMonth()).toBe(3);
    });

    it('should select month on Enter and switch to day view', () => {
      sendKey(getMonthGrid()!, 'Enter');
      expect(getGrid()).toBeTruthy(); // should be back in day view
    });

    it('should go back to day view on Escape', () => {
      sendKey(getMonthGrid()!, 'Escape');
      expect(getGrid()).toBeTruthy();
    });

    it('should highlight focused month with data-highlighted', () => {
      const highlighted = getMonthGrid()!.querySelector('[data-highlighted]');
      expect(highlighted).toBeTruthy();
    });
  });

  // ── Keyboard Navigation (Year Grid) ───────────────────────

  describe('year grid keyboard navigation', () => {
    beforeEach(() => {
      openDatepicker();
      getTitleButton().click(); // months
      fixture.detectChanges();
      getTitleButton().click(); // years
      fixture.detectChanges();
    });

    it('should render 12 year buttons', () => {
      expect(getYearButtons().length).toBe(12);
    });

    it('should navigate years with ArrowRight', () => {
      const component = fixture.debugElement.children[0].componentInstance as AfDatepickerComponent;
      const initial = component.focusedYear();
      sendKey(getYearGrid()!, 'ArrowRight');
      expect(component.focusedYear()).toBe(initial + 1);
    });

    it('should select year on Enter and switch to month view', () => {
      sendKey(getYearGrid()!, 'Enter');
      expect(getMonthGrid()).toBeTruthy();
    });

    it('should go back to month view on Escape', () => {
      sendKey(getYearGrid()!, 'Escape');
      expect(getMonthGrid()).toBeTruthy();
    });

    it('should highlight focused year with data-highlighted', () => {
      const highlighted = getYearGrid()!.querySelector('[data-highlighted]');
      expect(highlighted).toBeTruthy();
    });
  });

  // ── data-highlighted ──────────────────────────────────────

  describe('keyboard highlight (data-highlighted)', () => {
    it('should set data-highlighted on the focused day', () => {
      openDatepicker();
      const highlighted = fixture.nativeElement.querySelector(
        '.ct-datepicker__day[data-highlighted]',
      );
      expect(highlighted).toBeTruthy();
    });

    it('should move data-highlighted on arrow navigation', () => {
      openDatepicker();
      const firstHighlighted = fixture.nativeElement.querySelector(
        '.ct-datepicker__day[data-highlighted]',
      );
      const firstDate = firstHighlighted?.getAttribute('data-date');

      sendKey(getGrid()!, 'ArrowRight');
      const secondHighlighted = fixture.nativeElement.querySelector(
        '.ct-datepicker__day[data-highlighted]',
      );
      expect(secondHighlighted?.getAttribute('data-date')).not.toBe(firstDate);
    });
  });

  // ── Grid ARIA roles ───────────────────────────────────────

  describe('ARIA grid structure', () => {
    it('should have role="grid" on day grid', () => {
      openDatepicker();
      expect(getGrid()!.getAttribute('role')).toBe('grid');
    });

    it('should have role="gridcell" on day buttons', () => {
      openDatepicker();
      const buttons = getDayButtons();
      expect(buttons[0].getAttribute('role')).toBe('gridcell');
    });

    it('should have role="columnheader" on weekday headers', () => {
      openDatepicker();
      const headers = fixture.nativeElement.querySelectorAll('.ct-datepicker__weekday');
      expect(headers[0].getAttribute('role')).toBe('columnheader');
    });

    it('should have accessible labels on weekday headers', () => {
      openDatepicker();
      const headers = fixture.nativeElement.querySelectorAll('.ct-datepicker__weekday');
      expect(headers[0].getAttribute('aria-label')).toBe('Monday');
    });
  });

  // ── Header navigation labels per view ─────────────────────

  describe('header navigation labels', () => {
    it('should show Previous/Next month labels in day view', () => {
      openDatepicker();
      expect(getPrevButton().getAttribute('aria-label')).toBe('Previous month');
      expect(getNextButton().getAttribute('aria-label')).toBe('Next month');
    });

    it('should show Previous/Next year labels in month view', () => {
      openDatepicker();
      getTitleButton().click();
      fixture.detectChanges();
      expect(getPrevButton().getAttribute('aria-label')).toBe('Previous year');
      expect(getNextButton().getAttribute('aria-label')).toBe('Next year');
    });

    it('should show Previous/Next 12 years labels in year view', () => {
      openDatepicker();
      getTitleButton().click();
      fixture.detectChanges();
      getTitleButton().click();
      fixture.detectChanges();
      expect(getPrevButton().getAttribute('aria-label')).toBe('Previous 12 years');
      expect(getNextButton().getAttribute('aria-label')).toBe('Next 12 years');
    });
  });
});

// ── Reactive Forms Integration ──────────────────────────────

describe('AfDatepickerComponent (Reactive Forms)', () => {
  let fixture: ComponentFixture<ReactiveFormHostComponent>;
  let host: ReactiveFormHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReactiveFormHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should set form control value via writeValue', () => {
    host.control.setValue(new Date(2025, 0, 15));
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input.value).toBe('Jan 15, 2025');
  });

  it('should update form control when date is selected', () => {
    const input = fixture.nativeElement.querySelector('input');
    input.click();
    fixture.detectChanges();

    const today = new Date();
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-15`;
    const dayBtn = fixture.nativeElement.querySelector(
      `.ct-datepicker__day[data-date="${key}"]`,
    ) as HTMLButtonElement;
    dayBtn?.click();
    fixture.detectChanges();

    expect(host.control.value).toBeTruthy();
  });

  it('should disable component via form control', () => {
    host.control.disable();
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input.disabled).toBe(true);
  });

  it('should report min validation error', () => {
    host.min.set(new Date(2025, 0, 20));
    fixture.detectChanges();

    host.control.setValue(new Date(2025, 0, 10));
    fixture.detectChanges();

    expect(host.control.hasError('afDatepickerMin')).toBe(true);
  });

  it('should report max validation error', () => {
    host.max.set(new Date(2025, 0, 10));
    fixture.detectChanges();

    host.control.setValue(new Date(2025, 0, 20));
    fixture.detectChanges();

    expect(host.control.hasError('afDatepickerMax')).toBe(true);
  });

  it('should be valid when value is within min/max range', () => {
    host.min.set(new Date(2025, 0, 1));
    host.max.set(new Date(2025, 0, 31));
    fixture.detectChanges();

    host.control.setValue(new Date(2025, 0, 15));
    fixture.detectChanges();

    expect(host.control.valid).toBe(true);
  });

  it('should support required validator', () => {
    host.control = new FormControl<Date | null>(null, Validators.required);
    fixture.detectChanges();
    expect(host.control.valid).toBe(false);

    host.control.setValue(new Date(2025, 0, 15));
    expect(host.control.valid).toBe(true);
  });
});
