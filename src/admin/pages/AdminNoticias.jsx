import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaEye } from 'react-icons/fa';
import { getAllPosts, deletePost } from '../../lib/postsService';

const AdminNoticias = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const posts = await getAllPosts();
      setPosts(posts);
      console.log('Posts carregados:', posts.length); // Debug
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Tem certeza que deseja excluir esta notícia?')) {
      try {
        const deleted = await deletePost(postId);
        if (deleted) {
          alert('Notícia excluída com sucesso!');
          loadPosts(); // Recarregar a lista
        } else {
          alert('Posts locais não podem ser excluídos via interface.');
        }
      } catch (error) {
        console.error('Erro ao excluir post:', error);
        alert('Erro ao excluir a notícia: ' + error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-noticias">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gerenciar Notícias</h2>
        <Link to="/admin/noticias/nova" className="btn btn-primary">
          <FaPlus className="me-2" />
          Nova Notícia
        </Link>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Categoria</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <div>
                        <div className="fw-semibold">{post.title}</div>
                        <small className="text-muted">{post.excerpt}</small>
                      </div>
                    </td>
                    <td>
                      {post.categories && post.categories.length > 0 ? (
                        post.categories.map((cat, index) => (
                          <span key={index} className="badge bg-secondary me-1">
                            {cat}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted">Sem categoria</span>
                      )}
                    </td>
                    <td>{post.published_at ? new Date(post.published_at).toLocaleDateString('pt-BR') : 'Não publicado'}</td>
                    <td>
                      <span className={`badge ${
                        post.status === 'published' ? 'bg-success' : 
                        post.status === 'draft' ? 'bg-warning' : 'bg-secondary'
                      }`}>
                        {post.status === 'published' ? 'Publicado' : 
                         post.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <Link 
                          to={`/noticia/${post.slug || post.id}`} 
                          className="btn btn-outline-info"
                          title="Visualizar"
                        >
                          <FaEye />
                        </Link>
                        <Link 
                          to={`/admin/noticias/editar/${post.id}`} 
                          className="btn btn-outline-primary"
                          title="Editar"
                        >
                          <FaEdit />
                        </Link>
                        <button 
                          onClick={() => handleDelete(post.id)}
                          className="btn btn-outline-danger"
                          title="Excluir"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNoticias; 