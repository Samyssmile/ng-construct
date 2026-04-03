import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AfInputComponent, AfInputType } from './input.component';
import { AfInputHarness } from './input.harness';
import { AF_INPUT_I18N } from './input.i18n';
import { checkA11y } from '../../testing/axe-helper';

@Component({
  imports: [AfInputComponent],
  template: `
    <af-input
      [label]="label()"
      [type]="type()"
      [placeholder]="placeholder()"
      [hint]="hint()"
      [error]="error()"
      [required]="required()"
      [disabled]="disabled()"
      [iconPosition]="iconPosition()"
      [inputId]="inputId()"
      (input)="lastInputEvent.set($event)"
    >
      @if (showIcon()) {
        <span icon>icon</span>
      }
    </af-input>
  `,
})
class TestHostComponent {
  label = signal('Email');
  type = signal<AfInputType>('text');
  placeholder = signal('');
  hint = signal('');
  error = signal('');
  required = signal(false);
  disabled = signal(false);
  iconPosition = signal<'left' | 'right' | null>(null);
  inputId = signal('test-input');
  showIcon = signal(false);
  lastInputEvent = signal<Event | null>(null);
}

describe('AfInputComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let harness: AfInputHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    harness = new AfInputHarness(fixture.nativeElement);
  });

  // ── rendering ──────────────────────────────────────────────

  describe('rendering', () => {
    it('should render the inner input element', () => {
      expect(harness.getInputElement()).toBeTruthy();
    });

    it('should apply the ct-input base class', () => {
      expect(harness.hasClass('ct-input')).toBe(true);
    });

    it('should render a label when provided', () => {
      expect(harness.getLabel()).toBe('Email');
    });

    it('should not render a label when empty', () => {
      host.label.set('');
      fixture.detectChanges();
      expect(harness.getLabel()).toBeNull();
    });

    it('should link label to input via for/id', () => {
      const label = fixture.nativeElement.querySelector('label');
      expect(label.getAttribute('for')).toBe('test-input');
      expect(harness.getId()).toBe('test-input');
    });

    it('should set display: block on host', () => {
      const hostEl = fixture.nativeElement.querySelector('af-input') as HTMLElement;
      expect(hostEl.style.display).toBe('block');
    });
  });

  // ── input types ────────────────────────────────────────────

  describe('input types', () => {
    it('should default to type="text"', () => {
      expect(harness.getType()).toBe('text');
    });

    const types: AfInputType[] = ['email', 'password', 'number', 'search', 'tel', 'url'];

    for (const t of types) {
      it(`should set type="${t}"`, () => {
        host.type.set(t);
        fixture.detectChanges();
        expect(harness.getType()).toBe(t);
      });
    }
  });

  // ── placeholder ────────────────────────────────────────────

  describe('placeholder', () => {
    it('should set placeholder text', () => {
      host.placeholder.set('Enter email');
      fixture.detectChanges();
      expect(harness.getPlaceholder()).toBe('Enter email');
    });

    it('should default to empty placeholder', () => {
      expect(harness.getPlaceholder()).toBe('');
    });
  });

  // ── disabled ───────────────────────────────────────────────

  describe('disabled', () => {
    it('should not be disabled by default', () => {
      expect(harness.isDisabled()).toBe(false);
    });

    it('should set the disabled attribute when disabled is true', () => {
      host.disabled.set(true);
      fixture.detectChanges();
      expect(harness.isDisabled()).toBe(true);
    });

    it('should remove disabled when toggled back to false', () => {
      host.disabled.set(true);
      fixture.detectChanges();
      host.disabled.set(false);
      fixture.detectChanges();
      expect(harness.isDisabled()).toBe(false);
    });
  });

  // ── required ───────────────────────────────────────────────

  describe('required', () => {
    it('should not be required by default', () => {
      expect(harness.isRequired()).toBe(false);
    });

    it('should set the required attribute', () => {
      host.required.set(true);
      fixture.detectChanges();
      expect(harness.isRequired()).toBe(true);
    });

    it('should render the required asterisk', () => {
      host.required.set(true);
      fixture.detectChanges();
      const label = harness.getLabel();
      expect(label).toContain('*');
    });

    it('should set aria-label on the required indicator', () => {
      host.required.set(true);
      fixture.detectChanges();
      const span = fixture.nativeElement.querySelector('.ct-field__label span');
      expect(span.getAttribute('aria-label')).toBe('required');
    });

    it('should not render the asterisk when not required', () => {
      const span = fixture.nativeElement.querySelector('.ct-field__label span');
      expect(span).toBeNull();
    });
  });

  // ── hint ───────────────────────────────────────────────────

  describe('hint', () => {
    it('should not render hint by default', () => {
      expect(harness.getHint()).toBeNull();
    });

    it('should render hint text when provided', () => {
      host.hint.set('We will not share this.');
      fixture.detectChanges();
      expect(harness.getHint()).toBe('We will not share this.');
    });

    it('should set the hint ID', () => {
      host.hint.set('Some hint');
      fixture.detectChanges();
      const hint = fixture.nativeElement.querySelector('.ct-field__hint');
      expect(hint.id).toBe('test-input-hint');
    });

    it('should link input aria-describedby to hint', () => {
      host.hint.set('Some hint');
      fixture.detectChanges();
      expect(harness.getAriaDescribedBy()).toBe('test-input-hint');
    });

    it('should hide hint when error is shown', () => {
      host.hint.set('Some hint');
      host.error.set('Field is required');
      fixture.detectChanges();
      expect(harness.getHint()).toBeNull();
    });
  });

  // ── error ──────────────────────────────────────────────────

  describe('error', () => {
    it('should not render error by default', () => {
      expect(harness.getError()).toBeNull();
    });

    it('should render error message when provided', () => {
      host.error.set('Field is required');
      fixture.detectChanges();
      expect(harness.getError()).toBe('Field is required');
    });

    it('should set aria-invalid on the input', () => {
      host.error.set('Invalid');
      fixture.detectChanges();
      expect(harness.isInvalid()).toBe(true);
    });

    it('should not set aria-invalid when no error', () => {
      expect(harness.isInvalid()).toBe(false);
    });

    it('should set the error ID', () => {
      host.error.set('Error');
      fixture.detectChanges();
      const error = fixture.nativeElement.querySelector('.ct-field__error');
      expect(error.id).toBe('test-input-error');
    });

    it('should link input aria-describedby to error', () => {
      host.error.set('Error');
      fixture.detectChanges();
      expect(harness.getAriaDescribedBy()).toBe('test-input-error');
    });

    it('should add the ct-field--error modifier class', () => {
      host.error.set('Error');
      fixture.detectChanges();
      expect(harness.hasFieldError()).toBe(true);
    });

    it('should have role="alert" on error element', () => {
      host.error.set('Error');
      fixture.detectChanges();
      const error = fixture.nativeElement.querySelector('.ct-field__error');
      expect(error.getAttribute('role')).toBe('alert');
    });
  });

  // ── aria-describedby priority ──────────────────────────────

  describe('aria-describedby', () => {
    it('should be null when neither hint nor error is set', () => {
      expect(harness.getAriaDescribedBy()).toBeNull();
    });

    it('should reference hint when only hint is set', () => {
      host.hint.set('Hint');
      fixture.detectChanges();
      expect(harness.getAriaDescribedBy()).toBe('test-input-hint');
    });

    it('should reference error when only error is set', () => {
      host.error.set('Error');
      fixture.detectChanges();
      expect(harness.getAriaDescribedBy()).toBe('test-input-error');
    });

    it('should prioritize error over hint', () => {
      host.hint.set('Hint');
      host.error.set('Error');
      fixture.detectChanges();
      expect(harness.getAriaDescribedBy()).toBe('test-input-error');
    });
  });

  // ── icon position ──────────────────────────────────────────

  describe('icon position', () => {
    it('should not render icon wrapper by default', () => {
      expect(harness.hasIcon()).toBe(false);
    });

    it('should render left icon in wrapper', () => {
      host.iconPosition.set('left');
      host.showIcon.set(true);
      fixture.detectChanges();
      expect(harness.hasIcon()).toBe(true);
      expect(harness.hasClass('ct-input--with-icon')).toBe(true);
    });

    it('should render right icon in wrapper', () => {
      host.iconPosition.set('right');
      host.showIcon.set(true);
      fixture.detectChanges();
      expect(harness.hasIcon()).toBe(true);
    });

    it('should render the input-wrap container', () => {
      host.iconPosition.set('left');
      fixture.detectChanges();
      const wrap = fixture.nativeElement.querySelector('.ct-input-wrap');
      expect(wrap).toBeTruthy();
    });

    it('should set aria-hidden on icon wrapper', () => {
      host.iconPosition.set('left');
      host.showIcon.set(true);
      fixture.detectChanges();
      const icon = fixture.nativeElement.querySelector('.ct-input__icon');
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    });
  });

  // ── ControlValueAccessor ───────────────────────────────────

  describe('ControlValueAccessor', () => {
    it('should update value via writeValue', () => {
      const comp = fixture.debugElement.children[0].componentInstance as AfInputComponent;
      comp.writeValue('hello');
      fixture.detectChanges();
      expect(harness.getValue()).toBe('hello');
    });

    it('should handle null in writeValue', () => {
      const comp = fixture.debugElement.children[0].componentInstance as AfInputComponent;
      comp.writeValue(null as unknown as string);
      fixture.detectChanges();
      expect(harness.getValue()).toBe('');
    });

    it('should call onChange when user types', () => {
      const comp = fixture.debugElement.children[0].componentInstance as AfInputComponent;
      const spy = vi.fn();
      comp.registerOnChange(spy);
      harness.setValue('world');
      expect(spy).toHaveBeenCalledWith('world');
    });

    it('should call onTouched when input loses focus', () => {
      const comp = fixture.debugElement.children[0].componentInstance as AfInputComponent;
      const spy = vi.fn();
      comp.registerOnTouched(spy);
      harness.blur();
      expect(spy).toHaveBeenCalled();
    });

    it('should set disabled via setDisabledState', () => {
      const comp = fixture.debugElement.children[0].componentInstance as AfInputComponent;
      comp.setDisabledState(true);
      fixture.detectChanges();
      expect(harness.isDisabled()).toBe(true);
    });

    it('should re-enable via setDisabledState(false)', () => {
      const comp = fixture.debugElement.children[0].componentInstance as AfInputComponent;
      comp.setDisabledState(true);
      fixture.detectChanges();
      comp.setDisabledState(false);
      fixture.detectChanges();
      expect(harness.isDisabled()).toBe(false);
    });
  });

  // ── i18n (default) ──────────────────────────────────────────

  describe('i18n', () => {
    it('should use default i18n string', () => {
      host.required.set(true);
      fixture.detectChanges();
      const span = fixture.nativeElement.querySelector('.ct-field__label span');
      expect(span.getAttribute('aria-label')).toBe('required');
    });
  });

  // ── accessibility (axe-core) ───────────────────────────────

  describe('Accessibility (axe-core)', () => {
    it('should pass axe checks in default state', async () => {
      await checkA11y(fixture.nativeElement);
    });

    it('should pass axe checks with error state', async () => {
      host.error.set('This field is required');
      fixture.detectChanges();
      await checkA11y(fixture.nativeElement);
    });

    it('should pass axe checks when disabled', async () => {
      host.disabled.set(true);
      fixture.detectChanges();
      await checkA11y(fixture.nativeElement);
    });

    it('should pass axe checks with hint', async () => {
      host.hint.set('Enter a valid email');
      fixture.detectChanges();
      await checkA11y(fixture.nativeElement);
    });

    it('should pass axe checks when required', async () => {
      host.required.set(true);
      fixture.detectChanges();
      await checkA11y(fixture.nativeElement);
    });
  });
});

// ── Reactive Forms integration (separate TestBed) ────────────

@Component({
  imports: [AfInputComponent, ReactiveFormsModule],
  template: `<af-input [formControl]="ctrl" label="Reactive" inputId="reactive-input" />`,
})
class ReactiveHost {
  ctrl = new FormControl('initial');
}

describe('AfInputComponent — Reactive Forms', () => {
  let fixture: ComponentFixture<ReactiveHost>;
  let harness: AfInputHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveHost],
    }).compileComponents();

    fixture = TestBed.createComponent(ReactiveHost);
    fixture.detectChanges();
    harness = new AfInputHarness(fixture.nativeElement);
  });

  it('should reflect the initial form control value', () => {
    expect(harness.getValue()).toBe('initial');
  });

  it('should update form control when user types', () => {
    harness.setValue('updated');
    expect(fixture.componentInstance.ctrl.value).toBe('updated');
  });

  it('should update input when form control value changes', () => {
    fixture.componentInstance.ctrl.setValue('programmatic');
    fixture.detectChanges();
    expect(harness.getValue()).toBe('programmatic');
  });

  it('should disable input when form control is disabled', () => {
    fixture.componentInstance.ctrl.disable();
    fixture.detectChanges();
    expect(harness.isDisabled()).toBe(true);
  });

  it('should re-enable input when form control is enabled', () => {
    fixture.componentInstance.ctrl.disable();
    fixture.detectChanges();
    fixture.componentInstance.ctrl.enable();
    fixture.detectChanges();
    expect(harness.isDisabled()).toBe(false);
  });
});

// ── ngModel integration (separate TestBed) ───────────────────

@Component({
  imports: [AfInputComponent, FormsModule],
  template: `<af-input [(ngModel)]="value" label="NgModel" inputId="ngmodel-input" />`,
})
class NgModelHost {
  value = 'start';
}

describe('AfInputComponent — ngModel', () => {
  let fixture: ComponentFixture<NgModelHost>;
  let harness: AfInputHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgModelHost],
    }).compileComponents();

    fixture = TestBed.createComponent(NgModelHost);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    harness = new AfInputHarness(fixture.nativeElement);
  });

  it('should reflect the initial ngModel value', () => {
    expect(harness.getValue()).toBe('start');
  });

  it('should update ngModel when user types', async () => {
    harness.setValue('typed');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.value).toBe('typed');
  });
});

// ── i18n custom token (separate TestBed) ─────────────────────

@Component({
  imports: [AfInputComponent],
  template: `<af-input label="Name" required inputId="i18n-input" />`,
})
class I18nHost {}

describe('AfInputComponent — i18n custom token', () => {
  it('should use custom i18n string when provided', async () => {
    await TestBed.configureTestingModule({
      imports: [I18nHost],
      providers: [{ provide: AF_INPUT_I18N, useValue: { required: 'Pflichtfeld' } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(I18nHost);
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector('.ct-field__label span');
    expect(span.getAttribute('aria-label')).toBe('Pflichtfeld');
  });
});
