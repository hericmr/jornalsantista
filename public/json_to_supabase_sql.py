import json
import unicodedata
import re

def slugify(text):
    if not text:
        return ''
    text = unicodedata.normalize('NFD', str(text))
    text = text.encode('ascii', 'ignore').decode('utf-8')
    text = re.sub(r'[^a-zA-Z0-9\s-]', '', text)
    text = text.lower().strip()
    text = re.sub(r'[\s]+', '-', text)
    return text

def pg_array(lst):
    if not lst:
        return "'{}'"
    return "'{" + ",".join('"{}"'.format(str(x).replace('"', '\"')) for x in lst) + "}'"

with open('public/blog_posts.json', encoding='utf-8') as f:
    posts = json.load(f)

if isinstance(posts, dict) and 'posts' in posts:
    posts = posts['posts']

with open('blog_posts_supabase.sql', 'w', encoding='utf-8') as sqlfile:
    for post in posts:
        if not post or not isinstance(post, dict):
            continue
        id_ = str(post.get('id', '') or '').replace("'", "''")
        title = str(post.get('title', '') or '').replace("'", "''")
        author = str(post.get('author', '') or '').replace("'", "''")
        published = str(post.get('published', '') or '')
        updated = str(post.get('updated', '') or '')
        categories = pg_array(post.get('categories', []))
        text_content = str(post.get('text_content', '') or '').replace("'", "''")
        images = pg_array(post.get('images', []))
        slug = slugify(post.get('title', post.get('id', ''))).replace("'", "''")

        sql = f"""INSERT INTO posts (id, title, author, published, updated, categories, text_content, images, slug)
VALUES ('{id_}', '{title}', '{author}', '{published}', '{updated}', {categories}, '{text_content}', {images}, '{slug}')
ON CONFLICT (slug) DO NOTHING;
"""
        sqlfile.write(sql)

print('Arquivo blog_posts_supabase.sql gerado com sucesso!') 