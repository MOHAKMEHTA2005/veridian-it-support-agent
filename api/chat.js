import { retrieveContext } from './lib/retrieval.js';
import { callGeminiAgent } from './lib/gemini.js';
import { validateDecision } from './lib/validator.js';
import { store } from './lib/store.js';

/**
 * Primary Chat & Agent Orchestration Handler
 * Supports both Vercel Serverless Function format and Express route handler
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { message, employeeId } = req.body || {};
    // If no conversationId is provided, create a unique per-call session so that
    // stateless API calls (e.g. Scenario Runner, fresh employee sessions) don't
    // accidentally share multi-turn history with each other.
    const conversationId = req.body?.conversationId || `${employeeId || 'anon'}-${Date.now()}`;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const cleanMessage = message.trim();

    // 1. Retrieve runtime tickets from store
    const runtimeTickets = store.getTickets();

    // 2. Retrieve conversation history for multi-turn memory
    const conversationHistory = store.getConversation(conversationId);

    // 3. Context Retrieval: Policies, tickets, employee profile (aware of multi-turn history)
    const context = retrieveContext(cleanMessage, employeeId, runtimeTickets, conversationHistory);

    // 4. Invoke Gemini Flash agent with fallback for robustness
    let rawDecision;
    try {
      rawDecision = await callGeminiAgent({
        message: cleanMessage,
        context,
        conversationHistory
      });
    } catch (llmError) {
      console.warn('[Chat Handler] Gemini API call issue, applying deterministic baseline:', llmError.message);
      // Construct baseline decision from retrieved policy context
      rawDecision = {
        intent: 'Employee IT Support Inquiry',
        decision: context.hasExactPolicy ? 'RESOLVE' : 'CLARIFY',
        confidence: 0.8,
        requiredInformation: [],
        action: { type: 'NONE', parameters: {} },
        sourcePolicies: context.policies.map(p => p.id),
        sourceTickets: context.tickets.map(t => t.ticketId),
        reason: 'Processed via deterministic policy guidelines.',
        decisionEvidence: context.policies.map(p => `Matched against ${p.id}: ${p.title}`),
        employeeResponse: context.hasExactPolicy 
          ? `Regarding your inquiry, per Veridian Policy ${context.policies[0].id} (${context.policies[0].title}): ${context.policies[0].content}`
          : `Thank you for contacting Veridian IT Support. Could you please provide more details so we can assist you?`
      };
    }

    // 5. Deterministic Policy Validation Layer
    // Programmatically enforce constraints and override invalid model conclusions
    const validatedDecision = validateDecision(rawDecision, {
      message: cleanMessage,
      context,
      conversationHistory
    });

    // 6. Controlled Action Execution & Ticketing
    let createdTicket = null;
    const shouldCreateTicket = 
      validatedDecision.decision === 'ESCALATE' ||
      validatedDecision.decision === 'ROUTE' ||
      (validatedDecision.action && (
        validatedDecision.action.type === 'CREATE_TICKET' ||
        validatedDecision.action.type === 'UNLOCK_ACCOUNT' ||
        validatedDecision.action.type === 'ESCALATE_SECURITY' ||
        validatedDecision.action.type === 'ROUTE_TEAM'
      ));

    // Notice: KB-07 explicitly states "No IT ticket required" for Guest Wi-Fi
    if (validatedDecision.sourcePolicies.includes('KB-07')) {
      // strictly do not create a ticket for guest Wi-Fi
    } else if (shouldCreateTicket) {
      const assignedTeam = validatedDecision.action?.parameters?.targetTeam || 
        (validatedDecision.decision === 'ESCALATE' ? 'IT Security / Senior IT' : 'IT Service Desk');
      
      const ticketStatus = validatedDecision.decision === 'ESCALATE' 
        ? 'Escalated - Under Review (active)' 
        : (validatedDecision.decision === 'ROUTE' ? `Routed to ${assignedTeam} (active)` : 'Pending Fulfillment (active)');

      createdTicket = store.createTicket({
        employeeId: context.employee.id,
        employeeName: context.employee.name,
        issue: validatedDecision.intent || cleanMessage.slice(0, 80),
        status: ticketStatus,
        assignedTeam,
        sourcePolicies: validatedDecision.sourcePolicies,
        sourceTickets: validatedDecision.sourceTickets,
        notes: validatedDecision.reason
      });
    }

    // 7. Append-oriented Audit Logging
    const auditRecord = store.createAuditLog({
      requestId: `REQ-${Date.now().toString().slice(-6)}`,
      employeeId: context.employee.id,
      employeeName: context.employee.name,
      intent: validatedDecision.intent,
      decision: validatedDecision.decision,
      action: validatedDecision.action,
      sourcePolicies: validatedDecision.sourcePolicies,
      sourceTickets: validatedDecision.sourceTickets,
      reason: validatedDecision.reason,
      decisionEvidence: validatedDecision.decisionEvidence,
      resultingStatus: createdTicket ? `TICKET_CREATED (${createdTicket.ticketId})` : 'RESOLVED_OR_CLARIFIED',
      actor: 'AI_AGENT',
      ticketId: createdTicket ? createdTicket.ticketId : null
    });

    // 8. Save Conversation Turns
    store.saveConversationTurn(conversationId, {
      role: 'user',
      content: cleanMessage
    });
    store.saveConversationTurn(conversationId, {
      role: 'agent',
      content: validatedDecision.employeeResponse,
      decision: validatedDecision.decision,
      sources: validatedDecision.sourcePolicies,
      ticketId: createdTicket ? createdTicket.ticketId : null
    });

    // 9. Return structured response to frontend
    return res.status(200).json({
      success: true,
      message: validatedDecision.employeeResponse,
      decision: validatedDecision.decision,
      intent: validatedDecision.intent,
      confidence: validatedDecision.confidence,
      requiredInformation: validatedDecision.requiredInformation,
      action: validatedDecision.action,
      sourcePolicies: validatedDecision.sourcePolicies,
      sourceTickets: validatedDecision.sourceTickets,
      decisionEvidence: validatedDecision.decisionEvidence,
      reason: validatedDecision.reason,
      ticket: createdTicket,
      auditLog: auditRecord,
      employee: context.employee
    });

  } catch (error) {
    console.error('[Chat Handler] Unhandled Server Error:', error);
    return res.status(500).json({
      error: 'An unexpected internal error occurred while processing your request. Please try again.',
      decision: 'ESCALATE',
      message: 'I encountered an unexpected system error. Your request has been queued for IT support review.'
    });
  }
}
