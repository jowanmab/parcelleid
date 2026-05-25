/* global React, Icons */

const { useState: useSrc } = React;

const SOURCES = [
  {
    id: 'cadastre',
    name: 'Cadastre',
    organism: 'DGFiP · Direction Générale des Finances Publiques',
    role: 'Source principale',
    provides: 'Polygones parcellaires officiels, surface au mètre carré, référence cadastrale (section + numéro), commune',
    license: 'Licence Ouverte Etalab',
    refresh: 'Mensuelle',
    fiability: 5,
    color: 'sage',
    note: "Donnée légalement opposable. C'est la seule mesure de surface qui fait foi devant un notaire.",
  },
  {
    id: 'ign-ortho',
    name: 'BD Ortho',
    organism: 'IGN · Institut National de l\'Information Géographique',
    role: 'Imagerie satellite',
    provides: "Vue aérienne haute résolution (jusqu'à 20 cm/pixel), photos verticales orthorectifiées",
    license: 'Licence Ouverte Etalab',
    refresh: 'Annuelle · couverture nationale',
    fiability: 5,
    color: 'sage',
    note: "L'imagerie peut avoir 1 à 3 ans selon le département. Pas d'impact sur l'identification.",
  },
  {
    id: 'ign-topo',
    name: 'BD Topo',
    organism: 'IGN · Institut National de l\'Information Géographique',
    role: 'Filtre du bâti',
    provides: "Géométrie de tous les bâtiments du territoire français (~100 millions)",
    license: 'Licence Ouverte Etalab',
    refresh: 'Trimestrielle',
    fiability: 5,
    color: 'sage',
    note: "Sert à pré-filtrer les parcelles construites — élimine ~60% du bruit avant affichage.",
  },
  {
    id: 'dvf',
    name: 'DVF',
    organism: 'Etalab · Demandes de Valeurs Foncières',
    role: 'Historique des ventes',
    provides: "Toutes les transactions immobilières publiées (prix, date, surface, type de bien)",
    license: 'Licence Ouverte Etalab',
    refresh: 'Semestrielle',
    fiability: 4,
    color: 'sage',
    note: "Couvre 95% du territoire — sauf Alsace-Moselle et Mayotte (régimes fonciers différents).",
  },
  {
    id: 'dpe',
    name: 'DPE / GES',
    organism: 'ADEME · Agence de l\'Environnement et de la Maîtrise de l\'Énergie',
    role: 'Source secondaire',
    provides: "Diagnostics de Performance Énergétique déposés depuis juillet 2021 — classe énergétique, classe GES, consommation, date",
    license: 'Licence Ouverte Etalab',
    refresh: 'Hebdomadaire (théorique)',
    fiability: 3,
    color: 'peach',
    note: "L'ADEME publie quand son calendrier le permet. Quand elle saute une semaine, nous le signalons explicitement.",
  },
  {
    id: 'geoapi',
    name: 'geo.api.gouv.fr',
    organism: 'Etalab · API officielle des communes françaises',
    role: 'Référentiel géographique',
    provides: "Liste des 35 000 communes, codes postaux, contours communaux, codes INSEE",
    license: 'Licence Ouverte Etalab',
    refresh: 'Continue',
    fiability: 5,
    color: 'sage',
    note: "Alimente l'autocomplete et trace le contour de la commune sur la carte.",
  },
];

const GUARANTEES = [
  { yes: true,  label: "La surface cadastrale affichée correspond exactement à la DGFiP au jour de la dernière synchronisation." },
  { yes: true,  label: "La référence cadastrale est l'identifiant officiel — opposable juridiquement." },
  { yes: true,  label: "Les ventes DVF affichées sont les transactions réellement déclarées à l'administration." },
  { yes: true,  label: "L'imagerie satellite vient bien de l'IGN, pas d'un tiers commercial." },
  { yes: false, label: "Les surfaces habitables annoncées ne sont jamais garanties — c'est une donnée privée saisie par l'agent." },
  { yes: false, label: "Les DPE peuvent avoir des erreurs de saisie ou ne pas refléter le diagnostic le plus récent." },
  { yes: false, label: "L'imagerie satellite peut avoir entre 1 et 3 ans — un bâtiment récent peut ne pas y figurer." },
  { yes: false, label: "Nous ne couvrons pas l'Alsace-Moselle pour DVF (régime foncier différent)." },
];

const PRIVACY = [
  ["Calcul navigateur", "Toutes les requêtes sont exécutées dans votre navigateur. Vos critères de recherche ne touchent pas notre serveur."],
  ["Pas de logs", "Aucun log de recherche conservé. Nous ne savons pas qui cherche quoi."],
  ["Pas d'inscription", "L'outil principal fonctionne sans compte. Aucune adresse email demandée pour l'utiliser."],
  ["Pas de tracking commercial", "Pas de Facebook Pixel, pas de Google Analytics avancé. Une mesure d'audience anonyme via Matomo, c'est tout."],
  ["Conformité RGPD", "Hébergement européen, conforme au règlement général sur la protection des données."],
  ["Code consultable", "Le projet est en logique ouverte sur GitHub — vous pouvez vérifier ce qui se passe."],
];

function Stars({ value }) {
  return (
    <span className="src-stars" aria-label={value + ' sur 5'}>
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= value ? 'filled' : 'empty'}>★</span>
      ))}
    </span>
  );
}

function Sources({ device = 'desktop', style = 'chaleureux', decor = 'personnages', energy = 'aere' }) {
  const wrap = device === 'desktop' ? 'lp-wrap-desktop' : 'lp-wrap-mobile';

  return (
    <div className="lp src" data-device={device} data-palette="sage" data-style={style} data-decor={decor} data-energy={energy}>
      {/* NAV */}
      <div className={wrap}>
        <nav className="lp-nav" data-device={device}>
          <div className="lp-logo">
            <img src="./assets/logo-mark.svg" alt=""/>
            <span className="word">Scan<span className="b">Immo</span></span>
          </div>
          {device === 'desktop' && (
            <div className="lp-nav-links">
              <a href="./index.html">Accueil</a>
              <a href="./comment-ca-marche.html">Comment ça marche</a>
              <a href="./sources.html" className="active">Sources</a>
              <a href="./blog.html">Blog</a>
            </div>
          )}
          <div className="lp-nav-spacer"></div>
          {device === 'desktop' ? (
            <button className="lp-nav-cta">Ouvrir l'outil <Icons.ArrowRight s={14}/></button>
          ) : (
            <button className="lp-nav-burger">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>
            </button>
          )}
        </nav>
      </div>

      {/* HERO */}
      <div className={wrap}>
        <section className="src-hero" data-device={device}>
          <span className="lp-hero-eyebrow"><span className="lp-hero-eyebrow-dot"></span>Sources & méthode</span>
          <h1 className="cm-h1">Nos données ne mentent pas. <em>Voici d'où elles viennent.</em></h1>
          <p className="cm-lead">
            LocaliseImmo ne <b>collecte</b> aucune donnée, n'<b>achète</b> aucune base, ne <b>scrape</b> aucune annonce. Tout vient de six sources publiques françaises sous Licence Ouverte Etalab. Cette page liste précisément lesquelles, à quelle fréquence elles se mettent à jour, et ce qu'on en fait.
          </p>
          <div className="src-anchor-strip" data-device={device}>
            <a href="#sources">Les 6 sources ↓</a>
            <a href="#methode">Méthode</a>
            <a href="#garanties">Ce qu'on garantit</a>
            <a href="#privacy">Vie privée</a>
          </div>
        </section>
      </div>

      {/* SOURCES TABLE */}
      <div className={wrap}>
        <section id="sources" className="src-section" data-device={device}>
          <div className="src-section-head">
            <div className="lp-sec-eyebrow">Les sources</div>
            <h2 className="cm-h2">Six bases publiques. <em>Aucune autre.</em></h2>
            <p className="cm-body" style={{ maxWidth: 640 }}>
              Toutes hébergées par l'État français, toutes sous <a className="cm-link">Licence Ouverte Etalab</a>. La fiabilité varie selon la fréquence de mise à jour et le mode de collecte.
            </p>
          </div>

          <div className="src-cards" data-device={device}>
            {SOURCES.map((s) => (
              <article className={"src-card src-card-" + s.color} key={s.id}>
                <header className="src-card-head">
                  <div className="src-card-name">
                    <h3>{s.name}</h3>
                    <span className="src-card-role">{s.role}</span>
                  </div>
                  <Stars value={s.fiability}/>
                </header>
                <div className="src-card-organism">{s.organism}</div>
                <p className="src-card-provides">{s.provides}</p>
                <dl className="src-card-meta">
                  <div><dt>Licence</dt><dd>{s.license}</dd></div>
                  <div><dt>Mise à jour</dt><dd>{s.refresh}</dd></div>
                </dl>
                <div className="src-card-note">{s.note}</div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* MÉTHODE */}
      <div className={wrap}>
        <section id="methode" className="src-section" data-device={device}>
          <div className="src-section-head">
            <div className="lp-sec-eyebrow">Méthode</div>
            <h2 className="cm-h2">Comment on assemble tout ça.</h2>
          </div>

          <div className="src-pipeline" data-device={device}>
            <div className="src-pipe-step">
              <div className="src-pipe-num">01</div>
              <h4>Vos critères</h4>
              <p>Commune, surface, DPE — saisis dans votre navigateur. Aucun envoi vers nos serveurs.</p>
            </div>
            <div className="src-pipe-arrow">→</div>
            <div className="src-pipe-step">
              <div className="src-pipe-num">02</div>
              <h4>Filtre cadastre</h4>
              <p>Toutes les parcelles de la commune dont la surface tombe dans la fourchette tolérée.</p>
            </div>
            <div className="src-pipe-arrow">→</div>
            <div className="src-pipe-step">
              <div className="src-pipe-num">03</div>
              <h4>Filtre bâti</h4>
              <p>Croisement avec BD Topo IGN : on garde uniquement les parcelles construites. ~60% du bruit éliminé.</p>
            </div>
            <div className="src-pipe-arrow">→</div>
            <div className="src-pipe-step">
              <div className="src-pipe-num">04</div>
              <h4>Filtre DPE</h4>
              <p>Si vous avez renseigné la classe énergétique, on écarte les biens incompatibles via la base ADEME.</p>
            </div>
            <div className="src-pipe-arrow">→</div>
            <div className="src-pipe-step src-pipe-step-final">
              <div className="src-pipe-num">05</div>
              <h4>Affichage</h4>
              <p>Les parcelles restantes apparaissent sur la carte avec leur référence, surface réelle et historique DVF.</p>
            </div>
          </div>
        </section>
      </div>

      {/* GARANTIES */}
      <div className={wrap}>
        <section id="garanties" className="src-section" data-device={device}>
          <div className="src-section-head">
            <div className="lp-sec-eyebrow">Ce qu'on garantit</div>
            <h2 className="cm-h2">Et ce qu'on <em>ne garantit pas.</em></h2>
            <p className="cm-body" style={{ maxWidth: 640 }}>
              Nous sommes un outil. Nous croisons des sources publiques. Nous n'inventons rien — et nous ne corrigeons pas les erreurs des sources d'origine.
            </p>
          </div>

          <div className="src-guarantees" data-device={device}>
            <div className="src-g-col">
              <div className="src-g-col-head src-g-yes">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Ce qu'on garantit</span>
              </div>
              <ul>
                {GUARANTEES.filter(g => g.yes).map((g, i) => <li key={i}>{g.label}</li>)}
              </ul>
            </div>
            <div className="src-g-col">
              <div className="src-g-col-head src-g-no">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                <span>Ce qu'on ne garantit pas</span>
              </div>
              <ul>
                {GUARANTEES.filter(g => !g.yes).map((g, i) => <li key={i}>{g.label}</li>)}
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* PRIVACY */}
      <div className={wrap}>
        <section id="privacy" className="src-section" data-device={device}>
          <div className="src-section-head">
            <div className="lp-sec-eyebrow">Vie privée</div>
            <h2 className="cm-h2">Vos recherches restent <em>chez vous.</em></h2>
            <p className="cm-body" style={{ maxWidth: 640 }}>
              LocaliseImmo est conçu pour fonctionner sans rien savoir de vous. Pas par marketing — par architecture.
            </p>
          </div>

          <div className="src-privacy-grid" data-device={device}>
            {PRIVACY.map(([title, body], i) => (
              <article className="src-privacy-card" key={i}>
                <div className="src-privacy-num">{String(i + 1).padStart(2, '0')}</div>
                <h4>{title}</h4>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* CTA */}
      <div className={wrap}>
        <section className="cm-cta" data-device={device}>
          <div className="cm-cta-inner">
            <h2>Maintenant que vous savez d'où viennent les données…</h2>
            <p>Essayez avec une vraie annonce. Vous verrez exactement quelles sources sont mobilisées à chaque résultat.</p>
            <div className="cm-cta-row">
              <button className="cm-cta-btn primary">Ouvrir l'outil <Icons.ArrowRight s={14}/></button>
              <button className="cm-cta-btn ghost">Lire la méthode complète</button>
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <div className={wrap}>
        <footer className="lp-foot">
          <div className="lp-logo" style={{ marginBottom: 14 }}>
            <img src="./assets/logo-mark.svg" alt=""/>
            <span className="word">Scan<span className="b">Immo</span></span>
          </div>
          <div className="lp-foot-row">
            <a href="./index.html">Accueil</a>
            <a href="./comment-ca-marche.html">Comment ça marche</a>
            <a href="./sources.html">Sources & méthode</a>
            <a href="./blog.html">Blog</a>
            <a href="#" onClick={(e)=>e.preventDefault()}>Mentions légales</a>
            <a href="mailto:contact@localiseimmo.fr">Contact</a>
          </div>
          <div className="legal">
            Données cadastrales : IGN · Cadastre officiel français — Licence Ouverte Etalab. LocaliseImmo n'est pas affilié à un organisme public.
          </div>
        </footer>
      </div>
    </div>
  );
}

window.Sources = Sources;
