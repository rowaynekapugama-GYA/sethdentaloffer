// lead.js  —  SmileOx lead intake (Vercel serverless function)
// Matches the SMTP setup already used by the Wollongong Implant Institute and
// implant360 projects, so the SAME env vars/credentials can be reused.
//
// The landing page POSTs a JSON lead to /api/lead; this emails it to the
// SmileOx intake address as a JSON body over TLS.

const nodemailer = require("nodemailer");

const INTAKE = process.env.INTAKE_ADDRESS ||
  "seth-dental-invisalign+c3bf8524-ef4e-42a6-ad9b-481cab01dc28@intake.smileox.com.au";
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

    const port = Number(process.env.SMTP_PORT || 465);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,   // 465 = implicit TLS; 587 = STARTTLS below
      requireTLS: true,        // enforce TLS either way (SmileOx requires it)
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    await transporter.sendMail({
      to: INTAKE,
      from: process.env.SMTP_FROM,
      subject: "Website form submission",
      text: JSON.stringify(payload),        // plain-text JSON body, per SmileOx
      headers: { "Content-Type": "text/plain" }
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("SmileOx intake error:", err);
    return res.status(502).json({ error: "Could not submit. Please try again." });
  }
};
