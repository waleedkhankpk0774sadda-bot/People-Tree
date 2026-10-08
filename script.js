/* PeopleTree — front-end interactions */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const FREE_SHIP = 2000; // free-delivery goal (Rs.) shown in the cart

  /* Mobile menu */
  const menu = $('.menu-toggle'), nav = $('.main-nav');
  menu.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', open);
  });
  $$('.main-nav a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

  /* Toast */
  const toastEl = $('#toast'); let toastT;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  /* Cart (quantities + saved in the browser) */
  const drawer = $('.cart-drawer');
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem('pt-cart')) || []; } catch (e) { cart = []; }
  const save = () => { try { localStorage.setItem('pt-cart', JSON.stringify(cart)); } catch (e) {} };
  const openCart = () => { renderCart(); drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); };
  const closeCart = () => { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); };

  function renderCart() {
    const box = $('#cartItems'); box.innerHTML = '';
    let total = 0, count = 0;
    if (!cart.length) box.innerHTML = '<p class="cart-empty">Your cart is empty — fresh cheese is waiting.</p>';
    cart.forEach((item, i) => {
      total += item.price * item.qty; count += item.qty;
      const row = document.createElement('div');
      row.className = 'cart-row';
      row.innerHTML = `<span class="name">${item.name}</span>
        <span class="qty"><button aria-label="Decrease ${item.name}" data-a="dec" data-i="${i}">−</button><b>${item.qty}</b><button aria-label="Increase ${item.name}" data-a="inc" data-i="${i}">+</button></span>
        <strong>Rs. ${(item.price * item.qty).toLocaleString()}</strong>
        <button class="rm" aria-label="Remove ${item.name}" data-a="rm" data-i="${i}">×</button>`;
      box.appendChild(row);
    });
    $('#total').textContent = total.toLocaleString();
    const badge = $('#cartCount'); badge.textContent = count;
    const left = FREE_SHIP - total;
    $('#shipMsg').textContent = !cart.length ? `Free delivery on orders above Rs. ${FREE_SHIP.toLocaleString()}`
      : left > 0 ? `Add Rs. ${left.toLocaleString()} more for free delivery` : 'You’ve unlocked free delivery 🎉';
    $('#shipFill').style.width = Math.min(100, total / FREE_SHIP * 100) + '%';
  }

  $('#cartItems').addEventListener('click', e => {
    const b = e.target.closest('button[data-a]'); if (!b) return;
    const i = +b.dataset.i, a = b.dataset.a;
    if (a === 'inc') cart[i].qty++;
    if (a === 'dec') cart[i].qty--;
    if (a === 'rm' || cart[i].qty < 1) cart.splice(i, 1);
    save(); renderCart();
  });

  $$('.add-btn').forEach(btn => btn.addEventListener('click', () => {
    const card = btn.closest('.product-card'), name = card.dataset.name, price = +card.dataset.price;
    const found = cart.find(c => c.name === name);
    found ? found.qty++ : cart.push({ name, price, qty: 1 });
    save(); renderCart();
    const badge = $('#cartCount'); badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump');
    toast(`${name} added to cart`);
  }));
  $('.cart-btn').addEventListener('click', openCart);
  $('.close-cart').addEventListener('click', closeCart);
  drawer.addEventListener('click', e => { if (e.target === drawer) closeCart(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeCart(); nav.classList.remove('open'); } });
  $('.checkout').addEventListener('click', () => {
    if (!cart.length) return toast('Add something to your cart first');
    alert('Checkout flow is ready to connect to your payment/order backend.');
  });
  renderCart();

  /* Newsletter */
  $('#newsletter').addEventListener('submit', e => {
    e.preventDefault();
    $('#formMsg').textContent = 'Thanks — you’re on the PeopleTree list.';
    toast('Subscribed ✓'); e.target.reset();
  });
  $('#year').textContent = new Date().getFullYear();

  /* Scroll: header shrink, progress bar, back-to-top, active nav link */
  const header = $('.site-header'), bar = $('.scroll-progress'), toTop = $('#toTop');
  const links = $$('.main-nav a'), sections = ['#top', '#products', '#story', '#journal', '#contact'];
  let ticking = false;
  function onScroll() {
    const y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle('scrolled', y > 40);
    bar.style.width = (max > 0 ? y / max * 100 : 0) + '%';
    toTop.classList.toggle('show', y > 700);
    let current = '#top';
    sections.forEach(id => { const el = $(id); if (el && el.getBoundingClientRect().top < innerHeight * 0.4) current = id; });
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === current && a === links.find(l => l.getAttribute('href') === current)));
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  onScroll();

  /* Reveal on scroll (staggered inside grids) */
  const reveals = $$('[data-reveal]');
  $$('.product-grid, .benefits').forEach(g => $$('[data-reveal]', g).forEach((el, i) => el.style.setProperty('--d', i * 0.09 + 's')));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: 0.12 });
    reveals.forEach(el => io.observe(el));
  } else reveals.forEach(el => el.classList.add('in'));

})();
