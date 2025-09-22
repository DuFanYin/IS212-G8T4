# Frontend Test Structure

This directory contains all frontend tests organized by functionality. The tests have been refactored to follow Vitest best practices with clean mocking patterns and essential test coverage.

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

## Test Coverage Summary

**Total Tests:** 20 tests across 6 files
- **Components:** 11 tests (Header: 3, UserList: 5, UserSelector: 3)
- **Pages:** 6 tests (Login: 3, Users: 3)
- **Hooks:** 3 tests (useUsers: 3)

## Test Categories

### Components (`components/`)
- **Header.test.tsx**: Tests header component rendering and user interactions
- **UserSelector.test.tsx**: Tests user selection component with loading states and user interaction
- **UserList.test.tsx**: Tests user list display with loading, error, and role-based functionality

### Pages (`pages/`)
- **login.test.tsx**: Tests login page functionality, validation, and error handling
- **users.test.tsx**: Tests users page with role-based visibility and task assignment features

### Hooks (`hooks/`)
- **useUsers.test.tsx**: Tests custom hooks for fetching team and department members

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

# Run specific test suite
npm test -- --run components/
```

## Test Patterns & Best Practices

### Mocking Strategy
- **All `vi.mock()` calls at the top of files** - No nested imports
- **Single import of mocked functions** - Import once, use `vi.mocked()` globally
- **Clean mock management** - Use `mockFunction.mockReturnValue()` without re-importing
- **No nested require/import** - Eliminated `await import()` inside test bodies

### Component Testing
- Render components with necessary providers
- Test user interactions (clicks, form submissions)
- Verify conditional rendering based on props/state
- Mock external dependencies with proper typing

### Hook Testing
- Use `renderHook` for testing custom hooks
- Test loading, success, and error states
- Mock API services with proper Vitest mocks
- Verify hook return values and state changes

### Page Testing
- Test complete page functionality
- Verify role-based access and permissions
- Test navigation and state management
- Mock user context and API calls

## Essential Test Coverage

The tests focus on **meaningful functionality** rather than exhaustive coverage:

### Authentication Flow
- Login success/failure scenarios
- Form validation (email format)
- Error handling and user feedback

### Role-based Access
- Different user roles see appropriate content
- Permission-based feature visibility
- Task assignment capabilities

### Data Loading States
- Loading indicators
- Error state handling
- Success state rendering

### User Interactions
- Click handlers and form submissions
- User selection and navigation
- Dynamic content updates

## Refactoring Benefits

- **Reduced test count** from 23 to 20 tests (13% reduction)
- **Eliminated redundant tests** while maintaining coverage
- **Improved maintainability** with clean mocking patterns
- **Better TypeScript support** with proper mock typing
- **Faster test execution** with optimized test structure