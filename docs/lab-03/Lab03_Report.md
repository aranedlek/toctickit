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

## Answer Part 1: Git Use with Engineering Workflow (10 Points)
- **Commit History:** Feature branches (`feature/lab3-issue-1-auth` ถึง `feature/lab3-issue-7-docs`) ได้ถูกสร้างและ merge เข้า `main` เรียบร้อยแล้ว
- **GitHub Project/Kanban:** 
  *(Insert screenshot of final GitHub Project/Kanban showing all Lab 3 issues in Done)*
- **Pull Requests / Reviewer:** 
  *(Insert screenshot of closed PRs and approvals)*
  - ดูรายละเอียดผู้รีวิวใน `docs/lab-03/reviewer.md` (ถ้ามี) หรืออ้างอิงจาก GitHub PRs

## Answer Part 2: Spec DD (5 Points)
- **Specification Document:** [docs/lab-03/specification.md](./specification.md)
- เอกสารนี้ประกอบไปด้วย Requirements, Business Rules (BR-01 ถึง BR-12), การเปลี่ยนแปลง Database, และ Acceptance Criteria ทั้งหมด ซึ่งถูกสร้างและได้รับอนุมัติก่อนเริ่มการพัฒนาโค้ด

## Answer Part 3: Test DD and Traceability (10 Points)
- **Test Plan Document:** [docs/lab-03/tests.md](./tests.md)
- **Test Results:** การรันเทสทั้งหมด 19 กรณี (API, UI, E2E) ผ่าน 100% ครอบคลุม Authorization, Regression และ E2E Flow
  *(Insert screenshot of passing test output from `npm run test` and `npx playwright test`)*

## Answer Part 4: AI Use with Reflection (5 Points)
- **AI Log:** [docs/lab-03/ai-use.md](./ai-use.md)
- **LLM Used:** Antigravity / Claude / Gemini
- **My Reflection:** 
  *(เขียน Reflection สั้นๆ ของคุณเกี่ยวกับการใช้ AI ใน Sprint นี้ เช่น "การใช้ AI ช่วยให้การเขียน E2E Test ด้วย Playwright รวดเร็วขึ้นมาก และช่วยวางโครงสร้างระบบ Role-based authorization ได้อย่างปลอดภัย แต่ก็ต้องคอยตรวจสอบ Locator ในฝั่ง Frontend เพื่อไม่ให้ Test พังเมื่อมีการรีเรนเดอร์")*

## Answer Part 5: Working Login and Password Change UI (5 Points)
- ระบบล็อกอินสามารถตรวจสอบอีเมล/รหัสผ่าน และบล็อกบัญชีที่ `isActive=false` ได้
- มีระบบบังคับให้ผู้ใช้เปลี่ยนรหัสผ่านเมื่อ `requiresPasswordChange=true` ในการล็อกอินครั้งแรก
  *(Insert screenshot of Login screen and Change Password screen showing validation)*

## Answer Part 6: Working IT Staff Ticket Queue UI (5 Points)
- แสดงข้อมูล Ticket Queue จริง พร้อมสถานะและ Priority Badges
- มีระบบ Search, Filter, Sorting และ Pagination ที่ทำงานร่วมกับ Backend API
  *(Insert screenshot of IT Staff Ticket Queue)*

## Answer Part 7: Working IT Staff Ticket Detail UI (10 Points)
- สามารถ Claim (เปลี่ยน Ticket Owner) และตั้งค่า IT Priority ได้
- สามารถเปลี่ยนสถานะตั๋ว (Ticket Status)
- สามารถเพิ่ม Public Comments (ทุกคนเห็น) และ Internal Notes (เฉพาะ IT Staff / Admin เห็น)
  *(Insert screenshot of IT Staff Ticket Detail showing comments and notes)*

## Answer Part 8: Working Administrator User Management UI (5 Points)
- แสดงรายชื่อผู้ใช้งานทั้งหมด พร้อมช่องค้นหาและ Filter ตาม Role
- สามารถเพิ่มผู้ใช้ใหม่ (ตรวจสอบ Email ซ้ำ) แก้ไขข้อมูล เปลี่ยน Role และระงับบัญชีได้ (ป้องกันการระงับตัวเอง)
  *(Insert screenshot of Admin User Management screen and Create/Edit User modal)*

## Answer Part 9: Zen Green UI and Responsive Evidence (5 Points)
- **UI Spec:** [docs/lab-03/ui-spec.md](./ui-spec.md)
- การออกแบบทั้งหมดใช้ธีม Zen Green และรองรับการแสดงผลทั้ง Desktop, Tablet และ Mobile
  *(Insert screenshots showing responsive behavior on Mobile/Tablet for major screens)*

---
*Report generated: September 2026*
*Student: Aran Edlek | ID: 67070505230*
