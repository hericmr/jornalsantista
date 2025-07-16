import React, { useEffect, useState } from 'react';

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/blog_posts.json')
      .then(res => res.json())
      .then(data => {
        const catMap = {};
        data.forEach(post => {
          if (post.categories && post.categories.length > 0) {
            post.categories.forEach(cat => {
              catMap[cat] = (catMap[cat] || 0) + 1;
            });
          } else {
            catMap['Sem categoria'] = (catMap['Sem categoria'] || 0) + 1;
          }
        });
        setCategorias(Object.entries(catMap));
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container py-5">Carregando categorias...</div>;

  return (
    <div className="container py-4">
      <h2 className="mb-4">Categorias</h2>
      <ul className="list-group">
        {categorias.map(([cat, count]) => (
          <li className="list-group-item d-flex justify-content-between align-items-center" key={cat}>
            {cat}
            <span className="badge bg-dark rounded-pill">{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Categorias; 