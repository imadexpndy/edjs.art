#!/usr/bin/env python3
import os
import re

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

# Supabase CDN and auth scripts to add
supabase_scripts = '''
  <!-- Supabase -->
  <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
  <!-- Authentication Styles -->
  <link rel="stylesheet" href="assets/css/auth-styles.css">'''

auth_scripts = '''
  <!-- Authentication Scripts -->
  <script src="assets/js/supabase-config.js"></script>
  <script src="assets/js/spectacles-auth.js"></script>'''

print('Integrating Supabase authentication into all pages...')
print('=' * 50)

for page in pages:
    if os.path.exists(page):
        print(f'Processing: {page}')
        
        with open(page, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Add Supabase CDN before closing head tag
        if 'supabase-js@2' not in content:
            content = content.replace('</head>', f'{supabase_scripts}\n</head>')
            print(f'  ✓ Added Supabase CDN to {page}')
        
        # Add auth scripts before closing body tag
        if 'supabase-config.js' not in content:
            content = content.replace('</body>', f'{auth_scripts}\n</body>')
            print(f'  ✓ Added auth scripts to {page}')
        
        # Write updated content
        with open(page, 'w', encoding='utf-8') as f:
            f.write(content)
    else:
        print(f'✗ File not found: {page}')

print()
print('✅ Authentication integration complete!')
print('All pages now include Supabase client and authentication scripts.')
