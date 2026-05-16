/* global React, Step1Illustration, Step2Illustration, Step3Illustration, Step1Cartography, Step2Cartography, Step3Cartography */

function HowItWorks({ device = 'desktop', decor = 'personnages', animated = false }) {
  const set = decor === 'cartographie'
    ? [Step1Cartography, Step2Cartography, Step3Cartography]
    : [Step1Illustration, Step2Illustration, Step3Illustration];
  const showIllu = decor !== 'minimal';
  const illuProps = decor === 'cartographie' ? {} : { animated };
  const steps = [
    {
      num: '01',
      title: 'Vous renseignez l\'annonce',
      body: "Commune, surface, tolérance, et — si vous l'avez — la classe énergétique. Les seuls champs qu'une annonce immo donne toujours.",
      Illu: set[0],
    },
    {
      num: '02',
      title: 'On géolocalise le bien',
      body: "ScanImmo croise vos critères avec le cadastre officiel et l'imagerie satellite IGN. Les biens compatibles s'affichent sur la carte, avec leur emplacement précis.",
      Illu: set[1],
    },
    {
      num: '03',
      title: 'Vous voyez tout du quartier',
      body: "Voisinage, commerces, transports, contraintes d'urbanisme, historique des ventes. L'annonce vendait un bien — vous voyez maintenant le quartier.",
      Illu: set[2],
    },
  ];

  return (
    <section className="lp-section" data-device={device}>
      <div className="lp-sec-head">
        <div className="lp-sec-eyebrow">Comment ça marche</div>
        <h2 className="lp-sec-title">Trois étapes, <em>zéro friction.</em></h2>
        <p className="lp-sec-sub">Pas de compte, pas de carte bleue. Les mêmes données de localisation que les agents immobiliers — directement dans votre navigateur.</p>
      </div>

      <div className="lp-steps" data-device={device}>
        {steps.map((s) => (
          <div className="lp-step" key={s.num}>
            <span className="lp-step-num">{s.num}</span>
            {showIllu && <div className="lp-step-illu"><s.Illu {...illuProps}/></div>}
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </div>
        ))}
      </div>

      <div className="lp-trust-band" data-device={device}>
        <span className="label">Sources officielles</span>
        <div className="sources">
          <span className="src">IGN <span className="badge">Géoportail</span></span>
          <span className="src">Cadastre <span className="badge">DGFiP</span></span>
          <span className="src">DVF <span className="badge">Etalab</span></span>
          <span className="src">PLU <span className="badge">Géorisques</span></span>
        </div>
      </div>
    </section>
  );
}

window.HowItWorks = HowItWorks;
