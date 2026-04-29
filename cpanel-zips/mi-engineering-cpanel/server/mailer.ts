import nodemailer from "nodemailer";

const HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const PORT = Number(process.env.SMTP_PORT || 465);
const USER = process.env.SMTP_USER || "";
const PASS = process.env.SMTP_PASS || "";
const TO = process.env.CONTACT_TO_EMAIL || "miengineering17@gmail.com";
const FROM = process.env.SMTP_FROM || `M.I. Engineering Works <${USER || TO}>`;

let transporter: nodemailer.Transporter | null = null;
function getTransporter() {
  if (!USER || !PASS) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: HOST,
      port: PORT,
      secure: PORT === 465,
      auth: { user: USER, pass: PASS },
    });
  }
  return transporter;
}

export async function sendContactEmail(c: {
  fullName: string; email: string; phone: string; company?: string | null; message: string;
}) {
  const t = getTransporter();
  if (!t) {
    console.warn("[mailer] SMTP not configured (SMTP_USER/SMTP_PASS missing) — skipping email");
    return { sent: false, reason: "smtp_not_configured" };
  }
  const subject = `New Enquiry from ${c.fullName} — M.I. Engineering Works`;
  const html = `
    <div style="font-family:Arial,sans-serif;background:#f6f3ec;padding:24px;color:#1a1a1a;">
      <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5dfc9;border-radius:8px;overflow:hidden;">
        <div style="background:#1a1a1a;padding:20px;">
          <h1 style="color:#C9A227;margin:0;font-size:18px;letter-spacing:2px;">M.I. ENGINEERING WORKS</h1>
          <p style="color:#fff;margin:4px 0 0;font-size:11px;letter-spacing:3px;">NEW WEBSITE ENQUIRY</p>
        </div>
        <div style="padding:24px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:8px 0;color:#6b6b6b;width:120px;">Name</td><td style="padding:8px 0;font-weight:600;">${esc(c.fullName)}</td></tr>
            <tr><td style="padding:8px 0;color:#6b6b6b;">Email</td><td style="padding:8px 0;"><a href="mailto:${esc(c.email)}" style="color:#C9A227;">${esc(c.email)}</a></td></tr>
            <tr><td style="padding:8px 0;color:#6b6b6b;">Phone</td><td style="padding:8px 0;"><a href="tel:${esc(c.phone)}" style="color:#C9A227;">${esc(c.phone)}</a></td></tr>
            ${c.company ? `<tr><td style="padding:8px 0;color:#6b6b6b;">Company</td><td style="padding:8px 0;">${esc(c.company)}</td></tr>` : ""}
          </table>
          <div style="margin-top:16px;padding:16px;background:#f6f3ec;border-left:3px solid #C9A227;border-radius:4px;">
            <div style="font-size:11px;color:#6b6b6b;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;">Message</div>
            <div style="white-space:pre-wrap;font-size:14px;line-height:1.5;">${esc(c.message)}</div>
          </div>
          <p style="margin-top:20px;font-size:11px;color:#6b6b6b;">This enquiry was submitted from the M.I. Engineering Works website contact form.</p>
        </div>
      </div>
    </div>
  `;
  const text = `New enquiry from ${c.fullName}\n\nEmail: ${c.email}\nPhone: ${c.phone}\n${c.company ? `Company: ${c.company}\n` : ""}\nMessage:\n${c.message}`;

  try {
    const info = await t.sendMail({ from: FROM, to: TO, replyTo: c.email, subject, text, html });
    console.log(`[mailer] sent enquiry email: ${info.messageId}`);
    return { sent: true };
  } catch (e: any) {
    console.error("[mailer] send failed:", e.message);
    return { sent: false, reason: e.message };
  }
}

function esc(s: string) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
