import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AfSkeletonComponent } from './skeleton.component';

describe('AfSkeletonComponent', () => {
  let component: AfSkeletonComponent;
  let fixture: ComponentFixture<AfSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfSkeletonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AfSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('variant', () => {
    it('should default to text variant', () => {
      expect(component.skeletonClasses()).toBe('ct-skeleton ct-skeleton--text');
    });

    it('should apply title variant', () => {
      fixture.componentRef.setInput('variant', 'title');
      fixture.detectChanges();
      expect(component.skeletonClasses()).toContain('ct-skeleton--title');
    });

    it('should apply avatar variant', () => {
      fixture.componentRef.setInput('variant', 'avatar');
      fixture.detectChanges();
      expect(component.skeletonClasses()).toContain('ct-skeleton--avatar');
    });

    it('should apply rect variant', () => {
      fixture.componentRef.setInput('variant', 'rect');
      fixture.detectChanges();
      expect(component.skeletonClasses()).toContain('ct-skeleton--rect');
    });
  });

  describe('dimensions', () => {
    it('should set custom width via CSS variable', () => {
      fixture.componentRef.setInput('width', '200px');
      fixture.detectChanges();
      expect(component.skeletonStyle()).toContain('--ct-skeleton-width: 200px');
    });

    it('should set custom height via CSS variable', () => {
      fixture.componentRef.setInput('height', '100px');
      fixture.detectChanges();
      expect(component.skeletonStyle()).toContain('--ct-skeleton-height: 100px');
    });

    it('should set both width and height', () => {
      fixture.componentRef.setInput('width', '50%');
      fixture.componentRef.setInput('height', '3em');
      fixture.detectChanges();
      const style = component.skeletonStyle();
      expect(style).toContain('--ct-skeleton-width: 50%');
      expect(style).toContain('--ct-skeleton-height: 3em');
    });

    it('should return null when no dimensions are set', () => {
      expect(component.skeletonStyle()).toBeNull();
    });
  });

  describe('count', () => {
    it('should render one skeleton by default', () => {
      const spans = fixture.nativeElement.querySelectorAll('span');
      expect(spans.length).toBe(1);
    });

    it('should render multiple skeletons', () => {
      fixture.componentRef.setInput('count', 3);
      fixture.detectChanges();
      const spans = fixture.nativeElement.querySelectorAll('span');
      expect(spans.length).toBe(3);
    });
  });

  describe('accessibility', () => {
    it('should have role="status" on host', () => {
      expect(fixture.nativeElement.getAttribute('role')).toBe('status');
    });

    it('should have aria-busy="true" on host', () => {
      expect(fixture.nativeElement.getAttribute('aria-busy')).toBe('true');
    });

    it('should have default aria-label', () => {
      expect(fixture.nativeElement.getAttribute('aria-label')).toBe(
        'Loading\u2026',
      );
    });

    it('should use custom aria-label', () => {
      fixture.componentRef.setInput('label', 'Loading user data');
      fixture.detectChanges();
      expect(fixture.nativeElement.getAttribute('aria-label')).toBe(
        'Loading user data',
      );
    });

    it('should mark skeleton spans as aria-hidden', () => {
      const span = fixture.nativeElement.querySelector('span');
      expect(span.getAttribute('aria-hidden')).toBe('true');
    });
  });
});
