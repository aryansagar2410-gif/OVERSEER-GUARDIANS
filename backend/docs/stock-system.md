# Stock System Architecture

This document describes the core architecture of the StockSense inventory math and ledger system.

## The Ledger Concept
The inventory system is built on a **ledger-first** design. Every operation that changes stock (receipt, delivery, transfer, adjustment) must be recorded as a `StockMovement`. 

The `StockLevel` table is merely a materialized view (current state) of the total sum of movements. However, to optimize read performance, `StockLevel` is maintained transactionally alongside `StockMovement` creation.

## Single Source of Truth
All stock calculations and database writes happen exclusively through the `StockService.ts`. 
No other module, API route, or service is allowed to manually `prisma.stockLevel.update()` or `prisma.stockMovement.create()`.

### The Transaction Flow
When `StockService.createMovement` is called:
1. **Validation**: Checks if product and locations exist, and validates the quantity > 0.
2. **Transaction Start**: A Prisma database transaction (`$transaction`) is opened.
3. **Ledger Entry**: A `StockMovement` is created.
4. **Stock Level Update**:
   - If `fromLocationId` is provided, the stock at the source location is decremented. If insufficient stock, it throws an error and rolls back.
   - If `toLocationId` is provided, the stock at the destination location is incremented (or upserted if it didn't exist).
5. **Commit/Rollback**: Both changes succeed together or fail together.

## Movement Types
1. **Receipt**: Stock arriving from a vendor.
   - `fromLocationId`: `null`
   - `toLocationId`: `[Warehouse Location ID]`
   - Stock increases.
2. **Delivery**: Stock leaving for a customer.
   - `fromLocationId`: `[Warehouse Location ID]`
   - `toLocationId`: `null`
   - Stock decreases.
3. **Transfer**: Moving stock between internal locations.
   - `fromLocationId`: `[Source Location ID]`
   - `toLocationId`: `[Destination Location ID]`
   - Total stock remains unchanged.
4. **Adjustment**: Fixing physical count mismatches.
   - If missing stock (negative adjustment): Use `fromLocationId`, keep `toLocationId` null.
   - If extra stock (positive adjustment): Use `toLocationId`, keep `fromLocationId` null.
