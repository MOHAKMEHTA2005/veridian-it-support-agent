import React, { useState, useEffect } from 'react';
import { Users, Play, CheckCircle, Clock, AlertTriangle, Shield } from 'lucide-react';
import { fetchRequests } from '../services/api';

export default function EmployeeRequestsView({ onRunRequest, onInspectPolicy }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests()
      .then(data => setRequests(data.requests || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="table-container">
      <div className="table-toolbar">
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Assignment Employee Requests (REQ-01 to REQ-15)</h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
            Click "Run in Agent" on any request to simulate that employee's session with grounded NLU & validation.
          </p>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Employee</th>
              <th>Date Opened</th>
              <th>Employee Request Statement</th>
              <th>Initial Action Taken</th>
              <th>Expected Policies</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  Loading employee requests...
                </td>
              </tr>
            ) : (
              requests.map(req => (
                <tr key={req.id}>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#818cf8' }}>
                      {req.id}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{req.employeeName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{req.email}</div>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                    {req.dateOpened}
                  </td>
                  <td style={{ maxWidth: '320px', fontSize: '0.875rem' }}>
                    "{req.description}"
                  </td>
                  <td>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      background: req.initialAction.includes('Not started') ? 'rgba(100, 116, 139, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                      color: req.initialAction.includes('Not started') ? '#94a3b8' : '#a5b4fc',
                      border: '1px solid var(--border-color)'
                    }}>
                      {req.initialAction}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {req.expectedPolicies?.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => onInspectPolicy(p)}
                          style={{
                            fontSize: '0.6875rem',
                            background: '#1e293b',
                            border: '1px solid #334155',
                            color: '#818cf8',
                            padding: '0.1rem 0.35rem',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => onRunRequest(req)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        background: '#4f46e5',
                        color: 'white',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Play size={12} fill="white" />
                      <span>Run in Agent</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
