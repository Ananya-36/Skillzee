import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASS) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      }
    });
  }

  return transporter;
}

export async function sendEmail(input: { to: string; subject: string; html: string }) {
  const client = getTransporter();

  if (!client || !env.SMTP_FROM) {
    return;
  }

  await client.sendMail({
    from: env.SMTP_FROM,
    to: input.to,
    subject: input.subject,
    html: input.html
  });
}

type BookingEmailAudience = "learner" | "trainer";

type BookingEmailInput = {
  audience: BookingEmailAudience;
  to: string;
  recipientName: string;
  otherPartyName: string;
  otherPartyRoleLabel: string;
  otherPartyWhatsAppNumber?: string;
  skillTitle: string;
  scheduledAtLabel: string;
  paymentMethodLabel: string;
  amount: number;
  platformCommission: number;
  trainerPayout: number;
  dashboardUrl: string;
  sessionLink?: string;
};

function normalizePhone(phone = "") {
  return phone.replace(/[^\d]/g, "");
}

function buildBookingWhatsAppLink(phone: string | undefined, skillTitle: string) {
  const normalized = normalizePhone(phone);

  if (!normalized) {
    return "";
  }

  const encodedMessage = encodeURIComponent(`Hi, I am interested in your ${skillTitle} class on SkillSwap`);
  return `https://wa.me/${normalized}?text=${encodedMessage}`;
}

function buildBookingEmailHtml(input: BookingEmailInput) {
  const meetingLink = input.sessionLink?.trim();
  const whatsAppLink = buildBookingWhatsAppLink(input.otherPartyWhatsAppNumber, input.skillTitle);
  const intro =
    input.audience === "trainer"
      ? `${input.otherPartyName} just booked your ${input.skillTitle} session.`
      : `Your ${input.skillTitle} session with ${input.otherPartyName} is confirmed.`;

  return `
    <div style="font-family:Segoe UI,Arial,sans-serif;line-height:1.6;color:#10203a;background:#f4f7fb;padding:24px;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:20px;padding:28px;border:1px solid #d9e3f4;">
        <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#5f78a5;">SkillSwap Booking</p>
        <h1 style="margin:0 0 12px;font-size:28px;color:#10203a;">Booking confirmed</h1>
        <p style="margin:0 0 20px;">Hi ${input.recipientName}, ${intro}</p>
        <div style="display:grid;gap:12px;margin:0 0 24px;">
          <div style="padding:14px 16px;border-radius:16px;background:#f7f9fd;border:1px solid #e4ebf8;">
            <strong>Class</strong>
            <div>${input.skillTitle}</div>
          </div>
          <div style="padding:14px 16px;border-radius:16px;background:#f7f9fd;border:1px solid #e4ebf8;">
            <strong>When</strong>
            <div>${input.scheduledAtLabel}</div>
          </div>
          <div style="padding:14px 16px;border-radius:16px;background:#f7f9fd;border:1px solid #e4ebf8;">
            <strong>Payment flow</strong>
            <div>${input.paymentMethodLabel}</div>
          </div>
          <div style="padding:14px 16px;border-radius:16px;background:#f7f9fd;border:1px solid #e4ebf8;">
            <strong>Money split</strong>
            <div>Total: INR ${input.amount} | Commission: INR ${input.platformCommission} | Payout: INR ${input.trainerPayout}</div>
          </div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:12px;margin:0 0 20px;">
          <a href="${input.dashboardUrl}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#ff7c45;color:#ffffff;text-decoration:none;font-weight:600;">Open dashboard</a>
          ${meetingLink ? `<a href="${meetingLink}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#10203a;color:#ffffff;text-decoration:none;font-weight:600;">Open meeting link</a>` : ""}
          ${whatsAppLink ? `<a href="${whatsAppLink}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#18a860;color:#ffffff;text-decoration:none;font-weight:600;">WhatsApp ${input.otherPartyRoleLabel}</a>` : ""}
        </div>
        <p style="margin:0;color:#5f78a5;">You can keep coordinating inside SkillSwap chat, WhatsApp, or email with the same booking context.</p>
      </div>
    </div>
  `;
}

export async function sendBookingConfirmationEmail(input: BookingEmailInput) {
  await sendEmail({
    to: input.to,
    subject: `SkillSwap booking confirmed: ${input.skillTitle}`,
    html: buildBookingEmailHtml(input)
  });
}
