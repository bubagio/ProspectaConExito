import './style.css'

// Mobile Menu
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });
}

// Close menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    if (navLinks.classList.contains('active')) {
      navLinks.classList.remove('active');
    }
  });
});

// Scroll Animations (Intersection Observer)
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { root: null, rootMargin: '0px', threshold: 0.1 });

document.querySelectorAll('.fade-in, .fade-in-up, .fade-in-left, .fade-in-right').forEach(el => {
  observer.observe(el);
});

// Navbar scroll: transparent → glass
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// Animated Counters
function animateCounter(element, target, suffix = '') {
  const duration = 2000;
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out quad
    const ease = 1 - (1 - progress) * (1 - progress);
    const current = Math.floor(start + (target - start) * ease);
    element.textContent = current + suffix;
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const count = parseInt(el.dataset.count);
      const text = el.textContent;
      const suffix = text.includes('%') ? '%' : '+';
      animateCounter(el, count, suffix);
      statsObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => {
  statsObserver.observe(el);
});

// ===== Infinite Testimonial Carousel =====
(function initCarousel() {
  const track = document.getElementById('testimonialTrack');
  if (!track) return;

  // Duplicate cards for seamless infinite loop
  const origCards = Array.from(track.children);
  origCards.forEach(card => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });

  let activeCard = null;

  // Pause on hover of the wrapper
  const wrapper = track.closest('.testimonial-carousel-wrapper');
  wrapper.addEventListener('mouseenter', () => track.classList.add('paused'));
  wrapper.addEventListener('mouseleave', () => {
    // Keep paused if a card is actively selected
    if (!activeCard) track.classList.remove('paused');
  });

  // Click to select / deselect a card
  track.addEventListener('click', (e) => {
    const card = e.target.closest('.tcard[aria-hidden!="true"]');
    if (!card) return;

    if (activeCard && activeCard !== card) {
      activeCard.classList.remove('active');
    }

    card.classList.toggle('active');
    activeCard = card.classList.contains('active') ? card : null;

    if (activeCard) {
      track.classList.add('paused');
    } else {
      track.classList.remove('paused');
    }
  });

  // Click outside carousel → deselect & resume
  document.addEventListener('click', (e) => {
    if (!track.contains(e.target) && activeCard) {
      activeCard.classList.remove('active');
      activeCard = null;
      track.classList.remove('paused');
    }
  });
})();

// ===== Home: Dynamic Articles =====
(async function loadHomeArticles() {
  const grid = document.getElementById('homeArticlesGrid');
  if (!grid) return; // not on home page
  try {
    const res = await fetch('https://prospectaexistov2-production.up.railway.app/api/articles?limit=3');
    const articles = await res.json();
    if (!articles || !articles.length) return;
    grid.innerHTML = articles.map((a, i) => `
      <article class="resource-card fade-in ${i > 0 ? 'delay-' + Math.min(i, 3) : ''}">
        <div class="card-content">
          <span class="tag">${a.category || 'Blog'}</span>
          <h3>${a.title}</h3>
          ${a.excerpt ? `<p style="color:rgba(255,255,255,0.65);font-size:0.88rem;line-height:1.5;margin:0.5rem 0">${a.excerpt}</p>` : ''}
          <a href="/recursos.html#article-${a.id}" class="read-more">Leer más &rarr;</a>
        </div>
      </article>
    `).join('');
    // Re-observe new elements for fade-in animations
    document.querySelectorAll('.fade-in:not(.visible)').forEach(el => observer.observe(el));
  } catch (_) {
    // fail silently — static fallback cards remain
  }
})();

// ===== Home: Nav Auth State =====
(function updateNavAuth() {
  const navAuthHome = document.getElementById('nav-auth-home');
  const navRecursos = document.getElementById('nav-recursos-link');
  if (!navAuthHome) return;
  const homeUser = JSON.parse(localStorage.getItem('pce_user') || 'null');
  if (homeUser) {
    const isPrivileged = homeUser.role === 'admin' || homeUser.role === 'superadmin';
    navAuthHome.innerHTML = isPrivileged
      ? `<a href="/admin.html" class="btn btn-primary sm">Admin</a>`
      : `<a href="/recursos.html" class="btn btn-primary sm">Mi área</a>`;
    // Recursos link: admin → pagina completa, utente → sezione nella home
    if (navRecursos && isPrivileged) {
      navRecursos.href = '/recursos.html';
    }
  }
})();
