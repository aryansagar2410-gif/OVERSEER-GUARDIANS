# StockSense Backend

StockSense Backend is a secure, scalable, tested, and production-ready inventory management system backend built with Next.js App Router, Prisma, and PostgreSQL.

## Features

- **Authentication & RBAC**: Secure JWT-based authentication with `ADMIN`, `MANAGER`, `STAFF`, and `VIEWER` roles.
- **Inventory Management**: Create, view, update, and deactivate products with rich fields (SKU, barcode, UOM, stock levels).
- **Stock Movements**: Robust transactional stock ledger supporting `RECEIPT`, `DELIVERY`, `TRANSFER`, and `ADJUSTMENT`.
- **Low Stock System**: Configurable minimum stock and reorder levels with dedicated APIs.
- **Multi-Location Support**: Comprehensive management of Warehouses and their contained Locations.
- **Audit Logging**: Every sensitive action is recorded automatically (who, what, when, old/new data).
- **Rate Limiting**: Protection against brute-force login/registration attempts.

## Tech Stack

- **Framework**: Next.js (App Router API routes)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Authentication**: bcryptjs, jsonwebtoken
- **Testing**: Jest

## Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Ensure the following variables are set:
- `DATABASE_URL`: Your PostgreSQL connection string.
- `JWT_SECRET`: A secure random string for signing JWT tokens.

## Database Setup

1. Run Prisma migrations:

```bash
npx prisma migrate dev --name init
```

2. Generate Prisma Client:

```bash
npx prisma generate
```

## Seed Data

To populate the database with realistic demo data, run:

```bash
npx prisma db seed
```

**Seed Credentials (All use password: `password123`)**:
- `admin@stocksense.local` (ADMIN)
- `manager@stocksense.local` (MANAGER)
- `staff@stocksense.local` (STAFF)
- `viewer@stocksense.local` (VIEWER)

## Running Development Server

```bash
npm run dev
```

## Running Tests

```bash
npm test
```

## Building Production

```bash
npm run build
npm start
```

## API Documentation

- **Authentication**: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- **Products**: `/api/products` (CRUD), `/api/products/low-stock`, `/api/products/barcode/:barcode`
- **Warehouses & Locations**: `/api/warehouses`, `/api/locations` (CRUD operations linked correctly)
- **Stock Levels & Movements**: `/api/stock-levels`, `/api/stock-movements`
- **Dashboard**: `/api/dashboard/summary`
- **Audit Logs**: `/api/audit-logs`

## Roles and Permissions

- **ADMIN**: Full system access. Can delete/deactivate locations, warehouses, manage all users.
- **MANAGER**: Can create products, locations, warehouses, and view audit logs.
- **STAFF**: Can view and create stock movements, view products and stock levels.
- **VIEWER**: Read-only access to products and stock.

## Stock Movement Rules

- **RECEIPT**: Brings new stock into a location (source is null, destination required).
- **DELIVERY**: Takes stock out of a location to a customer (source required, destination null).
- **TRANSFER**: Moves stock between two valid locations.
- **ADJUSTMENT**: Corrects stock levels directly.

All stock changes run inside a concurrent-safe Prisma `$transaction`.
