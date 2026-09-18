import React from 'react';
import { X, Ticket, Clock, User, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TicketModal({ ticket, onClose, onInspectPolicy }) {
  if (!ticket) return null;

  const isClosed = ticket.status && (ticket.status.toLowerCase().includes('resolved') || ticket.status.toLowerCase().includes('closed'));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: isClosed ? 'rgba(100, 116, 139, 0.2)' : 'rgba(16, 185, 129, 0.2)', padding: '0.5rem', borderRadius: '8px', color: isClosed ? '#94a3b8' : '#34d399' }}>
              <Ticket size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{ticket.ticketId}</h3>
                <span style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.2rem 0.5rem', 
                  borderRadius: '9999px', 
                  fontWeight: 600,
                  background: isClosed ? 'rgba(100, 116, 139, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                  color: isClosed ? '#94a3b8' : '#34d399',
                  border: isClosed ? '1px solid #475569' : '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  {ticket.status}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {ticket.ticketId.startsWith('AI-') ? 'AI Agent Generated Ticket' : 'Assignment Historical Ticket Queue'}
              </span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div>
            <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.375rem' }}>
              Reported Issue
            </h4>
            <div style={{ background: '#0f172a', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #334155', fontSize: '0.9375rem' }}>
              {ticket.issue}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: '#1e293b', padding: '0.75rem', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Employee</div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginTop: '0.25rem' }}>{ticket.employeeName || ticket.employeeId}</div>
            </div>
            <div style={{ background: '#1e293b', padding: '0.75rem', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Assigned Team</div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginTop: '0.25rem', color: '#a5b4fc' }}>{ticket.assignedTeam || 'Unassigned'}</div>
            </div>
          </div>

          {ticket.notes && (
            <div>
              <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.375rem' }}>
                Resolution Notes / Rationale
              </h4>
              <div style={{ background: '#1e293b', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.875rem', color: '#cbd5e1' }}>
                {ticket.notes}
              </div>
            </div>
          )}

          {ticket.sourcePolicies && ticket.sourcePolicies.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.5rem' }}>
                Governing Policy Citations
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {ticket.sourcePolicies.map((polId, idx) => (
                  <button 
                    key={idx} 
                    className="source-chip"
                    onClick={() => onInspectPolicy(polId)}
                  >
                    <Shield size={12} />
                    <span>{polId}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #1e293b', paddingTop: '0.75rem' }}>
            <span>Created By: {ticket.createdBy || 'SYSTEM'}</span>
            <span>Created At: {new Date(ticket.createdAt || Date.now()).toLocaleString()}</span>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            style={{ background: '#334155', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 500, fontSize: '0.875rem' }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
