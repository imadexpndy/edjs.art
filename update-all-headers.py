#!/usr/bin/env python3
"""
Script to update all HTML pages to use the new template header system.
This will remove old headers and add the header loader script to all pages.
"""

import os
import re
from pathlib import Path

def update_html_file(file_path):
    """Update a single HTML file to use the template header system."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Skip if it's the template files themselves
        if 'standard-header.html' in str(file_path) or 'standard-footer.html' in str(file_path):
            return False
            
        # Remove existing header sections (between header tags)
        # This regex finds the entire header section including mobile menu
        header_pattern = r'<!--==============================\s*Mobile Menu\s*==============================-->.*?</header>'
        content = re.sub(header_pattern, '', content, flags=re.DOTALL)
        
        # Also remove any standalone mobile menu sections
        mobile_menu_pattern = r'<div class="vs-menu-wrapper">.*?</div>\s*<!--==============================\s*Header layout.*?==============================-->'
        content = re.sub(mobile_menu_pattern, '', content, flags=re.DOTALL)
        
        # Add header loader script before closing </head> tag if not already present
        if 'header-loader.js' not in content:
            head_close = '</head>'
            if head_close in content:
                header_script = '''  <!-- Template Header System -->
  <script src="assets/js/header-loader.js"></script>
</head>'''
                content = content.replace(head_close, header_script)
        
        # Write the updated content back
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
        return True
        
    except Exception as e:
        print(f"Error updating {file_path}: {e}")
        return False

def main():
    """Update all HTML files in the project."""
    project_root = Path(__file__).parent
    html_files = list(project_root.glob('*.html'))
    
    # Filter out template files
    html_files = [f for f in html_files if 'standard-' not in f.name]
    
    updated_count = 0
    
    print(f"Found {len(html_files)} HTML files to update...")
    
    for html_file in html_files:
        print(f"Updating {html_file.name}...")
        if update_html_file(html_file):
            updated_count += 1
            print(f"  ✓ Updated successfully")
        else:
            print(f"  ✗ Failed to update")
    
    print(f"\nCompleted! Updated {updated_count} out of {len(html_files)} files.")
    print("\nAll pages now use the template header system.")
    print("Any changes to standard-header.html will automatically apply to all pages.")

if __name__ == "__main__":
    main()
