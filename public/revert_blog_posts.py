import json
import re

file_path = "/home/hal-9000/Documentos/js/public/blog_posts.json"

with open(file_path, 'r') as f:
    blog_posts = json.load(f)

for post in blog_posts:
    if "text_content" in post and post["text_content"]:
        content = post["text_content"]
        
        # Replace </p><p> with two newlines to restore paragraph breaks
        content = content.replace('</p><p>', '\n\n')
        
        # Remove remaining <p> and </p> tags
        content = content.replace('<p>', '')
        content = content.replace('</p>', '')
        
        # Remove leading/trailing whitespace that might have been introduced
        post["text_content"] = content.strip()

with open(file_path, 'w') as f:
    json.dump(blog_posts, f, indent=4, ensure_ascii=False)

print("blog_posts.json reverted successfully.")
