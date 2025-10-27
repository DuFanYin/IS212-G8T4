# Backend Test Structure

This directory contains focused integration tests that verify core functionality as specified in project requirements.

## Structure

```
__tests__/
├── integration/                 # Integration tests (API endpoints)
│   ├── auth/
│   │   ├── login.test.js                #   POST /api/auth/login                      (5)
│   │   ├── request-reset.test.js        #   POST /api/auth/request-reset              (4)
│   │   └── reset-password.test.js       #   POST /api/auth/reset-password             (5)
│   ├── organization/
│   │   ├── departments.test.js          #   GET  /api/organization/departments        (3)
│   │   ├── teams.test.js                #   GET  /api/organization/teams              (4)
│   │   └── department-teams.test.js     #   GET  /api/organization/departments/:id/teams (5)
│   ├── users/
│   │   ├── profile.test.js              #   GET  /api/users/profile                   (1)
│   │   ├── team-members.test.js         #   GET  /api/users/team-members              (3)
│   │   └── department-members.test.js   #   GET  /api/users/department-members        (3)
│   ├── tasks/
│   │   ├── create.test.js               #   POST /api/tasks/                          (4)
│   │   ├── list.test.js                 #   GET  /api/tasks/                          (2)
│   │   ├── get-by-id.test.js            #   GET  /api/tasks/:id                       (1)
│   │   ├── assign.test.js               #   PATCH /api/tasks/:id/assign               (3)
│   │   ├── status.test.js               #   PATCH /api/tasks/:id/status               (2)
│   │   ├── archive.test.js              #   DELETE /api/tasks/:id                     (1)
│   │   ├── update.test.js               #   PUT  /api/tasks/:id                       (4)
│   │   ├── update-due-date.test.js      #   PUT  /api/tasks/:id                       (3)
│   │   ├── department-tasks.test.js     #   GET  /api/tasks/department/:id            (4)
│   │   ├── project-tasks.test.js        #   GET  /api/tasks/project/:id               (3)
│   │   ├── team-tasks.test.js           #   GET  /api/tasks/team/:id                  (3)
│   │   ├── unassigned-tasks.test.js     #   GET  /api/tasks/unassigned                (3)
│   │   ├── priority-tasks.test.js       #   Task priority handling                    (5)
│   │   └── tasks-grouping.test.js       #   Task grouping across projects/categories
│   ├── subtasks/
│   │   ├── create.test.js               #   POST /api/tasks/:id/subtasks              (2)
│   │   ├── list.test.js                 #   GET  /api/tasks/:id/subtasks              (1)
│   │   ├── get-by-id.test.js            #   GET  /api/tasks/subtasks/:id              (2)
│   │   ├── update.test.js               #   PUT  /api/tasks/subtasks/:id              (2)
│   │   ├── update-status.test.js        #   PATCH /api/tasks/subtasks/:id/status      (2)
│   │   └── delete.test.js               #   DELETE /api/tasks/subtasks/:id            (2)
│   ├── projects/
│   │   ├── create.test.js               #   POST /api/projects                        (4)
│   │   ├── list.test.js                 #   GET  /api/projects                        (2)
│   │   ├── update.test.js               #   PUT  /api/projects/:projectId             (3)
│   │   ├── permissions.test.js          #   Role checks for update                    (2)
│   │   ├── collaborators.test.js        #   PUT  /api/projects/:projectId/collaborators (3)
│   │   ├── remove-collaborators.test.js #   DELETE /api/projects/:projectId/collaborators (4)
│   │   ├── archive.test.js              #   PUT  /api/projects/:projectId/archive     (2)
│   │   └── department-projects.test.js  #   GET  /api/projects/departments/:id        (3)
│   ├── activity_log/
│   │   ├── list-log.test.js             #   GET  /api/activity-log (list recent activity)
│   │   └── task-log.test.js             #   Task lifecycle logging (create/update/assign/status)
└── setup.js                             #   Test configuration
```


## All Test Files and Cases (502)

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

- middleware/roleMiddleware.integration.test.js (10)
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

- users/userController.integration.test.js (6)
  - GET /api/users/profile › should return user profile for authenticated user
  - GET /api/users/profile › should return 401 for unauthenticated user
  - GET /api/users/team-members › should return team members for manager
  - GET /api/users/team-members › should return 403 for staff user
  - GET /api/users/team-members › should return team members for HR
  - GET /api/users/department-members/:departmentId › should return department members for director
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

- tasks/department-tasks.test.js (4)
  - GET /api/tasks/department/:departmentId › should allow directors to view department tasks
  - GET /api/tasks/department/:departmentId › should allow HR users to view department tasks
  - GET /api/tasks/department/:departmentId › should deny managers from viewing department tasks
  - GET /api/tasks/department/:departmentId › should require authentication

- tasks/project-tasks.test.js (3)
  - GET /api/tasks/project/:projectId › should return tasks for specific project
  - GET /api/tasks/project/:projectId › should require authentication
  - GET /api/tasks/project/:projectId › should handle non-existent project gracefully

- tasks/team-tasks.test.js (3)
  - GET /api/tasks/team/:teamId › should allow managers to view team tasks
  - GET /api/tasks/team/:teamId › should allow directors to view team tasks
  - GET /api/tasks/team/:teamId › should deny staff from viewing team tasks

- tasks/unassigned-tasks.test.js (3)
  - GET /api/tasks/unassigned › should return all unassigned tasks
  - GET /api/tasks/unassigned › should require authentication
  - GET /api/tasks/unassigned › should return empty array when no unassigned tasks exist

- tasks/priority-tasks.test.js (5)
  - Task API › should create task with projectId and priority successfully
  - Task API › should require priority when task has projectId
  - Task API › should return tasks sorted by descending priority
  - Task API › should throw error if changing projectId without providing new priority
  - Task API › should allow changing projectId with new priority

- tasks/tasks-grouping.test.js
  - should allow a task to belong to multiple projects via projects[]
  - should return tasks by project including those from projects[]
  - should compute project progress including multi-project tasks

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

- projects/collaborators.test.js (3)
  - PUT /api/projects/:projectId/collaborators › should add new collaborator
  - PUT /api/projects/:projectId/collaborators › should prevent duplicate collaborators
  - PUT /api/projects/:projectId/collaborators › should require authentication

- projects/archive.test.js (2)
  - PUT /api/projects/:projectId/archive › should archive project
  - PUT /api/projects/:projectId/archive › should unarchive project

- projects/department-projects.test.js (3)
  - GET /api/projects/departments/:departmentId › should return projects for department
  - GET /api/projects/departments/:departmentId › should require authentication
  - GET /api/projects/departments/:departmentId › should handle non-existent department

- projects/remove-collaborators.test.js (4)
  - DELETE /api/projects/:projectId/collaborators › should remove collaborator successfully
  - DELETE /api/projects/:projectId/collaborators › should require authentication
  - DELETE /api/projects/:projectId/collaborators › should validate project ownership
  - DELETE /api/projects/:projectId/collaborators › should prevent removing project owner

### Activity Log Tests

- activity_log/list-log.test.js (2)
  - GET /api/activity-log › should list recent activity entries with pagination
  - GET /api/activity-log › should require authentication

- activity_log/task-log.test.js (2)
  - should log create/update/assign/status changes for tasks
  - should return activity entry IDs on task responses where applicable

### Unit Tests

#### Domain Model Tests

- unit/domain/ActivityLog.test.js (8)
  - ActivityLog › should create activity log with valid data
  - ActivityLog › should handle missing required fields
  - ActivityLog › should validate action types
  - ActivityLog › should format timestamps correctly
  - ActivityLog › should handle null/undefined values gracefully
  - ActivityLog › should serialize to JSON correctly
  - ActivityLog › should validate resource types
  - ActivityLog › should handle empty details object

- unit/domain/Project.test.js (12)
  - Project › should create project with valid data
  - Project › should handle missing required fields
  - Project › should validate project name
  - Project › should handle optional fields
  - Project › should validate deadline format
  - Project › should handle collaborators array
  - Project › should check ownership permissions
  - Project › should check modification permissions
  - Project › should check access permissions
  - Project › should serialize to DTO correctly
  - Project › should handle archived status
  - Project › should validate department membership

- unit/domain/Subtask.test.js (10)
  - Subtask › should create subtask with valid data
  - Subtask › should handle missing required fields
  - Subtask › should validate parent task reference
  - Subtask › should handle status transitions
  - Subtask › should check edit permissions
  - Subtask › should check completion permissions
  - Subtask › should serialize to DTO correctly
  - Subtask › should handle soft deletion
  - Subtask › should validate due dates
  - Subtask › should handle priority levels

- unit/domain/Task.test.js (15)
  - Task › should create task with valid data
  - Task › should handle missing required fields
  - Task › should validate task title
  - Task › should handle optional fields
  - Task › should validate due date format
  - Task › should handle collaborators array
  - Task › should check edit permissions
  - Task › should check assignment permissions
  - Task › should check completion permissions
  - Task › should check attachment permissions
  - Task › should serialize to DTO correctly
  - Task › should handle soft deletion
  - Task › should validate priority levels
  - Task › should handle project associations
  - Task › should check visibility permissions

- unit/domain/User.test.js (18)
  - User › should create user with valid data
  - User › should handle missing required fields
  - User › should validate email format
  - User › should validate role types
  - User › should check task assignment permissions
  - User › should check task visibility permissions
  - User › should check department access permissions
  - User › should check team access permissions
  - User › should serialize to DTO correctly
  - User › should serialize to profile DTO correctly
  - User › should serialize to safe DTO correctly
  - User › should handle role hierarchy
  - User › should validate department membership
  - User › should validate team membership
  - User › should handle password validation
  - User › should check collaboration permissions
  - User › should handle soft deletion
  - User › should validate user status

#### Repository Tests

- unit/repositories/ActivityLogRepository.test.js (12)
  - ActivityLogRepository › should create activity log successfully
  - ActivityLogRepository › should find activity logs by user
  - ActivityLogRepository › should find activity logs by resource
  - ActivityLogRepository › should find all activity logs
  - ActivityLogRepository › should handle creation errors
  - ActivityLogRepository › should handle query errors
  - ActivityLogRepository › should validate required fields
  - ActivityLogRepository › should handle pagination
  - ActivityLogRepository › should filter by action type
  - ActivityLogRepository › should sort by timestamp
  - ActivityLogRepository › should handle empty results
  - ActivityLogRepository › should validate resource references

- unit/repositories/DepartmentRepository.test.js (8)
  - DepartmentRepository › should find department by ID
  - DepartmentRepository › should find all departments
  - DepartmentRepository › should handle non-existent department
  - DepartmentRepository › should validate department data
  - DepartmentRepository › should handle query errors
  - DepartmentRepository › should return department with teams
  - DepartmentRepository › should handle empty results
  - DepartmentRepository › should validate department structure

- unit/repositories/ProjectRepository.test.js (15)
  - ProjectRepository › should create project successfully
  - ProjectRepository › should find project by ID
  - ProjectRepository › should find projects by owner
  - ProjectRepository › should find projects by collaborator
  - ProjectRepository › should find projects by department
  - ProjectRepository › should find active projects
  - ProjectRepository › should find all projects
  - ProjectRepository › should update project successfully
  - ProjectRepository › should add collaborators
  - ProjectRepository › should remove collaborators
  - ProjectRepository › should handle creation errors
  - ProjectRepository › should handle update errors
  - ProjectRepository › should validate project data
  - ProjectRepository › should handle non-existent project
  - ProjectRepository › should validate collaborator operations

- unit/repositories/TeamRepository.test.js (10)
  - TeamRepository › should find team by ID
  - TeamRepository › should find teams by department
  - TeamRepository › should find all teams
  - TeamRepository › should handle non-existent team
  - TeamRepository › should validate team data
  - TeamRepository › should handle query errors
  - TeamRepository › should return team with members
  - TeamRepository › should handle empty results
  - TeamRepository › should validate team structure
  - TeamRepository › should handle department relationships

- unit/repositories/UserRepository.test.js (20)
  - UserRepository › should create user successfully
  - UserRepository › should find user by ID
  - UserRepository › should find user by email
  - UserRepository › should find users by department
  - UserRepository › should find users by team
  - UserRepository › should find all users
  - UserRepository › should update user successfully
  - UserRepository › should update password hash
  - UserRepository › should set reset token
  - UserRepository › should clear reset token
  - UserRepository › should find user by reset token
  - UserRepository › should handle creation errors
  - UserRepository › should handle update errors
  - UserRepository › should handle query errors
  - UserRepository › should validate user data
  - UserRepository › should handle non-existent user
  - UserRepository › should validate email uniqueness
  - UserRepository › should handle password operations
  - UserRepository › should validate reset token operations
  - UserRepository › should handle soft deletion

#### Service Tests

- unit/services/activityLogService.test.js (12)
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
  - ActivityLogService › should handle activity log creation
  - ActivityLogService › should validate activity log data

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

- unit/services/projectService.collaborators.test.js (5)
  - ProjectService › addCollaborator › should add collaborator successfully
  - ProjectService › addCollaborator › should handle collaborator not found
  - ProjectService › removeCollaborator › should remove collaborator successfully
  - ProjectService › removeCollaborator › should prevent removing project owner

- unit/services/projectService.extended.test.js (10)
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

- unit/services/taskService.filtering.test.js (5)
  - TaskService › filterByStatus › should return all tasks when status is all
  - TaskService › filterByStatus › should filter by ongoing/completed/unassigned/under_review status
  - TaskService › sortTasks › should sort by due date ascending/descending
  - TaskService › sortTasks › should sort by assignee ascending
  - TaskService › sortTasks › should return unsorted when sortBy is not provided

- unit/services/taskService.unassigned.test.js (2)
  - TaskService › calculateTaskStats › should calculate task statistics correctly
  - TaskService › calculateTaskStats › should handle empty task array

- unit/repositories/projectRepository.collaborators.test.js (3)
  - ProjectRepository › assignRole › should assign role to collaborator successfully
  - ProjectRepository › assignRole › should handle project not found
  - ProjectRepository › assignRole › should convert legacy collaborators to new format
  - ProjectRepository › setHasTasks › should update hasTasks flag successfully

#### Middleware Tests

- unit/middleware/roleMiddleware.functions.test.js (50+)
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

- unit/middleware/roleMiddleware.middleware.test.js (11)
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

**Note:** Redundant test file `roleMiddleware.test.js` has been removed. All helper function tests are now consolidated in `roleMiddleware.functions.test.js` for better maintainability without reducing coverage.

#### Controller Tests

- unit/controllers/authController.test.js (15)
  - AuthController › login › should login successfully with valid credentials
  - AuthController › login › should return error when email is missing
  - AuthController › login › should return error when password is missing
  - AuthController › login › should return error for invalid email format
  - AuthController › login › should return error when user not found
  - AuthController › login › should return error when password is invalid
  - AuthController › login › should handle server errors
  - AuthController › requestPasswordReset › should request password reset successfully
  - AuthController › requestPasswordReset › should return error when user not found
  - AuthController › requestPasswordReset › should handle server errors
  - AuthController › resetPassword › should reset password successfully
  - AuthController › resetPassword › should return error when user not found
  - AuthController › resetPassword › should return error when token is invalid
  - AuthController › resetPassword › should handle server errors
  - AuthController › should validate authentication flows

- unit/controllers/userController.test.js (18)
  - UserController › getProfile › should return user profile successfully
  - UserController › getProfile › should return 404 when user not found
  - UserController › getProfile › should handle service errors
  - UserController › getTeamMembers › should return team members for users with canAssignTasks permission
  - UserController › getTeamMembers › should return all users for users with canSeeAllTasks permission
  - UserController › getTeamMembers › should return 404 when current user not found
  - UserController › getTeamMembers › should return 403 for users without sufficient permissions
  - UserController › getTeamMembers › should handle service errors
  - UserController › sendBulkInvitations › should send invitations successfully for HR users
  - UserController › sendBulkInvitations › should return 404 when current user not found
  - UserController › sendBulkInvitations › should return 403 for non-HR users
  - UserController › sendBulkInvitations › should return 400 for invalid email array
  - UserController › sendBulkInvitations › should return 400 for missing emails
  - UserController › sendBulkInvitations › should return 400 for invalid email format
  - UserController › sendBulkInvitations › should return 400 for invalid role
  - UserController › sendBulkInvitations › should skip existing users
  - UserController › sendBulkInvitations › should handle email sending failures
  - UserController › sendBulkInvitations › should handle service errors

- unit/controllers/organizationController.test.js (12)
  - OrganizationController › getAllDepartments › should return departments for SM users
  - OrganizationController › getAllDepartments › should return departments for HR users
  - OrganizationController › getAllDepartments › should return 403 when user not found
  - OrganizationController › getAllDepartments › should return 403 for insufficient permissions
  - OrganizationController › getAllDepartments › should handle service errors
  - OrganizationController › getTeamsByDepartment › should return teams for director accessing their own department
  - OrganizationController › getTeamsByDepartment › should return 403 for director accessing different department
  - OrganizationController › getTeamsByDepartment › should allow access for non-existent department
  - OrganizationController › getTeamsByDepartment › should return teams for manager users
  - OrganizationController › getTeamsByDepartment › should return teams for SM users
  - OrganizationController › getTeamsByDepartment › should return teams for HR users
  - OrganizationController › getTeamsByDepartment › should return 403 for staff users

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
