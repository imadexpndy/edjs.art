// Spectacles page authentication and role-based access
class SpectaclesManager {
    constructor() {
        this.spectacles = [];
        this.userRole = null;
        this.isGuest = false;
        this.init();
    }

    async init() {
        // Wait for auth manager to initialize
        if (typeof authManager !== 'undefined') {
            this.userRole = authManager.userRole;
            this.isGuest = authManager.isGuest;
        }

        // Show guest popup for individuals if not logged in
        if (window.location.pathname.includes('spectacles.html')) {
            this.handleSpectaclesPageAccess();
        }
    }

    handleSpectaclesPageAccess() {
        // Check if user is logged in or in guest mode
        if (window.authManager && (window.authManager.currentUser || window.authManager.isGuest)) {
            this.hideAuthGate();
            this.loadSpectacles();
        }
    }

    setupAuthGateListeners() {
        // Auth gate buttons are now handled in the main spectacles.html script
        // This method is kept for compatibility but doesn't add duplicate handlers
        console.log('SpectaclesManager: Auth gate listeners handled by main script');
    }

    hideAuthGate() {
        const authGateSection = document.getElementById('authGateSection');
        if (authGateSection) {
            authGateSection.style.display = 'none';
        }
    }

    showSpectacles() {
        const spectaclesGrid = document.querySelector('.spectacles-grid');
        if (spectaclesGrid) {
            spectaclesGrid.style.display = 'block';
        }
    }

    async loadSpectacles() {
        // Show spectacles immediately (static content)
        this.showSpectacles();
        
        try {
            let query = supabase.from('spectacles').select('*');
            
            // Filter based on user role
            if (this.userRole === 'school') {
                query = query.eq('target_audience', 'school');
            } else if (this.userRole === 'association') {
                query = query.eq('target_audience', 'association');
            } else {
                // Individual or guest - show individual spectacles
                query = query.eq('target_audience', 'individual');
            }

            const { data, error } = await query;
            
            if (error) throw error;
            
            this.spectacles = data || [];
            // Only render dynamic spectacles if we have data
            if (this.spectacles.length > 0) {
                this.renderSpectacles();
            }
        } catch (error) {
            console.error('Error loading spectacles:', error);
            // Keep showing static spectacles as fallback
        }
    }

    renderSpectacles() {
        const spectaclesGrid = document.querySelector('.spectacles-grid, .row');
        if (!spectaclesGrid) return;

        // Don't clear existing content - let the sync script handle it
        // spectaclesGrid.innerHTML = '';

        if (this.spectacles.length === 0) {
            spectaclesGrid.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">Aucun spectacle disponible pour votre profil.</p>
                </div>
            `;
            return;
        }

        // Render spectacles
        this.spectacles.forEach(spectacle => {
            const spectacleCard = this.createSpectacleCard(spectacle);
            spectaclesGrid.appendChild(spectacleCard);
        });
    }

    createSpectacleCard(spectacle) {
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6 mb-4';
        
        col.innerHTML = `
            <div class="spectacle-card">
                <div class="spectacle-image">
                    <img src="${spectacle.image_url || 'assets/img/default-spectacle.jpg'}" alt="${spectacle.title}" class="w-100">
                    <div class="spectacle-overlay">
                        <a href="spectacle-${spectacle.slug}.html" class="vs-btn">
                            <span class="vs-btn__border"></span>
                            Découvrir
                        </a>
                    </div>
                </div>
                <div class="spectacle-content">
                    <h3 class="spectacle-title">
                        <a href="spectacle-${spectacle.slug}.html">${spectacle.title}</a>
                    </h3>
                    <p class="spectacle-description">${spectacle.description || ''}</p>
                    <div class="spectacle-meta">
                        <span class="spectacle-duration">
                            <i class="far fa-clock"></i>
                            ${spectacle.duration || '60'} min
                        </span>
                        <span class="spectacle-age">
                            <i class="far fa-users"></i>
                            ${spectacle.age_range || 'Tout âge'}
                        </span>
                    </div>
                    ${this.createReservationButton(spectacle)}
                </div>
            </div>
        `;
        
        return col;
    }

    createReservationButton(spectacle) {
        if (authManager.currentUser || authManager.isGuest) {
            return `
                <div class="spectacle-actions mt-3">
                    <button class="vs-btn vs-btn--sm w-100" onclick="spectaclesManager.reserveSpectacle('${spectacle.id}')">
                        <span class="vs-btn__border"></span>
                        Réserver
                    </button>
                </div>
            `;
        }
        return '';
    }

    showStaticSpectacles() {
        // Keep existing static spectacles if Supabase fails
        console.log('Showing static spectacles as fallback');
    }

    async reserveSpectacle(spectacleId) {
        if (!authManager.currentUser && !authManager.isGuest) {
            authManager.showAuthModal('login');
            return;
        }

        // Show reservation modal or redirect to reservation page
        this.showReservationModal(spectacleId);
    }

    showReservationModal(spectacleId) {
        const spectacle = this.spectacles.find(s => s.id === spectacleId);
        if (!spectacle) return;

        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'reservationModal';
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Réserver - ${spectacle.title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="reservationForm">
                            <div class="mb-3">
                                <label class="form-label">Date souhaitée</label>
                                <input type="date" class="form-control" id="reservationDate" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Nombre de participants</label>
                                <input type="number" class="form-control" id="participantCount" min="1" required>
                            </div>
                            ${!authManager.currentUser ? `
                            <div class="mb-3">
                                <label class="form-label">Nom</label>
                                <input type="text" class="form-control" id="guestName" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control" id="guestEmail" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Téléphone</label>
                                <input type="tel" class="form-control" id="guestPhone" required>
                            </div>
                            ` : ''}
                            <div class="mb-3">
                                <label class="form-label">Message (optionnel)</label>
                                <textarea class="form-control" id="reservationMessage" rows="3"></textarea>
                            </div>
                            <div class="d-grid">
                                <button type="submit" class="vs-btn">
                                    <span class="vs-btn__border"></span>
                                    Confirmer la réservation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        const form = modal.querySelector('#reservationForm');
        form.addEventListener('submit', (e) => this.handleReservationSubmit(e, spectacleId));
        
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        // Remove modal from DOM when hidden
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }

    async handleReservationSubmit(e, spectacleId) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const reservationData = {
            spectacle_id: spectacleId,
            reservation_date: document.getElementById('reservationDate').value,
            participant_count: parseInt(document.getElementById('participantCount').value),
            message: document.getElementById('reservationMessage').value,
            user_id: authManager.currentUser?.id || null,
            guest_name: document.getElementById('guestName')?.value || null,
            guest_email: document.getElementById('guestEmail')?.value || null,
            guest_phone: document.getElementById('guestPhone')?.value || null,
            status: 'pending'
        };

        try {
            const { data, error } = await supabase
                .from('reservations')
                .insert(reservationData);

            if (error) throw error;

            // Show success message
            alert('Réservation envoyée avec succès ! Nous vous contacterons bientôt.');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('reservationModal'));
            modal.hide();
            
        } catch (error) {
            console.error('Error creating reservation:', error);
            alert('Erreur lors de la réservation. Veuillez réessayer.');
        }
    }
}

// Initialize spectacles manager
const spectaclesManager = new SpectaclesManager();

// Global function to update spectacles list (called by auth manager)
function updateSpectaclesList() {
    // Check if user is authenticated or guest
    if (window.authManager && (window.authManager.userRole === USER_ROLES.SCHOOL || window.authManager.userRole === USER_ROLES.ASSOCIATION)) {     
        spectaclesManager.isGuest = authManager.isGuest;
        spectaclesManager.loadSpectacles();
    }
}
