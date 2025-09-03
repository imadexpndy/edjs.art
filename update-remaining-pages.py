#!/usr/bin/env python3
import os
import re

# Read standard header and footer
with open('standard-header.html', 'r', encoding='utf-8') as f:
    standard_header = f.read()

with open('standard-footer.html', 'r', encoding='utf-8') as f:
    standard_footer = f.read()

# Files that need manual updates
remaining_files = [
    'gallery.html',
    'spectacle-alice-chez-les-merveilles.html',
    'spectacle-antigone.html', 
    'spectacle-casse-noisette.html',
    'spectacle-charlotte.html',
    'spectacle-estevanico.html',
    'spectacle-le-petit-prince.html',
    'spectacle-leau-la.html',
    'spectacle-lenfant-de-larbre.html',
    'spectacle-simple-comme-bonjour.html',
    'spectacle-tara-sur-la-lune.html'
]

def update_page_headers_footers(filename):
    print(f"Processing: {filename}")
    
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add mobile menu if missing
    if 'vs-menu-wrapper' not in content:
        # Insert mobile menu after <body>
        body_pattern = r'<body[^>]*>'
        if re.search(body_pattern, content):
            content = re.sub(body_pattern, lambda m: f'{m.group(0)}\n  <!--==============================\n\t\tMobile Menu\n\t==============================-->\n  <div class="vs-menu-wrapper">\n    <div class="vs-menu-area text-center">\n      <div class="mobile-logo">\n        <a href="/"><img src="assets/img/edjs logo black@4x.png" alt="L\'École des jeunes spectateurs" class="logo" style="height: 120px; width: auto; max-width: none !important;"></a>\n        <button class="vs-menu-toggle">\n          <i class="fa-solid fa-xmark"></i>\n        </button>\n      </div>\n      <div class="vs-header__right pt-4">\n        <button class="searchBoxTggler" type="button">\n          <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">\n            <path d="M20.4174 16.6954L17.2213 13.4773C19.3155 10.0703 18.8936 5.54217 15.9593 2.58766C12.5328 -0.862552 6.9769 -0.862552 3.55037 2.58766C0.123835 6.03787 0.123835 11.6322 3.55037 15.0824C6.5354 18.088 11.1341 18.4736 14.5333 16.2469L17.7019 19.4335C18.4521 20.1888 19.6711 20.1888 20.4213 19.4335C21.1675 18.6781 21.1675 17.4507 20.4174 16.6954ZM5.711 12.9029C3.48395 10.6604 3.48395 7.00959 5.711 4.76715C7.93805 2.52471 11.5638 2.52471 13.7909 4.76715C16.018 7.00959 16.018 10.6604 13.7909 12.9029C11.5638 15.1453 7.93805 15.1453 5.711 12.9029Z" fill="#F6F5F5"></path>\n          </svg>\n        </button>\n        <button class="sideMenuToggler" type="button">\n          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">\n            <path d="M12.4307 36H4.16306C1.86757 36 0 34.1324 0 31.8369V23.5693C0 21.2738 1.86757 19.4062 4.16306 19.4062H12.4307C14.7262 19.4062 16.5938 21.2738 16.5938 23.5693V31.8369C16.5938 34.1324 14.7262 36 12.4307 36ZM13.7812 23.5693C13.7812 22.8246 13.1754 22.2188 12.4307 22.2188H4.16306C3.41838 22.2188 2.8125 22.8246 2.8125 23.5693V31.8369C2.8125 32.5816 3.41838 33.1875 4.16306 33.1875H12.4307C13.1754 33.1875 13.7812 32.5816 13.7812 31.8369V23.5693Z" fill="#4A2559"></path>\n            <path d="M31.7812 36H23.625C21.2988 36 19.4062 34.1075 19.4062 31.7812V23.625C19.4062 21.2988 21.2988 19.4062 23.625 19.4062H31.7812C34.1075 19.4062 36 21.2988 36 23.625V31.7812C36 34.1075 34.1075 36 31.7812 36ZM33.1875 23.625C33.1875 22.8496 32.5567 22.2188 31.7812 22.2188H23.625C22.8496 22.2188 22.2188 22.8496 22.2188 23.625V31.7812C22.2188 32.5567 22.8496 33.1875 23.625 33.1875H31.7812C32.5567 33.1875 33.1875 32.5567 33.1875 31.7812V23.625Z" fill="#D18109"></path>\n            <path d="M12.4307 16.5938H4.16306C1.86757 16.5938 0 14.7262 0 12.4307V4.16306C0 1.86757 1.86757 0 4.16306 0H12.4307C14.7262 0 16.5938 1.86757 16.5938 4.16306V12.4307C16.5938 14.7262 14.7262 16.5938 12.4307 16.5938ZM13.7812 4.16306C13.7812 3.41838 13.1754 2.8125 12.4307 2.8125H4.16306C3.41838 2.8125 2.8125 3.41838 2.8125 4.16306V12.4307C2.8125 13.1754 3.41838 13.7812 4.16306 13.7812H12.4307C13.1754 13.7812 13.7812 13.1754 13.7812 12.4307V4.16306Z" fill="#D18109"></path>\n            <path d="M31.7812 16.5938H23.625C21.2988 16.5938 19.4062 14.7012 19.4062 12.375V4.21875C19.4062 1.89253 21.2988 0 23.625 0H31.7812C34.1075 0 36 1.89253 36 4.21875V12.375C36 14.7012 34.1075 16.5938 31.7812 16.5938ZM33.1875 4.21875C33.1875 3.44334 32.5567 2.8125 31.7812 2.8125H23.625C22.8496 2.8125 22.2188 3.44334 22.2188 4.21875V12.375C22.2188 13.1504 22.8496 13.7812 23.625 13.7812H31.7812C32.5567 13.7812 33.1875 13.1504 33.1875 12.375V4.21875Z" fill="#4A2559"></path>\n          </svg>\n        </button>\n      </div>\n      <div class="vs-mobile-menu">\n        <ul>\n          <li class="menu-item-has-children">\n            <a class="vs-svg-assets" href="/">\n              ACCUEIL\n              <svg xmlns="http://www.w3.org/2000/svg" width="87" height="31" viewBox="0 0 87 31" fill="none">\n                <path d="M0 4.14031C0 1.87713 1.87602 0.0646902 4.13785 0.142684L83.1379 2.86682C85.2921 2.94111 87 4.70896 87 6.86445V25.0909C87 27.2642 85.2647 29.0399 83.0919 29.0898L4.09193 30.9059C1.84739 30.9575 0 29.1521 0 26.907V4.14031Z" fill="#70167E"></path>\n              </svg>\n            </a>\n            <ul class="sub-menu">\n              <li><a href="/">Home</a></li>\n            </ul>\n          </li>\n          <li class="menu-item-has-children">\n            <a class="vs-svg-assets" href="about.html">\n              À PROPOS\n              <svg xmlns="http://www.w3.org/2000/svg" width="87" height="31" viewBox="0 0 87 31" fill="none">\n                <path d="M0 4.14031C0 1.87713 1.87602 0.0646902 4.13785 0.142684L83.1379 2.86682C85.2921 2.94111 87 4.70896 87 6.86445V25.0909C87 27.2642 85.2647 29.0399 83.0919 29.0898L4.09193 30.9059C1.84739 30.9575 0 29.1521 0 26.907V4.14031Z" fill="#70167E"></path>\n              </svg>\n            </a>\n            <ul class="sub-menu">\n              <li><a href="about.html">About Us</a></li>\n              <li><a href="why-choose-us">Why Choose Us</a></li>\n              <li><a href="service-details">Service Details</a></li>\n            </ul>\n          </li>\n          <li class="menu-item-has-children">\n            <a class="vs-svg-assets" href="spectacles.html">\n              SPECTACLES\n              <svg xmlns="http://www.w3.org/2000/svg" width="87" height="31" viewBox="0 0 87 31" fill="none">\n                <path d="M0 4.14031C0 1.87713 1.87602 0.0646902 4.13785 0.142684L83.1379 2.86682C85.2921 2.94111 87 4.70896 87 6.86445V25.0909C87 27.2642 85.2647 29.0399 83.0919 29.0898L4.09193 30.9059C1.84739 30.9575 0 29.1521 0 26.907V4.14031Z" fill="#70167E"></path>\n              </svg>\n            </a>\n            <ul class="sub-menu">\n              <li><a href="spectacles.html">Spectacles</a></li>\n            </ul>\n          </li>\n          <li class="menu-item-has-children">\n            <a class="vs-svg-assets" href="gallery.html">\n              GALERIE\n              <svg xmlns="http://www.w3.org/2000/svg" width="87" height="31" viewBox="0 0 87 31" fill="none">\n                <path d="M0 4.14031C0 1.87713 1.87602 0.0646902 4.13785 0.142684L83.1379 2.86682C85.2921 2.94111 87 4.70896 87 6.86445V25.0909C87 27.2642 85.2647 29.0399 83.0919 29.0898L4.09193 30.9059C1.84739 30.9575 0 29.1521 0 26.907V4.14031Z" fill="#70167E"></path>\n              </svg>\n            </a>\n            <ul class="sub-menu">\n              <li><a href="gallery.html">Gallery</a></li>\n            </ul>\n          </li>\n          <li class="menu-item-has-children">\n            <a class="vs-svg-assets" href="partners.html">\n              PARTENAIRES\n              <svg xmlns="http://www.w3.org/2000/svg" width="87" height="31" viewBox="0 0 87 31" fill="none">\n                <path d="M0 4.14031C0 1.87713 1.87602 0.0646902 4.13785 0.142684L83.1379 2.86682C85.2921 2.94111 87 4.70896 87 6.86445V25.0909C87 27.2642 85.2647 29.0399 83.0919 29.0898L4.09193 30.9059C1.84739 30.9575 0 29.1521 0 26.907V4.14031Z" fill="#70167E"></path>\n              </svg>\n            </a>\n            <ul class="sub-menu">\n              <li><a href="partners.html">Partners</a></li>\n            </ul>\n          </li>\n          <li class="menu-item-has-children">\n            <a class="vs-svg-assets" href="blog.html">\n              BLOG\n              <svg xmlns="http://www.w3.org/2000/svg" width="87" height="31" viewBox="0 0 87 31" fill="none">\n                <path d="M0 4.14031C0 1.87713 1.87602 0.0646902 4.13785 0.142684L83.1379 2.86682C85.2921 2.94111 87 4.70896 87 6.86445V25.0909C87 27.2642 85.2647 29.0399 83.0919 29.0898L4.09193 30.9059C1.84739 30.9575 0 29.1521 0 26.907V4.14031Z" fill="#70167E"></path>\n              </svg>\n            </a>\n            <ul class="sub-menu">\n              <li><a href="blog.html">Blog</a></li>\n              <li><a href="blog-details">Blog Details</a></li>\n            </ul>\n          </li>\n          <li>\n            <a class="vs-svg-assets" href="contact.html">\n              CONTACT\n              <svg xmlns="http://www.w3.org/2000/svg" width="87" height="31" viewBox="0 0 87 31" fill="none">\n                <path d="M0 4.14031C0 1.87713 1.87602 0.0646902 4.13785 0.142684L83.1379 2.86682C85.2921 2.94111 87 4.70896 87 6.86445V25.0909C87 27.2642 85.2647 29.0399 83.0919 29.0898L4.09193 30.9059C1.84739 30.9575 0 29.1521 0 26.907V4.14031Z" fill="#70167E"></path>\n              </svg>\n            </a>\n          </li>\n        </ul>\n        <div class="mobile-contact-info" style="padding: 20px; border-top: 1px solid #eee; margin-top: 20px;">\n          <h4 style="color: #7e8a01; margin-bottom: 15px; font-size: 16px;">L\'École des jeunes spectateurs - Culture Pour Tous</h4>\n          <p style="font-size: 14px; margin-bottom: 10px; color: #666;">Connecter la culture au Maroc à travers des spectacles théâtraux pour écoles, associations, familles et partenaires.</p>\n          <div style="margin-bottom: 8px;">\n            <i class="fa-solid fa-envelope" style="color: #7e8a01; margin-right: 8px;"></i>\n            <a href="mailto:contact@L\'École des jeunes spectateurs.ma" style="color: #333; text-decoration: none; font-size: 14px;">contact@L\'École des jeunes spectateurs.ma</a>\n          </div>\n          <div style="margin-bottom: 8px;">\n            <i class="fa-solid fa-phone" style="color: #7e8a01; margin-right: 8px;"></i>\n            <a href="tel:+212522123456" style="color: #333; text-decoration: none; font-size: 14px;">+212 522 123 456</a>\n          </div>\n          <div>\n            <i class="fa-brands fa-whatsapp" style="color: #7e8a01; margin-right: 8px;"></i>\n            <a href="https://wa.me/212522123456" style="color: #333; text-decoration: none; font-size: 14px;">WhatsApp</a>\n          </div>\n        </div>\n      </div>\n      <div class="px-20 py-20">\n        <div class="sidemenu-contact style2">\n          <ul>\n            <li>\n              <a href="tel:+212522123456" class="sidemenu-link">+212 522 123 456</a>\n            </li>\n            <li>\n              <a href="mailto:contact@L\'École des jeunes spectateurs.ma" class="sidemenu-link">contact@L\'École des jeunes spectateurs.ma</a>\n            </li>\n            <li>\n              <a href="/">Casablanca, Maroc</a>\n            </li>\n          </ul>\n        </div>\n        <div class="footer-social mb-20">\n          <a href="#"><i class="fab fa-facebook-f"></i></a>\n          <a href="https://twitter.com/"><i class="fa-brands fa-x-twitter"></i></a>\n          <a href="https://instagram.com/"><i class="fab fa-instagram"></i></a>\n          <a href="https://behance.com/"><i class="fab fa-behance"></i></a>\n        </div>\n        <p class="sidemenu-text sidemenu-text--footer text-center mb-0">Copyright © 2025 <a class="vs-theme-color" href="/">Toddly</a>.\n          All\n          rights reserved.\n        </p>\n      </div>\n    </div>\n  </div>', content)
            print(f"  ✓ Added mobile menu to {filename}")
    
    # Update header navigation to match standard
    nav_pattern = r'<nav class="main-menu[^>]*>.*?</nav>'
    standard_nav = '''<nav class="main-menu d-none d-lg-block">
                <ul>
                  <li>
                    <a class="vs-svg-assets" href="/">
                      ACCUEIL
                      <svg xmlns="http://www.w3.org/2000/svg" width="87" height="31" viewBox="0 0 87 31" fill="none">
                        <path d="M0 4.14031C0 1.87713 1.87602 0.0646902 4.13785 0.142684L83.1379 2.86682C85.2921 2.94111 87 4.70896 87 6.86445V25.0909C87 27.2642 85.2647 29.0399 83.0919 29.0898L4.09193 30.9059C1.84739 30.9575 0 29.1521 0 26.907V4.14031Z" fill="#70167E"></path>
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a class="vs-svg-assets" href="about.html">
                      À PROPOS
                      <svg xmlns="http://www.w3.org/2000/svg" width="87" height="31" viewBox="0 0 87 31" fill="none">
                        <path d="M0 4.14031C0 1.87713 1.87602 0.0646902 4.13785 0.142684L83.1379 2.86682C85.2921 2.94111 87 4.70896 87 6.86445V25.0909C87 27.2642 85.2647 29.0399 83.0919 29.0898L4.09193 30.9059C1.84739 30.9575 0 29.1521 0 26.907V4.14031Z" fill="#70167E"></path>
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a class="vs-svg-assets" href="spectacles.html">
                      SPECTACLES
                      <svg xmlns="http://www.w3.org/2000/svg" width="87" height="31" viewBox="0 0 87 31" fill="none">
                        <path d="M0 4.14031C0 1.87713 1.87602 0.0646902 4.13785 0.142684L83.1379 2.86682C85.2921 2.94111 87 4.70896 87 6.86445V25.0909C87 27.2642 85.2647 29.0399 83.0919 29.0898L4.09193 30.9059C1.84739 30.9575 0 29.1521 0 26.907V4.14031Z" fill="#70167E"></path>
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a class="vs-svg-assets" href="gallery.html">
                      GALERIE
                      <svg xmlns="http://www.w3.org/2000/svg" width="87" height="31" viewBox="0 0 87 31" fill="none">
                        <path d="M0 4.14031C0 1.87713 1.87602 0.0646902 4.13785 0.142684L83.1379 2.86682C85.2921 2.94111 87 4.70896 87 6.86445V25.0909C87 27.2642 85.2647 29.0399 83.0919 29.0898L4.09193 30.9059C1.84739 30.9575 0 29.1521 0 26.907V4.14031Z" fill="#70167E"></path>
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a class="vs-svg-assets" href="partners.html">
                      PARTENAIRES
                      <svg xmlns="http://www.w3.org/2000/svg" width="87" height="31" viewBox="0 0 87 31" fill="none">
                        <path d="M0 4.14031C0 1.87713 1.87602 0.0646902 4.13785 0.142684L83.1379 2.86682C85.2921 2.94111 87 4.70896 87 6.86445V25.0909C87 27.2642 85.2647 29.0399 83.0919 29.0898L4.09193 30.9059C1.84739 30.9575 0 29.1521 0 26.907V4.14031Z" fill="#70167E"></path>
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a class="vs-svg-assets" href="blog.html">
                      BLOG
                      <svg xmlns="http://www.w3.org/2000/svg" width="87" height="31" viewBox="0 0 87 31" fill="none">
                        <path d="M0 4.14031C0 1.87713 1.87602 0.0646902 4.13785 0.142684L83.1379 2.86682C85.2921 2.94111 87 4.70896 87 6.86445V25.0909C87 27.2642 85.2647 29.0399 83.0919 29.0898L4.09193 30.9059C1.84739 30.9575 0 29.1521 0 26.907V4.14031Z" fill="#70167E"></path>
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a class="vs-svg-assets" href="contact.html">
                      CONTACT
                      <svg xmlns="http://www.w3.org/2000/svg" width="87" height="31" viewBox="0 0 87 31" fill="none">
                        <path d="M0 4.14031C0 1.87713 1.87602 0.0646902 4.13785 0.142684L83.1379 2.86682C85.2921 2.94111 87 4.70896 87 6.86445V25.0909C87 27.2642 85.2647 29.0399 83.0919 29.0898L4.09193 30.9059C1.84739 30.9575 0 29.1521 0 26.907V4.14031Z" fill="#70167E"></path>
                      </svg>
                    </a>
                  </li>
                </ul>
              </nav>'''
    
    if re.search(nav_pattern, content, re.DOTALL):
        content = re.sub(nav_pattern, standard_nav, content, flags=re.DOTALL)
        print(f"  ✓ Updated navigation in {filename}")
    
    # Update footer if it exists
    footer_pattern = r'<div class="vs-footer bg-title">.*?</div>\s*<!--\*+\s*Back To Top'
    if re.search(footer_pattern, content, re.DOTALL):
        content = re.sub(footer_pattern, f'{standard_footer}\n  <!--********************************\n\t\t\tBack To Top', content, flags=re.DOTALL)
        print(f"  ✓ Updated footer in {filename}")
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True

# Process remaining files
for filename in remaining_files:
    if os.path.exists(filename):
        update_page_headers_footers(filename)
    else:
        print(f"✗ File not found: {filename}")

print("\nAll remaining pages updated!")
