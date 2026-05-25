/* global React, Icons, HeroIllustration, HeroCartography, HeroForm, HowItWorks */

function Landing({ device = 'desktop', style = 'chaleureux', decor = 'personnages', energy = 'aere', animated = false }) {
  const wrap = device === 'desktop' ? 'lp-wrap-desktop' : 'lp-wrap-mobile';
  const HeroIllu = decor === 'cartographie' ? HeroCartography : HeroIllustration;
  const showIllu = decor !== 'minimal';
  const illuProps = decor === 'cartographie' ? {} : { animated };

  return (
    <div className="lp" data-device={device} data-palette="sage" data-style={style} data-decor={decor} data-energy={energy}>
      {/* NAV */}
      <div className={wrap}>
        <nav className="lp-nav" data-device={device}>
          <div className="lp-logo">
            <img src="./assets/logo-mark.svg" alt=""/>
            <span className="word">Localise<span className="b">Immo</span></span>
          </div>
          {device === 'desktop' && (
            <div className="lp-nav-links">
              <a href="./comment-ca-marche.html">Comment ça marche</a>
              <a href="./sources.html">Sources</a>
              <a href="./blog.html">Blog</a>
              <a href="#" onClick={(e)=>e.preventDefault()}>Tarifs</a>
            </div>
          )}
          <div className="lp-nav-spacer"></div>
          {device === 'desktop' ? (
            <button className="lp-nav-cta">Connexion <Icons.ArrowRight s={14}/></button>
          ) : (
            <button className="lp-nav-burger">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>
            </button>
          )}
        </nav>
      </div>

      {/* HERO */}
      <div className={wrap}>
        <section className="lp-hero" data-device={device}>
          {device === 'mobile' ? (
            <>
              {/* MOBILE, form is what we see first, the rest comes after */}
              <div>
                <HeroForm device={device}/>
              </div>

              <div className="lp-hero-copy lp-hero-copy-tight" style={{ marginTop: 28 }}>
                <h1>Retrouvez <em>l'adresse exacte</em> de l'annonce immo que vous regardez.</h1>
              </div>

              <div className="lp-trust-row" style={{ marginTop: 18 }}>
                <span className="item"><span className="dot"></span>Données IGN officielles</span>
                <span className="item"><span className="dot"></span>35 000 communes</span>
                <span className="item"><span className="dot"></span>~30 s par recherche</span>
              </div>

              {showIllu && (
                <div className="lp-hero-illu" data-device={device} style={{ marginTop: 24 }}>
                  <div className="lp-illu-frame" data-device={device}>
                    <HeroIllu {...illuProps}/>
                  </div>
                </div>
              )}

              <p className="lead" style={{ marginTop: 22 }}>
                On localise le bien à partir de la <b>surface du terrain</b> et des <b>infos de la maison</b>.
              </p>
              <p className="lp-lead-tip">
                <strong>Astuce</strong> : la surface cadastrale est souvent la plus fiable : elle ne change pas dans le temps, contrairement à une maison qu'on peut agrandir.
              </p>
            </>
          ) : (
            <>
              {/* DESKTOP, copy left, form right */}
              <div className="lp-hero-copy">
                <span className="lp-hero-eyebrow">
                  <span className="lp-hero-eyebrow-dot"></span>
                  Géolocalisation d'annonces immo
                </span>
                <h1>Retrouvez <em>l'adresse exacte</em> de l'annonce immo que vous regardez.</h1>
                <p className="lead">On localise le bien à partir de la <b>surface du terrain</b> et des <b>infos de la maison</b>.</p>
                <p className="lp-lead-tip"><strong>Astuce</strong> : la surface cadastrale est souvent la donnée la plus fiable : elle ne change pas dans le temps, contrairement à une maison qu'on peut agrandir.</p>
                <div className="lp-trust-row">
                  <span className="item"><span className="dot"></span>Données IGN officielles</span>
                  <span className="item"><span className="dot"></span>35 000 communes couvertes</span>
                  <span className="item"><span className="dot"></span>~30 s par géolocalisation</span>
                </div>
              </div>
              <div>
                <HeroForm device={device}/>
                {showIllu && (
                  <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center' }}>
                    <div className="lp-illu-frame" data-device="mobile" style={{ width: '100%', maxWidth: 480, aspectRatio: '1.4 / 1', borderRadius: 24 }}>
                      <HeroIllu {...illuProps}/>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {/* HOW IT WORKS */}
      <div className={wrap}>
        <HowItWorks device={device} decor={decor} animated={animated}/>
      </div>

      {/* FOOTER */}
      <div className={wrap} style={device === 'mobile' ? { paddingBottom: 96 } : null}>
        <footer className="lp-foot">
          <div className="lp-logo" style={{ marginBottom: 14 }}>
            <img src="./assets/logo-mark.svg" alt=""/>
            <span className="word">Localise<span className="b">Immo</span></span>
          </div>
          <div className="lp-foot-row">
            <a href="./comment-ca-marche.html">Comment ça marche</a>
            <a href="./sources.html">Sources & méthode</a>
            <a href="./blog.html">Blog</a>
            <a href="#" onClick={(e)=>e.preventDefault()}>Tarifs</a>
            <a href="#" onClick={(e)=>e.preventDefault()}>Mentions légales</a>
            <a href="mailto:contact@localiseimmo.fr">Contact</a>
          </div>
          <div className="legal">
            Données cadastrales : IGN · Cadastre officiel français, Licence Ouverte Etalab. LocaliseImmo n'est pas affilié à un organisme public.
          </div>
        </footer>
      </div>

      {/* FLOATING CTA, mobile only, follows scroll, always tappable */}
      {device === 'mobile' && (
        <div className="lp-fab-wrap" aria-hidden="false">
          <button className="lp-fab" type="button">
            <span className="lp-fab-label">Géolocaliser l'annonce</span>
            <span className="lp-fab-arrow"><Icons.ArrowRight s={16}/></span>
          </button>
        </div>
      )}
    </div>
  );
}

window.Landing = Landing;
