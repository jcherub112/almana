// Almana inquiry form receiver. Google Apps Script Web App, deployed from the Google Workspace
// account that owns info@almanarecovery.com. Receives the site's form POST and emails it to info@.
// No third-party service. Nothing stored except the email itself.

const TO = "info@almanarecovery.com";

function doPost(e) {
  let d = {};
  try { d = JSON.parse(e.postData.contents); } catch (err) { return out({ ok: false, error: "bad json" }); }
  if (d.website) return out({ ok: true });                       // honeypot: silently accept bots
  const clean = (v, n) => String(v || "").replace(/[\r\n]+/g, " ").trim().slice(0, n);
  const name = clean(d.name, 120), phone = clean(d.phone, 40), email = clean(d.email, 120);
  const interest = clean(d.interest, 80), message = String(d.message || "").trim().slice(0, 4000);
  if (!name || !phone || !email) return out({ ok: false, error: "missing fields" });

  const ts = Utilities.formatDate(new Date(), "America/New_York", "EEE MMM d, yyyy h:mm a");
  const body = [
    "New inquiry from almanarecovery.com", "",
    "Name:      " + name, "Phone:     " + phone, "Email:     " + email,
    "Interest:  " + interest, "Received:  " + ts + " ET", "",
    "Message:", message || "(none)", "",
    "Reply to the client at " + email + " or " + phone + ".",
  ].join("\n");

  MailApp.sendEmail({
    to: TO,
    replyTo: email,
    name: "Almana Website",
    subject: "Website inquiry: " + name + " (" + (interest || "no selection") + ")",
    body: body,
  });
  return out({ ok: true });
}

function doGet() { return out({ ok: true, service: "almana-inquiry" }); }

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
