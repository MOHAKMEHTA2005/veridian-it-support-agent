import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Seed data
const initialPolicies = JSON.parse(readFileSync(join(__dirname, 'data/policies.json'), 'utf-8'));
const initialTickets = JSON.parse(readFileSync(join(__dirname, 'data/tickets.json'), 'utf-8'));
const initialRequests = JSON.parse(readFileSync(join(__dirname, 'data/requests.json'), 'utf-8'));
const initialEmployees = JSON.parse(readFileSync(join(__dirname, 'data/employees.json'), 'utf-8'));

// Runtime in-memory store with file sync fallback
class StorageManager {
  constructor() {
    this.policies = [...initialPolicies];
    this.tickets = [...initialTickets];
    this.requests = [...initialRequests];
    this.employees = [...initialEmployees];
    this.auditLogs = [];
    this.conversations = {};
    this.ticketCounter = 1;

    // Load any persisted runtime state if it exists
    this.runtimeFile = join(__dirname, 'data/runtime_state.json');
    this.loadState();
  }

  loadState() {
    try {
      if (existsSync(this.runtimeFile)) {
        const data = JSON.parse(readFileSync(this.runtimeFile, 'utf-8'));
        if (Array.isArray(data.runtimeTickets)) {
          // Merge runtime tickets with initial tickets, avoiding duplicates
          const existingIds = new Set(this.tickets.map(t => t.ticketId));
          for (const t of data.runtimeTickets) {
            if (!existingIds.has(t.ticketId)) {
              this.tickets.push(t);
              existingIds.add(t.ticketId);
            }
          }
        }
        if (Array.isArray(data.auditLogs)) {
          this.auditLogs = data.auditLogs;
        }
        if (data.conversations) {
          this.conversations = data.conversations;
        }
        if (typeof data.ticketCounter === 'number') {
          this.ticketCounter = data.ticketCounter;
        }
      }
    } catch (err) {
      console.warn('Could not load runtime state file, using initial data:', err.message);
    }
  }

  saveState() {
    try {
      const runtimeTickets = this.tickets.filter(t => t.ticketId.startsWith('AI-'));
      const state = {
        runtimeTickets,
        auditLogs: this.auditLogs,
        conversations: this.conversations,
        ticketCounter: this.ticketCounter
      };
      writeFileSync(this.runtimeFile, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Could not persist runtime state to disk:', err.message);
    }
  }

  // --- POLICIES ---
  getPolicies() {
    return this.policies;
  }

  getPolicyById(id) {
    return this.policies.find(p => p.id === id);
  }

  // --- TICKETS ---
  getTickets({ status = 'all', search = '' } = {}) {
    let list = [...this.tickets];

    if (status === 'active') {
      list = list.filter(t => t.isActive === true || (t.status && t.status.toLowerCase().includes('active')));
    } else if (status === 'resolved') {
      list = list.filter(t => t.isActive === false || (t.status && (t.status.toLowerCase().includes('resolved') || t.status.toLowerCase().includes('closed') || t.status.toLowerCase().includes('approved at'))));
    } else if (status === 'escalated') {
      list = list.filter(t => t.status && t.status.toLowerCase().includes('escalated'));
    }

    if (search) {
      const s = search.toLowerCase();
      list = list.filter(t => 
        t.ticketId.toLowerCase().includes(s) ||
        t.issue.toLowerCase().includes(s) ||
        (t.employeeName && t.employeeName.toLowerCase().includes(s)) ||
        (t.assignedTeam && t.assignedTeam.toLowerCase().includes(s))
      );
    }

    return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  getTicketById(ticketId) {
    return this.tickets.find(t => t.ticketId === ticketId);
  }

  createTicket({ employeeId, employeeName, issue, status, assignedTeam, sourcePolicies = [], sourceTickets = [], notes = '' }) {
    const padded = String(this.ticketCounter).padStart(4, '0');
    const ticketId = `AI-${padded}`;
    this.ticketCounter += 1;

    const isActive = !status.toLowerCase().includes('resolved') && !status.toLowerCase().includes('closed');

    const newTicket = {
      ticketId,
      employeeId: employeeId || 'EMP-UNKNOWN',
      employeeName: employeeName || 'Veridian Employee',
      issue,
      status: status || 'Pending Review (active)',
      isActive,
      assignedTeam: assignedTeam || 'IT Service Desk',
      sourcePolicies: Array.isArray(sourcePolicies) ? sourcePolicies : [sourcePolicies],
      sourceTickets: Array.isArray(sourceTickets) ? sourceTickets : [sourceTickets],
      createdBy: 'AI_AGENT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: notes || 'Ticket generated automatically by Veridian AI Support Agent'
    };

    this.tickets.unshift(newTicket);
    this.saveState();
    return newTicket;
  }

  updateTicket(ticketId, updateData) {
    const idx = this.tickets.findIndex(t => t.ticketId === ticketId);
    if (idx === -1) return null;

    const current = this.tickets[idx];
    const updated = {
      ...current,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    if (updateData.status) {
      updated.isActive = !updateData.status.toLowerCase().includes('resolved') && !updateData.status.toLowerCase().includes('closed');
    }

    this.tickets[idx] = updated;
    this.saveState();
    return updated;
  }

  // --- AUDIT LOGS ---
  createAuditLog({ requestId, employeeId, employeeName, intent, decision, action, sourcePolicies = [], sourceTickets = [], reason = '', decisionEvidence = [], resultingStatus = 'LOGGED', actor = 'AI_AGENT', ticketId = null }) {
    const logEntry = {
      id: `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      requestId: requestId || `REQ-RT-${Date.now()}`,
      employeeId: employeeId || 'EMP-UNKNOWN',
      employeeName: employeeName || 'Veridian Employee',
      intent: intent || 'General IT Inquiry',
      decision: decision || 'RESOLVE',
      action: action || {},
      sourcePolicies: Array.isArray(sourcePolicies) ? sourcePolicies : [],
      sourceTickets: Array.isArray(sourceTickets) ? sourceTickets : [],
      reason: reason || 'Action validated against Veridian Corp policies',
      decisionEvidence: Array.isArray(decisionEvidence) ? decisionEvidence : [],
      resultingStatus,
      ticketId,
      timestamp: new Date().toISOString(),
      actor
    };

    // Append-oriented audit logging
    this.auditLogs.unshift(logEntry);
    this.saveState();
    return logEntry;
  }

  getAuditLogs({ limit = 50, decision = 'all', search = '' } = {}) {
    let list = [...this.auditLogs];
    if (decision !== 'all') {
      list = list.filter(l => l.decision === decision);
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(l =>
        l.id.toLowerCase().includes(s) ||
        l.intent.toLowerCase().includes(s) ||
        (l.employeeName && l.employeeName.toLowerCase().includes(s)) ||
        (l.reason && l.reason.toLowerCase().includes(s)) ||
        (l.ticketId && l.ticketId.toLowerCase().includes(s))
      );
    }
    return list.slice(0, limit);
  }

  // --- CONVERSATIONS ---
  saveConversationTurn(conversationId, { role, content, decision = null, sources = [], ticketId = null, timestamp = null }) {
    if (!this.conversations[conversationId]) {
      this.conversations[conversationId] = [];
    }
    const turn = {
      role,
      content,
      decision,
      sources,
      ticketId,
      timestamp: timestamp || new Date().toISOString()
    };
    this.conversations[conversationId].push(turn);
    this.saveState();
    return turn;
  }

  getConversation(conversationId) {
    return this.conversations[conversationId] || [];
  }

  // --- EMPLOYEE REQUESTS (ASSIGNMENT SEED) ---
  getRequests() {
    return this.requests;
  }

  getEmployees() {
    return this.employees;
  }
}

export const store = new StorageManager();
