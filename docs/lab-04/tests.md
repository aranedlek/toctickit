# Lab 04 – Test Plan (Test DD & TDD)

## 1. Overview & Test Strategy
This comprehensive test plan guides the development of Sprint 4 through Specification-Driven Development (Spec DD) and Test-Driven Development (TDD). It spans all architectural layers: backend API integration, authorization, state machine workflow, database migration, frontend UI components, responsive layout, and end-to-end (E2E) user flows.

Every test maps directly to an Acceptance Criterion (AC) or Business Rule (BR) specified in [specification.md](file:///c:/Users/lenovo/Documents/toctickit/docs/lab-04/specification.md).

---

## 2. Traceability Matrix & Test Cases

| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **API-01** | API | AC-01 | Create valid Action Taken by IT Staff | 201 Created; saved with correct ticket and auto-bound performer. | `server/tests/lab-04/actions-taken.api.test.ts` | Pass ✅ |
| **API-02** | API | BR-04 | Create Action Taken with `followUpRequired=true` but empty `followUpNote` | 400 Bad Request; descriptive validation message returned. | `server/tests/lab-04/actions-taken.api.test.ts` | Pass ✅ |
| **API-03** | API | AC-03 | Requester attempts to create Action Taken | 403 Forbidden; no record inserted. | `server/tests/lab-04/actions-taken.api.test.ts` | Pass ✅ |
| **API-04** | API | AC-04 | Requester views Actions Taken for own ticket | 200 OK; returns array of actions taken. | `server/tests/lab-04/actions-taken.api.test.ts` | Pass ✅ |
| **API-05** | API | AC-04 | Requester attempts to view Actions Taken for another user's ticket | 403 Forbidden or 404 Not Found. | `server/tests/lab-04/actions-taken.api.test.ts` | Pass ✅ |
| **API-06** | API | BR-02 | Different IT Staff member logs Action Taken on another staff's ticket | 201 Created; action performer recorded independently of ticket owner. | `server/tests/lab-04/actions-taken.api.test.ts` | Pass ✅ |
| **API-07** | API | BR-08 | Valid status transition `OPEN` -> `IN_PROGRESS` by IT Staff | 200 OK; status updated and version incremented. | `server/tests/lab-04/ticket-workflow.api.test.ts` | Pass ✅ |
| **API-08** | API | AC-07 | Illegal status jump `NEW` -> `RESOLVED` directly | 422 Unprocessable Entity; state transition rejected. | `server/tests/lab-04/ticket-workflow.api.test.ts` | Pass ✅ |
| **API-09** | API | BR-09 | Requester directly attempts to set ticket status to `RESOLVED` | 403 Forbidden; resolution gate enforced. | `server/tests/lab-04/ticket-workflow.api.test.ts` | Pass ✅ |
| **API-10** | API | BR-09 | Requester submits advisory resolution | 200 OK; advisory note recorded, formal status remains controlled. | `server/tests/lab-04/ticket-workflow.api.test.ts` | Pass ✅ |
| **API-11** | API | AC-08 | Concurrent status update with stale `version` | 409 Conflict; update aborted without altering state. | `server/tests/lab-04/ticket-workflow.api.test.ts` | Pass ✅ |
| **API-12** | API | AC-06 | Requester Dashboard metrics retrieval | 200 OK; metrics isolated strictly to authenticated requester's tickets. | `server/tests/lab-04/requester-dashboard.api.test.ts` | Planned |
| **API-13** | API | AC-05 | IT Staff Dashboard metrics retrieval | 200 OK; returns accurate counts matching database queries. | `server/tests/lab-04/staff-dashboard.api.test.ts` | Planned |
| **API-14** | API | BR-13 | Dashboard metrics when user has 0 tickets | 200 OK; returns 0 counts and empty arrays gracefully. | `server/tests/lab-04/requester-dashboard.api.test.ts` | Planned |
| **API-15** | Regression | FR-09 | Existing Lab 1–3 endpoints (Auth, Notes, Attachments, Admin Users) | All tests pass without regression. | `server/tests/lab-03/*.test.ts` | Planned |
| **UI-01** | UI | AC-01 | Actions Taken list rendering on Ticket Detail | Renders action cards/table with all required fields. | `frontend/src/tests/lab-04/ActionsTaken.test.tsx` | Pass ✅ |
| **UI-02** | UI | BR-04 | Actions Taken modal conditional follow-up validation | Toggling follow-up checkbox requires non-empty follow-up note. | `frontend/src/tests/lab-04/ActionsTaken.test.tsx` | Pass ✅ |
| **UI-03** | UI | AC-03 | Requester view of Ticket Detail hides action creation controls | "+ Record Action Taken" and edit buttons not rendered. | `frontend/src/tests/lab-04/ActionsTaken.test.tsx` | Pass ✅ |
| **UI-04** | UI | AC-05 | IT Staff Dashboard metric cards and drill-down clicks | Clicking metric card navigates to queue with corresponding filter. | `frontend/src/tests/lab-04/StaffDashboard.test.tsx` | Planned |
| **UI-05** | UI | AC-06 | Requester Dashboard rendering and quick actions | Displays my ticket metrics and recent ticket links. | `frontend/src/tests/lab-04/RequesterDashboard.test.tsx` | Planned |
| **UI-06** | UI | AC-08 | Concurrency conflict (HTTP 409) user notification | Renders warning banner prompting refresh without crashing form. | `frontend/src/tests/lab-04/TicketWorkflow.test.tsx` | Pass ✅ |
| **E2E-01** | E2E | AC-01 | Full IT Staff Action Taken flow | Log in, open ticket, record action, verify in table. | `e2e/lab-04/actions-taken-flow.spec.ts` | Planned |
| **E2E-02** | E2E | BR-09 | Requester advisory resolution and IT Staff verification flow | Requester indicates resolved, staff verifies and transitions ticket. | `e2e/lab-04/ticket-resolution.spec.ts` | Planned |
| **E2E-03** | E2E | AC-05 | IT Staff Dashboard navigation and drill-down | Log in, view metrics, click "Unassigned", view filtered queue. | `e2e/lab-04/dashboards.spec.ts` | Planned |
| **E2E-04** | E2E | AC-06 | Requester Dashboard navigation | Log in as Requester, view personalized metrics, create ticket shortcut. | `e2e/lab-04/dashboards.spec.ts` | Planned |

---

## 3. Test Execution Instructions

### 3.1 Backend Integration & Unit Tests
Run backend test suites:
```bash
cd backend
npm run test
```

### 3.2 Frontend Component Tests
Run frontend component tests:
```bash
cd frontend
npm run test
```

### 3.3 End-to-End (E2E) Playwright Tests
Execute end-to-end tests across Chromium, Firefox, and WebKit:
```bash
npx playwright test e2e/lab-04/
```
