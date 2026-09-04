import { createClient } from '@supabase/supabase-js';

// POST /api/republish
// Dispara um rebuild na Vercel (Deploy Hook) para regenerar o snapshot
// estático de conteúdo (public/data/*). Só um usuário admin autenticado pode
// chamar: exige o Bearer token do Supabase Auth e `profiles.role = 'admin'`.

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const DEPLOY_HOOK_URL = process.env.DEPLOY_HOOK_URL;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido' });
  }

  if (!DEPLOY_HOOK_URL) {
    return res
      .status(500)
      .json({ error: 'DEPLOY_HOOK_URL não configurado no projeto Vercel' });
  }
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(500).json({ error: 'Supabase não configurado' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Sem token de sessão' });

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData?.user) {
    return res.status(401).json({ error: 'Sessão inválida' });
  }

  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single();

  if (profErr || profile?.role !== 'admin') {
    return res.status(403).json({ error: 'Sem permissão de administrador' });
  }

  const hookRes = await fetch(DEPLOY_HOOK_URL, { method: 'POST' });
  if (!hookRes.ok) {
    return res
      .status(502)
      .json({ error: `Deploy Hook respondeu ${hookRes.status}` });
  }

  return res.status(200).json({ ok: true });
}
