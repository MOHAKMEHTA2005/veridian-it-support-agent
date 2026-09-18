import React from 'react';
import { Shield, CheckCircle2, HelpCircle, AlertTriangle, ArrowRightCircle, Ticket, Info } from 'lucide-react';

export default function DecisionCard({ decision, onInspectPolicy, onInspectTicket }) {
  if (!decision) {
    return (
      <div className="panel-card" style={{ opacity: 0.7 }}>
        <div className="panel-card-title">
          <span>Agent Decision Engine</span>
          <Info size={16} />
        </div>
        <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
          Submit an issue or click a sample employee request below to observe structured NLU analysis, deterministic policy verification, and action execution.
        </p>
      </div>
    );
  }

  const getDecisionConfig = (dec) => {
    switch (dec) {
      case 'RESOLVE':
        return {
          label: 'RESOLVED',
          icon: <CheckCircle2 size={16} />,
          className: 'decision-badge RESOLVE',
          desc: 'Request clearly grounded and supported by policy for resolution.'
        };
      case 'CLARIFY':
        return {
          label: 'CLARIFICATION REQUIRED',
          icon: <HelpCircle size={16} />,
          className: 'decision-badge CLARIFY',
          desc: 'Additional employee facts needed before action can be taken safely.'
        };
      case 'ESCALATE':
        return {
          label: 'ESCALATED',
          icon: <AlertTriangle size={16} />,
          className: 'decision-badge ESCALATE',
          desc: 'High-risk, security incident, policy conflict, or unauthorized access.'
        };
      case 'ROUTE':
        return {
          label: 'ROUTED',
          icon: <ArrowRightCircle size={16} />,
          className: 'decision-badge ROUTE',
          desc: 'Request owned by another department (Security, Finance, etc.).'
        };
      default:
        return {
          label: dec,
          icon: <Info size={16} />,
          className: 'decision-badge',
          desc: 'Evaluating policy status...'
        };
    }
  };

  const config = getDecisionConfig(decision.decision);

  return (
    <div className="panel-card" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
      <div className="panel-card-title">
        <span>Verified Decision State</span>
        <span className={config.className}>
          {config.icon}
          {config.label}
        </span>
      </div>

      <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
        {config.desc}
      </p>

      {/* Detected Intent */}
      {decision.intent && (
        <div style={{ marginBottom: '0.75rem', background: '#0f172a', padding: '0.625rem 0.75rem', borderRadius: '6px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Detected Intent</div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc', marginTop: '0.125rem' }}>
            {decision.intent}
          </div>
        </div>
      )}

      {/* Action Taken */}
      {decision.action && decision.action.type !== 'NONE' && (
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action Executed</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
            <span style={{ background: '#312e81', color: '#c7d2fe', padding: '0.25rem 0.625rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
              {decision.action.type}
            </span>
            {decision.action.parameters?.targetTeam && (
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                → {decision.action.parameters.targetTeam}
              </span>
            )}
            {decision.action.parameters?.isSimulated && (
              <span style={{ fontSize: '0.6875rem', color: '#cbd5e1', background: '#334155', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>
                Simulated Action
              </span>
            )}
          </div>
        </div>
      )}

      {/* Ticket Association */}
      {decision.ticket && (
        <div style={{ marginBottom: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.625rem 0.75rem', borderRadius: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Ticket size={16} style={{ color: '#818cf8' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#c7d2fe' }}>
                Ticket Created: {decision.ticket.ticketId}
              </span>
            </div>
            {onInspectTicket && (
              <button 
                style={{ fontSize: '0.75rem', color: '#818cf8', textDecoration: 'underline' }}
                onClick={() => onInspectTicket(decision.ticket)}
              >
                View
              </button>
            )}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Assigned: {decision.ticket.assignedTeam} • {decision.ticket.status}
          </div>
        </div>
      )}

      {/* Source Policies */}
      {decision.sourcePolicies && decision.sourcePolicies.length > 0 && (
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Source Citations (Grounding)
          </div>
          <div className="source-chips">
            {decision.sourcePolicies.map((polId, i) => (
              <button key={i} className="source-chip" onClick={() => onInspectPolicy(polId)}>
                <Shield size={12} />
                <span>{polId}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Decision Evidence (Factual, no raw CoT) */}
      {decision.decisionEvidence && decision.decisionEvidence.length > 0 && (
        <div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Factual Decision Evidence
          </div>
          <ul className="evidence-list">
            {decision.decisionEvidence.map((ev, i) => (
              <li key={i} className="evidence-item">
                {ev}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
