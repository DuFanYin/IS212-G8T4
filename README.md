# IS212-G8T4 Project

Task Management System for Modern Teams

## Project Structure

### Frontend Architecture (Next.js)

```
frontend/src/
├── app/                    # Next.js app router
│   ├── contexts/          # App-specific contexts (UserContext)
│   ├── home/             # Home page
│   ├── login/            # Login page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Root page
├── components/            # Shared components
│   ├── Navbar.tsx
│   └── UserProfile.tsx
├── services/             # API services
│   └── api.ts
├── types/               # TypeScript interfaces
│   └── user.ts
└── utils/              # Helper functions
    └── storage.ts
```

### Backend Architecture (Express)

```
backend/src/
├── app.js              # Express configuration
├── server.js           # Server entry point
├── routes/             # API endpoints
│   ├── authRoutes.js
│   └── userRoutes.js
├── controllers/        # Request handlers
│   ├── authController.js
│   └── userController.js
├── services/          # Business logic
│   └── userService.js
├── middleware/        # Custom middleware
│   └── authMiddleware.js
└── db/               # Database
    ├── connect.js    # MongoDB connection
    └── models/       # Mongoose schemas
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
The project uses MongoDB Atlas with three databases:
- `is212_dev`: Development database
- `is212_test`: Testing database
- `is212_prod`: Production database

```bash
# Seed development/test data (only for dev/test environments)
NODE_ENV=development npm run seed  # For development
NODE_ENV=test npm run seed        # For testing
```

### Test Credentials
```
Email: test123@example.com
Password: 123456
```


Backend Testing:
    Jest configuration for Node.js environment
    Example API test structure
    Test setup with environment handling
    Coverage reporting setup
Frontend Testing:
    Next.js-specific Jest configuration
    React Testing Library setup
    Component test example
    Mock setup for Next.js features
Common Features for Both:
    Separate test directories
    Coverage reporting
    Watch mode for development
    Basic setup files