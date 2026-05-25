/* ════════════════════════════════════════════════════════════════════════════
   LocaliseImmo — Bootstrap landing → SIG
   ────────────────────────────────────────────────────────────────────────────
   Lit les paramètres URL envoyés par la page d'accueil et préremplit le
   formulaire du SIG, puis lance la recherche automatiquement.

   ▸ Où le coller : à la TOUTE FIN de votre <script> principal, juste avant
     le </script> de fermeture. Aucune autre modif nécessaire.

   ▸ Paramètres lus :
       commune    nom de la commune (affiché dans le champ)
       insee      code INSEE (utilisé pour la requête API)
       lat, lng   coordonnées du centre commune (optionnel)
       surf_log   surface du logement (m²)
       surf_cad   surface de la parcelle (m²)
       tol        tolérance ±% (entier 0–25)
       dpe        classe énergie A–G
       ges        classe GES A–G
       date       date du diagnostic (YYYY-MM-DD)

   ▸ L'URL est nettoyée après le bootstrap (replaceState) — pas de
     re-déclenchement sur refresh.
   ════════════════════════════════════════════════════════════════════════════ */
(function localiseImmoBootstrap() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('commune') && !params.has('insee')) return;

  // 1. Commune — on remplit le champ ET la variable globale selectedCommune
  //    pour que doSearch() reconnaisse une sélection valide.
  const communeName = params.get('commune') || '';
  const insee = params.get('insee') || '';
  const lat = parseFloat(params.get('lat')) || null;
  const lng = parseFloat(params.get('lng')) || null;
  if (communeName) document.getElementById('commune-input').value = communeName;
  if (insee) {
    selectedCommune = { nom: communeName || insee, code: insee, lat, lng };
  }

  // 2. Surface du logement
  const surfLog = params.get('surf_log');
  if (surfLog) document.getElementById('surface-logement-input').value = surfLog;

  // 3. Surface parcelle + tolérance
  const surfCad = params.get('surf_cad');
  if (surfCad) document.getElementById('surface-input').value = surfCad;
  const tol = params.get('tol');
  if (tol !== null && tol !== '' && !isNaN(parseInt(tol, 10))) {
    document.getElementById('tol-range').value = parseInt(tol, 10);
    if (typeof updateTol === 'function') updateTol();
  }

  // 4. DPE — clic sur le bouton pour déclencher la même logique que l'UI
  const dpe = params.get('dpe');
  if (dpe && /^[A-G]$/i.test(dpe)) {
    const btn = document.querySelector(`.energie-btn[data-class="${dpe.toUpperCase()}"]`);
    if (btn) btn.click();
  }

  // 5. GES
  const ges = params.get('ges');
  if (ges && /^[A-G]$/i.test(ges)) {
    const btn = document.querySelector(`.ges-btn[data-class="${ges.toUpperCase()}"]`);
    if (btn) btn.click();
  }

  // 6. Date
  const date = params.get('date');
  if (date) document.getElementById('dpe-date-input').value = date;

  // 7. Nettoyage de l'URL — un refresh ne relance pas la recherche
  window.history.replaceState({}, '', window.location.pathname);

  // 8. Déclenchement automatique si on a une commune valide
  if (selectedCommune && selectedCommune.code) {
    if (typeof updateSearchBtn === 'function') updateSearchBtn();
    setTimeout(() => { if (typeof doSearch === 'function') doSearch(); }, 200);
  }
})();
