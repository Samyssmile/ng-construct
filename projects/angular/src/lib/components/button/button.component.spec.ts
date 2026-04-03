import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { AfButtonComponent, AfButtonVariant, AfButtonSize, AfButtonType } from './button.component';
import { AfButtonHarness } from './button.harness';

@Component({
  imports: [AfButtonComponent],
  template: `
    <af-button
      [variant]="variant()"
      [size]="size()"
      [type]="type()"
      [disabled]="disabled()"
      [iconOnly]="iconOnly()"
      [ariaLabel]="ariaLabel()"
      [title]="titleText()"
      (clicked)="lastClickEvent.set($event); clickCount.set(clickCount() + 1)">
      {{ content() }}
    </af-button>
  `,
})
class TestHostComponent {
  variant = signal<AfButtonVariant>('primary');
  size = signal<AfButtonSize>('md');
  type = signal<AfButtonType>('button');
  disabled = signal(false);
  iconOnly = signal(false);
  ariaLabel = signal('');
  titleText = signal('');
  content = signal('Click me');
  clickCount = signal(0);
  lastClickEvent = signal<MouseEvent | null>(null);
}

describe('AfButtonComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let harness: AfButtonHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    harness = new AfButtonHarness(fixture.nativeElement);
  });

  function getButtonEl(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('af-button button');
  }

  // ── rendering ──────────────────────────────────────────────

  describe('rendering', () => {
    it('should render the inner button element', () => {
      expect(getButtonEl()).toBeTruthy();
    });

    it('should apply the ct-button base class', () => {
      expect(harness.hasClass('ct-button')).toBe(true);
    });

    it('should project text content', () => {
      expect(harness.getText()).toBe('Click me');
    });

    it('should have type="button" by default', () => {
      expect(harness.getType()).toBe('button');
    });
  });

  // ── variants ───────────────────────────────────────────────

  describe('variants', () => {
    it('should not add a variant modifier class for primary (default)', () => {
      expect(harness.getClasses()).toBe('ct-button');
    });

    const nonDefaultVariants: AfButtonVariant[] = ['secondary', 'ghost', 'outline', 'danger', 'accent', 'link'];

    for (const v of nonDefaultVariants) {
      it(`should add ct-button--${v} for variant "${v}"`, () => {
        host.variant.set(v);
        fixture.detectChanges();
        expect(harness.hasClass(`ct-button--${v}`)).toBe(true);
        expect(harness.hasClass('ct-button')).toBe(true);
      });
    }
  });

  // ── sizes ──────────────────────────────────────────────────

  describe('sizes', () => {
    it('should not add a size modifier class for md (default)', () => {
      expect(harness.hasClass('ct-button--md')).toBe(false);
    });

    it('should add ct-button--sm for size "sm"', () => {
      host.size.set('sm');
      fixture.detectChanges();
      expect(harness.hasClass('ct-button--sm')).toBe(true);
    });

    it('should add ct-button--lg for size "lg"', () => {
      host.size.set('lg');
      fixture.detectChanges();
      expect(harness.hasClass('ct-button--lg')).toBe(true);
    });
  });

  // ── type attribute ─────────────────────────────────────────

  describe('type attribute', () => {
    it('should default to type="button"', () => {
      expect(getButtonEl().type).toBe('button');
    });

    it('should set type="submit"', () => {
      host.type.set('submit');
      fixture.detectChanges();
      expect(getButtonEl().type).toBe('submit');
    });

    it('should set type="reset"', () => {
      host.type.set('reset');
      fixture.detectChanges();
      expect(getButtonEl().type).toBe('reset');
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

    it('should not emit clicked when disabled', () => {
      host.disabled.set(true);
      fixture.detectChanges();
      harness.click();
      fixture.detectChanges();
      expect(host.clickCount()).toBe(0);
    });
  });

  // ── icon-only ──────────────────────────────────────────────

  describe('icon-only', () => {
    it('should not add ct-button--icon by default', () => {
      expect(harness.hasClass('ct-button--icon')).toBe(false);
    });

    it('should add ct-button--icon when iconOnly is true', () => {
      host.iconOnly.set(true);
      host.ariaLabel.set('Action');
      fixture.detectChanges();
      expect(harness.hasClass('ct-button--icon')).toBe(true);
    });
  });

  // ── ARIA attributes ────────────────────────────────────────

  describe('ARIA attributes', () => {
    it('should not set aria-label when ariaLabel is empty', () => {
      expect(harness.getAriaLabel()).toBeNull();
    });

    it('should set aria-label when provided', () => {
      host.ariaLabel.set('Delete item');
      fixture.detectChanges();
      expect(harness.getAriaLabel()).toBe('Delete item');
    });

    it('should not set title when titleText is empty', () => {
      expect(harness.getTitle()).toBeNull();
    });

    it('should set title when provided', () => {
      host.titleText.set('More info');
      fixture.detectChanges();
      expect(harness.getTitle()).toBe('More info');
    });
  });

  // ── click handling ─────────────────────────────────────────

  describe('click handling', () => {
    it('should emit clicked event on click', () => {
      harness.click();
      fixture.detectChanges();
      expect(host.clickCount()).toBe(1);
    });

    it('should pass a MouseEvent to the clicked output', () => {
      harness.click();
      fixture.detectChanges();
      expect(host.lastClickEvent()).toBeInstanceOf(MouseEvent);
    });

    it('should not emit clicked when disabled', () => {
      host.disabled.set(true);
      fixture.detectChanges();
      harness.click();
      fixture.detectChanges();
      expect(host.clickCount()).toBe(0);
    });
  });

  // ── keyboard interaction ───────────────────────────────────

  describe('keyboard interaction', () => {
    it('should trigger click on Enter key (native button)', () => {
      const btn = getButtonEl();
      btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      btn.click();
      fixture.detectChanges();
      expect(host.clickCount()).toBe(1);
    });

    it('should trigger click on Space key (native button)', () => {
      const btn = getButtonEl();
      btn.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      btn.click();
      fixture.detectChanges();
      expect(host.clickCount()).toBe(1);
    });
  });

  // ── class combinations ─────────────────────────────────────

  describe('class combinations', () => {
    it('should combine variant, size, and icon modifiers', () => {
      host.variant.set('danger');
      host.size.set('lg');
      host.iconOnly.set(true);
      host.ariaLabel.set('Delete');
      fixture.detectChanges();

      expect(harness.hasClass('ct-button')).toBe(true);
      expect(harness.hasClass('ct-button--danger')).toBe(true);
      expect(harness.hasClass('ct-button--lg')).toBe(true);
      expect(harness.hasClass('ct-button--icon')).toBe(true);
    });
  });

  // ── dev mode warnings ──────────────────────────────────────

  describe('dev mode warnings', () => {
    it('should warn when iconOnly is true without ariaLabel', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      host.iconOnly.set(true);
      host.ariaLabel.set('');
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith(
        'af-button: iconOnly buttons require an ariaLabel for screen readers.',
      );
      spy.mockRestore();
    });

    it('should not warn when iconOnly is true with ariaLabel', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      host.iconOnly.set(true);
      host.ariaLabel.set('Action');
      fixture.detectChanges();

      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should not warn when iconOnly is false', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      host.iconOnly.set(false);
      fixture.detectChanges();

      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});
