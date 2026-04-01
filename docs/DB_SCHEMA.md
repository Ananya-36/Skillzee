# Skillzee Database Schema

## Collections

### Users

- Identity: name, email, phone, college, passwordHash
- Profile: bio, avatarUrl, interests, rolePreference
- Wallet: availableBalance, pendingBalance, totalEarnings, totalSpent
- Gamification: badges, points
- Favorites: skill references
- Push subscriptions

### Skills

- Title, description, category, price, durationMinutes
- Delivery mode: online/offline
- Session access: Google Meet or in-app video
- Trainer reference
- Rating summary, tags, seats, featured/trending metadata

### Bookings

- Learner, trainer, skill
- Scheduled time
- Price split: total, commission, trainer payout
- Status lifecycle
- Contact methods
- Session link or video room id

### Reviews

- Booking reference
- Learner and trainer references
- Rating and review text

### Messages

- Booking reference
- Sender, recipient
- Message body, attachments, timestamps

### Notifications

- User reference
- Type, title, body, action URL
- Read state
- Metadata payload

### Payments

- Booking reference
- Payer, payee
- Amount, commission, payout
- Status, provider, transaction references
