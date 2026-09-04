import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPostBySlugOrId, savePost, getAllAuthors } from '../../lib/postsService';
import { slugify } from '../../utils/textUtils';
import { supabase } from '../../lib/supabase';
import { requestRepublish } from '../../lib/republish';
import { useToast, useConfirm } from '../components/AdminFeedback';

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
  const confirm = useConfirm();
  const isEdit = mode === 'edit';

  const [post, setPost] = useState(EMPTY_POST);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [allAuthors, setAllAuthors] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  // Há um corpo anterior guardado em `content_backup` para "desfazer" (T1.4)?
  const [backupAvailable, setBackupAvailable] = useState(false);

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
        setBackupAvailable(Boolean(found.content_backup));
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

  // Monta o payload de `posts` a partir do state do formulário. `overrides`
  // permite trocar um campo pontual (ex.: o corpo, no "desfazer").
  const buildPayload = useCallback(
    (overrides = {}) => ({
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
      slug: slugify(post.title),
      ...overrides
    }),
    [post]
  );

  // `id` do state (matéria carregada) tem prioridade sobre o da rota, que pode
  // ser um slug. Com id => UPDATE; sem id => criação.
  const existingId = post.id ?? (isEdit ? id : undefined);

  const submit = useCallback(
    async (e) => {
      if (e && e.preventDefault) e.preventDefault();
      setSaving(true);
      try {
        const payload = buildPayload();

        if (isEdit && existingId) {
          await savePost({ ...payload, id: existingId }, false);
          toast.success('Notícia atualizada.');
        } else {
          await savePost(payload, true);
          toast.success('Notícia criada.');
        }

        // Regenera o snapshot estático do site (não bloqueia o fluxo).
        requestRepublish().catch((e) =>
          console.warn('Republicação não disparada:', e.message)
        );

        navigate('/admin/noticias');
      } catch (err) {
        console.error('Erro ao salvar:', err);
        toast.error('Erro ao salvar a notícia: ' + err.message);
      } finally {
        setSaving(false);
      }
    },
    [buildPayload, existingId, isEdit, navigate, toast]
  );

  // Desfazer último salvamento (T1.4): restaura `content_backup` como corpo
  // atual e persiste. O próprio savePost grava o corpo de agora como novo
  // backup, então o botão continua disponível (funciona como alternância).
  const restoreBackup = useCallback(async () => {
    if (!isEdit || !existingId) return;

    const ok = await confirm({
      title: 'Desfazer último salvamento',
      message:
        'O corpo da matéria volta a ser a versão anterior ao último salvamento. ' +
        'O que foi escrito desde então será perdido.',
      confirmLabel: 'Desfazer',
      variant: 'danger'
    });
    if (!ok) return;

    setSaving(true);
    try {
      const fresh = await getPostBySlugOrId(existingId);
      const backup = fresh?.content_backup;
      if (backup === undefined || backup === null || backup === '') {
        toast.error('Não há um salvamento anterior para desfazer.');
        setBackupAvailable(false);
        return;
      }

      await savePost(
        { ...buildPayload({ text_content: backup }), id: existingId },
        false
      );
      setPost((prev) => ({ ...prev, content: backup }));
      setBackupAvailable(true);

      requestRepublish().catch((e) =>
        console.warn('Republicação não disparada:', e.message)
      );
      toast.success('Último salvamento desfeito.');
    } catch (err) {
      console.error('Erro ao desfazer salvamento:', err);
      toast.error('Erro ao desfazer o salvamento: ' + err.message);
    } finally {
      setSaving(false);
    }
  }, [buildPayload, confirm, existingId, isEdit, toast]);

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
    submit,
    restoreBackup,
    backupAvailable
  };
};

export default useNoticiaForm;
