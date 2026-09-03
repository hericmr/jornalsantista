import { supabase, SITE_URL, xmlEscape } from './_supabase.js';

// GET /sitemap.xml  (via rewrite em vercel.json)
export default async function handler(req, res) {
  const staticPaths = ['/', '/categorias', '/sobre', '/contato'];

  let posts = [];
  if (supabase) {
    const { data, error } = await supabase
      .from('posts')
      .select('slug, published_at, updated_at')
      .order('published_at', { ascending: false })
      .limit(2000);
    if (!error && Array.isArray(data)) posts = data;
  }

  const urls = [
    ...staticPaths.map((path) => ({ loc: `${SITE_URL}${path}`, lastmod: null })),
    ...posts
      .filter((p) => p.slug)
      .map((p) => ({
        loc: `${SITE_URL}/noticia/${encodeURIComponent(p.slug)}`,
        lastmod: p.updated_at || p.published_at || null
      }))
  ];

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls
      .map(
        ({ loc, lastmod }) =>
          `  <url><loc>${xmlEscape(loc)}</loc>${
            lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ''
          }</url>`
      )
      .join('\n') +
    '\n</urlset>\n';

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(body);
}
