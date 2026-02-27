// Public results page for social sharing
// Serves OG meta tags for crawlers + branded score card for humans
// Route: /results/:sid → rewrites to /api/assessment/share-page?sid=:sid

const supabase = require('../_lib/supabase');
const { getSegmentSnapshot, formatSegmentLabel } = require('../_lib/benchmark');

const BRAND = {
  charcoal: '#1C1917',
  charcoalLight: '#292524',
  ember: '#E8450D',
  sand: '#F5F0EB',
  stone: '#78716C',
  slate: '#44403C',
  white: '#FFFFFF',
};

const TIER_COLORS = {
  red: '#DC2626',
  orange: '#EA580C',
  yellow: '#CA8A04',
  'light-green': '#16A34A',
  green: '#15803D',
};

const OVERALL_LABELS = {
  red: 'AI Stalled',
  orange: 'AI Aware',
  yellow: 'AI Building',
  'light-green': 'AI Advancing',
  green: 'AI Capable',
};

const DIM_LABELS = {
  red: 'Not Started',
  orange: 'Early Stage',
  yellow: 'Developing',
  'light-green': 'Advancing',
  green: 'Leading',
};

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildBenchRow(label, userScore, median, tierKey) {
  const userPct = Math.round((userScore / 10) * 100);
  const medianPct = Math.round((median / 10) * 100);
  const color = TIER_COLORS[tierKey] || TIER_COLORS.yellow;
  const diff = userScore - median;
  let comparison = '';
  if (diff > 0.2) {
    comparison = ' <strong>' + diff.toFixed(1) + ' above</strong> median';
  } else if (diff < -0.2) {
    comparison = ' <strong>' + Math.abs(diff).toFixed(1) + ' below</strong> median';
  } else {
    comparison = ' At median';
  }
  return `
    <div class="bench-row">
      <span class="bench-dim">${esc(label)}</span>
      <div class="bench-track">
        <div class="bench-user" style="width:${userPct}%;background:${color};"></div>
        <div class="bench-median" style="left:${medianPct}%;">
          <span class="bench-median-label">Median ${median.toFixed(1)}</span>
        </div>
      </div>
      <span class="bench-value">${userScore.toFixed(1)}${comparison}</span>
    </div>`;
}

function buildDimRow(label, score, tierKey) {
  const pct = Math.round((score / 10) * 100);
  const color = TIER_COLORS[tierKey] || TIER_COLORS.yellow;
  const tierLabel = DIM_LABELS[tierKey] || 'Developing';
  return `
    <div class="share-dim-row">
      <span class="share-dim-label">${esc(label)}</span>
      <div class="share-dim-track">
        <div class="share-dim-fill" style="width:${pct}%;background:${color};"></div>
      </div>
      <span class="share-dim-score">${score.toFixed(1)}</span>
      <span class="share-dim-tier" style="color:${color};">${esc(tierLabel)}</span>
    </div>`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sid = req.query.sid;
  if (!sid || !/^[0-9a-f-]{36}$/i.test(sid)) {
    return res.redirect(302, '/assessment');
  }

  try {
    const { data: assessment, error } = await supabase
      .from('assessments')
      .select('id, overall_display, overall_tier, mindset_display, mindset_tier, skillset_display, skillset_tier, toolset_display, toolset_tier, industry, company_size, user_name, user_email, role')
      .eq('session_id', sid)
      .single();

    if (error || !assessment || assessment.overall_display == null) {
      return res.redirect(302, '/assessment');
    }

    // Parse numeric strings
    const overall = Number(assessment.overall_display);
    const mindset = Number(assessment.mindset_display);
    const skillset = Number(assessment.skillset_display);
    const toolset = Number(assessment.toolset_display);

    const overallTier = assessment.overall_tier;
    const overallColor = TIER_COLORS[overallTier] || TIER_COLORS.yellow;
    const overallLabel = OVERALL_LABELS[overallTier] || 'AI Building';

    // Build percentile text from cached benchmark
    let percentileText = '';
    const { data: bench } = await supabase
      .from('benchmark_results')
      .select('overall_percentile, segment_key')
      .eq('assessment_id', assessment.id)
      .maybeSingle();

    if (bench && bench.overall_percentile && bench.overall_percentile >= 50) {
      const pos = 'Top ' + (100 - bench.overall_percentile) + '%';
      const industry = assessment.industry;
      if (industry) {
        const label = industry.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
        percentileText = pos + ' in ' + esc(label);
      }
    }

    // Fetch benchmark snapshot for "How You Compare" section
    const snapshot = await getSegmentSnapshot(assessment.industry, assessment.company_size);
    const hasSnapshot = snapshot && snapshot.medians && snapshot.medians.overall != null;
    const snapshotLabel = hasSnapshot
      ? (snapshot.dataSource === 'peer_data'
        ? 'Based on ' + snapshot.sampleCount + ' assessments — ' + formatSegmentLabel(assessment.industry, assessment.company_size)
        : 'Based on industry research — ' + formatSegmentLabel(assessment.industry, assessment.company_size))
      : '';

    // OG meta content
    const ogTitle = 'I scored ' + overall.toFixed(1) + '/10 \u2014 ' + overallLabel;
    const ogDesc = 'Mindset ' + mindset.toFixed(1) + ' \u00B7 Skillset ' + skillset.toFixed(1) + ' \u00B7 Toolset ' + toolset.toFixed(1) + (percentileText ? ' \u2014 ' + percentileText : '');
    const ogImage = 'https://alphasmb.com/api/assessment/og-image?sid=' + encodeURIComponent(sid);
    const pageUrl = 'https://www.alphasmb.com/assessment';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(ogTitle)} \u2014 AlphaSMB AI Readiness</title>

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${esc(pageUrl)}">
  <meta property="og:title" content="${esc(ogTitle)}">
  <meta property="og:description" content="${esc(ogDesc)}">
  <meta property="og:image" content="${esc(ogImage)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="AlphaSMB">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(ogTitle)}">
  <meta name="twitter:description" content="${esc(ogDesc)}">
  <meta name="twitter:image" content="${esc(ogImage)}">

  <link rel="icon" type="image/png" sizes="32x32" href="/graphics/Al-32x-tpbg.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
  <style>
    .share-page { max-width: 640px; margin: 0 auto; padding: 80px 24px 60px; }
    .share-header { text-align: center; margin-bottom: 40px; }
    .share-wordmark { font-size: 22px; font-weight: 700; color: ${BRAND.white}; text-decoration: none; }
    .share-wordmark span { color: ${BRAND.ember}; }
    .share-label { font-size: 13px; color: ${BRAND.stone}; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 8px; }
    .share-card { background: ${BRAND.charcoalLight}; border-radius: 12px; padding: 36px; margin-bottom: 40px; }
    .share-overall { text-align: center; margin-bottom: 32px; }
    .share-score { font-size: 64px; font-weight: 700; color: ${overallColor}; line-height: 1; }
    .share-score-max { font-size: 24px; font-weight: 400; color: ${BRAND.stone}; }
    .share-tier { display: inline-block; margin-top: 8px; padding: 4px 16px; border: 2px solid ${overallColor}; border-radius: 20px; font-size: 14px; font-weight: 700; color: ${overallColor}; }
    .share-percentile { font-size: 14px; color: ${BRAND.stone}; margin-top: 12px; }
    .share-dim-row { display: flex; align-items: center; margin-bottom: 14px; }
    .share-dim-label { width: 80px; font-size: 14px; font-weight: 600; color: ${BRAND.sand}; }
    .share-dim-track { flex: 1; height: 10px; background: ${BRAND.slate}; border-radius: 5px; overflow: hidden; margin: 0 12px; }
    .share-dim-fill { height: 100%; border-radius: 5px; }
    .share-dim-score { width: 36px; font-size: 14px; font-weight: 700; color: ${BRAND.white}; text-align: right; }
    .share-dim-tier { width: 80px; font-size: 12px; font-weight: 600; margin-left: 8px; }
    /* Benchmark section */
    .bench-section { background: ${BRAND.charcoalLight}; border: 1px solid ${BRAND.slate}; border-radius: 12px; padding: 36px; margin-bottom: 40px; }
    .bench-section h2 { font-size: 20px; font-weight: 700; color: ${BRAND.white}; margin: 0 0 8px; }
    .bench-source { font-size: 13px; color: ${BRAND.stone}; line-height: 1.5; margin: 0 0 20px; }
    .bench-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .bench-dim { min-width: 80px; font-size: 13px; font-weight: 600; color: ${BRAND.sand}; text-align: right; }
    .bench-track { flex: 1; height: 24px; background: ${BRAND.charcoal}; border-radius: 4px; position: relative; overflow: visible; }
    .bench-user { position: absolute; top: 0; left: 0; height: 100%; border-radius: 4px; }
    .bench-median { position: absolute; top: -2px; bottom: -2px; width: 2px; background: ${BRAND.sand}; opacity: 0.6; z-index: 1; }
    .bench-median-label { position: absolute; top: -18px; font-size: 10px; color: ${BRAND.stone}; white-space: nowrap; transform: translateX(-50%); }
    .bench-value { min-width: 100px; font-size: 13px; color: ${BRAND.sand}; text-align: left; }
    .bench-value strong { color: ${BRAND.white}; font-weight: 700; }
    .share-cta { text-align: center; padding: 40px 0; border-top: 1px solid ${BRAND.slate}; }
    .share-cta h2 { font-size: 24px; font-weight: 700; color: ${BRAND.white}; margin-bottom: 12px; }
    .share-cta p { font-size: 15px; color: ${BRAND.sand}; line-height: 1.6; margin-bottom: 24px; }
    .share-cta-btn { display: inline-block; background: ${BRAND.ember}; color: ${BRAND.white}; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; transition: background 0.15s; }
    .share-cta-btn:hover { background: #C53D0A; }
    .share-footer { text-align: center; padding: 24px 0; }
    .share-footer a { color: ${BRAND.ember}; text-decoration: none; font-size: 13px; }
    .share-footer p { font-size: 13px; color: ${BRAND.stone}; margin-top: 8px; }
    /* Distribute section */
    .dist-section { background: ${BRAND.charcoalLight}; border-radius: 12px; padding: 36px; margin-bottom: 40px; }
    .dist-section h2 { font-size: 20px; font-weight: 700; color: ${BRAND.white}; margin: 0 0 8px; }
    .dist-subtext { font-size: 14px; color: ${BRAND.sand}; line-height: 1.6; margin: 0 0 20px; }
    .dist-roles { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
    .dist-role-btn { padding: 8px 16px; background: transparent; border: 1px solid ${BRAND.slate}; border-radius: 6px; color: ${BRAND.sand}; font-size: 14px; font-weight: 600; cursor: pointer; transition: border-color 0.15s, background 0.15s; font-family: inherit; }
    .dist-role-btn:hover { border-color: ${BRAND.ember}; background: rgba(232,69,13,0.05); }
    .dist-role-btn--selected { border-color: ${BRAND.ember}; background: rgba(232,69,13,0.1); color: ${BRAND.ember}; }
    .dist-email-row { margin-bottom: 12px; }
    .dist-email-label { display: block; font-size: 13px; color: ${BRAND.stone}; margin-bottom: 4px; }
    .dist-email-input { width: 100%; padding: 10px 14px; background: ${BRAND.charcoal}; border: 1px solid ${BRAND.slate}; border-radius: 6px; color: ${BRAND.sand}; font-size: 14px; font-family: inherit; box-sizing: border-box; }
    .dist-email-input:focus { outline: 2px solid ${BRAND.ember}; outline-offset: 2px; border-color: ${BRAND.ember}; }
    .dist-send-btn { display: inline-block; background: ${BRAND.ember}; color: ${BRAND.white}; font-size: 15px; font-weight: 600; padding: 12px 28px; border: none; border-radius: 8px; cursor: pointer; font-family: inherit; transition: background 0.15s; margin-top: 8px; }
    .dist-send-btn:hover:not(:disabled) { background: #C53D0A; }
    .dist-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .dist-note { font-size: 13px; color: ${BRAND.stone}; margin-top: 12px; }
    .dist-note--success { color: #16A34A; }

    @media (max-width: 768px) {
      .share-score { font-size: 48px; }
      .share-card { padding: 24px 20px; }
      .share-dim-label { width: 64px; font-size: 12px; }
      .share-dim-tier { width: 64px; font-size: 11px; }
      .dist-section { padding: 24px 20px; }
      .dist-roles { gap: 6px; }
      .dist-role-btn { padding: 6px 12px; font-size: 13px; }
      .bench-section { padding: 24px 20px; }
      .bench-dim { min-width: 64px; font-size: 12px; }
      .bench-value { min-width: 80px; font-size: 12px; }
    }
  </style>
  <script async src="https://plausible.io/js/pa-Rev0XSByyBqh9fk6o5PPi.js" integrity="sha384-6YTkDhBXl3wLZiL8weqvbjIaJ2V5R7HDgryaE814JkwVMGJelE+PmT71+CQwLQ/b" crossorigin="anonymous"></script>
  <script>
    window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
    plausible.init();
    plausible('Share Page Viewed');
  </script>
</head>
<body>
  <div class="share-page">
    <div class="share-header">
      <a href="/" class="share-wordmark"><span>Alpha</span>SMB</a>
      <p class="share-label">AI Readiness Score</p>
    </div>

    <div class="share-card">
      <div class="share-overall">
        <div class="share-score">${overall.toFixed(1)}<span class="share-score-max"> / 10</span></div>
        <div class="share-tier">${esc(overallLabel)}</div>
        ${percentileText ? '<p class="share-percentile">' + percentileText + '</p>' : ''}
      </div>

      ${buildDimRow('Mindset', mindset, assessment.mindset_tier)}
      ${buildDimRow('Skillset', skillset, assessment.skillset_tier)}
      ${buildDimRow('Toolset', toolset, assessment.toolset_tier)}
    </div>

    ${hasSnapshot ? `
    <div class="bench-section">
      <h2>How You Compare</h2>
      <p class="bench-source">${esc(snapshotLabel)}</p>
      ${buildBenchRow('Overall', overall, snapshot.medians.overall, assessment.overall_tier)}
      ${buildBenchRow('Mindset', mindset, snapshot.medians.mindset || snapshot.medians.overall, assessment.mindset_tier)}
      ${buildBenchRow('Skillset', skillset, snapshot.medians.skillset || snapshot.medians.overall, assessment.skillset_tier)}
      ${buildBenchRow('Toolset', toolset, snapshot.medians.toolset || snapshot.medians.overall, assessment.toolset_tier)}
    </div>
    ` : ''}

    <div class="dist-section" id="distribute" style="display:none;">
      <h2>Distribute this assessment to your team</h2>
      <p class="dist-subtext">Select roles and enter email addresses. Each person gets their own personalized assessment link.</p>
      <div class="dist-roles" id="dist-roles"></div>
      <div class="dist-emails" id="dist-emails"></div>
      <button class="dist-send-btn" id="dist-send" disabled>Send Invitations</button>
      <p class="dist-note" id="dist-note" style="display:none;"></p>
    </div>

    <div class="share-cta">
      <h2>How ready is YOUR organization?</h2>
      <p>Take the free 5-minute AI Readiness Assessment and get your personalized score across mindset, skillset, and toolset.</p>
      <a href="/assessment" class="share-cta-btn">Take the Assessment</a>
    </div>

    <div class="share-footer">
      <a href="/">alphasmb.com</a>
      <p>&copy; 2026 AlphaSMB</p>
    </div>
  </div>
  <script>
  (function() {
    if (location.hash !== '#distribute') return;

    var SESSION_ID = ${JSON.stringify(sid)};
    var SENDER_NAME = ${JSON.stringify(assessment.user_name || '')};
    var SENDER_EMAIL = ${JSON.stringify(assessment.user_email || '')};
    var SENDER_ROLE = ${JSON.stringify(assessment.role || '')};

    if (!SENDER_EMAIL) return;

    var LEADERSHIP = ['ceo_founder', 'cto', 'coo', 'cpo', 'cmo'];
    var LABELS = { ceo_founder: 'CEO / Founder', cto: 'CTO', coo: 'COO', cpo: 'CPO', cmo: 'CMO', other: 'Other' };

    var section = document.getElementById('distribute');
    section.style.display = '';

    var senderBase = SENDER_ROLE.indexOf('other:') === 0 ? 'other' : SENDER_ROLE;
    var roles = LEADERSHIP.filter(function(r) { return r !== senderBase; });
    roles.push('other');

    var rolesEl = document.getElementById('dist-roles');
    var emailsEl = document.getElementById('dist-emails');
    var sendBtn = document.getElementById('dist-send');
    var noteEl = document.getElementById('dist-note');

    var domain = '';
    if (SENDER_EMAIL.indexOf('@') !== -1) {
      var d = SENDER_EMAIL.split('@')[1];
      var generic = ['gmail.com','yahoo.com','hotmail.com','outlook.com','aol.com','icloud.com','mail.com','protonmail.com','proton.me'];
      if (generic.indexOf(d.toLowerCase()) === -1) domain = d;
    }

    roles.forEach(function(roleKey) {
      var label = LABELS[roleKey] || roleKey;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dist-role-btn';
      btn.textContent = label;
      btn.setAttribute('data-role', roleKey);
      rolesEl.appendChild(btn);

      var row = document.createElement('div');
      row.className = 'dist-email-row';
      row.style.display = 'none';
      row.setAttribute('data-role', roleKey);

      var lbl = document.createElement('label');
      lbl.className = 'dist-email-label';
      lbl.textContent = label + ' email';

      var input = document.createElement('input');
      input.type = 'email';
      input.className = 'dist-email-input';
      input.setAttribute('data-role', roleKey);
      input.autocomplete = 'off';
      var prefix = label.toLowerCase().replace(/\\s*\\/\\s*/g, '.').replace(/\\s+/g, '');
      input.placeholder = prefix + '@' + (domain || 'company.com');

      row.appendChild(lbl);
      row.appendChild(input);
      emailsEl.appendChild(row);

      btn.addEventListener('click', function() {
        var selected = btn.classList.contains('dist-role-btn--selected');
        btn.classList.toggle('dist-role-btn--selected', !selected);
        row.style.display = selected ? 'none' : '';
        if (!selected) input.focus();
        updateSend();
      });

      input.addEventListener('input', function() {
        if (input.value.trim() && !btn.classList.contains('dist-role-btn--selected')) {
          btn.classList.add('dist-role-btn--selected');
        }
        updateSend();
      });
    });

    function updateSend() {
      var inputs = emailsEl.querySelectorAll('.dist-email-input');
      var valid = false;
      for (var i = 0; i < inputs.length; i++) {
        var row = inputs[i].closest('.dist-email-row');
        if (row && row.style.display !== 'none' && inputs[i].value.trim() && inputs[i].validity.valid) {
          valid = true; break;
        }
      }
      sendBtn.disabled = !valid;
    }

    sendBtn.addEventListener('click', function() {
      var recipients = [];
      var btns = rolesEl.querySelectorAll('.dist-role-btn--selected');
      for (var i = 0; i < btns.length; i++) {
        var rk = btns[i].getAttribute('data-role');
        var inp = emailsEl.querySelector('input[data-role="' + rk + '"]');
        if (inp && inp.value.trim() && inp.validity.valid) {
          recipients.push({ role: rk, email: inp.value.trim() });
        }
      }
      if (recipients.length === 0) return;

      sendBtn.disabled = true;
      sendBtn.textContent = 'Sending...';
      noteEl.style.display = 'none';

      fetch('/api/assessment/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: SESSION_ID,
          type: 'distribute',
          senderRole: SENDER_ROLE,
          senderName: SENDER_NAME,
          senderEmail: SENDER_EMAIL,
          recipients: recipients,
          visibility: 'leader_only'
        })
      })
      .then(function(res) { return res.json().then(function(d) { return { ok: res.ok, data: d }; }); })
      .then(function(result) {
        if (!result.ok) throw new Error(result.data.error || 'Failed');
        sendBtn.textContent = 'Sent!';
        noteEl.textContent = result.data.sent + ' invitation' + (result.data.sent !== 1 ? 's' : '') + ' sent.';
        noteEl.className = 'dist-note dist-note--success';
        noteEl.style.display = '';
      })
      .catch(function(err) {
        console.error('Distribute error:', err);
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send Invitations';
        noteEl.textContent = 'Something went wrong. Please try again.';
        noteEl.className = 'dist-note';
        noteEl.style.display = '';
      });
    });

    setTimeout(function() { section.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 300);
  })();
  </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, max-age=600');
    return res.status(200).send(html);
  } catch (err) {
    console.error('Share page error:', err);
    return res.redirect(302, '/assessment');
  }
};
