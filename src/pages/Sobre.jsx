import React from 'react';
import MetaTags from '../components/MetaTags';
import { SITE } from '../config/site';

const Sobre = () => {
  return (
    <>
      <MetaTags
        title={`Sobre — ${SITE.name}`}
        description="Quem somos, nossa missão e nossos princípios editoriais."
        url={typeof window !== 'undefined' ? window.location.href : undefined}
      />

      <div className="container mt-4 mb-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold">Sobre o {SITE.name}</h1>
              <p className="lead text-muted">Uma visão crítica sobre a nossa realidade</p>
            </div>

            <div className="article-content">
              <h2>Nossa missão</h2>
              <p>
                O {SITE.name} nasce como um meio diferente de informar e debater a realidade
                da Baixada Santista e as questões nacionais e internacionais que afetam as
                nossas vidas.
              </p>

              <h3>Nossos objetivos</h3>
              <ul>
                <li>Oferecer notícias atualizadas e confiáveis para a população local</li>
                <li>Analisar a realidade sob a ótica dos trabalhadores e trabalhadoras</li>
                <li>Fazer denúncias dos problemas que afligem nossas vidas</li>
                <li>Promover debates sobre política, cultura e esporte</li>
                <li>Combater visões racistas, machistas, homofóbicas e higienistas</li>
              </ul>

              <h3>Nossa identidade</h3>
              <p>
                O {SITE.name} é um veículo com opinião e objetividade, diferenciando-se das
                grandes mídias que tendem a favorecer a visão dos ricos e poderosos da região.
              </p>
              <p>
                Nossa equipe se dedica ao máximo para construir este importante e necessário
                instrumento de comunicação, sempre comprometida com a verdade e com os
                interesses da população trabalhadora.
              </p>
            </div>

            <div className="mt-4 pt-4 border-top text-muted">
              <small>
                Fale com a redação: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </small>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sobre;
