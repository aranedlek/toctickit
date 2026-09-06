# Lab 02 – Test Plan

## 1. Testing Strategy Overview

| Layer | Tool | Coverage Goal |
|-------|------|---------------|
| Unit | Vitest (frontend) | Business logic: validation, filtering, formatting |
| API | Vitest + Supertest (backend) | All REST endpoints — happy path + error cases |
| UI / Component | Vitest + React Testing Library | Key screens render correctly and interact as expected |
| Responsive | Manual (DevTools) | Desktop, Tablet, Mobile breakpoints |
| E2E | Playwright | Critical user flows end-to-end |

---

## 2. Unit Tests (Frontend)

### 2.1 Attachment Validation (`src/utils/validateAttachment.ts`)

| Test ID | Description | Input | Expected Output |
|---------|-------------|-------|-----------------|
| UT-01 | Accept valid JPG | `{ type: "image/jpeg", size: 1_000_000 }` | `{ valid: true }` |
| UT-02 | Accept valid PNG | `{ type: "image/png", size: 5_000_000 }` | `{ valid: true }` |
| UT-03 | Accept valid WEBP | `{ type: "image/webp", size: 2_000_000 }` | `{ valid: true }` |
| UT-04 | Accept valid PDF | `{ type: "application/pdf", size: 4_999_999 }` | `{ valid: true }` |
| UT-05 | Reject unsupported type | `{ type: "text/plain", size: 100 }` | `{ valid: false, error: "Unsupported file type" }` |
| UT-06 | Reject file > 5 MB | `{ type: "image/jpeg", size: 5_000_001 }` | `{ valid: false, error: "File exceeds 5 MB limit" }` |
| UT-07 | Reject 6th attachment | current count = 5, new file valid | `{ valid: false, error: "Maximum 5 attachments allowed" }` |

### 2.2 Ticket Form Validation (`src/utils/validateTicketForm.ts`)

| Test ID | Description | Input | Expected Output |
|---------|-------------|-------|-----------------|
| UT-08 | Reject empty title | `{ title: "" }` | `{ valid: false, field: "title" }` |
| UT-09 | Reject empty description | `{ description: "" }` | `{ valid: false, field: "description" }` |
| UT-10 | Reject missing category | `{ categoryId: null }` | `{ valid: false, field: "categoryId" }` |
| UT-11 | Accept all required fields | all valid | `{ valid: true }` |

### 2.3 Ticket List Filtering (`src/utils/filterTickets.ts`)

| Test ID | Description | Expected |
|---------|-------------|----------|
| UT-12 | Search by partial title (case-insensitive) | Returns only matching tickets |
| UT-13 | Filter by status OPEN | Returns only OPEN tickets |
| UT-14 | Filter by priority HIGH | Returns only HIGH tickets |
| UT-15 | Combine search + filter | Returns tickets matching both |
| UT-16 | Empty results when no match | Returns empty array |

---

## 3. API Tests (Backend)

### 3.1 Requesters

| Test ID | Method + Path | Scenario | Expected Status | Expected Body |
|---------|--------------|----------|-----------------|---------------|
| API-01 | GET /api/requesters | Returns all active requesters | 200 | Array of 4 active requesters |
| API-02 | GET /api/requesters | Inactive requesters excluded | 200 | Eve (isActive=false) not present |

### 3.2 Reference Data

| Test ID | Method + Path | Scenario | Expected Status |
|---------|--------------|----------|-----------------|
| API-03 | GET /api/categories | Returns all 4 categories | 200 |
| API-04 | GET /api/related-systems | Returns all 6 related systems | 200 |

### 3.3 Tickets

| Test ID | Method + Path | Scenario | Expected Status | Expected Body |
|---------|--------------|----------|-----------------|---------------|
| API-05 | POST /api/tickets | Create valid ticket | 201 | Ticket object with id, status=OPEN, priority=MEDIUM |
| API-06 | POST /api/tickets | Missing title | 400 | `{ error: "Title is required" }` |
| API-07 | POST /api/tickets | Missing description | 400 | `{ error: "Description is required" }` |
| API-08 | POST /api/tickets | Missing categoryId | 400 | `{ error: "Category is required" }` |
| API-09 | POST /api/tickets | Invalid requesterId | 404 | `{ error: "Requester not found" }` |
| API-10 | GET /api/tickets?requesterId=1 | Returns only requester's tickets | 200 | Array of tickets for requester 1 |
| API-11 | GET /api/tickets?requesterId=1&search=network | Search by title | 200 | Only matching tickets |
| API-12 | GET /api/tickets?requesterId=1&status=OPEN | Filter by status | 200 | Only OPEN tickets |
| API-13 | GET /api/tickets?requesterId=1&page=1&limit=10 | Pagination works | 200 | `{ data: [...], total, page, limit }` |
| API-14 | GET /api/tickets/:id | Get existing ticket with attachments | 200 | Ticket + non-deleted attachments only |
| API-15 | GET /api/tickets/:id | Non-existent ticket | 404 | `{ error: "Ticket not found" }` |

### 3.4 Attachments

| Test ID | Method + Path | Scenario | Expected Status |
|---------|--------------|----------|-----------------|
| API-16 | POST /api/tickets/:id/attachments | Upload valid JPG | 201 |
| API-17 | POST /api/tickets/:id/attachments | Upload invalid type (TXT) | 400 |
| API-18 | POST /api/tickets/:id/attachments | Upload file > 5 MB | 400 |
| API-19 | POST /api/tickets/:id/attachments | 6th attachment on a ticket | 400 |
| API-20 | DELETE /api/attachments/:id | Soft-delete attachment | 200 |
| API-21 | DELETE /api/attachments/:id | Verify `deletedAt` set in DB | 200 |
| API-22 | GET /api/tickets/:id | Soft-deleted attachment not in response | 200 |

---

## 4. UI / Component Tests (React Testing Library)

| Test ID | Component | Scenario | Expected |
|---------|-----------|----------|----------|
| UI-01 | RequesterSelector | Renders 4 active requesters | 4 cards visible |
| UI-02 | RequesterSelector | Does not render inactive requester | Eve not in DOM |
| UI-03 | RequesterSelector | Clicking card saves to localStorage | localStorage key set |
| UI-04 | CreateTicketForm | Submit with empty title shows error | Error message in DOM |
| UI-05 | CreateTicketForm | Submit with all valid fields calls API | POST /api/tickets called |
| UI-06 | AttachmentUpload | Dropping a valid file adds preview | Preview item rendered |
| UI-07 | AttachmentUpload | Dropping invalid file shows error | Error alert rendered |
| UI-08 | MyTickets | Renders ticket list | Ticket titles visible |
| UI-09 | MyTickets | Search input filters displayed tickets | Only matching tickets shown |
| UI-10 | TicketDetail | Shows all ticket fields | Title, status, category, etc. visible |
| UI-11 | TicketDetail | Does not show edit button | No edit button in DOM |

---

## 5. Responsive Design Tests (Manual)

| Test ID | Screen | Viewport | Checklist |
|---------|--------|----------|-----------|
| RES-01 | All screens | 1280×800 (Desktop) | Layout fills width, no overflow |
| RES-02 | All screens | 768×1024 (Tablet) | Nav collapses, cards stack 2-column |
| RES-03 | All screens | 375×812 (Mobile) | Single-column layout, no horizontal scroll |
| RES-04 | CreateTicket form | 375×812 | All inputs reachable, file upload accessible |
| RES-05 | MyTickets | 375×812 | Table/list readable, pagination controls visible |

---

## 6. End-to-End Tests (Playwright)

| Test ID | Flow | Steps | Expected Outcome |
|---------|------|-------|------------------|
| E2E-01 | Full Create Ticket | 1. Open app → Select requester → Create ticket → Verify redirect to detail page | Detail page shows new ticket title |
| E2E-02 | My Tickets Search | 1. Select requester → Go to My Tickets → Type in search box | Filtered list updates in real time |
| E2E-03 | Attachment Upload + Remove | 1. On Create Ticket, add a JPG → Remove it → Submit | Submitted ticket has 0 attachments |
| E2E-04 | Validation Prevents Submit | 1. Click submit on empty Create Ticket form | Validation errors shown; no API call made |
| E2E-05 | Requester Persisted | 1. Select requester → Refresh page | Same requester still shown as active |

---

## 7. Test Execution Commands

```bash
# Backend API tests
cd backend
npm test

# Frontend unit + UI tests
cd frontend
npm test
```

> E2E tests with Playwright are run manually or via CI. See `playwright.config.ts` for configuration.
