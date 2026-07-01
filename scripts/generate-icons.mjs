/**
 * Generates PWA / app-store style icons from the MEAT GUARD shield mark.
 * Run: node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public");

const BG = { r: 10, g: 10, b: 15, alpha: 1 }; // #0a0a0f

// Shield mark on a transparent canvas (viewBox 0 0 64 64).
const shieldSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop stop-color="#ef4444"/>
      <stop offset="1" stop-color="#22c55e"/>
    </linearGradient>
    <linearGradient id="body" x1="32" y1="4" x2="32" y2="60" gradientUnits="userSpaceOnUse">
      <stop stop-color="#181820"/>
      <stop offset="1" stop-color="#0c0c12"/>
    </linearGradient>
  </defs>
  <path d="M32 4 L54 13 V30 C54 45 44 56 32 60 C20 56 10 45 10 30 V13 Z"
        fill="url(#body)" stroke="url(#g)" stroke-width="3"/>
  <circle cx="32" cy="30" r="11" fill="none" stroke="url(#g)" stroke-width="3"/>
  <circle cx="32" cy="30" r="4" fill="#ef4444"/>
  <path d="M32 14 V8 M32 52 V46 M16 30 H10 M54 30 H48"
        stroke="#22c55e" stroke-width="2.5" stroke-linecap="round"/>
</svg>`;

/** Composite the shield (scaled) centered on a solid dark square. */
async function make(size, scale, outfile) {
  const logoSize = Math.round(size * scale);
  const logo = await sharp(Buffer.from(shieldSvg))
    .resize(logoSize, logoSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(join(OUT, outfile));

  console.log("✓", outfile, `${size}x${size}`);
}

await make(192, 0.72, "pwa-192x192.png");
await make(512, 0.72, "pwa-512x512.png");
await make(512, 0.58, "maskable-512x512.png"); // extra padding for the maskable safe zone
await make(180, 0.66, "apple-touch-icon.png"); // iOS home-screen icon
console.log("Done.");
