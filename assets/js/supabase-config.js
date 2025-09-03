// Supabase configuration - Live credentials
const supabaseUrl = 'https://aioldzmwwhukzabrizkt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpb2xkem13d2h1a3phYnJpemt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3ODk4NTMsImV4cCI6MjA3MTM2NTg1M30.-49m-IWTu6Iz3keHYjUYQrI2pq12whVgVpah_cG8npA'

// Initialize Supabase client
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// User roles enum
const USER_ROLES = {
    SCHOOL: 'school',
    ASSOCIATION: 'association', 
    INDIVIDUAL: 'individual'
};

// Authentication state management
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.userRole = null;
        this.isGuest = false;
        this.init();
    }

    async init() {
        // Initialize UI first with auth buttons
        this.updateUI();
        
        try {
            // Check for existing session
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                this.currentUser = session.user;
                await this.loadUserRole();
                this.updateUI();
            }

            // Listen for auth changes
            supabase.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN') {
                    this.currentUser = session.user;
                    this.loadUserRole().then(() => this.updateUI());
                } else if (event === 'SIGNED_OUT') {
                    this.currentUser = null;
                    this.userRole = null;
                    this.isGuest = false;
                    this.updateUI();
                }
            });
        } catch (error) {
            console.error('Supabase initialization error:', error);
            // Still show auth buttons even if Supabase fails
            this.updateUI();
        }
    }

    async loadUserRole() {
        if (!this.currentUser) return;
        
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('admin_role, role, verification_status')
                .eq('user_id', this.currentUser.id)
                .single();

            if (data && !error) {
                this.userRole = data.admin_role || data.role || 'b2c_user';
                this.userProfile = data;
                
                // Check if user should be redirected to web app dashboard
                this.checkRoleBasedRedirection();
            }
        } catch (error) {
            console.error('Error loading user role:', error);
            // Default to b2c_user if profile not found
            this.userRole = 'b2c_user';
        }
    }

    checkRoleBasedRedirection() {
        const webAppRoles = [
            'super_admin', 'admin_full', 'admin_spectacles', 'admin_schools', 
            'admin_partners', 'admin_support', 'admin_notifications', 'admin_editor',
            'teacher_private', 'teacher_public', 'association', 'partner'
        ];

        if (webAppRoles.includes(this.userRole)) {
            // Redirect to appropriate web app dashboard
            const webAppUrl = this.getWebAppDashboardUrl();
            if (webAppUrl) {
                window.location.href = webAppUrl;
                return;
            }
        }
    }

    getWebAppDashboardUrl() {
        // Updated to use the correct web app URL
        const baseUrl = 'http://localhost:8080';
        
        switch (this.userRole) {
            case 'super_admin':
            case 'admin_full':
            case 'admin_spectacles':
            case 'admin_schools':
            case 'admin_partners':
            case 'admin_support':
            case 'admin_notifications':
            case 'admin_editor':
                return `${baseUrl}/admin`;
            case 'teacher_private':
            case 'teacher_public':
                return `${baseUrl}/teacher`;
            case 'association':
                return `${baseUrl}/association`;
            case 'partner':
                return `${baseUrl}/partner`;
            default:
                return null;
        }
    }

    setGuestMode() {
        this.isGuest = true;
        this.updateUI();
    }

    updateUI() {
        // Update header authentication buttons
        this.updateHeaderAuth();
        
        // Update spectacles page if we're on it
        if (window.location.pathname.includes('spectacles.html')) {
            this.updateSpectaclesPage();
        }
    }

    updateHeaderAuth() {
        const authContainer = document.querySelector('.vs-header__action .d-none.d-xxl-inline-flex');
        if (!authContainer) {
            console.error('Auth container not found');
            return;
        }

        // Clear existing content
        authContainer.innerHTML = '';

        if (this.currentUser) {
            // Show user menu
            const userMenu = this.createUserMenu();
            authContainer.appendChild(userMenu);
        } else {
            // Show auth buttons
            const authButtons = this.createAuthButtons();
            authContainer.appendChild(authButtons);
        }
    }

    createAuthButtons() {
        const authButtons = document.createElement('div');
        authButtons.className = 'auth-buttons';
        authButtons.style.display = 'flex';
        authButtons.style.gap = '15px';
        authButtons.style.alignItems = 'center';
        authButtons.innerHTML = `
            <a href="http://localhost:8080/auth?mode=register" class="vs-btn" id="registerBtn" style="background: #BDCF00; color: white; border: 2px solid #BDCF00; padding: 10px 20px; border-radius: 25px; font-weight: 600; text-decoration: none; transition: all 0.3s ease; font-size: 14px; display: inline-block;">
                S'inscrire
            </a>
            <button class="vs-btn-login" id="loginBtn" style="background: transparent; color: #BDCF00; border: 2px solid #BDCF00; padding: 10px 20px; border-radius: 25px; font-weight: 600; text-decoration: none; transition: all 0.3s ease; font-size: 14px;">
                Se connecter
            </button>
        `;

        // Add event listener only for login button
        authButtons.querySelector('#loginBtn').addEventListener('click', () => {
            this.showLoginModal();
        });

        return authButtons;
    }

    createUserMenu() {
        const userMenu = document.createElement('div');
        userMenu.className = 'user-menu dropdown';
        userMenu.innerHTML = `
            <button class="user-menu-toggle" type="button" data-bs-toggle="dropdown">
                <i class="fas fa-user-circle"></i>
                ${this.currentUser?.email || 'Utilisateur'}
            </button>
            <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#" onclick="authManager.showDashboard()">
                    <i class="fas fa-tachometer-alt"></i> Tableau de bord
                </a></li>
                <li><a class="dropdown-item" href="#" onclick="authManager.showReservations()">
                    <i class="fas fa-calendar-check"></i> Mes réservations
                </a></li>
                <li><a class="dropdown-item" href="#" onclick="authManager.showBills()">
                    <i class="fas fa-file-invoice"></i> Mes factures
                </a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" onclick="authManager.showSettings()">
                    <i class="fas fa-cog"></i> Paramètres
                </a></li>
                <li><a class="dropdown-item" href="#" onclick="authManager.showSupport()">
                    <i class="fas fa-life-ring"></i> Support
                </a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" onclick="authManager.logout()">
                    <i class="fas fa-sign-out-alt"></i> Déconnexion
                </a></li>
            </ul>
        `;
        return userMenu;
    }

    // Simplified login-only modal
    showLoginModal() {
        // Remove existing modal if any
        const existingModal = document.querySelector('.auth-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="auth-modal-content">
                <button class="auth-modal-close">&times;</button>
                <div class="auth-modal-header">
                    <h3>Se connecter</h3>
                    <p>Accédez à votre espace professionnel</p>
                </div>
                <div class="auth-modal-body">
                    <form id="loginForm">
                        <div class="form-group">
                            <label for="email">Adresse Email</label>
                            <div class="input-wrapper">
                                <input type="email" id="email" name="email" placeholder="votre@email.com" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="password">Mot de passe</label>
                            <div class="input-wrapper">
                                <input type="password" id="password" name="password" placeholder="••••••••" required>
                            </div>
                        </div>
                        <button type="submit" class="auth-submit-btn">
                            Se connecter
                        </button>
                    </form>
                </div>
                <div class="auth-modal-footer">
                    <p>Pas encore de compte ? <a href="http://localhost:8080/auth?mode=register" target="_blank">Créer un compte</a></p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        modal.querySelector('.auth-modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        modal.querySelector('#loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(new FormData(e.target));
        });
    }

    async handleLogin(formData) {
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            // Only handle login - check if user exists in Supabase
            const result = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (result.error) {
                throw result.error;
            }

            // Close modal and update UI
            const modal = document.querySelector('.auth-modal');
            if (modal) modal.remove();
            
            this.currentUser = result.data.user;
            await this.loadUserRole();
            this.updateUI();

        } catch (error) {
            console.error('Login error:', error);
            alert('Erreur de connexion: ' + error.message);
        }
    }

    // User menu actions
    showDashboard() {
        // Redirect to appropriate dashboard based on user role
        const webAppUrl = this.getWebAppDashboardUrl();
        if (webAppUrl) {
            window.location.href = webAppUrl;
        } else {
            // B2C users stay on website - show user profile or reservations
            alert('Tableau de bord utilisateur (à implémenter sur le site web)');
        }
    }

    showReservations() {
        alert('Redirection vers les réservations (à implémenter)');
    }

    showBills() {
        alert('Redirection vers les factures (à implémenter)');
    }

    showSettings() {
        alert('Redirection vers les paramètres (à implémenter)');
    }

    showSupport() {
        alert('Redirection vers le support (à implémenter)');
    }

    async logout() {
        try {
            await supabase.auth.signOut();
            this.currentUser = null;
            this.userRole = null;
            this.isGuest = false;
            this.updateUI();
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Guest access for individuals
    showGuestAccessPopup() {
        if (this.currentUser || this.isGuest) return;
        
        const popup = document.createElement('div');
        popup.className = 'guest-access-popup';
        popup.innerHTML = `
            <div class="popup-overlay">
                <div class="popup-content">
                    <h4>Accès aux spectacles</h4>
                    <p>Souhaitez-vous vous connecter pour gérer vos réservations et factures, ou continuer en tant qu'invité ?</p>
                    <div class="popup-buttons">
                        <button class="vs-btn vs-btn--outline" onclick="authManager.setGuestMode(); this.closest('.guest-access-popup').remove();">
                            <span class="vs-btn__border"></span>
                            Continuer en invité
                        </button>
                        <button class="vs-btn" onclick="authManager.showLoginModal(); this.closest('.guest-access-popup').remove();">
                            <span class="vs-btn__border"></span>
                            Se connecter
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
    }

    updateSpectaclesPage() {
        // This will be implemented when we update the spectacles page
        if (typeof updateSpectaclesList === 'function') {
            updateSpectaclesList();
        }
    }
}

// Initialize auth manager when DOM is loaded
let authManager;
document.addEventListener('DOMContentLoaded', function() {
    authManager = new AuthManager();
    // Make it globally available for testing
    window.authManager = authManager;
});
