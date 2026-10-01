# GETUP OS Agency Management System — Backend API

Production-ready backend architecture for the internal digital marketing agency management suite.

---

## Technology Stack
- **Runtime**: Node.js v24+
- **Framework**: Express.js with TypeScript
- **Database & ORM**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (Access Token + Refresh Token) & bcrypt
- **Validation**: Zod schema validation
- **Security**: Helmet, CORS, Rate Limiting, Cookie Parser

---

## Directory Architecture
```text
backend/
├── prisma/
│   ├── schema.prisma              # PostgreSQL normalized relational database schema
│   └── seed.ts                    # Development seed script
├── src/
│   ├── config/
│   │   ├── database.ts            # Prisma client singleton
│   │   └── env.ts                 # Environment variables loader
│   ├── controllers/               # Express request handlers
│   │   ├── auth.controller.ts
│   │   ├── client.controller.ts
│   │   ├── content.controller.ts
│   │   ├── finance.controller.ts
│   │   ├── package.controller.ts
│   │   ├── task.controller.ts
│   │   ├── team.controller.ts
│   │   ├── media.controller.ts
│   │   ├── campaign.controller.ts
│   │   ├── dashboard.controller.ts
│   │   ├── report.controller.ts
│   │   ├── notification.controller.ts
│   │   └── setting.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts     # JWT verification
│   │   ├── role.middleware.ts     # Role-based access control (RBAC)
│   │   ├── validate.middleware.ts # Zod validator
│   │   └── error.middleware.ts    # Centralized HTTP error handler
│   ├── routes/
│   │   └── index.ts               # Root API router (/api)
│   ├── services/
│   │   └── store.ts               # Resilient data persistence service
│   ├── types/                     # Shared TypeScript interfaces
│   ├── utils/
│   │   ├── apiResponse.ts         # Standardized JSON response formatting
│   │   ├── errors.ts              # Custom AppError classes
│   │   └── jwt.ts                 # Token sign & verify utilities
│   ├── app.ts                     # Express application configuration
│   └── server.ts                  # Server entrypoint
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

---

## Getting Started

### 1. Installation
```bash
cd backend
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env`:
```env
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/getup_management?schema=public"
JWT_SECRET="your_jwt_secret"
JWT_REFRESH_SECRET="your_refresh_secret"
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Run Development Server
```bash
npm run dev
```
The server will start at `http://localhost:4000/api`.

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/login` &mdash; Sign in team member (returns access token and user profile)
- `GET  /api/auth/me` &mdash; Get current authenticated user session
- `POST /api/auth/logout` &mdash; End user session

### Dashboard Analytics
- `GET  /api/dashboard` &mdash; Aggregate agency KPIs, quota fulfillment totals, urgent tasks, pending invoices, recent activity

### Clients Directory
- `GET    /api/clients` &mdash; List clients with search, status, package, and payment status filters
- `GET    /api/clients/:id` &mdash; Detailed client record including quotas, deliverables, tasks, and billing
- `POST   /api/clients` &mdash; Create client (auto-provisions monthly deliverables quota)
- `PUT    /api/clients/:id` &mdash; Update client details
- `DELETE /api/clients/:id` &mdash; Delete client record

### Content Production Pipeline
- `GET    /api/content` &mdash; List content items (filter by client, type, status, platform)
- `POST   /api/content` &mdash; Schedule content item
- `PUT    /api/content/:id` &mdash; Update content metadata
- `PATCH  /api/content/:id/status` &mdash; Change content status (auto-syncs client deliverable quota)
- `DELETE /api/content/:id` &mdash; Remove content piece

### Content Calendar
- `GET    /api/calendar` &mdash; Deliverables and publishing schedule formatted for calendar grid

### Tasks & Operations
- `GET    /api/tasks` &mdash; List tickets (filter by client, assignee, status, priority)
- `POST   /api/tasks` &mdash; Create operational task
- `PUT    /api/tasks/:id` &mdash; Update task details
- `PATCH  /api/tasks/:id/status` &mdash; Transition kanban status (Todo &rarr; In Progress &rarr; Review &rarr; Completed)
- `DELETE /api/tasks/:id` &mdash; Delete task

### Agency Team & Workload
- `GET    /api/team` &mdash; List team members with active workload and role details
- `POST   /api/team` &mdash; Add new team member
- `PUT    /api/team/:id` &mdash; Update member details or workload
- `DELETE /api/team/:id` &mdash; Remove team member

### Service Packages & Retainers
- `GET    /api/packages` &mdash; List service package tiers
- `POST   /api/packages` &mdash; Create package tier with deliverable quota template
- `PUT    /api/packages/:id` &mdash; Update package pricing or services
- `DELETE /api/packages/:id` &mdash; Delete package tier
- `GET    /api/packages/quotas/all` &mdash; List monthly quota records
- `PUT    /api/packages/quotas/:id` &mdash; Adjust quota allocated/completed numbers
- `POST   /api/packages/quotas/generate` &mdash; Generate quota batch for next month

### Finance Suite
- `GET    /api/finance/overview` &mdash; Invoiced, collected, pending, expenses, and net profit
- `GET    /api/finance/invoices` &mdash; Invoices and Quotations list with balance tracking
- `POST   /api/finance/invoices` &mdash; Create Quotation or Tax Invoice (auto-creates payment receipt on advance)
- `POST   /api/finance/invoices/:id/pay` &mdash; Mark invoice as fully paid
- `DELETE /api/finance/invoices/:id` &mdash; Delete invoice
- `GET    /api/finance/payments` &mdash; Payment receipts ledger
- `POST   /api/finance/payments` &mdash; Record payment (updates balance due on invoice)
- `DELETE /api/finance/payments/:id` &mdash; Void payment receipt (reverts balance on matching invoice)
- `GET    /api/finance/expenses` &mdash; Agency expenditures list
- `POST   /api/finance/expenses` &mdash; Record operational expense
- `DELETE /api/finance/expenses/:id` &mdash; Delete expense record

### Digital Media Vault
- `GET    /api/media` &mdash; Filter assets by folder, client, or search
- `POST   /api/media` &mdash; Store media metadata and asset record
- `DELETE /api/media/:id` &mdash; Delete asset

### Reports
- `GET    /api/reports` &mdash; Business P&L summary, monthly deliverables fulfillment ratios, expense distribution

### Notifications & Activity
- `GET    /api/notifications` &mdash; Operational alerts with unread counter
- `PATCH  /api/notifications/:id/read` &mdash; Mark notification as read
- `PATCH  /api/notifications/read-all` &mdash; Mark all alerts read
- `GET    /api/settings/activity` &mdash; Full system audit log
