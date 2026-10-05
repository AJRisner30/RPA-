#!/usr/bin/env python3
"""
Patrol Ready Performance Official Brand Badge Generator
Generates high-fidelity vector SVGs matching the official Patrol Ready Performance insignia:
- Tactical police shield with chrome/silver beveled borders and midnight navy background
- 5-point star and tactical rank chevrons at top
- Muscular tactical patrol officer in body armor and tactical vest sprinting forward
- Laurel wreath branches
- Lower badge banner reading '★ POLICE ★' and 'PRP'
- Bold metallic typography: 'PATROL READY' + framed 'PERFORMANCE'
- Subtitle: '••• FITNESS FOR THE FRONTLINE •••'
"""

def generate_prp_svg():
    width = 800
    height = 700

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="100%" height="100%">
  <defs>
    <!-- Chrome / Steel Metallic Gradients -->
    <linearGradient id="chromeBevel" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="25%" stop-color="#CBD5E1" />
      <stop offset="50%" stop-color="#64748B" />
      <stop offset="75%" stop-color="#E2E8F0" />
      <stop offset="100%" stop-color="#475569" />
    </linearGradient>

    <linearGradient id="chromeSilver" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="35%" stop-color="#E2E8F0" />
      <stop offset="65%" stop-color="#94A3B8" />
      <stop offset="100%" stop-color="#CBD5E1" />
    </linearGradient>

    <linearGradient id="chromeHoriz" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#64748B" />
      <stop offset="20%" stop-color="#E2E8F0" />
      <stop offset="50%" stop-color="#FFFFFF" />
      <stop offset="80%" stop-color="#94A3B8" />
      <stop offset="100%" stop-color="#475569" />
    </linearGradient>

    <!-- Tactical Navy Gradients -->
    <linearGradient id="navyShieldBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1E2C42" />
      <stop offset="40%" stop-color="#111C2E" />
      <stop offset="100%" stop-color="#080E18" />
    </linearGradient>

    <linearGradient id="innerShieldGlow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2563EB" stop-opacity="0.35" />
      <stop offset="40%" stop-color="#1E3A8A" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#0F172A" stop-opacity="0.9" />
    </linearGradient>

    <linearGradient id="royalBlueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6" />
      <stop offset="50%" stop-color="#1D4ED8" />
      <stop offset="100%" stop-color="#0F2B5C" />
    </linearGradient>

    <!-- Star & Chevron 3D Gradients -->
    <linearGradient id="starLight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#94A3B8" />
    </linearGradient>
    <linearGradient id="starDark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#64748B" />
      <stop offset="100%" stop-color="#334155" />
    </linearGradient>

    <!-- Drop Shadows & Filters -->
    <filter id="badgeGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#1E3A8A" flood-opacity="0.45" />
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.7" />
    </filter>

    <filter id="textGlow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity="0.9" />
    </filter>
  </defs>

  <!-- SHIELD BADGE GROUP (Center: X=400) -->
  <g filter="url(#badgeGlow)">
    <!-- Outer Shield Metallic Layer -->
    <!-- Shield Path: Top notch at 400,35; top peaks at 300,55 and 500,55; outer ear peaks at 240,85 and 560,85; curves down to point at 400,430 -->
    <path d="M 400 32 
             L 485 52 
             L 565 82 
             L 565 240 
             C 565 315, 490 380, 400 425 
             C 310 380, 235 315, 235 240 
             L 235 82 
             L 315 52 Z"
          fill="url(#chromeBevel)" 
          stroke="#0F172A" stroke-width="3" />

    <!-- Secondary Steel Inset Border -->
    <path d="M 400 42 
             L 480 60 
             L 552 88 
             L 552 238 
             C 552 308, 482 370, 400 412 
             C 318 370, 248 308, 248 238 
             L 248 88 
             L 320 60 Z"
          fill="#0B121D" 
          stroke="url(#chromeHoriz)" stroke-width="2" />

    <!-- Main Navy Shield Field -->
    <path d="M 400 48 
             L 476 66 
             L 544 92 
             L 544 235 
             C 544 302, 476 362, 400 404 
             C 324 362, 256 302, 256 235 
             L 256 92 
             L 324 66 Z"
          fill="url(#navyShieldBg)" />

    <!-- Inner Radial Blue Spotlight -->
    <path d="M 400 48 
             L 476 66 
             L 544 92 
             L 544 235 
             C 544 302, 476 362, 400 404 
             C 324 362, 256 302, 256 235 
             L 256 92 
             L 324 66 Z"
          fill="url(#innerShieldGlow)" />

    <!-- Thin Blue Line / Steel Edge Inset Line -->
    <path d="M 400 58 
             L 468 74 
             L 534 98 
             L 534 232 
             C 534 294, 470 350, 400 392 
             C 330 350, 266 294, 266 232 
             L 266 98 
             L 332 74 Z"
          fill="none" 
          stroke="#3B82F6" stroke-width="1.8" stroke-opacity="0.8" />

    <!-- 5-POINT STAR AT APEX (Center 400, 82, Radius ~20) -->
    <g transform="translate(400, 84)">
      <!-- Star Outer Circle Accent -->
      <circle cx="0" cy="0" r="22" fill="none" stroke="#64748B" stroke-width="1" stroke-dasharray="2,2" opacity="0.6"/>
      <!-- 5-Point Faceted 3D Star -->
      <polygon points="0,-18 5,-5 18,-5 8,4 12,17 0,9 -12,17 -8,4 -18,-5 -5,-5" fill="url(#starLight)"/>
      <polygon points="0,-18 0,9 12,17 8,4" fill="url(#starDark)" opacity="0.45"/>
      <polygon points="0,-18 0,9 -12,17 -8,4" fill="#FFFFFF" opacity="0.6"/>
    </g>

    <!-- TACTICAL CHEVRONS BELOW STAR (X=400, Y=116 & Y=132) -->
    <!-- Top Chevron -->
    <path d="M 370 125 L 400 108 L 430 125 L 424 133 L 400 119 L 376 133 Z" 
          fill="url(#chromeSilver)" stroke="#0F172A" stroke-width="1" />
    <!-- Lower Chevron -->
    <path d="M 374 138 L 400 123 L 426 138 L 420 146 L 400 134 L 380 146 Z" 
          fill="url(#chromeSilver)" stroke="#0F172A" stroke-width="1" />

    <!-- LAUREL WREATH BRANCHES (Flanking Left & Right inside shield) -->
    <!-- Left Laurel Wreath -->
    <g fill="url(#chromeSilver)" opacity="0.85">
      <!-- Leaves curving up from 280,310 to 285,160 -->
      <path d="M 290 320 Q 275 260 285 200 Q 295 160 310 135" fill="none" stroke="#94A3B8" stroke-width="2"/>
      <!-- Leaf Pairs -->
      <path d="M 292 315 C 280 315 272 308 274 300 C 282 300 290 307 292 315 Z"/>
      <path d="M 296 305 C 298 295 306 292 312 296 C 308 304 300 308 296 305 Z"/>
      <path d="M 285 285 C 272 284 266 275 268 268 C 277 268 284 276 285 285 Z"/>
      <path d="M 290 270 C 294 260 302 258 308 263 C 304 271 296 274 290 270 Z"/>
      <path d="M 280 250 C 268 247 264 238 267 232 C 276 233 282 241 280 250 Z"/>
      <path d="M 286 235 C 291 225 300 224 305 229 C 300 237 292 240 286 235 Z"/>
      <path d="M 280 215 C 270 210 268 200 272 195 C 280 197 284 206 280 215 Z"/>
      <path d="M 288 200 C 294 190 303 191 307 197 C 301 204 293 206 288 200 Z"/>
      <path d="M 285 180 C 276 173 277 163 283 159 C 289 163 291 172 285 180 Z"/>
      <path d="M 295 165 C 302 156 312 158 315 165 C 308 171 300 171 295 165 Z"/>
      <path d="M 295 145 C 290 137 294 128 302 126 C 306 132 304 141 295 145 Z"/>
    </g>

    <!-- Right Laurel Wreath (Mirrored) -->
    <g fill="url(#chromeSilver)" opacity="0.85">
      <path d="M 510 320 Q 525 260 515 200 Q 505 160 490 135" fill="none" stroke="#94A3B8" stroke-width="2"/>
      <path d="M 508 315 C 520 315 528 308 526 300 C 518 300 510 307 508 315 Z"/>
      <path d="M 504 305 C 502 295 494 292 488 296 C 492 304 500 308 504 305 Z"/>
      <path d="M 515 285 C 528 284 534 275 532 268 C 523 268 516 276 515 285 Z"/>
      <path d="M 510 270 C 506 260 498 258 492 263 C 496 271 504 274 510 270 Z"/>
      <path d="M 520 250 C 532 247 536 238 533 232 C 524 233 518 241 520 250 Z"/>
      <path d="M 514 235 C 509 225 500 224 495 229 C 500 237 508 240 514 235 Z"/>
      <path d="M 520 215 C 530 210 532 200 528 195 C 520 197 516 206 520 215 Z"/>
      <path d="M 512 200 C 506 190 497 191 493 197 C 499 204 507 206 512 200 Z"/>
      <path d="M 515 180 C 524 173 523 163 517 159 C 511 163 509 172 515 180 Z"/>
      <path d="M 505 165 C 498 156 488 158 485 165 C 492 171 500 171 505 165 Z"/>
      <path d="M 505 145 C 510 137 506 128 498 126 C 494 132 496 141 505 145 Z"/>
    </g>

    <!-- SPRINTING TACTICAL PATROL OFFICER SILHOUETTE & HIGHLIGHTS -->
    <g transform="translate(400, 240)" id="tacticalOfficer">
      <!-- Outer Dynamic Backlight / Shadow -->
      <ellipse cx="0" cy="80" rx="65" ry="12" fill="#000000" opacity="0.4" />

      <!-- Back Leg & Boot (Pushing Off Ground) -->
      <path d="M -12,48 L -24,80 L -38,105 L -48,108 L -52,118 L -32,118 L -22,100 L -6,62 Z" 
            fill="#1E293B" stroke="#0F172A" stroke-width="1.5" />
      <!-- Tactical Boot Highlight -->
      <path d="M -50,116 L -34,116 L -36,112 L -48,112 Z" fill="#64748B" />

      <!-- Front Leg & Boot (Knee Driving Forward) -->
      <path d="M 10,48 L 26,72 L 32,95 L 26,110 L 16,114 L 35,116 L 44,112 L 42,95 L 32,70 L 18,45 Z" 
            fill="#334155" stroke="#0F172A" stroke-width="1.5" />
      <path d="M 18,113 L 40,113 L 42,109 L 22,109 Z" fill="#94A3B8" />

      <!-- Torso with Tactical Duty Plate Carrier / Vest -->
      <!-- Duty Uniform Base -->
      <path d="M -22,2 L 22,-4 L 20,52 L -18,50 Z" fill="#0F172A" />

      <!-- Plate Carrier Body Armor (Navy / Tactical Steel) -->
      <path d="M -20,4 L 20,-2 L 18,44 L -16,46 Z" 
            fill="#1E293B" stroke="#475569" stroke-width="1.5" />
      <!-- MOLLE Webbing Horizontal Rows -->
      <line x1="-14" y1="18" x2="14" y2="14" stroke="#64748B" stroke-width="2" stroke-dasharray="5,2" />
      <line x1="-14" y1="26" x2="14" y2="22" stroke="#64748B" stroke-width="2" stroke-dasharray="5,2" />
      <line x1="-14" y1="34" x2="14" y2="30" stroke="#64748B" stroke-width="2" stroke-dasharray="5,2" />

      <!-- 'POLICE' Chest Badge Patch -->
      <rect x="-14" y="6" width="28" height="8" rx="1.5" fill="#0B1320" stroke="#64748B" stroke-width="0.8" />
      <text x="0" y="12.5" font-family="'Impact', 'Arial Black', sans-serif" font-weight="900" font-size="6.5" 
            fill="#FFFFFF" text-anchor="middle" letter-spacing="1">POLICE</text>

      <!-- Tactical Duty Belt with Pouches & Holster -->
      <path d="M -18,44 L 18,40 L 19,48 L -17,52 Z" fill="#0F172A" stroke="#475569" stroke-width="1" />
      <rect x="-12" y="44" width="6" height="7" rx="1" fill="#334155" />
      <rect x="4" y="41" width="7" height="8" rx="1" fill="#334155" />
      <rect x="13" y="42" width="6" height="9" rx="1" fill="#1E293B" stroke="#475569" stroke-width="0.5" />

      <!-- Left Arm (Pumping Back, Fist Clenched) -->
      <path d="M -18,4 L -32,-6 L -44,-4 L -42,8 L -32,8 L -24,20 L -18,12 Z" 
            fill="#1E293B" stroke="#0F172A" stroke-width="1.2" />
      <!-- Left Hand Fist -->
      <circle cx="-42" cy="2" r="5" fill="#CBD5E1" />

      <!-- Right Arm (Driving Forward, Muscle Flexed) -->
      <path d="M 18,2 L 32,8 L 44,-2 L 40,-12 L 26,-8 L 18,-2 Z" 
            fill="#334155" stroke="#0F172A" stroke-width="1.2" />
      <!-- Tactical Glove / Right Fist -->
      <circle cx="43" cy="-7" r="5.5" fill="#E2E8F0" />

      <!-- Head, Tactical Crew Cut, Jawline (Determined Profile Looking Forward) -->
      <!-- Neck -->
      <path d="M -4,-2 L 6,-6 L 8,-12 L -2,-10 Z" fill="#CBD5E1" />
      <!-- Face & Chin -->
      <path d="M 4,-12 L 14,-14 L 16,-20 L 14,-26 L 8,-28 L 0,-26 L -2,-18 L 2,-12 Z" 
            fill="#E2E8F0" stroke="#0F172A" stroke-width="1" />
      <!-- Hair / Tactical High & Tight -->
      <path d="M 0,-26 L 10,-28 L 16,-27 L 14,-22 L 6,-22 L 0,-25 Z" fill="#1E293B" />
      <!-- Eye & Ear Accent -->
      <circle cx="9" cy="-21" r="1" fill="#0F172A" />
      <path d="M 2,-19 Q 0,-21 2,-23" fill="none" stroke="#64748B" stroke-width="1" />
    </g>

    <!-- LOWER RIBBON BANNER: '★ POLICE ★' (X=400, Y=330 to 365) -->
    <!-- Ribbon Shadow & Fold-backs -->
    <path d="M 305 342 L 290 355 L 305 368 L 305 342 Z" fill="#0B121D" />
    <path d="M 495 342 L 510 355 L 495 368 L 495 342 Z" fill="#0B121D" />

    <!-- Main Front Arched Ribbon Banner -->
    <path d="M 300 342 
             C 345 334, 455 334, 500 342 
             L 492 372 
             C 455 364, 345 364, 308 372 Z" 
          fill="url(#chromeHoriz)" 
          stroke="#0F172A" stroke-width="2" />

    <!-- Ribbon Inner Inset Line -->
    <path d="M 308 346 
             C 350 338, 450 338, 492 346 
             L 486 368 
             C 450 360, 350 360, 314 368 Z" 
          fill="none" 
          stroke="#3B82F6" stroke-width="1" stroke-opacity="0.8" />

    <!-- Banner Text: ★ POLICE ★ -->
    <text x="400" y="361" 
          font-family="'Impact', 'Arial Black', sans-serif" 
          font-size="19" 
          font-weight="900" 
          fill="#0B1320" 
          text-anchor="middle" 
          letter-spacing="4">
      &#9733; POLICE &#9733;
    </text>

    <!-- LOWER SHIELD POINT: 'PRP' (Patrol Ready Performance) -->
    <text x="400" y="394" 
          font-family="'Impact', 'Arial Black', sans-serif" 
          font-size="14" 
          font-weight="900" 
          fill="url(#chromeSilver)" 
          stroke="#080E18" stroke-width="0.8" 
          text-anchor="middle" 
          letter-spacing="3">
      PRP
    </text>
  </g>

  <!-- LOWER BRANDING TYPOGRAPHY GROUP -->
  <g filter="url(#textGlow)">
    <!-- 'PATROL READY' (Large Bold Beveled Athletic Typography) -->
    <!-- 3D Shadow Base -->
    <text x="400" y="492" 
          font-family="'Impact', 'Arial Black', sans-serif" 
          font-size="64" 
          font-weight="900" 
          fill="#050911" 
          text-anchor="middle" 
          letter-spacing="3">
      PATROL READY
    </text>
    <!-- Silver Outer Stroke -->
    <text x="400" y="488" 
          font-family="'Impact', 'Arial Black', sans-serif" 
          font-size="64" 
          font-weight="900" 
          fill="#1E2C42" 
          stroke="url(#chromeHoriz)" 
          stroke-width="5" 
          stroke-linejoin="round"
          text-anchor="middle" 
          letter-spacing="3">
      PATROL READY
    </text>
    <!-- Crisp Foreground Fill with Chrome Gradient Highlights -->
    <text x="400" y="488" 
          font-family="'Impact', 'Arial Black', sans-serif" 
          font-size="64" 
          font-weight="900" 
          fill="url(#chromeSilver)" 
          text-anchor="middle" 
          letter-spacing="3">
      PATROL READY
    </text>

    <!-- 'PERFORMANCE' FRAMED BOX -->
    <!-- Tactical Angular Steel Frame -->
    <g transform="translate(400, 545)">
      <!-- Outer Frame Box -->
      <path d="M -235 -24 L 235 -24 L 245 -14 L 245 16 L 235 24 L -235 24 L -245 14 L -245 -14 Z" 
            fill="#0A101A" stroke="url(#chromeHoriz)" stroke-width="2.5" />
      
      <!-- Inner Corner Notch Accents -->
      <line x1="-240" y1="-8" x2="-240" y2="8" stroke="#3B82F6" stroke-width="3" />
      <line x1="240" y1="-8" x2="240" y2="8" stroke="#3B82F6" stroke-width="3" />

      <!-- 'PERFORMANCE' Text with Wide Spacing -->
      <text x="0" y="7" 
            font-family="'Impact', 'Arial Black', sans-serif" 
            font-size="28" 
            font-weight="900" 
            fill="url(#chromeSilver)" 
            letter-spacing="10" 
            text-anchor="middle">
        PERFORMANCE
      </text>
    </g>

    <!-- '••• FITNESS FOR THE FRONTLINE •••' -->
    <g transform="translate(400, 608)">
      <!-- Left Three Bullets -->
      <circle cx="-185" cy="-4" r="3.5" fill="#3B82F6" />
      <circle cx="-172" cy="-4" r="4.5" fill="url(#chromeSilver)" />
      <circle cx="-159" cy="-4" r="3.5" fill="#3B82F6" />

      <!-- Center Tagline Text -->
      <text x="0" y="1" 
            font-family="'Impact', 'Arial Black', sans-serif" 
            font-size="17" 
            font-weight="900" 
            fill="#CBD5E1" 
            letter-spacing="4.5" 
            text-anchor="middle">
        FITNESS FOR THE FRONTLINE
      </text>

      <!-- Right Three Bullets -->
      <circle cx="159" cy="-4" r="3.5" fill="#3B82F6" />
      <circle cx="172" cy="-4" r="4.5" fill="url(#chromeSilver)" />
      <circle cx="185" cy="-4" r="3.5" fill="#3B82F6" />
    </g>
  </g>
</svg>
'''
    return svg

def generate_prp_badge_icon_svg():
    """Square 1:1 shield icon for favicons, apple touch icons, and small chips"""
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="chromeBevelFav" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="30%" stop-color="#CBD5E1" />
      <stop offset="60%" stop-color="#64748B" />
      <stop offset="100%" stop-color="#334155" />
    </linearGradient>

    <linearGradient id="navyShieldFav" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1E2C42" />
      <stop offset="45%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#070C14" />
    </linearGradient>

    <linearGradient id="chromeSilverFav" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="50%" stop-color="#E2E8F0" />
      <stop offset="100%" stop-color="#94A3B8" />
    </linearGradient>

    <filter id="iconShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#1E3A8A" flood-opacity="0.5" />
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000000" flood-opacity="0.8" />
    </filter>
  </defs>

  <rect width="512" height="512" rx="96" fill="#0A0E17"/>

  <!-- Police Shield Badge (Centered) -->
  <g filter="url(#iconShadow)" transform="translate(256, 250) scale(1.1) translate(-400, -235)">
    <!-- Outer Shield Metallic Layer -->
    <path d="M 400 32 L 485 52 L 565 82 L 565 240 C 565 315, 490 380, 400 425 C 310 380, 235 315, 235 240 L 235 82 L 315 52 Z"
          fill="url(#chromeBevelFav)" stroke="#020617" stroke-width="4" />

    <!-- Inset Steel Layer -->
    <path d="M 400 44 L 478 62 L 550 90 L 550 236 C 550 304, 480 366, 400 408 C 320 366, 250 304, 250 236 L 250 90 L 322 62 Z"
          fill="#0B121D" stroke="#94A3B8" stroke-width="2" />

    <!-- Main Navy Field -->
    <path d="M 400 50 L 474 68 L 542 94 L 542 233 C 542 298, 474 358, 400 398 C 326 358, 258 298, 258 233 L 258 94 L 326 68 Z"
          fill="url(#navyShieldFav)" />

    <!-- Thin Blue Line Rim -->
    <path d="M 400 60 L 466 76 L 532 100 L 532 230 C 532 290, 468 346, 400 386 C 332 346, 268 290, 268 230 L 268 100 L 334 76 Z"
          fill="none" stroke="#3B82F6" stroke-width="2.5" />

    <!-- 5-Point Star -->
    <g transform="translate(400, 86)">
      <polygon points="0,-18 5,-5 18,-5 8,4 12,17 0,9 -12,17 -8,4 -18,-5 -5,-5" fill="#FFFFFF"/>
    </g>

    <!-- Chevrons -->
    <path d="M 370 126 L 400 110 L 430 126 L 424 134 L 400 120 L 376 134 Z" fill="url(#chromeSilverFav)" />
    <path d="M 374 139 L 400 124 L 426 139 L 420 147 L 400 135 L 380 147 Z" fill="url(#chromeSilverFav)" />

    <!-- Officer Silhouette -->
    <g transform="translate(400, 240)">
      <path d="M -12,48 L -24,80 L -38,105 L -52,118 L -32,118 L -22,100 L -6,62 Z" fill="#1E293B" />
      <path d="M 10,48 L 26,72 L 32,95 L 16,114 L 35,116 L 44,112 L 42,95 L 32,70 L 18,45 Z" fill="#334155" />
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
</svg>
'''

if __name__ == "__main__":
    full_logo = generate_prp_svg()
    with open("public/patrol-ready-logo.svg", "w") as f:
        f.write(full_logo)
    print("Wrote public/patrol-ready-logo.svg")

    icon_logo = generate_prp_badge_icon_svg()
    with open("public/favicon.svg", "w") as f:
        f.write(icon_logo)
    print("Wrote public/favicon.svg")
