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
    const userType = urlParams.get('user_type');
    const professionalType = urlParams.get('professional_type');
    
    console.log('EDJS - Checking URL parameters:');
    console.log('EDJS - Current URL:', window.location.href);
    console.log('EDJS - logged_in:', loggedIn);
    console.log('EDJS - user_email:', userEmail);
    console.log('EDJS - user_name:', userName);
    console.log('EDJS - user_type:', userType);
    console.log('EDJS - professional_type:', professionalType);
    
    if (loggedIn === 'true') {
      console.log('EDJS - User logged in via Hello Planet, updating auth state');
      // User just logged in via Hello Planet
      const userData = {
        isAuthenticated: true,
        user: {
          email: userEmail || 'user@example.com',
          full_name: userName || userEmail || 'User',
          role: 'user',
          user_type: userType,
          professional_type: professionalType
        },
        timestamp: new Date().toISOString()
      };
      
      this.handleAuthResponse(userData);
      
      // Store user type information in sessionStorage for UI updates
      if (userType) {
        sessionStorage.setItem('userType', userType);
      }
      if (professionalType) {
        sessionStorage.setItem('professionalType', professionalType);
      }
      
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
            // Restore user type information
            if (authData.user && authData.user.user_type) {
              sessionStorage.setItem('userType', authData.user.user_type);
            }
            if (authData.user && authData.user.professional_type) {
              sessionStorage.setItem('professionalType', authData.user.professional_type);
            }
          } else {
            // Clear expired auth
            sessionStorage.removeItem('edjs_auth_status');
            sessionStorage.removeItem('userType');
            sessionStorage.removeItem('professionalType');
          }
        } catch (e) {
          sessionStorage.removeItem('edjs_auth_status');
          sessionStorage.removeItem('userType');
          sessionStorage.removeItem('professionalType');
        }
      }
    }
    
    // Force UI update after checking authentication
    setTimeout(() => {
      this.updateHeaderUI();
      this.updateAgeLevelDisplay();
      this.updateSessionsDisplay();
      this.addUserTypeIndicator();
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

  updateAgeLevelDisplay() {
    const ageLevelPill = document.getElementById('age-level-pill');
    const ageLevelText = document.getElementById('age-level-text');
    
    console.log('EDJS - updateAgeLevelDisplay called');
    console.log('EDJS - ageLevelPill found:', !!ageLevelPill);
    console.log('EDJS - ageLevelText found:', !!ageLevelText);
    
    if (!ageLevelPill || !ageLevelText) {
      console.log('EDJS - Age level elements not found on this page');
      return;
    }
    
    const userType = sessionStorage.getItem('userType');
    const professionalType = sessionStorage.getItem('professionalType');
    const authStatus = sessionStorage.getItem('edjs_auth_status');
    
    console.log('EDJS - SessionStorage contents:');
    console.log('EDJS - userType:', userType);
    console.log('EDJS - professionalType:', professionalType);
    console.log('EDJS - authStatus:', authStatus);
    console.log('EDJS - isAuthenticated:', this.isAuthenticated);
    
    // Check if user is a private school professional
    if (userType === 'professional' && professionalType === 'scolaire-privee') {
      // Show study levels for private schools
      ageLevelText.innerHTML = 'CM1, CM2, Collège';
      ageLevelPill.querySelector('i').className = 'fas fa-graduation-cap';
      console.log('EDJS - Updated to study levels for private school');
    } else if (userType === 'professional' && professionalType === 'scolaire-publique') {
      // Show study levels for public schools
      ageLevelText.innerHTML = 'CM1, CM2, Collège';
      ageLevelPill.querySelector('i').className = 'fas fa-school';
      console.log('EDJS - Updated to study levels for public school');
    } else if (userType === 'professional' && professionalType === 'association') {
      // Show age range for associations
      ageLevelText.innerHTML = '7 ans et +';
      ageLevelPill.querySelector('i').className = 'fas fa-users';
      console.log('EDJS - Updated to age range for association');
    } else {
      // Default to age for particuliers or non-authenticated users
      const originalText = ageLevelText.innerHTML;
      console.log('EDJS - Using default age display, original text was:', originalText);
      // Keep the original age text from the HTML
    }
  }

  updateSessionsDisplay() {
    const sessionsContainer = document.querySelector('.sidebar-card h3');
    if (!sessionsContainer || !sessionsContainer.innerHTML.includes('Séances Disponibles')) {
      console.log('EDJS - Sessions container not found on this page');
      return;
    }

    const spectacleId = this.getSpectacleIdFromPage();
    const userType = sessionStorage.getItem('userType');
    const professionalType = sessionStorage.getItem('professionalType');
    
    console.log('EDJS - Updating sessions for spectacle:', spectacleId, 'userType:', userType, 'professionalType:', professionalType);
    
    // Get sessions data based on user type
    const sessions = this.getSessionsForUserType(spectacleId, userType, professionalType);
    
    // Update the sessions display
    const sidebarCard = sessionsContainer.closest('.sidebar-card');
    if (sidebarCard) {
      // Clear existing sessions
      const existingSessions = sidebarCard.querySelectorAll('.showtime-item');
      existingSessions.forEach(item => item.remove());
      
      // Add new sessions
      sessions.forEach(session => {
        const sessionElement = this.createSessionElement(session);
        sidebarCard.appendChild(sessionElement);
      });
    }
  }

  getSessionsForUserType(spectacleId, userType, professionalType) {
    // Complete session data based on provided schedule
    const SESSIONS = [
      // LE PETIT PRINCE - OCTOBRE
      { id: 'lpp-1', date: '2025-10-04', time: '15:00', location: 'RABAT THEATRE BAHNINI', audienceType: 'tout-public', spectacleId: 'le-petit-prince', month: 'octobre' },
      { id: 'lpp-2', date: '2025-10-06', time: '09:30', location: 'RABAT THEATRE BAHNINI', audienceType: 'scolaire-privee', spectacleId: 'le-petit-prince', month: 'octobre' },
      { id: 'lpp-3', date: '2025-10-06', time: '14:30', location: 'RABAT THEATRE BAHNINI', audienceType: 'scolaire-privee', spectacleId: 'le-petit-prince', month: 'octobre' },
      { id: 'lpp-4', date: '2025-10-07', time: '14:30', location: 'RABAT THEATRE BAHNINI', audienceType: 'association', spectacleId: 'le-petit-prince', month: 'octobre' },
      { id: 'lpp-5', date: '2025-10-09', time: '09:30', location: 'CASABLANCA COMPLEXE EL HASSANI', audienceType: 'scolaire-publique', spectacleId: 'le-petit-prince', month: 'octobre' },
      { id: 'lpp-6', date: '2025-10-09', time: '14:30', location: 'CASABLANCA COMPLEXE EL HASSANI', audienceType: 'association', spectacleId: 'le-petit-prince', month: 'octobre' },
      { id: 'lpp-7', date: '2025-10-10', time: '09:30', location: 'CASABLANCA COMPLEXE EL HASSANI', audienceType: 'scolaire-privee', spectacleId: 'le-petit-prince', month: 'octobre' },
      { id: 'lpp-8', date: '2025-10-10', time: '14:30', location: 'CASABLANCA COMPLEXE EL HASSANI', audienceType: 'scolaire-privee', spectacleId: 'le-petit-prince', month: 'octobre' },
      { id: 'lpp-9', date: '2025-10-11', time: '15:00', location: 'CASABLANCA COMPLEXE EL HASSANI', audienceType: 'tout-public', spectacleId: 'le-petit-prince', month: 'octobre' },
      
      // TARA SUR LA LUNE
      { id: 'tsl-1', date: '2025-10-13', time: '14:30', location: 'CASABLANCA COMPLEXE EL HASSANI', audienceType: 'scolaire-privee', spectacleId: 'tara-sur-la-lune', month: 'octobre' },
      { id: 'tsl-2', date: '2025-10-14', time: '09:30', location: 'CASABLANCA COMPLEXE EL HASSANI', audienceType: 'scolaire-publique', spectacleId: 'tara-sur-la-lune', month: 'octobre' },
      { id: 'tsl-3', date: '2025-10-14', time: '14:30', location: 'CASABLANCA COMPLEXE EL HASSANI', audienceType: 'association', spectacleId: 'tara-sur-la-lune', month: 'octobre' },
      { id: 'tsl-4', date: '2025-10-18', time: '15:00', location: 'CASABLANCA COMPLEXE EL HASSANI', audienceType: 'tout-public', spectacleId: 'tara-sur-la-lune', month: 'octobre' },
      { id: 'tsl-5', date: '2025-10-09', time: '09:30', location: 'RABAT THEATRE BAHNINI', audienceType: 'scolaire-privee', spectacleId: 'tara-sur-la-lune', month: 'octobre' },
      { id: 'tsl-6', date: '2025-10-09', time: '14:30', location: 'RABAT THEATRE BAHNINI', audienceType: 'scolaire-publique', spectacleId: 'tara-sur-la-lune', month: 'octobre' },
      { id: 'tsl-7', date: '2025-10-10', time: '14:30', location: 'RABAT THEATRE BAHNINI', audienceType: 'association', spectacleId: 'tara-sur-la-lune', month: 'octobre' },
      { id: 'tsl-8', date: '2025-10-11', time: '15:00', location: 'RABAT THEATRE BAHNINI', audienceType: 'tout-public', spectacleId: 'tara-sur-la-lune', month: 'octobre' },

      // CHARLOTTE
      { id: 'ch-1', date: '2025-11-05', time: '15:00', location: 'RABAT THEATRE BAHNINI', audienceType: 'tout-public', spectacleId: 'charlotte', month: 'novembre' },
      { id: 'ch-2', date: '2025-11-07', time: '09:30', location: 'RABAT THEATRE BAHNINI', audienceType: 'scolaire-privee', spectacleId: 'charlotte', month: 'novembre' },
      { id: 'ch-3', date: '2025-11-07', time: '14:30', location: 'RABAT THEATRE BAHNINI', audienceType: 'scolaire-publique', spectacleId: 'charlotte', month: 'novembre' },
      { id: 'ch-4', date: '2025-11-08', time: '14:30', location: 'CASABLANCA COMPLEXE EL HASSANI', audienceType: 'association', spectacleId: 'charlotte', month: 'novembre' },
      { id: 'ch-5', date: '2025-11-09', time: '15:00', location: 'CASABLANCA COMPLEXE EL HASSANI', audienceType: 'tout-public', spectacleId: 'charlotte', month: 'novembre' },

      // ESTEVANICO
      { id: 'est-1', date: '2025-11-12', time: '15:00', location: 'CASABLANCA COMPLEXE EL HASSANI', audienceType: 'tout-public', spectacleId: 'estevanico', month: 'novembre' },
      { id: 'est-2', date: '2025-11-14', time: '09:30', location: 'RABAT THEATRE BAHNINI', audienceType: 'scolaire-privee', spectacleId: 'estevanico', month: 'novembre' },
      { id: 'est-3', date: '2025-11-14', time: '14:30', location: 'RABAT THEATRE BAHNINI', audienceType: 'scolaire-publique', spectacleId: 'estevanico', month: 'novembre' },
      { id: 'est-4', date: '2025-11-15', time: '14:30', location: 'CASABLANCA COMPLEXE EL HASSANI', audienceType: 'association', spectacleId: 'estevanico', month: 'novembre' },

      // ALICE CHEZ LES MERVEILLES
      { id: 'alice-1', date: '2025-11-19', time: '15:00', location: 'RABAT THEATRE BAHNINI', audienceType: 'tout-public', spectacleId: 'alice-chez-les-merveilles', month: 'novembre' },
      { id: 'alice-2', date: '2025-11-21', time: '09:30', location: 'CASABLANCA COMPLEXE EL HASSANI', audienceType: 'scolaire-privee', spectacleId: 'alice-chez-les-merveilles', month: 'novembre' },
      { id: 'alice-3', date: '2025-11-21', time: '14:30', location: 'CASABLANCA COMPLEXE EL HASSANI', audienceType: 'scolaire-publique', spectacleId: 'alice-chez-les-merveilles', month: 'novembre' },
      { id: 'alice-4', date: '2025-11-22', time: '14:30', location: 'RABAT THEATRE BAHNINI', audienceType: 'association', spectacleId: 'alice-chez-les-merveilles', month: 'novembre' }
    ];

    let spectacleSessions = SESSIONS.filter(s => s.spectacleId === spectacleId);
    
    // Determine effective user type
    let effectiveUserType = 'particulier';
    if (userType === 'professional' && professionalType) {
      effectiveUserType = professionalType;
    }
    
    // Filter sessions based on user type
    if (effectiveUserType === 'scolaire-privee') {
      return spectacleSessions.filter(s => s.audienceType === 'scolaire-privee');
    } else if (effectiveUserType === 'scolaire-publique') {
      return spectacleSessions.filter(s => s.audienceType === 'scolaire-publique');
    } else if (effectiveUserType === 'association') {
      return spectacleSessions.filter(s => s.audienceType === 'association');
    } else {
      // Particuliers see public sessions
      return spectacleSessions.filter(s => s.audienceType === 'tout-public');
    }
  }

  createSessionElement(session) {
    const sessionDiv = document.createElement('div');
    sessionDiv.className = 'showtime-item';
    sessionDiv.style.cssText = 'background: var(--bg-light); border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem; border-left: 4px solid var(--primary-color);';
    
    const date = new Date(session.date);
    const formattedDate = date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
    
    const city = session.location.includes('RABAT') ? 'Rabat' : 'Casablanca';
    
    sessionDiv.innerHTML = `
      <div class="showtime-date" style="font-weight: 600; color: var(--text-dark); margin-bottom: 0.25rem; font-family: 'Raleway', sans-serif;">${formattedDate}</div>
      <div class="showtime-time" style="color: var(--text-light); font-size: 0.9rem; margin-bottom: 0.75rem; font-family: 'Raleway', sans-serif;">${city} - ${session.time}</div>
      <button class="showtime-btn" onclick="window.handleReservation()" style="background: var(--primary-color); color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; font-size: 0.9rem; font-weight: 500; text-decoration: none; display: inline-flex; align-items: center; gap: 0.25rem; transition: all 0.3s ease; font-family: 'Raleway', sans-serif; cursor: pointer;">
        <i class="fas fa-ticket-alt"></i>
        Réserver
      </button>
    `;
    
    return sessionDiv;
  }

  addUserTypeIndicator() {
    const userType = sessionStorage.getItem('userType');
    const professionalType = sessionStorage.getItem('professionalType');
    
    if (!userType || userType !== 'professional' || !professionalType) {
      return; // Only show for professional users
    }
    
    // Check if indicator already exists
    if (document.getElementById('user-type-indicator')) {
      return;
    }
    
    const heroSection = document.querySelector('.spectacle-hero, .hero-section');
    if (!heroSection) {
      return;
    }
    
    let userTypeLabel = '';
    let icon = '';
    
    switch (professionalType) {
      case 'scolaire-privee':
        userTypeLabel = 'École Privée';
        icon = 'fas fa-graduation-cap';
        break;
      case 'scolaire-publique':
        userTypeLabel = 'École Publique';
        icon = 'fas fa-school';
        break;
      case 'association':
        userTypeLabel = 'Association';
        icon = 'fas fa-users';
        break;
    }
    
    const indicator = document.createElement('div');
    indicator.id = 'user-type-indicator';
    indicator.style.cssText = 'background: rgba(189, 207, 0, 0.05); border-bottom: 1px solid rgba(189, 207, 0, 0.1); padding: 12px 0;';
    
    indicator.innerHTML = `
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 20px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <i class="${icon}" style="color: #BDCF00; font-size: 18px;"></i>
          <div>
            <span style="font-weight: 600; color: #333; font-size: 16px;">${userTypeLabel}</span>
            <span style="color: #666; margin-left: 8px; font-size: 14px;">• Rabat - Casablanca</span>
          </div>
        </div>
        <button onclick="authManager.logout()" style="background: transparent; border: 1px solid #ccc; color: #666; padding: 8px 16px; border-radius: 6px; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
          <i class="fas fa-arrow-left"></i>
          Changer de profil
        </button>
      </div>
    `;
    
    // Insert before hero section
    heroSection.parentNode.insertBefore(indicator, heroSection);
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
        role: 'user',
        user_type: 'professional',
        professional_type: 'scolaire-privee'
      },
      timestamp: new Date().toISOString()
    };
    
    // Set user type in sessionStorage
    sessionStorage.setItem('userType', 'professional');
    sessionStorage.setItem('professionalType', 'scolaire-privee');
    sessionStorage.setItem('edjs_auth_status', JSON.stringify(testUserData));
    
    window.authManager.handleAuthResponse(testUserData);
    window.authManager.updateAgeLevelDisplay();
    window.authManager.updateSessionsDisplay();
    window.authManager.addUserTypeIndicator();
    console.log('EDJS - Test private school auth state set, updating UI');
  }
};

// Test function for public school
window.testPublicSchool = function() {
  console.log('EDJS - Testing public school authentication state');
  if (window.authManager) {
    const testUserData = {
      isAuthenticated: true,
      user: {
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'user',
        user_type: 'professional',
        professional_type: 'scolaire-publique'
      },
      timestamp: new Date().toISOString()
    };
    
    sessionStorage.setItem('userType', 'professional');
    sessionStorage.setItem('professionalType', 'scolaire-publique');
    sessionStorage.setItem('edjs_auth_status', JSON.stringify(testUserData));
    
    window.authManager.handleAuthResponse(testUserData);
    window.authManager.updateAgeLevelDisplay();
    window.authManager.updateSessionsDisplay();
    window.authManager.addUserTypeIndicator();
    console.log('EDJS - Test public school auth state set, updating UI');
  }
};

// Function to force update displays
window.forceUpdateDisplays = function() {
  console.log('EDJS - Force updating all displays');
  if (window.authManager) {
    window.authManager.updateAgeLevelDisplay();
    window.authManager.updateSessionsDisplay();
    window.authManager.addUserTypeIndicator();
  }
};

// Initialize auth manager when DOM is loaded
console.log('EDJS - auth-manager.js script loaded');

document.addEventListener('DOMContentLoaded', () => {
  console.log('EDJS - DOM loaded, initializing AuthManager');
  try {
    window.authManager = new AuthManager();
    window.authManager.init();
    
    // Add test buttons to page for debugging
    setTimeout(() => {
      const buttonContainer = document.createElement('div');
      buttonContainer.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999; display: flex; flex-direction: column; gap: 5px;';
      
      const testPrivateButton = document.createElement('button');
      testPrivateButton.innerHTML = 'Test École Privée';
      testPrivateButton.style.cssText = 'background: #28a745; color: white; padding: 8px 12px; border: none; cursor: pointer; font-size: 12px; border-radius: 4px;';
      testPrivateButton.onclick = window.testAuthState;
      
      const testPublicButton = document.createElement('button');
      testPublicButton.innerHTML = 'Test École Publique';
      testPublicButton.style.cssText = 'background: #007bff; color: white; padding: 8px 12px; border: none; cursor: pointer; font-size: 12px; border-radius: 4px;';
      testPublicButton.onclick = window.testPublicSchool;
      
      const forceUpdateButton = document.createElement('button');
      forceUpdateButton.innerHTML = 'Force Update';
      forceUpdateButton.style.cssText = 'background: #ffc107; color: black; padding: 8px 12px; border: none; cursor: pointer; font-size: 12px; border-radius: 4px;';
      forceUpdateButton.onclick = window.forceUpdateDisplays;
      
      const clearButton = document.createElement('button');
      clearButton.innerHTML = 'Clear Auth';
      clearButton.style.cssText = 'background: #dc3545; color: white; padding: 8px 12px; border: none; cursor: pointer; font-size: 12px; border-radius: 4px;';
      clearButton.onclick = () => {
        sessionStorage.clear();
        location.reload();
      };
      
      buttonContainer.appendChild(testPrivateButton);
      buttonContainer.appendChild(testPublicButton);
      buttonContainer.appendChild(forceUpdateButton);
      buttonContainer.appendChild(clearButton);
      document.body.appendChild(buttonContainer);
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
