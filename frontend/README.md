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
│   ├── projects/
│   │   └── page.tsx             # Project management
│   ├── tasks/
│   │   └── page.tsx             # Task management
│   ├── users/
│   │   └── page.tsx             # User management
│   ├── layout.tsx               # Root layout with providers
│   └── page.tsx                 # Landing page
├── components/                   # Reusable UI components
│   ├── features/
│   │   ├── tasks/
│   │   │   └── TaskItem.tsx
│   │   └── users/
│   │       ├── UserList.tsx
│   │       ├── UserProfile.tsx
│   │       └── UserSelector.tsx
│   ├── forms/
│   │   ├── AssignTaskModal.tsx
│   │   ├── CreateProjectModal.tsx
│   │   ├── CreateTaskModal.tsx
│   │   ├── EditProjectModal.tsx
│   │   └── EditTaskModal.tsx
│   └── layout/
│       └── Header.tsx
├── contexts/
│   └── UserContext.tsx           # Global user state
├── lib/
│   ├── hooks/
│   │   ├── useTasks.ts          # Task management hook
│   │   └── useUsers.ts          # User management hook
│   ├── services/                # API service layer (split by domain)
│   │   ├── api.ts               # Barrel re-exports
│   │   ├── auth.ts
│   │   ├── config.ts
│   │   ├── project.ts
│   │   ├── subtask.ts
│   │   ├── task.ts
│   │   └── user.ts
│   ├── types/                   # TypeScript type definitions
│   │   ├── project.ts
│   │   ├── subtask.ts
│   │   ├── task.ts
│   │   └── user.ts
│   └── utils/
│       ├── auth.ts
│       ├── formatDate.ts
│       ├── inactivityTracker.ts
│       └── storage.ts
└── app/globals.css              # Global styles
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

3. **Open your browser:**
Navigate to [http://localhost:3001](http://localhost:3001) to see the application.

## 📱 Pages & Routes

- **`/`** - Landing page
- **`/login`** - User authentication
- **`/login/reset-password`** - Password reset
- **`/home`** - Dashboard/home page
- **`/tasks`** - Task management interface
- **`/projects`** - Project management interface
- **`/users`** - User management interface

## 🔧 Development

### **Key Components**

- **`TaskItem`**: Displays individual tasks with status updates and actions
- **`CreateTaskModal`**: Modal for creating new tasks
- **`Header`**: Navigation with user context and logout
- **`UserContext`**: Global state management for authentication

### **Custom Hooks**

- **`useTasks`**: Complete task management (CRUD operations, status updates)
- **`useUsers`**: User management and team/department queries

### **API Integration**

All backend endpoints are integrated with proper TypeScript typing:
- Task CRUD operations
- User management
- Authentication flows
- Role-based data fetching

## 🎨 Styling

The application uses **Tailwind CSS** for styling with:
- Clean, minimal design
- Responsive layout
- Status-based color coding
- Hover effects and transitions
- Role-based UI elements

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: UI elements hidden based on user roles
- **Session Timeout**: Automatic logout on inactivity
- **Input Validation**: Client-side validation for all forms
- **Error Handling**: Comprehensive error handling with user feedback

## 📦 Build & Deployment

### **Build for Production:**
```bash
npm run build
```

### **Start Production Server:**
```bash
npm start
```

### **Deploy on Vercel:**
The easiest way to deploy is using [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

## 🤝 Contributing

This is a project for IS212-G8T4. For development:

1. Follow TypeScript best practices
2. Use proper error handling
3. Maintain role-based access patterns
4. Test all CRUD operations
5. Ensure responsive design

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)
