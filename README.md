# Seth Dental Gerringong - Invisalign Smile Event landing page

Self-contained: the landing page and the SmileOx lead relay deploy together on
Vercel. The form posts to /api/lead on its own domain (no CORS to configure),
and lead.js forwards each lead to the SmileOx intake via the SMTP2GO API.

## What to set (Vercel > Settings > Environment Variables)
- SMTP2GO_API_KEY  -> your SMTP2GO key (starts with api-...). Keep secret.
- SENDER_EMAIL     -> a sender VERIFIED in your SMTP2GO account
                      (e.g. no-reply@sethdentalgerringong.com.au)
- INTAKE_ADDRESS   -> seth-dental-invisalign+c3bf8524-ef4e-42a6-ad9b-481cab01dc28@intake.smileox.com.au
                      (already defaulted in lead.js; set it to be explicit)
- ALLOWED_ORIGIN   -> this page's URL (e.g. https://sethdentaloffer.vercel.app)

Then Redeploy (env vars only apply to builds created after they're added).

## Steps
1. Upload these files to the GitHub repo root (no folders).
2. In SMTP2GO, make sure SENDER_EMAIL is a verified sender (Sender Domains /
   Verified Senders). If the domain isn't verified yet, verify it once.
3. Add the env vars above in Vercel, then Redeploy.
4. Submit a test lead on the live URL and confirm it appears in SmileOx.
   You can also see the send under SMTP2GO > Activity.

## Files
- index.html - landing page
- lead.js - lead relay (SMTP2GO API)
- vercel.json - routing (serves images + page, routes /api/lead)
- package.json
- hiral.png, abhishek.png - dentist headshots (same-origin)
