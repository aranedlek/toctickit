# Lab 02 – AI Usage Log

This document records the AI prompts used during the development of Lab 02 (Requester-facing Ticketing MVP). Prompts are grouped by activity and include the tool used and the purpose of each prompt.

---

## 1. Specification & Design

### Prompt 1 – Generate Sprint Specification
**Tool:** Antigravity IDE (Chat)  
**Prompt:**
```
I am building a requester-facing ticketing system called TokTickIT for Lab 02.
The system must support:
- A simulated requester selection screen (no real auth)
- A create ticket form with file attachments (JPG, PNG, WEBP, PDF, max 5 MB, max 5 files)
- A my tickets screen with search, filter, sort, and pagination
- A ticket detail screen (read-only)
- Soft-delete for attachments

Please generate a sprint specification document in Markdown including:
- Sprint goal
- In scope / out of scope
- Prisma data models (Requester, Category, RelatedSystem, Ticket, Attachment)
- Seed data tables
- Business rules
- Acceptance criteria
- Definition of Done
```
**Purpose:** Generate the initial `specification.md` as a starting point.

---

### Prompt 2 – Generate UI Specification
**Tool:** Antigravity IDE (Chat)  
**Prompt:**
```
Based on the sprint specification for TokTickIT Lab 02, generate a UI specification
document in Markdown. The theme is "Zen Green". Include:
- Color palette with CSS variable names and hex values
- Typography (font, size, weight for each element level)
- Spacing and border radius system
- ASCII wireframes for: Requester Selection, Create Ticket, My Tickets, Ticket Detail
- Shared components: Navbar, Status Badge, Toast, Loading states
- Hover/click animation table
```
**Purpose:** Generate `ui-spec.md` with a complete Zen Green design system.

---

### Prompt 3 – Generate API Specification
**Tool:** Antigravity IDE (Chat)  
**Prompt:**
```
Generate a REST API specification for TokTickIT Lab 02 in Markdown. Base URL is /api.
Include endpoints for:
- GET /requesters (active only)
- GET /categories
- GET /related-systems
- POST /tickets (with validation rules and error responses)
- GET /tickets (with requesterId, search, status, priority, sortBy, order, page, limit params)
- GET /tickets/:id (include non-deleted attachments only)
- POST /tickets/:id/attachments (multipart/form-data, type/size/count limits)
- DELETE /attachments/:id (soft-delete, set deletedAt)

For each endpoint include: method, path, request body/params, response 200/201, error responses with status codes.
```
**Purpose:** Generate `api-spec.md` as the contract between frontend and backend.

---

## 2. Backend Development

### Prompt 4 – Generate Prisma Schema
**Tool:** Antigravity IDE (Chat)  
**Prompt:**
```
Generate a Prisma schema file for TokTickIT Lab 02 with these models:
- Requester (id, name, email, isActive, createdAt)
- Category (id, name, createdAt)
- RelatedSystem (id, name, createdAt)
- Ticket (id, title, description, status enum, priority enum, requesterId, categoryId, relatedSystemId?, createdAt, updatedAt)
- Attachment (id, ticketId, filename, storagePath, mimeType, sizeBytes, deletedAt?, uploadedAt)

Include enums for TicketStatus (OPEN, IN_PROGRESS, RESOLVED, CLOSED) and Priority (LOW, MEDIUM, HIGH, URGENT).
Add all relations.
```
**Purpose:** Generate the initial `schema.prisma` file.

---

### Prompt 5 – Generate Seed Data
**Tool:** Antigravity IDE (Chat)  
**Prompt:**
```
Generate a Prisma seed file in TypeScript (seed.ts) for TokTickIT.
Seed the following data:
- 5 Requesters: Anya Suphan, Ben Rattana, Chanya Prom, Dome Wiriya (isActive=true), Eve Inactive (isActive=false)
- 4 Categories: IT Support, HR Request, Finance, Facilities
- 6 Related Systems: SAP ERP, Microsoft 365, Slack, Google Workspace, Jira, Confluence
- 3 sample Tickets for Anya (requesterId=1) with different statuses and priorities
Use upsert to avoid duplicate errors on re-run.
```
**Purpose:** Generate `seed.ts` with realistic sample data for testing.

---

### Prompt 6 – Generate Express Route for Tickets
**Tool:** Antigravity IDE (Chat)  
**Prompt:**
```
Generate an Express router file for ticket endpoints in TypeScript:
- POST /tickets: validate title, description, categoryId, requesterId; create ticket; return 201
- GET /tickets: accept requesterId (required), search, status, priority, sortBy, order, page, limit; return paginated result
- GET /tickets/:id: return ticket with category, relatedSystem, and non-deleted attachments; return 404 if not found

Use Prisma client. Return errors as { error: "message" } with appropriate status codes.
```
**Purpose:** Generate backend route handler for ticket operations.

---

## 3. Frontend Development

### Prompt 7 – Generate CreateTicket Form Component
**Tool:** Antigravity IDE (Chat)  
**Prompt:**
```
Generate a React + TypeScript CreateTicket page component for TokTickIT.
Requirements:
- Form fields: Title (text, required), Description (textarea, required), Category (select, required), Priority (select, default MEDIUM), Related System (select, optional)
- File dropzone for attachments: accept JPG, PNG, WEBP, PDF only, max 5 MB each, max 5 files total
- Show file preview chips with filename and remove (×) button
- On submit: POST to /api/tickets, then upload each attachment to POST /api/tickets/:id/attachments
- Show validation errors inline
- On success: navigate to /tickets/:id
Use fetch API. Style with Zen Green CSS variables.
```
**Purpose:** Generate `CreateTicket.tsx` with full form validation and attachment handling.

---

### Prompt 8 – Generate MyTickets Page with Filter and Pagination
**Tool:** Antigravity IDE (Chat)  
**Prompt:**
```
Generate a React + TypeScript MyTickets page for TokTickIT.
Requirements:
- Fetch tickets from GET /api/tickets?requesterId={id} on load
- Search input (debounced 300ms) sends search param to API
- Status and Priority filter dropdowns send filter params to API
- Sort by Created Date and Priority
- Pagination: 10 per page, show Previous/Next and page numbers
- Ticket cards with left accent bar colored by status
- Empty state message when no tickets found
- Loading skeleton animation while fetching
Use fetch API with query params. Style with Zen Green CSS variables.
```
**Purpose:** Generate `MyTickets.tsx` with server-side filtering and pagination.

---

## 4. Testing

### Prompt 9 – Generate API Test Suite
**Tool:** Antigravity IDE (Chat)  
**Prompt:**
```
Generate a Vitest + Supertest test file for TokTickIT backend API covering:
- GET /api/requesters: returns only active requesters (Eve excluded)
- POST /api/tickets: valid creation returns 201; missing title/description/categoryId returns 400; invalid requesterId returns 404
- GET /api/tickets: pagination structure correct; search by title works; filter by status works
- GET /api/tickets/:id: returns ticket with non-deleted attachments only; returns 404 for unknown id
- DELETE /api/attachments/:id: sets deletedAt; subsequent GET excludes attachment
Use beforeAll to seed test DB and afterAll to clean up.
```
**Purpose:** Generate `tickets.test.ts` covering all API-level test cases from the test plan.

---

### Prompt 10 – Generate UI Component Tests
**Tool:** Antigravity IDE (Chat)  
**Prompt:**
```
Generate Vitest + React Testing Library tests for TokTickIT frontend:
- RequesterSelector: renders 4 active cards, Eve not in DOM, clicking a card saves to localStorage and navigates
- CreateTicketForm: empty submit shows validation errors, valid submit calls POST /api/tickets
- AttachmentUpload: dropping a valid JPG adds a preview chip, dropping an invalid type shows error, dropping a 6th file shows limit error
- MyTickets: renders ticket list, search input filters displayed list
- TicketDetail: shows all ticket fields, no edit button present
Mock fetch with vi.fn(). Use screen queries and userEvent.
```
**Purpose:** Generate component test files covering all UI test cases from the test plan.

---

## Summary

| # | Activity | Prompt Goal |
|---|----------|-------------|
| 1 | Specification | Sprint spec document |
| 2 | UI Design | Zen Green UI spec + wireframes |
| 3 | API Design | Full REST API contract |
| 4 | Backend | Prisma schema generation |
| 5 | Backend | Seed data script |
| 6 | Backend | Express route handler |
| 7 | Frontend | CreateTicket form component |
| 8 | Frontend | MyTickets list + pagination |
| 9 | Testing | API test suite |
| 10 | Testing | UI component test suite |
