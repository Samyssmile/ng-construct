import { Injectable, signal, computed } from '@angular/core';
import { Task, Project, TeamMember } from '../data/models';
import { TASKS, PROJECTS, TEAM_MEMBERS } from '../data/mock-data';

/**
 * Central data service for the Construct PM demo application.
 * Manages tasks, projects and team members using Angular signals.
 */
@Injectable({ providedIn: 'root' })
export class PmDataService {
  private readonly tasksSignal = signal<Task[]>(TASKS);
  private readonly projectsSignal = signal<Project[]>(PROJECTS);
  private readonly teamMembersSignal = signal<TeamMember[]>(TEAM_MEMBERS);

  readonly tasks = this.tasksSignal.asReadonly();
  readonly projects = this.projectsSignal.asReadonly();
  readonly teamMembers = this.teamMembersSignal.asReadonly();

  readonly totalTasks = computed(() => this.tasksSignal().length);
  readonly completedTasks = computed(() => this.tasksSignal().filter(t => t.status === 'DONE').length);
  readonly inProgressTasks = computed(() => this.tasksSignal().filter(t => t.status === 'IN_PROGRESS').length);
  readonly overdueTasks = computed(() => {
    const now = new Date();
    return this.tasksSignal().filter(t => t.dueDate && t.dueDate < now && t.status !== 'DONE').length;
  });

  /** Adds a new task and updates the related project's task count. */
  addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasksSignal.update(tasks => [...tasks, newTask]);
    this.projectsSignal.update(projects =>
      projects.map(p =>
        p.id === newTask.projectId ? { ...p, taskCount: p.taskCount + 1 } : p
      )
    );
    return newTask;
  }

  /** Deletes a task by id and updates the related project counts. */
  deleteTask(taskId: string): void {
    const task = this.tasksSignal().find(t => t.id === taskId);
    if (!task) return;

    this.tasksSignal.update(tasks => tasks.filter(t => t.id !== taskId));
    this.projectsSignal.update(projects =>
      projects.map(p => {
        if (p.id !== task.projectId) return p;
        return {
          ...p,
          taskCount: p.taskCount - 1,
          completedCount: task.status === 'DONE' ? p.completedCount - 1 : p.completedCount,
        };
      })
    );
  }

  /** Restores a previously deleted task. */
  restoreTask(task: Task): void {
    this.tasksSignal.update(tasks => [...tasks, task]);
    this.projectsSignal.update(projects =>
      projects.map(p => {
        if (p.id !== task.projectId) return p;
        return {
          ...p,
          taskCount: p.taskCount + 1,
          completedCount: task.status === 'DONE' ? p.completedCount + 1 : p.completedCount,
        };
      })
    );
  }

  /** Returns a team member by id. */
  getMember(id: string): TeamMember | undefined {
    return this.teamMembersSignal().find(m => m.id === id);
  }

  /** Returns tasks filtered by project id. */
  getTasksByProject(projectId: string): Task[] {
    return this.tasksSignal().filter(t => t.projectId === projectId);
  }
}
