(() => {
  const body = document.body;
  if (!body) return;
  body.classList.add('has-galaxy-bg');
  if (!document.getElementById('starfield')) {
    const canvas = document.createElement('canvas');
    canvas.id = 'starfield';
    canvas.setAttribute('aria-hidden', 'true');
    body.insertAdjacentElement('afterbegin', canvas);
  }
})();

(() => {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.innerWidth < 768;

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let stars = [];
  let farDust = [];
  let ringParticles = [];
  let coreParticles = [];
  let vortexParticles = [];
  let jetParticles = [];
  let haze = [];
  let companions = [];
  let orbitalClusters = [];
  let rotation = 0;
  // staticStarsCanvas / staticDustCanvas removed — were never populated in build(), always null.
  // Mobile gets quality boost via larger particle sizes instead.

  const ELEMENT_BOOST = 1.4;

  const cfg = {
    stars: mobile ? 168 : 500,         // -30%
    brightStars: mobile ? 17 : 52,
    farDust: mobile ? 336 : 1100,
    ringParticles: mobile ? 1875 : 9000,  // -25% from 2500
    coreParticles: mobile ? 140 : 280,
    jetParticles: mobile ? 770 : 2600,
    hazeParticles: mobile ? 77 : 220,
    cxFactor: mobile ? 0.60 : 0.60,
    cyFactor: mobile ? 0.38 : 0.342,   // shifted down on mobile
    scale: mobile ? 3.96 : 3.825,   // -25% total on mobile
    spin: mobile ? 0.00092 : 0.00112
  };

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    // getBoundingClientRect() returns the exact rendered CSS size of the canvas element.
    // Canvas CSS is position:fixed; inset:0 — so rect = true visible viewport.
    // This is the ONLY way to guarantee canvas buffer aspect ratio === CSS element
    // aspect ratio, which is required for ctx.arc() to draw perfect circles.
    // window.innerHeight, screen dimensions, clientHeight all can diverge from the
    // real rendered size on mobile, causing the nucleus to appear as an egg/oval.
    const rect = canvas.getBoundingClientRect();
    width = Math.round(rect.width);
    height = Math.round(rect.height);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  function build() {
    const cx = width * cfg.cxFactor;
    const cy = height * cfg.cyFactor;
    const base = Math.min(width, height) * 0.052 * cfg.scale;
    const diskA = Math.min(width, height) * 0.155 * cfg.scale * (mobile ? 1.55 : 1.82);
    const diskB = Math.min(width, height) * 0.020 * cfg.scale * (mobile ? 1.25 : 1.42);

    stars = [];
    farDust = [];
    ringParticles = [];
    coreParticles = [];
    vortexParticles = [];
    jetParticles = [];
    haze = [];
    companions = [];
    orbitalClusters = [];

    for (let i = 0; i < cfg.stars; i += 1) {
      stars.push({
        x: rand(0, width),
        y: rand(0, height),
        r: rand(0.35, 1.35),
        a: rand(0.10, 0.42),
        vx: rand(-0.012, 0.012),
        vy: rand(-0.01, 0.01)
      });
    }
    for (let i = 0; i < cfg.brightStars; i += 1) {
      stars.push({
        x: rand(0, width),
        y: rand(0, height),
        r: rand(1.1, 2.2),
        a: rand(0.26, 0.68),
        vx: rand(-0.008, 0.008),
        vy: rand(-0.008, 0.008),
        glow: true
      });
    }

    for (let i = 0; i < cfg.farDust; i += 1) {
      const radius = rand(diskA * 0.72, diskA * 1.42);
      const angle = rand(0, Math.PI * 2);
      const flatten = rand(0.20, 0.36);
      farDust.push({
        x0: Math.cos(angle) * radius,
        y0: Math.sin(angle) * radius * flatten,
        size: rand(0.28, 0.95),
        alpha: mobile ? rand(0.024, 0.095) : rand(0.018, 0.080),
        hue: pick([[212,230,255],[226,214,255],[255,228,204]]),
        speed: rand(0.18, 0.44)
      });
    }

    // Dense, narrow annular disk. Bias heavily toward ring bands rather than center.
    const clusterAngles = [0.22, 2.28, 4.65];
    for (let i = 0; i < cfg.ringParticles; i += 1) {
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
      ringParticles.push({
        orbit,
        angle,
        size: focus > 0.8 ? (mobile ? rand(0.52, 1.26) : rand(0.38, 1.06)) : (mobile ? rand(0.40, 0.96) : rand(0.30, 0.80)),
        alpha: Math.min(1, (focus > 0.8 ? (mobile ? rand(0.34, 0.82) : rand(0.21, 0.60)) : (mobile ? rand(0.22, 0.56) : rand(0.13, 0.38))) * ELEMENT_BOOST),
        rgb,
        yScale: mobile ? rand(0.10, 0.17) : rand(0.11, 0.21),
        drift: rand(-0.014, 0.014),
        speed: rand(0.88, 1.34),
        halo: Math.random() < (mobile ? 0.24 : 0.20)
      });
    }

    // Compact spiral vortex inside the nucleus. This is the only new center element.
    const armCount = 3;
    for (let i = 0; i < (mobile ? 280 : 640); i += 1) {
      const arm = i % armCount;
      const t = Math.pow(Math.random(), 0.64);
      const radius = base * (mobile ? 1.34 : 1.15) * (mobile ? (0.072 + t * 0.78) : (0.06 + t * 0.70));
      const armPhase = (Math.PI * 2 / armCount) * arm;
      const curl = radius * (mobile ? 0.28 : 0.34);
      const angle = armPhase + t * 6.4 + rand(-0.12, 0.12);
      const rgb = t < 0.16
        ? pick([[255,255,255],[248,252,255],[238,246,255]])
        : (t < 0.46
          ? pick([[176,226,255],[160,216,255],[144,206,255]])
          : pick([[96,176,246],[84,164,238],[72,152,228]]));
      vortexParticles.push({
        radius,
        angle,
        curl,
        size: mobile ? (t < 0.18 ? rand(0.92, 1.72) : rand(0.34, 1.02)) : (t < 0.18 ? rand(0.68, 1.38) : rand(0.26, 0.82)),
        alpha: Math.min(1, (t < 0.18 ? rand(0.52, 0.96) : (t < 0.46 ? rand(0.28, 0.68) : rand(0.10, 0.30))) * ELEMENT_BOOST),
        rgb,
        depth: rand(0.78, 1.18),
        yScale: rand(0.40, 0.60)
      });
    }

    // Small nucleus, not a big ball.
    for (let i = 0; i < cfg.coreParticles; i += 1) {
      const orbit = rand(0, base * (mobile ? 0.305 : 0.253));
      const angle = rand(0, Math.PI * 2);
      const rgb = pick([[255,255,255], [246,250,255], [228,242,255], [184,224,255]]);
      coreParticles.push({
        orbit,
        angle,
        size: mobile ? rand(0.40, 0.98) : rand(0.26, 0.74),
        alpha: Math.min(1, rand(0.14, 0.34) * ELEMENT_BOOST),
        rgb,
        speed: rand(1.0, 1.4)
      });
    }

    // Particle plumes up/down from the core: denser, but without a single hard spine.
    for (let i = 0; i < cfg.jetParticles; i += 1) {
      const side = i % 2 === 0 ? -1 : 1;
      const t = Math.pow(Math.random(), 0.46);
      const dist = base * (0.14 + t * 7.3);
      const spread = base * (0.018 + t * 0.095);
      let x = rand(-spread, spread) * (0.55 + t * 0.9);
      const hole = base * 0.010;
      if (Math.abs(x) < hole) {
        x = (Math.random() < 0.5 ? -1 : 1) * rand(hole, hole * 1.9);
      }
      const rgb = t < 0.30 ? [255, 252, 255] : (t < 0.66 ? [238, 228, 255] : [214, 238, 255]);
      jetParticles.push({
        x,
        y: side * dist,
        size: t < 0.18 ? rand(0.70, 1.72) : rand(0.36, 0.96),
        alpha: (1 - t * 0.70) * rand(0.18, 0.62),
        rgb,
        pulse: rand(0.88, 1.22),
        phase: rand(0, Math.PI * 2),
        driftX: rand(-0.08, 0.08),
        wobble: rand(0.90, 1.10)
      });
    }

    // Very soft local haze to darken the zone without making a blob.
    for (let i = 0; i < cfg.hazeParticles; i += 1) {
      const r = rand(base * 1.3, diskA * 1.05);
      const a = rand(0, Math.PI * 2);
      haze.push({
        x0: Math.cos(a) * r,
        y0: Math.sin(a) * r * rand(0.18, 0.36),
        size: rand(18, 42),
        alpha: mobile ? rand(0.0028, 0.0075) : rand(0.0020, 0.0058),
        speed: rand(0.36, 0.74),
        hue: pick(['18,24,42', '26,34,58', '44,48,86'])
      });
    }


companions.push(
  { x: diskA * 0.96, y: -diskA * 0.08, r: 8, rgb: '162,113,255', alpha: mobile ? 0.13 : 0.098 },
  { x: -diskA * 0.88, y: diskA * 0.18, r: 7, rgb: '110,188,255', alpha: mobile ? 0.11 : 0.084 },
  { x: diskA * 0.48, y: diskA * 0.42, r: 7, rgb: '255,194,120', alpha: mobile ? 0.10 : 0.077 }
);

orbitalClusters.push(
  {
    orbit: diskA * 0.57,
    yScale: 0.17,
    angularVel: 0.18,
    phase: Math.PI * 0.88,
    radius: base * (mobile ? 0.118 : 0.088),
    colors: [[150,228,255],[196,244,255],[224,248,255]],
    tailColor: [120,205,255],
    glow: '120,205,255',
    trail: []
  },
  {
    orbit: diskA * 0.82,
    yScale: 0.16,
    angularVel: -0.16,
    phase: Math.PI * 0.12,
    radius: base * (mobile ? 0.126 : 0.094),
    colors: [[255,226,148],[255,239,190],[255,247,216]],
    tailColor: [255,213,112],
    glow: '255,213,112',
    trail: []
  }
);

    canvas.dataset.cx = String(cx);
    canvas.dataset.cy = String(cy);
    canvas.dataset.base = String(base);
    canvas.dataset.diskA = String(diskA);
    canvas.dataset.diskB = String(diskB);
  }

  function drawBackdrop(cx, cy) {
    const diskA = Number(canvas.dataset.diskA) || 180;
    const rx = diskA * 1.58;
    const ry = rx * 0.84;
    ctx.save();
    ctx.translate(cx, cy);

    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, mobile ? 'rgba(8,12,24,0.97)' : 'rgba(10,14,28,0.92)');
    g.addColorStop(0.20, mobile ? 'rgba(14,18,34,0.84)' : 'rgba(18,22,40,0.78)');
    g.addColorStop(0.48, mobile ? 'rgba(24,30,54,0.56)' : 'rgba(26,32,58,0.48)');
    g.addColorStop(0.76, mobile ? 'rgba(48,60,104,0.20)' : 'rgba(52,64,108,0.18)');
    g.addColorStop(1, 'rgba(54,66,112,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // tighter darker strip around the disk plane
    const g2 = ctx.createLinearGradient(0, -ry * 0.24, 0, ry * 0.24);
    g2.addColorStop(0, 'rgba(10,14,26,0)');
    g2.addColorStop(0.5, mobile ? 'rgba(10,14,26,0.34)' : 'rgba(10,14,26,0.28)');
    g2.addColorStop(1, 'rgba(10,14,26,0)');
    ctx.fillStyle = g2;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * 0.90, ry * 0.26, 0, 0, Math.PI * 2);
    ctx.fill();

    const g3 = ctx.createRadialGradient(0, 0, rx * 0.18, 0, 0, rx * 1.08);
    g3.addColorStop(0, 'rgba(6,10,20,0)');
    g3.addColorStop(0.46, mobile ? 'rgba(10,14,28,0.22)' : 'rgba(10,14,28,0.16)');
    g3.addColorStop(0.78, mobile ? 'rgba(8,12,24,0.32)' : 'rgba(8,12,24,0.24)');
    g3.addColorStop(1, 'rgba(8,12,24,0)');
    ctx.fillStyle = g3;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * 1.06, ry * 0.96, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawHaze(cx, cy) {
    ctx.save();
    ctx.translate(cx, cy);
    for (const p of haze) {
      const ang = rotation * p.speed;
      const x = p.x0 * Math.cos(ang) - p.y0 * Math.sin(ang);
      const y = p.x0 * Math.sin(ang) + p.y0 * Math.cos(ang);
      const g = ctx.createRadialGradient(x, y, 0, x, y, p.size);
      g.addColorStop(0, `rgba(${p.hue},${p.alpha})`);
      g.addColorStop(1, `rgba(${p.hue},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawFarDust(cx, cy, time) {
    ctx.save();
    ctx.translate(cx, cy);
    for (const p of farDust) {
      const a = rotation * p.speed;
      const x = p.x0 * Math.cos(a) - p.y0 * Math.sin(a);
      const y = p.x0 * Math.sin(a) + p.y0 * Math.cos(a);
      const tw = 0.84 + Math.sin(time * 0.0012 + x * 0.01 + y * 0.02) * 0.16;
      ctx.fillStyle = `rgba(${p.hue[0]},${p.hue[1]},${p.hue[2]},${p.alpha * tw})`;
      ctx.beginPath();
      ctx.arc(x, y, p.size * tw, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawGalaxy(cx, cy, time) {
    ctx.save();
    ctx.translate(cx, cy);

    // faint disk lanes to make the annulus read clearly at normal zoom
    const diskA = Number(canvas.dataset.diskA) || 180;
    ctx.strokeStyle = 'rgba(224,214,255,0.045)';
    ctx.lineWidth = mobile ? 1.0 : 1.2;
    for (const f of [0.52, 0.72, 0.92]) {
      ctx.beginPath();
      ctx.ellipse(0, 0, diskA * f, diskA * f * 0.18, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (const p of ringParticles) {
      const a = p.angle + rotation * p.speed;
      const x = Math.cos(a) * p.orbit;
      const y = Math.sin(a) * p.orbit * p.yScale + Math.cos(a * 2.2 + time * 0.0004) * p.drift;
      const flick = 0.90 + Math.sin(time * 0.0018 + a * 2.4) * 0.10;
      const alpha = p.alpha * flick;
      ctx.fillStyle = `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},${(alpha * 100 | 0) / 100})`;
      ctx.beginPath();
      ctx.arc(x, y, p.size * flick, 0, Math.PI * 2);
      ctx.fill();
      if (p.halo && alpha > 0.16) {
        ctx.fillStyle = `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},${(alpha * 0.08 * 100 | 0) / 100})`;
        ctx.beginPath();
        ctx.arc(x, y, p.size * 2.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const vortexSpin = rotation * 2.35;
    for (const p of vortexParticles) {
      const a = p.angle + vortexSpin * p.depth;
      const spiralR = Math.max(0, p.radius - ((a % (Math.PI * 2)) / (Math.PI * 2)) * p.curl * 0.18);
      const x = Math.cos(a) * spiralR;
      const y = Math.sin(a) * spiralR * p.yScale;
      const tw = 0.90 + Math.sin(time * 0.0032 + a * 1.8) * 0.10;
      ctx.fillStyle = `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},${Math.min(1, p.alpha * tw * ELEMENT_BOOST)})`;
      ctx.beginPath();
      ctx.arc(x, y, p.size * tw, 0, Math.PI * 2);
      ctx.fill();
      if (p.alpha > 0.46) {
        ctx.fillStyle = `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},${p.alpha * 0.040})`;
        ctx.beginPath();
        ctx.arc(x, y, p.size * 2.0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (const p of coreParticles) {
      const a = p.angle + rotation * p.speed;
      const x = Math.cos(a) * p.orbit;
      const y = Math.sin(a) * p.orbit * 0.24;
      const tw = 0.94 + Math.sin(time * 0.003 + a) * 0.06;
      ctx.fillStyle = `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},${Math.min(1, p.alpha * tw * ELEMENT_BOOST)})`;
      ctx.beginPath();
      ctx.arc(x, y, p.size * tw, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    const base = Number(canvas.dataset.base) || 40;
    // Nucleus size compensated: scale was reduced -15% for galaxy, but nucleus
    // should stay at original visual size — multiply by 1.177 on mobile
    const nb = mobile ? base * 1.177 : base;
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, nb * 0.391);
    core.addColorStop(0, 'rgba(255,255,255,0.98)');
    core.addColorStop(0.10, 'rgba(248,252,255,1)');
    core.addColorStop(0.22, 'rgba(214,236,255,0.62)');
    core.addColorStop(0.40, 'rgba(110,186,250,0.30)');
    core.addColorStop(1, 'rgba(110,186,250,0)');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(cx, cy, nb * 0.40, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.98)';
    ctx.beginPath();
    ctx.arc(cx, cy, nb * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }


  function drawSpiralAccent(cx, cy, time) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation * 1.55);
    ctx.lineCap = 'round';
    for (const [scale, alpha, width, phase] of [[1.0, 0.30, mobile ? 1.8 : 2.2, 0],[0.82,0.22,mobile ? 1.2 : 1.5,0.55],[0.64,0.16,mobile ? 0.9 : 1.1,1.05]]) {
      const turns = 1.05;
      ctx.beginPath();
      for (let i = 0; i <= 72; i += 1) {
        const t = i / 72;
        const a = phase + t * Math.PI * 2 * turns;
        const r = (Number(canvas.dataset.base) || 40) * scale * (0.10 + t * 0.42);
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r * 0.58;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      const grad = ctx.createLinearGradient(-20, 0, 20, 0);
      grad.addColorStop(0, `rgba(84,164,238,${alpha * 0.45})`);
      grad.addColorStop(0.45, `rgba(160,216,255,${alpha})`);
      grad.addColorStop(1, `rgba(84,164,238,${alpha * 0.18})`);
      ctx.strokeStyle = grad;
      ctx.shadowColor = `rgba(118,188,255,${alpha * 0.28})`;
      ctx.shadowBlur = mobile ? 5 : 7;
      ctx.lineWidth = width;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawJets(cx, cy, time) {
    ctx.save();
    ctx.translate(cx, cy);
    for (const p of jetParticles) {
      const flick = 0.94 + Math.sin(time * 0.0008 * p.pulse + p.phase) * 0.06;
      const sway = Math.sin(time * 0.0004 * p.wobble + Math.abs(p.y) * 0.008 + p.phase) * p.driftX;
      const x = p.x + sway;
      const y = p.y;
      const a = p.alpha * flick;
      ctx.fillStyle = `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},${a})`;
      ctx.beginPath();
      ctx.arc(x, y, p.size * flick, 0, Math.PI * 2);
      ctx.fill();
      if (a > 0.18) {
        ctx.fillStyle = `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},${a * 0.028})`;
        ctx.beginPath();
        ctx.arc(x, y, p.size * 2.35, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }


function drawCompanions(cx, cy, time) {
  for (const c of companions) {
    const pulse = 0.84 + Math.sin(time * 0.0018 + c.x * 0.01) * 0.16;
    const g = ctx.createRadialGradient(cx + c.x, cy + c.y, 0, cx + c.x, cy + c.y, c.r * 2.8);
    g.addColorStop(0, `rgba(${c.rgb},${Math.min(1, c.alpha * pulse * ELEMENT_BOOST)})`);
    g.addColorStop(1, `rgba(${c.rgb},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx + c.x, cy + c.y, c.r * 2.8, 0, Math.PI * 2);
    ctx.fill();
  }
}


function drawOrbitalClusters(cx, cy, time) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalCompositeOperation = 'screen';
  for (const o of orbitalClusters) {
    const angle = o.phase + time * 0.001 * o.angularVel;
    const x = Math.cos(angle) * o.orbit;
    const y = Math.sin(angle) * o.orbit * o.yScale;

    // no tail or streak; keep only compact moving cores inside the ring gaps
    const pulse = 0.97 + Math.sin(time * 0.0024 + o.phase * 7) * 0.03;

    const halo = ctx.createRadialGradient(x, y, 0, x, y, o.radius * 1.55);
    halo.addColorStop(0, `rgba(${o.glow},0.14)`);
    halo.addColorStop(0.36, `rgba(${o.glow},0.040)`);
    halo.addColorStop(1, `rgba(${o.glow},0)`);
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(x, y, o.radius * 1.55, 0, Math.PI * 2);
    ctx.fill();

    const coreOuter = ctx.createRadialGradient(x, y, 0, x, y, o.radius * 0.56 * pulse);
    coreOuter.addColorStop(0, 'rgba(255,255,255,0.98)');
    coreOuter.addColorStop(0.12, `rgba(${o.colors[0][0]},${o.colors[0][1]},${o.colors[0][2]},1)`);
    coreOuter.addColorStop(0.32, `rgba(${o.colors[1][0]},${o.colors[1][1]},${o.colors[1][2]},0.48)`);
    coreOuter.addColorStop(1, `rgba(${o.glow},0)`);
    ctx.fillStyle = coreOuter;
    ctx.beginPath();
    ctx.arc(x, y, o.radius * 0.56 * pulse, 0, Math.PI * 2);
    ctx.fill();

    const coreInner = ctx.createRadialGradient(x - o.radius * 0.03, y - o.radius * 0.04, 0, x, y, o.radius * 0.24);
    coreInner.addColorStop(0, 'rgba(255,255,255,1)');
    coreInner.addColorStop(0.52, `rgba(${o.colors[2][0]},${o.colors[2][1]},${o.colors[2][2]},0.82)`);
    coreInner.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = coreInner;
    ctx.beginPath();
    ctx.arc(x, y, o.radius * 0.24, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}

function drawStars(time) {
    for (const s of stars) {
      const tw = 0.74 + Math.sin(time * 0.0012 + s.x * 0.02 + s.y * 0.01) * 0.26;
      const a = s.a * tw;
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      if (s.glow) {
        ctx.fillStyle = `rgba(200,220,255,${a * 0.09})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 3.0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Scroll listener: boosts fps to 60 during scroll so animation stays smooth
  let isScrolling = false;
  let scrollTimer = null;
  window.addEventListener('scroll', () => {
    isScrolling = true;
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => { isScrolling = false; }, 200);
  }, { passive: true });

  let isHidden = false;
  document.addEventListener('visibilitychange', () => {
    isHidden = document.hidden;
  });

  let lastFrameTime = 0;

  function tick(time) {
    if (isHidden) {
      requestAnimationFrame(tick);
      return;
    }

    // Desktop: 60fps. Mobile idle: 30fps. Mobile scrolling: 60fps (no skip during scroll)
    const fpsLimit = mobile ? (isScrolling ? 16.7 : 33.3) : 16.7;
    if (time - lastFrameTime < fpsLimit) {
      requestAnimationFrame(tick);
      return;
    }
    lastFrameTime = time;

    ctx.clearRect(0, 0, width, height);
    const cx = Number(canvas.dataset.cx) || width * cfg.cxFactor;
    const cy = Number(canvas.dataset.cy) || height * cfg.cyFactor;

    // Direct draw — no dead static-canvas branches
    drawStars(time);
    drawBackdrop(cx, cy);
    drawHaze(cx, cy);
    drawFarDust(cx, cy, time);

    drawGalaxy(cx, cy, time);
    drawSpiralAccent(cx, cy, time);
    drawJets(cx, cy, time);
    drawCompanions(cx, cy, time);
    drawOrbitalClusters(cx, cy, time);

    if (!reduceMotion && !mobile) {
      rotation += cfg.spin;
      for (const s of stars) {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < -4) s.x = width + 4;
        if (s.x > width + 4) s.x = -4;
        if (s.y < -4) s.y = height + 4;
        if (s.y > height + 4) s.y = -4;
      }
    } else if (!reduceMotion && mobile) {
      rotation += cfg.spin;
    }

    requestAnimationFrame(tick);
  }

  // Debounce window resize: only rebuild if width changed (not address bar scroll).
  // On mobile, 'resize' fires on every pixel of address bar animation during scroll —
  // each call triggers build() which randomly repositions all particles (visible "jump").
  let lastResizeW = 0;
  let resizeDebounceTimer = null;
  window.addEventListener('resize', () => {
    const newW = window.innerWidth;
    // Ignore height-only changes (= address bar hide/show during scroll)
    if (Math.abs(newW - lastResizeW) < 5) return;
    clearTimeout(resizeDebounceTimer);
    resizeDebounceTimer = setTimeout(() => {
      lastResizeW = window.innerWidth;
      resize();
    }, 250);
  }, { passive: true });

  // visualViewport fires when mobile browser chrome (address bar, keyboard) changes
  // the actual visible area — more accurate than window resize on iOS/Android
  // visualViewport listener removed — canvas uses screen.width/height which
  // never changes during scroll, so no resize needed for address bar changes

  // Delay first resize until after window load + one rAF so the browser has:
  // 1. Applied padding-bottom from mobile dock
  // 2. Collapsed/expanded address bar to its resting state
  // 3. Finalized safe-area-inset values
  // Without this, innerHeight on load is ~80-100px taller than after first scroll
  // causing galaxy/nucleus to render oversized and egg-shaped on initial view.
  function initResize() {
    requestAnimationFrame(() => {
      resize();
      requestAnimationFrame(tick);
    });
  }

  if (document.readyState === 'complete') {
    initResize();
  } else {
    window.addEventListener('load', initResize, { once: true });
  }

  const menuToggle = document.getElementById('menuToggle');
  const navMobile = document.getElementById('navMobile');
  if (menuToggle && navMobile) {
    menuToggle.addEventListener('click', () => {
      const active = navMobile.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', active ? 'true' : 'false');
    });
  }
})();

