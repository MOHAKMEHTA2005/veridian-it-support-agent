import dotenv from 'dotenv';
dotenv.config();

/**
 * Server-side Gemini API client for structured IT support decision-making.
 * GEMINI_API_KEY is kept strictly on the server side.
 * The model name is configurable via process.env.GEMINI_MODEL.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

if (!GEMINI_API_KEY) {
  console.warn('[Gemini Client] WARNING: GEMINI_API_KEY is not set in environment variables.');
}

const SYSTEM_INSTRUCTION = `You are the Veridian Corp AI Internal IT Service Support Agent.
Company context: Week of Monday, 21 September 2026 - Friday, 25 September 2026.

CRITICAL POLICY GROUNDING RULES:
1. Ground truth hierarchy:
   (a) Supplied Veridian Corp Knowledge Base Policies (KB-01 through KB-10 and Asset Management Policy Extract).
   (b) Supplied Employee Requests and Existing Ticket Queue (TK-1042 through TK-1051).
   (c) Conversation context.
   (d) Your reasoning.
2. NEVER hallucinate or invent policies, permissions, approval authorities, SLAs, deadlines, or access rights not grounded in the provided sources.
3. If no policy supports an action, or if an action is unsupported/risky/privilege-escalating, ESCALATE or ROUTE to human review or CLARIFY.
4. Decision Types (MUST be one of these 4):
   - RESOLVE: The supplied policy clearly supports self-service or direct resolution (e.g. self-service password portal, front-desk guest Wi-Fi kiosk, full-time VPN renewal).
   - CLARIFY: The employee's request lacks necessary details to determine the issue or safe action (e.g. vague description like "it's not working", missing screenshot, missing printer asset tag when queue was already checked).
   - ESCALATE: The issue is risky, security-sensitive (suspected phishing/malware), requires manual IT unlock after 5+ failed attempts, requests unauthorized admin access, or involves policy conflicts/exceptions.
   - ROUTE: The policy explicitly states another department or specialized team owns the request (e.g. expense tool creation owned by Finance, non-catalog software owned by IT Security review, remote equipment sign-off owned by Manager/Finance).
5. Phishing / Security (KB-09): If an employee reports suspected phishing, IMMEDIATELY instruct them NOT to forward the email to teammates, notify security@veridian-corp.example, and set decision to ESCALATE.
6. Laptop Replacement (KB-03 & Asset Policy): Note that KB-03 permits replacement after 3 years or hardware failure, while Asset Management Policy specifies a standard 4-year cycle requiring Finance sign-off. Surface both policies and route/escalate for necessary approvals.
7. Decision Evidence: Provide 2 to 3 concise, factual bullet points summarizing the exact employee facts and policy clauses applied. DO NOT output private chain-of-thought.
8. Output Format: You MUST return a single valid JSON object strictly matching this schema:
{
  "intent": "string (concise summary of employee intent)",
  "decision": "RESOLVE | CLARIFY | ESCALATE | ROUTE",
  "confidence": number (between 0.0 and 1.0),
  "requiredInformation": ["string (any missing information required)"],
  "action": {
    "type": "string (e.g., GUIDE_SELF_SERVICE, UNLOCK_ACCOUNT, ESCALATE_SECURITY, ROUTE_TEAM, CREATE_TICKET, REQUEST_CLARIFICATION)",
    "parameters": {
      "targetTeam": "string (e.g., IT Service Desk, IT Security, Finance, IT Hardware, etc.)",
      "actionDetails": "string",
      "isSimulated": true
    }
  },
  "sourcePolicies": ["string (e.g. KB-01, KB-09, POL-ASSET-01)"],
  "sourceTickets": ["string (e.g. TK-1048 if precedent or relevant context was used)"],
  "reason": "string (factual summary of why this decision was made)",
  "decisionEvidence": [
    "string (bullet point 1 grounded in employee facts)",
    "string (bullet point 2 grounded in policy clauses)"
  ],
  "employeeResponse": "string (professional, empathetic, clear response to the employee citing the policy name and ID)"
}`;

/**
 * Clean and parse JSON response from Gemini
 */
function parseGeminiJson(rawText) {
  let cleaned = rawText.trim();
  // Remove markdown code fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  }
  return JSON.parse(cleaned);
}

/**
 * Generate structured IT support decision from Gemini Flash
 */
export async function callGeminiAgent({ message, context, conversationHistory = [] }) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  // Construct prompt context with retrieved policies, tickets, employee details, and chat history
  let promptText = `Current Date: Wednesday, 23 September 2026\n\n`;
  promptText += `=== EMPLOYEE CONTEXT ===\n`;
  promptText += `Name: ${context.employee.name}\n`;
  promptText += `Email: ${context.employee.email}\n`;
  promptText += `Department: ${context.employee.department}\n`;
  promptText += `Employment Type: ${context.employee.employmentType}\n\n`;

  promptText += `=== RETRIEVED KNOWLEDGE BASE POLICIES ===\n`;
  if (context.policies && context.policies.length > 0) {
    context.policies.forEach(p => {
      promptText += `[${p.id}] ${p.title} (${p.category})\nContent: ${p.content}\nRules: ${p.rules.join('; ')}\n\n`;
    });
  } else {
    promptText += `No matching knowledge base policy found.\n\n`;
  }

  promptText += `=== RETRIEVED HISTORICAL TICKETS / PRECEDENTS ===\n`;
  if (context.tickets && context.tickets.length > 0) {
    context.tickets.forEach(t => {
      promptText += `[${t.ticketId}] Issue: "${t.issue}" | Status: ${t.status} | Assigned: ${t.assignedTeam} | Notes: ${t.notes || 'None'}\n`;
    });
    promptText += `\n`;
  } else {
    promptText += `No relevant ticket precedents found.\n\n`;
  }

  if (conversationHistory.length > 0) {
    promptText += `=== PRIOR CONVERSATION HISTORY ===\n`;
    conversationHistory.forEach(turn => {
      promptText += `${turn.role === 'user' ? 'Employee' : 'Agent'}: ${turn.content}\n`;
    });
    promptText += `\n`;
  }

  promptText += `=== CURRENT EMPLOYEE MESSAGE ===\n"${message}"\n\n`;
  promptText += `Analyze the request strictly according to Veridian Corp policies, determine the valid decision (RESOLVE, CLARIFY, ESCALATE, or ROUTE), and generate the structured JSON output.`;

  const requestBody = {
    systemInstruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }]
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: promptText }]
      }
    ],
    generationConfig: {
      temperature: 0.1, // Low temperature for high deterministic fidelity
      responseMimeType: 'application/json'
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawContent) {
    throw new Error('Empty response received from Gemini API.');
  }

  try {
    const parsed = parseGeminiJson(rawContent);
    return parsed;
  } catch (parseError) {
    console.error('Failed to parse Gemini output as JSON:', rawContent);
    throw new Error(`Malformed JSON from Gemini model: ${parseError.message}`);
  }
}
