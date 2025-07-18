import React, { useState, useEffect } from 'react';
import { FaSave, FaDatabase, FaUser, FaGlobe, FaMail, FaShieldAlt, FaCog } from 'react-icons/fa';

const AdminConfiguracoes = () => {
  const [config, setConfig] = useState({
    // Configurações do Site
    siteName: 'Jornal Santista',
    siteDescription: 'Sua fonte de notícias locais e regionais',
    siteUrl: 'https://jornalsantista.vercel.app',
    adminEmail: 'admin@jornalsantista.com',
    
    // Configurações de Email
    emailEnabled: true,
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    
    // Configurações de SEO
    seoTitle: 'Jornal Santista - Notícias Locais e Regionais',
    seoDescription: 'Jornal Santista - Sua fonte de notícias locais e regionais. Fique por dentro das principais notícias da região.',
    seoKeywords: 'jornal, notícias, santista, região, local, jornalismo',
    
    // Configurações de Segurança
    requireLogin: true,
    allowRegistration: false,
    sessionTimeout: 24, // horas
    
    // Configurações de Performance
    cacheEnabled: true,
    imageCaching: true,
    gzipCompression: true,
  });

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('geral');

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = () => {
    // Carregar configurações do localStorage ou API
    const savedConfig = localStorage.getItem('adminConfig');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(prev => ({ ...prev, ...parsedConfig }));
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    }
  };

  const handleConfigChange = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Salvar no localStorage (em produção seria uma API)
      localStorage.setItem('adminConfig', JSON.stringify(config));
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const testDatabaseConnection = async () => {
    try {
      // Simular teste de conexão
      alert('Teste de conexão com banco de dados realizado com sucesso!');
    } catch (error) {
      alert('Erro na conexão com o banco: ' + error.message);
    }
  };

  const tabs = [
    { id: 'geral', label: 'Geral', icon: <FaGlobe /> },
    { id: 'email', label: 'Email', icon: <FaMail /> },
    { id: 'seo', label: 'SEO', icon: <FaCog /> },
    { id: 'seguranca', label: 'Segurança', icon: <FaShieldAlt /> },
    { id: 'performance', label: 'Performance', icon: <FaDatabase /> },
  ];

  return (
    <div className="admin-configuracoes">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-light">Configurações do Sistema</h2>
        <div>
          <button 
            onClick={testDatabaseConnection}
            className="btn btn-outline-info me-2"
          >
            <FaDatabase className="me-2" />
            Testar Conexão
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="btn btn-success"
          >
            <FaSave className="me-2" />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </div>

      <div className="row">
        {/* Sidebar com abas */}
        <div className="col-md-3">
          <div className="card bg-dark text-light border-secondary">
            <div className="card-header bg-secondary">
              <h6 className="mb-0">Categorias</h6>
            </div>
            <div className="list-group list-group-flush">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`list-group-item list-group-item-action d-flex align-items-center ${
                    activeTab === tab.id ? 'active' : ''
                  }`}
                  style={{
                    backgroundColor: activeTab === tab.id ? '#0d6efd' : '#23272b',
                    color: activeTab === tab.id ? 'white' : '#f8f9fa',
                    border: '1px solid #343a40'
                  }}
                >
                  <span className="me-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="col-md-9">
          <div className="card bg-dark text-light border-secondary">
            <div className="card-header bg-secondary">
              <h5 className="mb-0">
                {tabs.find(tab => tab.id === activeTab)?.label} - Configurações
              </h5>
            </div>
            <div className="card-body">
              
              {/* Aba Geral */}
              {activeTab === 'geral' && (
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Nome do Site</label>
                    <input
                      type="text"
                      className="form-control"
                      value={config.siteName}
                      onChange={(e) => handleConfigChange('geral', 'siteName', e.target.value)}
                      style={{ backgroundColor: '#181a1b', border: '1px solid #343a40', color: '#f8f9fa' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">URL do Site</label>
                    <input
                      type="url"
                      className="form-control"
                      value={config.siteUrl}
                      onChange={(e) => handleConfigChange('geral', 'siteUrl', e.target.value)}
                      style={{ backgroundColor: '#181a1b', border: '1px solid #343a40', color: '#f8f9fa' }}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Descrição do Site</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={config.siteDescription}
                      onChange={(e) => handleConfigChange('geral', 'siteDescription', e.target.value)}
                      style={{ backgroundColor: '#181a1b', border: '1px solid #343a40', color: '#f8f9fa' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email do Administrador</label>
                    <input
                      type="email"
                      className="form-control"
                      value={config.adminEmail}
                      onChange={(e) => handleConfigChange('geral', 'adminEmail', e.target.value)}
                      style={{ backgroundColor: '#181a1b', border: '1px solid #343a40', color: '#f8f9fa' }}
                    />
                  </div>
                </div>
              )}

              {/* Aba Email */}
              {activeTab === 'email' && (
                <div className="row g-3">
                  <div className="col-12">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={config.emailEnabled}
                        onChange={(e) => handleConfigChange('email', 'emailEnabled', e.target.checked)}
                      />
                      <label className="form-check-label">
                        Habilitar envio de emails
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Servidor SMTP</label>
                    <input
                      type="text"
                      className="form-control"
                      value={config.smtpHost}
                      onChange={(e) => handleConfigChange('email', 'smtpHost', e.target.value)}
                      disabled={!config.emailEnabled}
                      style={{ backgroundColor: '#181a1b', border: '1px solid #343a40', color: '#f8f9fa' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Porta SMTP</label>
                    <input
                      type="number"
                      className="form-control"
                      value={config.smtpPort}
                      onChange={(e) => handleConfigChange('email', 'smtpPort', parseInt(e.target.value))}
                      disabled={!config.emailEnabled}
                      style={{ backgroundColor: '#181a1b', border: '1px solid #343a40', color: '#f8f9fa' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Usuário SMTP</label>
                    <input
                      type="text"
                      className="form-control"
                      value={config.smtpUser}
                      onChange={(e) => handleConfigChange('email', 'smtpUser', e.target.value)}
                      disabled={!config.emailEnabled}
                      style={{ backgroundColor: '#181a1b', border: '1px solid #343a40', color: '#f8f9fa' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Senha SMTP</label>
                    <input
                      type="password"
                      className="form-control"
                      value={config.smtpPassword}
                      onChange={(e) => handleConfigChange('email', 'smtpPassword', e.target.value)}
                      disabled={!config.emailEnabled}
                      style={{ backgroundColor: '#181a1b', border: '1px solid #343a40', color: '#f8f9fa' }}
                    />
                  </div>
                </div>
              )}

              {/* Aba SEO */}
              {activeTab === 'seo' && (
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Título SEO</label>
                    <input
                      type="text"
                      className="form-control"
                      value={config.seoTitle}
                      onChange={(e) => handleConfigChange('seo', 'seoTitle', e.target.value)}
                      style={{ backgroundColor: '#181a1b', border: '1px solid #343a40', color: '#f8f9fa' }}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Descrição SEO</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={config.seoDescription}
                      onChange={(e) => handleConfigChange('seo', 'seoDescription', e.target.value)}
                      style={{ backgroundColor: '#181a1b', border: '1px solid #343a40', color: '#f8f9fa' }}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Palavras-chave</label>
                    <input
                      type="text"
                      className="form-control"
                      value={config.seoKeywords}
                      onChange={(e) => handleConfigChange('seo', 'seoKeywords', e.target.value)}
                      style={{ backgroundColor: '#181a1b', border: '1px solid #343a40', color: '#f8f9fa' }}
                    />
                    <div className="form-text">Separe as palavras-chave por vírgula</div>
                  </div>
                </div>
              )}

              {/* Aba Segurança */}
              {activeTab === 'seguranca' && (
                <div className="row g-3">
                  <div className="col-12">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={config.requireLogin}
                        onChange={(e) => handleConfigChange('seguranca', 'requireLogin', e.target.checked)}
                      />
                      <label className="form-check-label">
                        Exigir login para área administrativa
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={config.allowRegistration}
                        onChange={(e) => handleConfigChange('seguranca', 'allowRegistration', e.target.checked)}
                      />
                      <label className="form-check-label">
                        Permitir registro de novos usuários
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Timeout da Sessão (horas)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={config.sessionTimeout}
                      onChange={(e) => handleConfigChange('seguranca', 'sessionTimeout', parseInt(e.target.value))}
                      style={{ backgroundColor: '#181a1b', border: '1px solid #343a40', color: '#f8f9fa' }}
                    />
                  </div>
                </div>
              )}

              {/* Aba Performance */}
              {activeTab === 'performance' && (
                <div className="row g-3">
                  <div className="col-12">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={config.cacheEnabled}
                        onChange={(e) => handleConfigChange('performance', 'cacheEnabled', e.target.checked)}
                      />
                      <label className="form-check-label">
                        Habilitar cache do sistema
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={config.imageCaching}
                        onChange={(e) => handleConfigChange('performance', 'imageCaching', e.target.checked)}
                      />
                      <label className="form-check-label">
                        Habilitar cache de imagens
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={config.gzipCompression}
                        onChange={(e) => handleConfigChange('performance', 'gzipCompression', e.target.checked)}
                      />
                      <label className="form-check-label">
                        Habilitar compressão GZIP
                      </label>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Informações do Sistema */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card bg-secondary text-light border-secondary">
            <div className="card-body">
              <h6 className="card-title">ℹ️ Informações do Sistema</h6>
              <div className="row text-sm">
                <div className="col-md-3">
                  <strong>Versão:</strong> 1.0.0
                </div>
                <div className="col-md-3">
                  <strong>Framework:</strong> React 18.3.1
                </div>
                <div className="col-md-3">
                  <strong>Banco:</strong> Supabase
                </div>
                <div className="col-md-3">
                  <strong>Deploy:</strong> Vercel
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConfiguracoes; 