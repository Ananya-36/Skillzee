export const roleOptions = ["LEARNER", "TRAINER", "BOTH"] as const;
export type RolePreference = (typeof roleOptions)[number];

export const modeOptions = ["ONLINE", "OFFLINE"] as const;
export type DeliveryMode = (typeof modeOptions)[number];

export const sessionTypeOptions = ["GOOGLE_MEET", "IN_APP"] as const;
export type SessionType = (typeof sessionTypeOptions)[number];

export const bookingStatusOptions = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;
export type BookingStatus = (typeof bookingStatusOptions)[number];

export const paymentStatusOptions = ["PENDING", "PAID", "RELEASED", "REFUNDED"] as const;
export type PaymentStatus = (typeof paymentStatusOptions)[number];

export const notificationTypeOptions = ["BOOKING", "MESSAGE", "REMINDER", "PAYMENT", "SYSTEM"] as const;
export type NotificationType = (typeof notificationTypeOptions)[number];

export type JwtPayload = {
  sub: string;
  email: string;
  rolePreference: RolePreference;
};
