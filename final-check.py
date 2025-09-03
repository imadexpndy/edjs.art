#!/usr/bin/env python3
import os

pages_to_check = [
    'about.html', 'blog.html', 'blog-details.html', 'contact.html',
    'gallery.html', 'partners.html', 'registration.html', 'spectacles.html',
    'spectacle-alice-chez-les-merveilles.html', 'spectacle-antigone.html',
    'spectacle-casse-noisette.html', 'spectacle-charlotte.html',
    'spectacle-estevanico.html', 'spectacle-le-petit-prince.html',
    'spectacle-leau-la.html', 'spectacle-lenfant-de-larbre.html',
    'spectacle-simple-comme-bonjour.html', 'spectacle-tara-sur-la-lune.html',
    '404.html'
]

print('Final Header/Footer Consistency Check:')
print('=' * 40)

all_consistent = True
for page in pages_to_check:
    if os.path.exists(page):
        with open(page, 'r', encoding='utf-8') as f:
            content = f.read()
        
        has_mobile_menu = 'vs-menu-wrapper' in content
        has_standard_nav = 'ACCUEIL' in content and 'À PROPOS' in content and 'SPECTACLES' in content
        has_footer = 'vs-footer bg-title' in content
        has_css_fix = 'fill: #BDCF00 !important' in content
        
        is_consistent = all([has_mobile_menu, has_standard_nav, has_footer, has_css_fix])
        status = '✓' if is_consistent else '⚠'
        
        print(f'{status} {page}')
        if not is_consistent:
            all_consistent = False
            if not has_mobile_menu:
                print(f'    - Missing mobile menu')
            if not has_standard_nav:
                print(f'    - Missing standard navigation')
            if not has_footer:
                print(f'    - Missing footer')
            if not has_css_fix:
                print(f'    - Missing CSS fix')
    else:
        print(f'✗ {page} - File not found')
        all_consistent = False

print()
if all_consistent:
    print('🎉 SUCCESS: All pages now have consistent headers and footers!')
else:
    print('⚠ Some pages still need updates')
