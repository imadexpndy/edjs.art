class AuthManager {
  constructor() {
    this.isAuthenticated = false;
    this.user = null;
    this.checkInterval = null;
    // Detect environment and set Hello Planet URL
    this.helloPlanetUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'http://localhost:5173' 
      : 'https://app.edjs.art';
  }

  async init() {
    console.log('EDJS - AuthManager init() called');
    
    // Wait for header to be loaded
    setTimeout(() => {
      // Try simple auth check first
      console.log('EDJS - Checking if SimpleAuth is available:', !!window.SimpleAuth);
      if (window.SimpleAuth) {
        console.log('EDJS - Creating SimpleAuth instance');
        const simpleAuth = new window.SimpleAuth();
        simpleAuth.init().then(authStatus => {
          if (authStatus.isAuthenticated) {
            console.log('EDJS - User authenticated via SimpleAuth');
            this.handleAuthResponse({
              isAuthenticated: true,
              user: authStatus.user
            });
          } else {
            console.log('EDJS - User not authenticated, checking URL parameters');
            this.checkUrlParameter();
          }
        });
      } else {
        console.log('EDJS - SimpleAuth not available, checking URL parameters');
        this.checkUrlParameter();
      }
      
      // Setup dropdown functionality
      this.setupDropdownFunctionality();
      
      // Update UI
      this.updateHeaderUI();
      this.updateReservationButtons();
      console.log('EDJS - AuthManager initialization complete');
    }, 500); // Wait 500ms for header to load
  }

  checkUrlParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    const loggedIn = urlParams.get('logged_in');
    const userEmail = urlParams.get('user_email');
    const userName = urlParams.get('user_name');
    
    console.log('EDJS - Checking URL parameters:');
    console.log('EDJS - Current URL:', window.location.href);
    console.log('EDJS - logged_in:', loggedIn);
    console.log('EDJS - user_email:', userEmail);
    console.log('EDJS - user_name:', userName);
    
    if (loggedIn === 'true') {
      console.log('EDJS - User logged in via Hello Planet, updating auth state');
      // User just logged in via Hello Planet
      const userData = {
        isAuthenticated: true,
        user: {
          email: userEmail || 'user@example.com',
          full_name: userName || userEmail || 'User',
          role: 'user'
        },
        timestamp: new Date().toISOString()
      };
      
      this.handleAuthResponse(userData);
      
      // Clean up URL parameters
      const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Store login state in sessionStorage for persistence
      sessionStorage.setItem('edjs_auth_status', JSON.stringify(userData));
    } else {
      console.log('EDJS - No login parameters, checking sessionStorage');
      // Check sessionStorage for existing login state
      const storedAuth = sessionStorage.getItem('edjs_auth_status');
      if (storedAuth) {
        try {
          const authData = JSON.parse(storedAuth);
          console.log('EDJS - Found stored auth data:', authData);
          // Check if stored auth is recent (within 24 hours)
          const authTime = new Date(authData.timestamp);
          const now = new Date();
          const hoursDiff = (now - authTime) / (1000 * 60 * 60);
          
          if (hoursDiff < 24) {
            this.handleAuthResponse(authData);
          } else {
            // Clear expired auth
            sessionStorage.removeItem('edjs_auth_status');
          }
        } catch (e) {
          sessionStorage.removeItem('edjs_auth_status');
        }
      }
    }
    
    // Force UI update after checking authentication
    setTimeout(() => {
      this.updateHeaderUI();
    }, 100);
  }

  async checkAuthStatus() {
    try {
      // Use simple JSONP for cross-domain request (no iframe to avoid firewall issues)
      const callbackName = 'authCallback_' + Date.now();
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          delete window[callbackName];
          if (script && script.parentNode) {
            document.head.removeChild(script);
          }
          console.warn('Auth check timeout - assuming not authenticated');
          this.handleAuthResponse({ isAuthenticated: false, user: null });
          resolve({ isAuthenticated: false, user: null });
        }, 10000); // 10 second timeout

        // Create callback function
        window[callbackName] = (data) => {
          clearTimeout(timeout);
          this.handleAuthResponse(data);
          // Cleanup
          delete window[callbackName];
          if (script && script.parentNode) {
            document.head.removeChild(script);
          }
          resolve(data);
        };

        // Create script tag for JSONP
        const script = document.createElement('script');
        script.src = `${this.helloPlanetUrl}/api/auth/status?callback=${callbackName}`;
        script.onerror = () => {
          clearTimeout(timeout);
          delete window[callbackName];
          if (script && script.parentNode) {
            document.head.removeChild(script);
          }
          console.warn('Auth check failed - assuming not authenticated');
          this.handleAuthResponse({ isAuthenticated: false, user: null });
          resolve({ isAuthenticated: false, user: null });
        };
        
        document.head.appendChild(script);
      });
    } catch (error) {
      console.error('Auth check failed:', error);
      this.handleAuthResponse({ isAuthenticated: false, user: null });
    }
  }

  handleAuthResponse(data) {
    const wasAuthenticated = this.isAuthenticated;
    this.isAuthenticated = data.isAuthenticated;
    this.user = data.user;

    // Update UI if auth status changed
    if (wasAuthenticated !== this.isAuthenticated) {
      this.updateHeaderUI();
      this.updateReservationButtons();
    }
  }

  updateHeaderUI() {
    const loginButtons = document.querySelectorAll('.auth-login-btn, .auth-register-btn');
    const userDropdown = document.getElementById('user-dropdown');

    console.log('EDJS - updateHeaderUI called, isAuthenticated:', this.isAuthenticated);
    console.log('EDJS - Found login buttons:', loginButtons.length);

    if (this.isAuthenticated) {
      // Hide login/register buttons
      loginButtons.forEach(btn => {
        console.log('EDJS - Hiding button:', btn);
        btn.style.display = 'none';
      });

      // Show user dropdown
      if (userDropdown) {
        userDropdown.style.display = 'block';
        this.updateUserDropdown();
      } else {
        this.createUserDropdown();
      }
    } else {
      // Show login/register buttons
      loginButtons.forEach(btn => {
        btn.style.display = 'inline-flex';
      });

      // Hide user dropdown
      if (userDropdown) {
        userDropdown.style.display = 'none';
      }
    }
  }

  createUserDropdown() {
    const headerActions = document.querySelector('.header-actions, .navbar-nav, .nav-menu, .auth-section');
    if (!headerActions) {
      console.log('EDJS - No header container found for dropdown');
      return;
    }

    const dropdownHTML = `
      <div id="user-dropdown" class="user-dropdown" style="display: block;">
        <div class="user-avatar" onclick="authManager.toggleDropdown()">
          <i class="fas fa-user-circle" style="color: #28a745; font-size: 24px;"></i>
          <i class="fas fa-chevron-down dropdown-arrow"></i>
        </div>
        <div class="dropdown-menu" id="user-dropdown-menu">
          <a href="${this.helloPlanetUrl}/spectacles" class="dropdown-item">
            <i class="fas fa-theater-masks"></i> Spectacles
          </a>
          <a href="${this.helloPlanetUrl}/my-reservations" class="dropdown-item">
            <i class="fas fa-ticket-alt"></i> Réservations
          </a>
          <a href="${this.helloPlanetUrl}/profile" class="dropdown-item">
            <i class="fas fa-user"></i> Profil
          </a>
          <div class="dropdown-divider"></div>
          <a href="${this.helloPlanetUrl}/help" class="dropdown-item">
            <i class="fas fa-question-circle"></i> Aide et support
          </a>
          <div class="dropdown-divider"></div>
          <a href="#" onclick="authManager.logout()" class="dropdown-item logout">
            <i class="fas fa-sign-out-alt"></i> Déconnexion
          </a>
        </div>
      </div>
    `;

    headerActions.insertAdjacentHTML('beforeend', dropdownHTML);
    this.addDropdownStyles();
  }

  updateUserDropdown() {
    const userName = document.querySelector('.user-name');
    if (userName && this.user) {
      userName.textContent = this.user.full_name || this.user.email;
    }
  }

  toggleDropdown() {
    const dropdownMenu = document.getElementById('user-dropdown-menu');
    if (dropdownMenu) {
      dropdownMenu.classList.toggle('show');
    }
  }

  logout() {
    // Clear local auth state
    this.isAuthenticated = false;
    this.user = null;
    sessionStorage.removeItem('edjs_auth_status');
    
    // Update UI
    this.updateHeaderUI();
    this.updateReservationButtons();
    
    // Redirect to Hello Planet logout
    window.open(`${this.helloPlanetUrl}/auth?mode=logout`, '_blank');
  }

  updateReservationButtons() {
    const reserveButtons = document.querySelectorAll('.reserve-btn');
    console.log('EDJS - Found reservation buttons:', reserveButtons.length);
    
    reserveButtons.forEach(button => {
      const spectacleId = button.getAttribute('data-spectacle-id');
      console.log('EDJS - Setting up button for spectacle:', spectacleId);
      
      if (this.isAuthenticated) {
        button.textContent = 'Réserver maintenant';
        button.onclick = () => {
          window.open(`${this.helloPlanetUrl}/reservation/${spectacleId}`, '_blank');
        };
      } else {
        button.textContent = 'Réserver';
        button.onclick = () => {
          // Add return URL to redirect back after login
          const returnUrl = encodeURIComponent(window.location.href);
          const authUrl = `${this.helloPlanetUrl}/auth?return_url=${returnUrl}`;
          console.log('EDJS - Redirecting to:', authUrl);
          console.log('EDJS - Return URL:', window.location.href);
          console.log('EDJS - Encoded return URL:', returnUrl);
          window.location.href = authUrl; // Use same tab instead of new tab
        };
      }
    });
  }

  getSpectacleIdFromPage() {
    // Extract spectacle ID from current page URL or content
    const url = window.location.pathname;
    if (url.includes('spectacle-le-petit-prince')) return 'le-petit-prince';
    if (url.includes('spectacle-casse-noisette')) return 'casse-noisette';
    if (url.includes('spectacle-charlotte')) return 'charlotte';
    if (url.includes('spectacle-antigone')) return 'antigone';
    if (url.includes('spectacle-estevanico')) return 'estevanico';
    if (url.includes('spectacle-alice')) return 'alice-chez-les-merveilles';
    if (url.includes('spectacle-leau-la')) return 'leau-la';
    if (url.includes('spectacle-lenfant-de-larbre')) return 'lenfant-de-larbre';
    if (url.includes('spectacle-simple-comme-bonjour')) return 'simple-comme-bonjour';
    if (url.includes('spectacle-tara-sur-la-lune')) return 'tara-sur-la-lune';
    return 'general';
  }

  redirectToReservation(spectacleId) {
    const reservationUrl = `${this.helloPlanetUrl}/reservation/${spectacleId}`;
    window.open(reservationUrl, '_blank');
  }

  redirectToAuth() {
    const authUrl = `${this.helloPlanetUrl}/auth?mode=login&redirect=${encodeURIComponent(window.location.href)}`;
    window.open(authUrl, '_blank');
  }

  addDropdownStyles() {
    if (document.getElementById('auth-dropdown-styles')) return;

    const styles = `
      <style id="auth-dropdown-styles">
        .user-dropdown {
          position: relative;
          display: inline-block;
          margin-left: 15px;
        }

        .user-avatar {
          display: flex;
          align-items: center;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 25px;
          background: rgba(40, 167, 69, 0.1);
          transition: all 0.3s ease;
        }

        .user-avatar:hover {
          background: rgba(40, 167, 69, 0.2);
          transform: translateY(-2px);
        }

        .dropdown-arrow {
          margin-left: 8px;
          font-size: 12px;
          color: #28a745;
          transition: transform 0.3s ease;
        }

        .user-dropdown.active .dropdown-arrow {
          transform: rotate(180deg);
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          min-width: 200px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.3s ease;
          z-index: 1000;
          border: 1px solid rgba(40, 167, 69, 0.2);
        }

        .dropdown-menu.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          color: #333;
          text-decoration: none;
          transition: all 0.3s ease;
          font-family: 'Raleway', sans-serif;
          font-size: 14px;
        }

        .dropdown-item:hover {
          background: rgba(40, 167, 69, 0.1);
          color: #28a745;
          text-decoration: none;
        }

        .dropdown-item i {
          margin-right: 10px;
          width: 16px;
          color: #28a745;
        }

        .dropdown-divider {
          height: 1px;
          background: rgba(40, 167, 69, 0.2);
          margin: 8px 0;
        }

        .dropdown-item.logout {
          color: #dc3545;
        }

        .dropdown-item.logout:hover {
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
        }

        .dropdown-item.logout i {
          color: #dc3545;
        }

        .reserve-btn.auth-required {
          background: #6c757d;
          border-color: #6c757d;
        }

        .reserve-btn.reservation-enabled {
          background: #28a745;
          border-color: #28a745;
        }

        .reserve-btn.reservation-enabled:hover {
          background: #218838;
          border-color: #1e7e34;
          transform: translateY(-2px);
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
  }

  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}

// Test function to simulate logged in state
window.testAuthState = function() {
  console.log('EDJS - Testing authentication state');
  if (window.authManager) {
    const testUserData = {
      isAuthenticated: true,
      user: {
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'user'
      },
      timestamp: new Date().toISOString()
    };
    
    sessionStorage.setItem('edjs_auth_status', JSON.stringify(testUserData));
    window.authManager.handleAuthResponse(testUserData);
    console.log('EDJS - Test auth state set, updating UI');
  }
};

// Initialize auth manager when DOM is loaded
console.log('EDJS - auth-manager.js script loaded');

document.addEventListener('DOMContentLoaded', () => {
  console.log('EDJS - DOM loaded, initializing AuthManager');
  try {
    window.authManager = new AuthManager();
    window.authManager.init();
    
    // Add test button to page for debugging
    setTimeout(() => {
      const testButton = document.createElement('button');
      testButton.innerHTML = 'Test Auth State';
      testButton.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999; background: red; color: white; padding: 10px; border: none; cursor: pointer;';
      testButton.onclick = window.testAuthState;
      document.body.appendChild(testButton);
    }, 1000);
    
  } catch (error) {
    console.error('EDJS - Error initializing AuthManager:', error);
  }
});

// Also try immediate initialization if DOM is already loaded
if (document.readyState === 'loading') {
  console.log('EDJS - DOM still loading, waiting for DOMContentLoaded');
} else {
  console.log('EDJS - DOM already loaded, initializing immediately');
  try {
    window.authManager = new AuthManager();
    window.authManager.init();
  } catch (error) {
    console.error('EDJS - Error in immediate initialization:', error);
  }
}

// Setup dropdown functionality globally
function setupDropdownFunctionality() {
    // User dropdown functionality
    const userDropdownBtn = document.getElementById('userDropdownBtn');
    const userDropdownMenu = document.getElementById('userDropdownMenu');
    const logoutBtn = document.getElementById('logoutBtn');

    if (userDropdownBtn && userDropdownMenu) {
      userDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdownMenu.classList.toggle('show');
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', () => {
        userDropdownMenu.classList.remove('show');
      });

      userDropdownMenu.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          // Clear authentication state
          this.isAuthenticated = false;
          this.user = null;
          
          // Update UI to show logged out state
          this.updateHeaderUI();
          
          // Redirect to Hello Planet logout
          window.location.href = `${this.helloPlanetUrl}/auth?logout=true`;
        } catch (error) {
          console.error('EDJS - Logout error:', error);
          // Fallback: just redirect to main site
          window.location.href = '/';
        }
      });
    }
}

// Call setup function when DOM is ready
document.addEventListener('DOMContentLoaded', setupDropdownFunctionality);

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('user-dropdown');
  const dropdownMenu = document.getElementById('user-dropdown-menu');
  
  if (dropdown && !dropdown.contains(e.target) && dropdownMenu) {
    dropdownMenu.classList.remove('show');
  }
});
