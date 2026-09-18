import { store } from './lib/store.js';

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'GET') {
    const { status = 'all', search = '' } = req.query || {};
    const tickets = store.getTickets({ status, search });
    return res.status(200).json({ tickets, total: tickets.length });
  }

  if (method === 'POST') {
    const { employeeId, employeeName, issue, status, assignedTeam, sourcePolicies, notes } = req.body || {};
    if (!issue) {
      return res.status(400).json({ error: 'Issue description is required.' });
    }
    const ticket = store.createTicket({
      employeeId,
      employeeName,
      issue,
      status,
      assignedTeam,
      sourcePolicies,
      notes
    });
    return res.status(201).json({ ticket });
  }

  if (method === 'PATCH' || method === 'PUT') {
    const { ticketId, status, notes, assignedTeam } = req.body || {};
    if (!ticketId) {
      return res.status(400).json({ error: 'ticketId is required.' });
    }
    const updated = store.updateTicket(ticketId, { status, notes, assignedTeam });
    if (!updated) {
      return res.status(404).json({ error: `Ticket ${ticketId} not found.` });
    }
    return res.status(200).json({ ticket: updated });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
