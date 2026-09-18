// Client API service for Veridian Corp IT Support Agent

export async function sendMessage({ message, employeeId, conversationId }) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, employeeId, conversationId })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error: ${res.status}`);
  }
  return res.json();
}

export async function fetchTickets({ status = 'all', search = '' } = {}) {
  const query = new URLSearchParams({ status, search });
  const res = await fetch(`/api/tickets?${query}`);
  if (!res.ok) throw new Error('Failed to fetch tickets');
  return res.json();
}

export async function fetchAuditLogs({ decision = 'all', search = '', limit = 50 } = {}) {
  const query = new URLSearchParams({ decision, search, limit });
  const res = await fetch(`/api/audit?${query}`);
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}

export async function fetchPolicies() {
  const res = await fetch('/api/kb');
  if (!res.ok) throw new Error('Failed to fetch knowledge base policies');
  return res.json();
}

export async function fetchRequests() {
  const res = await fetch('/api/requests');
  if (!res.ok) throw new Error('Failed to fetch employee requests');
  return res.json();
}
