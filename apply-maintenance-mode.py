#!/usr/bin/env python3
"""
Apply maintenance mode to all HTML pages
This script adds the maintenance redirect script to all HTML files
"""

import os
import re
from pathlib import Path

def add_maintenance_script(file_path):
    """Add maintenance redirect script to HTML file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Skip if already has maintenance script
        if 'maintenance-redirect.js' in content:
            print(f"Skipping {file_path} - already has maintenance script")
            return False
            
        # Skip the under-construction.html file itself
        if 'under-construction.html' in str(file_path):
            print(f"Skipping {file_path} - construction page")
            return False
            
        # Add maintenance script before closing head tag
        maintenance_script = '''  <!-- Maintenance Mode Redirect -->
  <script src="maintenance-redirect.js"></script>
</head>'''
        
        # Replace closing head tag with script + closing head tag
        if '</head>' in content:
            content = content.replace('</head>', maintenance_script)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Added maintenance script to {file_path}")
            return True
        else:
            print(f"No </head> tag found in {file_path}")
            return False
            
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Apply maintenance mode to all HTML files"""
    current_dir = Path('.')
    html_files = list(current_dir.glob('*.html'))
    
    print(f"Found {len(html_files)} HTML files")
    
    modified_count = 0
    for html_file in html_files:
        if add_maintenance_script(html_file):
            modified_count += 1
    
    print(f"\nModified {modified_count} files with maintenance mode")
    print("Maintenance mode applied successfully!")
    
    # Also update standard-header.html if it exists
    header_file = current_dir / 'standard-header.html'
    if header_file.exists():
        add_maintenance_script(header_file)
        print("Updated standard-header.html")

if __name__ == "__main__":
    main()
