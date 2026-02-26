const supabase = require('./supabase');

// Personal/free email domains — users with these still get benchmarks,
// just no company affiliation
const PERSONAL_DOMAINS = [
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.uk', 'yahoo.co.in',
  'hotmail.com', 'hotmail.co.uk', 'outlook.com', 'outlook.co.uk', 'live.com',
  'msn.com', 'aol.com', 'icloud.com', 'me.com', 'mac.com',
  'mail.com', 'email.com', 'inbox.com', 'fastmail.com', 'zoho.com',
  'protonmail.com', 'proton.me', 'tutanota.com', 'tutamail.com',
  'yandex.com', 'yandex.ru', 'gmx.com', 'gmx.net', 'gmx.de',
  'web.de', 'mail.ru', 'rambler.ru', 'qq.com', '163.com', '126.com',
  'comcast.net', 'att.net', 'verizon.net', 'sbcglobal.net', 'cox.net',
  'charter.net', 'earthlink.net', 'optonline.net', 'frontier.com'
];

const personalSet = new Set(PERSONAL_DOMAINS);

function extractDomain(email) {
  if (!email || typeof email !== 'string') return null;
  var parts = email.split('@');
  if (parts.length !== 2) return null;
  return parts[1].toLowerCase().trim();
}

function isPersonalEmail(domain) {
  return personalSet.has(domain);
}

async function resolveCompany(email) {
  var domain = extractDomain(email);
  if (!domain) return { company: null, isPersonal: true, domain: null };

  if (isPersonalEmail(domain)) {
    return { company: null, isPersonal: true, domain: domain };
  }

  // Upsert: insert if new, return existing if found
  var { data, error } = await supabase
    .from('companies')
    .upsert(
      { domain: domain, updated_at: new Date().toISOString() },
      { onConflict: 'domain', ignoreDuplicates: false }
    )
    .select('id, domain, name, industry, company_size')
    .single();

  if (error) {
    console.error('Company resolution error:', error);
    return { company: null, isPersonal: false, domain: domain };
  }

  return { company: data, isPersonal: false, domain: domain };
}

module.exports = { resolveCompany, extractDomain, isPersonalEmail };
