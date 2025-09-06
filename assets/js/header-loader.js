// Header Template Loader - Automatically loads header on all pages
document.addEventListener('DOMContentLoaded', function() {
  // Load header template
  fetch('/standard-header.html')
    .then(response => response.text())
    .then(headerHTML => {
      // Insert header at the beginning of body
      document.body.insertAdjacentHTML('afterbegin', headerHTML);
      
      // Initialize header functionality
      initializeHeader();
      
      // Initialize auth manager after header is loaded
      if (window.authManager) {
        setTimeout(() => {
          window.authManager.updateHeaderUI();
        }, 100);
      }
    })
    .catch(error => {
      console.error('Error loading header template:', error);
    });
});

function initializeHeader() {
  const header = document.getElementById('main-header');
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const mobileOverlay = document.getElementById('mobileMenuOverlay');
  const mobileClose = document.getElementById('mobileMenuClose');

  // Header scroll effect
  window.addEventListener('scroll', function() {
    if (window.scrollY > 100) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (mobileToggle) {
    mobileToggle.addEventListener('click', function() {
      if (mobileOverlay) {
        mobileOverlay.style.display = 'block';
        setTimeout(() => mobileOverlay.classList.add('active'), 10);
      }
    });
  }

  // Close mobile menu
  if (mobileClose) {
    mobileClose.addEventListener('click', closeMobileMenu);
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', function(e) {
      if (e.target === mobileOverlay) {
        closeMobileMenu();
      }
    });
  }

  function closeMobileMenu() {
    if (mobileOverlay) {
      mobileOverlay.classList.remove('active');
      setTimeout(() => mobileOverlay.style.display = 'none', 300);
    }
  }

  // Set active menu item based on current page
  const currentPage = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '/' && href === '/') || 
        (currentPage.includes(href) && href !== '/')) {
      link.classList.add('active');
    }
  });
}
