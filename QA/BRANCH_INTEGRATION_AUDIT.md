# Branch Integration Audit

## 1. Branch Comparison & Status Overview

| Branch | Status | Framework | Summary |
|---|---|---|---|
| **origin/main** | Frontend UI (Ghosted-Coder) | React + Vite + TS + Tailwind | A pure UI frontend prototype. Uses static `mockData.ts` with no real API calls. |
| **origin/Mmber-1-(Backend)** | Backend | Next.js (App Router API) + Prisma + PostgreSQL + Jest | A TypeScript backend implementation. Replaces frontend code with a zipped backend project. |
| **origin/Member-2-(Inventory-Operations-Lead)** | Backend | Python + FastAPI + SQLAlchemy + Alembic | A Python backend implementation. Also deletes frontend code in favor of a zipped Python project. |

### Files Added, Modified, and Deleted
- **origin/main**: Added all React components (`App.tsx`, `DashboardView.tsx`, etc.), Tailwind config, and Vite config.
- **origin/Mmber-1-(Backend)**:
  - **Added**: `StockSense-Backend.zip`, `StockSense-Backend-Verified.zip`, `next.config.js`, `jest.config.js`, `.env`.
  - **Deleted**: ALL frontend React source code (e.g., `ActionModals.tsx`, `index.html`, `vite.config.ts`, `src/`).
- **origin/Member-2-(Inventory-Operations-Lead)**:
  - **Added**: `stocksense-inventory-v2-fixed.zip`.
  - **Deleted**: ALL frontend React source code and root configuration files.

> [!WARNING]
> **Severe Git Usage Issue**: Both Member 1 and Member 2 bypassed standard Git practices by deleting the repository's files and uploading their projects as `.zip` archives. A direct merge of either branch into `main` will delete the frontend and leave zipped files in the repository.

---

## 2. API & Frontend Compatibility

**Frontend Status**: The frontend is a static UI shell. 
- **API Calls**: There are **NO API calls** (`fetch` or `axios`) implemented in the frontend. All state is managed locally via React state and populated by `src/data/mockData.ts`.
- **API Compatibility**: Because the frontend lacks an API integration layer, it is currently incompatible out-of-the-box with both backends. The frontend must be wired to hit the backend routes (e.g., replacing mock data imports with `useEffect` data fetching).

---

## 3. Stock Logic & Duplicate Implementation

> [!IMPORTANT]  
> **Major Overlap**: Member 1 and Member 2 have implemented the exact same backend systems using completely different tech stacks. They have 100% overlapping business logic.

### Trace Analysis: Receipt, Delivery, Transfer, Adjustment

#### Member 1 (Next.js / Prisma)
- **Business Logic**: Centralized in `StockService.ts` running inside a concurrent-safe Prisma `$transaction`.
- **stock_movements**: Creates a `StockMovement` ledger entry for every operation.
- **stock_levels**: Materialized/Denormalized. Uses `tx.stockLevel.upsert` to dynamically update explicit quantity rows. Validates against negative stock using `updateMany` with `{ quantity: { gte: params.quantity } }`.

#### Member 2 (Python / FastAPI)
- **Business Logic**: Centralized in `inventory_service.py` using SQLAlchemy nested transactions. Includes advanced QA features like idempotency blocks.
- **stock_movements**: Creates `StockLedger` entries with `quantity_before` and `quantity_after`.
- **stock_levels**: Computed dynamically. Instead of a dedicated stock levels table, `get_stock()` calculates current stock using `func.sum(StockLedger.quantity)` on the fly. 

---

## 4. Recommendations & Integration Plan

### Which branch should be treated as the source of truth?
1. **Frontend Source of Truth**: `origin/main`. It contains the complete UI required by the project.
2. **Backend Source of Truth**: **origin/Mmber-1-(Backend)**. Since the frontend is written in React/TypeScript, choosing the Next.js/TypeScript backend creates a unified JavaScript/TypeScript ecosystem. The backend code can easily be merged into the React project to form a full-stack Next.js application, sharing Zod schemas and types.

### What should Member 2 contribute?
Member 2's Python code should be discarded as a codebase to avoid a split-stack architecture, **but** their rigorous QA logic must be ported. Member 2's backend hardening (as documented in their `QA/BACKEND_HARDENING.md`), specifically their explicit idempotency constraints and concurrency locks, should be reviewed and verified within Member 1's Next.js backend.

### What must be fixed before merging?
1. **Unpack the Code**: Do NOT merge the branches as they are. The chosen backend must be extracted from its `.zip` file.
2. **Git Tree Restoration**: The backend source code (`src/app/api`, `prisma/`) must be committed directly into the repository structure alongside the frontend code without deleting the frontend files.
3. **Frontend API Wiring**: The frontend's `mockData.ts` must be replaced with a robust API client (using `fetch` or `axios`, or React Query) that communicates with the backend routes (e.g., `GET /api/products`).

### Recommended Integration Order
1. **Create an Integration Branch**: Checkout a new branch `feature/fullstack-integration` based on `origin/main`.
2. **Extract Backend**: Unzip Member 1's `StockSense-Backend-Verified.zip` into the integration branch. Resolve folder structure (either put backend in a `/backend` workspace or merge into a unified Next.js app).
3. **Wire Frontend to Backend**: Implement API calls in the frontend to connect to the backend.
4. **Port Member 2's QA constraints**: Ensure Member 1's `StockService.ts` meets all of Member 2's strict inventory rules.
5. **Merge**: Once integrated and tested, merge the integration branch back into `main`.
