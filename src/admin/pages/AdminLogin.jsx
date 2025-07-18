import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    
    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#1a1e23' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg border-0" style={{ backgroundColor: '#23272b', borderRadius: '12px' }}>
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-light">Jornal Santista</h2>
                  <p className="text-light opacity-75">Área Administrativa</p>
                </div>

                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="mb-3">
                    <label htmlFor="username" className="form-label text-light">
                      Usuário
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      disabled={loading}
                      style={{ 
                        backgroundColor: '#181a1b', 
                        border: '1px solid #343a40', 
                        color: '#f8f9fa' 
                      }}
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label text-light">
                      Senha
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      style={{ 
                        backgroundColor: '#181a1b', 
                        border: '1px solid #343a40', 
                        color: '#f8f9fa' 
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn w-100"
                    disabled={loading}
                    style={{
                      backgroundColor: '#0d6efd',
                      borderColor: '#0d6efd',
                      color: 'white',
                      padding: '0.75rem'
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Entrando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <a href="/" className="text-decoration-none text-light opacity-75 hover-opacity-100">
                    ← Voltar para o site
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 