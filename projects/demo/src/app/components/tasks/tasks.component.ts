import { Component, ChangeDetectionStrategy, inject, input, output, signal, computed } from '@angular/core';
import {
  AfToggleGroupComponent, AfToggleItem,
  AfInputComponent,
  AfIconComponent,
  AfDataTableComponent, AfColumn, AfDataRow, AfCellDefDirective, AfSortState,
  AfPaginationComponent,
  AfDropdownComponent, AfDropdownItem,
  AfBadgeComponent,
  AfSpinnerComponent,
  AfButtonComponent,
  AfFormatLabelPipe,
  AfToastService,
} from '@neuravision/ng-construct';
import { FormsModule } from '@angular/forms';
import { PmDataService } from '../../services/pm-data.service';
import { Task } from '../../data/models';

@Component({
  selector: 'app-tasks',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    AfToggleGroupComponent,
    AfInputComponent,
    AfIconComponent,
    AfDataTableComponent,
    AfCellDefDirective,
    AfPaginationComponent,
    AfDropdownComponent,
    AfBadgeComponent,
    AfSpinnerComponent,
    AfButtonComponent,
    AfFormatLabelPipe,
  ],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css',
})
export class TasksComponent {
  readonly projectId = input<string | null>(null);
  readonly createTask = output();

  private readonly dataService = inject(PmDataService);
  private readonly toastService = inject(AfToastService);

  readonly filterItems: AfToggleItem[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
  ];

  readonly filter = signal('all');
  readonly searchQuery = signal('');
  readonly currentPage = signal(1);
  readonly sort = signal<AfSortState | null>(null);
  readonly loading = signal(false);
  private readonly pageSize = 10;

  readonly filteredTasks = computed(() => {
    let tasks = this.dataService.tasks();

    const projectId = this.projectId();
    if (projectId) {
      tasks = tasks.filter(t => t.projectId === projectId);
    }

    const query = this.searchQuery().toLowerCase();
    if (query) {
      tasks = tasks.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    const filter = this.filter();
    if (filter === 'active') {
      tasks = tasks.filter(t => t.status !== 'DONE');
    } else if (filter === 'completed') {
      tasks = tasks.filter(t => t.status === 'DONE');
    }

    return tasks;
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredTasks().length / this.pageSize))
  );

  readonly pagedTasks = computed<AfDataRow[]>(() => {
    const tasks = this.filteredTasks();
    const start = (this.currentPage() - 1) * this.pageSize;
    return tasks.slice(start, start + this.pageSize).map(t => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      type: t.type,
      assignee: this.dataService.getMember(t.assigneeId)?.name ?? 'Unassigned',
      dueDate: t.dueDate ? t.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—',
    }));
  });

  readonly columns: AfColumn[] = [
    { key: 'title', header: 'Task', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'priority', header: 'Priority', sortable: true },
    { key: 'type', header: 'Type' },
    { key: 'assignee', header: 'Assignee', sortable: true },
    { key: 'dueDate', header: 'Due Date' },
    { key: 'actions', header: '' },
  ];

  readonly rowActions: AfDropdownItem[] = [
    { label: 'Edit', value: 'edit' },
    { label: 'Duplicate', value: 'duplicate' },
    { separator: true, label: '', value: null },
    { label: 'Archive', value: 'archive' },
    { label: 'Delete', value: 'delete' },
  ];

  getStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
    const map: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
      DONE: 'success', IN_PROGRESS: 'info', IN_REVIEW: 'warning', BLOCKED: 'danger', TODO: 'default',
    };
    return map[status] ?? 'default';
  }

  getPriorityVariant(priority: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
    const map: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
      LOW: 'default', MEDIUM: 'info', HIGH: 'warning', CRITICAL: 'danger',
    };
    return map[priority] ?? 'default';
  }

  getTypeIcon(type: string): string {
    const map: Record<string, string> = {
      BUG: 'bug_report', FEATURE: 'new_releases', IMPROVEMENT: 'build',
    };
    return map[type] ?? 'task';
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.simulateLoading();
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  onSortChange(sortState: AfSortState | null): void {
    this.sort.set(sortState);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onRowAction(action: unknown, row: AfDataRow): void {
    if (action === 'delete') {
      const taskId = row['id'] as string;
      const task = this.dataService.tasks().find(t => t.id === taskId);
      if (!task) return;

      this.dataService.deleteTask(taskId);
      this.toastService.show({
        title: 'Task deleted',
        description: `"${row['title']}" was removed.`,
        variant: 'warning',
        duration: 8000,
        action: {
          label: 'Undo',
          callback: () => this.dataService.restoreTask(task),
        },
      });
    } else {
      this.toastService.info('Action', `${action} on "${row['title']}"`);
    }
  }

  private simulateLoading(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 400);
  }
}
