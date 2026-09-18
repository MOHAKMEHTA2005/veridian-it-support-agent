import React, { useState, useEffect } from 'react';
import { Shield, Search, FileText, CheckCircle2, HelpCircle, AlertTriangle, ArrowRightCircle, ExternalLink, X } from 'lucide-react';
import { fetchAuditLogs } from '../services/api';

export default function AuditDashboard({ onInspectPolicy, onInspectTicket }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decisionFilter, setDecisionFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedAudit, setSelectedAudit] = useState(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchAuditLogs({ decision: decisionFilter, search });
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [decisionFilter, search]);

  const getDecisionBadge = (decision) => {
    switch (decision) {
      case 'RESOLVE':
        return <span className="decision-badge RESOLVE"><CheckCircle2 size={12} /> RESOLVED</span>;
      case 'CLARIFY':
        return <span className="decision-badge CLARIFY"><HelpCircle size={12} /> CLARIFY</span>;
      case 'ESCALATE':
        return <span className="decision-badge ESCALATE"><AlertTriangle size={12} /> ESCALATED</span>;
      case 'ROUTE':
        return <span className="decision-badge ROUTE"><ArrowRightCircle size={12} /> ROUTED</span>;
      default:
        return <span className="decision-badge">{decision}</span>;
    }
  };

  return (
    <div className="table-container">
      <div className="table-toolbar">
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Append-Oriented Audit Trail</h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
            Comprehensive, verifiable decision log with factual evidence and policy grounding
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="filter-pills">
            {['all', 'RESOLVE', 'CLARIFY', 'ESCALATE', 'ROUTE'].map(f => (
              <button
                key={f}
                className={`filter-pill ${decisionFilter === f ? 'active' : ''}`}
                onClick={() => setDecisionFilter(f)}
              >
                {f === 'all' ? 'All Events' : f}
              </button>
            ))}
          </div>

          <input
            type="text"
            className="search-input"
            placeholder="Search audit trail..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Event ID</th>
              <th>Employee</th>
              <th>Detected Intent</th>
              <th>Decision</th>
              <th>Action Type</th>
              <th>Source Grounding</th>
              <th>Linked Ticket</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  Loading audit logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  No audit logs recorded yet. Submit a message in the AI Support view to generate audit records.
                </td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedAudit(log)}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#818cf8' }}>
                    {log.id.slice(0, 15)}...
                  </td>
                  <td>{log.employeeName || log.employeeId}</td>
                  <td style={{ maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {log.intent}
                  </td>
                  <td>{getDecisionBadge(log.decision)}</td>
                  <td>
                    <span style={{ fontSize: '0.75rem', background: '#1e293b', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#cbd5e1' }}>
                      {log.action?.type || 'NONE'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {log.sourcePolicies && log.sourcePolicies.length > 0 ? (
                        log.sourcePolicies.map((p, idx) => (
                          <span key={idx} style={{ fontSize: '0.6875rem', background: '#312e81', color: '#c7d2fe', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>
                            {p}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>None</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {log.ticketId ? (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>
                        {log.ticketId}
                      </span>
                    ) : (
                      <span style={{ color: '#64748b', fontSize: '0.75rem' }}>—</span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Audit Detail Modal */}
      {selectedAudit && (
        <div className="modal-overlay" onClick={() => setSelectedAudit(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0.5rem', borderRadius: '8px', color: '#818cf8' }}>
                  <FileText size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Audit Event: {selectedAudit.id}</h3>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Actor: {selectedAudit.actor} • Request: {selectedAudit.requestId}</span>
                </div>
              </div>
              <button className="close-btn" onClick={() => setSelectedAudit(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: '#1e293b', padding: '0.75rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Employee</div>
                  <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>{selectedAudit.employeeName} ({selectedAudit.employeeId})</div>
                </div>
                <div style={{ background: '#1e293b', padding: '0.75rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Decision & Result</div>
                  <div style={{ marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {getDecisionBadge(selectedAudit.decision)}
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{selectedAudit.resultingStatus}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.375rem' }}>Detected Intent</h4>
                <div style={{ background: '#0f172a', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #334155' }}>
                  {selectedAudit.intent}
                </div>
              </div>

              {selectedAudit.decisionEvidence && selectedAudit.decisionEvidence.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.5rem' }}>Factual Decision Evidence</h4>
                  <ul className="evidence-list">
                    {selectedAudit.decisionEvidence.map((ev, i) => (
                      <li key={i} className="evidence-item">{ev}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedAudit.sourcePolicies && selectedAudit.sourcePolicies.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.5rem' }}>Source Citations</h4>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {selectedAudit.sourcePolicies.map((p, i) => (
                      <button key={i} className="source-chip" onClick={() => { setSelectedAudit(null); onInspectPolicy(p); }}>
                        <Shield size={12} />
                        <span>{p}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #1e293b', paddingTop: '0.75rem' }}>
                Logged at: {new Date(selectedAudit.timestamp).toLocaleString()}
              </div>
            </div>

            <div className="modal-footer">
              <button 
                style={{ background: '#334155', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.875rem' }}
                onClick={() => setSelectedAudit(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
