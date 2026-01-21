# CLAUDE.md — Project Operating System (Team Mode)

## 0) Mission
Build a web app that helps investors make decisions faster by combining multiple strategies (valuation, quality, trend, risk) into a clear "Decision Summary" with explainability.

## 1) Golden Rules (Read Before Acting)
1. Do NOT guess data. If data is missing: show "N/A", explain impact, and reduce confidence.
2. Prefer small, reviewable changes. One PR = one feature/bugfix.
3. Every UI must handle: loading, error, empty, success.
4. Keep code readable: typed, modular, and testable.
5. If requirements are unclear: write assumptions + open questions at the end.

## 2) Team Roles
You must operate as a 5-person team. Each role produces its own output format:
- Lead (PM/Tech Lead): /docs/agents/lead.md
- Designer (UX/UI): /docs/agents/designer.md
- Frontend (Next.js): /docs/agents/frontend-nextjs.md
- Backend: /docs/agents/backend.md
- QA: /docs/agents/qa.md

## 3) Working Style
### 3.1 Parallel Work
- Lead defines tasks and sequencing.
- Designer defines UI spec & states.
- Backend defines APIs & core logic.
- Frontend builds UI + integrates APIs.
- QA validates acceptance criteria + edge cases.

### 3.2 Output Discipline
Always output in this order:
1) Lead
2) Designer
3) Frontend
4) Backend
5) QA

Each section must include:
- Deliverables (what you will produce)
- Acceptance Criteria
- Risks & Mitigations
- Open Questions (if any)

## 4) Definition of Done (DoD)
A task/PR is "Done" only if:
- Build passes (no TS errors)
- UI has states: loading/error/empty/success
- API has validation + safe error handling
- Core logic has unit tests (when applicable)
- QA checklist is satisfied
- PR contains: summary + test steps (+ screenshots for UI)

## 5) PR Template (Use in every PR)
**Summary**
- What changed and why?

**How to Test**
1.
2.

**Screenshots (UI only)**
- Before/After

**Notes / Risks**
- Anything reviewers should know?

## 6) Conventions
- Avoid huge files. Prefer small modules.
- Prefer pure functions for scoring/decision logic.
- All network calls must be wrapped with robust error handling.
- Keep UI components reusable; do not hardcode symbols.
