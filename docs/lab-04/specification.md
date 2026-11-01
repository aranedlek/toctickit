# Lab 04 – Sprint Specification

## 1. Sprint Goal
Complete the core TokTickIT service-desk workflow by introducing a parent-child Actions Taken tracking model under Tickets, enforcing the definitive Ticket status transition lifecycle and resolution gate, providing authoritative role-appropriate dashboards for Requesters, IT Staff, and Administrators, and hardening the entire full-stack application across Labs 1 through 3 to guarantee regression stability, security, accessibility, and visual consistency under the Zen Green design system.

---

## 2. Stakeholder Request
The service desk can receive Tickets and IT Staff can communicate with Requesters, but a reliable mechanism is needed to plan and track the actual work performed. Under each Ticket, IT Staff must be able to record structured **Actions Taken** containing Action Date/Time, Action Description, Result, Performed by (auto-bound to the authenticated user), Follow-Up Required?, Follow-up Note (mandatory when follow-up is required), and Attachment Notes (referencing files or images).

The primary Ticket Owner remains responsible for coordinating the overall Ticket; however, different IT Staff members may perform and record individual actions. Requesters may indicate that a problem appears resolved from their perspective, but this indication is strictly advisory—IT Staff must review the work and formally update the Ticket status.

Concise, role-appropriate dashboards must be provided for Requesters and IT Staff, displaying authoritative operational metrics and connected directly to filtered list views via drill-down actions. Finally, the complete system must be polished and hardened so that all earlier features (authentication, role-based access, ticket creation, public comments, internal notes, attachments, user management) continue to operate seamlessly under the Zen Green design language.

---

## 3. Scope

### 3.1 Included in Sprint 4
- **Actions Taken Work Structure:** Parent-child relationship (1 Ticket to Many Actions Taken), tracking date/time, description, result, performer, follow-up flags/notes, and attachment reference notes.
- **Role Permissions for Actions Taken:** IT Staff and Administrators have full create and update rights; Requesters have read-only visibility for tickets they own.
- **Ticket Status & Resolution Gate:** Strict backend enforcement of the Ticket status transition matrix across 8 statuses (`NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CLOSED`, `REOPENED`, `CANCELLED`). Requester-reported resolution is strictly advisory and does not automatically set status to `RESOLVED`.
- **Optimistic Concurrency & Conflict Handling:** Stale update detection via entity versioning/timestamps to prevent accidental overwrites during concurrent status or action updates.
- **Authoritative Role-Based Dashboards:**
  - *Requester Dashboard:* Metrics for authenticated user's tickets (Open, Waiting for Requester, Recently Updated, Recently Resolved) with drill-down links.
  - *IT Staff Dashboard:* Metrics for operational queue (Unassigned, Assigned to Me, Count by Status/IT Priority, Recently Updated) with drill-down links.
  - *Administrator Dashboard:* Reuses IT Staff dashboard metrics plus user account statistics.
- **Database & Data Migration:** PostgreSQL + Prisma migration preserving existing Lab 1–3 data without data loss; idempotent seed scripts providing realistic tickets with zero, one, and multiple actions taken.
- **REST API Extensions:** Endpoints for Actions Taken CRUD, Ticket status transitions, and authoritative dashboard metric queries.
- **Zen Green Polish & Hardening:** Fully responsive layouts (Desktop, Tablet, Mobile), WCAG-compliant keyboard focus and non-color indicators, defensive input handling, zero console errors, and comprehensive regression test suites.

### 3.2 Explicitly Excluded from Sprint 4
- Automatic SLA clocks, countdown timers, escalation engines, on-call scheduling, and breach notifications.
- Email, SMS, LINE, push, or external web-hook notification services.
- Inventory consumption, spare-parts management, purchasing, or cost accounting for services.
- Time-sheet billing, payroll, or detailed labor-cost calculation.
- Multi-level approval workflows and cryptographic electronic signatures.
- Advanced business-intelligence tools, custom report builders, or external data warehouses.
- Multi-tenant organizations and production-scale cloud operations.
- New unapproved product features outside the approved Sprint 4 engineering contract.

---

## 4. Functional Requirements

- **FR-01 (Actions Taken Management):** IT Staff and Administrators must be able to record, view, and update Actions Taken records on accessible tickets with automatic binding of the logged-in user as the performer.
- **FR-02 (Actions Taken Read Visibility):** Authenticated Requesters must be able to view all Actions Taken entries associated with their owned tickets, but must be barred by the backend from creating, updating, or deleting any action record.
- **FR-03 (Ticket Status Lifecycle Matrix):** The system must enforce permitted status transitions across all 8 defined statuses, rejecting any illegal status jumps at the backend level.
- **FR-04 (Formal Resolution Gate):** A Requester's indication that their problem appears resolved must be treated as an advisory signal only. Only authorized IT Staff and Administrators may formally transition a ticket to `RESOLVED` or `CLOSED`.
- **FR-05 (Concurrency Conflict Prevention):** The backend must detect stale concurrent ticket modifications using version checking, returning HTTP 409 Conflict when a collision occurs to prevent silent overwrites.
- **FR-06 (IT Staff Dashboard):** The application must provide IT Staff with a dedicated operational dashboard presenting real-time metric cards (Unassigned, My Assigned, Status Breakdown, Recent Activity) with one-click drill-down to filtered ticket queues.
- **FR-07 (Requester Dashboard):** The application must provide Requesters with a personalized dashboard displaying only their owned ticket metrics (Open, Waiting on Me, Recently Resolved) and quick-action links.
- **FR-08 (Administrator Dashboard View):** Administrators must have access to the operational dashboard metrics and concise user account health indicators.
- **FR-09 (Full System Regression & Hardening):** All prior capabilities (authentication, password changes, Requester ticket creation and attachments, public comments, internal notes, IT ticket queues, and Admin user management) must remain fully operational without degradation.

---

## 5. Business Rules

| BR ID | Rule Name | Mandatory Business Rule Statement |
| :--- | :--- | :--- |
| **BR-01** | Ticket Association | An Action Taken record belongs to exactly one Ticket (One-to-Many relationship). Deleting a ticket cascades to its actions taken. |
| **BR-02** | Performer Autonomy | A Ticket has one primary Ticket Owner for overall coordination, but an Action Taken may be executed and logged by any active IT Staff member or Administrator. |
| **BR-03** | Mandatory Action Fields | Every Action Taken entry must capture: Action Date/Time, Action Description (non-empty), Result (non-empty), Performed By (auto-populated with authenticated user), Follow-Up Required (boolean), and optional Attachment Notes. |
| **BR-04** | Follow-Up Note Conditional Requirement | If `followUpRequired` is marked `true`, the `followUpNote` field is strictly required and cannot be empty. If `followUpRequired` is `false`, `followUpNote` may be null or omitted. |
| **BR-05** | Requester Immutability | Requesters have read-only access to Actions Taken on their own tickets. All write/mutate attempts by a Requester on Actions Taken endpoints must return HTTP 403 Forbidden. |
| **BR-06** | Inactive Performer Rejection | An inactive IT Staff account cannot be recorded as the performer of a new Action Taken, nor assigned as a Ticket Owner. |
| **BR-07** | Permitted Ticket Statuses | Valid ticket statuses are strictly limited to the enum: `NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CLOSED`, `REOPENED`, `CANCELLED`. |
| **BR-08** | Status Transition Matrix | Status transitions must follow the authorized matrix below. Unpermitted state transitions must be rejected with HTTP 422 Unprocessable Entity: |

### Permitted Status Transition Matrix

| Current Status | Permitted Next Statuses | Permitted Roles | Notes |
| :--- | :--- | :--- | :--- |
| **NEW** | `OPEN`, `CANCELLED` | IT Staff, Administrator | Auto-moves to `OPEN` on first staff assignment or triage. |
| **OPEN** | `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `CANCELLED` | IT Staff, Administrator | Active coordination begins. |
| **IN_PROGRESS** | `WAITING_FOR_REQUESTER`, `RESOLVED`, `CANCELLED` | IT Staff, Administrator | Work underway; moving to `RESOLVED` requires staff verification. |
| **WAITING_FOR_REQUESTER** | `IN_PROGRESS`, `RESOLVED`, `CANCELLED` | IT Staff, Administrator, Requester (Advisory only) | Requester reply re-engages staff or flags advisory resolution. |
| **RESOLVED** | `CLOSED`, `REOPENED` | IT Staff, Administrator | Resolved state acts as closure candidate. |
| **REOPENED** | `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `CANCELLED` | IT Staff, Administrator | Re-activated work path. |
| **CLOSED** | *Terminal state* (or `REOPENED` by Admin only) | Administrator | Archived ticket state. |
| **CANCELLED** | *Terminal state* | IT Staff, Administrator | Withdrawn ticket state. |

| BR ID | Rule Name | Mandatory Business Rule Statement |
| :--- | :--- | :--- |
| **BR-09** | Formal Resolution Gate | A Requester's indication that their problem is resolved is advisory only. The backend must reject any direct client request by a Requester attempting to set status to `RESOLVED` or `CLOSED` with HTTP 403 Forbidden. |
| **BR-10** | Optimistic Concurrency Control | When updating a Ticket's status or details, clients must supply the current entity version or timestamp. If the database record has been modified concurrently, the backend must return HTTP 409 Conflict. |
| **BR-11** | Authoritative Backend Metrics | Dashboard metrics must be computed directly by the database engine via authoritative aggregation queries. Frontend clients are strictly prohibited from deriving counts by loading full ticket lists. |
| **BR-12** | Requester Data Isolation | Dashboard metric queries for Requesters must enforce a strict `WHERE requesterId = :authUserId` filter. No Requester can view aggregate or detailed operational data belonging to other users. |
| **BR-13** | Graceful Zero/Empty States | When any dashboard metric evaluates to zero, or a query list is empty, the UI must render an informative empty state card rather than an error or blank container, preserving accessible drill-down capability. |

---

## 6. UI Specification Summary
- **Zen Green Design System:** Continuous reuse of established tokens (`--color-primary: #2D6A4F`, `--color-surface: #F0F7F4`, `--color-border: #D8F3DC`, status pill badges, responsive cards, and clean typography).
- **Navigation Enhancement:** Role-based top navbar displaying "Dashboard" as the primary landing destination for both Requesters and IT Staff with active link indicators.
- **IT Staff Dashboard (`/staff/dashboard`):** Prominent operational metrics (Unassigned, Assigned to Me, In Progress, Waiting for Requester), Recent Tickets table, and Quick Action buttons with drill-downs to filtered queue views.
- **Requester Dashboard (`/requester/dashboard`):** Personalized overview (Total Open Tickets, Tickets Waiting for My Action, Recently Resolved), Quick Actions (Create Ticket, View My Tickets), and Recent Activity list.
- **Ticket Detail Screen Extension:** Dedicated "Actions Taken" section positioned below Ticket details, featuring an chronological audit table, "Record Action Taken" button for staff, and an inline/modal editor.
- **Accessibility & Responsiveness:** Strict adherence to WCAG 2.1 AA: visible focus rings, keyboard accessible modal dialogs, non-color semantic cues on badges, and table-to-card reflow on mobile screens (< 768px).
- *Refer to [ui-spec.md](file:///c:/Users/lenovo/Documents/toctickit/docs/lab-04/ui-spec.md) for full wireframes and responsive behavior.*

---

## 7. Data Changes & Migration

### 7.1 Entity Relationship Model
```
+--------------------+        1:N        +-------------------------+
|       Ticket       |-------------------|       ActionTaken       |
+--------------------+                   +-------------------------+
| id                 |                   | id                      |
| number             |                   | ticketId (FK)           |
| title              |                   | actionDateTime          |
| description        |                   | actionDescription       |
| status             |                   | result                  |
| priority           |                   | performedById (FK)      |
| itPriority         |                   | followUpRequired (bool) |
| version (Int)      |<-- Concurrency    | followUpNote (text?)    |
| requesterId (FK)   |                   | attachmentNotes (text?) |
| ticketOwnerId (FK) |                   | createdAt / updatedAt   |
+--------------------+                   +-------------------------+
                                                      |
                                                      | N:1
                                         +-------------------------+
                                         |          User           |
                                         +-------------------------+
```

### 7.2 Database Schema Additions (`backend/prisma/schema.prisma`)
```prisma
model ActionTaken {
  id                Int      @id @default(autoincrement())
  ticketId          Int
  actionDateTime    DateTime @default(now())
  actionDescription String
  result            String
  performedById     Int
  followUpRequired  Boolean  @default(false)
  followUpNote      String?
  attachmentNotes   String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  ticket      Ticket @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  performedBy User   @relation("ActionPerformer", fields: [performedById], references: [id])

  @@index([ticketId])
  @@index([performedById])
}

// In model Ticket:
// version Int @default(1)
// actionsTaken ActionTaken[]

// In model User:
// actionsTaken ActionTaken[] @relation("ActionPerformer")
```

### 7.3 Justification of Database Design Decisions (Handout 5.1 Requirement)
1. **Dedicated `ActionTaken` Table vs Reusing `InternalNote`:**  
   *Decision:* Actions Taken are modeled as a distinct first-class table rather than adding flags to `InternalNote`.  
   *Justification:* An internal note is an unstructured, free-form staff comment. An Action Taken represents a formal service-desk work item requiring auditable structured metadata (`actionDateTime`, `result`, `performedBy`, boolean `followUpRequired`, and cross-referenced `attachmentNotes`). Coupling this into notes would violate Single Responsibility, complicate querying, and make backend validation fragile.
2. **Optimistic Concurrency Control via `version` Field:**  
   *Decision:* Adding a numeric `version` column to the `Ticket` entity incremented on every workflow transition.  
   *Justification:* In a multi-user service desk, multiple IT Staff members or Requesters may inspect and act upon the same ticket simultaneously. OCC prevents "last write wins" data loss without the performance penalties or deadlock hazards of pessimistic database row locks.
3. **Foreign Key Cascade and Index Strategy:**  
   *Decision:* Adding explicit indexes on `ActionTaken(ticketId)` and `ActionTaken(performedById)` with cascade deletion on ticket cleanup.  
   *Justification:* Tickets will frequently fetch all historical actions in chronological order, and staff dashboards query actions executed by the current user. Foreign key indexing guarantees sub-millisecond retrieval as transaction volume grows.

### 7.4 Migration & Backfill Strategy
- The Prisma migration must run cleanly against existing PostgreSQL databases containing Lab 1–3 data.
- Existing legacy tickets receive a default `version = 1` and initially have zero Actions Taken.
- Dashboard queries gracefully calculate counts for legacy tickets without requiring synthetic action records.

### 7.5 Seed Data Requirements
- Fully **idempotent** seed execution (`prisma db seed` can be run multiple times safely).
- Includes realistic scenarios:
  - Tickets with 0 actions taken (demonstrating empty states).
  - Tickets with 1 action taken.
  - Tickets with multiple actions taken logged by different IT Staff members.
  - Dashboard seed distributions showing non-zero and zero counts across different user roles.

---

## 8. API Contract Summary
- **Actions Taken Endpoints:**
  - `GET /api/tickets/:id/actions`: Fetch all actions taken for a ticket (Role-checked).
  - `POST /api/tickets/:id/actions`: Create an action taken (Staff/Admin only).
  - `PATCH /api/tickets/:id/actions/:actionId`: Update an existing action taken (Staff/Admin only).
- **Ticket Workflow & Concurrency Endpoints:**
  - `PATCH /api/tickets/:id/status`: Transition ticket status with optimistic version check.
- **Role Dashboard Endpoints:**
  - `GET /api/dashboard/requester`: Summary metrics for logged-in Requester.
  - `GET /api/dashboard/staff`: Operational metrics for IT Staff.
  - `GET /api/dashboard/admin`: System-wide operational and user metrics.
- *Refer to [api-spec.md](file:///c:/Users/lenovo/Documents/toctickit/docs/lab-04/api-spec.md) for complete payload schemas, HTTP status codes, and error formats.*

---

## 9. Acceptance Criteria

| AC ID | Acceptance Criterion |
| :--- | :--- |
| **AC-01** | Given an authenticated IT Staff member and valid action payload, when creating an Action Taken, then the record is persisted under the specified ticket with the authenticated user auto-assigned as `performedBy`. |
| **AC-02** | Given an Action Taken payload where `followUpRequired` is `true` but `followUpNote` is empty, when submitted, then the backend rejects the request with HTTP 400 Bad Request and descriptive validation feedback. |
| **AC-03** | Given an authenticated Requester, when attempting to create or modify an Action Taken record, then the request is rejected with HTTP 403 Forbidden. |
| **AC-04** | Given an authenticated Requester, when viewing Actions Taken for an owned ticket, then all historical action items are returned; if attempting to view actions for another user's ticket, HTTP 403 or 404 is returned. |
| **AC-05** | Given an authenticated IT Staff user, when viewing the IT Staff Dashboard, then accurate counts for Unassigned, Assigned to Me, and Status breakdowns are returned matching database queries, with clickable drill-downs. |
| **AC-06** | Given an authenticated Requester, when viewing the Requester Dashboard, then metrics reflect only tickets where `requesterId` matches the authenticated user. |
| **AC-07** | Given a ticket in `IN_PROGRESS` status, when an unauthorized role or illegal target status is requested, then the backend rejects the transition with HTTP 422 Unprocessable Entity. |
| **AC-08** | Given a ticket update request with a stale version identifier, when submitted, then the backend rejects the request with HTTP 409 Conflict without modifying database state. |
| **AC-09** | Given an initial clean database, when executing the seed script repeatedly, then it executes idempotently without duplicate key errors or data corruption. |
| **AC-10** | Given any viewport size (Desktop ≥ 1024px, Tablet 768–1023px, Mobile < 768px), then all Dashboards and Actions Taken views render cleanly according to Zen Green specifications without horizontal overflow. |

---

## 10. Definition of Done (DoD)
- [x] Sprint 4 Engineering Contract specification approved and committed in `docs/lab-04/`.
- [x] Prisma schema updated with `ActionTaken` model, concurrency version, and migrations executed.
- [x] Idempotent seed script updated with realistic actions taken and dashboard distribution data.
- [x] Backend REST APIs implemented for Actions Taken, Dashboards, and Status Transitions with strict role and concurrency checks.
- [x] Frontend UI screens implemented for IT Staff Dashboard, Requester Dashboard, and Ticket Detail Actions Taken section.
- [x] Zen Green theme, responsiveness, and accessibility guidelines verified across all screens.
- [x] Automated test suite (API integration, UI components, Playwright E2E) created and passing 100%.
- [x] Full regression verification across Lab 1–3 functionality (Auth, Tickets, Comments, Notes, Attachments, Admin).
- [x] All GitHub Issues completed on Kanban board and tracked via Pull Requests with Peer Review evidence in `reviewer.md`.

---

## 11. Assumptions and Architectural Decisions
1. **Action Editing Scope:** IT Staff and Administrators may edit Action Description, Result, Follow-up information, and Attachment Notes of existing actions, but the original `performedById` and `actionDateTime` remain immutable to preserve audit trail integrity.
2. **Dashboard Query Performance:** Dashboards utilize optimized Prisma aggregation queries (`count`, `groupBy`) rather than loading raw ticket collections into Node.js memory.
3. **Advisory Resolution Signal:** When a Requester indicates a problem appears resolved, a public comment or status flag is updated indicating Requester satisfaction, leaving formal status transition to IT Staff verification.
