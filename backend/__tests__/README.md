# Backend Test Structure

This directory contains focused integration tests that verify core functionality as specified in project requirements.

Integration: 180
Unit: 298

## Structure

```
__tests__/
├── integration/ (180)                   # Integration tests (API endpoints)
│   ├── auth/ (14)
│   │   ├── login.test.js                  #   POST /api/auth/login                         (5)
│   │   ├── request-reset.test.js          #   POST /api/auth/request-reset                 (4)
│   │   └── reset-password.test.js         #   POST /api/auth/reset-password                (5)
│   ├── organization/ (12)
│   │   ├── departments.test.js            #   GET  /api/organization/departments           (3)
│   │   ├── teams.test.js                  #   GET  /api/organization/teams                 (4)
│   │   └── department-teams.test.js       #   GET  /api/organization/departments/:id/teams (5)
│   ├── users/ (14)
│   │   ├── profile.test.js                #   GET  /api/users/profile                      (1)
│   │   ├── team-members.test.js           #   GET  /api/users/team-members                 (3)
│   │   ├── department-members.test.js     #   GET  /api/users/department-members           (3)
│   │   └── userController.integration.test.js     # User controller integration tests         (7)
│   ├── tasks/ (59)
│   │   ├── create.test.js                 #   POST /api/tasks/                             (4)
│   │   ├── list.test.js                   #   GET  /api/tasks/                             (2)
│   │   ├── get-by-id.test.js              #   GET  /api/tasks/:id                          (1)
│   │   ├── assign.test.js                 #   PATCH /api/tasks/:id/assign                  (3)
│   │   ├── status.test.js                 #   PATCH /api/tasks/:id/status                  (2)
│   │   ├── archive.test.js                #   DELETE /api/tasks/:id                        (1)
│   │   ├── update.test.js                 #   PUT  /api/tasks/:id                          (4)
│   │   ├── update-due-date.test.js        #   PUT  /api/tasks/:id                          (3)
│   │   ├── department-tasks.test.js       #   GET  /api/tasks/department/:id               (6)
│   │   ├── project-tasks.test.js          #   GET  /api/tasks/project/:id                  (4)
│   │   ├── team-tasks.test.js             #   GET  /api/tasks/team/:id                     (5)
│   │   ├── unassigned-tasks.test.js       #   GET  /api/tasks/unassigned                   (5)
│   │   ├── priority-tasks.test.js         #   Task priority handling                       (5)
│   │   ├── tasks-grouping.test.js         #   Task grouping across projects/categories     (5)
│   │   ├── attachments.test.js            #   Task attachments API                         (6)
│   │   └── recurring-tasks.test.js        #   Recurring tasks functionality                (3)
│   ├── subtasks/ (11)
│   │   ├── create.test.js                 #   POST /api/tasks/:id/subtasks                 (2)
│   │   ├── list.test.js                   #   GET  /api/tasks/:id/subtasks                 (1)
│   │   ├── get-by-id.test.js              #   GET  /api/tasks/subtasks/:id                 (2)
│   │   ├── update.test.js                 #   PUT  /api/tasks/subtasks/:id                 (2)
│   │   ├── update-status.test.js          #   PATCH /api/tasks/subtasks/:id/status         (2)
│   │   └── delete.test.js                 #   DELETE /api/tasks/subtasks/:id               (2)
│   ├── projects/ (28)
│   │   ├── create.test.js                 #   POST /api/projects                           (4)
│   │   ├── list.test.js                   #   GET  /api/projects                           (2)
│   │   ├── update.test.js                 #   PUT  /api/projects/:projectId                (3)
│   │   ├── permissions.test.js            #   Role checks for update                       (2)
│   │   ├── collaborators.test.js          #   PUT  /api/projects/:projectId/collaborators  (4)
│   │   ├── remove-collaborators.test.js   #   DELETE /api/projects/:projectId/collaborators (7)
│   │   ├── archive.test.js                #   PUT  /api/projects/:projectId/archive        (2)
│   │   └── department-projects.test.js    #   GET  /api/projects/departments/:id           (4)
│   ├── activity_log/ (7)
│   │   ├── list-log.test.js               #   GET  /api/logs                               (2)
│   │   └── task-log.test.js               #   Task lifecycle logging                       (5)
│   ├── metrics/ (19)
│   │   ├── departments.test.js            #   GET  /api/metrics/departments                (4)
│   │   ├── personal.test.js               #   GET  /api/metrics/personal                   (4)
│   │   ├── single-team.test.js            #   GET  /api/metrics/teams/:teamId              (5)
│   │   └── teams.test.js                  #   GET  /api/metrics/teams                      (6)
│   ├── middleware/ (9)
│   │   └── roleMiddleware.integration.test.js      # Role middleware integration tests        (9)
│   ├── notifications/ (7)
│   │   ├── create.test.js                 #   POST /api/notifications                      (3)
│   │   └── get.test.js                    #   GET  /api/notifications                      (4)
├── unit/ (298)                          # Unit tests
│   ├── controllers/ (33)
│   │   ├── authController.test.js             # Authentication controller tests              (11)
│   │   ├── organizationController.test.js     # Organization controller tests                (7)
│   │   ├── projectController.stats.test.js    # Project stats controller tests               (2)
│   │   └── userController.test.js             # User controller tests                        (13)
│   ├── domain/ (86)
│   │   ├── ActivityLog.test.js                # ActivityLog domain model tests               (12)
│   │   ├── Project.test.js                    # Project domain model tests                   (29)
│   │   ├── Task.test.js                       # Task domain model tests                      (30)
│   │   └── User.test.js                       # User domain model tests                      (15)
│   ├── middleware/ (44)
│   │   ├── roleMiddleware.functions.test.js   # Role middleware function tests               (32)
│   │   └── roleMiddleware.middleware.test.js  # Role middleware tests                        (12)
│   ├── repositories/ (26)
│   │   ├── ActivityLogRepository.test.js            # ActivityLog repository tests            (8)
│   │   ├── DepartmentRepository.test.js             # Department repository tests             (3)
│   │   ├── projectRepository.collaborators.test.js  # Project collaborators tests             (4)
│   │   ├── ProjectRepository.test.js                # Project repository tests                (4)
│   │   ├── TeamRepository.test.js                   # Team repository tests                   (3)
│   │   └── UserRepository.test.js                   # User repository tests                   (4)
│   └── services/ (109)
│       ├── activityLogService.test.js              # ActivityLog service tests                (10)
│       ├── emailService.error.test.js              # Email service error handling tests       (4)
│       ├── emailService.test.js                    # Email service tests                      (4)
│       ├── metricsService.test.js                  # Metrics service tests                    (6)
│       ├── notificationService.test.js             # Notification service tests               (2)
│       ├── organizationService.test.js             # Organization service tests               (6)
│       ├── projectService.collaborators.test.js    # Project collaborators service tests      (4)
│       ├── projectService.extended.test.js         # Extended project service tests           (9)
│       ├── projectService.getProjectStats.test.js  # Project stats service tests              (3)
│       ├── projectService.test.js                  # Project service tests                    (20)
│       ├── taskService.attachments.test.js         # Task attachments service tests           (2)
│       ├── taskService.filtering.test.js           # Task filtering service tests             (9)
│       ├── taskService.test.js                     # Task service tests                       (24)
│       ├── taskService.unassigned.test.js          # Unassigned tasks service tests           (2)
│       └── userService.test.js                     # User service tests                       (4)
├── fixtures/                                 # Test fixtures (test files, etc.)
├── README.md                                 # Test documentation
└── setup.js                                  # Test configuration


## All Test Files and Cases (478)

### Authentication & Security Tests

- auth/login.test.js (5)
  - POST /api/auth/login › should authenticate valid user with correct credentials
  - POST /api/auth/login › should reject login with incorrect password
  - POST /api/auth/login › should reject login with non-existent email
  - POST /api/auth/login › should reject login with malformed email address
  - POST /api/auth/login › should reject login with missing required fields

- auth/request-reset.test.js (4)
  - POST /api/auth/request-reset › should send reset email for valid user account
  - POST /api/auth/request-reset › should not reveal if email doesn't exist (security)
  - POST /api/auth/request-reset › should handle case-insensitive email addresses
  - POST /api/auth/request-reset › should reject malformed email addresses

- auth/reset-password.test.js (5)
  - POST /api/auth/reset-password › should reset password with valid reset token
  - POST /api/auth/reset-password › should reject invalid reset token
  - POST /api/auth/reset-password › should reject expired reset token
  - POST /api/auth/reset-password › should reject weak passwords (security)
  - POST /api/auth/reset-password › should require both token and newPassword fields

### User Management Tests

- users/profile.test.js (1)
  - GET /api/users/profile › should return authenticated user's profile information

- users/team-members.test.js (3)
  - GET /api/users/team-members › should allow managers to view their team members
  - GET /api/users/team-members › should deny staff members from viewing team members
  - GET /api/users/team-members › should require authentication to access team members

- users/department-members.test.js (3)
  - GET /api/users/department-members › should allow directors to view department members
  - GET /api/users/department-members › should deny managers from viewing department members
  - GET /api/users/department-members › should require authentication to access department members

### Organization Management Tests

- organization/departments.test.js (3)
  - GET /api/organization/departments › should allow SM users to view all departments
  - GET /api/organization/departments › should deny non-SM users from viewing departments
  - GET /api/organization/departments › should require authentication

- organization/teams.test.js (4)
  - GET /api/organization/teams › should allow SM users to view all teams
  - GET /api/organization/teams › should deny non-SM users from viewing teams
  - GET /api/organization/teams › should require authentication
  - GET /api/organization/teams › should return teams with member count statistics

- organization/department-teams.test.js (5)
  - GET /api/organization/departments/:departmentId/teams › should allow directors to view department teams
  - GET /api/organization/departments/:departmentId/teams › should allow HR users to view department teams
  - GET /api/organization/departments/:departmentId/teams › should deny managers from viewing department teams
  - GET /api/organization/departments/:departmentId/teams › should require authentication
  - GET /api/organization/departments/:departmentId/teams › should handle non-existent department gracefully

### Metrics Management Tests

- metrics/departments.test.js (4)
  - GET /api/metrics/departments › should return department metrics for SM users
  - GET /api/metrics/departments › should return department metrics for HR users
  - GET /api/metrics/departments › should deny access for non-SM/HR users
  - GET /api/metrics/departments › should require authentication

- metrics/teams.test.js (6)
  - GET /api/metrics/teams › should return team metrics for director users
  - GET /api/metrics/teams › should return team metrics for SM users
  - GET /api/metrics/teams › should return team metrics for HR users
  - GET /api/metrics/teams › should deny access for manager users
  - GET /api/metrics/teams › should deny access for staff users
  - GET /api/metrics/teams › should require authentication

- metrics/single-team.test.js (5)
  - GET /api/metrics/teams/:teamId › should return team metrics for manager users
  - GET /api/metrics/teams/:teamId › should return team metrics for SM users
  - GET /api/metrics/teams/:teamId › should return team metrics for HR users
  - GET /api/metrics/teams/:teamId › should deny access for non-manager users
  - GET /api/metrics/teams/:teamId › should require authentication

- metrics/personal.test.js (4)
  - GET /api/metrics/personal › should return personal metrics for staff users
  - GET /api/metrics/personal › should return personal metrics for manager users
  - GET /api/metrics/personal › should return personal metrics for SM users
  - GET /api/metrics/personal › should require authentication

### Notifications Tests

- notifications/create.test.js (3)
  - POST /api/notifications › should create notification with valid data
  - POST /api/notifications › should require authentication
  - POST /api/notifications › should validate required fields

- notifications/get.test.js (4)
  - GET /api/notifications › should return notifications for authenticated user
  - GET /api/notifications › should return notifications for manager user
  - GET /api/notifications › should return notifications for SM user
  - GET /api/notifications › should require authentication

### Middleware Tests

- middleware/roleMiddleware.integration.test.js (9)
  - requireRole › should allow manager to access manager-only routes
  - requireRole › should allow director to access director routes
  - requireRole › should deny staff access to manager routes
  - requireRole › should return 401 for unauthenticated requests
  - requireRole › should allow HR to access team members (can see all)
  - requireRole › should allow manager with canAssignTasks to access team members
  - requireTaskManagement › should allow staff to view own tasks but not create tasks
  - ROLE_HIERARCHY › should have correct hierarchy values
  - ROLE_HIERARCHY › should correctly determine role hierarchy

### User Controller Integration Tests

- users/userController.integration.test.js (7)
  - GET /api/users/profile › should return user profile for authenticated user
  - GET /api/users/profile › should return 401 for unauthenticated user
  - GET /api/users/team-members › should return team members for manager
  - GET /api/users/team-members › should return 403 for staff user
  - GET /api/users/team-members › should return team members for HR
  - GET /api/users/department-members/:departmentId › should return department members for HR
  - GET /api/users/department-members/:departmentId › should return 403 for staff user

### Task Management Tests

- tasks/create.test.js (4)
  - POST /api/tasks/ › should create a new task with valid data
  - POST /api/tasks/ › should require authentication to create tasks
  - POST /api/tasks/ › should validate required title field
  - POST /api/tasks/ › should handle task creation with optional fields

- tasks/list.test.js (2)
  - GET /api/tasks/ › should return tasks for authenticated user
  - GET /api/tasks/ › should enforce role-based task visibility

- tasks/get-by-id.test.js (1)
  - GET /api/tasks/:id › should return task by ID if user has access

- tasks/assign.test.js (3)
  - PATCH /api/tasks/:id/assign › should allow managers to assign tasks to team members
  - PATCH /api/tasks/:id/assign › should deny staff from assigning tasks
  - PATCH /api/tasks/:id/assign › should prevent assigning to equal-or-higher role users

- tasks/status.test.js (2)
  - PATCH /api/tasks/:id/status › should allow task status updates
  - PATCH /api/tasks/:id/status › should require authentication for status updates

- tasks/archive.test.js (1)
  - DELETE /api/tasks/:id › should archive task (soft delete)

- tasks/update.test.js (4)
  - PUT /api/tasks/:id › should update task with valid data
  - PUT /api/tasks/:id › should require authentication
  - PUT /api/tasks/:id › should validate task ownership or collaboration
  - PUT /api/tasks/:id › should handle partial updates

- tasks/update-due-date.test.js (3)
  - PUT /api/tasks/:id › should update task due date successfully
  - PUT /api/tasks/:id › should reject invalid due date format
  - PUT /api/tasks/:id › should reject past due dates

- tasks/department-tasks.test.js (6)
  - GET /api/tasks/department/:departmentId › should allow directors to view department tasks
  - GET /api/tasks/department/:departmentId › should allow HR users to view department tasks
  - GET /api/tasks/department/:departmentId › should allow SM users to view department tasks
  - GET /api/tasks/department/:departmentId › should deny managers from viewing department tasks
  - GET /api/tasks/department/:departmentId › should require authentication
  - GET /api/tasks/department/:departmentId › should handle non-existent department

- tasks/project-tasks.test.js (4)
  - GET /api/tasks/project/:projectId › should return tasks for specific project
  - GET /api/tasks/project/:projectId › should require authentication
  - GET /api/tasks/project/:projectId › should handle non-existent project gracefully
  - GET /api/tasks/project/:projectId › should return empty array when project has no tasks

- tasks/team-tasks.test.js (5)
  - GET /api/tasks/team/:teamId › should allow managers to view team tasks
  - GET /api/tasks/team/:teamId › should allow directors to view team tasks
  - GET /api/tasks/team/:teamId › should deny staff from viewing team tasks
  - GET /api/tasks/team/:teamId › should require authentication
  - GET /api/tasks/team/:teamId › should handle non-existent team gracefully

- tasks/unassigned-tasks.test.js (5)
  - GET /api/tasks/unassigned › should return all unassigned tasks with projectId set to null
  - GET /api/tasks/unassigned › should return 401 if token is missing
  - GET /api/tasks/unassigned › should return 401 for invalid JWT token
  - GET /api/tasks/unassigned › should return an empty array when no unassigned tasks exist
  - GET /api/tasks/unassigned › should return tasks containing required fields

- tasks/priority-tasks.test.js (5)
  - Task API › should create task with projectId and priority successfully
  - Task API › should require priority when task has projectId
  - Task API › should return tasks sorted by descending priority
  - Task API › should throw error if changing projectId without providing new priority
  - Task API › should allow changing projectId with new priority

- tasks/tasks-grouping.test.js (5)
  - POST /api/tasks › should create tasks with project assignment at creation time
  - GET /api/tasks/project/:projectId › should filter tasks by individual project
  - GET /api/tasks/unassigned › should list unassigned tasks that were created
  - GET /api/projects/:projectId/progress › should return aggregated project progress for managers
  - PUT /api/projects/:projectId › should block non-owner staff from editing project name

- tasks/attachments.test.js (6)
  - Task Attachments API › should allow a staff user to upload an attachment and save it in storage/<taskId>/
  - Task Attachments API › should reject unsupported file formats
  - Task Attachments API › should prevent unauthorized users from adding attachments
  - Task Attachments API › should allow task owner to remove an attachment
  - Task Attachments API › should allow a manager collaborator to remove an attachment
  - Task Attachments API › should not allow unrelated users to remove attachments

- tasks/recurring-tasks.test.js (3)
  - should create a recurring task
  - should update recurrence of a task
  - should create a new recurring task when completed

### Subtask Management Tests

- subtasks/create.test.js (2)
  - POST /api/tasks/:taskId/subtasks › should create subtask under parent task
  - POST /api/tasks/:taskId/subtasks › should reject subtask creation with invalid data

- subtasks/list.test.js (1)
  - GET /api/tasks/:taskId/subtasks › should return subtasks for parent task

- subtasks/get-by-id.test.js (2)
  - GET /api/tasks/subtasks/:id › should return subtask by ID
  - GET /api/tasks/subtasks/:id › should handle non-existent subtask

- subtasks/update.test.js (2)
  - PUT /api/tasks/subtasks/:id › should update subtask with valid data
  - PUT /api/tasks/subtasks/:id › should deny update if user is not collaborator

- subtasks/update-status.test.js (2)
  - PATCH /api/tasks/subtasks/:id/status › should update subtask status
  - PATCH /api/tasks/subtasks/:id/status › should deny status update if user is not collaborator

- subtasks/delete.test.js (2)
  - DELETE /api/tasks/subtasks/:id › should soft delete subtask
  - DELETE /api/tasks/subtasks/:id › should deny deletion if user is not collaborator

### Project Management Tests

- projects/create.test.js (4)
  - POST /api/projects › should create project with valid data
  - POST /api/projects › should require authentication
  - POST /api/projects › should validate required project name
  - POST /api/projects › should handle project creation with optional fields

- projects/list.test.js (2)
  - GET /api/projects › should return projects for authenticated user
  - GET /api/projects › should require authentication

- projects/update.test.js (3)
  - PUT /api/projects/:projectId › should update project with valid data
  - PUT /api/projects/:projectId › should require authentication
  - PUT /api/projects/:projectId › should merge collaborators when updating

- projects/permissions.test.js (2)
  - PUT /api/projects/:projectId › should deny HR users from updating projects
  - PUT /api/projects/:projectId › should allow managers to update projects

- projects/collaborators.test.js (4)
  - PUT /api/projects/:projectId/collaborators › should add new collaborator
  - PUT /api/projects/:projectId/collaborators › should prevent duplicate collaborators
  - DELETE /api/projects/:projectId/collaborators › should remove a collaborator successfully
  - DELETE /api/projects/:projectId/collaborators › should not allow removing the project owner

- projects/archive.test.js (2)
  - PUT /api/projects/:projectId/archive › should archive project
  - PUT /api/projects/:projectId/archive › should unarchive project

- projects/department-projects.test.js (4)
  - GET /api/projects/departments/:departmentId › should return projects for department
  - GET /api/projects/departments/:departmentId › should require authentication
  - GET /api/projects/departments/:departmentId › should handle non-existent department
  - GET /api/projects/departments/:departmentId › should return an empty array when department has no projects

- projects/remove-collaborators.test.js (7)
  - DELETE /api/projects/:projectId/collaborators › should remove collaborator successfully
  - DELETE /api/projects/:projectId/collaborators › should require authentication
  - DELETE /api/projects/:projectId/collaborators › should handle non-existent project
  - DELETE /api/projects/:projectId/collaborators › should handle removing non-existent collaborator
  - DELETE /api/projects/:projectId/collaborators › should require collaboratorId field
  - DELETE /api/projects/:projectId/collaborators › should validate project ownership or collaboration
  - DELETE /api/projects/:projectId/collaborators › should not allow removing project owner

### Activity Log Tests

- activity_log/list-log.test.js (2)
  - GET /api/logs › should require authentication
  - GET /api/logs › should return activity logs for authenticated users

- activity_log/task-log.test.js (5)
  - should create a task and log "created"
  - should update a task and log "updated"
  - should assign a task and log "assigned"
  - should update task status and log "status_changed"
  - should soft delete a task and log "status_changed"

### Unit Tests

#### Domain Model Tests

- unit/domain/ActivityLog.test.js (12)
  - ActivityLog › Constructor › should initialize with provided data
  - ActivityLog › Constructor › should handle data with id instead of _id
  - ActivityLog › Constructor › should handle missing details
  - ActivityLog › isRecent › should return true for recent activity
  - ActivityLog › isRecent › should return false for old activity
  - ActivityLog › isRecent › should respect a custom minutes window
  - ActivityLog › isToday › should return true for today’s activity
  - ActivityLog › isToday › should return false for yesterday’s activity
  - ActivityLog › isThisWeek › should return true for this week’s activity
  - ActivityLog › isThisWeek › should return false for last week’s activity
  - ActivityLog › toDTO › should return a complete DTO
  - ActivityLog › toSafeDTO › should return a safe DTO without sensitive data

- unit/domain/Project.test.js (29)
  - Project › Constructor › should initialize with provided data
  - Project › Constructor › should handle data with id instead of _id
  - Project › Constructor › should initialize with default values
  - Project › Constructor › should not automatically add owner to collaborators
  - Project › isOwner › should return true for the owner
  - Project › isOwner › should return false for non-owners
  - Project › isOwner › should handle string comparison
  - Project › isCollaborator › should return true for collaborators
  - Project › isCollaborator › should return true for the owner
  - Project › isCollaborator › should return false for non-collaborators
  - Project › canBeAccessedBy › should allow access for the owner
  - Project › canBeAccessedBy › should allow access for collaborators
  - Project › canBeAccessedBy › should allow access for users who can see all tasks
  - Project › canBeAccessedBy › should allow access for department users with permission
  - Project › canBeAccessedBy › should deny access for unauthorized users
  - Project › canBeModifiedBy › should allow modification for the owner
  - Project › canBeModifiedBy › should allow modification for managers
  - Project › canBeModifiedBy › should deny modification for non-owners and non-managers
  - Project › addCollaborator › should add new collaborator
  - Project › addCollaborator › should not add duplicate collaborator
  - Project › isOverdue › should return true for overdue projects
  - Project › isOverdue › should return false for future deadlines
  - Project › isOverdue › should return false for archived projects
  - Project › isOverdue › should return null when deadline is missing
  - Project › hasTasks › should return true when project has tasks
  - Project › hasTasks › should return false when project has no tasks
  - Project › setHasTasks › should set hasContainedTasks to true
  - Project › setHasTasks › should set hasContainedTasks to false
  - Project › toDTO › should return complete DTO

- unit/domain/Task.test.js (30)
  - Task › Constructor › should initialize with provided data
  - Task › Constructor › should handle data with id instead of _id
  - Task › Constructor › should initialize with default values
  - Task › Status checks › should identify overdue tasks correctly
  - Task › Status checks › should not consider completed tasks as overdue
  - Task › Status checks › should identify completed tasks
  - Task › Status checks › should identify unassigned tasks
  - Task › Status checks › should identify ongoing tasks
  - Task › Status checks › should identify tasks under review
  - Task › canBeCompletedBy › should allow completion by task creator
  - Task › canBeCompletedBy › should allow completion by assignee
  - Task › canBeCompletedBy › should allow completion by collaborators
  - Task › canBeCompletedBy › should deny completion by non-collaborators
  - Task › canBeAssignedBy › should allow assignment by users who can assign tasks
  - Task › canBeAssignedBy › should deny assignment by users who cannot assign tasks
  - Task › canBeEditedBy › should allow editing by staff who created the task
  - Task › canBeEditedBy › should deny editing by staff who did not create the task
  - Task › canBeEditedBy › should allow editing by managers who are collaborators
  - Task › canBeEditedBy › should deny editing by managers who are not collaborators
  - Task › canRemoveAttachment › should allow removal by task creator
  - Task › canRemoveAttachment › should allow removal by managers who are collaborators
  - Task › canRemoveAttachment › should deny removal by managers who are not collaborators
  - Task › canRemoveAttachment › should deny removal by non-managers who are not creators
  - Task › Business logic methods › should update status correctly
  - Task › Business logic methods › should assign task to user
  - Task › Business logic methods › should add collaborator
  - Task › Business logic methods › should not add duplicate collaborator
  - Task › Business logic methods › should check if task has attachments
  - Task › Business logic methods › should check if user is collaborator
  - Task › toDTO › should return complete DTO

- unit/domain/User.test.js (15)
  - User › Constructor › should initialize with provided data
  - User › Constructor › should handle data with id instead of _id
  - User › Constructor › should handle populated team and department data
  - User › Role checks › should identify managers correctly
  - User › Role checks › should identify staff correctly
  - User › Role checks › should identify HR correctly
  - User › Role checks › should identify senior management correctly
  - User › Role checks › should identify directors correctly
  - User › Permission checks › should allow task assignment for managers, directors, and SM
  - User › Permission checks › should allow seeing all tasks for HR and SM
  - User › Permission checks › should allow seeing department tasks for directors
  - User › Permission checks › should allow seeing team tasks for managers
  - User › Permission checks › should check department access correctly
  - User › toProfileDTO › should return complete profile DTO
  - User › toSafeDTO › should return safe DTO without sensitive data

#### Repository Tests

- unit/repositories/ActivityLogRepository.test.js (8)
  - ActivityLogRepository › findById › should find activity log by id
  - ActivityLogRepository › findByUser › should find activity logs by user id
  - ActivityLogRepository › findByUser › should apply filters when provided
  - ActivityLogRepository › findByResource › should find activity logs by resource
  - ActivityLogRepository › findAll › should return all activity logs
  - ActivityLogRepository › findAll › should support filters
  - ActivityLogRepository › create › should create new activity log
  - ActivityLogRepository › updateById › should update activity log by id

- unit/repositories/DepartmentRepository.test.js (3)
  - DepartmentRepository › should handle find operations
  - DepartmentRepository › should handle create and update operations
  - DepartmentRepository › should handle delete operation

- unit/repositories/ProjectRepository.test.js (4)
  - ProjectRepository › findAllProjects › should find all projects
  - ProjectRepository › findActiveProjects › should return active projects
  - ProjectRepository › create › should reject non-Project instances
  - ProjectRepository › setHasTasks › should update has tasks flag

- unit/repositories/TeamRepository.test.js (3)
  - TeamRepository › should handle find operations
  - TeamRepository › should handle create and update operations
  - TeamRepository › should handle delete operation

- unit/repositories/UserRepository.test.js (4)
  - UserRepository › should handle find operations
  - UserRepository › should handle find by department and team
  - UserRepository › should handle create and update operations
  - UserRepository › should handle reset token operations

#### Service Tests

- unit/services/activityLogService.test.js (10)
  - ActivityLogService › logActivity › should log activity successfully
  - ActivityLogService › logActivity › should throw error when repository fails
  - ActivityLogService › getUserActivityLogs › should get user activity logs successfully
  - ActivityLogService › getUserActivityLogs › should get user activity logs with filters
  - ActivityLogService › getUserActivityLogs › should throw error when repository fails
  - ActivityLogService › getResourceActivityLogs › should get resource activity logs successfully
  - ActivityLogService › getResourceActivityLogs › should throw error when repository fails
  - ActivityLogService › getAllActivityLogs › should get all activity logs successfully
  - ActivityLogService › getAllActivityLogs › should get all activity logs with filters
  - ActivityLogService › getAllActivityLogs › should throw error when repository fails

- unit/services/projectService.test.js (20)
  - ProjectService › getProjectProgress › should get project progress for authorized user
  - ProjectService › getProjectProgress › should throw error when user not found
  - ProjectService › getProjectProgress › should throw error when not authorized
  - ProjectService › buildEnrichedProjectDTO › should build enriched DTO with owner and collaborator names
  - ProjectService › buildEnrichedProjectDTO › should handle errors gracefully when fetching names
  - ProjectService › validateCollaborators › should validate collaborators successfully
  - ProjectService › validateCollaborators › should throw error when collaborator not found
  - ProjectService › validateCollaborators › should throw error when department mismatch
  - ProjectService › validateDepartmentMembership › should validate same department
  - ProjectService › validateDepartmentMembership › should throw error for different departments
  - ProjectService › validateDepartmentMembership › should handle null department IDs
  - ProjectService › isVisibleToUser › should return true when project is accessible
  - ProjectService › isVisibleToUser › should return false when error occurs
  - ProjectService › getProjectsByOwner › should get projects by owner successfully
  - ProjectService › getProjectsByOwner › should throw error when repository fails
  - ProjectService › getProjectsByDepartment › should get projects by department successfully
  - ProjectService › getProjectsByDepartment › should throw error when repository fails
  - ProjectService › getProjectById › should get project by id successfully
  - ProjectService › getProjectById › should throw error when project not found
  - ProjectService › getProjectById › should throw error when repository fails

- unit/services/taskService.test.js (24)
  - TaskService › validatePriority › should validate priority successfully
  - TaskService › validatePriority › should throw error when priority is undefined
  - TaskService › validatePriority › should throw error when priority is null
  - TaskService › validatePriority › should throw error when priority is out of range
  - TaskService › validatePriority › should throw error when priority is not a number
  - TaskService › mapPopulatedTaskDocToDTO › should map populated task document to DTO
  - TaskService › buildEnrichedTaskDTO › should build enriched DTO successfully
  - TaskService › buildEnrichedTaskDTO › should handle errors gracefully and return fallback DTO
  - TaskService › isVisibleToUser › should return true for HR/SM users
  - TaskService › isVisibleToUser › should return false when task not found
  - TaskService › isVisibleToUser › should return false when user not found
  - TaskService › isVisibleToUser › should return false when error occurs
  - TaskService › getTasksByAssignee › should get tasks by assignee successfully
  - TaskService › getTasksByAssignee › should throw error when repository fails
  - TaskService › getTasksByCreator › should get tasks by creator successfully
  - TaskService › getTasksByCreator › should throw error when repository fails
  - TaskService › getTasksByCollaborator › should get tasks by collaborator successfully
  - TaskService › getTasksByCollaborator › should throw error when repository fails
  - TaskService › getById › should get task by id successfully
  - TaskService › getById › should throw error when task not found
  - TaskService › getById › should throw error when repository fails
  - TaskService › setTaskProjects › should set task projects successfully
  - TaskService › setTaskProjects › should throw error when task not found
  - TaskService › setTaskProjects › should throw error when not authorized

- unit/services/organizationService.test.js (6)
  - OrganizationService › getAllDepartments › should return departments with statistics
  - OrganizationService › getAllDepartments › should handle errors when fetching departments
  - OrganizationService › getTeamsByDepartment › should return teams with user counts
  - OrganizationService › getTeamsByDepartment › should handle errors when fetching teams
  - OrganizationService › getAllTeams › should return all teams with statistics
  - OrganizationService › getAllTeams › should handle errors when fetching all teams

- unit/services/emailService.test.js (4)
  - EmailService › sendPasswordResetEmail › should send password reset email successfully
  - EmailService › sendPasswordResetEmail › should handle email errors gracefully
  - EmailService › sendInvitationEmail › should send invitation email successfully
  - EmailService › sendInvitationEmail › should handle different roles

- unit/services/emailService.error.test.js (4)
  - EmailService › sendPasswordResetEmail › should handle sendMail errors
  - EmailService › sendPasswordResetEmail › should handle email errors gracefully
  - EmailService › sendInvitationEmail › should handle sendMail errors
  - EmailService › sendInvitationEmail › should handle network errors

- unit/services/notificationService.test.js (2)
  - NotificationService › should create notification successfully
  - NotificationService › should handle errors when creating notification

- unit/services/metricsService.test.js (6)
  - MetricsService › getTeamMetrics › should return team metrics successfully
  - MetricsService › getTeamMetrics › should handle errors when fetching team metrics
  - MetricsService › getSingleTeamMetrics › should return single team metrics successfully
  - MetricsService › getSingleTeamMetrics › should handle errors when fetching single team metrics
  - MetricsService › getPersonalMetrics › should return personal metrics successfully
  - MetricsService › getPersonalMetrics › should handle errors when fetching personal metrics

- unit/services/projectService.collaborators.test.js (4)
  - ProjectService › addCollaborator › should add collaborator successfully
  - ProjectService › addCollaborator › should handle collaborator not found
  - ProjectService › removeCollaborator › should remove collaborator successfully
  - ProjectService › removeCollaborator › should prevent removing project owner

- unit/services/projectService.extended.test.js (9)
  - ProjectService › getProjectProgress › should return project progress successfully
  - ProjectService › getProjectProgress › should throw Not Authorized error
  - ProjectService › updateProject › should update project successfully
  - ProjectService › addCollaborator › should add collaborator successfully
  - ProjectService › assignRoleToCollaborator › should assign role successfully
  - ProjectService › assignRoleToCollaborator › should throw error when not owner
  - ProjectService › validateCollaborators › should validate collaborators in same department
  - ProjectService › validateCollaborators › should throw error when collaborator not found
  - ProjectService › isVisibleToUser › should return false when error occurs

- unit/services/projectService.getProjectStats.test.js (3)
  - ProjectService › getProjectStats › should return project stats successfully
  - ProjectService › getProjectStats › should handle errors when user not found
  - ProjectService › getProjectStats › should handle errors when project not found

- unit/services/taskService.attachments.test.js (2)
  - TaskService › removeAttachment › should remove attachment from task successfully
  - TaskService › removeAttachment › should handle errors when attachment not found

- unit/services/taskService.filtering.test.js (9)
  - TaskService › filterByStatus › should return all tasks when status is all
  - TaskService › filterByStatus › should filter by ongoing/completed/unassigned/under_review status
  - TaskService › sortTasks › should sort by due date ascending/descending
  - TaskService › sortTasks › should sort by assignee ascending
  - TaskService › sortTasks › should return unsorted when sortBy is not provided

- unit/services/taskService.unassigned.test.js (2)
  - TaskService › calculateTaskStats › should calculate task statistics correctly
  - TaskService › calculateTaskStats › should handle empty task array

- unit/repositories/projectRepository.collaborators.test.js (4)
  - ProjectRepository › assignRole › should assign role to collaborator successfully
  - ProjectRepository › assignRole › should handle project not found
  - ProjectRepository › assignRole › should convert legacy collaborators to new format
  - ProjectRepository › setHasTasks › should update hasTasks flag successfully

#### Middleware Tests

- unit/middleware/roleMiddleware.functions.test.js (32)
  - hasRole › should return true when user has the role
  - hasRole › should return false when user does not have the role
  - hasRole › should return true when user has any role in array
  - hasRole › should return false for null user or user without role
  - hasAnyRole › comprehensive tests for role checking
  - isHigherRole › comprehensive comparison tests
  - isHigherOrEqualRole › tests for equal roles
  - canAssignTasks › tests for all role types
  - canSeeAllTasks › tests for HR/SM access
  - canSeeDepartmentTasks › tests for director access
  - canSeeTeamTasks › tests for manager access
  - canManageTasks › tests for management permissions
  - canSeeTasks › tests for visibility permissions

- unit/middleware/roleMiddleware.middleware.test.js (12)
  - requireRole › should allow access for authorized role
  - requireRole › should deny access for unauthorized role
  - requireRole › should return 401 when user not authenticated
  - requireRole › should return 401 when userId missing
  - requireRole › should handle errors and return 500
  - requireTaskManagement › should allow access for manager/HR
  - requireTaskManagement › should deny access for staff
  - requireTaskManagement › should return 401 when user not authenticated
  - requireTaskManagement › should return 401 when userId missing
  - requireTaskManagement › should handle errors and return 500
  - requireTaskManagement › should handle user not found error


#### Controller Tests

- unit/controllers/authController.test.js (11)
  - AuthController › login › should login successfully with valid credentials
  - AuthController › login › should return error when email is missing
  - AuthController › login › should return error when password is missing
  - AuthController › login › should return error for invalid email format
  - AuthController › login › should return error when user not found
  - AuthController › login › should return error when password is invalid
  - AuthController › requestPasswordReset › should request password reset successfully
  - AuthController › requestPasswordReset › should return error when user not found
  - AuthController › resetPassword › should reset password successfully
  - AuthController › resetPassword › should return error when user not found
  - AuthController › resetPassword › should return error when token is invalid

- unit/controllers/userController.test.js (13)
  - UserController › getProfile › should return user profile successfully
  - UserController › getProfile › should return 404 when user not found
  - UserController › getTeamMembers › should return team members for HR or SM users
  - UserController › getTeamMembers › should return team members for managers
  - UserController › getTeamMembers › should return 403 for users without sufficient permissions
  - UserController › getDepartmentMembers › should return department members successfully
  - UserController › getDepartmentMembers › should return 403 for users without sufficient permissions
  - UserController › sendBulkInvitations › should send invitations successfully for HR users
  - UserController › sendBulkInvitations › should return 403 for non-HR users
  - UserController › sendBulkInvitations › should return 400 for invalid email array
  - UserController › sendBulkInvitations › should return 400 for invalid email format
  - UserController › sendBulkInvitations › should return 400 for invalid role
  - UserController › sendBulkInvitations › should skip existing users

- unit/controllers/organizationController.test.js (7)
  - OrganizationController › getAllDepartments › should return departments for SM users
  - OrganizationController › getAllDepartments › should throw error when user not found
  - OrganizationController › getAllDepartments › should throw error for insufficient permissions
  - OrganizationController › getTeamsByDepartment › should return teams for director accessing their own department
  - OrganizationController › getTeamsByDepartment › should return 403 for director accessing different department
  - OrganizationController › getTeamsByDepartment › should return an empty list for non-existent department
  - OrganizationController › getTeamsByDepartment › should throw error for staff users

- unit/controllers/projectController.stats.test.js (2)
  - ProjectController › getProjectStats › should return project stats successfully
  - ProjectController › getProjectStats › should handle errors


## Running Tests

### Prerequisites
- Node.js and npm installed
- MongoDB running (for integration tests)
- Environment variables configured (see main README)

### Test Commands
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm test -- --testPathPatterns="auth"
npm test -- --testPathPatterns="tasks"
npm test -- --testPathPatterns="projects"

# Run integration tests only
npm test -- --testPathPatterns="integration"

# Run unit tests only
npm test -- --testPathPatterns="unit"

# Run tests in watch mode
npm test -- --watch
```
