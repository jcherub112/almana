# Almana inquiry form receiver (Google Apps Script)

almanarecovery.com mail is on Google Workspace (MX smtp.google.com), so the receiver lives there too.
Do NOT enable Cloudflare Email Routing on this zone; it would replace the Workspace MX records.

## Deploy (Jason or Alma, ~5 minutes, signed in as info@almanarecovery.com or another Workspace user)
1. Go to https://script.google.com -> New project. Name it "Almana inquiry form".
2. Replace the default code with the contents of Code.gs. Save (Cmd-S).
3. Deploy -> New deployment -> gear icon -> Web app.
   Description: inquiry form. Execute as: Me. Who has access: Anyone. -> Deploy.
   Authorize when prompted (it asks for permission to send email as you).
4. Copy the Web app URL (ends in /exec). Send it to Jason / paste it in the chat.
5. Jason sets CONTACT_ENDPOINT in index.html and es/index.html to that URL and pushes.
6. Test: submit the website form. Expect "Thank you..." on the page and an email in info@
   with Reply-To set to the client.

## Notes
- The site posts JSON as text/plain so the browser makes a simple CORS request; Apps Script
  Web Apps answer those from any origin after the Google redirect.
- MailApp quota: 100 emails/day on Workspace Starter, 1,500/day on higher tiers. Plenty.
- If the script is deployed from Alma's personal Gmail instead of the Workspace account, it still
  works but the email arrives "from" that Gmail. Prefer the Workspace account.
- Changing the code later requires Deploy -> Manage deployments -> edit -> New version, or the
  /exec URL keeps serving the old code.
