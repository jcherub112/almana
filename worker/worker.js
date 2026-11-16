// Almana inquiry form receiver. Cloudflare Worker + Email Routing send_email binding.
// POST JSON {name, phone, email, interest, message, website(honeypot)} -> email to info@almanarecovery.com
import { EmailMessage } from "cloudflare:email";

const ALLOWED_ORIGINS = ["https://www.almanarecovery.com", "https://almanarecovery.com"];
const TO = "info@almanarecovery.com";
const FROM = "forms@almanarecovery.com"; // must be a verified address/domain in Cloudflare Email Routing

function cors(origin) {
  const ok = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": ok,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}
const clean = (v, n) => String(v ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, n);

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const h = cors(origin);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers: h });

    let d;
    try { d = await request.json(); } catch { return new Response("Bad JSON", { status: 400, headers: h }); }
    if (d.website) return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...h, "Content-Type": "application/json" } }); // honeypot

    const name = clean(d.name, 120), phone = clean(d.phone, 40), email = clean(d.email, 120);
    const interest = clean(d.interest, 80), message = String(d.message ?? "").trim().slice(0, 4000);
    if (!name || !phone || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      return new Response("Missing fields", { status: 400, headers: h });

    const ts = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
    const subject = `Website inquiry: ${name} (${interest || "no selection"})`;
    const body = [
      `New inquiry from almanarecovery.com`, ``,
      `Name:        ${name}`, `Phone:       ${phone}`, `Email:       ${email}`,
      `Interest:    ${interest}`, `Received:    ${ts} ET`,
      `Page:        ${clean(request.headers.get("Referer"), 200)}`, ``,
      `Message:`, message || "(none)", ``,
      `Reply to the client directly at ${email} or ${phone}.`,
    ].join("\n");

    const raw = [
      `From: Almana Website <${FROM}>`, `To: ${TO}`, `Reply-To: ${name} <${email}>`,
      `Subject: ${subject}`, `MIME-Version: 1.0`, `Content-Type: text/plain; charset=utf-8`, ``, body,
    ].join("\r\n");

    try {
      await env.INQUIRY_EMAIL.send(new EmailMessage(FROM, TO, raw));
    } catch (e) {
      return new Response("Send failed: " + e.message, { status: 502, headers: h });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...h, "Content-Type": "application/json" } });
  },
};
