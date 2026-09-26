# API Contract

## 1. Authentication

### `POST /api/auth/login`
- **Request Body**: `{ "email": "admin@stocksense.local", "password": "password123" }`
- **Auth**: None
- **Response**: `{ "user": { "id": "...", "email": "...", "role": "ADMIN" }, "token": "jwt-token-string" }`
- **Error**: `401 Unauthorized` `{ "success": false, "error": { "code": "INVALID_CREDENTIALS", "message": "..." } }`

### `POST /api/auth/register`
- **Request Body**: `{ "email": "...", "password": "...", "name": "..." }`
- **Auth**: None
- **Response**: `{ "user": { ... }, "token": "..." }`

### `GET /api/auth/me`
- **Auth**: Bearer Token
- **Response**: `{ "id": "...", "email": "...", "role": "..." }`

---

## 2. Products

### `GET /api/products`
- **Query Params**: `?page=1&limit=20&search=term&categoryId=id`
- **Auth**: Bearer Token
- **Response**: `{ "data": [{ "id": "...", "name": "...", "sku": "...", "stockLevels": [...] }], "meta": { "total": 1, ... } }`

### `POST /api/products`
- **Auth**: Bearer Token (Manager+)
- **Request Body**: `{ "name": "...", "sku": "...", "categoryId": "...", "uom": "pcs", "minimumStock": 10 }`
- **Response**: Product object.

---

## 3. Stock Movements (Receipts, Deliveries, Transfers, Adjustments)

### `GET /api/stock-movements`
- **Query Params**: `?type=RECEIPT|DELIVERY|TRANSFER|ADJUSTMENT&productId=id&page=1`
- **Auth**: Bearer Token
- **Response**: `{ "movements": [{ ... }], "meta": { ... } }`

### `POST /api/stock-movements`
- **Auth**: Bearer Token (Staff+)
- **Request Body**:
  - `productId`: UUID
  - `type`: `"RECEIPT" | "DELIVERY" | "TRANSFER" | "ADJUSTMENT"`
  - `quantity`: Number (positive)
  - `fromLocationId`: UUID (required for Delivery, Transfer, Adjustment)
  - `toLocationId`: UUID (required for Receipt, Transfer, Adjustment)
  - `documentId`: String (Optional, for idempotency check)
- **Response**: The created `StockMovement` ledger entry.
- **Side Effects**: Implicitly creates or updates rows in the `StockLevel` table.
- **Error**: `400 Bad Request` if insufficient stock, duplicate transfer location, etc.

---

## 4. Stock Levels

### `GET /api/stock-levels`
- **Query Params**: `?productId=id&locationId=id`
- **Auth**: Bearer Token
- **Response**: `{ "levels": [{ "productId": "...", "locationId": "...", "quantity": 150 }], "meta": { ... } }`

---

## 5. Dashboard

### `GET /api/dashboard/summary`
- **Auth**: Bearer Token
- **Response**: Aggregated stats: `{ "totalProducts": X, "lowStockAlerts": Y, "recentMovements": [...] }`
