import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AfAccordionComponent, AfAccordionItemComponent } from './accordion.component';

// ---------------------------------------------------------------------------
// Test host components
// ---------------------------------------------------------------------------

@Component({
  imports: [AfAccordionComponent, AfAccordionItemComponent],
  template: `
    <af-accordion [multi]="multi()" [bordered]="bordered()">
      <af-accordion-item heading="Section 1">Content 1</af-accordion-item>
      <af-accordion-item heading="Section 2">Content 2</af-accordion-item>
      <af-accordion-item heading="Section 3" [disabled]="true">Content 3</af-accordion-item>
    </af-accordion>
  `,
})
class TestHostComponent {
  multi = signal(true);
  bordered = signal(false);
}

@Component({
  imports: [AfAccordionComponent, AfAccordionItemComponent],
  template: `
    <af-accordion [multi]="false">
      <af-accordion-item heading="A" [expanded]="true">Content A</af-accordion-item>
      <af-accordion-item heading="B" [expanded]="true">Content B</af-accordion-item>
    </af-accordion>
  `,
})
class SingleExpandHostComponent {}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function queryAll<T extends Element>(fixture: ComponentFixture<unknown>, selector: string): T[] {
  return Array.from(fixture.nativeElement.querySelectorAll(selector));
}

function summaries(fixture: ComponentFixture<unknown>): HTMLElement[] {
  return queryAll(fixture, 'summary');
}

function detailsElements(fixture: ComponentFixture<unknown>): HTMLDetailsElement[] {
  return queryAll(fixture, 'details');
}

function pressKey(element: HTMLElement, key: string): void {
  element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AfAccordionComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    host = fixture.componentInstance;
  });

  // ── Rendering ──────────────────────────────────────────────────────────

  it('should render all accordion items', () => {
    expect(summaries(fixture)).toHaveLength(3);
  });

  it('should apply ct-accordion class', () => {
    const container = fixture.nativeElement.querySelector('.ct-accordion');
    expect(container).toBeTruthy();
  });

  it('should apply bordered variant class', () => {
    host.bordered.set(true);
    fixture.detectChanges();

    const container = fixture.nativeElement.querySelector('.ct-accordion');
    expect(container.classList.contains('ct-accordion--bordered')).toBe(true);
  });

  it('should display heading text', () => {
    const headings = queryAll<HTMLElement>(fixture, '.ct-accordion__heading');
    expect(headings[0].textContent?.trim()).toBe('Section 1');
    expect(headings[1].textContent?.trim()).toBe('Section 2');
  });

  // ── ARIA ───────────────────────────────────────────────────────────────

  it('should set aria-expanded to false on collapsed items', () => {
    const triggers = summaries(fixture);
    expect(triggers[0].getAttribute('aria-expanded')).toBe('false');
  });

  it('should set aria-expanded to true on expanded items', () => {
    const trigger = summaries(fixture)[0];
    trigger.click();
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('should link trigger and panel with aria-controls / aria-labelledby', () => {
    const trigger = summaries(fixture)[0];
    const panelId = trigger.getAttribute('aria-controls')!;
    const panel = fixture.nativeElement.querySelector(`#${panelId}`);

    expect(panel).toBeTruthy();
    expect(panel.getAttribute('role')).toBe('region');
    expect(panel.getAttribute('aria-labelledby')).toBe(trigger.id);
  });

  it('should set aria-disabled on disabled items', () => {
    const triggers = summaries(fixture);
    expect(triggers[2].getAttribute('aria-disabled')).toBe('true');
  });

  it('should set role="region" on content panels', () => {
    const panels = queryAll(fixture, '[role="region"]');
    expect(panels).toHaveLength(3);
  });

  // ── Expand / Collapse ─────────────────────────────────────────────────

  it('should toggle item on click', () => {
    const details = detailsElements(fixture);
    const trigger = summaries(fixture)[0];

    expect(details[0].open).toBe(false);
    trigger.click();
    fixture.detectChanges();
    expect(details[0].open).toBe(true);

    trigger.click();
    fixture.detectChanges();
    expect(details[0].open).toBe(false);
  });

  it('should allow multiple items open in multi mode', () => {
    const triggers = summaries(fixture);
    triggers[0].click();
    fixture.detectChanges();
    triggers[1].click();
    fixture.detectChanges();

    const details = detailsElements(fixture);
    expect(details[0].open).toBe(true);
    expect(details[1].open).toBe(true);
  });

  it('should close other items in single-expand mode', () => {
    host.multi.set(false);
    fixture.detectChanges();

    const triggers = summaries(fixture);
    triggers[0].click();
    fixture.detectChanges();

    const details = detailsElements(fixture);
    expect(details[0].open).toBe(true);

    triggers[1].click();
    fixture.detectChanges();

    expect(details[0].open).toBe(false);
    expect(details[1].open).toBe(true);
  });

  // ── Disabled ───────────────────────────────────────────────────────────

  it('should prevent toggle on disabled items', () => {
    const trigger = summaries(fixture)[2];
    trigger.click();
    fixture.detectChanges();

    expect(detailsElements(fixture)[2].open).toBe(false);
  });

  // ── Keyboard Navigation ────────────────────────────────────────────────

  it('should move focus down with ArrowDown', () => {
    const triggers = summaries(fixture);
    triggers[0].focus();
    pressKey(triggers[0], 'ArrowDown');
    fixture.detectChanges();

    expect(document.activeElement).toBe(triggers[1]);
  });

  it('should move focus up with ArrowUp', () => {
    const triggers = summaries(fixture);
    triggers[1].focus();
    pressKey(triggers[1], 'ArrowUp');
    fixture.detectChanges();

    expect(document.activeElement).toBe(triggers[0]);
  });

  it('should wrap focus from last to first with ArrowDown', () => {
    // Item 2 (index 2) is disabled, so enabled items are 0 and 1
    const triggers = summaries(fixture);
    triggers[1].focus();
    pressKey(triggers[1], 'ArrowDown');
    fixture.detectChanges();

    expect(document.activeElement).toBe(triggers[0]);
  });

  it('should wrap focus from first to last with ArrowUp', () => {
    const triggers = summaries(fixture);
    triggers[0].focus();
    pressKey(triggers[0], 'ArrowUp');
    fixture.detectChanges();

    expect(document.activeElement).toBe(triggers[1]);
  });

  it('should jump to first item with Home', () => {
    const triggers = summaries(fixture);
    triggers[1].focus();
    pressKey(triggers[1], 'Home');
    fixture.detectChanges();

    expect(document.activeElement).toBe(triggers[0]);
  });

  it('should jump to last enabled item with End', () => {
    const triggers = summaries(fixture);
    triggers[0].focus();
    pressKey(triggers[0], 'End');
    fixture.detectChanges();

    // Item 2 is disabled so last enabled is index 1
    expect(document.activeElement).toBe(triggers[1]);
  });

  it('should skip disabled items during keyboard navigation', () => {
    const triggers = summaries(fixture);
    // Focus on item 1 (second enabled), ArrowDown wraps to item 0
    triggers[1].focus();
    pressKey(triggers[1], 'ArrowDown');
    fixture.detectChanges();

    // Should skip disabled item 2 and wrap to item 0
    expect(document.activeElement).toBe(triggers[0]);
  });
});

describe('AfAccordion single-expand initial state', () => {
  it('should enforce single-expand on initial render when multiple items are expanded', async () => {
    await TestBed.configureTestingModule({
      imports: [SingleExpandHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SingleExpandHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const details = Array.from(
      fixture.nativeElement.querySelectorAll('details'),
    ) as HTMLDetailsElement[];
    const openCount = details.filter((d) => d.open).length;
    expect(openCount).toBeLessThanOrEqual(1);
  });
});
