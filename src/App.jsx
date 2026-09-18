import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ChatInterface from './components/ChatInterface';
import TicketDashboard from './components/TicketDashboard';
import AuditDashboard from './components/AuditDashboard';
import KnowledgeBaseView from './components/KnowledgeBaseView';
import EmployeeRequestsView from './components/EmployeeRequestsView';
import SourceModal from './components/SourceModal';
import TicketModal from './components/TicketModal';
import AuthModal from './components/AuthModal';
import { fetchPolicies, fetchRequests } from './services/api';
import { subscribeToAuth } from './services/firebase';

export default function App() {
  const [currentTab, setCurrentTab] = useState('chat');
  const [employees, setEmployees] = useState([]);
  const [activeEmployee, setActiveEmployee] = useState(null);
  const [policies, setPolicies] = useState([]);
  
  // Modals & Inspectors
  const [inspectPolicy, setInspectPolicy] = useState(null);
  const [inspectTicket, setInspectTicket] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authUser, setAuthUser] = useState(null);

  // Cross-tab interaction: Run request in agent
  const [promptToRun, setPromptToRun] = useState('');

  useEffect(() => {
    // Fetch initial employees and policies
    fetchRequests()
      .then(data => {
        if (data.employees && data.employees.length > 0) {
          setEmployees(data.employees);
          setActiveEmployee(data.employees[0]); // Default to Aditi Sharma
        }
      })
      .catch(err => console.error(err));

    fetchPolicies()
      .then(data => {
        setPolicies(data.policies || []);
      })
      .catch(err => console.error(err));

    // Listen to Firebase Auth state
    const unsubscribe = subscribeToAuth(user => {
      setAuthUser(user);
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  const handleInspectPolicyById = (policyId) => {
    const found = policies.find(p => p.id === policyId);
    if (found) {
      setInspectPolicy(found);
    } else {
      setInspectPolicy({
        id: policyId,
        title: policyId,
        category: 'Policy Reference',
        content: `Authoritative policy reference ${policyId} applied during agent evaluation.`
      });
    }
  };

  const handleRunRequest = (req) => {
    // Switch to that employee
    const emp = employees.find(e => e.id === req.employeeId || e.name === req.employeeName);
    if (emp) {
      setActiveEmployee(emp);
    }
    // Set prompt and switch to chat tab
    setPromptToRun(req.description);
    setCurrentTab('chat');
  };

  return (
    <div className="app-container">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        employees={employees}
        activeEmployee={activeEmployee}
        setActiveEmployee={setActiveEmployee}
        onOpenAuth={() => setIsAuthOpen(true)}
        authUser={authUser}
      />

      <main className="main-content">
        {currentTab === 'chat' && (
          <ChatInterface
            activeEmployee={activeEmployee}
            onInspectPolicy={handleInspectPolicyById}
            onInspectTicket={setInspectTicket}
            initialPrompt={promptToRun}
          />
        )}

        {currentTab === 'tickets' && (
          <TicketDashboard
            onInspectTicket={setInspectTicket}
            onInspectPolicy={handleInspectPolicyById}
          />
        )}

        {currentTab === 'audit' && (
          <AuditDashboard
            onInspectPolicy={handleInspectPolicyById}
            onInspectTicket={setInspectTicket}
          />
        )}

        {currentTab === 'kb' && (
          <KnowledgeBaseView
            onInspectPolicy={handleInspectPolicyById}
          />
        )}

        {currentTab === 'requests' && (
          <EmployeeRequestsView
            onRunRequest={handleRunRequest}
            onInspectPolicy={handleInspectPolicyById}
          />
        )}
      </main>

      {/* Modals */}
      <SourceModal
        policy={inspectPolicy}
        onClose={() => setInspectPolicy(null)}
      />

      <TicketModal
        ticket={inspectTicket}
        onClose={() => setInspectTicket(null)}
        onInspectPolicy={handleInspectPolicyById}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        authUser={authUser}
        onUserChange={setAuthUser}
      />
    </div>
  );
}
