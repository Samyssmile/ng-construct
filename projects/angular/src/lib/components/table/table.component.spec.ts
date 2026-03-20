import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  AfTableComponent,
  AfTableHeaderComponent,
  AfTableBodyComponent,
  AfTableRowComponent,
  AfTableHeaderCellComponent,
  AfTableCellComponent,
} from './table.component';

// ---------------------------------------------------------------------------
// Test host components
// ---------------------------------------------------------------------------

const TABLE_IMPORTS = [
  AfTableComponent,
  AfTableHeaderComponent,
  AfTableBodyComponent,
  AfTableRowComponent,
  AfTableHeaderCellComponent,
  AfTableCellComponent,
];

@Component({
  imports: TABLE_IMPORTS,
  template: `
    <af-table [variant]="variant()" [compact]="compact()" [caption]="caption()">
      <af-table-header>
        <af-table-row>
          <af-table-header-cell>Name</af-table-header-cell>
          <af-table-header-cell type="numeric">Age</af-table-header-cell>
        </af-table-row>
      </af-table-header>
      <af-table-body>
        <af-table-row>
          <af-table-cell>Alice</af-table-cell>
          <af-table-cell type="numeric">30</af-table-cell>
        </af-table-row>
        <af-table-row>
          <af-table-cell>Bob</af-table-cell>
          <af-table-cell type="numeric">25</af-table-cell>
        </af-table-row>
      </af-table-body>
    </af-table>
  `,
})
class TestHostComponent {
  variant = signal<'default' | 'striped' | 'bordered'>('default');
  compact = signal(false);
  caption = signal('');
}

@Component({
  imports: TABLE_IMPORTS,
  template: `
    <af-table>
      <af-table-body>
        <af-table-row>
          <af-table-cell type="checkbox">✓</af-table-cell>
          <af-table-cell>Data</af-table-cell>
          <af-table-cell type="actions">Edit</af-table-cell>
        </af-table-row>
      </af-table-body>
    </af-table>
  `,
})
class CellTypeHostComponent {}

@Component({
  imports: TABLE_IMPORTS,
  template: `
    <af-table>
      <af-table-header>
        <af-table-row>
          <af-table-header-cell scope="row">Row header</af-table-header-cell>
        </af-table-row>
      </af-table-header>
    </af-table>
  `,
})
class ScopeHostComponent {}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function queryAll<T extends Element>(
  fixture: ComponentFixture<unknown>,
  selector: string,
): T[] {
  return Array.from(fixture.nativeElement.querySelectorAll(selector));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AfTableComponent', () => {
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

  // ── Semantic HTML structure ─────────────────────────────────────────────

  it('should render a table inside ct-table-wrap', () => {
    const wrap = fixture.nativeElement.querySelector('.ct-table-wrap');
    expect(wrap).toBeTruthy();
    expect(wrap.querySelector('table')).toBeTruthy();
  });

  it('should render thead inside the table', () => {
    const thead = fixture.nativeElement.querySelector('table thead');
    expect(thead).toBeTruthy();
  });

  it('should render tbody inside the table', () => {
    const tbody = fixture.nativeElement.querySelector('table tbody');
    expect(tbody).toBeTruthy();
  });

  it('should render tr elements inside thead and tbody', () => {
    const theadRows = queryAll(fixture, 'thead tr');
    const tbodyRows = queryAll(fixture, 'tbody tr');
    expect(theadRows).toHaveLength(1);
    expect(tbodyRows).toHaveLength(2);
  });

  it('should render th elements inside thead', () => {
    const ths = queryAll(fixture, 'thead th');
    expect(ths).toHaveLength(2);
    expect(ths[0].textContent?.trim()).toBe('Name');
    expect(ths[1].textContent?.trim()).toBe('Age');
  });

  it('should render td elements inside tbody', () => {
    const tds = queryAll(fixture, 'tbody td');
    expect(tds).toHaveLength(4);
    expect(tds[0].textContent?.trim()).toBe('Alice');
  });

  // ── CSS classes ─────────────────────────────────────────────────────────

  it('should apply ct-table class by default', () => {
    const table = fixture.nativeElement.querySelector('table');
    expect(table.classList.contains('ct-table')).toBe(true);
  });

  it('should apply striped variant class', () => {
    host.variant.set('striped');
    fixture.detectChanges();

    const table = fixture.nativeElement.querySelector('table');
    expect(table.classList.contains('ct-table--striped')).toBe(true);
  });

  it('should apply bordered variant class', () => {
    host.variant.set('bordered');
    fixture.detectChanges();

    const table = fixture.nativeElement.querySelector('table');
    expect(table.classList.contains('ct-table--bordered')).toBe(true);
  });

  it('should apply compact class', () => {
    host.compact.set(true);
    fixture.detectChanges();

    const table = fixture.nativeElement.querySelector('table');
    expect(table.classList.contains('ct-table--compact')).toBe(true);
  });

  it('should not apply variant class for default variant', () => {
    const table = fixture.nativeElement.querySelector('table');
    expect(table.className).toBe('ct-table');
  });

  // ── Caption ─────────────────────────────────────────────────────────────

  it('should not render caption when input is empty', () => {
    const caption = fixture.nativeElement.querySelector('caption');
    expect(caption).toBeFalsy();
  });

  it('should render caption when input is set', () => {
    host.caption.set('Team members');
    fixture.detectChanges();

    const caption = fixture.nativeElement.querySelector('caption');
    expect(caption).toBeTruthy();
    expect(caption.textContent?.trim()).toBe('Team members');
  });

  // ── Cell types ──────────────────────────────────────────────────────────

  it('should apply numeric cell class on header cells', () => {
    const numericTh = fixture.nativeElement.querySelector(
      'thead .ct-table__cell--numeric',
    );
    expect(numericTh).toBeTruthy();
  });

  it('should apply numeric cell class on data cells', () => {
    const numericTd = fixture.nativeElement.querySelector(
      'tbody .ct-table__cell--numeric',
    );
    expect(numericTd).toBeTruthy();
  });

  it('should not apply cell type class for text type', () => {
    const firstTd = fixture.nativeElement.querySelector('tbody td');
    expect(firstTd.className).toBe('');
  });

  // ── Accessibility ──────────────────────────────────────────────────────

  it('should set scope="col" on header cells by default', () => {
    const ths = queryAll(fixture, 'thead th');
    ths.forEach((th) => {
      expect(th.getAttribute('scope')).toBe('col');
    });
  });

  it('should not render th in tbody', () => {
    const thsInTbody = queryAll(fixture, 'tbody th');
    expect(thsInTbody).toHaveLength(0);
  });

  it('should not render td in thead', () => {
    const tdsInThead = queryAll(fixture, 'thead td');
    expect(tdsInThead).toHaveLength(0);
  });
});

describe('AfTableCellComponent types', () => {
  let fixture: ComponentFixture<CellTypeHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CellTypeHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CellTypeHostComponent);
    fixture.detectChanges();
  });

  it('should apply checkbox cell type class', () => {
    const cell = fixture.nativeElement.querySelector(
      '.ct-table__cell--checkbox',
    );
    expect(cell).toBeTruthy();
    expect(cell.textContent?.trim()).toBe('✓');
  });

  it('should apply actions cell type class', () => {
    const cell = fixture.nativeElement.querySelector(
      '.ct-table__cell--actions',
    );
    expect(cell).toBeTruthy();
    expect(cell.textContent?.trim()).toBe('Edit');
  });
});

describe('AfTableHeaderCellComponent scope', () => {
  let fixture: ComponentFixture<ScopeHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScopeHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ScopeHostComponent);
    fixture.detectChanges();
  });

  it('should support custom scope attribute', () => {
    const th = fixture.nativeElement.querySelector('th');
    expect(th.getAttribute('scope')).toBe('row');
  });
});
