import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { getAllPosts } from '../../lib/postsService';

const AdminCategorias = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const posts = await getAllPosts();
      
      // Extrair todas as categorias dos posts
      const categoryMap = new Map();
      
      posts.forEach(post => {
        if (post.categories && Array.isArray(post.categories)) {
          post.categories.forEach(cat => {
            if (cat && cat.trim()) {
              const categoryName = cat.trim();
              if (categoryMap.has(categoryName)) {
                categoryMap.set(categoryName, categoryMap.get(categoryName) + 1);
              } else {
                categoryMap.set(categoryName, 1);
              }
            }
          });
        }
      });

      // Converter para array ordenado
      const categoryArray = Array.from(categoryMap.entries()).map(([name, count]) => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        count,
        slug: name.toLowerCase().replace(/\s+/g, '-')
      })).sort((a, b) => b.count - a.count);

      setCategories(categoryArray);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory = {
        id: Date.now().toString(),
        name: newCategoryName.trim(),
        count: 0,
        slug: newCategoryName.toLowerCase().replace(/\s+/g, '-')
      };
      
      setCategories(prev => [...prev, newCategory]);
      setNewCategoryName('');
      setShowAddForm(false);
    }
  };

  const handleEditCategory = (categoryId, newName) => {
    if (newName.trim()) {
      setCategories(prev => 
        prev.map(cat => 
          cat.id === categoryId 
            ? { ...cat, name: newName.trim(), slug: newName.toLowerCase().replace(/\s+/g, '-') }
            : cat
        )
      );
      setEditingCategory(null);
    }
  };

  const handleDeleteCategory = (categoryId) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria? Esta ação não afetará os posts existentes.')) {
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-categorias">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-light">Gerenciar Categorias</h2>
        <button 
          onClick={() => setShowAddForm(true)} 
          className="btn btn-primary"
          disabled={showAddForm}
        >
          <FaPlus className="me-2" />
          Nova Categoria
        </button>
      </div>

      {/* Estatísticas */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card bg-dark text-light border-secondary">
            <div className="card-body text-center">
              <h3 className="text-primary">{categories.length}</h3>
              <p className="mb-0">Total de Categorias</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-dark text-light border-secondary">
            <div className="card-body text-center">
              <h3 className="text-success">
                {categories.reduce((sum, cat) => sum + cat.count, 0)}
              </h3>
              <p className="mb-0">Posts Categorizados</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-dark text-light border-secondary">
            <div className="card-body text-center">
              <h3 className="text-warning">
                {categories.length > 0 ? Math.round(categories.reduce((sum, cat) => sum + cat.count, 0) / categories.length) : 0}
              </h3>
              <p className="mb-0">Média por Categoria</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-dark text-light border-secondary">
            <div className="card-body text-center">
              <h3 className="text-info">
                {categories.length > 0 ? categories[0]?.name || 'N/A' : 'N/A'}
              </h3>
              <p className="mb-0">Mais Popular</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário de nova categoria */}
      {showAddForm && (
        <div className="card bg-dark text-light border-secondary mb-4">
          <div className="card-header bg-secondary">
            <h5 className="mb-0">Adicionar Nova Categoria</h5>
          </div>
          <div className="card-body">
            <div className="row align-items-end">
              <div className="col-md-8">
                <label htmlFor="newCategory" className="form-label">Nome da Categoria</label>
                <input
                  type="text"
                  id="newCategory"
                  className="form-control"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Digite o nome da categoria"
                  style={{ 
                    backgroundColor: '#181a1b', 
                    border: '1px solid #343a40', 
                    color: '#f8f9fa' 
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                />
              </div>
              <div className="col-md-4">
                <div className="d-flex gap-2">
                  <button 
                    onClick={handleAddCategory} 
                    className="btn btn-success"
                    disabled={!newCategoryName.trim()}
                  >
                    <FaSave className="me-2" />
                    Salvar
                  </button>
                  <button 
                    onClick={() => {
                      setShowAddForm(false);
                      setNewCategoryName('');
                    }} 
                    className="btn btn-outline-secondary"
                  >
                    <FaTimes className="me-2" />
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de categorias */}
      <div className="card bg-dark text-light border-secondary">
        <div className="card-header bg-secondary">
          <h5 className="mb-0">Categorias Existentes</h5>
        </div>
        <div className="card-body">
          {categories.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">Nenhuma categoria encontrada.</p>
              <p className="text-muted small">As categorias são extraídas automaticamente dos posts publicados.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-dark">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Slug</th>
                    <th className="text-center">Posts</th>
                    <th className="text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>
                        {editingCategory === category.id ? (
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            defaultValue={category.name}
                            onBlur={(e) => handleEditCategory(category.id, e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleEditCategory(category.id, e.target.value);
                              } else if (e.key === 'Escape') {
                                setEditingCategory(null);
                              }
                            }}
                            autoFocus
                            style={{ 
                              backgroundColor: '#181a1b', 
                              border: '1px solid #343a40', 
                              color: '#f8f9fa' 
                            }}
                          />
                        ) : (
                          <span className="fw-semibold">{category.name}</span>
                        )}
                      </td>
                      <td>
                        <code className="text-info">{category.slug}</code>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-primary">{category.count}</span>
                      </td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          <button
                            onClick={() => setEditingCategory(category.id)}
                            className="btn btn-outline-warning"
                            title="Editar categoria"
                            disabled={editingCategory === category.id}
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="btn btn-outline-danger"
                            title="Excluir categoria"
                            disabled={category.count > 0}
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
          )}
        </div>
      </div>

      {/* Dicas */}
      <div className="card bg-secondary text-light border-secondary mt-4">
        <div className="card-body">
          <h6 className="card-title">💡 Dicas sobre Categorias</h6>
          <ul className="mb-0 small">
            <li>As categorias são extraídas automaticamente dos posts publicados</li>
            <li>Você pode editar o nome clicando no botão de edição</li>
            <li>Categorias com posts não podem ser excluídas para preservar a integridade</li>
            <li>O slug é gerado automaticamente baseado no nome</li>
            <li>Novas categorias criadas aqui aparecerão como opção nos posts</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminCategorias; 