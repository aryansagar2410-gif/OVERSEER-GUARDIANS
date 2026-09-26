# Integration Architecture

## Overview
The application is structured as a full-stack monorepo with distinct frontend and backend directories:
- `/frontend`: React + Vite + Tailwind CSS frontend application.
- `/backend`: Next.js (App Router) API backend with Prisma ORM and PostgreSQL.

## Data Flow
```mermaid
flowchart TD
    UI[Frontend UI (React/Vite)] --> |HTTP/JSON| API[API Abstraction Layer]
    API --> |fetch| NextAPI[Next.js API Routes]
    NextAPI --> |Business Logic| Services[StockService / Auth Logic]
    Services --> |Prisma Client| ORM[Prisma]
    ORM --> |SQL| DB[(PostgreSQL)]
    
    DB --> Movements[stock_movements table]
    DB --> Levels[stock_levels table]
```

## Setup & Configuration

### Authentication Flow
- The backend issues JWT tokens upon successful login (`/api/auth/login`).
- The frontend must store this token (e.g., in `localStorage`) and include it as a Bearer token in the `Authorization` header for all protected API requests.

### Database Connection
- PostgreSQL is required.
- Connection string configured via `DATABASE_URL` in `backend/.env`.

### API Base URL & CORS
- The backend runs on `http://localhost:3000` by default.
- The frontend API client should use `/api` if proxied, or `http://localhost:3000/api` directly. 
- *Note*: If the frontend runs on a different port (e.g., 5173), CORS must be configured in Next.js (via `next.config.js` or middleware) or API requests must be proxied via Vite config (`vite.config.ts`). Proxied requests are recommended to bypass CORS.

### Environment Variables
**Backend (`backend/.env`)**:
- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_SECRET`: Secret key for signing JSON Web Tokens.

**Frontend (`frontend/.env`)**:
- `VITE_API_URL`: Base URL for the API (e.g., `http://localhost:3000/api` or `/api` if proxied).

### Development Startup Commands
**Backend**:
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```
