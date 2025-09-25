# Backend Test Structure

This directory contains focused integration tests that verify core functionality as specified in project requirements.

## Structure

```
__tests__/
├── integration/               # Integration tests (API endpoints)
│   ├── auth/
│   │   └── login.test.js      # POST /api/auth/login (4)
│   ├── users/
│   │   ├── profile.test.js    # GET /api/users/profile (1)
│   │   ├── team-members.test.js # GET /api/users/team-members (2)
│   │   └── department-members.test.js # GET /api/users/department-members (2)
│   ├── tasks/
│   │   ├── create.test.js     # POST /api/tasks/ (2)
│   │   ├── list.test.js       # GET /api/tasks/ (2)
│   │   ├── get-by-id.test.js  # GET /api/tasks/:id (1)
│   │   ├── assign.test.js     # PUT /api/tasks/:id/assign (2)
│   │   ├── status.test.js     # PUT /api/tasks/:id/status (1)
│   │   └── archive.test.js    # DELETE /api/tasks/:id (1)
│   ├── projects/
│   │   ├── create.test.js     # POST /api/projects (5)
│   │   ├── list.test.js       # GET /api/projects (2)
│   │   ├── update.test.js     # PUT /api/projects/:projectId (2)
│   │   ├── permissions.test.js # Role checks for update (2)
│   │   ├── collaborators.test.js # POST/DELETE collaborators (4)
│   │   └── archive.test.js    # PATCH /api/projects/:projectId/archive (2)
└── setup.js                   # Test configuration
```

## All Test Files and Cases (41)

- auth/login.test.js (4)
  - POST /api/auth/login › should authenticate valid user
  - POST /api/auth/login › should reject invalid credentials
  - POST /api/auth/login › should validate required fields
  - POST /api/auth/login › should validate email format

- users/profile.test.js (1)
  - GET /api/users/profile › should return user profile when authenticated

- users/team-members.test.js (2)
  - GET /api/users/team-members › should allow managers to see team members
  - GET /api/users/team-members › should deny staff access to team members

- users/department-members.test.js (2)
  - GET /api/users/department-members › should allow directors to see department members
  - GET /api/users/department-members › should deny managers access to department members

- tasks/create.test.js (2)
  - POST /api/tasks/ › should create a new task
  - POST /api/tasks/ › should require authentication

- tasks/list.test.js (2)
  - GET /api/tasks/ › should return tasks for authenticated user
  - GET /api/tasks/ › should enforce role-based visibility

- tasks/get-by-id.test.js (1)
  - GET /api/tasks/:id › should return task by ID if user has access

- tasks/assign.test.js (2)
  - PUT /api/tasks/:id/assign › should allow managers to assign tasks
  - PUT /api/tasks/:id/assign › should deny staff from assigning tasks

- tasks/status.test.js (1)
  - PUT /api/tasks/:id/status › should allow status updates

- tasks/archive.test.js (1)
  - DELETE /api/tasks/:id › should archive task (soft delete)

- projects/create.test.js (5)
  - POST /api/projects › should return 401 when not authenticated
  - POST /api/projects › should create a project successfully with all fields
  - POST /api/projects › should create a project without optional fields
  - POST /api/projects › should fail if name is missing
  - POST /api/projects › should fail if deadline is invalid

- projects/list.test.js (2)
  - GET /api/projects › should return 401 when not authenticated
  - GET /api/projects › should return all projects successfully for authenticated user

- projects/update.test.js (2)
  - PUT /api/projects/:projectId › should update project name and description
  - PUT /api/projects/:projectId › should merge collaborators when updating collaborators array

- projects/permissions.test.js (2)
  - PUT /api/projects/:projectId permission checks › should not allow HR to update project
  - PUT /api/projects/:projectId permission checks › should allow manager to update project

- projects/collaborators.test.js (4)
  - POST /api/projects/:projectId/collaborators › should add a new collaborator
  - POST /api/projects/:projectId/collaborators › should not duplicate collaborators
  - DELETE /api/projects/:projectId/collaborators › should remove a collaborator successfully
  - DELETE /api/projects/:projectId/collaborators › should not allow removing the project owner

- projects/archive.test.js (2)
  - PATCH /api/projects/:projectId/archive › should archive the project
  - PATCH /api/projects/:projectId/archive › should unarchive the project

## Running Tests

```bash
# Run all tests
npm test

# Run a specific test file (examples)
npm test integration/auth/login.test.js
npm test integration/users/profile.test.js
npm test integration/tasks/create.test.js
npm test integration/projects/update.test.js
npm test integration/subtasks/create.test.js
```

## Test Philosophy

Tests focus on **core business requirements** from project.md:
- Authentication works correctly
- Role-based permissions are enforced
- Task management and assignment work properly
- Input validation prevents errors

Tests avoid over-engineering by not testing:
- Every possible role combination
- Simple wrapper methods
- Implementation details