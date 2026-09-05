import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaEye, FaSync, FaYoutube } from 'react-icons/fa';
import { getAllPosts, deletePost } from '../../lib/postsService';
import { requestRepublish } from '../../lib/republish';
import { slugify } from '../../utils/textUtils';
import { useToast, useConfirm } from '../components/AdminFeedback';

const AdminNoticias = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [republishing, setRepublishing] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const posts = await getAllPosts();
      setPosts(posts);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      toast.error('Erro ao carregar as notícias.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    const ok = await confirm({
      title: 'Excluir notícia',
      message: 'Tem certeza que deseja excluir esta notícia? Esta ação não pode ser desfeita.',
      confirmLabel: 'Excluir',
      variant: 'danger'
    });
    if (!ok) return;

    try {
      const deleted = await deletePost(postId);
      if (deleted) {
        toast.success('Notícia excluída.');
        loadPosts();
      } else {
        toast.error('Não foi possível excluir esta notícia.');
      }
    } catch (error) {
      console.error('Erro ao excluir post:', error);
      toast.error('Erro ao excluir a notícia: ' + error.message);
    }
  };

  const handleRepublish = async () => {
    setRepublishing(true);
    try {
      await requestRepublish();
      toast.success('Republicação do site iniciada. Fica no ar em ~2 min.');
    } catch (error) {
      toast.error('Erro ao republicar: ' + error.message);
    } finally {
      setRepublishing(false);
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
        <h2 className="text-light">Gerenciar Notícias</h2>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-light"
            onClick={handleRepublish}
            disabled={republishing}
            title="Regera o site público com o conteúdo atual"
          >
            <FaSync className="me-2" />
            {republishing ? 'Republicando...' : 'Republicar site'}
          </button>
          <Link to="/admin/noticias/nova?tipo=video" className="btn btn-outline-light">
            <FaYoutube className="me-2" />
            Novo Vídeo
          </Link>
          <Link to="/admin/noticias/nova" className="btn btn-primary">
            <FaPlus className="me-2" />
            Nova Notícia
          </Link>
        </div>
      </div>

      <div className="card bg-dark text-light border-secondary">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover table-dark">
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
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">Nenhuma notícia encontrada.</td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id}>
                      <td>
                        <div>
                          <div className="fw-semibold">{post.title}</div>
                          <small className="text-muted">{post.excerpt}</small>
                        </div>
                      </td>
                      <td>
                        {Array.isArray(post.categories) && post.categories.length > 0 ? (
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
                            to={`/noticia/${post.slug || slugify(post.title || post.id || '')}`} 
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNoticias; 