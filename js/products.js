// Products Page JavaScript - Enhanced with Carousel Functionality

// ==================== UTILITY FUNCTIONS ====================

// Check device type
const isMobile = () => window.innerWidth < 768;
const isTablet = () => window.innerWidth >= 768 && window.innerWidth < 1024;
const isDesktop = () => window.innerWidth >= 1024;

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ==================== MOBILE MENU ====================

function toggleMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
    }
}

// ==================== CAROUSEL FUNCTIONALITY ====================

class ProductCarousel {
    constructor(carouselId) {
        this.carousel = document.getElementById(carouselId);
        if (!this.carousel) return;

        this.track = this.carousel.querySelector('.products-track');
        this.cards = Array.from(this.track.querySelectorAll('.product-card'));
        this.prevBtn = document.querySelector(`[data-carousel="${carouselId}"].carousel-btn-prev`);
        this.nextBtn = document.querySelector(`[data-carousel="${carouselId}"].carousel-btn-next`);
        this.mobilePrevBtn = document.querySelector(`[data-carousel="${carouselId}"].mobile-carousel-btn-prev`);
        this.mobileNextBtn = document.querySelector(`[data-carousel="${carouselId}"].mobile-carousel-btn-next`);
        
        this.currentIndex = 0;
        this.cardWidth = 0;
        this.visibleCards = 5; // Default for desktop
        this.gap = 16; // 1rem gap
        this.autoPlayInterval = null;
        this.isAnimating = false;

        this.init();
    }

    init() {
        this.calculateDimensions();
        this.setupEventListeners();
        this.updateButtons();

        // Start auto-play ONLY on desktop
        if (isDesktop()) {
            this.startAutoPlay();
        }

        // Update on window resize
        window.addEventListener('resize', debounce(() => {
            this.calculateDimensions();
            this.updatePosition(false);
            this.updateButtons();
            
            // Re-evaluate auto-play on resize
            if (isDesktop() && !this.autoPlayInterval) {
                this.startAutoPlay();
            } else if (!isDesktop() && this.autoPlayInterval) {
                this.stopAutoPlay();
            }
        }, 250));
    }

    calculateDimensions() {
        if (!this.cards.length) return;

        // Calculate card width based on viewport
        if (isDesktop()) {
            this.visibleCards = 5;
            const containerWidth = this.carousel.offsetWidth;
            this.cardWidth = (containerWidth - (this.gap * (this.visibleCards - 1))) / this.visibleCards;
        } else if (isTablet()) {
            this.visibleCards = 3;
            this.cardWidth = 260;
        } else {
            this.visibleCards = 1.2;
            this.cardWidth = this.cards[0].offsetWidth;
        }
    }

    setupEventListeners() {
        // Desktop navigation buttons
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }

        // Mobile navigation buttons
        if (this.mobilePrevBtn) {
            this.mobilePrevBtn.addEventListener('click', () => this.prev());
        }

        if (this.mobileNextBtn) {
            this.mobileNextBtn.addEventListener('click', () => this.next());
        }

        // Keyboard navigation for this specific carousel
        this.carousel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.prev();
            }
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.next();
            }
        });

        // Make carousel focusable for keyboard navigation
        this.carousel.setAttribute('tabindex', '0');

        // Pause on hover (desktop only)
        if (isDesktop()) {
            this.carousel.addEventListener('mouseenter', () => this.stopAutoPlay());
            this.carousel.addEventListener('mouseleave', () => this.startAutoPlay());
        }

        // Touch/swipe for mobile
        if (isMobile() || isTablet()) {
            this.enableTouchScrolling();
        }
    }

    enableTouchScrolling() {
        let touchStartX = 0;
        let touchEndX = 0;
        const swipeThreshold = 50;

        this.carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        this.carousel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            const swipeDistance = touchStartX - touchEndX;

            if (Math.abs(swipeDistance) > swipeThreshold) {
                if (swipeDistance > 0) {
                    // Swiped left - next
                    this.next();
                } else {
                    // Swiped right - prev
                    this.prev();
                }
            }
        }, { passive: true });
    }

    next() {
        if (this.isAnimating) return;
        
        const maxIndex = this.cards.length - Math.floor(this.visibleCards);
        
        if (this.currentIndex < maxIndex) {
            this.currentIndex++;
            this.updatePosition();
        } else {
            // Loop back to start if at the end
            this.currentIndex = 0;
            this.updatePosition();
        }
        
        // Reset auto-play timer after manual navigation
        if (isDesktop() && this.autoPlayInterval) {
            this.restartAutoPlay();
        }
    }

    prev() {
        if (this.isAnimating) return;
        
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updatePosition();
        } else {
            // Loop to end if at the start
            const maxIndex = this.cards.length - Math.floor(this.visibleCards);
            this.currentIndex = maxIndex;
            this.updatePosition();
        }
        
        // Reset auto-play timer after manual navigation
        if (isDesktop() && this.autoPlayInterval) {
            this.restartAutoPlay();
        }
    }

    updatePosition(animate = true) {
        if (!this.track) return;

        this.isAnimating = true;

        if (isDesktop()) {
            // Desktop: Use transform for smooth animation
            const moveDistance = this.currentIndex * (this.cardWidth + this.gap);
            
            if (animate) {
                this.track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            } else {
                this.track.style.transition = 'none';
            }
            
            this.track.style.transform = `translateX(-${moveDistance}px)`;
        } else {
            // Mobile/Tablet: Use scrollTo
            const scrollPosition = this.currentIndex * (this.cardWidth + this.gap);
            this.carousel.scrollTo({
                left: scrollPosition,
                behavior: animate ? 'smooth' : 'auto'
            });
        }

        setTimeout(() => {
            this.isAnimating = false;
            this.updateButtons();
        }, 500);
    }

    updateButtons() {
        const maxIndex = this.cards.length - Math.floor(this.visibleCards);

        // Update desktop buttons
        if (this.prevBtn) {
            if (this.currentIndex <= 0) {
                this.prevBtn.disabled = true;
                this.prevBtn.style.opacity = '0.3';
            } else {
                this.prevBtn.disabled = false;
                this.prevBtn.style.opacity = '1';
            }
        }

        if (this.nextBtn) {
            if (this.currentIndex >= maxIndex) {
                this.nextBtn.disabled = true;
                this.nextBtn.style.opacity = '0.3';
            } else {
                this.nextBtn.disabled = false;
                this.nextBtn.style.opacity = '1';
            }
        }

        // Update mobile buttons
        if (this.mobilePrevBtn) {
            if (this.currentIndex <= 0) {
                this.mobilePrevBtn.disabled = true;
                this.mobilePrevBtn.style.opacity = '0.3';
            } else {
                this.mobilePrevBtn.disabled = false;
                this.mobilePrevBtn.style.opacity = '1';
            }
        }

        if (this.mobileNextBtn) {
            if (this.currentIndex >= maxIndex) {
                this.mobileNextBtn.disabled = true;
                this.mobileNextBtn.style.opacity = '0.3';
            } else {
                this.mobileNextBtn.disabled = false;
                this.mobileNextBtn.style.opacity = '1';
            }
        }
    }

    startAutoPlay(interval = 4000) {
        // Only start auto-play on desktop
        if (!isDesktop()) return;
        
        this.stopAutoPlay();
        this.autoPlayInterval = setInterval(() => {
            const maxIndex = this.cards.length - Math.floor(this.visibleCards);
            if (this.currentIndex >= maxIndex) {
                this.currentIndex = 0;
            } else {
                this.currentIndex++;
            }
            this.updatePosition();
        }, interval);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    restartAutoPlay() {
        if (!isDesktop()) return;
        
        this.stopAutoPlay();
        this.startAutoPlay();
    }
}

// ==================== INITIALIZE CAROUSELS ====================

let carousels = {};

function initializeCarousels() {
    const carouselIds = ['asian-paints', 'superon', 'ion-exchange', 'firepro', 'stanvac', 'jasic'];
    
    carouselIds.forEach(id => {
        const carousel = new ProductCarousel(id);
        carousels[id] = carousel;
    });

    console.log('✅ Product carousels initialized:', Object.keys(carousels).length);
}

// ==================== GLOBAL KEYBOARD NAVIGATION ====================

function setupGlobalKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Only handle arrow keys if not in input/textarea
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        // Find active carousel (the one currently in viewport)
        let activeCarousel = null;
        let minDistance = Infinity;

        Object.values(carousels).forEach(carousel => {
            if (carousel.carousel) {
                const rect = carousel.carousel.getBoundingClientRect();
                const distanceFromViewportCenter = Math.abs(rect.top - (window.innerHeight / 2));
                
                if (rect.top < window.innerHeight && rect.bottom > 0 && distanceFromViewportCenter < minDistance) {
                    minDistance = distanceFromViewportCenter;
                    activeCarousel = carousel;
                }
            }
        });

        if (activeCarousel) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                activeCarousel.prev();
            }
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                activeCarousel.next();
            }
        }
    });
}

// ==================== SCROLL TO TOP ====================

const scrollTopBtn = document.getElementById('scroll-top');

function updateScrollTopButton() {
    if (window.pageYOffset > 500) {
        scrollTopBtn.classList.remove('hidden');
        scrollTopBtn.classList.add('show');
    } else {
        scrollTopBtn.classList.add('hidden');
        scrollTopBtn.classList.remove('show');
    }
}

if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

window.addEventListener('scroll', debounce(updateScrollTopButton, 100));

// ==================== FORM HANDLING ====================

const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            product: document.getElementById('product')?.value.trim() || '',
            message: document.getElementById('message').value.trim()
        };

        // Validation
        if (!formData.name || formData.name.length < 2) {
            showFormMessage('Please enter a valid name (minimum 2 characters)', 'error');
            return;
        }

        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            showFormMessage('Please enter a valid email address', 'error');
            return;
        }

        if (!formData.phone || !/^[\d\s\-\+\(\)]{10,}$/.test(formData.phone)) {
            showFormMessage('Please enter a valid phone number (minimum 10 digits)', 'error');
            return;
        }

        if (!formData.message || formData.message.length < 10) {
            showFormMessage('Please enter a message (minimum 10 characters)', 'error');
            return;
        }

        // Show loading state
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Sending...</span>';
        submitBtn.disabled = true;

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Success
            showFormMessage('Thank you for your inquiry! We will get back to you within 24 hours.', 'success');
            contactForm.reset();

            // Log to console (in real app, send to backend)
            console.log('Form submission:', formData);

        } catch (error) {
            console.error('Form submission error:', error);
            showFormMessage('Something went wrong. Please try again or contact us directly.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

function showFormMessage(message, type) {
    if (!formMessage) return;

    formMessage.textContent = message;
    formMessage.className = 'p-3 sm:p-4 rounded-lg text-center text-sm sm:text-base';

    if (type === 'success') {
        formMessage.classList.add('bg-green-100', 'text-green-700', 'border', 'border-green-200', 'success');
    } else {
        formMessage.classList.add('bg-red-100', 'text-red-700', 'border', 'border-red-200', 'error');
    }

    formMessage.classList.remove('hidden');

    // Auto-hide after 5 seconds
    setTimeout(() => {
        formMessage.classList.add('hidden');
    }, 5000);
}

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
    console.log('%c🎨 Techsure Solutions - Products Page', 'font-size: 20px; font-weight: bold; color: #3498DB;');
    
    // Initialize all features
    updateCurrentYear();
    initializeCarousels();
    setupGlobalKeyboardNavigation();
    updateScrollTopButton();

    // Add loaded class to body
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// ==================== YEAR UPDATE ====================

function updateCurrentYear() {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

// ==================== HANDLE PAGE VISIBILITY ====================

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden - stop auto-play
        Object.values(carousels).forEach(carousel => {
            carousel.stopAutoPlay();
        });
    } else {
        // Page is visible - resume auto-play ONLY on desktop
        if (isDesktop()) {
            Object.values(carousels).forEach(carousel => {
                carousel.startAutoPlay();
            });
        }
    }
});
