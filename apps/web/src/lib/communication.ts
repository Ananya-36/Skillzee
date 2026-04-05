import { buildWhatsAppInterestMessage, DEFAULT_GOOGLE_MEET_URL } from "./config";

function normalizePhone(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

export function buildWhatsAppLink(phone: string, skillTitle: string) {
  const normalized = normalizePhone(phone);
  const encoded = encodeURIComponent(buildWhatsAppInterestMessage(skillTitle));

  return `https://wa.me/${normalized}?text=${encoded}`;
}

export function openWhatsAppChat(phone: string, skillTitle: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.open(buildWhatsAppLink(phone, skillTitle), "_blank", "noopener,noreferrer");
}

export function buildEmailLink(email: string, subject: string, body: string) {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: email,
    su: subject,
    body
  });

  return `https://mail.google.com/mail/?${params.toString()}`;
}

export function buildMeetingLink(link?: string) {
  return link?.trim() ? link : DEFAULT_GOOGLE_MEET_URL;
}
