import { Component, ChangeDetectionStrategy, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AfModalComponent,
  AfInputComponent,
  AfTextareaComponent,
  AfSelectComponent, AfSelectOption,
  AfDatepickerComponent,
  AfChipInputComponent,
  AfRadioComponent,
  AfCheckboxComponent,
  AfSwitchComponent,
  AfButtonComponent,
  AfIconComponent,
  AfToastService,
} from '@neuravision/ng-construct';
import { LucideListPlus } from '@lucide/angular';
import { PmDataService } from '../../services/pm-data.service';
import { TaskType, TaskPriority } from '../../data/models';
import { computed } from '@angular/core';

@Component({
  selector: 'app-create-task-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    AfModalComponent,
    AfInputComponent,
    AfTextareaComponent,
    AfSelectComponent,
    AfDatepickerComponent,
    AfChipInputComponent,
    AfRadioComponent,
    AfCheckboxComponent,
    AfSwitchComponent,
    AfButtonComponent,
    AfIconComponent,
    LucideListPlus,
  ],
  templateUrl: './create-task-modal.component.html',
  styleUrl: './create-task-modal.component.css',
})
export class CreateTaskModalComponent {
  readonly open = input(false);
  readonly closed = output();

  private readonly fb = inject(FormBuilder);
  private readonly dataService = inject(PmDataService);
  private readonly toastService = inject(AfToastService);

  readonly form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    priority: ['MEDIUM' as TaskPriority],
    assigneeId: [''],
    projectId: [''],
    dueDate: [null as Date | null],
    tags: [[] as string[]],
    type: ['FEATURE' as TaskType],
    isUrgent: [false],
    sendNotifications: [true],
  });

  readonly priorityOptions: AfSelectOption[] = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'CRITICAL', label: 'Critical' },
  ];

  readonly assigneeOptions = computed<AfSelectOption[]>(() =>
    this.dataService.teamMembers().map(m => ({ value: m.id, label: `${m.name} (${m.role})` }))
  );

  readonly projectOptions = computed<AfSelectOption[]>(() =>
    this.dataService.projects().map(p => ({ value: p.id, label: p.name }))
  );

  onSubmit(): void {
    if (this.form.invalid) return;

    const val = this.form.getRawValue();
    this.dataService.addTask({
      title: val.title!,
      description: val.description ?? '',
      status: 'TODO',
      priority: val.priority as TaskPriority,
      type: val.type as TaskType,
      assigneeId: val.assigneeId ?? '',
      projectId: val.projectId ?? '',
      tags: val.tags ?? [],
      dueDate: val.dueDate,
      isUrgent: val.isUrgent ?? false,
      sendNotifications: val.sendNotifications ?? true,
    });

    this.toastService.success('Task created', `"${val.title}" has been added.`);
    this.form.reset({ priority: 'MEDIUM', type: 'FEATURE', sendNotifications: true });
    this.closed.emit();
  }

  onCancel(): void {
    this.form.reset({ priority: 'MEDIUM', type: 'FEATURE', sendNotifications: true });
    this.closed.emit();
  }
}
