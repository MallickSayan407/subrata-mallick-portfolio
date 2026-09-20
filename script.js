(function () {
  'use strict';

  /* ==========================================================
     Time-of-day theme
     dawn 05:00–08:00 · day 08:00–16:00 · evening 16:00–19:00 · night 19:00–05:00
     ========================================================== */
  var THEMES = ['dawn', 'day', 'evening', 'night'];
  var LABELS = { auto: 'Auto', dawn: 'Dawn', day: 'Day', evening: 'Evening', night: 'Night' };
  // Where the sun or moon sits when a theme is picked by hand
  var SAMPLE_HOUR = { dawn: 6.5, day: 12.5, evening: 17.75, night: 23 };
  var THEME_COLOR = { dawn: '#fff3ec', day: '#f4faff', evening: '#2a1c34', night: '#0a1020' };

  var root = document.documentElement;
  var orb = document.getElementById('orb');
  var themeBtn = document.getElementById('themeBtn');
  var themeMenu = document.getElementById('themeMenu');
  var themeLabel = document.getElementById('themeLabel');
  var greetingEl = document.getElementById('greeting');
  var metaTheme = document.querySelector('meta[name="theme-color"]');

  function themeForHour(h) {
    if (h >= 5 && h < 8) return 'dawn';
    if (h >= 8 && h < 16) return 'day';
    if (h >= 16 && h < 19) return 'evening';
    return 'night';
  }

  function nowHours() {
    var d = new Date();
    return d.getHours() + d.getMinutes() / 60;
  }

  function getPref() {
    try {
      var p = localStorage.getItem('theme-pref');
      if (p === 'auto' || THEMES.indexOf(p) > -1) return p;
    } catch (e) {}
    return 'auto';
  }

  function setPref(p) {
    try { localStorage.setItem('theme-pref', p); } catch (e) {}
  }

  // Sun crosses the sky 05:00–19:00, moon 19:00–05:00
  function placeOrb(hour) {
    var isMoon = hour < 5 || hour >= 19;
    var p;
    if (!isMoon) {
      p = (hour - 5) / 14;
    } else {
      var t = hour < 5 ? hour + 24 : hour;
      p = (t - 19) / 10;
    }
    var x = 8 + 84 * p;                         // % from left
    var y = 4 + 58 * Math.sin(Math.PI * p);     // % from bottom of the scene
    orb.style.setProperty('--ox', x.toFixed(2) + '%');
    orb.style.setProperty('--oy', y.toFixed(2) + '%');
    orb.classList.toggle('is-moon', isMoon);
  }

  function greeting() {
    var h = new Date().getHours();
    if (h >= 5 && h < 12) return 'Good morning';
    if (h >= 12 && h < 17) return 'Good afternoon';
    if (h >= 17 && h < 22) return 'Good evening';
    return 'Hello, night owl';
  }

  function apply() {
    var pref = getPref();
    var hour = nowHours();
    var theme = pref === 'auto' ? themeForHour(hour) : pref;
    root.setAttribute('data-theme', theme);
    placeOrb(pref === 'auto' ? hour : SAMPLE_HOUR[theme]);
    if (metaTheme) metaTheme.setAttribute('content', THEME_COLOR[theme]);
    greetingEl.textContent = greeting();
    themeLabel.textContent = pref === 'auto' ? 'Auto · ' + LABELS[theme] : LABELS[theme];
    var items = themeMenu.querySelectorAll('button');
    for (var i = 0; i < items.length; i++) {
      items[i].setAttribute('aria-current', items[i].getAttribute('data-pref') === pref ? 'true' : 'false');
    }
  }

  // Stars
  (function buildStars() {
    var host = document.getElementById('stars');
    var frag = document.createDocumentFragment();
    for (var i = 0; i < 70; i++) {
      var s = document.createElement('span');
      s.style.left = (Math.random() * 100).toFixed(1) + '%';
      s.style.top = (Math.random() * 100).toFixed(1) + '%';
      s.style.opacity = (0.4 + Math.random() * 0.6).toFixed(2);
      if (Math.random() > 0.8) s.className = 'big';
      frag.appendChild(s);
    }
    host.appendChild(frag);
  })();

  // Theme picker
  function closeMenu() {
    themeMenu.hidden = true;
    themeBtn.setAttribute('aria-expanded', 'false');
  }
  themeBtn.addEventListener('click', function () {
    var open = themeMenu.hidden;
    themeMenu.hidden = !open;
    themeBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  themeMenu.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-pref]');
    if (!b) return;
    setPref(b.getAttribute('data-pref'));
    apply();
    closeMenu();
    themeBtn.focus();
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.theme-picker')) closeMenu();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !themeMenu.hidden) { closeMenu(); themeBtn.focus(); }
  });

  apply();
  setInterval(function () { if (getPref() === 'auto') apply(); }, 60 * 1000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) apply(); });

  /* ==========================================================
     PDF viewer (pdf.js renders to canvas so it also works on phones,
     where browsers rarely show more than page one of an embedded PDF)
     ========================================================== */
  var WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  function fallbackFrame(host, url) {
    host.innerHTML = '';
    var frame = document.createElement('iframe');
    frame.src = url;
    frame.title = 'PDF document';
    host.appendChild(frame);
  }

  function renderPdf(host, url) {
    var lib = window.pdfjsLib;
    if (!lib) { fallbackFrame(host, url); return Promise.resolve(); }
    lib.GlobalWorkerOptions.workerSrc = WORKER;
    var width = host.clientWidth - 16;
    if (width < 50) return Promise.resolve();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    host.setAttribute('aria-busy', 'true');
    if (!host.firstChild) host.innerHTML = '<p class="pdf-status">Loading document…</p>';

    return lib.getDocument(url).promise.then(function (pdf) {
      var canvases = [];
      var chain = Promise.resolve();
      for (var n = 1; n <= pdf.numPages; n++) {
        (function (pageNo) {
          chain = chain.then(function () {
            return pdf.getPage(pageNo).then(function (page) {
              var base = page.getViewport({ scale: 1 });
              var vp = page.getViewport({ scale: (width / base.width) * dpr });
              var canvas = document.createElement('canvas');
              canvas.width = Math.floor(vp.width);
              canvas.height = Math.floor(vp.height);
              canvas.setAttribute('role', 'img');
              canvas.setAttribute('aria-label', 'Page ' + pageNo + ' of ' + pdf.numPages);
              canvases.push(canvas);
              return page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
            });
          });
        })(n);
      }
      return chain.then(function () {
        host.innerHTML = '';
        canvases.forEach(function (c) { host.appendChild(c); });
        host.setAttribute('aria-busy', 'false');
        host.setAttribute('data-width', String(Math.round(width)));
      });
    }).catch(function () {
      host.setAttribute('aria-busy', 'false');
      fallbackFrame(host, url);
    });
  }

  var mounted = []; // { host, url, visible: fn }

  function mount(host, url, isVisible) {
    mounted.push({ host: host, url: url, isVisible: isVisible });
    return renderPdf(host, url);
  }

  // Resume: render when it scrolls near the viewport
  var resumePanel = document.getElementById('resume-panel');
  var resumeHost = document.getElementById('resume-host');
  var resumeStarted = false;
  function startResume() {
    if (resumeStarted) return;
    resumeStarted = true;
    mount(resumeHost, resumePanel.getAttribute('data-pdf'), function () { return true; });
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { startResume(); io.disconnect(); }
    }, { rootMargin: '400px 0px' });
    io.observe(resumePanel);
  } else {
    startResume();
  }

  // Certificates: open on demand under the name of each training
  var certs = document.querySelectorAll('.cert');
  Array.prototype.forEach.call(certs, function (cert) {
    var btn = cert.querySelector('.cert-toggle');
    var panel = cert.querySelector('.pdf-panel');
    var host = cert.querySelector('.pdf-host');
    var url = cert.getAttribute('data-pdf');
    var loaded = false;

    btn.addEventListener('click', function () {
      var open = panel.hidden;
      panel.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = open ? 'Hide certificate' : 'View certificate';
      if (open && !loaded) {
        loaded = true;
        mount(host, url, function () { return !panel.hidden; });
      } else if (open) {
        rerender(host);
      }
    });
  });

  function rerender(host) {
    for (var i = 0; i < mounted.length; i++) {
      var m = mounted[i];
      if (m.host !== host) continue;
      var w = Math.round(host.clientWidth - 16);
      if (m.isVisible() && Math.abs(w - Number(host.getAttribute('data-width') || 0)) > 24) {
        if (host.querySelector('canvas')) renderPdf(host, m.url);
      }
    }
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      mounted.forEach(function (m) { rerender(m.host); });
    }, 250);
  });
})();
