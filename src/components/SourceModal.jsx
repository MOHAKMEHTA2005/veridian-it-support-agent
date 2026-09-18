import React from 'react';
import { X, BookOpen, ShieldCheck, Tag } from 'lucide-react';

export default function SourceModal({ policy, onClose }) {
  if (!policy) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0.5rem', borderRadius: '8px', color: '#818cf8' }}>
              <BookOpen size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{policy.id}: {policy.title}</h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Category: {policy.category}</span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div>
            <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
              Authoritative Policy Statement
            </h4>
            <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #334155', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              {policy.content}
            </div>
          </div>

          {policy.rules && policy.rules.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                Governing Rules & Constraints
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {policy.rules.map((rule, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', background: '#1e293b', padding: '0.625rem 0.875rem', borderRadius: '6px', fontSize: '0.875rem' }}>
                    <ShieldCheck size={16} style={{ color: '#10b981', marginTop: '2px', flexShrink: 0 }} />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {policy.keywords && (
            <div>
              <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                Indexing Keywords
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {policy.keywords.map((kw, i) => (
                  <span key={i} style={{ background: '#334155', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', color: '#cbd5e1' }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button 
            style={{ background: '#6366f1', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 500, fontSize: '0.875rem' }}
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
