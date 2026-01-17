# Assignment 2 - Task Division

## 📋 Overview

This document outlines the task division for Assignment 2. Each developer should work on their assigned tasks, creating a separate branch, commit, and pull request for EACH task.

---

## 🔀 Git Workflow (For Both Developers)

For **EACH** task:
1. Create a new branch: `git checkout -b feature/task-X-description`
2. Complete the task
3. Commit: `git commit -m "Task X: description"`
4. Push: `git push origin feature/task-X-description`
5. Create a Pull Request on GitHub/GitLab
6. Wait for approval, then merge

---

# 👨‍💻 Developer 1 - Tasks 1-3

## Task 1: Project Setup & TypeScript Migration

### Branch: `feature/task-1-typescript-setup`

#### 1.1 Install TypeScript Dependencies
```bash
npm install typescript ts-node @types/node @types/express --save-dev
npm install @types/mongoose --save-dev
```

#### 1.2 Initialize TypeScript
```bash
npx tsc --init
```

#### 1.3 Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

#### 1.4 Create Project Structure:
```
src/
├── app.ts
├── server.ts
├── config/
│   └── database.ts
├── models/
│   ├── User.ts
│   ├── Post.ts
│   └── Comment.ts
├── routes/
│   ├── user.routes.ts
│   ├── post.routes.ts
│   ├── comment.routes.ts
│   └── auth.routes.ts
├── controllers/
│   ├── user.controller.ts
│   ├── post.controller.ts
│   ├── comment.controller.ts
│   └── auth.controller.ts
├── middleware/
│   └── auth.middleware.ts
├── types/
│   └── index.ts
└── utils/
    └── jwt.ts
```

#### 1.5 Update `package.json` scripts:
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "ts-node-dev --respawn src/server.ts",
    "test": "jest --coverage",
    "test:watch": "jest --watch"
  }
}
```

#### 1.6 Migrate Existing Models to TypeScript
- Convert `models/Post.js` → `src/models/Post.ts`
- Convert `models/Comment.js` → `src/models/Comment.ts`

**Commit message:** `Task 1: Setup TypeScript configuration and project structure`

---

## Task 2: User Management (Full CRUD)

### Branch: `feature/task-2-user-crud`

#### 2.1 Create User Model (`src/models/User.ts`)
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  profilePicture?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  }
}, { timestamps: true });

export default mongoose.model<IUser>('User', userSchema);
```

#### 2.2 Create User Controller (`src/controllers/user.controller.ts`)
Implement the following functions:
- `getAllUsers` - GET /users
- `getUserById` - GET /users/:id
- `createUser` - POST /users
- `updateUser` - PUT /users/:id
- `deleteUser` - DELETE /users/:id

#### 2.3 Create User Routes (`src/routes/user.routes.ts`)
- Wire up all CRUD endpoints

#### 2.4 Update Post Model to Reference User
```typescript
// Add to Post model
owner: {
  type: Schema.Types.ObjectId,
  ref: 'User',
  required: true
}
```

#### 2.5 Update Comment Model to Reference User
```typescript
// Add to Comment model
owner: {
  type: Schema.Types.ObjectId,
  ref: 'User',
  required: true
}
```

**Commit message:** `Task 2: Implement User model with full CRUD operations`

---

## Task 3: Authentication System (JWT + Refresh Token)

### Branch: `feature/task-3-authentication`

#### 3.1 Install Authentication Dependencies
```bash
npm install bcryptjs jsonwebtoken
npm install @types/bcryptjs @types/jsonwebtoken --save-dev
```

#### 3.2 Create JWT Utility (`src/utils/jwt.ts`)
```typescript
import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};
```

#### 3.3 Add Refresh Token to User Model
```typescript
// Add to User model
refreshTokens: [{
  type: String
}]
```

#### 3.4 Create Auth Controller (`src/controllers/auth.controller.ts`)
Implement:
- `register` - POST /auth/register
  - Validate input
  - Hash password with bcrypt
  - Create user
  - Return access + refresh tokens

- `login` - POST /auth/login
  - Validate credentials
  - Compare password with bcrypt
  - Generate and return tokens

- `logout` - POST /auth/logout
  - Remove refresh token from user's list

- `refreshToken` - POST /auth/refresh
  - Validate refresh token
  - Generate new access token

#### 3.5 Create Auth Middleware (`src/middleware/auth.middleware.ts`)
```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = verifyAccessToken(token) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
```

#### 3.6 Create Auth Routes (`src/routes/auth.routes.ts`)
- POST /auth/register
- POST /auth/login
- POST /auth/logout
- POST /auth/refresh

**Commit message:** `Task 3: Implement JWT authentication with refresh token system`

---

# 👩‍💻 Developer 2 - Tasks 4-7

## Task 4: Update Posts and Comments

### Branch: `feature/task-4-update-posts-comments`

#### 4.1 Update Post Controller (`src/controllers/post.controller.ts`)
- Add authentication requirement for creating/updating/deleting posts
- Use `req.userId` as owner when creating posts
- Verify ownership before update/delete

#### 4.2 Update Post Routes
```typescript
import { authenticate } from '../middleware/auth.middleware';

// Protected routes
router.post('/', authenticate, postController.createPost);
router.put('/:id', authenticate, postController.updatePost);
router.delete('/:id', authenticate, postController.deletePost);

// Public routes
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);
```

#### 4.3 Update Comment Controller (`src/controllers/comment.controller.ts`)
- Same pattern as posts - authentication for write operations

#### 4.4 Update Comment Routes
- Apply authentication middleware to protected routes

#### 4.5 Add Population for User Data
```typescript
// When fetching posts
const posts = await Post.find().populate('owner', 'username email profilePicture');

// When fetching comments
const comments = await Comment.find({ postId })
  .populate('owner', 'username email profilePicture');
```

**Commit message:** `Task 4: Update Posts and Comments with User references and authentication`

---

## Task 5: Jest Unit Tests

### Branch: `feature/task-5-jest-tests`

#### 5.1 Install Jest Dependencies
```bash
npm install jest ts-jest @types/jest supertest @types/supertest mongodb-memory-server --save-dev
```

#### 5.2 Create Jest Configuration (`jest.config.js`)
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/server.ts',
    '!src/types/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts']
};
```

#### 5.3 Create Test Setup (`src/tests/setup.ts`)
```typescript
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
```

#### 5.4 Create Test Files:

**`src/tests/auth.test.ts`**
```typescript
import request from 'supertest';
import app from '../app';

describe('Auth Endpoints', () => {
  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should fail with duplicate email', async () => {
      // First registration
      await request(app).post('/auth/register').send({
        username: 'user1',
        email: 'test@example.com',
        password: 'password123'
      });

      // Duplicate
      const res = await request(app).post('/auth/register').send({
        username: 'user2',
        email: 'test@example.com',
        password: 'password123'
      });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login existing user', async () => {
      // Register first
      await request(app).post('/auth/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      // Login
      const res = await request(app).post('/auth/login').send({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
    });

    it('should fail with wrong password', async () => {
      // Register first
      await request(app).post('/auth/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      // Login with wrong password
      const res = await request(app).post('/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

      expect(res.status).toBe(401);
    });
  });

  // Add more tests for logout and refresh
});
```

**`src/tests/user.test.ts`** - Tests for all User CRUD operations

**`src/tests/post.test.ts`** - Tests for all Post CRUD operations

**`src/tests/comment.test.ts`** - Tests for all Comment CRUD operations

**Commit message:** `Task 5: Add Jest unit tests with mongodb-memory-server`

---

## Task 6: Swagger Documentation

### Branch: `feature/task-6-swagger`

#### 6.1 Install Swagger Dependencies
```bash
npm install swagger-jsdoc swagger-ui-express
npm install @types/swagger-jsdoc @types/swagger-ui-express --save-dev
```

#### 6.2 Create Swagger Configuration (`src/config/swagger.ts`)
```typescript
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Assignment 2 REST API',
      version: '1.0.0',
      description: 'REST API with Users, Posts, Comments, and JWT Authentication'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
```

#### 6.3 Add Swagger to App (`src/app.ts`)
```typescript
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

#### 6.4 Add JSDoc Comments to Routes
Example for auth routes:
```typescript
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 */
```

Add similar documentation for all endpoints:
- Auth: register, login, logout, refresh
- Users: CRUD operations
- Posts: CRUD operations
- Comments: CRUD operations

**Commit message:** `Task 6: Add Swagger API documentation`

---

## Task 7: Final Verification

### Branch: `feature/task-7-final-verification`

#### 7.1 Run Tests with Coverage
```bash
npm test
```

#### 7.2 Verify Coverage is Sufficient
Make sure coverage is above 70% for:
- Statements
- Branches
- Functions
- Lines

#### 7.3 Take Screenshots
1. Jest coverage terminal output
2. Git network graph (GitHub/GitLab)

#### 7.4 Create Recording
Record a short video showing:
- Running `npm test`
- Tests passing
- Coverage report

#### 7.5 Final Cleanup
- Update README.md with:
  - Installation instructions
  - API documentation link
  - How to run tests
  - Environment variables needed

**Commit message:** `Task 7: Final verification and documentation`

---

## 📁 Final Project Structure

```
src/
├── app.ts                     # Express app configuration
├── server.ts                  # Server entry point
├── config/
│   ├── database.ts            # MongoDB connection
│   └── swagger.ts             # Swagger configuration
├── models/
│   ├── User.ts
│   ├── Post.ts
│   └── Comment.ts
├── routes/
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── post.routes.ts
│   └── comment.routes.ts
├── controllers/
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   ├── post.controller.ts
│   └── comment.controller.ts
├── middleware/
│   └── auth.middleware.ts
├── types/
│   └── index.ts
├── utils/
│   └── jwt.ts
└── tests/
    ├── setup.ts
    ├── auth.test.ts
    ├── user.test.ts
    ├── post.test.ts
    └── comment.test.ts
```

---

## 📊 Summary Table

| Task | Developer | Branch | Description |
|------|-----------|--------|-------------|
| 1 | Dev 1 | `feature/task-1-typescript-setup` | TypeScript & Project Structure |
| 2 | Dev 1 | `feature/task-2-user-crud` | User Model & CRUD |
| 3 | Dev 1 | `feature/task-3-authentication` | JWT Authentication |
| 4 | Dev 2 | `feature/task-4-update-posts-comments` | Update Posts & Comments |
| 5 | Dev 2 | `feature/task-5-jest-tests` | Jest Unit Tests |
| 6 | Dev 2 | `feature/task-6-swagger` | Swagger Documentation |
| 7 | Dev 2 | `feature/task-7-final-verification` | Final Verification |

---

## ⚠️ Important Notes

1. **Each task = 1 branch + 1 PR**
2. Developer 2 should wait for Developer 1's PRs to be merged before starting Task 4
3. Use meaningful commit messages
4. Review each other's code before merging
5. Keep the `.env` file updated with:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/assignment2
   JWT_ACCESS_SECRET=your-access-secret-key
   JWT_REFRESH_SECRET=your-refresh-secret-key
   ```
