/**
 * Spectacles List Sync Module
 * Syncs spectacles list data between admin dashboard and public spectacles page
 */

class SpectaclesListSync {
  constructor() {
    this.spectacles = [];
    this.categories = [];
    this.currentFilter = 'all';
    this.init();
  }

  async init() {
    // Only initialize on spectacles page
    if (!window.location.pathname.includes('spectacles.html')) {
      return;
    }

    console.log('Initializing SpectaclesListSync...');
    console.log('Supabase client available:', !!window.supabase);
    console.log('Supabase instance:', !!supabase);
    console.log('Current URL:', window.location.href);

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
    }

    // Delay initialization to prevent conflicts with other scripts
    setTimeout(async () => {
      await this.loadSpectaclesData();
      await this.loadCategories();
      this.updateSpectaclesList();
      this.setupFilters();
      this.setupRealTimeUpdates();
    }, 2000);
  }

  async loadSpectaclesData() {
    try {
      console.log('Loading spectacles data...');
      const { data: spectacles, error } = await supabase
        .from('spectacles')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading spectacles:', error);
        console.error('Error details:', error);
        return;
      }

      console.log('Loaded spectacles:', spectacles);
      this.spectacles = spectacles || [];
      console.log('Total spectacles found:', this.spectacles.length);
    } catch (error) {
      console.error('Error in loadSpectaclesData:', error);
    }
  }

  async loadCategories() {
    try {
      // Skip categories for now - table doesn't exist yet
      console.log('Skipping categories - table not implemented');
      this.categories = [];
    } catch (error) {
      console.error('Error in loadCategories:', error);
    }
  }

  updateSpectaclesList() {
    console.log('Updating spectacles list...');
    const spectaclesContainer = document.querySelector('#spectacles-container');
    const spectaclesSection = document.querySelector('#spectaclesSection');
    
    if (!spectaclesContainer) {
      console.warn('Spectacles container not found');
      console.log('Available containers:', document.querySelectorAll('[id*="spectacle"], [class*="spectacle"]'));
      return;
    }

    console.log('Found container:', spectaclesContainer);

    // Filter spectacles based on current filter
    const filteredSpectacles = this.filterSpectacles();
    console.log('Filtered spectacles:', filteredSpectacles.length);

    // Only clear if we have spectacles to show, otherwise preserve existing content
    if (filteredSpectacles.length > 0) {
      spectaclesContainer.innerHTML = '';
    }

    if (filteredSpectacles.length === 0) {
      console.log('No spectacles to display');
      spectaclesContainer.innerHTML = `
        <div class="col-12">
          <div class="no-spectacles text-center py-5">
            <h3>Aucun spectacle disponible</h3>
            <p>Revenez bientôt pour découvrir nos nouveaux spectacles !</p>
            <p><small>Debug: ${this.spectacles.length} spectacles in database</small></p>
            <div class="mt-3">
              <button onclick="window.location.reload()" class="btn btn-primary">Actualiser</button>
            </div>
          </div>
        </div>
      `;
      // Show the section even if no spectacles
      if (spectaclesSection) {
        spectaclesSection.style.display = 'block';
      }
      return;
    }

    // Create spectacle cards
    console.log('Creating spectacle cards...');
    filteredSpectacles.forEach((spectacle, index) => {
      console.log(`Creating card ${index + 1}:`, spectacle.title);
      const spectacleCard = this.createSpectacleCard(spectacle);
      console.log('Card HTML:', spectacleCard.outerHTML.substring(0, 200) + '...');
      spectaclesContainer.appendChild(spectacleCard);
    });
    console.log('Spectacle cards created successfully');
    console.log('Container after adding cards:', spectaclesContainer.innerHTML.substring(0, 300) + '...');

    // Show the spectacles section
    if (spectaclesSection) {
      spectaclesSection.style.display = 'block';
    }

    // Update counter
    this.updateSpectaclesCounter(filteredSpectacles.length);
  }

  filterSpectacles() {
    if (this.currentFilter === 'all') {
      return this.spectacles;
    }

    return this.spectacles.filter(spectacle => {
      // Filter by category if categories are implemented
      return true; // For now, return all
    });
  }

  createSpectacleCard(spectacle) {
    const card = document.createElement('div');
    card.className = 'col-lg-4 col-md-6 spectacle-item';
    
    // Generate spectacle page URL - create slug from title if not available
    const slug = spectacle.slug || spectacle.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    const spectacleUrl = `spectacle-${slug}.html`;
    
    // Format age range
    const ageRange = spectacle.age_range_min && spectacle.age_range_max ? 
      `${spectacle.age_range_min}-${spectacle.age_range_max} ans` : 
      spectacle.age_range || 'Tous âges';
    
    // Format duration
    const duration = spectacle.duration_minutes ? `${spectacle.duration_minutes} min` : 
      spectacle.duration ? `${spectacle.duration} min` : '';
    
    // Format price
    const price = spectacle.price ? `À partir de ${spectacle.price} MAD` : 
      spectacle.price_individual ? `À partir de ${spectacle.price_individual} MAD` : 'Prix sur demande';
    
    card.innerHTML = `
      <div class="spectacle-card fade-in-up" style="background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden; height: 100%; display: flex; flex-direction: column;">
        <div class="spectacle-card__img" style="position: relative; height: 250px; overflow: hidden;">
          <img src="${spectacle.poster_url || spectacle.main_image_url || 'assets/img/default-spectacle.jpg'}" alt="${spectacle.title}" style="width: 100%; height: 100%; object-fit: cover;">
          <div class="spectacle-card__overlay" style="position: absolute; top: 15px; right: 15px;">
            <div class="spectacle-card__status available" style="background: #28a745; color: white; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">${spectacle.is_active ? 'Disponible' : 'Indisponible'}</div>
          </div>
        </div>
        <div class="spectacle-card__content" style="padding: 25px; flex: 1; display: flex; flex-direction: column;">
          <div class="spectacle-card__meta" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <div class="spectacle-card__category" style="background: #f8f9fa; color: #6c757d; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500;">${spectacle.category || 'Spectacle'}</div>
            <div class="spectacle-card__duration" style="color: #BDCF00; font-weight: 600; font-size: 14px;">${duration}</div>
          </div>
          <h3 class="spectacle-card__title" style="font-size: 22px; font-weight: 700; color: #2c3e50; margin-bottom: 15px; line-height: 1.3;">${spectacle.title}</h3>
          <p class="spectacle-card__desc" style="color: #6c757d; font-size: 14px; line-height: 1.5; margin-bottom: 20px; flex: 1;">
            ${spectacle.short_description || spectacle.description?.substring(0, 150) + '...' || ''}
          </p>
          <div class="spectacle-card__info" style="margin-bottom: 25px;">
            <div class="info-item" style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; color: #6c757d; font-size: 14px;">
              <i class="fas fa-users" style="color: #BDCF00;"></i>
              <span>${ageRange}</span>
            </div>
            <div class="info-item" style="display: flex; align-items: center; gap: 8px; color: #6c757d; font-size: 14px;">
              <i class="fas fa-map-marker-alt" style="color: #BDCF00;"></i>
              <span>${spectacle.venue || 'École du Jeune Spectateur'}</span>
            </div>
          </div>
          <div class="spectacle-card__actions" style="display: flex; gap: 10px; margin-top: auto;">
            <a href="contact.html?spectacle=${slug}" class="vs-btn" style="flex: 1; text-align: center; padding: 10px 15px; background: #BDCF00; color: white; text-decoration: none; border-radius: 25px; font-weight: 600; transition: all 0.3s ease;">
              <i class="fas fa-ticket-alt"></i> Réserver
            </a>
            <a href="${spectacleUrl}" class="vs-btn vs-btn--outline" style="flex: 1; text-align: center; padding: 10px 15px; background: transparent; color: #BDCF00; border: 2px solid #BDCF00; text-decoration: none; border-radius: 25px; font-weight: 600; transition: all 0.3s ease;">
              <i class="fas fa-info-circle"></i> Détails
            </a>
          </div>
        </div>
      </div>
    `;

    return card;
  }

  setupFilters() {
    // Create filter buttons if they don't exist
    this.createFilterButtons();
    
    // Add event listeners to filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update active filter
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Update current filter
        this.currentFilter = button.dataset.filter;
        
        // Update spectacles list
        this.updateSpectaclesList();
      });
    });
  }

  createFilterButtons() {
    const filtersContainer = document.querySelector('.spectacles-filters, .filters-container');
    
    if (!filtersContainer) {
      // Create filters container if it doesn't exist
      const spectaclesSection = document.querySelector('.vs-blog-wrapper, .spectacles-section');
      if (spectaclesSection) {
        const filtersDiv = document.createElement('div');
        filtersDiv.className = 'spectacles-filters mb-4';
        filtersDiv.innerHTML = `
          <div class="container">
            <div class="row">
              <div class="col-12">
                <div class="filter-buttons text-center">
                  <button class="filter-btn active" data-filter="all">Tous les spectacles</button>
                  <button class="filter-btn" data-filter="enfants">Enfants</button>
                  <button class="filter-btn" data-filter="famille">Famille</button>
                  <button class="filter-btn" data-filter="ecoles">Écoles</button>
                </div>
              </div>
            </div>
          </div>
        `;
        spectaclesSection.insertBefore(filtersDiv, spectaclesSection.firstChild);
      }
    }
  }

  updateSpectaclesCounter(count) {
    const counterElement = document.querySelector('.spectacles-counter, .results-counter');
    if (counterElement) {
      counterElement.textContent = `${count} spectacle${count > 1 ? 's' : ''} disponible${count > 1 ? 's' : ''}`;
    }
  }

  setupRealTimeUpdates() {
    // Subscribe to spectacles table changes
    supabase
      .channel('spectacles_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'spectacles' }, payload => {
        console.log('Spectacle updated:', payload);
        // Prevent clearing cards during real-time updates
        setTimeout(() => {
          this.loadSpectaclesData().then(() => this.updateSpectaclesList());
        }, 1000);
      })
      .subscribe();
  }

  async handleSpectaclesUpdate(payload) {
    // Reload spectacles data and update the list
    await this.loadSpectaclesData();
    this.updateSpectaclesList();
  }

  // Public method to refresh the list
  refresh() {
    this.loadSpectaclesData().then(() => this.updateSpectaclesList());
  }

  // Search functionality
  searchSpectacles(query) {
    if (!query) {
      this.updateSpectaclesList();
      return;
    }

    const searchResults = this.spectacles.filter(spectacle => 
      spectacle.title.toLowerCase().includes(query.toLowerCase()) ||
      (spectacle.description && spectacle.description.toLowerCase().includes(query.toLowerCase())) ||
      (spectacle.short_description && spectacle.short_description.toLowerCase().includes(query.toLowerCase()))
    );

    this.displaySearchResults(searchResults);
  }

  displaySearchResults(results) {
    const spectaclesContainer = document.querySelector('#spectacles-container');
    
    if (!spectaclesContainer) return;

    // Only clear when we have results to show
    if (results.length > 0) {
      spectaclesContainer.innerHTML = '';
    }

    if (results.length === 0) {
      spectaclesContainer.innerHTML = `
        <div class="col-12">
          <div class="no-results text-center py-5">
            <h3>Aucun résultat trouvé</h3>
            <p>Essayez avec d'autres mots-clés</p>
          </div>
        </div>
      `;
      return;
    }

    results.forEach(spectacle => {
      const spectacleCard = this.createSpectacleCard(spectacle);
      spectaclesContainer.appendChild(spectacleCard);
    });

    this.updateSpectaclesCounter(results.length);
  }
}

// Global search function
window.searchSpectacles = function(query) {
  if (window.spectaclesListSync) {
    window.spectaclesListSync.searchSpectacles(query);
  }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.spectaclesListSync = new SpectaclesListSync();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SpectaclesListSync;
}
