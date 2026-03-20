import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AfFieldComponent } from './field.component';

/* ---------- test host ---------- */

@Component({
  imports: [AfFieldComponent],
  template: `
    <af-field
      [label]="label()"
      [hint]="hint()"
      [error]="error()"
      [required]="required()"
    >
      <input class="ct-input" />
    </af-field>
  `,
})
class TestHostComponent {
  label = signal('Email');
  hint = signal('');
  error = signal('');
  required = signal(false);
}

/* ---------- helpers ---------- */

function labelEl(f: ComponentFixture<TestHostComponent>): HTMLLabelElement | null {
  return f.nativeElement.querySelector('.ct-field__label');
}

function hintEl(f: ComponentFixture<TestHostComponent>): HTMLElement | null {
  return f.nativeElement.querySelector('.ct-field__hint');
}

function errorEl(f: ComponentFixture<TestHostComponent>): HTMLElement | null {
  return f.nativeElement.querySelector('.ct-field__error');
}

function control(f: ComponentFixture<TestHostComponent>): HTMLInputElement {
  return f.nativeElement.querySelector('input')!;
}

/* ---------- suite ---------- */

describe('AfFieldComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.nativeElement.querySelector('.ct-field')).toBeTruthy();
  });

  /* --- label --- */

  describe('label', () => {
    it('renders the label text', () => {
      expect(labelEl(fixture)!.textContent!.trim()).toBe('Email');
    });

    it('links label to projected control via for/id', () => {
      const lbl = labelEl(fixture)!;
      const ctrl = control(fixture);
      expect(lbl.getAttribute('for')).toBe(ctrl.id);
    });

    it('hides label when empty', () => {
      fixture.componentInstance.label.set('');
      fixture.detectChanges();
      expect(labelEl(fixture)).toBeNull();
    });

    it('adds required class to label', () => {
      fixture.componentInstance.required.set(true);
      fixture.detectChanges();
      expect(labelEl(fixture)!.classList.contains('ct-field__label--required')).toBe(true);
    });
  });

  /* --- hint --- */

  describe('hint', () => {
    it('renders hint text', () => {
      fixture.componentInstance.hint.set('We will not share this.');
      fixture.detectChanges();
      expect(hintEl(fixture)!.textContent!.trim()).toBe('We will not share this.');
    });

    it('hides hint when error is present', () => {
      fixture.componentInstance.hint.set('Some hint');
      fixture.componentInstance.error.set('Required');
      fixture.detectChanges();
      expect(hintEl(fixture)).toBeNull();
    });
  });

  /* --- error --- */

  describe('error', () => {
    it('renders error message', () => {
      fixture.componentInstance.error.set('This field is required');
      fixture.detectChanges();
      expect(errorEl(fixture)!.textContent!.trim()).toBe('This field is required');
    });

    it('error has role="alert"', () => {
      fixture.componentInstance.error.set('Required');
      fixture.detectChanges();
      expect(errorEl(fixture)!.getAttribute('role')).toBe('alert');
    });
  });

  /* --- accessibility --- */

  describe('accessibility', () => {
    it('sets aria-describedby to hint id when hint is shown', () => {
      fixture.componentInstance.hint.set('A hint');
      fixture.detectChanges();

      const ctrl = control(fixture);
      const hint = hintEl(fixture)!;
      expect(ctrl.getAttribute('aria-describedby')).toBe(hint.id);
    });

    it('sets aria-describedby to error id when error is shown', () => {
      fixture.componentInstance.error.set('Error!');
      fixture.detectChanges();

      const ctrl = control(fixture);
      const err = errorEl(fixture)!;
      expect(ctrl.getAttribute('aria-describedby')).toBe(err.id);
    });

    it('removes aria-describedby when neither hint nor error', () => {
      fixture.componentInstance.hint.set('');
      fixture.componentInstance.error.set('');
      fixture.detectChanges();
      expect(control(fixture).hasAttribute('aria-describedby')).toBe(false);
    });

    it('sets aria-invalid on control when error is present', () => {
      fixture.componentInstance.error.set('Invalid');
      fixture.detectChanges();
      expect(control(fixture).getAttribute('aria-invalid')).toBe('true');
    });

    it('removes aria-invalid when error is cleared', () => {
      fixture.componentInstance.error.set('Invalid');
      fixture.detectChanges();

      fixture.componentInstance.error.set('');
      fixture.detectChanges();
      expect(control(fixture).hasAttribute('aria-invalid')).toBe(false);
    });
  });

  /* --- auto id --- */

  describe('auto id', () => {
    it('assigns auto-generated id to projected control', () => {
      expect(control(fixture).id).toMatch(/^af-field-\d+$/);
    });
  });
});

/* --- custom fieldId --- */

describe('AfFieldComponent with custom fieldId', () => {
  @Component({
    imports: [AfFieldComponent],
    template: `
      <af-field label="Name" fieldId="my-custom-id">
        <input class="ct-input" />
      </af-field>
    `,
  })
  class CustomIdHost {}

  it('uses custom fieldId on projected control', async () => {
    await TestBed.configureTestingModule({
      imports: [CustomIdHost],
    }).compileComponents();

    const f = TestBed.createComponent(CustomIdHost);
    f.detectChanges();

    const input = f.nativeElement.querySelector('input')!;
    expect(input.id).toBe('my-custom-id');
  });
});

/* --- textarea projection --- */

describe('AfFieldComponent with textarea', () => {
  @Component({
    imports: [AfFieldComponent],
    template: `
      <af-field label="Bio">
        <textarea class="ct-textarea"></textarea>
      </af-field>
    `,
  })
  class TextareaHost {}

  it('links label to projected textarea', async () => {
    await TestBed.configureTestingModule({
      imports: [TextareaHost],
    }).compileComponents();

    const f = TestBed.createComponent(TextareaHost);
    f.detectChanges();

    const label = f.nativeElement.querySelector('label')!;
    const textarea = f.nativeElement.querySelector('textarea')!;
    expect(label.getAttribute('for')).toBe(textarea.id);
  });
});

/* --- select projection --- */

describe('AfFieldComponent with select', () => {
  @Component({
    imports: [AfFieldComponent],
    template: `
      <af-field label="Country">
        <select class="ct-select">
          <option>Germany</option>
        </select>
      </af-field>
    `,
  })
  class SelectHost {}

  it('links label to projected select', async () => {
    await TestBed.configureTestingModule({
      imports: [SelectHost],
    }).compileComponents();

    const f = TestBed.createComponent(SelectHost);
    f.detectChanges();

    const label = f.nativeElement.querySelector('label')!;
    const select = f.nativeElement.querySelector('select')!;
    expect(label.getAttribute('for')).toBe(select.id);
  });
});
