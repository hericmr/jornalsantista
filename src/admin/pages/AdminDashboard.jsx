import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaNewspaper, FaTags, FaEye, FaEdit, FaTrash, FaPlus, FaCog } from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalNews: 0,
    totalCategories: 0,
    recentNews: []
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/blog_posts.json');
      const news = await response.json();
      
      // Extrair categorias únicas
      const categories = new Set();
      news.forEach(post => {
        if (post.categories) {
          post.categories.forEach(cat => categories.add(cat));
        }
      });

      // Pegar notícias mais recentes
      const recentNews = news
        .sort((a, b) => new Date(b.published) - new Date(a.published))
        .slice(0, 5);

      setStats({
        totalNews: news.length,
        totalCategories: categories.size,
        recentNews
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Dashboard</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <div className="btn-group me-2">
            <Link to="/admin/noticias" className="btn btn-sm btn-outline-primary">
              Gerenciar Notícias
            </Link>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="row g-4">
        <div className="col-md-6 col-lg-3">
          <div className="card stat-card">
            <div className="card-body text-center">
              <div className="stat-icon">
                <FaNewspaper />
              </div>
              <h3 className="stat-number">{stats.totalNews}</h3>
              <p className="stat-label">Total de Notícias</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 col-lg-3">
          <div className="card stat-card">
            <div className="card-body text-center">
              <div className="stat-icon">
                <FaTags />
              </div>
              <h3 className="stat-number">{stats.totalCategories}</h3>
              <p className="stat-label">Categorias</p>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card text-white bg-info">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h5 className="card-title">Notícias Hoje</h5>
                  <h2 className="mb-0">
                    {stats.recentNews.filter(news => {
                      const today = new Date().toDateString();
                      const newsDate = new Date(news.published).toDateString();
                      return today === newsDate;
                    }).length}
                  </h2>
                </div>
                <div className="align-self-center">
                  <span style={{ fontSize: '2rem' }}>📅</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card text-white bg-warning">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h5 className="card-title">Ações Rápidas</h5>
                  <p className="mb-0">Gerenciar conteúdo</p>
                </div>
                <div className="align-self-center">
                  <span style={{ fontSize: '2rem' }}>⚡</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notícias Recentes */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Notícias Recentes</h5>
            </div>
            <div className="card-body">
              {stats.recentNews.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Título</th>
                        <th>Autor</th>
                        <th>Data</th>
                        <th>Categorias</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentNews.map((news) => (
                        <tr key={news.id}>
                          <td>
                            <div className="fw-semibold">{news.title}</div>
                            <small className="text-muted">
                              {news.text_content.substring(0, 100)}...
                            </small>
                          </td>
                          <td>{news.author}</td>
                          <td>
                            {new Date(news.published).toLocaleDateString('pt-BR')}
                          </td>
                          <td>
                            {news.categories && news.categories.length > 0 ? (
                              news.categories.map((cat, index) => (
                                <span key={index} className="badge bg-secondary me-1">
                                  {cat}
                                </span>
                              ))
                            ) : (
                              <span className="text-muted">Sem categoria</span>
                            )}
                          </td>
                          <td>
                            <Link 
                              to={`/admin/noticias/editar/${news.id}`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              Editar
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-muted">Carregando notícias...</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Ações Rápidas</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link to="/admin/noticias" className="btn btn-primary">
                  <FaNewspaper className="me-2" />
                  Ver Todas as Notícias
                </Link>
                <Link to="/admin/categorias" className="btn btn-outline-primary">
                  <FaTags className="me-2" />
                  Gerenciar Categorias
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Configurações</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link to="/admin/configuracoes" className="btn btn-outline-secondary">
                  <FaCog className="me-2" />
                  Configurações
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 