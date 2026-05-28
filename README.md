# Dwarik Door — Premium Door Manufacturing PWA

A mobile-first Progressive Web App for managing door manufacturing operations — orders, inventory, and employees.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: MongoDB Atlas (Mongoose)
- **Auth**: JWT via `jose` (httpOnly cookies)
- **Animations**: Framer Motion (motion)
- **Icons**: Lucide React
- **Toasts**: Sonner

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Copy `.env.local` and fill in your values:
```bash
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/dwarik

# JWT signing secret (32-byte hex)
AUTH_SECRET=<run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">

NEXT_PUBLIC_APP_NAME=Dwarik
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 3. Seed the database (first time only)
```bash
npm run seed
```

### 4. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Credentials

| Role | Phone | Password |
|------|-------|----------|
| Owner | 9876543210 | admin123 |
| Employee | 9876543211 | emp123 |

## Deploy to Vercel

1. Push to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Add environment variables: `MONGODB_URI`, `AUTH_SECRET`
4. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## Project Structure

```
app/                    # Next.js App Router
  api/                  # API routes (auth, orders, products, employees)
  (pages)/              # Route pages — thin wrappers over src/app/screens/
  layout.tsx            # Root layout + PWA metadata
  middleware.ts         # JWT auth + role-based route protection

src/
  app/
    screens/            # All UI screens (preserved from original)
    components/         # shadcn/ui + custom components
    context/            # AuthContext, ThemeContext
    hooks/              # useOrders, useProducts, useEmployees, useSession
    models/             # Mongoose models (Employee, Order, Product, InventoryLog, StatusHistory)
    data/               # mockData.ts (fallback when DB unavailable)
  lib/
    mongodb.ts          # DB connection singleton
    jwt.ts              # JWT sign/verify (Edge-compatible)
```

## PWA Features

- Installable on iOS and Android
- Offline-capable fallback to mock data
- Mobile-first layout (max-width: 512px)
- Dark mode support
- Safe area insets for notched devices


