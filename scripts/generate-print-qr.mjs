/**
 * Generate the QR codes for SCKIN print material (posters, slides, flyers).
 *
 * Writes one crisp PNG per link to public/images/qr/. These are not displayed
 * on any page — they live in the repo so print files can be rebuilt from a
 * known source. Same settings as scripts/generate-whatsapp-qr.mjs, whose
 * output (public/images/whatsapp-qr.png, shown on /sicklecellpedia) is left
 * untouched. Run again whenever a link changes:
 *
 *   node scripts/generate-print-qr.mjs
 *
 * The output is committed; this script is build-tooling, not part of
 * `next build`.
 */
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import QRCode from "qrcode";

const CODES = [
  { file: "evaluations.png", url: "https://sckin.org/evaluations" },
  {
    file: "scdaa-2026-poster.png",
    url: "https://sckin.org/documents/sckin-scdaa-2026-poster.pdf",
  },
  { file: "sicklecellpedia.png", url: "https://sckin.org/sicklecellpedia" },
  { file: "whatsapp.png", url: "https://wa.me/15557513738" },
];

const outDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "images",
  "qr"
);
await mkdir(outDir, { recursive: true });

for (const { file, url } of CODES) {
  const outFile = path.join(outDir, file);
  await QRCode.toFile(outFile, url, {
    type: "png",
    width: 1024, // large source; print layouts scale it down
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#16161A", light: "#FFFFFF" }, // ink on white (tokens)
  });
  console.log(`Wrote ${outFile} encoding ${url}`);
}
