// ── Scroll Reveal with IntersectionObserver ──
(function () {
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (el) { observer.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }
})();

// ── Mobile Nav Hamburger Toggle ──
(function () {
  var toggle = document.querySelector('.nav__toggle');
  var links = document.querySelector('.nav__links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', function () {
    var expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    links.classList.toggle('is-open');
  });

  // Close menu when a link is clicked
  links.querySelectorAll('.nav__link').forEach(function (link) {
    link.addEventListener('click', function () {
      toggle.setAttribute('aria-expanded', 'false');
      links.classList.remove('is-open');
    });
  });

  // Close menu on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && links.classList.contains('is-open')) {
      toggle.setAttribute('aria-expanded', 'false');
      links.classList.remove('is-open');
      toggle.focus();
    }
  });
})();

// ── FAQ Accordion Toggle ──
(function () {
  var questions = document.querySelectorAll('.faq-question');
  questions.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var answer = btn.nextElementSibling;

      // Close all other open answers
      questions.forEach(function (other) {
        if (other !== btn && other.getAttribute('aria-expanded') === 'true') {
          other.setAttribute('aria-expanded', 'false');
          other.nextElementSibling.setAttribute('aria-hidden', 'true');
          other.nextElementSibling.style.maxHeight = null;
        }
      });

      btn.setAttribute('aria-expanded', String(!expanded));
      answer.setAttribute('aria-hidden', String(expanded));

      if (!expanded) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
        // Track FAQ open in Plausible
        var questionText = btn.querySelector('span') ? btn.querySelector('span').textContent.trim() : '';
        if (typeof plausible !== 'undefined') {
          plausible('FAQ Opened', {props: {question: questionText}});
        }
      } else {
        answer.style.maxHeight = null;
      }
    });
  });
})();

// ── Plausible Custom Event Tracking ──
(function () {
  if (typeof plausible === 'undefined') return;

  // Track CTA button clicks
  document.querySelectorAll('.btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.textContent.trim();
      var section = 'unknown';

      // Determine CTA location
      if (btn.closest('.hero') || btn.closest('.hero-anim')) section = 'hero';
      else if (btn.closest('.page-hero')) section = 'page-hero';
      else if (btn.closest('.bottom-cta')) section = 'bottom-cta';
      else if (btn.closest('.card')) section = 'service-card';
      else section = 'other';

      plausible('CTA Clicked', {props: {text: text, section: section, page: location.pathname}});
    });
  });

  // Track nav link clicks
  document.querySelectorAll('.nav__link').forEach(function (link) {
    link.addEventListener('click', function () {
      plausible('Nav Clicked', {props: {destination: link.getAttribute('href'), text: link.textContent.trim()}});
    });
  });

  // Track outbound links (LinkedIn, mailto)
  document.querySelectorAll('a[href^="https://"], a[href^="mailto:"]').forEach(function (link) {
    var href = link.getAttribute('href');
    // Skip internal links
    if (href.indexOf('alphasmb.com') !== -1) return;
    if (href.indexOf('cal.com') !== -1) return;

    link.addEventListener('click', function () {
      var type = href.indexOf('mailto:') === 0 ? 'email' : 'outbound';
      plausible('Outbound Click', {props: {url: href, type: type, page: location.pathname}});
    });
  });

  // Track footer link clicks
  document.querySelectorAll('.footer__links a').forEach(function (link) {
    link.addEventListener('click', function () {
      plausible('Footer Link Clicked', {props: {destination: link.getAttribute('href')}});
    });
  });

  // Preserve UTM parameters for session tracking
  var params = new URLSearchParams(window.location.search);
  var utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var utmData = {};
  var hasUtm = false;
  utmKeys.forEach(function (key) {
    var val = params.get(key);
    if (val) {
      utmData[key] = val;
      hasUtm = true;
    }
  });
  if (hasUtm) {
    // Store UTMs in sessionStorage so they persist across page navigations
    sessionStorage.setItem('alphasmb_utm', JSON.stringify(utmData));
  }
})();
