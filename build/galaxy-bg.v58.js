/* galaxy-bg v58 — та же сцена, что v57, но:
   1) статичные слои (подложка, дымка, звёзды, пыль, джеты, дорожки) рендерятся один раз в offscreen-canvas;
      пыль — 9 пакетных групп, вращаются через ctx.rotate();
   2) кольцо / вихрь / ядро рисуются пакетно: один fill() на группу цвета вместо fill() на частицу;
   3) 30 fps, буфер canvas в масштабе 0.8 (десктоп) и DPR 1, пауза при потере фокуса/скрытии вкладки,
      один статичный кадр при prefers-reduced-motion. */
window.__galaxyNew = function (canvas) {
  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
  if (!ctx) return { start(){}, stop(){} };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.innerWidth < 768;
  const RENDER_SCALE = mobile ? Math.min(2, window.devicePixelRatio || 1) : 0.8;   // на мобильном буфер под retina (до 2×): частицы мелкие, растяжение 1× заметно как «мыло»   // буфер меньше CSS-размера: туманность мягкая, разницы не видно
  const FPS = 30;
  const ELEMENT_BOOST = 1.4;
  const BG = '#090d18';

  const cfg = {
    stars: mobile ? 168 : 500, brightStars: mobile ? 17 : 52,
    farDust: mobile ? 336 : 1100, ringParticles: mobile ? 1875 : 9000,
    coreParticles: mobile ? 140 : 280, jetParticles: mobile ? 770 : 2600,
    hazeParticles: mobile ? 77 : 220,
    // положение ядра в долях вьюпорта; переопределяется data-cx-factor / data-cy-factor на canvas
    cxFactor: +canvas.dataset.cxFactor || 0.60,
    cyFactor: +canvas.dataset.cyFactor || (mobile ? 0.38 : 0.342),
    scale: mobile ? 3.96 : 3.825, spin: mobile ? 0.00092 : 0.00112
  };
  const rand = (a, b) => Math.random() * (b - a) + a;
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  let width = 0, height = 0, cx = 0, cy = 0, base = 40, diskA = 180, rotation = 0, dotK = 1;
  let stars = [], bright = [], dustGroups = [], ringGroups = [], vortexGroups = [], coreGroups = [];
  let companions = [], clusters = [];
  let staticLayer = null;      // подложка + дымка + дорожки + джеты + тусклые звёзды
  let running = false, raf = 0, last = 0, hidden = false, focused = true;
  const stats = { frames: 0, ms: 0 };

  function layer(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0); return c; }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.round(rect.width); height = Math.round(rect.height);
    canvas.width = Math.round(width * RENDER_SCALE); canvas.height = Math.round(height * RENDER_SCALE);
    ctx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
    build();
  }

  function build() {
    // доли вьюпорта + пиксельный сдвиг data-dx / data-dy
    cx = width * cfg.cxFactor + (+canvas.dataset.dx || 0); cy = height * cfg.cyFactor + (+canvas.dataset.dy || 0);
    const sizeK = +canvas.dataset.size || 1;   // data-size — множитель размера галактики
    dotK = +canvas.dataset.dot || (mobile ? Math.min(1, Math.max(0.4, sizeK * 0.8)) : 1);   // размер частиц следует за масштабом: отдалили — стали мельче
    base = Math.min(width, height) * 0.052 * cfg.scale * sizeK;
    diskA = Math.min(width, height) * 0.155 * cfg.scale * (mobile ? 1.55 : 1.82) * sizeK;

    /* — звёзды: тусклые в статику, яркие (с мерцанием) живые — */
    stars = []; bright = [];
    for (let i = 0; i < cfg.stars; i++) stars.push({ x: rand(0, width), y: rand(0, height), r: rand(0.35, 1.35), a: rand(0.10, 0.42) });
    for (let i = 0; i < cfg.brightStars; i++) bright.push({ x: rand(0, width), y: rand(0, height), r: rand(1.1, 2.2), a: rand(0.26, 0.68) });

    /* — пыль: 3 группы по скорости × 3 цвета, один fill на группу (в v57 — 1100 fill) — */
    const dg = new Map();
    for (let i = 0; i < cfg.farDust; i++) {
      const radius = rand(diskA * 0.72, diskA * 1.42), angle = rand(0, Math.PI * 2), flatten = rand(0.20, 0.36);
      const hue = pick([[212,230,255],[226,214,255],[255,228,204]]);
      const speed = pick([0.22, 0.31, 0.40]);
      const k = hue.join() + '|' + speed;
      if (!dg.has(k)) dg.set(k, { rgb: hue, speed, alpha: 0, n: 0, phase: rand(0, 6.28), pts: [] });
      const g = dg.get(k);
      g.alpha += mobile ? rand(0.024, 0.095) : rand(0.018, 0.080); g.n++;
      g.pts.push(Math.cos(angle) * radius, Math.sin(angle) * radius * flatten, rand(0.28, 0.95) * dotK);
    }
    dustGroups = [...dg.values()].map(g => ({ ...g, alpha: g.alpha / g.n, pts: Float32Array.from(g.pts) }));

    /* — кольцо: группы по цвету × размеру; один путь и один fill на группу — */
    const clusterAngles = [0.22, 2.28, 4.65];
    const groups = new Map();
    const key = (rgb, big, halo) => rgb.join() + '|' + big + '|' + halo;
    for (let i = 0; i < cfg.ringParticles; i++) {
      const u = Math.random();
      const band = u < 0.34 ? 0.44 : (u < 0.72 ? 0.61 : (u < 0.93 ? 0.79 : 0.98));
      const spread = u < 0.34 ? 0.030 : (u < 0.72 ? 0.028 : (u < 0.93 ? 0.026 : 0.024));
      const orbit = diskA * band + rand(-diskA * spread, diskA * spread);
      const clustered = Math.random() < 0.23;
      const anchor = clustered ? pick(clusterAngles) : rand(0, Math.PI * 2);
      const angle = clustered ? anchor + rand(-0.18, 0.18) : anchor;
      let rgb;
      if (angle < 2.05) rgb = pick([[214,236,255],[205,232,255],[235,220,255]]);
      else if (angle < 4.15) rgb = pick([[255,230,204],[244,220,255],[255,236,216]]);
      else rgb = pick([[224,210,255],[210,228,255],[255,232,210]]);
      const focus = 1 - Math.abs(band - 0.63);
      const big = focus > 0.8;
      const halo = Math.random() < (mobile ? 0.24 : 0.20);
      const k = key(rgb, big, halo);
      if (!groups.has(k)) groups.set(k, { rgb, alpha: 0, n: 0, halo, phase: rand(0, 6.28), pts: [] });
      const g = groups.get(k);
      const alpha = Math.min(1, (big ? (mobile ? rand(0.34, 0.82) : rand(0.21, 0.60)) : (mobile ? rand(0.22, 0.56) : rand(0.13, 0.38))) * ELEMENT_BOOST);
      g.alpha += alpha; g.n++;
      g.pts.push(orbit, angle, (big ? (mobile ? rand(0.52, 1.26) : rand(0.38, 1.06)) : (mobile ? rand(0.40, 0.96) : rand(0.30, 0.80))) * dotK,
                 mobile ? rand(0.10, 0.17) : rand(0.11, 0.21), rand(0.88, 1.34), rand(-0.014, 0.014));
    }
    ringGroups = [...groups.values()].map(g => ({ ...g, alpha: g.alpha / g.n, pts: Float32Array.from(g.pts) }));

    /* — вихрь в ядре: 3 цветовые группы — */
    const vg = new Map();
    for (let i = 0; i < (mobile ? 280 : 640); i++) {
      const arm = i % 3, t = Math.pow(Math.random(), 0.64);
      const radius = base * (mobile ? 1.34 : 1.15) * (mobile ? (0.072 + t * 0.78) : (0.06 + t * 0.70));
      const angle = (Math.PI * 2 / 3) * arm + t * 6.4 + rand(-0.12, 0.12);
      const rgb = t < 0.16 ? pick([[255,255,255],[248,252,255],[238,246,255]]) : (t < 0.46 ? pick([[176,226,255],[160,216,255],[144,206,255]]) : pick([[96,176,246],[84,164,238],[72,152,228]]));
      const k = rgb.join();
      if (!vg.has(k)) vg.set(k, { rgb, alpha: 0, n: 0, pts: [] });
      const g = vg.get(k);
      g.alpha += Math.min(1, (t < 0.18 ? rand(0.52, 0.96) : (t < 0.46 ? rand(0.28, 0.68) : rand(0.10, 0.30))) * ELEMENT_BOOST); g.n++;
      g.pts.push(radius, angle, radius * (mobile ? 0.28 : 0.34), (mobile ? (t < 0.18 ? rand(0.92, 1.72) : rand(0.34, 1.02)) : (t < 0.18 ? rand(0.68, 1.38) : rand(0.26, 0.82))) * dotK, rand(0.78, 1.18), rand(0.40, 0.60));
    }
    vortexGroups = [...vg.values()].map(g => ({ ...g, alpha: Math.min(1, g.alpha / g.n * ELEMENT_BOOST), pts: Float32Array.from(g.pts) }));

    /* — ядро — */
    const cg = new Map();
    for (let i = 0; i < cfg.coreParticles; i++) {
      const rgb = pick([[255,255,255],[246,250,255],[228,242,255],[184,224,255]]), k = rgb.join();
      if (!cg.has(k)) cg.set(k, { rgb, alpha: 0, n: 0, pts: [] });
      const g = cg.get(k); g.alpha += Math.min(1, rand(0.14, 0.34) * ELEMENT_BOOST); g.n++;
      g.pts.push(rand(0, base * (mobile ? 0.305 : 0.253)), rand(0, Math.PI * 2), (mobile ? rand(0.40, 0.98) : rand(0.26, 0.74)) * dotK, rand(1.0, 1.4));
    }
    coreGroups = [...cg.values()].map(g => ({ ...g, alpha: g.alpha / g.n, pts: Float32Array.from(g.pts) }));

    companions = [
      { x: diskA * 0.96, y: -diskA * 0.08, r: 8, rgb: '162,113,255', alpha: mobile ? 0.13 : 0.098 },
      { x: -diskA * 0.88, y: diskA * 0.18, r: 7, rgb: '110,188,255', alpha: mobile ? 0.11 : 0.084 },
      { x: diskA * 0.48, y: diskA * 0.42, r: 7, rgb: '255,194,120', alpha: mobile ? 0.10 : 0.077 }
    ];
    clusters = [
      { orbit: diskA * 0.57, yScale: 0.17, angularVel: 0.18, phase: Math.PI * 0.88, radius: base * (mobile ? 0.118 : 0.088), colors: [[150,228,255],[196,244,255],[224,248,255]], glow: '120,205,255' },
      { orbit: diskA * 0.82, yScale: 0.16, angularVel: -0.16, phase: Math.PI * 0.12, radius: base * (mobile ? 0.126 : 0.094), colors: [[255,226,148],[255,239,190],[255,247,216]], glow: '255,213,112' }
    ];

    buildStatic();
    canvas.dataset.cx = String(cx); canvas.dataset.cy = String(cy);
  }

  /* всё, что в v57 не двигалось заметнее чем на доли пикселя, — в один слой */
  function buildStatic() {
    staticLayer = layer(width * RENDER_SCALE, height * RENDER_SCALE);
    const s = staticLayer.getContext('2d');
    s.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
    s.fillStyle = BG; s.fillRect(0, 0, width, height);

    // тусклые звёзды (мерцание ±26% на альфе 0.1–0.4 неразличимо — фиксируем среднее)
    for (const st of stars) { s.fillStyle = `rgba(255,255,255,${st.a * 0.87})`; s.beginPath(); s.arc(st.x, st.y, st.r, 0, Math.PI * 2); s.fill(); }

    s.save(); s.translate(cx, cy);
    // подложка
    const rx = diskA * 1.58, ry = rx * 0.84;
    let g = s.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, mobile ? 'rgba(8,12,24,0.97)' : 'rgba(10,14,28,0.92)');
    g.addColorStop(0.20, mobile ? 'rgba(14,18,34,0.84)' : 'rgba(18,22,40,0.78)');
    g.addColorStop(0.48, mobile ? 'rgba(24,30,54,0.56)' : 'rgba(26,32,58,0.48)');
    g.addColorStop(0.76, mobile ? 'rgba(48,60,104,0.20)' : 'rgba(52,64,108,0.18)');
    g.addColorStop(1, 'rgba(54,66,112,0)');
    s.fillStyle = g; s.beginPath(); s.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); s.fill();
    g = s.createLinearGradient(0, -ry * 0.24, 0, ry * 0.24);
    g.addColorStop(0, 'rgba(10,14,26,0)'); g.addColorStop(0.5, mobile ? 'rgba(10,14,26,0.34)' : 'rgba(10,14,26,0.28)'); g.addColorStop(1, 'rgba(10,14,26,0)');
    s.fillStyle = g; s.beginPath(); s.ellipse(0, 0, rx * 0.90, ry * 0.26, 0, 0, Math.PI * 2); s.fill();
    g = s.createRadialGradient(0, 0, rx * 0.18, 0, 0, rx * 1.08);
    g.addColorStop(0, 'rgba(6,10,20,0)'); g.addColorStop(0.46, mobile ? 'rgba(10,14,28,0.22)' : 'rgba(10,14,28,0.16)');
    g.addColorStop(0.78, mobile ? 'rgba(8,12,24,0.32)' : 'rgba(8,12,24,0.24)'); g.addColorStop(1, 'rgba(8,12,24,0)');
    s.fillStyle = g; s.beginPath(); s.ellipse(0, 0, rx * 1.06, ry * 0.96, 0, 0, Math.PI * 2); s.fill();

    // дымка (в v57 крутилась на ~0.02 рад/с при альфе 0.005 — статична для глаза)
    for (let i = 0; i < cfg.hazeParticles; i++) {
      const r = rand(base * 1.3, diskA * 1.05), a = rand(0, Math.PI * 2);
      const x = Math.cos(a) * r, y = Math.sin(a) * r * rand(0.18, 0.36), size = rand(18, 42) * dotK;
      const hue = pick(['18,24,42', '26,34,58', '44,48,86']);
      const hg = s.createRadialGradient(x, y, 0, x, y, size);
      hg.addColorStop(0, `rgba(${hue},${mobile ? rand(0.0028, 0.0075) : rand(0.0020, 0.0058)})`); hg.addColorStop(1, `rgba(${hue},0)`);
      s.fillStyle = hg; s.beginPath(); s.arc(x, y, size, 0, Math.PI * 2); s.fill();
    }

    // дорожки диска
    s.strokeStyle = 'rgba(224,214,255,0.045)'; s.lineWidth = mobile ? 1.0 : 1.2;
    for (const f of [0.52, 0.72, 0.92]) { s.beginPath(); s.ellipse(0, 0, diskA * f, diskA * f * 0.18, 0, 0, Math.PI * 2); s.stroke(); }

    // джеты (в v57 качались на ±0.08 px и мерцали на ±6% — статичны для глаза), пакетно по цвету
    const jets = new Map();
    for (let i = 0; i < cfg.jetParticles; i++) {
      const side = i % 2 === 0 ? -1 : 1, t = Math.pow(Math.random(), 0.46);
      const dist = base * (0.14 + t * 7.3), spread = base * (0.018 + t * 0.095);
      let x = rand(-spread, spread) * (0.55 + t * 0.9); const hole = base * 0.010;
      if (Math.abs(x) < hole) x = (Math.random() < 0.5 ? -1 : 1) * rand(hole, hole * 1.9);
      const rgb = t < 0.30 ? [255,252,255] : (t < 0.66 ? [238,228,255] : [214,238,255]);
      const alpha = (1 - t * 0.70) * rand(0.18, 0.62);
      const k = rgb.join() + '|' + (alpha > 0.4 ? 'h' : alpha > 0.2 ? 'm' : 'l');
      if (!jets.has(k)) jets.set(k, { rgb, alpha: 0, n: 0, pts: [] });
      const jg = jets.get(k); jg.alpha += alpha; jg.n++; jg.pts.push(x, side * dist, (t < 0.18 ? rand(0.70, 1.72) : rand(0.36, 0.96)) * dotK);
    }
    for (const jg of jets.values()) {
      const a = jg.alpha / jg.n;
      s.fillStyle = rgba(jg.rgb, a); s.beginPath();
      for (let i = 0; i < jg.pts.length; i += 3) { s.moveTo(jg.pts[i] + jg.pts[i + 2], jg.pts[i + 1]); s.arc(jg.pts[i], jg.pts[i + 1], jg.pts[i + 2], 0, Math.PI * 2); }
      s.fill();
      if (a > 0.18) {
        s.fillStyle = rgba(jg.rgb, a * 0.028); s.beginPath();
        for (let i = 0; i < jg.pts.length; i += 3) { s.moveTo(jg.pts[i] + jg.pts[i + 2] * 2.35, jg.pts[i + 1]); s.arc(jg.pts[i], jg.pts[i + 1], jg.pts[i + 2] * 2.35, 0, Math.PI * 2); }
        s.fill();
      }
    }
    s.restore();
  }

  function frame(time) {
    const t0 = performance.now();
    ctx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
    ctx.drawImage(staticLayer, 0, 0, width, height);

    // яркие звёзды с мерцанием — 52 дуги
    for (const st of bright) {
      const a = st.a * (0.74 + Math.sin(time * 0.0012 + st.x * 0.02 + st.y * 0.01) * 0.26);
      ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(200,220,255,${a * 0.09})`; ctx.beginPath(); ctx.arc(st.x, st.y, st.r * 3, 0, Math.PI * 2); ctx.fill();
    }

    ctx.save(); ctx.translate(cx, cy);

    // пыль — жёсткое вращение группы через ctx.rotate (та же математика, что x0·cos − y0·sin в v57)
    for (const g of dustGroups) {
      const tw = 0.84 + Math.sin(time * 0.0012 + g.phase) * 0.16, p = g.pts;
      ctx.save(); ctx.rotate(rotation * g.speed);
      ctx.fillStyle = rgba(g.rgb, g.alpha * tw); ctx.beginPath();
      for (let i = 0; i < p.length; i += 3) { const r = p[i + 2] * tw; ctx.moveTo(p[i] + r, p[i + 1]); ctx.arc(p[i], p[i + 1], r, 0, Math.PI * 2); }
      ctx.fill(); ctx.restore();
    }

    // кольцо — один fill на группу
    for (const g of ringGroups) {
      const flick = 0.90 + Math.sin(time * 0.0018 + g.phase) * 0.10;
      const p = g.pts;
      ctx.fillStyle = rgba(g.rgb, ((g.alpha * flick * 100) | 0) / 100);
      ctx.beginPath();
      for (let i = 0; i < p.length; i += 6) {
        const a = p[i + 1] + rotation * p[i + 4];
        const x = Math.cos(a) * p[i], y = Math.sin(a) * p[i] * p[i + 3] + Math.cos(a * 2.2 + time * 0.0004) * p[i + 5];
        const r = p[i + 2] * flick;
        ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2);
      }
      ctx.fill();
      if (g.halo && g.alpha * flick > 0.16) {
        ctx.fillStyle = rgba(g.rgb, ((g.alpha * flick * 0.08 * 100) | 0) / 100);
        ctx.beginPath();
        for (let i = 0; i < p.length; i += 6) {
          const a = p[i + 1] + rotation * p[i + 4];
          const x = Math.cos(a) * p[i], y = Math.sin(a) * p[i] * p[i + 3], r = p[i + 2] * 2.8;
          ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2);
        }
        ctx.fill();
      }
    }

    // вихрь
    const vortexSpin = rotation * 2.35;
    for (const g of vortexGroups) {
      const tw = 0.90 + Math.sin(time * 0.0032) * 0.10, p = g.pts;
      ctx.fillStyle = rgba(g.rgb, Math.min(1, g.alpha * tw));
      ctx.beginPath();
      for (let i = 0; i < p.length; i += 6) {
        const a = p[i + 1] + vortexSpin * p[i + 4];
        const spiralR = Math.max(0, p[i] - ((a % (Math.PI * 2)) / (Math.PI * 2)) * p[i + 2] * 0.18);
        const x = Math.cos(a) * spiralR, y = Math.sin(a) * spiralR * p[i + 5], r = p[i + 3] * tw;
        ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2);
      }
      ctx.fill();
    }

    // ядро
    for (const g of coreGroups) {
      const tw = 0.94 + Math.sin(time * 0.003) * 0.06, p = g.pts;
      ctx.fillStyle = rgba(g.rgb, Math.min(1, g.alpha * tw * ELEMENT_BOOST));
      ctx.beginPath();
      for (let i = 0; i < p.length; i += 4) {
        const a = p[i + 1] + rotation * p[i + 3];
        const x = Math.cos(a) * p[i], y = Math.sin(a) * p[i] * 0.24, r = p[i + 2] * tw;
        ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2);
      }
      ctx.fill();
    }
    ctx.restore();

    // нуклеус
    const nb = mobile ? base * 1.177 : base;
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, nb * 0.391);
    core.addColorStop(0, 'rgba(255,255,255,0.98)'); core.addColorStop(0.10, 'rgba(248,252,255,1)');
    core.addColorStop(0.22, 'rgba(214,236,255,0.62)'); core.addColorStop(0.40, 'rgba(110,186,250,0.30)'); core.addColorStop(1, 'rgba(110,186,250,0)');
    ctx.fillStyle = core; ctx.beginPath(); ctx.arc(cx, cy, nb * 0.40, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.98)'; ctx.beginPath(); ctx.arc(cx, cy, nb * 0.12, 0, Math.PI * 2); ctx.fill();

    // спиральный акцент (3 штриха; shadowBlur убран — его вклад при alpha .3 на 2px линии не читается)
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rotation * 1.55); ctx.lineCap = 'round';
    for (const [scale, alpha, w, phase] of [[1.0, 0.30, mobile ? 1.8 : 2.2, 0], [0.82, 0.22, mobile ? 1.2 : 1.5, 0.55], [0.64, 0.16, mobile ? 0.9 : 1.1, 1.05]]) {
      ctx.beginPath();
      for (let i = 0; i <= 72; i++) {
        const t = i / 72, a = phase + t * Math.PI * 2 * 1.05, r = base * scale * (0.10 + t * 0.42);
        const x = Math.cos(a) * r, y = Math.sin(a) * r * 0.58;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(150,208,255,${alpha})`; ctx.lineWidth = w; ctx.stroke();
    }
    ctx.restore();

    // спутники
    for (const c of companions) {
      const pulse = 0.84 + Math.sin(time * 0.0018 + c.x * 0.01) * 0.16;
      const g = ctx.createRadialGradient(cx + c.x, cy + c.y, 0, cx + c.x, cy + c.y, c.r * 2.8);
      g.addColorStop(0, `rgba(${c.rgb},${Math.min(1, c.alpha * pulse * ELEMENT_BOOST)})`); g.addColorStop(1, `rgba(${c.rgb},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx + c.x, cy + c.y, c.r * 2.8, 0, Math.PI * 2); ctx.fill();
    }

    // орбитальные сгустки
    ctx.save(); ctx.translate(cx, cy); ctx.globalCompositeOperation = 'screen';
    for (const o of clusters) {
      const angle = o.phase + time * 0.001 * o.angularVel;
      const x = Math.cos(angle) * o.orbit, y = Math.sin(angle) * o.orbit * o.yScale;
      const pulse = 0.97 + Math.sin(time * 0.0024 + o.phase * 7) * 0.03;
      let g = ctx.createRadialGradient(x, y, 0, x, y, o.radius * 1.55);
      g.addColorStop(0, `rgba(${o.glow},0.14)`); g.addColorStop(0.36, `rgba(${o.glow},0.040)`); g.addColorStop(1, `rgba(${o.glow},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, o.radius * 1.55, 0, Math.PI * 2); ctx.fill();
      g = ctx.createRadialGradient(x, y, 0, x, y, o.radius * 0.56 * pulse);
      g.addColorStop(0, 'rgba(255,255,255,0.98)'); g.addColorStop(0.12, rgba(o.colors[0], 1)); g.addColorStop(0.32, rgba(o.colors[1], 0.48)); g.addColorStop(1, `rgba(${o.glow},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, o.radius * 0.56 * pulse, 0, Math.PI * 2); ctx.fill();
      g = ctx.createRadialGradient(x - o.radius * 0.03, y - o.radius * 0.04, 0, x, y, o.radius * 0.24);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.52, rgba(o.colors[2], 0.82)); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, o.radius * 0.24, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    stats.frames++; stats.ms += performance.now() - t0;
  }

  function tick(time) {
    if (!running) return;
    raf = requestAnimationFrame(tick);
    if (hidden || !focused) return;
    if (time - last < 1000 / FPS - 1) return;
    last = time;
    frame(time);
    if (!reduceMotion) rotation += cfg.spin * (60 / FPS);   // та же угловая скорость, что при 60 fps
  }

  const onVis = () => { hidden = document.hidden; };
  const onBlur = () => { focused = false; };
  const onFocus = () => { focused = true; };
  let lastW = 0, rt = null;
  const onResize = () => { if (Math.abs(window.innerWidth - lastW) < 5) return; clearTimeout(rt); rt = setTimeout(() => { lastW = window.innerWidth; resize(); }, 250); };

  return {
    stats,
    start() {
      if (running) return;
      running = true; hidden = document.hidden; lastW = window.innerWidth;
      document.addEventListener('visibilitychange', onVis); window.addEventListener('blur', onBlur); window.addEventListener('focus', onFocus);
      window.addEventListener('resize', onResize, { passive: true });
      resize();
      if (reduceMotion) { frame(0); return; }
      raf = requestAnimationFrame(tick);
    },
    stop() {
      running = false; cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVis); window.removeEventListener('blur', onBlur); window.removeEventListener('focus', onFocus);
      window.removeEventListener('resize', onResize);
    }
  };
};

/* автозапуск как в v57: находит или создаёт #starfield. Отключается window.__galaxyNoAuto = true до подключения скрипта. */
(function () {
  if (window.__galaxyNoAuto || !document.body) return;
  let c = document.getElementById('starfield');
  if (!c) { c = document.createElement('canvas'); c.id = 'starfield'; c.setAttribute('aria-hidden', 'true'); document.body.insertAdjacentElement('afterbegin', c); }
  document.body.classList.add('has-galaxy-bg');
  const g = window.__galaxy = window.__galaxyNew(c);
  const boot = () => requestAnimationFrame(() => g.start());
  if (document.readyState === 'complete') boot(); else window.addEventListener('load', boot, { once: true });
})();
