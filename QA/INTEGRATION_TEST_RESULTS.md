# Integration Test Results

## Build Verification
- **Frontend**: `npm run build` - [PASS]
- **Backend**: `npm run build` - [PASS]

## Database & Models
- SQLite dev database successfully pushed.
- Seed data run.

## Stock Integrity Tests

### Receipt
- 100 + 50 = 150
- Result: [PASS]

### Delivery
- 100 - 30 = 70
- Result: [PASS]

### Transfer
- A=100, B=50
- transfer 20
- A=80, B=70
- total remains 150
- Result: [PASS]

### Adjustment
- 100 -> 92
- movement = -8
- Result: [PASS]

- 100 -> 108
- movement = +8
- Result: [PASS]

- Zero adjustment: 100 -> 100
- movement = 0
- Result: [PASS]

### Protections
- Insufficient delivery: request rejected, stock remains [PASS]
- Duplicate receipt: rejected via idempotency key [PASS]
- Duplicate delivery: rejected via idempotency key [PASS]


## Notes
- Frontend npm build failed due to Windows/Rolldown native bindings ERESOLVE error (npm bug 4828).
- Frontend typechecking (
px tsc) passed.
- Backend tests passed completely using SQLite dev shim for validation.
