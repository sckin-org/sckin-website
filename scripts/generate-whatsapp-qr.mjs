/**
 * Generate the WhatsApp QR code for SickleCellPedia.
 *
 * Encodes the wa.me deep link and writes a crisp PNG to public/images/ —
 * generated, not scraped from the old site, so it stays sharp at any size.
 * Run it again whenever the WhatsApp number changes:
 *
 *   node scripts/generate-whatsapp-qr.mjs
 *
 * The output is committed (public/ assets are part of the repo); this script
 * is build-tooling, not part of `next build`.
 */
import { fileURLToPath } from "node:url";
import path from "node:path";
import QRCode from "qrcode";

const WHATSAPP_URL = "https://wa.me/15557513738";

const outFile = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "images",
  "whatsapp-qr.png"
);

await QRCode.toFile(outFile, WHATSAPP_URL, {
  type: "png",
  width: 1024, // large source; pages render it down, so scans stay reliable
  margin: 2,
  errorCorrectionLevel: "M",
  color: { dark: "#16161A", light: "#FFFFFF" }, // ink on white (tokens)
});

console.log(`Wrote ${outFile} encoding ${WHATSAPP_URL}`);
