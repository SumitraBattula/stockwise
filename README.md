# StockWise — Inventory Management for Small Retail Shops

StockWise is a MERN full-stack inventory management application for small retail businesses. It helps shop owners keep product quantities accurate, record stock movement, identify low-stock products, track batch expiry dates, and make explainable reorder decisions.

## Included features

- JWT-based registration and login; passwords hashed with bcrypt
- Shop-scoped data: each account only accesses its own inventory
- Product management (create, read, update, delete), search, category filters
- Stock-in and stock-out adjustments with a movement ledger and reason
- Sales and purchases that update inventory quantities
- Batch-level expiry tracking and near-expiry dashboard alerts
- Low-stock dashboard alerts
- Explainable reorder suggestions based on recent sales, supplier lead time, and safety stock
- CSV product export
- Responsive React interface

## Stack

- React + Vite
- Node.js + Express
- MongoDB + Mongoose
- JWT, bcryptjs
- Recharts for dashboard visualization

## Run locally

Prerequisites: Node.js 20+ and MongoDB (local or Atlas).

1. Copy `server/.env.example` to `server/.env`.
2. Set `MONGO_URI` and a long random `JWT_SECRET`.
3. Install packages from the root:

   ```bash
   npm install
   npm run install:all
   ```

4. Start both apps:

   ```bash
   npm run dev
   ```

Frontend: http://localhost:5173  
Backend: http://localhost:5000/api/health

If you prefer separate terminals:

```bash
npm run dev --prefix server
npm run dev --prefix client
```

## First use

Register a shop account. Add products and set each product's reorder level, safety stock, and supplier lead time. Use **Stock In** to record purchases/receipts and **Stock Out** to record sales or wastage. The dashboard derives alerts from saved inventory.

## Reorder logic

For a product with sales history:

- Average daily demand = quantity sold over the most recent 30 days / 30
- Reorder point = average daily demand × supplier lead time (days) + safety stock
- Suggested order quantity = max(0, target stock − current quantity)

The UI shows the components of the calculation so the recommendation is explainable. It is a simple baseline, not a demand-forecasting model. For products without sales history, the configured reorder level is used.

## Important limitations / next improvements

This is a complete learning-project MVP, not audited retail or accounting software. It does not include payments, GST invoicing, barcode scanning, offline synchronization, multi-branch inventory, or automated external notifications. For multi-item financial transactions, production use should add MongoDB replica-set transactions and robust idempotency. Add tests, rate limiting, secure deployment configuration, and user acceptance testing before using with real business data.

## Suggested resume wording (only after you run, test, and understand it)

**StockWise | MERN Stack Inventory Management System**
- Built a shop-scoped inventory platform with product management, stock-in/out records, and an inventory movement ledger using React, Express, and MongoDB.
- Implemented low-stock and batch-expiry alerts plus explainable reorder suggestions based on sales history, supplier lead time, and safety stock.
- Added JWT authentication, password hashing, product search/filtering, dashboard summaries, and CSV export.

Do not claim features you have not personally verified or contributions you cannot explain.
