import { supabase, SITE_URL, xmlEscape } from './_supabase.js';

const stripHtml = (html = '') =>
  String(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// GET /feed.xml  (RSS 2.0, via rewrite em vercel.json)
export default async function handler(req, res) {
  let posts = [];
  if (supabase) {
    const { data, error } = await supabase
      .from('posts')
      .select('slug, title, excerpt, content, text_content, author, published_at')
      .order('published_at', { ascending: false })
      .limit(30);
    if (!error && Array.isArray(data)) posts = data;
  }

  const items = posts
    .filter((p) => p.slug && p.title)
    .map((p) => {
      const link = `${SITE_URL}/noticia/${encodeURIComponent(p.slug)}`;
      const desc =
        p.excerpt || stripHtml(p.content || p.text_content || '').slice(0, 400);
      return (
        '    <item>\n' +
        `      <title>${xmlEscape(p.title)}</title>\n` +
        `      <link>${xmlEscape(link)}</link>\n` +
        `      <guid isPermaLink="true">${xmlEscape(link)}</guid>\n` +
        (p.author ? `      <author>${xmlEscape(p.author)}</author>\n` : '') +
        (p.published_at
          ? `      <pubDate>${new Date(p.published_at).toUTCString()}</pubDate>\n`
          : '') +
        `      <description>${xmlEscape(desc)}</description>\n` +
        '    </item>'
      );
    })
    .join('\n');

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n' +
    '  <channel>\n' +
    '    <title>Jornal Santista</title>\n' +
    `    <link>${SITE_URL}</link>\n` +
    '    <description>Mídia alternativa na Baixada Santista</description>\n' +
    '    <language>pt-BR</language>\n' +
    `    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />\n` +
    items +
    '\n  </channel>\n</rss>\n';

  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(body);
}
