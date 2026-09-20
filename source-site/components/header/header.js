document.addEventListener('DOMContentLoaded', () => {
  const siteHeader = document.querySelector('[data-component="header"]');
  if (!siteHeader) return;

  const head = document.head || document.querySelector('head');
  const currentPath = (window.location.pathname || '').replace(/\/+/g, '/');
  siteHeader.classList.add('header-unified-v103');

  const resolveBasePrefix = () => {
    const metaBase = document.querySelector('meta[name="base-path"]')?.getAttribute('content') || '';
    if (metaBase) return metaBase;

    const existingBrand = siteHeader.querySelector('.brand');
    const href = existingBrand?.getAttribute('href') || '';
    if (href) {
      return href.endsWith('index.html') ? href.slice(0, -'index.html'.length) : href;
    }

    const path = window.location.pathname || '/';
    const depth = Math.max(0, path.split('/').filter(Boolean).length - 1);
    return depth ? '../'.repeat(depth) : '';
  };

  const basePrefix = resolveBasePrefix();

  const ensureBaseMeta = () => {
    if (!head) return;
    let meta = document.querySelector('meta[name="base-path"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'base-path';
      head.prepend(meta);
    }
    if (!meta.getAttribute('content')) meta.setAttribute('content', basePrefix);
  };

  const isCurrent = (href) => {
    const normalizedHref = href.replace(basePrefix, '').replace(/^\//, '');
    if (!normalizedHref) return false;
    if (normalizedHref === 'virtual-card.html') {
      return currentPath.endsWith('/virtual-card.html') || currentPath.endsWith('virtual-card.html') || currentPath.includes('/section/virtual-card/') || currentPath.includes('/service/virtual-card/');
    }
    return currentPath.endsWith('/' + normalizedHref) || currentPath.endsWith(normalizedHref);
  };

  const isCatalogContext = () => /\/catalog\.html$/.test(currentPath) || /\/section\//.test(currentPath) || /\/service\//.test(currentPath);

  const renderHeaderShell = () => {
    siteHeader.innerHTML = `
      <div class="container">
        <div class="header-shell">
          <a aria-label="Цифровое решение" class="brand" href="${basePrefix}index.html">
            <div class="brand-mark"><img src="${basePrefix}assets/brand/mcg-logo-white-clean.png" alt="" aria-hidden="true"></div>
            <div class="brand-text">
              <strong>Цифровое решение</strong>
              <span>Каталог цифровых сервисов</span>
            </div>
          </a>
          <nav aria-label="Основная навигация" class="nav"></nav>
          <div class="header-actions">
            <button aria-expanded="false" aria-label="Открыть меню" class="menu-toggle" id="menuToggle">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
        <div class="nav-mobile component-mobile-menu" id="mobileMenu" data-component="mobile-menu"></div>
      </div>
    `;
  };

  const ensureUnifiedHeaderStyle = () => {
    if (!head || document.getElementById('unified-header-style-v103')) return;
    const style = document.createElement('style');
    style.id = 'unified-header-style-v103';
    style.textContent = `
.component-header.header-unified-v103 .header-shell{
  display:grid !important;
  grid-template-columns:minmax(208px, 228px) minmax(0,1fr) auto !important;
  align-items:center !important;
  gap:22px !important;
  min-height:76px !important;
  padding:11px 18px !important;
  border-radius:26px !important;
  background:linear-gradient(180deg, rgba(7,12,30,.94), rgba(8,12,28,.90)) !important;
  border:1px solid rgba(112,142,224,.16) !important;
  box-shadow:0 18px 44px rgba(4,8,24,.22), inset 0 1px 0 rgba(255,255,255,.04) !important;
}
.component-header.header-unified-v103 .brand{
  display:flex !important;
  align-items:center !important;
  gap:12px !important;
  min-width:0 !important;
  min-height:54px !important;
  padding:10px 14px !important;
  border-radius:20px !important;
  background:linear-gradient(180deg, rgba(18,28,62,.86), rgba(12,20,48,.82)) !important;
  border:1px solid rgba(118,153,241,.18) !important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.04), 0 10px 26px rgba(6,12,30,.20) !important;
}
.component-header.header-unified-v103 .brand-mark{
  width:40px !important;
  height:40px !important;
  border-radius:14px !important;
  box-shadow:0 0 18px rgba(69,118,234,.10) !important;
}
.component-header.header-unified-v103 .brand-mark img{
  display:block !important;
  width:76% !important;
  height:76% !important;
  object-fit:contain !important;
  filter:none !important;
  opacity:1 !important;
}
.component-header.header-unified-v103 .brand-mark::after{
  inset:6px !important;
  border-radius:10px !important;
}
.component-header.header-unified-v103 .brand-text{
  gap:2px !important;
  min-width:0 !important;
}
.component-header.header-unified-v103 .brand-text strong{
  font-size:13px !important;
  line-height:1.08 !important;
  font-weight:800 !important;
  color:#f5f8ff !important;
  letter-spacing:-0.015em !important;
}
.component-header.header-unified-v103 .brand-text span{
  font-size:10px !important;
  line-height:1.2 !important;
  color:rgba(190,204,234,.82) !important;
  white-space:nowrap !important;
}
.component-header.header-unified-v103 .nav{
  display:flex !important;
  align-items:center !important;
  justify-content:center !important;
  gap:28px !important;
  min-width:0 !important;
}
.component-header.header-unified-v103 .nav > *,
.component-header .header-actions > *{
  flex:0 0 auto !important;
}
.component-header.header-unified-v103 .nav a,
.component-header.header-unified-v103 .nav .nav-dropdown-trigger,
.component-header.header-unified-v103 .nav .nav-contacts-link{
  display:inline-flex !important;
  box-shadow:none !important;
  text-decoration:none !important;
  align-items:center !important;
  justify-content:center !important;
  min-height:36px !important;
  padding:0 !important;
  margin:0 !important;
  background:none !important;
  border:0 !important;
  box-shadow:none !important;
  border-radius:0 !important;
  position:relative !important;
  font-size:14px !important;
  line-height:1 !important;
  font-weight:700 !important;
  letter-spacing:-0.01em !important;
  color:rgba(226,234,252,.88) !important;
  text-decoration:none !important;
  transition:color .18s ease, opacity .18s ease !important;
}
.component-header.header-unified-v103 .nav a::after,
.component-header.header-unified-v103 .nav .nav-dropdown-trigger::after,
.component-header.header-unified-v103 .nav .nav-contacts-link::after{
  content:'' !important;
  position:absolute !important;
  left:0 !important;
  right:0 !important;
  bottom:-9px !important;
  height:2px !important;
  border-radius:999px !important;
  background:linear-gradient(90deg, rgba(105,146,255,.96), rgba(128,95,255,.88)) !important;
  transform:scaleX(0) !important;
  transform-origin:left center !important;
  opacity:0 !important;
  transition:transform .24s cubic-bezier(.22,.61,.36,1), opacity .18s ease !important;
}
.component-header.header-unified-v103 .nav a:hover,
.component-header.header-unified-v103 .nav .nav-dropdown-trigger:hover,
.component-header.header-unified-v103 .nav .nav-contacts-link:hover,
.component-header.header-unified-v103 .nav a:focus-visible,
.component-header.header-unified-v103 .nav .nav-dropdown-trigger:focus-visible,
.component-header.header-unified-v103 .nav .nav-contacts-link:focus-visible{
  color:#ffffff !important;
  box-shadow:none !important;
  text-decoration:none !important;
}
.component-header.header-unified-v103 .nav a:hover::after,
.component-header.header-unified-v103 .nav .nav-dropdown-trigger:hover::after,
.component-header.header-unified-v103 .nav .nav-contacts-link:hover::after,
.component-header.header-unified-v103 .nav a.is-active::after,
.component-header.header-unified-v103 .nav .nav-dropdown-trigger.is-active::after,
.component-header.header-unified-v103 .nav .nav-contacts-link.is-active::after{
  transform:scaleX(1) !important;
  opacity:1 !important;
}
.component-header.header-unified-v103 .nav a.is-active,
.component-header.header-unified-v103 .nav .nav-dropdown-trigger.is-active,
.component-header.header-unified-v103 .nav .nav-contacts-link.is-active{
  color:#ffffff !important;
  box-shadow:none !important;
  text-decoration:none !important;
}
.component-header.header-unified-v103 .nav .nav-dropdown{
  position:relative !important;
}
.component-header.header-unified-v103 .nav .nav-dropdown-trigger svg{
  margin-left:6px !important;
  opacity:.78 !important;
}
.component-header.header-unified-v103 .nav .nav-dropdown-menu{
  margin-top:14px !important;
}
.component-header.header-unified-v103 .nav > a::after,
.component-header.header-unified-v103 .nav .nav-link::after,
.component-header.header-unified-v103 .nav .nav-dropdown-trigger::after,
.component-header.header-unified-v103 .nav .nav-contacts-link::after{
  content:'' !important;
  display:block !important;
}
.component-header.header-unified-v103 .nav > a.is-active,
.component-header.header-unified-v103 .nav .nav-link.is-active,
.component-header.header-unified-v103 .nav .nav-dropdown-trigger.is-active,
.component-header.header-unified-v103 .nav .nav-contacts-link.is-active{
  box-shadow:none !important;
}
.component-header.header-unified-v103 .nav > a.is-active::after,
.component-header.header-unified-v103 .nav .nav-link.is-active::after,
.component-header.header-unified-v103 .nav .nav-dropdown-trigger.is-active::after,
.component-header.header-unified-v103 .nav .nav-contacts-link.is-active::after,
.component-header.header-unified-v103 .nav > a.is-hovered::after,
.component-header.header-unified-v103 .nav .nav-link.is-hovered::after,
.component-header.header-unified-v103 .nav .nav-dropdown-trigger.is-hovered::after,
.component-header.header-unified-v103 .nav .nav-contacts-link.is-hovered::after{
  transform:scaleX(1) !important;
  opacity:1 !important;
}
.component-header.header-unified-v103 .header-actions{
  display:flex !important;
  align-items:center !important;
  justify-content:flex-end !important;
  gap:12px !important;
}
.component-header.header-unified-v103 .header-actions .header-search{
  order:1 !important;
}
.component-header.header-unified-v103 .header-actions .header-auth-link{
  order:2 !important;
  position:relative !important;
  display:inline-flex !important;
  align-items:center !important;
  justify-content:center !important;
  gap:7px !important;
  min-height:40px !important;
  padding:0 14px !important;
  margin:0 !important;
  border-radius:14px !important;
  border:1px solid rgba(137,165,236,.28) !important;
  background:linear-gradient(180deg, rgba(28,39,75,.80), rgba(14,23,52,.86)) !important;
  color:#f5f8ff !important;
  font-size:13px !important;
  line-height:1 !important;
  font-weight:800 !important;
  white-space:nowrap !important;
  text-decoration:none !important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.07), 0 10px 24px rgba(5,11,28,.22) !important;
  transition:transform .18s ease, border-color .18s ease, background .18s ease, box-shadow .18s ease !important;
}
.component-header.header-unified-v103 .header-actions .header-auth-link::before,
.component-header.header-unified-v103 .header-actions .header-auth-link::after{
  display:none !important;
  content:none !important;
}
.component-header.header-unified-v103 .header-actions .header-auth-link:hover,
.component-header.header-unified-v103 .header-actions .header-auth-link:focus-visible{
  transform:translateY(-1px) !important;
  border-color:rgba(148,201,255,.54) !important;
  background:linear-gradient(180deg, rgba(37,52,96,.88), rgba(18,29,63,.92)) !important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.10), 0 0 24px rgba(78,169,255,.18), 0 12px 28px rgba(5,11,28,.28) !important;
  color:#ffffff !important;
}
.component-header.header-unified-v103 .header-actions .header-auth-link:active{
  transform:translateY(0) scale(.985) !important;
}
.component-header.header-unified-v103 .header-auth-icon{
  width:16px !important;
  height:16px !important;
  display:inline-flex !important;
  align-items:center !important;
  justify-content:center !important;
  flex:0 0 16px !important;
}
.component-header.header-unified-v103 .header-auth-icon svg{
  display:block !important;
  width:16px !important;
  height:16px !important;
}
.component-header.header-unified-v103 .header-actions .nav-virtual-card-link{
  order:3 !important;
}
.component-header.header-unified-v103 .header-actions .menu-toggle{
  order:4 !important;
}
.component-header.header-unified-v103 .nav-mobile .mobile-auth{
  display:flex !important;
  width:100% !important;
  min-height:46px !important;
  align-items:center !important;
  justify-content:center !important;
  gap:8px !important;
  margin:8px 0 0 !important;
  padding:0 16px !important;
  border-radius:14px !important;
  border:1px solid rgba(126,158,235,.26) !important;
  background:linear-gradient(180deg, rgba(25,37,74,.90), rgba(13,22,50,.94)) !important;
  color:#f5f8ff !important;
  font-size:14px !important;
  line-height:1 !important;
  font-weight:800 !important;
  text-decoration:none !important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.06), 0 10px 24px rgba(4,9,24,.18) !important;
}
.component-header.header-unified-v103 .nav-mobile .mobile-auth::before,
.component-header.header-unified-v103 .nav-mobile .mobile-auth::after{
  display:none !important;
  content:none !important;
}
.component-header.header-unified-v103 .nav-mobile .mobile-auth:hover,
.component-header.header-unified-v103 .nav-mobile .mobile-auth:focus-visible{
  transform:translateY(-1px) !important;
  border-color:rgba(148,201,255,.50) !important;
  background:linear-gradient(180deg, rgba(34,49,91,.96), rgba(17,28,61,.98)) !important;
  color:#ffffff !important;
}
.component-header.header-unified-v103 .header-actions .nav-virtual-card-link{
  position:relative !important;
  isolation:isolate !important;
  overflow:visible !important;
  display:inline-flex !important;
  align-items:center !important;
  justify-content:center !important;
  min-height:40px !important;
  padding:0 18px !important;
  border-radius:14px !important;
  border:1px solid rgba(164,226,255,.82) !important;
  background:
    radial-gradient(118% 124% at 18% 12%, rgba(202,233,255,.08) 0%, rgba(202,233,255,0) 40%),
    radial-gradient(92% 106% at 84% 86%, rgba(101,84,245,.12) 0%, rgba(101,84,245,0) 46%),
    linear-gradient(180deg, rgba(28,39,75,.985) 0%, rgba(18,28,59,.992) 46%, rgba(12,20,48,.995) 74%, rgba(24,23,61,.995) 100%) !important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.14),
    inset 0 -14px 24px rgba(13,20,54,.48),
    0 0 0 1px rgba(127,201,255,.22),
    0 0 28px rgba(74,198,255,.60),
    0 0 58px rgba(74,198,255,.34),
    0 16px 32px rgba(7,14,38,.40) !important;
  color:#ffffff !important;
  text-shadow:0 1px 10px rgba(8,16,46,.28) !important;
  font-size:14px !important;
  line-height:1 !important;
  font-weight:800 !important;
  letter-spacing:-0.01em !important;
  text-decoration:none !important;
  white-space:nowrap !important;
  transition:transform .18s ease, border-color .18s ease, box-shadow .18s ease, background .18s ease, filter .18s ease !important;
}
.component-header.header-unified-v103 .header-actions .nav-virtual-card-link::before{
  content:'' !important;
  position:absolute !important;
  inset:1px !important;
  border-radius:12px !important;
  background:
    linear-gradient(180deg, rgba(255,255,255,.08) 0%, rgba(255,255,255,.02) 24%, rgba(255,255,255,0) 52%),
    radial-gradient(72% 56% at 18% 18%, rgba(255,255,255,.06) 0%, rgba(255,255,255,0) 54%),
    radial-gradient(70% 80% at 86% 100%, rgba(120,226,255,.08) 0%, rgba(120,226,255,0) 44%) !important;
  opacity:1 !important;
  pointer-events:none !important;
  z-index:-1 !important;
}
.component-header.header-unified-v103 .header-actions .nav-virtual-card-link::after{
  content:'' !important;
  position:absolute !important;
  inset:-12px !important;
  border-radius:24px !important;
  background:radial-gradient(74% 88% at 50% 50%, rgba(86,212,255,.64) 0%, rgba(86,212,255,.34) 42%, rgba(86,212,255,0) 78%) !important;
  filter:blur(14px) !important;
  opacity:1 !important;
  pointer-events:none !important;
  z-index:-2 !important;
}
.component-header.header-unified-v103 .header-actions .nav-virtual-card-link:hover,
.component-header.header-unified-v103 .header-actions .nav-virtual-card-link:focus-visible,
.component-header.header-unified-v103 .header-actions .nav-virtual-card-link.is-active{
  transform:translateY(-1px) scale(1.01) !important;
  border-color:rgba(209,243,255,.96) !important;
  background:
    radial-gradient(118% 124% at 18% 12%, rgba(218,239,255,.10) 0%, rgba(218,239,255,0) 40%),
    radial-gradient(92% 106% at 84% 86%, rgba(118,94,255,.15) 0%, rgba(118,94,255,0) 46%),
    linear-gradient(180deg, rgba(34,46,85,.99) 0%, rgba(22,33,65,.995) 42%, rgba(14,24,54,.998) 74%, rgba(30,28,70,.998) 100%) !important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.16),
    inset 0 -14px 24px rgba(13,20,54,.54),
    0 0 0 1px rgba(145,218,255,.28),
    0 0 32px rgba(90,215,255,.70),
    0 0 62px rgba(90,215,255,.40),
    0 18px 36px rgba(7,14,38,.44) !important;
  filter:saturate(1.04) !important;
}
.component-header.header-unified-v103 .header-actions .header-search{
  display:block !important;
  width:176px !important;
  margin:0 !important;
}
.component-header.header-unified-v103 .header-actions .search-wrapper{
  display:flex !important;
  align-items:center !important;
  min-height:38px !important;
  padding:0 12px !important;
  border-radius:13px !important;
  border:1px solid rgba(255,255,255,.08) !important;
  background:rgba(255,255,255,.035) !important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.03) !important;
}
.component-header.header-unified-v103 .header-actions .search-icon{
  position:static !important;
  transform:none !important;
  color:rgba(196,209,236,.72) !important;
}
.component-header.header-unified-v103 .header-actions .search-input{
  width:100% !important;
  min-width:0 !important;
  height:auto !important;
  padding:0 0 0 10px !important;
  border:0 !important;
  border-radius:0 !important;
  background:transparent !important;
  color:#eef4ff !important;
  font-size:13px !important;
  font-weight:500 !important;
}
.component-header.header-unified-v103 .header-actions .search-input::placeholder{
  color:rgba(181,197,228,.68) !important;
}
.component-header.header-unified-v103 .header-actions .search-input:focus{
  width:100% !important;
}
.component-header.header-unified-v103 .header-actions .search-results{
  top:calc(100% + 10px) !important;
}
.component-header.header-unified-v103 .menu-toggle{
  display:none !important;
}
@media (max-width: 1320px){
  .component-header.header-unified-v103 .header-shell{
    grid-template-columns:minmax(198px, 216px) minmax(0,1fr) auto !important;
    gap:18px !important;
    padding:11px 16px !important;
  }
  .component-header.header-unified-v103 .nav{gap:22px !important;}
  .component-header.header-unified-v103 .header-actions{gap:10px !important;}
  .component-header.header-unified-v103 .header-actions .header-search{width:164px !important;}
}
@media (max-width: 1200px){
  .component-header.header-unified-v103 .nav{gap:18px !important;}
  .component-header.header-unified-v103 .nav a,
  .component-header.header-unified-v103 .nav .nav-dropdown-trigger,
  .component-header .nav .nav-contacts-link,
  .component-header.header-unified-v103 .header-actions .nav-virtual-card-link{
    font-size:13px !important;
  }
  .component-header.header-unified-v103 .header-actions .nav-virtual-card-link{padding:0 16px !important;}
  .component-header.header-unified-v103 .header-actions .header-search{width:154px !important;}
}
@media (max-width: 1240px) and (min-width: 1081px){
  .component-header.header-unified-v103 .header-actions .header-auth-link{
    width:40px !important;
    min-width:40px !important;
    padding:0 !important;
  }
  .component-header.header-unified-v103 .header-actions .header-auth-label{
    display:none !important;
  }
}
@media (max-width: 1080px){
  .component-header.header-unified-v103 .header-shell{
    grid-template-columns:minmax(0,1fr) auto !important;
    gap:12px !important;
  }
  .component-header .nav,
  .component-header .header-actions .header-search,
  .component-header.header-unified-v103 .header-actions .header-auth-link,
  .component-header.header-unified-v103 .header-actions .nav-virtual-card-link{
    display:none !important;
  }
  .component-header.header-unified-v103 .header-actions{
    gap:0 !important;
  }
  .component-header.header-unified-v103 .menu-toggle{
    display:flex !important;
    width:44px !important;
    height:44px !important;
    border-radius:14px !important;
    background:rgba(255,255,255,.07) !important;
    border:1px solid rgba(255,255,255,.10) !important;
    box-shadow:none !important;
  }
  .component-header.header-unified-v103 .menu-toggle span{
    background:#f1f5ff !important;
  }
}
@media (min-width: 761px) and (max-width: 1024px){
  .component-header.header-unified-v103 .header-shell{
    grid-template-columns:minmax(214px, 236px) minmax(0,1fr) auto !important;
    gap:14px !important;
    align-items:center !important;
    min-height:78px !important;
    padding:12px 16px !important;
  }
  .component-header.header-unified-v103 .brand{
    min-height:52px !important;
    padding:10px 14px !important;
    border-radius:20px !important;
  }
  .component-header.header-unified-v103 .brand-text strong{
    font-size:12.5px !important;
  }
  .component-header.header-unified-v103 .brand-text span{
    font-size:9.5px !important;
    white-space:nowrap !important;
    overflow:hidden !important;
    text-overflow:ellipsis !important;
  }
  .component-header.header-unified-v103 .nav{
    display:flex !important;
    justify-content:flex-start !important;
    gap:16px !important;
    flex-wrap:nowrap !important;
    overflow:visible !important;
  }
  .component-header.header-unified-v103 .nav a,
  .component-header.header-unified-v103 .nav .nav-dropdown-trigger,
  .component-header.header-unified-v103 .nav .nav-contacts-link{
    font-size:12.5px !important;
    white-space:nowrap !important;
    min-height:32px !important;
  }
  .component-header.header-unified-v103 .header-actions{
    width:46px !important;
    min-width:46px !important;
    display:flex !important;
    justify-content:flex-end !important;
    align-items:center !important;
  }
  .component-header.header-unified-v103 .header-actions .header-search,
  .component-header.header-unified-v103 .header-actions .nav-virtual-card-link,
  .component-header.header-unified-v103 > .container > .header-search,
  .component-header.header-unified-v103 .header-shell > .header-search{
    display:none !important;
  }
  .component-header.header-unified-v103 .menu-toggle{
    display:flex !important;
    margin:0 !important;
  }
  .component-header.header-unified-v103 .nav-mobile{
    margin-top:12px !important;
  }
  .component-header.header-unified-v103 .nav .nav-dropdown-menu{
    left:0 !important;
    right:auto !important;
    transform:translateY(6px) !important;
    min-width:320px !important;
    max-width:min(420px, calc(100vw - 48px)) !important;
  }
  .component-header.header-unified-v103 .nav .nav-dropdown:hover .nav-dropdown-menu,
  .component-header.header-unified-v103 .nav .nav-dropdown:focus-within .nav-dropdown-menu,
  .component-header.header-unified-v103 .nav .nav-dropdown.is-open .nav-dropdown-menu{
    transform:translateY(0) !important;
  }
}
@media (max-width: 760px){
  .component-header.header-unified-v103 .container{
    width:calc(100% - 16px) !important;
  }
  .component-header.header-unified-v103 .header-shell{
    grid-template-columns:minmax(0,1fr) auto !important;
    min-height:72px !important;
    padding:10px 12px !important;
    border-radius:24px !important;
    gap:10px !important;
  }
  .component-header.header-unified-v103 .nav,
  .component-header.header-unified-v103 .header-actions .header-search,
  .component-header.header-unified-v103 .header-actions .header-auth-link,
  .component-header.header-unified-v103 .header-actions .nav-virtual-card-link{
    display:none !important;
  }
  .component-header.header-unified-v103 .header-actions{
    justify-content:flex-end !important;
    gap:0 !important;
  }
  .component-header.header-unified-v103 .menu-toggle{
    display:flex !important;
    width:46px !important;
    height:46px !important;
    border-radius:15px !important;
    background:rgba(255,255,255,.07) !important;
    border:1px solid rgba(255,255,255,.12) !important;
    box-shadow:0 12px 24px rgba(5,10,24,.18) !important;
  }
  .component-header.header-unified-v103 .brand{
    width:100% !important;
    padding:10px 13px !important;
    min-height:50px !important;
    border-radius:18px !important;
  }
  .component-header.header-unified-v103 .brand-mark{
    width:38px !important;
    height:38px !important;
    border-radius:13px !important;
  }
  .component-header.header-unified-v103 .brand-mark img{
    width:76% !important;
    height:76% !important;
  }
  .component-header.header-unified-v103 .brand-text strong{
    font-size:13px !important;
    line-height:1.06 !important;
  }
  .component-header.header-unified-v103 .brand-text span{
    display:none !important;
  }
  .component-header.header-unified-v103 .nav-mobile{
    margin-top:10px !important;
  }
}
`;
    head.appendChild(style);
  };


  const getCategoryIcon = (key) => `<span class="cat-icon cat-icon--${key}" aria-hidden="true"></span>`;

  const createDropdown = () => {
    const dropdown = document.createElement('div');
    dropdown.className = 'nav-dropdown';

    const trigger = document.createElement('a');
    trigger.href = `${basePrefix}catalog.html`;
    trigger.className = 'nav-link nav-dropdown-trigger';
    trigger.innerHTML = 'Каталог <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    if (isCatalogContext()) {
      trigger.classList.add('is-active');
      trigger.setAttribute('aria-current', 'page');
    }

    const menu = document.createElement('div');
    menu.className = 'nav-dropdown-menu';
    const items = [
      ['virtual-card.html', 'card', 'Виртуальная карта', '1'],
      ['section/ai/index.html', 'ai', 'Нейросети', '64'],
      ['section/design/index.html', 'design', 'Дизайн', '17'],
      ['section/entertainment/index.html', 'entertainment', 'Развлечения', '15'],
      ['section/games/index.html', 'games', 'Игры', '13'],
      ['section/international/index.html', 'globe', 'Зарубежные покупки', '4'],
      ['section/work/index.html', 'work', 'Для работы', '29']
    ];
    menu.innerHTML = items.map(([href, iconKey, label, count]) => {
      const active = isCurrent(href) ? ' class="cat-active"' : '';
      return `<a href="${basePrefix}${href}"${active}>${getCategoryIcon(iconKey)}<span class="cat-label">${label}</span><span class="cat-count">${count}</span></a>`;
    }).join('');

    dropdown.append(trigger, menu);
    return dropdown;
  };

  const createNavLink = (href, text, className = '') => {
    const link = document.createElement('a');
    link.href = `${basePrefix}${href}`;
    link.className = ['nav-link', className].filter(Boolean).join(' ');
    link.textContent = text;
    if (isCurrent(href)) {
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
    }
    return link;
  };

  const getAuthState = () => {
    try {
      const rawSession = window.sessionStorage.getItem('marsCap_session');
      if (!rawSession) return { isLoggedIn: false };
      const session = JSON.parse(rawSession);
      return { isLoggedIn: Boolean(session && session.email) };
    } catch (error) {
      return { isLoggedIn: false };
    }
  };

  const getAuthPresentation = () => {
    const { isLoggedIn } = getAuthState();
    return {
      isLoggedIn,
      href: isLoggedIn ? 'dashboard.html' : 'login.html',
      label: isLoggedIn ? 'Профиль' : 'Вход',
      ariaLabel: isLoggedIn ? 'Открыть личный кабинет' : 'Войти в личный кабинет'
    };
  };

  const getAuthIcon = (isLoggedIn) => isLoggedIn
    ? '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" stroke-width="1.8"/><path d="M4.8 20c.9-3.5 3.4-5.2 7.2-5.2s6.3 1.7 7.2 5.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M8.5 10V7.7A3.5 3.5 0 0 1 12 4.2a3.5 3.5 0 0 1 3.5 3.5V10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

  const createAuthLink = (extraClass = '') => {
    const auth = getAuthPresentation();
    const link = document.createElement('a');
    link.href = `${basePrefix}${auth.href}`;
    link.className = ['header-auth-link', extraClass].filter(Boolean).join(' ');
    link.dataset.authLink = '';
    link.dataset.authState = auth.isLoggedIn ? 'authenticated' : 'anonymous';
    link.setAttribute('aria-label', auth.ariaLabel);
    link.innerHTML = `<span class="header-auth-icon">${getAuthIcon(auth.isLoggedIn)}</span><span class="header-auth-label">${auth.label}</span>`;
    return link;
  };

  const refreshAuthLinks = () => {
    const auth = getAuthPresentation();
    siteHeader.querySelectorAll('[data-auth-link]').forEach((link) => {
      link.href = `${basePrefix}${auth.href}`;
      link.dataset.authState = auth.isLoggedIn ? 'authenticated' : 'anonymous';
      link.setAttribute('aria-label', auth.ariaLabel);
      const icon = link.querySelector('.header-auth-icon');
      const label = link.querySelector('.header-auth-label');
      if (icon) icon.innerHTML = getAuthIcon(auth.isLoggedIn);
      if (label) label.textContent = auth.label;
    });
  };

  const createSearch = (extraClass = '') => {
    const wrapper = document.createElement('div');
    wrapper.className = 'header-search';
    if (extraClass) wrapper.classList.add(extraClass);
    wrapper.innerHTML = `
      <div class="search-wrapper">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.5"/><path d="M11 11l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        <input type="text" class="search-input" placeholder="Найти сервис..." autocomplete="off" data-search="services" />
        <div class="search-results"></div>
      </div>
    `;
    return wrapper;
  };

  ensureBaseMeta();
  renderHeaderShell();
  ensureUnifiedHeaderStyle();

  const nav = siteHeader.querySelector('.nav');
  const mobileMenu = siteHeader.querySelector('#mobileMenu');
  const headerActions = siteHeader.querySelector('.header-actions');
  const menuToggle = siteHeader.querySelector('#menuToggle');

  const rebuildDesktopNav = () => {
    if (!nav) return;
    nav.innerHTML = '';
    nav.append(
      createDropdown(),
      createNavLink('how-it-works.html', 'Как это работает'),
      createNavLink('support.html', 'Поддержка'),
      createNavLink('faq.html', 'FAQ'),
      createNavLink('contacts.html', 'Контакты', 'nav-contacts-link')
    );
  };

  const bindDesktopNavInteractions = () => {
    if (!nav) return;
    nav.querySelectorAll('.nav-link, .nav-dropdown-trigger, .nav-contacts-link').forEach((link) => {
      link.addEventListener('mouseenter', () => link.classList.add('is-hovered'));
      link.addEventListener('mouseleave', () => link.classList.remove('is-hovered'));
      link.addEventListener('focus', () => link.classList.add('is-hovered'));
      link.addEventListener('blur', () => link.classList.remove('is-hovered'));
    });
  };

  const bindTabletCatalogDropdown = () => {
    if (!nav) return;
    const dropdown = nav.querySelector('.nav-dropdown');
    const trigger = dropdown?.querySelector('.nav-dropdown-trigger');
    const menu = dropdown?.querySelector('.nav-dropdown-menu');
    if (!dropdown || !trigger || !menu) return;

    const closeDropdown = () => {
      dropdown.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    };

    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-expanded', 'false');

    trigger.addEventListener('click', (event) => {
      if (window.innerWidth > 1024 || window.innerWidth <= 760) return;
      if (!dropdown.classList.contains('is-open')) {
        event.preventDefault();
        closeAllDropdowns();
        dropdown.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        return;
      }
      closeDropdown();
    });

    document.addEventListener('click', (event) => {
      if (!dropdown.classList.contains('is-open')) return;
      if (dropdown.contains(event.target)) return;
      closeDropdown();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeDropdown();
    });
  };

  const closeAllDropdowns = () => {
    siteHeader.querySelectorAll('.nav-dropdown.is-open').forEach((dropdown) => {
      dropdown.classList.remove('is-open');
      const trigger = dropdown.querySelector('.nav-dropdown-trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  };

  const rebuildDesktopActions = () => {
    if (!headerActions) return;
    headerActions.querySelectorAll('.header-search, .header-auth-link, .nav-virtual-card-link').forEach(node => node.remove());
    const isTabletHeader = window.innerWidth <= 1024;
    if (isTabletHeader) return;
    const search = createSearch();
    const authLink = createAuthLink();
    const virtualCard = createNavLink('virtual-card.html', 'Виртуальная карта', 'nav-virtual-card-link');
    if (menuToggle) {
      headerActions.insertBefore(search, menuToggle);
      headerActions.insertBefore(authLink, menuToggle);
      headerActions.insertBefore(virtualCard, menuToggle);
    } else {
      headerActions.append(search, authLink, virtualCard);
    }
  };

  const rebuildMobileNav = () => {
    if (!mobileMenu) return;
    mobileMenu.innerHTML = '';

    const includeSearch = window.innerWidth <= 760;
    const mobileSearch = includeSearch ? createSearch('mobile-menu-search') : null;
    const primaryCta = createNavLink('virtual-card.html', 'Виртуальная карта', 'mobile-cta');
    const authLink = createAuthLink('mobile-auth');
    const utilityLinks = document.createElement('div');
    utilityLinks.className = 'mobile-menu-links';

    const items = [
      ['catalog.html', 'Каталог'],
      ['how-it-works.html', 'Как это работает'],
      ['support.html', 'Поддержка'],
      ['faq.html', 'FAQ'],
      ['contacts.html', 'Контакты']
    ];

    items.forEach(([href, text]) => utilityLinks.appendChild(createNavLink(href, text)));

    if (mobileSearch) mobileMenu.appendChild(mobileSearch);
    mobileMenu.append(primaryCta, authLink, utilityLinks);
  };

  const ensureSearchScript = () => {
    if (window.__marsHeaderSearchLoaded || Array.from(document.scripts).some((script) => (script.src || '').includes('/search.js') || (script.src || '').endsWith('search.js'))) {
      return;
    }
    window.__marsHeaderSearchLoaded = true;
    const script = document.createElement('script');
    script.src = `${basePrefix}search.js`;
    script.defer = true;
    script.addEventListener('load', () => document.dispatchEvent(new Event('mars:search-refresh')));
    document.body.appendChild(script);
  };


  const applyMobileHeroGalaxyCalibration = () => {
    // Mobile hero galaxy is calibrated in CSS media queries (v114).
    // Keep this function as a no-op so JS does not override the device-specific CSS offsets.
    return;
  };

  rebuildDesktopNav();
  bindDesktopNavInteractions();
  bindTabletCatalogDropdown();
  rebuildDesktopActions();
  rebuildMobileNav();
  ensureSearchScript();
  refreshAuthLinks();
  document.dispatchEvent(new Event('mars:search-refresh'));
  document.dispatchEvent(new Event('mars:header-ready'));
  document.addEventListener('mars:auth-refresh', refreshAuthLinks);
  window.addEventListener('pageshow', refreshAuthLinks);
  applyMobileHeroGalaxyCalibration();

  if (!menuToggle || !mobileMenu) return;

  const closeMenu = () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('active');
    document.body.classList.remove('mobile-nav-open');
  };

  const openMenu = () => {
    menuToggle.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('active');
    document.body.classList.add('mobile-nav-open');
  };

  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    if (expanded) closeMenu();
    else openMenu();
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  document.addEventListener('click', (event) => {
    if (!mobileMenu.classList.contains('active')) return;
    if (siteHeader.contains(event.target)) return;
    closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1080) closeMenu();
    closeAllDropdowns();
    applyMobileHeroGalaxyCalibration();
  });
});
