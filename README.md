# README.md - Soft Valley SRS Backend

## Overview

The Soft Valley Service Request System (SRS) is a Node.js/Express backend that manages service requests with role-based authentication (citizen, admin, agent), real-time notifications via Socket.io, and file upload capabilities.

## Prerequisites

- Node.js (v18+)
- PostgreSQL database
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# JWT Secrets
JWT_SECRET=your_access_token_secret_here
JWT_REFRESH_SECRET=your_refresh_token_secret_here

# Server
PORT=5000
NODE_ENV=development
```

### Required Environment Variables

- **DATABASE_URL**: PostgreSQL connection string used by Drizzle ORM [1](#0-0) 
- **JWT_SECRET**: Secret for signing access tokens (15min expiry) [2](#0-1) 
- **JWT_REFRESH_SECRET**: Secret for signing refresh tokens (7 days expiry) [3](#0-2) 
- **PORT**: Server port (defaults to 5000) [4](#0-3) 

## Available Scripts

- `npm run dev`: Start development server with nodemon [5](#0-4) 
- `npm run build`: Compile TypeScript to JavaScript [6](#0-5) 
- `npm start`: Start production server [7](#0-6) 

## Database Setup

The application uses Drizzle ORM with PostgreSQL. Run database migrations after setting up your database:

```bash
# Generate migrations (if you have schema changes)
npx drizzle-kit generate

# Run migrations
npx drizzle-kit migrate
```

## API Endpoints

### User API (`/api/users`)
- `POST /register` - Create new user account
- `POST /login` - Authenticate user
- `POST /create-request` - Submit service request
- `GET /getRequestById` - Get user's service requests
- `POST /refresh` - Refresh access token
- `POST /logout` - Logout user

### Admin API (`/api/admin`)
- `POST /create-task` - Assign request to agent
- `GET /filter-requests` - Filter requests by date/status

### Agent API (`/api/agents`)
- `GET /tasks` - View assigned tasks
- `PATCH /requests/:req_id/status` - Update request status

## Authentication

The system uses JWT with dual-token strategy:
- **Access Token**: 15 minutes expiry, sent in response body
- **Refresh Token**: 7 days expiry, stored in httpOnly cookie [8](#0-7) 

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

The server will start on the configured port (default: 5000).

## File Uploads

File uploads are handled via Multer with a 5MB limit and stored in the `uploads/` directory [9](#0-8) .

## Real-time Features

The application includes Socket.io for real-time notifications. Clients can join rooms using their `userId` to receive targeted updates [10](#0-9) .

## Notes

- Ensure your PostgreSQL database is running before starting the application
- JWT secrets should be strong, random strings in production
- The uploads directory should be created manually or ensure write permissions exist
- CORS is currently configured to allow all origins - update for production use

Wiki pages you might want to explore:
- [User API (yafetfaf07/soft_valley_srs)](/wiki/yafetfaf07/soft_valley_srs#3.1)
- [Glossary (yafetfaf07/soft_valley_srs)](/wiki/yafetfaf07/soft_valley_srs#7)

### Citations

**File:** src/index.ts (L6-6)
```typescript
 const db = drizzle(process.env.DATABASE_URL!);
```

**File:** src/utils/jwt.ts (L8-8)
```typescript
    this.secret =process.env.JWT_SECRET!;
```

**File:** src/utils/jwt.ts (L9-9)
```typescript
    this.refreshSecret = process.env.JWT_REFRESH_SECRET!;
```

**File:** app.ts (L56-56)
```typescript
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
```

**File:** app.ts (L65-68)
```typescript
  socket.on("join_room", (userId: string) => {
    socket.join(userId);
    console.log(`Socket ${socket.id} joined room: ${userId}`);
  });
```

**File:** app.ts (L86-86)
```typescript
const PORT = process.env.PORT || 5000;
```

**File:** package.json (L7-7)
```json
    "build": "tsc",
```

**File:** package.json (L8-8)
```json
    "start": "node dist/app.js",
```

**File:** package.json (L9-9)
```json
    "dev": "nodemon app.ts",
```

**File:** src/controllers/user_controllers.ts (L69-74)
```typescript
      res.cookie("token", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
```
