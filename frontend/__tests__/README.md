# Frontend Test Structure

This directory contains all frontend tests organized by functionality.

## Structure

```
__tests__/
├── components/          # Component tests
│   ├── Header.test.tsx
│   ├── UserSelector.test.tsx
│   └── UserList.test.tsx
├── pages/               # Page/route tests
│   ├── login.test.tsx
│   └── users.test.tsx
├── hooks/               # Custom hook tests
│   └── useUsers.test.tsx
├── utils/               # Utility function tests
├── fixtures/            # Test data and mocks
│   └── mocks/
│       └── api.ts
└── setup.ts            # Test configuration
```

## Test Categories

### Components (`components/`)
- **Header.test.tsx**: Tests header component rendering and user interactions
- **UserSelector.test.tsx**: Tests user selection component with role-based functionality
- **UserList.test.tsx**: Tests user list display with different role permissions

### Pages (`pages/`)
- **login.test.tsx**: Tests login page functionality, validation, and error handling
- **users.test.tsx**: Tests users page with role-based visibility and user management

### Hooks (`hooks/`)
- **useUsers.test.tsx**: Tests custom hooks for fetching users with different permissions

### Fixtures (`fixtures/`)
- **mocks/api.ts**: Mock API responses and services for consistent testing

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test UserSelector.test.tsx

# Run tests in watch mode
npm test -- --watch
```

## Test Patterns

### Component Testing
- Render components with necessary providers
- Test user interactions (clicks, form submissions)
- Verify conditional rendering based on props/state
- Mock external dependencies

### Hook Testing
- Use `renderHook` for testing custom hooks
- Test loading, success, and error states
- Verify dependency changes trigger re-fetches
- Mock API services

### Page Testing
- Test complete page functionality
- Verify role-based access and permissions
- Test navigation and state management
- Mock user context and API calls