# Current Architecture State

## Overview
The backend has been successfully refactored into a clean, domain-driven architecture with only the methods required by the project requirements.

## Current Architecture Structure

```
src/
├── domain/                    # Pure business logic classes
│   ├── User.js
│   ├── Task.js
│   ├── Project.js
│   ├── Subtask.js
│   └── ActivityLog.js
├── repositories/              # Data access layer
│   ├── UserRepository.js
│   ├── TaskRepository.js
│   ├── ProjectRepository.js
│   ├── SubtaskRepository.js
│   ├── ActivityLogRepository.js
│   ├── DepartmentRepository.js
│   └── TeamRepository.js
├── services/                 # Business operations layer
│   ├── userService.js
│   ├── projectService.js
│   ├── taskService.js
│   ├── subtaskService.js
│   ├── activityLogService.js
│   ├── authService.js
│   ├── organizationService.js
│   └── emailService.js
├── controllers/              # HTTP request handling
│   ├── authController.js
│   ├── userController.js
│   ├── projectController.js
│   ├── taskController.js
│   ├── subtaskController.js
│   ├── activityLogController.js
│   └── organizationController.js
├── middleware/               # Request processing middleware
│   ├── authMiddleware.js
│   └── attachmentMiddleware.js
├── routes/                   # API route definitions
│   ├── authRoutes.js
│   ├── userRoutes.js         # User management routes
│   ├── projectRoutes.js
│   ├── taskRoutes.js
│   ├── subtaskRoutes.js
│   ├── activityLogRoutes.js
│   └── organizationRoutes.js
├── scripts/                  # Utility scripts
│   └── generateSecret.js
├── app.js                    # Express application setup
├── server.js                 # Server startup and configuration
└── db/
    ├── connect.js            # Database connection
    ├── schema.md             # Database schema documentation
    ├── seedData.js           # Database seeding script
    ├── seed/                 # Database seeding infrastructure
    │   ├── config.js
    │   ├── index.js
    │   ├── seeders/          # Individual seeder files
    │   └── utils/            # Seeding utilities
    └── models/               # Clean schema definitions only
        ├── User.js
        ├── Task.js
        ├── Project.js
        ├── Team.js
        ├── Subtask.js
        ├── Comment.js
        ├── ActivityLog.js
        ├── Department.js
        └── index.js
```

## Current API Routes

### **User Routes** (`src/routes/userRoutes.js`)

- `GET    /api/users/profile`                       - Get current user profile
- `GET    /api/users/team-members`                  - Get team members (role-based visibility)
- `GET    /api/users/department-members/:departmentId?` - Get department members (Director+ only)
- `POST   /api/users/invite`                         - Send bulk invitations (HR only)

### **Auth Routes** (`src/routes/authRoutes.js`)

- `POST   /api/auth/login`                          - User login
- `POST   /api/auth/register`                       - User registration with invitation token
- `POST   /api/auth/request-reset`                  - Request password reset (sends email)
- `POST   /api/auth/reset-password`                 - Reset password

### **Project Routes** (`src/routes/projectRoutes.js`)

- `POST   /api/projects/`                           - Create new project
- `GET    /api/projects/`                           - Get active projects
- `GET    /api/projects/departments/:departmentId`  - Get projects by department
- `GET    /api/projects/:projectId/progress`        - Get project progress (manager/owner only)
- `PUT    /api/projects/:projectId/archive`         - Archive/unarchive project
- `PUT    /api/projects/:projectId`                 - Update project
- `PUT    /api/projects/:projectId/collaborators`   - Add collaborator
- `DELETE /api/projects/:projectId/collaborators`   - Remove collaborator
- `POST   /api/projects/:projectId/assign-role`     - Assign role to collaborator (owner only)

### **Task Routes** (`src/routes/taskRoutes.js`)

- `POST   /api/tasks/`                              - Create new task
- `GET    /api/tasks/`                              - Get user's tasks (role-based visibility)
- `GET    /api/tasks/project/:projectId`            - Get tasks by project
- `GET    /api/tasks/team/:teamId`                  - Get tasks by team (manager of team, director+, HR/SM)
- `GET    /api/tasks/department/:departmentId`      - Get tasks by department (director+, HR/SM)
- `GET    /api/tasks/unassigned`                    - Get all unassigned tasks
- `GET    /api/tasks/:id`                           - Get task by ID (with visibility check)
- `PUT    /api/tasks/:id`                           - Update task
- `PATCH  /api/tasks/:id/assign`                    - Assign task to user
- `PATCH  /api/tasks/:id/status`                    - Update task status
- `PATCH  /api/tasks/:id/projects`                  - Set task projects
- `POST   /api/tasks/:id/attachments`               - Add attachment to task
- `DELETE /api/tasks/:id/attachments/:attachmentId` - Remove attachment from task
- `DELETE /api/tasks/:id`                           - Archive (soft delete) task

### **Subtask Routes** (`src/routes/subtaskRoutes.js`)

- `GET    /api/tasks/:parentTaskId/subtasks`        - List subtasks for a parent task
- `POST   /api/tasks/:parentTaskId/subtasks`        - Create subtask under a parent task
- `GET    /api/tasks/subtasks/:id`                  - Get subtask by ID
- `PUT    /api/tasks/subtasks/:id`                  - Update subtask
- `PATCH  /api/tasks/subtasks/:id/status`           - Update subtask status
- `DELETE /api/tasks/subtasks/:id`                  - Archive (soft delete) subtask

### **Activity Log Routes** (`src/routes/activityLogRoutes.js`)

- `GET    /api/logs/`                               - Get activity logs (with optional filters)

### **Organization Routes** (`src/routes/organizationRoutes.js`)

- `GET    /api/organization/departments`            - Get all departments (SM only)
- `GET    /api/organization/departments/:departmentId/teams` - Get teams by department (Director+)
- `GET    /api/organization/teams`                  - Get all teams (SM only)





## Current Repository Layer (Data Access)

### **UserRepository** (`src/repositories/UserRepository.js`)
**Methods:**
- Basic CRUD: `findById()`, `findPublicById()`, `findByEmail()`, `create()`, `updateById()`
- Auth operations: `updatePasswordHash()`, `setResetToken()`, `clearResetToken()`, `findByResetToken()`
- Department/Team queries: `findUsersByDepartment()`, `findUsersByTeam()`
- Global queries: `findAll()`

### **TaskRepository** (`src/repositories/TaskRepository.js`)
**Methods:**
- Basic CRUD: `findById()`, `findActiveTasks()`, `create()`, `updateById()`
- Assignment operations: `assignTask()`, `updateStatus()`, `addCollaborator()`
- Query methods: `findTasksByAssignee()`, `findTasksByCreator()`, `findTasksByProject()`, `findTasksByCollaborator()`, `findTasksByTeam()`, `findTasksByDepartment()`, `findUnassignedTasks()`
- Multi-project support: `setProjects()`, `countByStatusForProject()`
- Soft delete: `softDelete()`

### **ProjectRepository** (`src/repositories/ProjectRepository.js`)
**Methods:**
- Basic CRUD: `findById()`, `findActiveProjects()`, `findAllProjects()`, `create()`, `updateById()`
- Collaboration: `addCollaborators()`, `removeCollaborators()`, `assignRole()`
- Query methods: `findProjectsByOwner()`, `findProjectsByDepartment()`, `findProjectsByCollaborator()`
- Task tracking: `setHasTasks()`

### **SubtaskRepository** (`src/repositories/SubtaskRepository.js`)
**Methods:**
- Basic CRUD: `findById()`, `create()`, `updateById()`
- Query methods: `findByParentTask()`
- Status operations: `updateStatus()`
- Soft delete: `softDelete()`

### **ActivityLogRepository** (`src/repositories/ActivityLogRepository.js`)
**Methods:**
- Basic CRUD: `findById()`, `create()`, `updateById()`
- Query methods: `findByUser()`, `findByResource()`, `findAll()`

### **DepartmentRepository** (`src/repositories/DepartmentRepository.js`)
**Methods:**
- Basic CRUD: `findById()`, `findAll()`, `create()`, `updateById()`, `deleteById()`
- Query methods: `findByDirector()`

### **TeamRepository** (`src/repositories/TeamRepository.js`)
**Methods:**
- Basic CRUD: `findById()`, `findAll()`, `create()`, `updateById()`, `deleteById()`
- Query methods: `findByDepartment()`, `findByManager()`

## Current Service Layer (Business Operations)

### **UserService** (`src/services/userService.js`)
**Methods:**
- Basic operations: `getUserById()`, `getUserByEmail()`, `createUser()`, `updateUser()`
- Auth operations: `updatePassword()`, `setResetToken()`, `clearResetToken()`, `getUserByResetToken()`
- Department/Team queries: `getUsersByDepartment()`, `getUsersByTeam()`
- Global queries: `getAllUsers()`

### **ProjectService** (`src/services/projectService.js`)
**Methods:**
- Basic operations: `createProject()`, `getActiveProjects()`, `getAllProjects()`, `getProjectById()`, `updateProject()`
- Collaboration: `addCollaborator()`, `removeCollaborator()`, `assignRoleToCollaborator()`, `validateCollaborators()`, `validateDepartmentMembership()`
- Visibility: `isVisibleToUser()`
- Queries: `getProjectsByOwner()`, `getProjectsByDepartment()`, `getVisibleProjectsForUser()`
- Internal: `getProjectDomainById()` - Fetches domain Project instance for permission checks


### **TaskService** (`src/services/taskService.js`)
**Methods:**
- Core operations: `createTask()`, `updateTask()`, `assignTask()`, `updateTaskStatus()`, `softDeleteTask()`
- Attachment operations: `addAttachment()`, `removeAttachment()`
- Recurring tasks: Automatic task recreation when recurring tasks are completed
- Visibility: `isVisibleToUser()`
- Queries: `getUserTasks()`, `getTasksByAssignee()`, `getTasksByCreator()`, `getTasksByProject()`, `getTasksByTeam()`, `getTasksByDepartment()`, `getTasksByCollaborator()`, `getUnassignedTasks()`, `getById()`
- Utilities: `mapPopulatedTaskDocToDTO()`, `buildEnrichedTaskDTO()` - Handle data transformation and name resolution


### **SubtaskService** (`src/services/subtaskService.js`)
**Methods:**
- Core operations: `createSubtask()`, `updateSubtask()`, `updateSubtaskStatus()`, `softDeleteSubtask()`
- Queries: `getSubtaskById()`, `getSubtasksByParentTask()`


### **ActivityLogService** (`src/services/activityLogService.js`)
**Methods:**
- Logging: `logActivity()`
- Queries: `getUserActivityLogs()`, `getResourceActivityLogs()`, `getAllActivityLogs()`

### **AuthService** (`src/services/authService.js`)
**Methods:**
- Token generation: `generateToken()` - Generates JWT tokens for user authentication

### **OrganizationService** (`src/services/organizationService.js`)
**Methods:**
- Department operations: `getAllDepartments()`, `getDepartmentById()`
- Team operations: `getAllTeams()`, `getTeamsByDepartment()`, `getTeamById()`
- Statistics: Aggregates team and user counts for departments and teams

### **EmailService** (`src/services/emailService.js`)
**Purpose:** Email communication service using Gmail SMTP
**Methods:**
- `sendPasswordResetEmail(email, resetToken)` - Sends password reset email with reset link
- `sendInvitationEmail(email, invitationToken, role)` - Sends invitation email with registration link
**Configuration:** Uses Gmail SMTP with credentials from environment variables



## Current Middleware Layer

### **AuthMiddleware** (`src/middleware/authMiddleware.js`)
**Purpose:** JWT token validation and user authentication
**Methods:**
- `authenticate()` - Validates JWT tokens and attaches user info to request
- Role-based access control for protected routes

## Project Collaborator Role System

### **Role Assignment Feature**
The project collaborator system supports per-project role assignment with backward compatibility:

**Schema Evolution:**
- **Legacy format:** `collaborators: [ObjectId]` - Simple array of user IDs
- **New format:** `collaborators: [{user: ObjectId, role: String, assignedBy: ObjectId, assignedAt: Date}]` - Detailed subdocuments

**Supported Roles:**
- `viewer` - Read-only access to project
- `editor` - Can modify project details and tasks

**Backward Compatibility:**
- Existing projects with `ObjectId[]` collaborators continue to work
- First role assignment automatically converts legacy format to new subdocument format
- All repository methods handle both formats transparently

**Authorization:**
- Only project owners can assign/change collaborator roles
- Role assignment is logged via ActivityLogService
- Domain layer methods (`isCollaborator()`, `addOwnerToCollaborators()`) work with both formats

## File Storage System

### **Storage Structure**
```
backend/src/storage/
├── <taskId>/
│   ├── <timestamp>-<random>.pdf
│   ├── <timestamp>-<random>.docx
│   └── <timestamp>-<random>.xlsx
└── ...
```

### **Attachment Model**
```javascript
{
  _id: ObjectId,
  filename: String,        // Original filename
  path: String,           // Relative path from project root
  uploadedBy: String,     // User ID who uploaded
  uploadedAt: Date        // Upload timestamp
}
```

### **Attachment Middleware** (`src/middleware/attachmentMiddleware.js`)
**Features:**
- Multer-based file upload with disk storage
- File type validation (PDF, DOCX, XLSX only)
- File size limits (5MB maximum)
- Dynamic folder creation per task ID
- Unique filename generation with timestamps

## Current Domain Classes (Pure Business Logic)

### **User Domain** (`src/domain/User.js`)
**Methods:**
- Role checks: `isManager()`, `isStaff()`, `isHR()`, `isSeniorManagement()`, `isDirector()`
- Permission checks: `canAssignTasks()`, `canSeeAllTasks()`, `canSeeDepartmentTasks()`, `canSeeTeamTasks()`
- Department access: `canAccessDepartment()`
- DTOs: `toProfileDTO()`, `toSafeDTO()`

### **Task Domain** (`src/domain/Task.js`)
**Methods:**
- Status checks: `isOverdue()`, `isCompleted()`, `isUnassigned()`, `isOngoing()`, `isUnderReview()`
- Permission checks: `canBeCompletedBy()`, `canBeAssignedBy()`, `canBeEditedBy()`
- Collaboration: `isCollaborator()`
- Business logic: `updateStatus()`, `assignTo()`, `addCollaborator()`
- Attachment operations: `addAttachment()`, `removeAttachment()`, `hasAttachments()`
- Recurring tasks: `recurringInterval` property for automatic task recreation
- Utilities: `hasAttachments()`
- DTOs: `toDTO()`

### **Project Domain** (`src/domain/Project.js`)
**Methods:**
- Access checks: `isOwner()`, `isCollaborator()`, `canBeAccessedBy()`, `canBeModifiedBy()`
- Business logic: `addCollaborator()`, `setHasTasks()`, `addOwnerToCollaborators()`
- Utilities: `isOverdue()`, `hasTasks()`
- DTOs: `toDTO()` (includes `createdAt`, `updatedAt` timestamps)
- **Collaborator roles:** Supports both legacy `ObjectId[]` and new `{user, role, assignedBy, assignedAt}` subdocument format

### **Subtask Domain** (`src/domain/Subtask.js`)
**Methods:**
- Status checks: `isCompleted()`, `isOngoing()`, `isUnderReview()`, `isUnassigned()`, `isOverdue()`
- Permission checks: `canBeCompletedBy()`, `canBeEditedBy()`, `isCollaborator()`
- Business logic: `updateStatus()`, `assignTo()`, `addCollaborator()`
- DTOs: `toDTO()`

### **ActivityLog Domain** (`src/domain/ActivityLog.js`)
**Methods:**
- Time utilities: `isRecent()`, `isToday()`, `isThisWeek()`
- DTOs: `toDTO()`, `toSafeDTO()`