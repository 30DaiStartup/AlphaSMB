// AlphaSMB Admin Dashboard — Auth, Data Fetching, Rendering
(function () {
  'use strict';

  var STORAGE_KEY = 'alphasmb_admin_token';
  var API_BASE = '/api';

  var TIER_LABELS = {
    red: 'AI Stalled',
    orange: 'AI Aware',
    yellow: 'AI Building',
    'light-green': 'AI Advancing',
    green: 'AI Capable',
  };

  var TIER_COLORS = {
    red: '#DC2626',
    orange: '#EA580C',
    yellow: '#CA8A04',
    'light-green': '#16A34A',
    green: '#15803D',
  };

  // ── State ──
  var token = null;
  var assessments = [];
  var sortKey = 'created_at';
  var sortDir = 'desc';

  // ── Helpers ──
  function $(id) { return document.getElementById(id); }

  function esc(str) {
    if (!str) return '';
    var el = document.createElement('span');
    el.textContent = String(str);
    return el.innerHTML;
  }

  function showScreen(name) {
    var screens = document.querySelectorAll('.admin__screen');
    for (var i = 0; i < screens.length; i++) {
      screens[i].classList.remove('admin__screen--active');
    }
    var el = $('screen-' + name);
    if (el) el.classList.add('admin__screen--active');
  }

  function formatDate(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function tierLabel(key) {
    return TIER_LABELS[key] || key || '—';
  }

  function tierClass(key) {
    if (!key) return '';
    return 'admin__tier--' + key;
  }

  function tierBgClass(key) {
    if (!key) return '';
    return 'admin__tier-bg--' + key;
  }

  function tierColor(key) {
    return TIER_COLORS[key] || '#78716C';
  }

  // ── Token Management ──
  function saveToken(t) {
    token = t;
    try { localStorage.setItem(STORAGE_KEY, t); } catch (e) {}
  }

  function loadToken() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function clearToken() {
    token = null;
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }

  function authHeaders() {
    return { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };
  }

  // ── Auth Flow ──
  function handleMagicLinkToken() {
    var params = new URLSearchParams(window.location.search);
    var magicToken = params.get('token');
    if (!magicToken) return false;

    // Clean the URL
    window.history.replaceState({}, '', '/admin');

    var msg = $('login-message');
    msg.textContent = 'Verifying...';
    msg.className = 'admin__login-message';

    fetch(API_BASE + '/auth/verify?token=' + encodeURIComponent(magicToken))
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
      .then(function (res) {
        if (res.ok && res.data.token) {
          saveToken(res.data.token);
          $('admin-email').textContent = res.data.email || '';
          showScreen('dashboard');
          loadDashboard();
        } else {
          msg.textContent = res.data.error || 'Invalid or expired link. Please request a new one.';
          msg.className = 'admin__login-message admin__login-message--error';
        }
      })
      .catch(function () {
        msg.textContent = 'Something went wrong. Please try again.';
        msg.className = 'admin__login-message admin__login-message--error';
      });

    return true;
  }

  function initLogin() {
    var form = $('login-form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = $('login-email').value.trim();
      if (!email) return;

      var btn = $('login-btn');
      var msg = $('login-message');
      btn.disabled = true;
      btn.textContent = 'Sending...';
      msg.textContent = '';

      fetch(API_BASE + '/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email }),
      })
        .then(function () {
          msg.textContent = 'If that email is authorized, a login link has been sent. Check your inbox.';
          msg.className = 'admin__login-message admin__login-message--success';
          btn.textContent = 'Link Sent';
        })
        .catch(function () {
          msg.textContent = 'Something went wrong. Please try again.';
          msg.className = 'admin__login-message admin__login-message--error';
          btn.disabled = false;
          btn.textContent = 'Send Magic Link';
        });
    });
  }

  function initSignOut() {
    $('sign-out-btn').addEventListener('click', function () {
      clearToken();
      showScreen('login');
      $('login-email').value = '';
      $('login-message').textContent = '';
      $('login-btn').disabled = false;
      $('login-btn').textContent = 'Send Magic Link';
    });
  }

  // ── Dashboard Data ──
  function loadDashboard() {
    fetch(API_BASE + '/admin/assessments', { headers: authHeaders() })
      .then(function (r) {
        if (r.status === 401) {
          clearToken();
          showScreen('login');
          var msg = $('login-message');
          msg.textContent = 'Session expired. Please sign in again.';
          msg.className = 'admin__login-message admin__login-message--error';
          return null;
        }
        return r.json();
      })
      .then(function (data) {
        if (!data) return;
        assessments = data.assessments || [];
        renderSummary(data.summary);
        renderTierBars(data.distributions.tiers, data.summary.total);
        renderBreakdown('industry-breakdown', data.distributions.industries);
        renderBreakdown('size-breakdown', data.distributions.sizes);
        renderRecent(assessments.slice(0, 10));
        populateIndustryFilter(data.distributions.industries);
        renderTable();
      })
      .catch(function (err) {
        console.error('Dashboard load error:', err);
      });
  }

  // ── Render: Summary Cards ──
  function renderSummary(s) {
    $('stat-total').textContent = s.total;
    $('stat-email-rate').textContent = s.emailCaptureRate + '%';
    $('stat-avg-score').textContent = s.avgScore + '/10';
    $('stat-week').textContent = s.thisWeek;
  }

  // ── Render: Tier Bars ──
  function renderTierBars(tiers, total) {
    var container = $('tier-bars');
    var html = '';
    var tierKeys = ['red', 'orange', 'yellow', 'light-green', 'green'];

    for (var i = 0; i < tiers.length; i++) {
      var t = tiers[i];
      var pct = total > 0 ? Math.round((t.count / total) * 100) : 0;
      var color = TIER_COLORS[tierKeys[i]] || '#78716C';
      html += '<div class="admin__tier-row">' +
        '<span class="admin__tier-label">' + esc(t.label) + '</span>' +
        '<div class="admin__tier-bar-track"><div class="admin__tier-bar-fill" style="width:' + pct + '%;background:' + color + '"></div></div>' +
        '<span class="admin__tier-count">' + t.count + '</span>' +
        '</div>';
    }
    container.innerHTML = html;
  }

  // ── Render: Breakdowns ──
  function renderBreakdown(containerId, items) {
    var container = $(containerId);
    if (!items || items.length === 0) {
      container.innerHTML = '<p class="admin__empty">No data yet.</p>';
      return;
    }
    var html = '';
    var max = Math.min(items.length, 8);
    for (var i = 0; i < max; i++) {
      html += '<div class="admin__breakdown-row">' +
        '<span class="admin__breakdown-label">' + esc(items[i].label) + '</span>' +
        '<span class="admin__breakdown-count">' + items[i].count + '</span>' +
        '</div>';
    }
    container.innerHTML = html;
  }

  // ── Render: Recent Activity ──
  function renderRecent(items) {
    var container = $('recent-activity');
    if (!items || items.length === 0) {
      container.innerHTML = '<p class="admin__empty">No assessments yet.</p>';
      return;
    }
    var html = '';
    for (var i = 0; i < items.length; i++) {
      var a = items[i];
      var name = a.user_name || 'Anonymous';
      var score = a.overall_display != null ? Number(a.overall_display).toFixed(1) : '—';
      html += '<div class="admin__recent-row">' +
        '<span class="admin__recent-name">' + esc(name) + '</span>' +
        '<span class="admin__recent-score ' + tierClass(a.overall_tier) + '">' + score + '</span>' +
        '<span class="admin__recent-tier ' + tierBgClass(a.overall_tier) + '">' + esc(tierLabel(a.overall_tier)) + '</span>' +
        '<span class="admin__recent-date">' + formatDate(a.created_at) + '</span>' +
        '</div>';
    }
    container.innerHTML = html;
  }

  // ── Render: Industry Filter ──
  function populateIndustryFilter(industries) {
    var select = $('filter-industry');
    // Keep the "All Industries" option
    select.innerHTML = '<option value="">All Industries</option>';
    if (!industries) return;
    for (var i = 0; i < industries.length; i++) {
      var opt = document.createElement('option');
      opt.value = industries[i].label;
      opt.textContent = industries[i].label + ' (' + industries[i].count + ')';
      select.appendChild(opt);
    }
  }

  // ── Table: Sort, Filter, Search ──
  function getFilteredAssessments() {
    var search = ($('table-search').value || '').toLowerCase().trim();
    var tierFilter = $('filter-tier').value;
    var industryFilter = $('filter-industry').value;

    var filtered = [];
    for (var i = 0; i < assessments.length; i++) {
      var a = assessments[i];

      // Tier filter
      if (tierFilter && a.overall_tier !== tierFilter) continue;

      // Industry filter
      if (industryFilter && (a.industry || '') !== industryFilter) continue;

      // Text search
      if (search) {
        var haystack = ((a.user_name || '') + ' ' + (a.user_email || '') + ' ' + (a.email_domain || '')).toLowerCase();
        if (haystack.indexOf(search) === -1) continue;
      }

      filtered.push(a);
    }

    // Sort
    filtered.sort(function (a, b) {
      var av = a[sortKey];
      var bv = b[sortKey];
      if (av == null) av = '';
      if (bv == null) bv = '';

      // Numeric sort for scores
      if (sortKey === 'overall_display') {
        av = Number(av) || 0;
        bv = Number(bv) || 0;
      }

      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }

  function renderTable() {
    var rows = getFilteredAssessments();
    var tbody = $('table-body');
    var emptyMsg = $('table-empty');

    if (rows.length === 0) {
      tbody.innerHTML = '';
      emptyMsg.hidden = false;
      return;
    }

    emptyMsg.hidden = true;
    var html = '';
    for (var i = 0; i < rows.length; i++) {
      var a = rows[i];
      var score = a.overall_display != null ? Number(a.overall_display).toFixed(1) : '—';
      html += '<tr>' +
        '<td>' + esc(a.user_name || '—') + '</td>' +
        '<td>' + esc(a.user_email || '—') + '</td>' +
        '<td>' + esc(a.email_domain || '—') + '</td>' +
        '<td>' + esc(a.role || '—') + '</td>' +
        '<td>' + esc(a.industry || '—') + '</td>' +
        '<td>' + esc(a.company_size || '—') + '</td>' +
        '<td class="admin__td-score ' + tierClass(a.overall_tier) + '">' + score + '</td>' +
        '<td class="admin__td-tier ' + tierClass(a.overall_tier) + '">' + esc(tierLabel(a.overall_tier)) + '</td>' +
        '<td>' + formatDate(a.created_at) + '</td>' +
        '</tr>';
    }
    tbody.innerHTML = html;

    // Update sort indicators
    var ths = document.querySelectorAll('.admin__table th[data-sort]');
    for (var j = 0; j < ths.length; j++) {
      ths[j].classList.remove('admin__th--sorted-asc', 'admin__th--sorted-desc');
      if (ths[j].getAttribute('data-sort') === sortKey) {
        ths[j].classList.add(sortDir === 'asc' ? 'admin__th--sorted-asc' : 'admin__th--sorted-desc');
      }
    }
  }

  function initTableControls() {
    // Sort headers
    var ths = document.querySelectorAll('.admin__table th[data-sort]');
    for (var i = 0; i < ths.length; i++) {
      ths[i].addEventListener('click', function () {
        var key = this.getAttribute('data-sort');
        if (sortKey === key) {
          sortDir = sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          sortKey = key;
          sortDir = 'asc';
        }
        renderTable();
      });
    }

    // Search
    var searchTimer = null;
    $('table-search').addEventListener('input', function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(renderTable, 200);
    });

    // Filters
    $('filter-tier').addEventListener('change', renderTable);
    $('filter-industry').addEventListener('change', renderTable);
  }

  // ── Init ──
  function init() {
    initLogin();
    initSignOut();
    initTableControls();

    // Check for magic link token in URL
    if (handleMagicLinkToken()) return;

    // Check for existing session
    var existing = loadToken();
    if (existing) {
      token = existing;
      showScreen('dashboard');
      loadDashboard();
    } else {
      showScreen('login');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
