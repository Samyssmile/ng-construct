import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
  signal,
  output,
} from '@angular/core';
import {
  AfCardComponent,
  AfIconComponent,
  AfProgressBarComponent,
  AfDataTableComponent,
  AfColumn,
  AfDataRow,
  AfCellDefDirective,
  AfPaginationComponent,
  AfBadgeComponent,
  AfTooltipDirective,
  AfFormatLabelPipe,
  AfGaugeComponent,
  AfDonutChartComponent,
  AfBarChartComponent,
  AfLineChartComponent,
  AfSparklineComponent,
  type AfChartDatum,
  type AfChartSeries,
  type AfGaugeThreshold,
} from '@neuravision/ng-construct';
import {
  LucideClipboardCheck,
  LucideCircleCheck,
  LucideClock,
  LucideTriangleAlert,
  LucideRocket,
  LucideFlaskConical,
  LucideMonitor,
  LucideCloud,
} from '@lucide/angular';
import { PmDataService } from '../../services/pm-data.service';
import { TaskStatus } from '../../data/models';

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
    AfGaugeComponent,
    AfDonutChartComponent,
    AfBarChartComponent,
    AfLineChartComponent,
    AfSparklineComponent,
    LucideClipboardCheck,
    LucideCircleCheck,
    LucideClock,
    LucideTriangleAlert,
    LucideRocket,
    LucideFlaskConical,
    LucideMonitor,
    LucideCloud,
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

  /** Status buckets shown in the donut, in a stable display order. */
  private readonly statusOrder: TaskStatus[] = [
    'TODO',
    'IN_PROGRESS',
    'IN_REVIEW',
    'DONE',
    'BLOCKED',
  ];
  private readonly statusLabels: Record<TaskStatus, string> = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    IN_REVIEW: 'In Review',
    DONE: 'Done',
    BLOCKED: 'Blocked',
  };

  /** Overall completion as a whole-number percentage, for the gauge. */
  readonly completionRate = computed(() => {
    const total = this.totalTasks();
    return total === 0 ? 0 : Math.round((this.completedTasks() / total) * 100);
  });

  /** Colour bands for the completion gauge — red below 40 %, amber to 70 %, green above. */
  readonly completionThresholds: AfGaugeThreshold[] = [
    { from: 0, status: 'danger' },
    { from: 40, status: 'warning' },
    { from: 70, status: 'success' },
  ];

  /** Task count per status, as part-to-whole data for the donut chart. */
  readonly statusBreakdown = computed<AfChartDatum[]>(() => {
    const tasks = this.dataService.tasks();
    return this.statusOrder.map((status) => ({
      label: this.statusLabels[status],
      value: tasks.filter((t) => t.status === status).length,
    }));
  });

  /** Completed vs. open tasks per project, as a stacked bar series. */
  readonly workload = computed(() => {
    const tasks = this.dataService.tasks();
    const projects = this.dataService.projects();
    const completed: number[] = [];
    const open: number[] = [];
    for (const project of projects) {
      const projectTasks = tasks.filter((t) => t.projectId === project.id);
      const done = projectTasks.filter((t) => t.status === 'DONE').length;
      completed.push(done);
      open.push(projectTasks.length - done);
    }
    return {
      categories: projects.map((p) => p.name),
      series: [
        { name: 'Completed', values: completed },
        { name: 'Open', values: open },
      ] as AfChartSeries[],
    };
  });

  /** Cumulative completed-task count over time (a burn-up line). */
  readonly completionTrend = computed(() => {
    const done = [...this.dataService.tasks()]
      .filter((t) => t.status === 'DONE')
      .sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
    const categories = done.map((t) =>
      t.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    );
    const values = done.map((_, i) => i + 1);
    return { categories, series: [{ name: 'Completed', values }] as AfChartSeries[] };
  });

  /** New tasks per week since the first task, for the KPI-tile sparkline. */
  readonly weeklyIntake = computed(() =>
    this.bucketByWeek(this.dataService.tasks().map((t) => t.createdAt)),
  );

  readonly projects = computed(() =>
    this.dataService.projects().map((p) => ({
      ...p,
      progress: p.taskCount > 0 ? Math.round((p.completedCount / p.taskCount) * 100) : 0,
    })),
  );

  readonly recentTasksPage = signal(1);
  private readonly pageSize = 5;

  readonly recentTasks = computed(() => {
    const sorted = [...this.dataService.tasks()].sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    );
    const start = (this.recentTasksPage() - 1) * this.pageSize;
    return sorted.slice(start, start + this.pageSize).map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      assignee: this.dataService.getMember(t.assigneeId)?.name ?? 'Unassigned',
      updatedAt: t.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));
  });

  readonly totalRecentPages = computed(() =>
    Math.ceil(this.dataService.tasks().length / this.pageSize),
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
      DONE: 'success',
      IN_PROGRESS: 'info',
      IN_REVIEW: 'warning',
      BLOCKED: 'danger',
      TODO: 'default',
    };
    return map[status] ?? 'default';
  }

  getPriorityVariant(priority: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
    const map: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
      LOW: 'default',
      MEDIUM: 'info',
      HIGH: 'warning',
      CRITICAL: 'danger',
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

  /** Counts the given dates into consecutive 7-day buckets from the earliest date. */
  private bucketByWeek(dates: Date[]): number[] {
    if (dates.length === 0) return [];
    const week = 7 * 24 * 60 * 60 * 1000;
    const times = dates.map((d) => d.getTime());
    const min = Math.min(...times);
    const max = Math.max(...times);
    const bucketCount = Math.floor((max - min) / week) + 1;
    const counts = new Array<number>(bucketCount).fill(0);
    for (const time of times) {
      const index = Math.min(bucketCount - 1, Math.floor((time - min) / week));
      counts[index]++;
    }
    return counts;
  }
}
