// lead.js  —  SmileOx lead intake (Vercel serverless function)
// The landing page POSTs a JSON lead to /api/lead; this forwards it to the
// SmileOx intake address as a JSON email via Resend (delivered over TLS).
// No SMTP, no npm install (uses Node's built-in fetch).

const INTAKE = process.env.INTAKE_ADDRESS ||
  "seth-dental-invisalign+c3bf8524-ef4e-42a6-ad9b-481cab01dc28@intake.smileox.com.au";
const FROM   = process.env.FROM_EMAIL || "Seth Dental Website <onboarding@resend.dev>";
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

    const payload = {
      firstName: b.firstName,
      lastName: b.lastName || "",
      email: b.email,
      phoneNumber: b.phoneNumber,
      treatmentType: b.treatmentType || "Invisalign",
      goal: b.goal || "",
      timeframe: b.timeframe || "",
      paymentMethod: b.paymentMethod || "",
      preferredLocation: b.preferredLocation || "",
      source: b.source || "Invisalign Smile Event Landing Page"
    };

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: FROM,
        to: [INTAKE],
        subject: "Website form submission",
        text: JSON.stringify(payload)
      })
    });

    if (!r.ok) {
      console.error("Resend error:", r.status, await r.text().catch(() => ""));
      return res.status(502).json({ error: "Could not submit. Please try again." });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("SmileOx intake error:", err);
    return res.status(502).json({ error: "Could not submit. Please try again." });
  }
};
