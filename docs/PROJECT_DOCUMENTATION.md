# Veridian Corp — AI Internal IT Service Support Agent
## Comprehensive Project Documentation & Technical Architecture Report

**Version:** 1.0.0  
**Date:** September 2026  
**Assignment:** AIONOS Agentic AI Factory — Placement Assessment (Assignment 2: Internal Service Agent - IT Support)  
**Company Context:** Veridian Corp (Assessment week: Monday, 21 September 2026 – Friday, 25 September 2026)  
**Firebase Project:** `veridian-it-support-agent`

---

## 1. Project Overview
Veridian Corp requires an internal enterprise IT Support Agent capable of understanding employee IT issues in natural language, retrieving authoritative company policies, evaluating historical precedent from previous tickets, asking targeted clarifying questions, resolving simple requests directly, escalating high-risk or ambiguous requests, raising structured tickets, displaying citation sources, and recording an append-oriented audit trail.

This application is built as a production-grade full-stack solution featuring:
- A modern, dark-mode enterprise portal in React 18 + Vite
- A framework-agnostic serverless backend (`/api/*`) executing both on Vercel and via a lightweight Express runner locally
- Google Gemini Flash integration with structured JSON generation
- A deterministic policy validation layer that programmatically validates all decisions against corporate policies before execution
- Firebase Firestore and Authentication (`veridian-it-support-agent`) with zero-crash fallback persistence

---

## 2. Assignment Requirements
The assignment explicitly specifies that the agent must:
1. **Understand the employee's issue:** Extract intent, entities, and context from conversational user input.
2. **Find the relevant policy or resolution:** Match against Veridian Knowledge Base policies without hallucination.
3. **Ask sensible follow-up questions:** Issue targeted clarification questions when essential details are missing.
4. **Resolve simple requests:** Guide self-service or perform authorized actions when policy permits.
5. **Escalate risky or unclear requests:** Escalate security incidents, policy conflicts, and unauthorized requests.
6. **Create a structured ticket:** Generate distinct tickets (`AI-xxxx`) linked to source policies and employee context.
7. **Show the source used for its answer:** Prominently display policy IDs (e.g. `KB-01`) and allow inspecting the policy text.
8. **Maintain an audit trail:** Append-oriented audit logs for every interaction capturing factual decision evidence.
9. **Maintain conversation memory:** Retain turn history so follow-up interactions resolve correctly.
10. **Pre-seed historical data:** Load the 10 Knowledge Base policies + Asset extract, the 10 existing tickets (`TK-1042` to `TK-1051`), and the 15 employee requests (`REQ-01` to `REQ-15`).

---

## 3. Source Documents
The system is strictly grounded in the supplied assignment data pack:
1. `Agentic_AI_Factory_Assignment_Brief.docx`: Assignment instructions, assessment criteria, mandatory outputs, and 6-hour time limit.
2. `assignment aionos.pdf`: Veridian Corp Data Pack containing:
   - **Section 1: Knowledge Base / Policies** (`KB-01` to `KB-10` and `Asset Management Policy Extract`)
   - **Section 2: Employee Requests** (`REQ-01` to `REQ-15`)
   - **Section 3: Ticket Queue** (`TK-1042` to `TK-1051`)

---

## 4. Technology Stack
- **Frontend Framework:** React 18
- **Build Tooling:** Vite 5
- **Styling:** Vanilla CSS (Custom Design System tokens, slate/indigo dark theme)
- **Icons:** Lucide React (`lucide-react`)
- **Backend / Server:** Node.js, Express 4 (local runner), Vercel Serverless Functions (`/api/*`)
- **AI / LLM:** Google Gemini Flash (`gemini-3.6-flash`, configurable via `GEMINI_MODEL`)
- **Database:** Firebase Firestore (`veridian-it-support-agent`) with local JSON storage fallback
- **Authentication:** Firebase Auth (Google Sign-In + Email/Password + Employee Switcher)
- **Deployment Platform:** Vercel

---

## 5. Why Each Technology Was Chosen
- **React + Vite:** Instant build speeds, minimal configuration overhead, fast component reactivity for interactive chat and live dashboards.
- **Vanilla CSS:** Gives 100% fine-grained visual control without the build fragility or version incompatibilities of CSS utility frameworks.
- **Google Gemini Flash:** Low latency, high reasoning fidelity, native JSON schema support, and cost-effective operation for high-frequency IT support dialogues.
- **Framework-Agnostic Serverless API:** Creating handlers as `export default async function handler(req, res)` allows running on Vercel Serverless in production and Express in local development with zero code duplication.
- **Firebase Firestore:** Native real-time database with scalable document storage and flexible rules.
- **Local Fallback Storage Adapter:** Guarantees zero-crash resilience during offline development, automated tests, or staging environments where Firebase keys are not yet configured.

---

## 6. Architecture

```
[ Employee User (Browser) ]
            │
            ▼
   [ React 18 + Vite UI ]
   ├── AI Support (Conversational Chat + Quick Scenarios)
   ├── Verified Decision Evidence Card
   ├── Tickets Dashboard (Active vs Closed Filter)
   ├── Audit Trail Dashboard (Append-Oriented Log Explorer)
   ├── Knowledge Base Explorer (KB-01 to KB-10 + Asset Extract)
   └── Employee Requests Catalog (REQ-01 to REQ-15 1-Click Tester)
            │
            │ HTTP POST /api/chat
            ▼
[ API / Agent Orchestrator (/api/chat.js) ]
            │
    ┌───────┴───────┐
    ▼               ▼
[ Context Retrieval ] [ Conversation History Store ]
├── searchPolicies()  (Prior turns for multi-turn context)
├── searchTickets()
└── getEmployeeContext()
            │
            ▼
[ Gemini Flash Engine (api/lib/gemini.js) ]
 (Structured JSON Output Mode)
            │
            ▼
[ Deterministic Validation Layer (api/lib/validator.js) ]
├── Lockout threshold verification (>5 attempts per KB-01)
├── Security incident warnings (KB-09 forwarding prohibited)
├── Hardware policy conflict resolution (KB-03 vs Asset Policy)
├── Department routing rules (KB-08 Finance, KB-04 Security)
└── Vague input detection & targeted clarification (REQ-15)
            │
            ▼
[ Controlled Action Handler & Storage (api/lib/store.js) ]
├── Ticket Manager (Generates AI-xxxx or updates existing)
├── Append-Oriented Audit Logger (Factual evidence, actor, timestamp)
└── Memory Store (Saves user & agent turns)
            │
            ▼
[ Structured JSON Response to Client ]
```

---

## 7. Data Flow
1. **User Input:** Employee sends a message (or clicks a sample scenario).
2. **Context Retrieval:** `retrieveContext()` queries `policies.json`, `tickets.json`, and `employees.json` using the current message plus prior turns.
3. **Model Generation:** `callGeminiAgent()` sends the prompt context and structured JSON schema instructions to Gemini Flash.
4. **Deterministic Validation:** `validateDecision()` scrutinizes the model's proposed decision against authoritative policies, correcting any model drift, enforcing security warnings, and overriding invalid actions.
5. **Ticketing Action:** If `ESCALATE` or `ROUTE` is validated (or if action requires a ticket), `store.createTicket()` issues an `AI-xxxx` ticket.
6. **Audit Trail:** `store.createAuditLog()` appends an immutable audit event with factual evidence.
7. **Client Rendering:** Frontend updates the chat transcript, displays the decision badge, links the new ticket, renders source policy chips, and lists evidence bullets.

---

## 8. Folder Structure
```
veridian-it-support-agent/
├── .env.example
├── .gitignore
├── README.md
├── package.json
├── vite.config.js
├── vercel.json
├── index.html
├── server.js
├── api/
│   ├── chat.js
│   ├── tickets.js
│   ├── audit.js
│   ├── kb.js
│   ├── requests.js
│   └── lib/
│       ├── gemini.js
│       ├── validator.js
│       ├── retrieval.js
│       ├── store.js
│       └── data/
│           ├── policies.json
│           ├── tickets.json
│           ├── requests.json
│           └── employees.json
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── ChatInterface.jsx
│   │   ├── DecisionCard.jsx
│   │   ├── TicketDashboard.jsx
│   │   ├── AuditDashboard.jsx
│   │   ├── KnowledgeBaseView.jsx
│   │   ├── EmployeeRequestsView.jsx
│   │   ├── SourceModal.jsx
│   │   ├── TicketModal.jsx
│   │   └── AuthModal.jsx
│   └── services/
│       ├── api.js
│       └── firebase.js
├── docs/
│   └── PROJECT_DOCUMENTATION.md
└── tests/
    └── agent.test.js
```

---

## 9. File-by-File Purpose

| File Path | Role | Key Interactions |
| :--- | :--- | :--- |
| `api/lib/data/policies.json` | Authoritative Knowledge Base policies | Seed data for `retrieval.js` and `KnowledgeBaseView.jsx` |
| `api/lib/data/tickets.json` | Historical ticket queue (`TK-1042` to `TK-1051`) | Precedents for `retrieval.js` and `TicketDashboard.jsx` |
| `api/lib/data/requests.json` | 15 Employee Requests (`REQ-01` to `REQ-15`) | Tested in `agent.test.js` and `EmployeeRequestsView.jsx` |
| `api/lib/data/employees.json` | Employee directory | User profile mapping in `retrieval.js` and `Navbar.jsx` |
| `api/lib/gemini.js` | Gemini API client | Calls Gemini Flash, enforces JSON schema |
| `api/lib/retrieval.js` | Search & Context engine | Scans policies, tickets, and employee profiles |
| `api/lib/validator.js` | Deterministic policy validator | Programmatically enforces corporate rules |
| `api/lib/store.js` | Persistent storage adapter | Manages tickets, audit trail, and conversations |
| `api/chat.js` | Chat orchestrator endpoint | Integrates retrieval, LLM, validation, and storage |
| `api/tickets.js` | Ticket REST endpoint | Filters and updates tickets |
| `api/audit.js` | Audit REST endpoint | Queries append-oriented audit logs |
| `api/kb.js` | Knowledge Base REST endpoint | Serves policies for UI inspection |
| `api/requests.js` | Requests REST endpoint | Serves seed requests and employee directory |
| `server.js` | Local Express runner | Mounts `api/*` handlers and serves Vite dist |
| `src/App.jsx` | React root container | Manages active tab, employee, and modals |
| `src/components/ChatInterface.jsx` | Support chat view | Renders chat messages, scenarios, and sends queries |
| `src/components/DecisionCard.jsx` | Decision evidence panel | Shows status badge, action, ticket ID, and evidence |
| `src/components/TicketDashboard.jsx` | Ticket management UI | Filters tickets by status and displays detail modal |
| `src/components/AuditDashboard.jsx` | Audit trail viewer | Displays event table and factual decision evidence |
| `src/components/KnowledgeBaseView.jsx` | Policy documentation UI | Allows searching and inspecting KB policies |
| `src/components/EmployeeRequestsView.jsx` | Scenario test runner | 1-click execution of REQ-01 through REQ-15 |
| `src/components/SourceModal.jsx` | Policy inspector modal | Displays full policy text and governing rules |
| `src/components/TicketModal.jsx` | Ticket inspector modal | Displays ticket metadata and linked policies |
| `src/components/AuthModal.jsx` | Identity & Auth modal | Google Sign-In & Email/Password configuration |
| `tests/agent.test.js` | Automated test suite | 52 assertions verifying all 15 requests and edge cases |

---

## 10. Firebase Architecture
The application integrates with Firebase project: `veridian-it-support-agent`.
- **Collections:**
  - `policies/`: Authoritative corporate policies (`KB-01` to `KB-10`, `POL-ASSET-01`).
  - `tickets/`: Mixed historical (`TK-xxxx`) and runtime (`AI-xxxx`) tickets.
  - `auditLogs/`: Append-oriented audit records.
  - `conversations/`: Multi-turn dialogue transcripts.
  - `employees/`: Corporate employee directory.
- **Client Configuration:** Managed via `src/services/firebase.js` using `VITE_FIREBASE_*` environment variables.

---

## 11. Firestore Schema

### Tickets Collection (`tickets/`):
```json
{
  "ticketId": "AI-0001",
  "employeeId": "EMP-08",
  "employeeName": "Ananya Reddy",
  "issue": "Suspected Security Incident / Phishing Report",
  "status": "Escalated - Under Review (active)",
  "isActive": true,
  "assignedTeam": "IT Security",
  "sourcePolicies": ["KB-09"],
  "sourceTickets": ["TK-1048"],
  "createdBy": "AI_AGENT",
  "createdAt": "2026-09-18T06:03:51.603Z",
  "updatedAt": "2026-09-18T06:03:51.603Z",
  "notes": "The employee received a suspected phishing email and intends to forward it to teammates."
}
```

### Audit Logs Collection (`auditLogs/`):
```json
{
  "id": "AUD-1789711431604-l2un",
  "requestId": "REQ-431603",
  "employeeId": "EMP-08",
  "employeeName": "Ananya Reddy",
  "intent": "Suspected Security Incident / Phishing Report",
  "decision": "ESCALATE",
  "action": {
    "type": "ESCALATE_SECURITY",
    "parameters": { "targetTeam": "IT Security", "isSimulated": true }
  },
  "sourcePolicies": ["KB-09"],
  "sourceTickets": ["TK-1048"],
  "reason": "Policy KB-09 strictly forbids forwarding phishing emails to other employees.",
  "decisionEvidence": [
    "KB-09 mandates that all suspected phishing, malware, or unauthorized access attempts must be reported to security@veridian-corp.example immediately.",
    "CRITICAL SAFETY ALERT: KB-09 strictly prohibits forwarding suspected phishing emails to other employees under any circumstances."
  ],
  "resultingStatus": "TICKET_CREATED (AI-0003)",
  "ticketId": "AI-0003",
  "timestamp": "2026-09-18T06:03:51.604Z",
  "actor": "AI_AGENT"
}
```

---

## 12. Authentication
- **Firebase Authentication:** Supports Google Sign-In (`signInWithPopup`) and Email/Password fallback (`signInWithEmailAndPassword`).
- **Non-Blocking Architecture:** To ensure authentication never blocks core agent operation or reviewer testing, the navbar features an **Active Employee Switcher** that allows switching between any of the 15 Veridian Corp employees instantly.
- **Identity Mapping:** Authenticated users map to their corresponding employee profile where applicable.

---

## 13. Gemini Integration
- **Model:** Configurable via `process.env.GEMINI_MODEL`, defaulting to `gemini-3.6-flash`.
- **Security:** `GEMINI_API_KEY` is maintained strictly on the server side and never sent to client browsers.
- **Output:** Structured JSON schema mode via `generationConfig: { responseMimeType: "application/json" }`.
- **Error Recovery:** If Gemini experiences a 503 or transient spike, the orchestrator automatically applies a deterministic baseline resolution grounded in retrieved policy context, ensuring zero-crash availability.

---

## 14. Agent Architecture
The agent is designed as a hybrid system:
- **LLM Layer:** Performs semantic parsing, entity extraction, policy relevance scoring, and employee-friendly dialogue generation.
- **Deterministic Validation Layer:** Validates policy constraints, enforces security rules, caps quotas, overrides hallucinations, creates tickets, and writes append-oriented audit logs.

---

## 15. Agent Instructions / System Prompt
The system instructions strictly encode the ground truth hierarchy:
1. Supplied Veridian Corp Knowledge Base Policies (`KB-01` to `KB-10`, `Asset Management Policy Extract`).
2. Supplied Employee Requests (`REQ-01` to `REQ-15`) and Existing Ticket Queue (`TK-1042` to `TK-1051`).
3. Conversation context.
4. LLM reasoning.
System prompt mandates zero hallucination of policies, strict output in JSON schema, and factual evidence generation.

---

## 16. Retrieval Strategy
- **Lightweight & Fast:** Scans policy keywords, titles, categories, and rules without heavy vector database dependencies.
- **Precedent Matching:** Searches historical tickets (`TK-1042` to `TK-1051`) to identify past resolutions and active cases.
- **Multi-Turn Context Awareness:** Concatenates recent conversation turns with the current message so pronouns and follow-up statements retrieve the correct policies.

---

## 17. Agent Tools
The agent orchestrator operates through controlled functional primitives:
- `searchPolicies(query)`: Finds relevant Knowledge Base articles.
- `searchTickets(query, additionalTickets)`: Retrieves historical precedents and active cases.
- `getEmployeeContext(employeeId)`: Retrieves employee metadata.
- `createTicket(ticketData)`: Generates sequential `AI-xxxx` tickets.
- `updateTicket(ticketId, update)`: Updates ticket statuses.
- `createAuditLog(auditData)`: Appends verifiable audit records.

---

## 18. Decision Types
- **`RESOLVE`**: Clear policy support for self-service or authorized immediate resolution.
- **`CLARIFY`**: Incomplete information; targeted follow-up question required.
- **`ESCALATE`**: High-risk, security hazard, policy conflict, or unauthorized access request.
- **`ROUTE`**: Ownership explicitly belongs to another corporate department.

---

## 19. Deterministic Validation
The validation layer (`api/lib/validator.js`) enforces explicit corporate rules:
- **Password Reset (KB-01):** Manual IT unlock only if failed attempts >= 5; no approval needed.
- **Phishing Reporting (KB-09):** Injects urgent warning prohibiting forwarding to teammates; escalates to `security@veridian-corp.example`.
- **Guest Wi-Fi (KB-07):** Directs to front-desk kiosk (valid 24h); suppresses ticket creation (*No IT ticket required*).
- **Laptop Replacement (KB-03 vs Asset Policy):** Surfaces both policies (3-year eligibility vs 4-year cycle requiring Finance sign-off).
- **Mailbox Quota (KB-06):** Recommends archiving first; strictly caps increases at 50GB.
- **Contractor VPN (KB-02):** Rejects automatic access; requires manager approval via access form.
- **Expense Tool (KB-08):** Routes to Finance for account creation; IT only assists with existing logins.
- **Non-Catalog Software (KB-04):** Routes to IT Security for 3-5 business day review.
- **Adversarial / Admin Requests:** Blocks prompt injections attempting to bypass policy; cites precedent `TK-1050`.

---

## 20. Ticket Workflow
1. **Historical Records:** Loaded from assignment data (`TK-1042` to `TK-1051`). Closed tickets serve as precedents; active tickets remain actionable.
2. **Agent Tickets:** Generated with sequential `AI-xxxx` IDs (e.g. `AI-0001`).
3. **Queue Views:** Filterable by `All`, `Active`, `Resolved`, and `Escalated`.

---

## 21. Audit Trail
- **Append-Oriented:** Every agent decision creates an audit log entry.
- **Tamper Prevention:** Read-only for standard users; created exclusively by server-side logic.
- **Factual Evidence:** Contains factual facts and policy rules without revealing internal chain-of-thought.

---

## 22. Source Grounding
- **UI Source Chips:** Every substantive response displays clickable chips (e.g. `KB-01`, `KB-09`, `POL-ASSET-01`).
- **Source Modal:** Reviewers can click any chip to inspect the exact policy text and governing rules.

---

## 23. UI Architecture
- **Tabbed Layout:** AI Support, Tickets Queue, Audit Trail, Knowledge Base, and Employee Scenarios.
- **Split-Screen Support Area:** Left panel hosts the interactive chat and quick scenario buttons; right panel hosts the live Decision Evidence Card.
- **Theme:** Curated dark theme using CSS variables (`--bg-primary: #0b0f19`, `--bg-secondary: #111827`, `--accent-primary: #6366f1`).

---

## 24. API Endpoints
- `POST /api/chat`: Primary conversational IT agent endpoint.
- `GET /api/tickets`: Returns tickets filtered by status and search query.
- `POST /api/tickets`: Manual ticket creation endpoint.
- `PATCH /api/tickets`: Ticket status and note update endpoint.
- `GET /api/audit`: Returns append-oriented audit logs.
- `GET /api/kb`: Returns all Knowledge Base policies.
- `GET /api/requests`: Returns seed employee requests and employee directory.
- `GET /api/health`: Health check returning service status and active model.

---

## 25. Environment Variables
- `GEMINI_API_KEY`: Server-side API key for Google Gemini.
- `GEMINI_MODEL`: Configurable Gemini model (default `gemini-3.6-flash`).
- `PORT`: Local server port (default `3001`).
- `VITE_FIREBASE_*`: Client-side Firebase configuration variables.

---

## 26. Security Decisions
- Server-side only handling of `GEMINI_API_KEY`.
- No sensitive keys in Git repositories or browser bundles.
- Programmatic injection blocking in `validator.js` prevents prompt injections from granting administrator access.

---

## 27. Design Decisions
- Enterprise corporate portal styling rather than generic consumer chatbot.
- Distinct color-coded decision badges (`RESOLVED` green, `CLARIFY` amber, `ESCALATED` red, `ROUTED` purple).
- 1-Click Employee Request test runner for rapid assessment grading.

---

## 28. Alternatives Considered
- Vector database / embedding search: Considered Pinecone / Chroma.
- Multi-agent framework: Considered LangChain / CrewAI.
- Separate microservices: Considered separate auth, chat, and ticket microservices.

---

## 29. Why Alternatives Were Rejected
- Vector databases introduce unnecessary external dependencies, network latency, and deployment failure points for an 11-policy dataset.
- Multi-agent frameworks introduce opaque abstraction layers and non-deterministic behavior that conflicts with strict policy enforcement.
- Separate microservices violate the 6-hour assessment scope and create unnecessary operational complexity.

---

## 30. Assumptions
- Veridian Corp operating date is set in the week of 21–25 September 2026.
- External actions (e.g. physical shipping, email alerts) are prototype simulations.
- Closed historical tickets remain visible as precedent context.

---

## 31. Known Limitations
- Real-time hardware spooler queries and live Microsoft 365 Exchange quotas are simulated based on policy rules.
- Local dev runs use the fallback file persistence store unless full Firebase credentials are supplied.

---

## 32. Error Handling
- Gemini API errors (e.g. HTTP 503 high demand) fall back to deterministic policy baseline without crashing.
- Invalid or truncated JSON from the model is cleaned and parsed with fallback recovery.
- Network timeouts return polite, human-readable guidance.

---

## 33. Testing
Automated test suite (`tests/agent.test.js`) runs 52 individual assertions covering:
- Retrieval matching across policies, tickets, and employees.
- Complete execution of all 15 assignment requests (`REQ-01` to `REQ-15`).
- Adversarial tests: prompt injection, ungrounded policies, and quota limits.
- Multi-turn conversation follow-ups and audit log creation.

---

## 34. Test Results
- **Test Command:** `npm test`
- **Total Tests:** 52
- **Passed:** 52
- **Failed:** 0
- **Execution Time:** ~4.8 seconds

---

## 35. Deployment
Prepared for 1-click deployment to Vercel:
- `vercel.json` rewrite configuration mounts `/api/(.*)` to serverless handlers.
- Static assets built by Vite into `dist/`.

---

## 36. Deployment Configuration
- Build Command: `npm run build`
- Output Directory: `dist`
- Serverless Functions: `api/*.js`
- Required Vercel Variables: `GEMINI_API_KEY`, `GEMINI_MODEL`.

---

## 37. AI Tools Used
- Google Gemini Flash (`gemini-3.6-flash`) via Google AI Studio API.

---

## 38. How Each AI Tool Was Used
- Natural language intent extraction.
- Entity extraction (attempt counts, device ages, application names).
- Synthesizing polite, employee-friendly dialogue citing governing policy titles.

---

## 39. Important Prompts
The core system prompt instructs the model to act as Veridian Corp's internal IT agent, adhere to the 4-tier truth hierarchy, output structured JSON matching the defined schema, and cite specific policy IDs.

---

## 40. Changes Made During Development
- Configured `GEMINI_MODEL` via environment variables with support for `gemini-3.6-flash`.
- Expanded vague query detection to handle sentences up to 60 characters (fixing REQ-15).
- Integrated prior conversation turns into retrieval queries for multi-turn pronoun resolution.

---

## 41. Bugs Encountered
1. `npm install` lifecycle failure on Windows due to `node` path not being recognized in child `cmd.exe` shells.
2. REQ-15 initial length check (`< 25`) failed for 33-character input `"hey can you help, its not working"`.
3. Gemini API 503 transient spike during rapid live API calls.
4. Multi-turn follow-up `"No, completely dead. Had it about 3.5 years now."` initially missed the `"laptop"` context from turn 1.

---

## 42. Bug Fixes
1. Added portable Node.js to machine PATH so `cmd.exe` and child processes inherit it.
2. Adjusted vague filter to length `<= 60` and keyword exclusion.
3. Implemented deterministic baseline fallback in `api/chat.js` during Gemini API 503 errors.
4. Updated `retrieveContext` and `validateDecision` to concatenate recent dialogue turns.

---

## 43. Final Feature List
- Conversational IT Support Chat with multi-turn memory
- Real-time Verified Decision State Card with color-coded badges
- Source Policy Chips and full policy modal inspector
- Factual Decision Evidence generation without raw CoT
- Tickets Queue dashboard with `All`, `Active`, `Resolved`, and `Escalated` filters
- Append-oriented Audit Trail table with event inspection modal
- Knowledge Base Explorer for `KB-01` to `KB-10` and Asset Management Policy
- Employee Requests Scenario Runner (1-click testing for `REQ-01` to `REQ-15`)
- Active Employee Switcher for 15 Veridian Corp staff members
- Firebase Auth integration with Google and Email/Password support

---

## 44. Demo Scenarios
1. **Password Reset (REQ-03):** 6 failed attempts triggers manual IT unlock per `KB-01` with no approval required.
2. **Guest Wi-Fi (REQ-02):** Resolves at front-desk kiosk per `KB-07`; suppresses ticket creation.
3. **Phishing Alert (REQ-08):** Injects urgent warning not to forward; escalates to `security@veridian-corp.example` under `KB-09`.
4. **Policy Conflict (REQ-01):** Surfaces both `KB-03` (3-year eligibility) and `Asset Policy` (4-year refresh requiring Finance sign-off).
5. **Vague Query & Follow-Up (REQ-15):** Prompts for clarification; user response seamlessly triggers appropriate action.
6. **Adversarial Privilege Request (ADV-01):** Blocks prompt injection attempting to grant admin access.

---

## 45. Future Improvements
- Vector embeddings hybrid search when the Knowledge Base expands beyond 100+ documents.
- Direct Slack / Microsoft Teams bot integration.
- Webhook notifications for IT technician dispatches.
