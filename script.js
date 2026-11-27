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

  // 8. MATCH SCORES (matches.html only)
  initMatchScores();

  // 9. 404 REQUEST PATH
  initMissingPath();
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

/* ========================================================
   8. MATCH SCORES (matches.html only)
   ======================================================== */
function initMatchScores() {
  const matchLog = document.getElementById('match-log');
  if (!matchLog) return;

  const svgns = 'http://www.w3.org/2000/svg';
  const els = {
    winRate: document.getElementById('win-rate-value'),
    statWins: document.getElementById('stat-wins'),
    statLosses: document.getElementById('stat-losses'),
    statLive: document.getElementById('stat-live'),
    statQueued: document.getElementById('stat-queued'),
    filterCounts: {
      all: document.getElementById('filter-count-all'),
      won: document.getElementById('filter-count-won'),
      lost: document.getElementById('filter-count-lost'),
      live: document.getElementById('filter-count-live'),
      queued: document.getElementById('filter-count-queued'),
    },
    formStrip: document.getElementById('form-strip'),
    matchEmpty: document.getElementById('match-empty'),
    loadError: document.getElementById('csv-load-error'),
    recordSvg: document.getElementById('record-svg'),
    chartReadout: document.getElementById('chart-readout'),
    filterBtns: document.querySelectorAll('.match-filter-btn'),
    search: document.getElementById('match-search'),
    intelGrid: document.getElementById('intel-grid'),
  };

  const statusLabel = { won: 'Won', lost: 'Lost', live: 'In Progress', queued: 'Not Begun' };
  const statusShort = { won: 'W', lost: 'L', live: '–', queued: 'Q' };

  function normalizeStatus(raw) {
    const s = String(raw || '').trim().toLowerCase();
    if (s === 'won') return 'won';
    if (s === 'lost') return 'lost';
    if (s === 'in progress' || s === 'live') return 'live';
    if (s === 'not begun' || s === 'queued' || s === 'not started') return 'queued';
    return 'queued';
  }

  function escapeHtml(unsafe) {
    return String(unsafe).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  let data = [];
  let activeFilter = 'all';
  let searchQuery = '';

  function parseCsv(text) {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return [];
    const header = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const vals = line.split(',');
      const row = {};
      header.forEach((key, i) => { row[key] = (vals[i] || '').trim(); });
      row.status = normalizeStatus(row.status);
      return row;
    });
  }

  function statsOf(list) {
    const s = { won: 0, lost: 0, live: 0, queued: 0 };
    list.forEach(m => { s[m.status]++; });
    const decided = s.won + s.lost;
    return { ...s, decided, winRate: decided ? (s.won / decided) * 100 : 0 };
  }

  function render() {
    const st = statsOf(data);

    els.winRate.textContent = st.decided ? `${Math.round(st.winRate)}%` : '–%';
    els.statWins.textContent = st.won;
    els.statLosses.textContent = st.lost;
    els.statLive.textContent = st.live;
    els.statQueued.textContent = st.queued;

    Object.entries(els.filterCounts).forEach(([key, el]) => {
      if (el) el.textContent = key === 'all' ? data.length : st[key];
    });

    els.filterBtns.forEach(btn => {
      const active = btn.dataset.filter === activeFilter;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active);
    });

    const filtered = data.filter(m => {
      const passFilter = activeFilter === 'all' || m.status === activeFilter;
      const q = searchQuery.toLowerCase();
      const passSearch = !q || `${m.team_mate} ${m.opp_1} ${m.opp_2}`.toLowerCase().includes(q);
      return passFilter && passSearch;
    });

    const recent = data.slice(-5);
    els.formStrip.innerHTML = recent.map(m => `
      <span class="form-cell ${m.status}" title="${escapeHtml(statusLabel[m.status])} — Match ${escapeHtml(m.match_no)}">${escapeHtml(statusShort[m.status])}</span>
    `).join('');

    matchLog.innerHTML = '';
    let shown = 0;
    filtered.forEach(m => {
      const card = document.createElement('article');
      card.className = 'bout-card reveal';
      card.setAttribute('data-status', m.status);
      card.setAttribute('data-match', escapeHtml(m.match_no));
      card.innerHTML = `
        <div class="bout-meta">
          <span class="bout-id">MATCH ${String(m.match_no).padStart(2, '0')}</span>
          <span class="status-chip ${m.status}">${escapeHtml(statusLabel[m.status])}</span>
        </div>
        <div class="bout-board">
          <div>
            <span class="side-label">TEAM MGIS</span>
            <div class="side-team is-us">${escapeHtml(m.team)} <span class="our-tag">US</span></div>
            <div class="side-score">${m.status === 'queued' ? '–' : escapeHtml(m.final_score_us)}</div>
            <span class="side-label">ALLY</span>
            <div class="side-team">${escapeHtml(m.team_mate)}</div>
          </div>
          <div class="bout-vs">VS</div>
          <div class="bout-them">
            <span class="side-label">OPPONENTS</span>
            <div class="side-team">${escapeHtml(m.opp_1)}</div>
            <span class="side-label">AND</span>
            <div class="side-team">${escapeHtml(m.opp_2)}</div>
            <div class="side-score them-score">${m.status === 'queued' ? '–' : escapeHtml(m.final_score_opp)}</div>
          </div>
        </div>
      `;
      matchLog.appendChild(card);
      shown++;
    });

    if (els.matchEmpty) els.matchEmpty.hidden = shown > 0;

    renderChart(filtered);
    renderIntel(filtered);
  }

  function svgLine(x1, y1, x2, y2, cls) {
    const el = document.createElementNS(svgns, 'line');
    el.setAttribute('x1', x1); el.setAttribute('y1', y1);
    el.setAttribute('x2', x2); el.setAttribute('y2', y2);
    el.setAttribute('class', cls);
    return el;
  }

  function svgText(x, y, content, cls, anchor) {
    const el = document.createElementNS(svgns, 'text');
    el.setAttribute('x', x); el.setAttribute('y', y);
    el.setAttribute('class', cls || 'chart-label');
    if (anchor) el.setAttribute('text-anchor', anchor);
    el.textContent = content;
    return el;
  }

  function renderChart(list) {
    const svg = els.recordSvg;
    const readout = els.chartReadout;
    const width = 700, height = 220, pad = 56;
    const decided = list.filter(m => m.status === 'won' || m.status === 'lost');

    while (svg.firstChild) svg.removeChild(svg.firstChild);

    if (decided.length === 0) {
      svg.style.opacity = '0.35';
      readout.textContent = 'No decided matches to chart.';
      return;
    }
    svg.style.opacity = '1';

    let wins = 0;
    const pts = decided.map((m, i) => {
      if (m.status === 'won') wins++;
      const x = pad + (i / Math.max(decided.length - 1, 1)) * (width - 2 * pad);
      const rate = wins / (i + 1);
      const y = height - pad - rate * (height - 2 * pad);
      return { x, y, status: m.status, match: m.match_no, rate };
    });

    const midY = pad + (height - 2 * pad) / 2;
    svg.appendChild(svgLine(pad, height - pad, width - pad, height - pad, 'chart-grid'));
    svg.appendChild(svgLine(pad, midY, width - pad, midY, 'chart-grid'));
    svg.appendChild(svgLine(pad, pad, width - pad, pad, 'chart-grid'));

    svg.appendChild(svgText(pad - 8, height - pad + 17, '0%', 'chart-label', 'end'));
    svg.appendChild(svgText(pad - 8, midY + 5, '50%', 'chart-label', 'end'));
    svg.appendChild(svgText(pad - 8, pad - 8, '100%', 'chart-label', 'end'));

    pts.forEach(p => {
      svg.appendChild(svgLine(p.x, pad, p.x, height - pad, 'chart-grid'));
      svg.appendChild(svgText(p.x, height - pad + 17, `M${p.match}`, 'chart-label', 'middle'));
    });

    const area = document.createElementNS(svgns, 'path');
    area.setAttribute('d', `M${pad} ${height - pad} L${pts.map(p => `${p.x} ${p.y}`).join(' L')} L${pts[pts.length - 1].x} ${height - pad} Z`);
    area.setAttribute('class', 'chart-area');
    svg.appendChild(area);

    const linePath = document.createElementNS(svgns, 'path');
    linePath.setAttribute('d', `M${pts.map(p => `${p.x} ${p.y}`).join(' L')}`);
    linePath.setAttribute('class', 'chart-line');
    svg.appendChild(linePath);

    pts.forEach(p => {
      const guide = document.createElementNS(svgns, 'line');
      guide.setAttribute('x1', p.x); guide.setAttribute('y1', pad);
      guide.setAttribute('x2', p.x); guide.setAttribute('y2', height - pad);
      guide.setAttribute('class', 'chart-guide');
      p.guideEl = guide;
      svg.appendChild(guide);

      const dot = document.createElementNS(svgns, 'circle');
      dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y);
      dot.setAttribute('r', 4);
      dot.setAttribute('class', `chart-dot chart-dot-${p.status}`);
      dot.setAttribute('title', `Match ${p.match}: ${statusLabel[p.status]} — ${(p.rate * 100).toFixed(0)}% win rate`);
      svg.appendChild(dot);
    });

    readout.textContent = `Cumulative win rate across ${decided.length} decided match${decided.length === 1 ? '' : 'es'}.`;

    let activeDot = null;
    const clearGuide = () => {
      if (activeDot !== null) {
        pts[activeDot].guideEl.classList.remove('is-on');
        activeDot = null;
      }
    };

    svg.addEventListener('mousemove', ev => {
      const rect = svg.getBoundingClientRect();
      const mx = ev.clientX - rect.left;
      const my = ev.clientY - rect.top;
      let nearest = null;
      let bestD = Infinity;
      pts.forEach((p, i) => {
        const d = Math.hypot(mx - p.x, my - p.y);
        if (d < bestD) { bestD = d; nearest = i; }
      });
      if (bestD > 60) {
        clearGuide();
        readout.textContent = `Cumulative win rate across ${decided.length} decided match${decided.length === 1 ? '' : 'es'}.`;
        return;
      }
      if (nearest !== activeDot) {
        clearGuide();
        activeDot = nearest;
        pts[nearest].guideEl.classList.add('is-on');
        readout.textContent = `MATCH ${pts[nearest].match} — ${statusLabel[pts[nearest].status]} — ${(pts[nearest].rate * 100).toFixed(0)}% WIN RATE`;
      }
    });
    svg.addEventListener('mouseleave', () => {
      clearGuide();
      readout.textContent = `Cumulative win rate across ${decided.length} decided match${decided.length === 1 ? '' : 'es'}.`;
    });
  }

  function renderIntel(list) {
    const counts = {};
    list.forEach(m => {
      [m.opp_1, m.opp_2].forEach(opp => {
        if (!opp) return;
        if (!counts[opp]) counts[opp] = { encounters: 0, wins: 0 };
        counts[opp].encounters++;
        if (m.status === 'won') counts[opp].wins++;
      });
    });

    const entries = Object.entries(counts).map(([name, c]) => ({
      name, encounters: c.encounters, wins: c.wins,
      rate: c.encounters ? (c.wins / c.encounters) * 100 : 0,
    }));

    if (entries.length === 0) {
      els.intelGrid.innerHTML = '<div class="intel-empty">No head-to-head data yet.</div>';
      return;
    }

    els.intelGrid.innerHTML = entries.map(entry => `
      <div class="intel-list">
        <div class="intel-top">
          <span class="intel-name">${escapeHtml(entry.name)}</span>
          <span class="intel-record">${entry.wins}W ${entry.encounters - entry.wins}L</span>
        </div>
        <span class="intel-meta">${entry.encounters} encounter${entry.encounters !== 1 ? 's' : ''} • ${entry.rate.toFixed(0)}% win rate</span>
      </div>
    `).join('');
  }

  els.filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      render();
    });
  });

  if (els.search) {
    els.search.addEventListener('input', ev => {
      searchQuery = ev.target.value;
      render();
    });
  }

  fetch('matches.csv')
    .then(resp => {
      if (!resp.ok) throw new Error(`CSV load failed (${resp.status})`);
      return resp.text();
    })
    .then(text => {
      data = parseCsv(text);
      render();
    })
    .catch(err => {
      console.error('[match scores]', err);
      if (els.loadError) els.loadError.hidden = false;
    });
}

/* ========================================================
   9. 404 MISSING PATH (404.html only)
   ======================================================== */
function initMissingPath() {
  const el = document.getElementById('missing-path');
  if (!el) return;
  const path = decodeURI(window.location.pathname).replace(/\/+$/, '') || '/';
  el.textContent = path;
  el.setAttribute('data-path', path);
}
