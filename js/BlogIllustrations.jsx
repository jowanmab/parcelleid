/* global React */
// Blog-specific illustrations & diagrams

const BL = {
  sageDark:  '#5C8A6F',
  sage:      '#8AB89A',
  sageLt:    '#B6D4BF',
  sageBg:    '#D6E7DC',
  cream:     '#FAF7EF',
  creamWarm: '#EFE4D1',
  peachDark: '#C77858',
  peach:     '#E89878',
  peachLt:   '#F4C5AF',
  ink:       '#2E3530',
  inkSoft:   '#4A5550',
  white:     '#FFFFFF',
};

// ─────────────────────────────────────────────────────────────
// ARTICLE COVER — Two data sources meeting on a map
// ─────────────────────────────────────────────────────────────
function ArticleCover() {
  return (
    <svg viewBox="0 0 800 360" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* sage backdrop */}
      <rect width="800" height="360" fill={BL.sageBg}/>
      <circle cx="660" cy="80" r="80" fill={BL.sageLt} opacity="0.55"/>
      <circle cx="140" cy="300" r="100" fill={BL.peachLt} opacity="0.35"/>

      {/* Left source — Cadastre paper / file */}
      <g transform="translate(80, 60)">
        <rect x="6" y="10" width="220" height="240" rx="14" fill={BL.ink} opacity="0.10"/>
        <rect x="0" y="0" width="220" height="240" rx="14" fill={BL.cream}/>
        <rect x="0" y="0" width="220" height="36" rx="14" fill={BL.sageDark}/>
        <rect x="0" y="22" width="220" height="14" fill={BL.sageDark}/>
        <text x="16" y="22" fill={BL.cream} fontSize="11" fontWeight="800" letterSpacing="0.10em" fontFamily="Plus Jakarta Sans, sans-serif">CADASTRE · DGFiP</text>
        {/* parcel grid */}
        <g transform="translate(16, 52)" stroke={BL.sageDark} strokeWidth="1.3" fill={BL.sageLt} fillOpacity="0.6">
          <polygon points="0,0 60,4 56,60 -4,56"/>
          <polygon points="60,4 130,8 124,64 56,60" fill={BL.sageBg} fillOpacity="1"/>
          <polygon points="130,8 190,12 186,68 124,64"/>
          <polygon points="-4,56 56,60 50,124 -10,120" fill={BL.sageBg} fillOpacity="1"/>
          <polygon points="56,60 124,64 118,128 50,124"/>
          <polygon points="124,64 186,68 180,132 118,128" fill={BL.peach} fillOpacity="0.5" stroke={BL.peachDark} strokeWidth="2.5"/>
          <line x1="-4" y1="56" x2="186" y2="68" stroke={BL.cream} strokeWidth="3"/>
          <line x1="56" y1="0" x2="50" y2="124" stroke={BL.cream} strokeWidth="3"/>
        </g>
        {/* m² label */}
        <g transform="translate(110, 200)">
          <rect x="-44" y="-13" width="88" height="26" rx="13" fill={BL.ink}/>
          <text x="0" y="4" textAnchor="middle" fill={BL.cream} fontSize="12" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif">438 m²</text>
        </g>
        {/* reliability stars */}
        <g transform="translate(110, 226)">
          <text x="0" y="0" textAnchor="middle" fill={BL.peachDark} fontSize="11" fontWeight="700" letterSpacing="0.15em" fontFamily="Plus Jakarta Sans, sans-serif">★★★★★</text>
        </g>
      </g>

      {/* Right source — DPE label */}
      <g transform="translate(500, 60)">
        <rect x="6" y="10" width="220" height="240" rx="14" fill={BL.ink} opacity="0.10"/>
        <rect x="0" y="0" width="220" height="240" rx="14" fill={BL.cream}/>
        <rect x="0" y="0" width="220" height="36" rx="14" fill={BL.peachDark}/>
        <rect x="0" y="22" width="220" height="14" fill={BL.peachDark}/>
        <text x="16" y="22" fill={BL.cream} fontSize="11" fontWeight="800" letterSpacing="0.10em" fontFamily="Plus Jakarta Sans, sans-serif">DPE · ADEME</text>
        {/* energy label */}
        <g transform="translate(20, 56)">
          {['A','B','C','D','E','F','G'].map((l, i) => {
            const c = ['#0f7c3a','#5cb85c','#f0d000','#ff9900','#e74c3c','#d92a2a','#c1121f'][i];
            const w = 50 + i * 16;
            return (
              <g key={l}>
                <rect x={0} y={i * 18} width={w} height="14" rx="3" fill={c}/>
                <text x={6} y={i * 18 + 11} fill={i < 2 || i > 4 ? BL.cream : '#2c2c2c'} fontSize="10.5" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif">{l}</text>
              </g>
            );
          })}
          {/* highlight C */}
          <g transform="translate(82, 36)">
            <polygon points="-8,-2 0,-8 0,16 -8,10" fill={BL.ink}/>
            <text x="6" y="11" fill={BL.ink} fontSize="13" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif">classe C</text>
          </g>
        </g>
        {/* update note */}
        <g transform="translate(110, 200)">
          <rect x="-58" y="-13" width="116" height="26" rx="13" fill={BL.peachDark}/>
          <text x="0" y="4" textAnchor="middle" fill={BL.cream} fontSize="10" fontWeight="700" letterSpacing="0.04em" fontFamily="Plus Jakarta Sans, sans-serif">MAJ HEBDOMADAIRE</text>
        </g>
        <g transform="translate(110, 226)">
          <text x="0" y="0" textAnchor="middle" fill={BL.peachDark} fontSize="11" fontWeight="700" letterSpacing="0.15em" fontFamily="Plus Jakarta Sans, sans-serif">★★★☆☆</text>
        </g>
      </g>

      {/* center merge — convergence */}
      <g transform="translate(400, 180)">
        <line x1="-90" y1="0" x2="-30" y2="0" stroke={BL.ink} strokeWidth="2.5" strokeDasharray="6 4"/>
        <line x1="30" y1="0" x2="90" y2="0" stroke={BL.ink} strokeWidth="2.5" strokeDasharray="6 4"/>
        <circle cx="0" cy="0" r="32" fill={BL.ink}/>
        <text x="0" y="-3" textAnchor="middle" fill={BL.cream} fontSize="10" fontWeight="700" letterSpacing="0.08em" fontFamily="Plus Jakarta Sans, sans-serif">SCAN</text>
        <text x="0" y="11" textAnchor="middle" fill={BL.peach} fontSize="10" fontWeight="700" letterSpacing="0.08em" fontFamily="Plus Jakarta Sans, sans-serif">IMMO</text>
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// SOURCE DIAGRAM — inline schematic: 2 sources → match → result
// ─────────────────────────────────────────────────────────────
function SourceDiagram() {
  return (
    <svg viewBox="0 0 720 320" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Source 1 — Parcelle */}
      <g transform="translate(20, 60)">
        <rect x="0" y="0" width="190" height="100" rx="14" fill={BL.cream} stroke={BL.sageDark} strokeWidth="2"/>
        <rect x="0" y="0" width="190" height="28" rx="14" fill={BL.sageDark}/>
        <rect x="0" y="14" width="190" height="14" fill={BL.sageDark}/>
        <text x="14" y="19" fill={BL.cream} fontSize="11" fontWeight="800" letterSpacing="0.08em" fontFamily="Plus Jakarta Sans, sans-serif">PARCELLE M²</text>
        <text x="14" y="54" fill={BL.ink} fontSize="13" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">DGFiP · IGN</text>
        <text x="14" y="72" fill={BL.inkSoft} fontSize="11" fontWeight="500" fontFamily="Plus Jakarta Sans, sans-serif">Surface officielle, géométrie</text>
        <text x="14" y="88" fill={BL.peachDark} fontSize="10" fontWeight="700" letterSpacing="0.10em" fontFamily="Plus Jakarta Sans, sans-serif">★★★★★ FIABLE</text>
      </g>

      {/* Source 2 — DPE */}
      <g transform="translate(20, 180)">
        <rect x="0" y="0" width="190" height="100" rx="14" fill={BL.cream} stroke={BL.peachDark} strokeWidth="2"/>
        <rect x="0" y="0" width="190" height="28" rx="14" fill={BL.peachDark}/>
        <rect x="0" y="14" width="190" height="14" fill={BL.peachDark}/>
        <text x="14" y="19" fill={BL.cream} fontSize="11" fontWeight="800" letterSpacing="0.08em" fontFamily="Plus Jakarta Sans, sans-serif">DPE ÉNERGIE</text>
        <text x="14" y="54" fill={BL.ink} fontSize="13" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">ADEME</text>
        <text x="14" y="72" fill={BL.inkSoft} fontSize="11" fontWeight="500" fontFamily="Plus Jakarta Sans, sans-serif">Classe énergétique, GES</text>
        <text x="14" y="88" fill={BL.peachDark} fontSize="10" fontWeight="700" letterSpacing="0.10em" fontFamily="Plus Jakarta Sans, sans-serif">★★★☆☆ MAJ HEBDO</text>
      </g>

      {/* Filter step (middle) */}
      <g transform="translate(260, 100)">
        <line x1="-40" y1="20" x2="0" y2="40" stroke={BL.sageDark} strokeWidth="2" strokeDasharray="5 4"/>
        <line x1="-40" y1="120" x2="0" y2="80" stroke={BL.peachDark} strokeWidth="2" strokeDasharray="5 4"/>
        <rect x="0" y="20" width="200" height="80" rx="14" fill={BL.ink}/>
        <text x="100" y="48" textAnchor="middle" fill={BL.cream} fontSize="13" fontWeight="800" letterSpacing="-0.01em" fontFamily="Plus Jakarta Sans, sans-serif">CROISEMENT</text>
        <text x="100" y="64" textAnchor="middle" fill={BL.sage} fontSize="10" fontWeight="700" letterSpacing="0.08em" fontFamily="Plus Jakarta Sans, sans-serif">+ Filtre bâti BD TOPO</text>
        <text x="100" y="84" textAnchor="middle" fill={BL.peach} fontSize="10" fontWeight="700" letterSpacing="0.08em" fontFamily="Plus Jakarta Sans, sans-serif">~60% du bruit éliminé</text>
      </g>

      {/* Result */}
      <g transform="translate(510, 100)">
        <line x1="-40" y1="60" x2="0" y2="60" stroke={BL.ink} strokeWidth="2.5"/>
        <polyline points="-8,52 0,60 -8,68" stroke={BL.ink} strokeWidth="2.5" fill="none"/>
        <rect x="0" y="0" width="190" height="120" rx="14" fill={BL.peach} fillOpacity="0.2" stroke={BL.peachDark} strokeWidth="2"/>
        <text x="14" y="28" fill={BL.peachDark} fontSize="10" fontWeight="800" letterSpacing="0.10em" fontFamily="Plus Jakarta Sans, sans-serif">RÉSULTAT</text>
        <text x="14" y="58" fill={BL.ink} fontSize="22" fontWeight="800" letterSpacing="-0.025em" fontFamily="Plus Jakarta Sans, sans-serif">438 m²</text>
        <text x="14" y="78" fill={BL.inkSoft} fontSize="12" fontWeight="500" fontFamily="Plus Jakarta Sans, sans-serif">14 rue Lafayette · DPE C</text>
        <text x="14" y="100" fill={BL.peachDark} fontSize="11" fontWeight="700" letterSpacing="0.04em" fontFamily="Plus Jakarta Sans, sans-serif">000 AB 0124</text>
      </g>
    </svg>
  );
}

Object.assign(window, { ArticleCover, SourceDiagram });
