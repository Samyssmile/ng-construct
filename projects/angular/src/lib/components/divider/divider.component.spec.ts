import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { AfDividerComponent } from './divider.component';

describe('AfDividerComponent', () => {
  let component: AfDividerComponent;
  let fixture: ComponentFixture<AfDividerComponent>;
  let hostEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfDividerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AfDividerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    hostEl = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('defaults', () => {
    it('should have role="separator"', () => {
      expect(hostEl.getAttribute('role')).toBe('separator');
    });

    it('should have aria-orientation="horizontal"', () => {
      expect(hostEl.getAttribute('aria-orientation')).toBe('horizontal');
    });

    it('should have ct-divider base class', () => {
      expect(hostEl.classList.contains('ct-divider')).toBe(true);
    });

    it('should not have modifier classes by default', () => {
      expect(hostEl.className).toBe('ct-divider');
    });

    it('should not render a label', () => {
      expect(hostEl.querySelector('.ct-divider__label')).toBeNull();
    });
  });

  describe('orientation', () => {
    it('should add vertical modifier class', () => {
      fixture.componentRef.setInput('orientation', 'vertical');
      fixture.detectChanges();

      expect(hostEl.classList.contains('ct-divider--vertical')).toBe(true);
    });

    it('should set aria-orientation to vertical', () => {
      fixture.componentRef.setInput('orientation', 'vertical');
      fixture.detectChanges();

      expect(hostEl.getAttribute('aria-orientation')).toBe('vertical');
    });

    it('should not add vertical modifier for horizontal', () => {
      fixture.componentRef.setInput('orientation', 'horizontal');
      fixture.detectChanges();

      expect(hostEl.classList.contains('ct-divider--vertical')).toBe(false);
    });
  });

  describe('color', () => {
    it('should add strong modifier class', () => {
      fixture.componentRef.setInput('color', 'strong');
      fixture.detectChanges();

      expect(hostEl.classList.contains('ct-divider--strong')).toBe(true);
    });

    it('should add muted modifier class', () => {
      fixture.componentRef.setInput('color', 'muted');
      fixture.detectChanges();

      expect(hostEl.classList.contains('ct-divider--muted')).toBe(true);
    });

    it('should not add color modifier for default', () => {
      expect(hostEl.classList.contains('ct-divider--default')).toBe(false);
    });
  });

  describe('spacing', () => {
    it('should add sm modifier class', () => {
      fixture.componentRef.setInput('spacing', 'sm');
      fixture.detectChanges();

      expect(hostEl.classList.contains('ct-divider--sm')).toBe(true);
    });

    it('should add lg modifier class', () => {
      fixture.componentRef.setInput('spacing', 'lg');
      fixture.detectChanges();

      expect(hostEl.classList.contains('ct-divider--lg')).toBe(true);
    });

    it('should add none modifier class', () => {
      fixture.componentRef.setInput('spacing', 'none');
      fixture.detectChanges();

      expect(hostEl.classList.contains('ct-divider--none')).toBe(true);
    });

    it('should not add spacing modifier for md (default)', () => {
      expect(hostEl.classList.contains('ct-divider--md')).toBe(false);
    });
  });

  describe('label', () => {
    it('should render label text', () => {
      fixture.componentRef.setInput('label', 'Section');
      fixture.detectChanges();

      const labelEl = hostEl.querySelector('.ct-divider__label');
      expect(labelEl).toBeTruthy();
      expect(labelEl!.textContent!.trim()).toBe('Section');
    });

    it('should add labeled modifier class', () => {
      fixture.componentRef.setInput('label', 'Section');
      fixture.detectChanges();

      expect(hostEl.classList.contains('ct-divider--labeled')).toBe(true);
    });

    it('should not render label for empty string', () => {
      fixture.componentRef.setInput('label', '');
      fixture.detectChanges();

      expect(hostEl.querySelector('.ct-divider__label')).toBeNull();
      expect(hostEl.classList.contains('ct-divider--labeled')).toBe(false);
    });
  });

  describe('combined inputs', () => {
    it('should combine orientation, color, and spacing classes', () => {
      fixture.componentRef.setInput('orientation', 'vertical');
      fixture.componentRef.setInput('color', 'strong');
      fixture.componentRef.setInput('spacing', 'lg');
      fixture.detectChanges();

      expect(hostEl.classList.contains('ct-divider')).toBe(true);
      expect(hostEl.classList.contains('ct-divider--vertical')).toBe(true);
      expect(hostEl.classList.contains('ct-divider--strong')).toBe(true);
      expect(hostEl.classList.contains('ct-divider--lg')).toBe(true);
    });
  });
});

@Component({
  template: `<af-divider [orientation]="orientation()" [label]="label()" />`,
  imports: [AfDividerComponent],
})
class TestHostComponent {
  orientation = signal<'horizontal' | 'vertical'>('horizontal');
  label = signal('');
}

describe('AfDividerComponent in host', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let dividerEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    dividerEl = fixture.nativeElement.querySelector('af-divider');
  });

  it('should render with separator role in host context', () => {
    expect(dividerEl.getAttribute('role')).toBe('separator');
  });

  it('should update orientation via host binding', () => {
    fixture.componentInstance.orientation.set('vertical');
    fixture.detectChanges();

    expect(dividerEl.getAttribute('aria-orientation')).toBe('vertical');
    expect(dividerEl.classList.contains('ct-divider--vertical')).toBe(true);
  });

  it('should toggle label rendering via host binding', () => {
    expect(dividerEl.querySelector('.ct-divider__label')).toBeNull();

    fixture.componentInstance.label.set('OR');
    fixture.detectChanges();

    const labelEl = dividerEl.querySelector('.ct-divider__label');
    expect(labelEl).toBeTruthy();
    expect(labelEl!.textContent!.trim()).toBe('OR');
  });
});
