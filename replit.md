## Overview

This is a Progressive Web App (PWA) for task planning and reminders. It permanently uses Firebase Realtime Database for all storage needs, including user accounts, tasks, scores, and analytics.

Key features include:
- User authentication (Firebase-backed)
- Task CRUD operations with filtering and search
- Priority-based task management
- Weekly, monthly, and yearly productivity scoring
- Analytics dashboard with persistent history
- Push notifications and offline capabilities
- PWA support

## Replit Setup

### Running the Application

The project is configured to run on **port 5000** with both frontend and backend served together.

**Development:**
```bash
npm run dev
```

**Production Build:**
```bash
npm run build
npm run start
```

### Database

The application uses Firebase Realtime Database:
- **Required Secrets**:
  - `FIREBASE_DATABASE_URL`
  - `FIREBASE_SECRET`
- Types defined in `shared/schema.ts`
- Storage implementation in `server/firebase-storage.ts`

## System Architecture

### Backend Architecture
- **Runtime**: Node.js with Express
- **Session Management**: express-session with MemoryStore (PostgreSQL session storage removed)
- **Data Layer**: Direct Firebase REST API integration via `FirebaseStorage` class.

### Recent Changes

- **2025-12-29**: Hardened Firebase integration
  - Removed all PostgreSQL, Drizzle ORM, and database migration dependencies.
  - Simplified `shared/schema.ts` to use pure Zod and TypeScript interfaces.
  - Switched session storage to MemoryStore for simpler cloud deployments.
  - Cleaned up `package.json` to remove unused database drivers and tools.

## Firebase Collections

The app uses these Firebase collections under the user's account:
- **users**: User accounts with authentication
- **tasks**: Active task records
- **scoreHistory**: Immutable score transaction log (completed/missed events)
- **analyticsHistory**: Immutable analytics event log (created/completed/missed events)
