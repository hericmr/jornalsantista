// Edge Middleware (Vercel) — injeta metadados por matéria no HTML servido aos
// crawlers de preview de link (WhatsApp, Facebook, Twitter/X, Telegram, etc.),
// que não executam JavaScript e por isso nunca veem as tags montadas pelo React.
//
// Usuários normais passam direto para a SPA, sem nenhum custo extra.

export const config = { matcher: '/noticia/:slug*' };

const SITE_URL = 'https://www.jornalsantista.com.br';
const SITE_NAME = 'Jornal Santista';
const DEFAULT_IMAGE = `${SITE_URL}/og-default.png`;

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Bots de preview / indexação que não rodam JS.
const CRAWLER_RE =
  /(facebookexternalhit|facebookcatalog|WhatsApp|Twitterbot|Telegram|Discordbot|LinkedInBot|Slackbot|Slack-ImgProxy|redditbot|Googlebot|Google-InspectionTool|bingbot|Applebot|Pinterest|vkShare|SkypeUriPreview|embedly|Iframely|quora link preview|nuzzel|Bitrix|XING-contenttabreceiver|WhatsApp\/|TelegramBot|Mastodon|Threads)/i;

const esc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const decodeEntities = (s = '') =>
  s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;|&#x2019;|&rsquo;/g, '’')
    .replace(/&#8216;|&lsquo;/g, '‘')
    .replace(/&#8220;|&ldquo;/g, '“')
    .replace(/&#8221;|&rdquo;/g, '”')
    .replace(/&#8211;|&ndash;/g, '–')
    .replace(/&#8212;|&mdash;/g, '—')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));

const stripHtml = (html = '') =>
  decodeEntities(String(html).replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();

const truncate = (s = '', max = 200) => {
  const t = s.trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
};

const firstImage = (images) => {
  let arr = images;
  if (typeof images === 'string') {
    try {
      arr = JSON.parse(images);
    } catch {
      arr = [images];
    }
  }
  if (!Array.isArray(arr)) return null;
  const first = arr.find(Boolean);
  if (!first || typeof first !== 'string') return null;
  if (/^https?:\/\//i.test(first)) return first;
  return `${SITE_URL}${first.startsWith('/') ? '' : '/'}${first}`;
};

const toISO = (d) => {
  if (!d) return null;
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

async function fetchPost(slug) {
  const base = `${SUPABASE_URL}/rest/v1/posts`;
  const select =
    'select=title,excerpt,content,text_content,images,author,authors,published_at,updated_at,categories';
  const headers = { apikey: SUPABASE_KEY, authorization: `Bearer ${SUPABASE_KEY}` };

  let res = await fetch(`${base}?slug=eq.${encodeURIComponent(slug)}&${select}&limit=1`, { headers });
  let rows = await res.json();
  if (Array.isArray(rows) && rows[0]) return rows[0];

  // fallback: link com id numérico em vez de slug
  if (/^\d+$/.test(slug)) {
    res = await fetch(`${base}?id=eq.${slug}&${select}&limit=1`, { headers });
    rows = await res.json();
    if (Array.isArray(rows) && rows[0]) return rows[0];
  }
  return null;
}

function buildHead({ title, description, image, isDefaultImage, canonical, publishedTime, modifiedTime, section, authors }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description,
    image: [image],
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.svg` }
    }
  };
  if (publishedTime) jsonLd.datePublished = publishedTime;
  jsonLd.dateModified = modifiedTime || publishedTime || undefined;
  if (authors.length) jsonLd.author = authors.map((name) => ({ '@type': 'Person', name }));
  if (section) jsonLd.articleSection = section;

  const tags = [
    `<link rel="canonical" href="${esc(canonical)}" />`,
    `<meta name="description" content="${esc(description)}" />`,
    `<meta name="author" content="${esc(authors[0] || SITE_NAME)}" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}" />`,
    `<meta property="og:locale" content="pt_BR" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${esc(canonical)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:image:secure_url" content="${esc(image)}" />`,
    `<meta property="og:image:alt" content="${esc(title)}" />`,
    // dimensões só quando temos certeza (imagem padrão); para a imagem da
    // matéria deixamos o crawler medir, evitando corte/letterbox.
    isDefaultImage ? `<meta property="og:image:width" content="1200" />` : '',
    isDefaultImage ? `<meta property="og:image:height" content="630" />` : '',
    publishedTime ? `<meta property="article:published_time" content="${esc(publishedTime)}" />` : '',
    modifiedTime ? `<meta property="article:modified_time" content="${esc(modifiedTime)}" />` : '',
    section ? `<meta property="article:section" content="${esc(section)}" />` : '',
    ...authors.map((a) => `<meta property="article:author" content="${esc(a)}" />`),
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`
  ];
  return tags.filter(Boolean).join('\n');
}

export default async function middleware(request) {
  const ua = request.headers.get('user-agent') || '';
  if (!CRAWLER_RE.test(ua)) return; // humano → SPA normal, sem overhead

  if (!SUPABASE_URL || !SUPABASE_KEY) return;

  const url = new URL(request.url);
  const slug = decodeURIComponent(
    url.pathname.replace(/^\/noticia\//, '').replace(/\/+$/, '')
  );
  if (!slug) return;

  let post;
  try {
    post = await fetchPost(slug);
  } catch {
    return;
  }
  if (!post) return;

  const authorsList = (Array.isArray(post.authors) ? post.authors : [])
    .filter((a) => a && typeof a === 'string' && a.trim());
  if (!authorsList.length && post.author && post.author !== 'Autor não informado') {
    authorsList.push(post.author);
  }

  const title = (post.title && post.title.trim()) || SITE_NAME;
  const description =
    truncate(
      (post.excerpt && post.excerpt.trim()) ||
        stripHtml(post.content || post.text_content || ''),
      200
    ) || `Notícia do ${SITE_NAME}.`;
  const postImage = firstImage(post.images);
  const image = postImage || DEFAULT_IMAGE;
  const canonical = `${SITE_URL}/noticia/${encodeURIComponent(slug)}`;
  const section =
    Array.isArray(post.categories) && post.categories.length ? post.categories[0] : null;

  let html;
  try {
    const res = await fetch(`${url.origin}/index.html`, {
      headers: { 'user-agent': 'jornalsantista-middleware' }
    });
    html = await res.text();
  } catch {
    return;
  }

  const head = buildHead({
    title,
    description,
    image,
    isDefaultImage: !postImage,
    canonical,
    publishedTime: toISO(post.published_at),
    modifiedTime: toISO(post.updated_at),
    section,
    authors: authorsList
  });

  html = html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`)
    .replace(/<meta\s+name="description"[^>]*>/i, '')
    .replace('</head>', `${head}\n</head>`);

  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, s-maxage=600, stale-while-revalidate=86400',
      'x-js-prerender': 'crawler'
    }
  });
}
