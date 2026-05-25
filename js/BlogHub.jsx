/* global React, Icons */

const HUB_ARTICLES = [
  {
    cat: 'Méthodologie',
    title: "D'où viennent les données de LocaliseImmo ?",
    excerpt: "Parcelle cadastrale et DPE — deux sources, deux niveaux de fiabilité. Ce qu'on utilise, et pourquoi nous le disons.",
    date: '16 mai 2026', read: '8 min', featured: true,
  },
  {
    cat: 'Guide pratique',
    title: "Lire un DPE avant achat : les 4 chiffres qui comptent",
    excerpt: "Classe énergie, classe GES, consommation, date. Comprendre ce qu'un DPE révèle vraiment du logement.",
    date: '12 mai 2026', read: '5 min',
  },
  {
    cat: 'Urbanisme',
    title: "Qu'est-ce qu'un PLU et où le consulter gratuitement ?",
    excerpt: "Le Plan Local d'Urbanisme détermine ce qui peut être construit. Voici comment le lire avant d'acheter.",
    date: '8 mai 2026', read: '9 min',
  },
  {
    cat: 'Méthodologie',
    title: "BD TOPO IGN : comment LocaliseImmo détecte les parcelles construites",
    excerpt: "Le pré-filtre qui élimine 60% du bruit avant que vous ne voyiez les résultats.",
    date: '4 mai 2026', read: '6 min',
  },
  {
    cat: 'Guide pratique',
    title: "Vérifier la surface d'une annonce : Carrez vs cadastre vs habitable",
    excerpt: "Trois mesures, trois résultats différents — et seulement une qui fait foi juridiquement.",
    date: '28 avril 2026', read: '7 min',
  },
  {
    cat: 'Marché',
    title: "DVF : comment lire l'historique des ventes près d'un bien",
    excerpt: "La base publique des Demandes de Valeurs Foncières, expliquée. Sans inscription, sans paywall.",
    date: '22 avril 2026', read: '10 min',
  },
];

const HUB_CATS = ['Tous', 'Méthodologie', 'Guide pratique', 'Urbanisme', 'Marché'];

function BlogHub({ device = 'desktop', style = 'chaleureux', decor = 'personnages', energy = 'aere' }) {
  const wrap = device === 'desktop' ? 'lp-wrap-desktop' : 'lp-wrap-mobile';
  const featured = HUB_ARTICLES.find(a => a.featured);
  const rest = HUB_ARTICLES.filter(a => !a.featured);

  return (
    <div className="lp hub" data-device={device} data-palette="sage" data-style={style} data-decor={decor} data-energy={energy}>
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

      {/* HUB HEADER */}
      <div className={wrap}>
        <header className="hub-header">
          <span className="lp-hero-eyebrow"><span className="lp-hero-eyebrow-dot"></span>Le blog LocaliseImmo</span>
          <h1 className="cm-h1">Tout ce qu'il faut savoir <em>avant d'acheter.</em></h1>
          <p className="cm-lead">
            Guides pratiques, décryptages, méthodes. Le blog LocaliseImmo explique simplement les données publiques françaises qui font foi sur l'immobilier — pour que vous achetiez en connaissance de cause.
          </p>
        </header>
      </div>

      {/* CATEGORIES */}
      <div className={wrap}>
        <div className="hub-cats">
          {HUB_CATS.map((c, i) => (
            <button key={c} className={"hub-cat" + (i === 0 ? ' active' : '')}>{c}</button>
          ))}
        </div>
      </div>

      {/* FEATURED */}
      <div className={wrap}>
        <article className="hub-featured" data-device={device}>
          <div className="hub-featured-cover">
            <image-slot
              id="hub-featured-cover"
              shape="rounded"
              radius="24"
              placeholder="Photo de l'article featured. Glissez-déposez ici."
              style={{ width: '100%', height: '100%', display: 'block' }}
            ></image-slot>
          </div>
          <div className="hub-featured-body">
            <span className="hub-featured-tag">À LA UNE</span>
            <span className="hub-cat-chip">{featured.cat}</span>
            <h2>{featured.title}</h2>
            <p>{featured.excerpt}</p>
            <div className="hub-meta">
              <span>{featured.date}</span>
              <span className="hub-meta-sep">·</span>
              <span>{featured.read} de lecture</span>
            </div>
            <button className="hub-read-btn">Lire l'article <Icons.ArrowRight s={14}/></button>
          </div>
        </article>
      </div>

      {/* GRID */}
      <div className={wrap}>
        <section className="hub-grid-wrap">
          <div className="hub-grid-head">
            <h2 className="cm-h2">Tous les articles</h2>
            <div className="hub-sort">
              <span>Tri</span>
              <button>Plus récents <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></button>
            </div>
          </div>
          <div className="hub-grid" data-device={device}>
            {rest.map((a, i) => (
              <article className="hub-card" key={i}>
                <div className="hub-card-thumb">
                  <image-slot
                    id={"hub-card-" + i}
                    shape="rounded"
                    radius="12"
                    placeholder={"Photo : " + a.cat.toLowerCase()}
                    style={{ width: '100%', height: '100%', display: 'block' }}
                  ></image-slot>
                </div>
                <span className="hub-cat-chip">{a.cat}</span>
                <h3>{a.title}</h3>
                <p>{a.excerpt}</p>
                <div className="hub-meta">
                  <span>{a.date}</span>
                  <span className="hub-meta-sep">·</span>
                  <span>{a.read}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* NEWSLETTER */}
      <div className={wrap}>
        <section className="hub-newsletter">
          <div className="hub-newsletter-inner">
            <h3>Un article par mois, dans votre boîte mail.</h3>
            <p>Pas de spam, pas de revente. Juste les nouveaux articles LocaliseImmo.</p>
            <div className="hub-newsletter-form">
              <input className="lp-input" placeholder="votre@email.fr" type="email"/>
              <button className="lp-form-cta" style={{ marginTop: 0, width: 'auto' }}>S'abonner <span className="arrow"><Icons.ArrowRight s={14}/></span></button>
            </div>
            <small>Vous pouvez vous désabonner en un clic.</small>
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

window.BlogHub = BlogHub;
