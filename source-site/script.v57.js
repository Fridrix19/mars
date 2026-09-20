document.addEventListener("DOMContentLoaded", () => {
  initFaqAccordion();
  injectMobileDock();
  syncMobileDockViewport();
});

function initFaqAccordion() {
  const faqItems = Array.from(document.querySelectorAll('.faq-item'));
  if (!faqItems.length) return;

  const setFaqState = (item, open) => {
    const button = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const icon = item.querySelector('.faq-icon');
    if (!button || !answer) return;

    item.classList.toggle('active', open);
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    answer.setAttribute('aria-hidden', open ? 'false' : 'true');

    if (open) {
      answer.hidden = false;
      answer.removeAttribute('hidden');
      answer.classList.add('is-open');
      answer.style.display = 'block';
      answer.style.visibility = 'visible';
      answer.style.opacity = '1';
      answer.style.maxHeight = 'none';
    } else {
      answer.classList.remove('is-open');
      answer.style.display = 'none';
      answer.style.visibility = 'hidden';
      answer.style.opacity = '0';
      answer.style.maxHeight = '0px';
      answer.hidden = true;
      answer.setAttribute('hidden', 'hidden');
    }

    if (icon) icon.textContent = open ? '−' : '+';
  };

  faqItems.forEach((item) => {
    const button = item.querySelector('.faq-question');
    if (!button) return;

    setFaqState(item, false);
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const shouldOpen = !item.classList.contains('active');
      faqItems.forEach((other) => setFaqState(other, false));
      if (shouldOpen) setFaqState(item, true);
    });
  });
}

function injectMobileDock() {
  if (document.getElementById('mobileDock')) return;

  const bp = (document.querySelector('meta[name="base-path"]')?.content || '').replace(/\/$/, '');
  const b = bp ? bp + '/' : '';

  const dock = document.createElement('div');
  dock.className = 'mobile-dock';
  dock.id = 'mobileDock';

  const glyph = (name) => ({
    cards: `<svg viewBox="0 0 24 24" aria-hidden="true" class="nav-rail-glyph nav-rail-glyph--cards"><rect class="tone-light" x="3.1" y="5.3" width="17.8" height="13.4" rx="4.2"/><rect class="tone-dark" x="4.8" y="7.1" width="14.4" height="2.4" rx="1.2"/><rect class="tone-dark" x="6.3" y="12.2" width="4.2" height="2.9" rx="1.35"/><path class="tone-light" d="M17.15 6.55 17.7 7.9l1.35.55-1.35.55-.55 1.35-.55-1.35-1.35-.55 1.35-.55.55-1.35Z"/></svg>`,
    ai: `<svg viewBox="0 0 24 24" aria-hidden="true" class="nav-rail-glyph nav-rail-glyph--ai"><circle class="tone-light" cx="12" cy="12" r="2.45"/><circle class="tone-dark" cx="7.1" cy="7.6" r="1.65"/><circle class="tone-dark" cx="16.9" cy="7.6" r="1.65"/><circle class="tone-dark" cx="7.1" cy="16.4" r="1.65"/><circle class="tone-dark" cx="16.9" cy="16.4" r="1.65"/><path class="tone-light" d="m8.35 8.7 2.2 1.95m4.9-1.95-2.2 1.95m-4.9 4.6 2.2-1.95m4.9 1.95-2.2-1.95"/></svg>`,
    games: `<svg viewBox="0 0 24 24" aria-hidden="true" class="nav-rail-glyph nav-rail-glyph--games"><path class="tone-light" d="M7.7 8.2h8.6c2.7 0 4.8 2.1 4.8 4.8 0 .55-.09 1.1-.28 1.62l-.4 1.17a2.55 2.55 0 0 1-4.18 1.02l-1.38-1.2H9.01l-1.38 1.2a2.55 2.55 0 0 1-4.18-1.02l-.4-1.17A4.8 4.8 0 0 1 7.7 8.2Z"/><path class="tone-dark" d="M7.85 11.1h2.75v1.45H7.85zm1.35-1.4h1.45v4.25H9.2z"/><circle class="tone-dark" cx="15.9" cy="11.7" r="1.15"/><circle class="tone-dark" cx="18.1" cy="13.8" r="1.15"/></svg>`,
    design: `<svg viewBox="0 0 24 24" aria-hidden="true" class="nav-rail-glyph nav-rail-glyph--design"><path class="tone-light" d="m6.1 16.35 7.55-7.6 3.85 3.85-7.6 7.55H5.6l.5-3.8Z"/><path class="tone-dark" d="m13.1 8.2 2.15-2.2a2.2 2.2 0 1 1 3.1 3.1l-2.2 2.15-3.05-3.05Z"/><circle class="tone-light" cx="17.85" cy="17.1" r="1.1"/><circle class="tone-dark" cx="15.55" cy="18.95" r="0.9"/></svg>`,
    more: `<svg viewBox="0 0 24 24" aria-hidden="true" class="nav-rail-glyph nav-rail-glyph--more"><rect class="tone-light" x="4.2" y="4.2" width="6.2" height="6.2" rx="1.8"/><rect class="tone-light" x="13.6" y="4.2" width="6.2" height="6.2" rx="1.8"/><rect class="tone-dark" x="4.2" y="13.6" width="6.2" height="6.2" rx="1.8"/><rect class="tone-dark" x="13.6" y="13.6" width="6.2" height="6.2" rx="1.8"/></svg>`,
    entertainment: `<svg viewBox="0 0 24 24" aria-hidden="true" class="nav-rail-glyph nav-rail-glyph--entertainment"><path class="tone-light" d="M5.7 5.4h8.5a1.9 1.9 0 0 1 1.9 1.9v9.3a1.9 1.9 0 0 1-1.9 1.9H5.7a1.9 1.9 0 0 1-1.9-1.9V7.3a1.9 1.9 0 0 1 1.9-1.9Z"/><path class="tone-dark" d="m8.6 9.1 4.45 2.85L8.6 14.8V9.1Z"/><path class="tone-light" d="M16.7 8.2v6.55c0 1.55 1.13 2.7 2.58 2.7 1.35 0 2.32-.81 2.32-2.02 0-1.27-.99-2.1-2.32-2.1-.53 0-1 .12-1.43.36V9.55l3.75-.95v5.55"/></svg>`,
    work: `<svg viewBox="0 0 24 24" aria-hidden="true" class="nav-rail-glyph nav-rail-glyph--work"><rect class="tone-light" x="3.9" y="5.1" width="16.2" height="11.2" rx="3.2"/><path class="tone-dark" d="M6.5 8.4h11v1.3h-11zm0 2.95h6.9v1.25H6.5zm0 2.85h9.2v1.25H6.5z"/><path class="tone-light" d="M11 18.5h2v1.5h-2zm-3.2 1.65h8.4v1.35H7.8z"/></svg>`,
    global: `<svg viewBox="0 0 24 24" aria-hidden="true" class="nav-rail-glyph nav-rail-glyph--global"><circle class="tone-light" cx="10.4" cy="12" r="5.9"/><path class="tone-dark" d="M4.95 12h10.9M10.4 6.1c1.3 1.2 2.1 3.25 2.1 5.9 0 2.65-.8 4.7-2.1 5.9-1.3-1.2-2.1-3.25-2.1-5.9 0-2.65.8-4.7 2.1-5.9Z"/><path class="tone-light" d="M16.3 7.15v9.7"/><path class="tone-dark" d="M18.5 8.95c-.4-.65-1.17-1.05-2.18-1.05-1.27 0-2.16.71-2.16 1.7 0 .86.58 1.38 1.99 1.69l.45.1c1.33.29 1.94.77 1.94 1.69 0 1.05-.93 1.8-2.31 1.8-1.06 0-1.88-.36-2.39-1.06"/></svg>`,
    catalog: `<svg viewBox="0 0 24 24" aria-hidden="true" class="nav-rail-glyph nav-rail-glyph--catalog"><rect class="tone-light" x="4.2" y="4.2" width="6.2" height="6.2" rx="1.8"/><rect class="tone-dark" x="13.6" y="4.2" width="6.2" height="6.2" rx="1.8"/><rect class="tone-dark" x="4.2" y="13.6" width="6.2" height="6.2" rx="1.8"/><rect class="tone-light" x="13.6" y="13.6" width="6.2" height="6.2" rx="1.8"/></svg>`,
    faq: `<svg viewBox="0 0 24 24" aria-hidden="true" class="nav-rail-glyph nav-rail-glyph--faq"><circle class="tone-light" cx="12" cy="12" r="8.2"/><path class="tone-dark" d="M11.95 7.3c-2.18 0-3.55 1.09-3.72 2.95h2.12c.12-.67.67-1.06 1.55-1.06.94 0 1.47.4 1.47 1.06 0 .56-.26.87-.98 1.32-.95.6-1.74 1.32-1.74 2.76v.2h2.02v-.11c0-.62.21-.95.95-1.42 1.04-.65 1.88-1.44 1.88-2.86 0-1.86-1.46-2.84-3.55-2.84Zm.03 9.18a1.18 1.18 0 1 0 0 2.36 1.18 1.18 0 0 0 0-2.36Z"/></svg>`,
    support: `<svg viewBox="0 0 24 24" aria-hidden="true" class="nav-rail-glyph nav-rail-glyph--support"><path class="tone-light" d="M12 4.2a7.8 7.8 0 0 1 7.8 7.8v2.25a2.9 2.9 0 0 1-2.9 2.9h-1.25A2.95 2.95 0 0 1 12.8 19h-1.6a1 1 0 1 1 0-2h1.6c.46 0 .87-.27 1.07-.7l.2-.42h2.83c.49 0 .9-.4.9-.9V12a5.8 5.8 0 0 0-11.6 0v2.98a1 1 0 1 1-2 0V12A7.8 7.8 0 0 1 12 4.2Z"/><path class="tone-dark" d="M7.35 12.2a1.05 1.05 0 0 1 1.05 1.05v1.5a1.05 1.05 0 1 1-2.1 0v-1.5a1.05 1.05 0 0 1 1.05-1.05Zm9.3 0a1.05 1.05 0 0 1 1.05 1.05v1.5a1.05 1.05 0 1 1-2.1 0v-1.5a1.05 1.05 0 0 1 1.05-1.05Z"/></svg>`
  }[name] || '');
  const logo = (name) => ({
    home: `${b}assets/brand/mcg-logo-white-clean.png`
  }[name] || '');
  const dockIcon = (name) => {
    const src = logo(name);
    return src
      ? `<span class="nav-rail-icon nav-rail-icon--brand nav-rail-icon--${name}" aria-hidden="true"><img src="${src}" alt="" loading="eager" decoding="async" class="nav-rail-logo"></span>`
      : `<span class="nav-rail-icon nav-rail-icon--${name}" aria-hidden="true">${glyph(name)}</span>`;
  };
  const menuIcon = (name) => {
    return `<span class="nav-sheet-icon nav-sheet-icon--${name}" aria-hidden="true">${glyph(name)}</span>`;
  };

  dock.innerHTML = `
    <div class="mobile-dock-submenu" id="mobileDockSubmenu" aria-hidden="true">
      <a href="${b}section/entertainment/index.html" data-tone="entertainment" data-icon="entertainment">${menuIcon('entertainment')}<span class="dock-menu-label">Развлечения</span></a>
      <a href="${b}section/work/index.html" data-tone="work" data-icon="work">${menuIcon('work')}<span class="dock-menu-label">Для работы</span></a>
      <a href="${b}section/international/index.html" data-tone="global" data-icon="global">${menuIcon('global')}<span class="dock-menu-label">Покупки</span></a>
      <a href="${b}catalog.html" data-tone="catalog" data-icon="catalog">${menuIcon('catalog')}<span class="dock-menu-label">Каталог</span></a>
      <a href="${b}faq.html" data-tone="faq" data-icon="faq">${menuIcon('faq')}<span class="dock-menu-label">FAQ</span></a>
      <a href="${b}support.html" data-tone="support" data-icon="support">${menuIcon('support')}<span class="dock-menu-label">Поддержка</span></a>
    </div>
    <div class="mobile-dock-bar">
      <a href="${b}index.html" data-nav="home" data-tone="home">${dockIcon('home')}<span class="dock-label">Главная</span></a>
      <a href="${b}virtual-card.html" data-nav="cards" data-tone="cards">${dockIcon('cards')}<span class="dock-label">Карты</span></a>
      <a href="${b}section/ai/index.html" data-nav="ai" data-tone="ai">${dockIcon('ai')}<span class="dock-label">AI</span></a>
      <a href="${b}section/games/index.html" data-nav="games" data-tone="games">${dockIcon('games')}<span class="dock-label">Игры</span></a>
      <a href="${b}section/design/index.html" data-nav="design" data-tone="design">${dockIcon('design')}<span class="dock-label">Дизайн</span></a>
      <button type="button" class="mobile-dock-more" id="mobileDockMore" data-tone="more" aria-expanded="false" aria-controls="mobileDockSubmenu">${dockIcon('more')}<span class="dock-label">Еще</span></button>
    </div>
  `;
  document.body.appendChild(dock);

  const moreButton = document.getElementById('mobileDockMore');
  const submenu = document.getElementById('mobileDockSubmenu');
  const fullPath = window.location.pathname.toLowerCase();

  const navMatchers = {
    home: [],
    cards: ['virtual-card'],
    ai: ['section/ai'],
    games: ['section/games'],
    design: ['section/design'],
    more: ['section/entertainment', 'section/work', 'section/international', 'catalog', 'faq', 'support', 'documents', 'privacy', 'offer']
  };

  const isHome = fullPath.endsWith('/index.html') && !fullPath.includes('/section/') || fullPath.match(/\/[^\/]*\/?$/)?.[0] === '/';
  const matches = (key) => {
    if (key === 'home') return isHome;
    return (navMatchers[key] || []).some(token => fullPath.includes(token));
  };
  const setPressed = (el) => {
    el.classList.add('pressing');
    window.setTimeout(() => el.classList.remove('pressing'), 220);
  };

  function enableDragPassThrough(el) {
    let startX = 0;
    let startY = 0;
    let dragging = false;
    el.addEventListener('touchstart', (event) => {
      const t = event.touches && event.touches[0];
      if (!t) return;
      startX = t.clientX;
      startY = t.clientY;
      dragging = false;
    }, { passive: true });
    el.addEventListener('touchmove', (event) => {
      const t = event.touches && event.touches[0];
      if (!t) return;
      if (Math.abs(t.clientY - startY) > 8 || Math.abs(t.clientX - startX) > 8) {
        dragging = true;
        el.dataset.dragging = 'true';
      }
    }, { passive: true });
    el.addEventListener('touchend', () => {
      window.setTimeout(() => {
        dragging = false;
        delete el.dataset.dragging;
      }, 0);
    }, { passive: true });
    el.addEventListener('click', (event) => {
      if (dragging || el.dataset.dragging === 'true') {
        event.preventDefault();
        event.stopPropagation();
      }
    }, true);
  }

    dock.querySelectorAll('[data-nav]').forEach(link => {
    const key = link.getAttribute('data-nav');
    if (matches(key)) link.classList.add('active');
    link.addEventListener('pointerdown', () => setPressed(link), { passive: true });
    enableDragPassThrough(link);
  });
  submenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('pointerdown', () => setPressed(link), { passive: true });
    enableDragPassThrough(link);
  });

  if (matches('more')) {
    moreButton.classList.add('active');
  }

;

  const closeSubmenu = () => {
    submenu.classList.remove('active');
    submenu.setAttribute('aria-hidden', 'true');
    moreButton.setAttribute('aria-expanded', 'false');
    moreButton.classList.remove('pressing');
    moreButton.classList.remove('active');
    if (matches('more')) moreButton.classList.add('active');
  };

  const openSubmenu = () => {
    submenu.classList.add('active');
    submenu.setAttribute('aria-hidden', 'false');
    moreButton.setAttribute('aria-expanded', 'true');
    moreButton.classList.add('active');
  };

  moreButton.addEventListener('pointerdown', () => setPressed(moreButton), { passive: true });
  enableDragPassThrough(moreButton);
  moreButton.addEventListener('click', (event) => {
    event.stopPropagation();
    if (submenu.classList.contains('active')) closeSubmenu();
    else openSubmenu();
  });

  submenu.addEventListener('click', (event) => event.stopPropagation());
  document.addEventListener('click', (event) => {
    if (!dock.contains(event.target)) closeSubmenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeSubmenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) closeSubmenu();
  }, { passive: true });

  // Move search bar out of nav on mobile
  if (window.innerWidth <= 860) {
    const search = document.querySelector('.header-search');
    const shell = document.querySelector('.header-shell');
    if (search && shell) {
      shell.appendChild(search);
    }
  }
}



function syncMobileDockViewport() {
  const root = document.documentElement;
  const dock = document.getElementById('mobileDock');
  if (!dock) return;

  const applyViewportOffset = () => {
    const vv = window.visualViewport;
    let offset = 0;

    if (vv) {
      const chromeGap = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      offset = chromeGap;
    }

    root.style.setProperty('--mobile-viewport-offset', offset + 'px');
    root.style.setProperty('--mobile-dock-bottom-gap', offset + 'px');
  };

  applyViewportOffset();

  window.addEventListener('resize', applyViewportOffset, { passive: true });
  window.addEventListener('orientationchange', applyViewportOffset, { passive: true });
  window.addEventListener('scroll', applyViewportOffset, { passive: true });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', applyViewportOffset, { passive: true });
    window.visualViewport.addEventListener('scroll', applyViewportOffset, { passive: true });
  }
}
