import { PLAYER_PHASES } from "../config/playerPhases.js";

/**
 * Player emails, sent through Resend's REST API. Plain fetch rather than the
 * SDK: two POSTs do not justify a dependency.
 *
 * Sending is best-effort. A player's entry or an admin's confirmation is
 * already saved by the time we get here, so a failed email is logged and
 * reported back — it never undoes the write.
 */

const RESEND_URL = "https://api.resend.com/emails";

/** The sender must be on a domain verified in Resend (rtpl.vibrnd.in). */
function sender() {
  return process.env.RESEND_FROM || "RTPL <noreply@rtpl.vibrnd.in>";
}

/**
 * Logos are hotlinked from the site rather than attached: smaller emails,
 * and no attachment paperclip in the inbox. The files are email-sized copies
 * in frontend/public/email/.
 */
function assetUrl(path) {
  const base = (process.env.SITE_URL || "https://rtpl.vibrnd.in").replace(/\/+$/, "");
  return `${base}/email/${path}`;
}

function season() {
  return process.env.LEAGUE_SEASON || 8;
}

function phaseLabel(key) {
  return PLAYER_PHASES.find((phase) => phase.key === key)?.label ?? key;
}

function rupees(amount) {
  return `Rs. ${Number(amount).toLocaleString("en-IN")}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function firstName(fullName) {
  return String(fullName).trim().split(/\s+/)[0] || "there";
}

/**
 * One layout for both emails: a heading, some paragraphs, a table of entry
 * details and a sign-off. Inline styles only, since mail clients strip
 * stylesheets.
 */
function renderHtml({ heading, paragraphs, details, closing }) {
  const rows = details
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e6e1d8;color:#6b6459;font-size:14px;white-space:nowrap;">${escapeHtml(label)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e6e1d8;color:#1d1a16;font-size:14px;font-weight:600;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join("");

  const body = paragraphs
    .map(
      (text) =>
        `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1d1a16;">${text}</p>`
    )
    .join("");

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f5f2ec;font-family:Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f2ec;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e6e1d8;">
            <tr>
              <td align="center" style="padding:28px 28px 22px;border-bottom:4px solid #c8102e;text-align:center;">
                <img src="${assetUrl("rtpl-logo.png")}" width="138" height="140" alt="RTPL — Round Table Premier League" style="display:block;margin:0 auto 14px;width:138px;height:140px;border:0;outline:none;text-decoration:none;" />
                <p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#6b6459;">Round Table Premier League · Season ${season()}</p>
                <h1 style="margin:10px 0 0;font-size:22px;line-height:1.3;color:#1d1a16;">${escapeHtml(heading)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                ${body}
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;border:1px solid #e6e1d8;border-bottom:0;">
                  ${rows}
                </table>
                ${closing
                  .map(
                    (text) =>
                      `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1d1a16;">${text}</p>`
                  )
                  .join("")}
                <p style="margin:24px 0 0;font-size:15px;line-height:1.6;color:#1d1a16;">Warm regards,<br /><strong>The RTPL Management Team</strong></p>
              </td>
            </tr>
            <tr>
              <td align="center" bgcolor="#1d1a16" style="padding:18px 28px;background:#1d1a16;text-align:center;">
                <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#b8b0a3;">Technology by</p>
                <img src="${assetUrl("vibrnd-logo.png")}" width="100" height="38" alt="Vibrnd" style="display:block;margin:0 auto;width:100px;height:38px;border:0;outline:none;text-decoration:none;color:#ffffff;font-size:16px;font-weight:700;" />
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0;font-size:12px;color:#6b6459;">This is an automated email from a send-only address. Please do not reply.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderText({ heading, paragraphs, details, closing }) {
  const strip = (html) => html.replace(/<[^>]+>/g, "");

  return [
    heading,
    "",
    ...paragraphs.map(strip).flatMap((p) => [p, ""]),
    ...details.map(([label, value]) => `${label}: ${value}`),
    "",
    ...closing.map(strip).flatMap((p) => [p, ""]),
    "Warm regards,",
    "The RTPL Management Team",
    "",
    "This is an automated email from a send-only address. Please do not reply.",
    "",
    "Technology by Vibrnd",
  ].join("\n");
}

async function send({ to, subject, content }) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("[rtpl] RESEND_API_KEY is not set — email not sent:", subject);
    return { ok: false, error: "RESEND_API_KEY is not set" };
  }

  try {
    const response = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: sender(),
        to: [to],
        subject,
        html: renderHtml(content),
        text: renderText(content),
      }),
      signal: AbortSignal.timeout(10_000),
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      console.error("[rtpl] resend rejected email", response.status, body);
      return { ok: false, error: body?.message ?? `HTTP ${response.status}` };
    }

    return { ok: true, id: body?.id };
  } catch (err) {
    console.error("[rtpl] could not reach resend", err);
    return { ok: false, error: err.message };
  }
}

/** Sent as soon as the entry is saved, while payment is still unverified. */
export function sendEntryReceivedEmail(player) {
  const name = escapeHtml(firstName(player.fullName));

  return send({
    to: player.email,
    subject: `RTPL Season ${season()} — we have received your entry (${player.reference})`,
    content: {
      heading: "Your entry has been received",
      paragraphs: [
        `Dear ${name},`,
        `Thank you for registering for the Round Table Premier League, Season ${season()}. Your entry has reached the tournament desk and has been recorded under the reference below.`,
        `Your registration is <strong>pending payment verification</strong>. Once the RTPL Management Team has verified your entry-fee payment, we will write to you again to confirm your place in the player pool.`,
      ],
      details: [
        ["Reference", player.reference],
        ["Player", player.fullName],
        ["Entry phase", phaseLabel(player.phase)],
        ["Entry fee", rupees(player.fee)],
        ["Status", "Awaiting payment confirmation"],
      ],
      closing: [
        "We have the payment screenshot you uploaded with your entry, and the team will match it against our account. Please keep your transaction receipt and its UTR / reference number handy — it helps us trace the payment quickly if there is any query.",
        "Please keep your entry reference safe — the tournament desk will ask for it if there is any query about your entry.",
      ],
    },
  });
}

/** Sent once an admin has matched the payment and recorded its UTR. */
export function sendPaymentConfirmedEmail(player) {
  const name = escapeHtml(firstName(player.fullName));

  return send({
    to: player.email,
    subject: `RTPL Season ${season()} — payment confirmed, you're registered (${player.reference})`,
    content: {
      heading: "Payment confirmed — you're registered",
      paragraphs: [
        `Dear ${name},`,
        `Good news: the RTPL Management Team has verified your entry-fee payment. Your registration for the Round Table Premier League, Season ${season()} is now <strong>complete</strong>, and you are officially part of this season's player pool.`,
      ],
      details: [
        ["Reference", player.reference],
        ["Player", player.fullName],
        ["Entry fee paid", rupees(player.fee)],
        ["Transaction UTR", player.utr],
        ["Status", "Registered"],
      ],
      closing: [
        "We will be in touch with details of the player auction, team allocation, kit and the match schedule in the coming weeks. Please keep an eye on this inbox and on the number you registered with.",
        "We look forward to seeing you on the field.",
      ],
    },
  });
}
