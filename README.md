# Seth Dental Gerringong - Invisalign Smile Event landing page

Paid-traffic (Google / Meta Ads) landing page with a qualifier quiz that feeds
leads straight into SmileOx. Everything lives in this one repo, flat, no
subfolders.

## Files
- `index.html` - the landing page (all images/fonts load from CDN/imgur).
- `lead.js` - serverless function; the form posts here and it emails the lead to the SmileOx intake.
- `vercel.json` - routes `/api/lead` to `lead.js` and serves `index.html` for everything else.
- `package.json` - minimal project file.

## Deploy (Vercel)
1. Create a new GitHub repo and upload these four files to the root (no folders).
2. In Vercel, "Add New Project" and import that repo. Framework preset: **Other**. Deploy.
3. Add Environment Variables (Vercel > Project > Settings > Environment Variables):

   | Name | Value |
   |------|-------|
   | `RESEND_API_KEY` | your key from resend.com (free tier is fine) |
   | `INTAKE_ADDRESS` | `seth-dental-invisalign+c3bf8524-ef4e-42a6-ad9b-481cab01dc28@intake.smileox.com.au` |
   | `FROM_EMAIL` | `Seth Dental Website <onboarding@resend.dev>` (works with no DNS) |
   | `ALLOWED_ORIGIN` | your final landing-page URL, e.g. `https://invisalign.sethdentalgerringong.com.au` |

4. Redeploy after adding the variables.
5. Point your ads at the Vercel URL (or attach a custom domain / subdomain in Vercel > Domains).

The form posts to `/api/lead` on the same domain, so there is nothing to paste
into the page and no CORS to configure.

## Get a Resend key (2 minutes)
1. Sign up at resend.com.
2. Create an API key, paste it into `RESEND_API_KEY`.
3. Leave `FROM_EMAIL` as the default to skip DNS entirely. To send from an
   `@sethdentalgerringong.com.au` address instead, verify the domain in Resend
   once (a couple of DNS records) and update `FROM_EMAIL`.

## Test before spending
Submit the form once and confirm a new lead appears in the Seth Dental SmileOx
pipeline with every field: name, mobile, email, plus goal, timeframe, payment
preference and location.

## Notes
- Opening `index.html` locally (file://) will not submit; the function only runs
  once deployed. That is expected.
- Prefer the zero-config layout? Move `lead.js` into an `api/` folder (so it is
  `api/lead.js`) and delete `vercel.json`. Vercel will wire `/api/lead`
  automatically. The flat layout here avoids that folder on purpose.
- To auto-advance a lead's SmileOx status instead of creating a duplicate, add
  `action` and `targetStatusId` to the payload in `lead.js` (SmileOx dedupes on
  email + phone).
