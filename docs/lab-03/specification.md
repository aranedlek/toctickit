# Lab 03 – Sprint Specification

## 1. Sprint Goal
Replace the temporary Development Requester selector with real authentication and role-based authorization. Introduce the first operational IT Staff workflow and Administrator user management to support three roles: Requester, IT Staff, and Administrator.

## 2. Stakeholder Request
The temporary Requester selector is being replaced with secure login. Administrators need a minimalist User Management screen to view users, create accounts, assign roles, edit info, toggle activation, and set initial passwords (which must be changed at first login). Requesters continue to use their previous ticket functions but under an authenticated identity. IT Staff need a professional Ticket Queue to manage tickets (claim, set priority, update status, add Public Comments and Internal Notes). All APIs and screens must be protected by role and ownership. The Zen Green design language will be continued.

## 3. Scope
### Included
- Authentication (login, logout, current user retrieval, mandatory first-login password change)
- Role-based navigation and server-side authorization (Requester, IT Staff, Admin)
- Migration from Development Requester identity to authenticated User model
- Continued Requester ownership protection for all Lab 2 Ticket/Attachment functions
- IT Staff Ticket Queue, Ticket Detail, ownership, IT Priority, Public Comments, Internal Notes, and status workflow
- Minimalist Administrator user management (list, create, edit, one-role assignment, activate/deactivate, set new initial password)
- Data model and REST API changes
- Zen Green UI extensions and reusable components

### Explicitly Excluded
- Email invitations, password-reset email, multi-factor authentication, social login, SSO
- Self-registration and Requester-created accounts
- Actions Taken by IT Staff
- Formal SLA calculation, escalation rules, notification services
- Dashboards and KPI analytics beyond simple queue counts
- Multi-tenant organizations, departments, customer administration
- Production-grade deployment or cloud infrastructure changes
- Multiple roles assigned to one user
- User deletion, bulk user operations, user import/export, account-history screens
- Profile-photo, extended user-profile management
- Advanced account unlocking, admin approval workflows
- Advanced user-list features (mandatory pagination, multi-column sorting, multiple simultaneous filters)

## 4. Functional Requirements
- **FR-01 (Authentication):** The system must allow users to log in with an email and password, log out, and mandate a password change if they are using an initial password.
- **FR-02 (Authorization):** The system must enforce role-based access on the backend, ensuring Requesters, IT Staff, and Administrators can only access their permitted APIs and UI views.
- **FR-03 (IT Staff Operations):** IT Staff must be able to view a Ticket Queue, open tickets, claim/reassign ownership, set IT Priority, change ticket status, post Public Comments, and create Internal Notes.
- **FR-04 (Requester Regression):** Requesters must be able to create tickets, view only their owned tickets, add Public Comments, and indicate a problem appears resolved (but not formally close it).
- **FR-05 (Admin User Management):** Administrators must be able to view a list of users, search/filter, create users, update basic information, assign a single role, activate/deactivate accounts, and set new initial passwords.

## 5. Business Rules
| ID | Mandatory Business Rule |
|----|-------------------------|
| BR-01 | Only an active user with valid credentials may authenticate. |
| BR-02 | A user marked as requiring a password change cannot enter the normal application until a new valid password is saved. |
| BR-03 | The authenticated user identity, not a requesterId supplied by the client, determines ownership of Requester operations. |
| BR-04 | Public Comments are visible to the Requester, IT Staff, and Administrator. Internal Notes are visible only to IT Staff and Administrator. |
| BR-05 | A Requester may indicate that the problem appears resolved, but cannot formally set the Ticket to Resolved or Closed. |
| BR-06 | Duplicate email addresses are not permitted. |
| BR-07 | An Administrator cannot deactivate their own account. |
| BR-08 | The system must prevent removal or deactivation of the last active Administrator. |
| BR-09 | Each Ticket may have one primary Ticket Owner (IT Staff or Administrator), or be unassigned. |
| BR-10 | Requested Priority remains the value submitted by the Requester. IT Priority initially copies Requested Priority and can only be changed by IT Staff/Administrator. |
| BR-11 | Ticket statuses are limited to: New, Open, In Progress, Waiting for Requester, Resolved, Closed, Reopened, Cancelled. |
| BR-12 | Public Comments and Internal Notes are append-only. Editing and deletion are not allowed. Empty content is rejected. |

## 6. UI Specification Summary
- Reuse Zen Green design language (tokens, cards, buttons, badges, validation, responsive rules).
- Replace Development Requester selector with the authenticated user's name and role.
- Provide Logout and permitted profile/password actions.
- Show role-specific navigation without presenting unauthorized destinations.
- Provide feedback (loading, saving, success, validation, empty, forbidden, etc.).
- Reference `docs/lab-03/ui-spec.md` for detailed layouts (Login, Change Password, IT Staff Ticket Queue, IT Staff Ticket Detail, Admin User Management).

## 7. Data Changes
- Evolve Lab 2 PostgreSQL/Prisma design.
- Create `User` model (id, name, email, passwordHash, role, isActive, requiresPasswordChange).
- Migrate `Requester` to `User` (Role = Requester).
- Add `PublicComment` and `InternalNote` models (with relations to Ticket and User author).
- Update `Ticket` to include `ticketOwnerId` (User), `itPriority` (Enum), and new `TicketStatus` values.
- Seed Data: 4 active Requesters, 1 inactive Requester; 3 active IT Staff, 1 inactive IT Staff; 1 active Admin. Realistic tickets, comments, and notes.

## 8. API Contract
- Authentication endpoints (login, logout, get current user, change password).
- Authenticated Requester Ticket and Attachment APIs (migrate from Lab 2).
- IT Staff Ticket Queue retrieval (search, filters, sorting, pagination).
- Retrieve one Ticket for IT Staff.
- Update Ticket (claim/assign, IT priority, status).
- Comments and Notes CRUD (append and retrieve).
- Administrator User Management APIs (list, create, edit, set password).
- Reference `docs/lab-03/api-spec.md` for endpoint details.

## 9. Acceptance Criteria
| ID | Acceptance Criterion |
|----|----------------------|
| AC-01 | Given an active user with valid credentials, when the user logs in, then the backend establishes authenticated access and returns the permitted user identity and role. |
| AC-02 | Given a user who must change the initial password, when login succeeds, then normal application screens remain unavailable until a valid new password is saved. |
| AC-03 | Given an authenticated Requester, when the client supplies another requesterId, then the backend still applies the authenticated identity and does not return another Requester’s data. |
| AC-04 | Given a Requester account, when an Internal Note endpoint is requested, then the operation is rejected without exposing note content. |
| AC-05 | Given an IT Staff user, when viewing the Ticket Queue, then they can search, filter, sort, and paginate through tickets. |
| AC-06 | Given an Administrator, when creating a new user, then duplicate emails are rejected. |
| AC-07 | Given an Administrator, when attempting to deactivate their own account, then the action is prevented. |

## 10. Definition of Done
- Specification (this document), API spec, UI spec, and Test plan are completed.
- All code changes are implemented with Git workflow (feature branches, PRs).
- All Acceptance Criteria are met and covered by automated tests.
- Authentication and Role-based access are fully functional and secure.
- Zen Green UI is responsive and accessible.
- Seed data covers all required scenarios.
- AI use log (`docs/lab-03/ai-use.md`) is completed.

## 11. Assumptions and Decisions
- Passwords will be hashed using bcrypt.
- JWT will be used for authentication sessions (stored in HTTP-only cookies).
- Migration will map the existing `Requester` table to a new `User` table, updating foreign keys in `Ticket` accordingly.
