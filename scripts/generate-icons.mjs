import fs from 'fs';
import path from 'path';
import { Resvg } from '@resvg/resvg-js';

function createBadgeSvg({ scale = 1.05, rx = 0, yOffset = 250 } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="chromeBevelFav" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="25%" stop-color="#E2E8F0" />
      <stop offset="50%" stop-color="#94A3B8" />
      <stop offset="75%" stop-color="#CBD5E1" />
      <stop offset="100%" stop-color="#334155" />
    </linearGradient>

    <linearGradient id="navyShieldFav" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1E2C42" />
      <stop offset="35%" stop-color="#111C2E" />
      <stop offset="70%" stop-color="#0B1320" />
      <stop offset="100%" stop-color="#060A12" />
    </linearGradient>

    <linearGradient id="chromeSilverFav" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="45%" stop-color="#E2E8F0" />
      <stop offset="75%" stop-color="#94A3B8" />
      <stop offset="100%" stop-color="#CBD5E1" />
    </linearGradient>

    <linearGradient id="goldStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A" />
      <stop offset="50%" stop-color="#FACC15" />
      <stop offset="100%" stop-color="#CA8A04" />
    </linearGradient>

    <linearGradient id="blueGlowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#1D4ED8" stop-opacity="0.0" />
    </linearGradient>

    <filter id="iconShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="14" flood-color="#1E3A8A" flood-opacity="0.6" />
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.9" />
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="512" height="512" ${rx > 0 ? `rx="${rx}"` : ''} fill="#0A0E17"/>

  <!-- Subtle Radial Background Glow -->
  <radialGradient id="centerAura" cx="50%" cy="45%" r="60%">
    <stop offset="0%" stop-color="#1E3A8A" stop-opacity="0.25" />
    <stop offset="70%" stop-color="#0B1320" stop-opacity="0.0" />
  </radialGradient>
  <rect width="512" height="512" fill="url(#centerAura)" />

  <!-- Police Shield Badge (Centered) -->
  <g filter="url(#iconShadow)" transform="translate(256, ${yOffset}) scale(${scale}) translate(-400, -235)">
    <!-- Outer Shield Metallic Layer -->
    <path d="M 400 32 L 485 52 L 565 82 L 565 240 C 565 315, 490 380, 400 425 C 310 380, 235 315, 235 240 L 235 82 L 315 52 Z"
          fill="url(#chromeBevelFav)" stroke="#020617" stroke-width="4" />

    <!-- Inset Steel Layer -->
    <path d="M 400 44 L 478 62 L 550 90 L 550 236 C 550 304, 480 366, 400 408 C 320 366, 250 304, 250 236 L 250 90 L 322 62 Z"
          fill="#0B121D" stroke="#94A3B8" stroke-width="2" />

    <!-- Main Navy Field -->
    <path d="M 400 50 L 474 68 L 542 94 L 542 233 C 542 298, 474 358, 400 398 C 326 358, 258 298, 258 233 L 258 94 L 326 68 Z"
          fill="url(#navyShieldFav)" />

    <!-- Blue Ambient Aura Inside Shield -->
    <path d="M 400 50 L 474 68 L 542 94 L 542 233 C 542 298, 474 358, 400 398 C 326 358, 258 298, 258 233 L 258 94 L 326 68 Z"
          fill="url(#blueGlowGrad)" />

    <!-- Thin Blue Line Rim -->
    <path d="M 400 60 L 466 76 L 532 100 L 532 230 C 532 290, 468 346, 400 386 C 332 346, 268 290, 268 230 L 268 100 L 334 76 Z"
          fill="none" stroke="#3B82F6" stroke-width="2.5" />

    <!-- 5-Point Gold Star -->
    <g transform="translate(400, 86)">
      <polygon points="0,-18 5,-5 18,-5 8,4 12,17 0,9 -12,17 -8,4 -18,-5 -5,-5" fill="url(#goldStarGrad)" stroke="#78350F" stroke-width="0.8" />
    </g>

    <!-- Chevrons -->
    <path d="M 370 126 L 400 110 L 430 126 L 424 134 L 400 120 L 376 134 Z" fill="url(#chromeSilverFav)" />
    <path d="M 374 139 L 400 124 L 426 139 L 420 147 L 400 135 L 380 147 Z" fill="url(#chromeSilverFav)" />

    <!-- Officer Silhouette -->
    <g transform="translate(400, 240)">
      <!-- Legs in Sprint Stride -->
      <path d="M -12,48 L -24,80 L -38,105 L -52,118 L -32,118 L -22,100 L -6,62 Z" fill="#1E293B" />
      <path d="M 10,48 L 26,72 L 32,95 L 16,114 L 35,116 L 44,112 L 42,95 L 32,70 L 18,45 Z" fill="#334155" />
      <!-- Torso & Tactical Armor Plate Carrier -->
      <path d="M -20,4 L 20,-2 L 18,44 L -16,46 Z" fill="#1E293B" stroke="#64748B" stroke-width="1.5" />
      <!-- POLICE chest tag -->
      <rect x="-14" y="6" width="28" height="8" rx="1.5" fill="#0B1320" />
      <text x="0" y="12.5" font-family="'Impact', 'Arial Black', sans-serif" font-weight="900" font-size="6.5" fill="#FFFFFF" text-anchor="middle">POLICE</text>
      <!-- Head & Arms -->
      <circle cx="43" cy="-7" r="5" fill="#CBD5E1" />
      <circle cx="-42" cy="2" r="4.5" fill="#64748B" />
      <path d="M 4,-12 L 14,-14 L 16,-20 L 14,-26 L 8,-28 L 0,-26 L -2,-18 L 2,-12 Z" fill="#E2E8F0" />
    </g>

    <!-- ★ POLICE ★ Banner -->
    <path d="M 300 342 C 345 334, 455 334, 500 342 L 492 372 C 455 364, 345 364, 308 372 Z" 
          fill="url(#chromeSilverFav)" stroke="#0F172A" stroke-width="2" />
    <text x="400" y="361" font-family="'Impact', 'Arial Black', sans-serif" font-size="18" font-weight="900" fill="#0B1320" text-anchor="middle" letter-spacing="4">&#9733; POLICE &#9733;</text>
    <text x="400" y="394" font-family="'Impact', 'Arial Black', sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">PRP</text>
  </g>
</svg>`;
}

function renderPng(svg, size) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    font: { loadSystemFonts: true }
  });
  return resvg.render().asPng();
}

async function main() {
  console.log('Building high-resolution PWA and App Store icons...');

  // 1. Standard icon (scale 1.05, centered)
  const standardSvg = createBadgeSvg({ scale: 1.02, rx: 0, yOffset: 252 });
  
  // 2. Maskable icon (scale 0.82 to fit within 80% safe zone circle for Android)
  const maskableSvg = createBadgeSvg({ scale: 0.82, rx: 0, yOffset: 256 });

  // 3. Apple Touch Icon (scale 1.0, rx 0)
  const appleSvg = createBadgeSvg({ scale: 1.0, rx: 0, yOffset: 252 });

  // 4. Favicon SVG
  fs.writeFileSync('public/favicon.svg', standardSvg);
  console.log('✓ public/favicon.svg');

  // 5. Render PNGs
  const pwa192 = renderPng(standardSvg, 192);
  fs.writeFileSync('public/pwa-192x192.png', pwa192);
  console.log('✓ public/pwa-192x192.png (192x192)');

  const pwa512 = renderPng(standardSvg, 512);
  fs.writeFileSync('public/pwa-512x512.png', pwa512);
  console.log('✓ public/pwa-512x512.png (512x512)');

  const maskable512 = renderPng(maskableSvg, 512);
  fs.writeFileSync('public/pwa-maskable-512x512.png', maskable512);
  console.log('✓ public/pwa-maskable-512x512.png (512x512 maskable safe-zone)');

  const appleTouch = renderPng(appleSvg, 180);
  fs.writeFileSync('public/apple-touch-icon.png', appleTouch);
  console.log('✓ public/apple-touch-icon.png (180x180)');

  // If dist/ exists, also sync icons to dist/
  if (fs.existsSync('dist')) {
    fs.writeFileSync('dist/favicon.svg', standardSvg);
    fs.writeFileSync('dist/pwa-192x192.png', pwa192);
    fs.writeFileSync('dist/pwa-512x512.png', pwa512);
    fs.writeFileSync('dist/pwa-maskable-512x512.png', maskable512);
    fs.writeFileSync('dist/apple-touch-icon.png', appleTouch);
    console.log('✓ Synced to dist/');
  }

  console.log('All app icons generated successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
