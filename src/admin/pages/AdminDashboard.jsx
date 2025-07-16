import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaNewspaper, FaTags, FaEye, FaEdit, FaTrash, FaPlus, FaCog, FaCalendar, FaBolt, FaDatabase } from 'react-icons/fa';
import { testSupabaseConnection, checkPostsTable } from '../../lib/testSupabase';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalNews: 0,
    totalCategories: 0,
    recentNews: []
  });
  const [dbStatus, setDbStatus] = useState('unknown');

  useEffect(() => {
    fetchStats();
    testDatabaseConnection();
  }, []);

  const testDatabaseConnection = async () => {
    try {
      setDbStatus('testing');
      const connectionOk = await testSupabaseConnection();
      const tableOk = await checkPostsTable();
      
      if (connectionOk && tableOk) {
        setDbStatus('connected');
      } else {
        setDbStatus('error');
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      setDbStatus('error');
    }
  };

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
          <div className="card stat-card">
            <div className="card-body text-center">
              <div className="stat-icon">
                <FaCalendar />
              </div>
              <h3 className="stat-number">
                {stats.recentNews.filter(news => {
                  const today = new Date().toDateString();
                  const newsDate = new Date(news.published).toDateString();
                  return today === newsDate;
                }).length}
              </h3>
              <p className="stat-label">Notícias Hoje</p>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card stat-card">
            <div className="card-body text-center">
              <div className="stat-icon">
                <FaDatabase />
              </div>
              <h3 className="stat-number">
                {dbStatus === 'connected' ? '✅' : 
                 dbStatus === 'testing' ? '🔄' : 
                 dbStatus === 'error' ? '❌' : '❓'}
              </h3>
              <p className="stat-label">
                {dbStatus === 'connected' ? 'Banco Conectado' : 
                 dbStatus === 'testing' ? 'Testando...' : 
                 dbStatus === 'error' ? 'Erro de Conexão' : 'Status Desconhecido'}
              </p>
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
        <div className="col-md-4">
          <Link to="/admin/noticias" className="text-decoration-none">
            <div className="card stat-card h-100 text-center hover-shadow">
              <div className="card-body d-flex flex-column align-items-center justify-content-center">
                <div className="stat-icon mb-2">
                  <FaNewspaper />
                </div>
                <h5 className="stat-label mb-1">Ver Todas as Notícias</h5>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-4">
          <Link to="/admin/categorias" className="text-decoration-none">
            <div className="card stat-card h-100 text-center hover-shadow">
              <div className="card-body d-flex flex-column align-items-center justify-content-center">
                <div className="stat-icon mb-2">
                  <FaTags />
                </div>
                <h5 className="stat-label mb-1">Gerenciar Categorias</h5>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-4">
          <Link to="/admin/configuracoes" className="text-decoration-none">
            <div className="card stat-card h-100 text-center hover-shadow">
              <div className="card-body d-flex flex-column align-items-center justify-content-center">
                <div className="stat-icon mb-2">
                  <FaCog />
                </div>
                <h5 className="stat-label mb-1">Configurações</h5>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 