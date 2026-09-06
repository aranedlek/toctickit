# AI Use Log - Lab 02

This document records the usage of AI (Antigravity/Gemini) during the development of Lab 02.

## Summary of AI Assistance
The AI was instrumental in completing this sprint. It helped troubleshoot database connection errors (Prisma TCP vs HTTP issues), wrote unit tests using Vitest, implemented the REST API with Supertest validation, and refactored the UI to match the Zen Green table specification perfectly.

## Prompt Log

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
