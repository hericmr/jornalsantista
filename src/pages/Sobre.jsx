import React, { useState, useEffect } from 'react';

const Sobre = () => {
  const [sobrePost, setSobrePost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSobrePost();
  }, []);

  const fetchSobrePost = async () => {
    try {
      const response = await fetch('/blog_posts.json');
      const data = await response.json();
      const sobre = data.find(post => post.title === 'Sobre o Jornal');
      setSobrePost(sobre);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar post sobre:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold">Sobre o Jornal Santista</h1>
            <p className="lead text-muted">
              Uma visão crítica sobre a nossa realidade
            </p>
          </div>

          {sobrePost ? (
            <div className="card shadow-sm">
              <div className="card-body p-5">
                <div className="article-content">
                  {sobrePost.text_content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-3">
                      {paragraph}
                    </p>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-top text-muted">
                  <small>
                    Por {sobrePost.author} • 
                    Publicado em {new Date(sobrePost.published).toLocaleDateString('pt-BR')}
                  </small>
                </div>
              </div>
            </div>
          ) : (
            <div className="card shadow-sm">
              <div className="card-body p-5">
                <h2>Nossa Missão</h2>
                <p>
                  O Jornal Santista nasce como um meio diferente de informar e debater 
                  a realidade da Baixada Santista e as questões nacionais e internacionais 
                  que afetam as nossas vidas.
                </p>
                
                <h3>Nossos Objetivos</h3>
                <ul>
                  <li>Oferecer notícias atualizadas e confiáveis para a população local</li>
                  <li>Analisar a realidade sob a ótica dos trabalhadores e trabalhadoras</li>
                  <li>Fazer denúncias dos problemas que afligem nossas vidas</li>
                  <li>Promover debates sobre política, cultura e esporte</li>
                  <li>Combater visões racistas, machistas, homofóbicas e higienistas</li>
                </ul>

                <h3>Nossa Identidade</h3>
                <p>
                  O Jornal Santista será um veículo com opinião e objetividade, 
                  diferenciando-se das grandes mídias que tendem a favorecer a visão 
                  dos ricos e poderosos da região.
                </p>

                <p>
                  Nossa equipe se dedica ao máximo para construir este importante 
                  e necessário instrumento de comunicação, sempre comprometida com 
                  a verdade e com os interesses da população trabalhadora.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sobre; 