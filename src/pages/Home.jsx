import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PostItem from '../components/PostItem';
import { getAllPosts } from '../lib/postsService';
import SearchBar from '../components/SearchBar';
import { createExcerpt, containsSearchTerm } from '../utils/textUtils';
import MetaTags from '../components/MetaTags';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const posts = await getAllPosts();
      console.log('🏠 Home: Posts carregados:', posts.length);
      
      // Verificar posts do Supabase
      const supabasePosts = posts.filter(post => post.source === 'supabase');
      console.log('🗄️ Home: Posts do Supabase:', supabasePosts.length);
      
      supabasePosts.forEach(post => {
        console.log(`📝 Home: Post "${post.title}" - text_content: ${!!post.text_content}, length: ${post.text_content?.length || 0}`);
        if (!post.text_content) {
          console.log(`⚠️ Home: Post "${post.title}" não tem text_content!`);
          console.log(`   Content: ${!!post.content}, length: ${post.content?.length || 0}`);
        }
      });
      
      setPosts(posts);
      setFilteredPosts(posts);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredPosts(posts);
      return;
    }

    const filtered = posts.filter(post => {
      return post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             containsSearchTerm(post.text_content || post.content || '', searchTerm) ||
             post.author.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    setFilteredPosts(filtered);
  };

  const handleImageError = (e) => {
    // Se a imagem falhar ao carregar, substitui por um placeholder
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZjNzU3ZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbSBuw6NvIGRpc3BvbsOtdmVsPC90ZXh0Pjwvc3ZnPg==';
    e.target.style.objectFit = 'cover';
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

  const featuredPosts = filteredPosts.slice(0, 2); // Duas matérias em destaque
  const otherPosts = filteredPosts.slice(2); // Demais matérias

  return (
    <>
      {/* Meta Tags para SEO */}
      <MetaTags
        title="Jornal Santista - Notícias Locais e Regionais"
        description="Jornal Santista - Sua fonte de notícias locais e regionais. Fique por dentro das principais notícias da região."
        type="website"
        url={window.location.href}
      />

      {/* Vídeo do YouTube logo após a navbar */}
      <div className="video-full-mobile">
        <div className="embed-responsive embed-responsive-16by9">
          <iframe
            className="embed-responsive-item"
            src="https://www.youtube.com/embed/KvPW7w3DXUE?autoplay=1&mute=1"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ width: "100%", height: "56vw", maxHeight: "70vh", minHeight: "200px" }}
          ></iframe>
        </div>
      </div>
      <div className="video-gradient"></div>

      <div className="home-content">
        {/* Seção de Destaque */}
        {featuredPosts.length > 0 && (
          <section className="featured-section">
            <div className="container">
              <h2 className="section-title">Destaques</h2>
              <div className="featured-grid">
                {featuredPosts.map((post, index) => (
                  <div key={post.id} className={`featured-card ${index === 0? 'featured-card--main' : ''}`}>
                    <PostItem post={post} featured={index === 0} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Seção de Outras Notícias */}
        {otherPosts.length > 0 && (
          <section className="news-section">
            <div className="container">
              <h2 className="section-title">Últimas Notícias</h2>
              <div className="news-grid">
                {otherPosts.map(post => (
                  <PostItem key={post.id} post={post} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Estado vazio */}
        {filteredPosts.length === 0 && (
          <div className="container mt-5">
            <div className="text-center">
              <h3>Nenhuma notícia encontrada</h3>
              <p className="text-muted">Tente ajustar os termos de busca.</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Home; 