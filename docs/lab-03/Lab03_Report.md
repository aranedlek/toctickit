# Lab 03 Report: Authentication, Authorization & Role-Based Operations
## TokTickIT IT Service Desk

| รายการ | รายละเอียด |
|--------|-----------| 
| **ชื่อ-นามสกุล** | Aran Edlek |
| **รหัสนักศึกษา** | 67070505230 |
| **วิชา** | Software Engineering Practice |
| **Lab** | Lab 03 – Authentication & Role-Based Sprint |
| **Repository** | https://github.com/aranedlek/toctickit |

---

## 1. Sprint Goal

Deliver **authentication, authorization, and role-based operations** for TokTickIT. By the end of this sprint:
- Users สามารถ login/logout ด้วย email + password ได้
- First-login ต้องเปลี่ยนรหัสผ่านก่อนเข้าระบบ
- Requester ใช้ ticket functions เดิมภายใต้ authenticated identity
- IT Staff สามารถจัดการ Ticket Queue, เปลี่ยนสถานะ, เพิ่ม Public Comments และ Internal Notes
- Administrator สามารถจัดการ User (CRUD, role assignment, activate/deactivate)

---

## 2. Sprint Scope

### In Scope
- Authentication (login, logout, JWT cookies, password change)
- Role-based navigation and authorization (Requester, IT Staff, Administrator)
- IT Staff Ticket Queue with search, filter, sort, pagination
- IT Staff Ticket Detail with status update, IT Priority, ownership, comments, notes
- Administrator User Management (list, create, edit, role, activate/deactivate)
- Category & Related System management (Settings page)
- Comprehensive automated tests (API, UI component, E2E)

### Out of Scope
- Email invitations, password-reset email, MFA, social login, SSO
- Self-registration
- Dashboards, SLA, escalation rules
- Multi-tenant organizations

---

## 3. Data Models

### 3.1 Database Schema Changes (Prisma)

**User** (replaces Requester)
```prisma
model User {
  id                     Int       @id @default(autoincrement())
  name                   String
  email                  String    @unique
  passwordHash           String
  role                   Role      @default(REQUESTER)
  isActive               Boolean   @default(true)
  requiresPasswordChange Boolean   @default(true)
  createdAt              DateTime  @default(now())
  updatedAt              DateTime  @updatedAt
}

enum Role { REQUESTER IT_STAFF ADMINISTRATOR }
```

**PublicComment & InternalNote**
```prisma
model PublicComment {
  id        Int      @id @default(autoincrement())
  content   String
  ticketId  Int
  authorId  Int
  createdAt DateTime @default(now())
}

model InternalNote {
  id        Int      @id @default(autoincrement())
  content   String
  ticketId  Int
  authorId  Int
  createdAt DateTime @default(now())
}
```

**Ticket Updates**
- Added `ticketOwnerId` (nullable FK to User)
- Added `itPriority` enum (LOW, MEDIUM, HIGH, URGENT)
- Extended `TicketStatus` enum (NEW, OPEN, IN_PROGRESS, WAITING_FOR_REQUESTER, RESOLVED, CLOSED, REOPENED, CANCELLED)

### 3.2 Seed Data

| Type | Count | Details |
|------|-------|---------|
| Requesters (Active) | 4 | Aran, Anya, Ben, Chanya |
| Requesters (Inactive) | 1 | Eve |
| IT Staff (Active) | 3 | IT Staff One, Two, Three |
| IT Staff (Inactive) | 1 | IT Staff Inactive |
| Administrator | 1 | Admin User |
| Categories | 4 | IT Support, HR Request, Finance, Facilities |
| Related Systems | 6 | SAP ERP, Microsoft 365, Slack, Google Workspace, Jira, Confluence |

All users seeded with password: `Password123!` and `requiresPasswordChange: false`

---

## 4. Business Rules

| ID | Rule |
|----|------|
| BR-01 | Only active users with valid credentials may authenticate |
| BR-02 | Users with `requiresPasswordChange=true` must change password before accessing the app |
| BR-03 | Authenticated user identity determines ownership of Requester operations |
| BR-04 | Public Comments visible to all; Internal Notes visible only to IT Staff/Admin |
| BR-05 | Requester may indicate problem appears resolved but cannot formally close |
| BR-06 | Duplicate email addresses are not permitted |
| BR-07 | Administrator cannot deactivate their own account |
| BR-08 | System prevents removal/deactivation of last active Administrator |
| BR-09 | Each Ticket may have one Ticket Owner or be unassigned |
| BR-10 | IT Priority initially copies Requested Priority; only IT Staff/Admin can change |
| BR-11 | Ticket statuses limited to defined enum values |
| BR-12 | Comments and Notes are append-only; empty content rejected |

---

## 5. REST API Endpoints

### Authentication
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Login with email + password |
| POST | `/api/auth/logout` | Logout (clear cookie) |
| GET | `/api/auth/me` | Get current authenticated user |
| POST | `/api/auth/change-password` | Change password |

### Tickets (IT Staff / Admin)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tickets` | Ticket Queue with search, filter, sort, pagination |
| GET | `/api/tickets/:id` | Get ticket detail with comments/notes |
| PATCH | `/api/tickets/:id` | Update status, IT Priority, ownership |
| PATCH | `/api/tickets/:id/resolve` | Requester marks as resolved |

### Comments & Notes
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/tickets/:id/public-comments` | Add public comment |
| POST | `/api/tickets/:id/internal-notes` | Add internal note (IT Staff/Admin only) |

### User Management (Admin)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users` | List all users |
| POST | `/api/users` | Create new user |
| PATCH | `/api/users/:id` | Update user info/role |
| PATCH | `/api/users/:id/set-password` | Set new initial password |

### Settings (IT Staff / Admin)
| Method | Path | Description |
|--------|------|-------------|
| GET/POST/PATCH/DELETE | `/api/categories` | Category CRUD |
| GET/POST/PATCH/DELETE | `/api/related-systems` | Related System CRUD |

---

## 6. GitHub Workflow Evidence

### 6.1 Pull Requests (Merged)

*(Insert screenshot of merged PRs)*

| PR | Branch | Description |
|----|--------|-------------|
| PR #19 | `feature/lab3-issue-1-auth` | Authentication foundation (login, logout, JWT, password change) |
| PR #20 | `feature/lab3-issue-2-queue` | IT Staff Ticket Queue |
| PR #21 | `feature/lab3-issue-3-itstaff` | IT Staff Ticket operations (detail, comments, notes) |
| PR #22 | `feature/lab3-issue-4-admin` | Administrator user management |
| PR #23 | `feature/lab3-issue-5-settings` | Category & Related System settings |
| PR #24 | `feature/lab3-issue-6-tests` | Automated tests (API, UI component, E2E) |
| PR #25 | `feature/lab3-issue-7-docs` | Documentation & AI Use Log |

### 6.2 Issues (Closed)

*(Insert screenshot of closed issues)*

- **Issue #18** – Sprint 3 engineering contract (umbrella)
- **Issue #19** – Authentication foundation
- **Issue #20** – IT Staff Ticket Queue
- **Issue #21** – IT Staff Ticket operations
- **Issue #22** – Administrator user management
- **Issue #23** – Automated Tests (Unit, API, UI Component, E2E)
- **Issue #24** – Documentation & AI Use Log

---

## 7. Test Plan Summary

### 7.1 Backend API Tests (Vitest + Supertest)

| Test ID | Description | Status |
|---------|-------------|--------|
| API-01 | Valid login returns authenticated response | ✅ Pass |
| API-02 | Invalid credentials return 401 | ✅ Pass |
| API-03 | Inactive account login returns 401 | ✅ Pass |
| API-04 | Access with requiresPasswordChange=true returns 403 | ✅ Pass |
| API-05 | Requester with fake requesterId gets own tickets | ✅ Pass |
| API-06 | Requester accessing IT Staff Queue gets 403 | ✅ Pass |
| API-07 | Admin creating user with duplicate email gets 400 | ✅ Pass |
| API-08 | Requester accessing Internal Notes gets 403 | ✅ Pass |
| API-09 | Admin deactivating own account gets 400 | ✅ Pass |
| API-10 | Removing last active Administrator gets 400 | ✅ Pass |
| API-11 | Requester marks ticket as resolved returns 200 | ✅ Pass |
| API-12 | Requester attempting to close ticket gets 403 | ✅ Pass |

### 7.2 Frontend UI Component Tests (Vitest + Testing Library)

| Test ID | Description | Status |
|---------|-------------|--------|
| UI-01 | Change Password Form validation | ✅ Pass |
| UI-02 | Admin User Management Search | ✅ Pass |
| UI-03 | IT Staff Queue sorting/pagination | ✅ Pass |

### 7.3 End-to-End Tests (Playwright)

| Test ID | Description | Status |
|---------|-------------|--------|
| E2E-01 | Full login and logout flow | ✅ Pass |
| E2E-02 | Initial password login and forced change | ✅ Pass |
| E2E-03 | IT Staff ticket workflow | ✅ Pass |
| E2E-04 | Admin user management flow | ✅ Pass |

---

## 8. Definition of Done Checklist

| รายการ | สถานะ |
|--------|-------|
| Acceptance Criteria ทุกข้อผ่าน (AC-01 to AC-07) | ✅ Done |
| Automated tests ผ่านทั้งหมด (API + UI + E2E) | ✅ Done |
| Code merge เข้า main ผ่าน Pull Request | ✅ Done |
| No lint errors | ✅ Done |
| Responsive design (Desktop / Tablet / Mobile) | ✅ Done |
| Seed data รันได้ไม่มี error | ✅ Done |
| docs/lab-03/ai-use.md สมบูรณ์ | ✅ Done |

---

## 9. AI Use Log

ดูรายละเอียดที่ [`docs/lab-03/ai-use.md`](./ai-use.md)

---

## 10. สรุปงานที่ทำใน Sprint นี้

Sprint นี้สำเร็จตามเป้าหมายทุกประการ:

1. **Authentication** — JWT cookie-based auth, bcrypt password hashing, first-login forced password change
2. **Authorization** — Role-based access control (Requester, IT Staff, Administrator) ทั้ง frontend และ backend
3. **IT Staff Operations** — Ticket Queue with search/filter/sort/pagination, Ticket Detail with status/priority/ownership updates, Public Comments, Internal Notes
4. **Admin User Management** — User CRUD, role assignment, activate/deactivate, set initial password
5. **Settings** — Category & Related System management with deletion protection
6. **Testing** — API tests 12 กรณี + UI component tests 3 กรณี + E2E tests 4 กรณี ผ่านทั้งหมด
7. **GitHub Workflow** — 7 feature branches, 7 Pull Requests, Issues #18-24 ปิดครบ, merge เข้า main เรียบร้อย

---

*Report generated: September 2026*
*Student: Aran Edlek | ID: 67070505230*
