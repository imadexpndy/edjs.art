# Toddly Template - Development Guide

## 🚀 Local Development Setup

### Current Setup
- **Development Directory**: `~/Development/toddly-dev/`
- **Local Server**: Python HTTP Server on port 8080
- **Access URL**: http://localhost:8080

### Quick Start
```bash
cd ~/Development/toddly-dev
python3 -m http.server 8080
```

## 📁 Project Structure

```
toddly-dev/
├── index.html              # Main homepage
├── assets/
│   ├── css/                # Stylesheets (Bootstrap, custom styles)
│   ├── js/                 # JavaScript files (GSAP, jQuery, custom)
│   ├── img/                # All images organized by sections
│   ├── fonts/              # FontAwesome web fonts
│   └── sass/               # SASS source files for customization
├── mail.php                # Contact form handler
└── [30+ HTML pages]        # All template pages
```

## 🛠️ Development Workflow

### Making Changes
1. **Edit HTML files** directly in the development directory
2. **Modify CSS**: Edit `/assets/sass/` files and recompile, or edit `/assets/css/style.css` directly
3. **Update JavaScript**: Modify files in `/assets/js/`
4. **Replace Images**: Update files in `/assets/img/`

### Testing Changes
- Refresh browser at http://localhost:8080
- Changes to HTML/CSS/JS are immediately visible
- No build process required for basic changes

### Key Files to Customize
- `index.html` - Main homepage
- `assets/css/style.css` - Main stylesheet
- `assets/js/main.js` - Custom JavaScript
- `assets/img/` - Replace with your images

## 🎨 Customization Tips

### Colors & Branding
- Edit CSS custom properties in `assets/css/style.css`
- Replace logo images in `assets/img/`
- Update favicon files

### Content
- Replace placeholder text in HTML files
- Update contact information
- Modify navigation menus

### Images
- Maintain aspect ratios when replacing images
- Optimize images for web (use WebP when possible)
- Update alt text for accessibility

## 📧 Contact Form (PHP)
- Requires PHP server for `mail.php` to work
- Currently configured to send to: `info@vecuro.com`
- Update email address in `mail.php` line 23

## 🚀 Deployment Preparation
1. Test all pages locally
2. Optimize images
3. Minify CSS/JS (optional)
4. Update contact form email
5. Test contact form functionality
6. Push changes to GitHub repository

## 📝 Git Workflow
```bash
# After making changes
git add .
git commit -m "Description of changes"
git push origin main
```

## 🔧 Advanced Development

### SASS Compilation (Optional)
If you want to modify SASS files:
```bash
# Install SASS
npm install -g sass

# Watch for changes
sass --watch assets/sass:assets/css
```

### PHP Development Server (For Contact Form)
```bash
# Use PHP built-in server instead of Python
php -S localhost:8080
```
