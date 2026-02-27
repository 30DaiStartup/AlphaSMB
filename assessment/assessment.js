// AlphaSMB AI Readiness Assessment — State Machine
// Depends on: questions.js, scoring.js, insights.js

(function () {
  'use strict';

  // ── Auto-advance timer ──
  var autoAdvanceTimer = null;

  // ── State ──
  var state = {
    screen: 'landing',
    sessionId: null,
    role: null,
    industry: null,
    companySize: null,
    currentQuestion: 0, // 0-indexed into QUESTIONS array
    answers: {},         // { q1: { score: 3, text: '...' }, ... }
    startedAt: null,
    completedAt: null,
    scores: null,
    assessmentId: null,
    userName: null,
    userEmail: null
  };

  // ── Helpers ──
  function generateId() {
    // Use crypto.getRandomValues for unpredictable session IDs
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      var buf = new Uint8Array(16);
      crypto.getRandomValues(buf);
      // Set version (4) and variant (RFC 4122) bits
      buf[6] = (buf[6] & 0x0f) | 0x40;
      buf[8] = (buf[8] & 0x3f) | 0x80;
      var hex = '';
      for (var i = 0; i < 16; i++) hex += ('0' + buf[i].toString(16)).slice(-2);
      return hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-' + hex.slice(12, 16) + '-' + hex.slice(16, 20) + '-' + hex.slice(20);
    }
    // Fallback for very old browsers
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
        role: state.role,
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
  function getUtmProps() {
    try {
      var stored = sessionStorage.getItem('alphasmb_utm');
      return stored ? JSON.parse(stored) : {};
    } catch (e) { return {}; }
  }

  function track(event, props) {
    if (typeof plausible !== 'undefined') {
      // Include UTM data on key conversion events for attribution
      var utmEvents = ['Assessment Started', 'Assessment Completed', 'Assessment Email Submitted', 'Assessment CTA Clicked'];
      if (utmEvents.indexOf(event) !== -1) {
        var utm = getUtmProps();
        if (utm.utm_source) props.utm_source = utm.utm_source;
        if (utm.utm_medium) props.utm_medium = utm.utm_medium;
        if (utm.utm_campaign) props.utm_campaign = utm.utm_campaign;
      }
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
    $('assess-section-label').textContent = 'Section ' + section.number + ' of 3: ' + section.name;
    $('assess-q-count').textContent = 'Question ' + qNum + ' of 15';
    $('assess-progress-fill').style.width = ((qNum / 15) * 100) + '%';

    var progressbar = $('assess-progressbar');
    progressbar.setAttribute('aria-valuenow', qNum);
    progressbar.setAttribute('aria-valuetext', 'Question ' + qNum + ' of 15, Section ' + section.number + ' of 3: ' + section.name);

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

    // Free-response panel setup
    var freeContainer = $('assess-free-response');
    var contextToggle = $('assess-context-toggle');
    var contextPanel = $('assess-context-panel');
    var freeTextarea = $('assess-free-textarea');
    var charCount = $('assess-char-count');
    var micRow = $('assess-mic-row');
    var micBtn = $('assess-mic-btn');
    var micStatus = $('assess-mic-status');
    var modelProgress = $('assess-model-progress');
    var modelProgressFill = $('assess-model-progress-fill');

    // Show container, reset toggle
    freeContainer.style.display = '';
    contextToggle.setAttribute('aria-expanded', 'false');
    freeTextarea.value = '';
    charCount.textContent = '0 / 500';
    micStatus.textContent = '';
    modelProgress.style.display = 'none';
    modelProgressFill.style.width = '0';
    micBtn.classList.remove('assess__mic-btn--recording', 'assess__mic-btn--loading');

    // Hide mic if speech not supported
    if (typeof SpeechEngine !== 'undefined' && SpeechEngine.isSupported()) {
      micRow.style.display = '';
    } else {
      micRow.style.display = 'none';
    }

    // Restore free text if exists (and auto-open panel)
    var savedAnswer = state.answers[q.id];
    if (savedAnswer && savedAnswer.freeText) {
      freeTextarea.value = savedAnswer.freeText;
      charCount.textContent = savedAnswer.freeText.length + ' / 500';
      contextToggle.setAttribute('aria-expanded', 'true');
    }

    // Back button — hidden at section start (Q1, Q6, Q11, Q16)
    var backBtn = $('assess-back-btn');
    if (isFirstOfSection(qIdx)) {
      backBtn.style.display = 'none';
    } else {
      backBtn.style.display = '';
    }

    announce('Question ' + qNum + ' of 15. ' + q.text);
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

    // Store answer (preserve existing freeText if any)
    var existing = state.answers[q.id];
    state.answers[q.id] = {
      score: option.score,
      text: option.text,
      dimension: q.dimension
    };
    if (existing && existing.freeText) {
      state.answers[q.id].freeText = existing.freeText;
    }
    saveState();

    // Auto-advance only if context panel is closed
    var toggle = $('assess-context-toggle');
    var panelOpen = toggle && toggle.getAttribute('aria-expanded') === 'true';
    if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null; }
    if (!panelOpen) {
      autoAdvanceTimer = setTimeout(function () {
        autoAdvanceTimer = null;
        advanceFromQuestion(qIdx);
      }, 300);
    }
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

      renderInsight(sectionNum);
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
    // Safety: display value is a computed number from scoring.js, not user input
    scoreEl.innerHTML = dimScore.display.toFixed(1) + ' <span class="assess__score-max">/ 10</span>';
    scoreEl.style.color = dimScore.tier.color;

    // Tier badge
    var badgeContainer = $('assess-insight-badge');
    // Safety: tier.key and tier.label are from internal scoring.js constants, not user input
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
    announce('Scoring your assessment across three dimensions and mapping the patterns.');

    // Compute scores during the pause
    state.scores = Scoring.computeScores(state.answers);

    // Fetch benchmark snapshot (non-blocking, fire-and-forget)
    state.benchmarkSnapshot = null;
    fetchBenchmarkSnapshot();

    setTimeout(function () {
      renderResults();
    }, 4000);
  }

  function fetchBenchmarkSnapshot() {
    var url = '/api/benchmark/snapshot?industry=' +
      encodeURIComponent(state.industry || '') +
      '&companySize=' + encodeURIComponent(state.companySize || '');

    fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.success) state.benchmarkSnapshot = data;
      })
      .catch(function () {
        // Non-blocking — skip benchmark if it fails
      });
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
      { key: 'toolset', label: 'Toolset' }
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

    // C. Gap pattern
    var pattern = Insights.getPattern(scores.pattern);
    $('results-gap-name').textContent = pattern.name;
    $('results-gap-summary').textContent = pattern.summary;

    // D. Benchmark comparison (if snapshot loaded)
    renderBenchmarkBasic();

    // Track completion
    track('Assessment Completed', {
      role: state.role,
      overall_score: scores.display.overall,
      overall_tier: scores.tiers.overall.label,
      pattern: scores.pattern
    });

    // Store assessment in backend (fire-and-forget)
    postAssessmentComplete();

    // Show social share buttons once backend record exists
    state.completionPromise.then(function () {
      renderSocialShare();
    }).catch(function () {
      renderSocialShare(); // Still show buttons even if backend POST failed
    });

    // Render share section before showing results
    renderShareSection();

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

  // ── Benchmark Rendering ──
  function renderBenchmarkBasic() {
    var section = $('results-benchmark');
    var snapshot = state.benchmarkSnapshot;
    if (!section || !snapshot || !snapshot.medians || !snapshot.medians.overall) return;

    var scores = state.scores;
    var dims = [
      { key: 'overall', label: 'Overall' },
      { key: 'mindset', label: 'Mindset' },
      { key: 'skillset', label: 'Skillset' },
      { key: 'toolset', label: 'Toolset' }
    ];

    var sourceText = snapshot.dataSource === 'peer_data'
      ? 'Based on ' + snapshot.sampleCount + ' assessments \u2014 ' + snapshot.segmentLabel
      : 'Based on industry research \u2014 ' + snapshot.segmentLabel;

    $('benchmark-source').textContent = sourceText;

    var container = $('benchmark-bars');
    container.innerHTML = '';

    dims.forEach(function (dim) {
      var median = snapshot.medians[dim.key];
      if (!median) return;

      var userScore = scores.display[dim.key];
      var userPct = (userScore / 10) * 100;
      var medianPct = (median / 10) * 100;
      var tier = dim.key === 'overall' ? scores.tiers.overall : scores.tiers[dim.key];
      var color = tier ? tier.color : 'var(--alpha-ember)';

      var row = document.createElement('div');
      row.className = 'assess__benchmark-row';

      var comparison = '';
      var diff = userScore - median;
      if (diff > 0.2) {
        comparison = ' <strong>' + diff.toFixed(1) + ' above</strong> median';
      } else if (diff < -0.2) {
        comparison = ' <strong>' + Math.abs(diff).toFixed(1) + ' below</strong> median';
      } else {
        comparison = ' At median';
      }

      row.innerHTML =
        '<span class="assess__benchmark-dim">' + dim.label + '</span>' +
        '<div class="assess__benchmark-track">' +
          '<div class="assess__benchmark-user" style="background:' + color + ';" data-width="' + userPct + '%"></div>' +
          '<div class="assess__benchmark-median" style="left:' + medianPct + '%;">' +
            '<span class="assess__benchmark-median-label">Median ' + median.toFixed(1) + '</span>' +
          '</div>' +
        '</div>' +
        '<span class="assess__benchmark-value">' + userScore.toFixed(1) + comparison + '</span>';

      container.appendChild(row);
    });

    // Show teaser for percentile detail
    $('benchmark-teaser').style.display = '';

    section.style.display = '';

    // Animate bars
    setTimeout(function () {
      var fills = container.querySelectorAll('.assess__benchmark-user[data-width]');
      for (var i = 0; i < fills.length; i++) {
        (function (el, idx) {
          setTimeout(function () {
            el.style.width = el.getAttribute('data-width');
          }, idx * 150);
        })(fills[i], i);
      }
    }, 200);
  }

  function renderBenchmarkPersonalized(benchmark) {
    var section = $('results-benchmark');
    if (!section || !benchmark || !benchmark.overallPercentile) return;

    var sourceText = benchmark.dataSource === 'peer_data'
      ? 'Based on ' + benchmark.sampleCount + ' assessments \u2014 ' + benchmark.segmentLabel
      : benchmark.dataSource === 'blended'
      ? 'Peer data + industry research \u2014 ' + benchmark.segmentLabel
      : 'Based on industry research \u2014 ' + benchmark.segmentLabel;

    $('benchmark-source').textContent = sourceText;

    // Hide teaser
    $('benchmark-teaser').style.display = 'none';

    var container = $('benchmark-bars');
    container.innerHTML = '';

    var dims = [
      { key: 'overall', pctKey: 'overallPercentile', label: 'Overall' },
      { key: 'mindset', pctKey: 'mindsetPercentile', label: 'Mindset' },
      { key: 'skillset', pctKey: 'skillsetPercentile', label: 'Skillset' },
      { key: 'toolset', pctKey: 'toolsetPercentile', label: 'Toolset' }
    ];

    dims.forEach(function (dim) {
      var percentile = benchmark[dim.pctKey];
      if (!percentile) return;

      var color = percentile >= 75 ? 'var(--assess-tier-green)'
        : percentile >= 50 ? 'var(--assess-tier-yellow)'
        : percentile >= 25 ? 'var(--assess-tier-orange)'
        : 'var(--assess-tier-red)';

      var pctLabel = percentile >= 50
        ? 'Top ' + (100 - percentile) + '%'
        : percentile + 'th percentile';

      var row = document.createElement('div');
      row.className = 'assess__benchmark-pct';
      row.innerHTML =
        '<span class="assess__benchmark-pct-dim">' + dim.label + '</span>' +
        '<div class="assess__benchmark-pct-track">' +
          '<div class="assess__benchmark-pct-fill" style="background:' + color + ';" data-width="' + percentile + '%"></div>' +
        '</div>' +
        '<span class="assess__benchmark-pct-value">' + escapeHtml(pctLabel) + '</span>';

      container.appendChild(row);
    });

    section.style.display = '';

    // Animate
    setTimeout(function () {
      var fills = container.querySelectorAll('.assess__benchmark-pct-fill[data-width]');
      for (var i = 0; i < fills.length; i++) {
        (function (el, idx) {
          setTimeout(function () {
            el.style.width = el.getAttribute('data-width');
          }, idx * 150);
        })(fills[i], i);
      }
    }, 200);
  }

  // ── API Helpers ──
  function postAssessmentComplete() {
    var payload = {
      sessionId: state.sessionId,
      role: state.role,
      industry: state.industry,
      companySize: state.companySize,
      startedAt: state.startedAt,
      completedAt: state.completedAt || new Date().toISOString(),
      answers: state.answers,
      scores: {
        raw: state.scores.raw,
        display: state.scores.display,
        tiers: state.scores.tiers,
        pattern: state.scores.pattern
      }
    };

    state.completionPromise = fetch('/api/assessment/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (data.id) state.assessmentId = data.id;
    })
    .catch(function (err) {
      // Non-blocking — log but don't disrupt UX
      console.error('Failed to store assessment:', err);
    });
  }

  // ── Event Bindings ──
  function init() {
    // Check for saved state and offer resume
    var saved = loadState();
    var resuming = false;
    if (saved && saved.sessionId && saved.screen === 'question' && Object.keys(saved.answers).length > 0) {
      var resume = confirm('You have an assessment in progress. Resume where you left off?');
      if (resume) {
        state.sessionId = saved.sessionId;
        state.role = saved.role;
        state.industry = saved.industry;
        state.companySize = saved.companySize;
        state.currentQuestion = saved.currentQuestion;
        state.answers = saved.answers;
        state.startedAt = saved.startedAt;
        resuming = true;
      } else {
        clearState();
      }
    }

    // Landing -> Context
    $('assess-start-btn').addEventListener('click', function () {
      showScreen('context');
    });

    // Context form validation (radio buttons)
    var roleRadios = document.querySelectorAll('input[name="role"]');
    var industryRadios = document.querySelectorAll('input[name="industry"]');
    var sizeRadios = document.querySelectorAll('input[name="company_size"]');
    var contextNext = $('assess-context-next');
    var roleOtherWrap = $('assess-role-other-wrap');
    var roleOtherInput = $('assess-role-other');
    var otherWrap = $('assess-industry-other-wrap');
    var otherInput = $('assess-industry-other');

    function getCheckedValue(radios) {
      for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked) return radios[i].value;
      }
      return '';
    }

    function validateContext() {
      var role = getCheckedValue(roleRadios);
      var roleFilled = role !== 'other' || (roleOtherInput.value.trim() !== '');
      var industry = getCheckedValue(industryRadios);
      var size = getCheckedValue(sizeRadios);
      var industryFilled = industry !== 'other' || (otherInput.value.trim() !== '');
      contextNext.disabled = !(role && roleFilled && industry && industryFilled && size);
    }

    // Role radios
    var industryGroup = $('assess-industry-group');
    for (var i = 0; i < roleRadios.length; i++) {
      roleRadios[i].addEventListener('change', function () {
        var val = getCheckedValue(roleRadios);
        roleOtherWrap.style.display = val === 'other' ? '' : 'none';
        if (val === 'other') {
          roleOtherInput.focus();
        } else {
          setTimeout(function () {
            industryGroup.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 150);
        }
        validateContext();
      });
    }
    roleOtherInput.addEventListener('input', validateContext);

    // Industry radios
    var sizeGroup = $('assess-size-group');
    for (var i = 0; i < industryRadios.length; i++) {
      industryRadios[i].addEventListener('change', function () {
        var val = getCheckedValue(industryRadios);
        otherWrap.style.display = val === 'other' ? '' : 'none';
        if (val === 'other') {
          otherInput.focus();
        } else {
          setTimeout(function () {
            sizeGroup.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 150);
        }
        validateContext();
      });
    }
    for (var i = 0; i < sizeRadios.length; i++) {
      sizeRadios[i].addEventListener('change', validateContext);
    }
    otherInput.addEventListener('input', validateContext);

    // Context -> First question
    contextNext.addEventListener('click', function () {
      var role = getCheckedValue(roleRadios);
      if (role === 'other') role = 'other:' + roleOtherInput.value.trim();

      var industry = getCheckedValue(industryRadios);
      if (industry === 'other') industry = 'other:' + otherInput.value.trim();

      state.sessionId = generateId();
      state.role = role;
      state.industry = industry;
      state.companySize = getCheckedValue(sizeRadios);
      state.startedAt = new Date().toISOString();

      track('Assessment Started', {
        role: state.role,
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

    // ── Free-response controls ──
    // Context toggle
    $('assess-context-toggle').addEventListener('click', function () {
      var toggle = $('assess-context-toggle');
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');

      // Cancel auto-advance when opening
      if (!expanded && autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
        autoAdvanceTimer = null;
      }

      // Focus textarea when opening
      if (!expanded) {
        setTimeout(function () { $('assess-free-textarea').focus(); }, 50);
      }
    });

    // Textarea input — char count + save
    $('assess-free-textarea').addEventListener('input', function () {
      var textarea = $('assess-free-textarea');
      var val = textarea.value;
      $('assess-char-count').textContent = val.length + ' / 500';

      var q = QUESTIONS[state.currentQuestion];
      if (state.answers[q.id]) {
        if (val.trim()) {
          state.answers[q.id].freeText = val;
        } else {
          delete state.answers[q.id].freeText;
        }
        saveState();
      }
    });

    // Mic button
    $('assess-mic-btn').addEventListener('click', function () {
      if (typeof SpeechEngine === 'undefined' || !SpeechEngine.isSupported()) return;

      var micBtn = $('assess-mic-btn');
      var micStatus = $('assess-mic-status');
      var modelProgress = $('assess-model-progress');
      var modelProgressFill = $('assess-model-progress-fill');
      var textarea = $('assess-free-textarea');

      if (SpeechEngine.isRecording()) {
        SpeechEngine.stop();
        return;
      }

      // Cancel auto-advance
      if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
        autoAdvanceTimer = null;
      }

      SpeechEngine.start({
        onResult: function (text, isFinal) {
          if (isFinal) {
            // Append transcribed text to textarea
            var current = textarea.value;
            if (current && !current.endsWith(' ')) current += ' ';
            textarea.value = current + text;
            $('assess-char-count').textContent = textarea.value.length + ' / 500';

            // Save to state
            var q = QUESTIONS[state.currentQuestion];
            if (state.answers[q.id]) {
              state.answers[q.id].freeText = textarea.value;
              saveState();
            }

            micBtn.classList.remove('assess__mic-btn--recording');
            micStatus.textContent = '';
          } else {
            micStatus.textContent = text;
          }
        },
        onEnd: function () {
          micBtn.classList.remove('assess__mic-btn--recording');
          micStatus.textContent = '';
        },
        onError: function (msg) {
          micBtn.classList.remove('assess__mic-btn--recording', 'assess__mic-btn--loading');
          micStatus.textContent = msg;
          modelProgress.style.display = 'none';
        },
        onProgress: function (p) {
          // Whisper model download progress
          if (p.status === 'progress' && p.progress != null) {
            modelProgress.style.display = '';
            modelProgressFill.style.width = Math.round(p.progress) + '%';
            modelProgress.setAttribute('aria-valuenow', Math.round(p.progress));
            micBtn.classList.add('assess__mic-btn--loading');
            micStatus.textContent = 'Loading speech model...';
          }
          if (p.status === 'done' || p.status === 'ready') {
            modelProgress.style.display = 'none';
            micBtn.classList.remove('assess__mic-btn--loading');
            micStatus.textContent = '';
          }
        }
      });

      micBtn.classList.add('assess__mic-btn--recording');
      micStatus.textContent = SpeechEngine.getEngine() === 'native' ? 'Listening...' : 'Starting...';
    });

    // Next button
    $('assess-next-btn').addEventListener('click', function () {
      // Stop any active recording
      if (typeof SpeechEngine !== 'undefined' && SpeechEngine.isRecording()) {
        SpeechEngine.stop();
      }
      advanceFromQuestion(state.currentQuestion);
    });

    // Insight -> Next section or processing
    $('assess-insight-next').addEventListener('click', function () {
      var nextQ = state.currentQuestion + 1;
      if (nextQ < QUESTIONS.length) {
        state.currentQuestion = nextQ;
        renderQuestion(nextQ);
      } else {
        // Final section — go to processing
        state.completedAt = new Date().toISOString();
        saveState();
        showProcessingScreen();
      }
    });

    // Email form — sends full report via API
    var emailForm = $('assess-email-form');
    if (emailForm) {
      emailForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = $('assess-name').value.trim();
        var email = $('assess-email').value.trim();
        if (!name || !email) return;

        track('Assessment Email Submitted', {
          overall_score: state.scores ? state.scores.display.overall : 0
        });

        // Extract domain and prefill share email placeholders
        var domain = extractDomain(email);
        if (domain) prefillShareEmails(domain);

        // Disable form while sending
        var submitBtn = emailForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Sending...';
        }

        // Remove any previous error
        var prevError = emailForm.querySelector('.assess__form-error');
        if (prevError) prevError.remove();

        // Wait for assessment record to be stored before requesting the report
        var ready = state.completionPromise || Promise.resolve();
        ready.then(function () {
          return fetch('/api/assessment/report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: state.sessionId,
              name: name,
              email: email
            })
          });
        })
        .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
        .then(function (result) {
          if (!result.ok) throw new Error(result.data.error || 'Failed to send report');

          // Store user info for share flow
          state.userName = name;
          state.userEmail = email;

          // Render personalized benchmark if available
          if (result.data.benchmark) {
            renderBenchmarkPersonalized(result.data.benchmark);
          }

          // Enable share send buttons
          enableShareButtons();

          // Replace form with confirmation
          emailForm.innerHTML =
            '<div style="text-align:center;padding:24px;">' +
              '<p style="font-size:18px;color:var(--alpha-white);font-weight:600;margin-bottom:12px;">Thank you, ' + escapeHtml(name) + '.</p>' +
              '<p style="font-size:15px;color:var(--alpha-sand);line-height:1.6;">Your full AI Readiness Report has been sent to ' + escapeHtml(email) + '.</p>' +
            '</div>';

        })
        .catch(function (err) {
          console.error('Report email error:', err);
          // Show inline error, keep form visible
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send My Full Report';
          }
          var errorEl = document.createElement('p');
          errorEl.className = 'assess__form-error';
          errorEl.style.cssText = 'color:#DC2626;font-size:14px;margin-top:12px;text-align:center;';
          errorEl.textContent = 'Something went wrong. Please try again.';
          emailForm.appendChild(errorEl);
        });
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

    // Resume saved session (after all listeners are bound)
    if (resuming) {
      renderQuestion(state.currentQuestion);
    }
  }

  // ── Social Share (X, LinkedIn, Facebook) ──
  var X_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>';
  var LINKEDIN_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>';
  var FB_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>';
  var COPY_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>';

  function renderSocialShare() {
    var container = $('assess-social-share');
    var btnWrap = $('social-share-buttons');
    if (!container || !btnWrap || !state.scores || !state.sessionId) return;
    if (container.getAttribute('data-rendered')) return;
    container.setAttribute('data-rendered', 'true');

    var scores = state.scores;
    var overall = scores.display.overall;
    var tierLabel = scores.tiers.overall.label;
    var m = scores.display.mindset;
    var s = scores.display.skillset;
    var t = scores.display.toolset;
    var shareUrl = 'https://alphasmb.com/results/' + state.sessionId;

    // X share text (~200 chars)
    var xText = 'I scored ' + overall.toFixed(1) + '/10 on the AI Readiness Assessment \u2014 ' + tierLabel + '.\n\nMindset ' + m.toFixed(1) + ' \u00B7 Skillset ' + s.toFixed(1) + ' \u00B7 Toolset ' + t.toFixed(1) + '\n\nHow ready is your organization?';
    var xUrl = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(xText) + '&url=' + encodeURIComponent(shareUrl);

    // LinkedIn share (relies on OG tags for card)
    var liUrl = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(shareUrl);

    // LinkedIn copy text
    var liText = 'I just took the AlphaSMB AI Readiness Assessment and scored ' + overall.toFixed(1) + '/10 \u2014 ' + tierLabel + '.\n\nMindset: ' + m.toFixed(1) + '/10 | Skillset: ' + s.toFixed(1) + '/10 | Toolset: ' + t.toFixed(1) + '/10\n\nFree 5-minute diagnostic \u2014 worth taking if you\'re leading AI adoption.';

    // Facebook share
    var fbUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(shareUrl);

    btnWrap.innerHTML =
      '<a href="' + escapeHtml(xUrl) + '" target="_blank" rel="noopener noreferrer" class="assess__social-btn assess__social-btn--x" data-platform="x">' + X_ICON + ' Share on X</a>' +
      '<a href="' + escapeHtml(liUrl) + '" target="_blank" rel="noopener noreferrer" class="assess__social-btn assess__social-btn--linkedin" data-platform="linkedin">' + LINKEDIN_ICON + ' Share on LinkedIn</a>' +
      '<a href="' + escapeHtml(fbUrl) + '" target="_blank" rel="noopener noreferrer" class="assess__social-btn assess__social-btn--facebook" data-platform="facebook">' + FB_ICON + ' Share on Facebook</a>' +
      '<button type="button" class="assess__social-btn assess__social-btn--copy" data-platform="copy">' + COPY_ICON + ' Copy post</button>';

    container.style.display = '';

    // Clipboard helper — copies text and shows a brief toast
    function copyAndToast(text, label) {
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(text).then(function () {
        var toast = document.createElement('div');
        toast.className = 'assess__copy-toast';
        toast.textContent = label + ' text copied — paste into your post';
        container.appendChild(toast);
        // Trigger reflow then animate in
        toast.offsetHeight;
        toast.classList.add('assess__copy-toast--visible');
        setTimeout(function () {
          toast.classList.remove('assess__copy-toast--visible');
          setTimeout(function () { toast.remove(); }, 300);
        }, 2500);
      });
    }

    // Track clicks + auto-copy for platforms that don't support pre-filled text
    var btns = btnWrap.querySelectorAll('.assess__social-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function (e) {
        var platform = this.getAttribute('data-platform');
        track('Social Share Clicked', {
          platform: platform,
          overall_score: overall,
          tier: tierLabel
        });

        if (platform === 'linkedin') {
          copyAndToast(liText + '\n' + shareUrl, 'LinkedIn');
        } else if (platform === 'facebook') {
          copyAndToast(liText + '\n' + shareUrl, 'Facebook');
        } else if (platform === 'copy') {
          e.preventDefault();
          var btn = this;
          if (navigator.clipboard) {
            navigator.clipboard.writeText(liText + '\n' + shareUrl).then(function () {
              btn.innerHTML = COPY_ICON + ' Copied!';
              btn.classList.add('copied');
              setTimeout(function () {
                btn.innerHTML = COPY_ICON + ' Copy post';
                btn.classList.remove('copied');
              }, 2000);
            });
          }
        }
      });
    }
  }

  // ── Share / Distribute Logic ──
  var LEADERSHIP_ROLES = ['ceo_founder', 'cto', 'coo', 'cpo', 'cmo'];

  var ROLE_LABELS = {
    ceo_founder: 'CEO / Founder',
    cto: 'CTO',
    coo: 'COO',
    cpo: 'CPO',
    cmo: 'CMO',
    other: 'Other'
  };

  function isLeadership(role) {
    if (!role) return false;
    // Strip "other:" prefix for comparison
    var baseRole = role.indexOf('other:') === 0 ? 'other' : role;
    return LEADERSHIP_ROLES.indexOf(baseRole) !== -1;
  }

  function renderShareSection() {
    var section = $('assess-share-section');
    var leaderView = $('share-leader-view');
    var memberView = $('share-member-view');

    if (!section) return;

    var role = state.role;
    var userIsLeader = isLeadership(role);

    section.style.display = '';

    if (userIsLeader) {
      leaderView.style.display = '';
      memberView.style.display = 'none';

      // Roles to distribute to: all leadership roles except user's own, plus "Other"
      var baseRole = role.indexOf('other:') === 0 ? 'other' : role;
      var roles = LEADERSHIP_ROLES.filter(function (r) { return r !== baseRole; });
      roles.push('other');
      renderRoleSelector('share-leader-roles', 'share-leader-emails', roles, 'share-leader-send');
      bindSendButton('share-leader-send', 'share-leader-note', 'distribute');
    } else {
      leaderView.style.display = 'none';
      memberView.style.display = '';

      // Non-leader shares with leadership roles
      renderRoleSelector('share-member-roles', 'share-member-emails', LEADERSHIP_ROLES, 'share-member-send');
      bindSendButton('share-member-send', 'share-member-note', 'share_with_leader');
    }
  }

  function renderRoleSelector(rolesContainerId, emailsContainerId, roles, sendBtnId) {
    var rolesContainer = $(rolesContainerId);
    var emailsContainer = $(emailsContainerId);

    rolesContainer.innerHTML = '';
    emailsContainer.innerHTML = '';

    roles.forEach(function (roleKey) {
      var label = ROLE_LABELS[roleKey] || roleKey;

      // Role toggle button
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'assess__share-role-btn';
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('data-role', roleKey);
      btn.textContent = label;
      rolesContainer.appendChild(btn);

      // Email row (hidden initially)
      var emailRow = document.createElement('div');
      emailRow.className = 'assess__share-email-row';
      emailRow.id = 'share-email-row-' + rolesContainerId + '-' + roleKey;
      emailRow.style.display = 'none';

      var emailLabel = document.createElement('label');
      emailLabel.className = 'assess__share-email-label';
      emailLabel.textContent = label + ' email';
      emailLabel.setAttribute('for', 'share-email-' + rolesContainerId + '-' + roleKey);

      var emailInput = document.createElement('input');
      emailInput.type = 'email';
      emailInput.className = 'assess__share-email-input';
      emailInput.id = 'share-email-' + rolesContainerId + '-' + roleKey;
      emailInput.placeholder = label.toLowerCase().replace(/\s*\/\s*/g, '.').replace(/\s+/g, '') + '@company.com';
      emailInput.setAttribute('data-role', roleKey);
      emailInput.autocomplete = 'off';

      emailRow.appendChild(emailLabel);
      emailRow.appendChild(emailInput);
      emailsContainer.appendChild(emailRow);

      // Button click → toggle role + email field
      btn.addEventListener('click', function () {
        var pressed = btn.getAttribute('aria-pressed') === 'true';
        btn.setAttribute('aria-pressed', pressed ? 'false' : 'true');
        btn.classList.toggle('assess__share-role-btn--selected', !pressed);
        emailRow.style.display = pressed ? 'none' : '';
        if (!pressed) emailInput.focus();
        updateSendBtn(sendBtnId, emailsContainerId);
        updateVisibility(rolesContainerId);
      });

      // Email input → auto-select role button
      emailInput.addEventListener('input', function () {
        var hasValue = emailInput.value.trim() !== '';
        if (hasValue && btn.getAttribute('aria-pressed') !== 'true') {
          btn.setAttribute('aria-pressed', 'true');
          btn.classList.add('assess__share-role-btn--selected');
        }
        updateSendBtn(sendBtnId, emailsContainerId);
      });
    });
  }

  function updateSendBtn(sendBtnId, emailsContainerId) {
    var sendBtn = $(sendBtnId);
    var emailsContainer = $(emailsContainerId);
    if (!sendBtn || !emailsContainer) return;

    // Gated on report form — can't send shares without user identity
    if (!state.userEmail) {
      sendBtn.disabled = true;
      return;
    }

    var inputs = emailsContainer.querySelectorAll('.assess__share-email-input');
    var hasValid = false;
    for (var i = 0; i < inputs.length; i++) {
      var row = inputs[i].closest('.assess__share-email-row');
      if (row && row.style.display !== 'none' && inputs[i].value.trim() && inputs[i].validity.valid) {
        hasValid = true;
        break;
      }
    }
    sendBtn.disabled = !hasValid;
  }

  function updateVisibility(rolesContainerId) {
    // Only relevant for leader view
    var visSection = $('share-leader-visibility');
    if (!visSection) return;

    var rolesContainer = $(rolesContainerId);
    if (!rolesContainer) return;

    // Check if leader view is active
    var leaderView = $('share-leader-view');
    if (!leaderView || leaderView.style.display === 'none') return;

    var buttons = rolesContainer.querySelectorAll('.assess__share-role-btn');
    var anySelected = false;
    for (var i = 0; i < buttons.length; i++) {
      if (buttons[i].getAttribute('aria-pressed') === 'true') {
        anySelected = true;
        break;
      }
    }
    visSection.style.display = anySelected ? '' : 'none';
  }

  function collectShareIntent(type) {
    var isLeaderView = type === 'distribute';
    var rolesContainerId = isLeaderView ? 'share-leader-roles' : 'share-member-roles';
    var emailsContainerId = isLeaderView ? 'share-leader-emails' : 'share-member-emails';

    var rolesContainer = $(rolesContainerId);
    var emailsContainer = $(emailsContainerId);
    var recipients = [];

    var buttons = rolesContainer.querySelectorAll('.assess__share-role-btn');
    for (var i = 0; i < buttons.length; i++) {
      if (buttons[i].getAttribute('aria-pressed') === 'true') {
        var roleKey = buttons[i].getAttribute('data-role');
        var emailInput = emailsContainer.querySelector('input[data-role="' + roleKey + '"]');
        if (emailInput && emailInput.value.trim()) {
          recipients.push({ role: roleKey, email: emailInput.value.trim() });
        }
      }
    }

    var visibility = 'leader_only';
    if (isLeaderView) {
      var visRadios = document.querySelectorAll('input[name="share_visibility"]');
      for (var j = 0; j < visRadios.length; j++) {
        if (visRadios[j].checked) {
          visibility = visRadios[j].value;
          break;
        }
      }
    }

    return {
      type: type,
      senderRole: state.role,
      recipients: recipients,
      visibility: visibility
    };
  }

  function extractDomain(email) {
    if (!email || email.indexOf('@') === -1) return '';
    var domain = email.split('@')[1];
    // Skip generic email providers
    var generic = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'mail.com', 'protonmail.com', 'proton.me'];
    if (generic.indexOf(domain.toLowerCase()) !== -1) return '';
    return domain;
  }

  function prefillShareEmails(domain) {
    var inputs = document.querySelectorAll('.assess__share-email-input');
    for (var i = 0; i < inputs.length; i++) {
      if (!inputs[i].value) {
        var roleKey = inputs[i].getAttribute('data-role');
        var label = ROLE_LABELS[roleKey] || roleKey;
        inputs[i].placeholder = label.toLowerCase().replace(/\s*\/\s*/g, '.').replace(/\s+/g, '') + '@' + domain;
      }
    }
  }

  function bindSendButton(sendBtnId, noteId, type) {
    var sendBtn = $(sendBtnId);
    if (!sendBtn) return;

    // Gate: require report form submission first
    var note = $(noteId);
    if (!state.userEmail) {
      sendBtn.disabled = true;
      if (note) {
        note.textContent = 'Submit the report form above to enable sharing.';
        note.style.display = '';
      }
    }

    sendBtn.addEventListener('click', function () {
      if (!state.userEmail || !state.userName) {
        if (note) {
          note.textContent = 'Submit the report form above first.';
          note.style.display = '';
        }
        return;
      }

      var intent = collectShareIntent(type);

      track('Assessment Share Intent', {
        type: type,
        sender_role: state.role,
        recipient_count: intent.recipients.length,
        visibility: intent.visibility
      });

      // Disable button while sending
      sendBtn.disabled = true;
      sendBtn.textContent = 'Sending...';
      if (note) note.style.display = 'none';

      var payload = {
        sessionId: state.sessionId,
        type: type,
        senderRole: state.role,
        senderName: state.userName,
        senderEmail: state.userEmail,
        recipients: intent.recipients,
        visibility: intent.visibility
      };

      fetch('/api/assessment/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
      .then(function (result) {
        if (!result.ok) throw new Error(result.data.error || 'Failed to send');

        sendBtn.textContent = 'Sent!';
        sendBtn.disabled = true;
        if (note) {
          note.textContent = result.data.sent + ' email' + (result.data.sent !== 1 ? 's' : '') + ' sent.';
          note.style.display = '';
        }
      })
      .catch(function (err) {
        console.error('Share error:', err);
        sendBtn.disabled = false;
        sendBtn.textContent = type === 'distribute' ? 'Send Invitations' : 'Share My Results';
        if (note) {
          note.textContent = 'Something went wrong. Please try again.';
          note.style.display = '';
        }
      });
    });
  }

  function enableShareButtons() {
    // Called after report form is submitted — remove the gating notes and re-enable
    var buttons = ['share-leader-send', 'share-member-send'];
    var notes = ['share-leader-note', 'share-member-note'];
    for (var i = 0; i < buttons.length; i++) {
      var btn = $(buttons[i]);
      var note = $(notes[i]);
      if (btn && btn.textContent !== 'Sent!') {
        // Re-run the send button validation to check if valid emails exist
        var emailsContainerId = i === 0 ? 'share-leader-emails' : 'share-member-emails';
        updateSendBtn(buttons[i], emailsContainerId);
      }
      if (note && note.textContent === 'Submit the report form above to enable sharing.') {
        note.style.display = 'none';
        note.textContent = '';
      }
    }
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
