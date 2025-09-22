# Backend Test Structure

This directory contains focused integration tests that verify core functionality as specified in project requirements.

## Structure

```
__tests__/
├── integration/         # Integration tests (API endpoints)
│   ├── auth.test.js     # Authentication & validation
│   ├── user.test.js     # Role-based permissions
│   └── task.test.js     # Task management & assignment
└── setup.js            # Test configuration
```

## Test Coverage

### Authentication (`auth.test.js`)
- Valid user login
- Invalid credentials handling
- Input validation (required fields, email format)

### Role-Based Permissions (`user.test.js`)
- User profile access
- Manager: can see team members
- Staff: cannot see team members  
- Director: can see department members
- Manager: cannot see department members

### Task Management (`task.test.js`)
- **Task Creation**: Create tasks with authentication, require auth for access
- **Task Visibility**: Role-based visibility (staff see own tasks, managers see team tasks)
- **Task Access**: Users can access tasks they're assigned to or collaborating on
- **Task Assignment**: Managers can assign tasks, staff cannot assign to higher roles
- **Status Updates**: Users can update task status with proper permissions
- **Task Archiving**: Soft delete functionality with authorization checks

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test auth.test.js
npm test user.test.js
npm test task.test.js
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