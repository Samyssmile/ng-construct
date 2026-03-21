import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  input,
  output,
  computed,
  contentChild,
} from '@angular/core';

export type AfCardElevation = 'none' | 'sm' | 'md' | 'lg';
export type AfCardPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * Card component for containing content.
 *
 * When `interactive` is set the card becomes keyboard-accessible with
 * `role="button"`, roving `tabindex`, and Enter/Space activation.
 *
 * @example
 * <af-card elevation="md" padding="lg">
 *   <div header><h3>Title</h3></div>
 *   <div body><p>Card content</p></div>
 * </af-card>
 *
 * <af-card interactive ariaLabel="Open project" (cardClick)="open()">
 *   <p body>Click me</p>
 * </af-card>
 */
@Component({
  selector: 'af-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      [class]="cardClasses()"
      [style]="cardStyles()"
      [attr.role]="interactive() ? 'button' : null"
      [attr.tabindex]="interactive() ? 0 : null"
      [attr.aria-label]="ariaLabel() || null"
      (click)="onCardClick()"
      (keydown)="onCardKeydown($event)">
      <div class="ct-card__header" [hidden]="!hasHeader()">
        <ng-content select="[header]" />
      </div>
      <div class="ct-card__body">
        <ng-content select="[body]" />
        <ng-content />
      </div>
      <div class="ct-card__footer" [hidden]="!hasFooter()">
        <ng-content select="[footer]" />
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class AfCardComponent {
  /** Makes the card interactive (clickable, keyboard-accessible). */
  interactive = input(false);

  /** Shadow elevation level. */
  elevation = input<AfCardElevation | null>(null);

  /** Content padding level. */
  padding = input<AfCardPadding | null>(null);

  /** Accessible label for interactive cards. */
  ariaLabel = input('');

  /** Emitted when an interactive card is activated (click, Enter, or Space). */
  cardClick = output<void>();

  private headerRef = contentChild('[header]', { read: ElementRef });
  private footerRef = contentChild('[footer]', { read: ElementRef });
  hasHeader = computed(() => !!this.headerRef());
  hasFooter = computed(() => !!this.footerRef());

  private static readonly ELEVATION_MAP: Record<AfCardElevation, string> = {
    none: 'none',
    sm: '0 1px 3px rgba(0, 0, 0, 0.08)',
    md: '0 4px 12px rgba(0, 0, 0, 0.08)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
  };

  private static readonly PADDING_MAP: Record<AfCardPadding, string> = {
    none: '0',
    sm: 'var(--space-3, 0.75rem)',
    md: 'var(--space-5, 1.25rem)',
    lg: 'var(--space-7, 2rem)',
  };

  cardClasses = computed(() => {
    const classes = ['ct-card'];
    if (this.interactive()) {
      classes.push('ct-card--interactive');
    }
    return classes.join(' ');
  });

  cardStyles = computed(() => {
    const styles: string[] = [];
    if (this.elevation() !== null) {
      styles.push(`box-shadow: ${AfCardComponent.ELEVATION_MAP[this.elevation()!]}`);
    }
    if (this.padding() !== null) {
      styles.push(`--ct-card-padding: ${AfCardComponent.PADDING_MAP[this.padding()!]}`);
    }
    return styles.join('; ');
  });

  onCardClick(): void {
    if (this.interactive()) {
      this.cardClick.emit();
    }
  }

  onCardKeydown(event: KeyboardEvent): void {
    if (!this.interactive()) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.cardClick.emit();
    }
  }
}
