# Lab 02: Software Product Increment in Lab 2
**TokTickIT Service Desk**

---

## 1. Answers to Lab Questions (Part 1-9)
*(คุณสามารถนำคำตอบจากไฟล์ answers.md มาเติมลงในส่วนนี้ได้เลยครับ)*

**Part 1:** ...
**Part 2:** ...
**Part 3:** ...
*(เติมให้ครบถึง Part 9)*

---

## 2. Web Application UI Screenshots
*(นำรูปที่คุณแคปไว้มาใส่แทนข้อความด้านล่างนี้เลยครับ)*

### 2.1 Requester Selection Screen
![Requester Selection Screen](./screenshots/requester-selection.png)
*(แทรกรูปหน้า `localhost:5173/` ที่นี่)*

### 2.2 My Tickets Screen
![My Tickets Screen](./screenshots/my-tickets.png)
*(แทรกรูปหน้า `localhost:5173/my-tickets` แบบตารางที่นี่)*

### 2.3 Create Ticket Form
![Create Ticket Screen](./screenshots/create-ticket.png)
*(แทรกรูปหน้า `localhost:5173/tickets/new` ที่นี่)*

### 2.4 Ticket Detail Screen
![Ticket Detail Screen](./screenshots/ticket-detail.png)
*(แทรกรูปหน้า รายละเอียดตั๋ว ที่นี่)*

### 2.5 Attachment Removal
![Attachment Removal](./screenshots/attachment-removal.png)
*(แทรกรูประหว่างลบไฟล์แนบ ที่นี่)*

---

## 3. GitHub Workflow Evidence (Closed Issues & PRs)

### 3.1 Closed Pull Requests
*(ภาพยืนยันการ Merge Code ลงใน Repository เรียบร้อยแล้ว)*
![Closed PRs](./screenshots/github_prs.png)

### 3.2 Closed Issues
*(ภาพยืนยันการทำ Issue 9, 10, 11, 12 ตามใบสั่งงานของอาจารย์)*
![Closed Issues](./screenshots/github_issues.png)

---

## 4. AI Use Log

The AI was instrumental in completing this sprint. It helped troubleshoot database connection errors (Prisma TCP vs HTTP issues), wrote unit tests using Vitest, implemented the REST API with Supertest validation, and refactored the UI to match the Zen Green table specification perfectly.

| # | Prompt (User Input) | AI Action / Result |
|---|----------------------|---------------------|
| 1 | "ช่วยออกแบบ database schema สำหรับ Lab 02 ให้หน่อย" | AI generated the Prisma schema with Requester, Category, RelatedSystem, Ticket, and Attachment models. |
| 2 | "รัน seed ไม่ผ่าน มันฟ้องเรื่อง connection timeout" | AI analyzed the `.env` and `prismaClient.ts`, changed the connection from HTTP to TCP, and installed `@prisma/adapter-pg`. |
| 3 | "ช่วยทำหน้า My Tickets เป็นตารางแบบในรูปหน่อย" | AI rewrote `MyTickets.tsx` from a card layout to a responsive table layout with pagination and sorting. |
| 4 | "เขียน unit test สำหรับเช็คขนาดไฟล์แนบหน่อย" | AI extracted the validation logic into `validateAttachment.ts` and wrote 4 Vitest test cases covering size and type restrictions. |
| 5 | "ทำ API สำหรับสร้าง Ticket ให้หน่อย" | AI implemented `POST /api/tickets` with status 201 and validation for required fields (Title, Description, Category). |
| 6 | "รัน backend test ไม่ผ่าน ติด error 500" | AI fixed the Vitest mock for Prisma `findUnique` so that it returns `{ isActive: true }` bypassing the validation block. |
| 7 | "อัปโหลดไฟล์เกิน 5 ไฟล์ไม่ได้ใช่ไหม เขียนโค้ดดักให้หน่อย" | AI added validation in both the frontend (CreateTicket.tsx) and backend to restrict attachments to a maximum of 5 files. |
| 8 | "ช่วยตั้งค่า Theme สีเขียวแบบ Zen Green ให้หน่อย" | AI updated `index.css` with CSS variables (`--color-primary`, `--color-card`, etc.) matching the lab's UI specification. |
| 9 | "เพื่อนเมิร์จโค้ดแล้วทำไงต่อ" | AI synchronized the branches (`git pull main`, `lab2-staging`) and advised on the final documentation steps (Issue #13). |
| 10 | "รีพอร์ตแลป 02 ที่ต้องบันทึกส่งอาจารย์เป็นพีดีเอฟต้องใส่อะไรบ้าง" | AI reviewed the lab specification and outlined the 5 required screenshots and markdown deliverables. |
