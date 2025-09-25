# Backend Test Structure

This directory contains focused integration tests that verify core functionality as specified in project requirements.

## Structure

```
__tests__/
├── integration/               # Integration tests (API endpoints)
│   ├── auth.test.js           # Auth endpoints
│   ├── user.test.js           # User endpoints
│   ├── task.test.js           # Task endpoints
│   └── project.test.js        # Project endpoints
└── setup.js                   # Test configuration
```

## All Test Cases (45)

- auth.test.js
  - POST /api/auth/login › should authenticate valid user
  - POST /api/auth/login › should reject invalid credentials
  - POST /api/auth/login › should validate required fields
  - POST /api/auth/login › should validate email format

- user.test.js
  - GET /api/users/profile › should return user profile when authenticated
  - GET /api/users/team-members › should allow managers to see team members
  - GET /api/users/team-members › should deny staff access to team members
  - GET /api/users/department-members › should allow directors to see department members
  - GET /api/users/department-members › should deny managers access to department members

- task.test.js
  - POST /api/tasks/ › should create a new task
  - POST /api/tasks/ › should require authentication
  - GET /api/tasks/ › should return tasks for authenticated user
  - GET /api/tasks/ › should enforce role-based visibility
  - GET /api/tasks/:id › should return task by ID if user has access
  - GET /api/tasks/:id › should deny access to unauthorized users
  - PUT /api/tasks/:id/assign › should allow managers to assign tasks
  - PUT /api/tasks/:id/assign › should deny staff from assigning tasks
  - PUT /api/tasks/:id/status › should allow status updates
  - DELETE /api/tasks/:id › should archive task (soft delete)

- project.test.js
  - POST /api/projects › should return 401 when not authenticated
  - POST /api/projects › should create a project successfully with all fields
  - POST /api/projects › should create a project without optional fields
  - POST /api/projects › should fail if name is missing
  - POST /api/projects › should fail if deadline is invalid
  - GET /api/projects › should return 401 when not authenticated
  - GET /api/projects › should return all projects successfully for authenticated user
  - PUT /api/projects/:projectId › should update project name and description
  - PUT /api/projects/:projectId › should merge collaborators when updating collaborators array
  - PUT /api/projects/:projectId permission checks › should not allow HR to update project
  - PUT /api/projects/:projectId permission checks › should allow manager to update project
  - POST /api/projects/:projectId/collaborators › should add a new collaborator
  - POST /api/projects/:projectId/collaborators › should not duplicate collaborators
  - PATCH /api/projects/:projectId/archive › should archive the project
  - PATCH /api/projects/:projectId/archive › should unarchive the project
  - PATCH /api/projects/:projectId/archive permission checks › should not allow HR to archive the project
  - PATCH /api/projects/:projectId/archive permission checks › should allow manager to archive the project
  - DELETE /api/projects/:projectId/collaborators › should remove a collaborator successfully
  - DELETE /api/projects/:projectId/collaborators › should not allow removing the project owner
  - DELETE /api/projects/:projectId/collaborators › should return error if collaborator does not exist

- subtask.test.js
  - GET /api/tasks/:parentTaskId/subtasks › should get subtasks by parent task
  - GET /api/subtasks/:id › should get a single subtask by id
  - POST /api/tasks/:parentTaskId/subtasks › should create a subtask under a parent task
  - PUT /api/subtasks/:id › should update a subtask
  - PATCH /api/subtasks/:id/status › should update a subtask status
  - DELETE /api/subtasks/:id › should soft delete a subtask

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test integration/auth.test.js
npm test integration/user.test.js
npm test integration/task.test.js
npm test integration/project.test.js
npm test integration/subtask.test.js
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