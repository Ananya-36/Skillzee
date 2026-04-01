# Skillzee API Routes

Base URL: `/api`

## Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `PATCH /auth/profile`

## Skills

- `GET /skills`
- `GET /skills/trending`
- `GET /skills/recommended`
- `GET /skills/leaderboard`
- `GET /skills/:skillId`
- `POST /skills`
- `POST /skills/:skillId/favorite`

## Bookings

- `POST /bookings`
- `GET /bookings`
- `PATCH /bookings/:bookingId/status`
- `POST /bookings/:bookingId/review`
- `GET /bookings/:bookingId/certificate`
- `POST /bookings/reminders/run`

## Chat

- `GET /chat/conversations`
- `GET /chat/:bookingId/messages`
- `POST /chat/:bookingId/messages`

## Notifications

- `GET /notifications`
- `PATCH /notifications/:notificationId/read`
- `POST /notifications/subscribe`

## Payments and Wallet

- `GET /payments/wallet`
- `POST /payments/simulate`

## Admin

- `GET /admin/overview`
