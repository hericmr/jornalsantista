import { createClient } from '@supabase/supabase-js';

// Cliente Supabase para as funções serverless (sitemap, feed).
// No Vercel, as variáveis do projeto (inclusive as com prefixo VITE_) ficam
// disponíveis em process.env nas funções.
const url =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key =
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

export const SITE_URL =
  process.env.SITE_URL || 'https://jornalsantista.com.br';

export const supabase = url && key ? createClient(url, key) : null;

export const xmlEscape = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
