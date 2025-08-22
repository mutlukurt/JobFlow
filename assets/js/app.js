// ===== APP.JS - Main Application Logic =====

class JobFlowApp {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
        this.recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        this.applications = JSON.parse(localStorage.getItem('applications') || '[]');
        
        this.init();
    }

    init() {
        this.setTheme(this.currentTheme);
        this.setupEventListeners();
        this.setupNavigation();
        this.loadSavedData();
    }

    // ===== THEME MANAGEMENT =====
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
        
        // Update theme toggle button state
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`);
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    // ===== STORAGE MANAGEMENT =====
    saveJob(jobId) {
        if (!this.savedJobs.includes(jobId)) {
            this.savedJobs.push(jobId);
            localStorage.setItem('savedJobs', JSON.stringify(this.savedJobs));
            return true;
        }
        return false;
    }

    unsaveJob(jobId) {
        const index = this.savedJobs.indexOf(jobId);
        if (index > -1) {
            this.savedJobs.splice(index, 1);
            localStorage.setItem('savedJobs', JSON.stringify(this.savedJobs));
            return true;
        }
        return false;
    }

    isJobSaved(jobId) {
        return this.savedJobs.includes(jobId);
    }

    saveSearch(query, location) {
        const search = { query, location, timestamp: Date.now() };
        
        // Remove existing search with same query and location
        this.recentSearches = this.recentSearches.filter(
            s => !(s.query === query && s.location === location)
        );
        
        // Add new search at the beginning
        this.recentSearches.unshift(search);
        
        // Keep only last 10 searches
        this.recentSearches = this.recentSearches.slice(0, 10);
        
        localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
    }

    saveApplication(application) {
        application.id = Date.now().toString();
        application.timestamp = new Date().toISOString();
        this.applications.push(application);
        localStorage.setItem('applications', JSON.stringify(this.applications));
    }

    // ===== ROUTING HELPERS =====
    navigateTo(url, updateHistory = true) {
        if (updateHistory) {
            window.history.pushState({}, '', url);
        }
        
        // For single-page navigation, you could implement a router here
        // For now, we'll use standard navigation
        window.location.href = url;
    }

    getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    }

    updateQueryParams(params) {
        const url = new URL(window.location);
        Object.keys(params).forEach(key => {
            if (params[key]) {
                url.searchParams.set(key, params[key]);
            } else {
                url.searchParams.delete(key);
            }
        });
        
        window.history.pushState({}, '', url);
    }

    // ===== NAVIGATION =====
    setupNavigation() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navMenu && navMenu.classList.contains('active')) {
                if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            }
        });
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Search forms
        this.setupSearchForms();
        
        // Save job buttons
        this.setupSaveJobButtons();
        
        // Apply forms
        this.setupApplyForms();
        
        // Job posting form
        this.setupJobPostingForm();
    }

    setupSearchForms() {
        const searchForms = document.querySelectorAll('form[id*="search"]');
        
        searchForms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSearch(form);
            });
        });

        // Debounced search inputs
        const searchInputs = document.querySelectorAll('input[placeholder*="search"], input[placeholder*="Search"]');
        searchInputs.forEach(input => {
            let debounceTimer;
            input.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.handleSearchInput(e.target);
                }, 300);
            });
        });
    }

    setupSaveJobButtons() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('[id*="save-job"]')) {
                const button = e.target.closest('[id*="save-job"]');
                const jobId = button.dataset.jobId || this.getCurrentJobId();
                
                if (jobId) {
                    this.handleSaveJob(button, jobId);
                }
            }
        });
    }

    setupApplyForms() {
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('apply-form')) {
                e.preventDefault();
                this.handleApply(e.target);
            }
        });
    }

    setupJobPostingForm() {
        const jobForm = document.getElementById('job-form');
        if (jobForm) {
            jobForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleJobPosting(e.target);
            });

            // Save draft functionality
            const saveDraftBtn = document.getElementById('save-draft');
            if (saveDraftBtn) {
                saveDraftBtn.addEventListener('click', () => {
                    this.saveJobDraft();
                });
            }
        }
    }

    // ===== EVENT HANDLERS =====
    handleSearch(form) {
        const formData = new FormData(form);
        const query = formData.get('q') || formData.get('search-keywords') || '';
        const location = formData.get('loc') || formData.get('search-location') || '';
        
        if (query || location) {
            this.saveSearch(query, location);
            
            // Navigate to jobs page with search params
            const params = new URLSearchParams();
            if (query) params.set('q', query);
            if (location) params.set('loc', location);
            
            this.navigateTo(`./jobs.html?${params.toString()}`);
        }
    }

    handleSearchInput(input) {
        const query = input.value.trim();
        if (query.length > 2) {
            // Update URL params for search
            const params = {};
            if (input.id.includes('keywords')) params.q = query;
            if (input.id.includes('location')) params.loc = query;
            
            this.updateQueryParams(params);
        }
    }

    handleSaveJob(button, jobId) {
        if (this.isJobSaved(jobId)) {
            this.unsaveJob(jobId);
            button.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                Save Job
            `;
            button.classList.remove('saved');
            this.showToast('Job removed from saved jobs', 'info');
        } else {
            this.saveJob(jobId);
            button.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                Saved
            `;
            button.classList.add('saved');
            this.showToast('Job saved to your list', 'success');
        }
    }

    handleApply(form) {
        const formData = new FormData(form);
        const application = {
            jobId: this.getCurrentJobId(),
            jobTitle: document.getElementById('apply-job-title')?.textContent || 'Unknown Position',
            firstName: formData.get('apply-first-name') || '',
            lastName: formData.get('apply-last-name') || '',
            email: formData.get('apply-email') || '',
            phone: formData.get('apply-phone') || '',
            location: formData.get('apply-location') || '',
            resume: formData.get('apply-resume')?.name || '',
            coverLetter: formData.get('apply-cover-letter') || '',
            portfolio: formData.get('apply-portfolio') || ''
        };

        this.saveApplication(application);
        this.showToast('Application submitted successfully!', 'success');
        
        // Close modal
        const modal = form.closest('.modal');
        if (modal) {
            modal.classList.remove('active');
        }
        
        // Reset form
        form.reset();
    }

    handleJobPosting(form) {
        const formData = new FormData(form);
        const jobData = {
            id: Date.now().toString(),
            title: formData.get('job-title') || '',
            department: formData.get('job-department') || '',
            type: formData.get('job-type') || '',
            experience: formData.get('job-experience') || '',
            location: formData.get('job-location') || '',
            remote: formData.get('job-remote') || '',
            salaryMin: formData.get('job-salary-min') || '',
            salaryMax: formData.get('job-salary-max') || '',
            salaryPeriod: formData.get('job-salary-period') || 'yearly',
            benefits: formData.get('job-benefits') || '',
            description: formData.get('job-description') || '',
            responsibilities: formData.get('job-responsibilities') || '',
            requirements: formData.get('job-requirements') || '',
            niceToHave: formData.get('job-nice-to-have') || '',
            companyName: formData.get('company-name') || '',
            companyWebsite: formData.get('company-website') || '',
            companyDescription: formData.get('company-description') || '',
            companySize: formData.get('company-size') || '',
            companyIndustry: formData.get('company-industry') || '',
            contactName: formData.get('contact-name') || '',
            contactTitle: formData.get('contact-title') || '',
            contactEmail: formData.get('contact-email') || '',
            contactPhone: formData.get('contact-phone') || '',
            featured: formData.get('featured-job') === 'on',
            urgent: formData.get('urgent-hiring') === 'on',
            deadline: formData.get('application-deadline') || '',
            posted: new Date().toISOString()
        };

        // Save to localStorage (in a real app, this would go to a database)
        const postedJobs = JSON.parse(localStorage.getItem('postedJobs') || '[]');
        postedJobs.push(jobData);
        localStorage.setItem('postedJobs', JSON.stringify(postedJobs));

        this.showToast('Job posted successfully!', 'success');
        form.reset();
        
        // Redirect to jobs page
        setTimeout(() => {
            this.navigateTo('./jobs.html');
        }, 1500);
    }

    saveJobDraft() {
        const form = document.getElementById('job-form');
        if (form) {
            const formData = new FormData(form);
            const draft = {};
            
            for (const [key, value] of formData.entries()) {
                draft[key] = value;
            }
            
            localStorage.setItem('jobDraft', JSON.stringify(draft));
            this.showToast('Draft saved successfully', 'info');
        }
    }

    // ===== UTILITY METHODS =====
    getCurrentJobId() {
        const urlParams = this.getQueryParams();
        return urlParams.id || 'unknown';
    }

    showToast(message, type = 'info') {
        // This will be implemented in ui.js
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    loadSavedData() {
        // Load saved job states
        const saveButtons = document.querySelectorAll('[id*="save-job"]');
        saveButtons.forEach(button => {
            const jobId = button.dataset.jobId || this.getCurrentJobId();
            if (this.isJobSaved(jobId)) {
                button.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    Saved
                `;
                button.classList.add('saved');
            }
        });

        // Load job draft if on posting page
        if (window.location.pathname === '/post.html') {
            this.loadJobDraft();
        }
    }

    loadJobDraft() {
        const draft = localStorage.getItem('jobDraft');
        if (draft) {
            try {
                const draftData = JSON.parse(draft);
                const form = document.getElementById('job-form');
                
                if (form) {
                    Object.keys(draftData).forEach(key => {
                        const input = form.querySelector(`[id="${key}"]`);
                        if (input) {
                            if (input.type === 'checkbox') {
                                input.checked = draftData[key] === 'on';
                            } else {
                                input.value = draftData[key];
                            }
                        }
                    });
                }
            } catch (e) {
                console.error('Error loading draft:', e);
            }
        }
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    window.jobFlowApp = new JobFlowApp();
});

// ===== EXPORT FOR MODULES =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JobFlowApp;
}
