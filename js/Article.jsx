/* global React, Icons, ArticleCover, SourceDiagram */

const { useState: useArt } = React;

// Sample article — methodology piece about LocaliseImmo's data sources
const ARTICLE = {
  category: 'Méthodologie',
  title: "D'où viennent les données de LocaliseImmo ?",
  subtitle: "Parcelle cadastrale et DPE — deux sources, deux niveaux de fiabilité. Voici exactement ce qu'on utilise, et pourquoi nous le disons.",
  author: "L'équipe LocaliseImmo",
  date: '16 mai 2026',
  readTime: '8 min de lecture',
  toc: [
    { id: 'intro',     label: "Pourquoi cette transparence" },
    { id: 'parcelle',  label: "1. La parcelle cadastrale (source principale)" },
    { id: 'filtre',    label: "Comment on filtre le bruit" },
    { id: 'dpe',       label: "2. Le DPE énergie (source secondaire)" },
    { id: 'ademe',     label: "Le rythme de l'ADEME" },
    { id: 'matching',  label: "Comment on croise les deux" },
    { id: 'retenir',   label: "À retenir" },
    { id: 'faq',       label: "Questions fréquentes" },
  ],
};

const ART_RELATED = [
  { tag: 'Méthodologie', title: 'BD TOPO IGN : comment LocaliseImmo détecte les parcelles construites', read: '6 min' },
  { tag: 'Guide pratique', title: 'Lire un DPE avant achat : les 4 chiffres qui comptent', read: '5 min' },
  { tag: 'Urbanisme', title: 'Qu\'est-ce qu\'un PLU et où le consulter gratuitement ?', read: '9 min' },
];

function ArtCallout({ kind = 'retenir', title, children }) {
  return (
    <aside className={"art-callout art-callout-" + kind}>
      <div className="art-callout-tag">{title}</div>
      <div className="art-callout-body">{children}</div>
    </aside>
  );
}

function ArtTryLocaliseImmo() {
  return (
    <aside className="art-try">
      <div className="art-try-left">
        <div className="art-try-eyebrow">Essayer maintenant</div>
        <h4>Vous avez une annonce sous les yeux ?</h4>
        <p>Tapez la commune et la surface — vous voyez l'emplacement exact en 30 secondes.</p>
      </div>
      <button className="art-try-btn">
        Ouvrir LocaliseImmo
        <span className="art-try-arrow"><Icons.ArrowRight s={14}/></span>
      </button>
    </aside>
  );
}

function ArtFaqItem({ q, a, idx, open, onToggle }) {
  return (
    <div className={"art-faq-item" + (open ? ' open' : '')}>
      <button className="art-faq-q" onClick={() => onToggle(idx)} type="button">
        <span>{q}</span>
        <span className="art-faq-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>
      </button>
      <div className="art-faq-a"><p>{a}</p></div>
    </div>
  );
}

const ART_FAQ = [
  {
    q: "Pourquoi se baser sur la surface plutôt que sur le DPE ?",
    a: "Parce que la surface cadastrale est une donnée officielle, mesurée par les géomètres et opposable juridiquement. Le DPE est un diagnostic privé saisi par un professionnel : utile, mais soumis à des variations et des erreurs de saisie. Sur 100 cas où les deux divergent, la parcelle a raison 95 fois.",
  },
  {
    q: "À quelle fréquence le DPE est-il mis à jour ?",
    a: "L'ADEME publie sa base hebdomadairement quand son calendrier le permet. Nous synchronisons dans la foulée — souvent dans les 24h. Quand l'ADEME saute une semaine (cela arrive), nous le détectons et signalons que la donnée peut avoir jusqu'à 2 semaines de retard.",
  },
  {
    q: "Ma maison n'a pas de DPE publié, est-ce normal ?",
    a: "Oui. Le DPE n'est obligatoire qu'à la vente ou à la location longue durée — et seuls les DPE produits depuis juillet 2021 alimentent la base ADEME. Si votre bien n'a pas changé de main depuis, il n'y a probablement aucun DPE dans la base.",
  },
  {
    q: "Que faire si LocaliseImmo affiche un DPE différent de l'annonce ?",
    a: "Fiez-vous à l'annonce — qui est censée afficher le DPE le plus récent fourni par le vendeur. Notre base reflète ce qui a été déposé à l'ADEME, mais le diagnostiqueur a pu en produire un nouveau depuis. C'est un signal à clarifier avec l'agent.",
  },
];

function Article({ variant = 'sober', device = 'desktop', style = 'chaleureux', decor = 'personnages', energy = 'aere' }) {
  const wrap = device === 'desktop' ? 'lp-wrap-desktop' : 'lp-wrap-mobile';
  const [openFaq, setOpenFaq] = useArt(0);

  return (
    <div className="lp art" data-device={device} data-palette="sage" data-style={style} data-decor={decor} data-energy={energy} data-variant={variant}>
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
              <a href="./blog.html" className="active">Blog</a>
              <a href="#" onClick={(e)=>e.preventDefault()}>Tarifs</a>
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

      {/* BREADCRUMB */}
      <div className={wrap}>
        <div className="art-breadcrumb">
          <a href="./blog.html">Blog</a><span>›</span><a>{ARTICLE.category}</a>
        </div>
      </div>

      {/* HEADER */}
      <div className={wrap}>
        <header className="art-header">
          <span className="art-category">{ARTICLE.category}</span>
          <h1 className="art-title">{ARTICLE.title}</h1>
          <p className="art-subtitle">{ARTICLE.subtitle}</p>
          <div className="art-meta">
            <div className="art-meta-avatar">SI</div>
            <div className="art-meta-info">
              <div className="art-meta-author">{ARTICLE.author}</div>
              <div className="art-meta-row">
                <span>{ARTICLE.date}</span>
                <span className="art-meta-sep">·</span>
                <span>{ARTICLE.readTime}</span>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* COVER — user-fillable photo slot */}
      <div className={wrap}>
        <figure className="art-cover">
          <image-slot
            id="art-cover-methodologie"
            shape="rect"
            radius="22"
            placeholder="Photo de couverture — quartier, maison, vue carte. Glissez-déposez ici."
            style={{ aspectRatio: '16/9', display: 'block' }}
          ></image-slot>
          <figcaption>Deux sources publiques, un seul résultat sur la carte.</figcaption>
        </figure>
      </div>

      {/* BODY — TOC sidebar + content */}
      <div className={wrap}>
        <div className="art-body-grid" data-device={device}>
          {/* TOC (desktop only) */}
          {device === 'desktop' && (
            <aside className="art-toc">
              <div className="art-toc-label">Dans cet article</div>
              <ol>
                {ARTICLE.toc.map((t) => <li key={t.id}><a href={'#' + t.id}>{t.label}</a></li>)}
              </ol>
              <div className="art-toc-share">
                <div className="art-toc-label">Partager</div>
                <div className="art-share-row">
                  <button className="art-share-btn" aria-label="Twitter">𝕏</button>
                  <button className="art-share-btn" aria-label="LinkedIn">in</button>
                  <button className="art-share-btn" aria-label="Lien">⎘</button>
                </div>
              </div>
            </aside>
          )}

          {/* MAIN CONTENT */}
          <article className="art-content">

            {/* INTRO */}
            <section id="intro">
              <p className="art-lead">
                Quand vous tapez <b>« Bordeaux · 95 m² · DPE C »</b> dans LocaliseImmo, la carte affiche en quelques secondes les emplacements compatibles. Ce qui se passe entre les deux mérite d'être expliqué — surtout parce que toutes les sources de données françaises ne se valent pas.
              </p>
              <p>
                LocaliseImmo croise <b>deux sources publiques</b> pour géolocaliser une annonce. L'une est fiable au mètre carré près. L'autre dépend du calendrier de publication de l'ADEME. Voici précisément ce qu'on utilise, ce qu'on garantit, et ce qu'on ne garantit pas.
              </p>
            </section>

            {/* 1. Parcelle */}
            <h2 id="parcelle">1. La parcelle cadastrale — notre source principale</h2>
            <p>
              <b>Ce qu'on utilise.</b> La base cadastrale officielle française, mise à disposition par la <b>DGFiP</b> (Direction Générale des Finances Publiques) via l'<b>IGN</b>. Chaque parcelle du territoire a une géométrie tracée par les géomètres, une référence unique (section + numéro), et une surface mesurée — pas estimée.
            </p>
            <p>
              C'est cette surface en m² qui sert de <b>filtre principal</b> à LocaliseImmo. Quand vous indiquez « 450 m² ±2% », nous interrogeons toutes les parcelles de la commune dont la surface tombe entre 441 et 459 m². La précision est centimétrique.
            </p>

            <ArtCallout kind="retenir" title="À retenir">
              La surface cadastrale est une donnée publique, légalement opposable et mise à jour mensuellement par la DGFiP. C'est <b>la source la plus fiable</b> à laquelle LocaliseImmo a accès. Quand l'annonce et le cadastre divergent, c'est l'annonce qui ment.
            </ArtCallout>

            {/* Filtre */}
            <h2 id="filtre">Comment on filtre le bruit</h2>
            <p>
              Le territoire français compte environ <b>100 millions de parcelles cadastrales</b>. Une commune moyenne en a plusieurs milliers. Si on les remontait toutes, vous noieriez sous les champs, les terrains nus et les parcelles techniques (réseaux, voirie).
            </p>
            <p>
              LocaliseImmo applique un <b>pré-filtre bâti</b> : nous croisons les polygones cadastraux avec la <b>BD TOPO IGN</b> (la couche officielle des bâtiments français). Si aucun bâtiment n'est présent sur une parcelle, nous l'écartons des résultats par défaut.
            </p>
            <p>
              Concrètement, ce filtre <b>élimine environ 60% du bruit</b> sur une commune typique. Vous voyez seulement des parcelles susceptibles d'abriter une annonce immobilière.
            </p>

            <ArtTryLocaliseImmo/>

            {/* 2. DPE */}
            <h2 id="dpe">2. Le DPE énergie — notre source secondaire</h2>
            <p>
              <b>Ce qu'on utilise.</b> La base ADEME des Diagnostics de Performance Énergétique déposés depuis juillet 2021. Chaque DPE est rattaché à une adresse postale et porte une classe énergétique (A à G), une classe GES (gaz à effet de serre), une consommation en kWh/m²/an et une date.
            </p>
            <p>
              Quand vous indiquez <b>DPE C</b> dans le formulaire, LocaliseImmo écarte les biens dont le DPE déclaré ne correspond pas. C'est un filtre <b>secondaire</b> — il affine, il ne décide pas.
            </p>

            {/* Diagram — kept as a schematic (explanatory, not decorative) */}
            <figure className="art-figure">
              <SourceDiagram/>
              <figcaption>Schéma du croisement : la parcelle filtrée par surface croise le DPE pour produire un résultat unique.</figcaption>
            </figure>

            {/* Inline photo — user-fillable */}
            <figure className="art-photo">
              <image-slot
                id="art-photo-quartier"
                shape="rect"
                radius="16"
                placeholder="Photo d'un quartier résidentiel typique. Glissez-déposez ici."
                style={{ aspectRatio: '16/10', display: 'block' }}
              ></image-slot>
              <figcaption>Une rue résidentielle typique — ce que vous voyez vraiment en activant la vue satellite.</figcaption>
            </figure>

            {/* ADEME */}
            <h2 id="ademe">Le rythme de l'ADEME</h2>
            <p>
              L'ADEME publie sa base de DPE <b>hebdomadairement</b> — en théorie. Dans les faits, le calendrier dépend de leurs ressources internes. Il y a des semaines où la publication saute. Quand cela arrive, nous le détectons et le signalons.
            </p>
            <p>
              LocaliseImmo synchronise dans la foulée de chaque publication, généralement dans les <b>24 heures</b>. Nous l'indiquons explicitement dans l'app : la date de la dernière synchronisation ADEME est visible dans l'en-tête des résultats.
            </p>

            <ArtCallout kind="attention" title="Attention">
              Le DPE est saisi par un diagnostiqueur privé. Les erreurs de saisie existent. Tous les biens en vente n'ont pas un DPE publié (vente urgente, location longue durée déjà en cours…). L'adresse rattachée au DPE peut différer du libellé cadastral.
              <br/><br/>
              <b>En cas de doute, fiez-vous toujours à la surface cadastrale.</b>
            </ArtCallout>

            {/* Matching */}
            <h2 id="matching">Comment on croise les deux</h2>
            <p>
              Le moteur LocaliseImmo procède en trois étapes :
            </p>
            <ol className="art-ol">
              <li><b>Filtre surface.</b> Toutes les parcelles construites de la commune dont la surface tombe dans la fourchette tolérée sont retenues.</li>
              <li><b>Filtre DPE (si renseigné).</b> Les biens dont la classe énergétique déclarée diverge sont écartés. Le matching d'adresse cadastre↔DPE est tolérant (numéro bis, libellé approximatif).</li>
              <li><b>Tri par score.</b> Les résultats restants sont triés par proximité à la surface annoncée, avec un bonus si le DPE correspond exactement.</li>
            </ol>
            <p>
              Tout est calculé <b>côté navigateur</b>. Vos requêtes (commune, surface, DPE) ne quittent jamais votre machine. Nous n'avons pas de logs côté serveur.
            </p>

            {/* À retenir */}
            <h2 id="retenir">À retenir</h2>
            <ul className="art-bullets">
              <li><b>La parcelle cadastrale est notre source la plus fiable.</b> Surface, géométrie, référence : tout vient de la DGFiP.</li>
              <li><b>Nous pré-filtrons les parcelles non construites</b> en croisant avec la BD TOPO IGN — environ 60% du bruit éliminé.</li>
              <li><b>Le DPE est utile pour affiner, jamais comme source unique.</b> L'ADEME publie quand elle peut.</li>
              <li><b>En cas de doute, fiez-vous toujours à la surface cadastrale.</b> C'est elle qui détermine le bien — pas le diagnostic énergétique.</li>
            </ul>

            {/* FAQ */}
            <h2 id="faq">Questions fréquentes</h2>
            <div className="art-faq">
              {ART_FAQ.map((f, i) => (
                <ArtFaqItem key={i} idx={i} q={f.q} a={f.a} open={openFaq === i} onToggle={(x) => setOpenFaq(openFaq === x ? -1 : x)}/>
              ))}
            </div>

            {/* CTA */}
            <section className="art-final-cta">
              <h3>Prêt à géolocaliser votre prochaine annonce ?</h3>
              <p>Commune + surface + DPE. La parcelle exacte en 30 secondes — gratuitement, sans inscription.</p>
              <button className="art-cta-btn">Ouvrir LocaliseImmo <Icons.ArrowRight s={14}/></button>
            </section>

            {/* AUTHOR */}
            <div className="art-author">
              <div className="art-author-avatar">SI</div>
              <div>
                <div className="art-author-name">L'équipe LocaliseImmo</div>
                <p>LocaliseImmo est un outil gratuit de géolocalisation d'annonces immobilières, basé sur les données publiques françaises (IGN, DGFiP, Etalab, ADEME). Projet personnel, indépendant, financé par publicité sur les articles.</p>
              </div>
            </div>
          </article>
        </div>
      </div>

      {/* RELATED ARTICLES */}
      <div className={wrap}>
        <section className="art-related">
          <div className="art-related-head">
            <div className="lp-sec-eyebrow">Sur le même thème</div>
            <h2 className="cm-h2">À lire ensuite</h2>
          </div>
          <div className="art-related-grid" data-device={device}>
            {ART_RELATED.map((r, i) => (
              <article className="art-related-card" key={i}>
                <span className="art-related-tag">{r.tag}</span>
                <h3>{r.title}</h3>
                <span className="art-related-read">{r.read}</span>
              </article>
            ))}
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

window.Article = Article;
