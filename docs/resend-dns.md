# Resend — sending domain DNS for sckin.org

`/api/evaluations` sends two emails per sign-up through [Resend](https://resend.com)
from `SCKIN <noreply@sckin.org>` (see `src/lib/email.ts`). Resend only delivers
from a domain it has verified, so `sckin.org` needs the records below in the
**Route 53 hosted zone `sckin.org`**. Until the domain is verified, sends fail;
the route logs the error, the sign-up is still saved, and the page still shows
the rating-form link (it just doesn't say "we've also emailed it to you").

## 1. Add the domain in Resend

Resend dashboard → **Domains → Add domain** → `sckin.org`, region
**us-east-1** (Resend's default). Resend then shows the exact
records for this domain. **Copy the values from that screen** — the DKIM key is
generated per domain, and the MX host depends on the region you pick. The
table below is the shape to expect, not values to paste.

## 2. Records to add in Route 53

| Purpose | Record name | Type | Value | TTL |
|---|---|---|---|---|
| DKIM | `resend._domainkey.sckin.org` | TXT | `"p=MIGfMA0GCSq…"` — **copy from the Resend dashboard** | 300 |
| SPF (return path) | `send.sckin.org` | TXT | `"v=spf1 include:amazonses.com ~all"` | 300 |
| Bounces (return path) | `send.sckin.org` | MX | `10 feedback-smtp.us-east-1.amazonses.com` | 300 |

Route 53 specifics:

- **TXT values must be wrapped in double quotes** in the console.
- A TXT string longer than 255 characters must be split into several quoted
  strings in one record (`"first-255-chars" "rest"`). Resend's DKIM key is
  usually short enough for one string; if the console rejects it, split it.
- **MX values** in Route 53 are `priority host` on one line: `10 feedback-smtp.us-east-1.amazonses.com`.
- Create `send.sckin.org` as **new records**. Do not edit anything at the apex.

## 3. What NOT to change

Checked 2026-10-27 (`dig @8.8.8.8`). sckin.org mail runs on Google Workspace:

| Existing record | Value | Action |
|---|---|---|
| `sckin.org` MX | `1 smtp.google.com` | leave |
| `sckin.org` TXT (SPF) | `"v=spf1 include:_spf.google.com ~all"` | **leave** — Resend's SPF lives on `send.sckin.org`, not the apex. A second `v=spf1` record at the apex would break SPF for Google mail too |
| `google._domainkey.sckin.org` TXT | Google DKIM | leave |
| `_dmarc.sckin.org` TXT | `"v=DMARC1; p=none; …; aspf=r;"` | leave — Resend mail passes DMARC through the `d=sckin.org` DKIM signature, and relaxed SPF alignment also accepts `send.sckin.org` |

Optional, later: Resend can track opens/clicks through a custom tracking
subdomain. It is not needed for these emails and is not enabled.

## 4. Verify

1. Wait for propagation (minutes, with a 300 s TTL), then click **Verify DNS
   records** in Resend. All three records should go green.
2. Check from a terminal:

   ```sh
   dig +short TXT resend._domainkey.sckin.org @8.8.8.8
   dig +short TXT send.sckin.org @8.8.8.8
   dig +short MX  send.sckin.org @8.8.8.8
   ```

3. Create an API key in Resend (**API Keys → Create**, permission *Sending
   access*, domain `sckin.org`) and set it in Vercel as `RESEND_API_KEY`
   (Production; Preview too if you want to test on a preview deployment —
   preview sign-ups then send real email).
4. Submit the `/evaluations` form with your own address and confirm both emails
   arrive and that `SCKIN <noreply@sckin.org>` shows SPF/DKIM/DMARC **pass** in
   the message headers ("Show original" in Gmail).
