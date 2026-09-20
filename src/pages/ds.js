(function(){
  var MC = window.MC, $ = MC.$, CAT = MC.CATALOG;
  var body = document.getElementById('dsRoot');

  /* — превью: глобальная схема + локальная у каждого демо, кнопка «Код» — */
  function setPreview(mode){
    body.setAttribute('data-preview', mode);
    document.querySelectorAll('.ds-preview [data-preview]').forEach(function(b){ b.setAttribute('aria-pressed', b.dataset.preview === mode ? 'true' : 'false'); });
    document.querySelectorAll('.ds-demo').forEach(function(d){ d.classList.remove('is-dark', 'is-light'); syncDemoBar(d); });
    try { localStorage.setItem('ds-preview', mode); } catch (e) {}
  }
  document.querySelectorAll('.ds-preview [data-preview]').forEach(function(b){ b.addEventListener('click', function(){ setPreview(b.dataset.preview); }); });
  var saved = 'light'; try { saved = localStorage.getItem('ds-preview') || 'light'; } catch (e) {}

  function isDark(d){ return d.classList.contains('is-dark') || (body.getAttribute('data-preview') === 'dark' && !d.classList.contains('is-light')); }
  function syncDemoBar(d){
    var bar = d.querySelector(':scope > .demo-bar'); if (!bar) return;
    var dark = isDark(d);
    bar.querySelector('[data-scheme="light"]').setAttribute('aria-pressed', dark ? 'false' : 'true');
    bar.querySelector('[data-scheme="dark"]').setAttribute('aria-pressed', dark ? 'true' : 'false');
  }
  function esc(s){ return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function tidy(html){
    html = html.replace(/ src="data:[^"]*"/g, ' src="…"').replace(/ data-(logo|cat)="[^"]*"/g, '').replace(/ class="([^"]*) ?on-dark"/g, ' class="$1 on-dark"').replace(/\s+id="[^"]*"/g, function(m){ return /^\s+id="(f\d|e\d|lg\d|tp\d|dlg|ind|ds)/.test(m) ? '' : m; });
    var lines = html.replace(/^\s*\n/, '').replace(/\s+$/, '').split('\n');
    var min = Infinity;
    lines.forEach(function(l){ if (l.trim()) { var n = l.match(/^\s*/)[0].length; if (n < min) min = n; } });
    return lines.map(function(l){ return l.slice(Math.min(min, l.length)); }).join('\n').trim();
  }
  document.querySelectorAll('.ds-demo').forEach(function(d){
    var bar = document.createElement('div'); bar.className = 'demo-bar';
    bar.innerHTML = '<span>' + esc(d.dataset.name || 'Пример') + '</span><span class="sp"></span>' +
      '<button type="button" data-scheme="light" aria-pressed="true">Светлая</button><button type="button" data-scheme="dark" aria-pressed="false">Тёмная</button>' +
      (d.hasAttribute('data-nocode') ? '' : '<button type="button" data-code aria-pressed="false" aria-expanded="false">Код</button>');
    d.insertBefore(bar, d.firstChild);
    bar.querySelectorAll('[data-scheme]').forEach(function(b){ b.addEventListener('click', function(){ d.classList.remove('is-dark', 'is-light'); d.classList.add(b.dataset.scheme === 'dark' ? 'is-dark' : 'is-light'); syncDemoBar(d); }); });
    var cb = bar.querySelector('[data-code]');
    if (cb) {
      var pre = null;
      cb.addEventListener('click', function(){
        if (!pre) { pre = document.createElement('pre'); pre.className = 'ds-code'; pre.textContent = tidy(d.querySelector('.demo-in').innerHTML); pre.hidden = true; d.appendChild(pre); }
        var open = pre.hidden; pre.hidden = !open; cb.setAttribute('aria-pressed', open ? 'true' : 'false'); cb.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
  });
  setPreview(saved);

  /* — образцы цвета — */
  var INK = [['ink-950','#090D18','земля, галактика'],['ink-900','#0E1420','панели'],['ink-850','#171E2C','плитки, поля'],['ink-800','#222A3A','hover, тёмная подложка лого'],['ink-700','#384050','текст-2 светлой'],['ink-600','#596070','рамка hover, текст-3 светлой'],['ink-500','#7D8391','текст-4 тёмной'],['ink-400','#9FA5B0','текст-3 тёмной'],['ink-300','#C0C4CD','текст-2 тёмной'],['ink-200','#DBDEE5','рамки светлой'],['ink-100','#EEF0F4','заголовки тёмной'],['ink-50','#F5F7FB','фон светлой']];
  var BLUE = [['blue-700','#0244BE','низ градиента, акцент светлой'],['blue-600','#1A5FE5','верх градиента кнопки'],['blue-500','#3D7EFC','выбранное, фокус поля'],['blue-400','#699FFF','ссылки тёмной'],['blue-300','#97BEFF','hover ссылки, фокус'],['blue-200','#C2D8FF','подложки']];
  var EXTRA = [['cyan-300','#52CFF3','градиент таймлайна'],['violet-400','#B082F7','знак бренда'],['ok-400','#63D18F','успех, тёмная'],['warn-400','#EEB154','внимание, тёмная'],['err-400','#F97770','ошибка, тёмная'],['ok-600','#006B35','успех, светлая'],['warn-600','#9A5B00','внимание, светлая'],['err-600','#B8262A','ошибка, светлая']];
  function ramp(el, list){
    list.forEach(function(c){
      var b = document.createElement('button'); b.type = 'button'; b.className = 'sw'; b.title = 'Скопировать ' + c[1];
      b.innerHTML = '<i style="background:' + c[1] + '"></i><b>' + c[0] + '</b><span>' + c[1] + '</span><span>' + c[2] + '</span>';
      b.addEventListener('click', function(){ copy(c[1], c[0]); });
      el.appendChild(b);
    });
  }
  ramp($('rampInk'), INK); ramp($('rampBlue'), BLUE); ramp($('rampExtra'), EXTRA);

  /* — роли: значения обеих тем из base.css — */
  var ROLES = [
    ['--bg','фон страницы','#090D18','#F5F7FB'],['--panel','стеклянная панель (blur 16)','ink-900 · 82%','#FDFDFF · 86%'],['--panel-solid','расчёт, тост, меню, диалог','#0E1420','#FDFDFF'],
    ['--surface','плитки, поля, карточки, чипы','#171E2C','#EDF0F6'],['--surface-2','hover плитки, подложка прогресса','#222A3A','#E4E8EF'],
    ['--line','разделители, рамки покоя','#262E3D','#DBDEE5'],['--line-strong','рамки полей и кнопок','#303848','#CACED6'],
    ['--text','заголовки, значения','#EEF0F4','#0E1420'],['--text-2','основной текст','#C0C4CD','#384050'],['--text-3','подписи, вторичный','#9FA5B0','#596070'],['--text-4','кикеры-подписи, плейсхолдеры','#7D8391','#5E6776'],
    ['--accent','ссылки, кикеры, выбранное','#699FFF','#0244BE'],['--accent-hover','hover ссылки','#97BEFF','#1A5FE5'],['--accent-solid','кнопка primary (верх градиента)','#1A5FE5','#1A5FE5'],['--accent-solid-2','кнопка primary (низ градиента)','#0244BE','#0244BE'],
    ['--focus','кольцо фокуса','#97BEFF','#1A5FE5'],['--glow','свечение primary и выбранного','#3D7EFC · 35%','#3D7EFC · 28%'],
    ['--status-ok','успех','#63D18F','#006B35'],['--status-warn','внимание','#EEB154','#9A5B00'],['--status-err','ошибка','#F97770','#B8262A'],
    ['--tint','hover ссылок и кнопок-иконок','белый · 4%','ink · 5%'],['--ground','цвет под галактикой, шапка, футер','#090D18','#F5F7FB']
  ];
  var DARKV = {'--panel':'rgba(14,20,32,.82)','--glow':'rgba(61,126,252,.35)','--tint':'rgba(255,255,255,.04)'}, LIGHTV = {'--panel':'rgba(253,253,255,.86)','--glow':'rgba(61,126,252,.28)','--tint':'rgba(14,20,32,.05)'};
  var rolesEl = $('roles');
  ROLES.forEach(function(r){
    var dv = DARKV[r[0]] || r[2], lv = LIGHTV[r[0]] || r[3];
    var d = document.createElement('div'); d.className = 'role';
    d.innerHTML = '<span class="pair"><i style="background:' + dv + ';background-color:' + dv + '" title="тёмная"></i><i style="background:' + lv + '" title="светлая"></i></span><div><b>' + r[0] + '</b><span>' + r[1] + '</span><em>' + r[2] + ' · ' + r[3] + '</em></div>';
    if (r[0] === '--panel') d.querySelector('.pair').style.background = 'repeating-conic-gradient(#0E1420 0 25%, #F5F7FB 0 50%) 0 0/12px 12px';
    rolesEl.appendChild(d);
  });

  /* — иконки интерфейса — */
  var ICO = {
    search:'<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>', card:'<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h3"/>', mail:'<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3 7 9 6 9-6"/>',
    check:'<path d="m5 12.5 4.5 4.5L19 7"/>', close:'<path d="m6 6 12 12M18 6 6 18"/>', plus:'<path d="M12 5v14M5 12h14"/>', arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>', back:'<path d="M19 12H5M11 6l-6 6 6 6"/>', chevron:'<path d="m6 9 6 6 6-6"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>', warn:'<path d="M12 3 2.5 20h19L12 3Z"/><path d="M12 10v4M12 17h.01"/>', ok:'<circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/>', err:'<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
    copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/>', eye:'<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>', 'eye-off':'<path d="M3 3l18 18M10.5 10.6a2.5 2.5 0 0 0 3 3M6.7 6.8C4 8.4 2 12 2 12s3.5 6 10 6c1.5 0 2.8-.3 4-.8M9.5 4.3A10 10 0 0 1 12 4c6.5 0 10 8 10 8a15 15 0 0 1-2.4 3.4"/>',
    download:'<path d="M12 4v11M7 10l5 5 5-5M4 20h16"/>', external:'<path d="M14 4h6v6M20 4l-9 9M18 13v6H5V6h6"/>', menu:'<path d="M4 7h16M4 12h16M4 17h16"/>', user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>', sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>', moon:'<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5Z"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', qr:'<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h3v3M20 20h-3"/>', cart:'<path d="M4 6h16l-1.5 9h-13z"/><circle cx="9" cy="19" r="1.2"/><circle cx="16" cy="19" r="1.2"/>', logout:'<path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9"/>', grid:'<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/>', support:'<path d="M4 4h16v12H8l-4 4z"/>', shield:'<path d="M12 3 4 6v6c0 4.5 3.4 7.6 8 9 4.6-1.4 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/>', refresh:'<path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/>', filter:'<path d="M4 6h16M7 12h10M10 18h4"/>'
  };
  var ig = $('dsIcons');
  Object.keys(ICO).forEach(function(k){ var w = document.createElement('div'); w.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + ICO[k] + '</svg>' + k; ig.appendChild(w); });

  /* — иконки категорий, логотипы, чипы, плитки — */
  var ci = $('dsCatIcons');
  CAT.categories.forEach(function(c){ var w = document.createElement('div'); w.innerHTML = '<img alt="" src="' + c.icon + '">' + c.name + '<span style="font-family:var(--font-mono)">' + c.count + '</span>'; ci.appendChild(w); });
  var lg = $('dsLogos');
  ['ChatGPT Plus','Claude','Cursor AI','Figma','Netflix','Steam','Notion','ElevenLabs','Amazon','Spotify','Midjourney','Adobe'].forEach(function(n){
    var s = CAT.services.find(function(x){ return x.n === n; }); if (!s) return;
    var im = document.createElement('img'); im.alt = n; im.title = n; im.src = s.l; im.className = s.d ? 'on-dark' : '';
    im.style.cssText = 'width:38px;height:38px;border-radius:10px;padding:6px;object-fit:contain;background:' + (s.d ? 'var(--ink-800)' : '#fff') + ';box-shadow:0 0 0 1px rgba(14,20,32,.1)';
    lg.appendChild(im);
  });
  document.querySelectorAll('img[data-logo]').forEach(function(im){ var s = CAT.services.find(function(x){ return x.n === im.dataset.logo; }); if (!s) return; im.src = s.l; if (s.d) im.classList.add('on-dark'); });
  document.querySelectorAll('img[data-cat]').forEach(function(im){ var c = CAT.categories.find(function(x){ return x.id === im.dataset.cat; }); if (c) im.src = c.icon; });
  var cats = $('dsCats');
  [{ id:'all', name:'Все', icon:CAT.allIcon, count:CAT.services.length }].concat(CAT.categories).forEach(function(c, i){
    var b = document.createElement('button'); b.type = 'button'; b.className = 'cat'; b.setAttribute('aria-selected', i === 1 ? 'true':'false');
    b.innerHTML = '<img alt="" src="' + c.icon + '"><span>' + c.name + '</span><span class="n">' + c.count + '</span>';
    b.addEventListener('click', function(){ [].forEach.call(cats.children, function(o){ o.setAttribute('aria-selected', o === b ? 'true':'false'); }); });
    cats.appendChild(b);
  });
  var menu = $('dsMenuList');
  CAT.categories.forEach(function(c){ var li = document.createElement('li'); li.innerHTML = '<a href="#"><img alt="" src="' + c.icon + '">' + c.name + '<span class="n">' + c.count + '</span></a>'; menu.appendChild(li); });
  var li = document.createElement('li'); li.innerHTML = '<span class="sep"></span><a href="#">Все сервисы<span class="n">' + CAT.services.length + '</span></a>'; menu.appendChild(li);

  /* — таблица данных — */
  var rows = [['#48213','Cursor AI','Pro',2407,'ok','Карта выпущена'],['#48212','Netflix','Standard',1364,'info','В обработке'],['#48209','Steam','$50',5215,'warn','Ждём оплату'],['#48201','Figma','Professional',1926,'err','Отклонён банком'],['#48197','Виртуальная карта','$100',10028,'ok','Карта выпущена']];
  var tb = $('dsTable');
  rows.forEach(function(r){
    var s = CAT.services.find(function(x){ return x.n === r[1]; });
    var tr = document.createElement('tr');
    tr.innerHTML = '<td class="num">' + r[0] + '</td><td><span class="row-svc">' + (s ? '<img alt="" src="' + s.l + '"' + (s.d ? ' style="background:var(--ink-800)"' : '') + '>' : '') + '<b>' + r[1] + '</b></span></td><td>' + r[2] + '</td><td class="num">' + MC.rub(r[3]) + '</td><td><span class="badge badge-' + r[4] + '">' + r[5] + '</span></td><td style="text-align:end"><a class="arrow-link" href="#" style="font-size:13.5px">Открыть</a></td>';
    tb.appendChild(tr);
  });

  /* — тосты — */
  var stack = $('toasts');
  var ICONS = { ok:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/></svg>', err:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/></svg>', info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>' };
  var TEXT = { ok:['Реквизиты отправлены','Письмо ушло на ivan@example.ru.'], err:['Не удалось отправить письмо','Проверьте адрес и попробуйте ещё раз.'], info:['Курс обновлён','80,2254 ₽ за доллар по ЦБ на сегодня.'] };
  function toast(kind, t1, t2){
    var t = document.createElement('div'); t.className = 'toast toast-' + kind;
    t.innerHTML = ICONS[kind] + '<div><b>' + (t1 || TEXT[kind][0]) + '</b>' + (t2 || TEXT[kind][1]) + '</div><button type="button" class="x" aria-label="Закрыть">✕</button>';
    t.querySelector('.x').addEventListener('click', function(){ t.remove(); });
    stack.appendChild(t);
    if (kind !== 'err') setTimeout(function(){ t.remove(); }, 5000);
  }
  document.querySelectorAll('[data-toast]').forEach(function(b){ b.addEventListener('click', function(){ toast(b.dataset.toast); }); });
  function copy(v, name){ try { navigator.clipboard.writeText(v).then(function(){ toast('info', 'Скопировано', name + ' · ' + v); }); } catch (e) {} }

  /* — интерактив в превью — */
  var ind = $('ind'); if (ind) ind.indeterminate = true;
  document.querySelectorAll('.input-btn[aria-label^="Показать"]').forEach(function(b){ b.addEventListener('click', function(){ var i = b.parentNode.querySelector('input'); var show = i.type === 'password'; i.type = show ? 'text' : 'password'; b.setAttribute('aria-pressed', show ? 'true' : 'false'); b.setAttribute('aria-label', show ? 'Скрыть пароль' : 'Показать пароль'); }); });
  document.querySelectorAll('.tabs').forEach(function(t){ t.querySelectorAll('[role="tab"]').forEach(function(tab){ tab.addEventListener('click', function(){ t.querySelectorAll('[role="tab"]').forEach(function(o){ o.setAttribute('aria-selected', o === tab ? 'true' : 'false'); }); }); }); });
  document.querySelectorAll('.switch').forEach(function(s){ s.querySelectorAll('button').forEach(function(b){ b.addEventListener('click', function(){ s.querySelectorAll('button').forEach(function(o){ o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); }); }); }); });
  ['.denoms .denom', '.plans .plan', '.methods .method'].forEach(function(sel){
    document.querySelectorAll(sel).forEach(function(b){ b.addEventListener('click', function(){ if (b.getAttribute('aria-disabled') === 'true') return; b.parentNode.querySelectorAll(sel.split(' ')[1]).forEach(function(o){ o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); }); }); });
  });
  document.querySelectorAll('button.tile[aria-pressed]').forEach(function(b){ b.addEventListener('click', function(){ b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); }); });
  document.querySelectorAll('.ds-demo a[href="#"]').forEach(function(a){ a.addEventListener('click', function(e){ e.preventDefault(); }); });

  /* — навигация документа — */
  var side = $('dsSide'), mb = $('dsMenu');
  mb.addEventListener('click', function(){ var open = side.classList.toggle('is-open'); mb.setAttribute('aria-expanded', open ? 'true' : 'false'); });
  side.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ side.classList.remove('is-open'); mb.setAttribute('aria-expanded', 'false'); }); });
  var links = [].slice.call(document.querySelectorAll('.ds-nav a'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if (e.isIntersecting) links.forEach(function(a){ a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id); }); });
    }, { rootMargin: '-15% 0px -75% 0px' });
    document.querySelectorAll('.ds-section').forEach(function(s){ io.observe(s); });
  }
})();
