import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AfSliderComponent } from './slider.component';

describe('AfSliderComponent', () => {
  let component: AfSliderComponent;
  let fixture: ComponentFixture<AfSliderComponent>;
  let inputEl: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfSliderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AfSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    inputEl = fixture.nativeElement.querySelector('input[type="range"]');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('default values', () => {
    it('should render a range input', () => {
      expect(inputEl).toBeTruthy();
      expect(inputEl.type).toBe('range');
    });

    it('should have default min=0, max=100, step=1', () => {
      expect(inputEl.min).toBe('0');
      expect(inputEl.max).toBe('100');
      expect(inputEl.step).toBe('1');
    });

    it('should not be disabled by default', () => {
      expect(inputEl.disabled).toBe(false);
    });
  });

  describe('inputs', () => {
    it('should apply min, max, and step attributes', () => {
      fixture.componentRef.setInput('min', 10);
      fixture.componentRef.setInput('max', 50);
      fixture.componentRef.setInput('step', 5);
      fixture.detectChanges();

      expect(inputEl.min).toBe('10');
      expect(inputEl.max).toBe('50');
      expect(inputEl.step).toBe('5');
    });

    it('should apply disabled state', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      expect(inputEl.disabled).toBe(true);
    });

    it('should apply size class for sm', () => {
      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.ct-slider');
      expect(container.classList.contains('ct-slider--sm')).toBe(true);
    });

    it('should apply size class for lg', () => {
      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.ct-slider');
      expect(container.classList.contains('ct-slider--lg')).toBe(true);
    });

    it('should not add size modifier for md (default)', () => {
      const container = fixture.nativeElement.querySelector('.ct-slider');
      expect(container.classList.contains('ct-slider--md')).toBe(false);
      expect(container.className).toBe('ct-slider');
    });
  });

  describe('value display', () => {
    it('should show value output when showValue is true', () => {
      fixture.componentRef.setInput('showValue', true);
      fixture.componentRef.setInput('value', 42);
      fixture.detectChanges();

      const output = fixture.nativeElement.querySelector('output.ct-slider__value');
      expect(output).toBeTruthy();
      expect(output.textContent.trim()).toBe('42');
    });

    it('should not show value output by default', () => {
      const output = fixture.nativeElement.querySelector('output.ct-slider__value');
      expect(output).toBeNull();
    });
  });

  describe('min/max labels', () => {
    it('should show min/max labels when showMinMax is true', () => {
      fixture.componentRef.setInput('showMinMax', true);
      fixture.componentRef.setInput('min', 0);
      fixture.componentRef.setInput('max', 100);
      fixture.detectChanges();

      const minLabel = fixture.nativeElement.querySelector('.ct-slider__min');
      const maxLabel = fixture.nativeElement.querySelector('.ct-slider__max');
      expect(minLabel.textContent.trim()).toBe('0');
      expect(maxLabel.textContent.trim()).toBe('100');
      expect(minLabel.getAttribute('aria-hidden')).toBe('true');
      expect(maxLabel.getAttribute('aria-hidden')).toBe('true');
    });

    it('should not show min/max labels by default', () => {
      expect(fixture.nativeElement.querySelector('.ct-slider__min')).toBeNull();
      expect(fixture.nativeElement.querySelector('.ct-slider__max')).toBeNull();
    });
  });

  describe('accessibility', () => {
    it('should set role="slider" via native range input', () => {
      expect(inputEl.getAttribute('type')).toBe('range');
    });

    it('should set aria-valuenow, aria-valuemin, aria-valuemax', () => {
      fixture.componentRef.setInput('value', 30);
      fixture.componentRef.setInput('min', 10);
      fixture.componentRef.setInput('max', 90);
      fixture.detectChanges();

      expect(inputEl.getAttribute('aria-valuenow')).toBe('30');
      expect(inputEl.getAttribute('aria-valuemin')).toBe('10');
      expect(inputEl.getAttribute('aria-valuemax')).toBe('90');
    });

    it('should set aria-label from label input', () => {
      fixture.componentRef.setInput('label', 'Volume');
      fixture.detectChanges();

      expect(inputEl.getAttribute('aria-label')).toBe('Volume');
    });

    it('should set aria-invalid when invalid', () => {
      fixture.componentRef.setInput('invalid', true);
      fixture.detectChanges();

      expect(inputEl.getAttribute('aria-invalid')).toBe('true');
    });

    it('should not set aria-invalid when valid', () => {
      expect(inputEl.getAttribute('aria-invalid')).toBeNull();
    });

    it('should use valueTextFn for aria-valuetext', () => {
      fixture.componentRef.setInput('value', 25);
      fixture.componentRef.setInput('valueTextFn', (v: number) => `${v} degrees`);
      fixture.detectChanges();

      expect(inputEl.getAttribute('aria-valuetext')).toBe('25 degrees');
    });
  });

  describe('user interaction', () => {
    it('should update value on input event', () => {
      inputEl.value = '75';
      inputEl.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.value()).toBe(75);
    });

    it('should call onTouched on blur', () => {
      const touchedSpy = vi.fn();
      component.registerOnTouched(touchedSpy);

      inputEl.dispatchEvent(new Event('blur'));
      expect(touchedSpy).toHaveBeenCalled();
    });
  });

  describe('CSS variable for track fill', () => {
    it('should compute --_value as percentage', () => {
      fixture.componentRef.setInput('min', 0);
      fixture.componentRef.setInput('max', 200);
      fixture.componentRef.setInput('value', 100);
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.ct-slider');
      expect(container.style.getPropertyValue('--_value')).toBe('50');
    });

    it('should handle edge case where min equals max', () => {
      fixture.componentRef.setInput('min', 50);
      fixture.componentRef.setInput('max', 50);
      fixture.componentRef.setInput('value', 50);
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.ct-slider');
      expect(container.style.getPropertyValue('--_value')).toBe('0');
    });
  });

  describe('ControlValueAccessor', () => {
    it('should write value from form model', () => {
      component.writeValue(55);
      fixture.detectChanges();

      expect(component.value()).toBe(55);
    });

    it('should handle null/undefined in writeValue', () => {
      component.writeValue(null as unknown as number);
      expect(component.value()).toBe(0);
    });

    it('should notify form control on input change', () => {
      const changeSpy = vi.fn();
      component.registerOnChange(changeSpy);

      inputEl.value = '30';
      inputEl.dispatchEvent(new Event('input'));

      expect(changeSpy).toHaveBeenCalledWith(30);
    });

    it('should set disabled state from form', () => {
      component.setDisabledState(true);
      fixture.detectChanges();

      expect(component.disabled()).toBe(true);
      expect(inputEl.disabled).toBe(true);
    });
  });
});

@Component({
  template: `<af-slider [formControl]="control" label="Test Slider" />`,
  imports: [AfSliderComponent, ReactiveFormsModule],
})
class TestHostComponent {
  control = new FormControl(25);
}

describe('AfSliderComponent with Reactive Forms', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let inputEl: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    inputEl = fixture.nativeElement.querySelector('input[type="range"]');
  });

  it('should initialize with form control value', () => {
    expect(inputEl.value).toBe('25');
  });

  it('should update form control when slider changes', () => {
    inputEl.value = '80';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBe(80);
  });

  it('should update slider when form control value changes', () => {
    fixture.componentInstance.control.setValue(60);
    fixture.detectChanges();

    expect(inputEl.value).toBe('60');
  });

  it('should disable slider when form control is disabled', () => {
    fixture.componentInstance.control.disable();
    fixture.detectChanges();

    expect(inputEl.disabled).toBe(true);
  });
});
