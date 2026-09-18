# Lab 02 Report: TokTickIT Requester Ticketing MVP

**Student:** Aran Edlek
**Student ID:** 67070505230

---

## Answer Part 1: Git Use with Engineering Workflow

**1. Git Workflow Evidence**
*(Please insert screenshot of your commit history in the final main branch showing feature branches merged into staging and then main)*
`[INSERT SCREENSHOT HERE: github_commit_history.png]`

**2. GitHub Project & Kanban Evidence**
*(Please insert screenshot of your GitHub Project/Kanban with all Issues in Done)*
`[INSERT SCREENSHOT HERE: github_kanban_done.png]`

**3. Rendered reviewer.md**
**Author:** aran edlek — 67070505230 — GitHub: @aranedlek
**Peer reviewer:** jinjutha nannarumit — 67070505210 — GitHub: @Ponatinylibug

### Pull Requests I authored (reviewed by my partner)
| PR | Branch | Reviewer verdict |
|---|--------|------------------|
| https://github.com/aranedlek/toctickit/pull/5 | feature/1-project-foundation | Approved |
| https://github.com/aranedlek/toctickit/pull/6 | feature/2-api-endpoint | Approved |
| https://github.com/aranedlek/toctickit/pull/7 | feature/3-category-seed | Approved |
| https://github.com/aranedlek/toctickit/pull/8 | feature/4-categories-api | Approved |

Reviewer comment I received: Great job! Looks good to me.
How I responded: Thank you!

### Pull Requests I reviewed for my partner
My comment: Looks good to me! Approved.
Partner's response: Thank you!

**4. README and .gitignore content evidence**
*(Please insert screenshot showing your README and .gitignore content in the repository)*
`[INSERT SCREENSHOT HERE: github_readme_gitignore.png]`

**5. Directory Structure of repository in IDE**
*(Please insert screenshot showing your IDE file explorer)*
`[INSERT SCREENSHOT HERE: ide_directory_structure.png]`

---

## Answer Part 2: Spec DD

**docs/lab-02/specification.md**
[Link to specification.md on GitHub](https://github.com/aranedlek/toctickit/blob/main/docs/lab-02/specification.md)

*(Please insert screenshot proving specification.md existed before the main implementation PRs were completed)*
`[INSERT SCREENSHOT HERE: github_spec_history.png]`

### Rendered copy of docs/lab-02/specification.md
**1. Sprint Goal**
Deliver a working Requester MVP for the TokTickIT ticketing system. By the end of this sprint, a development requester can select their identity, submit tickets with file attachments, browse and filter their own tickets, and view individual ticket details — all through a responsive, Zen-Green themed UI.

**4. Data Models & 5. Business Rules**
- BR-01 Only active Requesters (isActive = true) appear on the Requester Selection screen
- BR-02 A Ticket must have a Title, Description, and Category to be submitted
- BR-03 Attachments are limited to JPG, PNG, WEBP, PDF only
- BR-04 Each attachment file must be ≤ 5 MB
- BR-05 A Ticket may have at most 5 attachments (counting only non-deleted ones)
- BR-06 Attachment deletion is soft-delete only
- BR-07 A Requester can only view their own tickets on My Tickets screen
- BR-08 Ticket Detail screen is read-only — no editing after submission
- BR-09 New tickets are created with status = OPEN and priority = MEDIUM by default

**6. Acceptance Criteria**
- AC-01 Requester Selection: Screen displays only active Requesters. Clicking a Requester card sets them as the "current user".
- AC-02 Create Ticket: Form has Title, Description, Category. Empty fields prevent submission. Successful submission redirects.
- AC-03 My Tickets: Lists only tickets belonging to current Requester. Search by title, filter by status.
- AC-04 Ticket Detail: Displays all fields. Lists non-deleted attachments. No edit controls.
- AC-05 Attachment Lifecycle: Remove button soft-deletes the file.

**7. Definition of Done**
- All Acceptance Criteria above are met
- All automated tests pass (Unit, API, UI)
- Code has been merged to lab2-staging via Pull Request with review
- No lint errors
- Responsive design verified manually on at least 3 viewport sizes
- Seed data runs without errors via npm run seed
- docs/lab-02/ai-use.md is complete with prompts

---

## Answer Part 3: Test DD and Traceability

**docs/lab-02/tests.md**
[Link to tests.md on GitHub](https://github.com/aranedlek/toctickit/blob/main/docs/lab-02/tests.md)

### Rendered copy of docs/lab-02/tests.md
**1. Testing Strategy Overview**
| Layer | Tool | Coverage Goal |
|-------|------|---------------|
| Unit | Vitest | Business logic: validation, filtering, formatting |
| API | Vitest + Supertest | All REST endpoints — happy path + error cases |
| UI | React Testing Library | Key screens render correctly and interact as expected |

**2. Unit Tests & 3. API Tests**
| Test ID | Method + Path | Expected Result |
|---------|--------------|-----------------|
| API-01 | GET /api/requesters | Returns all active requesters |
| API-05 | POST /api/tickets | Create valid ticket -> 201 |
| API-06 | POST /api/tickets | Missing title -> 400 |
| API-07 | POST /api/tickets | Missing description -> 400 |
| API-08 | POST /api/tickets | Missing categoryId -> 400 |
| UT-01 | Attachment Validation | Accept valid JPG -> valid: true |
| UT-05 | Attachment Validation | Reject unsupported type -> valid: false |
| UT-06 | Attachment Validation | Reject file > 5 MB -> valid: false |

*(Please insert screenshots showing complete unit, API, and UI passing test output from main terminal)*
`[INSERT SCREENSHOT HERE: terminal_test_pass_output.png]`

---

## Answer Part 4: AI Use with Reflection

**docs/lab-02/ai-use.md**
[Link to ai-use.md on GitHub](https://github.com/aranedlek/toctickit/blob/main/docs/lab-02/ai-use.md)

### Rendered docs/lab-02/ai-use.md
**LLM Used:** Antigravity / Gemini

**Summary of AI Assistance**
The AI was instrumental in completing this sprint. It helped troubleshoot database connection errors, wrote unit tests using Vitest, implemented the REST API with Supertest validation, and refactored the UI to match the Zen Green table specification.

**Prompt Log (10 Key Prompts)**
1. "ช่วยออกแบบ database schema สำหรับ Lab 02 ให้หน่อย"
2. "รัน seed ไม่ผ่าน มันฟ้องเรื่อง connection timeout"
3. "ช่วยทำหน้า My Tickets เป็นตารางแบบในรูปหน่อย"
4. "เขียน unit test สำหรับเช็คขนาดไฟล์แนบหน่อย"
5. "ทำ API สำหรับสร้าง Ticket ให้หน่อย"
6. "รัน backend test ไม่ผ่าน ติด error 500"
7. "อัปโหลดไฟล์เกิน 5 ไฟล์ไม่ได้ใช่ไหม เขียนโค้ดดักให้หน่อย"
8. "ช่วยตั้งค่า Theme สีเขียวแบบ Zen Green ให้หน่อย"
9. "ขอรายชื่อมากกว่า 10 คน และมีชื่อเรา Aran Edlek"
10. "ช่วยเมิร์จเข้าเมนหลัก Lab 02 ในกิตฮับให้หน่อย"

**My Reflection**
Using the AI coding agent accelerated development, particularly in scaffolding tests and API endpoints. However, I learned that precise specification is necessary; when requirements were vague, the AI occasionally assumed incorrect business logic (e.g., mock Prisma returns) which required explicit correction. Verifying the AI's work against the Definition of Done is critical.

---

## Answer Part 5: Development Requester Select Screen

*(Please insert screenshot of the simulated Login screen with the active-user dropdown loaded from database)*
`[INSERT SCREENSHOT HERE: webapp_requester_selector.png]`

---

## Answer Part 6: Working Ticket Screen: Create Mode

**1. Requester field populated**
*(Please insert screenshot showing the create ticket form with Aran Edlek as the active requester)*
`[INSERT SCREENSHOT HERE: webapp_create_ticket_active_user.png]`

**2. Reference data loaded**
*(Please insert screenshot of Create Ticket at desktop viewport showing Category/Priority dropdowns loaded)*
`[INSERT SCREENSHOT HERE: webapp_create_ticket_desktop.png]`

**3. Invalid submission (Validation failure)**
*(Please insert screenshot showing field-level red error messages when submitting empty form)*
`[INSERT SCREENSHOT HERE: webapp_create_ticket_validation_error.png]`

**4. Valid and Invalid attachment states**
*(Please insert screenshot showing one accepted file and one rejected file (e.g., oversized or wrong format))*
`[INSERT SCREENSHOT HERE: webapp_create_ticket_attachment_error.png]`

**5. Safe error state (API Failure)**
*(Please insert screenshot showing error toast/message when submitting while backend is stopped, preserving form values)*
`[INSERT SCREENSHOT HERE: webapp_create_ticket_api_failure.png]`

**6. Successful Submission**
*(Please insert screenshot showing successful redirect to Ticket Detail page with the generated Ticket Number)*
`[INSERT SCREENSHOT HERE: webapp_create_ticket_success.png]`

---

## Answer Part 7: Working My Tickets Screen

**1. Requester A Ticket List & Cross-Requester Check**
*(Please insert screenshot showing Aran Edlek's ticket list, and another showing an empty list when changing to a different Requester)*
`[INSERT SCREENSHOT HERE: webapp_my_tickets_requester_a_and_b.png]`

**2. Search, Filters, Sorting, Pagination**
*(Please insert screenshots demonstrating search/filter working on the My Tickets table)*
`[INSERT SCREENSHOT HERE: webapp_my_tickets_filters.png]`

**3. Empty / No Results State**
*(Please insert screenshot showing the empty state when no tickets match a filter)*
`[INSERT SCREENSHOT HERE: webapp_my_tickets_no_results.png]`

---

## Answer Part 8: Working Ticket Screen: View Mode and Attachments

**1. Owned Ticket Detail & Download**
*(Please insert screenshot of the Ticket Detail screen showing read-only metadata and downloadable active attachments)*
`[INSERT SCREENSHOT HERE: webapp_ticket_detail.png]`

**2. Soft Removal**
*(Please insert screenshot showing removal of an attachment, or the removed attachment not being rendered anymore)*
`[INSERT SCREENSHOT HERE: webapp_ticket_detail_remove_attachment.png]`

**3. Unauthorized Access**
*(Please insert screenshot showing rejection/error when directly accessing a URL of a Ticket belonging to a different Requester)*
`[INSERT SCREENSHOT HERE: webapp_ticket_detail_unauthorized.png]`

---

## Answer Part 9: Zen Green UI and Responsive Evidence

**Rendered ui-spec.md**
- **Colors:** Primary Green `#2D6A4F`, Surface `#F8FAF9`, Card `#FFFFFF`, Error `#C0392B`, Success `#27AE60`
- **Typography:** Inter 400/500/600/700
- **Buttons:** Primary, Hover states defined
- **Validation:** Red borders and messages below fields
- **Badges:** Colored background + text based on Priority/Status

**Responsive Evidence**
*(Please insert Mobile viewport screenshot - Fields stack vertically)*
`[INSERT SCREENSHOT HERE: webapp_mobile_view.png]`

*(Please insert Tablet viewport screenshot)*
`[INSERT SCREENSHOT HERE: webapp_tablet_view.png]`

*(Please insert Desktop viewport screenshot - No horizontal overflow, buttons readable, no overlapping text)*
`[INSERT SCREENSHOT HERE: webapp_desktop_view.png]`
