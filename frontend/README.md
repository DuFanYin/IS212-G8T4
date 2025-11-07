# IS212-G8T4 Frontend - Task Management System

A modern Next.js frontend application for a comprehensive task management system with role-based access control and real-time task management capabilities.

## 🏗️ Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── home/
│   │   └── page.tsx             # Dashboard/home page
│   ├── login/
│   │   ├── page.tsx             # Login page
│   │   └── reset-password/
│   │       └── page.tsx         # Password reset page (email-based)
│   ├── register/
│   │   └── page.tsx             # Public registration page (invitation-based)
│   ├── organisation/
│   │   └── page.tsx             # Organization management
│   ├── projects-tasks/          # Combined projects and tasks interface
│   │   ├── page.tsx             # Main projects-tasks page
│   │   ├── project/
│   │   │   └── [id]/
│   │   │       └── page.tsx     # Individual project view with role assignment
│   │   └── task/
│   │       └── [id]/
│   │           └── page.tsx     # Individual task view
│   ├── report/
│   │   └── department/
│   │       └── page.tsx        # Department reports
│   ├── users/
│   │   └── page.tsx             # User management (with HR bulk invitations)
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Landing page
│   ├── favicon.ico              # App favicon
│   └── globals.css              # Global styles
├── components/                   # Reusable UI components
│   ├── features/
│   │   ├── ActivityLogList.tsx  # Activity log display
│   │   ├── AssignRoleModal.tsx  # Role assignment modal for projects
│   │   ├── AttachmentList.tsx   # File attachment list
│   │   ├── AttachmentUpload.tsx # File upload component
│   │   ├── ProjectProgress.tsx  # Project progress tracking component
│   │   ├── projects/
│   │   │   └── ProjectItem.tsx  # Project display component
│   │   ├── reports/
│   │   │   ├── productivityIndex.tsx # Productivity metrics
│   │   │   ├── productivityMetric.tsx # Productivity calculations
│   │   │   ├── tasksMetric.tsx   # Task metrics
│   │   │   └── workTable.tsx     # Work table display
│   │   ├── tasks/
│   │   │   ├── TaskItem.tsx      # Task display component
│   │   │   └── SubtaskList.tsx  # Subtask list component
│   │   ├── TaskFilterBar.tsx     # Task filtering bar component
│   │   ├── TaskSortSelect.tsx   # Task sorting selector component
│   │   ├── TaskStatusFilter.tsx  # Task status filter component
│   │   ├── timeline/            # Timeline-related components (empty directory)
│   │   └── users/
│   │       ├── UserList.tsx     # User list component
│   │       ├── UserProfile.tsx  # User profile component
│   │       └── UserSelector.tsx # User selection component
│   ├── forms/
│   │   ├── AssignTaskModal.tsx  # Task assignment modal
│   │   ├── CreateProjectModal.tsx # Project creation modal
│   │   ├── CreateTaskModal.tsx  # Task creation modal
│   │   ├── EditProjectModal.tsx # Project editing modal
│   │   └── EditTaskModal.tsx    # Task editing modal
│   ├── layout/
│   │   ├── Cards.tsx            # Card layout components
│   │   ├── Dropdown.tsx         # Dropdown component
│   │   └── Header.tsx           # App header component
│   └── timeline/
│       ├── Legend.tsx           # Timeline legend component
│       ├── OrgSelectors.tsx     # Organization selectors
│       ├── TimelineGrid.tsx     # Timeline grid component
│       └── TimelineRows.tsx     # Timeline rows component
├── contexts/
│   └── UserContext.tsx          # Global user state management
├── lib/
│   ├── hooks/
│   │   ├── useMetrics.ts        # Metrics fetching hook
│   │   ├── useOrgSelectors.ts   # Organization selector hook
│   │   ├── useTasks.ts          # Task management hook
│   │   ├── useTaskFilters.ts    # Task filtering and sorting hook
│   │   ├── useTimeline.ts       # Timeline management hook
│   │   └── useUsers.ts          # User management hook
│   ├── services/                # API service layer (split by domain)
│   │   ├── activityLog.ts       # Activity log API calls
│   │   ├── api.ts               # Generic API utilities
│   │   ├── auth.ts              # Authentication API calls
│   │   ├── config.ts            # API configuration
│   │   ├── metrics.ts           # Metrics API calls
│   │   ├── organization.ts      # Organization API calls
│   │   ├── project.ts           # Project API calls (with role assignment)
│   │   ├── subtask.ts           # Subtask API calls
│   │   ├── task.ts              # Task API calls
│   │   └── user.ts              # User API calls (with HR user creation)
│   ├── types/                   # TypeScript type definitions
│   │   ├── activityLog.ts       # Activity log types
│   │   ├── project.ts           # Project types (with Collaborator interface)
│   │   ├── subtask.ts           # Subtask types
│   │   ├── task.ts              # Task types
│   │   └── user.ts              # User types
│   └── utils/
│       ├── access.ts            # Access control utilities
│       ├── auth.ts               # Authentication utilities
│       ├── formatDate.ts         # Date formatting utilities
│       ├── inactivityTracker.ts # Session management
│       ├── orgAccess.ts          # Organization access utilities
│       ├── storage.ts            # Local storage utilities
│       ├── taskStatusColors.ts  # Task status and priority color utilities
│       ├── taskSort.ts          # Task sorting and filtering utilities
│       └── timeline.ts          # Timeline utilities
```