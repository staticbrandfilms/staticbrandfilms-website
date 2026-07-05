/* ============================================================
   STATIC BRAND FILMS — HUD & motion
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- curtain (page-load reveal) ---------- */
  const curtain = document.querySelector('.curtain');
  if (curtain) {
    requestAnimationFrame(() => {
      setTimeout(() => curtain.classList.add('is-hidden'), 250);
    });
  }

  /* ---------- live timecode, 24fps ---------- */
  const tcEls = document.querySelectorAll('[data-tc]');
  if (tcEls.length) {
    const FPS = 24;
    const tick = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2,'0');
      const m = String(now.getMinutes()).padStart(2,'0');
      const s = String(now.getSeconds()).padStart(2,'0');
      const f = String(Math.floor((now.getMilliseconds()/1000)*FPS)).padStart(2,'0');
      const val = `${h}:${m}:${s}:${f}`;
      tcEls.forEach(el => el.textContent = val);
    };
    tick();
    setInterval(tick, 1000/FPS);
  }

  /* ---------- aperture readout, racks wide -> narrow on scroll ---------- */
  const fstop = document.querySelector('[data-fstop]');
  const STOPS = ['f/1.4','f/2','f/2.8','f/4','f/5.6','f/8','f/11','f/16'];
  if (fstop) {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      const idx = Math.min(STOPS.length - 1, Math.floor(progress * STOPS.length));
      fstop.textContent = STOPS[idx];
    };
    update();
    window.addEventListener('scroll', update, { passive:true });
    window.addEventListener('resize', update);
  }

  /* ---------- scroll-triggered rack-focus reveals ---------- */
  const targets = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -60px 0px' });
    targets.forEach(t => io.observe(t));
  } else {
    targets.forEach(t => t.classList.add('is-in'));
  }

  /* ---------- nav scroll backdrop ---------- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- mobile nav ---------- */
  const toggle = document.querySelector('.nav__toggle');
  const links = document.querySelector('.nav__links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      toggle.textContent = open ? 'CLOSE' : 'MENU';
      document.body.style.overflow = open ? 'hidden' : '';
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('is-open');
      toggle.textContent = 'MENU';
      document.body.style.overflow = '';
    }));
  }

  /* ---------- magnetic hover on primary buttons (desktop only) ---------- */
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width/2) * 0.18;
        const y = (e.clientY - r.top - r.height/2) * 0.4;
        btn.style.transform = `translate(${x}px, ${y - 2}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- work page filters ---------- */
  const filterBtns = document.querySelectorAll('[data-filter]');
  const reels = document.querySelectorAll('[data-category]');
  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const f = btn.dataset.filter;
        reels.forEach(r => {
          const match = f === 'all' || r.dataset.category === f;
          r.classList.toggle('reel--hidden', !match);
        });
      });
    });
  }
});
