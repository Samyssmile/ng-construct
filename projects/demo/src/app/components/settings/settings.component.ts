import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AfTabsComponent, AfTabPanelComponent,
  AfCardComponent,
  AfInputComponent,
  AfSelectComponent, AfSelectOption,
  AfSwitchComponent,
  AfCheckboxComponent,
  AfToggleGroupComponent, AfToggleItem,
  AfButtonComponent,
  AfAvatarComponent,
  AfToastService,
} from '@neuravision/ng-construct';
import { PmDataService } from '../../services/pm-data.service';

@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    AfTabsComponent,
    AfTabPanelComponent,
    AfCardComponent,
    AfInputComponent,
    AfSelectComponent,
    AfSwitchComponent,
    AfCheckboxComponent,
    AfToggleGroupComponent,
    AfButtonComponent,
    AfAvatarComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  private readonly toastService = inject(AfToastService);
  private readonly dataService = inject(PmDataService);

  readonly teamMembers = this.dataService.teamMembers;

  activeTab = 'profile';

  // Profile
  readonly profileName = signal('Julia Chen');
  readonly profileEmail = signal('julia.chen@construct.dev');
  readonly timezone = signal('utc');

  readonly timezoneOptions: AfSelectOption[] = [
    { value: 'utc', label: 'UTC (GMT+0)' },
    { value: 'est', label: 'Eastern (GMT-5)' },
    { value: 'pst', label: 'Pacific (GMT-8)' },
    { value: 'cet', label: 'Central European (GMT+1)' },
    { value: 'jst', label: 'Japan (GMT+9)' },
  ];

  // Notifications
  readonly emailNotifications = signal(true);
  readonly pushNotifications = signal(false);
  readonly notifyOnAssignment = signal(true);
  readonly notifyOnComments = signal(true);
  readonly notifyOnStatusChange = signal(false);

  // Display
  readonly compactMode = signal(false);
  readonly showSidebar = signal(true);
  readonly defaultView = signal('dashboard');
  readonly tasksPerPage = signal('10');

  readonly viewModeItems: AfToggleItem[] = [
    { label: 'Dashboard', value: 'dashboard' },
    { label: 'Tasks', value: 'tasks' },
  ];

  readonly perPageOptions: AfSelectOption[] = [
    { value: '5', label: '5 per page' },
    { value: '10', label: '10 per page' },
    { value: '25', label: '25 per page' },
    { value: '50', label: '50 per page' },
  ];

  saveProfile(): void {
    this.toastService.success('Profile saved', 'Your profile settings have been updated.');
  }

  saveNotifications(): void {
    this.toastService.success('Notifications saved', 'Your notification preferences have been updated.');
  }

  saveDisplay(): void {
    this.toastService.success('Display saved', 'Your display settings have been updated.');
  }
}
