# Seth Dental Gerringong - Invisalign Smile Event landing page

Self-contained: the landing page and the lead relay deploy together on Vercel.
Nothing here touches any other project or the domain's DNS.

## The only thing you must set
- `RESEND_API_KEY`  -> your Resend key (starts with re_...)

That's it. The SmileOx intake address is already baked into `lead.js`, and the
page posts to `/api/lead` on its own domain (no CORS, nothing to paste).

## Steps
1. New GitHub repo, upload these files to the root (no folders).
2. Vercel > Add New > Project > import the repo > preset "Other" > Deploy.
3. Project > Settings > Environment Variables > add `RESEND_API_KEY` = your key. Save.
4. Deployments > latest > Redeploy (so the key is picked up).
5. Open the deployment URL, submit a test lead, confirm it appears in SmileOx.
6. Run your ads to that Vercel URL (or attach a subdomain later in Vercel > Domains).

## Files
- index.html - landing page
- lead.js - lead relay (Resend)
- vercel.json - keeps everything flat, routes /api/lead
- package.json
