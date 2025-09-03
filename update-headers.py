#!/usr/bin/env python3
import os
import re

# Standard CSS for all pages
standard_css = '''  <style>
    /* Header Menu Hover Color Fix */
    .vs-header .main-menu ul li a svg path {
      fill: #BDCF00 !important;
    }
  </style>'''

# Standard header includes
standard_includes = '''  <!-- Bootstrap -->
  <link rel="stylesheet" href="assets/css/bootstrap.min.css">
  <!-- Fontawesome Icon -->
  <link rel="stylesheet" href="assets/css/fontawesome.min.css">
  <link rel="stylesheet" href="assets/css/magnific-popup.min.css">
  <!-- Slick Slider -->
  <link rel="stylesheet" href="assets/css/swiper-bundle.css">
  <!-- animate css -->
  <link rel="stylesheet" href="assets/css/animate.min.css">
  <!-- AOS Animation Library -->
  <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
  <!-- Theme Custom CSS -->
  <link rel="stylesheet" href="assets/css/style.css">'''

# List of files to update
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

print("Starting header/footer standardization...")

for filename in files_to_update:
    if os.path.exists(filename):
        print(f"Processing: {filename}")
        
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Update CSS includes to match home page
        content = re.sub(
            r'<!-- Bootstrap -->.*?<!-- Theme Custom CSS -->\s*<link rel="stylesheet" href="assets/css/style\.css">',
            standard_includes,
            content,
            flags=re.DOTALL
        )
        
        # Ensure standard CSS is present
        if standard_css not in content:
            content = content.replace('</head>', f'{standard_css}\n</head>')
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✓ Updated: {filename}")
    else:
        print(f"✗ Not found: {filename}")

print("Header/footer standardization complete!")
