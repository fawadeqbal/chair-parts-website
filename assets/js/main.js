/* Ali Chair Parts — page behaviour.
   Progressive enhancement: without JS every WhatsApp/phone link, the full
   catalog and the anchors still work. */
(function () {
  'use strict';

  var WHATSAPP_NUMBER = '923002603791';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var live = document.getElementById('live');

  var CATEGORY_NAMES = {
    gas: 'Gas lifts', base: 'Wheels & bases', arm: 'Armrests',
    mech: 'Mechanisms', seat: 'Seats & foam', chair: 'Complete chairs'
  };

  /* "Check your old part" guides shown in quick view, by part kind.
     General measuring steps only — exact sizes come from the shop. */
  var MEASURE = {
    gas: [
      'Measure the cylinder on the chair, or pull it out of the base.',
      'Note the total length (top to bottom) and the width of the black body.',
      'Look for a class marking printed on it, then send the numbers or a photo.'
    ],
    castor: [
      'Pull one wheel straight out of the base.',
      'Measure the width of the metal stem. Most chairs use 11 mm, some use 10 mm, and the two don’t swap.',
      'Send the size, or a photo of the wheel next to a ruler.'
    ],
    base: [
      'Measure from the centre of the base to the tip of one leg, then double it.',
      'Measure the width of the centre hole the gas lift sits in (universal bases are usually 50 mm).',
      'Check the wheel sockets: most take an 11 mm stem.'
    ],
    arm: [
      'Turn the chair over and find the arm’s screws under the seat.',
      'Measure the distance between the screw holes, centre to centre, in mm.',
      'Send the measurement, or a photo with a ruler beside it.'
    ],
    mech: [
      'Turn the chair over and find the metal plate under the seat.',
      'Measure the spacing of its four screw holes: side to side and front to back.',
      'Note where the levers sit (left, right or both), then send a photo.'
    ],
    seat: [
      'Measure the seat’s width and depth.',
      'Check how it’s fixed: screws underneath, or a shell that clips on.',
      'Send the sizes or a photo.'
    ],
    chair: [
      'Visit the shop to sit in it before you buy.',
      'Or ask us on WhatsApp for more photos, colours and today’s price.'
    ]
  };

  function announce(text) {
    if (!live) return;
    live.textContent = '';
    window.setTimeout(function () { live.textContent = text; }, 30);
  }

  function waUrl(text) {
    return 'https://wa.me/' + WHATSAPP_NUMBER + (text ? '?text=' + encodeURIComponent(text) : '');
  }

  function productText(name) {
    return 'Assalam o Alaikum, mujhe yeh chahiye: ' + name + '. Price kya hai?';
  }

  /* ---------- WhatsApp links with a pre-filled message ---------- */
  document.querySelectorAll('.js-wa').forEach(function (link) {
    link.href = waUrl(link.getAttribute('data-wa-text'));
    link.target = '_blank';
    link.rel = 'noopener';
  });

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector('.js-menu-btn');
  var nav = document.getElementById('site-nav');

  function setMenu(open) {
    if (!menuBtn || !nav) return;
    nav.classList.toggle('hidden', !open);
    nav.classList.toggle('flex', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menuBtn.querySelector('.js-menu-open').classList.toggle('hidden', open);
    menuBtn.querySelector('.js-menu-close').classList.toggle('hidden', !open);
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (menuBtn.getAttribute('aria-expanded') === 'true' && !e.target.closest('header')) setMenu(false);
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (mq) { if (mq.matches) setMenu(false); });
  }

  /* ---------- Open / closed badge ----------
     Hours as listed on the shop's Google Maps page (confirm with owner):
     Saturday–Thursday 9:00–17:00, Friday closed. Pakistan time (UTC+5). */
  var statusEl = document.querySelector('.js-status');
  var statusText = document.querySelector('.js-status-text');
  var statusDot = document.querySelector('.js-status-dot');
  var DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function updateStatus() {
    if (!statusEl) return;
    var now = new Date();
    var pk = new Date(now.getTime() + (now.getTimezoneOffset() + 300) * 60000);
    var day = pk.getDay();
    var hour = pk.getHours() + pk.getMinutes() / 60;
    var CLOSED_DAY = 5;
    var isOpen = day !== CLOSED_DAY && hour >= 9 && hour < 17;
    var text;
    if (isOpen) text = 'Open now · until 5pm';
    else if (day !== CLOSED_DAY && hour < 9) text = 'Closed · opens today 9am';
    else {
      var next = (day + 1) % 7;
      if (next === CLOSED_DAY) next = (next + 1) % 7;
      text = 'Closed · opens ' + (next === (day + 1) % 7 ? 'tomorrow' : DAY_NAMES[next]) + ' 9am';
    }
    statusText.textContent = text;
    statusDot.classList.toggle('bg-emerald-600', isOpen);
    statusDot.classList.toggle('bg-slate-400', !isOpen);
    statusEl.classList.remove('hidden');
    statusEl.classList.add('inline-flex');
  }
  updateStatus();
  window.setInterval(updateStatus, 60000);

  /* ---------- Filters ---------- */
  var chips = document.querySelectorAll('[data-chip]');
  var groups = document.querySelectorAll('[data-group]');
  var countEl = document.querySelector('.js-count');
  var products = document.getElementById('products');

  function visibleCount() {
    var n = 0;
    groups.forEach(function (g) { if (!g.hidden) n += g.querySelectorAll('[data-card]').length; });
    return n;
  }

  function applyFilter(cat, opts) {
    opts = opts || {};
    var swap = function () {
      groups.forEach(function (g) { g.hidden = cat !== 'all' && g.getAttribute('data-group') !== cat; });
      chips.forEach(function (c) {
        var on = c.getAttribute('data-filter') === cat;
        c.setAttribute('aria-pressed', String(on));
        if (on && c.parentElement.scrollWidth > c.parentElement.clientWidth) {
          c.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
        }
      });
      var n = visibleCount();
      if (countEl) countEl.textContent = String(n);
      announce('Showing ' + n + ' ' + (cat === 'all' ? 'items' : CATEGORY_NAMES[cat].toLowerCase()));
    };
    // Scroll only after the new layout is in place, so the target doesn't move mid-scroll
    var scrollToGrid = function () {
      if (opts.scroll && products) {
        products.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
      }
    };
    if (!document.startViewTransition || reduceMotion.matches) { swap(); scrollToGrid(); return; }
    document.startViewTransition(swap).updateCallbackDone.then(scrollToGrid);
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () { applyFilter(chip.getAttribute('data-filter')); });
  });

  // Hero part tiles and problem tiles: each one is a filter
  document.querySelectorAll('a[data-filter]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      applyFilter(link.getAttribute('data-filter'), { scroll: true });
      if (history.replaceState) history.replaceState(null, '', '#products');
    });
  });

  /* ---------- Quote list ---------- */
  var quote = new Map(); // id -> { name, qty }
  var counter = document.querySelector('[data-quote-count]');
  var quoteBtn = document.querySelector('.js-quote-btn');

  try {
    JSON.parse(sessionStorage.getItem('quote') || '[]').forEach(function (row) { quote.set(row[0], row[1]); });
  } catch (err) { /* storage blocked: list just starts empty */ }

  function saveQuote() {
    try { sessionStorage.setItem('quote', JSON.stringify(Array.from(quote.entries()))); } catch (err) { /* ignore */ }
  }

  function setPressed(btn, on) {
    if (!btn) return;
    btn.setAttribute('aria-pressed', String(on));
    var label = btn.querySelector('[data-label]');
    if (label) label.textContent = on ? 'Added ✓' : 'Add to quote';
  }

  function renderCounter(pop) {
    var n = quote.size;
    if (counter) {
      counter.textContent = String(n);
      counter.classList.toggle('bg-emerald-700', n > 0);
      counter.classList.toggle('text-white', n > 0);
      counter.classList.toggle('bg-slate-200', n === 0);
      counter.classList.toggle('text-slate-700', n === 0);
      if (pop && !reduceMotion.matches) {
        counter.classList.remove('is-popping');
        void counter.offsetWidth; // restart the animation
        counter.classList.add('is-popping');
      }
    }
    if (quoteBtn) quoteBtn.setAttribute('aria-label', 'Quote list, ' + n + ' item' + (n === 1 ? '' : 's'));
  }

  function cardFor(id) { return document.querySelector('[data-card][data-id="' + id + '"]'); }

  function toggleQuote(id, name) {
    var on = !quote.has(id);
    if (on) quote.set(id, { name: name, qty: 1 }); else quote.delete(id);
    var card = cardFor(id);
    if (card) setPressed(card.querySelector('[data-add-quote]'), on);
    if (qvCurrent && qvCurrent.getAttribute('data-id') === id) setPressed(qvAdd, on);
    saveQuote();
    renderCounter(true);
    announce(name + (on ? ' added' : ' removed') + '. Quote list: ' + quote.size + ' item' + (quote.size === 1 ? '' : 's') + '.');
  }

  // Restore button states from a previous page view in this session
  quote.forEach(function (_, id) {
    var card = cardFor(id);
    if (card) setPressed(card.querySelector('[data-add-quote]'), true);
  });
  renderCounter(false);

  /* ---------- Dialog helpers ---------- */
  function openDialog(dlg, opener, focusEl) {
    setMenu(false);
    dlg._opener = opener || null;
    dlg.showModal();
    if (focusEl) focusEl.focus();
  }
  function wireDialog(dlg, canClose) {
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg && canClose()) dlg.close(); // backdrop
    });
    dlg.addEventListener('cancel', function (e) { if (!canClose()) e.preventDefault(); }); // Esc
    dlg.addEventListener('close', function () {
      if (dlg._opener && document.contains(dlg._opener)) dlg._opener.focus();
    });
    dlg.querySelectorAll('[data-close]').forEach(function (b) {
      b.addEventListener('click', function () { if (canClose()) dlg.close(); });
    });
  }

  /* ---------- Quick view ---------- */
  var qv = document.getElementById('qv');
  var qvAdd = qv && qv.querySelector('[data-qv-add]');
  var qvCurrent = null;

  function openQuickView(card, opener) {
    qvCurrent = card;
    var d = card.dataset;
    var img = card.querySelector('img');
    var qvImg = qv.querySelector('[data-qv-img]');
    qvImg.src = img.currentSrc || img.src;
    qvImg.alt = img.alt;
    qvImg.style.objectPosition = img.style.objectPosition || '';
    var contain = img.classList.contains('object-contain');
    qvImg.classList.toggle('object-contain', contain);
    qvImg.classList.toggle('bg-white', contain);
    qvImg.classList.toggle('p-6', contain);
    qvImg.classList.toggle('object-cover', !contain);

    qv.querySelector('[data-qv-cat]').textContent = CATEGORY_NAMES[d.cat] || 'Part';
    qv.querySelector('[data-qv-name]').textContent = d.name;
    qv.querySelector('[data-qv-fixes]').textContent = d.fixes;
    qv.querySelector('[data-qv-note]').textContent = d.note;
    qv.querySelector('[data-qv-price]').textContent = d.price;
    var list = qv.querySelector('[data-qv-measure]');
    list.replaceChildren.apply(list, (MEASURE[d.kind] || []).map(function (step) {
      var li = document.createElement('li');
      li.textContent = step;
      return li;
    }));
    var wa = qv.querySelector('[data-qv-wa]');
    wa.href = waUrl(productText(d.name));
    setPressed(qvAdd, quote.has(d.id));
    openDialog(qv, opener, qv.querySelector('#qv-title'));
  }

  if (qv) {
    wireDialog(qv, function () { return true; });
    qvAdd.addEventListener('click', function () {
      if (qvCurrent) toggleQuote(qvCurrent.getAttribute('data-id'), qvCurrent.getAttribute('data-name'));
    });
  }

  /* ---------- Request for quote ---------- */
  var rfq = document.getElementById('rfq');
  var form = document.getElementById('rfq-form');
  var rfqList = document.getElementById('rfq-items');
  var dirty = false;

  function rfqCanClose() {
    if (!dirty) return true;
    if (window.confirm('Discard this request?')) { dirty = false; return true; }
    return false;
  }

  function renderRfqItems() {
    var rows = Array.from(quote.entries()).map(function (entry) {
      var id = entry[0], item = entry[1];
      var li = document.createElement('li');
      li.className = 'flex items-center gap-3 py-2';
      li.innerHTML =
        '<span class="flex-1 text-[15px] font-semibold leading-snug"></span>' +
        '<label class="flex items-center gap-2 text-sm text-slate-600">Qty' +
        '<input type="number" min="1" max="9999" inputmode="numeric" class="min-h-11 w-20 rounded-lg border border-slate-500 px-2 text-base tabular-nums text-slate-900"></label>' +
        '<button type="button" class="grid size-11 place-items-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900">' +
        '<svg class="size-4" aria-hidden="true"><use href="#i-close"/></svg></button>';
      li.querySelector('span').textContent = item.name; // text only, never HTML
      var qty = li.querySelector('input');
      qty.value = item.qty;
      qty.setAttribute('aria-label', 'Quantity of ' + item.name);
      qty.addEventListener('change', function () {
        item.qty = Math.min(9999, Math.max(1, parseInt(qty.value, 10) || 1));
        qty.value = item.qty;
        saveQuote();
      });
      var remove = li.querySelector('button');
      remove.setAttribute('aria-label', 'Remove ' + item.name);
      remove.addEventListener('click', function () {
        toggleQuote(id, item.name);
        renderRfqItems();
        (form.elements.notes).focus();
      });
      return li;
    });
    rfqList.replaceChildren.apply(rfqList, rows);
    form.querySelector('.js-rfq-list').hidden = quote.size === 0;
  }

  if (rfq && form) {
    wireDialog(rfq, rfqCanClose);
    form.addEventListener('input', function () { dirty = true; });
    rfq.addEventListener('close', function () { dirty = false; });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      form.querySelectorAll('[required]').forEach(function (el) {
        var ok = el.checkValidity();
        el.setAttribute('aria-invalid', String(!ok));
        document.getElementById(el.id + '-error').hidden = ok;
        if (!ok && !firstBad) firstBad = el;
      });
      var notes = form.elements.notes.value.trim();
      var empty = quote.size === 0 && !notes;
      document.getElementById('rfq-empty-error').hidden = !empty;
      if (firstBad) { firstBad.focus(); return; }
      if (empty) { form.elements.notes.focus(); return; }

      var company = form.elements.company.value.trim();
      var lines = ['Assalam o Alaikum, quotation request:'];
      quote.forEach(function (item) { lines.push('• ' + item.name + ' × ' + item.qty); });
      if (notes) lines.push('Details: ' + notes);
      lines.push('Name: ' + form.elements.name.value.trim() + (company ? ' (' + company + ')' : ''));
      lines.push('City: ' + form.elements.city.value);
      lines.push('Mobile: ' + form.elements.phone.value.trim());

      window.open(waUrl(lines.join('\n')), '_blank', 'noopener');
      dirty = false;
      rfq.close();
      announce('Your request opened in WhatsApp. Press send there to reach the shop.');
    });

    // Clear an error as soon as the field becomes valid
    form.querySelectorAll('[required]').forEach(function (el) {
      el.addEventListener('input', function () {
        if (el.getAttribute('aria-invalid') === 'true' && el.checkValidity()) {
          el.setAttribute('aria-invalid', 'false');
          document.getElementById(el.id + '-error').hidden = true;
        }
      });
    });
  }

  /* ---------- Map: load when it's about to scroll into view ---------- */
  var mapFrame = document.querySelector('.js-map');
  if (mapFrame) {
    var loadMap = function () {
      if (mapFrame.src) return;
      mapFrame.addEventListener('load', function () { mapFrame.classList.remove('invisible'); });
      mapFrame.src = mapFrame.getAttribute('data-src');
    };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (en) { return en.isIntersecting; })) { loadMap(); io.disconnect(); }
      }, { rootMargin: '300px 0px' });
      io.observe(mapFrame);
    } else {
      loadMap();
    }
  }

  /* ---------- One click handler for cards and RFQ triggers ---------- */
  document.addEventListener('click', function (e) {
    var add = e.target.closest('[data-add-quote]');
    if (add) {
      var card = add.closest('[data-card]');
      toggleQuote(card.getAttribute('data-id'), card.getAttribute('data-name'));
      return;
    }
    var view = e.target.closest('[data-quickview]');
    if (view && qv) { openQuickView(view.closest('[data-card]'), view); return; }
    var open = e.target.closest('[data-open-rfq]');
    if (open && rfq) {
      renderRfqItems();
      openDialog(rfq, open, rfq.querySelector('#rfq-title'));
    }
  });
})();
