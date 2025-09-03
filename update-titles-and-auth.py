#!/usr/bin/env python3
import os
import re
import glob

def update_html_files():
    """Update all HTML files with correct title and auth buttons"""
    
    # Get all HTML files in the directory
    html_files = glob.glob('/Users/Imad/Downloads/edjs-site1/*.html')
    
    for file_path in html_files:
        # Skip backup files
        if 'backup' in file_path:
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Update title tag
            content = re.sub(
                r'<title>.*?</title>',
                "<title>L'école du jeune spectateur</title>",
                content,
                flags=re.IGNORECASE
            )
            
            # Update register button href to app.edjs.art
            content = re.sub(
                r'href="[^"]*auth[^"]*mode=register[^"]*"',
                'href="https://app.edjs.art/auth?mode=register"',
                content
            )
            
            # Update login button onclick to app.edjs.art
            content = re.sub(
                r'onclick="window\.open\([\'"][^\'\"]*auth[^\'\"]*[\'"][^)]*\)"',
                'onclick="window.open(\'https://app.edjs.art/auth\', \'_blank\')"',
                content
            )
            
            # Write back to file
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
                
            print(f"✅ Updated: {os.path.basename(file_path)}")
            
        except Exception as e:
            print(f"❌ Error updating {file_path}: {e}")

if __name__ == "__main__":
    print("Updating HTML files with correct titles and auth buttons...")
    update_html_files()
    print("Done!")
