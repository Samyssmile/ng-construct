import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  AfFileUploadComponent,
  AfFileEntry,
  AfFileValidationError,
} from './file-upload.component';

describe('AfFileUploadComponent', () => {
  let component: AfFileUploadComponent;
  let fixture: ComponentFixture<AfFileUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfFileUploadComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AfFileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should render a hidden file input', () => {
      const input = fixture.nativeElement.querySelector('input[type="file"]');
      expect(input).toBeTruthy();
      expect(input.classList.contains('ct-file-upload__input')).toBe(true);
    });

    it('should render the dropzone as a label', () => {
      const dropzone = fixture.nativeElement.querySelector('.ct-file-upload__dropzone');
      expect(dropzone).toBeTruthy();
      expect(dropzone.tagName).toBe('LABEL');
    });

    it('should render dropzone title', () => {
      const title = fixture.nativeElement.querySelector('.ct-file-upload__title');
      expect(title.textContent).toContain('Drop files here or browse');
    });

    it('should render browse button', () => {
      const btn = fixture.nativeElement.querySelector('.ct-button--secondary');
      expect(btn.textContent).toContain('Browse files');
      expect(btn.getAttribute('aria-hidden')).toBe('true');
    });

    it('should show label when provided', () => {
      fixture.componentRef.setInput('label', 'Upload files');
      fixture.detectChanges();

      const label = fixture.nativeElement.querySelector('.ct-field__label');
      expect(label.textContent).toContain('Upload files');
    });

    it('should show hint when provided', () => {
      fixture.componentRef.setInput('hint', 'PDF up to 10MB');
      fixture.detectChanges();

      const hint = fixture.nativeElement.querySelector('.ct-file-upload__hint');
      expect(hint.textContent).toContain('PDF up to 10MB');
    });

    it('should show required indicator', () => {
      fixture.componentRef.setInput('label', 'Files');
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      const required = fixture.nativeElement.querySelector('[aria-label="required"]');
      expect(required).toBeTruthy();
    });

    it('should show error message', () => {
      fixture.componentRef.setInput('error', 'File required');
      fixture.detectChanges();

      const error = fixture.nativeElement.querySelector('.ct-file-upload__error');
      expect(error.textContent).toContain('File required');
      expect(error.getAttribute('role')).toBe('alert');
    });

    it('should not render file list when empty', () => {
      const list = fixture.nativeElement.querySelector('.ct-file-upload__list');
      expect(list).toBeNull();
    });
  });

  describe('file selection', () => {
    it('should add files on selection', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      component.onFileSelected(createFileChangeEvent([file]));
      fixture.detectChanges();

      const items = fixture.nativeElement.querySelectorAll('.ct-file-upload__item');
      expect(items.length).toBe(1);
      expect(items[0].textContent).toContain('test.pdf');
    });

    it('should show file size', () => {
      const file = new File(['x'.repeat(1024)], 'test.pdf', { type: 'application/pdf' });
      component.onFileSelected(createFileChangeEvent([file]));
      fixture.detectChanges();

      const meta = fixture.nativeElement.querySelector('.ct-file-upload__meta');
      expect(meta.textContent).toContain('KB');
    });

    it('should replace file in single mode', () => {
      const file1 = new File(['a'], 'first.pdf', { type: 'application/pdf' });
      const file2 = new File(['b'], 'second.pdf', { type: 'application/pdf' });

      component.onFileSelected(createFileChangeEvent([file1]));
      component.onFileSelected(createFileChangeEvent([file2]));
      fixture.detectChanges();

      const items = fixture.nativeElement.querySelectorAll('.ct-file-upload__item');
      expect(items.length).toBe(1);
      expect(items[0].textContent).toContain('second.pdf');
    });

    it('should accumulate files in multiple mode', () => {
      fixture.componentRef.setInput('multiple', true);
      fixture.detectChanges();

      const file1 = new File(['a'], 'first.pdf', { type: 'application/pdf' });
      const file2 = new File(['b'], 'second.pdf', { type: 'application/pdf' });

      component.onFileSelected(createFileChangeEvent([file1]));
      component.onFileSelected(createFileChangeEvent([file2]));
      fixture.detectChanges();

      const items = fixture.nativeElement.querySelectorAll('.ct-file-upload__item');
      expect(items.length).toBe(2);
    });

    it('should remove files', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      component.onFileSelected(createFileChangeEvent([file]));
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('.ct-file-upload__item').length).toBe(1);

      component.removeFile(component.fileEntries()[0]);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('.ct-file-upload__item').length).toBe(0);
    });

    it('should show success badge for valid files', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      component.onFileSelected(createFileChangeEvent([file]));
      fixture.detectChanges();

      const item = fixture.nativeElement.querySelector('.ct-file-upload__item');
      expect(item.getAttribute('data-status')).toBe('success');
      expect(item.textContent).toContain('Ready');
    });

    it('should not process files when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('.ct-file-upload__input');
      expect(input.disabled).toBe(true);
    });
  });

  describe('validation', () => {
    it('should reject files exceeding maxSize', () => {
      fixture.componentRef.setInput('maxSize', 100);
      fixture.detectChanges();

      const largeFile = new File(['x'.repeat(200)], 'large.pdf', { type: 'application/pdf' });
      let errors: AfFileValidationError[] = [];
      component.validationErrors.subscribe((e) => (errors = e));

      component.onFileSelected(createFileChangeEvent([largeFile]));
      fixture.detectChanges();

      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe('size');

      const item = fixture.nativeElement.querySelector('.ct-file-upload__item');
      expect(item.getAttribute('data-status')).toBe('error');
      expect(item.textContent).toContain('Invalid');
    });

    it('should reject files with wrong extension', () => {
      fixture.componentRef.setInput('accept', '.pdf');
      fixture.detectChanges();

      const txtFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      let errors: AfFileValidationError[] = [];
      component.validationErrors.subscribe((e) => (errors = e));

      component.onFileSelected(createFileChangeEvent([txtFile]));
      fixture.detectChanges();

      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe('type');
    });

    it('should accept files matching extension', () => {
      fixture.componentRef.setInput('accept', '.pdf');
      fixture.detectChanges();

      const pdfFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      let errors: AfFileValidationError[] = [];
      component.validationErrors.subscribe((e) => (errors = e));

      component.onFileSelected(createFileChangeEvent([pdfFile]));
      fixture.detectChanges();

      expect(errors.length).toBe(0);
      const item = fixture.nativeElement.querySelector('.ct-file-upload__item');
      expect(item.getAttribute('data-status')).toBe('success');
    });

    it('should accept files matching MIME wildcard', () => {
      fixture.componentRef.setInput('accept', 'image/*');
      fixture.detectChanges();

      const imgFile = new File(['content'], 'photo.png', { type: 'image/png' });
      let errors: AfFileValidationError[] = [];
      component.validationErrors.subscribe((e) => (errors = e));

      component.onFileSelected(createFileChangeEvent([imgFile]));
      fixture.detectChanges();

      expect(errors.length).toBe(0);
    });

    it('should accept files matching exact MIME type', () => {
      fixture.componentRef.setInput('accept', 'application/pdf');
      fixture.detectChanges();

      const pdfFile = new File(['content'], 'doc.pdf', { type: 'application/pdf' });
      let errors: AfFileValidationError[] = [];
      component.validationErrors.subscribe((e) => (errors = e));

      component.onFileSelected(createFileChangeEvent([pdfFile]));
      fixture.detectChanges();

      expect(errors.length).toBe(0);
    });

    it('should show per-file error message', () => {
      fixture.componentRef.setInput('maxSize', 10);
      fixture.detectChanges();

      const largeFile = new File(['x'.repeat(100)], 'big.pdf', { type: 'application/pdf' });
      component.onFileSelected(createFileChangeEvent([largeFile]));
      fixture.detectChanges();

      const fileError = fixture.nativeElement.querySelector(
        '.ct-file-upload__item .ct-file-upload__error'
      );
      expect(fileError).toBeTruthy();
      expect(fileError.textContent).toContain('File too large');
    });

    it('should handle mixed valid and invalid files', () => {
      fixture.componentRef.setInput('multiple', true);
      fixture.componentRef.setInput('maxSize', 100);
      fixture.detectChanges();

      const validFile = new File(['ok'], 'small.pdf', { type: 'application/pdf' });
      const invalidFile = new File(['x'.repeat(200)], 'big.pdf', { type: 'application/pdf' });

      component.onFileSelected(createFileChangeEvent([validFile, invalidFile]));
      fixture.detectChanges();

      const items = fixture.nativeElement.querySelectorAll('.ct-file-upload__item');
      expect(items.length).toBe(2);
      expect(items[0].getAttribute('data-status')).toBe('success');
      expect(items[1].getAttribute('data-status')).toBe('error');
    });
  });

  describe('accessibility', () => {
    it('should associate dropzone label with input via for/id', () => {
      const input = fixture.nativeElement.querySelector('.ct-file-upload__input');
      const dropzone = fixture.nativeElement.querySelector('.ct-file-upload__dropzone');
      expect(dropzone.getAttribute('for')).toBe(input.id);
    });

    it('should set aria-invalid on dropzone when error exists', () => {
      fixture.componentRef.setInput('error', 'Required');
      fixture.detectChanges();

      const dropzone = fixture.nativeElement.querySelector('.ct-file-upload__dropzone');
      expect(dropzone.getAttribute('aria-invalid')).toBe('true');
    });

    it('should set aria-invalid on input when error exists', () => {
      fixture.componentRef.setInput('error', 'Required');
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('.ct-file-upload__input');
      expect(input.getAttribute('aria-invalid')).toBe('true');
    });

    it('should set aria-describedby referencing error', () => {
      fixture.componentRef.setInput('error', 'Required');
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('.ct-file-upload__input');
      const errorEl = fixture.nativeElement.querySelector('[role="alert"]');
      expect(input.getAttribute('aria-describedby')).toContain(errorEl.id);
    });

    it('should set aria-describedby referencing hint', () => {
      fixture.componentRef.setInput('hint', 'Max 10MB');
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('.ct-file-upload__input');
      const hintEl = fixture.nativeElement.querySelector('.ct-file-upload__hint');
      expect(input.getAttribute('aria-describedby')).toContain(hintEl.id);
    });

    it('should reference both error and hint in aria-describedby', () => {
      fixture.componentRef.setInput('hint', 'Max 10MB');
      fixture.componentRef.setInput('error', 'File required');
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('.ct-file-upload__input');
      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toContain('hint');
      expect(describedBy).toContain('error');
    });

    it('should have aria-label on input', () => {
      fixture.componentRef.setInput('label', 'Attachments');
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('.ct-file-upload__input');
      expect(input.getAttribute('aria-label')).toBe('Attachments');
    });

    it('should fall back to default aria-label when no label provided', () => {
      const input = fixture.nativeElement.querySelector('.ct-file-upload__input');
      expect(input.getAttribute('aria-label')).toBe('File upload');
    });

    it('should have live region for announcements', () => {
      const liveRegion = fixture.nativeElement.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion.getAttribute('aria-atomic')).toBe('true');
    });

    it('should set aria-disabled on dropzone when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const dropzone = fixture.nativeElement.querySelector('.ct-file-upload__dropzone');
      expect(dropzone.getAttribute('aria-disabled')).toBe('true');
    });

    it('should have aria-label on file list', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      component.onFileSelected(createFileChangeEvent([file]));
      fixture.detectChanges();

      const list = fixture.nativeElement.querySelector('.ct-file-upload__list');
      expect(list.getAttribute('aria-label')).toBe('Selected files');
    });

    it('should have accessible remove buttons', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      component.onFileSelected(createFileChangeEvent([file]));
      fixture.detectChanges();

      const removeBtn = fixture.nativeElement.querySelector('af-button[arialabel]');
      // The button component renders with ariaLabel input
      const btn = fixture.nativeElement.querySelector('af-button button');
      expect(btn.getAttribute('aria-label')).toBe('Remove test.pdf');
    });

    it('should use label for dropzone as native label element', () => {
      const dropzone = fixture.nativeElement.querySelector('.ct-file-upload__dropzone');
      expect(dropzone.tagName).toBe('LABEL');
    });
  });

  describe('drag and drop', () => {
    it('should set dragover state on dragenter', () => {
      component.onDragEnter(mockDragEvent('dragenter'));
      fixture.detectChanges();

      expect(component.dragOver()).toBe(true);
      const dropzone = fixture.nativeElement.querySelector('.ct-file-upload__dropzone');
      expect(dropzone.getAttribute('data-state')).toBe('dragover');
    });

    it('should clear dragover state on dragleave', () => {
      component.dragOver.set(true);
      fixture.detectChanges();

      component.onDragLeave(mockDragEvent('dragleave'));
      fixture.detectChanges();

      expect(component.dragOver()).toBe(false);
      const dropzone = fixture.nativeElement.querySelector('.ct-file-upload__dropzone');
      expect(dropzone.getAttribute('data-state')).toBeNull();
    });

    it('should clear dragover state on drop', () => {
      component.dragOver.set(true);
      component.onDrop(mockDragEvent('drop'));
      fixture.detectChanges();

      expect(component.dragOver()).toBe(false);
    });

    it('should not set dragover when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      component.onDragEnter(mockDragEvent('dragenter'));
      expect(component.dragOver()).toBe(false);
    });

    it('should process dropped files', () => {
      const file = new File(['content'], 'dropped.pdf', { type: 'application/pdf' });
      component.onDrop(mockDragEvent('drop', [file]));
      fixture.detectChanges();

      expect(component.fileEntries().length).toBe(1);
      expect(component.fileEntries()[0].file.name).toBe('dropped.pdf');
    });

    it('should not process drop when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const file = new File(['content'], 'dropped.pdf', { type: 'application/pdf' });
      component.onDrop(mockDragEvent('drop', [file]));
      fixture.detectChanges();

      expect(component.fileEntries().length).toBe(0);
    });
  });

  describe('ControlValueAccessor', () => {
    it('should write null to clear files', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      component.writeValue(file);
      expect(component.fileEntries().length).toBe(1);

      component.writeValue(null);
      expect(component.fileEntries().length).toBe(0);
    });

    it('should write a single file', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      component.writeValue(file);
      fixture.detectChanges();

      expect(component.fileEntries().length).toBe(1);
      expect(component.fileEntries()[0].status).toBe('success');
    });

    it('should write an array of files', () => {
      const files = [
        new File(['a'], 'a.pdf', { type: 'application/pdf' }),
        new File(['b'], 'b.pdf', { type: 'application/pdf' }),
      ];
      component.writeValue(files);
      fixture.detectChanges();

      expect(component.fileEntries().length).toBe(2);
    });

    it('should notify onChange with single file in single mode', () => {
      const changeSpy = vi.fn();
      component.registerOnChange(changeSpy);

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      component.onFileSelected(createFileChangeEvent([file]));

      expect(changeSpy).toHaveBeenCalledWith(file);
    });

    it('should notify onChange with array in multiple mode', () => {
      fixture.componentRef.setInput('multiple', true);
      fixture.detectChanges();

      const changeSpy = vi.fn();
      component.registerOnChange(changeSpy);

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      component.onFileSelected(createFileChangeEvent([file]));

      expect(changeSpy).toHaveBeenCalledWith([file]);
    });

    it('should notify onChange with null when last file removed in single mode', () => {
      const changeSpy = vi.fn();
      component.registerOnChange(changeSpy);

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      component.onFileSelected(createFileChangeEvent([file]));
      changeSpy.mockClear();

      component.removeFile(component.fileEntries()[0]);
      expect(changeSpy).toHaveBeenCalledWith(null);
    });

    it('should call onTouched on blur', () => {
      const touchedSpy = vi.fn();
      component.registerOnTouched(touchedSpy);

      const input = fixture.nativeElement.querySelector('.ct-file-upload__input');
      input.dispatchEvent(new Event('blur'));

      expect(touchedSpy).toHaveBeenCalled();
    });

    it('should set disabled state', () => {
      component.setDisabledState(true);
      fixture.detectChanges();

      expect(component.disabled()).toBe(true);
      const input = fixture.nativeElement.querySelector('.ct-file-upload__input');
      expect(input.disabled).toBe(true);
    });
  });

  describe('formatSize', () => {
    it('should format zero bytes', () => {
      expect(component.formatSize(0)).toBe('0 B');
    });

    it('should format bytes', () => {
      expect(component.formatSize(512)).toBe('512 B');
    });

    it('should format kilobytes', () => {
      expect(component.formatSize(1024)).toBe('1.0 KB');
      expect(component.formatSize(1536)).toBe('1.5 KB');
    });

    it('should format megabytes', () => {
      expect(component.formatSize(1048576)).toBe('1.0 MB');
      expect(component.formatSize(10485760)).toBe('10 MB');
    });
  });
});

function createFileList(files: File[]): FileList {
  const list = Object.create(FileList.prototype);
  for (let i = 0; i < files.length; i++) {
    list[i] = files[i];
  }
  Object.defineProperty(list, 'length', { value: files.length });
  list.item = (index: number) => list[index] ?? null;
  list[Symbol.iterator] = function* () {
    for (let i = 0; i < files.length; i++) yield files[i];
  };
  return list;
}

function createFileChangeEvent(files: File[]): Event {
  const input = document.createElement('input');
  input.type = 'file';
  Object.defineProperty(input, 'files', { value: createFileList(files) });
  return { target: input } as unknown as Event;
}

function mockDragEvent(type: string, files?: File[]): DragEvent {
  const dataTransfer = files
    ? { files: files as unknown as FileList, length: files.length }
    : null;
  return {
    type,
    preventDefault: () => {},
    stopPropagation: () => {},
    dataTransfer,
  } as unknown as DragEvent;
}

@Component({
  template: `<af-file-upload [formControl]="control" label="Attachments" />`,
  imports: [AfFileUploadComponent, ReactiveFormsModule],
})
class TestHostComponent {
  control = new FormControl<File | null>(null);
}

describe('AfFileUploadComponent with Reactive Forms', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should initialize with null value', () => {
    expect(fixture.componentInstance.control.value).toBeNull();
  });

  it('should disable input when form control is disabled', () => {
    fixture.componentInstance.control.disable();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('.ct-file-upload__input');
    expect(input.disabled).toBe(true);
  });

  it('should show disabled state on dropzone', () => {
    fixture.componentInstance.control.disable();
    fixture.detectChanges();

    const dropzone = fixture.nativeElement.querySelector('.ct-file-upload__dropzone');
    expect(dropzone.getAttribute('aria-disabled')).toBe('true');
  });
});
