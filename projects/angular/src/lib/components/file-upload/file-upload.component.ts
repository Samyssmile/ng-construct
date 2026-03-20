import {
  Component,
  ChangeDetectionStrategy,
  forwardRef,
  input,
  output,
  model,
  signal,
  computed,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AfButtonComponent } from '../button';
import { AfBadgeComponent } from '../badge';

export interface AfFileValidationError {
  file: File;
  type: 'type' | 'size';
  message: string;
}

export interface AfFileEntry {
  file: File;
  status: 'success' | 'error';
  error?: string;
}

/**
 * File upload component with drag-and-drop, validation, and form control support.
 *
 * @example
 * <af-file-upload
 *   label="Attachments"
 *   hint="PDF, DOCX up to 10MB"
 *   accept=".pdf,.docx"
 *   [maxSize]="10485760"
 *   multiple
 *   [(ngModel)]="files">
 * </af-file-upload>
 *
 * @example
 * <af-file-upload
 *   label="Avatar"
 *   accept="image/*"
 *   [maxSize]="2097152"
 *   [formControl]="avatarControl">
 * </af-file-upload>
 */
@Component({
  selector: 'af-file-upload',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AfButtonComponent, AfBadgeComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AfFileUploadComponent),
      multi: true,
    },
  ],
  template: `
    <div class="ct-file-upload">
      @if (label()) {
        <span class="ct-field__label" [id]="labelId()">
          {{ label() }}
          @if (required()) {
            <span aria-label="required"> *</span>
          }
        </span>
      }

      <label
        class="ct-file-upload__dropzone"
        [attr.for]="inputId()"
        [attr.data-state]="dragOver() ? 'dragover' : null"
        [attr.aria-invalid]="error() ? true : null"
        [attr.aria-disabled]="disabled() || null"
        (dragenter)="onDragEnter($event)"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)">
        <input
          class="ct-file-upload__input"
          [id]="inputId()"
          type="file"
          [accept]="accept()"
          [multiple]="multiple()"
          [disabled]="disabled()"
          [required]="required()"
          [attr.aria-label]="label() || 'File upload'"
          [attr.aria-describedby]="ariaDescribedBy()"
          [attr.aria-invalid]="error() ? true : null"
          (change)="onFileSelected($event)"
          (blur)="onTouched()" />
        <span class="ct-file-upload__title">Drop files here or browse</span>
        @if (hint()) {
          <span class="ct-file-upload__hint" [id]="hintId()">{{ hint() }}</span>
        }
        <span class="ct-button ct-button--secondary ct-button--sm" aria-hidden="true">
          Browse files
        </span>
      </label>

      @if (fileEntries().length > 0) {
        <ul class="ct-file-upload__list" aria-label="Selected files">
          @for (entry of fileEntries(); track $index) {
            <li class="ct-file-upload__item" [attr.data-status]="entry.status">
              <div class="ct-file-upload__file">
                <span class="ct-file-upload__name">{{ entry.file.name }}</span>
                <span class="ct-file-upload__meta">{{ formatSize(entry.file.size) }}</span>
                @if (entry.error) {
                  <span class="ct-file-upload__error">{{ entry.error }}</span>
                }
              </div>
              <div class="ct-file-upload__actions">
                @if (entry.status === 'success') {
                  <af-badge variant="success">Ready</af-badge>
                }
                @if (entry.status === 'error') {
                  <af-badge variant="danger">Invalid</af-badge>
                }
                @if (!disabled()) {
                  <af-button
                    variant="ghost"
                    size="sm"
                    [ariaLabel]="'Remove ' + entry.file.name"
                    (clicked)="removeFile(entry)">
                    Remove
                  </af-button>
                }
              </div>
            </li>
          }
        </ul>
      }

      @if (error()) {
        <div class="ct-file-upload__error" [id]="errorId()" role="alert">
          {{ error() }}
        </div>
      }

      <span class="af-file-upload__sr-only" aria-live="polite" aria-atomic="true">
        {{ liveAnnouncement() }}
      </span>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .af-file-upload__sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    `,
  ],
})
export class AfFileUploadComponent implements ControlValueAccessor {
  private static nextId = 0;

  /** Label shown above the dropzone */
  label = input('');

  /** Hint text shown in the dropzone (e.g. accepted types and size limit) */
  hint = input('');

  /** Error message — shows error state */
  error = input('');

  /** Accepted file types (e.g. '.pdf,.docx' or 'image/*') */
  accept = input('');

  /** Maximum file size in bytes (0 = unlimited) */
  maxSize = input(0);

  /** Allow selecting multiple files */
  multiple = input(false);

  /** Whether the field is required */
  required = input(false);

  /** Whether the component is disabled */
  disabled = model(false);

  /** Emits validation errors when invalid files are added */
  validationErrors = output<AfFileValidationError[]>();

  /** Unique component ID */
  inputId = input(`af-file-upload-${AfFileUploadComponent.nextId++}`);

  fileEntries = signal<AfFileEntry[]>([]);
  dragOver = signal(false);
  liveAnnouncement = signal('');

  onChange: (value: File | File[] | null) => void = () => {};
  onTouched: () => void = () => {};

  labelId = computed(() => `${this.inputId()}-label`);
  hintId = computed(() => `${this.inputId()}-hint`);
  errorId = computed(() => `${this.inputId()}-error`);

  ariaDescribedBy = computed(() => {
    const ids: string[] = [];
    if (this.error()) ids.push(this.errorId());
    if (this.hint()) ids.push(this.hintId());
    return ids.length > 0 ? ids.join(' ') : null;
  });

  onDragEnter(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.disabled()) {
      this.dragOver.set(true);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);

    if (this.disabled()) return;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFiles(Array.from(input.files));
    }
    input.value = '';
  }

  /** Removes a file entry from the list */
  removeFile(entry: AfFileEntry): void {
    this.fileEntries.update((entries) => entries.filter((e) => e !== entry));
    this.emitValue();
    this.announce(`${entry.file.name} removed`);
  }

  /** Formats bytes into a human-readable size string */
  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);
    return `${size < 10 ? size.toFixed(1) : Math.round(size)} ${units[i]}`;
  }

  writeValue(value: File | File[] | null): void {
    if (!value) {
      this.fileEntries.set([]);
      return;
    }
    const files = Array.isArray(value) ? value : [value];
    this.fileEntries.set(files.map((file) => ({ file, status: 'success' as const })));
  }

  registerOnChange(fn: (value: File | File[] | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  private processFiles(files: File[]): void {
    const newEntries: AfFileEntry[] = [];
    const errors: AfFileValidationError[] = [];

    for (const file of files) {
      const fileErrors = this.validateFile(file);
      if (fileErrors.length > 0) {
        newEntries.push({ file, status: 'error', error: fileErrors[0].message });
        errors.push(...fileErrors);
      } else {
        newEntries.push({ file, status: 'success' });
      }
    }

    if (this.multiple()) {
      this.fileEntries.update((existing) => [...existing, ...newEntries]);
    } else {
      this.fileEntries.set(newEntries.slice(0, 1));
    }

    if (errors.length > 0) {
      this.validationErrors.emit(errors);
    }

    this.emitValue();

    const validCount = newEntries.filter((e) => e.status === 'success').length;
    const errorCount = newEntries.filter((e) => e.status === 'error').length;
    const parts: string[] = [];
    if (validCount > 0) parts.push(`${validCount} file${validCount > 1 ? 's' : ''} added`);
    if (errorCount > 0) parts.push(`${errorCount} file${errorCount > 1 ? 's' : ''} rejected`);
    this.announce(parts.join(', '));
  }

  private validateFile(file: File): AfFileValidationError[] {
    const errors: AfFileValidationError[] = [];

    if (this.accept() && !this.isFileTypeAccepted(file)) {
      errors.push({
        file,
        type: 'type',
        message: `File type not accepted: ${file.name}`,
      });
    }

    if (this.maxSize() > 0 && file.size > this.maxSize()) {
      errors.push({
        file,
        type: 'size',
        message: `File too large: ${file.name} (${this.formatSize(file.size)})`,
      });
    }

    return errors;
  }

  private isFileTypeAccepted(file: File): boolean {
    const acceptStr = this.accept();
    if (!acceptStr) return true;

    const acceptedTypes = acceptStr.split(',').map((t) => t.trim().toLowerCase());
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();

    return acceptedTypes.some((accepted) => {
      if (accepted.startsWith('.')) {
        return fileName.endsWith(accepted);
      }
      if (accepted.endsWith('/*')) {
        return fileType.startsWith(accepted.slice(0, -1));
      }
      return fileType === accepted;
    });
  }

  private emitValue(): void {
    const validFiles = this.fileEntries()
      .filter((e) => e.status === 'success')
      .map((e) => e.file);

    if (this.multiple()) {
      this.onChange(validFiles);
    } else {
      this.onChange(validFiles[0] ?? null);
    }
  }

  private announce(message: string): void {
    this.liveAnnouncement.set('');
    setTimeout(() => this.liveAnnouncement.set(message));
  }
}
