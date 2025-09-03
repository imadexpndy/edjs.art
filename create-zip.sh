
#!/bin/bash

# Create a zip file with all project files
zip -r edjs-website.zip . -x "*.git*" "node_modules/*" ".replit" "replit.nix" "create-zip.sh"

echo "Project has been zipped to edjs-website.zip"
ls -lh edjs-website.zip
