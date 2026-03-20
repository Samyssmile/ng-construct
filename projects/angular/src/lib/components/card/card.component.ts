import { Component, ChangeDetectionStrategy, ContentChild, ElementRef, input, output, computed, signal } from '@angular/core';

export type AfCardElevation = 'none' | 'sm' | 'md' | 'lg';
export type AfCardPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * Card component for containing content
 *
 * @example
 * <af-card elevation="md" padding="lg">
 *   <div header>
 *     <h3>Title</h3>
 *   </div>
 *   <div body>
 *     <p>Card content</p>
 *   </div>
 * </af-card>
 */
@Component({
  selector: 'af-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      [class]="cardClasses()"
      [style]="cardStyles()"
      (click)="onCardClick()">
      @if (hasHeader()) {
        <div class="ct-card__header">
          <ng-content select="[header]"></ng-content>
        </div>
      }
      <div class="ct-card__body">
        <ng-content select="[body]"></ng-content>
        <ng-content></ng-content>
      </div>
      @if (hasFooter()) {
        <div class="ct-card__footer">
          <ng-content select="[footer]"></ng-content>
        </div>
      }
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AfCardComponent {
  /** Whether card is interactive (clickable/hoverable) */
  interactive = input(false);

  /** Shadow elevation level */
  elevation = input<AfCardElevation | null>(null);

  /** Content padding level */
  padding = input<AfCardPadding | null>(null);

  /** Click event emitter */
  cardClick = output<void>();

  hasHeader = signal(false);
  hasFooter = signal(false);

  @ContentChild('[header]', { read: ElementRef })
  set headerContent(value: ElementRef | undefined) {
    this.hasHeader.set(!!value);
  }

  @ContentChild('[footer]', { read: ElementRef })
  set footerContent(value: ElementRef | undefined) {
    this.hasFooter.set(!!value);
  }

  private static readonly ELEVATION_MAP: Record<AfCardElevation, string> = {
    none: 'none',
    sm: '0 1px 3px rgba(0, 0, 0, 0.08)',
    md: '0 4px 12px rgba(0, 0, 0, 0.08)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.12)'
  };

  private static readonly PADDING_MAP: Record<AfCardPadding, string> = {
    none: '0',
    sm: 'var(--space-3, 0.75rem)',
    md: 'var(--space-5, 1.25rem)',
    lg: 'var(--space-7, 2rem)'
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
}
