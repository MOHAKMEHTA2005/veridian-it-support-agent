import { store } from './lib/store.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const requests = store.getRequests();
  const employees = store.getEmployees();

  return res.status(200).json({
    requests,
    employees,
    total: requests.length
  });
}
