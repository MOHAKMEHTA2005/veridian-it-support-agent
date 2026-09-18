import { store } from './lib/store.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const policies = store.getPolicies();
  return res.status(200).json({
    policies,
    total: policies.length
  });
}
