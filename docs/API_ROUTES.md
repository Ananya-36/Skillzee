# SkillSwap API Routes

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

### Booking route logic

`POST /bookings` currently does all of the following in one flow:

- Validates `skillId`, `scheduledAt`, optional notes, and simulated payment method
- Prevents users from booking their own skill listing
- Calculates `amount`, 20 percent `platformCommission`, and `trainerPayout`
- Creates the booking and simulated payment record
- Uses Google Meet or in-app video room configuration depending on the skill
- Updates learner spend and trainer pending balance
- Emits realtime notification plus `booking:new` socket events to the trainer and learner dashboards
- Sends automated Nodemailer confirmations with encoded dashboard, meeting, and WhatsApp links when SMTP settings are configured

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

## AI Assistant

- `POST /assistant/chat`

This endpoint supports local recommendation fallback and optional OpenAI or Gemini-backed replies when server environment keys are provided.

## Admin

- `GET /admin/overview`
