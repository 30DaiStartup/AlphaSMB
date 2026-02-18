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
      } else {
        answer.style.maxHeight = null;
      }
    });
  });
})();
