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
│   └── organizationService.js
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

### **Auth Routes** (`src/routes/authRoutes.js`)

- `POST   /api/auth/login`                          - User login
- `POST   /api/auth/request-reset`                  - Request password reset
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
- Attachment operations: `addAttachment()`, `removeAttachment()`
- Soft delete: `softDelete()`

### **ProjectRepository** (`src/repositories/ProjectRepository.js`)
**Methods:**
- Basic CRUD: `findById()`, `findActiveProjects()`, `findAllProjects()`, `create()`, `updateById()`
- Collaboration: `addCollaborators()`, `removeCollaborators()`
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
- Collaboration: `addCollaborator()`, `removeCollaborator()`, `validateCollaborators()`, `validateDepartmentMembership()`
- Visibility: `isVisibleToUser()`
- Queries: `getProjectsByOwner()`, `getProjectsByDepartment()`, `getVisibleProjectsForUser()`
- Internal: `getProjectDomainById()` - Fetches domain Project instance for permission checks


### **TaskService** (`src/services/taskService.js`)
**Methods:**
- Core operations: `createTask()`, `updateTask()`, `assignTask()`, `updateTaskStatus()`, `softDeleteTask()`
- Attachment operations: `addAttachment()`, `removeAttachment()`
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



## Current Middleware Layer

### **AuthMiddleware** (`src/middleware/authMiddleware.js`)
**Purpose:** JWT token validation and user authentication
**Methods:**
- `authenticate()` - Validates JWT tokens and attaches user info to request
- Role-based access control for protected routes

### **AttachmentMiddleware** (`src/middleware/attachmentMiddleware.js`)
**Purpose:** File upload handling for task attachments
**Features:**
- Multer-based file upload with disk storage
- File type validation (PDF, DOCX, XLSX only)
- File size limits (5MB maximum)
- Dynamic folder creation per task ID
- Unique filename generation with timestamps

## File Storage System

### **Storage Structure**
```
src/storage/
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
- Utilities: `hasAttachments()`
- DTOs: `toDTO()`

### **Project Domain** (`src/domain/Project.js`)
**Methods:**
- Access checks: `isOwner()`, `isCollaborator()`, `canBeAccessedBy()`, `canBeModifiedBy()`
- Business logic: `addCollaborator()`, `setHasTasks()`, `addOwnerToCollaborators()`
- Utilities: `isOverdue()`, `hasTasks()`
- DTOs: `toDTO()` (includes `createdAt`, `updatedAt` timestamps)

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

##
### Architecture Pattern

1. **Separation of Concerns**
   - **Domain**: Pure business logic, no database dependencies
   - **Repositories**: Data access only, no business logic
   - **Services**: Orchestrate domain + repositories, handle transactions
   - **Models**: Schema definitions only, no behavior

2. **Domain Classes (Pure Business Logic)**
   ```js
   // Example: User domain entity
   const user = new User(userDoc);
   if (user.isManager()) { /* ... */ }
   if (user.canAccessProject(project)) { /* ... */ }
   ```

3. **Repository Pattern (Data Access)**
   ```js
   // Example: UserRepository
   const userRepo = new UserRepository();
   const userDoc = await userRepo.findPublicById(id);
   const user = new User(userDoc);
   ```

4. **Service Layer (Business Operations)**
   ```js
   // Example: UserService
   const userService = new UserService(userRepository);
   const user = await userService.getUserById(id);
   // Returns domain entity, not raw document
   ```

### Key Improvements & Benefits of Layered Architecture

#### 1. **Testability** 🧪
**Benefit**: Domain classes can be unit tested without database dependencies
- **Before**: Testing required database setup, complex mocking of Mongoose models
- **After**: Pure business logic testing with simple object instantiation
- **Example**: Testing `user.isManager()` requires only `new User({role: 'manager'})`
- **Impact**: Faster test execution, easier CI/CD, more reliable test coverage

#### 2. **Maintainability** 🔧
**Benefit**: Business logic centralized in domain classes, not scattered across controllers
- **Before**: Business rules duplicated in controllers, services, and validation layers
- **After**: Single source of truth for business logic in domain entities
- **Example**: Role hierarchy logic exists only in `User` domain class
- **Impact**: Easier to modify business rules, reduced code duplication, clearer codebase

#### 3. **Flexibility** 🔄
**Benefit**: Easy to swap data sources without changing business logic
- **Before**: Tightly coupled to MongoDB/Mongoose throughout the application
- **After**: Repository pattern abstracts data access from business logic
- **Example**: Switching from MongoDB to PostgreSQL only requires new repository implementations
- **Impact**: Technology independence, easier migrations, future-proof architecture

#### 4. **Consistency** 📏
**Benefit**: All entities follow the same architectural patterns
- **Before**: Inconsistent approaches across different features
- **After**: Standardized patterns for all domain entities (User, Task, Project, etc.)
- **Example**: All entities have `toDTO()` methods, permission checks, and business logic methods
- **Impact**: Easier onboarding, predictable code structure, reduced cognitive load

#### 5. **Separation of Concerns** 🎯
**Benefit**: Clear boundaries between different responsibilities
- **Domain Layer**: Pure business logic, no external dependencies
- **Repository Layer**: Data access only, no business rules
- **Service Layer**: Orchestration and transaction management
- **Impact**: Easier debugging, clearer code organization, better team collaboration

#### 6. **Scalability** 📈
**Benefit**: Architecture supports growth and complexity
- **Before**: Monolithic controllers handling everything
- **After**: Modular layers that can be scaled independently
- **Example**: Adding new features follows established patterns
- **Impact**: Easier feature development, better performance optimization, team scalability

#### 7. **Code Reusability** ♻️
**Benefit**: Domain logic can be reused across different contexts
- **Before**: Business logic tied to specific API endpoints
- **After**: Domain methods can be used in APIs, background jobs, CLI tools
- **Example**: `user.canAssignTasks()` works in web UI, mobile app, and admin tools
- **Impact**: Reduced development time, consistent behavior across platforms

#### 8. **Error Handling & Validation** ⚠️
**Benefit**: Centralized validation and error handling
- **Before**: Validation scattered across controllers and middleware
- **After**: Business rules enforced at domain level with clear error messages
- **Example**: Task assignment validation happens in `Task.canBeAssignedBy()`
#### 9. **Developer Experience** 👨‍💻
**Benefit**: Cleaner, more intuitive code for developers
- **Before**: Complex controller logic mixing HTTP concerns with business rules
- **After**: Clear separation makes code self-documenting and easier to understand
- **Example**: `if (user.canAssignTasks() && task.canBeAssignedBy(user))` is self-explanatory
- **Impact**: Faster development, fewer bugs, better code reviews
