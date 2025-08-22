// ===== JOBS.JS - Job Management and Display =====

class JobFlowJobs {
    constructor() {
        this.jobs = [];
        this.companies = [];
        this.filteredJobs = [];
        this.currentPage = 1;
        this.jobsPerPage = 12;
        this.currentFilters = {};
        this.currentSort = 'relevance';
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderJobs();
    }

    // ===== DATA LOADING =====
    async loadData() {
        try {
            // Load jobs data
            const jobsResponse = await fetch('/data/jobs.json');
            this.jobs = await jobsResponse.json();
            
            // Load companies data
            const companiesResponse = await fetch('/data/companies.json');
            this.companies = await companiesResponse.json();
            
            // Merge company data with jobs
            this.jobs = this.jobs.map(job => ({
                ...job,
                company: this.companies.find(company => company.id === job.companyId) || {}
            }));
            
            this.filteredJobs = [...this.jobs];
            this.renderJobs();
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Failed to load jobs. Please try again later.');
        }
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Filter changes
        const filterInputs = document.querySelectorAll('#filter-role, #filter-experience, #filter-type, #filter-salary');
        filterInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updateFilters();
            });
        });

        // Sort changes
        const sortSelect = document.getElementById('sort-jobs');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.applyFiltersAndSort();
            });
        }

        // Clear filters
        const clearFiltersBtn = document.getElementById('clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }

        // Save search
        const saveSearchBtn = document.getElementById('save-search');
        if (saveSearchBtn) {
            saveSearchBtn.addEventListener('click', () => {
                this.saveCurrentSearch();
            });
        }

        // Search form
        const searchForm = document.getElementById('jobs-search');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSearch(e.target);
            });
        }

        // Debounced search inputs
        const searchInputs = document.querySelectorAll('#search-keywords, #search-location');
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

    // ===== SEARCH AND FILTERS =====
    handleSearch(form) {
        const formData = new FormData(form);
        const query = formData.get('search-keywords') || '';
        const location = formData.get('search-location') || '';
        
        this.currentFilters.query = query;
        this.currentFilters.location = location;
        
        this.applyFiltersAndSort();
        this.updateURL();
    }

    handleSearchInput(input) {
        const value = input.value.trim();
        
        if (input.id === 'search-keywords') {
            this.currentFilters.query = value;
        } else if (input.id === 'search-location') {
            this.currentFilters.location = value;
        }
        
        this.applyFiltersAndSort();
        this.updateURL();
    }

    updateFilters() {
        this.currentFilters.role = document.getElementById('filter-role')?.value || '';
        this.currentFilters.experience = document.getElementById('filter-experience')?.value || '';
        this.currentFilters.type = document.getElementById('filter-type')?.value || '';
        this.currentFilters.salary = document.getElementById('filter-salary')?.value || '';
        
        this.applyFiltersAndSort();
        this.updateURL();
    }

    applyFiltersAndSort() {
        this.filteredJobs = this.jobs.filter(job => {
            return this.matchesFilters(job);
        });
        
        this.sortJobs();
        this.currentPage = 1;
        this.renderJobs();
    }

    matchesFilters(job) {
        // Query filter (title, description, company)
        if (this.currentFilters.query) {
            const query = this.currentFilters.query.toLowerCase();
            const matchesQuery = 
                job.title.toLowerCase().includes(query) ||
                job.description.toLowerCase().includes(query) ||
                job.company.name.toLowerCase().includes(query) ||
                job.requirements.some(req => req.toLowerCase().includes(query));
            
            if (!matchesQuery) return false;
        }
        
        // Location filter
        if (this.currentFilters.location) {
            const location = this.currentFilters.location.toLowerCase();
            const matchesLocation = 
                job.location.toLowerCase().includes(location) ||
                job.remote === 'remote' && location.includes('remote');
            
            if (!matchesLocation) return false;
        }
        
        // Role filter
        if (this.currentFilters.role && job.role !== this.currentFilters.role) {
            return false;
        }
        
        // Experience filter
        if (this.currentFilters.experience && job.experience !== this.currentFilters.experience) {
            return false;
        }
        
        // Employment type filter
        if (this.currentFilters.type && job.type !== this.currentFilters.type) {
            return false;
        }
        
        // Salary filter
        if (this.currentFilters.salary) {
            const [min, max] = this.currentFilters.salary.split('-').map(Number);
            const jobSalary = job.salaryMax || job.salaryMin;
            
            if (max && jobSalary > max) return false;
            if (min && jobSalary < min) return false;
        }
        
        return true;
    }

    sortJobs() {
        switch (this.currentSort) {
            case 'date':
                this.filteredJobs.sort((a, b) => new Date(b.posted) - new Date(a.posted));
                break;
            case 'salary-high':
                this.filteredJobs.sort((a, b) => (b.salaryMax || 0) - (a.salaryMax || 0));
                break;
            case 'salary-low':
                this.filteredJobs.sort((a, b) => (a.salaryMin || 0) - (b.salaryMin || 0));
                break;
            case 'relevance':
            default:
                // Relevance is based on filters and search terms
                // Jobs matching more criteria get higher priority
                this.filteredJobs.sort((a, b) => {
                    const aScore = this.calculateRelevanceScore(a);
                    const bScore = this.calculateRelevanceScore(b);
                    return bScore - aScore;
                });
                break;
        }
    }

    calculateRelevanceScore(job) {
        let score = 0;
        
        // Boost featured jobs
        if (job.featured) score += 100;
        
        // Boost urgent jobs
        if (job.urgent) score += 50;
        
        // Boost jobs matching search query
        if (this.currentFilters.query) {
            const query = this.currentFilters.query.toLowerCase();
            if (job.title.toLowerCase().includes(query)) score += 30;
            if (job.company.name.toLowerCase().includes(query)) score += 20;
        }
        
        // Boost jobs matching location
        if (this.currentFilters.location) {
            const location = this.currentFilters.location.toLowerCase();
            if (job.location.toLowerCase().includes(location)) score += 25;
        }
        
        // Boost recent jobs
        const daysSincePosted = (Date.now() - new Date(job.posted)) / (1000 * 60 * 60 * 24);
        if (daysSincePosted < 7) score += 15;
        else if (daysSincePosted < 30) score += 10;
        
        return score;
    }

    clearFilters() {
        this.currentFilters = {};
        
        // Reset form inputs
        const filterInputs = document.querySelectorAll('#filter-role, #filter-experience, #filter-type, #filter-salary');
        filterInputs.forEach(input => {
            input.value = '';
        });
        
        const searchInputs = document.querySelectorAll('#search-keywords, #search-location');
        searchInputs.forEach(input => {
            input.value = '';
        });
        
        this.applyFiltersAndSort();
        this.updateURL();
    }

    saveCurrentSearch() {
        const searchData = {
            filters: { ...this.currentFilters },
            sort: this.currentSort,
            timestamp: Date.now()
        };
        
        const savedSearches = JSON.parse(localStorage.getItem('savedSearches') || '[]');
        savedSearches.unshift(searchData);
        
        // Keep only last 10 saved searches
        savedSearches.splice(10);
        
        localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
        
        if (window.showToast) {
            window.showToast('Search saved successfully', 'success');
        }
    }

    // ===== URL MANAGEMENT =====
    updateURL() {
        const params = new URLSearchParams();
        
        Object.keys(this.currentFilters).forEach(key => {
            if (this.currentFilters[key]) {
                params.set(key, this.currentFilters[key]);
            }
        });
        
        if (this.currentSort !== 'relevance') {
            params.set('sort', this.currentSort);
        }
        
        const newURL = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, '', newURL);
    }

    loadFromURL() {
        const params = new URLSearchParams(window.location.search);
        
        // Load search query
        const query = params.get('q');
        const location = params.get('loc');
        
        if (query) {
            document.getElementById('search-keywords').value = query;
            this.currentFilters.query = query;
        }
        
        if (location) {
            document.getElementById('search-location').value = location;
            this.currentFilters.location = location;
        }
        
        // Load filters
        const role = params.get('role');
        const experience = params.get('experience');
        const type = params.get('type');
        const salary = params.get('salary');
        
        if (role) {
            document.getElementById('filter-role').value = role;
            this.currentFilters.role = role;
        }
        
        if (experience) {
            document.getElementById('filter-experience').value = experience;
            this.currentFilters.experience = experience;
        }
        
        if (type) {
            document.getElementById('filter-type').value = type;
            this.currentFilters.type = type;
        }
        
        if (salary) {
            document.getElementById('filter-salary').value = salary;
            this.currentFilters.salary = salary;
        }
        
        // Load sort
        const sort = params.get('sort');
        if (sort) {
            this.currentSort = sort;
            const sortSelect = document.getElementById('sort-jobs');
            if (sortSelect) {
                sortSelect.value = sort;
            }
        }
        
        this.applyFiltersAndSort();
    }

    // ===== RENDERING =====
    renderJobs() {
        const container = document.getElementById('jobs-results') || document.getElementById('featured-jobs');
        if (!container) return;
        
        const startIndex = (this.currentPage - 1) * this.jobsPerPage;
        const endIndex = startIndex + this.jobsPerPage;
        const jobsToShow = this.filteredJobs.slice(startIndex, endIndex);
        
        if (jobsToShow.length === 0) {
            container.innerHTML = this.renderNoResults();
        } else {
            container.innerHTML = jobsToShow.map(job => this.renderJobCard(job)).join('');
        }
        
        // Update results count
        this.updateResultsCount();
        
        // Render pagination if needed
        if (container.id === 'jobs-results') {
            this.renderPagination();
        }
        
        // Setup job card event listeners
        this.setupJobCardListeners();
    }

    renderJobCard(job) {
        const isSaved = window.jobFlowApp?.isJobSaved(job.id) || false;
        const saveButtonText = isSaved ? 'Saved' : 'Save Job';
        const saveButtonClass = isSaved ? 'saved' : '';
        const saveButtonIcon = isSaved ? 'fill="currentColor"' : '';
        
        return `
            <article class="job-card card" data-job-id="${job.id}">
                <div class="job-card__header">
                    <div class="company-badge">
                        <div class="company-badge__logo">
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                <rect width="48" height="48" rx="12" fill="var(--surface-2)"/>
                                <text x="24" y="28" text-anchor="middle" fill="var(--text-2)" font-family="Inter" font-size="16" font-weight="600">
                                    ${job.company.name.substring(0, 2).toUpperCase()}
                                </text>
                            </svg>
                        </div>
                        <div class="company-badge__info">
                            <h3 class="job-card__title">
                                <a href="/job.html?id=${job.id}">${job.title}</a>
                            </h3>
                            <div class="company-name">${job.company.name}</div>
                        </div>
                    </div>
                    
                    <button class="btn btn--outline btn--small ${saveButtonClass}" 
                            id="save-job-${job.id}" 
                            data-job-id="${job.id}"
                            aria-label="${isSaved ? 'Remove from saved jobs' : 'Save job'}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        ${saveButtonText}
                    </button>
                </div>
                
                <div class="job-card__meta">
                    <div class="job-meta__item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span>${job.location}</span>
                    </div>
                    <div class="job-meta__item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect width="20" height="20" x="2" y="7" rx="2" ry="2"/>
                            <path d="M16 21V5a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v16"/>
                        </svg>
                        <span>${job.type}</span>
                    </div>
                    <div class="job-meta__item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                        <span>${this.formatSalary(job.salaryMin, job.salaryMax)}</span>
                    </div>
                    <div class="job-meta__item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12,6 12,12 16,14"/>
                        </svg>
                        <span>${this.formatDate(job.posted)}</span>
                    </div>
                </div>
                
                <div class="job-card__description">
                    <p>${job.description.substring(0, 150)}${job.description.length > 150 ? '...' : ''}</p>
                </div>
                
                <div class="job-card__tags">
                    ${job.requirements.slice(0, 3).map(req => 
                        `<span class="tag">${req}</span>`
                    ).join('')}
                    ${job.requirements.length > 3 ? `<span class="tag">+${job.requirements.length - 3} more</span>` : ''}
                </div>
                
                <div class="job-card__actions">
                    <a href="/job.html?id=${job.id}" class="btn btn--primary">View Details</a>
                    <button class="btn btn--outline" data-modal="apply" data-job-id="${job.id}">Quick Apply</button>
                </div>
            </article>
        `;
    }

    renderNoResults() {
        return `
            <div class="no-results">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                </svg>
                <h3>No jobs found</h3>
                <p>Try adjusting your search criteria or filters to find more opportunities.</p>
                <button class="btn btn--outline" onclick="jobFlowJobs.clearFilters()">Clear All Filters</button>
            </div>
        `;
    }

    renderPagination() {
        const totalPages = Math.ceil(this.filteredJobs.length / this.jobsPerPage);
        const container = document.getElementById('pagination');
        
        if (!container || totalPages <= 1) {
            if (container) container.innerHTML = '';
            return;
        }
        
        let paginationHTML = '<div class="pagination__info">';
        paginationHTML += `Page ${this.currentPage} of ${totalPages}`;
        paginationHTML += '</div>';
        
        paginationHTML += '<div class="pagination__controls">';
        
        // Previous button
        if (this.currentPage > 1) {
            paginationHTML += `<button class="btn btn--outline btn--small" onclick="jobFlowJobs.goToPage(${this.currentPage - 1})">Previous</button>`;
        }
        
        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            if (i === this.currentPage) {
                paginationHTML += `<button class="btn btn--primary btn--small" disabled>${i}</button>`;
            } else {
                paginationHTML += `<button class="btn btn--outline btn--small" onclick="jobFlowJobs.goToPage(${i})">${i}</button>`;
            }
        }
        
        // Next button
        if (this.currentPage < totalPages) {
            paginationHTML += `<button class="btn btn--outline btn--small" onclick="jobFlowJobs.goToPage(${this.currentPage + 1})">Next</button>`;
        }
        
        paginationHTML += '</div>';
        
        container.innerHTML = paginationHTML;
    }

    // ===== PAGINATION =====
    goToPage(page) {
        this.currentPage = page;
        this.renderJobs();
        
        // Scroll to top of results
        const resultsSection = document.querySelector('.results');
        if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // ===== UTILITY METHODS =====
    formatSalary(min, max) {
        if (!min && !max) return 'Salary not specified';
        
        const formatAmount = (amount) => {
            if (amount >= 1000) {
                return `$${(amount / 1000).toFixed(0)}K`;
            }
            return `$${amount.toLocaleString()}`;
        };
        
        if (min && max) {
            return `${formatAmount(min)} - ${formatAmount(max)}`;
        } else if (min) {
            return `${formatAmount(min)}+`;
        } else {
            return `Up to ${formatAmount(max)}`;
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays - 1} days ago`;
        if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        if (diffDays <= 365) return `${Math.ceil(diffDays / 30)} months ago`;
        return `${Math.ceil(diffDays / 365)} years ago`;
    }

    updateResultsCount() {
        const countElement = document.getElementById('results-count');
        if (countElement) {
            countElement.textContent = this.filteredJobs.length;
        }
    }

    setupJobCardListeners() {
        // Save job buttons
        const saveButtons = document.querySelectorAll('[id^="save-job-"]');
        saveButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const jobId = button.dataset.jobId;
                if (window.jobFlowApp) {
                    window.jobFlowApp.handleSaveJob(button, jobId);
                }
            });
        });
        
        // Quick apply buttons
        const quickApplyButtons = document.querySelectorAll('[data-modal="apply"]');
        quickApplyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const jobId = button.dataset.jobId;
                if (jobId) {
                    // Store job ID for apply modal
                    sessionStorage.setItem('applyJobId', jobId);
                }
            });
        });
    }

    showError(message) {
        if (window.showToast) {
            window.showToast(message, 'error');
        } else {
            console.error(message);
        }
    }

    // ===== JOB DETAIL PAGE =====
    loadJobDetail() {
        const urlParams = new URLSearchParams(window.location.search);
        const jobId = urlParams.get('id');
        
        if (!jobId) {
            this.showError('No job ID specified');
            return;
        }
        
        const job = this.jobs.find(j => j.id === jobId);
        if (!job) {
            this.showError('Job not found');
            return;
        }
        
        this.renderJobDetail(job);
        this.loadSimilarJobs(job);
    }

    renderJobDetail(job) {
        // Update page title
        document.title = `${job.title} at ${job.company.name} - JobFlow`;
        
        // Update job header
        document.getElementById('job-title').textContent = job.title;
        document.getElementById('company-name').textContent = job.company.name;
        document.getElementById('job-location').textContent = job.location;
        document.getElementById('job-type').textContent = job.type;
        document.getElementById('job-salary').textContent = this.formatSalary(job.salaryMin, job.salaryMax);
        document.getElementById('job-posted').textContent = this.formatDate(job.posted);
        
        // Update job content
        document.getElementById('job-description').innerHTML = `<p>${job.description}</p>`;
        
        document.getElementById('job-responsibilities').innerHTML = 
            job.responsibilities.map(resp => `<li>${resp}</li>`).join('');
        
        document.getElementById('job-requirements').innerHTML = 
            job.requirements.map(req => `<li>${req}</li>`).join('');
        
        document.getElementById('job-benefits').innerHTML = 
            job.benefits.map(benefit => `<li>${benefit}</li>`).join('');
        
        // Update sidebar
        document.getElementById('sidebar-company-name').textContent = job.company.name;
        document.getElementById('sidebar-company-desc').textContent = job.company.description;
        document.getElementById('sidebar-company-size').textContent = job.company.size;
        document.getElementById('sidebar-company-industry').textContent = job.company.industry;
        
        // Update apply modal
        document.getElementById('apply-job-title').textContent = job.title;
        
        // Update save button state
        const saveButton = document.getElementById('save-job');
        if (saveButton) {
            saveButton.dataset.jobId = job.id;
            if (window.jobFlowApp?.isJobSaved(job.id)) {
                saveButton.classList.add('saved');
                saveButton.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    Saved
                `;
            }
        }
    }

    loadSimilarJobs(currentJob) {
        const similarJobs = this.jobs
            .filter(job => 
                job.id !== currentJob.id && 
                (job.role === currentJob.role || 
                 job.company.industry === currentJob.company.industry)
            )
            .slice(0, 3);
        
        const container = document.getElementById('similar-jobs-list');
        if (container) {
            container.innerHTML = similarJobs.map(job => `
                <div class="similar-job">
                    <h4><a href="/job.html?id=${job.id}">${job.title}</a></h4>
                    <p>${job.company.name} • ${job.location}</p>
                    <p class="similar-job__salary">${this.formatSalary(job.salaryMin, job.salaryMax)}</p>
                </div>
            `).join('');
        }
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    window.jobFlowJobs = new JobFlowJobs();
    
    // Load data from URL if on jobs page
    if (window.location.pathname === '/jobs.html') {
        window.jobFlowJobs.loadFromURL();
    }
    
    // Load job detail if on job detail page
    if (window.location.pathname === '/job.html') {
        window.jobFlowJobs.loadJobDetail();
    }
});

// ===== EXPORT FOR MODULES =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JobFlowJobs;
}
