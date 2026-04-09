import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
  computed,
} from '@angular/core';

export type AfAvatarSize = 'sm' | 'md' | 'lg' | 'xl';
export type AfAvatarStatus = 'online' | 'offline' | 'busy' | 'away';

/**
 * Number of distinct colors in the seeded avatar palette. Must match the
 * `[data-seed-color="N"]` selectors shipped by `@neuravision/construct`
 * (see `components/avatar.css`). Bump together when Construct adds slots.
 */
export const AVATAR_SEED_PALETTE_SIZE = 8;

/**
 * Avatar component displaying a user image with fallback to initials.
 *
 * When `src` is provided the component renders an `<img>`. If the image
 * fails to load or no `src` is given, initials derived from `name` are
 * shown instead.
 *
 * Set `colorSeed` to give each user a stable, deterministic background
 * color picked from the Construct DS palette — useful in lists where the
 * eye should recognize repeat individuals at a glance. The seed is hashed
 * locally and bound to `data-seed-color`; an empty seed leaves the
 * attribute off and the avatar keeps the default background.
 *
 * @example
 * <af-avatar src="/photo.jpg" name="Jane Doe" alt="Jane Doe" size="lg" />
 * <af-avatar name="John Smith" status="online" />
 * <af-avatar name="Jane Doe" colorSeed="user-uuid-7b3e2a4d" />
 */
@Component({
  selector: 'af-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      [class]="avatarClasses()"
      role="img"
      [attr.aria-label]="ariaLabel()"
      [attr.data-seed-color]="seedColorIndex()">
      @if (showImage()) {
        <img
          class="ct-avatar__image"
          [src]="src()"
          [alt]="alt() || name()"
          (error)="onImageError()" />
      } @else {
        <span class="ct-avatar__initials" aria-hidden="true">{{ initials() }}</span>
      }
      @if (status()) {
        <span
          class="ct-avatar__status"
          [attr.data-status]="status()"
          [attr.aria-label]="status() + ' status'"
          role="img">
        </span>
      }
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
    `,
  ],
})
export class AfAvatarComponent {
  /** Image URL. Falls back to initials when missing or on load error. */
  src = input('');

  /** Full name used to compute initials and as default alt text. */
  name = input('');

  /** Size variant. */
  size = input<AfAvatarSize>('md');

  /** Alt text for the avatar image. Defaults to `name` if not set. */
  alt = input('');

  /** Online status indicator. */
  status = input<AfAvatarStatus | undefined>(undefined);

  /**
   * Stable identifier (e.g. userUUID, email, username) hashed into a
   * deterministic palette index. The same seed always produces the same
   * color. Leave empty to keep the default avatar background.
   */
  colorSeed = input('');

  /** Tracks whether the image failed to load. */
  imageError = signal(false);

  /** Whether to render the `<img>` element. */
  showImage = computed(() => !!this.src() && !this.imageError());

  /** Initials derived from the first letter of each word in `name`. */
  initials = computed(() => {
    const parts = this.name().trim().split(/\s+/);
    if (parts.length === 0 || parts[0] === '') return '';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  });

  /** Accessible label for the avatar. */
  ariaLabel = computed(() => this.alt() || this.name() || 'Avatar');

  /**
   * Palette index in `[1, AVATAR_SEED_PALETTE_SIZE]` derived from `colorSeed`,
   * or `null` when no seed is set. Returning `null` causes Angular to omit
   * the `data-seed-color` attribute, preserving the unseeded default.
   */
  seedColorIndex = computed<number | null>(() => {
    const seed = this.colorSeed();
    if (!seed) return null;
    // Construct's selectors are 1-indexed (data-seed-color="1".."8")
    return (this.hashSeed(seed) % AVATAR_SEED_PALETTE_SIZE) + 1;
  });

  avatarClasses = computed(() => {
    const classes = ['ct-avatar'];
    if (this.size() !== 'md') {
      classes.push(`ct-avatar--${this.size()}`);
    }
    return classes.join(' ');
  });

  /** Handles image load failure by switching to initials fallback. */
  onImageError(): void {
    this.imageError.set(true);
  }

  /**
   * Dependency-free 32-bit string hash (djb2-style). Pure and stable across
   * runs and environments — same input always yields the same non-negative
   * integer.
   */
  private hashSeed(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0; // force 32-bit int
    }
    return Math.abs(hash);
  }
}
