/**
 * Spectacle Data Sync Module
 * Syncs spectacle data between admin dashboard and public website pages
 */

// Use existing Supabase configuration from supabase-config.js
// The supabase client is already initialized globally

class SpectacleSync {
  constructor() {
    this.spectacleData = null;
    this.spectacleSessions = [];
    this.init();
  }

  async init() {
    // Get spectacle slug from current page URL
    const currentPath = window.location.pathname;
    const spectacleSlug = this.extractSpectacleSlug(currentPath);
    
    if (spectacleSlug) {
      await this.loadSpectacleData(spectacleSlug);
      this.updatePageContent();
      this.setupRealTimeUpdates(spectacleSlug);
    }
  }

  extractSpectacleSlug(path) {
    // Extract slug from URLs like /spectacle-casse-noisette.html
    const match = path.match(/spectacle-(.+)\.html/);
    return match ? match[1] : null;
  }

  async loadSpectacleData(slug) {
    try {
      // Fetch spectacle data
      const { data: spectacle, error: spectacleError } = await supabase
        .from('spectacles')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (spectacleError) {
        console.error('Error loading spectacle:', spectacleError);
        return;
      }

      this.spectacleData = spectacle;

      // Fetch spectacle sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('spectacle_sessions')
        .select('*')
        .eq('spectacle_id', spectacle.id)
        .eq('status', 'active')
        .order('session_date', { ascending: true });

      if (sessionsError) {
        console.error('Error loading sessions:', sessionsError);
        return;
      }

      this.spectacleSessions = sessions || [];
    } catch (error) {
      console.error('Error in loadSpectacleData:', error);
    }
  }

  updatePageContent() {
    if (!this.spectacleData) return;

    this.updateMetaTags();
    this.updateHeroSection();
    this.updateContentSections();
    this.updateSidebar();
    this.updateMediaContent();
  }

  updateMetaTags() {
    const data = this.spectacleData;
    
    // Update page title
    document.title = `${data.title} - École du Jeune Spectateur`;
    
    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && data.short_description) {
      metaDesc.setAttribute('content', data.short_description);
    }
    
    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords && data.meta_keywords) {
      metaKeywords.setAttribute('content', data.meta_keywords);
    }
  }

  updateHeroSection() {
    const data = this.spectacleData;
    
    // Update hero title
    const heroTitle = document.querySelector('.hero-title, .spectacle-hero__title');
    if (heroTitle) {
      heroTitle.textContent = data.title;
    }
    
    // Update hero subtitle
    const heroSubtitle = document.querySelector('.hero-subtitle, .spectacle-hero__subtitle');
    if (heroSubtitle && data.short_description) {
      heroSubtitle.textContent = data.short_description;
    }
    
    // Update hero description
    const heroDescription = document.querySelector('.hero-description');
    if (heroDescription && data.description) {
      heroDescription.textContent = data.description;
    }
    
    // Update hero image
    const heroImage = document.querySelector('.hero-img, .center-affiche img');
    if (heroImage && data.main_image_url) {
      heroImage.src = data.main_image_url;
      heroImage.alt = data.title;
    }
    
    // Update info pills
    this.updateInfoPills();
  }

  updateInfoPills() {
    const data = this.spectacleData;
    const pillsContainer = document.querySelector('.info-pills');
    
    if (!pillsContainer) return;
    
    pillsContainer.innerHTML = '';
    
    // Add age range pill
    if (data.age_range) {
      const agePill = this.createInfoPill('fa-child', data.age_range);
      pillsContainer.appendChild(agePill);
    }
    
    // Add duration pill
    if (data.duration) {
      const durationPill = this.createInfoPill('fa-clock', `${data.duration} min`);
      pillsContainer.appendChild(durationPill);
    }
    
    // Add language pill
    if (data.language) {
      const languagePill = this.createInfoPill('fa-globe', data.language);
      pillsContainer.appendChild(languagePill);
    }
  }

  createInfoPill(iconClass, text) {
    const pill = document.createElement('div');
    pill.className = 'info-pill';
    pill.innerHTML = `
      <i class="fas ${iconClass}"></i>
      ${text}
    `;
    return pill;
  }

  updateContentSections() {
    const data = this.spectacleData;
    
    // Update synopsis section
    const synopsisContent = document.querySelector('#synopsis-content, .synopsis-text');
    if (synopsisContent && data.synopsis) {
      synopsisContent.innerHTML = data.synopsis.replace(/\n/g, '<br>');
    }
    
    // Update description sections
    const descriptionElements = document.querySelectorAll('.spectacle-description, .content-description');
    descriptionElements.forEach(element => {
      if (data.description) {
        element.innerHTML = data.description.replace(/\n/g, '<br>');
      }
    });
  }

  updateSidebar() {
    this.updateSpectacleInfo();
    this.updateShowtimes();
    this.updatePricing();
  }

  updateSpectacleInfo() {
    const data = this.spectacleData;
    
    // Update age range
    const ageElement = document.querySelector('[data-info="age"]');
    if (ageElement && data.age_range) {
      ageElement.textContent = data.age_range;
    }
    
    // Update duration
    const durationElement = document.querySelector('[data-info="duration"]');
    if (durationElement && data.duration) {
      durationElement.textContent = `${data.duration} minutes`;
    }
    
    // Update language
    const languageElement = document.querySelector('[data-info="language"]');
    if (languageElement && data.language) {
      languageElement.textContent = data.language;
    }
  }

  updateShowtimes() {
    const showtimesContainer = document.querySelector('.showtimes-list, #showtimes-container');
    
    if (!showtimesContainer) return;
    
    showtimesContainer.innerHTML = '';
    
    if (this.spectacleSessions.length === 0) {
      showtimesContainer.innerHTML = '<p class="text-muted">Aucune séance programmée pour le moment.</p>';
      return;
    }
    
    this.spectacleSessions.forEach(session => {
      const showtimeItem = this.createShowtimeItem(session);
      showtimesContainer.appendChild(showtimeItem);
    });
  }

  createShowtimeItem(session) {
    const item = document.createElement('div');
    item.className = 'showtime-item';
    
    const sessionDate = new Date(session.session_date);
    const dateStr = sessionDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const timeStr = sessionDate.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    item.innerHTML = `
      <div class="showtime-date">${dateStr}</div>
      <div class="showtime-time">${timeStr}</div>
      <div class="showtime-location">${session.venue || 'Lieu à confirmer'}</div>
      <button class="showtime-btn" onclick="openReservationModal('${session.id}')">
        <i class="fas fa-ticket-alt"></i>
        Réserver
      </button>
    `;
    
    return item;
  }

  updatePricing() {
    const data = this.spectacleData;
    
    // Update individual price
    const individualPrice = document.querySelector('[data-price="individual"]');
    if (individualPrice && data.price_individual) {
      individualPrice.textContent = `${data.price_individual} MAD`;
    }
    
    // Update group price
    const groupPrice = document.querySelector('[data-price="group"]');
    if (groupPrice && data.price_group) {
      groupPrice.textContent = `${data.price_group} MAD`;
    }
    
    // Update school price
    const schoolPrice = document.querySelector('[data-price="school"]');
    if (schoolPrice && data.price_school) {
      schoolPrice.textContent = `${data.price_school} MAD`;
    }
  }

  updateMediaContent() {
    const data = this.spectacleData;
    
    // Update video content
    if (data.video_url) {
      this.updateVideoPlayer(data.video_url);
    }
    
    // Update gallery images
    if (data.gallery_images && data.gallery_images.length > 0) {
      this.updateGallery(data.gallery_images);
    }
  }

  updateVideoPlayer(videoUrl) {
    const videoContainer = document.querySelector('.tv-screen, .video-container');
    if (!videoContainer) return;
    
    // Extract video ID from YouTube URL
    const videoId = this.extractYouTubeId(videoUrl);
    if (!videoId) return;
    
    videoContainer.innerHTML = `
      <div class="video-wrapper" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
        <iframe 
          src="https://www.youtube.com/embed/${videoId}" 
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
          allowfullscreen>
        </iframe>
      </div>
    `;
  }

  extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  updateGallery(images) {
    const galleryContainer = document.querySelector('.gallery-grid, .spectacle-gallery');
    if (!galleryContainer) return;
    
    galleryContainer.innerHTML = '';
    
    images.forEach((imageUrl, index) => {
      const galleryItem = document.createElement('div');
      galleryItem.className = 'gallery-item';
      galleryItem.innerHTML = `
        <img src="${imageUrl}" alt="Image ${index + 1}" class="gallery-img" onclick="openLightbox('${imageUrl}')">
      `;
      galleryContainer.appendChild(galleryItem);
    });
  }

  setupRealTimeUpdates(slug) {
    // Subscribe to real-time changes for this spectacle
    const spectacleSubscription = supabase
      .channel('spectacle-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'spectacles',
          filter: `slug=eq.${slug}`
        }, 
        (payload) => {
          console.log('Spectacle updated:', payload);
          this.handleSpectacleUpdate(payload);
        }
      )
      .subscribe();

    // Subscribe to session changes
    if (this.spectacleData) {
      const sessionsSubscription = supabase
        .channel('sessions-updates')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'spectacle_sessions',
            filter: `spectacle_id=eq.${this.spectacleData.id}`
          }, 
          (payload) => {
            console.log('Sessions updated:', payload);
            this.handleSessionsUpdate(payload);
          }
        )
        .subscribe();
    }
  }

  async handleSpectacleUpdate(payload) {
    if (payload.eventType === 'UPDATE') {
      this.spectacleData = payload.new;
      this.updatePageContent();
    } else if (payload.eventType === 'DELETE') {
      // Redirect to spectacles page if this spectacle was deleted
      window.location.href = '/spectacles.html';
    }
  }

  async handleSessionsUpdate(payload) {
    // Reload sessions data
    if (this.spectacleData) {
      const { data: sessions } = await supabase
        .from('spectacle_sessions')
        .select('*')
        .eq('spectacle_id', this.spectacleData.id)
        .eq('status', 'active')
        .order('session_date', { ascending: true });
      
      this.spectacleSessions = sessions || [];
      this.updateShowtimes();
    }
  }
}

// Global functions for UI interactions
window.openReservationModal = function(sessionId) {
  // Open reservation modal or redirect to booking page
  const bookingUrl = `http://localhost:8080/auth?mode=register&session=${sessionId}`;
  window.open(bookingUrl, '_blank');
};

window.openLightbox = function(imageUrl) {
  // Simple lightbox implementation
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    cursor: pointer;
  `;
  
  const img = document.createElement('img');
  img.src = imageUrl;
  img.style.cssText = `
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
  `;
  
  lightbox.appendChild(img);
  document.body.appendChild(lightbox);
  
  lightbox.addEventListener('click', () => {
    document.body.removeChild(lightbox);
  });
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SpectacleSync();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SpectacleSync;
}
