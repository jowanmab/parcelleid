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
      title: "Vous renseignez les paramètres de l'annonce",
      body: "Commune, surface, et la classe énergétique si vous l'avez. C'est tout ce qu'une annonce donne, c'est tout ce qu'on demande.",
      Illu: set[0],
    },
    {
      num: '02',
      title: 'On trouve la parcelle exacte',
      body: "LocaliseImmo croise ça avec les données officielles et le cadastre. Les maisons compatibles s'affichent sur la carte, à l'adresse près.",
      Illu: set[1],
    },
    {
      num: '03',
      title: 'Vous voyez tout du quartier',
      body: "Voisinage, commerces, transports, contraintes d'urbanisme, historique des ventes. De quoi vous projeter, ou éviter une visite inutile.",
      Illu: set[2],
    },
  ];

  return (
    <section className="lp-section" data-device={device}>
      <div className="lp-sec-head lp-sec-head--wide">
        <div className="lp-sec-eyebrow">Comment ça marche</div>
        <h2 className="lp-sec-title">Trois étapes, <em>zéro déplacement inutile.</em></h2>
        <p className="lp-sec-sub">Vérifiez avant de visiter. L'annonce dit beaucoup. L'emplacement dit le reste.</p>
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
