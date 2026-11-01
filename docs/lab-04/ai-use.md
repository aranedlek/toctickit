# AI Use Log - Lab 04

This document records the usage of AI during the development of Lab 04 (TokTickIT Actions Taken, Dashboards, and Final Regression).

## 1. AI Agents and Models Used
- **Specification Agent:** Antigravity / Gemini 3.8 Flash (High)
- **Coding & Implementation Agent:** Antigravity / Gemini 3.8 Flash (High)

---

## 2. Selected Prompts & AI Actions Log

| # | Prompt (User Input) | AI Action / Result |
|---|----------------------|---------------------|
| 1 | "ช่วยอ่านไฟล์ lab04 ว่าต้องทำอะไรบ้างมีกี่อิชชู่" (Help read lab04 handout, summarize tasks and number of issues) | AI analyzed the 11-page Lab 4 specification handout, extracted key requirements (Actions Taken, Ticket lifecycle, Role Dashboards, Database increment, Regression), identified the 6 core GitHub Issues, and mapped the 9 submission report parts (60 points). |
| 2 | "ช่วยเชื่อมเข้ากิตฮับให้หน่อย" (Help connect to GitHub) | AI checked git status and remote `origin`, validated git authentication and push access, and verified that local repository is connected to `https://github.com/aranedlek/toctickit.git`. |
| 3 | "เริ่มทำอิชชู่1ได้เลย" (Start Issue 1 right away) | AI committed remaining Lab 3 report artifacts, checked out `main`, created and pushed base branch `lab4-staging`, created and pushed feature branch `feature/lab4-issue-1-spec`, and authored the complete engineering contract in `docs/lab-04/` (`specification.md`, `ui-spec.md`, `api-spec.md`, `tests.md`, `reviewer.md`, `ai-use.md`). |
| 4 | "เพื่อนเมิจแล้ว ทำอิชชู่2ได้เลย" (Friend merged, proceed with Issue 2 — Actions Taken Foundation) | AI pulled merged PR #39 into `lab4-staging`, created branch `feature/lab4-issue-2-actions-foundation`, updated Prisma schema with `ActionTaken` model and `version` field, executed migration and seed script with 0, 1, and multi-action scenarios, implemented REST endpoints (`GET/POST/PATCH /api/tickets/:id/actions`), and built comprehensive automated tests in `actionsTaken.test.ts` (100% pass rate across 43 tests). |
| 5 | "เริ่มทำอิชชู่3ได้เลย" (Start Issue 3 right away — Actions Taken UI) | AI created branch `feature/lab4-issue-3-actions-ui` from updated `lab4-staging`, updated TypeScript types with `ActionTaken`, created `ActionsTakenSection` component with Zen Green design system tokens, integrated into `StaffTicketDetail` (manageable) and `TicketDetail` (Requester read-only), created accessible modal dialog with validation for BR-03 and BR-04, wrote 5 component tests in `ActionsTaken.test.tsx` (100% pass), and verified production build with zero errors. |
| 6 | "ทำอิชชู่ 4 ต่อได้เลยย" (Proceed with Issue 4 — Ticket Workflow & Resolution Gate) | AI created branch `feature/lab4-issue-4-ticket-workflow`, implemented backend status transition route (`PATCH /api/tickets/:id/status`) with BR-08 transition matrix and BR-10 optimistic concurrency version validation, added advisory resolution route (`POST /api/tickets/:id/resolve-advisory`) enforcing BR-09 resolution gate, enhanced `StaffTicketDetail` to dynamically filter permitted next statuses and render accessible HTTP 409 conflict notifications (UI-06) with ticket refresh capability, updated `TicketDetail` with advisory resolution flow, and authored 13 backend and 7 frontend tests passing 100%. |

---

## 3. My Reflection on Specification and Coding Agent Use

Working with the AI Specification Agent allowed our team to methodically transform stakeholder requests into a formal engineering contract before writing any implementation code (Spec-Driven Development). The agent identified subtle domain requirements—such as ensuring that a Requester indicating resolution remains strictly advisory, requiring mandatory follow-up notes when `followUpRequired` is checked, and implementing optimistic concurrency versioning on Tickets—saving our team significant debugging and refactoring time later in the sprint.
