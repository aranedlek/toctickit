# Lab 04 – Peer Code Review & Engineering Workflow Record

**Course:** CPE 334 Introduction to Software Engineering in the Age of AI Agents (Semester 1/2026)  
**Project:** TokTickIT – Actions Taken, Dashboards, and Final Regression  
**Repository:** [https://github.com/aranedlek/toctickit](https://github.com/aranedlek/toctickit)  

| Role | Name | GitHub Username | Student ID |
| :--- | :--- | :--- | :--- |
| **Author (Developer)** | อรัญ อีดเหล็ก (Aran Edlek) | [`aranedlek`](https://github.com/aranedlek) | 67070505230 |
| **Peer Reviewer** | จินจุฑา นันนฤมิตร (Jinjutha Nannarumit) | [`Ponatinylilbug`](https://github.com/Ponatinylilbug) | 67070505232 |

---

## 1. Peer Review Process Overview

All code and specifications in Sprint 4 follow strict engineering discipline:
1. Feature branches branched off from `lab4-staging`.
2. Pull Requests (PRs) opened with detailed descriptions, issue traceability, and test verification evidence.
3. Peer review conducted by **จินจุฑา นันนฤมิตร (`Ponatinylilbug`)** before merging.
4. Feedback addressed and re-verified.
5. Staged integration into `lab4-staging` before final release merge into `main`.

---

## 2. Pull Request Review Log

| PR # | Title & Branch | Scope / Issue | Reviewer | Decision | Merge Commit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **#39** | `docs: create Lab 4 engineering contract specification and test plan` <br> `feature/lab4-issue-1-spec` | Issue #1 (Sprint 4 Engineering Contract) | `Ponatinylilbug` | **Approved & Merged ✅** | `42ff9e2` |
| **#--** | `feat: implement Actions Taken foundation and database` <br> `feature/lab4-issue-2-actions-foundation` | Issue #2 (Actions Taken Foundation) | `Ponatinylilbug` | Pending | |
| **#--** | `feat: implement Actions Taken UI on Ticket Detail` <br> `feature/lab4-issue-3-actions-ui` | Issue #3 (Actions Taken UI) | `Ponatinylilbug` | Pending | |
| **#--** | `feat: enforce Ticket lifecycle workflow and resolution gate` <br> `feature/lab4-issue-4-ticket-workflow` | Issue #4 (Ticket Workflow) | `Ponatinylilbug` | Pending | |
| **#--** | `feat: implement role-based dashboards` <br> `feature/lab4-issue-5-dashboards` | Issue #5 (Role Dashboards) | `Ponatinylilbug` | Pending | |
| **#--** | `chore: final regression, accessibility polish and hardening` <br> `feature/lab4-issue-6-hardening` | Issue #6 (Final Hardening) | `Ponatinylilbug` | Pending | |

---

## 3. Detailed Review Feedback & Author Responses

### PR #39: Sprint 4 Engineering Contract Specification (`feature/lab4-issue-1-spec`)
- **Reviewer Comment (`Ponatinylilbug`):**  
  *"Specification ละเอียดและครอบคลุมทั้ง Actions Taken model, Ticket state transition matrix, Resolution gate และ Dashboards ครบถ้วนตาม Handout Lab 4 แนะนำให้เตรียม seed data ที่มีทั้ง ticket ที่มี 0, 1 และหลาย actions taken ให้พร้อมสำหรับการทดสอบและทำภาพหลักฐานส่งงาน"*
- **Author Response (`aranedlek`):**  
  *"รับทราบและขอบคุณครับ ใน Issue 2 (Actions Taken Foundation) จะทำ idempotent seed ที่ครอบคลุม ticket ที่มี 0, 1 และหลาย actions taken พร้อมทั้งสถานะ ticket ครบทุกรูปแบบเพื่อรองรับ dashboard queries ครับ"*
- **Resolution:** Approved and merged into `lab4-staging` via commit `42ff9e2`.

### PR: Actions Taken Foundation and Database (`feature/lab4-issue-2-actions-foundation`)
- **Reviewer Comment (`Ponatinylilbug`):**  
  *Pending peer review of Actions Taken model, database migration, idempotent seed, REST APIs, and automated test suite.*
- **Author Response (`aranedlek`):**  
  *Implemented ActionTaken model with foreign keys to Ticket and User performer, added version field for OCC, wrote idempotent seed covering 0, 1, and multiple actions taken, created GET/POST/PATCH endpoints with strict BR-03, BR-04, BR-05, BR-06 validation, and verified 100% pass across 43 automated tests.*
- **Resolution:** Under review.

