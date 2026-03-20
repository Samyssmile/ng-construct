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
 * Avatar component displaying a user image with fallback to initials.
 *
 * When `src` is provided the component renders an `<img>`. If the image
 * fails to load or no `src` is given, initials derived from `name` are
 * shown instead.
 *
 * @example
 * <af-avatar src="/photo.jpg" name="Jane Doe" alt="Jane Doe" size="lg" />
 * <af-avatar name="John Smith" status="online" />
 */
@Component({
  selector: 'af-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="avatarClasses()" role="img" [attr.aria-label]="ariaLabel()">
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
}
