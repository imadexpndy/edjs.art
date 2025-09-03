#!/usr/bin/env python3
import os
import re

# Read the updated standard header
with open('standard-header.html', 'r', encoding='utf-8') as f:
    standard_header = f.read()

# List of all HTML pages to update
pages = [
    'index.html', 'about.html', 'blog.html', 'blog-details.html', 'contact.html',
    'gallery.html', 'partners.html', 'registration.html', 'spectacles.html',
    'spectacle-alice-chez-les-merveilles.html', 'spectacle-antigone.html',
    'spectacle-casse-noisette.html', 'spectacle-charlotte.html',
    'spectacle-estevanico.html', 'spectacle-le-petit-prince.html',
    'spectacle-leau-la.html', 'spectacle-lenfant-de-larbre.html',
    'spectacle-simple-comme-bonjour.html', 'spectacle-tara-sur-la-lune.html',
    '404.html'
]

print('Updating headers with authentication support...')
print('=' * 50)

for page in pages:
    if os.path.exists(page):
        print(f'Processing: {page}')
        
        with open(page, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find and replace the header section
        # Look for the mobile menu wrapper start
        mobile_menu_start = content.find('<div class="vs-menu-wrapper">')
        if mobile_menu_start != -1:
            # Find the end of the header section
            header_end = content.find('</header>', mobile_menu_start)
            if header_end != -1:
                header_end += len('</header>')
                
                # Replace the entire header section
                before_header = content[:mobile_menu_start]
                after_header = content[header_end:]
                
                new_content = before_header + standard_header + after_header
                
                with open(page, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                
                print(f'  ✓ Updated header in {page}')
            else:
                print(f'  ⚠ Could not find header end in {page}')
        else:
            print(f'  ⚠ Could not find mobile menu wrapper in {page}')
    else:
        print(f'✗ File not found: {page}')

print()
print('✅ Header authentication integration complete!')
