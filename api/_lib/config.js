const REQUIRED_VARS = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'AUTH_SECRET'
];

let validated = false;

function validateEnv() {
  if (validated) return;
  const missing = REQUIRED_VARS.filter(function (key) {
    return !process.env[key];
  });
  if (missing.length > 0) {
    throw new Error('Missing required environment variables: ' + missing.join(', '));
  }
  validated = true;
}

module.exports = { validateEnv };
