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
│   ├── orgnisation/
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

## 🔌 API Integration Status

### **Authentication Services** (`src/lib/services/auth.ts`)
- ✅ `POST /api/auth/login` - User login
- ✅ `POST /api/auth/register` - User registration with invitation token
- ✅ `POST /api/auth/request-reset` - Request password reset (sends email)
- ✅ `POST /api/auth/reset-password` - Reset password
- ✅ `GET /api/users/profile` - Get user profile (via auth service)

### **User Services** (`src/lib/services/user.ts`)
- ✅ `GET /api/users/team-members` - Get team members
- ✅ `GET /api/users/department-members/:departmentId?` - Get department members
- ✅ `POST /api/users/invite` - Send bulk invitations (HR only)

### **Project Services** (`src/lib/services/project.ts`)
- ✅ `GET /api/projects/` - Get all projects
- ✅ `GET /api/projects/departments/:departmentId` - Get projects by department
- ✅ `POST /api/projects/` - Create new project
- ✅ `PUT /api/projects/:projectId` - Update project
- ✅ `PUT /api/projects/:projectId/archive` - Archive/unarchive project
- ✅ `PUT /api/projects/:projectId/collaborators` - Add collaborator
- ✅ `DELETE /api/projects/:projectId/collaborators` - Remove collaborator
- ✅ `POST /api/projects/:projectId/assign-role` - Assign role to collaborator
- ✅ `GET /api/projects/:projectId/progress` - Get project progress
- ✅ `GET /api/projects/:projectId/stats` - Get project statistics

### **Task Services** (`src/lib/services/task.ts`)
- ✅ `GET /api/tasks/` - Get user's tasks (with filters: status, sortBy, order)
- ✅ `GET /api/tasks/project/:projectId` - Get tasks by project (with status filter)
- ✅ `GET /api/tasks/team/:teamId` - Get tasks by team
- ✅ `GET /api/tasks/department/:departmentId` - Get tasks by department
- ✅ `GET /api/tasks/unassigned` - Get unassigned tasks
- ✅ `GET /api/tasks/:id` - Get task by ID
- ✅ `POST /api/tasks/` - Create new task
- ✅ `PUT /api/tasks/:id` - Update task
- ✅ `PATCH /api/tasks/:id/assign` - Assign task to user
- ✅ `PATCH /api/tasks/:id/status` - Update task status
- ✅ `PATCH /api/tasks/:id/projects` - Set task projects
- ✅ `POST /api/tasks/:id/attachments` - Add attachment
- ✅ `DELETE /api/tasks/:id/attachments/:attachmentId` - Remove attachment
- ✅ `DELETE /api/tasks/:id` - Archive task

### **Subtask Services** (`src/lib/services/subtask.ts`)
- ✅ `GET /api/tasks/:parentTaskId/subtasks` - List subtasks
- ✅ `POST /api/tasks/:parentTaskId/subtasks` - Create subtask
- ✅ `GET /api/tasks/subtasks/:id` - Get subtask by ID
- ✅ `PUT /api/tasks/subtasks/:id` - Update subtask
- ✅ `PATCH /api/tasks/subtasks/:id/status` - Update subtask status
- ✅ `DELETE /api/tasks/subtasks/:id` - Archive subtask

### **Organization Services** (`src/lib/services/organization.ts`)
- ✅ `GET /api/organization/departments` - Get all departments
- ✅ `GET /api/organization/departments/:departmentId/teams` - Get teams by department
- ✅ `GET /api/organization/teams` - Get all teams

### **Activity Log Services** (`src/lib/services/activityLog.ts`)
- ✅ `GET /api/logs/` - Get activity logs (with filters)
- ✅ `POST /api/logs/` - Get activity logs with resourceId filter

### **Metrics Services** (`src/lib/services/metrics.ts`)
- ✅ `GET /api/metrics/departments` - Get department-level metrics
- ✅ `GET /api/metrics/teams` - Get all team metrics
- ✅ `GET /api/metrics/teams/:teamId` - Get single team metrics
- ✅ `GET /api/metrics/personal` - Get personal task metrics

### **Notification Services** (`not implemented as separate service`)
- ⚠️ Notifications are created inline in components (home page and Header)
- Created and fetched in `src/app/home/page.tsx` and `src/components/layout/Header.tsx`


### Testing
- **Runner**: Vitest + jsdom
- **Utilities**: Testing Library + jest-dom
- Global test setup: `__tests__/setup.ts` (mocks Next.js router and DOM observers)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm
- Backend API running on `http://localhost:3000`

### Installation

1. **Install dependencies:**
```bash
npm install
# or
yarn install
# or
pnpm install
```

2. **Start the development server:**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

## 📊 API Coverage Summary

**Total Backend Routes**: 42  
**Frontend Implemented**: 42  
**Coverage**: 100% ✅

All backend API endpoints are properly integrated into the frontend with:
- ✅ Type-safe service functions
- ✅ Proper error handling
- ✅ Authentication token management
- ✅ Role-based access control
- ✅ Real-time data updates
- ✅ Role assignment and activity logging features
- ✅ Email-based password reset and bulk invitation system
