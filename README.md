# Skillzee

Skillzee is a production-ready peer-to-peer student skill learning marketplace where learners book affordable sessions from student trainers, chat in real time, connect through WhatsApp or email, and manage bookings, reviews, earnings, wallets, badges, and certificates.

## Stack

- Frontend: Next.js 16 App Router + TypeScript + modern dark UI
- Backend: Node.js + Express + TypeScript + Socket.io
- Database: MongoDB Atlas with Mongoose
- Auth: JWT
- Realtime: Socket.io
- Deployment: Vercel for web, Render for API, MongoDB Atlas for database
- PWA: Manifest + service worker + browser notification hooks

## Workspace

```text
skillzee/
  apps/
    api/        Express API, Socket.io server, MongoDB models
    web/        Next.js frontend
  docs/
    API_ROUTES.md
    DB_SCHEMA.md
```

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Copy environment files:

```bash
copy apps\api\.env.example apps\api\.env
copy apps\web\.env.example apps\web\.env.local
```

3. Update the MongoDB Atlas, JWT, mail, and push notification values.

4. Seed demo data:

```bash
npm run seed
```

5. Run both apps:

```bash
npm run dev
```

6. Open:

- Web: `http://localhost:3000`
- API: `http://localhost:5000`

## Key Product Features

- JWT auth with learner, trainer, or dual-role profiles
- Skill discovery, filtering, favorites, trending, and AI-style recommendations
- Session booking with 20% platform commission and trainer wallet tracking
- Real-time chat, notifications, and WebRTC signaling support
- WhatsApp smart redirection with pre-filled booking message
- Email fallback using `mailto`
- Ratings and reviews restricted to booked learners
- Leaderboards, badges, points, and certificate PDF generation
- Admin dashboard with marketplace metrics
- PWA manifest, install prompt support, and browser notifications

## MongoDB Atlas

Use a MongoDB Atlas free cluster and place the SRV connection string in [apps/api/.env](/c:/Users/lenovo/Desktop/skillzee/apps/api/.env):

```bash
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/skillzee?retryWrites=true&w=majority
```

The backend reads `process.env.MONGO_URI`, so the app no longer depends on `mongodb://127.0.0.1:27017/skillzee`.

## Deployment

- Deploy `apps/web` to Vercel
- Deploy `apps/api` to Render as a Node web service
- Use MongoDB Atlas for the shared database

Production deployment details are in [docs/DEPLOYMENT.md](/c:/Users/lenovo/Desktop/skillzee/docs/DEPLOYMENT.md).

Detailed setup and API docs live in [docs/API_ROUTES.md](/c:/Users/lenovo/Desktop/skillzee/docs/API_ROUTES.md) and [docs/DB_SCHEMA.md](/c:/Users/lenovo/Desktop/skillzee/docs/DB_SCHEMA.md).
