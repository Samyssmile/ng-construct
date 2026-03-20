import { Task, Project, TeamMember } from './models';

export const TEAM_MEMBERS: TeamMember[] = [
  { id: 'tm-1', name: 'Julia Chen', role: 'Lead Engineer', initials: 'JC' },
  { id: 'tm-2', name: 'Liam Hart', role: 'Product Designer', initials: 'LH' },
  { id: 'tm-3', name: 'Sofia Rivera', role: 'Frontend Dev', initials: 'SR' },
  { id: 'tm-4', name: 'Marcus Webb', role: 'Backend Dev', initials: 'MW' },
  { id: 'tm-5', name: 'Anika Patel', role: 'QA Engineer', initials: 'AP' },
  { id: 'tm-6', name: 'Daniel Kim', role: 'DevOps', initials: 'DK' },
];

export const PROJECTS: Project[] = [
  { id: 'proj-1', name: 'Alpha', icon: 'rocket_launch', taskCount: 12, completedCount: 7 },
  { id: 'proj-2', name: 'Beta', icon: 'science', taskCount: 8, completedCount: 3 },
  { id: 'proj-3', name: 'Gamma', icon: 'devices', taskCount: 6, completedCount: 5 },
  { id: 'proj-4', name: 'Delta', icon: 'cloud', taskCount: 5, completedCount: 1 },
];

export const TASKS: Task[] = [
  {
    id: 'task-1', title: 'Fix login redirect loop', description: 'Users get stuck in a redirect loop after SSO authentication.',
    status: 'IN_PROGRESS', priority: 'CRITICAL', type: 'BUG', assigneeId: 'tm-1', projectId: 'proj-1',
    tags: ['auth', 'urgent'], dueDate: new Date('2026-03-16'), isUrgent: true, sendNotifications: true,
    createdAt: new Date('2026-03-01'), updatedAt: new Date('2026-03-13'),
  },
  {
    id: 'task-2', title: 'Design onboarding flow', description: 'Create wireframes and prototypes for the new user onboarding experience.',
    status: 'IN_REVIEW', priority: 'HIGH', type: 'FEATURE', assigneeId: 'tm-2', projectId: 'proj-2',
    tags: ['design', 'ux'], dueDate: new Date('2026-03-20'), isUrgent: false, sendNotifications: true,
    createdAt: new Date('2026-02-28'), updatedAt: new Date('2026-03-12'),
  },
  {
    id: 'task-3', title: 'Add dark mode support', description: 'Implement theme switching with CSS custom properties.',
    status: 'TODO', priority: 'MEDIUM', type: 'FEATURE', assigneeId: 'tm-3', projectId: 'proj-1',
    tags: ['frontend', 'theming'], dueDate: new Date('2026-04-01'), isUrgent: false, sendNotifications: false,
    createdAt: new Date('2026-03-05'), updatedAt: new Date('2026-03-05'),
  },
  {
    id: 'task-4', title: 'Optimize database queries', description: 'Profile and optimize slow queries in the reporting module.',
    status: 'IN_PROGRESS', priority: 'HIGH', type: 'IMPROVEMENT', assigneeId: 'tm-4', projectId: 'proj-1',
    tags: ['backend', 'performance'], dueDate: new Date('2026-03-18'), isUrgent: false, sendNotifications: true,
    createdAt: new Date('2026-03-02'), updatedAt: new Date('2026-03-11'),
  },
  {
    id: 'task-5', title: 'Write E2E tests for checkout', description: 'Cover the full checkout flow including edge cases.',
    status: 'TODO', priority: 'MEDIUM', type: 'IMPROVEMENT', assigneeId: 'tm-5', projectId: 'proj-2',
    tags: ['testing', 'qa'], dueDate: new Date('2026-03-25'), isUrgent: false, sendNotifications: false,
    createdAt: new Date('2026-03-06'), updatedAt: new Date('2026-03-06'),
  },
  {
    id: 'task-6', title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated testing and deployment.',
    status: 'DONE', priority: 'HIGH', type: 'IMPROVEMENT', assigneeId: 'tm-6', projectId: 'proj-3',
    tags: ['devops', 'ci'], dueDate: new Date('2026-03-10'), isUrgent: false, sendNotifications: true,
    createdAt: new Date('2026-02-20'), updatedAt: new Date('2026-03-10'),
  },
  {
    id: 'task-7', title: 'Fix broken image uploads', description: 'Images over 5MB fail silently without error feedback.',
    status: 'BLOCKED', priority: 'HIGH', type: 'BUG', assigneeId: 'tm-3', projectId: 'proj-1',
    tags: ['frontend', 'upload'], dueDate: new Date('2026-03-15'), isUrgent: true, sendNotifications: true,
    createdAt: new Date('2026-03-03'), updatedAt: new Date('2026-03-13'),
  },
  {
    id: 'task-8', title: 'Implement search autocomplete', description: 'Add typeahead suggestions to the global search bar.',
    status: 'TODO', priority: 'MEDIUM', type: 'FEATURE', assigneeId: 'tm-3', projectId: 'proj-2',
    tags: ['frontend', 'search'], dueDate: new Date('2026-04-05'), isUrgent: false, sendNotifications: false,
    createdAt: new Date('2026-03-07'), updatedAt: new Date('2026-03-07'),
  },
  {
    id: 'task-9', title: 'Migrate to PostgreSQL 16', description: 'Upgrade database and adapt connection pooling settings.',
    status: 'DONE', priority: 'MEDIUM', type: 'IMPROVEMENT', assigneeId: 'tm-4', projectId: 'proj-3',
    tags: ['backend', 'database'], dueDate: new Date('2026-03-08'), isUrgent: false, sendNotifications: true,
    createdAt: new Date('2026-02-15'), updatedAt: new Date('2026-03-08'),
  },
  {
    id: 'task-10', title: 'Add export to CSV', description: 'Allow users to export filtered table data to CSV format.',
    status: 'IN_PROGRESS', priority: 'LOW', type: 'FEATURE', assigneeId: 'tm-3', projectId: 'proj-4',
    tags: ['frontend', 'export'], dueDate: new Date('2026-03-28'), isUrgent: false, sendNotifications: false,
    createdAt: new Date('2026-03-08'), updatedAt: new Date('2026-03-12'),
  },
  {
    id: 'task-11', title: 'Fix timezone handling in reports', description: 'Dates in reports show server timezone instead of user locale.',
    status: 'TODO', priority: 'HIGH', type: 'BUG', assigneeId: 'tm-4', projectId: 'proj-1',
    tags: ['backend', 'bug'], dueDate: new Date('2026-03-19'), isUrgent: false, sendNotifications: true,
    createdAt: new Date('2026-03-09'), updatedAt: new Date('2026-03-09'),
  },
  {
    id: 'task-12', title: 'Create API documentation', description: 'Document all REST endpoints with OpenAPI/Swagger.',
    status: 'IN_REVIEW', priority: 'MEDIUM', type: 'IMPROVEMENT', assigneeId: 'tm-4', projectId: 'proj-3',
    tags: ['docs', 'api'], dueDate: new Date('2026-03-22'), isUrgent: false, sendNotifications: false,
    createdAt: new Date('2026-03-04'), updatedAt: new Date('2026-03-13'),
  },
  {
    id: 'task-13', title: 'Implement role-based access control', description: 'Add permission guards for admin, editor, and viewer roles.',
    status: 'TODO', priority: 'CRITICAL', type: 'FEATURE', assigneeId: 'tm-1', projectId: 'proj-4',
    tags: ['auth', 'security'], dueDate: new Date('2026-03-24'), isUrgent: true, sendNotifications: true,
    createdAt: new Date('2026-03-10'), updatedAt: new Date('2026-03-10'),
  },
  {
    id: 'task-14', title: 'Refactor notification service', description: 'Consolidate email, push and in-app notification logic.',
    status: 'IN_PROGRESS', priority: 'MEDIUM', type: 'IMPROVEMENT', assigneeId: 'tm-1', projectId: 'proj-2',
    tags: ['backend', 'refactor'], dueDate: new Date('2026-03-26'), isUrgent: false, sendNotifications: true,
    createdAt: new Date('2026-03-06'), updatedAt: new Date('2026-03-13'),
  },
  {
    id: 'task-15', title: 'Add keyboard shortcuts', description: 'Support common shortcuts: Cmd+K for search, Cmd+N for new task.',
    status: 'TODO', priority: 'LOW', type: 'FEATURE', assigneeId: 'tm-3', projectId: 'proj-1',
    tags: ['frontend', 'ux'], dueDate: null, isUrgent: false, sendNotifications: false,
    createdAt: new Date('2026-03-11'), updatedAt: new Date('2026-03-11'),
  },
  {
    id: 'task-16', title: 'Fix memory leak in WebSocket handler', description: 'Event listeners not cleaned up on component destroy.',
    status: 'DONE', priority: 'CRITICAL', type: 'BUG', assigneeId: 'tm-1', projectId: 'proj-1',
    tags: ['frontend', 'performance'], dueDate: new Date('2026-03-07'), isUrgent: true, sendNotifications: true,
    createdAt: new Date('2026-02-25'), updatedAt: new Date('2026-03-07'),
  },
  {
    id: 'task-17', title: 'Set up error monitoring', description: 'Integrate Sentry for frontend and backend error tracking.',
    status: 'DONE', priority: 'HIGH', type: 'IMPROVEMENT', assigneeId: 'tm-6', projectId: 'proj-3',
    tags: ['devops', 'monitoring'], dueDate: new Date('2026-03-05'), isUrgent: false, sendNotifications: true,
    createdAt: new Date('2026-02-18'), updatedAt: new Date('2026-03-05'),
  },
  {
    id: 'task-18', title: 'Implement drag-and-drop board', description: 'Kanban-style board view for task management.',
    status: 'TODO', priority: 'MEDIUM', type: 'FEATURE', assigneeId: 'tm-3', projectId: 'proj-4',
    tags: ['frontend', 'ux'], dueDate: new Date('2026-04-10'), isUrgent: false, sendNotifications: false,
    createdAt: new Date('2026-03-12'), updatedAt: new Date('2026-03-12'),
  },
  {
    id: 'task-19', title: 'Add audit logging', description: 'Track all user actions for compliance and debugging.',
    status: 'IN_PROGRESS', priority: 'HIGH', type: 'FEATURE', assigneeId: 'tm-4', projectId: 'proj-4',
    tags: ['backend', 'security'], dueDate: new Date('2026-03-21'), isUrgent: false, sendNotifications: true,
    createdAt: new Date('2026-03-07'), updatedAt: new Date('2026-03-13'),
  },
  {
    id: 'task-20', title: 'Fix pagination off-by-one', description: 'Last page shows one extra empty row in some edge cases.',
    status: 'DONE', priority: 'LOW', type: 'BUG', assigneeId: 'tm-5', projectId: 'proj-2',
    tags: ['frontend', 'bug'], dueDate: new Date('2026-03-09'), isUrgent: false, sendNotifications: false,
    createdAt: new Date('2026-03-04'), updatedAt: new Date('2026-03-09'),
  },
  {
    id: 'task-21', title: 'Implement file preview', description: 'Support preview for PDF, images and markdown files.',
    status: 'TODO', priority: 'MEDIUM', type: 'FEATURE', assigneeId: 'tm-3', projectId: 'proj-2',
    tags: ['frontend', 'files'], dueDate: new Date('2026-04-08'), isUrgent: false, sendNotifications: false,
    createdAt: new Date('2026-03-13'), updatedAt: new Date('2026-03-13'),
  },
  {
    id: 'task-22', title: 'Upgrade Angular to v20', description: 'Update framework and fix breaking changes in standalone components.',
    status: 'DONE', priority: 'HIGH', type: 'IMPROVEMENT', assigneeId: 'tm-1', projectId: 'proj-3',
    tags: ['frontend', 'upgrade'], dueDate: new Date('2026-03-06'), isUrgent: false, sendNotifications: true,
    createdAt: new Date('2026-02-22'), updatedAt: new Date('2026-03-06'),
  },
  {
    id: 'task-23', title: 'Add rate limiting to API', description: 'Protect endpoints against abuse with token bucket algorithm.',
    status: 'IN_REVIEW', priority: 'HIGH', type: 'FEATURE', assigneeId: 'tm-4', projectId: 'proj-4',
    tags: ['backend', 'security'], dueDate: new Date('2026-03-17'), isUrgent: false, sendNotifications: true,
    createdAt: new Date('2026-03-03'), updatedAt: new Date('2026-03-14'),
  },
  {
    id: 'task-24', title: 'Fix CSS grid overflow on mobile', description: 'Dashboard cards overflow their container on screens < 375px.',
    status: 'TODO', priority: 'LOW', type: 'BUG', assigneeId: 'tm-2', projectId: 'proj-1',
    tags: ['frontend', 'responsive'], dueDate: new Date('2026-03-30'), isUrgent: false, sendNotifications: false,
    createdAt: new Date('2026-03-13'), updatedAt: new Date('2026-03-13'),
  },
  {
    id: 'task-25', title: 'Implement webhook integrations', description: 'Allow users to configure outgoing webhooks for events.',
    status: 'TODO', priority: 'MEDIUM', type: 'FEATURE', assigneeId: 'tm-6', projectId: 'proj-4',
    tags: ['backend', 'integrations'], dueDate: new Date('2026-04-15'), isUrgent: false, sendNotifications: false,
    createdAt: new Date('2026-03-14'), updatedAt: new Date('2026-03-14'),
  },
];
