import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { AfSkipLinkComponent } from './skip-link.component';

@Component({
  imports: [AfSkipLinkComponent],
  template: `
    <af-skip-link [target]="target()" [label]="label()" />
    <main [id]="target()">Main content</main>
  `,
})
class TestHostComponent {
  target = signal('main-content');
  label = signal('Skip to main content');
}

describe('AfSkipLinkComponent', () => {
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

  function getLink(): HTMLAnchorElement {
    return fixture.nativeElement.querySelector('.ct-skip-link');
  }

  describe('rendering', () => {
    it('should render with the ct-skip-link class', () => {
      expect(getLink().classList.contains('ct-skip-link')).toBe(true);
    });

    it('should display the default label text', () => {
      expect(getLink().textContent?.trim()).toBe('Skip to main content');
    });

    it('should display a custom label', () => {
      host.label.set('Go to content');
      fixture.detectChanges();
      expect(getLink().textContent?.trim()).toBe('Go to content');
    });

    it('should set href to the target id', () => {
      expect(getLink().getAttribute('href')).toBe('#main-content');
    });

    it('should update href when target changes', () => {
      host.target.set('sidebar');
      fixture.detectChanges();
      expect(getLink().getAttribute('href')).toBe('#sidebar');
    });
  });

  describe('focus management', () => {
    it('should focus the target element on click', () => {
      const main = fixture.nativeElement.querySelector('#main-content') as HTMLElement;
      const focusSpy = vi.spyOn(main, 'focus');

      getLink().click();
      fixture.detectChanges();

      expect(focusSpy).toHaveBeenCalled();
    });

    it('should add tabindex=-1 to the target element if not present', () => {
      const main = fixture.nativeElement.querySelector('#main-content') as HTMLElement;
      expect(main.hasAttribute('tabindex')).toBe(false);

      getLink().click();
      fixture.detectChanges();

      expect(main.getAttribute('tabindex')).toBe('-1');
    });

    it('should not override an existing tabindex on the target element', () => {
      const main = fixture.nativeElement.querySelector('#main-content') as HTMLElement;
      main.setAttribute('tabindex', '0');

      getLink().click();
      fixture.detectChanges();

      expect(main.getAttribute('tabindex')).toBe('0');
    });

    it('should not throw when the target element does not exist', () => {
      host.target.set('nonexistent');
      fixture.detectChanges();

      expect(() => getLink().click()).not.toThrow();
    });

    it('should prevent default anchor navigation', () => {
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      const preventSpy = vi.spyOn(event, 'preventDefault');

      getLink().dispatchEvent(event);
      fixture.detectChanges();

      expect(preventSpy).toHaveBeenCalled();
    });
  });
});
