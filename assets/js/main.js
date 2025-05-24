class Portfolio {
  constructor() {
    this.currentPage = this.getCurrentPage();
    this.isTransitioning = false;
    this.init();
  }

  getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('projects.html')) return 'projects';
    return 'home';
  }

  init() {
    this.bindEvents();
    this.initNavigation();
    this.initScrollEffects();
    this.initAnimations();
    this.initForm();
    this.initPageTransitions();
    this.initServiceWorker();

    // Page-specific initializations
    if (this.currentPage === 'projects') {
      this.initProjectsPage();
    }

    // Remove loading state
    setTimeout(() => {
      document.body.classList.remove('loading');
    }, 100);
  }

  // ====================
  // SERVICE WORKER
  // ====================
  initServiceWorker() {
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
  }

  // ====================
  // PAGE TRANSITIONS
  // ====================
  initPageTransitions() {
    const links = document.querySelectorAll('a[href^="./"]');
    const transition = document.querySelector('.page-transition');

    links.forEach(link => {
      if (link.getAttribute('target') === '_blank') return;

      link.addEventListener('click', (e) => {
        if (this.isTransitioning) return;

        e.preventDefault();
        const href = link.getAttribute('href');

        this.isTransitioning = true;
        transition.classList.add('active');

        setTimeout(() => {
          window.location.href = href;
        }, 300);
      });
    });
  }

  // ====================
  // PAGE-SPECIFIC FUNCTIONALITY
  // ====================
  initProjectsPage() {
    this.initProjectFilters();
    this.initProjectHovers();
    this.initLazyLoading();
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

      if (shouldShow) {
        card.style.display = 'block';
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, index * 50);
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
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
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }

  initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');

    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src || img.src;
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    }
  }

  bindEvents() {
    // Window events
    window.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 16));
    window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));
    window.addEventListener('load', this.onWindowLoad.bind(this));

    // Document events
    document.addEventListener('DOMContentLoaded', this.onDOMLoaded.bind(this));

    // Visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.resumeAnimations();
      }
    });
  }

  resumeAnimations() {
    // Resume any paused animations when page becomes visible
    const animatedElements = document.querySelectorAll('.stat-number');
    animatedElements.forEach(el => {
      if (el.dataset.animated !== 'true') {
        this.animateCounter(el);
      }
    });
  }

  // ====================
  // NAVIGATION
  // ====================
  initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('nav');
    const navLinks = document.querySelectorAll('.nav-list a');
    const header = document.getElementById('header');

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
        if (!nav.contains(e.target) && !navToggle.contains(e.target) && nav.classList.contains('nav-open')) {
          this.closeNavigation();
        }
      });

      // Close nav on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('nav-open')) {
          this.closeNavigation();
        }
      });
    }

    // Smooth scroll for anchor links
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');

        if (href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            this.smoothScrollTo(target, header.offsetHeight + 20);
            this.closeNavigation();
          }
        }
      });
    });

    // Update active nav link
    this.updateActiveNavLink();
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

    // Set active link based on current page
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href.includes(this.currentPage + '.html') ||
          (this.currentPage === 'home' && href === './index.html')) {
        link.classList.add('active');
      }
    });

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const link = document.querySelector(`.nav-list a[href="#${entry.target.id}"]`);
          if (entry.isIntersecting && link) {
            navLinks.forEach(l => {
              if (l.getAttribute('href').startsWith('#')) {
                l.classList.remove('active');
              }
            });
            link.classList.add('active');
          }
        });
      },
      { threshold: 0.3, rootMargin: '-100px 0px -100px 0px' }
    );

    sections.forEach(section => observer.observe(section));
  }

  smoothScrollTo(target, offset = 0) {
    const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;

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
    this.ticking = false;
  }

  handleScroll() {
    this.lastScrollY = window.scrollY;

    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        this.updateHeader(this.lastScrollY);
        this.updateScrollProgress();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  updateHeader(scrollY) {
    const header = document.getElementById('header');
    if (!header) return;

    // Add scrolled class for styling
    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
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
    this.initParallax();
  }

  initIntersectionObserver() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
          entry.target.classList.add('animated');

          // Trigger counter animation
          if (entry.target.classList.contains('stat-number')) {
            this.animateCounter(entry.target);
          }
        }
      });
    }, observerOptions);

    // Observe elements for animation
    const elementsToAnimate = document.querySelectorAll(
      '.skill-category, .project-card, .contact-item, .about-content, ' +
      '.hero-content, .section-header, .publication-card, .research-project'
    );

    elementsToAnimate.forEach(el => observer.observe(el));
  }

  initParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');

    if (parallaxElements.length === 0) return;

    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;

      parallaxElements.forEach(el => {
        const speed = el.dataset.parallax || 0.5;
        const yPos = -(scrolled * speed);
        el.style.transform = `translateY(${yPos}px)`;
      });
    });
  }

  animateCounter(element) {
    if (element.dataset.animated === 'true') return;

    const text = element.textContent;
    const number = parseInt(text.replace(/[^\d]/g, ''));
    const suffix = text.replace(/[\d]/g, '');

    if (isNaN(number)) return;

    element.dataset.animated = 'true';
    const duration = 2000;
    const step = number / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= number) {
        current = number;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current) + suffix;
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
      input.addEventListener('input', () => {
        this.clearFieldError(input);
        this.updateCharCount(input);
      });
    });

    // Add character counter for textarea
    const textarea = form.querySelector('textarea');
    if (textarea) {
      const charCounter = document.createElement('div');
      charCounter.className = 'char-counter';
      charCounter.textContent = '0 / 500';
      textarea.parentNode.appendChild(charCounter);
    }
  }

  updateCharCount(input) {
    if (input.tagName !== 'TEXTAREA') return;

    const charCounter = input.parentNode.querySelector('.char-counter');
    if (charCounter) {
      const count = input.value.length;
      const max = 500;
      charCounter.textContent = `${count} / ${max}`;
      charCounter.style.color = count > max ? 'var(--danger)' : 'var(--text-muted)';
    }
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

    if (!isValid) {
      this.showToast('Please fix the errors in the form', 'error');
      return;
    }

    // Show loading state
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<span class="spinner"></span> Sending...';
    submitButton.disabled = true;

    // Use fetch to submit to Formspree
    fetch(form.action, {
        method: form.method,
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    }).then(response => {
      if (response.ok) {
        this.showToast('Message sent successfully! I\'ll get back to you soon.', 'success');
        form.reset();
        const charCounter = form.querySelector('.char-counter');
        if (charCounter) {
          charCounter.textContent = '0 / 500';
        }
      } else {
        // Check if response is JSON before parsing
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return response.json().then(data => {
            if (data.errors) {
              this.showToast(data.errors.map(error => error.message).join(", "), 'error');
            } else {
              this.showToast('Oops! There was a problem submitting your form', 'error');
            }
          });
        } else {
          this.showToast('Oops! There was a problem submitting your form', 'error');
        }
      }
    }).catch(error => {
      console.error('Form submission error:', error);
      this.showToast('Oops! There was a network problem submitting your form', 'error');
    }).finally(() => {
      // Reset button state
      submitButton.innerHTML = originalText;
      submitButton.disabled = false;
    });
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
    } else if (field.tagName === 'TEXTAREA' && value.length > 500) {
      isValid = false;
      errorMessage = 'Message is too long (max 500 characters)';
    }

    if (!isValid) {
      this.showFieldError(field, errorMessage);
    }

    return isValid;
  }

  showFieldError(field, message) {
    field.style.borderColor = 'var(--danger)';

    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;

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
    // Remove existing toasts
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? 'check-circle' :
                 type === 'error' ? 'exclamation-circle' :
                 'info-circle';

    toast.innerHTML = `
      <i class="fas fa-${icon}"></i>
      <span>${message}</span>
    `;

    document.body.appendChild(toast);

    // Force reflow
    toast.offsetHeight;

    // Add animation class
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Remove after delay
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
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
    // Close navigation on resize
    this.closeNavigation();

    // Update any responsive elements
    this.updateResponsiveElements();
  }

  updateResponsiveElements() {
    const isMobile = window.innerWidth < 768;
    const body = document.body;

    if (isMobile) {
      body.classList.add('mobile');
    } else {
      body.classList.remove('mobile');
    }
  }

  onDOMLoaded() {
    console.log('Portfolio loaded successfully');

    // Add loaded class for animations
    document.body.classList.add('dom-loaded');
  }

  onWindowLoad() {
    // Add loaded class
    document.body.classList.add('loaded');

    // Remove page transition
    const transition = document.querySelector('.page-transition');
    if (transition) {
      transition.classList.remove('active');
    }
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

// Handle back button with page transitions
window.addEventListener('popstate', () => {
  const transition = document.querySelector('.page-transition');
  if (transition) {
    transition.classList.add('active');
    setTimeout(() => {
      location.reload();
    }, 300);
  }
});