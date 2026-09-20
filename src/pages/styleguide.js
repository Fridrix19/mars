(function(){
  var MC = window.MC, $ = MC.$;
  var root = document.documentElement;

  /* — образцы цвета — */
  var INK = [['ink-950','#090D18','земля, галактика'],['ink-900','#0E1420','панели'],['ink-850','#171E2C','плитки, поля'],['ink-800','#222A3A','hover, тёмная подложка лого'],['ink-700','#384050','текст-2 светлой'],['ink-600','#596070','рамка hover, текст-3 светлой'],['ink-500','#7D8391','текст-4 тёмной'],['ink-400','#9FA5B0','текст-3 тёмной'],['ink-300','#C0C4CD','текст-2 тёмной'],['ink-200','#DBDEE5','—'],['ink-100','#EEF0F4','заголовки тёмной']];
  var BLUE = [['blue-700','#0244BE','низ градиента, акцент светлой'],['blue-600','#1A5FE5','верх градиента кнопки'],['blue-500','#3D7EFC','выбранное, фокус поля'],['blue-400','#699FFF','ссылки тёмной'],['blue-300','#97BEFF','hover ссылки, фокус'],['blue-200','#C2D8FF','—']];
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

  /* — роли: читаем текущие значения токенов, чтобы карточки менялись с темой — */
  var ROLES = [['--bg','фон страницы'],['--panel-solid','панель, расчёт, тост'],['--surface','плитки, поля, чипы'],['--surface-2','hover плитки'],['--line','разделители, рамки'],['--line-strong','рамки полей и кнопок'],['--text','заголовки, значения'],['--text-2','основной текст'],['--text-3','подписи, вторичный'],['--text-4','кикеры-подписи, плейсхолдеры'],['--accent','ссылки, кикеры, выбранное'],['--accent-solid','кнопка primary (верх)'],['--focus','кольцо фокуса'],['--status-ok','успех'],['--status-warn','внимание'],['--status-err','ошибка']];
  function renderRoles(){
    var el = $('roles'); el.innerHTML = '';
    var cs = getComputedStyle(root);
    ROLES.forEach(function(r){
      var v = cs.getPropertyValue(r[0]).trim();
      var probe = document.createElement('span'); probe.style.color = v; document.body.appendChild(probe);
      var rgb = getComputedStyle(probe).color; probe.remove();
      var hex = rgb.startsWith('rgb') ? '#' + rgb.match(/\d+/g).slice(0,3).map(function(n){ return (+n).toString(16).padStart(2,'0'); }).join('').toUpperCase() : v;
      var d = document.createElement('div'); d.className = 'role';
      d.innerHTML = '<i style="background:' + v + '"></i><div><b>' + r[0] + '</b><span>' + r[1] + '</span><em>' + hex + (v.indexOf('var(') === 0 ? ' · ' + v : '') + '</em></div>';
      el.appendChild(d);
    });
  }
  renderRoles();
  new MutationObserver(renderRoles).observe(root, { attributes: true, attributeFilter: ['data-mc-theme'] });

  /* — чипы категорий и иконки из каталога — */
  var cats = $('sgCats');
  [{ id:'all', name:'Все', icon:MC.CATALOG.allIcon, count:MC.CATALOG.services.length }].concat(MC.CATALOG.categories).forEach(function(c, i){
    var b = document.createElement('button'); b.type = 'button'; b.className = 'cat'; b.setAttribute('aria-selected', i === 1 ? 'true':'false');
    b.innerHTML = '<img alt="" src="' + c.icon + '"><span>' + c.name + '</span><span class="n">' + c.count + '</span>';
    b.addEventListener('click', function(){ [].forEach.call(cats.children, function(o){ o.setAttribute('aria-selected', o === b ? 'true':'false'); }); });
    cats.appendChild(b);
  });
  var ci = $('sgCatIcons');
  MC.CATALOG.categories.forEach(function(c){ var w = document.createElement('div'); w.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:6px;font-size:11.5px;color:var(--text-4)'; w.innerHTML = '<img alt="" src="' + c.icon + '" style="width:32px;height:32px">' + c.name; ci.appendChild(w); });
  var lg = $('sgLogos');
  ['ChatGPT Plus','Claude','Cursor AI','Figma','Netflix','Steam','Notion','ElevenLabs','Amazon','Spotify'].forEach(function(n){
    var s = MC.CATALOG.services.find(function(x){ return x.n === n; }); if (!s) return;
    var im = document.createElement('img'); im.alt = n; im.title = n; im.src = s.l; im.className = s.d ? 'on-dark' : '';
    im.style.cssText = 'width:38px;height:38px;border-radius:10px;padding:6px;object-fit:contain;background:' + (s.d ? 'var(--ink-800)' : '#fff') + ';box-shadow:0 0 0 1px rgba(14,20,32,.1)';
    lg.appendChild(im);
  });

  /* — таблица данных: примерные строки — */
  var rows = [['#48213','Cursor AI','Pro',2407,'ok','Карта выпущена'],['#48212','Netflix','Standard',1364,'info','В обработке'],['#48209','Steam','$50',5215,'warn','Ждём оплату'],['#48201','Figma','Professional',1926,'err','Отклонён банком'],['#48197','Виртуальная карта','$100',10028,'ok','Карта выпущена']];
  var tb = $('sgTable');
  rows.forEach(function(r){
    var s = MC.CATALOG.services.find(function(x){ return x.n === r[1]; });
    var tr = document.createElement('tr');
    tr.innerHTML = '<td class="num">' + r[0] + '</td><td><span class="row-svc">' + (s ? '<img alt="" src="' + s.l + '"' + (s.d ? ' style="background:var(--ink-800)"' : '') + '>' : '') + '<b>' + r[1] + '</b></span></td><td>' + r[2] + '</td><td class="num">' + MC.rub(r[3]) + '</td><td><span class="badge badge-' + r[4] + '">' + r[5] + '</span></td>';
    tb.appendChild(tr);
  });

  /* — тосты — */
  var stack = $('toasts');
  var ICONS = { ok:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/></svg>', err:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/></svg>', info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>' };
  var TEXT = { ok:['Реквизиты отправлены','Письмо ушло на ivan@example.ru.'], err:['Не удалось отправить письмо','Проверьте адрес и попробуйте ещё раз.'], info:['Курс обновлён','80,2254 ₽ за доллар по ЦБ на сегодня.'] };
  function toast(kind){
    var t = document.createElement('div'); t.className = 'toast toast-' + kind;
    t.innerHTML = ICONS[kind] + '<div><b>' + TEXT[kind][0] + '</b>' + TEXT[kind][1] + '</div><button type="button" class="x" aria-label="Закрыть">✕</button>';
    t.querySelector('.x').addEventListener('click', function(){ t.remove(); });
    stack.appendChild(t);
    if (kind !== 'err') setTimeout(function(){ t.remove(); }, 5000);
  }
  document.querySelectorAll('[data-toast]').forEach(function(b){ b.addEventListener('click', function(){ toast(b.dataset.toast); }); });
  function copy(v, name){
    try { navigator.clipboard.writeText(v).then(function(){ TEXT.info = ['Скопировано', name + ' · ' + v]; toast('info'); }); } catch (e) {}
  }

  /* — подсветка активного раздела в навигации — */
  var links = [].slice.call(document.querySelectorAll('.sg-nav a'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if (e.isIntersecting) links.forEach(function(a){ a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id); }); });
    }, { rootMargin: '-20% 0px -70% 0px' });
    document.querySelectorAll('.sg-section').forEach(function(s){ io.observe(s); });
  }

  MC.initReveal();
})();
