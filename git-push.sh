#!/bin/bash
cd /Users/Imad/Downloads/edjs-site1

echo "Removing large gallery directories from git tracking..."
git rm -r --cached assets/img/gallery/ 2>/dev/null || echo "Gallery directory not in git cache"
git rm -r --cached attached_assets/ 2>/dev/null || echo "Attached assets directory not in git cache"

echo "Adding .gitignore changes..."
git add .gitignore

echo "Committing changes..."
git commit -m "Remove large gallery images from git tracking to reduce repo size"

echo "Pushing to GitHub..."
git push origin main

echo "Done!"
