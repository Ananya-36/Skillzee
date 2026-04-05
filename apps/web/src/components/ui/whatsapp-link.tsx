import { buildWhatsAppLink } from "@/lib/communication";

type WhatsAppLinkProps = {
  phone: string;
  skillTitle: string;
  label?: string;
  iconOnly?: boolean;
  className?: string;
};

export function WhatsAppLink({
  phone,
  skillTitle,
  label = "WhatsApp",
  iconOnly = false,
  className = ""
}: WhatsAppLinkProps) {
  const href = buildWhatsAppLink(phone, skillTitle);
  const classes = iconOnly
    ? `icon-link whatsapp-link whatsapp-link--icon ${className}`.trim()
    : `button button--ghost whatsapp-link ${className}`.trim();

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={classes}
      aria-label={`${label} via WhatsApp`}
      title={`${label} via WhatsApp`}
    >
      <span className="whatsapp-link__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 11.5A8.5 8.5 0 0 1 7.7 19l-3.7 1 1.1-3.5A8.5 8.5 0 1 1 20 11.5Z" />
          <path d="M9.5 8.9c.2-.5.4-.5.7-.5h.6c.2 0 .5 0 .6.4l.5 1.3c.1.2.1.5 0 .7l-.4.6c-.1.2-.1.4 0 .6.3.6.8 1.2 1.4 1.7.5.4 1 .7 1.6 1 .2.1.4.1.6 0l.7-.4c.2-.1.5-.1.7 0l1.2.5c.4.2.4.4.4.6v.6c0 .3 0 .5-.5.7-.4.2-1.3.4-2.7-.1-1.3-.5-2.7-1.4-3.8-2.5s-2-2.5-2.5-3.8c-.5-1.4-.3-2.3-.1-2.8Z" />
        </svg>
      </span>
      {iconOnly ? null : label}
    </a>
  );
}
