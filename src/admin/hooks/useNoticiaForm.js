import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPostBySlugOrId, savePost, getAllAuthors } from '../../lib/postsService';
import { slugify } from '../../utils/textUtils';
import { supabase } from '../../lib/supabase';
import { useToast } from '../components/AdminFeedback';

// Estado e regras de negócio compartilhados pelas telas "Nova notícia" e
// "Editar notícia". A UI fica em NoticiaForm.jsx.

const EMPTY_POST = {
  title: '',
  excerpt: '',
  content: '',
  categories: [],
  authors: [],
  published: '',
  images: [],
  tags: [],
  status: 'draft'
};

// Normaliza um registro vindo do Supabase para o formato do formulário.
const toFormState = (p) => ({
  id: p.id,
  title: p.title || '',
  excerpt: p.excerpt || '',
  content: p.text_content || p.content || '',
  categories: p.categories || [],
  authors: (() => {
    if (Array.isArray(p.authors) && p.authors.length > 0) {
      return p.authors.filter(
        (a) => a && typeof a === 'string' && a.trim() !== ''
      );
    }
    if (p.author && typeof p.author === 'string' && p.author.trim() !== '') {
      return [p.author];
    }
    return [];
  })(),
  published:
    p.published_at || p.published
      ? new Date(p.published_at || p.published).toISOString().split('T')[0]
      : '',
  images: p.images || [],
  tags: p.tags || [],
  status: p.status || 'draft'
});

const uploadImage = async (file, toast) => {
  const fileName = `${Date.now()}-${file.name}`;
  const { error } = await supabase.storage
    .from('noticias-imagens')
    .upload(fileName, file);

  if (error) {
    console.error('Erro ao enviar imagem:', error);
    toast.error('Erro ao enviar imagem: ' + error.message);
    return null;
  }

  const { data } = supabase.storage
    .from('noticias-imagens')
    .getPublicUrl(fileName);

  if (data && data.publicUrl) return data.publicUrl;
  toast.error('Erro ao obter a URL pública da imagem.');
  return null;
};

export const useNoticiaForm = ({ mode, id }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = mode === 'edit';

  const [post, setPost] = useState(EMPTY_POST);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [allAuthors, setAllAuthors] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAllAuthors().then(setAllAuthors);
  }, []);

  useEffect(() => {
    if (!isEdit || !id) return;
    let active = true;
    setLoading(true);
    getPostBySlugOrId(id)
      .then((found) => {
        if (!active) return;
        if (!found) {
          toast.error('Notícia não encontrada.');
          navigate('/admin/noticias');
          return;
        }
        setPost(toFormState(found));
      })
      .catch((err) => {
        console.error('Erro ao carregar post:', err);
        if (active) toast.error('Erro ao carregar a notícia.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isEdit, id, navigate, toast]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setPost((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setCategoriesFromText = useCallback((text) => {
    const categories = text
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    setPost((prev) => ({ ...prev, categories }));
  }, []);

  const addAuthor = useCallback((name) => {
    const n = (name || '').trim();
    if (!n) return;
    setPost((prev) =>
      prev.authors.includes(n) ? prev : { ...prev, authors: [...prev.authors, n] }
    );
  }, []);

  const removeAuthor = useCallback((index) => {
    setPost((prev) => ({
      ...prev,
      authors: prev.authors.filter((_, i) => i !== index)
    }));
  }, []);

  const uploadSelectedImages = useCallback(async () => {
    if (!selectedFiles.length) return;
    try {
      const urls = [];
      for (const file of selectedFiles) {
        const url = await uploadImage(file, toast);
        if (url) urls.push(url);
      }
      if (!urls.length) {
        toast.error('Nenhuma imagem foi enviada.');
        return;
      }
      setPost((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
      setSelectedFiles([]);
      toast.success(
        urls.length > 1 ? `${urls.length} imagens enviadas.` : 'Imagem enviada.'
      );
    } catch (err) {
      console.error('Erro ao enviar imagens:', err);
      toast.error('Erro ao enviar imagens: ' + err.message);
    }
  }, [selectedFiles, toast]);

  const removeImage = useCallback((index) => {
    setPost((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  }, []);

  const submit = useCallback(
    async (e) => {
      if (e && e.preventDefault) e.preventDefault();
      setSaving(true);
      try {
        const payload = {
          title: post.title,
          excerpt: post.excerpt,
          text_content: post.content,
          categories: post.categories,
          authors: post.authors,
          author: post.authors.length > 0 ? post.authors.join(', ') : '',
          published_at: post.published
            ? new Date(post.published).toISOString()
            : null,
          images: post.images,
          tags: post.tags,
          status: post.status,
          slug: slugify(post.title)
        };

        // `id` do state (matéria carregada) tem prioridade sobre o da rota,
        // que pode ser um slug. Com id => UPDATE; sem id => criação.
        const existingId = post.id ?? (isEdit ? id : undefined);

        if (isEdit && existingId) {
          await savePost({ ...payload, id: existingId }, false);
          toast.success('Notícia atualizada.');
        } else {
          await savePost(payload, true);
          toast.success('Notícia criada.');
        }
        navigate('/admin/noticias');
      } catch (err) {
        console.error('Erro ao salvar:', err);
        toast.error('Erro ao salvar a notícia: ' + err.message);
      } finally {
        setSaving(false);
      }
    },
    [post, isEdit, id, navigate, toast]
  );

  return {
    isEdit,
    post,
    setPost,
    handleChange,
    setCategoriesFromText,
    allAuthors,
    addAuthor,
    removeAuthor,
    selectedFiles,
    setSelectedFiles,
    uploadSelectedImages,
    removeImage,
    loading,
    saving,
    submit
  };
};

export default useNoticiaForm;
