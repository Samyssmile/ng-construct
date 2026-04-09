import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import {
  AVATAR_SEED_PALETTE_SIZE,
  AfAvatarComponent,
  AfAvatarSize,
  AfAvatarStatus,
} from './avatar.component';

@Component({
  imports: [AfAvatarComponent],
  template: `
    <af-avatar
      [src]="src()"
      [name]="name()"
      [size]="size()"
      [alt]="alt()"
      [status]="status()"
      [colorSeed]="colorSeed()" />
  `,
})
class TestHostComponent {
  src = signal('');
  name = signal('Jane Doe');
  size = signal<AfAvatarSize>('md');
  alt = signal('');
  status = signal<AfAvatarStatus | undefined>(undefined);
  colorSeed = signal('');
}

describe('AfAvatarComponent', () => {
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

  function getAvatar(): HTMLElement {
    return fixture.nativeElement.querySelector('.ct-avatar')!;
  }

  function getImage(): HTMLImageElement | null {
    return fixture.nativeElement.querySelector('.ct-avatar__image');
  }

  function getInitials(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.ct-avatar__initials');
  }

  function getStatus(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.ct-avatar__status');
  }

  describe('rendering', () => {
    it('should render the avatar element', () => {
      expect(getAvatar()).toBeTruthy();
    });

    it('should apply ct-avatar base class', () => {
      expect(getAvatar().classList.contains('ct-avatar')).toBe(true);
    });

    it('should not apply size modifier for default md size', () => {
      expect(getAvatar().className).toBe('ct-avatar');
    });
  });

  describe('size variants', () => {
    it('should apply ct-avatar--sm for sm size', () => {
      host.size.set('sm');
      fixture.detectChanges();
      expect(getAvatar().classList.contains('ct-avatar--sm')).toBe(true);
    });

    it('should apply ct-avatar--lg for lg size', () => {
      host.size.set('lg');
      fixture.detectChanges();
      expect(getAvatar().classList.contains('ct-avatar--lg')).toBe(true);
    });

    it('should apply ct-avatar--xl for xl size', () => {
      host.size.set('xl');
      fixture.detectChanges();
      expect(getAvatar().classList.contains('ct-avatar--xl')).toBe(true);
    });

    it('should update size class dynamically', () => {
      host.size.set('lg');
      fixture.detectChanges();
      expect(getAvatar().classList.contains('ct-avatar--lg')).toBe(true);

      host.size.set('sm');
      fixture.detectChanges();
      expect(getAvatar().classList.contains('ct-avatar--sm')).toBe(true);
      expect(getAvatar().classList.contains('ct-avatar--lg')).toBe(false);
    });
  });

  describe('initials', () => {
    it('should show initials when no src is provided', () => {
      expect(getInitials()).toBeTruthy();
      expect(getInitials()!.textContent!.trim()).toBe('JD');
    });

    it('should derive initials from first and last name', () => {
      host.name.set('Alice Cooper');
      fixture.detectChanges();
      expect(getInitials()!.textContent!.trim()).toBe('AC');
    });

    it('should use first letter for single-word name', () => {
      host.name.set('Alice');
      fixture.detectChanges();
      expect(getInitials()!.textContent!.trim()).toBe('A');
    });

    it('should use first and last name for multi-word names', () => {
      host.name.set('John Michael Smith');
      fixture.detectChanges();
      expect(getInitials()!.textContent!.trim()).toBe('JS');
    });

    it('should uppercase initials', () => {
      host.name.set('jane doe');
      fixture.detectChanges();
      expect(getInitials()!.textContent!.trim()).toBe('JD');
    });

    it('should show empty initials for empty name', () => {
      host.name.set('');
      fixture.detectChanges();
      expect(getInitials()!.textContent!.trim()).toBe('');
    });

    it('should mark initials as aria-hidden', () => {
      expect(getInitials()!.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('image', () => {
    it('should show image when src is provided', () => {
      host.src.set('/photo.jpg');
      fixture.detectChanges();
      expect(getImage()).toBeTruthy();
      expect(getImage()!.src).toContain('/photo.jpg');
    });

    it('should hide initials when image is shown', () => {
      host.src.set('/photo.jpg');
      fixture.detectChanges();
      expect(getInitials()).toBeNull();
    });

    it('should set alt to name when alt input is empty', () => {
      host.src.set('/photo.jpg');
      fixture.detectChanges();
      expect(getImage()!.alt).toBe('Jane Doe');
    });

    it('should prefer alt input over name', () => {
      host.src.set('/photo.jpg');
      host.alt.set('Custom alt text');
      fixture.detectChanges();
      expect(getImage()!.alt).toBe('Custom alt text');
    });

    it('should fall back to initials on image error', () => {
      host.src.set('/broken.jpg');
      fixture.detectChanges();
      expect(getImage()).toBeTruthy();

      getImage()!.dispatchEvent(new Event('error'));
      fixture.detectChanges();

      expect(getImage()).toBeNull();
      expect(getInitials()).toBeTruthy();
      expect(getInitials()!.textContent!.trim()).toBe('JD');
    });
  });

  describe('status indicator', () => {
    it('should not show status by default', () => {
      expect(getStatus()).toBeNull();
    });

    it('should show status when set', () => {
      host.status.set('online');
      fixture.detectChanges();
      expect(getStatus()).toBeTruthy();
    });

    it('should apply data-status attribute', () => {
      host.status.set('online');
      fixture.detectChanges();
      expect(getStatus()!.getAttribute('data-status')).toBe('online');
    });

    it('should apply all status values correctly', () => {
      for (const s of ['online', 'offline', 'busy', 'away'] as AfAvatarStatus[]) {
        host.status.set(s);
        fixture.detectChanges();
        expect(getStatus()!.getAttribute('data-status')).toBe(s);
      }
    });

    it('should have accessible label on status indicator', () => {
      host.status.set('online');
      fixture.detectChanges();
      expect(getStatus()!.getAttribute('aria-label')).toBe('online status');
    });
  });

  describe('accessibility', () => {
    it('should have role="img" on the avatar container', () => {
      expect(getAvatar().getAttribute('role')).toBe('img');
    });

    it('should use name as aria-label by default', () => {
      expect(getAvatar().getAttribute('aria-label')).toBe('Jane Doe');
    });

    it('should prefer alt input as aria-label', () => {
      host.alt.set('Custom label');
      fixture.detectChanges();
      expect(getAvatar().getAttribute('aria-label')).toBe('Custom label');
    });

    it('should fall back to "Avatar" when no name or alt', () => {
      host.name.set('');
      host.alt.set('');
      fixture.detectChanges();
      expect(getAvatar().getAttribute('aria-label')).toBe('Avatar');
    });
  });

  describe('seeded colors', () => {
    it('should not set data-seed-color when colorSeed is empty', () => {
      expect(getAvatar().hasAttribute('data-seed-color')).toBe(false);
    });

    it('should set data-seed-color when colorSeed is provided', () => {
      host.colorSeed.set('user-uuid-1');
      fixture.detectChanges();
      expect(getAvatar().hasAttribute('data-seed-color')).toBe(true);
    });

    it('should produce a 1-indexed integer in palette range', () => {
      host.colorSeed.set('user-uuid-1');
      fixture.detectChanges();
      const value = Number(getAvatar().getAttribute('data-seed-color'));
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(AVATAR_SEED_PALETTE_SIZE);
    });

    it('should be deterministic — same seed yields the same index', () => {
      host.colorSeed.set('alice@example.com');
      fixture.detectChanges();
      const first = getAvatar().getAttribute('data-seed-color');

      host.colorSeed.set('');
      fixture.detectChanges();
      expect(getAvatar().hasAttribute('data-seed-color')).toBe(false);

      host.colorSeed.set('alice@example.com');
      fixture.detectChanges();
      expect(getAvatar().getAttribute('data-seed-color')).toBe(first);
    });

    it('should distribute distinct seeds across multiple palette slots', () => {
      const seeds = [
        'alice@example.com',
        'bob@example.com',
        'carol@example.com',
        'dave@example.com',
        'eve@example.com',
        'frank@example.com',
        'grace@example.com',
        'hank@example.com',
        '7b3e2a4d-1f1c-4a8e-9b2d-3a91c01dba12',
        '0f0a1b2c-3d4e-5f60-7180-92a3b4c5d6e7',
      ];
      const observed = new Set<string>();
      for (const seed of seeds) {
        host.colorSeed.set(seed);
        fixture.detectChanges();
        const value = getAvatar().getAttribute('data-seed-color');
        expect(value).not.toBeNull();
        observed.add(value!);
      }
      // Hash should hit at least half the palette across 10 distinct inputs
      expect(observed.size).toBeGreaterThanOrEqual(AVATAR_SEED_PALETTE_SIZE / 2);
    });

    it('should remove the attribute when seed is cleared', () => {
      host.colorSeed.set('user-uuid-1');
      fixture.detectChanges();
      expect(getAvatar().hasAttribute('data-seed-color')).toBe(true);

      host.colorSeed.set('');
      fixture.detectChanges();
      expect(getAvatar().hasAttribute('data-seed-color')).toBe(false);
    });
  });
});
