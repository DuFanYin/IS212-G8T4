# Backend Test Structure

This directory contains focused integration tests that verify core functionality as specified in project requirements.

## Structure

```
__tests__/
├── integration/         # Integration tests (API endpoints)
│   ├── auth.test.js     # Authentication & validation
│   └── user.test.js     # Role-based permissions
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

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test auth.test.js
npm test user.test.js
```

## Test Philosophy

Tests focus on **core business requirements** from project.md:
- Authentication works correctly
- Role-based permissions are enforced
- Input validation prevents errors

Tests avoid over-engineering by not testing:
- Every possible role combination
- Simple wrapper methods
- Implementation details