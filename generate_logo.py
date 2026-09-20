#!/usr/bin/env python3
"""
Overland Athletics Official Brand Crest Emblem Generator
Generates a 100% standalone, vector-precise SVG with zero external font dependencies.
Matches the official brand crest:
- Tactical distressed shield with notched ears and gold/bronze beveled borders
- Arched top header with bold 3D 'OVERLAND'
- Golden sunrise burst with radiating rays and celestial mountain stars
- Layered faceted slate mountain ridges and winding earthen trail
- Heroic tactical athlete running uphill carrying an Olympic barbell and heavy rucksack
- Prominent lower banner with bold collegiate 'ATHLETICS'
- Gold sub-banner with '— RUN | LIFT | RUCK —'
- Bottom rocker with 'ELITE PERFORMANCE | GO THE DISTANCE'
"""

import math

def generate_overland_svg(include_bg=False):
    width = 600
    height = 680

    # Colors
    c_gold_light = "#F8E7AB"
    c_gold_mid = "#D8A348"
    c_gold_deep = "#9E6D24"
    c_gold_dark = "#5A3A0B"

    c_slate_darkest = "#0F1419"
    c_slate_bg = "#151B22"
    c_slate_mid = "#212A35"
    c_slate_light = "#313E4E"

    c_white = "#FFFFFF"
    c_cream = "#F4EFE6"
    c_offwhite = "#E5ECF2"

    svg_parts = []
    
    svg_parts.append(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="100%" height="100%">
  <defs>
    <!-- Gold Metallic Gradients -->
    <linearGradient id="goldBevel" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{c_gold_light}" />
      <stop offset="30%" stop-color="{c_gold_mid}" />
      <stop offset="60%" stop-color="{c_gold_deep}" />
      <stop offset="85%" stop-color="{c_gold_mid}" />
      <stop offset="100%" stop-color="{c_gold_dark}" />
    </linearGradient>

    <linearGradient id="goldHoriz" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="{c_gold_deep}" />
      <stop offset="30%" stop-color="{c_gold_light}" />
      <stop offset="70%" stop-color="{c_gold_mid}" />
      <stop offset="100%" stop-color="{c_gold_deep}" />
    </linearGradient>

    <!-- Shield Border Gradient -->
    <linearGradient id="shieldDarkBorder" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2D3845" />
      <stop offset="40%" stop-color="#1A2129" />
      <stop offset="100%" stop-color="#0E1216" />
    </linearGradient>

    <!-- Sunrise Gradient -->
    <radialGradient id="sunGlowCenter" cx="50%" cy="58%" r="55%" fx="50%" fy="58%">
      <stop offset="0%" stop-color="#FFF8E0" stop-opacity="1" />
      <stop offset="25%" stop-color="#FCD370" stop-opacity="0.95" />
      <stop offset="55%" stop-color="#E2922D" stop-opacity="0.9" />
      <stop offset="85%" stop-color="#9C5216" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#4F2207" stop-opacity="1" />
    </radialGradient>

    <!-- Banner Gradient -->
    <linearGradient id="bannerBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1B222A" />
      <stop offset="50%" stop-color="#12171E" />
      <stop offset="100%" stop-color="#0B0E12" />
    </linearGradient>

    <!-- Drop Shadow Filter -->
    <filter id="shadowFilter" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.65" />
    </filter>

    <!-- Subtle Distress Texture Filter -->
    <filter id="distressNoise" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.12 0" />
      <feComposite in2="SourceGraphic" in="gl" operator="in" />
    </filter>

    <!-- Clip Path for the Mountain & Sky Scene -->
    <clipPath id="sceneClip">
      <path d="M 80 145 Q 300 80 520 145 L 520 445 L 80 445 Z" />
    </clipPath>
  </defs>
''')

    # Optional background for standalone image rendering
    if include_bg:
        svg_parts.append(f'  <rect width="{width}" height="{height}" fill="{c_slate_darkest}" />\n')

    # Main Shield Group with Drop Shadow
    svg_parts.append('  <g filter="url(#shadowFilter)">\n')

    # 1. OUTSIDE SHIELD CONTOUR: Tactical silhouette with notched shoulder ears and tapered bottom
    # Coordinates:
    # Top arch: M 110 90 Q 300 20 490 90
    # Right ear: L 545 90 L 545 135 L 530 150 L 530 460
    # Bottom taper: L 485 545 L 300 660 L 115 545 L 70 460
    # Left ear: L 70 150 L 55 135 L 55 90 Z
    svg_parts.append(f'''    <!-- Outer Shield Silhouette -->
    <path d="M 115 92 Q 300 22 485 92 L 540 92 L 540 138 L 528 152 L 528 458 L 482 542 L 300 656 L 118 542 L 72 458 L 72 152 L 60 138 L 60 92 Z"
          fill="url(#shieldDarkBorder)"
          stroke="#2A3542"
          stroke-width="2.5"
          stroke-linejoin="miter" />

    <!-- Distressed Weathered Gold Mid-Border -->
    <path d="M 120 98 Q 300 32 480 98 L 532 98 L 532 134 L 520 148 L 520 454 L 476 536 L 300 648 L 124 536 L 80 454 L 80 148 L 68 134 L 68 98 Z"
          fill="none"
          stroke="url(#goldBevel)"
          stroke-width="5"
          stroke-linejoin="round" />

    <!-- Inner Charcoal Shield Field -->
    <path d="M 124 104 Q 300 40 476 104 L 524 104 L 524 130 L 512 144 L 512 450 L 470 530 L 300 640 L 130 530 L 88 450 L 88 144 L 76 130 L 76 104 Z"
          fill="{c_slate_darkest}" />
  </g>
''')

    # 2. TOP BANNER: "OVERLAND"
    # Arched Header Panel
    svg_parts.append(f'''  <!-- Top "OVERLAND" Header Plaque -->
  <path d="M 76 142 Q 300 78 524 142 L 524 102 Q 300 38 76 102 Z"
        fill="#11161C"
        stroke="url(#goldBevel)"
        stroke-width="2" />
''')

    # Vector Letters for "OVERLAND" arched across the top
    # We position each character with specific center X, Y, and rotation angle along the arch
    # Arch equation: y = 88 - 32 * cos(angle)
    letters_overland = [
        ('O', 145, 122, -18),
        ('V', 188, 109, -13),
        ('E', 231, 100, -8),
        ('R', 275, 95, -3),
        ('L', 320, 95, 2),
        ('A', 364, 99, 7),
        ('N', 408, 108, 12),
        ('D', 451, 121, 17),
    ]

    svg_parts.append('  <!-- "OVERLAND" Arched Typography with 3D Drop Shadow -->\n  <g>\n')
    # First pass: Drop Shadow
    for char, x, y, rot in letters_overland:
        svg_parts.append(
            f'    <text x="{x}" y="{y+3}" transform="rotate({rot} {x} {y+3})" '
            f'text-anchor="middle" dominant-baseline="central" '
            f'fill="#05070A" font-family="system-ui, -apple-system, \'Barlow Condensed\', \'Impact\', \'Arial Black\', sans-serif" '
            f'font-size="44" font-weight="900" letter-spacing="1">{char}</text>\n'
        )
    # Second pass: Front White Text with Dark Bevel Stroke
    for char, x, y, rot in letters_overland:
        svg_parts.append(
            f'    <text x="{x}" y="{y}" transform="rotate({rot} {x} {y})" '
            f'text-anchor="middle" dominant-baseline="central" '
            f'fill="{c_white}" stroke="#131920" stroke-width="1.2" '
            f'font-family="system-ui, -apple-system, \'Barlow Condensed\', \'Impact\', \'Arial Black\', sans-serif" '
            f'font-size="44" font-weight="900" letter-spacing="1">{char}</text>\n'
        )
    svg_parts.append('  </g>\n')

    # 3. CENTRAL SCENE WINDOW (Mountains, Sunrise, Stars, Trail, Runner with Barbell)
    svg_parts.append('''  <!-- Central Illustration Scene Window -->
  <g clip-path="url(#sceneClip)">
    <!-- Sky Background with Golden Sunrise Radial Glow -->
    <rect x="76" y="142" width="448" height="305" fill="url(#sunGlowCenter)" />

    <!-- Radiating Golden Sunburst Rays from center (300, 315) -->
    <g opacity="0.65">
''')
    # Generate 18 dynamic radial sunburst triangles
    center_x, center_y = 300, 320
    ray_angles = [-82, -72, -62, -50, -38, -26, -14, 0, 14, 26, 38, 50, 62, 72, 82, -94, 94]
    for ang in ray_angles:
        rad1 = math.radians(ang - 3.5)
        rad2 = math.radians(ang + 3.5)
        r_far = 380
        x1 = center_x + r_far * math.sin(rad1)
        y1 = center_y - r_far * math.cos(rad1)
        x2 = center_x + r_far * math.sin(rad2)
        y2 = center_y - r_far * math.cos(rad2)
        color = "#FFF5D1" if abs(ang) < 40 else "#F7C356"
        svg_parts.append(f'      <polygon points="{center_x},{center_y} {x1:.1f},{y1:.1f} {x2:.1f},{y2:.1f}" fill="{color}" />\n')

    svg_parts.append('''    </g>

    <!-- Celestial Golden Stars (Sparkling 4-point stars) -->
    <g fill="#FFFCE6">
      <!-- Left star cluster -->
      <polygon points="120,170 122,175 127,176 122,178 120,183 118,178 113,176 118,175" />
      <polygon points="155,160 156.5,164 161,165 156.5,167 155,171 153.5,167 149,165 153.5,164" />
      <polygon points="195,152 196,155 200,156 196,157 195,161 193.5,157 190,156 193.5,155" />
      <!-- Right star cluster -->
      <polygon points="480,170 478,175 473,176 478,178 480,183 482,178 487,176 482,175" />
      <polygon points="445,160 443.5,164 439,165 443.5,167 445,171 446.5,167 451,165 446.5,164" />
      <polygon points="405,152 404,155 400,156 404,157 405,161 406.5,157 410,156 406.5,155" />
    </g>

    <!-- Distant High Peaks (Slate Blue / Dark Charcoal) -->
    <polygon points="76,330 110,285 145,305 195,245 240,280 270,240 300,265 340,225 385,275 425,235 465,290 524,270 524,445 76,445"
             fill="#222B35" />
    <!-- Distant Mountain Ridge Highlights (Crisp sunlight on northwest slopes) -->
    <polygon points="195,245 240,280 220,320 185,300" fill="#323E4C" opacity="0.9" />
    <polygon points="340,225 385,275 365,315 325,290" fill="#3A4858" opacity="0.9" />
    <polygon points="425,235 465,290 445,325 410,295" fill="#323E4C" opacity="0.8" />

    <!-- Midground Rugged Peaks & Dark Ridges -->
    <polygon points="76,370 120,305 170,340 220,290 280,350 280,445 76,445"
             fill="#182028" />
    <polygon points="524,370 475,295 420,335 370,280 320,345 320,445 524,445"
             fill="#151C23" />
    <!-- Midground Peak Facet Highlights -->
    <polygon points="120,305 170,340 145,375 105,350" fill="#293542" />
    <polygon points="475,295 420,335 440,380 490,345" fill="#24303D" />

    <!-- S-Curve Winding Trail Emerging from the Pass -->
    <path d="M 285,310
             Q 295,335 280,360
             Q 260,385 285,410
             Q 310,430 315,445
             L 245,445
             Q 225,420 245,395
             Q 265,370 255,340
             Q 250,320 265,310
             Z"
          fill="#B58648" />
    <!-- Trail Center Dust / Sunlight Line -->
    <path d="M 275,310 Q 285,335 270,360 Q 252,385 275,410 Q 295,430 300,445"
          stroke="#E0BC7D" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.85" />

    <!-- Left Rocky Outcrop with Pine Trees -->
    <polygon points="76,445 76,365 140,410 190,445" fill="#12171E" />
    <!-- Stenciled Pine Trees Left -->
    <polygon points="90,370 98,350 106,370" fill="#0C1217" />
    <polygon points="88,382 98,362 108,382" fill="#0C1217" />
    <polygon points="112,385 120,365 128,385" fill="#0C1217" />
    <polygon points="135,400 143,380 151,400" fill="#0C1217" />

    <!-- Right Rocky Outcrop with Pines & Boulders -->
    <polygon points="524,445 524,355 450,410 380,445" fill="#10151B" />
    <polygon points="500,365 508,345 516,365" fill="#0C1217" />
    <polygon points="475,378 483,358 491,378" fill="#0C1217" />
    <polygon points="450,395 458,375 466,395" fill="#0C1217" />

    <!-- ======================================================== -->
    <!-- HERO ATHLETE: TACTICAL RUNNER CARRYING BARBELL & RUCK -->
    <!-- ======================================================== -->

    <!-- Back Barbell Plate & Sleeve on Left Side -->
    <g>
      <!-- Barbell Bar Shaft Extending Left Behind Body -->
      <rect x="235" y="278" width="80" height="7" rx="2" fill="#92A1B0" stroke="#414D59" stroke-width="1" />
      <!-- Barbell Collar Lock Left -->
      <rect x="242" y="274" width="9" height="15" rx="2" fill="{c_gold_mid}" stroke="#2B1F08" stroke-width="0.8" />
      <!-- Heavy Olympic Bumper Plate Stack Left -->
      <rect x="230" y="250" width="13" height="64" rx="3" fill="#1A2026" stroke="{c_gold_mid}" stroke-width="1.8" />
      <rect x="233" y="255" width="7" height="54" rx="1.5" fill="#323C46" />
      <rect x="221" y="255" width="9" height="54" rx="2" fill="#12161A" stroke="#485563" stroke-width="1" />
      <!-- Plate Center Hub & Knurl -->
      <circle cx="236" cy="281" r="5" fill="{c_gold_light}" />
    </g>

    <!-- Tactical Rucksack on Athlete's Back -->
    <g>
      <!-- Pack Main Shell -->
      <path d="M 270 248
               C 260 242 272 222 290 220
               C 305 218 314 232 312 265
               C 310 290 298 304 284 304
               C 270 304 266 290 268 268
               Z"
            fill="#27323D"
            stroke="{c_gold_mid}"
            stroke-width="1.8" />
      <!-- Top Sleeping Bag / Bedroll Strapped to Pack -->
      <rect x="278" y="210" width="28" height="14" rx="4" fill="#3D4B59" stroke="{c_gold_mid}" stroke-width="1.2" />
      <line x1="284" y1="210" x2="284" y2="224" stroke="{c_gold_mid}" stroke-width="1.5" />
      <line x1="300" y1="210" x2="300" y2="224" stroke="{c_gold_mid}" stroke-width="1.5" />
      <!-- Tactical Molle Webbing Straps -->
      <line x1="272" y1="250" x2="304" y2="248" stroke="{c_gold_mid}" stroke-width="1.5" />
      <line x1="274" y1="264" x2="304" y2="262" stroke="{c_gold_mid}" stroke-width="1.5" />
      <line x1="276" y1="278" x2="300" y2="276" stroke="{c_gold_mid}" stroke-width="1.5" />
    </g>

    <!-- Athletic Muscular Body: Driving uphill with forward lean -->
    <g>
      <!-- Head & Facial Profile (Determined, chin up, facing right) -->
      <path d="M 318 206
               C 318 198 326 190 336 190
               C 345 190 352 198 352 206
               C 352 211 354 214 357 215
               L 355 219
               L 348 219
               L 348 225
               L 340 227
               L 332 221
               L 324 221
               Z"
            fill="#F2CE9A"
            stroke="{c_gold_mid}"
            stroke-width="1.5" />
      <!-- Short Tactical Crew Cut Hair -->
      <path d="M 318 206 C 320 194 332 188 344 190 C 347 198 344 205 338 207 Z" fill="#182028" />

      <!-- Powerful Traps & Muscular Neck -->
      <path d="M 320 221 L 336 226 L 344 242 L 312 242 Z" fill="#DEB075" />

      <!-- Torso & Athletic Compression Tank -->
      <path d="M 310 238
               C 322 235 338 240 346 252
               C 350 262 344 280 338 298
               C 330 304 314 304 304 298
               C 302 282 300 256 310 238
               Z"
            fill="#1A222B"
            stroke="{c_gold_mid}"
            stroke-width="1.2" />

      <!-- Left Arm: Flexed high and pumping forward (Sprint Drive) -->
      <!-- Shoulder Deltoid & Bicep -->
      <path d="M 342 250
               C 352 252 360 260 368 270
               L 360 282
               L 348 272
               Z"
            fill="#DEB075"
            stroke="#A3753A"
            stroke-width="1" />
      <!-- Forearm driving up at 45 degrees -->
      <path d="M 364 270
               C 370 270 380 266 384 260
               C 386 254 380 250 374 250
               L 358 264
               Z"
            fill="#F2CE9A"
            stroke="{c_gold_mid}"
            stroke-width="1.2" />
      <!-- Clenched Left Power Fist -->
      <circle cx="380" cy="256" r="6" fill="#F2CE9A" stroke="{c_gold_mid}" stroke-width="1.2" />

      <!-- Right Hand Gripping the Barbell Shaft -->
      <rect x="300" y="277" width="105" height="7" rx="2" fill="#92A1B0" stroke="#414D59" stroke-width="1" />
      <!-- Hand knuckles closed around bar -->
      <ellipse cx="355" cy="280" rx="6" ry="7" fill="#F2CE9A" stroke="{c_gold_mid}" stroke-width="1.2" />

      <!-- Athletic Running Shorts -->
      <path d="M 302 298
               L 342 298
               L 352 326
               L 330 330
               L 320 316
               L 302 328
               L 292 312
               Z"
            fill="#27323D"
            stroke="#12171E"
            stroke-width="1.5" />

      <!-- Lead Left Leg: Driving forward, knee high & flexed -->
      <!-- Quad (Vastus Lateralis/Medialis) -->
      <path d="M 332 324
               C 342 328 358 340 368 358
               L 354 370
               C 342 355 334 340 324 330
               Z"
            fill="#DEB075"
            stroke="{c_gold_mid}"
            stroke-width="1.2" />
      <!-- Calf & Shin -->
      <path d="M 366 360
               L 374 396
               C 370 406 362 410 356 414
               L 348 408
               L 354 368
               Z"
            fill="#F2CE9A"
            stroke="#A3753A"
            stroke-width="1.2" />
      <!-- Tactical Trail Running Boot Left -->
      <path d="M 356 410
               L 372 412
               L 388 426
               L 376 432
               L 350 422
               Z"
            fill="#182028"
            stroke="{c_gold_mid}"
            stroke-width="1.2" />

      <!-- Rear Right Leg: Powerful push-off extended behind -->
      <!-- Hamstring / Glute drive -->
      <path d="M 296 312
               L 274 346
               L 262 340
               L 288 304
               Z"
            fill="#C49354"
            stroke="#8A5D19"
            stroke-width="1.2" />
      <!-- Rear Calf pushing off the trail -->
      <path d="M 264 342
               L 242 384
               L 230 378
               L 254 338
               Z"
            fill="#D9A668"
            stroke="#8A5D19"
            stroke-width="1.2" />
      <!-- Rear Trail Boot on ground -->
      <path d="M 232 378
               L 242 386
               L 232 400
               L 214 398
               L 220 386
               Z"
            fill="#182028"
            stroke="{c_gold_mid}"
            stroke-width="1.2" />
    </g>

    <!-- Golden Rim Light Contour on Athlete's Silhouette -->
    <path d="M 318 190
             C 330 188 344 195 348 208
             C 354 220 356 240 366 256
             C 374 268 384 274 374 288
             L 366 358
             L 376 398
             L 388 426"
          fill="none"
          stroke="#FFF0B8"
          stroke-width="2.5"
          stroke-linecap="round"
          opacity="0.9" />

    <!-- Front Barbell Plate & Sleeve on Right Side -->
    <g>
      <!-- Barbell Collar Lock Right -->
      <rect x="396" y="274" width="9" height="15" rx="2" fill="{c_gold_mid}" stroke="#2B1F08" stroke-width="0.8" />
      <!-- Heavy Olympic Bumper Plate Stack Right -->
      <rect x="405" y="250" width="13" height="64" rx="3" fill="#1A2026" stroke="{c_gold_mid}" stroke-width="1.8" />
      <rect x="408" y="255" width="7" height="54" rx="1.5" fill="#323C46" />
      <rect x="419" y="255" width="9" height="54" rx="2" fill="#12161A" stroke="#485563" stroke-width="1" />
      <!-- Plate Center Hub -->
      <circle cx="411" cy="281" r="5" fill="{c_gold_light}" />
    </g>

  </g> <!-- End scene clip -->
''')

    # 4. GOLD INNER FRAME SURROUNDING SCENE
    svg_parts.append(f'''  <!-- Gold Inner Frame Border Surrounding Scene Window -->
  <path d="M 76 142 Q 300 78 524 142 L 524 445 L 76 445 Z"
        fill="none"
        stroke="url(#goldBevel)"
        stroke-width="4" />
''')

    # 5. LOWER MAIN BANNER: "ATHLETICS"
    svg_parts.append(f'''  <!-- ========================================== -->
  <!-- LOWER BANNER: "ATHLETICS"                  -->
  <!-- ========================================== -->
  <!-- Outer Beveled Plaque with Gold Trim -->
  <g filter="url(#shadowFilter)">
    <path d="M 64 443
             L 536 443
             L 526 515
             L 74 515
             Z"
          fill="url(#bannerBg)"
          stroke="url(#goldBevel)"
          stroke-width="3.5" />

    <!-- Upper & Lower Inner Accent Hairlines -->
    <line x1="76" y1="448" x2="524" y2="448" stroke="#415060" stroke-width="1.2" />
    <line x1="84" y1="510" x2="516" y2="510" stroke="#000000" stroke-width="1.5" />

    <!-- "ATHLETICS" Heavy Collegiate Varsity Typography -->
    <!-- 3D Shadow -->
    <text x="300" y="496"
          text-anchor="middle" dominant-baseline="central"
          fill="#05080A"
          font-family="system-ui, -apple-system, \'Barlow Condensed\', \'Impact\', \'Arial Black\', sans-serif"
          font-size="62" font-weight="900" letter-spacing="8">
      ATHLETICS
    </text>
    <!-- Crisp White Face with Gold-Bronze Edge -->
    <text x="300" y="492"
          text-anchor="middle" dominant-baseline="central"
          fill="{c_white}"
          stroke="#10151C" stroke-width="1.2"
          font-family="system-ui, -apple-system, \'Barlow Condensed\', \'Impact\', \'Arial Black\', sans-serif"
          font-size="62" font-weight="900" letter-spacing="8">
      ATHLETICS
    </text>
  </g>
''')

    # 6. SUB-BANNER: "— RUN | LIFT | RUCK —"
    svg_parts.append(f'''  <!-- ========================================== -->
  <!-- SUB-BANNER: "— RUN | LIFT | RUCK —"        -->
  <!-- ========================================== -->
  <g>
    <!-- Dark Ribbon Plaque -->
    <path d="M 80 519
             L 520 519
             L 486 560
             L 114 560
             Z"
          fill="#0F1318"
          stroke="#26313D"
          stroke-width="1.5" />

    <!-- Gold Accent Dash Rules on Left & Right -->
    <line x1="102" y1="539" x2="162" y2="539" stroke="url(#goldBevel)" stroke-width="3" stroke-linecap="round" />
    <line x1="438" y1="539" x2="498" y2="539" stroke="url(#goldBevel)" stroke-width="3" stroke-linecap="round" />

    <!-- "RUN | LIFT | RUCK" in Radiant Gold -->
    <text x="300" y="541"
          text-anchor="middle" dominant-baseline="central"
          fill="{c_gold_light}"
          font-family="system-ui, -apple-system, \'Barlow Condensed\', \'Impact\', \'Arial Black\', sans-serif"
          font-size="25" font-weight="900" letter-spacing="5">
      RUN  |  LIFT  |  RUCK
    </text>
  </g>
''')

    # 7. BOTTOM ROCKER: "ELITE PERFORMANCE | GO THE DISTANCE"
    svg_parts.append(f'''  <!-- ========================================== -->
  <!-- BOTTOM ROCKER: "ELITE PERFORMANCE..."      -->
  <!-- ========================================== -->
  <g>
    <!-- Rocker Lower Panel Backing -->
    <path d="M 122 564
             L 478 564
             L 440 618
             L 300 642
             L 160 618
             Z"
          fill="#0A0E12"
          stroke="url(#goldBevel)"
          stroke-width="1.8" />

    <!-- White Rocker Text with Vertical Divider -->
    <text x="300" y="596"
          text-anchor="middle" dominant-baseline="central"
          fill="{c_offwhite}"
          font-family="system-ui, -apple-system, \'Barlow Condensed\', \'Outfit\', \'Arial\', sans-serif"
          font-size="16" font-weight="800" letter-spacing="3.5">
      ELITE PERFORMANCE  |  GO THE DISTANCE
    </text>
  </g>

  <!-- Pointed Shield Apex Gold Notch at Bottom -->
  <polygon points="300,652 318,632 282,632" fill="url(#goldBevel)" stroke="#3A280D" stroke-width="1" />
  <line x1="300" y1="632" x2="300" y2="652" stroke="#FFF0B8" stroke-width="1.2" />

</svg>''')

    return "".join(svg_parts)

if __name__ == '__main__':
    svg_content = generate_overland_svg(include_bg=False)
    with open('public/overland-logo.svg', 'w') as f:
        f.write(svg_content)
    with open('public/favicon.svg', 'w') as f:
        f.write(svg_content)
    print("Successfully generated public/overland-logo.svg and public/favicon.svg!")
