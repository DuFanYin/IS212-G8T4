# IS212-G8T4 Project

Task Management System for Modern Teams

## Project Structure

### Backend Architecture

The backend follows a clean, layered architecture pattern for better separation of concerns and maintainability:

```
backend/
│── package.json
│── node_modules/
└── src/
    ├── app.js              # Express app configuration and middleware setup
    ├── server.js           # Server entry point and database initialization
    ├── routes/             # API route definitions and request mapping
    │   └── userRoutes.js   # Maps HTTP endpoints to controllers
    │
    ├── controllers/        # Request/Response handling and data validation
    │   └── userController.js  # Handles HTTP requests, validates input
    │
    ├── services/           # Business logic and data processing
    │   └── userService.js  # Core business logic, independent of HTTP
    │
    ├── db/                 # Database configuration and models
    │   ├── connect.js      # Database connection and configuration
    │   └── models/         # Mongoose schemas and models
    │
    └── middleware/         # Custom middleware functions
        └── authMiddleware.js  # Authentication and authorization checks

```

### Layer Responsibilities

1. **Routes (`/routes`)**
   - Define API endpoints and HTTP methods
   - Map requests to appropriate controllers
   - Handle URL parameter parsing
   - Group related endpoints together

2. **Controllers (`/controllers`)**
   - Handle HTTP requests and responses
   - Input validation and sanitization
   - Call appropriate services
   - Format response data
   - Error handling for HTTP layer

3. **Services (`/services`)**
   - Implement core business logic
   - Handle data processing and transformations
   - Interact with multiple models if needed
   - Transaction management
   - Independent of HTTP context

4. **Database (`/db`)**
   - Database connection configuration
   - Model definitions and schemas
   - Data validation rules
   - Database-specific utilities

5. **Middleware (`/middleware`)**
   - Reusable request processing logic
   - Authentication checks
   - Request logging
   - Error handling
   - Input preprocessing

### Benefits of This Structure

- **Separation of Concerns**: Each layer has a specific responsibility
- **Testability**: Easy to unit test each layer independently
- **Maintainability**: Changes in one layer don't affect others
- **Scalability**: Easy to add new features or modify existing ones
- **Code Reuse**: Common functionality can be shared across routes

## Quick Start

### Backend Setup
use this comand to genrate a JET token
node src/scripts/generateSecret.js



# use with caution!!!!!!

cd backend
npm run seed


this will WIPE and populate db with dunmmy data

```bash
cd backend
npm install
npm run dev     # Start development server
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev     # Start Next.js development server
```

### Environment Setup
1. Create `backend/.env`:
```
MONGO_URL=your_mongodb_url
PORT=3000
NODE_ENV=development
```




