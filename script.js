/**
 * TEAM MGIS - NRL Combat Robotics Official Website Script
 * Clean interactive tech dynamics, scroll animations, telemetry updates & smart sticky header.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. SMART STICKY HEADER (Scroll Up -> Show, Scroll Down -> Hide)
  initSmartHeader();

  // 2. SCROLL PROGRESS BAR
  initScrollProgress();

  // 3. INTERSECTION OBSERVER SCROLL REVEALS
  initScrollReveals();

  // 4. ANIMATED NUMERICAL COUNTERS
  initStatCounters();

  // 5. ROBOT SPECIFICATION TABS
  initTechTabs();

  // 6. MOBILE NAVIGATION DRAWER
  initMobileMenu();

  // 7. LIGHTWEIGHT TECH PARTICLE CANVAS
  initTechCanvas();
});

/* ========================================================
   1. SMART STICKY HEADER
   ======================================================== */
function initSmartHeader() {
  const header = document.getElementById('main-header');
  if (!header) return;

  let lastScrollY = window.pageYOffset;
  const threshold = 10;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.pageYOffset;

    if (currentScrollY <= 20) {
      header.classList.remove('scroll-down', 'scroll-up');
      lastScrollY = currentScrollY;
      return;
    }

    if (Math.abs(currentScrollY - lastScrollY) < threshold) {
      return;
    }

    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      // Scrolling down -> hide header
      header.classList.add('scroll-down');
      header.classList.remove('scroll-up');
    } else {
      // Scrolling up -> show header
      header.classList.remove('scroll-down');
      header.classList.add('scroll-up');
    }

    lastScrollY = currentScrollY;
  }, { passive: true });
}

/* ========================================================
   2. SCROLL PROGRESS BAR
   ======================================================== */
function initScrollProgress() {
  const progressBar = document.getElementById('scroll-progress');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (scrollHeight > 0) {
      const scrolledPercent = (scrollTop / scrollHeight) * 100;
      progressBar.style.width = `${scrolledPercent}%`;
    }
  }, { passive: true });
}

/* ========================================================
   3. SCROLL REVEAL ANIMATIONS
   ======================================================== */
function initScrollReveals() {
  const revealElements = document.querySelectorAll('.reveal');
  if (!revealElements.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.12
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Add a slight stagger delay if multiple elements appear together
        setTimeout(() => {
          entry.target.classList.add('active');
        }, index * 40);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => revealObserver.observe(el));
}

/* ========================================================
   4. ANIMATED STAT COUNTERS
   ======================================================== */
function initStatCounters() {
  const statElements = document.querySelectorAll('.stat-value');
  if (!statElements.length) return;

  let animated = false;

  const statsSection = document.querySelector('.hero-stats-grid');
  if (!statsSection) return;

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        statElements.forEach(stat => {
          const target = parseFloat(stat.getAttribute('data-target'));
          const decimals = parseInt(stat.getAttribute('data-decimals') || '0', 10);
          const duration = 1800; // ms
          const startTime = performance.now();

          function updateNumber(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = target * easeProgress;

            if (decimals > 0) {
              stat.textContent = currentValue.toFixed(decimals);
            } else {
              stat.textContent = Math.floor(currentValue).toLocaleString();
            }

            if (progress < 1) {
              requestAnimationFrame(updateNumber);
            } else {
              if (decimals > 0) {
                stat.textContent = target.toFixed(decimals);
              } else {
                stat.textContent = target.toLocaleString();
              }
            }
          }

          requestAnimationFrame(updateNumber);
        });
      }
    });
  }, { threshold: 0.3 });

  statsObserver.observe(statsSection);
}

/* ========================================================
   5. ROBOT SPECIFICATION TABS
   ======================================================== */
function initTechTabs() {
  const tabButtons = document.querySelectorAll('.tech-tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  if (!tabButtons.length || !tabPanes.length) return;

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTabId = btn.getAttribute('data-tab');

      // Update button active state
      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Update pane active state
      tabPanes.forEach(pane => {
        pane.classList.remove('active');
      });

      const activePane = document.getElementById(`tab-${targetTabId}`);
      if (activePane) {
        activePane.classList.add('active');
        
        // Trigger width animation on metric bars
        const bars = activePane.querySelectorAll('.metric-bar');
        bars.forEach(bar => {
          const w = bar.style.width;
          bar.style.width = '0%';
          setTimeout(() => {
            bar.style.width = w;
          }, 30);
        });
      }
    });
  });

  // Crosshairs interaction to jump to corresponding tab
  const crosshairs = document.querySelectorAll('.hud-crosshair');
  crosshairs.forEach((crosshair, index) => {
    crosshair.addEventListener('click', () => {
      const tabOrder = ['weapon', 'chassis', 'drivetrain'];
      if (tabOrder[index]) {
        const matchingBtn = document.querySelector(`.tech-tab-btn[data-tab="${tabOrder[index]}"]`);
        if (matchingBtn) matchingBtn.click();
      }
    });
  });
}

/* ========================================================
   6. MOBILE NAVIGATION DRAWER
   ======================================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = document.querySelectorAll('.mobile-nav-link');

  if (!toggleBtn || !mobileMenu) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    if (isOpen) {
      mobileMenu.classList.remove('open');
      toggleBtn.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
    } else {
      mobileMenu.classList.add('open');
      toggleBtn.classList.add('active');
      toggleBtn.setAttribute('aria-expanded', 'true');
    }
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      toggleBtn.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ========================================================
   7. LIGHTWEIGHT TECH PARTICLE & GRID CANVAS
   ======================================================== */
function initTechCanvas() {
  const canvas = document.getElementById('tech-particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const particleCount = 35;
  const maxDistance = 140;

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.radius = Math.random() * 1.5 + 0.8;
      this.alpha = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 240, 255, ${this.alpha})`;
      ctx.fill();
    }
  }

  // Populate particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw connecting node lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          const lineAlpha = (1 - dist / maxDistance) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 166, 255, ${lineAlpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // Update & draw particles
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
}
