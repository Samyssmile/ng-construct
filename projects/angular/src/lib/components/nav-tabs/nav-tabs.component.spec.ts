import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AfNavTabsComponent, AfNavTabsVariant } from './nav-tabs.component';
import { checkA11y } from '../../testing/axe-helper';

@Component({ template: '' })
class RoutedPageComponent {}

describe('AfNavTabsComponent', () => {
  let fixture: ComponentFixture<AfNavTabsComponent>;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AfNavTabsComponent],
      providers: [
        provideRouter([
          { path: 'documents/my', component: RoutedPageComponent },
          { path: 'documents/all', component: RoutedPageComponent },
          { path: 'documents/archived', component: RoutedPageComponent },
        ]),
      ],
    });
    fixture = TestBed.createComponent(AfNavTabsComponent);
    router = TestBed.inject(Router);
    fixture.componentRef.setInput('tabs', [
      { id: 'my', label: 'My Documents', routerLink: '/documents/my' },
      { id: 'all', label: 'All Documents', routerLink: '/documents/all' },
      { id: 'archived', label: 'Archived', routerLink: '/documents/archived', disabled: true },
    ]);
    fixture.detectChanges();
  });

  function trigger(id: string): HTMLElement {
    return fixture.nativeElement.querySelector(`#nav-tab-${id}`);
  }

  async function navigate(url: string): Promise<void> {
    await router.navigateByUrl(url);
    await fixture.whenStable();
  }

  for (const variant of ['default', 'pill'] satisfies AfNavTabsVariant[]) {
    it(`moves the Construct active state with router navigation (${variant})`, async () => {
      fixture.componentRef.setInput('variant', variant);
      await navigate('/documents/my');

      expect(trigger('my').getAttribute('data-state')).toBe('active');
      expect(trigger('my').getAttribute('aria-current')).toBe('page');
      expect(trigger('all').hasAttribute('data-state')).toBe(false);

      trigger('all').click();
      await fixture.whenStable();

      expect(router.url).toBe('/documents/all');
      expect(trigger('all').getAttribute('data-state')).toBe('active');
      expect(trigger('all').getAttribute('aria-current')).toBe('page');
      expect(trigger('my').hasAttribute('data-state')).toBe(false);
      expect(trigger('my').hasAttribute('aria-current')).toBe(false);

      await navigate('/documents/my?sort=name#results');

      expect(trigger('my').getAttribute('data-state')).toBe('active');
      expect(trigger('all').hasAttribute('data-state')).toBe(false);
    });
  }

  it('keeps the current-page marker when only query parameters or fragments change', async () => {
    await navigate('/documents/my');
    await navigate('/documents/my?sort=name#results');

    expect(trigger('my').getAttribute('data-state')).toBe('active');
    expect(trigger('my').getAttribute('aria-current')).toBe('page');
  });

  it('does not activate a disabled tab even when its route is current', async () => {
    await navigate('/documents/archived');

    expect(trigger('archived').tagName).toBe('SPAN');
    expect(trigger('archived').getAttribute('aria-disabled')).toBe('true');
    expect(fixture.nativeElement.querySelector('[data-state="active"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[aria-current]')).toBeNull();
  });

  it('preserves link navigation semantics and passes axe with an active route', async () => {
    await navigate('/documents/my');

    expect(trigger('my').tagName).toBe('A');
    expect(trigger('my').hasAttribute('aria-selected')).toBe(false);
    await checkA11y(fixture.nativeElement);
  });
});
