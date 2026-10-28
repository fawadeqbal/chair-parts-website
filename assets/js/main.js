/* Ali Chair Parts — page behaviour.
   Progressive enhancement: without JS every WhatsApp/phone link, the full
   catalog, the hero slides (swipe) and the anchors still work. */
(function () {
  'use strict';

  var WHATSAPP_NUMBER = '923002603791';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var live = document.getElementById('live');

  // Keep in sync with CATEGORIES in tools/build-products.py
  var CATEGORY_NAMES = {
    office: 'Office chairs', gaming: 'Gaming chairs', gas: 'Gas lifts', base: 'Wheels & bases',
    arm: 'Armrests', mech: 'Mechanisms', seat: 'Seats & foam'
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
      'Or ask us on WhatsApp for more photos, colours and today’s price.',
      'Buying several? Add it to your quote list with a quantity.'
    ]
  };

  function behavior() { return reduceMotion.matches ? 'auto' : 'smooth'; }

  function announce(text) {
    if (!live) return;
    live.textContent = '';
    window.setTimeout(function () { live.textContent = text; }, 30);
  }

  function plural(n, word) { return n + ' ' + word + (n === 1 ? '' : 's'); }

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

  /* ---------- Open / closed status ----------
     Hours as listed on the shop's Google Maps page (confirm with owner):
     Saturday–Thursday 9:00–17:00, Friday closed. Pakistan time (UTC+5). */
  var statusEl = document.querySelector('.js-status');
  var statusText = document.querySelector('.js-status-text');
  var statusDot = document.querySelector('.js-status-dot');
  var statusFallback = document.querySelector('.js-status-fallback');
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
    statusDot.classList.toggle('bg-stone-400', !isOpen);
    statusEl.classList.remove('hidden');
    statusEl.classList.add('flex');
    if (statusFallback) statusFallback.hidden = true;
  }
  updateStatus();
  window.setInterval(updateStatus, 60000);

  /* ---------- Hero slider ----------
     A native scroll-snap strip: swipe works with no JS. JS adds the
     01/02/03, arrows and a slideshow that moves on every SLIDE_MS.
     The slideshow has a pause button (WCAG 2.2.2), waits while the visitor
     hovers, focuses or touches the hero, stops when the hero is off screen
     or the tab is hidden, and never runs for reduced-motion visitors. */
  var slider = document.querySelector('.js-slider');
  if (slider) {
    var SLIDE_MS = 6000;
    var track = slider.querySelector('.js-track');
    var slides = slider.querySelectorAll('.js-slide');
    var dots = slider.querySelectorAll('.js-dot');
    var playBtn = slider.querySelector('.js-play');
    var current = 0;
    var userPaused = false;   // pressed the pause button
    var holds = {};           // temporary reasons to wait: hover, focus, touch, offscreen, hidden
    var playTimer = null;

    slider.style.setProperty('--slide-ms', SLIDE_MS + 'ms');

    var canPlay = function () {
      return !reduceMotion.matches && !userPaused && !Object.keys(holds).some(function (k) { return holds[k]; });
    };
    var schedule = function () {
      window.clearTimeout(playTimer);
      var on = canPlay();
      // restart the dot's fill animation from zero
      slider.classList.remove('is-playing');
      if (on) {
        void slider.offsetWidth;
        slider.classList.add('is-playing');
        playTimer = window.setTimeout(function () { goTo(current + 1); }, SLIDE_MS);
      }
    };
    var hold = function (reason, on) { holds[reason] = on; schedule(); };

    var markCurrent = function (i) {
      current = i;
      dots.forEach(function (d, k) {
        if (k === i) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
      });
      // Off-screen slides leave the tab order, so Tab never lands on a hidden link
      slides.forEach(function (s, k) { s.inert = k !== i; });
      schedule();
    };
    var goTo = function (i) {
      i = (i + slides.length) % slides.length;
      track.scrollTo({ left: i * track.clientWidth, behavior: behavior() });
      markCurrent(i);
    };

    if (playBtn && !reduceMotion.matches) {
      playBtn.classList.remove('hidden');
      playBtn.classList.add('grid');
      playBtn.addEventListener('click', function () {
        userPaused = !userPaused;
        playBtn.setAttribute('aria-label', userPaused ? 'Play slideshow' : 'Pause slideshow');
        playBtn.querySelector('.js-icon-pause').classList.toggle('hidden', userPaused);
        playBtn.querySelector('.js-icon-play').classList.toggle('hidden', !userPaused);
        schedule();
      });
    }
    slider.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hold('hover', true); });
    slider.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') hold('hover', false); });
    // Keyboard focus inside the hero waits (a mouse click on a dot shouldn't stop it for good)
    slider.addEventListener('focusin', function (e) { if (e.target.matches(':focus-visible')) hold('focus', true); });
    slider.addEventListener('focusout', function (e) { if (!slider.contains(e.relatedTarget)) hold('focus', false); });
    track.addEventListener('touchstart', function () { hold('touch', true); }, { passive: true });
    track.addEventListener('touchend', function () { hold('touch', false); }, { passive: true });
    document.addEventListener('visibilitychange', function () { hold('hidden', document.hidden); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { hold('offscreen', !entries[0].isIntersecting); }, { threshold: 0.3 }).observe(slider);
    }
    var ticking = false;
    track.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        var i = Math.round(track.scrollLeft / track.clientWidth);
        if (i !== current) markCurrent(i);
      });
    }, { passive: true });
    dots.forEach(function (d, k) { d.addEventListener('click', function () { goTo(k); }); });
    slider.querySelector('.js-prev').addEventListener('click', function () { goTo(current - 1); });
    slider.querySelector('.js-next').addEventListener('click', function () { goTo(current + 1); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current - 1); }
    });
    // Stay on the same slide when the window is resized or rotated
    window.addEventListener('resize', function () { track.scrollLeft = current * track.clientWidth; });
    markCurrent(0);
  }

  /* ---------- Header shadow once the page scrolls ---------- */
  var header = document.getElementById('top');
  if (header) {
    var headerTick = false;
    var setHeader = function () { headerTick = false; header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', function () {
      if (!headerTick) { headerTick = true; window.requestAnimationFrame(setHeader); }
    }, { passive: true });
    setHeader();
  }

  /* ---------- Sections fade up as they scroll in ---------- */
  var reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); revealIO.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { revealIO.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Product photos fade in when loaded ---------- */
  document.querySelectorAll('.js-grid img').forEach(function (img) {
    var done = function () { img.classList.add('is-loaded'); };
    if (img.complete && img.naturalWidth) done();
    else { img.addEventListener('load', done); img.addEventListener('error', done); }
  });

  /* ---------- "Need help?" pill: hidden while the hero is on screen,
     so it never covers the slider arrows ---------- */
  var help = document.querySelector('.js-help');
  if (help && slider && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var heroVisible = entries[0].isIntersecting;
      ['invisible', 'opacity-0', 'translate-y-3'].forEach(function (c) { help.classList.toggle(c, heroVisible); });
    }, { threshold: 0.15 }).observe(slider);
  }

  /* ---------- Catalog: category tabs + search ---------- */
  var chips = document.querySelectorAll('[data-chip]');
  var items = Array.prototype.slice.call(document.querySelectorAll('.js-grid > li'));
  var shop = document.getElementById('shop');
  var emptyEl = document.querySelector('.js-empty');
  var searchStatus = document.querySelector('.js-search-status');
  var searchTerm = document.querySelector('.js-search-term');
  var countEl = document.querySelector('.js-count');
  var countWord = document.querySelector('.js-count-word');
  var inputs = document.querySelectorAll('.js-q');
  var state = { cat: 'all', q: '' };

  // Words a customer might type that the product text doesn't contain
  var SYNONYMS = {
    cylinder: 'gas', hydraulic: 'gas', piston: 'gas', sinking: 'gas', height: 'gas',
    wheel: 'castor', wheels: 'castor', caster: 'castor', tyre: 'castor', tire: 'castor',
    leg: 'base', legs: 'base', star: 'base', arm: 'armrest', handle: 'armrest',
    tilt: 'mechanism', recline: 'mechanism', lever: 'mechanism', cushion: 'foam', gamer: 'gaming',
    racing: 'gaming', computer: 'office', executive: 'office', revolving: 'office', kursi: 'chair'
  };

  // Each card's searchable text: name, what it fixes, note and category
  items.forEach(function (li) {
    var d = li.querySelector('[data-card]').dataset;
    li._text = [d.name, d.fixes, d.note, CATEGORY_NAMES[d.cat] || '', d.kind].join(' ').toLowerCase();
  });

  function matches(li) {
    if (state.cat !== 'all' && li.getAttribute('data-cat') !== state.cat) return false;
    if (!state.q) return true;
    return state.q.split(/\s+/).every(function (word) {
      var w = word.replace(/s$/, '');
      return li._text.indexOf(w) !== -1 || (SYNONYMS[word] && li._text.indexOf(SYNONYMS[word]) !== -1);
    });
  }

  function render() {
    var n = 0;
    items.forEach(function (li) { var on = matches(li); li.hidden = !on; if (on) n++; });
    chips.forEach(function (c) {
      var on = c.getAttribute('data-filter') === state.cat;
      c.setAttribute('aria-pressed', String(on));
      if (on && c.parentElement.scrollWidth > c.parentElement.clientWidth) {
        c.parentElement.scrollTo({ left: c.offsetLeft - 16, behavior: behavior() });
      }
    });
    if (searchStatus) {
      searchStatus.classList.toggle('hidden', !state.q);
      searchStatus.classList.toggle('flex', !!state.q);
      searchTerm.textContent = '“' + state.q + '”';
      countEl.textContent = String(n);
      countWord.textContent = n === 1 ? 'item' : 'items';
    }
    if (emptyEl) emptyEl.hidden = n > 0;
    return n;
  }

  // Swap with a View Transition where available, then (optionally) scroll to the grid
  function update(next, opts) {
    opts = opts || {};
    var n;
    var swap = function () {
      if ('cat' in next) state.cat = next.cat;
      if ('q' in next) state.q = next.q;
      n = render();
    };
    var after = function () {
      if (opts.scroll && shop) shop.scrollIntoView({ behavior: behavior(), block: 'start' });
      if (opts.quiet) return;
      if (state.q) announce(plural(n, 'result') + ' for ' + state.q);
      else announce('Showing ' + (state.cat === 'all' ? plural(n, 'item') : n + ' ' + CATEGORY_NAMES[state.cat].toLowerCase()));
    };
    if (!document.startViewTransition || reduceMotion.matches || opts.instant) { swap(); after(); return; }
    document.startViewTransition(swap).updateCallbackDone.then(after);
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () { update({ cat: chip.getAttribute('data-filter') }); });
  });

  // Category nav, tiles, hero buttons and problem tiles: each one is a filter
  document.querySelectorAll('a[data-filter]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      update({ cat: link.getAttribute('data-filter') }, { scroll: true });
      if (history.replaceState) history.replaceState(null, '', '#shop');
    });
  });

  // Search: filters as you type; Enter / Search jumps to the results
  var typingTimer;
  function setQuery(raw, opts) {
    var q = raw.trim().toLowerCase().replace(/\s+/g, ' ');
    inputs.forEach(function (inp) { if (inp.value !== raw) inp.value = raw; });
    var next = { q: q };
    if (q) next.cat = 'all'; // search across everything
    update(next, opts);
  }
  inputs.forEach(function (inp) {
    inp.addEventListener('input', function () {
      window.clearTimeout(typingTimer);
      typingTimer = window.setTimeout(function () { setQuery(inp.value, { instant: true, quiet: true }); }, 150);
    });
  });
  var REPAIR_WORDS = /\b(repair|repairs|fix|fixing|marammat|mistri|theek)\b/i;
  var repairsSection = document.getElementById('repairs');

  function runSearch(formEl, raw) {
    window.clearTimeout(typingTimer);
    var inp = formEl.querySelector('.js-q');
    hideSuggest(formEl);
    // "chair repair", "fix my chair"… → the repair service, not the product grid
    if (REPAIR_WORDS.test(raw) && repairsSection) {
      setQuery('', { instant: true, quiet: true });
      repairsSection.scrollIntoView({ behavior: behavior(), block: 'start' });
      announce('Showing chair repairs');
    } else {
      setQuery(raw, { scroll: true, instant: true });
    }
    inp.blur(); // closes the phone keyboard so the results are visible
  }

  // Popular searches panel: shows when an empty search box gets focus
  function showSuggest(formEl) {
    var panel = formEl.querySelector('.js-suggest');
    if (panel) panel.classList.remove('hidden');
  }
  function hideSuggest(formEl) {
    var panel = formEl.querySelector('.js-suggest');
    if (panel) panel.classList.add('hidden');
  }

  document.querySelectorAll('.js-search').forEach(function (formEl) {
    var inp = formEl.querySelector('.js-q');
    formEl.addEventListener('submit', function (e) {
      e.preventDefault();
      runSearch(formEl, inp.value);
    });
    inp.addEventListener('focus', function () { if (!inp.value) showSuggest(formEl); });
    inp.addEventListener('input', function () { if (inp.value) hideSuggest(formEl); else showSuggest(formEl); });
    formEl.addEventListener('focusout', function (e) {
      if (!formEl.contains(e.relatedTarget)) hideSuggest(formEl);
    });
    formEl.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { hideSuggest(formEl); inp.focus(); }
    });
    formEl.querySelectorAll('[data-suggest]').forEach(function (btn) {
      btn.addEventListener('mousedown', function (e) { e.preventDefault(); }); // keep focus in the box
      btn.addEventListener('click', function () {
        var term = btn.getAttribute('data-suggest');
        inp.value = term;
        runSearch(formEl, term);
      });
    });
  });
  var clearBtn = document.querySelector('.js-search-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      setQuery('', { instant: true });
      var visible = Array.prototype.find.call(inputs, function (i) { return i.offsetParent !== null; });
      if (visible) visible.focus({ preventScroll: true });
    });
  }
  // "/" focuses search (like most online shops), unless already typing somewhere
  document.addEventListener('keydown', function (e) {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target;
    if (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || document.querySelector('dialog[open]')) return;
    var visible = Array.prototype.find.call(inputs, function (i) { return i.offsetParent !== null; });
    if (visible) { e.preventDefault(); visible.focus(); }
  });

  /* ---------- Quote list ---------- */
  var quote = new Map(); // id -> { name, qty }
  var counters = document.querySelectorAll('[data-quote-count]');
  var quoteBtns = document.querySelectorAll('.js-quote-btn');

  try {
    JSON.parse(sessionStorage.getItem('quote') || '[]').forEach(function (row) { quote.set(row[0], row[1]); });
  } catch (err) { /* storage blocked: list just starts empty */ }

  function saveQuote() {
    try { sessionStorage.setItem('quote', JSON.stringify(Array.from(quote.entries()))); } catch (err) { /* ignore */ }
  }

  // Card buttons are icon-only (label stays "Add X to quote"; aria-pressed carries the state).
  // The quick-view button has a visible label that changes.
  function setPressed(btn, on) {
    if (!btn) return;
    btn.setAttribute('aria-pressed', String(on));
    var label = btn.querySelector('[data-label]');
    if (label) label.textContent = on ? 'Added ✓' : 'Add to quote';
  }

  function popEl(el) {
    if (!el || reduceMotion.matches) return;
    el.classList.remove('is-popping');
    void el.offsetWidth; // restart the animation
    el.classList.add('is-popping');
  }

  function renderCounter(pop) {
    var n = quote.size;
    counters.forEach(function (c) {
      c.textContent = String(n);
      c.classList.toggle('bg-emerald-700', n > 0);
      c.classList.toggle('text-white', n > 0);
      c.classList.toggle('bg-stone-300', n === 0);
      c.classList.toggle('text-ink', n === 0);
      if (pop) popEl(c);
    });
    quoteBtns.forEach(function (b) {
      var sr = b.querySelector('.js-quote-sr'); // tab-bar button: visible "Quote" + hidden count
      if (sr) sr.textContent = ' list, ' + plural(n, 'item');
      else b.setAttribute('aria-label', 'Quote list, ' + plural(n, 'item'));
    });
  }

  function cardFor(id) { return document.querySelector('[data-card][data-id="' + id + '"]'); }

  function toggleQuote(id, name) {
    var on = !quote.has(id);
    if (on) quote.set(id, { name: name, qty: 1 }); else quote.delete(id);
    var card = cardFor(id);
    if (card) {
      var btn = card.querySelector('[data-add-quote]');
      setPressed(btn, on);
      if (on) popEl(btn);
    }
    if (qvCurrent && qvCurrent.getAttribute('data-id') === id) setPressed(qvAdd, on);
    saveQuote();
    renderCounter(true);
    announce(name + (on ? ' added' : ' removed') + '. Quote list: ' + plural(quote.size, 'item') + '.');
    if (on && !document.querySelector('dialog[open]')) showToast(name);
  }

  /* ---------- "Added to quote" toast ----------
     Visual confirmation with a shortcut to the list. The #live region does
     the screen-reader announcement; the toast stays while hovered or focused. */
  var toast = document.querySelector('.js-toast');
  var toastText = toast && toast.querySelector('.js-toast-text');
  var toastTimer;
  function hideToast() { if (toast) toast.classList.remove('is-shown'); }
  function armToast() {
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(hideToast, 3200);
  }
  function showToast(name) {
    if (!toast) return;
    toastText.textContent = 'Added: ' + name;
    toast.classList.add('is-shown');
    armToast();
  }
  if (toast) {
    toast.addEventListener('mouseenter', function () { window.clearTimeout(toastTimer); });
    toast.addEventListener('mouseleave', armToast);
    toast.addEventListener('focusin', function () { window.clearTimeout(toastTimer); });
    toast.addEventListener('focusout', armToast);
    toast.addEventListener('click', hideToast);
  }

  // Restore button states from a previous page view in this session
  quote.forEach(function (_, id) {
    var card = cardFor(id);
    if (card) setPressed(card.querySelector('[data-add-quote]'), true);
  });
  renderCounter(false);

  /* ---------- Dialog helpers ---------- */
  function openDialog(dlg, opener, focusEl) {
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
    qvImg.classList.toggle('mix-blend-multiply', contain);
    qvImg.classList.toggle('p-6', contain);
    qvImg.classList.toggle('object-cover', !contain);

    qv.querySelector('[data-qv-cat]').textContent = CATEGORY_NAMES[d.cat] || 'Part';
    qv.querySelector('[data-qv-name]').textContent = d.name;
    qv.querySelector('[data-qv-fixes-label]').textContent = d.fixesLabel || 'Fixes';
    qv.querySelector('[data-qv-fixes]').textContent = d.fixes;
    qv.querySelector('[data-qv-note]').textContent = d.note;
    qv.querySelector('[data-qv-price]').textContent = d.price;
    qv.querySelector('[data-qv-guide-title]').textContent = d.kind === 'chair' ? 'Before you buy' : 'Check your old part';
    qv.querySelector('[data-qv-fit]').hidden = d.kind === 'chair'; // parts: "we can fit it for you"
    var list = qv.querySelector('[data-qv-measure]');
    list.replaceChildren.apply(list, (MEASURE[d.kind] || []).map(function (step) {
      var li = document.createElement('li');
      li.textContent = step;
      return li;
    }));
    qv.querySelector('[data-qv-wa]').href = waUrl(productText(d.name));
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
        '<label class="flex items-center gap-2 text-sm text-stone-600">Qty' +
        '<input type="number" min="1" max="9999" inputmode="numeric" class="min-h-11 w-20 rounded-md border border-stone-500 px-2 text-base tabular-nums text-ink"></label>' +
        '<button type="button" class="grid size-11 place-items-center rounded-full text-stone-600 hover:bg-sand hover:text-ink">' +
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
        form.elements.notes.focus();
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
