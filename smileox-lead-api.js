// ---------------------------------------------------------------------------
// SmileOx lead intake  —  serverless function (Node.js, Vercel-style)
// ---------------------------------------------------------------------------
// The Invisalign landing page POSTs a JSON lead to this endpoint. This function
// forwards it to the SmileOx "Website Form Intake" address as a JSON email over
// TLS, exactly as SmileOx documents. A backend is required because browsers
// cannot send SMTP mail, and SMTP credentials must never live in the page.
//
// DEPLOY (Vercel, matches your existing stack):
//   1. Put this file at  /api/lead.js  in a Vercel project.
//   2. Run:  npm i nodemailer
//   3. Add the Environment Variables listed below (Vercel > Settings > Env Vars).
//   4. Deploy, then in the landing page set:
//        var LEAD_ENDPOINT = 'https://<your-project>.vercel.app/api/lead';
//
// ENV VARS:
//   SMTP_HOST        your TLS SMTP host           (e.g. smtp.yourprovider.com)
//   SMTP_PORT        465
//   SMTP_USER        SMTP username
//   SMTP_PASS        SMTP password / app key
//   FROM_EMAIL       no-reply@sethdentalgerringong.com.au
//   INTAKE_ADDRESS   seth-dental-invisalign+c3bf8524-ef4e-42a6-ad9b-481cab01dc28@intake.smileox.com.au
//   ALLOWED_ORIGIN   https://sethdentalgerringong.com.au   (the site the LP runs on)
//
// Other hosts: the handler body works on Netlify Functions / AWS Lambda / a
// plain Express route with tiny tweaks (read req.body, set the same headers).
// ---------------------------------------------------------------------------

import nodemailer from "nodemailer";

const INTAKE =
  process.env.INTAKE_ADDRESS ||
  "seth-dental-invisalign+c3bf8524-ef4e-42a6-ad9b-481cab01dc28@intake.smileox.com.au";
const ORIGIN = process.env.ALLOWED_ORIGIN || "*";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};

    // Minimum viable lead
    if (!b.firstName || !b.email || !b.phoneNumber) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Only forward fields we intend to store. SmileOx keys firstName / lastName
    // / email / phoneNumber are matched for dedupe; the rest are stored as
    // lead details.
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
      source: b.source || "Invisalign Smile Event Landing Page",
    };

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: true, // enforce TLS (SmileOx rejects non-TLS mail)
      requireTLS: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      to: INTAKE,
      from: process.env.FROM_EMAIL || "no-reply@sethdentalgerringong.com.au",
      subject: "Website form submission",
      text: JSON.stringify(payload), // plain-text JSON body, per SmileOx doc
      headers: { "Content-Type": "text/plain" },
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("SmileOx intake error:", err);
    // 502 so the page shows its retry message rather than a silent failure.
    return res.status(502).json({ error: "Could not submit. Please try again." });
  }
}

// ---------------------------------------------------------------------------
// Optional: advance an existing lead's status instead of creating a duplicate.
// SmileOx dedupes on matching email + phone. To move a known lead along your
// Kanban, include these in the payload above:
//   action: "UPDATE_TARGET_STATUS",
//   targetStatusId: "<status-id-from-your-SmileOx-source>"
// Status IDs are specific to this intake's CRM source (see the SmileOx docs
// panel / Kanban status settings).
// ---------------------------------------------------------------------------
