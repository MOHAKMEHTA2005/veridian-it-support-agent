import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load authoritative seed data
const policies = JSON.parse(readFileSync(join(__dirname, 'data/policies.json'), 'utf-8'));
const tickets = JSON.parse(readFileSync(join(__dirname, 'data/tickets.json'), 'utf-8'));
const requests = JSON.parse(readFileSync(join(__dirname, 'data/requests.json'), 'utf-8'));
const employees = JSON.parse(readFileSync(join(__dirname, 'data/employees.json'), 'utf-8'));

/**
 * Tokenize text into lower-case normalized words
 */
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1);
}

/**
 * Search Knowledge Base Policies using keyword, title, category, and content matching
 * @param {string} query 
 * @returns {Array} List of matched policies with score
 */
export function searchPolicies(query) {
  if (!query || typeof query !== 'string') return [];
  const queryTokens = tokenize(query);
  const qLower = query.toLowerCase();

  const scored = policies.map(policy => {
    let score = 0;

    // Direct keyword match
    for (const kw of policy.keywords) {
      if (qLower.includes(kw.toLowerCase())) {
        score += 8;
      }
    }

    // Title match
    if (qLower.includes(policy.title.toLowerCase())) {
      score += 10;
    }
    for (const token of tokenize(policy.title)) {
      if (queryTokens.includes(token)) score += 4;
    }

    // Category match
    if (qLower.includes(policy.category.toLowerCase())) {
      score += 5;
    }

    // Content match
    for (const token of queryTokens) {
      if (tokenize(policy.content).includes(token)) score += 1;
      for (const rule of policy.rules) {
        if (tokenize(rule).includes(token)) score += 2;
      }
    }

    // Special domain couplings:
    // Laptop queries should surface both KB-03 (3-year / hardware failure) and POL-ASSET-01 (4-year refresh / finance sign-off)
    if ((qLower.includes('laptop') || qLower.includes('computer')) &&
      (policy.id === 'KB-03' || policy.id === 'POL-ASSET-01')) {
      score += 6;
    }

    // Phishing / Security incident
    if ((qLower.includes('phishing') || qLower.includes('malware') || qLower.includes('forward')) && policy.id === 'KB-09') {
      score += 12;
    }

    // Expense tool
    if (qLower.includes('expense') && policy.id === 'KB-08') {
      score += 10;
    }

    // Guest Wi-Fi
    if ((qLower.includes('guest') || qLower.includes('wifi') || qLower.includes('wi-fi')) && policy.id === 'KB-07') {
      score += 10;
    }

    // Password lockout
    if ((qLower.includes('password') || qLower.includes('locked') || qLower.includes('unlock')) && policy.id === 'KB-01') {
      score += 10;
    }

    // VPN
    if ((qLower.includes('vpn') || qLower.includes('remote access')) && policy.id === 'KB-02') {
      score += 10;
    }

    return { policy, score };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.policy);
}

/**
 * Search existing tickets for precedents or active cases
 * @param {string} query 
 * @param {Array} additionalTickets Optional runtime tickets from database
 * @returns {Array} Matching tickets
 */
export function searchTickets(query, additionalTickets = []) {
  if (!query || typeof query !== 'string') return [];
  const queryTokens = tokenize(query);
  const qLower = query.toLowerCase();

  const allTickets = [...tickets, ...additionalTickets];

  const scored = allTickets.map(ticket => {
    let score = 0;
    if (qLower.includes(ticket.issue.toLowerCase())) score += 8;
    for (const token of tokenize(ticket.issue)) {
      if (queryTokens.includes(token)) score += 3;
    }
    if (ticket.notes && qLower.includes(ticket.notes.toLowerCase())) score += 2;
    return { ticket, score };
  });

  return scored
    .filter(item => item.score > 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(item => item.ticket);
}

/**
 * Retrieve employee context by ID, email, or name
 * @param {string} employeeIdOrName 
 * @returns {Object} Employee record
 */
export function getEmployeeContext(employeeIdOrName) {
  if (!employeeIdOrName) {
    return employees[0]; // Default fallback to Aditi Sharma
  }
  const needle = employeeIdOrName.toLowerCase().trim();
  const emp = employees.find(e =>
    e.id.toLowerCase() === needle ||
    e.name.toLowerCase() === needle ||
    e.email.toLowerCase() === needle ||
    needle.includes(e.name.toLowerCase())
  );
  return emp || {
    id: 'EMP-CUSTOM',
    name: employeeIdOrName,
    email: `${employeeIdOrName.toLowerCase().replace(/\s+/g, '.')}@veridiancorp.example`,
    department: 'General Staff',
    employmentType: 'full-time'
  };
}

/**
 * Assemble comprehensive context for the agent
 */
export function retrieveContext(message, employeeId, runtimeTickets = [], conversationHistory = []) {
  const employee = getEmployeeContext(employeeId);
  const employeeRequest = requests.find(
    r => r.employeeId === employee.id
  );

  // Combine recent conversation turns with current message for effective context retrieval
  const priorUserText = conversationHistory && conversationHistory.length > 0
    ? conversationHistory
      .filter(turn => turn.role === 'user')
      .slice(-3)
      .map(turn => turn.content)
      .join(' ')
    : '';

  const contextQuery = `${priorUserText} ${message}`.trim();

  const matchedPolicies = searchPolicies(contextQuery);
  const matchedTickets = searchTickets(contextQuery, runtimeTickets);

  return {
    employee,
    request: employeeRequest || null,
    policies: matchedPolicies.slice(0, 3),
    tickets: matchedTickets,
    hasExactPolicy: matchedPolicies.length > 0
  };
}

export { policies, tickets, requests, employees };
