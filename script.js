/* ================================================================
   SCANASIS — Futuristic Interactive Interface v3
   ================================================================ */

'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Inject CSS ──────────────────────────────────────────────── */
(function injectStyles() {
  const s = document.createElement('style');
  s.textContent = `
    /* ---------- Scroll progress ---------- */
    #scroll-bar {
      position:fixed;top:0;left:0;height:2px;width:0%;z-index:10000;
      background:linear-gradient(90deg,#00d4ff,#3b82f6,#a855f7);
      box-shadow:0 0 10px #00d4ff,0 0 20px rgba(0,212,255,0.4);
      transition:width 0.05s linear;pointer-events:none;
    }

    /* ---------- Boot overlay ---------- */
    #boot-overlay {
      position:fixed;inset:0;z-index:99999;
      background:#020b18;display:flex;flex-direction:column;
      align-items:center;justify-content:center;
      font-family:'Space Grotesk','Courier New',monospace;
      transition:opacity 0.7s ease, visibility 0.7s ease;
    }
    #boot-overlay.done { opacity:0;visibility:hidden; }
    .boot-logo {
      width:min(360px,72vw);height:auto;object-fit:contain;margin-bottom:8px;
      filter:drop-shadow(0 0 22px rgba(0,212,255,0.45));
    }
    .boot-sub {
      font-size:0.72rem;letter-spacing:0.25em;color:#3b82f6;
      text-transform:uppercase;margin-bottom:48px;
    }
    .boot-lines {
      width:min(520px,90vw);text-align:left;
      font-size:0.72rem;line-height:2;color:#1e4a6e;
    }
    .boot-line { opacity:0;transform:translateX(-6px);transition:opacity 0.25s,transform 0.25s; }
    .boot-line.show { opacity:1;transform:none; }
    .boot-line .ok { color:#00d4ff;margin-left:8px; }
    .boot-line .ok::before { content:'[ OK ]'; }
    .boot-bar-wrap {
      width:min(520px,90vw);margin-top:28px;
    }
    .boot-bar-track {
      height:2px;background:rgba(0,212,255,0.1);border-radius:2px;overflow:hidden;
    }
    .boot-bar-fill {
      height:100%;width:0%;border-radius:2px;
      background:linear-gradient(90deg,#00d4ff,#3b82f6);
      box-shadow:0 0 8px rgba(0,212,255,0.6);
      transition:width 0.4s ease-out;
    }
    .boot-pct {
      text-align:right;font-size:0.65rem;color:#1e4a6e;margin-top:6px;
      letter-spacing:0.12em;
    }

    /* ---------- Aurora blobs ---------- */
    #aurora {
      position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;
    }
    .aurora-blob {
      position:absolute;border-radius:50%;
      filter:blur(90px);opacity:0;
      animation:auroraFloat var(--dur,28s) ease-in-out infinite var(--del,0s);
    }
    @keyframes auroraFloat {
      0%   { transform:translate(0,0) scale(1);   opacity:0; }
      15%  { opacity:var(--op,0.07); }
      50%  { transform:translate(var(--tx,60px),var(--ty,40px)) scale(1.15); opacity:var(--op,0.07); }
      85%  { opacity:var(--op,0.07); }
      100% { transform:translate(0,0) scale(1);   opacity:0; }
    }

    /* ---------- Click ripple ---------- */
    .click-ripple {
      position:fixed;pointer-events:none;z-index:99980;
      border-radius:50%;transform:translate(-50%,-50%) scale(0);
      border:1.5px solid rgba(0,212,255,0.8);
      animation:rippleGrow 0.7s ease-out forwards;
    }
    @keyframes rippleGrow {
      0%  { transform:translate(-50%,-50%) scale(0);   opacity:1; }
      100%{ transform:translate(-50%,-50%) scale(1);   opacity:0; }
    }
    .click-ripple-2 {
      animation-delay:0.12s;
      border-color:rgba(168,85,247,0.5);
    }

    /* ---------- Cursor trail ---------- */
    .spark {
      position:fixed;pointer-events:none;z-index:99990;
      border-radius:50%;transform:translate(-50%,-50%);
      animation:sparkFade 0.6s ease-out forwards;
    }
    @keyframes sparkFade {
      0%  { opacity:1; transform:translate(-50%,-50%) scale(1); }
      100%{ opacity:0; transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(0); }
    }

    /* ---------- HUD ---------- */
    #hud-panel {
      position:fixed;bottom:32px;right:32px;z-index:900;
      width:200px;
      background:rgba(2,11,24,0.82);
      border:1px solid rgba(0,212,255,0.18);
      border-radius:10px;padding:16px 18px;
      backdrop-filter:blur(14px);
      font-family:'Space Grotesk','Inter',sans-serif;
      font-size:0.72rem;color:#4a6a82;letter-spacing:0.06em;
      transition:opacity 0.4s,transform 0.4s;
      box-shadow:0 0 30px rgba(0,212,255,0.06),inset 0 1px 0 rgba(0,212,255,0.1);
    }
    #hud-panel.hud-hidden { opacity:0;transform:translateY(12px);pointer-events:none; }
    .hud-header {
      display:flex;align-items:center;gap:8px;
      font-size:0.65rem;font-weight:700;letter-spacing:0.18em;
      text-transform:uppercase;color:#00d4ff;margin-bottom:14px;
    }
    .hud-header-dot {
      width:5px;height:5px;border-radius:50%;background:#00d4ff;
      box-shadow:0 0 6px #00d4ff;animation:hudBlink 1.8s ease-in-out infinite;
    }
    @keyframes hudBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }
    .hud-row {
      display:flex;justify-content:space-between;align-items:center;
      margin-bottom:9px;line-height:1;
    }
    .hud-row:last-child { margin-bottom:0; }
    .hud-label { color:#4a6a82;font-size:0.67rem; }
    .hud-val { color:#00d4ff;font-weight:700;font-size:0.74rem;font-variant-numeric:tabular-nums; }
    .hud-bar-wrap { margin-top:12px;padding-top:12px;border-top:1px solid rgba(0,212,255,0.08); }
    .hud-bar-label { color:#4a6a82;font-size:0.64rem;margin-bottom:5px; }
    .hud-bar-track { height:2px;background:rgba(0,212,255,0.08);border-radius:2px;overflow:hidden; }
    .hud-bar-fill {
      height:100%;background:linear-gradient(90deg,#00d4ff,#3b82f6);
      border-radius:2px;width:0%;box-shadow:0 0 6px rgba(0,212,255,0.5);
      transition:width 1s ease-out;
    }
    .hud-corner { position:absolute;width:8px;height:8px;opacity:0.5; }
    .hud-corner.tl { top:6px;left:6px;border-top:1px solid #00d4ff;border-left:1px solid #00d4ff; }
    .hud-corner.tr { top:6px;right:6px;border-top:1px solid #00d4ff;border-right:1px solid #00d4ff; }
    .hud-corner.bl { bottom:6px;left:6px;border-bottom:1px solid #00d4ff;border-left:1px solid #00d4ff; }
    .hud-corner.br { bottom:6px;right:6px;border-bottom:1px solid #00d4ff;border-right:1px solid #00d4ff; }

    /* ---------- Holographic sheen ---------- */
    .holo-sheen {
      position:absolute;inset:0;pointer-events:none;z-index:2;
      background:linear-gradient(105deg,transparent 20%,rgba(0,212,255,0.07) 35%,rgba(168,85,247,0.06) 50%,rgba(59,130,246,0.07) 65%,transparent 80%);
      opacity:0;transition:opacity 0.3s;mix-blend-mode:screen;
      transform:translateX(-200%);
    }
    .service-card:hover .holo-sheen,
    .industry-card:hover .holo-sheen { opacity:1; }

    /* ---------- Glitch keyframes ---------- */
    @keyframes gc1{0%{opacity:0;transform:translateX(0)}20%{opacity:1;transform:translateX(-3px)}40%{opacity:0;transform:translateX(3px)}60%{opacity:1;transform:translateX(-1px)}100%{opacity:0;transform:translateX(0)}}
    @keyframes gc2{0%{opacity:0;transform:translateX(0)}20%{opacity:1;transform:translateX(3px)}40%{opacity:0;transform:translateX(-3px)}60%{opacity:1;transform:translateX(1px)}100%{opacity:0;transform:translateX(0)}}
  `;
  document.head.appendChild(s);
})();

/* ================================================================
   BOOT SEQUENCE
   ================================================================ */
(function initBoot() {
  if (sessionStorage.getItem('booted')) return; // only once per tab

  const overlay = document.createElement('div');
  overlay.id = 'boot-overlay';

  const LINES = [
    'Initializing Scanasis BIM Engine…',
    'Loading point cloud processor…',
    'Calibrating scan-to-BIM pipeline…',
    'Mounting LOD 400 model library…',
    'Establishing secure data stream…',
    'System ready.',
  ];

  overlay.innerHTML = `
    <img class="boot-logo" src="assets/scanasis-logo.png" alt="Scanasis" />
    <div class="boot-sub">Scan · BIM · Digital Twin</div>
    <div class="boot-lines">${LINES.map(l => `<div class="boot-line">${l}<span class="ok"></span></div>`).join('')}</div>
    <div class="boot-bar-wrap">
      <div class="boot-bar-track"><div class="boot-bar-fill" id="boot-bar"></div></div>
      <div class="boot-pct" id="boot-pct">0%</div>
    </div>
  `;
  document.body.prepend(overlay);
  document.body.style.overflow = 'hidden';

  const lineEls = [...overlay.querySelectorAll('.boot-line')];
  const bar     = overlay.querySelector('#boot-bar');
  const pct     = overlay.querySelector('#boot-pct');
  const step    = 100 / LINES.length;

  function showLine(i) {
    if (i >= lineEls.length) {
      bar.style.width = '100%';
      pct.textContent = '100%';
      setTimeout(() => {
        overlay.classList.add('done');
        document.body.style.overflow = '';
        sessionStorage.setItem('booted', '1');
        setTimeout(() => overlay.remove(), 800);
      }, 500);
      return;
    }
    lineEls[i].classList.add('show');
    bar.style.width  = (step * (i + 1)) + '%';
    pct.textContent  = Math.round(step * (i + 1)) + '%';
    setTimeout(() => showLine(i + 1), i === LINES.length - 1 ? 300 : 280);
  }

  setTimeout(() => showLine(0), 300);
})();

/* ================================================================
   AURORA BACKGROUND BLOBS
   ================================================================ */
(function initAurora() {
  if (reducedMotion()) return;

  const wrap = document.createElement('div');
  wrap.id = 'aurora';
  document.body.prepend(wrap);

  const blobs = [
    { w: 700, h: 500, top: '-10%', left: '-5%',  color: 'rgba(0,100,180,1)',   op: 0.09, dur: 32, del: 0,   tx:  80, ty: 60  },
    { w: 600, h: 600, top: '20%',  left: '55%',  color: 'rgba(90,30,160,1)',   op: 0.07, dur: 40, del: -8,  tx: -70, ty: 80  },
    { w: 500, h: 400, top: '60%',  left: '10%',  color: 'rgba(0,180,180,1)',   op: 0.06, dur: 36, del: -14, tx:  50, ty: -60 },
    { w: 800, h: 500, top: '-5%',  left: '30%',  color: 'rgba(20,60,140,1)',   op: 0.05, dur: 44, del: -5,  tx: -40, ty: 50  },
    { w: 400, h: 400, top: '75%',  left: '70%',  color: 'rgba(100,20,200,1)',  op: 0.06, dur: 38, del: -20, tx:  60, ty: -40 },
  ];

  blobs.forEach(b => {
    const el = document.createElement('div');
    el.className = 'aurora-blob';
    el.style.cssText = `
      width:${b.w}px;height:${b.h}px;
      top:${b.top};left:${b.left};
      background:radial-gradient(ellipse,${b.color},transparent 70%);
      --op:${b.op};--dur:${b.dur}s;--del:${b.del}s;
      --tx:${b.tx}px;--ty:${b.ty}px;
    `;
    wrap.appendChild(el);
  });
})();

/* ================================================================
   SCROLL PROGRESS BAR
   ================================================================ */
(function initScrollBar() {
  const bar = document.createElement('div');
  bar.id = 'scroll-bar';
  document.body.prepend(bar);
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? window.scrollY / max * 100 : 0) + '%';
  }, { passive: true });
})();

/* ================================================================
   CLICK RIPPLE
   ================================================================ */
(function initRipple() {
  if (reducedMotion()) return;

  document.addEventListener('click', e => {
    [40, 70].forEach((size, i) => {
      const r = document.createElement('div');
      r.className = 'click-ripple' + (i ? ' click-ripple-2' : '');
      r.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;width:${size}px;height:${size}px;`;
      document.body.appendChild(r);
      setTimeout(() => r.remove(), 900);
    });
  });
})();

/* ================================================================
   CUSTOM CURSOR
   ================================================================ */
const mouse = { x: -200, y: -200 };

(function initCursor() {
  if (isMobile()) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const dot  = document.createElement('div'); dot.id  = 'cursor-dot';
  const ring = document.createElement('div'); ring.id = 'cursor-ring';
  document.body.prepend(ring, dot);

  let rx = -200, ry = -200;
  document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });

  (function tick() {
    dot.style.left  = mouse.x + 'px'; dot.style.top  = mouse.y + 'px';
    rx = lerp(rx, mouse.x, 0.11);     ry = lerp(ry, mouse.y, 0.11);
    ring.style.left = rx + 'px';      ring.style.top  = ry + 'px';
    requestAnimationFrame(tick);
  })();

  $$('a,button,.service-card,.industry-card,.pf-card,.why-card,[role="button"]').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
  document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));
})();

/* ================================================================
   CURSOR SPARKLE TRAIL
   ================================================================ */
(function initSparkTrail() {
  if (isMobile() || reducedMotion()) return;
  let frameCount = 0;
  document.addEventListener('mousemove', e => {
    frameCount++;
    if (frameCount % 3 !== 0) return;
    const size  = Math.random() * 5 + 2;
    const angle = Math.random() * Math.PI * 2;
    const dist  = Math.random() * 22 + 6;
    const hue   = Math.random() > 0.5 ? '190' : (Math.random() > 0.5 ? '210' : '280');
    const spark = document.createElement('div');
    spark.className = 'spark';
    spark.style.cssText = `
      left:${e.clientX}px;top:${e.clientY}px;
      width:${size}px;height:${size}px;
      background:hsl(${hue},100%,${60 + Math.random() * 30}%);
      box-shadow:0 0 ${size * 2}px hsl(${hue},100%,70%);
      --dx:${Math.cos(angle) * dist}px;--dy:${Math.sin(angle) * dist}px;
    `;
    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 600);
  }, { passive: true });
})();

/* ================================================================
   SCANLINES
   ================================================================ */
(function initScanlines() {
  if (isMobile() || reducedMotion()) return;
  const el = document.createElement('div'); el.id = 'scanlines';
  document.body.prepend(el);
})();

/* ================================================================
   PARTICLE CANVAS
   ================================================================ */
(function initParticles() {
  if (reducedMotion()) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'bg-canvas';
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:0;opacity:0.55;';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize, { passive: true }); resize();

  const pts = Array.from({ length: 70 }, () => ({
    x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
    r: Math.random() * 1.1 + 0.2,
    vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
    a: Math.random() * 0.45 + 0.1,
  }));

  (function draw() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < 14400) {
        const d = Math.sqrt(d2), f = (120 - d) / 120 * 0.35;
        p.vx += (dx / d) * f; p.vy += (dy / d) * f;
        p.vx = clamp(p.vx, -1.6, 1.6); p.vy = clamp(p.vy, -1.6, 1.6);
      } else { p.vx *= 0.992; p.vy *= 0.992; }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,212,255,${p.a})`; ctx.fill();
    });
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.sqrt(dx*dx+dy*dy);
        if (d < 115) {
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(0,212,255,${0.07*(1-d/115)})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  })();
})();


/* ================================================================
   NAV
   ================================================================ */
(function initNav() {
  const nav = $('#nav');
  const toggle = $('#navToggle');
  const mobile = $('#navMobile');

  window.addEventListener('scroll', () => {
    if (nav) {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }
  }, { passive: true });

  if (!toggle || !mobile) return;

  function closeMobileNav() {
    mobile.style.display = 'none';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.classList.remove('active');
    document.body.classList.remove('nav-open');
  }

  function openMobileNav() {
    mobile.style.display = 'block';
    toggle.setAttribute('aria-expanded', 'true');
    toggle.classList.add('active');
    document.body.classList.add('nav-open');
  }

  // Always start each page with the mobile menu closed.
  closeMobileNav();

  toggle.addEventListener('click', e => {
    e.preventDefault();

    const isOpen = mobile.style.display === 'block';

    if (isOpen) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  });

  // Close the menu whenever ANY link inside the mobile navigation
  // is clicked before navigating to another page.
  mobile.addEventListener('click', e => {
    const link = e.target.closest('a');

    if (link) {
      closeMobileNav();
    }
  });

  // Safety: if the screen becomes desktop size,
  // make sure the mobile menu is closed.
  window.addEventListener('resize', () => {
    if (!isMobile()) {
      closeMobileNav();
    }
  }, { passive: true });
})();

/* ================================================================
   HERO PARALLAX
   ================================================================ */
(function initHeroParallax() {
  if (reducedMotion() || isMobile()) return;
  const heroBg = $('.hero-bg'), heroGrid = $('.hero-grid');
  let tx = 0, ty = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', e => {
    tx = (e.clientX / window.innerWidth  - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });
  (function tick() {
    cx = lerp(cx, tx, 0.04); cy = lerp(cy, ty, 0.04);
    if (heroBg)   heroBg.style.transform  = `translate(${cx * -14}px,${cy * -14}px) scale(1.06)`;
    if (heroGrid) heroGrid.style.transform = `translate(${cx * 7}px,${cy * 7}px)`;
    requestAnimationFrame(tick);
  })();
})();

/* ================================================================
   TEXT SCRAMBLE — hero badge
   ================================================================ */
(function initScramble() {
  if (reducedMotion()) return;
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
  function scramble(el, final, dur = 900) {
    const chars = final.split('');
    let frame = 0, total = Math.round(dur / 16);
    const iv = setInterval(() => {
      el.textContent = chars.map((ch, i) => {
        if (ch === ' ') return ' ';
        const p = (frame / total - i / chars.length / 1.5) * chars.length * 1.5;
        return p >= 1 ? ch : CHARS[Math.floor(Math.random() * CHARS.length)];
      }).join('');
      if (++frame > total) { el.textContent = final; clearInterval(iv); }
    }, 16);
  }
  const badge = $('.hero-badge');
  if (!badge) return;
  const textNodes = [...badge.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim());
  if (!textNodes.length) return;
  const original = textNodes[0].textContent.trim();
  const span = document.createElement('span');
  span.textContent = original;
  textNodes[0].replaceWith(span);
  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { setTimeout(() => scramble(span, original), 2400); io.disconnect(); }
  }, { threshold: 0.5 });
  io.observe(badge);
})();

/* ================================================================
   SERVICE CARD: SPOTLIGHT + HOLOGRAPHIC SHEEN
   ================================================================ */
(function initCardEffects() {
  $$('.service-card, .industry-card, .pf-card').forEach(card => {
    const glow = document.createElement('div');
    glow.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:0;background:radial-gradient(circle at var(--mx,50%) var(--my,50%),rgba(0,212,255,0.09),transparent 65%);opacity:0;transition:opacity 0.4s;';
    card.prepend(glow);
    const sheen = document.createElement('div');
    sheen.className = 'holo-sheen';
    card.appendChild(sheen);
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      glow.style.setProperty('--mx', ((e.clientX - r.left) / r.width  * 100) + '%');
      glow.style.setProperty('--my', ((e.clientY - r.top)  / r.height * 100) + '%');
      glow.style.opacity = '1';
      const rx = (e.clientX - r.left - r.width  / 2) / r.width;
      const ry = (e.clientY - r.top  - r.height / 2) / r.height;
      sheen.style.transform = `translateX(${rx * 120}%) translateY(${ry * 60}%)`;
    });
    card.addEventListener('mouseleave', () => { glow.style.opacity = '0'; sheen.style.transform = 'translateX(-200%)'; });
  });
})();

/* ================================================================
   3D CARD TILT
   ================================================================ */
(function initTilt() {
  if (reducedMotion() || isMobile()) return;
  $$('.industry-card,.why-card,.contact-form-wrap').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      card.style.transform = `perspective(800px) rotateX(${-dy * 6}deg) rotateY(${dx * 6}deg) translateZ(6px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();

/* ================================================================
   MAGNETIC BUTTONS
   ================================================================ */
(function initMagnet() {
  if (reducedMotion() || isMobile()) return;
  $$('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width/2) * 0.3}px,${(e.clientY - r.top - r.height/2) * 0.3}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
})();

/* ================================================================
   SCROLL REVEAL
   ================================================================ */
(function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return;
      setTimeout(() => target.classList.add('in-view'), parseInt(target.dataset.delay || '0', 10));
      io.unobserve(target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  $$('[class*="reveal-"]').forEach(el => io.observe(el));
})();

/* ================================================================
   STAT COUNTERS
   ================================================================ */
(function initCounter() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return;
      const raw = target.textContent.trim();
      const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
      const sfx = raw.replace(/[0-9.]/g, '');
      if (isNaN(num)) return;
      let start = null;
      (function step(ts) {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 1600, 1), e = 1 - Math.pow(1 - p, 4);
        target.textContent = (Number.isInteger(num) ? Math.round(e * num) : (e * num).toFixed(1)) + sfx;
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
      io.unobserve(target);
    });
  }, { threshold: 0.5 });
  $$('.stat-number').forEach(el => io.observe(el));
})();

/* ================================================================
   GLITCH TITLES
   ================================================================ */
(function initGlitch() {
  $$('.section-title').forEach(el => {
    const txt = el.textContent;
    el.style.position = 'relative';
    function makeClone(color, clip, anim) {
      const span = document.createElement('span');
      span.textContent = txt;
      span.style.cssText = `position:absolute;inset:0;pointer-events:none;color:${color};opacity:0;clip-path:${clip};`;
      span.dataset.anim = anim;
      el.appendChild(span); return span;
    }
    const l1 = makeClone('#00d4ff', 'polygon(0 0,100% 0,100% 40%,0 40%)',       'gc1');
    const l2 = makeClone('#a855f7', 'polygon(0 60%,100% 60%,100% 100%,0 100%)', 'gc2');
    let running = false;
    el.addEventListener('mouseenter', () => {
      if (running) return; running = true;
      [l1, l2].forEach(l => { l.style.opacity = '1'; l.style.animation = `${l.dataset.anim} 0.35s steps(1) 1`; });
      setTimeout(() => {
        l1.style.opacity = '0'; l1.style.animation = '';
        l2.style.opacity = '0'; l2.style.animation = '';
        running = false;
      }, 380);
    });
  });
})();

/* ================================================================
   ICON PULSE
   ================================================================ */
(function initIconPulse() {
  $$('.service-icon-wrap,.industry-icon,.why-icon').forEach(el => {
    el.addEventListener('mouseenter', () => {
      el.animate([
        { boxShadow: '0 0 0 0 rgba(0,212,255,0.45)' },
        { boxShadow: '0 0 0 12px rgba(0,212,255,0)' },
      ], { duration: 500, easing: 'ease-out' });
    });
  });
})();

/* ================================================================
   ACTIVE NAV LINK
   ================================================================ */
(function initActiveNav() {
  const links = $$('.nav-link');
  if (!links.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return;
      links.forEach(l => { l.style.color = l.getAttribute('href') === `#${target.id}` ? 'var(--cyan)' : ''; });
    });
  }, { rootMargin: '-40% 0px -50% 0px' });
  $$('section[id]').forEach(s => io.observe(s));
})();

/* ================================================================
   SMOOTH SCROLL
   ================================================================ */
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

/* ================================================================
   FOOTER YEAR
   ================================================================ */
(function() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ================================================================
   CONTACT FORM
   ================================================================ */
(function initForm() {
  const form = $('#contactForm');
  if (!form) return;
  const submitBtn = $('#cfSubmitBtn'), success = $('#cfSuccess'), errorBox = $('#cfError'), errorMsg = $('#cfErrorMsg');
  function setErr(id, msg) {
    const f = document.getElementById(id), e = document.getElementById(id + '-err');
    if (f) f.classList.toggle('is-invalid', !!msg);
    if (e) e.textContent = msg || '';
    return !!msg;
  }
  function validate() {
    let err = false;
    const name = document.getElementById('cf-name'), email = document.getElementById('cf-email'), msg = document.getElementById('cf-message');
    err = (!name?.value.trim()  ? setErr('cf-name',    'Please enter your name.')       : setErr('cf-name',    '')) || err;
    err = (!email?.value.trim() ? setErr('cf-email',   'Please enter your email.')      :
           !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) ? setErr('cf-email','Please enter a valid email.') :
           setErr('cf-email','')) || err;
    err = (!msg?.value.trim()   ? setErr('cf-message', 'Please describe your project.') : setErr('cf-message','')) || err;
    return !err;
  }
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate()) return;
    submitBtn.classList.add('submitting'); submitBtn.disabled = true;
    success.hidden = true; errorBox.hidden = true;
    try {
      const res = await fetch('https://api.web3forms.com/submit', { method:'POST', body:new FormData(form), headers:{Accept:'application/json'} });
      const json = await res.json();
      if (json.success) { success.hidden = false; form.reset(); }
      else { errorMsg.textContent = json.message || 'Something went wrong.'; errorBox.hidden = false; }
    } catch { errorMsg.textContent = 'Network error. Please email us directly.'; errorBox.hidden = false; }
    finally { submitBtn.classList.remove('submitting'); submitBtn.disabled = false; }
  });
  ['cf-name','cf-email','cf-message'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => setErr(id, ''));
  });
})();

/* ================================================================
   ENHANCEMENT PACK — v4
   ================================================================ */

/* ── POINT CLOUD CANVAS ─────────────────────────────────────── */
(function initPointCloud() {
  const canvas = document.getElementById('pc-canvas');
  if (!canvas || reducedMotion()) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts = [], raf;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Generate building-shaped point cloud
  function buildPts() {
    pts = [];
    const bW = 0.36, bH = 0.58, bD = 0.28;
    const cx = 0, cy = 0, cz = 0;
    function addSurface(ax, ay, az, bx, by, bz, n) {
      for (let i = 0; i < n; i++) {
        const t = Math.random(), u = Math.random();
        pts.push({ x: ax + (bx-ax)*t, y: ay + (by-ay)*u, z: az + (bz-az)*t });
      }
    }
    // 4 walls
    addSurface(-bW, -bH, -bD,  bW,  bH, -bD, 280);
    addSurface(-bW, -bH,  bD,  bW,  bH,  bD, 280);
    addSurface(-bW, -bH, -bD, -bW,  bH,  bD, 200);
    addSurface( bW, -bH, -bD,  bW,  bH,  bD, 200);
    // Roof
    addSurface(-bW, -bH, -bD,  bW, -bH,  bD, 120);
    // Floor grid
    for (let i = 0; i < 60; i++) {
      pts.push({ x: (Math.random()*2-1)*bW, y: bH + Math.random()*0.02, z: (Math.random()*2-1)*bD });
    }
    // Windows scatter
    for (let i = 0; i < 100; i++) {
      const side = Math.random() < 0.5 ? -bD : bD;
      pts.push({ x: (Math.random()*2-1)*bW*0.9, y: -bH*0.8 + Math.random()*bH*1.4, z: side });
    }
  }
  buildPts();

  function project(x, y, z, angle) {
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const rx = x * cos - z * sin;
    const rz = x * sin + z * cos;
    const fov = 1.6, dz = rz + 2.2;
    const px = (rx / dz) * fov * H * 0.5 + W / 2;
    const py = (y  / dz) * fov * H * 0.5 + H / 2;
    return { px, py, depth: dz };
  }

  let angle = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    angle += 0.003;
    const sorted = pts.map(p => ({ ...project(p.x, p.y, p.z, angle), y: p.y }))
                      .sort((a, b) => b.depth - a.depth);
    for (const { px, py, depth, y } of sorted) {
      if (px < -20 || px > W+20 || py < -20 || py > H+20) continue;
      const t = clamp((-y + 0.6) / 1.2, 0, 1);
      const r = Math.round(lerp(59, 0, t));
      const g = Math.round(lerp(130, 212, t));
      const b = Math.round(lerp(246, 255, t));
      const alpha = clamp(0.9 - (depth - 1.8) * 0.3, 0.15, 0.85);
      const size = clamp(3.2 / depth, 0.8, 2.4);
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  }
  draw();

  // Mark hero as booted after boot overlay hides
  const boot = document.getElementById('boot-overlay');
  if (boot) {
    new MutationObserver(() => {
      if (boot.classList.contains('done')) {
        document.querySelector('.hero')?.classList.add('booted');
      }
    }).observe(boot, { attributes: true, attributeFilter: ['class'] });
  } else {
    document.querySelector('.hero')?.classList.add('booted');
  }
})();

/* ── PORTFOLIO FILTER ───────────────────────────────────────── */
(function initPortfolioFilter() {
  const grid = document.getElementById('portfolioGrid');
  if (!grid) return;
  const btns  = $$('.pf-btn');
  const cards = $$('.pf-card', grid);

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      cards.forEach(c => {
        const match = f === 'all' || c.dataset.sector === f;
        c.classList.toggle('pf-hidden', !match);
      });
    });
  });
})();

/* ── BEFORE / AFTER SLIDER ──────────────────────────────────── */
(function initBASlider() {
  const slider = document.getElementById('baSlider');
  const after  = document.getElementById('baAfter');
  const handle = document.getElementById('baHandle');
  if (!slider || !after || !handle) return;

  let dragging = false;

  function setPos(x) {
    const rect = slider.getBoundingClientRect();
    let pct = clamp((x - rect.left) / rect.width * 100, 2, 98);
    after.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    handle.style.left = pct + '%';
    handle.setAttribute('aria-valuenow', Math.round(pct));
  }
  setPos(slider.getBoundingClientRect().left + slider.getBoundingClientRect().width / 2);

  slider.addEventListener('mousedown',  e => { dragging = true; setPos(e.clientX); });
  window.addEventListener('mousemove',  e => { if (dragging) setPos(e.clientX); });
  window.addEventListener('mouseup',    () => { dragging = false; });
  slider.addEventListener('touchstart', e => { dragging = true; setPos(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchmove',  e => { if (dragging) setPos(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchend',   () => { dragging = false; });
})();

/* ── TESTIMONIALS CAROUSEL ──────────────────────────────────── */
(function initTestimonials() {
  const track  = document.getElementById('testimonialsTrack');
  const prev   = document.getElementById('tcardPrev');
  const next   = document.getElementById('tcardNext');
  const dots   = $$('.tdot');
  if (!track) return;
  const cards  = $$('.tcard', track);
  let current  = 0, timer;

  function show(i) {
    current = (i + cards.length) % cards.length;
    cards.forEach((c, idx) => {
      c.classList.toggle('tcard-active', idx === current);
      c.classList.toggle('tcard-hidden', idx !== current);
    });
    dots.forEach((d, idx) => d.classList.toggle('active', idx === current));
  }

  function isMobileView() { return window.innerWidth <= 768; }

  function startAuto() {
    clearInterval(timer);
    timer = setInterval(() => { if (isMobileView()) show(current + 1); }, 5000);
  }

  // On mobile, show only active card
  function init() {
    if (isMobileView()) {
      show(0);
      startAuto();
    } else {
      // On desktop show all; reset any hidden classes
      cards.forEach(c => { c.classList.remove('tcard-hidden', 'tcard-active'); });
    }
  }
  init();
  window.addEventListener('resize', init);

  prev?.addEventListener('click', () => { show(current - 1); startAuto(); });
  next?.addEventListener('click', () => { show(current + 1); startAuto(); });
  dots.forEach(d => d.addEventListener('click', () => { show(parseInt(d.dataset.i)); startAuto(); }));
})();

/* ── SCAN BEAM — pass delay data attr ──────────────────────── */
(function initScanBeamDelay() {
  $$('.service-card,.industry-card,.pf-card').forEach(c => {
    const d = parseInt(c.dataset.delay || '0', 10);
    c.style.setProperty('--delay', d);
  });
})();

/* ── PORTFOLIO TILT ─────────────────────────────────────────── */
(function initPFTilt() {
  if (reducedMotion() || isMobile()) return;
  $$('.pf-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width/2)  / (r.width/2);
      const dy = (e.clientY - r.top  - r.height/2) / (r.height/2);
      card.style.transform = `perspective(800px) rotateX(${-dy*5}deg) rotateY(${dx*5}deg) translateZ(5px) translateY(-5px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();
