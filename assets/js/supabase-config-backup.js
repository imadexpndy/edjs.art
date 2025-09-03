// Supabase configuration - using demo mode for testing
const supabaseUrl = 'https://demo.supabase.co'
const supabaseKey = 'demo-key'

// Mock Supabase client for testing without real credentials
const supabase = {
    auth: {
        getSession: () => Promise.resolve({ data: { session: null } }),
        onAuthStateChange: (callback) => {
            console.log('Auth state change listener registered');
            return { data: { subscription: { unsubscribe: () => {} } } };
        },
        signUp: (credentials) => Promise.resolve({ data: { user: null }, error: null }),
        signInWithPassword: (credentials) => Promise.resolve({ data: { user: null }, error: null }),
        signOut: () => Promise.resolve({ error: null })
    },
    from: (table) => ({
        select: () => ({
            eq: () => ({
                single: () => Promise.resolve({ data: null, error: null })
            })
        }),
        insert: () => Promise.resolve({ data: null, error: null })
    })
};

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
                .from('user_profiles')
                .select('role')
                .eq('user_id', this.currentUser.id)
                .single();
            
            if (error) throw error;
            this.userRole = data?.role || USER_ROLES.INDIVIDUAL;
        } catch (error) {
            console.error('Error loading user role:', error);
            this.userRole = USER_ROLES.INDIVIDUAL;
        }
    }

    async signUp(email, password, userData) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: userData
                }
            });
            
            if (error) throw error;
            
            // Create user profile
            if (data.user) {
                await this.createUserProfile(data.user.id, userData);
            }
            
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async createUserProfile(userId, userData) {
        try {
            const { error } = await supabase
                .from('user_profiles')
                .insert({
                    user_id: userId,
                    role: userData.role || USER_ROLES.INDIVIDUAL,
                    organization_name: userData.organization_name || null,
                    contact_person: userData.contact_person || null,
                    phone: userData.phone || null
                });
            
            if (error) throw error;
        } catch (error) {
            console.error('Error creating user profile:', error);
        }
    }

    setGuestMode() {
        this.isGuest = true;
        this.userRole = USER_ROLES.INDIVIDUAL;
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
            <a href="registration.html" class="vs-btn" id="registerBtn" style="background: #BDCF00; color: white; border: 2px solid #BDCF00; padding: 10px 20px; border-radius: 25px; font-weight: 600; text-decoration: none; transition: all 0.3s ease; font-size: 14px; display: inline-block;">
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
                <i class="fas fa-user-circle" style="font-size: 24px; color: #BDCF00;"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="#" onclick="window.open('DASHBOARD_URL', '_blank')"><i class="fas fa-tachometer-alt me-2"></i>Tableau de bord</a></li>
                <li><a class="dropdown-item" href="#" onclick="authManager.showReservations()"><i class="fas fa-calendar-check me-2"></i>Mes réservations</a></li>
                <li><a class="dropdown-item" href="#" onclick="authManager.showBills()"><i class="fas fa-file-invoice me-2"></i>Mes factures</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" onclick="authManager.showSettings()"><i class="fas fa-cog me-2"></i>Paramètres</a></li>
                <li><a class="dropdown-item" href="#" onclick="authManager.showSupport()"><i class="fas fa-life-ring me-2"></i>Support</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item text-danger" href="#" onclick="authManager.signOut()"><i class="fas fa-sign-out-alt me-2"></i>Déconnexion</a></li>
            </ul>
        `;
        return userMenu;
    }

    showAuthModal(mode = 'login') {
        // Create or show authentication modal
        let modal = document.getElementById('authModal');
        if (!modal) {
            modal = this.createAuthModal();
            document.body.appendChild(modal);
        }
        
        this.switchAuthMode(mode);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
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
                <div class="auth-modal-header">
                    <h3>Se connecter</h3>
                    <button class="auth-modal-close">&times;</button>
                </div>
                <div class="auth-modal-body">
                    <form id="loginForm">
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Mot de passe</label>
                            <input type="password" id="password" name="password" required>
                        </div>
                        <button type="submit" class="auth-submit-btn">
                            Se connecter
                        </button>
                    </form>
                    <div class="auth-switch">
                        <p>Pas de compte? <a href="registration.html">S'inscrire ici</a></p>
                    </div>
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

    toggleAuthMode() {
        const modal = document.getElementById('authModal');
        const currentMode = modal.dataset.mode;
        this.switchAuthMode(currentMode === 'login' ? 'register' : 'login');
    }

    handleRoleChange(e) {
        const role = e.target.value;
        const orgFields = document.getElementById('organizationFields');
        
        if (role === USER_ROLES.SCHOOL || role === USER_ROLES.ASSOCIATION) {
            orgFields.style.display = 'block';
            orgFields.querySelectorAll('input').forEach(input => input.required = true);
        } else {
            orgFields.style.display = 'none';
            orgFields.querySelectorAll('input').forEach(input => input.required = false);
        }
    }

    async handleAuthSubmit(e) {
        e.preventDefault();
        
        const modal = document.getElementById('authModal');
        const mode = modal.dataset.mode;
        const formData = new FormData(e.target);
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (mode === 'register') {
            const confirmPassword = document.getElementById('confirmPassword').value;
            if (password !== confirmPassword) {
                this.showError('Les mots de passe ne correspondent pas');
                return;
            }
            
            const userData = {
                role: document.getElementById('userRole').value,
                organization_name: document.getElementById('organizationName').value,
                contact_person: document.getElementById('contactPerson').value,
                phone: document.getElementById('phone').value
            };
            
            const result = await this.signUp(email, password, userData);
            if (result.success) {
                this.showSuccess('Inscription réussie ! Vérifiez votre email.');
                bootstrap.Modal.getInstance(modal).hide();
            } else {
                this.showError(result.error);
            }
        } else {
            const result = await this.signIn(email, password);
            if (result.success) {
                bootstrap.Modal.getInstance(modal).hide();
            } else {
                this.showError(result.error);
            }
        }
    }

    showError(message) {
        // Create or update error alert
        let errorAlert = document.querySelector('.auth-error');
        if (!errorAlert) {
            errorAlert = document.createElement('div');
            errorAlert.className = 'alert alert-danger auth-error mt-3';
            document.querySelector('#authForm').appendChild(errorAlert);
        }
        errorAlert.textContent = message;
        errorAlert.style.display = 'block';
    }

    showSuccess(message) {
        // Create success alert
        const successAlert = document.createElement('div');
        successAlert.className = 'alert alert-success mt-3';
        successAlert.textContent = message;
        document.querySelector('#authForm').appendChild(successAlert);
    }

    // User menu actions
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
                        <button class="vs-btn" onclick="authManager.showAuthModal('login'); this.closest('.guest-access-popup').remove();">
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
