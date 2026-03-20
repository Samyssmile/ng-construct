import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AfComboboxComponent, AfComboboxOption } from './combobox.component';

const TEST_OPTIONS: AfComboboxOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date', disabled: true },
  { value: 'elderberry', label: 'Elderberry', description: 'A small dark berry' },
];

describe('AfComboboxComponent', () => {
  let component: AfComboboxComponent;
  let fixture: ComponentFixture<AfComboboxComponent>;
  let inputEl: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfComboboxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AfComboboxComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', TEST_OPTIONS);
    fixture.detectChanges();
    inputEl = fixture.nativeElement.querySelector('input[role="combobox"]');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should render a combobox input', () => {
      expect(inputEl).toBeTruthy();
      expect(inputEl.getAttribute('role')).toBe('combobox');
    });

    it('should render label when provided', () => {
      fixture.componentRef.setInput('label', 'Fruit');
      fixture.detectChanges();

      const label = fixture.nativeElement.querySelector('.ct-field__label');
      expect(label).toBeTruthy();
      expect(label.textContent).toContain('Fruit');
    });

    it('should show required indicator', () => {
      fixture.componentRef.setInput('label', 'Fruit');
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      const required = fixture.nativeElement.querySelector('[aria-label="required"]');
      expect(required).toBeTruthy();
    });

    it('should show hint text', () => {
      fixture.componentRef.setInput('hint', 'Choose a fruit');
      fixture.detectChanges();

      const hint = fixture.nativeElement.querySelector('.ct-field__hint');
      expect(hint).toBeTruthy();
      expect(hint.textContent).toContain('Choose a fruit');
    });

    it('should show error text and hide hint', () => {
      fixture.componentRef.setInput('hint', 'Choose a fruit');
      fixture.componentRef.setInput('error', 'Required field');
      fixture.detectChanges();

      const hint = fixture.nativeElement.querySelector('.ct-field__hint');
      const error = fixture.nativeElement.querySelector('.ct-field__error');
      expect(hint).toBeNull();
      expect(error).toBeTruthy();
      expect(error.textContent).toContain('Required field');
    });

    it('should apply placeholder', () => {
      fixture.componentRef.setInput('placeholder', 'Type to search...');
      fixture.detectChanges();

      expect(inputEl.placeholder).toBe('Type to search...');
    });

    it('should not render listbox options when closed', () => {
      const listbox = fixture.nativeElement.querySelector('[role="listbox"]');
      expect(listbox).toBeTruthy();
      const container = fixture.nativeElement.querySelector('.ct-combobox');
      expect(container.getAttribute('data-state')).toBe('closed');
    });
  });

  describe('size variants', () => {
    it('should apply sm size class', () => {
      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();

      const combobox = fixture.nativeElement.querySelector('.ct-combobox');
      expect(combobox.classList.contains('ct-combobox--sm')).toBe(true);
    });

    it('should apply lg size class', () => {
      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();

      const combobox = fixture.nativeElement.querySelector('.ct-combobox');
      expect(combobox.classList.contains('ct-combobox--lg')).toBe(true);
    });

    it('should not apply size modifier for md (default)', () => {
      const combobox = fixture.nativeElement.querySelector('.ct-combobox');
      expect(combobox.classList.contains('ct-combobox--sm')).toBe(false);
      expect(combobox.classList.contains('ct-combobox--lg')).toBe(false);
    });
  });

  describe('opening and closing', () => {
    it('should open on focus', () => {
      inputEl.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.ct-combobox');
      expect(container.getAttribute('data-state')).toBe('open');
    });

    it('should close on blur', () => {
      inputEl.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      inputEl.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.ct-combobox');
      expect(container.getAttribute('data-state')).toBe('closed');
    });

    it('should toggle on trigger button click', () => {
      const trigger = fixture.nativeElement.querySelector('.ct-combobox__trigger');
      trigger.click();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.ct-combobox').getAttribute('data-state')).toBe(
        'open'
      );

      trigger.click();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.ct-combobox').getAttribute('data-state')).toBe(
        'closed'
      );
    });

    it('should close on Escape', () => {
      inputEl.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();

      expect(component.isOpen()).toBe(false);
    });
  });

  describe('filtering', () => {
    it('should filter options based on input', () => {
      inputEl.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      inputEl.value = 'ban';
      inputEl.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const options = fixture.nativeElement.querySelectorAll('.ct-combobox__option');
      expect(options.length).toBe(1);
      expect(options[0].textContent).toContain('Banana');
    });

    it('should be case-insensitive', () => {
      inputEl.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      inputEl.value = 'CHERRY';
      inputEl.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const options = fixture.nativeElement.querySelectorAll('.ct-combobox__option');
      expect(options.length).toBe(1);
      expect(options[0].textContent).toContain('Cherry');
    });

    it('should show empty state when no options match', () => {
      inputEl.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      inputEl.value = 'xyz';
      inputEl.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const empty = fixture.nativeElement.querySelector('.ct-combobox__empty');
      expect(empty).toBeTruthy();
      expect(empty.textContent).toContain('No results found');
    });

    it('should use custom empty text', () => {
      fixture.componentRef.setInput('emptyText', 'Nothing here');
      inputEl.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      inputEl.value = 'xyz';
      inputEl.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const empty = fixture.nativeElement.querySelector('.ct-combobox__empty');
      expect(empty.textContent).toContain('Nothing here');
    });

    it('should show all options when query matches selected label', () => {
      component.selectOption(TEST_OPTIONS[0]);
      fixture.detectChanges();

      inputEl.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      const options = fixture.nativeElement.querySelectorAll('.ct-combobox__option');
      expect(options.length).toBe(TEST_OPTIONS.length);
    });
  });

  describe('selection', () => {
    it('should select an option on click', () => {
      const changeSpy = vi.fn();
      component.registerOnChange(changeSpy);

      inputEl.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      const options = fixture.nativeElement.querySelectorAll('.ct-combobox__option');
      options[1].click();
      fixture.detectChanges();

      expect(changeSpy).toHaveBeenCalledWith('banana');
      expect(inputEl.value).toBe('Banana');
    });

    it('should not select a disabled option', () => {
      const changeSpy = vi.fn();
      component.registerOnChange(changeSpy);

      inputEl.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      const options = fixture.nativeElement.querySelectorAll('.ct-combobox__option');
      options[3].click(); // Date is disabled
      fixture.detectChanges();

      expect(changeSpy).not.toHaveBeenCalled();
    });

    it('should show checkmark for selected option', () => {
      component.selectOption(TEST_OPTIONS[0]);
      inputEl.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      const firstOption = fixture.nativeElement.querySelectorAll('.ct-combobox__option')[0];
      expect(firstOption.getAttribute('aria-selected')).toBe('true');
      const checkmark = firstOption.querySelector('.ct-combobox__option-check svg');
      expect(checkmark).toBeTruthy();
    });

    it('should clear value when input is emptied', () => {
      const changeSpy = vi.fn();
      component.registerOnChange(changeSpy);
      component.selectOption(TEST_OPTIONS[0]);
      fixture.detectChanges();

      inputEl.value = '';
      inputEl.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(changeSpy).toHaveBeenCalledWith(null);
    });

    it('should restore display value on close without selection', () => {
      component.selectOption(TEST_OPTIONS[1]);
      fixture.detectChanges();

      inputEl.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      inputEl.value = 'xyz';
      inputEl.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();

      expect(component.query()).toBe('Banana');
    });
  });

  describe('keyboard navigation', () => {
    beforeEach(() => {
      inputEl.dispatchEvent(new Event('focus'));
      fixture.detectChanges();
    });

    it('should highlight next option on ArrowDown', () => {
      inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      fixture.detectChanges();

      expect(component.highlightedIndex()).toBe(1);
    });

    it('should highlight previous option on ArrowUp', () => {
      component.highlightedIndex.set(2);
      inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      fixture.detectChanges();

      expect(component.highlightedIndex()).toBe(1);
    });

    it('should wrap around from last to first', () => {
      component.highlightedIndex.set(4);
      inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      fixture.detectChanges();

      expect(component.highlightedIndex()).toBe(0);
    });

    it('should wrap around from first to last', () => {
      component.highlightedIndex.set(0);
      inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      fixture.detectChanges();

      expect(component.highlightedIndex()).toBe(4);
    });

    it('should skip disabled options', () => {
      component.highlightedIndex.set(2); // Cherry
      inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      fixture.detectChanges();

      // Should skip Date (index 3, disabled) and land on Elderberry (index 4)
      expect(component.highlightedIndex()).toBe(4);
    });

    it('should select highlighted option on Enter', () => {
      const changeSpy = vi.fn();
      component.registerOnChange(changeSpy);

      component.highlightedIndex.set(2);
      inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      fixture.detectChanges();

      expect(changeSpy).toHaveBeenCalledWith('cherry');
    });

    it('should not select disabled option on Enter', () => {
      const changeSpy = vi.fn();
      component.registerOnChange(changeSpy);

      component.highlightedIndex.set(3); // Date is disabled
      inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      fixture.detectChanges();

      expect(changeSpy).not.toHaveBeenCalled();
    });

    it('should go to first option on Home', () => {
      component.highlightedIndex.set(3);
      inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
      fixture.detectChanges();

      expect(component.highlightedIndex()).toBe(0);
    });

    it('should go to last option on End', () => {
      component.highlightedIndex.set(0);
      inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
      fixture.detectChanges();

      expect(component.highlightedIndex()).toBe(4);
    });

    it('should open listbox on ArrowDown when closed', () => {
      component.isOpen.set(false);
      inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      fixture.detectChanges();

      expect(component.isOpen()).toBe(true);
    });

    it('should open listbox on Enter when closed', () => {
      component.isOpen.set(false);
      inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      fixture.detectChanges();

      expect(component.isOpen()).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('should have correct ARIA attributes on input', () => {
      expect(inputEl.getAttribute('role')).toBe('combobox');
      expect(inputEl.getAttribute('aria-autocomplete')).toBe('list');
      expect(inputEl.getAttribute('aria-expanded')).toBe('false');
      expect(inputEl.getAttribute('autocomplete')).toBe('off');
    });

    it('should set aria-expanded when open', () => {
      inputEl.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      expect(inputEl.getAttribute('aria-expanded')).toBe('true');
    });

    it('should have aria-controls pointing to listbox', () => {
      const listbox = fixture.nativeElement.querySelector('[role="listbox"]');
      expect(inputEl.getAttribute('aria-controls')).toBe(listbox.id);
    });

    it('should set aria-activedescendant on highlight', () => {
      inputEl.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      component.highlightedIndex.set(1);
      fixture.detectChanges();

      const expectedId = component.getOptionId(1);
      expect(inputEl.getAttribute('aria-activedescendant')).toBe(expectedId);
    });

    it('should clear aria-activedescendant when no highlight', () => {
      component.highlightedIndex.set(-1);
      fixture.detectChanges();

      expect(inputEl.getAttribute('aria-activedescendant')).toBeNull();
    });

    it('should set aria-invalid when error is present', () => {
      fixture.componentRef.setInput('error', 'Required');
      fixture.detectChanges();

      expect(inputEl.getAttribute('aria-invalid')).toBe('true');
    });

    it('should not set aria-invalid when no error', () => {
      expect(inputEl.getAttribute('aria-invalid')).toBeNull();
    });

    it('should set aria-describedby to error id when error', () => {
      fixture.componentRef.setInput('error', 'Required');
      fixture.detectChanges();

      const errorEl = fixture.nativeElement.querySelector('.ct-field__error');
      expect(inputEl.getAttribute('aria-describedby')).toBe(errorEl.id);
    });

    it('should set aria-describedby to hint id when hint', () => {
      fixture.componentRef.setInput('hint', 'Helpful hint');
      fixture.detectChanges();

      const hintEl = fixture.nativeElement.querySelector('.ct-field__hint');
      expect(inputEl.getAttribute('aria-describedby')).toBe(hintEl.id);
    });

    it('should set aria-required when required', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      expect(inputEl.getAttribute('aria-required')).toBe('true');
    });

    it('should set aria-selected on selected option', () => {
      component.selectOption(TEST_OPTIONS[0]);
      inputEl.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      const options = fixture.nativeElement.querySelectorAll('[role="option"]');
      expect(options[0].getAttribute('aria-selected')).toBe('true');
      expect(options[1].getAttribute('aria-selected')).toBe('false');
    });

    it('should set aria-disabled on disabled options', () => {
      inputEl.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      const options = fixture.nativeElement.querySelectorAll('[role="option"]');
      expect(options[3].getAttribute('aria-disabled')).toBe('true');
    });

    it('should have data-highlighted on highlighted option', () => {
      inputEl.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      component.highlightedIndex.set(1);
      fixture.detectChanges();

      const options = fixture.nativeElement.querySelectorAll('[role="option"]');
      expect(options[1].hasAttribute('data-highlighted')).toBe(true);
      expect(options[0].hasAttribute('data-highlighted')).toBe(false);
    });

    it('should have a live region for status announcements', () => {
      const status = fixture.nativeElement.querySelector('.ct-combobox__status');
      expect(status).toBeTruthy();
      expect(status.getAttribute('role')).toBe('status');
      expect(status.getAttribute('aria-live')).toBe('polite');
      expect(status.getAttribute('aria-atomic')).toBe('true');
    });

    it('should announce result count when open', () => {
      inputEl.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      const status = fixture.nativeElement.querySelector('.ct-combobox__status');
      expect(status.textContent.trim()).toBe('5 results available');
    });

    it('should announce single result', () => {
      inputEl.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      inputEl.value = 'ban';
      inputEl.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const status = fixture.nativeElement.querySelector('.ct-combobox__status');
      expect(status.textContent.trim()).toBe('1 result available');
    });

    it('should set aria-label on listbox', () => {
      fixture.componentRef.setInput('label', 'Fruits');
      fixture.detectChanges();

      const listbox = fixture.nativeElement.querySelector('[role="listbox"]');
      expect(listbox.getAttribute('aria-label')).toBe('Fruits');
    });

    it('should render option descriptions', () => {
      inputEl.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      const desc = fixture.nativeElement.querySelector('.ct-combobox__option-description');
      expect(desc).toBeTruthy();
      expect(desc.textContent).toContain('A small dark berry');
    });
  });

  describe('disabled state', () => {
    it('should disable the input', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      expect(inputEl.disabled).toBe(true);
    });

    it('should disable the trigger button', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const trigger = fixture.nativeElement.querySelector('.ct-combobox__trigger');
      expect(trigger.disabled).toBe(true);
    });

    it('should not open when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      component.openListbox();
      expect(component.isOpen()).toBe(false);
    });
  });

  describe('ControlValueAccessor', () => {
    it('should write value and display label', () => {
      component.writeValue('cherry');
      fixture.detectChanges();

      expect(component.query()).toBe('Cherry');
    });

    it('should handle null/undefined in writeValue', () => {
      component.writeValue(null);
      expect(component.query()).toBe('');

      component.writeValue(undefined);
      expect(component.query()).toBe('');
    });

    it('should notify form control on selection', () => {
      const changeSpy = vi.fn();
      component.registerOnChange(changeSpy);

      component.selectOption(TEST_OPTIONS[2]);
      expect(changeSpy).toHaveBeenCalledWith('cherry');
    });

    it('should call onTouched on blur', () => {
      const touchedSpy = vi.fn();
      component.registerOnTouched(touchedSpy);

      inputEl.dispatchEvent(new Event('blur'));
      expect(touchedSpy).toHaveBeenCalled();
    });

    it('should set disabled state from form', () => {
      component.setDisabledState(true);
      fixture.detectChanges();

      expect(component.disabled()).toBe(true);
      expect(inputEl.disabled).toBe(true);
    });
  });

  describe('compareWith', () => {
    it('should use custom comparison function', () => {
      const objectOptions: AfComboboxOption[] = [
        { value: { id: 1 }, label: 'One' },
        { value: { id: 2 }, label: 'Two' },
      ];
      fixture.componentRef.setInput('options', objectOptions);
      fixture.componentRef.setInput(
        'compareWith',
        (a: { id: number }, b: { id: number }) => a?.id === b?.id
      );
      fixture.detectChanges();

      component.writeValue({ id: 2 });
      fixture.detectChanges();

      expect(component.query()).toBe('Two');
    });
  });
});

@Component({
  template: `<af-combobox [options]="options" [formControl]="control" label="Fruit" />`,
  imports: [AfComboboxComponent, ReactiveFormsModule],
})
class TestHostComponent {
  control = new FormControl('banana');
  options: AfComboboxOption[] = TEST_OPTIONS;
}

describe('AfComboboxComponent with Reactive Forms', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let inputEl: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    inputEl = fixture.nativeElement.querySelector('input[role="combobox"]');
  });

  it('should initialize with form control value', () => {
    expect(inputEl.value).toBe('Banana');
  });

  it('should update form control when option is selected', () => {
    inputEl.dispatchEvent(new Event('focus'));
    fixture.detectChanges();

    const options = fixture.nativeElement.querySelectorAll('.ct-combobox__option');
    options[2].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBe('cherry');
  });

  it('should update display when form control value changes', () => {
    fixture.componentInstance.control.setValue('apple');
    fixture.detectChanges();

    expect(inputEl.value).toBe('Apple');
  });

  it('should disable combobox when form control is disabled', () => {
    fixture.componentInstance.control.disable();
    fixture.detectChanges();

    expect(inputEl.disabled).toBe(true);
  });
});
