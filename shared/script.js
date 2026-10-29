// Shared by all designs: mobile menu, number counters, loader, demo form.

document.documentElement.classList.add('js');

// Mobile menu
const toggle = document.querySelector('.nav-toggle');
const links = document.getElementById('nav-links');
if (toggle && links) {
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
}

// Numbers count up once when they scroll into view
function countUp(el) {
  const target = Number(el.dataset.target) || 0;
  const steps = 40;
  let i = 0;
  const timer = setInterval(() => {
    i++;
    const p = i / steps;
    el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
    if (i >= steps) { el.textContent = String(target); clearInterval(timer); }
  }, 40);
}

function initCounters() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      countUp(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.num[data-target]').forEach(el => {
    el.textContent = '0';   // real value is in the HTML; animate up from 0 once visible
    io.observe(el);
  });
}

// Page loader: visible for at least 1.4s, then fades out
const loader = document.getElementById('loader');
if (loader) {
  const t0 = performance.now();
  const hideLoader = () => {
    setTimeout(() => {
      loader.classList.add('done');
      initCounters();
      initMotion();
      setTimeout(() => loader.remove(), 600);
    }, Math.max(0, 1400 - (performance.now() - t0)));
  };
  if (document.readyState === 'complete') hideLoader();
  else window.addEventListener('load', hideLoader);
} else {
  initCounters();
  initMotion();
}

// Demo contact form (mock-up only: nothing is sent anywhere)
document.querySelectorAll('form[data-demo-form]').forEach(form => {
  const status = form.querySelector('.form-status');
  form.addEventListener('submit', ev => {
    ev.preventDefault();
    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const ok = name && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    status.classList.toggle('error', !ok);
    if (!ok) { status.textContent = 'Please enter your name and a valid email.'; return; }
    form.reset();
    status.textContent = 'Thank you. (Demo only, nothing was sent.)';
  });
});

// "How it works" tabs: employers / job seekers
const tabs = [...document.querySelectorAll('.tabs [role="tab"]')];
function selectTab(tab, focus) {
  tabs.forEach(t => {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
  });
  if (focus) tab.focus();
}
if (tabs.length) {
  selectTab(tabs[0], false);
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t, false));
    t.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') selectTab(tabs[(i + 1) % tabs.length], true);
      if (e.key === 'ArrowLeft') selectTab(tabs[(i - 1 + tabs.length) % tabs.length], true);
    });
  });
}
// Links that open a specific tab, e.g. "Looking for a job?"
document.querySelectorAll('[data-open-tab]').forEach(a => {
  a.addEventListener('click', () => {
    const t = document.getElementById('tab-' + a.dataset.openTab);
    if (t) selectTab(t, false);
  });
});
// Buttons that pre-select who is writing in the contact form
document.querySelectorAll('[data-audience]').forEach(a => {
  a.addEventListener('click', () => {
    const radio = document.querySelector('input[name="audience"][value="' + a.dataset.audience + '"]');
    if (radio) radio.checked = true;
  });
});

// ---------- Motion: scroll reveal, people entrance, progress line, call button ----------
function initMotion() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1) Elements that fade and rise, staggered within their group
  const groups = [
    '.hero-text, .hero-grid > div:first-child, .opening, .stats-grid, .figures-grid',
    '.row .text, .block, .process .wrap, .motto-wrap > div, .who > div, .contact-grid, .page > section, .page > .opening, .team'
  ];
  const revealSel = '.hero-text > *, .hero-grid > div:first-child > *, .opening > *, .stats-grid > div, .figures-grid > div, .figures > div, .figures dl > div, .row > .label, .text > h2, .text > p, .list li, .grid2 > div, .block > h2, .who > div > *, .motto-wrap > div > *, .motto li, .motto > div, .flow li, .timeline li, details, .two > div, .promise > div, .contact-grid > *, .page > section > h2, .page > section > p, .paths';
  const items = [...document.querySelectorAll(revealSel)].filter(el => !el.closest('#loader') && !el.closest('.panel[hidden]'));
  const seen = new Set();
  items.forEach(el => {
    if (seen.has(el)) return; seen.add(el);
    const siblings = [...el.parentElement.children].filter(c => items.includes(c));
    const i = Math.max(0, siblings.indexOf(el));
    el.classList.add('rv');
    el.style.setProperty('--d', Math.min(i * 0.08, 0.4) + 's');
  });

  // 2) People photos: the photo rises and the shapes behind it grow in
  const people = [...document.querySelectorAll('.cutout, .panel-photo, .hero-art, .team-art')];
  people.forEach(el => el.classList.add('rvp'));

  const targets = [...document.querySelectorAll('.rv, .rvp')];
  if (reduce || !('IntersectionObserver' in window)) { targets.forEach(t => t.classList.add('in')); }
  else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(t => io.observe(t));
  }

  // 3) Reading progress line
  const bar = document.createElement('div'); bar.className = 'progress'; bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  let ticking = false;
  const update = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(window.scrollY / h, 1) : 0) + ')';
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();

  // 4) Quick call button for phones
  const fab = document.createElement('a');
  fab.className = 'call-fab'; fab.href = 'tel:+919899888834'; fab.textContent = 'Call us';
  document.body.appendChild(fab);
}

// Hide the sticky header while scrolling down on phones, show it again on scroll up
(function () {
  const header = document.querySelector('.site-header');
  if (!header) return;
  let last = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const menuOpen = document.getElementById('nav-links')?.classList.contains('open');
    if (y > last + 6 && y > 120 && !menuOpen) header.classList.add('hide');
    else if (y < last - 6 || y < 80) header.classList.remove('hide');
    last = y;
  }, { passive: true });
})();

// ---------- Orbs behind people: built here so each photo gets its own set of moving shapes ----------
(function () {
  const boxes = [...document.querySelectorAll('.cutout, .panel-photo')];
  if (!boxes.length) return;
  boxes.forEach(box => {
    ['o1', 'o2', 'o3', 'o4'].forEach(c => {
      const o = document.createElement('span');
      o.className = 'orb ' + c; o.setAttribute('aria-hidden', 'true');
      box.insertBefore(o, box.firstChild);
    });
  });

  // run animations only while a photo is on screen
  if ('IntersectionObserver' in window) {
    const live = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('live', e.isIntersecting)), { rootMargin: '80px' });
    boxes.forEach(b => live.observe(b));
  } else { boxes.forEach(b => b.classList.add('live')); }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // scroll parallax (works on phones) and mouse parallax (desktops)
  let raf = 0, mx = null, my = null;
  const paint = () => {
    raf = 0;
    const vh = window.innerHeight;
    boxes.forEach(b => {
      const r = b.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      b.style.setProperty('--sy', (((r.top + r.height / 2) - vh / 2) / vh).toFixed(3));
      if (mx !== null) {
        const dx = (mx - (r.left + r.width / 2)) / Math.max(window.innerWidth, 1);
        const dy = (my - (r.top + r.height / 2)) / Math.max(vh, 1);
        b.style.setProperty('--mx', Math.max(-1, Math.min(1, dx * 2)).toFixed(3));
        b.style.setProperty('--my', Math.max(-1, Math.min(1, dy * 2)).toFixed(3));
      }
    });
  };
  const queue = () => { if (!raf) raf = requestAnimationFrame(paint); };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  if (window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; queue(); }, { passive: true });
  }
  queue();
})();
