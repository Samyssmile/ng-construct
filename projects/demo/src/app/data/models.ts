export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskType = 'BUG' | 'FEATURE' | 'IMPROVEMENT';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assigneeId: string;
  projectId: string;
  tags: string[];
  dueDate: Date | null;
  isUrgent: boolean;
  sendNotifications: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  icon: string;
  taskCount: number;
  completedCount: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  initials: string;
}
