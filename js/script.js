// Enhanced Responsive JavaScript for Techsure Solutions

// DOM Elements
const header = document.getElementById('header');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const closeMenu = document.getElementById('close-menu');
const navLinks = document.querySelectorAll('.nav-link, #mobile-menu a');
const scrollTopBtn = document.getElementById('scroll-top');
const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');
const currentYearSpan = document.getElementById('current-year');

// Viewport Detection
const isMobile = () => window.innerWidth < 768;
const isTablet = () => window.innerWidth >= 768 && window.innerWidth < 1024;
const isDesktop = () => window.innerWidth >= 1024;

// Mobile Menu Toggle
if (hamburger && mobileMenu && closeMenu) {
    hamburger.addEventListener('click', () => {
        mobileMenu.classList.remove('-translate-x-full');
        document.body.style.overflow = 'hidden';
    });

    closeMenu.addEventListener('click', () => {
        mobileMenu.classList.add('-translate-x-full');
        document.body.style.overflow = '';
    });

    // Close mobile menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (isMobile() || isTablet()) {
                mobileMenu.classList.add('-translate-x-full');
                document.body.style.overflow = '';
            }
        });
    });

    // Close menu when clicking outside
    mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu) {
            mobileMenu.classList.add('-translate-x-full');
            document.body.style.overflow = '';
        }
    });
}

// Header Scroll Effect with Debounce
let lastScroll = 0;
let ticking = false;

const updateHeader = () => {
    const currentScroll = window.pageYOffset;
    
    // Add shadow to header when scrolled
    if (currentScroll > 100) {
        header.classList.add('shadow-lg', 'scrolled');
    } else {
        header.classList.remove('shadow-lg', 'scrolled');
    }
    
    // Hide/show header on scroll (desktop only)
    if (isDesktop()) {
        if (currentScroll > lastScroll && currentScroll > 200) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
    } else {
        header.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;
    
    // Show/hide scroll to top button
    if (currentScroll > 500) {
        scrollTopBtn.classList.remove('hidden');
        scrollTopBtn.classList.add('show');
    } else {
        scrollTopBtn.classList.add('hidden');
        scrollTopBtn.classList.remove('show');
    }
    
    // Update active navigation
    updateActiveNav();
    
    ticking = false;
};

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
    }
}, { passive: true });

// Scroll to Top Button
if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Active Navigation Link
function updateActiveNav() {
    const sections = document.querySelectorAll('section');
    const scrollPos = window.pageYOffset + (isDesktop() ? 100 : 80);
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// Contact Form Submission with Enhanced Validation
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            company: document.getElementById('company')?.value.trim() || '',
            message: document.getElementById('message').value.trim()
        };
        
        // Enhanced Validation
        let isValid = true;
        let errorMessage = '';
        
        // Name validation
        if (!formData.name || formData.name.length < 2) {
            isValid = false;
            errorMessage = 'Please enter a valid full name (minimum 2 characters).';
        }
        // Email validation
        else if (!formData.email) {
            isValid = false;
            errorMessage = 'Please enter your email address.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address.';
        }
        // Phone validation
        else if (!formData.phone) {
            isValid = false;
            errorMessage = 'Please enter your phone number.';
        } else if (!/^[\d\s\-\+\(\)]{10,}$/.test(formData.phone)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number (minimum 10 digits).';
        }
        // Message validation
        else if (!formData.message || formData.message.length < 10) {
            isValid = false;
            errorMessage = 'Please enter a message (minimum 10 characters).';
        }
        
        if (!isValid) {
            showFormMessage(errorMessage, 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Sending...</span>';
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Success
            showFormMessage('Thank you for contacting Techsure Solutions! We will get back to you within 24 hours.', 'success');
            
            // Reset form
            contactForm.reset();
            
            // Send email notification (in real implementation)
            sendEmailNotification(formData);
            
            // Google Analytics Event (if implemented)
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_submission', {
                    'event_category': 'Contact',
                    'event_label': 'Contact Form'
                });
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            showFormMessage('Something went wrong. Please try again later or contact us directly at +91-9460476041.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    });
}

function showFormMessage(message, type) {
    if (!formMessage) return;
    
    formMessage.textContent = message;
    formMessage.className = '';
    formMessage.classList.add('p-3', 'sm:p-4', 'rounded-lg', 'text-center', 'text-sm', 'sm:text-base');
    
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

function sendEmailNotification(formData) {
    // In a real application, this would send to your backend
    console.log('Email would be sent with:', formData);
    // Example: fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) });
}

// Client Slider Animation with Touch Support
function initClientSlider() {
    const sliders = document.querySelectorAll('.client-slider .flex');
    
    sliders.forEach(slider => {
        if (!slider) return;
        
        // Pause on hover (desktop only)
        if (isDesktop()) {
            slider.addEventListener('mouseenter', () => {
                slider.style.animationPlayState = 'paused';
            });
            
            slider.addEventListener('mouseleave', () => {
                slider.style.animationPlayState = 'running';
            });
        }
        
        // Touch swipe for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        
        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].clientX;
            slider.style.animationPlayState = 'paused';
        }, { passive: true });
        
        slider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            
            setTimeout(() => {
                slider.style.animationPlayState = 'running';
            }, 100);
        }, { passive: true });
    });
}

// Update Current Year
function updateCurrentYear() {
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
}

// Lazy Loading Images with Intersection Observer
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

// Form Field Validation
function initFormValidation() {
    const inputs = document.querySelectorAll('#contact-form input, #contact-form textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateField(input);
        });
        
        input.addEventListener('input', () => {
            clearFieldError(input);
        });
        
        // Prevent zoom on iOS
        if (isMobile() && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
            input.addEventListener('focus', () => {
                if (input.getAttribute('type') !== 'file') {
                    input.style.fontSize = '16px';
                }
            });
        }
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let error = '';
    
    switch (field.type) {
        case 'text':
            if (field.id === 'name' && (!value || value.length < 2)) {
                isValid = false;
                error = 'Name must be at least 2 characters';
            }
            break;
            
        case 'email':
            if (!value) {
                isValid = false;
                error = 'Email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                isValid = false;
                error = 'Invalid email format';
            }
            break;
            
        case 'tel':
            if (!value) {
                isValid = false;
                error = 'Phone number is required';
            } else if (!/^[\d\s\-\+\(\)]{10,}$/.test(value)) {
                isValid = false;
                error = 'Invalid phone number (min 10 digits)';
            }
            break;
            
        default:
            if (field.required && !value) {
                isValid = false;
                error = 'This field is required';
            }
    }
    
    if (!isValid) {
        showFieldError(field, error);
    } else {
        clearFieldError(field);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message text-xs sm:text-sm mt-1';
    errorDiv.textContent = message;
    errorDiv.setAttribute('role', 'alert');
    
    field.classList.add('error', 'border-red-500');
    field.parentNode.appendChild(errorDiv);
    
    const errorId = `error-${Date.now()}`;
    errorDiv.id = errorId;
    field.setAttribute('aria-describedby', errorId);
}

function clearFieldError(field) {
    const errorDiv = field.parentNode.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
    field.classList.remove('error', 'border-red-500');
    field.removeAttribute('aria-describedby');
}

// Smooth Scrolling for Anchor Links with Offset
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        if (href === '#' || href === '#!') return;
        
        const target = document.querySelector(href);
        
        if (target) {
            e.preventDefault();
            
            const headerHeight = header ? header.offsetHeight : 0;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - (isMobile() ? 10 : 20);
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Update URL without page reload
            if (history.pushState) {
                history.pushState(null, null, href);
            }
            
            // Focus target for accessibility
            target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
        }
    });
});

// Responsive Image Loading based on Device
function loadResponsiveImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        if (img.dataset.mobile && isMobile()) {
            img.src = img.dataset.mobile;
        } else if (img.dataset.tablet && isTablet()) {
            img.src = img.dataset.tablet;
        } else if (img.dataset.desktop && isDesktop()) {
            img.src = img.dataset.desktop;
        }
    });
}

// Detect and Handle Orientation Changes
let previousOrientation = window.orientation || 0;

window.addEventListener('orientationchange', () => {
    const currentOrientation = window.orientation || 0;
    
    if (previousOrientation !== currentOrientation) {
        // Close mobile menu on orientation change
        if (mobileMenu) {
            mobileMenu.classList.add('-translate-x-full');
            document.body.style.overflow = '';
        }
        
        // Recalculate layout
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
    }
    
    previousOrientation = currentOrientation;
});

// Window Resize Handler with Debounce
let resizeTimer;

window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    
    resizeTimer = setTimeout(() => {
        // Close mobile menu if window resized to desktop
        if (isDesktop() && mobileMenu && !mobileMenu.classList.contains('-translate-x-full')) {
            mobileMenu.classList.add('-translate-x-full');
            document.body.style.overflow = '';
        }
        
        // Update header height variable
        document.documentElement.style.setProperty(
            '--header-height',
            `${header ? header.offsetHeight : 64}px`
        );
        
        // Reload responsive images if needed
        loadResponsiveImages();
    }, 250);
});

// Performance Monitoring
function initPerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
        // Monitor Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
        });
        
        try {
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
            console.log('LCP observation not supported');
        }
        
        // Monitor First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                console.log('FID:', entry.processingStart - entry.startTime);
            });
        });
        
        try {
            fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (e) {
            console.log('FID observation not supported');
        }
    }
}

// Prevent Double-Tap Zoom on iOS
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

// Add WhatsApp click tracking
document.querySelectorAll('a[href*="whatsapp"]').forEach(link => {
    link.addEventListener('click', () => {
        console.log('WhatsApp link clicked');
        
        // Google Analytics Event
        if (typeof gtag !== 'undefined') {
            gtag('event', 'click', {
                'event_category': 'WhatsApp',
                'event_label': 'Chat Button'
            });
        }
    });
});

// Service and Product card click handlers
document.querySelectorAll('.service-card a, .product-card a').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        // Check if it's a relative link that doesn't exist yet
        if (href && !href.startsWith('http') && !href.startsWith('#')) {
            e.preventDefault();
            console.log(`Navigate to: ${href}`);
            
            // For demonstration purposes
            if (confirm('This page is under construction. Would you like to contact us for more information?')) {
                window.location.href = '#contact';
            }
        }
    });
});

// Accessibility: Trap focus in mobile menu when open
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled])'
    );
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === firstFocusable) {
                lastFocusable.focus();
                e.preventDefault();
            } else if (!e.shiftKey && document.activeElement === lastFocusable) {
                firstFocusable.focus();
                e.preventDefault();
            }
        }
        
        if (e.key === 'Escape') {
            closeMenu.click();
        }
    });
}

if (mobileMenu) {
    trapFocus(mobileMenu);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('%c🚀 Techsure Solutions - Responsive Version', 'font-size: 24px; font-weight: bold; color: #3498DB;');
    console.log('%cOne Stop Solution for All Industrial Needs', 'font-size: 14px; color: #2C3E50;');
    console.log(`%cDevice: ${isMobile() ? 'Mobile' : isTablet() ? 'Tablet' : 'Desktop'}`, 'font-size: 12px; color: #666;');
    
    updateCurrentYear();
    initClientSlider();
    initLazyLoading();
    initFormValidation();
    updateActiveNav();
    loadResponsiveImages();
    
    // Performance monitoring (development only)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        initPerformanceMonitoring();
    }
    
    // Add animation delay to elements
    document.querySelectorAll('.animate-fade-up').forEach((el, index) => {
        el.style.animationDelay = `${index * 100}ms`;
    });
    
    // Set CSS variable for header height
    document.documentElement.style.setProperty(
        '--header-height',
        `${header ? header.offsetHeight : 64}px`
    );
    
    // Announce page load to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = 'Page loaded successfully';
    document.body.appendChild(announcement);
});

// Window Load Event
window.addEventListener('load', () => {
    // Ensure all images are loaded
    setTimeout(() => {
        document.body.classList.add('loaded');
        
        // Remove loading states
        document.querySelectorAll('.loading').forEach(el => {
            el.classList.remove('loading');
        });
    }, 100);
    
    console.log('Page fully loaded');
});

// Handle visibility change (tab switching)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Tab is hidden');
    } else {
        console.log('Tab is visible');
        // Resume animations if needed
    }
});

// Service Worker Registration (if you want PWA support)
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered:', registration))
            .catch(error => console.log('SW registration failed:', error));
    });
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateField,
        updateActiveNav,
        isMobile,
        isTablet,
        isDesktop
    };
}
