import { store } from './lib/store.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { decision = 'all', search = '', limit = 50 } = req.query || {};
  const logs = store.getAuditLogs({
    decision,
    search,
    limit: parseInt(limit, 10) || 50
  });

  return res.status(200).json({
    logs,
    total: logs.length
  });
}
