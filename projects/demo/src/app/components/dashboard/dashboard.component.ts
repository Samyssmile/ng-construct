import { Component, ChangeDetectionStrategy, inject, computed, signal, output } from '@angular/core';
import {
  AfCardComponent,
  AfIconComponent,
  AfProgressBarComponent,
  AfDataTableComponent, AfColumn, AfDataRow, AfCellDefDirective,
  AfPaginationComponent,
  AfBadgeComponent,
  AfTooltipDirective,
  AfFormatLabelPipe,
} from '@neuravision/ng-construct';
import { PmDataService } from '../../services/pm-data.service';
import { TaskStatus, TaskPriority } from '../../data/models';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AfCardComponent,
    AfIconComponent,
    AfProgressBarComponent,
    AfDataTableComponent,
    AfCellDefDirective,
    AfPaginationComponent,
    AfBadgeComponent,
    AfTooltipDirective,
    AfFormatLabelPipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  readonly navigateToTasks = output();

  private readonly dataService = inject(PmDataService);

  readonly totalTasks = this.dataService.totalTasks;
  readonly completedTasks = this.dataService.completedTasks;
  readonly inProgressTasks = this.dataService.inProgressTasks;
  readonly overdueTasks = this.dataService.overdueTasks;

  readonly projects = computed(() =>
    this.dataService.projects().map(p => ({
      ...p,
      progress: p.taskCount > 0 ? Math.round((p.completedCount / p.taskCount) * 100) : 0,
    }))
  );

  readonly recentTasksPage = signal(1);
  private readonly pageSize = 5;

  readonly recentTasks = computed(() => {
    const sorted = [...this.dataService.tasks()].sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
    const start = (this.recentTasksPage() - 1) * this.pageSize;
    return sorted.slice(start, start + this.pageSize).map(t => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      assignee: this.dataService.getMember(t.assigneeId)?.name ?? 'Unassigned',
      updatedAt: t.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));
  });

  readonly totalRecentPages = computed(() =>
    Math.ceil(this.dataService.tasks().length / this.pageSize)
  );

  readonly recentColumns: AfColumn[] = [
    { key: 'title', header: 'Task', sortable: true },
    { key: 'status', header: 'Status' },
    { key: 'priority', header: 'Priority' },
    { key: 'assignee', header: 'Assignee' },
    { key: 'updatedAt', header: 'Updated' },
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

  getProgressVariant(value: number): 'success' | 'warning' | 'danger' | 'default' {
    if (value >= 75) return 'success';
    if (value >= 40) return 'warning';
    return 'danger';
  }

  onRecentPageChange(page: number): void {
    this.recentTasksPage.set(page);
  }
}
