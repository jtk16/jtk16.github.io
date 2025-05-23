// assets/js/main.js

/**
 * Portfolio JavaScript - Jack Kinney
 * Enhanced functionality for professional portfolio
 */

class Portfolio {
  constructor() {
    this.currentPage = this.getCurrentPage();
    this.init();
  }

  getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('projects.html')) return 'projects';
    if (path.includes('research.html')) return 'research';
    return 'home';
  }

  init() {
    this.bindEvents();
    this.initPageLoader();
    this.initNavigation();
    this.initScrollEffects();
    this.initAnimations();
    this.initForm();
    this.initBackToTop();
    
    // Page-specific initializations
    if (this.currentPage === 'home') {
      this.initHeroParticles();
    } else if (this.currentPage === 'projects') {
      this.initProjectsPage();
    } else if (this.currentPage === 'research') {
      this.initResearchPage();
    }
  }

  // ====================
  // PAGE LOADER
  // ====================
  initPageLoader() {
    const loader = document.getElementById('page-loader');
    if (!loader) return;

    // Hide loader when page is fully loaded
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('fade-out');
        document.body.classList.add('loaded');
        
        // Trigger initial animations
        this.triggerInitialAnimations();
      }, 500);
    });
  }

  triggerInitialAnimations() {
    // Trigger animations for elements visible on load
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((el, index) => {
      if (this.isElementInViewport(el)) {
        setTimeout(() => {
          el.classList.add('visible');
        }, index * 100);
      }
    });
  }

  // ====================
  // HERO PARTICLES
  // ====================
  initHeroParticles() {
    const particlesContainer = document.getElementById('hero-particles');
    if (!particlesContainer) return;

    // Create floating particles
    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
      this.createParticle(particlesContainer);
    }
  }

  createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random properties
    const size = Math.random() * 4 + 1;
    const duration = Math.random() * 20 + 10;
    const delay = Math.random() * 5;
    const x = Math.random() * 100;
    
    particle.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: ${Math.random() > 0.5 ? 'var(--primary)' : 'var(--secondary)'};
      border-radius: 50%;
      left: ${x}%;
      bottom: -50px;
      opacity: ${Math.random() * 0.5 + 0.2};
      animation: floatUp ${duration}s linear ${delay}s infinite;
    `;
    
    container.appendChild(particle);
    
    // Add animation if not already defined
    if (!document.querySelector('#particle-animation')) {
      const style = document.createElement('style');
      style.id = 'particle-animation';
      style.textContent = `
        @keyframes floatUp {
          to {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // ====================
  // BACK TO TOP
  // ====================
  initBackToTop() {
    const backToTop = document.getElementById('back-to-top');
    if (!backToTop) return;

    // Show/hide based on scroll position
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });

    // Scroll to top on click
    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ====================
  // PAGE-SPECIFIC FUNCTIONALITY
  // ====================
  initProjectsPage() {
    this.initProjectFilters();
    this.initProjectHovers();
  }

  initResearchPage() {
    this.initPublicationInteractions();
    this.initProgressBars();
  }

  initProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (filterButtons.length === 0) return;

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const filter = button.dataset.filter;
        this.filterProjects(filter, projectCards);
      });
    });
  }

  filterProjects(filter, projectCards) {
    projectCards.forEach((card, index) => {
      const categories = card.dataset.category ? card.dataset.category.split(' ') : [];
      const shouldShow = filter === 'all' || categories.includes(filter);
      
      card.style.transition = 'all 0.3s ease';
      
      if (shouldShow) {
        card.style.display = 'block';
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'scale(1) translateY(0)';
        }, index * 50);
      } else {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95) translateY(20px)';
        setTimeout(() => {
          card.style.display = 'none';
        }, 300);
      }
    });
  }

  initProjectHovers() {
    const projectCards = document.querySelectorAll('.project-card, .featured-project');
    
    projectCards.forEach(card => {
      card.addEventListener('mouseenter', (e) => {
        this.createRipple(e, card);
      });
    });
  }

  createRipple(e, element) {
    const ripple = document.createElement('div');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: rgba(99, 102, 241, 0.1);
      pointer-events: none;
      transform: translate(${x}px, ${y}px) scale(0);
      animation: rippleEffect 0.6s ease-out;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
    
    // Add ripple animation if not exists
    if (!document.querySelector('#ripple-animation')) {
      const style = document.createElement('style');
      style.id = 'ripple-animation';
      style.textContent = `
        @keyframes rippleEffect {
          to {
            transform: translate(var(--x), var(--y)) scale(4);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  initPublicationInteractions() {
    const citeButtons = document.querySelectorAll('.btn:has(.fa-quote-right), .project-link:has(.fa-quote-right)');
    
    citeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const publicationCard = button.closest('.publication-card');
        const title = publicationCard.querySelector('h3').textContent;
        const authors = Array.from(publicationCard.querySelectorAll('.author')).map(a => a.textContent).join(', ');
        const venue = publicationCard.querySelector('.venue').textContent;
        const year = new Date().getFullYear();
        
        const citation = `${authors}. "${title}" ${venue}, ${year}.`;
        
        if (navigator.clipboard) {
          navigator.clipboard.writeText(citation).then(() => {
            this.showToast('Citation copied to clipboard!', 'success');
          });
        } else {
          this.showToast('Citation: ' + citation);
        }
      });
    });
  }

  initProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const progressBar = entry.target;
          const width = progressBar.style.width;
          progressBar.style.width = '0%';
          
          setTimeout(() => {
            progressBar.style.width = width;
          }, 200);
          
          observer.unobserve(progressBar);
        }
      });
    });

    progressBars.forEach(bar => observer.observe(bar));
  }

  bindEvents() {
    // Window events
    window.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 16));
    window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));
    window.addEventListener('load', this.onWindowLoad.bind(this));
    
    // Document events
    document.addEventListener('DOMContentLoaded', this.onDOMLoaded.bind(this));
  }

  // ====================
  // NAVIGATION
  // ====================
  initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('nav');
    const navLinks = document.querySelectorAll('.nav-list a');

    // Mobile menu toggle
    if (navToggle && nav) {
      navToggle.addEventListener('click', () => {
        nav.classList.toggle('nav-open');
        navToggle.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = nav.classList.contains('nav-open') ? 'hidden' : '';
      });

      // Close nav when clicking outside
      document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !navToggle.contains(e.target)) {
          this.closeNavigation();
        }
      });

      // Close nav on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeNavigation();
        }
      });
    }

    // Smooth scroll for anchor links
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        // Handle anchor links
        if (href.includes('#')) {
          const [page, hash] = href.split('#');
          
          // If it's a same-page anchor
          if (!page || page === window.location.pathname || page === './index.html' && window.location.pathname.endsWith('/')) {
            e.preventDefault();
            const target = document.getElementById(hash);
            if (target) {
              this.smoothScrollTo(target, 80);
              this.closeNavigation();
            }
          }
        }
      });
    });

    // Update active nav link on scroll for homepage
    if (this.currentPage === 'home') {
      this.updateActiveNavLink();
    }
  }

  closeNavigation() {
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('nav-toggle');
    
    if (nav && navToggle) {
      nav.classList.remove('nav-open');
      navToggle.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-list a');

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const link = document.querySelector(`.nav-list a[href="#${entry.target.id}"]`);
          if (entry.isIntersecting && link) {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
          }
        });
      },
      { threshold: 0.3, rootMargin: '-100px 0px -100px 0px' }
    );

    sections.forEach(section => observer.observe(section));
  }

  smoothScrollTo(target, offset = 0) {
    const targetPosition = target.offsetTop - offset;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }

  // ====================
  // SCROLL EFFECTS
  // ====================
  initScrollEffects() {
    this.lastScrollY = window.scrollY;
    this.initScrollAnimations();
  }

  initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    
    animatedElements.forEach(el => observer.observe(el));
  }

  handleScroll() {
    const currentScrollY = window.scrollY;
    
    // Update header appearance
    this.updateHeader(currentScrollY);
    
    // Update scroll progress
    this.updateScrollProgress();
    
    this.lastScrollY = currentScrollY;
  }

  updateHeader(scrollY) {
    const header = document.getElementById('header');
    if (!header) return;

    // Add scrolled class for styling
    header.classList.toggle('scrolled', scrollY > 50);
  }

  updateScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress');
    if (!progressBar) return;

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.min((scrollTop / docHeight) * 100, 100);
    
    progressBar.style.width = `${scrollPercent}%`;
  }

  // ====================
  // ANIMATIONS
  // ====================
  initAnimations() {
    this.initIntersectionObserver();
    this.initCounters();
  }

  initIntersectionObserver() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
          entry.target.classList.add('fade-in');
          entry.target.classList.add('animated');
          
          // Trigger counter animation
          if (entry.target.classList.contains('stat-number')) {
            this.animateCounter(entry.target);
          }
        }
      });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.skill-category, .project-card, .contact-item').forEach(el => {
      observer.observe(el);
    });
  }

  initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    counters.forEach(counter => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !counter.classList.contains('counted')) {
            this.animateCounter(counter);
            counter.classList.add('counted');
          }
        });
      }, { threshold: 0.5 });
      
      observer.observe(counter);
    });
  }

  animateCounter(element) {
    const target = parseInt(element.dataset.count || element.textContent);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current) + (element.textContent.includes('+') ? '+' : '');
    }, 16);
  }

  // ====================
  // FORM HANDLING
  // ====================
  initForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', this.handleFormSubmit.bind(this));

    // Add real-time validation
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
  }

  handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Validate all fields
    const inputs = form.querySelectorAll('input, textarea');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    if (!isValid) return;

    // Show loading state
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitButton.disabled = true;

    // Simulate form submission (replace with actual endpoint)
    setTimeout(() => {
      this.showToast('Message sent successfully!', 'success');
      form.reset();
      
      submitButton.innerHTML = originalText;
      submitButton.disabled = false;
    }, 2000);
  }

  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Remove existing error
    this.clearFieldError(field);

    // Basic validation
    if (field.required && value.length === 0) {
      isValid = false;
      errorMessage = 'This field is required';
    } else if (field.type === 'email' && value.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
      }
    }

    if (!isValid) {
      this.showFieldError(field, errorMessage);
    }

    return isValid;
  }

  showFieldError(field, message) {
    field.style.borderColor = '#ef4444';
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    `;
    
    field.parentNode.appendChild(errorElement);
  }

  clearFieldError(field) {
    field.style.borderColor = '';
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
      errorElement.remove();
    }
  }

  // ====================
  // UTILITIES
  // ====================
  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white;
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
      z-index: 1000;
      animation: slideInUp 0.3s ease-out;
    `;
    
    // Add animation styles if not already present
    if (!document.querySelector('#toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        @keyframes slideInUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
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

  debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  handleResize() {
    // Handle any resize-specific logic here
    this.closeNavigation();
  }

  onDOMLoaded() {
    // Add any DOM-ready logic here
    console.log('Portfolio loaded successfully');
  }

  onWindowLoad() {
    // Add any window-load logic here
    document.body.classList.add('loaded');
  }
}

// Initialize the portfolio
const portfolio = new Portfolio();

// Make it globally available for debugging
window.portfolio = portfolio;

// Error handling
window.addEventListener('error', (event) => {
  console.error('JavaScript error:', event.error);
});

// Service Worker Registration (if available)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('Service Worker registered successfully');
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  });
}