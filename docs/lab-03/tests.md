# Lab 03 – Test Plan (Test DD & TDD)

## 1. Overview
This test plan covers unit, API (integration), UI component, authorization, regression, and E2E testing for the Lab 3 increment. Tests must trace back to the Acceptance Criteria (AC) defined in the Specification.

## 2. Test Cases

| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final |
|---------|------|------------------|---------------|-----------------|---------------------|-------|
| **API-01** | API | AC-01 | Valid login | Authenticated response; safe user data; token set. | `server/tests/lab-03/auth.api.test.ts` | Pass |
| **API-02** | API | BR-01 | Invalid login | 401 Unauthorized; safe error message. | `server/tests/lab-03/auth.api.test.ts` | Pass |
| **API-03** | API | BR-01 | Inactive account login | 401 Unauthorized; no specific account info exposed. | `server/tests/lab-03/auth.api.test.ts` | Pass |
| **API-04** | API | AC-02 | Access protected endpoint with `requiresPasswordChange=true` | 403 Forbidden until password is changed. | `server/tests/lab-03/auth.api.test.ts` | Pass |
| **API-05** | API | AC-03 | Requester requests tickets with fake `requesterId` | Backend ignores ID and returns tickets owned by auth user. | `server/tests/lab-03/tickets.api.test.ts` | Pass |
| **API-06** | API | FR-02 | Requester requests IT Staff Ticket Queue | 403 Forbidden. | `server/tests/lab-03/authorization.api.test.ts` | Pass |
| **API-07** | API | BR-06 | Admin creates user with duplicate email | 400 Bad Request; validation error. | `server/tests/lab-03/users-admin.api.test.ts` | Pass |
| **API-08** | API | AC-04 | Requester requests Internal Notes | 403 Forbidden; no note data returned. | `server/tests/lab-03/notes.api.test.ts` | Pass |
| **API-09** | API | BR-07 | Admin deactivates own account | 400 Bad Request; conflict error. | `server/tests/lab-03/users-admin.api.test.ts` | Pass |
| **API-10** | API | BR-08 | Admin removes last active Administrator | 400 Bad Request; safety constraint enforced. | `server/tests/lab-03/users-admin.api.test.ts` | Pass |
| **API-11** | API | FR-04 | Requester marks ticket as problem appears resolved | 200 OK; Status updated. | `server/tests/lab-03/tickets.api.test.ts` | Pass |
| **API-12** | API | FR-04 | Requester attempts to officially close ticket | 403 Forbidden. | `server/tests/lab-03/authorization.api.test.ts` | Pass |
| **UI-01** | UI | FR-01 | Change Password Form validation | Shows errors for short or mismatched passwords. | `client/tests/lab-03/ChangePassword.test.tsx` | Pass |
| **UI-02** | UI | FR-05 | Admin User Management Search | Filters user list correctly without network call if local. | `client/tests/lab-03/UserManagement.test.tsx` | Pass |
| **UI-03** | UI | FR-03 | IT Staff Queue sorting/pagination | Emits correct API params on table interaction. | `client/tests/lab-03/StaffTicketQueue.test.tsx` | Pass |
| **E2E-01** | E2E | FR-01 | Full login and logout flow | Successful login, sees navbar, successful logout. | `e2e/lab-03/authentication.spec.ts` | Pass |
| **E2E-02** | E2E | AC-02 | Initial password login and change | Normal app opens only after valid change. | `e2e/lab-03/first-login.spec.ts` | Pass |
| **E2E-03** | E2E | FR-03 | IT Staff ticket workflow | Can claim ticket, add internal note, change status. | `e2e/lab-03/staff-ticket-flow.spec.ts` | Pass |
| **E2E-04** | E2E | FR-05 | Admin user management flow | Create user, login as new user. | `e2e/lab-03/user-administration.spec.ts` | Pass |

## 3. Test Execution
- **Unit and Integration (Backend):** `npm run test` via Vitest/Supertest.
- **Component Tests (Frontend):** `npm run test` via Vitest/Testing Library.
- **End-to-End (E2E):** `npx playwright test`.
