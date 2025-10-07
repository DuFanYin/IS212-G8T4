# Backend Test Structure

This directory contains focused integration tests that verify core functionality as specified in project requirements.

## Structure

```
__tests__/
├── integration/               # Integration tests (API endpoints)
│   ├── auth/
│   │   ├── login.test.js      # POST /api/auth/login (5)
│   │   ├── request-reset.test.js # POST /api/auth/request-reset (4)
│   │   └── reset-password.test.js # POST /api/auth/reset-password (5)
│   ├── organization/
│   │   ├── departments.test.js # GET /api/organization/departments (3)
│   │   ├── teams.test.js      # GET /api/organization/teams (4)
│   │   └── department-teams.test.js # GET /api/organization/departments/:id/teams (5)
│   ├── users/
│   │   ├── profile.test.js    # GET /api/users/profile (1)
│   │   ├── team-members.test.js # GET /api/users/team-members (3)
│   │   └── department-members.test.js # GET /api/users/department-members (3)
│   ├── tasks/
│   │   ├── create.test.js     # POST /api/tasks/ (4)
│   │   ├── list.test.js       # GET /api/tasks/ (2)
│   │   ├── get-by-id.test.js  # GET /api/tasks/:id (1)
│   │   ├── assign.test.js     # PUT /api/tasks/:id/assign (3)
│   │   ├── status.test.js     # PUT /api/tasks/:id/status (2)
│   │   ├── archive.test.js    # DELETE /api/tasks/:id (1)
│   │   ├── update.test.js     # PUT /api/tasks/:id (4)
│   │   ├── update-due-date.test.js # PUT /api/tasks/:id (3)
│   │   ├── department-tasks.test.js # GET /api/tasks/department/:id (4)
│   │   ├── project-tasks.test.js # GET /api/tasks/project/:id (3)
│   │   ├── team-tasks.test.js # GET /api/tasks/team/:id (3)
│   │   ├── unassigned-tasks.test.js # GET /api/tasks/unassigned (3)
│   │   └── priority_tasks.test.js # Task priority handling (4)
│   ├── subtasks/
│   │   ├── create.test.js     # POST /api/tasks/:id/subtasks (2)
│   │   ├── list.test.js       # GET /api/tasks/:id/subtasks (1)
│   │   ├── get-by-id.test.js  # GET /api/tasks/subtasks/:id (2)
│   │   ├── update.test.js     # PUT /api/tasks/subtasks/:id (2)
│   │   ├── update-status.test.js # PATCH /api/tasks/subtasks/:id/status (2)
│   │   └── delete.test.js     # DELETE /api/tasks/subtasks/:id (2)
│   ├── projects/
│   │   ├── create.test.js     # POST /api/projects (4)
│   │   ├── list.test.js       # GET /api/projects (2)
│   │   ├── update.test.js     # PUT /api/projects/:projectId (3)
│   │   ├── permissions.test.js # Role checks for update (2)
│   │   ├── collaborators.test.js # POST /api/projects/:id/collaborators (3)
│   │   ├── remove-collaborators.test.js # DELETE /api/projects/:id/collaborators (4)
│   │   ├── archive.test.js    # PATCH /api/projects/:projectId/archive (2)
│   │   └── department-projects.test.js # GET /api/projects/departments/:id (3)
└── setup.js                   # Test configuration
```

## All Test Files and Cases (117)

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
  - PUT /api/tasks/:id/assign › should allow managers to assign tasks to team members
  - PUT /api/tasks/:id/assign › should deny staff from assigning tasks
  - PUT /api/tasks/:id/assign › should prevent assigning to equal-or-higher role users

- tasks/status.test.js (2)
  - PUT /api/tasks/:id/status › should allow task status updates
  - PUT /api/tasks/:id/status › should require authentication for status updates

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

- tasks/priority_tasks.test.js (5)
  - Task API › should create task with projectId and priority successfully
  - Task API › should require priority when task has projectId
  - Task API › should return tasks sorted by descending priority
  - Task API › should throw error if changing projectId without providing new priority
  - Task API › should allow changing projectId with new priority

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
  - POST /api/projects/:projectId/collaborators › should add new collaborator
  - POST /api/projects/:projectId/collaborators › should prevent duplicate collaborators
  - POST /api/projects/:projectId/collaborators › should require authentication

- projects/archive.test.js (2)
  - PATCH /api/projects/:projectId/archive › should archive project
  - PATCH /api/projects/:projectId/archive › should unarchive project

- projects/department-projects.test.js (3)
  - GET /api/projects/departments/:departmentId › should return projects for department
  - GET /api/projects/departments/:departmentId › should require authentication
  - GET /api/projects/departments/:departmentId › should handle non-existent department

- projects/remove-collaborators.test.js (4)
  - DELETE /api/projects/:projectId/collaborators › should remove collaborator successfully
  - DELETE /api/projects/:projectId/collaborators › should require authentication
  - DELETE /api/projects/:projectId/collaborators › should validate project ownership
  - DELETE /api/projects/:projectId/collaborators › should prevent removing project owner

## Running Tests

```bash
# Run all tests
npm test

# Run a specific test file (examples)
npm test integration/auth/login.test.js
npm test integration/auth/request-reset.test.js
npm test integration/auth/reset-password.test.js
npm test integration/organization/departments.test.js
npm test integration/organization/teams.test.js
npm test integration/organization/department-teams.test.js
npm test integration/users/profile.test.js
npm test integration/tasks/create.test.js
npm test integration/tasks/priority_tasks.test.js
npm test integration/tasks/unassigned-tasks.test.js
npm test integration/subtasks/create.test.js
npm test integration/subtasks/update-status.test.js
npm test integration/projects/update.test.js
npm test integration/projects/remove-collaborators.test.js
npm test integration/projects/department-projects.test.js
```

## Test Philosophy

Tests focus on **core business requirements** with balanced coverage:
- **Authentication & Security**: Essential login flows and password reset functionality
- **Role-based Access Control**: Proper permission enforcement across all endpoints
- **Task Management**: CRUD operations, assignment, and filtering by organization structure
- **Project Collaboration**: Team-based project management and collaborator handling
- **Data Validation**: Input validation for required fields and business rules
- **Error Handling**: Graceful handling of common error scenarios

### Balanced Test Coverage (117 total tests)
- **Authentication**: 14 tests covering login, password reset, and security
- **User Management**: 7 tests for profile and team/department member access
- **Organization**: 12 tests for department and team hierarchy management
- **Task Management**: 65 tests covering CRUD, assignment, filtering, and priority
- **Subtask Management**: 11 tests for parent-child task relationships
- **Project Management**: 8 tests for project lifecycle and collaboration

### What We Test
- ✅ Core business functionality and user workflows
- ✅ Role-based permissions and access control
- ✅ Data validation and required field handling
- ✅ Authentication and security measures
- ✅ Error scenarios and edge cases that matter

### What We Don't Test
- ❌ Every possible input combination
- ❌ Implementation details and internal methods
- ❌ Excessive edge cases that don't add business value
- ❌ Simple wrapper functions or trivial operations