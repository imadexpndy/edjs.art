// Advanced Hero Background Slider
class HeroSlider {
    constructor() {
        this.slides = document.querySelectorAll('.hero-slide');
        this.currentSlide = 0;
        this.slideInterval = null;
        this.slideDuration = 4000; // 4 seconds per slide
        
        this.init();
    }
    
    init() {
        if (this.slides.length === 0) return;
        
        // Set first slide as active immediately
        this.slides[0].classList.add('active');
        
        // Start the slider
        this.startSlider();
        
        // Add intersection observer for performance
        this.setupIntersectionObserver();
        
        // Pause on hover
        const heroSection = document.querySelector('.vs-hero');
        if (heroSection) {
            heroSection.addEventListener('mouseenter', () => this.pauseSlider());
            heroSection.addEventListener('mouseleave', () => this.startSlider());
        }
    }
    
    nextSlide() {
        // Remove active class from current slide
        this.slides[this.currentSlide].classList.remove('active');
        this.slides[this.currentSlide].classList.add('next');
        
        // Move to next slide
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        
        // Add active class to new slide
        setTimeout(() => {
            this.slides.forEach(slide => slide.classList.remove('next'));
            this.slides[this.currentSlide].classList.add('active');
        }, 100);
    }
    
    startSlider() {
        this.pauseSlider(); // Clear any existing interval
        this.slideInterval = setInterval(() => {
            this.nextSlide();
        }, this.slideDuration);
    }
    
    pauseSlider() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
        }
    }
    
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.startSlider();
                } else {
                    this.pauseSlider();
                }
            });
        }, { threshold: 0.1 });
        
        const heroSection = document.querySelector('.vs-hero');
        if (heroSection) {
            observer.observe(heroSection);
        }
    }
}

// Enhanced Parallax Effect for Hero Slides
class HeroParallax {
    constructor() {
        this.slides = document.querySelectorAll('.hero-slide');
        this.init();
    }
    
    init() {
        window.addEventListener('scroll', () => this.updateParallax());
    }
    
    updateParallax() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        this.slides.forEach(slide => {
            if (slide.classList.contains('active')) {
                slide.style.transform = `scale(1) translateY(${rate}px)`;
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure all elements are rendered
    setTimeout(() => {
        new HeroSlider();
        new HeroParallax();
    }, 100);
});

// Preload images for smooth transitions
function preloadHeroImages() {
    const imageUrls = [
        'assets/img/Tara_Sur_La_Lune_Web_024.jpg',
        'assets/img/Tara_Sur_La_Lune_Web_032.jpg',
        'assets/img/Tara_Sur_La_Lune_Web_041.jpg',
        'assets/img/Tara_Sur_La_Lune_Web_044.jpg',
        'assets/img/Tara_Sur_La_Lune_Web_025.jpg',
        'assets/img/Le_Petit_Prince_Web_050.jpg',
        'assets/img/Le_Petit_Prince_Web_066.jpg',
        'assets/img/Les_Fourberies_De_Scapin_Web_005.jpg',
        'assets/img/Tara_Sur_La_Lune_Web_020.jpg'
    ];
    
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// Start preloading images
preloadHeroImages();
