# Almana inquiry form worker

What it does: receives the website contact form (JSON POST) and emails it to info@almanarecovery.com
via Cloudflare Email Routing. No third-party form service; nothing stored.

## Deploy (Jason, ~5 minutes, Cloudflare dashboard)
1. Cloudflare dashboard -> almanarecovery.com -> Email -> Email Routing: confirm it is ON and
   info@almanarecovery.com is a routing address (it already forwards to Higgins). Also add a
   destination address if the dashboard asks for one, and verify it from the inbox.
2. Workers & Pages -> Create -> Create Worker -> name "almana-inquiry" -> Deploy, then "Edit code":
   paste worker.js over the default code -> Deploy.
3. Worker -> Settings -> Bindings -> Add -> "Send email":
   variable name INQUIRY_EMAIL, destination address info@almanarecovery.com. Save.
4. Worker -> Settings -> Domains & Routes -> Add -> Route:
   route form.almanarecovery.com/*  zone almanarecovery.com. (Or add a Custom Domain form.almanarecovery.com.)
   Cloudflare creates the DNS record for a Custom Domain automatically; for a Route, add a proxied
   AAAA record form -> 100:: first.
5. Test from a terminal:
   curl -X POST https://form.almanarecovery.com/inquiry -H 'Content-Type: application/json' \
     -H 'Origin: https://www.almanarecovery.com' \
     -d '{"name":"Test","phone":"7035550100","email":"test@example.com","interest":"Test","message":"hello"}'
   Expect {"ok":true} and an email in the info@ inbox.

Or with wrangler: `npx wrangler login` then `npx wrangler deploy` from this folder.

The site's index.html already posts to https://form.almanarecovery.com/inquiry and falls back to
mailto: only if the request fails, so nothing on the site needs to change once this is live.

Note on privacy: inquiries may contain health details. This path keeps them inside Alma's own
Cloudflare account and mailbox. Cloudflare's standard plan does not include a HIPAA BAA; same posture
as the existing email inbox.
