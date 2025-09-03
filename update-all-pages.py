#!/usr/bin/env python3
import os
import re

# Read standard header and footer
with open('standard-header.html', 'r', encoding='utf-8') as f:
    standard_header = f.read()

with open('standard-footer.html', 'r', encoding='utf-8') as f:
    standard_footer = f.read()

# Files to update
files_to_update = [
    'about.html', 'blog.html', 'blog-details.html', 'contact.html',
    'gallery.html', 'partners.html', 'registration.html', 'spectacles.html',
    'spectacle-alice-chez-les-merveilles.html', 'spectacle-antigone.html',
    'spectacle-casse-noisette.html', 'spectacle-charlotte.html',
    'spectacle-estevanico.html', 'spectacle-le-petit-prince.html',
    'spectacle-leau-la.html', 'spectacle-lenfant-de-larbre.html',
    'spectacle-simple-comme-bonjour.html', 'spectacle-tara-sur-la-lune.html',
    '404.html'
]

def update_page(filename):
    print(f"Processing: {filename}")
    
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace header section (from mobile menu to end of header)
    header_pattern = r'<!--==============================\s*Mobile Menu\s*==============================-->.*?</header>'
    if re.search(header_pattern, content, re.DOTALL):
        content = re.sub(header_pattern, f'<!--==============================\n\t\tHeader Area\n\t==============================-->\n  <header class="vs-header">\n{standard_header}\n  </header>', content, flags=re.DOTALL)
        print(f"  ✓ Updated header in {filename}")
    else:
        # Try alternative header pattern
        alt_pattern = r'<!--==============================\s*Header Area\s*==============================-->.*?</header>'
        if re.search(alt_pattern, content, re.DOTALL):
            content = re.sub(alt_pattern, f'<!--==============================\n\t\tHeader Area\n\t==============================-->\n  <header class="vs-header">\n{standard_header}\n  </header>', content, flags=re.DOTALL)
            print(f"  ✓ Updated header (alt pattern) in {filename}")
        else:
            print(f"  ⚠ Could not find header pattern in {filename}")
    
    # Replace footer section
    footer_pattern = r'<div class="vs-footer bg-title">.*?</div>\s*<!--\*+\s*Back To Top'
    if re.search(footer_pattern, content, re.DOTALL):
        content = re.sub(footer_pattern, f'{standard_footer}\n  <!--********************************\n\t\t\tBack To Top', content, flags=re.DOTALL)
        print(f"  ✓ Updated footer in {filename}")
    else:
        print(f"  ⚠ Could not find footer pattern in {filename}")
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True

# Update all files
for filename in files_to_update:
    if os.path.exists(filename):
        update_page(filename)
    else:
        print(f"✗ File not found: {filename}")

print("\nHeader/footer standardization complete!")
