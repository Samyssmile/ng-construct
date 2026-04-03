import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AfSelectMenuComponent, AfSelectMenuOption } from './select-menu.component';
import { AriaLiveAnnouncer } from '../../utils/aria-live-announcer';
import { AF_SELECT_MENU_I18N } from './select-menu.i18n';
import { checkA11y } from '../../testing/axe-helper';

const FRUITS: AfSelectMenuOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'fig', label: 'Fig', disabled: true },
];

describe('AfSelectMenuComponent', () => {
  let component: AfSelectMenuComponent;
  let fixture: ComponentFixture<AfSelectMenuComponent>;
  let triggerEl: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfSelectMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AfSelectMenuComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', FRUITS);
    fixture.componentRef.setInput('placeholder', 'Select a fruit');
    fixture.detectChanges();
    triggerEl = fixture.nativeElement.querySelector('.ct-select-menu__trigger');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should render the trigger button', () => {
      expect(triggerEl).toBeTruthy();
      expect(triggerEl.getAttribute('role')).toBe('combobox');
    });

    it('should show placeholder when no value', () => {
      const value = triggerEl.querySelector('.ct-select-menu__value');
      expect(value!.textContent).toContain('Select a fruit');
      expect(value!.hasAttribute('data-placeholder')).toBe(true);
    });

    it('should show label when provided', () => {
      fixture.componentRef.setInput('label', 'Fruit');
      fixture.detectChanges();
      const label = fixture.nativeElement.querySelector('.ct-field__label');
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
      fixture.componentRef.setInput('hint', 'Choose one');
      fixture.detectChanges();
      const hint = fixture.nativeElement.querySelector('.ct-field__hint');
      expect(hint.textContent).toContain('Choose one');
    });

    it('should show error message', () => {
      fixture.componentRef.setInput('error', 'Required field');
      fixture.detectChanges();
      const error = fixture.nativeElement.querySelector('.ct-field__error');
      expect(error.textContent).toContain('Required field');
      expect(fixture.nativeElement.querySelector('.ct-field--error')).toBeTruthy();
    });

    it('should render options when open', () => {
      component.openListbox();
      fixture.detectChanges();

      const options = fixture.nativeElement.querySelectorAll('[role="option"]');
      expect(options.length).toBe(4);
      expect(options[0].textContent).toContain('Apple');
      expect(options[3].textContent).toContain('Fig');
    });

    it('should apply size classes', () => {
      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.ct-select-menu--sm')).toBeTruthy();

      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.ct-select-menu--lg')).toBeTruthy();
    });

    it('should not add size class for md (default)', () => {
      const menu = fixture.nativeElement.querySelector('.ct-select-menu');
      expect(menu.className).toBe('ct-select-menu');
    });

    it('should show chevron icon', () => {
      const icon = triggerEl.querySelector('.ct-select-menu__icon svg');
      expect(icon).toBeTruthy();
    });
  });

  describe('open/close', () => {
    it('should start closed', () => {
      expect(component.isOpen()).toBe(false);
      const menu = fixture.nativeElement.querySelector('.ct-select-menu');
      expect(menu.getAttribute('data-state')).toBe('closed');
    });

    it('should open on click', () => {
      triggerEl.click();
      fixture.detectChanges();
      expect(component.isOpen()).toBe(true);
      expect(fixture.nativeElement.querySelector('[data-state="open"]')).toBeTruthy();
    });

    it('should close on second click', () => {
      triggerEl.click();
      fixture.detectChanges();
      triggerEl.click();
      fixture.detectChanges();
      expect(component.isOpen()).toBe(false);
    });

    it('should not open when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      component.openListbox();
      expect(component.isOpen()).toBe(false);
    });

    it('should close on Escape', () => {
      component.openListbox();
      fixture.detectChanges();

      component.onKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();
      expect(component.isOpen()).toBe(false);
    });
  });

  describe('single select', () => {
    it('should select an option on click', () => {
      const changeSpy = vi.fn();
      component.registerOnChange(changeSpy);

      component.openListbox();
      fixture.detectChanges();

      const options = fixture.nativeElement.querySelectorAll('[role="option"]');
      options[1].click();
      fixture.detectChanges();

      expect(changeSpy).toHaveBeenCalledWith('banana');
      expect(component.isOpen()).toBe(false);
    });

    it('should display selected value', () => {
      component.writeValue('cherry');
      fixture.detectChanges();

      const value = triggerEl.querySelector('.ct-select-menu__value');
      expect(value!.textContent).toContain('Cherry');
      expect(value!.hasAttribute('data-placeholder')).toBe(false);
    });

    it('should mark selected option with aria-selected', () => {
      component.writeValue('banana');
      component.openListbox();
      fixture.detectChanges();

      const options = fixture.nativeElement.querySelectorAll('[role="option"]');
      expect(options[0].getAttribute('aria-selected')).toBe('false');
      expect(options[1].getAttribute('aria-selected')).toBe('true');
      expect(options[2].getAttribute('aria-selected')).toBe('false');
    });

    it('should not select disabled options', () => {
      const changeSpy = vi.fn();
      component.registerOnChange(changeSpy);

      component.selectOption(FRUITS[3]);
      expect(changeSpy).not.toHaveBeenCalled();
    });

    it('should close and return focus after selection', () => {
      component.openListbox();
      fixture.detectChanges();

      component.selectOption(FRUITS[0]);
      fixture.detectChanges();

      expect(component.isOpen()).toBe(false);
    });
  });

  describe('multi select', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('multiple', true);
      fixture.detectChanges();
    });

    it('should toggle options', () => {
      const changeSpy = vi.fn();
      component.registerOnChange(changeSpy);

      component.selectOption(FRUITS[0]);
      expect(changeSpy).toHaveBeenCalledWith(['apple']);

      component.selectOption(FRUITS[1]);
      expect(changeSpy).toHaveBeenCalledWith(['apple', 'banana']);

      component.selectOption(FRUITS[0]);
      expect(changeSpy).toHaveBeenCalledWith(['banana']);
    });

    it('should keep listbox open after selection', () => {
      component.openListbox();
      component.selectOption(FRUITS[0]);
      fixture.detectChanges();

      expect(component.isOpen()).toBe(true);
    });

    it('should display multiple selected labels', () => {
      component.writeValue(['apple', 'cherry']);
      fixture.detectChanges();

      const value = triggerEl.querySelector('.ct-select-menu__value');
      expect(value!.textContent).toContain('Apple');
      expect(value!.textContent).toContain('Cherry');
    });

    it('should set aria-multiselectable on listbox', () => {
      component.openListbox();
      fixture.detectChanges();

      const listbox = fixture.nativeElement.querySelector('[role="listbox"]');
      expect(listbox.getAttribute('aria-multiselectable')).toBe('true');
    });

    it('should mark multiple options as selected', () => {
      component.writeValue(['apple', 'cherry']);
      component.openListbox();
      fixture.detectChanges();

      const options = fixture.nativeElement.querySelectorAll('[role="option"]');
      expect(options[0].getAttribute('aria-selected')).toBe('true');
      expect(options[1].getAttribute('aria-selected')).toBe('false');
      expect(options[2].getAttribute('aria-selected')).toBe('true');
    });

    it('should write empty array for null value', () => {
      component.writeValue(null);
      fixture.detectChanges();

      const value = triggerEl.querySelector('.ct-select-menu__value');
      expect(value!.textContent).toContain('Select a fruit');
    });
  });

  describe('keyboard navigation', () => {
    it('should open on ArrowDown', () => {
      component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      expect(component.isOpen()).toBe(true);
    });

    it('should open on ArrowUp', () => {
      component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      expect(component.isOpen()).toBe(true);
    });

    it('should open on Enter', () => {
      component.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(component.isOpen()).toBe(true);
    });

    it('should open on Space', () => {
      component.onKeydown(new KeyboardEvent('keydown', { key: ' ' }));
      expect(component.isOpen()).toBe(true);
    });

    it('should move highlight down with ArrowDown', () => {
      component.openListbox();
      fixture.detectChanges();

      const initialIdx = component.highlightedIndex();
      component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));

      expect(component.highlightedIndex()).toBe(initialIdx + 1);
    });

    it('should move highlight up with ArrowUp', () => {
      component.openListbox();
      component.highlightedIndex.set(2);
      fixture.detectChanges();

      component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      expect(component.highlightedIndex()).toBe(1);
    });

    it('should wrap around at the end', () => {
      component.openListbox();
      component.highlightedIndex.set(2);
      fixture.detectChanges();

      // Index 3 is disabled, should wrap to 0
      component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      expect(component.highlightedIndex()).toBe(0);
    });

    it('should wrap around at the start', () => {
      component.openListbox();
      component.highlightedIndex.set(0);
      fixture.detectChanges();

      // Going up from 0, index 3 is disabled, should go to 2
      component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      expect(component.highlightedIndex()).toBe(2);
    });

    it('should skip disabled options', () => {
      component.openListbox();
      component.highlightedIndex.set(2);
      fixture.detectChanges();

      // Cherry (2) -> Fig (3, disabled) -> Apple (0)
      component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      expect(component.highlightedIndex()).toBe(0);
    });

    it('should select on Enter when open', () => {
      const changeSpy = vi.fn();
      component.registerOnChange(changeSpy);

      component.openListbox();
      component.highlightedIndex.set(1);
      fixture.detectChanges();

      component.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(changeSpy).toHaveBeenCalledWith('banana');
    });

    it('should select on Space when open', () => {
      const changeSpy = vi.fn();
      component.registerOnChange(changeSpy);

      component.openListbox();
      component.highlightedIndex.set(0);
      fixture.detectChanges();

      component.onKeydown(new KeyboardEvent('keydown', { key: ' ' }));
      expect(changeSpy).toHaveBeenCalledWith('apple');
    });

    it('should jump to first option on Home', () => {
      component.openListbox();
      component.highlightedIndex.set(2);
      fixture.detectChanges();

      component.onKeydown(new KeyboardEvent('keydown', { key: 'Home' }));
      expect(component.highlightedIndex()).toBe(0);
    });

    it('should jump to last enabled option on End', () => {
      component.openListbox();
      component.highlightedIndex.set(0);
      fixture.detectChanges();

      // Last option (fig) is disabled, should go to cherry (2)
      component.onKeydown(new KeyboardEvent('keydown', { key: 'End' }));
      expect(component.highlightedIndex()).toBe(2);
    });

    it('should select and close on Tab in single mode', () => {
      const changeSpy = vi.fn();
      component.registerOnChange(changeSpy);

      component.openListbox();
      component.highlightedIndex.set(1);
      fixture.detectChanges();

      component.onKeydown(new KeyboardEvent('keydown', { key: 'Tab' }));

      expect(changeSpy).toHaveBeenCalledWith('banana');
      expect(component.isOpen()).toBe(false);
    });

    it('should close without selecting on Tab in multi mode', () => {
      fixture.componentRef.setInput('multiple', true);
      fixture.detectChanges();

      const changeSpy = vi.fn();
      component.registerOnChange(changeSpy);

      component.openListbox();
      component.highlightedIndex.set(1);
      fixture.detectChanges();

      component.onKeydown(new KeyboardEvent('keydown', { key: 'Tab' }));

      expect(changeSpy).not.toHaveBeenCalled();
      expect(component.isOpen()).toBe(false);
    });

    it('should highlight option on mouseenter', () => {
      component.openListbox();
      fixture.detectChanges();

      const options = fixture.nativeElement.querySelectorAll('[role="option"]');
      options[2].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      fixture.detectChanges();

      expect(component.highlightedIndex()).toBe(2);
    });

    it('should show data-highlighted on highlighted option', () => {
      component.openListbox();
      fixture.detectChanges();

      const idx = component.highlightedIndex();
      const options = fixture.nativeElement.querySelectorAll('[role="option"]');
      expect(options[idx].hasAttribute('data-highlighted')).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('should have combobox role on trigger', () => {
      expect(triggerEl.getAttribute('role')).toBe('combobox');
    });

    it('should set aria-expanded', () => {
      expect(triggerEl.getAttribute('aria-expanded')).toBe('false');
      component.openListbox();
      fixture.detectChanges();
      expect(triggerEl.getAttribute('aria-expanded')).toBe('true');
    });

    it('should set aria-haspopup=listbox', () => {
      expect(triggerEl.getAttribute('aria-haspopup')).toBe('listbox');
    });

    it('should set aria-controls pointing to listbox', () => {
      const listbox = fixture.nativeElement.querySelector('[role="listbox"]');
      expect(triggerEl.getAttribute('aria-controls')).toBe(listbox.id);
    });

    it('should set aria-labelledby when label provided', () => {
      fixture.componentRef.setInput('label', 'Fruit');
      fixture.detectChanges();
      const label = fixture.nativeElement.querySelector('.ct-field__label');
      expect(triggerEl.getAttribute('aria-labelledby')).toBe(label.id);
    });

    it('should fall back to aria-label when no label', () => {
      expect(triggerEl.getAttribute('aria-label')).toBe('Select option');
    });

    it('should set aria-activedescendant when option highlighted', () => {
      component.openListbox();
      fixture.detectChanges();

      const idx = component.highlightedIndex();
      const optionId = component.getOptionId(idx);
      expect(triggerEl.getAttribute('aria-activedescendant')).toBe(optionId);
    });

    it('should clear aria-activedescendant when closed', () => {
      expect(triggerEl.getAttribute('aria-activedescendant')).toBeNull();
    });

    it('should set aria-invalid when error present', () => {
      fixture.componentRef.setInput('error', 'Error');
      fixture.detectChanges();
      expect(triggerEl.getAttribute('aria-invalid')).toBe('true');
    });

    it('should set aria-describedby for error', () => {
      fixture.componentRef.setInput('error', 'Error');
      fixture.detectChanges();
      const errorEl = fixture.nativeElement.querySelector('.ct-field__error');
      expect(triggerEl.getAttribute('aria-describedby')).toBe(errorEl.id);
    });

    it('should set aria-describedby for hint', () => {
      fixture.componentRef.setInput('hint', 'Pick one');
      fixture.detectChanges();
      const hintEl = fixture.nativeElement.querySelector('.ct-field__hint');
      expect(triggerEl.getAttribute('aria-describedby')).toBe(hintEl.id);
    });

    it('should set aria-required when required', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();
      expect(triggerEl.getAttribute('aria-required')).toBe('true');
    });

    it('should have listbox role on content', () => {
      const listbox = fixture.nativeElement.querySelector('[role="listbox"]');
      expect(listbox).toBeTruthy();
    });

    it('should set aria-selected on all options', () => {
      component.openListbox();
      fixture.detectChanges();

      const options = fixture.nativeElement.querySelectorAll('[role="option"]');
      for (const opt of options) {
        expect(opt.hasAttribute('aria-selected')).toBe(true);
      }
    });

    it('should set aria-disabled on disabled options', () => {
      component.openListbox();
      fixture.detectChanges();

      const options = fixture.nativeElement.querySelectorAll('[role="option"]');
      expect(options[3].getAttribute('aria-disabled')).toBe('true');
      expect(options[0].getAttribute('aria-disabled')).toBeNull();
    });

    it('should have check icon in each option', () => {
      component.openListbox();
      fixture.detectChanges();

      const checks = fixture.nativeElement.querySelectorAll('.ct-select-menu__option-check');
      expect(checks.length).toBe(4);
      for (const check of checks) {
        expect(check.getAttribute('aria-hidden')).toBe('true');
      }
    });
  });

  describe('disabled state', () => {
    it('should disable trigger button', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(triggerEl.disabled).toBe(true);
    });

    it('should not open when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      component.openListbox();
      expect(component.isOpen()).toBe(false);
    });
  });

  describe('ControlValueAccessor', () => {
    it('should write single value', () => {
      component.writeValue('banana');
      fixture.detectChanges();

      const value = triggerEl.querySelector('.ct-select-menu__value');
      expect(value!.textContent).toContain('Banana');
    });

    it('should write null to clear', () => {
      component.writeValue('banana');
      component.writeValue(null);
      fixture.detectChanges();

      const value = triggerEl.querySelector('.ct-select-menu__value');
      expect(value!.textContent).toContain('Select a fruit');
    });

    it('should write array for multi-select', () => {
      fixture.componentRef.setInput('multiple', true);
      fixture.detectChanges();

      component.writeValue(['apple', 'cherry']);
      fixture.detectChanges();

      const value = triggerEl.querySelector('.ct-select-menu__value');
      expect(value!.textContent).toContain('Apple');
      expect(value!.textContent).toContain('Cherry');
    });

    it('should notify onChange on selection', () => {
      const changeSpy = vi.fn();
      component.registerOnChange(changeSpy);

      component.selectOption(FRUITS[2]);
      expect(changeSpy).toHaveBeenCalledWith('cherry');
    });

    it('should notify onTouched on blur', () => {
      const touchedSpy = vi.fn();
      component.registerOnTouched(touchedSpy);

      component.onBlur();
      expect(touchedSpy).toHaveBeenCalled();
    });

    it('should set disabled state from form', () => {
      component.setDisabledState(true);
      fixture.detectChanges();

      expect(component.disabled()).toBe(true);
      expect(triggerEl.disabled).toBe(true);
    });
  });

  describe('compareWith', () => {
    const OBJ_OPTIONS: AfSelectMenuOption[] = [
      { value: { id: 1 }, label: 'One' },
      { value: { id: 2 }, label: 'Two' },
      { value: { id: 3 }, label: 'Three' },
    ];

    it('should use custom comparison for object values', () => {
      fixture.componentRef.setInput('options', OBJ_OPTIONS);
      fixture.componentRef.setInput(
        'compareWith',
        (a: { id: number }, b: { id: number }) => a?.id === b?.id
      );
      fixture.detectChanges();

      component.writeValue({ id: 2 });
      fixture.detectChanges();

      const value = triggerEl.querySelector('.ct-select-menu__value');
      expect(value!.textContent).toContain('Two');
    });
  });
});

@Component({
  template: `
    <af-select-menu
      [options]="options"
      [formControl]="control"
      label="Fruit"
      placeholder="Pick one" />
  `,
  imports: [AfSelectMenuComponent, ReactiveFormsModule],
})
class TestHostComponent {
  options = FRUITS;
  control = new FormControl<string | null>(null);
}

describe('AfSelectMenuComponent with Reactive Forms', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let triggerEl: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    triggerEl = fixture.nativeElement.querySelector('.ct-select-menu__trigger');
  });

  it('should initialize with null value showing placeholder', () => {
    const value = triggerEl.querySelector('.ct-select-menu__value');
    expect(value!.textContent).toContain('Pick one');
  });

  it('should update display when form control value changes', () => {
    fixture.componentInstance.control.setValue('cherry');
    fixture.detectChanges();

    const value = triggerEl.querySelector('.ct-select-menu__value');
    expect(value!.textContent).toContain('Cherry');
  });

  it('should disable when form control is disabled', () => {
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(triggerEl.disabled).toBe(true);
  });

  it('should update form control when option selected', () => {
    triggerEl.click();
    fixture.detectChanges();

    const options = fixture.nativeElement.querySelectorAll('[role="option"]');
    options[0].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBe('apple');
  });
});

describe('Accessibility (axe-core)', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should have no violations in closed state', async () => {
    await checkA11y(fixture.nativeElement);
  });

  it('should have no violations when open', async () => {
    fixture.nativeElement.querySelector('.ct-select-menu__trigger').click();
    fixture.detectChanges();
    await checkA11y(fixture.nativeElement);
  });

  it('should have no violations with a selected value', async () => {
    fixture.componentInstance.control.setValue('cherry');
    fixture.detectChanges();
    await checkA11y(fixture.nativeElement);
  });

  it('should have no violations when disabled', async () => {
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    await checkA11y(fixture.nativeElement);
  });
});

describe('Accessibility (axe-core) — error state', () => {
  it('should have no violations in error state', async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorTestHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ErrorTestHostComponent);
    fixture.detectChanges();
    await checkA11y(fixture.nativeElement);
  });
});

describe('Accessibility (axe-core) — multi-select', () => {
  it('should have no violations in multi-select mode', async () => {
    await TestBed.configureTestingModule({
      imports: [MultiTestHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(MultiTestHostComponent);
    fixture.detectChanges();
    await checkA11y(fixture.nativeElement);
  });
});

describe('Accessibility (axe-core) — no label', () => {
  it('should have no violations without label (aria-label fallback)', async () => {
    await TestBed.configureTestingModule({
      imports: [NoLabelTestHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(NoLabelTestHostComponent);
    fixture.detectChanges();
    await checkA11y(fixture.nativeElement);
  });
});

describe('RTL support', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.nativeElement.setAttribute('dir', 'rtl');
    fixture.detectChanges();
  });

  it('should render without errors in RTL mode', () => {
    const trigger = fixture.nativeElement.querySelector('.ct-select-menu__trigger');
    expect(trigger).toBeTruthy();
  });

  it('should maintain correct ARIA attributes in RTL mode', () => {
    const trigger = fixture.nativeElement.querySelector('.ct-select-menu__trigger');
    trigger.click();
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const listbox = fixture.nativeElement.querySelector('[role="listbox"]');
    expect(listbox).toBeTruthy();
    expect(trigger.getAttribute('aria-controls')).toBe(listbox.id);
  });

  it('should support keyboard navigation in RTL mode', () => {
    const selectMenu = fixture.debugElement.children[0].componentInstance as AfSelectMenuComponent;
    selectMenu.openListbox();
    fixture.detectChanges();

    const initialIdx = selectMenu.highlightedIndex();
    selectMenu.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(selectMenu.highlightedIndex()).toBe(initialIdx + 1);
  });

  it('should pass axe-core in RTL mode', async () => {
    await checkA11y(fixture.nativeElement);
  });
});

describe('Screen-reader announcements', () => {
  let fixture: ComponentFixture<AfSelectMenuComponent>;
  let component: AfSelectMenuComponent;
  let announcer: AriaLiveAnnouncer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfSelectMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AfSelectMenuComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', FRUITS);
    fixture.detectChanges();

    announcer = TestBed.inject(AriaLiveAnnouncer);
    vi.spyOn(announcer, 'announce');
  });

  it('should announce when listbox opens', () => {
    component.openListbox();
    expect(announcer.announce).toHaveBeenCalledWith('3 options available');
  });

  it('should announce when listbox closes', () => {
    component.openListbox();
    component.closeListbox();
    expect(announcer.announce).toHaveBeenCalledWith('Selection closed');
  });

  it('should announce selected option in single-select', () => {
    component.selectOption(FRUITS[0]);
    expect(announcer.announce).toHaveBeenCalledWith('Apple selected');
  });

  it('should announce selected option in multi-select', () => {
    fixture.componentRef.setInput('multiple', true);
    fixture.detectChanges();

    component.selectOption(FRUITS[0]);
    expect(announcer.announce).toHaveBeenCalledWith(
      'Apple selected, 1 options selected',
    );
  });

  it('should announce deselected option in multi-select', () => {
    fixture.componentRef.setInput('multiple', true);
    fixture.detectChanges();

    component.writeValue(['apple']);
    component.selectOption(FRUITS[0]);
    expect(announcer.announce).toHaveBeenCalledWith(
      'Apple deselected, 0 options selected',
    );
  });
});

describe('i18n customization', () => {
  it('should use custom fallback aria-label', async () => {
    await TestBed.configureTestingModule({
      imports: [AfSelectMenuComponent],
      providers: [
        {
          provide: AF_SELECT_MENU_I18N,
          useValue: {
            selectOption: 'Option auswählen',
            opened: '{count} Optionen verfügbar',
            closed: 'Auswahl geschlossen',
            selected: '{label} ausgewählt',
            deselected: '{label} abgewählt',
            countSelected: '{count} Optionen ausgewählt',
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AfSelectMenuComponent);
    fixture.componentRef.setInput('options', FRUITS);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.ct-select-menu__trigger');
    expect(trigger.getAttribute('aria-label')).toBe('Option auswählen');
  });

  it('should use custom announcement text', async () => {
    await TestBed.configureTestingModule({
      imports: [AfSelectMenuComponent],
      providers: [
        {
          provide: AF_SELECT_MENU_I18N,
          useValue: {
            selectOption: 'Option auswählen',
            opened: '{count} Optionen verfügbar',
            closed: 'Auswahl geschlossen',
            selected: '{label} ausgewählt',
            deselected: '{label} abgewählt',
            countSelected: '{count} Optionen ausgewählt',
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AfSelectMenuComponent);
    fixture.componentRef.setInput('options', FRUITS);
    fixture.detectChanges();

    const announcer = TestBed.inject(AriaLiveAnnouncer);
    vi.spyOn(announcer, 'announce');

    fixture.componentInstance.openListbox();
    expect(announcer.announce).toHaveBeenCalledWith('3 Optionen verfügbar');
  });
});

@Component({
  template: `
    <af-select-menu
      [options]="options"
      [formControl]="control"
      label="Fruit"
      error="Required field"
      placeholder="Pick one" />
  `,
  imports: [AfSelectMenuComponent, ReactiveFormsModule],
})
class ErrorTestHostComponent {
  options = FRUITS;
  control = new FormControl<string | null>(null);
}

@Component({
  template: `
    <af-select-menu
      [options]="options"
      [formControl]="control"
      label="Fruits"
      [multiple]="true"
      placeholder="Pick fruits" />
  `,
  imports: [AfSelectMenuComponent, ReactiveFormsModule],
})
class MultiTestHostComponent {
  options = FRUITS;
  control = new FormControl<string[]>([]);
}

@Component({
  template: `
    <af-select-menu
      [options]="options"
      [formControl]="control"
      placeholder="Pick one" />
  `,
  imports: [AfSelectMenuComponent, ReactiveFormsModule],
})
class NoLabelTestHostComponent {
  options = FRUITS;
  control = new FormControl<string | null>(null);
}
