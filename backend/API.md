# Backend API Reference

Audience: Frontend developers integrating the web app with the backend.

Base URL (local dev): http://localhost:3000/api

Authentication: Bearer JWT in `Authorization` header.

```
Authorization: Bearer <token>
```

Response shape (typical):
- Success: `{ status: "success", data: <payload> }`
- Error: `{ status: "error", message: <string> }`

---

## Auth

### POST /auth/login
Authenticate a user and receive a JWT.

Request
```
POST /api/auth/login
Content-Type: application/json
{
  "email": "manager@example.com",
  "password": "password123"
}
```

Response
```
200
{
  "status": "success",
  "data": { "token": "<jwt>", "userId": "..." }
}
```

Errors: 400 invalid input, 401 invalid credentials

---

## Users

### GET /users/profile
Return the current authenticated user's profile.

Headers: `Authorization: Bearer <token>`

Response (example)
```
200
{
  "status": "success",
  "data": {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": "manager|staff|director|hr|sm",
    "teamId": "...",
    "departmentId": "..."
  }
}
```

### GET /users/team-members
Managers can fetch their team members.

Headers: `Authorization`

Responses: 200 list, 403 forbidden for staff, 401 missing token

### GET /users/department-members/:departmentId?
Directors/HR/SM can fetch department members. If `:departmentId` omitted, uses user's department.

Headers: `Authorization`

Responses: 200 list, 403 forbidden, 401 missing token

---

## Projects

### POST /projects
Create a project.

Headers: `Authorization`, `Content-Type: application/json`

Body (any subset is allowed; `name` is required)
```
{
  "name": "Website Revamp",
  "description": "...",
  "deadline": "2025-12-31T00:00:00.000Z",
  "departmentId": "<deptId>",
  "collaborators": ["<userId>", "<userId>"]
}
```

Response
```
200
{
  "status": "success",
  "data": {
    "id": "...",
    "name": "...",
    "description": "...",
    "ownerId": "...",
    "ownerName": "...",
    "deadline": "...",
    "departmentId": "...",
    "departmentName": "...",
    "collaborators": ["..."],
    "collaboratorNames": ["..."],
    "isArchived": false,
    "hasContainedTasks": false,
    "isOverdue": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

Errors: 400 invalid/missing fields

### GET /projects
List active projects.

Headers: `Authorization`

Response: `{ status: "success", data: ProjectDTO[] }` (same fields as above)

### PUT /projects/:projectId
Update project fields. Collaborators are merged if provided.

Headers: `Authorization`, `Content-Type: application/json`

Body (example)
```
{
  "name": "New Name",
  "description": "New Desc",
  "deadline": "2026-01-31T00:00:00.000Z",
  "collaborators": ["<userId>"]
}
```

Response: `{ status: "success", data: ProjectDTO }`

### PATCH /projects/:projectId/archive
Set archive status.

Body
```
{ "isArchived": true|false }
```

Response: `{ status: "success", data: ProjectDTO }`

### POST /projects/:projectId/collaborators
Add a collaborator.

Body
```
{ "collaboratorId": "<userId>" }
```

Response: `{ status: "success", data: ProjectDTO }`

### DELETE /projects/:projectId/collaborators
Remove a collaborator.

Body
```
{ "collaboratorId": "<userId>" }
```

Response: `{ status: "success", data: ProjectDTO }`

Notes
- Department validation: collaborators must belong to the same department as the project.
- Owner cannot be removed.

---

## Tasks

Task status: `unassigned | ongoing | under_review | completed`

Task DTOs include enriched names when available: `projectName`, `assigneeName`, `createdByName`, `collaboratorNames`.

### POST /tasks/
Create a task.

Body (example)
```
{
  "title": "Draft spec",
  "description": "...",
  "dueDate": "2025-10-01T00:00:00.000Z",
  "projectId": "<projectId>",
  "collaborators": ["<userId>"]
}
```

Response: `{ status: "success", data: TaskDTO }`

Notes: If `projectId` provided, collaborators must be subset of project collaborators. Creator is auto-added.

### GET /tasks/
Get tasks visible to the current user (role-based visibility).

Response: `{ status: "success", data: TaskDTO[] }`

### GET /tasks/project/:projectId
Get all tasks for a project (filtered by visibility).

Response: `{ status: "success", data: TaskDTO[] }`

### GET /tasks/:id
Get a single task if visible.

Response: `{ status: "success", data: TaskDTO }` or 403

### PUT /tasks/:id
Update task fields. Staff are limited to certain fields.

Body (any subset)
```
{ "title": "...", "description": "...", "dueDate": "...", "collaborators": ["<userId>"] }
```

Response: `{ status: "success", data: TaskDTO }`

### PUT /tasks/:id/assign
Assign task to a user (managers and above; must assign to lower-ranked role).

Body
```
{ "assigneeId": "<userId>" }
```

Response: `{ status: "success", data: TaskDTO }`

### PUT /tasks/:id/status
Update task status.

Body
```
{ "status": "ongoing|under_review|completed|unassigned" }
```

Response: `{ status: "success", data: TaskDTO }`

### DELETE /tasks/:id
Soft delete a task.

Response: `{ status: "success", data: TaskDTO }`

---

## Subtasks

### GET /subtasks/:id
Get subtask by ID.

### GET /tasks/:parentTaskId/subtasks
List subtasks of a task.

### POST /tasks/:parentTaskId/subtasks
Create subtask under a task.

Body
```
{ "title": "...", "description": "...", "dueDate": "...", "collaborators": ["<userId>"] }
```

Note: Subtask collaborators must be a subset of the parent task's collaborators. Creator is auto-added.

### PUT /subtasks/:id
Update subtask fields.

### PATCH /subtasks/:id/status
Update subtask status.

### DELETE /subtasks/:id
Soft delete subtask.

Responses: All return `{ status, data }` on success; `{ status: "error", message }` on failure.

---

## Common Errors
- 400 Bad Request: validation or business rule failure (message provided)
- 401 Unauthorized: missing/invalid token
- 403 Forbidden: user lacks permission/visibility
- 404 Not Found: resource missing

---

## Quick cURL Examples

Login
```
curl -s -X POST http://localhost:3000/api/auth/login \
 -H 'Content-Type: application/json' \
 -d '{"email":"manager@example.com","password":"password123"}'
```

Create Project
```
curl -s -X POST http://localhost:3000/api/projects \
 -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
 -d '{"name":"Website Revamp"}'
```

Create Task (with project)
```
curl -s -X POST http://localhost:3000/api/tasks/ \
 -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
 -d '{"title":"Draft spec","projectId":"<projectId>"}'
```

Assign Task
```
curl -s -X PUT http://localhost:3000/api/tasks/<taskId>/assign \
 -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
 -d '{"assigneeId":"<userId>"}'
```

Add Project Collaborator
```
curl -s -X POST http://localhost:3000/api/projects/<projectId>/collaborators \
 -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
 -d '{"collaboratorId":"<userId>"}'
```

---

This document summarizes stable endpoints and response shapes to integrate the frontend quickly. Refer to `backend/ARCHITECTURE.md` for internal layers and domain rules.
