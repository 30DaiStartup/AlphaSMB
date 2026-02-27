// AlphaSMB Organization Dashboard — Auth, Data Fetching, Rendering
(function () {
  'use strict';

  var STORAGE_KEY = 'alphasmb_dashboard_token';
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

  var ROLE_LABELS = {
    ceo_founder: 'CEO / Founder',
    cto: 'CTO',
    coo: 'COO',
    cpo: 'CPO',
    cmo: 'CMO',
  };

  function formatRole(raw) {
    if (!raw) return 'Not specified';
    if (ROLE_LABELS[raw]) return ROLE_LABELS[raw];
    if (raw.indexOf('other:') === 0) {
      var custom = raw.slice(6).trim();
      return custom || 'Other';
    }
    return raw;
  }

  // ── State ──
  var token = null;
  var userEmail = '';
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
    var screens = document.querySelectorAll('.dash__screen');
    for (var i = 0; i < screens.length; i++) {
      screens[i].classList.remove('dash__screen--active');
    }
    var el = $('screen-' + name);
    if (el) el.classList.add('dash__screen--active');
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
    return 'dash__tier--' + key;
  }

  function tierColor(key) {
    return TIER_COLORS[key] || '#78716C';
  }

  function scoreTierColor(score) {
    if (score > 8.5) return '#15803D';
    if (score > 7.0) return '#16A34A';
    if (score > 5.0) return '#CA8A04';
    if (score > 3.0) return '#EA580C';
    return '#DC2626';
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
    window.history.replaceState({}, '', '/dashboard');

    var msg = $('login-message');
    msg.textContent = 'Verifying...';
    msg.className = 'dash__login-message';

    fetch(API_BASE + '/auth/verify?token=' + encodeURIComponent(magicToken))
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
      .then(function (res) {
        if (res.ok && res.data.token) {
          saveToken(res.data.token);
          userEmail = res.data.email || '';
          $('user-email').textContent = userEmail;
          $('company-name').textContent = res.data.companyName || res.data.domain || '';
          showScreen('dashboard');
          loadDashboard();
        } else {
          msg.textContent = res.data.error || 'Invalid or expired link. Please request a new one.';
          msg.className = 'dash__login-message dash__login-message--error';
        }
      })
      .catch(function () {
        msg.textContent = 'Something went wrong. Please try again.';
        msg.className = 'dash__login-message dash__login-message--error';
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
          msg.textContent = 'If that\u2019s a valid work email, a login link has been sent. Check your inbox.';
          msg.className = 'dash__login-message dash__login-message--success';
          btn.textContent = 'Link Sent';
        })
        .catch(function () {
          msg.textContent = 'Something went wrong. Please try again.';
          msg.className = 'dash__login-message dash__login-message--error';
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
    fetch(API_BASE + '/dashboard/org', { headers: authHeaders() })
      .then(function (r) {
        if (r.status === 401) {
          clearToken();
          showScreen('login');
          var msg = $('login-message');
          msg.textContent = 'Session expired. Please sign in again.';
          msg.className = 'dash__login-message dash__login-message--error';
          return null;
        }
        return r.json();
      })
      .then(function (data) {
        if (!data) return;

        assessments = data.assessments || [];
        var pendingList = data.pending || [];
        for (var p = 0; p < pendingList.length; p++) {
          assessments.push(pendingList[p]);
        }

        // Show company name from API if we don't have it yet
        var companyEl = $('company-name');
        if (!companyEl.textContent && data.company) {
          companyEl.textContent = data.company.name || data.company.domain || '';
        }

        if (assessments.length === 0) {
          // Show empty state, hide data sections
          $('empty-state').hidden = false;
          $('summary-cards').style.display = 'none';
          return;
        }

        $('empty-state').hidden = true;
        $('summary-cards').style.display = '';

        renderSummary(data.summary);
        renderDimensionBars(data.summary);
        renderTierBars(data.distributions.tiers, data.summary.teamCount);
        renderBreakdown('role-breakdown', data.distributions.roles);
        renderTable();
      })
      .catch(function (err) {
        console.error('Dashboard load error:', err);
      });
  }

  // ── Render: Summary Cards ──
  function renderSummary(s) {
    $('stat-team').textContent = s.teamCount;
    $('stat-avg').textContent = s.avgOverall + '/10';
    $('stat-week').textContent = s.thisWeek;

    var strongestEl = $('stat-strongest');
    if (s.strongestDimension) {
      var dimScore = s['avg' + s.strongestDimension] || 0;
      strongestEl.innerHTML = '<span class="dash__card-value--sm">' + esc(s.strongestDimension) + '</span>';
    } else {
      strongestEl.textContent = '—';
    }
  }

  // ── Render: Dimension Bars ──
  function renderDimensionBars(s) {
    var container = $('dimension-bars');
    var dims = [
      { label: 'Mindset', score: s.avgMindset },
      { label: 'Skillset', score: s.avgSkillset },
      { label: 'Toolset', score: s.avgToolset },
    ];

    var html = '';
    for (var i = 0; i < dims.length; i++) {
      var d = dims[i];
      var pct = Math.round((d.score / 10) * 100);
      var color = scoreTierColor(d.score);
      html += '<div class="dash__dim-row">' +
        '<span class="dash__dim-label">' + esc(d.label) + '</span>' +
        '<div class="dash__dim-bar-track"><div class="dash__dim-bar-fill" style="width:' + pct + '%;background:' + color + '"></div></div>' +
        '<span class="dash__dim-score" style="color:' + color + '">' + d.score.toFixed(1) + '</span>' +
        '</div>';
    }
    container.innerHTML = html;
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
      html += '<div class="dash__tier-row">' +
        '<span class="dash__tier-label">' + esc(t.label) + '</span>' +
        '<div class="dash__tier-bar-track"><div class="dash__tier-bar-fill" style="width:' + pct + '%;background:' + color + '"></div></div>' +
        '<span class="dash__tier-count">' + t.count + '</span>' +
        '</div>';
    }
    container.innerHTML = html;
  }

  // ── Render: Breakdowns ──
  function renderBreakdown(containerId, items) {
    var container = $(containerId);
    if (!items || items.length === 0) {
      container.innerHTML = '<p class="dash__empty">No data yet.</p>';
      return;
    }
    var html = '';
    for (var i = 0; i < items.length; i++) {
      html += '<div class="dash__breakdown-row">' +
        '<span class="dash__breakdown-label">' + esc(items[i].label) + '</span>' +
        '<span class="dash__breakdown-count">' + items[i].count + '</span>' +
        '</div>';
    }
    container.innerHTML = html;
  }

  // ── Table: Sort, Search ──
  function getFilteredAssessments() {
    var search = ($('table-search').value || '').toLowerCase().trim();

    var filtered = [];
    for (var i = 0; i < assessments.length; i++) {
      var a = assessments[i];

      if (search) {
        var haystack = ((a.user_name || '') + ' ' + (a.user_email || '') + ' ' + formatRole(a.role)).toLowerCase();
        if (haystack.indexOf(search) === -1) continue;
      }

      filtered.push(a);
    }

    // Sort — invited rows always at bottom
    filtered.sort(function (a, b) {
      var aInv = a.status === 'invited' ? 1 : 0;
      var bInv = b.status === 'invited' ? 1 : 0;
      if (aInv !== bInv) return aInv - bInv;

      var av = a[sortKey];
      var bv = b[sortKey];
      if (av == null) av = '';
      if (bv == null) bv = '';

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
      if (a.status === 'invited') {
        html += '<tr class="dash__tr--invited">' +
          '<td>—</td>' +
          '<td>' + esc(a.user_email || '—') + '</td>' +
          '<td>—</td>' +
          '<td>—</td>' +
          '<td class="dash__td-status--invited">Invited</td>' +
          '<td>—</td>' +
          '</tr>';
      } else {
        var score = a.overall_display != null ? Number(a.overall_display).toFixed(1) : '—';
        html += '<tr>' +
          '<td>' + esc(a.user_name || '—') + '</td>' +
          '<td>' + esc(a.user_email || '—') + '</td>' +
          '<td>' + esc(formatRole(a.role)) + '</td>' +
          '<td class="dash__td-score ' + tierClass(a.overall_tier) + '">' + score + '</td>' +
          '<td class="dash__td-tier ' + tierClass(a.overall_tier) + '">' + esc(tierLabel(a.overall_tier)) + '</td>' +
          '<td>' + formatDate(a.created_at) + '</td>' +
          '</tr>';
      }
    }
    tbody.innerHTML = html;

    // Update sort indicators
    var ths = document.querySelectorAll('.dash__table th[data-sort]');
    for (var j = 0; j < ths.length; j++) {
      ths[j].classList.remove('dash__th--sorted-asc', 'dash__th--sorted-desc');
      if (ths[j].getAttribute('data-sort') === sortKey) {
        ths[j].classList.add(sortDir === 'asc' ? 'dash__th--sorted-asc' : 'dash__th--sorted-desc');
      }
    }
  }

  function initTableControls() {
    // Sort headers
    var ths = document.querySelectorAll('.dash__table th[data-sort]');
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
