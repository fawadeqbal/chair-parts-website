/* Ali Chair Parts — page behaviour.
   Everything here is progressive enhancement: without JS the menu links,
   WhatsApp/phone links and the full product list still work. */
(function () {
  'use strict';

  var WHATSAPP_NUMBER = '923002603791';

  /* ---------- WhatsApp links with a pre-filled message ---------- */
  function waUrl(text) {
    return 'https://wa.me/' + WHATSAPP_NUMBER + (text ? '?text=' + encodeURIComponent(text) : '');
  }

  document.querySelectorAll('.js-wa').forEach(function (link) {
    var text = link.getAttribute('data-wa-text');
    var product = link.getAttribute('data-product');
    if (product) text = 'Assalam o Alaikum, mujhe yeh chahiye: ' + product + '. Price kya hai?';
    link.href = waUrl(text);
    link.target = '_blank';
    link.rel = 'noopener';
  });

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenu(false);
        menuBtn.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !e.target.closest('.header')) setMenu(false);
    });
    window.matchMedia('(min-width: 960px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ---------- Product filters ---------- */
  var chips = document.querySelectorAll('.chip[data-filter]');
  var cards = document.querySelectorAll('.card[data-cat]');
  var countEl = document.querySelector('.js-count');

  function applyFilter(cat) {
    var shown = 0;
    cards.forEach(function (card) {
      var match = cat === 'all' || card.getAttribute('data-cat') === cat;
      card.hidden = !match;
      if (match) shown++;
    });
    chips.forEach(function (chip) {
      var active = chip.getAttribute('data-filter') === cat;
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-pressed', String(active));
      if (active && chip.scrollIntoView && chip.parentElement.scrollWidth > chip.parentElement.clientWidth) {
        chip.scrollIntoView({ block: 'nearest', inline: 'center' });
      }
    });
    if (countEl) countEl.textContent = String(shown);
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      applyFilter(chip.getAttribute('data-filter'));
    });
  });

  /* ---------- Problem finder → filter products ---------- */
  document.querySelectorAll('.problem[data-filter]').forEach(function (link) {
    link.addEventListener('click', function () {
      applyFilter(link.getAttribute('data-filter'));
    });
  });
})();
