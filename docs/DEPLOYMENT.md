# Skillzee Deployment

## Backend on Render

Create a Render Web Service from this repo with:

- Root Directory: `apps/api`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

Set these environment variables:

- `MONGO_URI`
- `JWT_SECRET`
- `NODE_ENV=production`
- `PORT=10000`
- `CLIENT_URL=https://your-vercel-app.vercel.app`
- `CLIENT_URLS=https://your-vercel-app.vercel.app`

## Frontend on Vercel

Create a Vercel project from this repo with:

- Root Directory: `apps/web`

Set these environment variables:

- `NEXT_PUBLIC_API_URL=https://your-render-service.onrender.com/api`
- `NEXT_PUBLIC_SOCKET_URL=https://your-render-service.onrender.com`
- `NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app`

## Notes

- The frontend already reads API values from environment variables.
- The backend already reads Atlas from `MONGO_URI`.
- The backend CORS layer allows multiple origins through `CLIENT_URLS`.
- WhatsApp smart redirect logic lives in `apps/web/src/lib/communication.ts`.
