// Gera um snapshot estático do conteúdo público a partir do Supabase, para a
// app carregar o feed e as matérias sem depender de uma ida ao banco em
// runtime. É só uma otimização: se o snapshot não existir, a app usa o
// Supabase normalmente (ver src/lib/postsService.js).
//
// Roda antes do `vite build` (package.json -> "build"). NUNCA derruba o build:
// qualquer erro vira aviso e o processo sai com código 0.
//
// Credenciais: usa a chave `anon` (a mesma do cliente). O RLS do Supabase
// garante que só o conteúdo público entra no snapshot.

import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';

const OUT_DIR = join(process.cwd(), 'public', 'data');
const POSTS_DIR = join(OUT_DIR, 'posts');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const warn = (msg) => console.warn(`[build-content] ${msg}`);

// Mesma regra de src/utils/textUtils.js (slugify), duplicada aqui para o
// script não depender do bundle da app.
const slugify = (text) =>
  String(text || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

async function run() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    warn(
      'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ausentes — snapshot não gerado. ' +
        'A app vai buscar tudo no Supabase em runtime.'
    );
    return;
  }

  const headers = {
    apikey: SUPABASE_KEY,
    authorization: `Bearer ${SUPABASE_KEY}`
  };
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/posts?select=*&order=published_at.desc`,
    { headers }
  );

  if (!res.ok) {
    warn(`Supabase respondeu ${res.status} — snapshot não gerado.`);
    return;
  }

  const posts = await res.json();
  if (!Array.isArray(posts) || posts.length === 0) {
    warn('Nenhuma matéria retornada — snapshot não gerado.');
    return;
  }

  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(POSTS_DIR, { recursive: true });

  // index.json: só o que o feed e os cards precisam (sem o corpo).
  const index = posts.map((p) => ({
    id: p.id,
    slug: p.slug || slugify(p.title || String(p.id)),
    title: p.title || '',
    excerpt: p.excerpt || '',
    categories: p.categories || [],
    authors: p.authors || [],
    author: p.author || '',
    images: p.images || [],
    status: p.status || null,
    published_at: p.published_at || null,
    updated_at: p.updated_at || null
  }));
  await writeFile(join(OUT_DIR, 'index.json'), JSON.stringify(index));

  // Uma matéria por arquivo, com o corpo completo.
  let written = 0;
  const seen = new Set();
  for (const p of posts) {
    const slug = p.slug || slugify(p.title || String(p.id));
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    await writeFile(join(POSTS_DIR, `${slug}.json`), JSON.stringify(p));
    written += 1;
  }

  await writeFile(
    join(OUT_DIR, 'meta.json'),
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      count: index.length,
      posts: written
    })
  );

  console.log(
    `[build-content] snapshot gerado: ${index.length} no index, ${written} matérias.`
  );
}

run().catch((err) => {
  warn(`falhou: ${err?.message || err} — a app vai usar o Supabase.`);
  // Não propaga o erro: o build segue sem o snapshot.
});
