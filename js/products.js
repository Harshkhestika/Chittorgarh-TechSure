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

// Close mobile menu when clicking on a link
document.querySelectorAll('#mobileMenu a').forEach(link => {
    link.addEventListener('click', () => {
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu) {
            mobileMenu.classList.add('hidden');
        }
    });
});

// ==================== CAROUSEL FUNCTIONALITY ====================

class ProductCarousel {
    constructor(carouselId) {
        this.carousel = document.getElementById(carouselId);
        if (!this.carousel) return;

        this.track = this.carousel.querySelector('.products-track');
        this.cards = Array.from(this.track.querySelectorAll('.product-card'));
        this.prevBtn = document.querySelector(`[data-carousel="${carouselId}"].carousel-btn-prev`);
        this.nextBtn = document.querySelector(`[data-carousel="${carouselId}"].carousel-btn-next`);
        
        this.currentIndex = 0;
        this.cardWidth = 0;
        this.visibleCards = 5; // Default for desktop
        this.gap = 16; // 1rem gap
        this.autoPlayInterval = null;
        this.isAnimating = false;

        // Touch/Swipe properties
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.isDragging = false;
        this.startScrollLeft = 0;

        this.init();
    }

    init() {
        this.calculateDimensions();
        this.setupEventListeners();
        this.updateButtons();

        // Enable touch scrolling on mobile
        if (isMobile() || isTablet()) {
            this.enableTouchScrolling();
        }

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
            this.visibleCards = 1.5;
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

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
        });

        // Pause on hover (desktop only)
        if (isDesktop()) {
            this.carousel.addEventListener('mouseenter', () => this.stopAutoPlay());
            this.carousel.addEventListener('mouseleave', () => this.startAutoPlay());
        }
    }

    enableTouchScrolling() {
        // Enable smooth horizontal scrolling on touch devices
        this.carousel.style.overflowX = 'auto';
        this.carousel.style.scrollSnapType = 'x mandatory';
        
        this.cards.forEach(card => {
            card.style.scrollSnapAlign = 'start';
        });

        // Touch events for swipe detection
        this.carousel.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.startScrollLeft = this.carousel.scrollLeft;
            
            // Stop auto-play on touch (if it's running)
            if (this.autoPlayInterval) {
                this.stopAutoPlay();
            }
        }, { passive: true });

        this.carousel.addEventListener('touchmove', (e) => {
            this.isDragging = true;
        }, { passive: true });

        this.carousel.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].clientX;
            this.handleSwipe();
            this.isDragging = false;
            
            // Restart auto-play on desktop only after swipe
            if (isDesktop()) {
                setTimeout(() => this.startAutoPlay(), 1000);
            }
        }, { passive: true });

        // Mouse drag for desktop touch screens
        let mouseStartX = 0;
        let scrollStart = 0;
        let isMouseDragging = false;

        this.carousel.addEventListener('mousedown', (e) => {
            if (!isDesktop()) return;
            isMouseDragging = true;
            mouseStartX = e.pageX - this.carousel.offsetLeft;
            scrollStart = this.carousel.scrollLeft;
            this.carousel.style.cursor = 'grabbing';
            
            // Stop auto-play on drag start
            this.stopAutoPlay();
        });

        this.carousel.addEventListener('mousemove', (e) => {
            if (!isMouseDragging) return;
            e.preventDefault();
            const x = e.pageX - this.carousel.offsetLeft;
            const walk = (x - mouseStartX) * 2;
            this.carousel.scrollLeft = scrollStart - walk;
        });

        this.carousel.addEventListener('mouseup', () => {
            isMouseDragging = false;
            this.carousel.style.cursor = 'grab';
            
            // Restart auto-play on desktop after dragging
            if (isDesktop()) {
                setTimeout(() => this.startAutoPlay(), 1000);
            }
        });

        this.carousel.addEventListener('mouseleave', () => {
            isMouseDragging = false;
            this.carousel.style.cursor = 'grab';
            
            // Restart auto-play on desktop after leaving
            if (isDesktop()) {
                setTimeout(() => this.startAutoPlay(), 1000);
            }
        });
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = this.touchStartX - this.touchEndX;

        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0) {
                // Swiped left - next
                this.next();
            } else {
                // Swiped right - prev
                this.prev();
            }
        }
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
            // Mobile/Tablet: Use smooth scrolling
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
        if (!this.prevBtn || !this.nextBtn) return;

        const maxIndex = this.cards.length - Math.floor(this.visibleCards);

        // Update prev button
        if (this.currentIndex <= 0) {
            this.prevBtn.disabled = true;
            this.prevBtn.style.opacity = '0.3';
        } else {
            this.prevBtn.disabled = false;
            this.prevBtn.style.opacity = '1';
        }

        // Update next button
        if (this.currentIndex >= maxIndex) {
            this.nextBtn.disabled = true;
            this.nextBtn.style.opacity = '0.3';
        } else {
            this.nextBtn.disabled = false;
            this.nextBtn.style.opacity = '1';
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

    goToSlide(index) {
        const maxIndex = this.cards.length - Math.floor(this.visibleCards);
        this.currentIndex = Math.max(0, Math.min(index, maxIndex));
        this.updatePosition();
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

// ==================== HEADER SCROLL EFFECT ====================

const header = document.querySelector('header');
let lastScroll = 0;

function updateHeader() {
    const currentScroll = window.pageYOffset;

    // Add shadow when scrolled
    if (currentScroll > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
}

window.addEventListener('scroll', debounce(updateHeader, 100));

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

    // Scroll to message on mobile
    if (isMobile()) {
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Auto-hide after 5 seconds
    setTimeout(() => {
        formMessage.classList.add('hidden');
    }, 5000);
}

// ==================== SMOOTH SCROLLING ====================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');

        if (href === '#' || href === '#!') return;

        const target = document.querySelector(href);

        if (target) {
            e.preventDefault();

            const headerHeight = header ? header.offsetHeight : 0;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Update URL
            if (history.pushState) {
                history.pushState(null, null, href);
            }
        }
    });
});

// ==================== LAZY LOADING IMAGES ====================

function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    delete img.dataset.src;
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: isMobile() ? '50px 0px' : '100px 0px',
            threshold: 0.1
        });

        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        images.forEach(img => {
            img.src = img.dataset.src;
            delete img.dataset.src;
        });
    }
}

// ==================== YEAR UPDATE ====================

function updateCurrentYear() {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

// ==================== ANIMATIONS ON SCROLL ====================

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe partner sections
    document.querySelectorAll('.partner-section, .product-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ==================== TRACK CLICKS ====================

function trackProductClick(productName, partnerName) {
    console.log(`Product clicked: ${productName} from ${partnerName}`);
    
    // Google Analytics (if implemented)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'product_click', {
            'event_category': 'Product',
            'event_label': `${partnerName} - ${productName}`
        });
    }
}

// Add click tracking to product links
document.querySelectorAll('.product-card a').forEach(link => {
    link.addEventListener('click', (e) => {
        const productName = link.closest('.product-card').querySelector('h5').textContent;
        const partnerName = link.closest('.mb-16, .mb-20, .mb-24').querySelector('h3').textContent;
        trackProductClick(productName, partnerName);
    });
});

// ==================== KEYBOARD ACCESSIBILITY ====================

// Trap focus in mobile menu
const mobileMenu = document.getElementById('mobileMenu');

if (mobileMenu) {
    mobileMenu.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            toggleMenu();
        }
    });
}

// ==================== RESPONSIVE VIEWPORT HANDLING ====================

let resizeTimer;

window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    
    resizeTimer = setTimeout(() => {
        // Close mobile menu if resized to desktop
        if (isDesktop() && mobileMenu && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
        }

        // Reinitialize carousels and handle auto-play
        Object.values(carousels).forEach(carousel => {
            carousel.calculateDimensions();
            carousel.updatePosition(false);
            carousel.updateButtons();
            
            // Stop auto-play if resized to mobile/tablet
            if (!isDesktop() && carousel.autoPlayInterval) {
                carousel.stopAutoPlay();
            }
            // Start auto-play if resized to desktop and not already playing
            else if (isDesktop() && !carousel.autoPlayInterval) {
                carousel.startAutoPlay();
            }
        });
    }, 250);
});

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
    console.log('%c🎨 Techsure Solutions - Products Page', 'font-size: 20px; font-weight: bold; color: #3498DB;');
    console.log('%cProducts & Technology Partners', 'font-size: 14px; color: #2C3E50;');
    console.log(`%cDevice: ${isMobile() ? 'Mobile' : isTablet() ? 'Tablet' : 'Desktop'}`, 'font-size: 12px; color: #666;');

    // Initialize all features
    updateCurrentYear();
    initializeCarousels();
    initLazyLoading();
    initScrollAnimations();
    updateScrollTopButton();
    updateHeader();

    // Add loaded class to body
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// ==================== WINDOW LOAD ====================

window.addEventListener('load', () => {
    console.log('✅ Page fully loaded');
    
    // Remove any loading states
    document.querySelectorAll('.loading').forEach(el => {
        el.classList.remove('loading');
    });
});

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

// ==================== PREVENT DOUBLE-TAP ZOOM (iOS) ====================

if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
    let lastTouchEnd = 0;

    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}

// ==================== FOOTER LINK HANDLING ====================

document.addEventListener('DOMContentLoaded', () => {
    // Handle footer internal links
    document.querySelectorAll('footer a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#' || href === '#!') return;
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                const headerHeight = document.querySelector('header')?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Ensure external links open in new tab
    document.querySelectorAll('footer a[href^="http"], footer a[href^="https"], footer a[href^="tel:"], footer a[href^="mailto:"]').forEach(link => {
        if (link.getAttribute('href').startsWith('tel:') || link.getAttribute('href').startsWith('mailto:')) {
            // Phone and email links should not open in new tab
            return;
        }
        if (!link.hasAttribute('target')) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });
});

// ==================== EXPORT FOR TESTING ====================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ProductCarousel,
        isMobile,
        isTablet,
        isDesktop,
        toggleMenu
    };
}
