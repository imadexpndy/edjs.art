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

  init() {
    // Check for URL parameter first
    this.checkUrlParameter();
    this.checkAuthStatus();
    // Check auth status every 30 seconds
    this.checkInterval = setInterval(() => {
      this.checkAuthStatus();
    }, 30000);
  }

  checkUrlParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    const loggedIn = urlParams.get('logged_in');
    const userEmail = urlParams.get('user_email');
    const userName = urlParams.get('user_name');
    
    if (loggedIn === 'true') {
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
      // Check sessionStorage for existing login state
      const storedAuth = sessionStorage.getItem('edjs_auth_status');
      if (storedAuth) {
        try {
          const authData = JSON.parse(storedAuth);
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

    if (this.isAuthenticated) {
      // Hide login/register buttons
      loginButtons.forEach(btn => {
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
    const headerActions = document.querySelector('.header-actions, .navbar-nav');
    if (!headerActions) return;

    const dropdownHTML = `
      <div id="user-dropdown" class="user-dropdown" style="display: block;">
        <div class="user-avatar" onclick="authManager.toggleDropdown()">
          <i class="fas fa-user-circle" style="color: #28a745; font-size: 24px;"></i>
          <i class="fas fa-chevron-down dropdown-arrow"></i>
        </div>
        <div class="dropdown-menu" id="user-dropdown-menu">
          <a href="${this.helloPlanetUrl}/profile" class="dropdown-item">
            <i class="fas fa-user"></i> Profil
          </a>
          <a href="${this.helloPlanetUrl}/dashboard" class="dropdown-item">
            <i class="fas fa-tachometer-alt"></i> Tableau de bord
          </a>
          <a href="${this.helloPlanetUrl}/settings" class="dropdown-item">
            <i class="fas fa-cog"></i> Paramètres
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
    reserveButtons.forEach(button => {
      const spectacleId = button.getAttribute('data-spectacle-id');
      
      if (this.isAuthenticated) {
        button.textContent = 'Réserver maintenant';
        button.onclick = () => {
          window.open(`${this.helloPlanetUrl}/reservation/${spectacleId}`, '_blank');
        };
      } else {
        button.textContent = 'Se connecter pour réserver';
        button.onclick = () => {
          // Add return URL to redirect back after login
          const returnUrl = encodeURIComponent(window.location.href);
          const authUrl = `${this.helloPlanetUrl}/auth?return_url=${returnUrl}`;
          console.log('EDJS - Redirecting to:', authUrl);
          console.log('EDJS - Return URL:', window.location.href);
          window.open(authUrl, '_blank');
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

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.authManager = new AuthManager();
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('user-dropdown');
  const dropdownMenu = document.getElementById('user-dropdown-menu');
  
  if (dropdown && !dropdown.contains(e.target) && dropdownMenu) {
    dropdownMenu.classList.remove('show');
  }
});
