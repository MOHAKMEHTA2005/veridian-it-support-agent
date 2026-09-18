import React, { useState, useEffect } from 'react';
import { Ticket, Search, Filter, Shield, Clock, ExternalLink } from 'lucide-react';
import { fetchTickets } from '../services/api';

export default function TicketDashboard({ onInspectTicket, onInspectPolicy }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await fetchTickets({ status: statusFilter, search });
      setTickets(data.tickets || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [statusFilter, search]);

  return (
    <div className="table-container">
      <div className="table-toolbar">
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Veridian IT Ticket Queue</h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
            Historical tickets (TK-1042 to TK-1051) and runtime AI-generated tickets (AI-xxxx)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="filter-pills">
            {['all', 'active', 'resolved', 'escalated'].map(f => (
              <button
                key={f}
                className={`filter-pill ${statusFilter === f ? 'active' : ''}`}
                onClick={() => setStatusFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="search-input"
              placeholder="Search by ID, issue, employee..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Employee</th>
              <th>Issue Summary</th>
              <th>Status</th>
              <th>Assigned Team</th>
              <th>Source Policies</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  Loading tickets...
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  No tickets match the selected filter.
                </td>
              </tr>
            ) : (
              tickets.map(t => {
                const isAI = t.ticketId.startsWith('AI-');
                const isClosed = t.status && (t.status.toLowerCase().includes('resolved') || t.status.toLowerCase().includes('closed'));
                return (
                  <tr key={t.ticketId} style={{ cursor: 'pointer' }} onClick={() => onInspectTicket(t)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ 
                          fontFamily: 'var(--font-mono)', 
                          fontWeight: 600,
                          color: isAI ? '#818cf8' : '#cbd5e1'
                        }}>
                          {t.ticketId}
                        </span>
                        {isAI && (
                          <span style={{ fontSize: '0.625rem', background: '#312e81', color: '#c7d2fe', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>
                            AI Created
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{t.employeeName || t.employeeId}</td>
                    <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.issue}
                    </td>
                    <td>
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '9999px',
                        fontWeight: 600,
                        background: isClosed ? 'rgba(100, 116, 139, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                        color: isClosed ? '#94a3b8' : '#34d399',
                        border: isClosed ? '1px solid #475569' : '1px solid rgba(16, 185, 129, 0.3)'
                      }}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ color: '#a5b4fc', fontSize: '0.8125rem' }}>{t.assignedTeam || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {t.sourcePolicies && t.sourcePolicies.length > 0 ? (
                          t.sourcePolicies.map((p, i) => (
                            <span 
                              key={i} 
                              onClick={e => { e.stopPropagation(); onInspectPolicy(p); }}
                              style={{ fontSize: '0.6875rem', background: '#1e293b', border: '1px solid #334155', color: '#a5b4fc', padding: '0.1rem 0.35rem', borderRadius: '3px' }}
                            >
                              {p}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: '#64748b', fontSize: '0.75rem' }}>—</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button 
                        style={{ color: '#818cf8', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        onClick={(e) => { e.stopPropagation(); onInspectTicket(t); }}
                      >
                        <span>Details</span>
                        <ExternalLink size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
