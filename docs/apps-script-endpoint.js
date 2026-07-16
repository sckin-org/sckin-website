/**
 * Google Apps Script Web App — form submission sink for sckin-website.
 *
 * Receives JSON POSTs from the site's server-side route handlers
 * (src/app/api/contact and src/app/api/pro-lead) and appends one row per
 * submission to a per-form tab in the bound Google Sheet. Contact submissions
 * are additionally emailed to the team with the reason in the subject line.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * HOW TO DEPLOY
 * ─────────────────────────────────────────────────────────────────────────
 * 1. Create (or open) the destination Google Sheet.
 * 2. Extensions → Apps Script. Paste this file's contents into Code.gs.
 * 3. (Optional) Edit CONTACT_NOTIFY_EMAIL below if it should differ.
 * 4. Deploy → New deployment → type "Web app".
 *      - Description: sckin form sink
 *      - Execute as: Me
 *      - Who has access: "Anyone"   ← required; the site calls it server-to-server
 * 5. Authorize when prompted (first deploy only).
 * 6. Copy the resulting Web App URL (…/exec).
 * 7. Put it in the site's environment as GOOGLE_SHEETS_WEBHOOK_URL:
 *      - Local:   add it to .env.local  (see .env.example)
 *      - Vercel:  Project → Settings → Environment Variables
 *    NEVER commit the URL — anyone holding it can append rows.
 * 8. Re-deploy this script (Deploy → Manage deployments → edit → new version)
 *    whenever you change the code; the URL stays the same.
 *
 * The site posts: { formType: "contact" | "pro-lead", ...fieldValues }.
 * Each formType writes to a tab of the same name; a header row is created from
 * the incoming field names the first time that tab is used. A "timestamp"
 * column is always written first (server-side time, authoritative).
 *
 * NOTE ON NORMALIZATION: whatever values arrive are stored verbatim. Value
 * normalization (casing, deduping) is the responsibility of the caller/DAG,
 * not this sink.
 */

var CONTACT_NOTIFY_EMAIL = "contact@sckin.org";

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, error: "No body" });
    }

    var payload = JSON.parse(e.postData.contents);
    var formType = String(payload.formType || "").trim();
    if (!formType) {
      return jsonResponse({ ok: false, error: "Missing formType" });
    }

    // Field values are every key except the routing field.
    var fieldNames = Object.keys(payload).filter(function (k) {
      return k !== "formType";
    });

    appendRow(formType, fieldNames, payload);

    if (formType === "contact") {
      notifyContact(payload);
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

/** Append a timestamped row to the tab named after formType, creating it and
 *  its header row on first use. */
function appendRow(formType, fieldNames, payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(formType);
  if (!sheet) {
    sheet = ss.insertSheet(formType);
    sheet.appendRow(["timestamp"].concat(fieldNames));
  }

  var row = [new Date()];
  for (var i = 0; i < fieldNames.length; i++) {
    row.push(payload[fieldNames[i]] != null ? payload[fieldNames[i]] : "");
  }
  sheet.appendRow(row);
}

/** Email the team for contact submissions, reason in the subject for triage. */
function notifyContact(payload) {
  var reason = payload.reason || "General";
  var name = payload.name || "someone";
  var subject = "[" + reason + "] Message from " + name;

  var lines = [];
  var keys = Object.keys(payload);
  for (var i = 0; i < keys.length; i++) {
    if (keys[i] === "formType") continue;
    lines.push(keys[i] + ": " + payload[keys[i]]);
  }

  MailApp.sendEmail({
    to: CONTACT_NOTIFY_EMAIL,
    replyTo: payload.email || CONTACT_NOTIFY_EMAIL,
    subject: subject,
    body: lines.join("\n"),
  });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
