// AlphaSMB AI Readiness Assessment — State Machine
// Depends on: questions.js, scoring.js, insights.js

(function () {
  'use strict';

  // ── State ──
  var state = {
    screen: 'landing',
    sessionId: null,
    industry: null,
    companySize: null,
    currentQuestion: 0, // 0-indexed into QUESTIONS array
    answers: {},         // { q1: { score: 3, text: '...' }, ... }
    startedAt: null,
    completedAt: null,
    scores: null
  };

  // ── Helpers ──
  function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function $(id) { return document.getElementById(id); }
  function $$(sel) { return document.querySelectorAll(sel); }

  function showScreen(name) {
    var screens = $$('[data-screen]');
    for (var i = 0; i < screens.length; i++) {
      screens[i].classList.remove('assess__screen--active');
    }
    var target = document.querySelector('[data-screen="' + name + '"]');
    if (target) {
      target.classList.add('assess__screen--active');
      // Scroll to top
      window.scrollTo(0, 0);
    }
    state.screen = name;
    saveState();
  }

  function announce(text) {
    var el = $('assess-sr-status');
    if (el) el.textContent = text;
  }

  // ── Session Persistence ──
  var STORAGE_KEY = 'alphasmb_assessment';

  function saveState() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        sessionId: state.sessionId,
        industry: state.industry,
        companySize: state.companySize,
        currentQuestion: state.currentQuestion,
        answers: state.answers,
        startedAt: state.startedAt,
        screen: state.screen
      }));
    } catch (e) { /* storage full or unavailable */ }
  }

  function loadState() {
    try {
      var saved = sessionStorage.getItem(STORAGE_KEY);
      if (!saved) return null;
      return JSON.parse(saved);
    } catch (e) { return null; }
  }

  function clearState() {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }

  // ── Plausible tracking ──
  function track(event, props) {
    if (typeof plausible !== 'undefined') {
      plausible(event, { props: props });
    }
  }

  // ── Section / Question helpers ──
  function getSection(sectionNum) {
    return SECTIONS[sectionNum - 1];
  }

  function questionIndex(questionNum) {
    return questionNum - 1; // 1-based to 0-based
  }

  function getSectionForQuestion(qIdx) {
    return QUESTIONS[qIdx].section;
  }

  function isFirstOfSection(qIdx) {
    if (qIdx === 0) return true;
    return QUESTIONS[qIdx].section !== QUESTIONS[qIdx - 1].section;
  }

  function isLastOfSection(qIdx) {
    if (qIdx === QUESTIONS.length - 1) return true;
    return QUESTIONS[qIdx].section !== QUESTIONS[qIdx + 1].section;
  }

  // ── Render: Question Screen ──
  function renderQuestion(qIdx) {
    var q = QUESTIONS[qIdx];
    var section = getSection(q.section);
    var qNum = qIdx + 1;

    // Progress bar
    $('assess-section-label').textContent = 'Section ' + section.number + ' of 4: ' + section.name;
    $('assess-q-count').textContent = 'Question ' + qNum + ' of 20';
    $('assess-progress-fill').style.width = ((qNum / 20) * 100) + '%';

    var progressbar = $('assess-progressbar');
    progressbar.setAttribute('aria-valuenow', qNum);
    progressbar.setAttribute('aria-valuetext', 'Question ' + qNum + ' of 20, Section ' + section.number + ' of 4: ' + section.name);

    // Section framing (only show on first question of section)
    var framing = $('assess-framing');
    if (isFirstOfSection(qIdx)) {
      framing.textContent = section.framing;
      framing.style.display = '';
    } else {
      framing.style.display = 'none';
    }

    // Question text
    $('assess-question-text').textContent = q.text;

    // Options
    var container = $('assess-options');
    container.innerHTML = '';
    q.options.forEach(function (opt, i) {
      var btn = document.createElement('button');
      btn.className = 'assess__option';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');
      btn.textContent = opt.text;

      // If already answered, highlight
      if (state.answers[q.id] && state.answers[q.id].text === opt.text) {
        btn.classList.add('assess__option--selected');
        btn.setAttribute('aria-checked', 'true');
      }

      btn.addEventListener('click', function () {
        selectOption(qIdx, opt, btn);
      });
      container.appendChild(btn);
    });

    // Back button — hidden at section start (Q1, Q6, Q11, Q16)
    var backBtn = $('assess-back-btn');
    if (isFirstOfSection(qIdx)) {
      backBtn.style.display = 'none';
    } else {
      backBtn.style.display = '';
    }

    announce('Question ' + qNum + ' of 20. ' + q.text);
    showScreen('question');
  }

  // ── Handle option selection ──
  function selectOption(qIdx, option, btnEl) {
    var q = QUESTIONS[qIdx];

    // Visual feedback
    var buttons = $('assess-options').querySelectorAll('.assess__option');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].classList.remove('assess__option--selected');
      buttons[i].setAttribute('aria-checked', 'false');
    }
    btnEl.classList.add('assess__option--selected');
    btnEl.setAttribute('aria-checked', 'true');

    // Store answer
    state.answers[q.id] = {
      score: option.score,
      text: option.text,
      dimension: q.dimension
    };
    saveState();

    // Auto-advance after brief delay
    setTimeout(function () {
      advanceFromQuestion(qIdx);
    }, 300);
  }

  // ── Advance logic after answering ──
  function advanceFromQuestion(qIdx) {
    var q = QUESTIONS[qIdx];

    if (isLastOfSection(qIdx)) {
      var sectionNum = q.section;

      // Track section completion
      var dimScore = Scoring.computeDimensionScore(state.answers, q.dimension);
      track('Assessment Section Completed', {
        section: sectionNum,
        section_name: getSection(sectionNum).name,
        score: dimScore.display
      });

      if (sectionNum < 4) {
        // Show insight screen for sections 1-3
        renderInsight(sectionNum);
      } else {
        // Section 4 (Org OS) — go to processing
        state.completedAt = new Date().toISOString();
        saveState();
        showProcessingScreen();
      }
    } else {
      // Next question
      state.currentQuestion = qIdx + 1;
      renderQuestion(state.currentQuestion);
    }
  }

  // ── Render: Insight Screen ──
  function renderInsight(sectionNum) {
    var section = getSection(sectionNum);
    var dimScore = Scoring.computeDimensionScore(state.answers, section.dimension);

    // Dimension label
    $('assess-insight-dim').textContent = section.name;

    // Score
    var scoreEl = $('assess-insight-score');
    scoreEl.innerHTML = dimScore.display.toFixed(1) + ' <span class="assess__score-max">/ 10</span>';
    scoreEl.style.color = dimScore.tier.color;

    // Tier badge
    var badgeContainer = $('assess-insight-badge');
    badgeContainer.innerHTML = '<span class="assess__tier-badge assess__tier--' + dimScore.tier.key + '">' + dimScore.tier.label + '</span>';

    // Insight text
    $('assess-insight-text').textContent = Insights.getMidInsight(section.dimension, dimScore.tier.key);

    // Comparison bars
    renderInsightBars(sectionNum);

    // Transition prelude (special for section 3)
    var prelude = $('assess-transition-prelude');
    if (section.transitionPrelude) {
      prelude.textContent = section.transitionPrelude;
      prelude.style.display = '';
    } else {
      prelude.style.display = 'none';
    }

    // CTA button
    $('assess-insight-next').textContent = section.transitionCta;

    announce(section.name + ' score: ' + dimScore.display.toFixed(1) + ' out of 10. ' + dimScore.tier.label);
    showScreen('insight');

    // Animate bars after screen is visible
    setTimeout(function () { animateInsightBars(); }, 100);
  }

  function renderInsightBars(sectionNum) {
    var container = $('assess-insight-bars');
    container.innerHTML = '';

    var dimensionsToShow = [];
    if (sectionNum >= 1) dimensionsToShow.push({ key: 'mindset', label: 'Mindset' });
    if (sectionNum >= 2) dimensionsToShow.push({ key: 'skillset', label: 'Skillset' });
    if (sectionNum >= 3) dimensionsToShow.push({ key: 'toolset', label: 'Toolset' });

    dimensionsToShow.forEach(function (dim) {
      var score = Scoring.computeDimensionScore(state.answers, dim.key);
      var pct = (score.display / 10) * 100;

      var row = document.createElement('div');
      row.className = 'assess__bar-row';
      row.innerHTML =
        '<span class="assess__bar-label">' + dim.label + '</span>' +
        '<div class="assess__bar-track">' +
          '<div class="assess__bar-fill" style="background:' + score.tier.color + ';" data-width="' + pct + '%"></div>' +
        '</div>' +
        '<span class="assess__bar-value">' + score.display.toFixed(1) + '</span>';
      container.appendChild(row);
    });
  }

  function animateInsightBars() {
    var fills = document.querySelectorAll('.assess__bar-fill[data-width]');
    for (var i = 0; i < fills.length; i++) {
      (function (el, idx) {
        setTimeout(function () {
          el.style.width = el.getAttribute('data-width');
        }, idx * 150);
      })(fills[i], i);
    }
  }

  // ── Processing Screen ──
  function showProcessingScreen() {
    showScreen('processing');
    announce('Scoring your assessment across four dimensions and mapping the patterns.');

    // Compute scores during the pause
    state.scores = Scoring.computeScores(state.answers);

    setTimeout(function () {
      renderResults();
    }, 4000);
  }

  // ── Render: Results Screen ──
  function renderResults() {
    var scores = state.scores;

    // A. Overall score
    var overallEl = $('results-overall-score');
    overallEl.innerHTML = scores.display.overall.toFixed(1) + ' <span class="assess__overall-max">/ 10</span>';
    overallEl.style.color = scores.tiers.overall.color;

    var badgeContainer = $('results-overall-badge');
    badgeContainer.innerHTML = '<span class="assess__overall-tier assess__tier--' + scores.tiers.overall.key + '">' + scores.tiers.overall.label + '</span>';

    $('results-overall-desc').textContent = scores.tiers.overall.description;

    // B. Dimension bars
    var dimContainer = $('results-dim-bars');
    dimContainer.innerHTML = '';
    var dims = [
      { key: 'mindset', label: 'Mindset' },
      { key: 'skillset', label: 'Skillset' },
      { key: 'toolset', label: 'Toolset' },
      { key: 'org_os', label: 'Org OS' }
    ];

    dims.forEach(function (dim, idx) {
      var display = scores.display[dim.key];
      var tier = scores.tiers[dim.key];
      var pct = (display / 10) * 100;

      var row = document.createElement('div');
      row.className = 'assess__dim-row';
      row.innerHTML =
        '<span class="assess__dim-label">' + dim.label + '</span>' +
        '<div class="assess__dim-track">' +
          '<div class="assess__dim-fill" style="background:' + tier.color + ';" data-width="' + pct + '%"></div>' +
        '</div>' +
        '<span class="assess__dim-score">' + display.toFixed(1) + ' <span class="assess__dim-tier assess__tier--' + tier.key + '">' + tier.label + '</span></span>';
      dimContainer.appendChild(row);
    });

    // C. Org OS insight
    $('results-org-os-text').textContent = Insights.getOrgOsInsight(scores.tiers.org_os.key);

    // D. Gap pattern
    var pattern = Insights.getPattern(scores.pattern);
    $('results-gap-name').textContent = pattern.name;
    $('results-gap-summary').textContent = pattern.summary;

    // Track completion
    track('Assessment Completed', {
      overall_score: scores.display.overall,
      overall_tier: scores.tiers.overall.label,
      pattern: scores.pattern
    });

    announce('Your AI Readiness Score: ' + scores.display.overall.toFixed(1) + ' out of 10. ' + scores.tiers.overall.label);
    showScreen('results');

    // Animate dimension bars
    setTimeout(function () {
      var fills = dimContainer.querySelectorAll('.assess__dim-fill[data-width]');
      for (var i = 0; i < fills.length; i++) {
        (function (el, idx) {
          setTimeout(function () {
            el.style.width = el.getAttribute('data-width');
          }, idx * 150);
        })(fills[i], i);
      }
    }, 100);

    // Clear saved session — assessment is complete
    clearState();
  }

  // ── Event Bindings ──
  function init() {
    // Check for saved state and offer resume
    var saved = loadState();
    if (saved && saved.sessionId && saved.screen === 'question' && Object.keys(saved.answers).length > 0) {
      var resume = confirm('You have an assessment in progress. Resume where you left off?');
      if (resume) {
        state.sessionId = saved.sessionId;
        state.industry = saved.industry;
        state.companySize = saved.companySize;
        state.currentQuestion = saved.currentQuestion;
        state.answers = saved.answers;
        state.startedAt = saved.startedAt;
        renderQuestion(state.currentQuestion);
        return;
      } else {
        clearState();
      }
    }

    // Landing -> Context
    $('assess-start-btn').addEventListener('click', function () {
      showScreen('context');
    });

    // Context form validation (radio buttons)
    var industryRadios = document.querySelectorAll('input[name="industry"]');
    var sizeRadios = document.querySelectorAll('input[name="company_size"]');
    var contextNext = $('assess-context-next');
    var otherWrap = $('assess-industry-other-wrap');
    var otherInput = $('assess-industry-other');

    function getCheckedValue(radios) {
      for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked) return radios[i].value;
      }
      return '';
    }

    function validateContext() {
      var industry = getCheckedValue(industryRadios);
      var size = getCheckedValue(sizeRadios);
      var otherFilled = industry !== 'other' || (otherInput.value.trim() !== '');
      contextNext.disabled = !(industry && size && otherFilled);
    }

    for (var i = 0; i < industryRadios.length; i++) {
      industryRadios[i].addEventListener('change', function () {
        var val = getCheckedValue(industryRadios);
        otherWrap.style.display = val === 'other' ? '' : 'none';
        if (val === 'other') otherInput.focus();
        validateContext();
      });
    }
    for (var i = 0; i < sizeRadios.length; i++) {
      sizeRadios[i].addEventListener('change', validateContext);
    }
    otherInput.addEventListener('input', validateContext);

    // Context -> First question
    contextNext.addEventListener('click', function () {
      var industry = getCheckedValue(industryRadios);
      if (industry === 'other') industry = 'other:' + otherInput.value.trim();

      state.sessionId = generateId();
      state.industry = industry;
      state.companySize = getCheckedValue(sizeRadios);
      state.startedAt = new Date().toISOString();

      track('Assessment Started', {
        industry: state.industry,
        company_size: state.companySize
      });

      state.currentQuestion = 0;
      renderQuestion(0);
    });

    // Back button
    $('assess-back-btn').addEventListener('click', function () {
      if (state.currentQuestion > 0 && !isFirstOfSection(state.currentQuestion)) {
        state.currentQuestion -= 1;
        renderQuestion(state.currentQuestion);
      }
    });

    // Insight -> Next section
    $('assess-insight-next').addEventListener('click', function () {
      var nextQ = state.currentQuestion + 1;
      if (nextQ < QUESTIONS.length) {
        state.currentQuestion = nextQ;
        renderQuestion(nextQ);
      }
    });

    // Email form (Ship 1: non-functional, shows confirmation)
    var emailForm = $('assess-email-form');
    if (emailForm) {
      emailForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = $('assess-name').value;
        var email = $('assess-email').value;

        track('Assessment Email Submitted', {
          overall_score: state.scores ? state.scores.display.overall : 0
        });

        // Replace form with confirmation
        emailForm.innerHTML =
          '<div style="text-align:center;padding:24px;">' +
            '<p style="font-size:18px;color:var(--alpha-white);font-weight:600;margin-bottom:12px;">Thank you, ' + escapeHtml(name) + '.</p>' +
            '<p style="font-size:15px;color:var(--alpha-sand);line-height:1.6;">The full PDF report is coming soon. I\'ll send it to ' + escapeHtml(email) + ' as soon as it\'s ready.</p>' +
          '</div>';
      });
    }

    // Strategy call CTA tracking
    var bookCta = $('assess-book-cta');
    if (bookCta) {
      bookCta.addEventListener('click', function () {
        track('Assessment CTA Clicked', {
          type: 'strategy_call',
          overall_score: state.scores ? state.scores.display.overall : 0
        });
      });
    }

    // Beforeunload tracking for abandonment
    window.addEventListener('beforeunload', function () {
      if (state.sessionId && !state.scores) {
        var lastQ = state.currentQuestion + 1;
        var sectionNum = state.currentQuestion < QUESTIONS.length ? QUESTIONS[state.currentQuestion].section : 4;
        track('Assessment Abandoned', {
          last_question: lastQ,
          section: sectionNum
        });
      }
    });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // ── Initialize ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
