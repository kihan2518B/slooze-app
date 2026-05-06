# Slooze – Role-Based Food Ordering App

A full-stack, production-grade food ordering web application with RBAC (Role-Based Access Control) and ReBAC (Relationship-Based Access Control) built with Next.js 14, Prisma, and PostgreSQL.

---

## Tech Stack

| Layer      | Technology                                        |
| ---------- | ------------------------------------------------- |
| Frontend   | Next.js 16 (App Router), TypeScript, Tailwind CSS |
| Backend    | Next.js API Routes (serverless)                   |
| Database   | PostgreSQL via NeonDB + Prisma ORM 6.8            |
| Auth       | JWT (httpOnly cookies) + bcrypt password hashing  |
| Images     | Cloudinary (optional)                             |
| Deployment | Vercel-ready                                      |

---

## Features

- **Full Authentication** – Register restaurant + admin account, JWT-based login with httpOnly cookies
- **RBAC** – Admin / Manager / Member roles with fine-grained permissions
- **ReBAC** – Country-scoped data access (India users can't see American data and vice versa)
- **Restaurant Browsing** – View restaurants and menus filtered by your country
- **Cart System** – Add/remove items, update quantities
- **Order Placement** – Managers & Admins can checkout and pay
- **Dummy Payment Gateway** – Card, UPI, QR, Wallet simulated payment flows
- **Order Management** – History, cancel orders (Manager/Admin only)
- **Admin Panel** – Create users, manage restaurants, configure payment methods
- **Cloudinary** – Optional image upload for restaurants and menu items

---

## Role Permissions

| Feature                 | Admin | Manager          | Member   |
| ----------------------- | ----- | ---------------- | -------- |
| View restaurants & menu | ✅    | ✅               | ✅       |
| Add items to cart       | ✅    | ✅               | ✅       |
| Place order (checkout)  | ✅    | ✅               | ❌       |
| Cancel order            | ✅    | ✅               | ❌       |
| Manage payment methods  | ✅    | ❌               | ❌       |
| Create users            | ✅    | ❌               | ❌       |
| View all orders         | ✅    | ✅ (own country) | Own only |

## ReBAC (Country Scoping)

- **Admin** – Sees all restaurants and orders across India and America
- **Manager/Member (India)** – Can only access Indian restaurants, menus, and orders
- **Manager/Member (America)** – Can only access American restaurants, menus, and orders

---

## Setup & Run Locally

### Prerequisites

- Node.js 18+
- PostgreSQL database (NeonDB recommended)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd slooze-app
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` according to you.

### 3. Push Modals to database

```bash
npx prisma db push
```

### 4. Seed Demo Data

```bash
npx prisma db seed
```

This creates:

- 4 restaurants (2 India, 2 America)
- 6 demo users (Nick Fury, Captain Marvel, Captain America, Thanos, Thor, Travis)
- Menu items for each restaurant
- Payment methods per restaurant

### 5. Start Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Demo Accounts

All passwords: `password123`

| Name            | Email                      | Role    | Country            |
| --------------- | -------------------------- | ------- | ------------------ |
| Nick Fury       | nick.fury@shield.com       | Admin   | America (sees all) |
| Captain Marvel  | captain.marvel@shield.com  | Manager | India              |
| Captain America | captain.america@shield.com | Manager | America            |
| Thanos          | thanos@shield.com          | Member  | India              |
| Thor            | thor@shield.com            | Member  | India              |
| Travis          | travis@shield.com          | Member  | America            |

---

## Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Set the same environment variables in Vercel dashboard:

- `DATABASE_URL`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME` (optional)
- `CLOUDINARY_API_KEY` (optional)
- `CLOUDINARY_API_SECRET` (optional)

After deploying, run the seed via:

```bash
DATABASE_URL="your-neon-url" npx prisma db seed
```

---

## API Reference

### Auth

| Method | Endpoint             | Description                 |
| ------ | -------------------- | --------------------------- |
| POST   | `/api/auth/register` | Register restaurant + admin |
| POST   | `/api/auth/login`    | Login                       |
| POST   | `/api/auth/logout`   | Logout                      |
| GET    | `/api/auth/me`       | Get current user            |

### Restaurants

| Method | Endpoint                               | Description                            |
| ------ | -------------------------------------- | -------------------------------------- |
| GET    | `/api/restaurants`                     | List (country-filtered)                |
| POST   | `/api/restaurants`                     | Create (Admin only)                    |
| GET    | `/api/restaurants/:id`                 | Get with menu & payment methods        |
| PUT    | `/api/restaurants/:id`                 | Update restaurant details (Admin only) |
| GET    | `/api/restaurants/:id/menu`            | Get menu items                         |
| POST   | `/api/restaurants/:id/menu`            | Add menu item                          |
| GET    | `/api/restaurants/:id/payment-methods` | Get methods                            |
| POST   | `/api/restaurants/:id/payment-methods` | Add method (Admin)                     |
| PUT    | `/api/restaurants/:id/payment-methods` | Edit/Toggle method (Admin)             |
| DELETE | `/api/restaurants/:id/payment-methods` | Delete method (Admin)                  |

### Orders

| Method | Endpoint                 | Description                                                  |
| ------ | ------------------------ | ------------------------------------------------------------ |
| GET    | `/api/orders`            | List (role + country filtered)                               |
| POST   | `/api/orders`            | Place order (Member: PENDING,Manager: PLACED, Admin: PLACED) |
| GET    | `/api/orders/:id`        | Get order details                                            |
| PATCH  | `/api/orders/:id`        | Confirm order (Manager/Admin)                                |
| POST   | `/api/orders/:id/cancel` | Cancel order (Manager/Admin)                                 |

### Cart

| Method | Endpoint             | Description     |
| ------ | -------------------- | --------------- |
| GET    | `/api/cart`          | Get user's cart |
| POST   | `/api/cart`          | Add item        |
| PATCH  | `/api/cart`          | Update quantity |
| DELETE | `/api/cart?id=x`     | Remove item     |
| DELETE | `/api/cart?all=true` | Clear cart      |

### Users

| Method | Endpoint     | Description                |
| ------ | ------------ | -------------------------- |
| GET    | `/api/users` | List users (Admin/Manager) |
| POST   | `/api/users` | Create user                |

---

## Architecture

```
src/
├── app/
│   ├── (auth)/          # Login & Register pages (no navbar)
│   ├── (dashboard)/     # Protected pages with navbar
│   │   ├── restaurants/ # Restaurant listing & detail
│   │   ├── cart/        # Cart & payment checkout
│   │   ├── orders/      # Order history
│   │   └── admin/       # Admin panel
│   └── api/             # All API routes
│       ├── auth/        # Login, logout, register, me
│       ├── restaurants/ # CRUD + menu + payments
│       ├── orders/      # Orders + cancel
│       ├── cart/        # Cart management
│       └── users/       # User management
├── components/          # Shared UI (Navbar)
├── contexts/            # React contexts (Auth, Cart)
├── lib/                 # Utilities (auth, rbac, prisma, cloudinary)
└── types/               # TypeScript types
```
