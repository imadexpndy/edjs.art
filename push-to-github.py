#!/usr/bin/env python3
import subprocess
import os

def run_command(cmd):
    """Run a shell command and return the result"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd='/Users/Imad/Downloads/edjs-site1')
        print(f"Command: {cmd}")
        if result.stdout:
            print(f"Output: {result.stdout}")
        if result.stderr:
            print(f"Error: {result.stderr}")
        return result.returncode == 0
    except Exception as e:
        print(f"Exception running {cmd}: {e}")
        return False

# Remove large directories from git tracking
print("Removing large gallery directories from git tracking...")
run_command("git rm -r --cached assets/img/gallery/ || true")
run_command("git rm -r --cached attached_assets/ || true")

# Add .gitignore changes
print("Adding .gitignore changes...")
run_command("git add .gitignore")

# Commit changes
print("Committing changes...")
run_command('git commit -m "Remove large gallery images from git tracking to reduce repo size"')

# Push to GitHub
print("Pushing to GitHub...")
success = run_command("git push origin main")

if success:
    print("✅ Successfully pushed EDJS website to GitHub!")
else:
    print("❌ Push failed. Trying force push...")
    run_command("git push origin main --force")
