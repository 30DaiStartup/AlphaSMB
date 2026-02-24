const supabase = require('../_lib/supabase');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId, role, industry, companySize, startedAt, completedAt, answers, scores } = req.body;

    // Validate required fields
    if (!sessionId || !answers || !scores) {
      return res.status(400).json({ error: 'Missing required fields: sessionId, answers, scores' });
    }

    if (!scores.raw || !scores.display || !scores.tiers) {
      return res.status(400).json({ error: 'Invalid scores structure' });
    }

    // Upsert into assessments table (keyed on session_id for idempotency)
    const { data, error } = await supabase
      .from('assessments')
      .upsert({
        session_id: sessionId,
        role: role || null,
        company_size: companySize || null,
        industry: industry || null,
        started_at: startedAt || null,
        completed_at: completedAt || new Date().toISOString(),
        answers: answers,
        mindset_raw: scores.raw.mindset,
        skillset_raw: scores.raw.skillset,
        toolset_raw: scores.raw.toolset,
        overall_raw: scores.raw.overall,
        mindset_display: scores.display.mindset,
        skillset_display: scores.display.skillset,
        toolset_display: scores.display.toolset,
        overall_display: scores.display.overall,
        mindset_tier: scores.tiers.mindset?.key || null,
        skillset_tier: scores.tiers.skillset?.key || null,
        toolset_tier: scores.tiers.toolset?.key || null,
        overall_tier: scores.tiers.overall?.key || null,
        pattern: scores.pattern || null,
      }, {
        onConflict: 'session_id',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase upsert error:', error);
      return res.status(500).json({ error: 'Failed to store assessment' });
    }

    return res.status(200).json({ id: data.id });
  } catch (err) {
    console.error('Assessment complete error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
