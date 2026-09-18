import React from 'react';
import { Bot, MessageSquare, Ticket, FileText, BookOpen, Users, LogIn, UserCheck } from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  employees = [], 
  activeEmployee, 
  setActiveEmployee,
  onOpenAuth,
  authUser
}) {
  return (
    <header className="navbar">
      <div className="nav-brand">
        <div className="brand-icon">
          <Bot size={22} />
        </div>
        <div>
          <div className="brand-title">VERIDIAN CORP</div>
          <div className="brand-subtitle">AI Internal IT Service Support Agent</div>
        </div>
      </div>

      <nav className="nav-tabs">
        <button
          className={`nav-tab ${currentTab === 'chat' ? 'active' : ''}`}
          onClick={() => setCurrentTab('chat')}
        >
          <MessageSquare size={16} />
          <span>AI Support</span>
        </button>

        <button
          className={`nav-tab ${currentTab === 'tickets' ? 'active' : ''}`}
          onClick={() => setCurrentTab('tickets')}
        >
          <Ticket size={16} />
          <span>Tickets Queue</span>
        </button>

        <button
          className={`nav-tab ${currentTab === 'audit' ? 'active' : ''}`}
          onClick={() => setCurrentTab('audit')}
        >
          <FileText size={16} />
          <span>Audit Trail</span>
        </button>

        <button
          className={`nav-tab ${currentTab === 'kb' ? 'active' : ''}`}
          onClick={() => setCurrentTab('kb')}
        >
          <BookOpen size={16} />
          <span>Knowledge Base</span>
        </button>

        <button
          className={`nav-tab ${currentTab === 'requests' ? 'active' : ''}`}
          onClick={() => setCurrentTab('requests')}
        >
          <Users size={16} />
          <span>Employee Scenarios</span>
        </button>
      </nav>

      <div className="nav-user">
        <div className="user-selector" title="Switch active employee profile">
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Employee:</span>
          <select 
            value={activeEmployee?.id || ''} 
            onChange={(e) => {
              const selected = employees.find(emp => emp.id === e.target.value);
              if (selected) setActiveEmployee(selected);
            }}
          >
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.department})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onOpenAuth}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            background: authUser ? 'rgba(16, 185, 129, 0.15)' : '#1e293b',
            border: authUser ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid #334155',
            color: authUser ? '#34d399' : '#cbd5e1',
            padding: '0.375rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            fontWeight: 500
          }}
        >
          {authUser ? (
            <>
              <UserCheck size={14} />
              <span>{authUser.email || authUser.displayName || 'Authenticated'}</span>
            </>
          ) : (
            <>
              <LogIn size={14} />
              <span>Firebase Auth</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
