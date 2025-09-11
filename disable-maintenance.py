#!/usr/bin/env python3
"""
Disable maintenance mode script
This script removes maintenance redirect scripts from all HTML files
and restores normal .htaccess configuration after maintenance ends
"""

import os
import re
from pathlib import Path
from datetime import datetime

def remove_maintenance_script(file_path):
    """Remove maintenance redirect script from HTML file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Skip if no maintenance script found
        if 'maintenance-redirect.js' not in content:
            return False
            
        # Remove maintenance script lines
        lines = content.split('\n')
        filtered_lines = []
        skip_next = False
        
        for line in lines:
            if 'Maintenance Mode Redirect' in line:
                skip_next = True
                continue
            elif skip_next and 'maintenance-redirect.js' in line:
                skip_next = False
                continue
            else:
                filtered_lines.append(line)
        
        # Write back the cleaned content
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(filtered_lines))
        
        print(f"Removed maintenance script from {file_path}")
        return True
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def restore_htaccess():
    """Restore normal .htaccess configuration"""
    normal_htaccess = '''RewriteEngine On

# Remove .html extension from URLs
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-l
RewriteRule ^([^\.]+)$ $1.html [NC,L]

# Redirect .html URLs to clean URLs (except for direct file access)
RewriteCond %{THE_REQUEST} \s/+([^.]+)\.html[\s?] [NC]
RewriteRule ^ /%1? [NC,L,R=301]

# Handle specific pages
RewriteRule ^partners/?$ partners.html [NC,L]
RewriteRule ^spectacles/?$ spectacles.html [NC,L]
RewriteRule ^spectacle-alice-chez-les-merveilles/?$ spectacle-alice-chez-les-merveilles.html [NC,L]
RewriteRule ^spectacle-antigone/?$ spectacle-antigone.html [NC,L]
RewriteRule ^spectacle-casse-noisette/?$ spectacle-casse-noisette.html [NC,L]
RewriteRule ^spectacle-charlotte/?$ spectacle-charlotte.html [NC,L]
RewriteRule ^spectacle-estevanico/?$ spectacle-estevanico.html [NC,L]
RewriteRule ^spectacle-le-petit-prince/?$ spectacle-le-petit-prince.html [NC,L]
RewriteRule ^spectacle-leau-la/?$ spectacle-leau-la.html [NC,L]
RewriteRule ^spectacle-lenfant-de-larbre/?$ spectacle-lenfant-de-larbre.html [NC,L]
RewriteRule ^spectacle-simple-comme-bonjour/?$ spectacle-simple-comme-bonjour.html [NC,L]
RewriteRule ^spectacle-tara-sur-la-lune/?$ spectacle-tara-sur-la-lune.html [NC,L]

# Cache static files
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/webp "access plus 1 month"
</IfModule>
'''
    
    try:
        with open('.htaccess', 'w', encoding='utf-8') as f:
            f.write(normal_htaccess)
        print("Restored normal .htaccess configuration")
        return True
    except Exception as e:
        print(f"Error restoring .htaccess: {e}")
        return False

def main():
    """Disable maintenance mode completely"""
    print("🔧 Disabling maintenance mode...")
    
    # Check if maintenance should be over
    target_date = datetime(2025, 10, 13, 10, 0, 0)
    current_date = datetime.now()
    
    if current_date < target_date:
        print(f"⚠️  WARNING: Maintenance is scheduled until {target_date}")
        response = input("Are you sure you want to disable maintenance mode early? (y/N): ")
        if response.lower() != 'y':
            print("Maintenance mode remains active.")
            return
    
    # Remove maintenance scripts from all HTML files
    current_dir = Path('.')
    html_files = list(current_dir.glob('*.html'))
    
    modified_count = 0
    for html_file in html_files:
        if remove_maintenance_script(html_file):
            modified_count += 1
    
    # Restore normal .htaccess
    restore_htaccess()
    
    # Remove maintenance files
    maintenance_files = ['maintenance-redirect.js', 'under-construction.html']
    for file in maintenance_files:
        if Path(file).exists():
            try:
                os.remove(file)
                print(f"Removed {file}")
            except Exception as e:
                print(f"Error removing {file}: {e}")
    
    print(f"\n✅ Maintenance mode disabled!")
    print(f"📝 Modified {modified_count} HTML files")
    print(f"🌐 Website is now accessible normally")

if __name__ == "__main__":
    main()
