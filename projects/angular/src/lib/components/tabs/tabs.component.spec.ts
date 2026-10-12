import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AfTabPanelComponent, AfTabsComponent } from './tabs.component';
import { checkA11y } from '../../testing/axe-helper';

// The host is OnPush like real consumers: a trigger must update from its panel's
// signals alone, without the host forcing a check of the tabs view.
@Component({
  imports: [AfTabsComponent, AfTabPanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <af-tabs [(activeTab)]="active">
      <af-tab-panel id="members" [label]="'Members (' + count() + ')'">Members content</af-tab-panel>
      <af-tab-panel id="billing" label="Billing" [disabled]="billingDisabled()">
        Billing content
      </af-tab-panel>
      <af-tab-panel label="Settings">Settings content</af-tab-panel>
    </af-tabs>
  `,
})
class TestHostComponent {
  readonly active = signal('billing');
  readonly count = signal(1);
  readonly billingDisabled = signal(false);
}

function setup(): { fixture: ComponentFixture<TestHostComponent>; host: TestHostComponent } {
  TestBed.configureTestingModule({ imports: [TestHostComponent] });
  const fixture = TestBed.createComponent(TestHostComponent);
  fixture.detectChanges();
  return { fixture, host: fixture.componentInstance };
}

function triggers(fixture: ComponentFixture<TestHostComponent>): HTMLButtonElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]'));
}

function panel(fixture: ComponentFixture<TestHostComponent>): HTMLElement | null {
  return fixture.nativeElement.querySelector('[role="tabpanel"]');
}

describe('AfTabsComponent', () => {
  it('renders one trigger per panel and shows the bound active panel', () => {
    const { fixture } = setup();

    expect(triggers(fixture).map((t) => t.textContent?.trim())).toEqual([
      'Members (1)',
      'Billing',
      'Settings',
    ]);
    expect(triggers(fixture)[1].getAttribute('aria-selected')).toBe('true');
    expect(panel(fixture)?.textContent?.trim()).toBe('Billing content');
  });

  it('updates a trigger when its panel label changes', async () => {
    const { fixture, host } = setup();

    host.count.set(5);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(triggers(fixture)[0].textContent?.trim()).toBe('Members (5)');
  });

  it('disables a trigger and falls back to the first enabled tab when the active one is disabled', async () => {
    const { fixture, host } = setup();

    host.billingDisabled.set(true);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(triggers(fixture)[1].disabled).toBe(true);
    expect(host.active()).toBe('members');
    expect(panel(fixture)?.textContent?.trim()).toBe('Members content');
  });

  it('generates a stable id for panels without one and wires trigger and panel together', async () => {
    const { fixture, host } = setup();
    const generatedId = triggers(fixture)[2].dataset['tabId'];

    triggers(fixture)[2].click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(generatedId).toMatch(/^af-tab-\d+$/);
    expect(host.active()).toBe(generatedId);
    expect(triggers(fixture)[2].getAttribute('aria-controls')).toBe(`panel-${generatedId}`);
    expect(panel(fixture)?.id).toBe(`panel-${generatedId}`);
    expect(panel(fixture)?.getAttribute('aria-labelledby')).toBe(`tab-${generatedId}`);

    host.count.set(2);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(triggers(fixture)[2].dataset['tabId']).toBe(generatedId);
  });

  it('moves focus with arrow keys, Home and End and selects with Enter', async () => {
    const { fixture, host } = setup();
    const [members, billing, settings] = triggers(fixture);

    billing.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(document.activeElement).toBe(settings);

    settings.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
    expect(document.activeElement).toBe(members);

    members.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    expect(document.activeElement).toBe(settings);

    members.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(host.active()).toBe('members');
  });

  it('has no axe violations', async () => {
    const { fixture } = setup();
    await checkA11y(fixture.nativeElement);
  });
});
