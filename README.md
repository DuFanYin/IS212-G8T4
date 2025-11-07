# IS212-G8T4 Project

Task Management System for Modern Teams

## Documentation

For detailed documentation on specific parts of the project, see:

- **[Backend README](backend/README.md)** - Backend architecture, API routes, and implementation details
- **[Frontend README](frontend/README.md)** - Frontend structure, components, and development guide
- **[Test Documentation](backend/__tests__/README.md)** - Test structure, coverage, and testing guidelines

## Project Structure

### Frontend Architecture (Next.js 13+ App Router)


```
src/
├── app/                          # Next.js App Router pages
│   ├── home/
│   │   └── page.tsx             # Dashboard/home page
│   ├── login/
│   │   ├── page.tsx             # Login page
│   │   └── reset-password/
│   │       └── page.tsx         # Password reset page (email-based)
│   ├── register/
│   │   └── page.tsx             # Public registration page (invitation-based)
│   ├── organisation/
│   │   └── page.tsx             # Organization management
│   ├── projects-tasks/          # Combined projects and tasks interface
│   │   ├── page.tsx             # Main projects-tasks page
│   │   ├── project/
│   │   │   └── [id]/
│   │   │       └── page.tsx     # Individual project view with role assignment
│   │   └── task/
│   │       └── [id]/
│   │           └── page.tsx     # Individual task view
│   ├── report/
│   │   └── department/
│   │       └── page.tsx        # Department reports
│   ├── users/
│   │   └── page.tsx             # User management (with HR bulk invitations)
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Landing page
│   ├── favicon.ico              # App favicon
│   └── globals.css              # Global styles
├── components/                   # Reusable UI components
│   ├── features/
│   │   ├── ActivityLogList.tsx  # Activity log display
│   │   ├── AssignRoleModal.tsx  # Role assignment modal for projects
│   │   ├── AttachmentList.tsx   # File attachment list
│   │   ├── AttachmentUpload.tsx # File upload component
│   │   ├── ProjectProgress.tsx  # Project progress tracking component
│   │   ├── projects/
│   │   ├── reports/
│   │   ├── tasks/
│   │   ├── TaskFilterBar.tsx     # Task filtering bar component
│   │   ├── TaskSortSelect.tsx   # Task sorting selector component
│   │   ├── TaskStatusFilter.tsx  # Task status filter component
│   │   ├── timeline/            # Timeline-related components (empty directory)
│   │   └── users/
│   ├── forms/
│   ├── layout/
│   └── timeline/
├── contexts/
│   └── UserContext.tsx          # Global user state management
├── lib/
│   ├── hooks/
│   ├── services/                # API service layer (split by domain)
│   ├── types/                   # TypeScript type definitions
│   └── utils/
```

### Backend Architecture (Express)

```
src/
├── domain/                    # Pure business logic classes
├── repositories/              # Data access layer
├── services/                 # Business operations layer
├── controllers/              # HTTP request handling
├── middleware/               # Request processing middleware
├── utils/                    # Utility helpers
│   ├── errors.js            # Custom error classes
│   ├── responseHelper.js    # Standardized API response helpers
│   └── asyncHandler.js      # Async route wrapper
├── routes/                   # API route definitions
├── scripts/                  # Utility scripts
│   └── generateSecret.js
├── storage/                  # File storage for task attachments
│   └── <taskId>/             # Dynamic folders per task ID
│       └── <timestamp>-<random>.<ext>  # Uploaded files (PDF, DOCX, XLSX)
├── app.js                    # Express application setup
├── server.js                 # Server startup and configuration
└── db/
    ├── connect.js            # Database connection
    ├── schema.md             # Database schema documentation
    ├── seedData.js           # Database seeding script
    ├── seed/                 # Database seeding infrastructure
    │   ├── config.js
    │   ├── index.js
    │   ├── seeders/          # Individual seeder files
    │   └── utils/            # Seeding utilities
    │       ├── faker.js
    │       └── random.js
    └── models/               # Clean schema definitions only
```

## Architecture Design

### Backend Design

The backend follows a **Domain-Driven Design (DDD)** architecture with clear separation of concerns:

- **Domain Layer**: Pure business logic classes (User, Task, Project, Subtask, ActivityLog) containing validation rules, permission checks, and business operations
- **Repository Layer**: Data access abstraction handling all MongoDB operations, providing a clean interface for data persistence
- **Service Layer**: Business operations orchestrating domain logic and repository calls, handling complex workflows and cross-entity operations
- **Controller Layer**: HTTP request handlers that validate input, call services, and format responses
- **Middleware**: Centralized authentication, authorization (role-based access control), error handling, and file upload processing

**Key Design Principles:**
- Separation of concerns with clear layer boundaries
- Centralized role-based access control via `roleMiddleware`
- Standardized error handling and API responses
- Support for file attachments with validation (PDF, DOCX, XLSX)
- Soft delete pattern for data retention

### Frontend Design

The frontend uses **Next.js 13+ App Router** with a component-based architecture:

- **App Router**: File-based routing with server and client components, organized by feature domains
- **Component Architecture**: 
  - Feature components grouped by domain (tasks, projects, users, reports)
  - Reusable form components for CRUD operations
  - Layout components for consistent UI structure
- **State Management**: React Context API for global user state, custom hooks for domain-specific logic
- **API Layer**: Type-safe service layer split by domain (auth, tasks, projects, etc.) with centralized error handling
- **Type Safety**: Comprehensive TypeScript coverage with domain-specific type definitions

**Key Design Principles:**
- Feature-based organization for maintainability
- Custom hooks for reusable business logic (tasks, metrics, timeline)
- Type-safe API communication with backend
- Role-based UI rendering and access control
- Responsive design with Tailwind CSS

## Quick Start

### Backend Setup
```bash
cd backend
npm install
npm run dev     # Start development server
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev     # Start Next.js development server (port 3001)
```

### Environment Setup
1. Create `backend/.env`:
```
MONGO_URL=your_mongodb_url
PORT=3000
NODE_ENV=development
JWT_SECRET=your_generated_secret
```

### Database Setup
The project uses MongoDB Atlas with two databases:
- `is212_dev`: Development database
- `is212_test`: Testing database

```bash
# Seed development/test data (run from repo root)
NODE_ENV=development npm run seed --prefix backend  # Development
NODE_ENV=test npm run seed --prefix backend        # Testing
```

### CI/CD Setup

See [`.github/SETUP_GUIDE.md`](.github/SETUP_GUIDE.md) for setup instructions.

The CI runs on every push/PR and tests backend, frontend, and build.