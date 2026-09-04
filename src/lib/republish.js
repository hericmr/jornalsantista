import { supabase } from './supabase';

// Pede à Vercel um rebuild do site para regenerar o snapshot estático de
// conteúdo (assim uma matéria nova/editada aparece no site público).
// Chama /api/republish, que valida o token de admin do Supabase.
export const requestRepublish = async () => {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) throw new Error('Sessão expirada');

  const res = await fetch('/api/republish', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Falha ao republicar (${res.status})`);
  }
  return true;
};

export default requestRepublish;
