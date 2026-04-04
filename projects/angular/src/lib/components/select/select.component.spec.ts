import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AfSelectComponent, AfSelectOption } from './select.component';
import { AF_SELECT_I18N } from './select.i18n';
import { AriaLiveAnnouncer } from '../../utils/aria-live-announcer';
import { checkA11y } from '../../testing/axe-helper';

const ROLES: AfSelectOption[] = [
  { value: 'designer', label: 'Designer' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'manager', label: 'Manager' },
  { value: 'intern', label: 'Intern', disabled: true },
];

describe('AfSelectComponent', () => {
  let component: AfSelectComponent;
  let fixture: ComponentFixture<AfSelectComponent>;
  let selectEl: HTMLSelectElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AfSelectComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', ROLES);
    fixture.componentRef.setInput('placeholder', 'Choose a role');
    fixture.detectChanges();
    selectEl = fixture.nativeElement.querySelector('select');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should render a native select element', () => {
      expect(selectEl).toBeTruthy();
      expect(selectEl.tagName).toBe('SELECT');
    });

    it('should apply ct-select class', () => {
      expect(selectEl.classList.contains('ct-select')).toBe(true);
    });

    it('should wrap select in ct-select-wrap', () => {
      const wrap = fixture.nativeElement.querySelector('.ct-select-wrap');
      expect(wrap).toBeTruthy();
      expect(wrap.querySelector('select')).toBe(selectEl);
    });

    it('should show label when provided', () => {
      fixture.componentRef.setInput('label', 'Role');
      fixture.detectChanges();
      const label = fixture.nativeElement.querySelector('.ct-field__label');
      expect(label.textContent).toContain('Role');
    });

    it('should not render label when empty', () => {
      const label = fixture.nativeElement.querySelector('.ct-field__label');
      expect(label).toBeNull();
    });

    it('should link label to select via for/id', () => {
      fixture.componentRef.setInput('label', 'Role');
      fixture.detectChanges();
      const label = fixture.nativeElement.querySelector('.ct-field__label');
      expect(label.getAttribute('for')).toBe(selectEl.id);
    });

    it('should render placeholder as disabled first option', () => {
      const firstOption = selectEl.options[0];
      expect(firstOption.textContent).toContain('Choose a role');
      expect(firstOption.disabled).toBe(true);
      expect(firstOption.selected).toBe(true);
    });

    it('should render all options', () => {
      // 1 placeholder + 4 role options
      expect(selectEl.options.length).toBe(5);
      expect(selectEl.options[1].textContent).toContain('Designer');
      expect(selectEl.options[4].textContent).toContain('Intern');
    });

    it('should show disabled options', () => {
      expect(selectEl.options[4].disabled).toBe(true);
      expect(selectEl.options[1].disabled).toBe(false);
    });

    it('should set display block on host', () => {
      const host = fixture.nativeElement as HTMLElement;
      expect(host.style.display).toBe('block');
    });
  });

  describe('size variants', () => {
    it('should not add size class for md (default)', () => {
      expect(selectEl.className).toBe('ct-select');
    });

    it('should apply ct-select--sm class', () => {
      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();
      expect(selectEl.classList.contains('ct-select--sm')).toBe(true);
    });

    it('should apply ct-select--lg class', () => {
      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();
      expect(selectEl.classList.contains('ct-select--lg')).toBe(true);
    });
  });

  describe('disabled', () => {
    it('should not be disabled by default', () => {
      expect(selectEl.disabled).toBe(false);
    });

    it('should set disabled attribute', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(selectEl.disabled).toBe(true);
    });

    it('should remove disabled when toggled back', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      fixture.componentRef.setInput('disabled', false);
      fixture.detectChanges();
      expect(selectEl.disabled).toBe(false);
    });
  });

  describe('required', () => {
    it('should not be required by default', () => {
      expect(selectEl.required).toBe(false);
    });

    it('should set required attribute', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();
      expect(selectEl.required).toBe(true);
    });

    it('should render required asterisk', () => {
      fixture.componentRef.setInput('label', 'Role');
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();
      const asterisk = fixture.nativeElement.querySelector('[aria-label]');
      expect(asterisk).toBeTruthy();
      expect(asterisk.textContent).toContain('*');
    });

    it('should use i18n string for required aria-label', () => {
      fixture.componentRef.setInput('label', 'Role');
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();
      const asterisk = fixture.nativeElement.querySelector('[aria-label]');
      expect(asterisk.getAttribute('aria-label')).toBe('required');
    });

    it('should not render asterisk when not required', () => {
      fixture.componentRef.setInput('label', 'Role');
      fixture.detectChanges();
      const asterisk = fixture.nativeElement.querySelector('[aria-label]');
      expect(asterisk).toBeNull();
    });
  });

  describe('hint', () => {
    it('should not render hint by default', () => {
      expect(fixture.nativeElement.querySelector('.ct-field__hint')).toBeNull();
    });

    it('should render hint text', () => {
      fixture.componentRef.setInput('hint', 'Choose one');
      fixture.detectChanges();
      const hint = fixture.nativeElement.querySelector('.ct-field__hint');
      expect(hint.textContent).toContain('Choose one');
    });

    it('should set hint ID', () => {
      fixture.componentRef.setInput('hint', 'Choose one');
      fixture.detectChanges();
      const hint = fixture.nativeElement.querySelector('.ct-field__hint');
      expect(hint.id).toContain('-hint');
    });

    it('should link aria-describedby to hint', () => {
      fixture.componentRef.setInput('hint', 'Choose one');
      fixture.detectChanges();
      const hint = fixture.nativeElement.querySelector('.ct-field__hint');
      expect(selectEl.getAttribute('aria-describedby')).toBe(hint.id);
    });

    it('should hide hint when error is shown', () => {
      fixture.componentRef.setInput('hint', 'Choose one');
      fixture.componentRef.setInput('error', 'Required');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.ct-field__hint')).toBeNull();
    });
  });

  describe('error', () => {
    it('should not render error by default', () => {
      expect(fixture.nativeElement.querySelector('.ct-field__error')).toBeNull();
    });

    it('should render error message', () => {
      fixture.componentRef.setInput('error', 'Required field');
      fixture.detectChanges();
      const error = fixture.nativeElement.querySelector('.ct-field__error');
      expect(error.textContent).toContain('Required field');
    });

    it('should set aria-invalid on select', () => {
      fixture.componentRef.setInput('error', 'Required field');
      fixture.detectChanges();
      expect(selectEl.getAttribute('aria-invalid')).toBe('true');
    });

    it('should not set aria-invalid when no error', () => {
      expect(selectEl.getAttribute('aria-invalid')).toBeNull();
    });

    it('should set error ID', () => {
      fixture.componentRef.setInput('error', 'Required field');
      fixture.detectChanges();
      const error = fixture.nativeElement.querySelector('.ct-field__error');
      expect(error.id).toContain('-error');
    });

    it('should link aria-describedby to error', () => {
      fixture.componentRef.setInput('error', 'Required field');
      fixture.detectChanges();
      const error = fixture.nativeElement.querySelector('.ct-field__error');
      expect(selectEl.getAttribute('aria-describedby')).toBe(error.id);
    });

    it('should add ct-field--error modifier', () => {
      fixture.componentRef.setInput('error', 'Required field');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.ct-field--error')).toBeTruthy();
    });

    it('should have role="alert" on error element', () => {
      fixture.componentRef.setInput('error', 'Required field');
      fixture.detectChanges();
      const error = fixture.nativeElement.querySelector('.ct-field__error');
      expect(error.getAttribute('role')).toBe('alert');
    });
  });

  describe('aria-describedby priority', () => {
    it('should be null when neither hint nor error', () => {
      expect(selectEl.getAttribute('aria-describedby')).toBeNull();
    });

    it('should reference hint when only hint set', () => {
      fixture.componentRef.setInput('hint', 'Help');
      fixture.detectChanges();
      expect(selectEl.getAttribute('aria-describedby')).toContain('-hint');
    });

    it('should reference error when only error set', () => {
      fixture.componentRef.setInput('error', 'Error');
      fixture.detectChanges();
      expect(selectEl.getAttribute('aria-describedby')).toContain('-error');
    });

    it('should prioritize error over hint', () => {
      fixture.componentRef.setInput('hint', 'Help');
      fixture.componentRef.setInput('error', 'Error');
      fixture.detectChanges();
      expect(selectEl.getAttribute('aria-describedby')).toContain('-error');
    });
  });

  describe('aria-label fallback', () => {
    it('should set aria-label when no label provided', () => {
      expect(selectEl.getAttribute('aria-label')).toBe('Select option');
    });

    it('should not set aria-label when label provided', () => {
      fixture.componentRef.setInput('label', 'Role');
      fixture.detectChanges();
      expect(selectEl.getAttribute('aria-label')).toBeNull();
    });

    it('should set aria-labelledby when label provided', () => {
      fixture.componentRef.setInput('label', 'Role');
      fixture.detectChanges();
      const label = fixture.nativeElement.querySelector('.ct-field__label');
      expect(selectEl.getAttribute('aria-labelledby')).toBe(label.id);
    });
  });

  describe('selection', () => {
    it('should update value on change', () => {
      const changeSpy = vi.fn();
      component.registerOnChange(changeSpy);

      selectEl.selectedIndex = 2;
      selectEl.dispatchEvent(new Event('change', { bubbles: true }));
      fixture.detectChanges();

      expect(changeSpy).toHaveBeenCalledWith('engineer');
    });

    it('should emit valueChange output', () => {
      const emitSpy = vi.fn();
      component.valueChange.subscribe(emitSpy);

      selectEl.selectedIndex = 1;
      selectEl.dispatchEvent(new Event('change', { bubbles: true }));

      expect(emitSpy).toHaveBeenCalledWith('designer');
    });

    it('should set null when placeholder selected', () => {
      const changeSpy = vi.fn();
      component.registerOnChange(changeSpy);

      // First select an option
      selectEl.selectedIndex = 1;
      selectEl.dispatchEvent(new Event('change', { bubbles: true }));

      // Then select placeholder
      selectEl.selectedIndex = 0;
      selectEl.dispatchEvent(new Event('change', { bubbles: true }));

      expect(changeSpy).toHaveBeenLastCalledWith(null);
    });

    it('should not select disabled options via component', () => {
      // Disabled options are enforced by native browser behavior
      expect(selectEl.options[4].disabled).toBe(true);
    });
  });

  describe('ControlValueAccessor', () => {
    it('should write value and display correct option', () => {
      component.writeValue('engineer');
      fixture.detectChanges();

      const options = selectEl.querySelectorAll('option');
      // Engineer is the second option (index 2 including placeholder)
      expect(options[2].selected).toBe(true);
    });

    it('should write null to reset to placeholder', () => {
      component.writeValue('engineer');
      fixture.detectChanges();
      component.writeValue(null);
      fixture.detectChanges();

      expect(selectEl.options[0].selected).toBe(true);
    });

    it('should call onChange on user selection', () => {
      const changeSpy = vi.fn();
      component.registerOnChange(changeSpy);

      selectEl.selectedIndex = 3;
      selectEl.dispatchEvent(new Event('change', { bubbles: true }));

      expect(changeSpy).toHaveBeenCalledWith('manager');
    });

    it('should call onTouched on blur', () => {
      const touchedSpy = vi.fn();
      component.registerOnTouched(touchedSpy);

      selectEl.dispatchEvent(new Event('blur', { bubbles: true }));

      expect(touchedSpy).toHaveBeenCalled();
    });

    it('should set disabled state', () => {
      component.setDisabledState(true);
      fixture.detectChanges();
      expect(selectEl.disabled).toBe(true);
    });

    it('should re-enable when setDisabledState(false)', () => {
      component.setDisabledState(true);
      fixture.detectChanges();
      component.setDisabledState(false);
      fixture.detectChanges();
      expect(selectEl.disabled).toBe(false);
    });
  });

  describe('compareWith', () => {
    const OBJ_OPTIONS: AfSelectOption[] = [
      { value: { id: 1 }, label: 'One' },
      { value: { id: 2 }, label: 'Two' },
      { value: { id: 3 }, label: 'Three' },
    ];

    it('should use custom comparison for object values', () => {
      fixture.componentRef.setInput('options', OBJ_OPTIONS);
      fixture.componentRef.setInput('placeholder', '');
      fixture.componentRef.setInput(
        'compareWith',
        (a: { id: number }, b: { id: number }) => a?.id === b?.id,
      );
      fixture.detectChanges();

      component.writeValue({ id: 2 });
      fixture.detectChanges();

      expect(selectEl.options[1].selected).toBe(true);
    });
  });
});

// ── Reactive Forms integration ──────────────────────────────────

@Component({
  template: `
    <af-select
      [options]="options"
      [formControl]="control"
      label="Role"
      placeholder="Pick one" />
  `,
  imports: [AfSelectComponent, ReactiveFormsModule],
})
class SelectReactiveHostComponent {
  options = ROLES;
  control = new FormControl<string | null>(null);
}

describe('AfSelectComponent with Reactive Forms', () => {
  let fixture: ComponentFixture<SelectReactiveHostComponent>;
  let selectEl: HTMLSelectElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectReactiveHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectReactiveHostComponent);
    fixture.detectChanges();
    selectEl = fixture.nativeElement.querySelector('select');
  });

  it('should show placeholder for null value', () => {
    expect(selectEl.options[0].selected).toBe(true);
    expect(selectEl.options[0].textContent).toContain('Pick one');
  });

  it('should update display when form control value changes', () => {
    fixture.componentInstance.control.setValue('engineer');
    fixture.detectChanges();
    expect(selectEl.options[2].selected).toBe(true);
  });

  it('should disable when form control is disabled', () => {
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(selectEl.disabled).toBe(true);
  });

  it('should update form control when user selects', () => {
    selectEl.selectedIndex = 1;
    selectEl.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBe('designer');
  });

  it('should re-enable when form control is enabled', () => {
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    fixture.componentInstance.control.enable();
    fixture.detectChanges();
    expect(selectEl.disabled).toBe(false);
  });
});

// ── ngModel integration ─────────────────────────────────────────

@Component({
  template: `
    <af-select
      [options]="options"
      [(ngModel)]="selected"
      label="Role"
      placeholder="Pick one" />
  `,
  imports: [AfSelectComponent, FormsModule],
})
class NgModelHostComponent {
  options = ROLES;
  selected: string | null = null;
}

describe('AfSelectComponent with ngModel', () => {
  let fixture: ComponentFixture<NgModelHostComponent>;
  let selectEl: HTMLSelectElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgModelHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NgModelHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    selectEl = fixture.nativeElement.querySelector('select');
  });

  it('should show placeholder for null value', () => {
    expect(selectEl.options[0].selected).toBe(true);
  });

  it('should update ngModel when user selects', async () => {
    selectEl.selectedIndex = 1;
    selectEl.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.selected).toBe('designer');
  });
});

// ── i18n customization ──────────────────────────────────────────

describe('AfSelectComponent i18n', () => {
  it('should use custom required label', async () => {
    await TestBed.configureTestingModule({
      imports: [AfSelectComponent],
      providers: [
        {
          provide: AF_SELECT_I18N,
          useValue: {
            required: 'Pflichtfeld',
            selectOption: 'Option auswählen',
            selected: '{label} ausgewählt',
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AfSelectComponent);
    fixture.componentRef.setInput('options', ROLES);
    fixture.componentRef.setInput('label', 'Role');
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();

    const asterisk = fixture.nativeElement.querySelector('[aria-label]');
    expect(asterisk.getAttribute('aria-label')).toBe('Pflichtfeld');
  });

  it('should use custom aria-label fallback', async () => {
    await TestBed.configureTestingModule({
      imports: [AfSelectComponent],
      providers: [
        {
          provide: AF_SELECT_I18N,
          useValue: {
            required: 'Pflichtfeld',
            selectOption: 'Option auswählen',
            selected: '{label} ausgewählt',
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AfSelectComponent);
    fixture.componentRef.setInput('options', ROLES);
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('select');
    expect(select.getAttribute('aria-label')).toBe('Option auswählen');
  });

  it('should use custom announcement text', async () => {
    await TestBed.configureTestingModule({
      imports: [AfSelectComponent],
      providers: [
        {
          provide: AF_SELECT_I18N,
          useValue: {
            required: 'Pflichtfeld',
            selectOption: 'Option auswählen',
            selected: '{label} ausgewählt',
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AfSelectComponent);
    fixture.componentRef.setInput('options', ROLES);
    fixture.componentRef.setInput('placeholder', 'Pick');
    fixture.detectChanges();

    const announcer = TestBed.inject(AriaLiveAnnouncer);
    vi.spyOn(announcer, 'announce');

    const select = fixture.nativeElement.querySelector('select');
    select.selectedIndex = 1;
    select.dispatchEvent(new Event('change', { bubbles: true }));

    expect(announcer.announce).toHaveBeenCalledWith('Designer ausgewählt');
  });
});

// ── Accessibility (axe-core) ────────────────────────────────────

@Component({
  template: `
    <af-select
      [options]="options"
      [formControl]="control"
      label="Role"
      placeholder="Pick one" />
  `,
  imports: [AfSelectComponent, ReactiveFormsModule],
})
class AxeDefaultHostComponent {
  options = ROLES;
  control = new FormControl<string | null>(null);
}

describe('Accessibility (axe-core)', () => {
  it('should have no violations in default state', async () => {
    await TestBed.configureTestingModule({
      imports: [AxeDefaultHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(AxeDefaultHostComponent);
    fixture.detectChanges();
    await checkA11y(fixture.nativeElement);
  });

  it('should have no violations with error', async () => {
    await TestBed.configureTestingModule({
      imports: [AxeErrorHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(AxeErrorHostComponent);
    fixture.detectChanges();
    await checkA11y(fixture.nativeElement);
  });

  it('should have no violations when disabled', async () => {
    await TestBed.configureTestingModule({
      imports: [AxeDefaultHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(AxeDefaultHostComponent);
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    await checkA11y(fixture.nativeElement);
  });

  it('should have no violations with hint', async () => {
    await TestBed.configureTestingModule({
      imports: [AxeHintHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(AxeHintHostComponent);
    fixture.detectChanges();
    await checkA11y(fixture.nativeElement);
  });

  it('should have no violations when required', async () => {
    await TestBed.configureTestingModule({
      imports: [AxeRequiredHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(AxeRequiredHostComponent);
    fixture.detectChanges();
    await checkA11y(fixture.nativeElement);
  });

  it('should have no violations without label (aria-label fallback)', async () => {
    await TestBed.configureTestingModule({
      imports: [AxeNoLabelHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(AxeNoLabelHostComponent);
    fixture.detectChanges();
    await checkA11y(fixture.nativeElement);
  });
});

// ── RTL support ─────────────────────────────────────────────────

describe('RTL support', () => {
  let fixture: ComponentFixture<AxeDefaultHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AxeDefaultHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AxeDefaultHostComponent);
    fixture.nativeElement.setAttribute('dir', 'rtl');
    fixture.detectChanges();
  });

  it('should render without errors in RTL mode', () => {
    const select = fixture.nativeElement.querySelector('select');
    expect(select).toBeTruthy();
  });

  it('should maintain correct ARIA attributes in RTL mode', () => {
    const select = fixture.nativeElement.querySelector('select');
    expect(select.getAttribute('aria-label')).toBeNull();
    const label = fixture.nativeElement.querySelector('.ct-field__label');
    expect(select.getAttribute('aria-labelledby')).toBe(label.id);
  });

  it('should pass axe-core in RTL mode', async () => {
    await checkA11y(fixture.nativeElement);
  });
});

// ── Screen-reader announcements ─────────────────────────────────

describe('Screen-reader announcements', () => {
  let fixture: ComponentFixture<AfSelectComponent>;
  let announcer: AriaLiveAnnouncer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AfSelectComponent);
    fixture.componentRef.setInput('options', ROLES);
    fixture.componentRef.setInput('placeholder', 'Pick');
    fixture.detectChanges();

    announcer = TestBed.inject(AriaLiveAnnouncer);
    vi.spyOn(announcer, 'announce');
  });

  it('should announce selected option', () => {
    const select = fixture.nativeElement.querySelector('select');
    select.selectedIndex = 1;
    select.dispatchEvent(new Event('change', { bubbles: true }));

    expect(announcer.announce).toHaveBeenCalledWith('Designer selected');
  });

  it('should not announce when placeholder is selected', () => {
    const select = fixture.nativeElement.querySelector('select');
    select.selectedIndex = 0;
    select.dispatchEvent(new Event('change', { bubbles: true }));

    expect(announcer.announce).not.toHaveBeenCalled();
  });
});

// ── axe-core test host components ───────────────────────────────

@Component({
  template: `
    <af-select
      [options]="options"
      [formControl]="control"
      label="Role"
      error="Required field"
      placeholder="Pick one" />
  `,
  imports: [AfSelectComponent, ReactiveFormsModule],
})
class AxeErrorHostComponent {
  options = ROLES;
  control = new FormControl<string | null>(null);
}

@Component({
  template: `
    <af-select
      [options]="options"
      [formControl]="control"
      label="Role"
      hint="Choose your primary role"
      placeholder="Pick one" />
  `,
  imports: [AfSelectComponent, ReactiveFormsModule],
})
class AxeHintHostComponent {
  options = ROLES;
  control = new FormControl<string | null>(null);
}

@Component({
  template: `
    <af-select
      [options]="options"
      [formControl]="control"
      label="Role"
      [required]="true"
      placeholder="Pick one" />
  `,
  imports: [AfSelectComponent, ReactiveFormsModule],
})
class AxeRequiredHostComponent {
  options = ROLES;
  control = new FormControl<string | null>(null);
}

@Component({
  template: `
    <af-select
      [options]="options"
      [formControl]="control"
      placeholder="Pick one" />
  `,
  imports: [AfSelectComponent, ReactiveFormsModule],
})
class AxeNoLabelHostComponent {
  options = ROLES;
  control = new FormControl<string | null>(null);
}
