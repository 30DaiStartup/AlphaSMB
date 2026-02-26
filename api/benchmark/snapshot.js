const { getSegmentSnapshot, formatSegmentLabel } = require('../_lib/benchmark');
const { validateEnv } = require('../_lib/config');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    validateEnv();

    var industry = req.query.industry || null;
    var companySize = req.query.companySize || null;

    // Basic input validation
    if (industry && typeof industry !== 'string') {
      return res.status(400).json({ error: 'Invalid industry parameter' });
    }
    if (companySize && typeof companySize !== 'string') {
      return res.status(400).json({ error: 'Invalid companySize parameter' });
    }

    var snapshot = await getSegmentSnapshot(industry, companySize);

    return res.status(200).json({
      success: true,
      medians: snapshot.medians,
      p25: snapshot.p25,
      p75: snapshot.p75,
      sampleCount: snapshot.sampleCount,
      dataSource: snapshot.dataSource,
      segmentLabel: formatSegmentLabel(industry, companySize)
    });
  } catch (err) {
    console.error('Benchmark snapshot error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
