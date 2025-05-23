/**
 * Enhanced Portfolio JavaScript - JTK16
 * Modern, interactive features for a professional robotics engineer portfolio
 * Now includes Projects and Research page functionality
 */

class PortfolioApp {
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
    this.initAnimations();
    this.initTheme();
    this.initNavigation();
    this.initScrollEffects();
    this.initTypingEffect();
    this.initProjects();
    this.initSkills();
    this.initContact();
    this.initPerformance();
    
    // Page-specific initializations
    if (this.currentPage === 'projects') {
      this.initProjectsPage();
    } else if (this.currentPage === 'research') {
      this.initResearchPage();
    } else {
      this.initParticles();
    }
  }

  bindEvents() {
    // DOM loaded
    document.addEventListener('DOMContentLoaded', () => {
      this.initIntersectionObserver();
      this.initCounters();
      this.initLazyLoading();
      this.hideLoadingScreen();
    });

    // Window events
    window.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 16));
    window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));
    window.addEventListener('load', this.onWindowLoad.bind(this));

    // Keyboard navigation
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 300);
      }, 500);
    }
  }

  // ====================
  // NAVIGATION & HEADER
  // ====================
  initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('nav');
    const navLinks = document.querySelectorAll('.nav__list a');

    if (navToggle && nav) {
      navToggle.addEventListener('click', () => {
        nav.classList.toggle('nav-open');
        navToggle.classList.toggle('toggle-open');
        navToggle.setAttribute('aria-expanded', nav.classList.contains('nav-open'));
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = nav.classList.contains('nav-open') ? 'hidden' : '';
      });

      // Close nav when clicking outside
      document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !navToggle.contains(e.target)) {
          this.closeNavigation();
        }
      });

      // Close nav when pressing escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeNavigation();
        }
      });
    }

    // Navigation link handling
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        // Handle same-page anchors
        if (href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            this.smoothScrollTo(target, 80);
            this.closeNavigation();
          }
        }
        // Handle cross-page anchors
        else if (href.includes('#')) {
          // Let the browser handle navigation but close mobile menu
          this.closeNavigation();
        }
        // Regular page navigation
        else {
          this.closeNavigation();
        }
      });
    });

    // Update active nav link based on current page
    this.updateActiveNavLink();
  }

  closeNavigation() {
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('nav-toggle');
    
    if (nav && navToggle) {
      nav.classList.remove('nav-open');
      navToggle.classList.remove('toggle-open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  }

  updateActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav__list a');
    const currentPath = window.location.pathname;
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      const linkPath = link.getAttribute('href');
      
      // Check if this link matches current page
      if ((currentPath.includes('projects.html') && linkPath.includes('projects.html')) ||
          (currentPath.includes('research.html') && linkPath.includes('research.html')) ||
          (currentPath === '/' || currentPath.includes('index.html')) && linkPath.startsWith('#')) {
        link.classList.add('active');
      }
    });

    // For single page sections on home page
    if (this.currentPage === 'home') {
      const sections = document.querySelectorAll('section[id]');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const link = document.querySelector(`.nav__list a[href="#${entry.target.id}"]`);
          if (entry.isIntersecting && link) {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
          }
        });
      }, { threshold: 0.3 });

      sections.forEach(section => observer.observe(section));
    }
  }

  // ====================
  // PROJECTS PAGE
  // ====================
  initProjectsPage() {
    this.initProjectFiltering();
    this.initProjectSearch();
    this.initProjectSort();
    this.initLoadMore();
    this.initProjectAnimations();
    this.initVideoModals();
  }

  initProjectFiltering() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card, .featured-project');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active button
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
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
          card.classList.remove('hidden');
          card.style.transform = 'scale(1)';
          card.style.opacity = '1';
        }, index * 50);
      } else {
        card.classList.add('hidden');
        card.style.transform = 'scale(0.8)';
        card.style.opacity = '0';
        setTimeout(() => {
          card.style.display = 'none';
        }, 300);
      }
    });
  }

  initProjectSearch() {
    const searchInput = document.querySelector('.project-search');
    if (!searchInput) return;

    const projectCards = document.querySelectorAll('.project-card, .featured-project');
    
    searchInput.addEventListener('input', this.debounce((e) => {
      const searchTerm = e.target.value.toLowerCase();
      
      projectCards.forEach(card => {
        const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const description = card.querySelector('p, .project-description')?.textContent.toLowerCase() || '';
        const tech = Array.from(card.querySelectorAll('.tech-tag, .tag')).map(tag => tag.textContent.toLowerCase()).join(' ');
        
        const matches = title.includes(searchTerm) || 
                       description.includes(searchTerm) || 
                       tech.includes(searchTerm);
        
        card.style.display = matches ? 'block' : 'none';
      });
    }, 300));
  }

  initProjectSort() {
    const sortSelect = document.querySelector('.sort-select');
    if (!sortSelect) return;

    sortSelect.addEventListener('change', (e) => {
      const sortBy = e.target.value;
      this.sortProjects(sortBy);
    });
  }

  sortProjects(sortBy) {
    const container = document.querySelector('.projects-grid');
    if (!container) return;

    const cards = Array.from(container.children);
    
    cards.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.dataset.date || '2024-01-01') - new Date(a.dataset.date || '2024-01-01');
        case 'oldest':
          return new Date(a.dataset.date || '2024-01-01') - new Date(b.dataset.date || '2024-01-01');
        case 'name':
          return a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent);
        case 'complexity':
          return (b.dataset.complexity || 5) - (a.dataset.complexity || 5);
        default:
          return 0;
      }
    });

    // Re-append sorted cards
    cards.forEach(card => container.appendChild(card));
  }

  initLoadMore() {
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (!loadMoreBtn) return;

    loadMoreBtn.addEventListener('click', () => {
      // Simulate loading more projects
      loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
      
      setTimeout(() => {
        loadMoreBtn.innerHTML = '<i class="fas fa-check"></i> All Projects Loaded';
        loadMoreBtn.disabled = true;
        loadMoreBtn.style.opacity = '0.6';
      }, 2000);
    });
  }

  initVideoModals() {
    const playBtns = document.querySelectorAll('.play-btn');
    
    playBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const videoId = btn.dataset.video;
        this.openVideoModal(videoId);
      });
    });
  }

  openVideoModal(videoId) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal-content">
          <button class="modal-close">&times;</button>
          <div class="video-container">
            <video controls autoplay>
              <source src="./assets/videos/${videoId}.mp4" type="video/mp4">
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Close modal handlers
    const closeModal = () => {
      modal.remove();
      document.body.style.overflow = '';
    };

    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.modal-backdrop').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeModal();
    });

    document.addEventListener('keydown', function escapeHandler(e) {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escapeHandler);
      }
    });
  }

  // ====================
  // RESEARCH PAGE
  // ====================
  initResearchPage() {
    this.initPublicationFiltering();
    this.initCitationCopy();
    this.initProgressBars();
    this.initCollaborationHovers();
  }

  initPublicationFiltering() {
    const filterBtns = document.querySelectorAll('.publication-filters .filter-btn');
    const publications = document.querySelectorAll('.publication-card');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active button
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        this.filterPublications(filter, publications);
      });
    });
  }

  filterPublications(filter, publications) {
    publications.forEach((pub, index) => {
      const category = pub.dataset.category;
      const shouldShow = filter === 'all' || category === filter;
      
      if (shouldShow) {
        pub.style.display = 'block';
        setTimeout(() => {
          pub.style.opacity = '1';
          pub.style.transform = 'translateY(0)';
        }, index * 100);
      } else {
        pub.style.opacity = '0';
        pub.style.transform = 'translateY(20px)';
        setTimeout(() => {
          pub.style.display = 'none';
        }, 300);
      }
    });
  }

  initCitationCopy() {
    const citeBtns = document.querySelectorAll('a[href="#"]:has(.fa-quote-right)');
    
    citeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const publicationCard = btn.closest('.publication-card');
        const title = publicationCard.querySelector('.publication-title').textContent;
        const authors = Array.from(publicationCard.querySelectorAll('.author')).map(a => a.textContent).join(', ');
        const venue = publicationCard.querySelector('.venue').textContent;
        const year = new Date().getFullYear(); // You might want to extract this from the date
        
        const citation = `${authors}. "${title}" ${venue}, ${year}.`;
        
        navigator.clipboard.writeText(citation).then(() => {
          this.showToast('Citation copied to clipboard!');
        });
      });
    });
  }

  initProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar');
    
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

  initCollaborationHovers() {
    const collaborationCards = document.querySelectorAll('.collaboration-card');
    
    collaborationCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px) scale(1.02)';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
      });
    });
  }

  // ====================
  // SCROLL EFFECTS
  // ====================
  initScrollEffects() {
    this.lastScrollY = window.scrollY;
    this.scrollDirection = 'up';
  }

  handleScroll() {
    const currentScrollY = window.scrollY;
    this.scrollDirection = currentScrollY > this.lastScrollY ? 'down' : 'up';
    this.lastScrollY = currentScrollY;

    // Header effects
    this.updateHeader();
    
    // Parallax effects (only on home page)
    if (this.currentPage === 'home') {
      this.updateParallax();
    }
    
    // Progress indicator
    this.updateScrollProgress();
  }

  updateHeader() {
    const header = document.getElementById('header');
    if (!header) return;

    // Add scrolled class
    header.classList.toggle('scrolled', window.scrollY > 50);
    
    // Hide header on scroll down, show on scroll up
    if (window.scrollY > 200) {
      header.classList.toggle('hidden', this.scrollDirection === 'down');
    } else {
      header.classList.remove('hidden');
    }
  }

  updateParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    const scrolled = window.scrollY;

    parallaxElements.forEach(element => {
      const rate = element.dataset.parallax || 0.5;
      const yPos = -(scrolled * rate);
      element.style.transform = `translateY(${yPos}px)`;
    });
  }

  updateScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress');
    if (!progressBar) return;

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    progressBar.style.width = `${Math.min(scrollPercent, 100)}%`;
  }

  smoothScrollTo(target, offset = 0) {
    const targetPosition = target.offsetTop - offset;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }

  // ====================
  // ANIMATIONS & OBSERVERS
  // ====================
  initAnimations() {
    // Add CSS for reveal animations if not already present
    if (!document.querySelector('#reveal-styles')) {
      const style = document.createElement('style');
      style.id = 'reveal-styles';
      style.textContent = `
        .reveal {
          opacity: 0;
          transform: translateY(50px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .reveal.revealed {
          opacity: 1;
          transform: translateY(0);
        }
        .stagger-children .reveal:nth-child(1) { transition-delay: 0.1s; }
        .stagger-children .reveal:nth-child(2) { transition-delay: 0.2s; }
        .stagger-children .reveal:nth-child(3) { transition-delay: 0.3s; }
        .stagger-children .reveal:nth-child(4) { transition-delay: 0.4s; }
        .stagger-children .reveal:nth-child(5) { transition-delay: 0.5s; }
        .stagger-children .reveal:nth-child(6) { transition-delay: 0.6s; }
        .loading-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--bg-primary);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          transition: opacity 0.3s ease;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border);
          border-top: 3px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .video-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10000;
        }
        .modal-backdrop {
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .modal-content {
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
          background: var(--bg-card);
          border-radius: var(--radius-xl);
          overflow: hidden;
        }
        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 40px;
          height: 40px;
          border: none;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          border-radius: 50%;
          font-size: 1.5rem;
          cursor: pointer;
          z-index: 10001;
        }
        .video-container video {
          width: 100%;
          height: auto;
          max-height: 80vh;
        }
        .toast {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          background: var(--success);
          color: white;
          padding: 1rem 2rem;
          border-radius: var(--radius);
          box-shadow: var(--shadow-lg);
          z-index: 10000;
          animation: slideInUp 0.3s ease-out;
        }
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
  }

  initIntersectionObserver() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          
          // Trigger specific animations for different elements
          if (entry.target.classList.contains('counter')) {
            this.animateCounter(entry.target);
          }
          
          if (entry.target.classList.contains('skill-bar')) {
            this.animateSkillBar(entry.target);
          }
        }
      });
    }, observerOptions);

    // Observe all reveal elements
    document.querySelectorAll('.reveal, .fade-in, [data-reveal]').forEach(el => {
      observer.observe(el);
    });
  }

  initCounters() {
    this.counters = document.querySelectorAll('.stat-number, .achievement-number, .metric-number');
  }

  animateCounter(element) {
    const target = parseInt(element.textContent.replace(/[^\d]/g, ''));
    const suffix = element.textContent.replace(/[\d]/g, '');
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current) + suffix;
    }, 16);
  }

  // ====================
  // TYPING EFFECT
  // ====================
  initTypingEffect() {
    const typingElements = document.querySelectorAll('[data-typing]');
    
    typingElements.forEach(element => {
      const text = element.dataset.typing || element.textContent;
      const speed = parseInt(element.dataset.speed) || 50;
      const delay = parseInt(element.dataset.delay) || 1000;
      
      setTimeout(() => {
        this.typeText(element, text, speed);
      }, delay);
    });
  }

  typeText(element, text, speed) {
    element.textContent = '';
    element.style.opacity = '1';
    let i = 0;

    const timer = setInterval(() => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
  }

  // ====================
  // PARTICLE SYSTEM (Home page only)
  // ====================
  initParticles() {
    if (this.currentPage !== 'home') return;
    
    const particleContainers = document.querySelectorAll('[data-particles]');
    
    particleContainers.forEach(container => {
      this.createParticleSystem(container);
    });
  }

  createParticleSystem(container) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1';
    
    container.style.position = 'relative';
    container.appendChild(canvas);

    const particles = [];
    const particleCount = parseInt(container.dataset.particles) || 50;

    const resizeCanvas = () => {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    };

    const createParticle = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.2
    });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${particle.opacity})`;
        ctx.fill();
        
        // Draw connections
        particles.forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });
      
      requestAnimationFrame(animate);
    };

    // Initialize
    resizeCanvas();
    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle());
    }
    animate();

    // Handle resize
    window.addEventListener('resize', resizeCanvas);
  }

  // ====================
  // PROJECTS (Legacy support for home page)
  // ====================
  initProjects() {
    this.initProjectAnimations();
  }

  initProjectAnimations() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px) scale(1.02)';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
      });
    });
  }

  // ====================
  // SKILLS
  // ====================
  initSkills() {
    this.initSkillBars();
    this.initSkillFiltering();
  }

  initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-bar');
    
    skillBars.forEach(bar => {
      const progress = bar.querySelector('.skill-progress');
      const percentage = bar.dataset.percentage || 0;
      
      if (progress) {
        progress.style.width = '0%';
        // Animation will be triggered by intersection observer
      }
    });
  }

  animateSkillBar(skillBar) {
    const progress = skillBar.querySelector('.skill-progress');
    const percentage = skillBar.dataset.percentage || 0;
    
    if (progress) {
      setTimeout(() => {
        progress.style.width = `${percentage}%`;
      }, 200);
    }
  }

  initSkillFiltering() {
    const skillCategories = document.querySelectorAll('.skill-category');
    
    skillCategories.forEach(category => {
      const header = category.querySelector('h3');
      if (header) {
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => {
          const content = category.querySelector('.skills-list');
          if (content) {
            content.style.display = content.style.display === 'none' ? 'flex' : 'none';
          }
        });
      }
    });
  }

  // ====================
  // CONTACT
  // ====================
  initContact() {
    this.initContactForm();
    this.initSocialLinks();
  }

  initContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmission(form);
    });

    // Real-time validation
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
  }

  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Remove existing error
    this.clearFieldError(field);

    // Validation rules
    switch (field.type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid email address';
        }
        break;
      case 'text':
      case 'textarea':
        if (field.required && value.length === 0) {
          isValid = false;
          errorMessage = 'This field is required';
        }
        break;
    }

    if (!isValid) {
      this.showFieldError(field, errorMessage);
    }

    return isValid;
  }

  showFieldError(field, message) {
    field.classList.add('error');
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.color = 'var(--danger)';
    errorElement.style.fontSize = '0.875rem';
    errorElement.style.marginTop = '0.5rem';
    
    field.parentNode.appendChild(errorElement);
  }

  clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
      errorElement.remove();
    }
  }

  handleFormSubmission(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
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
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // Simulate form submission (replace with actual endpoint)
    setTimeout(() => {
      submitBtn.textContent = 'Message Sent!';
      submitBtn.style.background = 'var(--success)';
      
      this.showToast('Message sent successfully!');
      
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.style.background = '';
        form.reset();
      }, 3000);
    }, 2000);
  }

  initSocialLinks() {
    const socialLinks = document.querySelectorAll('.social-link');
    
    socialLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // Add click animation
        link.style.transform = 'scale(0.95)';
        setTimeout(() => {
          link.style.transform = '';
        }, 150);
      });
    });
  }

  // ====================
  // THEME & PREFERENCES
  // ====================
  initTheme() {
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Theme toggle button (if exists)
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', this.toggleTheme.bind(this));
    }

    // Respect system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    });
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }

  // ====================
  // UTILITIES
  // ====================
  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    if (type === 'error') {
      toast.style.background = 'var(--danger)';
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // ====================
  // PERFORMANCE & UTILITIES
  // ====================
  initPerformance() {
    // Lazy load images
    this.initLazyLoading();
    
    // Preload critical resources
    this.preloadCriticalResources();
    
    // Monitor performance
    this.monitorPerformance();
  }

  initLazyLoading() {
    const images = document.querySelectorAll('img[data-src], img[loading="lazy"]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  preloadCriticalResources() {
    const criticalImages = [
      './assets/images/profile.jpg'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }

  monitorPerformance() {
    // Track page load performance
    window.addEventListener('load', () => {
      if (performance.getEntriesByType) {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
          console.log(`Page load time: ${loadTime}ms`);
        }
      }
    });
  }

  // Utility functions
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

  debounce(func, wait, immediate) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }

  handleResize() {
    // Update any size-dependent calculations
    if (this.currentPage === 'home') {
      this.updateParticles();
    }
  }

  handleKeyDown(e) {
    // Keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'k':
          e.preventDefault();
          // Focus search input if available
          const searchInput = document.querySelector('.project-search');
          if (searchInput) searchInput.focus();
          break;
        case '/':
          e.preventDefault();
          // Focus search input
          const anySearchInput = document.querySelector('.search-input, .project-search');
          if (anySearchInput) anySearchInput.focus();
          break;
      }
    }

    // Escape key actions
    if (e.key === 'Escape') {
      this.closeNavigation();
      // Close any open modals
      const modals = document.querySelectorAll('.modal.open, .video-modal');
      modals.forEach(modal => modal.remove());
    }
  }

  onWindowLoad() {
    // Remove loading states
    document.body.classList.add('loaded');
    
    // Initialize any load-dependent features
    this.initLoadDependentFeatures();
  }

  initLoadDependentFeatures() {
    // Features that require the page to be fully loaded
    this.initAdvancedAnimations();
    this.initPerformanceMetrics();
  }

  initAdvancedAnimations() {
    // Advanced animations that depend on loaded content
    const animatedElements = document.querySelectorAll('[data-animate]');
    
    animatedElements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add('animate');
      }, index * 100);
    });
  }

  initPerformanceMetrics() {
    // Collect and analyze performance metrics
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
              console.log('LCP:', entry.startTime);
            }
            if (entry.entryType === 'first-input') {
              console.log('FID:', entry.processingStart - entry.startTime);
            }
          }
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
      } catch (e) {
        console.log('Performance Observer not fully supported');
      }
    }
  }

  updateParticles() {
    // Update particle systems on resize
    const particleContainers = document.querySelectorAll('[data-particles] canvas');
    particleContainers.forEach(canvas => {
      const container = canvas.parentElement;
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    });
  }
}

// Enhanced error handling
window.addEventListener('error', (event) => {
  console.error('JavaScript error:', event.error);
  
  // Graceful degradation - ensure basic functionality still works
  if (event.error && event.error.name === 'TypeError' && event.error.message.includes('IntersectionObserver')) {
    // Fallback for browsers without IntersectionObserver
    document.querySelectorAll('.reveal, .fade-in').forEach(el => {
      el.classList.add('revealed');
    });
  }
});

// Initialize the application
const app = new PortfolioApp();

// Make app available globally for debugging
window.portfolioApp = app;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PortfolioApp;
}