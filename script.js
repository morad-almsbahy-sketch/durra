// ===== دُرَّة | التفاعل =====
const WA_NUMBER = '966564146686'; // 0564146686

const fmtPrice = (n) => n.toLocaleString('en-US') + ' ر.س';

// بطاقة قطعة (تفتح واتساب برسالة جاهزة)
function cardHTML(p, lazy) {
  const msg = `مرحباً دُرَّة، أرغب بالاستفسار عن: ${p.name} (${fmtPrice(p.price)})`;
  const href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  return `
    <a class="pcard" data-cat="${p.cat}" href="${href}" target="_blank" rel="noopener" draggable="false">
      <div class="pcard-img">
        <img src="${p.img}" alt="${p.name}" draggable="false" decoding="async" ${lazy ? 'loading="lazy"' : ''}>
        <span class="pcard-ask">استفسر عن القطعة</span>
      </div>
      <div class="pcard-body">
        <div>
          <div class="pcard-name">${p.name}</div>
          <div class="pcard-meta">${p.type} · ${p.metal}</div>
        </div>
        <div class="pcard-price">${fmtPrice(p.price)}</div>
      </div>
    </a>`;
}

// الصف الأفقي
function initCarousel() {
  const track = document.getElementById('carousel');
  if (!track || typeof PRODUCTS === 'undefined') return;

  track.innerHTML = PRODUCTS.map((p, i) => cardHTML(p, i > 3)).join('');

  const prev = document.querySelector('.car-prev');
  const next = document.querySelector('.car-next');
  const bar = document.querySelector('.car-progress span');
  const rtl = getComputedStyle(track).direction === 'rtl';
  const sign = rtl ? -1 : 1;
  const maxScroll = () => track.scrollWidth - track.clientWidth;
  const pos = () => Math.abs(track.scrollLeft);
  const step = () => Math.max(track.clientWidth * 0.8, 260);

  function update() {
    const m = maxScroll();
    const ratio = track.clientWidth / track.scrollWidth;
    const p = m > 0 ? pos() / m : 0;
    bar.style.width = (ratio * 100) + '%';
    bar.style[rtl ? 'right' : 'left'] = (p * (1 - ratio) * 100) + '%';
    prev.disabled = pos() < 4;
    next.disabled = pos() > m - 4;
  }

  next.addEventListener('click', () => track.scrollBy({ left: sign * step(), behavior: 'smooth' }));
  prev.addEventListener('click', () => track.scrollBy({ left: -sign * step(), behavior: 'smooth' }));
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();

  // أسهم لوحة المفاتيح
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') track.scrollBy({ left: -step(), behavior: 'smooth' });
    if (e.key === 'ArrowRight') track.scrollBy({ left: step(), behavior: 'smooth' });
  });

  // السحب بالفأرة (اللمس يعمل تلقائياً)
  let down = false, moved = false, startX = 0, startScroll = 0;
  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    down = true; moved = false; startX = e.clientX; startScroll = track.scrollLeft;
  });
  window.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 5) { moved = true; track.classList.add('dragging'); }
    if (moved) track.scrollLeft = startScroll - dx;
  });
  window.addEventListener('pointerup', () => {
    if (!down) return;
    down = false;
    track.classList.remove('dragging');
  });
  track.addEventListener('click', (e) => {
    if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
  }, true);
  track.addEventListener('dragstart', (e) => e.preventDefault());
}

// شبكة المنتجات + التصفية
function initProductGrid() {
  const grid = document.getElementById('productGrid');
  if (!grid || typeof PRODUCTS === 'undefined') return;

  grid.innerHTML = PRODUCTS.map((p, i) => cardHTML(p, i > 3)).join('');

  const btns = document.querySelectorAll('.filter-btn');
  const cards = grid.querySelectorAll('.pcard');
  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      btns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      cards.forEach((c) => c.classList.toggle('hide', cat !== 'all' && c.dataset.cat !== cat));
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // قائمة الجوال
  const menuBtn = document.querySelector('.menu-btn');
  const navLinks = document.querySelector('.nav-links');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      menuBtn.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
  }

  initCarousel();
  initProductGrid();

  // ظهور العناصر تدريجياً
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('visible'));
  }

  // الطلب عبر واتساب (أزرار الدعوة)
  document.querySelectorAll('[data-order]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const msg = `مرحباً دُرَّة، ${btn.dataset.order}`;
      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    });
  });

  // سنة الفوتر
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
});
