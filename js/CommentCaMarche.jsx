/* global React, Icons, HeroIllustration, HeroCartography, Step1Illustration, Step2Illustration, Step3Illustration, Step1Cartography, Step2Cartography, Step3Cartography */

const { useState: useCM } = React;

// Detailed step descriptions (more than landing — this is the deep page)
const CM_STEPS = [
  {
    num: '01',
    eyebrow: 'ENTRÉE',
    title: "Vous renseignez l'annonce",
    lead: "Ce que demande LocaliseImmo, c'est exactement ce qui figure sur l'annonce.",
    body: "Trois champs suffisent dans 90% des cas : la commune (ou le code postal), la surface du logement annoncée, et — si vous l'avez — la classe énergétique. La tolérance ±% se règle selon le sérieux de l'annonceur : ±2% si la surface est précise au mètre carré, ±10% si vous doutez.",
    bullets: [
      ["Commune", "Autocomplete sur les 35 000 communes via geo.api.gouv.fr"],
      ["Surface", "M² habitables ou de terrain — on croise les deux"],
      ["DPE / GES", "Optionnel mais discriminant : élimine les biens aberrants"],
      ["Date diagnostic", "Recoupe avec la dernière vente DVF"],
    ],
  },
  {
    num: '02',
    eyebrow: 'TRAITEMENT',
    title: "On géolocalise le bien",
    lead: "Pas de scraping, pas de devinettes. Que des sources publiques françaises.",
    body: "Le moteur interroge en parallèle l'API Cadastre (DGFiP), l'imagerie BD Ortho IGN, le PLU communal et la base DVF. Chaque parcelle de la commune est filtrée par surface (avec votre tolérance), puis classée par compatibilité avec les autres critères — jusqu'à isoler l'emplacement précis. Tout est calculé côté navigateur — vos requêtes ne quittent pas votre machine.",
    bullets: [
      ["Cadastre DGFiP", "Polygones officiels + référence + section"],
      ["IGN BD Ortho", "Vue satellite haute résolution"],
      ["Etalab DVF", "Toutes les ventes des 5 dernières années"],
      ["PLU", "Zonage, contraintes, servitudes"],
    ],
  },
  {
    num: '03',
    eyebrow: 'SORTIE',
    title: "Vous voyez tout du quartier",
    lead: "Carte interactive + cards de résultats. Vous comparez le voisinage en quelques secondes.",
    body: "Chaque bien compatible apparaît sur la carte avec son emplacement exact, et dans la liste avec sa miniature satellite + Street View. Cliquez une card : la position se sélectionne sur la carte, vous voyez les voisins immédiats, les commerces, les transports. Les liens externes pointent vers Cadastre.gouv, DVF et Géoportail. En 30 secondes vous savez ce qu'il y a vraiment autour — et si ça vaut la visite.",
    bullets: [
      ["Carte interactive", "Zoom, pan, voisinage à 360°"],
      ["Cards de résultat", "Emplacement · surface réelle · écart"],
      ["Liens externes", "Cadastre · DVF · Géoportail en un clic"],
      ["Position partagée", "URL persistante de chaque emplacement"],
    ],
  },
];

const CM_FAQ = [
  {
    q: "Est-ce vraiment gratuit ?",
    a: "Oui, totalement. Pas de freemium, pas de compte obligatoire, pas de carte bleue. LocaliseImmo est financé par de la publicité Google Ads sur les articles de blog. Le coût d'infrastructure est ~5€/mois — un projet personnel.",
  },
  {
    q: "D'où viennent les données de localisation ?",
    a: "IGN (BD Ortho, BD Topo, PLU), DGFiP (Cadastre officiel), Etalab (DVF — Demandes de Valeurs Foncières), geo.api.gouv.fr. Toutes des sources publiques françaises sous Licence Ouverte Etalab.",
  },
  {
    q: "Que faire si LocaliseImmo trouve plusieurs emplacements compatibles ?",
    a: "C'est le cas le plus fréquent. Réduisez la tolérance à ±2%, ajoutez le DPE/GES, ou utilisez la rue dans l'autocomplete. Si le doute persiste, comparez les vues satellite : la photo de l'annonce trahit souvent le bon emplacement.",
  },
  {
    q: "Mes recherches sont-elles sauvegardées ?",
    a: "Localement dans votre navigateur uniquement. Aucune requête ne touche notre serveur. Si vous créez un compte (optionnel, pour chasseurs immobiliers), vos biens favoris sont stockés chiffrés.",
  },
  {
    q: "Ça marche pour les maisons et les appartements ?",
    a: "Les deux. Pour les appartements, LocaliseImmo identifie le bâtiment (donc l'emplacement de l'immeuble) — pas l'étage. Croisé avec le DPE et la date de construction, c'est suffisant pour situer 95% des annonces.",
  },
  {
    q: "Pourquoi géolocaliser une annonce avant la visite ?",
    a: "Pour voir le vrai voisinage (résidentiel, commercial, industriel ?), les commerces, transports et écoles à proximité, la surface réelle du terrain, les contraintes d'urbanisme et l'historique de prix. 10 minutes économisent une visite inutile.",
  },
];

function CMFaqItem({ q, a, idx, open, onToggle }) {
  return (
    <div className={"cm-faq-item" + (open ? ' open' : '')}>
      <button className="cm-faq-q" onClick={() => onToggle(idx)} type="button">
        <span className="cm-faq-q-text">{q}</span>
        <span className="cm-faq-q-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </span>
      </button>
      <div className="cm-faq-a"><p>{a}</p></div>
    </div>
  );
}

function CommentCaMarche({ device = 'desktop', style = 'chaleureux', decor = 'personnages', energy = 'aere', animated = false }) {
  const wrap = device === 'desktop' ? 'lp-wrap-desktop' : 'lp-wrap-mobile';
  const HeroIllu = decor === 'cartographie' ? HeroCartography : HeroIllustration;
  const showIllu = decor !== 'minimal';
  const StepIllu = decor === 'cartographie'
    ? [Step1Cartography, Step2Cartography, Step3Cartography]
    : [Step1Illustration, Step2Illustration, Step3Illustration];
  const illuProps = decor === 'cartographie' ? {} : { animated };

  const [openFaq, setOpenFaq] = useCM(0);

  return (
    <div className="lp cm" data-device={device} data-palette="sage" data-style={style} data-decor={decor} data-energy={energy}>
      {/* NAV (réutilise le layout landing) */}
      <div className={wrap}>
        <nav className="lp-nav" data-device={device}>
          <div className="lp-logo">
            <img src="./assets/logo-mark.svg" alt=""/>
            <span className="word">Localise<span className="b">Immo</span></span>
          </div>
          {device === 'desktop' && (
            <div className="lp-nav-links">
              <a href="./index.html">Accueil</a>
              <a href="./comment-ca-marche.html" className="active">Comment ça marche</a>
              <a href="./sources.html">Sources</a>
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

      {/* HERO — tight punchline + KPI strip */}
      <div className={wrap}>
        <section className="cm-hero" data-device={device}>
          <span className="lp-hero-eyebrow"><span className="lp-hero-eyebrow-dot"></span>Comment ça marche</span>
          <h1 className="cm-h1">
            On part d'une annonce. <em>Vous savez où elle est.</em>
          </h1>
          <p className="cm-lead">
            Pas de magie, pas d'IA fantaisiste. LocaliseImmo croise <b>les données publiques officielles</b> avec ce que dit l'annonce, et vous donne en 30 secondes l'emplacement exact du bien — avec son voisinage, son terrain, son quartier et son historique.
          </p>
          <div className="cm-kpi-strip" data-device={device}>
            <div className="cm-kpi"><b>35 000</b><span>communes couvertes</span></div>
            <div className="cm-kpi"><b>~30 s</b><span>par géolocalisation</span></div>
            <div className="cm-kpi"><b>4</b><span>sources officielles croisées</span></div>
            <div className="cm-kpi"><b>0 €</b><span>à vie, sans inscription</span></div>
          </div>
        </section>
      </div>

      {/* LE PROBLÈME */}
      <div className={wrap}>
        <section className="cm-section" data-device={device}>
          <div className="cm-twocol" data-device={device}>
            <div className="cm-twocol-copy">
              <div className="lp-sec-eyebrow">Le problème</div>
              <h2 className="cm-h2">L'annonce vend un bien. <em>Pas un emplacement.</em></h2>
              <p className="cm-body">
                Les annonces immobilières parlent du logement : 95&nbsp;m² habitables, T4, vue dégagée. Quasiment jamais de <b>l'emplacement précis</b> — alors que c'est lui qui détermine ce que vous achètez vraiment.
              </p>
              <p className="cm-body">
                Sans la localisation exacte, impossible de vérifier le voisinage immédiat, les commerces et transports à proximité, les contraintes d'urbanisme, ou l'historique de prix de la zone. Vous visitez à l'aveugle.
              </p>
              <p className="cm-body">
                LocaliseImmo comble ce trou en 30 secondes — avec les mêmes données de localisation que les agents immobiliers, en libre accès.
              </p>
            </div>
            <div className="cm-twocol-aside">
              <div className="cm-problem-quote">
                <span className="cm-quote-mark">«</span>
                <p>Sur 50 annonces analysées par semaine, 8 cachent un détail bloquant qu'on ne voit qu'en regardant l'emplacement exact.</p>
                <span className="cm-quote-attr">— Une chasseuse immobilière indépendante</span>
              </div>
              <div className="cm-stat-card">
                <div className="cm-stat-num">4</div>
                <div className="cm-stat-lbl">sources publiques françaises croisées — IGN, DGFiP, Etalab et ADEME. Aucune donnée privée ou scrapée.</div>
                <div className="cm-stat-src">Toutes sous Licence Ouverte Etalab</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 3 STEPS DEEP DIVE */}
      {CM_STEPS.map((s, i) => {
        const Illu = StepIllu[i];
        const reversed = i % 2 === 1;
        return (
          <div className={wrap} key={s.num}>
            <section className={"cm-step-section" + (reversed ? ' reversed' : '')} data-device={device}>
              <div className="cm-step-copy">
                <div className="cm-step-tag">
                  <span className="cm-step-num">{s.num}</span>
                  <span className="cm-step-eyebrow">{s.eyebrow}</span>
                </div>
                <h2 className="cm-h2">{s.title}</h2>
                <p className="cm-lead-small">{s.lead}</p>
                <p className="cm-body">{s.body}</p>
                <ul className="cm-bullets">
                  {s.bullets.map(([k, v]) => (
                    <li key={k}><b>{k}</b><span>{v}</span></li>
                  ))}
                </ul>
              </div>
              {showIllu && (
                <div className="cm-step-visual">
                  <div className="cm-step-frame"><Illu {...illuProps}/></div>
                </div>
              )}
            </section>
          </div>
        );
      })}

      {/* CAS D'USAGE */}
      <div className={wrap}>
        <section className="cm-section cm-personas-wrap" data-device={device}>
          <div className="lp-sec-head">
            <div className="lp-sec-eyebrow">Cas d'usage</div>
            <h2 className="cm-h2">Pour qui, concrètement.</h2>
          </div>
          <div className="cm-personas" data-device={device}>
            <article className="cm-persona">
              <div className="cm-persona-avatar" style={{ background: 'color-mix(in srgb, var(--primary) 28%, transparent)' }}>
                <span>M</span>
              </div>
              <div className="cm-persona-role">Acheteuse particulière</div>
              <h3>Marie, 34 ans · Toulouse</h3>
              <p>« Avant une visite, je passe l'annonce dans LocaliseImmo. Je vois où c'est exactement, le voisinage, les commerces, les transports. Ça m'a évité <b>3 visites inutiles</b> en deux mois. »</p>
              <div className="cm-persona-stats">
                <span><b>~5</b> annonces / sem</span>
                <span><b>2</b> visites évitées / mois</span>
              </div>
            </article>
            <article className="cm-persona">
              <div className="cm-persona-avatar" style={{ background: 'color-mix(in srgb, var(--accent) 32%, transparent)' }}>
                <span>K</span>
              </div>
              <div className="cm-persona-role">Chasseur immobilier indépendant</div>
              <h3>Karim, 41 ans · Bordeaux</h3>
              <p>« Je traite 50&nbsp;+ annonces par semaine pour mes clients. LocaliseImmo c'est <b>5 minutes au lieu de 25</b> par dossier de qualification — je sais immédiatement où se trouve le bien, son quartier, ses contraintes. Le PLU et le DVF sur la même vue, c'est imbattable. »</p>
              <div className="cm-persona-stats">
                <span><b>50+</b> annonces / sem</span>
                <span><b>~80%</b> temps gagné</span>
              </div>
            </article>
          </div>
        </section>
      </div>

      {/* FAQ */}
      <div className={wrap}>
        <section className="cm-section" data-device={device}>
          <div className="cm-faq-wrap" data-device={device}>
            <div className="cm-faq-side">
              <div className="lp-sec-eyebrow">Questions fréquentes</div>
              <h2 className="cm-h2">Ce qu'on nous demande <em>tout le temps.</em></h2>
              <p className="cm-body">Une question qui n'est pas là ? <a className="cm-link">Écrivez-nous</a>.</p>
            </div>
            <div className="cm-faq-list">
              {CM_FAQ.map((f, i) => (
                <CMFaqItem key={i} idx={i} q={f.q} a={f.a} open={openFaq === i} onToggle={(x) => setOpenFaq(openFaq === x ? -1 : x)}/>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* CTA FINAL */}
      <div className={wrap}>
        <section className="cm-cta" data-device={device}>
          <div className="cm-cta-inner">
            <h2>Prêt à géolocaliser votre prochaine annonce ?</h2>
            <p>Collez la commune, la surface, lancez. Vous verrez l'emplacement exact en 30 secondes — gratuitement.</p>
            <div className="cm-cta-row">
              <button className="cm-cta-btn primary">Ouvrir l'outil <Icons.ArrowRight s={14}/></button>
              <button className="cm-cta-btn ghost">Voir un exemple</button>
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <div className={wrap}>
        <footer className="lp-foot">
          <div className="lp-logo" style={{ marginBottom: 14 }}>
            <img src="./assets/logo-mark.svg" alt=""/>
            <span className="word">Localise<span className="b">Immo</span></span>
          </div>
          <div className="lp-foot-row">
            <a href="./index.html">Accueil</a>
            <a href="./comment-ca-marche.html">Comment ça marche</a>
            <a href="./sources.html">Sources & méthode</a>
            <a href="./blog.html">Blog</a>
            <a href="./mentions-legales.html">Mentions légales</a>
            <a href="./confidentialite.html">Confidentialité</a>
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

window.CommentCaMarche = CommentCaMarche;
