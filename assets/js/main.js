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

  /* ---------- Hero tiles + problem finder → filter products ---------- */
  document.querySelectorAll('a[data-filter]').forEach(function (link) {
    link.addEventListener('click', function () {
      applyFilter(link.getAttribute('data-filter'));
    });
  });

  /* ---------- Open / closed badge ----------
     Hours as listed on the shop's Google Maps page (confirm with owner):
     Saturday–Thursday 9:00–17:00, Friday closed. Times are Pakistan time (UTC+5). */
  var OPEN_HOUR = 9;
  var CLOSE_HOUR = 17;
  var CLOSED_DAY = 5; // Friday (0 = Sunday)
  var DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  var statusEl = document.querySelector('.js-status');
  var statusText = document.querySelector('.js-status-text');

  function updateStatus() {
    if (!statusEl || !statusText) return;
    var now = new Date();
    var pk = new Date(now.getTime() + (now.getTimezoneOffset() + 300) * 60000);
    var day = pk.getDay();
    var hour = pk.getHours() + pk.getMinutes() / 60;
    var isOpen = day !== CLOSED_DAY && hour >= OPEN_HOUR && hour < CLOSE_HOUR;
    var text;

    if (isOpen) {
      text = 'Open now · until 5pm';
    } else if (day !== CLOSED_DAY && hour < OPEN_HOUR) {
      text = 'Closed · opens today 9am';
    } else {
      var next = (day + 1) % 7;
      if (next === CLOSED_DAY) next = (next + 1) % 7;
      text = 'Closed · opens ' + (next === (day + 1) % 7 ? 'tomorrow' : DAY_NAMES[next]) + ' 9am';
    }

    statusText.textContent = text;
    statusEl.classList.toggle('is-open', isOpen);
    statusEl.hidden = false;
  }

  updateStatus();
  setInterval(updateStatus, 60000);
})();
