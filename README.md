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
```bash
# Generate JWT secret
node src/scripts/generateSecret.js

# Populate database with test data (Warning: This will clear existing data)
cd backend
npm run seed
```

### Test Credentials
```
Email: test123@example.com
Password: 123456
```