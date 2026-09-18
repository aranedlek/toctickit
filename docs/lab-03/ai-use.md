# AI Use Log - Lab 03

This document records the usage of AI (Antigravity / Claude) during the development of Lab 03.

## Summary of AI Assistance
The AI assisted in implementing all Lab 3 sprint features: authentication with JWT and bcrypt, role-based authorization (Requester, IT Staff, Administrator), IT Staff ticket operations (queue, detail, status updates, comments, internal notes), Administrator user management (CRUD, role assignment, activate/deactivate), and comprehensive automated testing (API, UI component, E2E with Playwright). It also helped manage the GitHub workflow (branches, commits, PRs) and resolved complex issues such as Playwright locator stability, React state re-rendering during E2E tests, and Prisma seed data alignment.

## Prompt Log

| # | Prompt (User Input) | AI Action / Result |
|---|----------------------|---------------------|
| 1 | "ทำอิชชู่3ต่อได้เลยย" (Proceed with Issue #3 — IT Staff Ticket Operations) | AI implemented `StaffTicketDetail.tsx` with status/priority update forms, ticket owner assignment, public comments, and internal notes. Created backend PATCH `/api/tickets/:id` and POST endpoints for comments/notes. |
| 2 | "ช่วยคิดดิสคริปให้หน่อย" (Help write PR description) | AI generated a detailed PR description covering IT Staff ticket operations: claim/reassign, status workflow, IT priority, public comments, and internal notes with markdown checklist. |
| 3 | "เพื่อนคอมเม้นและเมิร์จให้แล้ว ทำต่ออิชชู่ต่อไปได้เลย" (Friend merged, continue next issue) | AI pulled latest main, created `feature/lab3-issue-4-admin` branch, implemented `UserManagement.tsx` with create/edit modal, role assignment, activate/deactivate, and search/filter. Created admin API routes with business rules (BR-06 to BR-08). |
| 4 | "ตอนนี้เพื่อนเม้นและเมิร์จให้แล้ว ทำอิชชู่ต่อไปได้เลย" (Friend merged, next issue — Settings) | AI created `Settings.tsx` for Category and Related System management with CRUD operations, deletion protection for items linked to active tickets, and corresponding backend routes with tests. |
| 5 | "ช่วยเช็คกิตฮับให้หน่อย ว่าหมดยัง ถ้ายังไม่เสร็จต้องเพิ่มอิชชู่มั้ย" (Check GitHub — any missing issues?) | AI reviewed all GitHub issues (#18–#22) against the test plan and Definition of Done. Identified that automated tests and documentation issues were missing and recommended creating Issue #23 and #24. |
| 6 | "เอาให้ครบทุกเทส" (Make all tests pass) | AI implemented the full test suite: 12 API tests (auth, authorization, notes, tickets), 3 UI component tests (ChangePassword, UserManagement, TicketQueue), and 4 E2E Playwright tests (authentication, first-login, staff-ticket-flow, user-administration). Debugged Playwright locator issues (detached DOM, React strict mode re-renders) until achieving 100% pass rate. |
| 7 | "สร้างอิชชู่ให้เลย" (Create the issues) | AI prepared GitHub issue templates for Issue #23 (Automated Tests) and Issue #24 (Documentation & AI Use Log) with full descriptions and acceptance criteria. |
| 8 | "เพื่อนเมิร์จแล้วทำต่อได้เลย" (Friend merged, continue) | AI pulled latest main, created `feature/lab3-issue-7-docs` branch, and generated this `ai-use.md` documentation file. |
