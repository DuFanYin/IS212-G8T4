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
│   │       └── page.tsx         # Password reset
│   ├── orgnisation/
│   │   └── page.tsx             # Organization management
│   ├── projects-tasks/          # Combined projects and tasks interface
│   │   ├── page.tsx             # Main projects-tasks page
│   │   ├── project/
│   │   │   └── [id]/
│   │   │       └── page.tsx     # Individual project view
│   │   └── task/
│   │       └── [id]/
│   │           └── page.tsx     # Individual task view
│   ├── users/
│   │   └── page.tsx             # User management
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Landing page
│   ├── favicon.ico              # App favicon
│   └── globals.css              # Global styles
├── components/                   # Reusable UI components
│   ├── features/
│   │   ├── projects/
│   │   │   └── ProjectItem.tsx  # Project display component
│   │   ├── tasks/
│   │   │   ├── TaskItem.tsx     # Task display component
│   │   │   └── SubtaskList.tsx  # Subtask list component
│   │   ├── users/
│   │   │   ├── UserList.tsx     # User list component
│   │   │   ├── UserProfile.tsx  # User profile component
│   │   │   └── UserSelector.tsx # User selection component
│   │   └── timeline/            # Timeline-related components (empty)
│   ├── forms/
│   │   ├── AssignTaskModal.tsx  # Task assignment modal
│   │   ├── CreateProjectModal.tsx # Project creation modal
│   │   ├── CreateTaskModal.tsx  # Task creation modal
│   │   ├── EditProjectModal.tsx # Project editing modal
│   │   └── EditTaskModal.tsx    # Task editing modal
│   ├── layout/
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
│   │   ├── useTasks.ts          # Task management hook
│   │   ├── useUsers.ts          # User management hook
│   │   └── useTimeline.ts       # Timeline management hook
│   ├── services/                # API service layer (split by domain)
│   ├── types/                   # TypeScript type definitions
│   └── utils/
```

## 🚀 Features

### **Authentication & Authorization**
- **Secure Login**: JWT-based authentication with role-based access
- **Password Reset**: Email-based password recovery system
- **Session Management**: Automatic session timeout and inactivity tracking
- **Role-Based Access**: Staff, Manager, Director, HR, Senior Management roles

### **Task Management**
- **Task Creation**: Create tasks with title, description, due date, and assignments
- **Status Tracking**: Unassigned → Ongoing → Under Review → Completed workflow
- **Role-Based Visibility**: 
  - Staff: See own tasks and team tasks
  - Managers: See team tasks and can assign to staff
  - Directors: See department tasks
  - HR/SM: See all tasks
- **Task Assignment**: Managers can assign tasks to lower-level roles
- **Task Archiving**: Soft delete functionality for audit trails

### **User Management**
- **Profile Management**: View and update user profiles
- **Team Management**: View team members (role-based visibility)
- **Department Management**: View department members (Director+ only)

### **Project Organization**
- **Project Creation**: Create projects with collaborators
- **Task Grouping**: Organize tasks within projects
- **Collaboration**: Invite team members to projects

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + Custom Hooks
- **API Integration**: Fetch API with typed responses
- **Authentication**: JWT tokens with automatic refresh

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
