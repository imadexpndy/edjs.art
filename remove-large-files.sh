#!/bin/bash

# Remove large gallery directories from git tracking
git rm -r --cached assets/img/gallery/ 2>/dev/null || true
git rm -r --cached attached_assets/ 2>/dev/null || true

# Add the updated .gitignore
git add .gitignore

# Commit the changes
git commit -m "Remove large gallery images from git tracking to reduce repo size"

# Push to GitHub
git push origin main
