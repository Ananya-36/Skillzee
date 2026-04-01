import { DEFAULT_WHATSAPP_MESSAGE } from "./config";

function normalizePhone(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

export function buildWhatsAppLinks(phone: string, message = DEFAULT_WHATSAPP_MESSAGE) {
  const normalized = normalizePhone(phone);
  const encoded = encodeURIComponent(message);

  return {
    app: `whatsapp://send?phone=${normalized}&text=${encoded}`,
    mobileWeb: `https://wa.me/${normalized}?text=${encoded}`,
    desktopWeb: `https://web.whatsapp.com/send?phone=${normalized}&text=${encoded}`
  };
}

export function openWhatsAppChat(phone: string, message?: string) {
  if (typeof window === "undefined") {
    return;
  }

  const links = buildWhatsAppLinks(phone, message);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent);
  let didHide = false;

  const handleVisibility = () => {
    if (document.hidden) {
      didHide = true;
    }
  };

  document.addEventListener("visibilitychange", handleVisibility, { once: true });
  window.location.href = links.app;

  window.setTimeout(() => {
    if (!didHide) {
      window.open(isMobile ? links.mobileWeb : links.desktopWeb, "_blank", "noopener,noreferrer");
    }
  }, 1100);
}

export function buildEmailLink(email: string, subject: string, body: string) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
