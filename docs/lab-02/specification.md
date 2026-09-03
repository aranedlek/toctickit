# Lab 02 – Sprint Specification

## 1. Sprint Goal

Deliver a working **Requester MVP** for the TokTickIT ticketing system. By the end of this sprint, a development requester can select their identity, submit tickets with file attachments, browse and filter their own tickets, and view individual ticket details — all through a responsive, Zen-Green themed UI.

---

## 2. Scope

### In Scope
- Development Requester selection screen (simulated login, no real auth)
- Create Ticket screen with attachment upload
- My Tickets screen with search, filter, sort, and pagination
- Ticket Detail screen (read-only view)
- Attachment lifecycle: upload, preview, soft-delete
- REST API endpoints supporting all the above screens
- PostgreSQL database with Prisma schema and seed data
- Responsive layout for Desktop, Tablet, and Mobile

### Out of Scope
- Real authentication / JWT / sessions
- Agent / admin roles and their dashboards
- Email notifications
- Ticket editing after submission
- Comments / chat on tickets

---

## 3. Team

| Role | Name |
|------|------|
| Developer / Designer | (Your Name) |

---

## 4. Data Models

### 4.1 Requester

```prisma
model Requester {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())

  tickets   Ticket[]
}
```

**Seed Data (required)**
| # | Name | Email | isActive |
|---|------|-------|----------|
| 1 | Anya Suphan | anya@example.com | true |
| 2 | Ben Rattana | ben@example.com | true |
| 3 | Chanya Prom | chanya@example.com | true |
| 4 | Dome Wiriya | dome@example.com | true |
| 5 | Eve Inactive | eve@example.com | **false** |

---

### 4.2 Category

```prisma
model Category {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  createdAt DateTime @default(now())

  tickets   Ticket[]
}
```

**Seed Data (required, minimum 4)**
| # | Name |
|---|------|
| 1 | IT Support |
| 2 | HR Request |
| 3 | Finance |
| 4 | Facilities |

---

### 4.3 RelatedSystem

```prisma
model RelatedSystem {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  createdAt DateTime @default(now())

  tickets   Ticket[]
}
```

**Seed Data (required, minimum 6)**
| # | Name |
|---|------|
| 1 | SAP ERP |
| 2 | Microsoft 365 |
| 3 | Slack |
| 4 | Google Workspace |
| 5 | Jira |
| 6 | Confluence |

---

### 4.4 Ticket

```prisma
model Ticket {
  id              Int           @id @default(autoincrement())
  title           String
  description     String
  status          TicketStatus  @default(OPEN)
  priority        Priority      @default(MEDIUM)
  requesterId     Int
  categoryId      Int
  relatedSystemId Int?

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  requester       Requester      @relation(fields: [requesterId], references: [id])
  category        Category       @relation(fields: [categoryId], references: [id])
  relatedSystem   RelatedSystem? @relation(fields: [relatedSystemId], references: [id])
  attachments     Attachment[]
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

---

### 4.5 Attachment

```prisma
model Attachment {
  id          Int       @id @default(autoincrement())
  ticketId    Int
  filename    String
  storagePath String
  mimeType    String
  sizeBytes   Int
  deletedAt   DateTime?

  uploadedAt  DateTime  @default(now())

  ticket      Ticket    @relation(fields: [ticketId], references: [id])
}
```

> `deletedAt = null` means the attachment is active. Non-null means soft-deleted.

---

## 5. Business Rules

| # | Rule |
|---|------|
| BR-01 | Only **active** Requesters (`isActive = true`) appear on the Requester Selection screen |
| BR-02 | A Ticket must have a **Title**, **Description**, and **Category** to be submitted |
| BR-03 | Attachments are limited to **JPG, PNG, WEBP, PDF** only |
| BR-04 | Each attachment file must be **≤ 5 MB** |
| BR-05 | A Ticket may have at most **5 attachments** (counting only non-deleted ones) |
| BR-06 | Attachment deletion is **soft-delete** only — the file record is kept; `deletedAt` is set to the current timestamp |
| BR-07 | A Requester can only view **their own** tickets on My Tickets screen |
| BR-08 | Ticket Detail screen is **read-only** — no editing after submission |
| BR-09 | New tickets are created with status = `OPEN` and priority = `MEDIUM` by default |

---

## 6. Acceptance Criteria

### AC-01 Requester Selection
- [ ] Screen displays only active Requesters
- [ ] Clicking a Requester card sets them as the "current user" and redirects to My Tickets
- [ ] Selected identity is persisted across page refresh (localStorage or sessionStorage)

### AC-02 Create Ticket
- [ ] Form has: Title (required), Description (required), Category (required, dropdown), Priority (dropdown, default MEDIUM), Related System (optional, dropdown)
- [ ] Attachment zone accepts drag-and-drop and file picker
- [ ] Rejected files (wrong type or size) show a clear error message
- [ ] Cannot upload more than 5 attachments; 6th file is rejected with an error
- [ ] Successful submission redirects to the new Ticket's Detail page
- [ ] Empty required fields prevent submission and show validation messages

### AC-03 My Tickets
- [ ] Lists only tickets belonging to the currently selected Requester
- [ ] Search by title (case-insensitive, partial match)
- [ ] Filter by Status and/or Priority
- [ ] Sort by Created Date (newest/oldest) and Priority
- [ ] Pagination: 10 tickets per page
- [ ] Empty state is shown when no tickets match the filter

### AC-04 Ticket Detail
- [ ] Displays all ticket fields: Title, Description, Status, Priority, Category, Related System, Created At
- [ ] Lists all non-deleted attachments with filename, size, and download link
- [ ] Soft-deleted attachments do **not** appear
- [ ] No edit controls are present

### AC-05 Attachment Lifecycle
- [ ] Attachments can be added during Ticket creation only
- [ ] A "Remove" button on the upload preview soft-deletes the file (sets `deletedAt`)
- [ ] Removed attachments disappear from the UI immediately

### AC-06 Responsive Design
- [ ] All screens are usable on Desktop (≥ 1024px), Tablet (768–1023px), and Mobile (< 768px)
- [ ] No horizontal scroll on any breakpoint

---

## 7. Definition of Done

- [ ] All Acceptance Criteria above are met
- [ ] All automated tests pass (Unit, API, UI)
- [ ] Code has been merged to `lab2-staging` via Pull Request with review
- [ ] No lint errors
- [ ] Responsive design verified manually on at least 3 viewport sizes
- [ ] Seed data runs without errors via `npm run seed`
- [ ] `docs/lab-02/ai-use.md` is complete with 6–10 prompt examples
