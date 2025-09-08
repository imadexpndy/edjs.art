// Mobile Carousel Fix for EDJS Website
// This script creates a single-card carousel with navigation arrows on mobile

document.addEventListener('DOMContentLoaded', function() {
  let currentSlide = 0;
  let totalSlides = 0;
  let swiperWrapper = null;
  let slides = [];

  function createMobileCarousel() {
    const isMobile = window.innerWidth <= 768;
    const carousel = document.querySelector('.vs-carousel--class');
    
    if (!carousel) return;
    
    if (isMobile) {
      swiperWrapper = carousel.querySelector('.swiper-wrapper');
      slides = Array.from(carousel.querySelectorAll('.swiper-slide'));
      totalSlides = slides.length;
      
      if (!swiperWrapper || totalSlides === 0) return;
      
      // Completely destroy and reset swiper
      if (carousel.swiper) {
        carousel.swiper.destroy(true, true);
        delete carousel.swiper;
      }
      
      // Remove all swiper classes and data attributes
      carousel.classList.remove('swiper', 'swiper-initialized', 'swiper-horizontal', 'swiper-pointer-events', 'swiper-backface-hidden');
      swiperWrapper.classList.remove('swiper-wrapper');
      slides.forEach(slide => {
        slide.classList.remove('swiper-slide', 'swiper-slide-active', 'swiper-slide-next', 'swiper-slide-prev');
      });
      
      // Setup mobile carousel
      setupMobileCarousel();
      
      // Add navigation arrows if they don't exist
      addNavigationArrows(carousel);
    }
  }
  
  function setupMobileCarousel() {
    if (!swiperWrapper) return;
    
    // Force reset all inline styles that might be causing issues
    swiperWrapper.removeAttribute('style');
    swiperWrapper.style.cssText = 'display: flex !important; transition: transform 0.3s ease !important; transform: translateX(0%) !important; width: auto !important; height: auto !important;';
    
    // Setup slides with forced styles
    slides.forEach((slide, index) => {
      slide.removeAttribute('style');
      slide.style.cssText = 'width: 100% !important; flex-shrink: 0 !important; margin: 0 !important; display: block !important; position: relative !important;';
    });
    
    // Set initial position
    updateCarousel();
  }
  
  function addNavigationArrows(carousel) {
    // Check if arrows already exist
    if (carousel.querySelector('.mobile-nav-arrows')) return;
    
    const arrowsContainer = document.createElement('div');
    arrowsContainer.className = 'mobile-nav-arrows';
    
    const prevArrow = document.createElement('button');
    prevArrow.className = 'mobile-nav-arrow mobile-nav-prev';
    prevArrow.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevArrow.onclick = () => goToPrevSlide();
    
    const nextArrow = document.createElement('button');
    nextArrow.className = 'mobile-nav-arrow mobile-nav-next';
    nextArrow.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextArrow.onclick = () => goToNextSlide();
    
    arrowsContainer.appendChild(prevArrow);
    arrowsContainer.appendChild(nextArrow);
    
    // Insert arrows after carousel
    carousel.parentNode.insertBefore(arrowsContainer, carousel.nextSibling);
    
    updateArrowStates();
  }
  
  function goToPrevSlide() {
    if (currentSlide > 0) {
      currentSlide--;
      updateCarousel();
    }
  }
  
  function goToNextSlide() {
    if (currentSlide < totalSlides - 1) {
      currentSlide++;
      updateCarousel();
    }
  }
  
  function updateCarousel() {
    if (!swiperWrapper) return;
    
    swiperWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
    updateArrowStates();
  }
  
  function updateArrowStates() {
    const prevArrow = document.querySelector('.mobile-nav-prev');
    const nextArrow = document.querySelector('.mobile-nav-next');
    
    if (prevArrow) {
      prevArrow.disabled = currentSlide === 0;
    }
    
    if (nextArrow) {
      nextArrow.disabled = currentSlide === totalSlides - 1;
    }
  }
  
  // Auto-slide functionality (optional)
  function startAutoSlide() {
    setInterval(() => {
      if (window.innerWidth <= 768) {
        if (currentSlide < totalSlides - 1) {
          goToNextSlide();
        } else {
          currentSlide = 0;
          updateCarousel();
        }
      }
    }, 4000); // 4 seconds
  }
  
  // Initialize
  createMobileCarousel();
  
  // Start auto-slide
  startAutoSlide();
  
  // Handle resize
  window.addEventListener('resize', () => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      createMobileCarousel();
    } else {
      // Remove mobile arrows on desktop
      const arrows = document.querySelector('.mobile-nav-arrows');
      if (arrows) {
        arrows.remove();
      }
    }
  });
});
