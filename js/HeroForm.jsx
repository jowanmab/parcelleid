/* global React, Icons */
const { useState: useHF, useEffect: useHFE, useRef: useHFR } = React;

// URL of the SIG (the Leaflet map app). Edit this to point at your live URL —
// for the in-project demo we link to a local copy.
const SIG_URL = './sig.html';

// HeroForm — landing search form. Submits to the SIG with all criteria as
// query params so the map can pre-fill its own form and auto-run the search.
function HeroForm({ device = 'desktop' }) {
  // Commune (with autocomplete via geo.api.gouv.fr)
  const [commune, setCommune] = useHF('');
  const [selectedCommune, setSelectedCommune] = useHF(null);
  const [suggestions, setSuggestions] = useHF([]);
  const [showSug, setShowSug] = useHF(false);
  const acTimer = useHFR(null);
  const wrapRef = useHFR(null);

  // Surfaces
  const [surfLog, setSurfLog] = useHF('');
  const [surfCad, setSurfCad] = useHF('');
  const [tolerance, setTolerance] = useHF(2);

  // DPE / GES / date
  const [dpe, setDpe] = useHF(null);
  const [ges, setGes] = useHF(null);
  const [dateD, setDateD] = useHF('');

  // Submit state
  const [error, setError] = useHF('');

  // Derived
  const surfCadNum = parseInt(surfCad, 10) || 0;
  const tolAbs = Math.round(surfCadNum * tolerance / 100);
  const minS = surfCadNum > 0 ? surfCadNum - tolAbs : null;
  const maxS = surfCadNum > 0 ? surfCadNum + tolAbs : null;

  // Click outside → close suggestions
  useHFE(() => {
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowSug(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  // Commune autocomplete (geo.api.gouv.fr)
  const onCommuneInput = (v) => {
    setCommune(v);
    setSelectedCommune(null);
    setError('');
    if (acTimer.current) clearTimeout(acTimer.current);
    const q = v.trim();
    if (q.length < 2) { setSuggestions([]); setShowSug(false); return; }
    acTimer.current = setTimeout(async () => {
      try {
        const isCP = /^\d{3,5}$/.test(q);
        const url = isCP
          ? `https://geo.api.gouv.fr/communes?codePostal=${encodeURIComponent(q)}&fields=nom,code,codeDepartement,centre&limit=20`
          : `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(q)}&fields=nom,code,codeDepartement,centre&boost=population&limit=8`;
        const data = await fetch(url).then(r => r.json());
        setSuggestions(data || []);
        setShowSug(true);
      } catch { setSuggestions([]); setShowSug(false); }
    }, 280);
  };
  const pickCommune = (c) => {
    setCommune(c.nom);
    setSelectedCommune({
      nom: c.nom, code: c.code,
      lat: c.centre?.coordinates?.[1], lng: c.centre?.coordinates?.[0],
    });
    setShowSug(false);
  };

  // Submit → navigate to SIG with query params
  const submit = () => {
    if (!selectedCommune) {
      setError('Sélectionnez une commune dans la liste.');
      return;
    }
    const hasAny = surfLog || surfCad || dpe || ges || dateD;
    if (!hasAny) {
      setError('Renseignez au moins un critère (surface, DPE, GES ou date).');
      return;
    }
    setError('');
    const params = new URLSearchParams();
    params.set('commune', selectedCommune.nom);
    params.set('insee', selectedCommune.code);
    if (selectedCommune.lat) params.set('lat', selectedCommune.lat);
    if (selectedCommune.lng) params.set('lng', selectedCommune.lng);
    if (surfLog) params.set('surf_log', surfLog);
    if (surfCad) params.set('surf_cad', surfCad);
    if (surfCad) params.set('tol', tolerance);
    if (dpe) params.set('dpe', dpe);
    if (ges) params.set('ges', ges);
    if (dateD) params.set('date', dateD);
    window.location.href = SIG_URL + '?' + params.toString();
  };

  const canSubmit = selectedCommune && (surfLog || surfCad || dpe || ges || dateD);

  return (
    <div className="lp-form-card" data-device={device}>
      <div className="lp-form-head">
        <span className="lp-form-title">Décrivez l'annonce</span>
        <span className="lp-form-meta">Étape 1 sur 1</span>
      </div>

      {/* Commune w/ autocomplete */}
      <div className="lp-field" ref={wrapRef} style={{ position: 'relative' }}>
        <label className="lp-field-label">Commune ou code postal</label>
        <div className="lp-input-icon">
          <span className="ico"><Icons.Search s={16}/></span>
          <input
            className="lp-input"
            placeholder="Ex : Bordeaux, 33000…"
            value={commune}
            onChange={(e) => onCommuneInput(e.target.value)}
            onFocus={() => suggestions.length && setShowSug(true)}
            autoComplete="off"
          />
        </div>
        {showSug && suggestions.length > 0 && (
          <ul className="lp-ac">
            {suggestions.map((s) => (
              <li key={s.code} onMouseDown={(e) => { e.preventDefault(); pickCommune(s); }}>
                <span>{s.nom}</span>
                <small>{s.code}</small>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Surface logement */}
      <div className="lp-field">
        <label className="lp-field-label">Surface du logement <span className="opt">— m² habitables annoncés</span></label>
        <div className="lp-input-icon">
          <span className="ico" style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>m²</span>
          <input
            className="lp-input"
            placeholder="Ex : 95"
            inputMode="numeric"
            value={surfLog}
            onChange={(e) => setSurfLog(e.target.value.replace(/[^0-9]/g, ''))}
          />
        </div>
      </div>

      {/* Surface parcelle */}
      <div className="lp-field">
        <label className="lp-field-label">Surface de la parcelle</label>
        <div className="lp-surface-row">
          <input
            className="lp-input"
            placeholder="Ex : 450"
            value={surfCad}
            onChange={(e) => setSurfCad(e.target.value.replace(/[^0-9]/g, ''))}
            inputMode="numeric"
          />
          <div className="lp-tol-pill" onClick={() => {
            const next = tolerance === 2 ? 5 : tolerance === 5 ? 10 : tolerance === 10 ? 15 : 2;
            setTolerance(next);
          }}>
            ±{tolerance}%
          </div>
        </div>
        <div className="lp-surface-hint">
          {surfCadNum > 0
            ? <>Entre <b>{minS}</b> et <b>{maxS}</b> m²</>
            : <>Indiquez la surface annoncée — on cherchera ±{tolerance}% autour.</>}
        </div>
      </div>

      {/* DPE + GES */}
      <div className="lp-grade-grid" data-device={device}>
        <div className="lp-field" style={{ marginBottom: 0 }}>
          <label className="lp-field-label">Classe énergie <span className="opt">— optionnel</span></label>
          <div className="lp-grade-row">
            {['A','B','C','D','E','F','G'].map((c) => (
              <button
                key={c}
                className={"lp-grade-btn" + (dpe === c ? ' active' : '')}
                data-c={c}
                onClick={() => setDpe(dpe === c ? null : c)}
                type="button"
              >{c}</button>
            ))}
          </div>
        </div>

        <div className="lp-field" style={{ marginBottom: 0 }}>
          <label className="lp-field-label">Classe GES <span className="opt">— optionnel</span></label>
          <div className="lp-grade-row">
            {['A','B','C','D','E','F','G'].map((c) => (
              <button
                key={c}
                className={"lp-grade-btn" + (ges === c ? ' active' : '')}
                data-c={c}
                onClick={() => setGes(ges === c ? null : c)}
                type="button"
              >{c}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Date */}
      <div className="lp-field" style={{ marginTop: 14 }}>
        <label className="lp-field-label">Date du diagnostic <span className="opt">— optionnel</span></label>
        <input
          className="lp-input"
          type="date"
          value={dateD}
          onChange={(e) => setDateD(e.target.value)}
        />
      </div>

      {/* Error */}
      {error && <div className="lp-form-error">⚠ {error}</div>}

      {/* CTA */}
      <button
        className="lp-form-cta"
        type="button"
        onClick={submit}
        disabled={!canSubmit}
        style={!canSubmit ? { opacity: 0.55, cursor: 'not-allowed' } : null}
      >
        Géolocaliser l'annonce
        <span className="arrow"><Icons.ArrowRight s={14}/></span>
      </button>

      <div className="lp-form-foot">
        <span><b>Gratuit</b> · sans inscription</span>
        <span style={{ color: 'var(--border)' }}>·</span>
        <span>Données <b>IGN</b> · <b>Cadastre</b></span>
      </div>
    </div>
  );
}

window.HeroForm = HeroForm;
