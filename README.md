# IS212-G8T4 Project

Task Management System for Modern Teams

## Project Structure

### Frontend Architecture (Next.js 13+ App Router)

```
frontend/src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Root page
│   ├── globals.css        # Global styles
│   ├── home/              # Home page
│   ├── login/             # Authentication pages
│   ├── users/             # User management pages
│   ├── tasks/             # Task management pages
│   └── projects/          # Project pages
├── components/            # React components
│   ├── ui/                # Reusable UI primitives
│   ├── layout/            # Layout components (Header, etc.)
│   ├── forms/             # Form components (CreateTaskModal, etc.)
│   └── features/          # Feature-specific components
│       ├── tasks/         # Task-related components
│       └── users/         # User-related components
├── lib/                   # Shared utilities and logic
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
└── contexts/              # React contexts
    └── UserContext.tsx    # User state management
```

#### Frontend Organization Principles

- **App Router**: Next.js 13+ file-based routing with `app/` directory
- **Feature-based Components**: Components organized by domain (tasks, users)
- **Separation of Concerns**: UI primitives, layout, forms, and features separated
- **Consolidated Library**: All utilities, hooks, services, and types in `lib/`
- **Type Safety**: Comprehensive TypeScript coverage throughout
- **Modern Patterns**: Custom hooks, context providers, and component composition
 - **Single Hooks Location**: Use hooks from `src/lib/hooks`. Do not create or use `src/hooks`.

### Backend Architecture (Express)

```
backend/src/
├── app.js              # Express configuration
├── server.js           # Server entry point
├── routes/             # API endpoints
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── projectRoutes.js
│   ├── taskRoutes.js
│   └── subtaskRoutes.js
├── controllers/        # Request handlers
│   ├── authController.js
│   ├── userController.js
│   ├── projectController.js
│   ├── taskController.js
│   └── subtaskController.js
├── services/           # Business operations (error messages are minimal and meaningful)
│   ├── authService.js
│   ├── userService.js
│   ├── projectService.js
│   ├── taskService.js
│   ├── subtaskService.js
│   └── activityService.js
├── middleware/         # Custom middleware
│   └── authMiddleware.js
└── db/                 # Database
    ├── connect.js      # MongoDB connection
    ├── seed/           # Seed scripts
    └── models/         # Mongoose schemas
```

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