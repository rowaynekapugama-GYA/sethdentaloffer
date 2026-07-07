// lead.js  —  SmileOx lead intake via the SMTP2GO API
// The landing page POSTs a JSON lead to /api/lead; this forwards it to the
// SmileOx intake address as a JSON email (plain-text body) using SMTP2GO.
//
// ENV VARS (Vercel > Settings > Environment Variables), then Redeploy:
//   SMTP2GO_API_KEY  your key (starts with api-...). Keep secret.
//   SENDER_EMAIL     a sender VERIFIED in your SMTP2GO account
//                    e.g. no-reply@sethdentalgerringong.com.au
//   INTAKE_ADDRESS   seth-dental-invisalign+c3bf8524-ef4e-42a6-ad9b-481cab01dc28@intake.smileox.com.au
//   ALLOWED_ORIGIN   this page's URL (e.g. https://offer.sethdentalgerringong.com.au)

const KEY = process.env.SMTP2GO_API_KEY;
const INTAKE = process.env.INTAKE_ADDRESS ||
  "seth-dental-invisalign+c3bf8524-ef4e-42a6-ad9b-481cab01dc28@intake.smileox.com.au";
const SENDER = process.env.SENDER_EMAIL || "no-reply@sethdentalgerringong.com.au";
const ORIGIN = process.env.ALLOWED_ORIGIN || "*";

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    if (!b.firstName || !b.email || !b.phoneNumber)
      return res.status(400).json({ error: "Missing required fields" });
    if (!KEY) return res.status(500).json({ error: "Server not configured", detail: "SMTP2GO_API_KEY is not set" });

    const payload = {
      firstName: b.firstName, lastName: b.lastName || "", email: b.email, phoneNumber: b.phoneNumber,
      treatmentType: b.treatmentType || "Invisalign",
      goal: b.goal || "", timeframe: b.timeframe || "", paymentMethod: b.paymentMethod || "",
      postcode: b.postcode || "", source: b.source || "Invisalign Smile Event Landing Page"
    };

    const r = await fetch("https://api.smtp2go.com/v3/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
        "X-Smtp2go-Api-Key": KEY
      },
      body: JSON.stringify({
        api_key: KEY,               // also in body (belt-and-suspenders per SMTP2GO docs)
        sender: SENDER,
        to: [INTAKE],
        subject: "Website form submission",
        text_body: JSON.stringify(payload)
      })
    });

    const data = await r.json().catch(() => ({}));
    const ok = r.ok && data && data.data && data.data.succeeded >= 1;
    if (!ok) {
      const dd = (data && data.data) || {};
      const detail = dd.error || dd.error_code ||
        (dd.field_validation_errors ? JSON.stringify(dd.field_validation_errors) : null) ||
        ("HTTP " + r.status);
      console.error("SMTP2GO error:", r.status, JSON.stringify(data));
      return res.status(502).json({ error: "Could not submit. Please try again.", detail });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("SmileOx intake error:", err);
    return res.status(502).json({ error: "Could not submit. Please try again.", detail: String(err && err.message || err) });
  }
};
