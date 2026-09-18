import React, { useState, useEffect } from 'react';
import { BookOpen, Search, ShieldCheck, Tag, ExternalLink } from 'lucide-react';
import { fetchPolicies } from '../services/api';

export default function KnowledgeBaseView({ onInspectPolicy }) {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchPolicies()
      .then(data => setPolicies(data.policies || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['all', ...new Set(policies.map(p => p.category))];

  const filtered = policies.filter(p => {
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    const s = search.toLowerCase();
    const matchesSearch = !search || 
      p.id.toLowerCase().includes(s) ||
      p.title.toLowerCase().includes(s) ||
      p.content.toLowerCase().includes(s) ||
      p.rules.some(r => r.toLowerCase().includes(s));
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="table-toolbar" style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Veridian Corp Knowledge Base</h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
            Authoritative source policies (KB-01 to KB-10 and Asset Management Policy Extract)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="filter-pills">
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-pill ${categoryFilter === cat ? 'active' : ''}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>

          <input
            type="text"
            className="search-input"
            placeholder="Search policies & rules..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading policies...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '1.25rem' }}>
          {filtered.map(policy => (
            <div 
              key={policy.id} 
              className="panel-card" 
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
              onClick={() => onInspectPolicy(policy.id)}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ 
                      fontFamily: 'var(--font-mono)', 
                      fontWeight: 700, 
                      color: '#818cf8',
                      background: 'rgba(99, 102, 241, 0.15)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.8125rem'
                    }}>
                      {policy.id}
                    </span>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{policy.title}</h3>
                  </div>
                  <span style={{ fontSize: '0.6875rem', background: '#1e293b', border: '1px solid #334155', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#94a3b8' }}>
                    {policy.category}
                  </span>
                </div>

                <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {policy.content}
                </p>

                {policy.rules && policy.rules.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, marginBottom: '0.375rem' }}>
                      Key Rules
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      {policy.rules.map((rule, idx) => (
                        <li key={idx} style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'flex-start', gap: '0.375rem' }}>
                          <ShieldCheck size={14} style={{ color: '#10b981', flexShrink: 0, marginTop: '1px' }} />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid #1e293b', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {policy.keywords?.slice(0, 3).map((kw, i) => (
                    <span key={i} style={{ fontSize: '0.6875rem', color: '#64748b' }}>#{kw}</span>
                  ))}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span>Inspect</span>
                  <ExternalLink size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
