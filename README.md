# Seth Dental Gerringong - Invisalign Smile Event landing page

Paid-traffic (Google / Meta Ads) landing page with a qualifier quiz that feeds
leads straight into SmileOx. Everything is flat, no subfolders.

## Files
- `index.html` - the landing page (images/fonts load from CDN/imgur).
- `lead.js` - serverless function; the form posts here and it emails the lead to the SmileOx intake.
- `vercel.json` - routes `/api/lead` to `lead.js`, serves `index.html` for everything else.
- `package.json` - project file (includes the `nodemailer` dependency).

## Deploy (Vercel) - same setup as the Wollongong Implant Institute project
1. Create a new GitHub repo and upload these files to the root (no folders).
2. In Vercel, Add New > Project, import the repo, framework preset "Other", deploy.
3. Add Environment Variables (Settings > Environment Variables), then redeploy.

   Use the SAME SMTP values already on your Wollongong / implant360 projects:

   | Name | Value |
   |------|-------|
   | `SMTP_HOST` | (copy from your existing project) |
   | `SMTP_PORT` | (copy - usually 465) |
   | `SMTP_USER` | (copy) |
   | `SMTP_PASS` | (copy) |
   | `SMTP_FROM` | (copy, e.g. no-reply@sethdentalgerringong.com.au) |
   | `INTAKE_ADDRESS` | `seth-dental-invisalign+c3bf8524-ef4e-42a6-ad9b-481cab01dc28@intake.smileox.com.au` |
   | `ALLOWED_ORIGIN` | your landing-page URL, e.g. `https://invisalign.sethdentalgerringong.com.au` |

   Fastest option: in Vercel > Environment Variables > **Shared**, promote the
   five SMTP vars to the team so every project (including this one) inherits
   them. Then you only add `INTAKE_ADDRESS` and `ALLOWED_ORIGIN` here.

   Only `INTAKE_ADDRESS` must differ per client - this one is Seth Dental's.

4. Point your ads at the Vercel URL, or attach a custom domain in Vercel > Domains.

The form posts to `/api/lead` on the same domain, so there's nothing to paste
into the page and no CORS to configure.

## Test before spending
Submit the form once on the live URL and confirm a new lead appears in the Seth
Dental SmileOx pipeline with every field: name, mobile, email, goal, timeframe,
payment preference and location.

## Notes
- Opening `index.html` locally (file://) will not submit; the function only runs
  once deployed. Expected.
- Failures are logged in Vercel > Logs, and the page shows a "please try again"
  message, so nothing fails silently.
- Prefer Vercel's default layout? Move `lead.js` to `api/lead.js` and delete
  `vercel.json`. The flat layout avoids that folder on purpose.
- To auto-advance a lead's SmileOx status instead of creating a duplicate, add
  `action` and `targetStatusId` to the payload in `lead.js` (SmileOx dedupes on
  email + phone).
