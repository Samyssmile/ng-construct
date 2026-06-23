import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import {
  AfAutocompleteComponent,
  AfAutocompleteOption,
  AfAutocompleteOptionDirective,
} from './autocomplete.component';
import { checkA11y } from '../../testing/axe-helper';

const OPTIONS: AfAutocompleteOption<string>[] = [
  {
    id: 'u1',
    value: 'u1',
    label: 'Alice Anderson',
    description: 'alice@acme.test',
    group: 'users',
  },
  { id: 'u2', value: 'u2', label: 'Bob Brown', description: 'bob@acme.test', group: 'users' },
  { id: 'o1', value: 'o1', label: 'Acme GmbH', group: 'orgs' },
  { id: 'o2', value: 'o2', label: 'Globex AG', group: 'orgs', disabled: true },
];

/** Types text into the combobox input, which opens the listbox. */
function type(fixture: ComponentFixture<unknown>, input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event('input'));
  fixture.detectChanges();
}

describe('AfAutocompleteComponent', () => {
  let component: AfAutocompleteComponent;
  let fixture: ComponentFixture<AfAutocompleteComponent>;
  let inputEl: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfAutocompleteComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(AfAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.componentRef.setInput('groupLabels', { users: 'Users', orgs: 'Organizations' });
    fixture.detectChanges();
    inputEl = fixture.nativeElement.querySelector('input[role="combobox"]');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(inputEl).toBeTruthy();
    expect(inputEl.getAttribute('aria-autocomplete')).toBe('list');
  });

  it('keeps the listbox closed until minChars is reached', () => {
    expect(inputEl.getAttribute('aria-expanded')).toBe('false');
    type(fixture, inputEl, 'a');
    expect(inputEl.getAttribute('aria-expanded')).toBe('true');
  });

  it('does NOT filter options internally (external-filter contract)', () => {
    // Query matches none of the labels, yet every supplied option renders.
    type(fixture, inputEl, 'zzz');
    const options = fixture.nativeElement.querySelectorAll('[role="option"]');
    expect(options.length).toBe(OPTIONS.length);
  });

  it('renders group headings wired with aria-labelledby', () => {
    type(fixture, inputEl, 'a');
    const groups = fixture.nativeElement.querySelectorAll('[role="group"]');
    expect(groups.length).toBe(2);
    const firstLabelId = groups[0].getAttribute('aria-labelledby');
    expect(fixture.nativeElement.querySelector('#' + firstLabelId).textContent).toContain('Users');
  });

  it('shows the loading row while loading', () => {
    fixture.componentRef.setInput('loading', true);
    type(fixture, inputEl, 'a');
    expect(fixture.nativeElement.querySelector('.ct-autocomplete__loading')).toBeTruthy();
    expect(inputEl.getAttribute('aria-busy')).toBe('true');
  });

  it('shows the empty row when no options match and not loading', () => {
    fixture.componentRef.setInput('options', []);
    type(fixture, inputEl, 'a');
    expect(fixture.nativeElement.querySelector('.ct-autocomplete__empty')).toBeTruthy();
  });

  it('hideOnEmpty keeps the panel closed when there are no options', () => {
    fixture.componentRef.setInput('hideOnEmpty', true);
    fixture.componentRef.setInput('options', []);
    type(fixture, inputEl, 'a');
    expect(inputEl.getAttribute('aria-expanded')).toBe('false');
    expect(fixture.nativeElement.querySelector('.ct-autocomplete__empty')).toBeFalsy();
  });

  it('hideOnEmpty still opens the panel while loading', () => {
    fixture.componentRef.setInput('hideOnEmpty', true);
    fixture.componentRef.setInput('options', []);
    fixture.componentRef.setInput('loading', true);
    type(fixture, inputEl, 'a');
    expect(inputEl.getAttribute('aria-expanded')).toBe('true');
  });

  it('ArrowDown highlights the first enabled option and sets aria-activedescendant', () => {
    type(fixture, inputEl, 'a');
    inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();
    const active = inputEl.getAttribute('aria-activedescendant');
    expect(active).toBeTruthy();
    const highlighted = fixture.nativeElement.querySelector('[data-highlighted]');
    expect(highlighted.id).toBe(active);
  });

  it('Enter selects the highlighted option and emits it', () => {
    const selected: AfAutocompleteOption[] = [];
    component.optionSelected.subscribe((o) => selected.push(o));
    type(fixture, inputEl, 'a');
    inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();
    inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    expect(selected.length).toBe(1);
    expect(selected[0].id).toBe('u1');
  });

  it('skips disabled options during keyboard navigation and never selects them', () => {
    const selected: AfAutocompleteOption[] = [];
    component.optionSelected.subscribe((o) => selected.push(o));
    type(fixture, inputEl, 'a');
    // 4 options, last (Globex) disabled. End should land on the last *enabled* (Acme).
    inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    fixture.detectChanges();
    inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    expect(selected[0].id).toBe('o1');
  });

  it('clicking a disabled option does not emit', () => {
    const selected: AfAutocompleteOption[] = [];
    component.optionSelected.subscribe((o) => selected.push(o));
    type(fixture, inputEl, 'a');
    const disabled = fixture.nativeElement.querySelector('[aria-disabled="true"]');
    disabled.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();
    expect(selected.length).toBe(0);
  });

  it('Escape closes the listbox', () => {
    type(fixture, inputEl, 'a');
    expect(inputEl.getAttribute('aria-expanded')).toBe('true');
    inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(inputEl.getAttribute('aria-expanded')).toBe('false');
  });

  it('clearQueryOnSelect clears the query after selection', () => {
    fixture.componentRef.setInput('clearQueryOnSelect', true);
    type(fixture, inputEl, 'a');
    component.selectOption(OPTIONS[0]);
    fixture.detectChanges();
    expect(component.query()).toBe('');
  });

  it('keeps the selected label when clearQueryOnSelect is false', () => {
    type(fixture, inputEl, 'a');
    component.selectOption(OPTIONS[0]);
    fixture.detectChanges();
    expect(component.query()).toBe('Alice Anderson');
  });

  it('clear() empties the query and closes', () => {
    type(fixture, inputEl, 'abc');
    component.clear();
    fixture.detectChanges();
    expect(component.query()).toBe('');
    expect(inputEl.getAttribute('aria-expanded')).toBe('false');
  });

  describe('Accessibility (axe-core)', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Search');
      fixture.detectChanges();
    });

    it('passes axe checks when closed', async () => {
      await checkA11y(fixture.nativeElement);
    });

    it('passes axe checks with the listbox and groups open', async () => {
      type(fixture, inputEl, 'a');
      await checkA11y(fixture.nativeElement);
    });

    it('passes axe checks while loading', async () => {
      fixture.componentRef.setInput('loading', true);
      type(fixture, inputEl, 'a');
      await checkA11y(fixture.nativeElement);
    });
  });
});

@Component({
  imports: [AfAutocompleteComponent, AfAutocompleteOptionDirective],
  template: `
    <af-autocomplete [options]="options()" [query]="''">
      <ng-template afAutocompleteOption let-option="option">
        <span class="custom-row" data-test="custom">★ {{ option.label }}</span>
      </ng-template>
    </af-autocomplete>
  `,
})
class TemplateHostComponent {
  readonly options = signal<AfAutocompleteOption[]>(OPTIONS);
}

describe('AfAutocompleteComponent custom option template', () => {
  it('renders the projected row template instead of the default', () => {
    const fixture = TestBed.createComponent(TemplateHostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[role="combobox"]');
    type(fixture, input, 'a');
    const custom = fixture.nativeElement.querySelectorAll('[data-test="custom"]');
    expect(custom.length).toBe(OPTIONS.length);
    expect(custom[0].textContent).toContain('★');
  });
});
