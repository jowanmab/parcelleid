/* global React */
// ScanImmo Landing — character illustrations (sage + peach, geometric flat)
// Theme: loupe (magnifying glass), jumelles (binoculars), parcelles, clé

const ILLU = {
  // sage tones
  sageDark:  '#5C8A6F',
  sage:      '#8AB89A',
  sageLt:    '#B6D4BF',
  sageBg:    '#D6E7DC',
  cream:     '#FAF7EF',
  creamWarm: '#EFE4D1',
  // peach accent
  peachDark: '#C77858',
  peach:     '#E89878',
  peachLt:   '#F4C5AF',
  peachBg:   '#F9DCC9',
  // ink + skin
  ink:       '#2E3530',
  inkSoft:   '#4A5550',
  skin:      '#E8C9A8',
  skinDark:  '#C9A57F',
  shirt:     '#6F9F84',
  hair:      '#3E4A44',
  white:     '#FFFFFF',
};

// ─────────────────────────────────────────────────────────────
// REFINED ILLUSTRATIONS — Storyset "pana" / "cuate" style
// SVG sources recolored to sage palette. Animated variants (GIF) available
// via the `animated` prop — same scene, ambient looping motion.
// ─────────────────────────────────────────────────────────────

const ILLU_BASE = './assets/illustrations/';

function HeroIllustration({ animated = false } = {}) {
  const src = ILLU_BASE + (animated ? 'anim-location-search.gif' : 'illu-location-search.svg');
  return <img src={src} alt="" className="illu-img illu-hero-img" draggable="false"/>;
}

function Step1Illustration({ animated = false } = {}) {
  const src = ILLU_BASE + (animated ? 'anim-address.gif' : 'illu-address.svg');
  return <img src={src} alt="" className="illu-img" draggable="false"/>;
}

function Step2Illustration({ animated = false } = {}) {
  const src = ILLU_BASE + (animated ? 'anim-location-search.gif' : 'illu-location-search.svg');
  return <img src={src} alt="" className="illu-img" draggable="false"/>;
}

function Step3Illustration({ animated = false } = {}) {
  const src = ILLU_BASE + (animated ? 'anim-directions.gif' : 'illu-directions.svg');
  return <img src={src} alt="" className="illu-img" draggable="false"/>;
}

// ─────────────────────────────────────────────────────────────
// LEGACY HAND-DRAWN HERO — kept as fallback (named HeroIllustrationLegacy)
// in case we ever want to switch back. Not exported.
// ─────────────────────────────────────────────────────────────
function HeroIllustrationLegacy() {
  return (
    <svg viewBox="0 0 500 520" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="illu-hero">
      <defs>
        <linearGradient id="illu-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0D6B7"/>
          <stop offset="100%" stopColor={ILLU.skin}/>
        </linearGradient>
        <linearGradient id="illu-shirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7CB592"/>
          <stop offset="100%" stopColor={ILLU.shirt}/>
        </linearGradient>
        <radialGradient id="illu-loupe-glass" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7"/>
          <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.20"/>
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0"/>
        </radialGradient>
      </defs>
      {/* soft background blob */}
      <ellipse cx="250" cy="380" rx="230" ry="40" fill={ILLU.sageLt} opacity="0.5"/>

      {/* === PARCEL MAP CARD (background scene) === */}
      <g transform="translate(60, 70)">
        {/* card shadow */}
        <rect x="6" y="10" width="380" height="320" rx="20" fill={ILLU.ink} opacity="0.10"/>
        {/* card */}
        <rect x="0" y="0" width="380" height="320" rx="20" fill={ILLU.creamWarm}/>
        {/* card header strip */}
        <rect x="0" y="0" width="380" height="40" rx="20" fill={ILLU.sage}/>
        <rect x="0" y="20" width="380" height="20" fill={ILLU.sage}/>
        <circle cx="22" cy="20" r="5" fill={ILLU.peachLt}/>
        <circle cx="40" cy="20" r="5" fill={ILLU.cream} opacity="0.5"/>
        <circle cx="58" cy="20" r="5" fill={ILLU.cream} opacity="0.5"/>
        <rect x="160" y="14" width="100" height="12" rx="6" fill={ILLU.cream} opacity="0.7"/>

        {/* parcel grid background */}
        <g transform="translate(20, 60)" stroke={ILLU.sageDark} strokeWidth="1.2" fill={ILLU.sageLt} opacity="0.85">
          <polygon points="0,0 80,8 70,90 -5,82" fill={ILLU.sageBg}/>
          <polygon points="80,8 160,4 155,80 70,90"/>
          <polygon points="160,4 240,12 235,100 155,80"/>
          <polygon points="240,12 340,8 332,110 235,100" fill={ILLU.sageBg}/>
          <polygon points="-5,82 70,90 65,180 -12,170" fill={ILLU.sageBg}/>
          <polygon points="70,90 155,80 150,170 65,180"/>
          <polygon points="155,80 235,100 230,180 150,170"/>
          <polygon points="235,100 332,110 325,200 230,180"/>
          {/* roads */}
          <line x1="0" y1="86" x2="338" y2="100" stroke={ILLU.cream} strokeWidth="3" opacity="1"/>
          <line x1="68" y1="0" x2="60" y2="200" stroke={ILLU.cream} strokeWidth="3" opacity="1"/>
        </g>

        {/* highlighted parcel (peach) */}
        <polygon points="175,160 235,168 230,228 168,220" fill={ILLU.peach} opacity="0.30" stroke={ILLU.peachDark} strokeWidth="2.5"/>
        {/* parcel pin */}
        <g transform="translate(196, 178)">
          <path d="M0,0 C-12,0 -18,-8 -18,-18 C-18,-30 -8,-40 0,-40 C8,-40 18,-30 18,-18 C18,-8 12,0 0,0 Z" fill={ILLU.peachDark}/>
          <circle cx="0" cy="-20" r="6" fill={ILLU.cream}/>
        </g>

        {/* ref label on card */}
        <g transform="translate(190, 270)">
          <rect x="-50" y="-12" width="100" height="22" rx="11" fill={ILLU.ink}/>
          <text x="0" y="3" textAnchor="middle" fill={ILLU.cream} fontFamily="Plus Jakarta Sans, sans-serif" fontSize="11" fontWeight="700" letterSpacing="0.04em">000 AB 0124</text>
        </g>
      </g>

      {/* === MAGNIFYING GLASS (loupe) over the map === */}
      <g transform="translate(280, 240) rotate(-12)" className="illu-loupe">
        {/* handle */}
        <rect x="90" y="-12" width="110" height="24" rx="12" fill={ILLU.peachDark}/>
        <rect x="90" y="-12" width="110" height="9" rx="4.5" fill={ILLU.peach}/>
        <rect x="185" y="-9" width="14" height="18" rx="4" fill="#a86048"/>
        {/* glass ring */}
        <circle cx="0" cy="0" r="86" fill={ILLU.cream} opacity="0.92"/>
        <circle cx="0" cy="0" r="86" fill="none" stroke={ILLU.ink} strokeWidth="9"/>
        <circle cx="0" cy="0" r="74" fill="none" stroke={ILLU.peach} strokeWidth="3" opacity="0.6"/>
        {/* zoomed parcel inside */}
        <g transform="rotate(12)">
          <polygon points="-50,-44 50,-32 56,52 -56,42" fill={ILLU.peachLt} stroke={ILLU.peachDark} strokeWidth="3.5"/>
          <line x1="-50" y1="-44" x2="-56" y2="42" stroke={ILLU.peachDark} strokeWidth="2" strokeDasharray="4 4"/>
          <line x1="50" y1="-32" x2="56" y2="52" stroke={ILLU.peachDark} strokeWidth="2" strokeDasharray="4 4"/>
          <text x="0" y="8" textAnchor="middle" fill={ILLU.ink} fontFamily="Plus Jakarta Sans, sans-serif" fontSize="18" fontWeight="800" letterSpacing="-0.02em">438 m²</text>
          <text x="0" y="28" textAnchor="middle" fill={ILLU.peachDark} fontFamily="Plus Jakarta Sans, sans-serif" fontSize="10" fontWeight="700" letterSpacing="0.06em">PARCELLE</text>
        </g>
        {/* glass highlight */}
        <ellipse cx="-30" cy="-38" rx="24" ry="14" fill="url(#illu-loupe-glass)"/>
      </g>

      {/* === CHARACTER (top right, peeking) === */}
      <g transform="translate(370, 96)" className="illu-character">
        {/* hair back */}
        <path d="M-34,-10 Q-42,-46 0,-52 Q42,-46 34,-10 Q26,-22 12,-26 Q0,-28 -12,-26 Q-26,-22 -34,-10 Z" fill={ILLU.hair}/>
        {/* face */}
        <ellipse cx="0" cy="-18" rx="28" ry="30" fill="url(#illu-skin)"/>
        {/* neck shadow */}
        <ellipse cx="0" cy="12" rx="12" ry="4" fill={ILLU.skinDark} opacity="0.4"/>
        {/* hair front strands */}
        <path d="M-28,-22 Q-32,-50 0,-50 Q30,-50 30,-28 Q24,-34 8,-32 Q-2,-30 -14,-32 Q-22,-32 -28,-22 Z" fill={ILLU.hair}/>
        <path d="M-30,-22 Q-32,-2 -22,8" stroke={ILLU.hair} strokeWidth="6" fill="none" strokeLinecap="round"/>
        {/* eyebrows */}
        <path d="M-14,-26 Q-9,-28 -4,-26" stroke={ILLU.hair} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M4,-26 Q9,-28 14,-26" stroke={ILLU.hair} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        {/* eyes (blink animated via CSS scaleY) */}
        <g className="illu-eyes">
          <ellipse cx="-9" cy="-18" rx="2.5" ry="3" fill={ILLU.ink}/>
          <ellipse cx="9" cy="-18" rx="2.5" ry="3" fill={ILLU.ink}/>
        </g>
        {/* cheek blush */}
        <ellipse cx="-15" cy="-8" rx="5" ry="3" fill={ILLU.peach} opacity="0.35"/>
        <ellipse cx="15" cy="-8" rx="5" ry="3" fill={ILLU.peach} opacity="0.35"/>
        {/* smile */}
        <path d="M-7,-5 Q0,1 7,-5" stroke={ILLU.ink} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        {/* shoulder + torso */}
        <path d="M-34,40 Q-38,14 -20,8 Q0,4 20,8 Q38,14 34,40 L34,58 L-34,58 Z" fill="url(#illu-shirt)"/>
        {/* collar */}
        <path d="M-12,12 Q0,18 12,12 L8,22 L-8,22 Z" fill={ILLU.skin}/>
        {/* arm reaching down (holds loupe) */}
        <g transform="rotate(-22, -34, 30)">
          <rect x="-46" y="4" width="22" height="54" rx="11" fill="url(#illu-shirt)"/>
          <circle cx="-35" cy="62" r="11" fill="url(#illu-skin)"/>
          {/* thumb */}
          <ellipse cx="-28" cy="58" rx="3" ry="5" fill={ILLU.skin} transform="rotate(20 -28 58)"/>
        </g>
      </g>

      {/* === Floating sparkle dots (matches found) === */}
      <g className="illu-sparkles">
        <circle cx="80"  cy="120" r="4" fill={ILLU.peach} className="sparkle-1"/>
        <circle cx="430" cy="430" r="5" fill={ILLU.sage} className="sparkle-2"/>
        <circle cx="60"  cy="400" r="3" fill={ILLU.peachDark} className="sparkle-3"/>
        <g transform="translate(440, 80)" className="sparkle-cross sparkle-1">
          <line x1="0" y1="-8" x2="0" y2="8" stroke={ILLU.sageDark} strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="-8" y1="0" x2="8" y2="0" stroke={ILLU.sageDark} strokeWidth="2.5" strokeLinecap="round"/>
        </g>
        <g transform="translate(40, 250)" className="sparkle-cross sparkle-2">
          <line x1="0" y1="-6" x2="0" y2="6" stroke={ILLU.peachDark} strokeWidth="2" strokeLinecap="round"/>
          <line x1="-6" y1="0" x2="6" y2="0" stroke={ILLU.peachDark} strokeWidth="2" strokeLinecap="round"/>
        </g>
        <g transform="translate(460, 280)" className="sparkle-cross sparkle-3">
          <line x1="0" y1="-5" x2="0" y2="5" stroke={ILLU.sage} strokeWidth="2" strokeLinecap="round"/>
          <line x1="-5" y1="0" x2="5" y2="0" stroke={ILLU.sage} strokeWidth="2" strokeLinecap="round"/>
        </g>
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// LEGACY STEP ILLUSTRATIONS (kept as fallback, not exported)
// ─────────────────────────────────────────────────────────────
function Step1IllustrationLegacy() {
  return (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="200" cy="270" rx="160" ry="14" fill={ILLU.ink} opacity="0.08"/>

      {/* clipboard */}
      <g transform="translate(110, 60)">
        <rect x="4" y="6" width="180" height="220" rx="12" fill={ILLU.ink} opacity="0.10"/>
        <rect x="0" y="0" width="180" height="220" rx="12" fill={ILLU.cream}/>
        {/* clip */}
        <rect x="65" y="-8" width="50" height="18" rx="4" fill={ILLU.peachDark}/>
        <rect x="72" y="-12" width="36" height="12" rx="3" fill={ILLU.peachDark}/>
        {/* form rows */}
        <rect x="16" y="24" width="60" height="8" rx="4" fill={ILLU.sage} opacity="0.5"/>
        <rect x="16" y="40" width="148" height="22" rx="6" fill={ILLU.sageBg} stroke={ILLU.sageLt} strokeWidth="1.5"/>
        <text x="24" y="55" fill={ILLU.sageDark} fontFamily="Plus Jakarta Sans, sans-serif" fontSize="11" fontWeight="700">Bordeaux</text>

        <rect x="16" y="74" width="50" height="8" rx="4" fill={ILLU.sage} opacity="0.5"/>
        <rect x="16" y="90" width="100" height="22" rx="6" fill={ILLU.sageBg} stroke={ILLU.sageLt} strokeWidth="1.5"/>
        <text x="24" y="105" fill={ILLU.ink} fontFamily="Plus Jakarta Sans, sans-serif" fontSize="11" fontWeight="700">450 m²</text>
        <rect x="124" y="90" width="40" height="22" rx="6" fill={ILLU.peachLt} stroke={ILLU.peach} strokeWidth="1.5"/>
        <text x="144" y="105" fill={ILLU.peachDark} fontFamily="Plus Jakarta Sans, sans-serif" fontSize="10" fontWeight="800" textAnchor="middle">±2%</text>

        <rect x="16" y="124" width="40" height="8" rx="4" fill={ILLU.sage} opacity="0.5"/>
        {/* DPE letter row */}
        <g transform="translate(16, 138)">
          {['A','B','C','D','E','F','G'].map((l, i) => {
            const c = [ILLU.sage, '#6FA86F', '#D7B82E', '#D88A2E', '#C66A4A', '#A04030', '#7E2828'][i];
            const active = i === 2;
            return (
              <g key={l}>
                <rect x={i * 22} y={0} width="20" height="22" rx="4" fill={c} stroke={active ? ILLU.ink : 'transparent'} strokeWidth="2"/>
                <text x={i * 22 + 10} y={15} textAnchor="middle" fill={i >= 2 && i <= 3 ? '#2c2c2c' : ILLU.white} fontFamily="Plus Jakarta Sans, sans-serif" fontSize="11" fontWeight="800">{l}</text>
              </g>
            );
          })}
        </g>

        {/* submit button */}
        <rect x="16" y="176" width="148" height="30" rx="8" fill={ILLU.ink}/>
        <circle cx="146" cy="191" r="9" fill={ILLU.peach}/>
        <text x="80" y="195" textAnchor="middle" fill={ILLU.cream} fontFamily="Plus Jakarta Sans, sans-serif" fontSize="11" fontWeight="700">Rechercher</text>
      </g>

      {/* Pencil */}
      <g transform="translate(290, 130) rotate(40)">
        <rect x="0" y="-6" width="80" height="12" rx="3" fill={ILLU.peach}/>
        <polygon points="80,-6 96,0 80,6" fill={ILLU.peachDark}/>
        <rect x="0" y="-6" width="14" height="12" fill={ILLU.ink} opacity="0.4"/>
        <rect x="-6" y="-4" width="6" height="8" rx="2" fill={ILLU.sageDark}/>
      </g>

      {/* small character peek (left) */}
      <g transform="translate(70, 170)">
        <circle cx="0" cy="0" r="22" fill={ILLU.skin}/>
        <path d="M-22,-2 Q-24,-30 0,-30 Q24,-30 22,-2 Q16,-12 0,-12 Q-16,-12 -22,-2 Z" fill={ILLU.hair}/>
        <circle cx="-7" cy="0" r="2" fill={ILLU.ink}/>
        <circle cx="7" cy="0" r="2" fill={ILLU.ink}/>
        <path d="M-5,10 Q0,14 5,10" stroke={ILLU.ink} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <path d="M-26,40 Q-30,18 -14,16 Q0,14 14,16 Q30,18 26,40 Z" fill={ILLU.shirt}/>
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// STEP 2 — On scanne les parcelles (binoculars / jumelles)
// ─────────────────────────────────────────────────────────────
function Step2IllustrationLegacy() {
  return (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="200" cy="270" rx="160" ry="14" fill={ILLU.ink} opacity="0.08"/>

      {/* parcel map in background */}
      <g transform="translate(220, 60)" opacity="0.85">
        <rect x="0" y="0" width="160" height="170" rx="12" fill={ILLU.sageBg} stroke={ILLU.sage} strokeWidth="1.5"/>
        <g stroke={ILLU.sageDark} strokeWidth="1.2" fill="none" opacity="0.6">
          <polygon points="14,16 70,12 65,76 10,80" fill={ILLU.cream} opacity="0.5"/>
          <polygon points="70,12 144,18 138,82 65,76" fill={ILLU.cream} opacity="0.3"/>
          <polygon points="10,80 65,76 60,150 8,148" fill={ILLU.cream} opacity="0.3"/>
          <polygon points="65,76 138,82 132,154 60,150" fill={ILLU.cream} opacity="0.5"/>
        </g>
        {/* highlighted parcel — pulsing */}
        <polygon points="65,76 138,82 132,154 60,150" fill={ILLU.peach} opacity="0.4" stroke={ILLU.peachDark} strokeWidth="2.5"/>
        <circle cx="97" cy="113" r="6" fill={ILLU.peachDark}/>
        <circle cx="97" cy="113" r="12" fill="none" stroke={ILLU.peachDark} strokeWidth="2" opacity="0.5"/>
      </g>

      {/* Character with binoculars */}
      <g transform="translate(120, 175)">
        {/* body */}
        <path d="M-44,80 Q-48,20 -20,16 Q0,14 20,16 Q48,20 44,80 Z" fill={ILLU.shirt}/>
        {/* neck */}
        <rect x="-10" y="-8" width="20" height="22" fill={ILLU.skin}/>
        {/* head */}
        <circle cx="0" cy="-24" r="32" fill={ILLU.skin}/>
        {/* hair */}
        <path d="M-32,-30 Q-36,-58 0,-58 Q36,-58 32,-30 Q24,-40 0,-40 Q-24,-40 -32,-30 Z" fill={ILLU.hair}/>
        {/* smile */}
        <path d="M-7,-6 Q0,-2 7,-6" stroke={ILLU.ink} strokeWidth="2" fill="none" strokeLinecap="round"/>

        {/* arms holding binoculars (up) */}
        <rect x="-46" y="-2" width="18" height="44" rx="9" fill={ILLU.shirt} transform="rotate(28, -37, 20)"/>
        <rect x="28" y="-2" width="18" height="44" rx="9" fill={ILLU.shirt} transform="rotate(-28, 37, 20)"/>

        {/* binoculars */}
        <g transform="translate(0, -22)">
          {/* hands */}
          <circle cx="-30" cy="0" r="10" fill={ILLU.skin}/>
          <circle cx="30" cy="0" r="10" fill={ILLU.skin}/>
          {/* tubes */}
          <rect x="-32" y="-14" width="22" height="32" rx="6" fill={ILLU.ink}/>
          <rect x="10" y="-14" width="22" height="32" rx="6" fill={ILLU.ink}/>
          {/* bridge */}
          <rect x="-12" y="-8" width="24" height="10" fill={ILLU.peachDark}/>
          {/* eye-piece lenses */}
          <circle cx="-21" cy="-4" r="6" fill={ILLU.sage}/>
          <circle cx="21" cy="-4" r="6" fill={ILLU.sage}/>
          <circle cx="-21" cy="-4" r="3" fill={ILLU.cream} opacity="0.7"/>
          <circle cx="21" cy="-4" r="3" fill={ILLU.cream} opacity="0.7"/>
        </g>
      </g>

      {/* dashed sight lines from binoculars to highlighted parcel */}
      <line x1="100" y1="146" x2="290" y2="160" stroke={ILLU.peachDark} strokeWidth="1.5" strokeDasharray="4 5" opacity="0.6"/>
      <line x1="142" y1="146" x2="320" y2="160" stroke={ILLU.peachDark} strokeWidth="1.5" strokeDasharray="4 5" opacity="0.6"/>

      {/* sparkles */}
      <g transform="translate(60, 70)">
        <line x1="0" y1="-8" x2="0" y2="8" stroke={ILLU.peach} strokeWidth="2" strokeLinecap="round"/>
        <line x1="-8" y1="0" x2="8" y2="0" stroke={ILLU.peach} strokeWidth="2" strokeLinecap="round"/>
      </g>
      <circle cx="350" cy="50" r="4" fill={ILLU.peach}/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// STEP 3 — Vous identifiez la vraie parcelle (key + parcel found)
// ─────────────────────────────────────────────────────────────
function Step3IllustrationLegacy() {
  return (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="200" cy="270" rx="160" ry="14" fill={ILLU.ink} opacity="0.08"/>

      {/* result card */}
      <g transform="translate(70, 60)">
        <rect x="6" y="8" width="200" height="200" rx="16" fill={ILLU.ink} opacity="0.10"/>
        <rect x="0" y="0" width="200" height="200" rx="16" fill={ILLU.cream}/>
        {/* satellite thumb */}
        <rect x="14" y="14" width="172" height="110" rx="10" fill={ILLU.sageDark}/>
        <g transform="translate(14, 14)" opacity="0.7">
          <circle cx="40" cy="30" r="28" fill={ILLU.sage} opacity="0.6"/>
          <circle cx="120" cy="80" r="34" fill={ILLU.sage} opacity="0.6"/>
        </g>
        {/* parcel outline (peach, found) */}
        <polygon points="48,42 152,52 144,108 42,98" fill={ILLU.peach} opacity="0.42" stroke={ILLU.peach} strokeWidth="3" transform="translate(14, 14)"/>
        {/* address banner */}
        <rect x="14" y="14" width="172" height="22" rx="10" fill={ILLU.ink} opacity="0.55"/>
        <text x="22" y="30" fill={ILLU.cream} fontFamily="Plus Jakarta Sans, sans-serif" fontSize="11" fontWeight="700">14 rue Lafayette</text>
        {/* body */}
        <text x="20" y="148" fill={ILLU.ink} fontFamily="Plus Jakarta Sans, sans-serif" fontSize="22" fontWeight="800" letterSpacing="-0.02em">438 m²</text>
        <text x="20" y="170" fill={ILLU.inkSoft} fontFamily="Plus Jakarta Sans, sans-serif" fontSize="11" fontWeight="500">Réf. 000 AB 0124</text>
        {/* match tag */}
        <rect x="135" y="135" width="48" height="20" rx="4" fill={ILLU.sage} opacity="0.2"/>
        <text x="159" y="149" textAnchor="middle" fill={ILLU.sageDark} fontFamily="Plus Jakarta Sans, sans-serif" fontSize="10" fontWeight="800">-2.7%</text>
        {/* check badge */}
        <circle cx="186" cy="14" r="16" fill={ILLU.sage} stroke={ILLU.cream} strokeWidth="3"/>
        <path d="M180,14 L185,19 L194,9" stroke={ILLU.cream} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </g>

      {/* Key floating right */}
      <g transform="translate(300, 130) rotate(20)">
        <circle cx="0" cy="0" r="22" fill="none" stroke={ILLU.peachDark} strokeWidth="8"/>
        <circle cx="0" cy="0" r="22" fill="none" stroke={ILLU.peach} strokeWidth="3"/>
        <circle cx="0" cy="0" r="8" fill={ILLU.cream}/>
        <rect x="20" y="-4" width="50" height="8" fill={ILLU.peachDark}/>
        <rect x="56" y="4" width="6" height="10" fill={ILLU.peachDark}/>
        <rect x="44" y="4" width="6" height="10" fill={ILLU.peachDark}/>
      </g>

      {/* tiny character at top right celebrating */}
      <g transform="translate(330, 70)">
        <circle cx="0" cy="0" r="18" fill={ILLU.skin}/>
        <path d="M-18,-2 Q-20,-26 0,-26 Q20,-26 18,-2 Q14,-12 0,-12 Q-14,-12 -18,-2 Z" fill={ILLU.hair}/>
        <circle cx="-6" cy="0" r="1.8" fill={ILLU.ink}/>
        <circle cx="6" cy="0" r="1.8" fill={ILLU.ink}/>
        <path d="M-5,8 Q0,12 5,8" stroke={ILLU.ink} strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      </g>

      {/* confetti dots */}
      <circle cx="280" cy="60" r="3" fill={ILLU.peach}/>
      <circle cx="370" cy="120" r="3" fill={ILLU.sage}/>
      <circle cx="270" cy="220" r="3" fill={ILLU.peachDark}/>
      <g transform="translate(310, 240)">
        <line x1="0" y1="-6" x2="0" y2="6" stroke={ILLU.sageDark} strokeWidth="2" strokeLinecap="round"/>
        <line x1="-6" y1="0" x2="6" y2="0" stroke={ILLU.sageDark} strokeWidth="2" strokeLinecap="round"/>
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// CARTOGRAPHIC VARIANTS — same scenes, no characters, parcel-only
// ─────────────────────────────────────────────────────────────
function HeroCartography() {
  return (
    <svg viewBox="0 0 500 520" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* compass rose */}
      <g transform="translate(60, 80)" opacity="0.5">
        <circle cx="0" cy="0" r="22" fill="none" stroke={ILLU.sageDark} strokeWidth="1.2"/>
        <polygon points="0,-22 4,0 0,22 -4,0" fill={ILLU.sageDark}/>
        <text x="0" y="-30" textAnchor="middle" fontSize="11" fontWeight="800" fill={ILLU.sageDark} fontFamily="Plus Jakarta Sans, sans-serif">N</text>
      </g>

      {/* parcel grid (the star) */}
      <g transform="translate(70, 110)" stroke={ILLU.sageDark} strokeWidth="1.5" fill={ILLU.sageBg}>
        <polygon points="0,0 110,8 102,118 -6,108" fill={ILLU.sageLt}/>
        <polygon points="110,8 230,4 224,114 102,118"/>
        <polygon points="230,4 360,12 352,128 224,114" fill={ILLU.sageLt}/>
        <polygon points="-6,108 102,118 92,238 -18,228"/>
        <polygon points="102,118 224,114 218,240 92,238" fill={ILLU.peach} stroke={ILLU.peachDark} strokeWidth="3.5" opacity="0.45"/>
        <polygon points="224,114 352,128 342,250 218,240"/>
        <polygon points="-18,228 92,238 80,358 -34,348" fill={ILLU.sageLt}/>
        <polygon points="92,238 218,240 210,360 80,358"/>
        <polygon points="218,240 342,250 332,362 210,360" fill={ILLU.sageLt}/>
        {/* roads */}
        <line x1="-2" y1="113" x2="358" y2="123" stroke={ILLU.cream} strokeWidth="4"/>
        <line x1="-26" y1="233" x2="346" y2="247" stroke={ILLU.cream} strokeWidth="4"/>
        <line x1="100" y1="-2" x2="84" y2="362" stroke={ILLU.cream} strokeWidth="4"/>
        <line x1="226" y1="-2" x2="214" y2="362" stroke={ILLU.cream} strokeWidth="4"/>
      </g>

      {/* highlight pin */}
      <g transform="translate(230, 326)">
        <ellipse cx="0" cy="10" rx="14" ry="4" fill={ILLU.ink} opacity="0.25"/>
        <path d="M0,0 C-14,0 -22,-10 -22,-22 C-22,-36 -10,-48 0,-48 C10,-48 22,-36 22,-22 C22,-10 14,0 0,0 Z" fill={ILLU.peachDark}/>
        <circle cx="0" cy="-24" r="8" fill={ILLU.cream}/>
      </g>

      {/* measurement tape */}
      <g transform="translate(160, 380)">
        <line x1="0" y1="0" x2="180" y2="0" stroke={ILLU.ink} strokeWidth="2" strokeDasharray="6 4"/>
        <line x1="0" y1="-6" x2="0" y2="6" stroke={ILLU.ink} strokeWidth="2"/>
        <line x1="180" y1="-6" x2="180" y2="6" stroke={ILLU.ink} strokeWidth="2"/>
        <rect x="60" y="-12" width="60" height="22" rx="11" fill={ILLU.ink}/>
        <text x="90" y="3" textAnchor="middle" fill={ILLU.cream} fontSize="11" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">438 m²</text>
      </g>

      {/* ref */}
      <g transform="translate(380, 60)">
        <rect x="-90" y="-14" width="100" height="28" rx="14" fill={ILLU.cream} stroke={ILLU.peachDark} strokeWidth="1.5"/>
        <text x="-40" y="4" textAnchor="middle" fill={ILLU.peachDark} fontSize="11" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="0.04em">000 AB 0124</text>
      </g>

      {/* contour rings around highlighted parcel */}
      <g fill="none" stroke={ILLU.peach} strokeWidth="2" opacity="0.45">
        <polygon points="172,250 296,246 290,372 162,370"/>
        <polygon points="180,260 286,256 282,360 172,358" strokeOpacity="0.3"/>
      </g>
    </svg>
  );
}

function Step1Cartography() {
  return (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="200" cy="265" rx="160" ry="12" fill={ILLU.ink} opacity="0.07"/>
      <g transform="translate(80, 50)">
        <rect x="6" y="8" width="240" height="200" rx="12" fill={ILLU.ink} opacity="0.08"/>
        <rect x="0" y="0" width="240" height="200" rx="12" fill={ILLU.cream} stroke={ILLU.sage} strokeWidth="1.5"/>
        {/* "fiche" header bar */}
        <rect x="0" y="0" width="240" height="32" rx="12" fill={ILLU.sage}/>
        <rect x="0" y="20" width="240" height="12" fill={ILLU.sage}/>
        <text x="16" y="20" fill={ILLU.cream} fontSize="11" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="0.08em">FICHE ANNONCE</text>
        {/* form rows */}
        <rect x="16" y="48" width="86" height="8" rx="4" fill={ILLU.sage} opacity="0.4"/>
        <rect x="16" y="62" width="208" height="22" rx="6" fill={ILLU.cream} stroke={ILLU.sageLt} strokeWidth="1.5"/>
        <text x="24" y="77" fill={ILLU.sageDark} fontSize="11" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">Bordeaux 33000</text>
        <rect x="16" y="94" width="66" height="8" rx="4" fill={ILLU.sage} opacity="0.4"/>
        <rect x="16" y="108" width="120" height="22" rx="6" fill={ILLU.cream} stroke={ILLU.sageLt} strokeWidth="1.5"/>
        <text x="24" y="123" fill={ILLU.ink} fontSize="11" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif">450 m²</text>
        <rect x="144" y="108" width="80" height="22" rx="6" fill={ILLU.peachLt} stroke={ILLU.peach} strokeWidth="1.5"/>
        <text x="184" y="123" fill={ILLU.peachDark} fontSize="11" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif" textAnchor="middle">±2%</text>
        {/* DPE row */}
        {['A','B','C','D','E','F','G'].map((l, i) => {
          const c = ['#0f7c3a','#5cb85c','#f0d000','#ff9900','#e74c3c','#d92a2a','#c1121f'][i];
          return (
            <g key={l}>
              <rect x={16 + i * 28} y={146} width="24" height="22" rx="4" fill={c} stroke={i === 2 ? ILLU.ink : 'transparent'} strokeWidth="2"/>
              <text x={28 + i * 28} y={161} textAnchor="middle" fill={i === 2 ? '#2c2c2c' : ILLU.cream} fontSize="11" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif">{l}</text>
            </g>
          );
        })}
      </g>
      {/* arrow indicating "submit" */}
      <g transform="translate(338, 158)">
        <line x1="0" y1="0" x2="34" y2="0" stroke={ILLU.peachDark} strokeWidth="3" strokeLinecap="round"/>
        <polyline points="26,-6 34,0 26,6" stroke={ILLU.peachDark} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
    </svg>
  );
}

function Step2Cartography() {
  return (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="200" cy="265" rx="160" ry="12" fill={ILLU.ink} opacity="0.07"/>
      <g transform="translate(50, 50)">
        <rect x="0" y="0" width="300" height="200" rx="14" fill={ILLU.sageBg} stroke={ILLU.sage} strokeWidth="1.5"/>
        {/* parcel grid */}
        <g stroke={ILLU.sageDark} strokeWidth="1.2" fill="none" opacity="0.7">
          <polygon points="20,20 100,16 94,84 18,88" fill={ILLU.cream} fillOpacity="0.45"/>
          <polygon points="100,16 200,20 196,90 94,84"/>
          <polygon points="200,20 282,24 278,98 196,90" fill={ILLU.cream} fillOpacity="0.45"/>
          <polygon points="18,88 94,84 88,176 14,180" fill={ILLU.cream} fillOpacity="0.45"/>
          <polygon points="94,84 196,90 192,180 88,176"/>
          <polygon points="196,90 278,98 274,184 192,180" fill={ILLU.cream} fillOpacity="0.45"/>
        </g>
        {/* candidates */}
        <polygon points="100,16 200,20 196,90 94,84" fill={ILLU.peach} opacity="0.30" stroke={ILLU.peachDark} strokeWidth="2"/>
        <polygon points="94,84 196,90 192,180 88,176" fill={ILLU.peach} opacity="0.50" stroke={ILLU.peachDark} strokeWidth="2.5"/>
        <polygon points="200,20 282,24 278,98 196,90" fill={ILLU.peach} opacity="0.25" stroke={ILLU.peachDark} strokeWidth="2"/>
        {/* scan beam */}
        <rect x="0" y="84" width="300" height="14" fill={ILLU.peach} opacity="0.25"/>
        <line x1="0" y1="84" x2="300" y2="84" stroke={ILLU.peachDark} strokeWidth="2" strokeDasharray="6 4"/>
        <line x1="0" y1="98" x2="300" y2="98" stroke={ILLU.peachDark} strokeWidth="2" strokeDasharray="6 4"/>
        {/* counts */}
        <rect x="220" y="160" width="68" height="22" rx="11" fill={ILLU.ink}/>
        <text x="254" y="175" textAnchor="middle" fill={ILLU.cream} fontSize="10.5" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif">3 candidats</text>
      </g>
    </svg>
  );
}

function Step3Cartography() {
  return (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="200" cy="265" rx="160" ry="12" fill={ILLU.ink} opacity="0.07"/>
      <g transform="translate(70, 50)">
        <rect x="6" y="8" width="260" height="200" rx="14" fill={ILLU.ink} opacity="0.10"/>
        <rect x="0" y="0" width="260" height="200" rx="14" fill={ILLU.cream}/>
        {/* satellite thumb */}
        <rect x="14" y="14" width="232" height="116" rx="10" fill={ILLU.sageDark}/>
        <g opacity="0.7" transform="translate(14, 14)">
          <circle cx="50" cy="40" r="34" fill={ILLU.sage} opacity="0.55"/>
          <circle cx="160" cy="80" r="44" fill={ILLU.sage} opacity="0.55"/>
        </g>
        <polygon points="70,56 210,66 200,118 60,108" fill={ILLU.peach} opacity="0.45" stroke={ILLU.peach} strokeWidth="3.5"/>
        {/* labels */}
        <rect x="14" y="14" width="232" height="22" rx="10" fill={ILLU.ink} opacity="0.55"/>
        <text x="22" y="30" fill={ILLU.cream} fontSize="11" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">14 rue Lafayette</text>
        <text x="20" y="156" fill={ILLU.ink} fontSize="22" fontWeight="800" letterSpacing="-0.02em" fontFamily="Plus Jakarta Sans, sans-serif">438 m²</text>
        <text x="20" y="176" fill={ILLU.inkSoft} fontSize="11" fontWeight="500" fontFamily="Plus Jakarta Sans, sans-serif">Réf. 000 AB 0124</text>
        <rect x="180" y="142" width="62" height="22" rx="4" fill={ILLU.sage} opacity="0.22"/>
        <text x="211" y="156" textAnchor="middle" fill={ILLU.sageDark} fontSize="10.5" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif">-2.7%</text>
        <circle cx="246" cy="14" r="16" fill={ILLU.sage} stroke={ILLU.cream} strokeWidth="3"/>
        <path d="M240,14 L245,19 L254,9" stroke={ILLU.cream} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
    </svg>
  );
}

Object.assign(window, { HeroIllustration, Step1Illustration, Step2Illustration, Step3Illustration, HeroCartography, Step1Cartography, Step2Cartography, Step3Cartography, HeroIllustrationLegacy, Step1IllustrationLegacy, Step2IllustrationLegacy, Step3IllustrationLegacy });
