// ===== UI.JS - User Interface Components =====

class JobFlowUI {
    constructor() {
        this.activeModal = null;
        this.toastQueue = [];
        this.isShowingToast = false;
        
        this.init();
    }

    init() {
        this.setupModals();
        this.setupToasts();
        this.setupFormValidation();
        this.setupAccessibility();
        this.setupMobileNavigation();
    }

    // ===== MODAL SYSTEM =====
    setupModals() {
        // Modal triggers
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-modal]');
            if (trigger) {
                e.preventDefault();
                const modalId = trigger.dataset.modal;
                this.openModal(modalId);
            }
        });

        // Modal close buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal__close') || 
                e.target.closest('.modal__close')) {
                e.preventDefault();
                this.closeActiveModal();
            }
        });

        // Close modal on backdrop click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeActiveModal();
            }
        });

        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.closeActiveModal();
            }
        });

        // Close specific modal
        document.addEventListener('click', (e) => {
            const closeTrigger = e.target.closest('[data-modal-close]');
            if (closeTrigger) {
                e.preventDefault();
                const modalId = closeTrigger.dataset.modalClose;
                this.closeModal(modalId);
            }
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(`${modalId}-modal`);
        if (!modal) return;

        // Close any active modal first
        if (this.activeModal) {
            this.closeActiveModal();
        }

        // Show the modal
        modal.classList.add('active');
        document.body.classList.add('modal-open');
        this.activeModal = modal;

        // Focus management
        const firstFocusable = modal.querySelector('input, button, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }

        // Trap focus within modal
        this.trapFocus(modal);

        // Announce modal to screen readers
        this.announceToScreenReader(`Opened ${modalId} modal`);
    }

    closeModal(modalId) {
        const modal = document.getElementById(`${modalId}-modal`);
        if (modal) {
            modal.classList.remove('active');
            if (!this.activeModal || this.activeModal === modal) {
                document.body.classList.remove('modal-open');
                this.activeModal = null;
            }
        }
    }

    closeActiveModal() {
        if (this.activeModal) {
            this.activeModal.classList.remove('active');
            document.body.classList.remove('modal-open');
            this.activeModal = null;
        }
    }

    trapFocus(modal) {
        const focusableElements = modal.querySelectorAll(
            'input, button, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    }

    // ===== TOAST SYSTEM =====
    setupToasts() {
        // Create toast container if it doesn't exist
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    }

    showToast(message, type = 'info', duration = 5000) {
        const toast = this.createToast(message, type);
        this.toastQueue.push(toast);
        
        if (!this.isShowingToast) {
            this.processToastQueue();
        }
    }

    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        
        const icon = this.getToastIcon(type);
        
        toast.innerHTML = `
            <div class="toast__content">
                ${icon}
                <span class="toast__message">${message}</span>
            </div>
            <button class="toast__close" aria-label="Close notification">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;

        // Add close functionality
        const closeBtn = toast.querySelector('.toast__close');
        closeBtn.addEventListener('click', () => {
            this.removeToast(toast);
        });

        return toast;
    }

    getToastIcon(type) {
        const icons = {
            success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22,4 12,14.01 9,11.01"></polyline>
            </svg>`,
            error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>`,
            warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>`,
            info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>`
        };
        
        return icons[type] || icons.info;
    }

    processToastQueue() {
        if (this.toastQueue.length === 0) {
            this.isShowingToast = false;
            return;
        }

        this.isShowingToast = true;
        const toast = this.toastQueue.shift();
        const container = document.getElementById('toast-container');
        
        container.appendChild(toast);
        
        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('toast--show');
        });

        // Auto-remove after duration
        setTimeout(() => {
            this.removeToast(toast);
        }, 5000);
    }

    removeToast(toast) {
        toast.classList.remove('toast--show');
        toast.addEventListener('transitionend', () => {
            toast.remove();
            this.processToastQueue();
        });
    }

    // ===== FORM VALIDATION =====
    setupFormValidation() {
        // Real-time validation
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.validateField(e.target);
            }
        });

        // Form submission validation
        document.addEventListener('submit', (e) => {
            if (e.target.tagName === 'FORM') {
                if (!this.validateForm(e.target)) {
                    e.preventDefault();
                    this.showFormErrors(e.target);
                }
            }
        });

        // Custom validation rules
        this.setupCustomValidation();
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Required validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        // Email validation
        if (field.type === 'email' && value && !this.isValidEmail(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }

        // URL validation
        if (field.type === 'url' && value && !this.isValidUrl(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid URL';
        }

        // Phone validation
        if (field.type === 'tel' && value && !this.isValidPhone(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
        }

        // Number range validation
        if (field.type === 'number') {
            const num = parseFloat(value);
            if (field.min && num < parseFloat(field.min)) {
                isValid = false;
                errorMessage = `Value must be at least ${field.min}`;
            }
            if (field.max && num > parseFloat(field.max)) {
                isValid = false;
                errorMessage = `Value must be at most ${field.max}`;
            }
        }

        // File validation
        if (field.type === 'file' && field.files.length > 0) {
            const file = field.files[0];
            const maxSize = 5 * 1024 * 1024; // 5MB
            
            if (file.size > maxSize) {
                isValid = false;
                errorMessage = 'File size must be less than 5MB';
            }
        }

        this.showFieldValidation(field, isValid, errorMessage);
        return isValid;
    }

    validateForm(form) {
        const fields = form.querySelectorAll('input, select, textarea');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    showFieldValidation(field, isValid, errorMessage) {
        // Remove existing error styling
        field.classList.remove('error', 'valid');
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        if (isValid) {
            field.classList.add('valid');
        } else {
            field.classList.add('error');
            
            // Add error message
            const errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.textContent = errorMessage;
            errorElement.setAttribute('role', 'alert');
            field.parentNode.appendChild(errorElement);
        }
    }

    showFormErrors(form) {
        const firstError = form.querySelector('.error');
        if (firstError) {
            firstError.focus();
            this.showToast('Please fix the errors in the form', 'error');
        }
    }

    setupCustomValidation() {
        // Salary range validation
        const salaryMin = document.getElementById('job-salary-min');
        const salaryMax = document.getElementById('job-salary-max');
        
        if (salaryMin && salaryMax) {
            const validateSalaryRange = () => {
                const min = parseFloat(salaryMin.value);
                const max = parseFloat(salaryMax.value);
                
                if (min && max && min > max) {
                    salaryMax.setCustomValidity('Maximum salary must be greater than minimum salary');
                } else {
                    salaryMax.setCustomValidity('');
                }
            };
            
            salaryMin.addEventListener('input', validateSalaryRange);
            salaryMax.addEventListener('input', validateSalaryRange);
        }

        // Password strength validation
        const passwordFields = document.querySelectorAll('input[type="password"]');
        passwordFields.forEach(field => {
            field.addEventListener('input', () => {
                const strength = this.checkPasswordStrength(field.value);
                this.showPasswordStrength(field, strength);
            });
        });
    }

    // ===== VALIDATION HELPERS =====
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    checkPasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
        if (score <= 2) return 'weak';
        if (score <= 3) return 'medium';
        return 'strong';
    }

    showPasswordStrength(field, strength) {
        // Remove existing strength indicator
        const existingIndicator = field.parentNode.querySelector('.password-strength');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        // Create strength indicator
        const indicator = document.createElement('div');
        indicator.className = `password-strength password-strength--${strength}`;
        indicator.innerHTML = `
            <span class="password-strength__label">Password strength: ${strength}</span>
            <div class="password-strength__bar">
                <div class="password-strength__fill" style="width: ${(strength === 'weak' ? 33 : strength === 'medium' ? 66 : 100)}%"></div>
            </div>
        `;
        
        field.parentNode.appendChild(indicator);
    }

    // ===== ACCESSIBILITY HELPERS =====
    setupAccessibility() {
        // Skip to main content link
        this.createSkipLink();
        
        // Focus indicators
        this.setupFocusIndicators();
        
        // ARIA live regions
        this.setupLiveRegions();
        
        // Keyboard navigation
        this.setupKeyboardNavigation();
    }

    createSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link sr-only';
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Add main content id if not present
        const main = document.querySelector('main');
        if (main && !main.id) {
            main.id = 'main';
        }
    }

    setupFocusIndicators() {
        // Add focus-visible class to all focusable elements
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    setupLiveRegions() {
        // Create live region for dynamic content
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'live-region';
        
        document.body.appendChild(liveRegion);
    }

    setupKeyboardNavigation() {
        // Handle keyboard navigation for custom components
        document.addEventListener('keydown', (e) => {
            // Enter key for buttons and links
            if (e.key === 'Enter' && e.target.matches('[role="button"], [tabindex]')) {
                e.preventDefault();
                e.target.click();
            }
            
            // Space key for buttons
            if (e.key === ' ' && e.target.matches('[role="button"]')) {
                e.preventDefault();
                e.target.click();
            }
        });
    }

    announceToScreenReader(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    // ===== UTILITY METHODS =====
    debounce(func, wait) {
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

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // ===== MOBILE NAVIGATION =====
    setupMobileNavigation() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (!navToggle || !navMenu) {
            console.log('Mobile navigation elements not found');
            return;
        }

        console.log('Setting up mobile navigation');

        // Store current state
        this.mobileMenuOpen = false;

        // SADECE toggle button event listener'ı
        navToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('=== TOGGLE CLICKED ===');
            console.log('Current state:', this.mobileMenuOpen);
            
            if (this.mobileMenuOpen) {
                this.closeMobileMenu();
                this.mobileMenuOpen = false;
            } else {
                this.openMobileMenu();
                this.mobileMenuOpen = true;
            }
            
            console.log('New state:', this.mobileMenuOpen);
        });

        // SADECE navigation link click
        navMenu.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav__link')) {
                console.log('Nav link clicked - closing menu');
                this.closeMobileMenu();
                this.mobileMenuOpen = false;
            }
        });
    }

    openMobileMenu() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (!navToggle || !navMenu) {
            console.log('Cannot open mobile menu - elements not found');
            return;
        }

        console.log('Opening mobile menu...');
        
        // Add classes
        navToggle.classList.add('active');
        navMenu.classList.add('active');
        document.body.classList.add('mobile-menu-open');
        
        console.log('Menu opened successfully');
    }

    closeMobileMenu() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (!navToggle || !navMenu) {
            console.log('Cannot close mobile menu - elements not found');
            return;
        }

        console.log('Closing mobile menu...');
        
        // Remove classes
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.classList.remove('mobile-menu-open');
        
        console.log('Menu closed successfully');
    }

    // Cleanup method to remove event listeners
    cleanup() {
        console.log('Cleaning up mobile navigation...');
        // Event listeners will be cleaned up automatically when page unloads
    }
}

    // ===== INITIALIZATION =====
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded, initializing JobFlowUI...');
        try {
            window.jobFlowUI = new JobFlowUI();
            console.log('JobFlowUI initialized successfully');
        } catch (error) {
            console.error('Error initializing JobFlowUI:', error);
        }
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (window.jobFlowUI) {
            window.jobFlowUI.cleanup();
        }
    });

// ===== GLOBAL FUNCTIONS =====
window.showToast = function(message, type = 'info', duration = 5000) {
    if (window.jobFlowUI) {
        window.jobFlowUI.showToast(message, type, duration);
    }
};

// ===== EXPORT FOR MODULES =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JobFlowUI;
}
