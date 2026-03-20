import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import {
  AfEmptyStateComponent,
  AfEmptyStateSize,
  AfEmptyStateVariant,
} from './empty-state.component';

@Component({
  imports: [AfEmptyStateComponent],
  template: `
    <af-empty-state
      [size]="size()"
      [variant]="variant()"
      [bordered]="bordered()"
      [icon]="icon()">
      @if (showIcon()) {
        <span icon>📦</span>
      }
      <span title>No items found</span>
      <span description>Try adjusting your search or filter criteria.</span>
      @if (showActions()) {
        <div actions>
          <button id="action-btn">Add Item</button>
        </div>
      }
    </af-empty-state>
  `,
})
class TestHostComponent {
  size = signal<AfEmptyStateSize>('md');
  variant = signal<AfEmptyStateVariant>('default');
  bordered = signal(false);
  icon = signal('');
  showIcon = signal(true);
  showActions = signal(false);
}

describe('AfEmptyStateComponent', () => {
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

  function getEmptyStateEl(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.ct-empty-state');
  }

  describe('rendering', () => {
    it('should render the empty state element', () => {
      expect(getEmptyStateEl()).toBeTruthy();
    });

    it('should apply ct-empty-state base class', () => {
      expect(getEmptyStateEl()!.classList.contains('ct-empty-state')).toBe(
        true,
      );
    });

    it('should not apply size modifier for default (md) size', () => {
      expect(
        getEmptyStateEl()!.classList.contains('ct-empty-state--md'),
      ).toBe(false);
    });

    it('should apply ct-empty-state--sm for small size', () => {
      host.size.set('sm');
      fixture.detectChanges();
      expect(
        getEmptyStateEl()!.classList.contains('ct-empty-state--sm'),
      ).toBe(true);
    });

    it('should apply ct-empty-state--lg for large size', () => {
      host.size.set('lg');
      fixture.detectChanges();
      expect(
        getEmptyStateEl()!.classList.contains('ct-empty-state--lg'),
      ).toBe(true);
    });

    it('should not apply error modifier by default', () => {
      expect(
        getEmptyStateEl()!.classList.contains('ct-empty-state--error'),
      ).toBe(false);
    });

    it('should apply ct-empty-state--error for error variant', () => {
      host.variant.set('error');
      fixture.detectChanges();
      expect(
        getEmptyStateEl()!.classList.contains('ct-empty-state--error'),
      ).toBe(true);
    });

    it('should not apply bordered modifier by default', () => {
      expect(
        getEmptyStateEl()!.classList.contains('ct-empty-state--bordered'),
      ).toBe(false);
    });

    it('should apply ct-empty-state--bordered when bordered is true', () => {
      host.bordered.set(true);
      fixture.detectChanges();
      expect(
        getEmptyStateEl()!.classList.contains('ct-empty-state--bordered'),
      ).toBe(true);
    });

    it('should combine multiple modifiers correctly', () => {
      host.size.set('lg');
      host.variant.set('error');
      host.bordered.set(true);
      fixture.detectChanges();

      const el = getEmptyStateEl()!;
      expect(el.classList.contains('ct-empty-state')).toBe(true);
      expect(el.classList.contains('ct-empty-state--lg')).toBe(true);
      expect(el.classList.contains('ct-empty-state--error')).toBe(true);
      expect(el.classList.contains('ct-empty-state--bordered')).toBe(true);
    });

    it('should update classes dynamically when inputs change', () => {
      host.size.set('sm');
      fixture.detectChanges();
      expect(
        getEmptyStateEl()!.classList.contains('ct-empty-state--sm'),
      ).toBe(true);

      host.size.set('lg');
      fixture.detectChanges();
      expect(
        getEmptyStateEl()!.classList.contains('ct-empty-state--sm'),
      ).toBe(false);
      expect(
        getEmptyStateEl()!.classList.contains('ct-empty-state--lg'),
      ).toBe(true);
    });
  });

  describe('content projection', () => {
    it('should project icon content', () => {
      const icon = getEmptyStateEl()!.querySelector(
        '.ct-empty-state__icon',
      );
      expect(icon?.textContent?.trim()).toBe('📦');
    });

    it('should project title content', () => {
      const title = getEmptyStateEl()!.querySelector(
        '.ct-empty-state__title',
      );
      expect(title?.textContent?.trim()).toBe('No items found');
    });

    it('should project description content', () => {
      const desc = getEmptyStateEl()!.querySelector(
        '.ct-empty-state__description',
      );
      expect(desc?.textContent?.trim()).toBe(
        'Try adjusting your search or filter criteria.',
      );
    });

    it('should project actions content', () => {
      host.showActions.set(true);
      fixture.detectChanges();
      const btn = getEmptyStateEl()!.querySelector('#action-btn');
      expect(btn).toBeTruthy();
      expect(btn!.textContent).toBe('Add Item');
    });
  });

  describe('icon input', () => {
    it('should display icon input value when provided', () => {
      host.icon.set('🔍');
      host.showIcon.set(false);
      fixture.detectChanges();
      const icon = getEmptyStateEl()!.querySelector(
        '.ct-empty-state__icon',
      );
      expect(icon?.textContent?.trim()).toBe('🔍');
    });

    it('should prefer icon input over projected content', () => {
      host.icon.set('🔍');
      fixture.detectChanges();
      const icon = getEmptyStateEl()!.querySelector(
        '.ct-empty-state__icon',
      );
      expect(icon?.textContent?.trim()).toBe('🔍');
    });

    it('should update icon when input changes', () => {
      host.icon.set('🔍');
      fixture.detectChanges();
      const icon = getEmptyStateEl()!.querySelector(
        '.ct-empty-state__icon',
      );
      expect(icon?.textContent?.trim()).toBe('🔍');

      host.icon.set('⚠');
      fixture.detectChanges();
      expect(icon?.textContent?.trim()).toBe('⚠');
    });
  });

  describe('accessibility', () => {
    it('should have role="status" on the container', () => {
      expect(getEmptyStateEl()!.getAttribute('role')).toBe('status');
    });

    it('should mark icon container as aria-hidden', () => {
      const icon = getEmptyStateEl()!.querySelector(
        '.ct-empty-state__icon',
      );
      expect(icon?.getAttribute('aria-hidden')).toBe('true');
    });
  });
});
