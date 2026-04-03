import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { AfChipComponent, AfChipVariant, AfChipAppearance, AfChipSize } from './chip.component';

@Component({
  imports: [AfChipComponent],
  template: `
    <af-chip
      [variant]="variant()"
      [appearance]="appearance()"
      [size]="size()"
      [selectable]="selectable()"
      [(selected)]="selected"
      [disabled]="disabled()"
      [removable]="removable()"
      [dot]="dot()"
      [value]="value()"
      [ariaLabel]="ariaLabel()"
      [removeAriaLabel]="removeAriaLabel()"
      (removed)="lastRemovedValue.set($event); removedCount.set(removedCount() + 1)">
      @if (showAvatar()) {
        <img chipAvatar src="avatar.png" alt="User" />
      }
      @if (showIcon()) {
        <span chipIcon>IC</span>
      }
      Test Chip
    </af-chip>
  `,
})
class TestHostComponent {
  variant = signal<AfChipVariant>('default');
  appearance = signal<AfChipAppearance>('subtle');
  size = signal<AfChipSize>('md');
  selectable = signal(false);
  selected = signal(false);
  disabled = signal(false);
  removable = signal(false);
  dot = signal(false);
  ariaLabel = signal<string | undefined>(undefined);
  showIcon = signal(false);
  showAvatar = signal(false);
  value = signal<unknown>(undefined);
  removeAriaLabel = signal('Remove');
  removedCount = signal(0);
  lastRemovedValue = signal<unknown>(undefined);
}

describe('AfChipComponent', () => {
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

  function getChipEl(): HTMLElement {
    return fixture.nativeElement.querySelector('af-chip');
  }

  function getRemoveBtn(): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector('.ct-chip__remove');
  }

  function getDot(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.ct-chip__dot');
  }

  function getCheck(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.ct-chip__check');
  }

  function getLabel(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.ct-chip__label');
  }

  function getIconWrapper(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.ct-chip__icon');
  }

  function getAvatarWrapper(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.ct-chip__avatar');
  }

  function getActionEl(): HTMLElement {
    return fixture.nativeElement.querySelector('.ct-chip__action');
  }

  // ── Rendering ──────────────────────────────────────────────

  describe('rendering', () => {
    it('should render the chip element', () => {
      expect(getChipEl()).toBeTruthy();
    });

    it('should apply ct-chip base class on host', () => {
      expect(getChipEl().classList.contains('ct-chip')).toBe(true);
    });

    it('should render projected label text', () => {
      expect(getLabel()!.textContent).toContain('Test Chip');
    });
  });

  // ── Size variants ──────────────────────────────────────────

  describe('sizes', () => {
    it('should not add size class for md (default)', () => {
      expect(getChipEl().className).toBe('ct-chip');
    });

    it('should add ct-chip--sm for small', () => {
      host.size.set('sm');
      fixture.detectChanges();
      expect(getChipEl().classList.contains('ct-chip--sm')).toBe(true);
    });

    it('should add ct-chip--lg for large', () => {
      host.size.set('lg');
      fixture.detectChanges();
      expect(getChipEl().classList.contains('ct-chip--lg')).toBe(true);
    });
  });

  // ── Appearance variants ────────────────────────────────────

  describe('appearances', () => {
    it('should not add appearance class for subtle (default)', () => {
      expect(getChipEl().className).toBe('ct-chip');
    });

    it('should add ct-chip--outline for outline', () => {
      host.appearance.set('outline');
      fixture.detectChanges();
      expect(getChipEl().classList.contains('ct-chip--outline')).toBe(true);
    });

    it('should add ct-chip--solid for solid', () => {
      host.appearance.set('solid');
      fixture.detectChanges();
      expect(getChipEl().classList.contains('ct-chip--solid')).toBe(true);
    });
  });

  // ── Semantic color variants ────────────────────────────────

  describe('variants', () => {
    it('should not add variant class for default', () => {
      expect(getChipEl().className).toBe('ct-chip');
    });

    for (const v of ['info', 'success', 'warning', 'danger'] as AfChipVariant[]) {
      it(`should add ct-chip--${v} for ${v} variant`, () => {
        host.variant.set(v);
        fixture.detectChanges();
        expect(getChipEl().classList.contains(`ct-chip--${v}`)).toBe(true);
      });
    }
  });

  // ── Selectable state ──────────────────────────────────────

  describe('selectable', () => {
    it('should not have role or tabindex when not selectable', () => {
      expect(getChipEl().getAttribute('role')).toBeNull();
      expect(getChipEl().getAttribute('tabindex')).toBeNull();
    });

    it('should set role="button" when selectable and not removable', () => {
      host.selectable.set(true);
      fixture.detectChanges();
      expect(getChipEl().getAttribute('role')).toBe('button');
    });

    it('should set role="group" when selectable and removable', () => {
      host.selectable.set(true);
      host.removable.set(true);
      fixture.detectChanges();
      expect(getChipEl().getAttribute('role')).toBe('group');
    });

    it('should set tabindex="0" when selectable and not disabled', () => {
      host.selectable.set(true);
      fixture.detectChanges();
      expect(getChipEl().getAttribute('tabindex')).toBe('0');
    });

    it('should add ct-chip--interactive class', () => {
      host.selectable.set(true);
      fixture.detectChanges();
      expect(getChipEl().classList.contains('ct-chip--interactive')).toBe(true);
    });

    it('should render checkmark element when selectable', () => {
      host.selectable.set(true);
      fixture.detectChanges();
      expect(getCheck()).toBeTruthy();
    });

    it('should not render checkmark when not selectable', () => {
      expect(getCheck()).toBeNull();
    });

    it('should delegate interaction to action element when selectable and removable', () => {
      host.selectable.set(true);
      host.removable.set(true);
      fixture.detectChanges();
      expect(getChipEl().getAttribute('tabindex')).toBeNull();
      expect(getActionEl().getAttribute('role')).toBe('button');
      expect(getActionEl().getAttribute('tabindex')).toBe('0');
    });

    it('should not set interactive attributes on action element when only selectable', () => {
      host.selectable.set(true);
      fixture.detectChanges();
      expect(getActionEl().getAttribute('role')).toBeNull();
      expect(getActionEl().getAttribute('tabindex')).toBeNull();
    });
  });

  // ── Selected state ─────────────────────────────────────────

  describe('selected', () => {
    it('should set aria-pressed="true" when selectable and selected', () => {
      host.selectable.set(true);
      host.selected.set(true);
      fixture.detectChanges();
      expect(getChipEl().getAttribute('aria-pressed')).toBe('true');
    });

    it('should set aria-pressed="false" when selectable and not selected', () => {
      host.selectable.set(true);
      fixture.detectChanges();
      expect(getChipEl().getAttribute('aria-pressed')).toBe('false');
    });

    it('should not set aria-pressed when not selectable', () => {
      host.selected.set(true);
      fixture.detectChanges();
      expect(getChipEl().getAttribute('aria-pressed')).toBeNull();
    });

    it('should add ct-chip--selected class when selectable and selected', () => {
      host.selectable.set(true);
      host.selected.set(true);
      fixture.detectChanges();
      expect(getChipEl().classList.contains('ct-chip--selected')).toBe(true);
    });

    it('should not add ct-chip--selected class when selected but not selectable', () => {
      host.selected.set(true);
      fixture.detectChanges();
      expect(getChipEl().classList.contains('ct-chip--selected')).toBe(false);
    });

    it('should set aria-pressed on action element instead of host when selectable and removable', () => {
      host.selectable.set(true);
      host.removable.set(true);
      host.selected.set(true);
      fixture.detectChanges();
      expect(getChipEl().getAttribute('aria-pressed')).toBeNull();
      expect(getActionEl().getAttribute('aria-pressed')).toBe('true');
    });
  });

  // ── Disabled state ─────────────────────────────────────────

  describe('disabled', () => {
    it('should set aria-disabled="true" when disabled', () => {
      host.disabled.set(true);
      fixture.detectChanges();
      expect(getChipEl().getAttribute('aria-disabled')).toBe('true');
    });

    it('should not set aria-disabled when not disabled', () => {
      expect(getChipEl().getAttribute('aria-disabled')).toBeNull();
    });

    it('should add ct-chip--disabled class when disabled', () => {
      host.disabled.set(true);
      fixture.detectChanges();
      expect(getChipEl().classList.contains('ct-chip--disabled')).toBe(true);
    });

    it('should not add ct-chip--disabled class when not disabled', () => {
      expect(getChipEl().classList.contains('ct-chip--disabled')).toBe(false);
    });

    it('should not set tabindex when selectable but disabled', () => {
      host.selectable.set(true);
      host.disabled.set(true);
      fixture.detectChanges();
      expect(getChipEl().getAttribute('tabindex')).toBeNull();
    });

    it('should not set tabindex on action element when selectable, removable, and disabled', () => {
      host.selectable.set(true);
      host.removable.set(true);
      host.disabled.set(true);
      fixture.detectChanges();
      expect(getActionEl().getAttribute('tabindex')).toBeNull();
    });
  });

  // ── Toggle on click ───────────────────────────────────────

  describe('toggle on click', () => {
    it('should toggle selected when selectable chip is clicked', () => {
      host.selectable.set(true);
      fixture.detectChanges();

      getChipEl().click();
      expect(host.selected()).toBe(true);
    });

    it('should not toggle selected when non-selectable chip is clicked', () => {
      getChipEl().click();
      expect(host.selected()).toBe(false);
    });

    it('should not toggle selected when disabled selectable chip is clicked', () => {
      host.selectable.set(true);
      host.disabled.set(true);
      fixture.detectChanges();

      getChipEl().click();
      expect(host.selected()).toBe(false);
    });

    it('should toggle selected when action element is clicked in selectable+removable chip', () => {
      host.selectable.set(true);
      host.removable.set(true);
      fixture.detectChanges();

      getActionEl().click();
      expect(host.selected()).toBe(true);
    });

    it('should toggle back to false when currently selected', () => {
      host.selectable.set(true);
      host.selected.set(true);
      fixture.detectChanges();

      getChipEl().click();
      expect(host.selected()).toBe(false);
    });
  });

  // ── Keyboard handling ──────────────────────────────────────

  describe('keyboard handling', () => {
    it('should toggle selected on Enter key', () => {
      host.selectable.set(true);
      fixture.detectChanges();

      getChipEl().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(host.selected()).toBe(true);
    });

    it('should toggle selected on Space key', () => {
      host.selectable.set(true);
      fixture.detectChanges();

      getChipEl().dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      expect(host.selected()).toBe(true);
    });

    it('should not toggle on keyboard when disabled', () => {
      host.selectable.set(true);
      host.disabled.set(true);
      fixture.detectChanges();

      getChipEl().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(host.selected()).toBe(false);
    });

    it('should not toggle on keyboard when not selectable', () => {
      getChipEl().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(host.selected()).toBe(false);
    });
  });

  // ── Remove button ──────────────────────────────────────────

  describe('removable', () => {
    it('should not show remove button by default', () => {
      expect(getRemoveBtn()).toBeNull();
    });

    it('should show remove button when removable is true', () => {
      host.removable.set(true);
      fixture.detectChanges();
      expect(getRemoveBtn()).toBeTruthy();
    });

    it('should not show remove button when removable but disabled', () => {
      host.removable.set(true);
      host.disabled.set(true);
      fixture.detectChanges();
      expect(getRemoveBtn()).toBeNull();
    });

    it('should have type="button" on remove button', () => {
      host.removable.set(true);
      fixture.detectChanges();
      expect(getRemoveBtn()!.getAttribute('type')).toBe('button');
    });

    it('should have accessible aria-label on remove button', () => {
      host.removable.set(true);
      fixture.detectChanges();
      expect(getRemoveBtn()!.getAttribute('aria-label')).toBe('Remove');
    });

    it('should use custom removeAriaLabel when provided', () => {
      host.removable.set(true);
      host.removeAriaLabel.set('Entfernen');
      fixture.detectChanges();
      expect(getRemoveBtn()!.getAttribute('aria-label')).toBe('Entfernen');
    });

    it('should emit removed when remove button is clicked', () => {
      host.removable.set(true);
      fixture.detectChanges();

      getRemoveBtn()!.click();
      expect(host.removedCount()).toBe(1);
    });

    it('should not toggle selected when remove button is clicked on selectable chip', () => {
      host.selectable.set(true);
      host.removable.set(true);
      fixture.detectChanges();

      getRemoveBtn()!.click();
      expect(host.selected()).toBe(false);
    });

    it('should not toggle selected when Enter is pressed on the remove button', () => {
      host.selectable.set(true);
      host.removable.set(true);
      fixture.detectChanges();

      getRemoveBtn()!.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      );
      expect(host.selected()).toBe(false);
    });

    it('should emit removed on Delete key', () => {
      host.removable.set(true);
      fixture.detectChanges();

      getChipEl().dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }),
      );
      expect(host.removedCount()).toBe(1);
    });

    it('should emit removed on Backspace key', () => {
      host.removable.set(true);
      fixture.detectChanges();

      getChipEl().dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }),
      );
      expect(host.removedCount()).toBe(1);
    });

    it('should not emit removed on Delete key when disabled', () => {
      host.removable.set(true);
      host.disabled.set(true);
      fixture.detectChanges();

      getChipEl().dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }),
      );
      expect(host.removedCount()).toBe(0);
    });

    it('should not emit removed on Delete key when not removable', () => {
      getChipEl().dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }),
      );
      expect(host.removedCount()).toBe(0);
    });
  });

  // ── Value & removed payload ─────────────────────────────────

  describe('value', () => {
    it('should emit value when remove button is clicked', () => {
      host.removable.set(true);
      host.value.set('tag-1');
      fixture.detectChanges();

      getRemoveBtn()!.click();
      expect(host.lastRemovedValue()).toBe('tag-1');
    });

    it('should emit value on Delete key', () => {
      host.removable.set(true);
      host.value.set(42);
      fixture.detectChanges();

      getChipEl().dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }),
      );
      expect(host.lastRemovedValue()).toBe(42);
    });

    it('should emit undefined when no value is set', () => {
      host.removable.set(true);
      fixture.detectChanges();

      getRemoveBtn()!.click();
      expect(host.lastRemovedValue()).toBeUndefined();
    });
  });

  // ── Dot indicator ──────────────────────────────────────────

  describe('dot', () => {
    it('should not show dot by default', () => {
      expect(getDot()).toBeNull();
    });

    it('should show dot when dot is true', () => {
      host.dot.set(true);
      fixture.detectChanges();
      expect(getDot()).toBeTruthy();
    });

    it('should mark dot as aria-hidden', () => {
      host.dot.set(true);
      fixture.detectChanges();
      expect(getDot()!.getAttribute('aria-hidden')).toBe('true');
    });

    it('should hide icon and avatar when dot is shown', () => {
      host.dot.set(true);
      host.showIcon.set(true);
      host.showAvatar.set(true);
      fixture.detectChanges();
      expect(getIconWrapper()).toBeNull();
      expect(getAvatarWrapper()).toBeNull();
    });
  });

  // ── Content projection ─────────────────────────────────────

  describe('content projection', () => {
    it('should project icon content with chipIcon attribute', () => {
      host.showIcon.set(true);
      fixture.detectChanges();
      const icon = fixture.nativeElement.querySelector('[chipIcon]');
      expect(icon).toBeTruthy();
      expect(icon.textContent).toBe('IC');
    });

    it('should project avatar content with chipAvatar attribute', () => {
      host.showAvatar.set(true);
      fixture.detectChanges();
      const avatar = fixture.nativeElement.querySelector('[chipAvatar]');
      expect(avatar).toBeTruthy();
      expect(avatar.getAttribute('src')).toBe('avatar.png');
    });
  });

  // ── Icon wrapper ──────────────────────────────────────────

  describe('icon wrapper', () => {
    it('should wrap icon content in ct-chip__icon element', () => {
      host.showIcon.set(true);
      fixture.detectChanges();
      const wrapper = getIconWrapper();
      expect(wrapper).toBeTruthy();
      expect(wrapper!.querySelector('[chipIcon]')).toBeTruthy();
    });

    it('should mark icon wrapper as aria-hidden', () => {
      host.showIcon.set(true);
      fixture.detectChanges();
      expect(getIconWrapper()!.getAttribute('aria-hidden')).toBe('true');
    });

    for (const v of ['info', 'success', 'warning', 'danger'] as AfChipVariant[]) {
      it(`should add variant class to icon wrapper for ${v}`, () => {
        host.showIcon.set(true);
        host.variant.set(v);
        fixture.detectChanges();
        expect(getIconWrapper()!.classList.contains(`ct-chip__icon--${v}`)).toBe(true);
      });
    }

    it('should not add variant class for default variant', () => {
      host.showIcon.set(true);
      fixture.detectChanges();
      expect(getIconWrapper()!.className).toBe('ct-chip__icon');
    });
  });

  // ── Avatar wrapper ────────────────────────────────────────

  describe('avatar wrapper', () => {
    it('should wrap avatar content in ct-chip__avatar element', () => {
      host.showAvatar.set(true);
      fixture.detectChanges();
      const wrapper = getAvatarWrapper();
      expect(wrapper).toBeTruthy();
      expect(wrapper!.querySelector('[chipAvatar]')).toBeTruthy();
    });
  });

  // ── Aria label ─────────────────────────────────────────────

  describe('aria-label', () => {
    it('should not set aria-label by default', () => {
      expect(getChipEl().getAttribute('aria-label')).toBeNull();
    });

    it('should set aria-label when provided', () => {
      host.ariaLabel.set('Custom label');
      fixture.detectChanges();
      expect(getChipEl().getAttribute('aria-label')).toBe('Custom label');
    });
  });

  // ── Combined class computation ─────────────────────────────

  describe('class combinations', () => {
    it('should combine multiple modifiers correctly', () => {
      host.size.set('sm');
      host.appearance.set('outline');
      host.variant.set('danger');
      host.selectable.set(true);
      host.selected.set(true);
      fixture.detectChanges();

      const el = getChipEl();
      expect(el.classList.contains('ct-chip')).toBe(true);
      expect(el.classList.contains('ct-chip--sm')).toBe(true);
      expect(el.classList.contains('ct-chip--outline')).toBe(true);
      expect(el.classList.contains('ct-chip--danger')).toBe(true);
      expect(el.classList.contains('ct-chip--interactive')).toBe(true);
      expect(el.classList.contains('ct-chip--selected')).toBe(true);
    });
  });
});
