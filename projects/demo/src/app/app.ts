import { Component, signal, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import {
  AfAppShellComponent,
  AfAppShellPageHeaderComponent,
  AfShellSidebarState,
  AfNavbarComponent,
  AfNavItemComponent,
  AfIconComponent,
  AfButtonComponent,
  AfTooltipDirective,
  AfBadgeComponent,
  AfBreadcrumbsComponent,
  AfBreadcrumb,
  AfToastContainerComponent,
} from '@neuravision/ng-construct';
import {
  LucideConstruction,
  LucidePlus,
  LucideBell,
  LucideSettings,
  LucideFolder,
  LucideList,
  LucideRocket,
  LucideFlaskConical,
  LucideMonitor,
  LucideCloud,
} from '@lucide/angular';
import { PmDataService } from './services/pm-data.service';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TasksComponent } from './components/tasks/tasks.component';
import { CreateTaskModalComponent } from './components/create-task-modal/create-task-modal.component';
import { SettingsComponent } from './components/settings/settings.component';

type AppView = 'dashboard' | 'tasks' | 'settings';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AfAppShellComponent,
    AfAppShellPageHeaderComponent,
    AfNavbarComponent,
    AfNavItemComponent,
    AfIconComponent,
    AfButtonComponent,
    AfTooltipDirective,
    AfBadgeComponent,
    AfBreadcrumbsComponent,
    AfToastContainerComponent,
    LucideConstruction,
    LucidePlus,
    LucideBell,
    LucideSettings,
    LucideFolder,
    LucideList,
    LucideRocket,
    LucideFlaskConical,
    LucideMonitor,
    LucideCloud,
    DashboardComponent,
    TasksComponent,
    CreateTaskModalComponent,
    SettingsComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly dataService = inject(PmDataService);

  readonly currentView = signal<AppView>('dashboard');
  readonly sidebarState = signal<AfShellSidebarState>('expanded');
  readonly isCreateTaskModalOpen = signal(false);
  readonly selectedProjectId = signal<string | null>(null);

  readonly notificationCount = computed(() => this.dataService.overdueTasks());

  readonly breadcrumbs = computed<AfBreadcrumb[]>(() => {
    const base: AfBreadcrumb = { label: 'Home' };
    const view = this.currentView();
    const viewLabels: Record<AppView, string> = {
      dashboard: 'Dashboard',
      tasks: 'Tasks',
      settings: 'Settings',
    };
    const crumbs: AfBreadcrumb[] = [base, { label: viewLabels[view] }];
    const project = this.selectedProjectId();
    if (view === 'tasks' && project) {
      const proj = this.dataService.projects().find(p => p.id === project);
      if (proj) {
        crumbs.push({ label: proj.name });
      }
    }
    return crumbs;
  });

  readonly projects = computed(() => this.dataService.projects());

  navigateTo(view: AppView): void {
    this.currentView.set(view);
    if (view !== 'tasks') {
      this.selectedProjectId.set(null);
    }
  }

  selectProject(projectId: string | null): void {
    this.selectedProjectId.set(projectId);
    this.currentView.set('tasks');
  }

  openCreateTaskModal(): void {
    this.isCreateTaskModalOpen.set(true);
  }

  closeCreateTaskModal(): void {
    this.isCreateTaskModalOpen.set(false);
  }
}
