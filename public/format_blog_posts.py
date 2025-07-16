import json
import re

file_path = "/home/hal-9000/Documentos/js/public/blog_posts.json"

with open(file_path, 'r') as f:
    blog_posts = json.load(f)

for post in blog_posts:
    if "text_content" in post and post["text_content"]:
        content = post["text_content"]
        
        # Replace multiple newlines with a unique placeholder for paragraph breaks
        content = re.sub(r'\n\s*\n+', '[PARAGRAPH_BREAK]', content)
        
        # Replace single newlines with a space (within paragraphs)
        content = content.replace('\n', ' ')
        
        # Split by the placeholder, filter out empty strings, and wrap in <p> tags
        paragraphs = ["<p>{0}</p>".format(p.strip()) for p in content.split('[PARAGRAPH_BREAK]') if p.strip()]
        
        # Join the paragraphs
        post["text_content"] = "".join(paragraphs)

with open(file_path, 'w') as f:
    json.dump(blog_posts, f, indent=4, ensure_ascii=False)

print("blog_posts.json updated successfully with rich text paragraphs.")
