# Denim & Tailor Workshop Management System

Next.js 14 App Router · TypeScript · Tailwind CSS · Lucide React

## Stage 2 modules
- Customer directory with name/phone search, duplicate normalized-phone validation, and WhatsApp links.
- Customer profiles with multiple measurement categories, editable measurement cards, configurable cm/inch units, fitting notes, and order history.
- Multi-item order creation/editing, workload and price calculations, customer measurement links, cash change calculation, and status queue.
- DP income records are created automatically for new orders with DP.
- Completing or picking up an order automatically settles its remaining balance when `auto_settle_on_completed` is enabled. A reference-order/tag check prevents duplicate settlement transactions.
- Printable receipt preview and itemized WhatsApp receipt.

## Run locally
```bash
npm install
npm run dev
```

## Deploy to Vercel
Import the GitHub repository. Framework: Next.js. Build command: `npm run build`.

## Storage note
Data is still stored in browser LocalStorage (`denim_workshop_store_v1`). This stage does not synchronize data between devices. Configure a cloud database before using it as the only production record.
