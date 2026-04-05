# SkillSwap Database Schema

This repo currently uses Mongoose models rather than Prisma.

## Core model files

- `apps/api/src/models/User.ts`
- `apps/api/src/models/Skill.ts`
- `apps/api/src/models/Booking.ts`
- `apps/api/src/models/Review.ts`
- `apps/api/src/models/Message.ts`
- `apps/api/src/models/Notification.ts`
- `apps/api/src/models/Payment.ts`

## Users

- Identity: `name`, `email`, `phone`, `whatsAppNumber`, `passwordHash`, `college`
- Profile: `bio`, `avatarUrl`, `rolePreference`, `interests`, `skills`
- Trust and gamification: `badges`, `points`, `trainerProfile.averageRating`, `trainerProfile.totalReviews`, `trainerProfile.completedSessions`
- Wallet: `availableBalance`, `pendingBalance`, `totalEarnings`, `totalSpent`
- Saved marketplace items: `favoriteSkills`
- Delivery: `pushSubscriptions`

## Skills

- Ownership: `trainer`
- Marketplace fields: `title`, `description`, `category`, `price`, `durationMinutes`
- Discovery fields: `tags`, `outcomes`, `isFeatured`, `ratingAverage`, `ratingCount`, `bookingsCount`, `savesCount`
- Session delivery: `mode`, `location`, `sessionType`, `meetLink`, `availability`, `seats`

## Bookings

- References: `skill`, `learner`, `trainer`
- Schedule: `scheduledAt`, `notes`, `reminderSentAt`
- Lifecycle: `status`, `paymentStatus`
- Money split: `amount`, `platformCommission`, `trainerPayout`
- Delivery: `sessionType`, `sessionLink`, `videoRoomId`

This model powers the booking API route that also triggers realtime dashboard events, notification records, and automated email confirmations.

## Reviews

- References: `booking`, `skill`, `learner`, `trainer`
- Feedback: `rating`, `comment`

## Messages

- References: `booking`, `sender`, `recipient`
- Content: `content`

## Notifications

- References: `user`
- Message payload: `type`, `title`, `body`, `actionUrl`, `metadata`
- Read state: `readAt`

## Payments

- References: `booking`, `payer`, `payee`
- Gateway simulation: `provider`, `transactionId`
- Money split: `amount`, `commission`, `payout`
- Status: `status`

## Mock data

- Seed script: `apps/api/src/utils/seed.ts`
- Root command: `npm run mock-data`
- Sample data includes learner and provider accounts, featured skills, a confirmed booking, and a simulated payment trail for presentations
