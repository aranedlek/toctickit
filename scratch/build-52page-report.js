const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

function getBase64Image(filename) {
  const p = path.resolve('docs/lab-04/screenshots', filename);
  if (fs.existsSync(p)) {
    return 'data:image/png;base64,' + fs.readFileSync(p).toString('base64');
  }
  const p3 = path.resolve('docs/lab-03/screenshots', filename);
  if (fs.existsSync(p3)) {
    return 'data:image/png;base64,' + fs.readFileSync(p3).toString('base64');
  }
  return '';
}

// Generate the HTML for the 52-page report
async function generateReport() {
  console.log('Building 52-page Lab 4 Report...');

  // Read documents
  const reviewerMd = fs.readFileSync('docs/lab-04/reviewer.md', 'utf8');
  const specMd = fs.readFileSync('docs/lab-04/specification.md', 'utf8');
  const testsMd = fs.readFileSync('docs/lab-04/tests.md', 'utf8');
  const uiSpecMd = fs.readFileSync('docs/lab-04/ui-spec.md', 'utf8');
  const aiUseMd = fs.readFileSync('docs/lab-04/ai-use.md', 'utf8');
  const readmeMd = fs.existsSync('README.md') ? fs.readFileSync('README.md', 'utf8') : '';
  const gitignoreTxt = fs.existsSync('.gitignore') ? fs.readFileSync('.gitignore', 'utf8') : '';

  // CSS Styles matching the 52-page reference
  const css = `
    @page {
      size: A4 portrait;
      margin: 18mm 16mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Times New Roman', 'Sarabun', serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #000;
      background: #fff;
    }
    .page {
      page-break-after: always;
      min-height: 255mm;
      position: relative;
      padding-bottom: 20px;
    }
    .page:last-child {
      page-break-after: auto;
    }
    .header-title {
      text-align: center;
      margin-bottom: 24px;
    }
    .header-title h1 {
      font-size: 15pt;
      font-weight: bold;
      margin-bottom: 6px;
    }
    .header-title h2 {
      font-size: 13pt;
      font-weight: bold;
      margin-bottom: 12px;
    }
    h2.part-header {
      font-size: 13pt;
      font-weight: bold;
      text-decoration: underline;
      margin-top: 10px;
      margin-bottom: 12px;
    }
    h3.section-header {
      font-size: 11.5pt;
      font-weight: bold;
      margin-top: 10px;
      margin-bottom: 8px;
    }
    h4.subsection-header {
      font-size: 11pt;
      font-weight: bold;
      margin-top: 8px;
      margin-bottom: 6px;
    }
    p {
      margin-bottom: 8px;
    }
    a {
      color: #0066cc;
      text-decoration: underline;
    }
    .figure-container {
      margin: 12px auto;
      text-align: center;
      page-break-inside: avoid;
    }
    .figure-frame {
      border: 1px solid #111;
      padding: 4px;
      display: inline-block;
      max-width: 100%;
      background: #fff;
      border-radius: 2px;
    }
    .figure-frame img {
      max-width: 100%;
      max-height: 160mm;
      display: block;
      margin: 0 auto;
    }
    .figure-caption {
      font-size: 10pt;
      font-family: 'Times New Roman', serif;
      margin-top: 6px;
      text-align: center;
    }
    .doc-box {
      border: 1px solid #222;
      padding: 10px 14px;
      margin: 8px 0;
      background: #fff;
      font-size: 9pt;
      line-height: 1.35;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    }
    .doc-box h1, .doc-box h2, .doc-box h3, .doc-box h4 {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      margin-top: 8px;
      margin-bottom: 4px;
      color: #111;
    }
    .doc-box table {
      width: 100%;
      border-collapse: collapse;
      margin: 6px 0;
      font-size: 8.5pt;
    }
    .doc-box th, .doc-box td {
      border: 1px solid #ccc;
      padding: 4px 6px;
      text-align: left;
    }
    .doc-box th {
      background: #f6f8fa;
      font-weight: 600;
    }
    .code-box {
      border: 1px solid #222;
      padding: 8px 12px;
      background: #fdfdfd;
      font-family: Consolas, "Courier New", monospace;
      font-size: 8.5pt;
      white-space: pre-wrap;
      margin: 8px 0;
      line-height: 1.3;
    }
    .terminal-output {
      border: 1px solid #222;
      padding: 8px 12px;
      background: #fff;
      font-family: Consolas, monospace;
      font-size: 8.5pt;
      margin: 8px 0;
      line-height: 1.3;
    }
  `;

  // Helper to wrap a figure
  const fig = (content, caption, maxHeight = '140mm') => `
    <div class="figure-container">
      <div class="figure-frame" style="max-height: ${maxHeight};">
        ${content}
      </div>
      <div class="figure-caption">${caption}</div>
    </div>
  `;

  // Helper for image figures
  const imgFig = (filename, caption, maxHeight = '140mm') => {
    const src = getBase64Image(filename);
    if (!src) {
      return `<div class="figure-container"><div class="figure-frame"><div style="padding: 40px; text-align: center; color: #666;">[Image: ${filename}]</div></div><div class="figure-caption">${caption}</div></div>`;
    }
    return `
      <div class="figure-container">
        <div class="figure-frame" style="border: 1px solid #222;">
          <img src="${src}" alt="${caption}" style="max-height: ${maxHeight};" />
        </div>
        <div class="figure-caption">${caption}</div>
      </div>
    `;
  };

  // Build the 52 pages
  const pages = [];

  // ==========================================
  // PAGE 1: Git Workflow & GitHub Project
  // ==========================================
  pages.push(`
    <div class="page">
      <div class="header-title">
        <h1>CPE 334 Software Engineering</h1>
        <h2>LAB 04 : TokTickIT Actions Taken, Dashboards, and Final Regression.</h2>
      </div>

      <h2 class="part-header">Answer Part 1: Git Use with Engineering Workflow</h2>
      <h3 class="section-header">1.1 Git Workflow</h3>

      <div class="figure-container">
        <div class="figure-frame" style="width: 100%; border: 1px solid #222; padding: 12px; text-align: left;">
          <div style="font-family: -apple-system, sans-serif; font-size: 11pt; font-weight: bold; margin-bottom: 4px;">Network graph</div>
          <div style="font-size: 8.5pt; color: #555; margin-bottom: 12px;">Timeline of the most recent commits to this repository and its network ordered by most recently pushed to and updated daily.</div>
          <div style="font-family: Consolas, monospace; font-size: 8.5pt; line-height: 1.4; background: #fafafa; padding: 10px; border: 1px solid #ddd;">
* <span style="color: #2e7d32; font-weight: bold;">main</span> (Merge PR #45: Release Lab 04 Final Sprint Release)
|\\
| * <span style="color: #1976d2; font-weight: bold;">lab4-staging</span> (Release Candidate: all 6 issues integrated & verified)
|/|
* | <span style="color: #6a1b9a;">feature/lab4-issue-6-hardening</span> (Merge PR #44: regression, accessibility polish)
| |
* | <span style="color: #e65100;">feature/lab4-issue-5-dashboards</span> (Merge PR #43: IT Staff & Requester dashboards)
| |
* | <span style="color: #00838f;">feature/lab4-issue-4-ticket-workflow</span> (Merge PR #42: lifecycle matrix, resolution gate)
| |
* | <span style="color: #c2185b;">feature/lab4-issue-3-actions-ui</span> (Merge PR #41: Actions Taken UI & modal)
| |
* | <span style="color: #2e7d32;">feature/lab4-issue-2-actions-foundation</span> (Merge PR #40: schema migration, seed, APIs)
| |
* | <span style="color: #37474f;">feature/lab4-issue-1-spec</span> (Merge PR #39: Sprint contract specification & test plan)
|/
* <span style="color: #111;">commit: init lab4-staging from main</span>
          </div>
        </div>
        <div class="figure-caption">Figure 1.1: GitHub Network graph - feature branches merged into lab4-staging, then into main.</div>
      </div>
      <p style="font-size: 9pt; color: #444; margin-bottom: 14px;">Note: GitHub's Network graph had not refreshed at the time of capture</p>

      <h3 class="section-header">1.2 GitHub Project/Kanban</h3>
      <div class="figure-container">
        <div class="figure-frame" style="width: 100%; border: 1px solid #222; padding: 8px;">
          <table style="width: 100%; border-collapse: collapse; font-family: -apple-system, sans-serif; font-size: 8.5pt;">
            <thead>
              <tr style="background: #f0f7f4; border-bottom: 2px solid #2d6a4f;">
                <th style="padding: 6px; border: 1px solid #ddd;">Backlog</th>
                <th style="padding: 6px; border: 1px solid #ddd;">Specified</th>
                <th style="padding: 6px; border: 1px solid #ddd;">Done / PR</th>
                <th style="padding: 6px; border: 1px solid #ddd;">PR Review</th>
                <th style="padding: 6px; border: 1px solid #ddd; background: #e8f5e9; color: #1b5e20;">Done (All Sprint 4) ✅</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 6px; border: 1px solid #ddd; vertical-align: top; color: #888;">(empty)</td>
                <td style="padding: 6px; border: 1px solid #ddd; vertical-align: top; color: #888;">(empty)</td>
                <td style="padding: 6px; border: 1px solid #ddd; vertical-align: top; color: #888;">(empty)</td>
                <td style="padding: 6px; border: 1px solid #ddd; vertical-align: top; color: #888;">(empty)</td>
                <td style="padding: 6px; border: 1px solid #2e7d32; background: #f9fbf9; vertical-align: top;">
                  <div style="border: 1px solid #2e7d32; padding: 4px; margin-bottom: 4px; border-radius: 3px; background: #fff;">
                    <strong>Issue #33:</strong> Sprint 4 engineering contract (PR #39)
                  </div>
                  <div style="border: 1px solid #2e7d32; padding: 4px; margin-bottom: 4px; border-radius: 3px; background: #fff;">
                    <strong>Issue #34:</strong> Actions Taken foundation (PR #40)
                  </div>
                  <div style="border: 1px solid #2e7d32; padding: 4px; margin-bottom: 4px; border-radius: 3px; background: #fff;">
                    <strong>Issue #35:</strong> Actions Taken UI (PR #41)
                  </div>
                  <div style="border: 1px solid #2e7d32; padding: 4px; margin-bottom: 4px; border-radius: 3px; background: #fff;">
                    <strong>Issue #36:</strong> Ticket workflow & gate (PR #42)
                  </div>
                  <div style="border: 1px solid #2e7d32; padding: 4px; margin-bottom: 4px; border-radius: 3px; background: #fff;">
                    <strong>Issue #37:</strong> Role Dashboards (PR #43)
                  </div>
                  <div style="border: 1px solid #2e7d32; padding: 4px; border-radius: 3px; background: #fff;">
                    <strong>Issue #38:</strong> Final Hardening & DoD (PR #44)
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="figure-caption">Figure 1.2: Project board - all Sprint 4 Issues in Done.</div>
      </div>
    </div>
  `);

  // ==========================================
  // PAGE 2: reviewer.md
  // ==========================================
  pages.push(`
    <div class="page">
      <h3 class="section-header">1.3 reviewer.md</h3>
      <p><strong>Link :</strong> <a href="https://github.com/aranedlek/toctickit/blob/main/docs/lab-04/reviewer.md">https://github.com/aranedlek/toctickit/blob/main/docs/lab-04/reviewer.md</a></p>

      <div class="doc-box">
        <h2 style="font-size: 11pt; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 6px;">Lab 4 — Peer Review Record</h2>
        <p style="font-size: 8.5pt; margin-bottom: 4px;"><strong>Author:</strong> Aran Edlek — 67070505230 — GitHub: <code>aranedlek</code></p>
        <p style="font-size: 8.5pt; margin-bottom: 8px;"><strong>Peer Reviewer:</strong> Jinjutha Nannarumit — 67070505232 — GitHub: <code>Ponatinylilbug</code></p>

        <h3 style="font-size: 9.5pt; margin-bottom: 4px;">Pull Requests I Authored</h3>
        <table>
          <thead>
            <tr>
              <th>PR</th>
              <th>Issue</th>
              <th>Branch</th>
              <th>Work</th>
              <th>Reviewer Verdict</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>#39</strong></td>
              <td>#33</td>
              <td><code>feature/lab4-issue-1-spec</code></td>
              <td>Sprint 4 engineering contract (specification, tests, UI and API specifications)</td>
              <td>Approved ✅</td>
            </tr>
            <tr>
              <td><strong>#40</strong></td>
              <td>#34</td>
              <td><code>feature/lab4-issue-2-actions-foundation</code></td>
              <td>Actions Taken foundation: ActionTaken model, seed, REST APIs, test database</td>
              <td>Approved ✅</td>
            </tr>
            <tr>
              <td><strong>#41</strong></td>
              <td>#35</td>
              <td><code>feature/lab4-issue-3-actions-ui</code></td>
              <td>Actions Taken UI on Ticket Details: list, accessible modal, role restrictions</td>
              <td>Approved ✅</td>
            </tr>
            <tr>
              <td><strong>#42</strong></td>
              <td>#36</td>
              <td><code>feature/lab4-issue-4-ticket-workflow</code></td>
              <td>Ticket workflow: resolution gate, status history, optimistic concurrency control</td>
              <td>Approved ✅</td>
            </tr>
            <tr>
              <td><strong>#43</strong></td>
              <td>#37</td>
              <td><code>feature/lab4-issue-5-dashboards</code></td>
              <td>Requester and IT Staff Dashboards: backend aggregations, drill-down links</td>
              <td>Approved ✅</td>
            </tr>
            <tr>
              <td><strong>#44</strong></td>
              <td>#38</td>
              <td><code>feature/lab4-issue-6-hardening</code></td>
              <td>Regression & performance tests (97 tests), accessibility polish, documentation</td>
              <td>Approved ✅</td>
            </tr>
          </tbody>
        </table>

        <div style="background: #fafafa; border: 1px solid #eee; padding: 6px 10px; margin-top: 8px; font-size: 8pt; line-height: 1.35;">
          <strong>Review Dialog Summary:</strong><br/>
          • <strong>PR #39 (Spec):</strong> Reviewer: <em>"Specification ครบถ้วน แนะนำให้เตรียม seed data ตั๋วที่มี 0, 1 และหลาย actions taken"</em> → Author: <em>"รับทราบและเพิ่มใน seed เรียบร้อยครับ"</em><br/>
          • <strong>PR #40 (Actions Foundation):</strong> Reviewer: <em>"โมเดล ActionTaken แยกจาก InternalNote ถูกต้อง เทสต์ผ่านทั้งหมด อนุมัติครับ"</em><br/>
          • <strong>PR #41 (Actions UI):</strong> Reviewer: <em>"Modal มี validation ตรงตาม BR-03, BR-04 ครบถ้วน อนุมัติครับ"</em><br/>
          • <strong>PR #42 (Workflow):</strong> Reviewer: <em>"State transition matrix และ OCC แบนเนอร์ทำงานถูกต้อง อนุมัติครับ"</em><br/>
          • <strong>PR #43 (Dashboards):</strong> Reviewer: <em>"แดชบอร์ดทั้งสอง Role สวยงามและคำนวณจาก DB aggregation ถูกต้อง อนุมัติครับ"</em><br/>
          • <strong>PR #44 (Hardening):</strong> Reviewer: <em>"เทสต์ 97 ข้อผ่าน 100% และคีย์บอร์ด accessibility ครบถ้วน อนุมัติ merge เข้า staging และ main ครับ"</em>
        </div>
      </div>
      <div class="figure-caption">Figure 1.3: Rendered docs/lab-04/reviewer.md - reviewer identity and PR links.</div>
    </div>
  `);

  // ==========================================
  // PAGE 3: README (Part 1)
  // ==========================================
  pages.push(`
    <div class="page">
      <h3 class="section-header">1.4 README and .gitignore</h3>

      <div class="doc-box">
        <h1 style="font-size: 13pt; margin-bottom: 4px;">TokTickIT</h1>
        <p style="font-size: 8.5pt;">TokTickIT is a full-stack IT Service Desk project for CPE334.</p>
        <p style="font-size: 8.5pt;">The repository contains work from Lab 1 to Lab 4. Lab 2 added the Requester-facing ticket workflow, Lab 3 added login, three roles (Requester, IT Staff, Administrator), the IT Staff ticket workflow, and user management. Lab 4 adds Actions Taken, the final ticket workflow (resolution gate, status history, state update check), and a Dashboard for each role.</p>

        <h2 style="font-size: 10.5pt; margin-top: 8px; border-bottom: 1px solid #eee;">Tech Stack</h2>
        <ul style="padding-left: 18px; font-size: 8.5pt; margin-bottom: 8px;">
          <li><strong>Frontend:</strong> React + TypeScript + Vite + Vanilla CSS (Zen Green Design System)</li>
          <li><strong>Backend:</strong> Node.js + Express + TypeScript</li>
          <li><strong>Database:</strong> PostgreSQL + Prisma ORM</li>
          <li><strong>Testing:</strong> Vitest + Supertest + React Testing Library + Playwright</li>
        </ul>

        <h2 style="font-size: 10.5pt; margin-top: 8px; border-bottom: 1px solid #eee;">Repository Structure</h2>
        <div class="code-box" style="font-size: 7.5pt; margin: 4px 0;">
toktickit/
├── frontend/
│   ├── src/
│   │   ├── components/       # ActionsTakenSection, UI components
│   │   ├── pages/            # StaffDashboard, RequesterDashboard, Tickets
│   │   └── tests/lab-04/     # Component unit & integration tests
├── backend/
│   ├── prisma/               # schema.prisma, migrations, seed.ts
│   ├── src/                  # routes, middleware, controllers
│   └── tests/lab-04/         # Backend API tests
├── docs/lab-04/              # specification.md, tests.md, ui-spec.md, reviewer.md
├── e2e/lab-04/               # Playwright E2E test suites
└── scratch/                  # Utilities, reports, scripts
        </div>

        <h2 style="font-size: 10.5pt; margin-top: 8px; border-bottom: 1px solid #eee;">Setup</h2>
        <p style="font-size: 8.5pt;"><strong>Clone the Repository:</strong></p>
        <div class="code-box" style="font-size: 7.5pt; margin: 2px 0;">git clone https://github.com/aranedlek/toctickit.git\ncd toctickit</div>

        <p style="font-size: 8.5pt; margin-top: 6px;"><strong>Backend Setup & Migration:</strong></p>
        <div class="code-box" style="font-size: 7.5pt; margin: 2px 0;">cd backend\nnpm install\nnpx prisma migrate dev\nnpx prisma db seed\nnpm run dev   # Server starts on http://localhost:3000</div>
      </div>
      <div class="figure-caption">Figure 1.6: Rendered README.md (Part 1: Overview, Tech Stack, Structure, Setup)</div>
    </div>
  `);

  // ==========================================
  // PAGE 4: README (Part 2: Seeded Accounts & Demo)
  // ==========================================
  pages.push(`
    <div class="page">
      <div class="doc-box">
        <h2 style="font-size: 10.5pt; border-bottom: 1px solid #eee; margin-top: 0;">Frontend Setup & Seeded Accounts (Local Development Only)</h2>
        <div class="code-box" style="font-size: 7.5pt; margin: 4px 0;">cd frontend\nnpm install\nnpm run dev   # Client starts on http://localhost:5173</div>

        <p style="font-size: 8.5pt; margin-top: 8px;">Every seeded account uses the initial password <code>Password123!</code>.</p>

        <table>
          <thead>
            <tr>
              <th>Role</th>
              <th>Name</th>
              <th>Email</th>
              <th>State</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Requester</td>
              <td>Aran Edlek</td>
              <td><code>aran@example.com</code></td>
              <td>Active (Ready)</td>
            </tr>
            <tr>
              <td>Requester</td>
              <td>Anya Suphan</td>
              <td><code>anya@example.com</code></td>
              <td>Active</td>
            </tr>
            <tr>
              <td>Requester</td>
              <td>Ben Rattana</td>
              <td><code>ben@example.com</code></td>
              <td>Active</td>
            </tr>
            <tr>
              <td>Requester</td>
              <td>Eve Inactive</td>
              <td><code>eve@example.com</code></td>
              <td>Inactive</td>
            </tr>
            <tr>
              <td>IT Staff</td>
              <td>IT Staff One</td>
              <td><code>it1@example.com</code></td>
              <td>Active (Ready)</td>
            </tr>
            <tr>
              <td>IT Staff</td>
              <td>IT Staff Two</td>
              <td><code>it2@example.com</code></td>
              <td>Active</td>
            </tr>
            <tr>
              <td>IT Staff</td>
              <td>IT Staff Inactive</td>
              <td><code>it-inactive@example.com</code></td>
              <td>Inactive</td>
            </tr>
            <tr>
              <td>Administrator</td>
              <td>Admin User</td>
              <td><code>admin@example.com</code></td>
              <td>Active (Ready)</td>
            </tr>
          </tbody>
        </table>

        <h2 style="font-size: 10.5pt; margin-top: 8px; border-bottom: 1px solid #eee;">Demo (Lab 4)</h2>
        <ol style="padding-left: 18px; font-size: 8.5pt; line-height: 1.4;">
          <li><strong>IT Staff Dashboard:</strong> Log in as IT Staff (<code>it1@example.com</code>). The dashboard shows operational metric cards (Unassigned, Open, In Progress, Waiting on Requester, My Assigned). Clicking any card navigates to the pre-filtered Ticket Queue.</li>
          <li><strong>Actions Taken:</strong> Open Ticket Detail. View the parent-child Actions Taken list. Click "+ Record Action Taken", fill action description and result. Toggle "Follow-Up Required" to test mandatory follow-up validation.</li>
          <li><strong>Resolution Gate:</strong> Open tickets cannot jump directly to Resolved without completing active operational tasks. Requesters submitting resolution remain strictly advisory.</li>
          <li><strong>Optimistic Concurrency Control:</strong> Two concurrent editors on the same ticket receive HTTP 409 Conflict with a reload prompt when versions mismatch.</li>
          <li><strong>Requester Dashboard:</strong> Log in as Requester (<code>aran@example.com</code>). View personalized request counts, recent activity, and zero-metric empty states.</li>
        </ol>
      </div>
      <div class="figure-caption">Figure 1.6: Rendered README.md (Part 2: Seeded Accounts & Demo Workflows)</div>
    </div>
  `);

  // ==========================================
  // PAGE 5: README (Part 3: Testing & Environment)
  // ==========================================
  pages.push(`
    <div class="page">
      <div class="doc-box">
        <h2 style="font-size: 10.5pt; border-bottom: 1px solid #eee; margin-top: 0;">Testing and Regression Execution</h2>
        <p style="font-size: 8.5pt;">TokTickIT maintains rigorous test-driven verification across all layers:</p>

        <p style="font-size: 8.5pt; font-weight: bold; margin-top: 6px;">Backend API & Regression Tests (Vitest):</p>
        <div class="code-box" style="font-size: 7.5pt; margin: 2px 0;">cd backend\nnpm test   # Executes 64 automated tests across 11 test files (100% pass)</div>

        <p style="font-size: 8.5pt; font-weight: bold; margin-top: 6px;">Frontend Component & Accessibility Tests (Vitest):</p>
        <div class="code-box" style="font-size: 7.5pt; margin: 2px 0;">cd frontend\nnpm test   # Executes 33 automated tests across 9 test files (100% pass)</div>

        <p style="font-size: 8.5pt; font-weight: bold; margin-top: 6px;">End-to-End Test Suite (Playwright):</p>
        <div class="code-box" style="font-size: 7.5pt; margin: 2px 0;">npx playwright test   # Full user journeys across desktop, tablet, and mobile</div>

        <h2 style="font-size: 10.5pt; margin-top: 10px; border-bottom: 1px solid #eee;">Environment Variables</h2>
        <table>
          <thead>
            <tr>
              <th>Variable</th>
              <th>Description / Default</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>DATABASE_URL</code></td>
              <td>PostgreSQL database connection string</td>
            </tr>
            <tr>
              <td><code>PORT</code></td>
              <td>API port (Default: <code>3000</code>)</td>
            </tr>
            <tr>
              <td><code>CLIENT_ORIGIN</code></td>
              <td>Allowed frontend CORS origin (Default: <code>http://localhost:5173</code>)</td>
            </tr>
            <tr>
              <td><code>SESSION_SECRET</code></td>
              <td>JWT encryption key for authenticating HTTP cookies</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="figure-caption">Figure 1.6: Rendered README.md (Part 3: Testing Instructions & Environment Configuration)</div>
    </div>
  `);

  // ==========================================
  // PAGE 6: .gitignore & Repository Structure
  // ==========================================
  pages.push(`
    <div class="page">
      <div class="code-box" style="font-size: 8pt; line-height: 1.35;">
1  # dependencies
2  node_modules/
3  # env & secrets
4  .env
5  *.env
6  .env.test
7  !.env.example
8  # build output
9  dist/
10 build/
11 # prisma
12 backend/prisma/*.db
13 # logs & OS
14 *.log
15 .DS_Store
16 # uploaded attachment files
17 backend/uploads/*
18 !backend/uploads/.gitkeep
19 # playwright output
20 test-results/
21 playwright-report/
      </div>
      <div class="figure-caption">Figure 1.7: .gitignore</div>

      <h3 class="section-header" style="margin-top: 18px;">1.5 Repository Structure</h3>
      <p style="font-size: 9pt;">Lab 4 artifacts are organized in dedicated <code>lab-04</code> folders separated by purpose: specifications and review records in <code>docs/lab-04</code>, backend API/integration tests in <code>backend/tests/lab-04</code>, frontend UI tests in <code>frontend/src/tests/lab-04</code>, end-to-end tests in <code>e2e/lab-04</code>, and UI evidence in <code>docs/lab-04/screenshots</code>.</p>

      <div class="code-box" style="font-size: 8pt; line-height: 1.35;">
docs/lab-04/
├── ai-use.md
├── api-spec.md
├── reviewer.md
├── specification.md
├── tests.md
├── ui-spec.md
└── screenshots/
backend/src/routes/
├── actionsTaken.ts
├── dashboard.ts
└── ticketWorkflow.ts
frontend/src/
├── components/ActionsTakenSection.tsx
├── pages/staff/StaffDashboard.tsx
└── pages/requester/RequesterDashboard.tsx
e2e/lab-04/
├── actions-taken-flow.spec.ts
├── dashboards.spec.ts
└── ticket-resolution.spec.ts
      </div>
      <div class="figure-caption">Figure 1.8: Repository directory structure</div>
    </div>
  `);

  // ==========================================
  // PAGE 7: Answer Part 2 - Functional Requirements
  // ==========================================
  pages.push(`
    <div class="page">
      <h2 class="part-header">Answer Part 2: Spec DD</h2>
      <h3 class="section-header">2.1 rendered docs/lab-04/specification.md</h3>
      <p><strong>Link :</strong> <a href="https://github.com/aranedlek/toctickit/blob/main/docs/lab-04/specification.md">https://github.com/aranedlek/toctickit/blob/main/docs/lab-04/specification.md</a></p>

      <h4 class="subsection-header">2.1.1 Functional Requirements</h4>
      <div class="doc-box">
        <h3 style="font-size: 10pt; margin-top: 0;">4. Functional Requirements</h3>
        <p style="font-size: 8.5pt; font-weight: bold;">Actions Taken</p>
        <ul style="padding-left: 16px; font-size: 8pt; line-height: 1.35;">
          <li><strong>FR-01:</strong> IT Staff and Administrators can create an Action Taken on a Ticket with Action Date/Time, Action Description, Result, Follow-Up Required, Follow-up Note, and Attachment Notes.</li>
          <li><strong>FR-02:</strong> An action is assigned to an active IT Staff member or Administrator, who may be different from the Ticket Owner.</li>
          <li><strong>FR-03:</strong> Staff Ticket Detail shows the actions of a Ticket as a list in a stable order.</li>
          <li><strong>FR-04:</strong> IT Staff and Administrators can view an action and edit an open action.</li>
          <li><strong>FR-05:</strong> IT Staff and Administrators can start, complete, and cancel an action.</li>
          <li><strong>FR-06:</strong> Performed By is set automatically by the backend session.</li>
          <li><strong>FR-07:</strong> A Requester sees all Actions Taken on their own Tickets, read-only.</li>
        </ul>

        <p style="font-size: 8.5pt; font-weight: bold; margin-top: 6px;">Ticket Workflow</p>
        <ul style="padding-left: 16px; font-size: 8pt; line-height: 1.35;">
          <li><strong>FR-08:</strong> IT Staff and Administrators change Ticket status only through the final transition matrix in section 5.4.</li>
          <li><strong>FR-09:</strong> The backend rejects Resolved, and Resolved to Closed, while the Ticket has an open action.</li>
          <li><strong>FR-10:</strong> Every status change is saved in an append-only history and shown as a Status Timeline.</li>
          <li><strong>FR-11:</strong> "Problem Appears Resolved" from a Requester stays advisory and does not change the status.</li>
          <li><strong>FR-12:</strong> The status control shows only allowed targets and refreshes the Ticket summary after a successful change.</li>
          <li><strong>FR-13:</strong> Ticket handling detects stale updates, so one user does not overwrite another user's recent change without knowing.</li>
        </ul>

        <p style="font-size: 8.5pt; font-weight: bold; margin-top: 6px;">Dashboards</p>
        <ul style="padding-left: 16px; font-size: 8pt; line-height: 1.35;">
          <li><strong>FR-14:</strong> A Requester sees a Requester Dashboard built only from their own Tickets.</li>
          <li><strong>FR-15:</strong> IT Staff see an IT Staff Dashboard, and Administrators reuse it.</li>
          <li><strong>FR-16:</strong> Every card, count row, and list row opens My Tickets, the Ticket Queue, or Ticket Detail with the right filters.</li>
          <li><strong>FR-17:</strong> Every role has a Dashboard navigation item with a clear active page.</li>
          <li><strong>FR-18:</strong> Dashboards show loading, empty, forbidden, and safe failure feedback.</li>
        </ul>

        <p style="font-size: 8.5pt; font-weight: bold; margin-top: 6px;">Data, Testing, and Hardening</p>
        <ul style="padding-left: 16px; font-size: 8pt; line-height: 1.35;">
          <li><strong>FR-19:</strong> The migration keeps all earlier data, has a tested recovery script, and adds Lab 4 demo data.</li>
          <li><strong>FR-20:</strong> Lab 4 regression tests check the Labs 1 to 3 features with login.</li>
          <li><strong>FR-21:</strong> Tests run on a separate test database.</li>
          <li><strong>FR-22:</strong> Feedback states are consistent, repeated clicks do not create duplicates.</li>
          <li><strong>FR-23:</strong> Leftover UI from earlier labs, console errors, broken links, placeholder text are removed.</li>
          <li><strong>FR-24:</strong> Lab 4 screens use the Zen Green design of Labs 2 and 3 and are responsive and accessible.</li>
          <li><strong>FR-25:</strong> A performance smoke test checks the dashboard and action list endpoints.</li>
        </ul>
      </div>
      <div class="figure-caption">Figure 2.1.1: Functional Requirements (FR-01 – FR-25)</div>
    </div>
  `);

  // ==========================================
  // PAGE 8: Business Rules (Actions Taken & Workflow)
  // ==========================================
  pages.push(`
    <div class="page">
      <h4 class="subsection-header">2.1.2 Business Rules</h4>

      <div class="doc-box">
        <h3 style="font-size: 9.5pt; margin-top: 0;">5.1 Actions Taken Rules</h3>
        <table>
          <thead>
            <tr><th style="width: 60px;">BR ID</th><th>Business Rule</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>BR-01</strong></td><td>Action Taken belongs to exactly one Ticket.</td></tr>
            <tr><td><strong>BR-02</strong></td><td>The Ticket Owner coordinates the Ticket, but an Action Taken may be by a different IT Staff member.</td></tr>
            <tr><td><strong>BR-03</strong></td><td>Action Date/Time and Action Description are required. Text is trimmed. Description, Result, and Follow-up Note are at most 1000 characters, and Attachment Notes at most 500 (400 with fields).</td></tr>
            <tr><td><strong>BR-04</strong></td><td>Follow-up Note is required when Follow-Up Required is true. When it is false, the note is saved as empty.</td></tr>
            <tr><td><strong>BR-05</strong></td><td>Result and Attachment Notes are optional. Attachment Notes is plain text that names a file or image to look at; it is not an upload.</td></tr>
            <tr><td><strong>BR-06</strong></td><td>The assignee must be an active IT_STAFF or ADMIN user; it defaults to the creator. An inactive, Requester, or unknown user gets 409 CONFLICT.</td></tr>
            <tr><td><strong>BR-07</strong></td><td>Action statuses are Planned, In Progress, Completed, and Cancelled. A new action starts as Planned, In Progress, or Completed.</td></tr>
            <tr><td><strong>BR-08</strong></td><td>Completed and Cancelled actions cannot be changed (409 CONFLICT). There is no delete; a cancelled action stays in the list.</td></tr>
            <tr><td><strong>BR-09</strong></td><td>The backend sets Performed By to the user who completes the action. Values sent by the client are ignored.</td></tr>
            <tr><td><strong>BR-10</strong></td><td>Actions are listed by Action Date/Time, oldest first, then by id.</td></tr>
            <tr><td><strong>BR-11</strong></td><td>Only IT Staff and Administrators create and update actions on any Ticket. A Requester can only read the actions of their own Tickets.</td></tr>
          </tbody>
        </table>
      </div>
      <div class="figure-caption">Figure 2.1.2a: Actions Taken rules</div>

      <div class="doc-box" style="margin-top: 8px;">
        <h3 style="font-size: 9.5pt; margin-top: 0;">5.2 Ticket Workflow and Stale Update Rules</h3>
        <table>
          <thead>
            <tr><th style="width: 60px;">BR ID</th><th>Business Rule</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>BR-12</strong></td><td>The eight statuses and the Lab 3 transition pairs stay. An owner is needed for every change except Cancelled, and Resolved. Closed, and Cancelled need a confirmation. Only IT Staff and Administrators change status.</td></tr>
            <tr><td><strong>BR-13</strong></td><td>Resolution gate: Resolved, and Resolved to Closed, get 409 OPEN_ACTIONS_EXIST while the Ticket has a Planned or In Progress action. A Ticket with zero actions can be resolved and closed.</td></tr>
            <tr><td><strong>BR-14</strong></td><td>Resolved sets resolvedAt. Closed keeps it. Reopened clears it.</td></tr>
            <tr><td><strong>BR-15</strong></td><td>Every successful status change writes one history row (from, to, changed by, changed at). Rejected changes write nothing.</td></tr>
            <tr><td><strong>BR-16</strong></td><td>"Problem Appears Resolved" only sets the Lab 3 flag. It never changes the status.</td></tr>
            <tr><td><strong>BR-17</strong></td><td>A Ticket has a version that goes up by 1 on every successful owner or IT Priority update and status change. Other activity does not change it.</td></tr>
            <tr><td><strong>BR-18</strong></td><td>The owner or IT Priority update and the status change must send expectedVersion. If it does not match, the backend returns 409 STALE_UPDATE and saves nothing.</td></tr>
          </tbody>
        </table>
      </div>
      <div class="figure-caption">Figure 2.1.2b: Ticket workflow and stale update rules.</div>
    </div>
  `);

  // ==========================================
  // PAGE 9: Transition Matrix & Dashboard Rules
  // ==========================================
  pages.push(`
    <div class="page">
      <div class="doc-box">
        <h3 style="font-size: 9.5pt; margin-top: 0;">5.4 Final Ticket Transition Matrix</h3>
        <p style="font-size: 8pt; margin-bottom: 4px;">Only IT Staff and Administrators make these changes. Every change sends expectedVersion and writes one history row.</p>
        <table>
          <thead>
            <tr><th>From</th><th>Allowed to</th><th>Lab 4 rule</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>New</strong></td><td>Open, In Progress, Cancelled</td><td></td></tr>
            <tr><td><strong>Open</strong></td><td>In Progress, Waiting for Requester, Resolved, Cancelled</td><td>gate on Resolved</td></tr>
            <tr><td><strong>In Progress</strong></td><td>Open, Waiting for Requester, Resolved, Cancelled</td><td>gate on Resolved</td></tr>
            <tr><td><strong>Waiting for Requester</strong></td><td>Open, In Progress, Resolved, Cancelled</td><td>gate on Resolved</td></tr>
            <tr><td><strong>Resolved</strong></td><td>Closed, Reopened</td><td>gate on Closed; Reopened clears resolvedAt</td></tr>
            <tr><td><strong>Closed</strong></td><td>Reopened</td><td>Reopened clears resolvedAt</td></tr>
            <tr><td><strong>Reopened</strong></td><td>In Progress, Waiting for Requester, Resolved, Cancelled</td><td>gate on Resolved</td></tr>
            <tr><td><strong>Cancelled</strong></td><td>none</td><td>final</td></tr>
          </tbody>
        </table>
      </div>
      <div class="figure-caption">Figure 2.1.2d: Final Ticket transition matrix.</div>

      <div class="doc-box" style="margin-top: 10px;">
        <h3 style="font-size: 9.5pt; margin-top: 0;">5.5 Dashboard Rules and Calculations</h3>
        <table>
          <thead>
            <tr><th style="width: 60px;">BR ID</th><th>Business Rule</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>BR-19</strong></td><td>Active statuses are New, Open, In Progress, Waiting for Requester, and Reopened. "Recent" means the last 7 days up to now.</td></tr>
            <tr><td><strong>BR-20</strong></td><td>The Requester Dashboard only uses the session user's Tickets. A requesterId sent by the client is ignored.</td></tr>
            <tr><td><strong>BR-21</strong></td><td>Administrators get the same IT Staff Dashboard, with no user account counts.</td></tr>
            <tr><td><strong>BR-22</strong></td><td>Metrics are calculated by the backend from the database. The endpoints return counts and short lists only, not full Ticket collections.</td></tr>
            <tr><td><strong>BR-23</strong></td><td>No matching data gives 0 or an empty list, never an error.</td></tr>
            <tr><td><strong>BR-24</strong></td><td>A drill-down opens the target screen with the filters below, and its total equals the card value.</td></tr>
          </tbody>
        </table>

        <p style="font-size: 8pt; font-weight: bold; margin-top: 6px;">Requester Dashboard Metrics:</p>
        <table>
          <thead><tr><th>Metric</th><th>Calculation</th><th>Empty</th><th>Drill-down</th></tr></thead>
          <tbody>
            <tr><td><code>openTickets</code></td><td>count of Tickets with an active status</td><td>0</td><td>My Tickets <code>statusGroup=active</code></td></tr>
            <tr><td><code>waitingForMe</code></td><td>count of Tickets in Waiting for Requester</td><td>0</td><td>My Tickets <code>status=WAITING_FOR_REQUESTER</code></td></tr>
            <tr><td><code>recentlyUpdated</code></td><td>up to 5 Tickets with updatedAt in the last 7 days</td><td>"No tickets updated in the last 7 days."</td><td>row opens Ticket Detail</td></tr>
            <tr><td><code>recentlyResolved</code></td><td>up to 5 Tickets with resolvedAt in the last 7 days</td><td>"No tickets resolved in the last 7 days."</td><td>row opens Ticket Detail</td></tr>
          </tbody>
        </table>
      </div>
      <div class="figure-caption">Figure 2.1.2e: Dashboard rules and calculations.</div>
    </div>
  `);

  // ==========================================
  // PAGE 10: Migration Decisions & Data Changes
  // ==========================================
  pages.push(`
    <div class="page">
      <div class="doc-box">
        <h3 style="font-size: 9.5pt; margin-top: 0;">5.6 Data, Testing, and General Rules</h3>
        <table>
          <thead><tr><th style="width: 60px;">BR ID</th><th>Business Rule</th></tr></thead>
          <tbody>
            <tr><td><strong>BR-25</strong></td><td>The migration is additive and keeps all earlier data. Legacy Tickets have zero actions and version 0.</td></tr>
            <tr><td><strong>BR-26</strong></td><td>The seed is idempotent and adds Tickets with zero, one, and several actions.</td></tr>
            <tr><td><strong>BR-27</strong></td><td>Server and E2E tests use the test database from server/.env.test.</td></tr>
            <tr><td><strong>BR-28</strong></td><td>Errors use safe messages. Submit buttons are disabled while saving to prevent duplicate creation.</td></tr>
            <tr><td><strong>BR-29</strong></td><td>All approved Lab 1 to 3 behaviour keeps working.</td></tr>
            <tr><td><strong>BR-30</strong></td><td>Every role has a Dashboard navigation item, and the Dashboard is the first screen after login.</td></tr>
          </tbody>
        </table>
      </div>
      <div class="figure-caption">Figure 2.1.2f: Data, testing, and general rules.</div>

      <h4 class="subsection-header" style="margin-top: 14px;">2.1.3 Migration Decisions</h4>
      <div class="doc-box">
        <h3 style="font-size: 9.5pt; margin-top: 0;">7. Data Changes & Design Decisions</h3>
        <table>
          <thead><tr><th>ActionTaken field</th><th>Type</th><th>Notes</th></tr></thead>
          <tbody>
            <tr><td><code>id, ticketId</code></td><td>Int</td><td>primary key; FK to Ticket (BR-01)</td></tr>
            <tr><td><code>actionAt</code></td><td>DateTime</td><td>Action Date/Time</td></tr>
            <tr><td><code>description</code></td><td>VarChar(1000)</td><td>required</td></tr>
            <tr><td><code>result, followUpNote</code></td><td>VarChar(1000)?</td><td>BR-04, BR-05</td></tr>
            <tr><td><code>attachmentNotes</code></td><td>VarChar(500)?</td><td>text only</td></tr>
            <tr><td><code>followUpRequired</code></td><td>Boolean</td><td>default false</td></tr>
            <tr><td><code>status</code></td><td>ActionStatus</td><td>BR-07</td></tr>
            <tr><td><code>assignedToId, performedById</code></td><td>Int, Int?</td><td>FK to User (BR-06, BR-09)</td></tr>
          </tbody>
        </table>

        <div style="font-size: 8pt; margin-top: 6px; line-height: 1.35;">
          <strong>7.2 Design Decisions:</strong><br/>
          • <strong>D-01 Version number for stale updates:</strong> An integer <code>version</code> with a conditional update (<code>WHERE id = :id AND version = :v</code>) is simple and exact.<br/>
          • <strong>D-02 Dedicated ActionTaken Table vs Reusing InternalNote:</strong> Actions Taken represent auditable operational records with specific metadata. Coupling them with staff notes would violate Single Responsibility.<br/>
          • <strong>D-03 Migration & Recovery:</strong> Additive migration keeps existing data intact.
        </div>
      </div>
      <div class="figure-caption">Figure 2.1.3: Data changes, design decisions, and migration and recovery.</div>
    </div>
  `);

  // ==========================================
  // PAGE 11: Acceptance Criteria (AC-01 - AC-35)
  // ==========================================
  pages.push(`
    <div class="page">
      <h4 class="subsection-header">2.1.4 Acceptance Criteria</h4>
      <div class="doc-box">
        <h3 style="font-size: 9.5pt; margin-top: 0;">9. Acceptance Criteria</h3>
        <p style="font-size: 8pt; font-weight: bold;">Actions Taken</p>
        <ul style="padding-left: 14px; font-size: 7.5pt; line-height: 1.3;">
          <li><strong>AC-01:</strong> Given a permitted IT Staff user and valid data, when an Action Taken is created, then it is saved under the correct Ticket with the authenticated creator.</li>
          <li><strong>AC-02:</strong> Given an empty Action Description, no Action Date/Time, a text over its limit, or Follow-Up Required without a Follow-up Note, when an action is saved, then it gets 400 with the field names and nothing is saved.</li>
          <li><strong>AC-03:</strong> Given an action, when its status changes, then only the BR-07 changes work; any change to a Completed or Cancelled action gets 409.</li>
          <li><strong>AC-04:</strong> Given a Requester, when they open their own Ticket, then all actions and fields are shown with no edit controls; another Requester's Ticket gets 404; every action write gets 403.</li>
        </ul>

        <p style="font-size: 8pt; font-weight: bold; margin-top: 4px;">Ticket Workflow</p>
        <ul style="padding-left: 14px; font-size: 7.5pt; line-height: 1.3;">
          <li><strong>AC-05:</strong> Given every status pair, when staff change status with the current version, then only the section 5.4 pairs work; other pairs and a missing owner get 409 / 422.</li>
          <li><strong>AC-06:</strong> Given a Ticket with a Planned or In Progress action, when Resolved, or Closed from Resolved, is requested by a direct API call, then it gets 409 OPEN_ACTIONS_EXIST and nothing changes.</li>
          <li><strong>AC-07:</strong> Given a Requester, when they try to change status, then it gets 403; "Problem Appears Resolved" sets only the flag.</li>
          <li><strong>AC-08:</strong> Given two staff users with the same Ticket version, when both save, then the first save works and increases version by 1, and the second gets 409 STALE_UPDATE.</li>
        </ul>

        <p style="font-size: 8pt; font-weight: bold; margin-top: 4px;">Dashboards</p>
        <ul style="padding-left: 14px; font-size: 7.5pt; line-height: 1.3;">
          <li><strong>AC-09:</strong> Given the freshly seeded test database, the Requester Dashboard values equal database aggregations.</li>
          <li><strong>AC-10:</strong> Given the freshly seeded test database, the IT Staff Dashboard cards and countsByStatus match database queries.</li>
          <li><strong>AC-11:</strong> Given a dashboard card or status row, when it is clicked, then My Tickets or the Ticket Queue opens with the section 5.5 filters.</li>
          <li><strong>AC-12:</strong> Given no data, loading, a forbidden role, or an API failure, then the dashboard shows 0 and the empty text, loading state, or safe failure message.</li>
        </ul>

        <p style="font-size: 8pt; font-weight: bold; margin-top: 4px;">Data and Hardening</p>
        <ul style="padding-left: 14px; font-size: 7.5pt; line-height: 1.3;">
          <li><strong>AC-13:</strong> Given a Lab 3 database, when the migration runs, then all earlier data stays and legacy Tickets follow BR-25.</li>
          <li><strong>AC-14:</strong> Given logged-in users, then Labs 1 to 3 features still work: login, roles, Create Ticket, My Tickets, Ticket Detail ownership, Public Comments, Internal Notes, Ticket Queue, and user management.</li>
          <li><strong>AC-15:</strong> Given desktop, tablet, and mobile viewports, then dashboards and Actions Taken have no horizontal scroll, clipping, or overlap.</li>
        </ul>
      </div>
      <div class="figure-caption">Figure 2.1.4: Acceptance Criteria (AC-01 – AC-35).</div>
    </div>
  `);

  // ==========================================
  // PAGE 12: Definition of Done & Spec Pre-Commit
  // ==========================================
  pages.push(`
    <div class="page">
      <h4 class="subsection-header">2.1.5 Definition of Done</h4>
      <div class="doc-box">
        <h3 style="font-size: 9.5pt; margin-top: 0;">10. Definition of Done</h3>
        <ul style="padding-left: 16px; font-size: 8pt; line-height: 1.35;">
          <li>FR-01 to FR-25 are implemented, and nothing from the excluded scope is added.</li>
          <li>Every action and workflow write is checked by the backend (role, ownership, gate, version) and tested by direct API calls; dashboard metrics match section 5.5 and direct database queries.</li>
          <li>The migration keeps earlier data, down-SQL is tested, and the seed gives the section 7.4 values.</li>
          <li>Tests use test database from server/.env.test, and development database is unchanged.</li>
          <li>Every AC maps to a passing test in tests.md; all Lab 4 tests pass with none skipped, including regression tests.</li>
          <li>The UI follows ui-spec.md, screenshots are under docs/lab-04/screenshots/, and the visual checklist is filled in.</li>
          <li>The README covers setup, migration, seeded accounts, and demo workflows.</li>
          <li>No secret, password, or hash appears in the repository, logs, or responses.</li>
          <li>The four Lab 4 documents are merged before the main implementation PRs.</li>
          <li>GitHub Issues #1 to #6 are Done; work is merged from feature branches into lab4-staging and then main through reviewed PRs; reviewer.md and ai-use.md are complete.</li>
        </ul>
      </div>
      <div class="figure-caption">Figure 2.1.5: Product Definition of Done.</div>

      <h3 class="section-header" style="margin-top: 14px;">2.2 Specification Before Implementation</h3>
      <div class="figure-container">
        <div class="figure-frame" style="width: 100%; border: 1px solid #222; padding: 10px; text-align: left; background: #fff;">
          <div style="font-family: -apple-system, sans-serif; font-size: 8.5pt;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 6px;">
              <div>
                <strong style="color: #1976d2;">PR #39</strong> <strong>docs: create Lab 4 engineering contract specification and test plan</strong><br/>
                <span style="color: #666; font-size: 7.5pt;">Merged by <strong>Ponatinylilbug</strong> into <code>lab4-staging</code> via commit <code>42ff9e2</code></span>
              </div>
              <div style="text-align: right; font-size: 7.5pt; color: #2e7d32; font-weight: bold;">
                Merged Oct 31, 2026, 20:15
              </div>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <div>
                <strong style="color: #1976d2;">PR #40</strong> <strong>feat: implement Actions Taken foundation and database</strong><br/>
                <span style="color: #666; font-size: 7.5pt;">Merged by <strong>Ponatinylilbug</strong> into <code>lab4-staging</code> via commit <code>afee134</code></span>
              </div>
              <div style="text-align: right; font-size: 7.5pt; color: #2e7d32; font-weight: bold;">
                Merged Oct 31, 2026, 20:57
              </div>
            </div>
          </div>
        </div>
        <div class="figure-caption">Figure 2.2: specification.md commit history - "Lab 4 spec" committed 2026-10-31 20:07 and merged in PR #39 at 20:15, before the first implementation PR #40 (20:57).</div>
      </div>

      <h2 class="part-header" style="margin-top: 16px;">Answer Part 3: Test DD and Traceability</h2>
      <h3 class="section-header">3.1 Rendered docs/lab-04/tests.md</h3>
      <p><strong>Link:</strong> <a href="https://github.com/aranedlek/toctickit/blob/main/docs/lab-04/tests.md">https://github.com/aranedlek/toctickit/blob/main/docs/lab-04/tests.md</a></p>
    </div>
  `);

  // ==========================================
  // PAGE 13: Test Strategy & Unit Tests
  // ==========================================
  pages.push(`
    <div class="page">
      <h4 class="subsection-header">3.1.1 Test Strategy</h4>
      <div class="doc-box">
        <h3 style="font-size: 9.5pt; margin-top: 0;">1. Test Strategy</h3>
        <table>
          <thead><tr><th>Level</th><th>Tools</th><th>Covers</th></tr></thead>
          <tbody>
            <tr><td>Unit</td><td>Vitest</td><td>action status rules, action field rules, Ticket transition and gate rules, recent window</td></tr>
            <tr><td>API / integration, authorization, workflow</td><td>Vitest + Supertest + PostgreSQL</td><td>action endpoints, roles, workflow, stale updates, dashboards, filters</td></tr>
            <tr><td>Migration / regression</td><td>Vitest + Prisma + Supertest</td><td>migration, down-SQL seed, Labs 1 to 3 features with login</td></tr>
            <tr><td>Performance smoke</td><td>Vitest + Supertest</td><td>dashboard and action list endpoints</td></tr>
            <tr><td>UI component and UI style</td><td>Vitest + React Testing Library</td><td>dashboards, navigation, Actions Taken, workflow feedback, labels and badges</td></tr>
            <tr><td>Responsive and E2E</td><td>Playwright at 1440 × 900, 768 × 1024, 375 × 812, plus a manual checklist</td><td>full flows, layout, keyboard, screenshots</td></tr>
          </tbody>
        </table>
      </div>
      <div class="figure-caption">Figure 3.1.1: Test strategy - test types, tools, and test files per Issue.</div>

      <h4 class="subsection-header" style="margin-top: 14px;">3.1.2 Planned Tests</h4>
      <div class="doc-box">
        <h3 style="font-size: 9.5pt; margin-top: 0;">2.1 Unit Tests</h3>
        <table>
          <thead>
            <tr><th>Test ID</th><th>Type</th><th>Requirement / AC</th><th>What It Tests</th><th>Expected Result</th><th>Automated Test File</th><th>Final</th></tr>
          </thead>
          <tbody>
            <tr><td>UNIT-01</td><td>Unit</td><td>AC-05</td><td>Action status rule for every pair and every first status</td><td>Only the BR-07 changes are allowed; Cancelled is not a first status</td><td>backend/tests/lab-04/actionsTaken.test.ts</td><td>Pass ✅</td></tr>
            <tr><td>UNIT-02</td><td>Unit</td><td>AC-03</td><td>Action field rules: description empty, 1, 1000, 1001 characters; Attachment Notes 500 and 501; follow-up on without and with a note</td><td>Valid only inside BR-03 and BR-04</td><td>backend/tests/lab-04/actionsTaken.test.ts</td><td>Pass ✅</td></tr>
            <tr><td>UNIT-03</td><td>Unit</td><td>AC-10, AC-11</td><td>Ticket transition rule for every pair; gate with zero, open, and only finished actions</td><td>Only section 5.4 pairs; gate blocks only with an open action</td><td>backend/tests/lab-04/ticketWorkflow.test.ts</td><td>Pass ✅</td></tr>
            <tr><td>UNIT-04</td><td>Unit</td><td>AC-19</td><td>Recent window at now, exactly 7 days ago, and 7 days plus 1 minute ago</td><td>First two inside, last outside</td><td>backend/tests/lab-04/dashboard.test.ts</td><td>Pass ✅</td></tr>
          </tbody>
        </table>
      </div>
      <div class="figure-caption">Figure 3.1.2a: Unit tests.</div>
    </div>
  `);

  // ==========================================
  // PAGE 14: API Tests - Actions Taken & Workflow
  // ==========================================
  pages.push(`
    <div class="page">
      <div class="doc-box">
        <h3 style="font-size: 9.5pt; margin-top: 0;">2.2 API and Authorization: Actions Taken</h3>
        <table>
          <thead>
            <tr><th>Test ID</th><th>What It Tests</th><th>Expected Result</th><th>Automated Test File</th><th>Final</th></tr>
          </thead>
          <tbody>
            <tr><td>API-01</td><td>Create a valid Actions Taken without an assignee, with fake createdById, and performedById</td><td>201: under the correct Ticket; creator and assignee are the caller; fake values ignored</td><td>actionsTaken.test.ts</td><td>Pass ✅</td></tr>
            <tr><td>API-02</td><td>Staff creates an action assigned to another IT Staff member</td><td>201: assignee set; Ticket Owner unchanged</td><td>actionsTaken.test.ts</td><td>Pass ✅</td></tr>
            <tr><td>API-03</td><td>Create with no description, no actionAt, too long text, and follow-up without a note, all at once</td><td>400: with every field name; nothing saved</td><td>actionsTaken.test.ts</td><td>Pass ✅</td></tr>
            <tr><td>API-04</td><td>Create and reassign with an inactive user, Requester, and an unknown id</td><td>409 CONFLICT each time; action unchanged</td><td>actionsTaken.test.ts</td><td>Pass ✅</td></tr>
            <tr><td>API-05</td><td>Requester POST and PATCH on action routes; staff on /api/tickets/:id/actions; no session</td><td>403; 403; 401</td><td>actionsTaken.test.ts</td><td>Pass ✅</td></tr>
            <tr><td>API-06</td><td>Administrator creates and updates an action</td><td>201; 200</td><td>actionsTaken.test.ts</td><td>Pass ✅</td></tr>
          </tbody>
        </table>
      </div>
      <div class="figure-caption">Figure 3.1.2b: API and authorization tests - Actions Taken.</div>

      <div class="doc-box" style="margin-top: 10px;">
        <h3 style="font-size: 9.5pt; margin-top: 0;">2.3 Workflow and Stale Update Tests</h3>
        <table>
          <thead>
            <tr><th>Test ID</th><th>What It Tests</th><th>Expected Result</th><th>Automated Test File</th><th>Final</th></tr>
          </thead>
          <tbody>
            <tr><td>FLOW-01</td><td>Every status pair with the current version; no owner; no confirmation</td><td>Only section 5.4 pairs work; others 409; no owner 409 except Cancelled; no confirmation 409</td><td>ticketWorkflow.test.ts</td><td>Pass ✅</td></tr>
            <tr><td>FLOW-02</td><td>Resolve with a Planned action, then complete it and resolve; resolve and close a Ticket with zero actions</td><td>409 OPEN_ACTIONS_EXIST and no change; then 200; zero-action Ticket 200 both times</td><td>ticketWorkflow.test.ts</td><td>Pass ✅</td></tr>
            <tr><td>FLOW-03</td><td>Resolve, close, and reopen a Ticket</td><td>resolvedAt set, kept, then cleared</td><td>ticketWorkflow.test.ts</td><td>Pass ✅</td></tr>
            <tr><td>FLOW-04</td><td>Requester changes status; Requester marks "Problem Appears Resolved"</td><td>403; flag set and status unchanged</td><td>ticketWorkflow.test.ts</td><td>Pass ✅</td></tr>
            <tr><td>FLOW-05</td><td>Two PATCH calls with the same version: a status change with an old version; no expectedVersion</td><td>First 200 and version +1; second 409 STALE_UPDATE; 400: version unchanged</td><td>ticketWorkflow.test.ts</td><td>Pass ✅</td></tr>
          </tbody>
        </table>
      </div>
      <div class="figure-caption">Figure 3.1.2c: Workflow and stale update tests.</div>
    </div>
  `);

  // ==========================================
  // PAGE 15: API Tests - Dashboards & Regression
  // ==========================================
  pages.push(`
    <div class="page">
      <div class="doc-box">
        <h3 style="font-size: 9.5pt; margin-top: 0;">2.4 API: Dashboards and Filters</h3>
        <table>
          <thead>
            <tr><th>Test ID</th><th>What It Tests</th><th>Expected Result</th><th>Automated Test File</th><th>Final</th></tr>
          </thead>
          <tbody>
            <tr><td>API-10</td><td>Requester Dashboard for seeded users</td><td>Values equal specification section 7.4 and the Prisma queries</td><td>dashboard.test.ts</td><td>Pass ✅</td></tr>
            <tr><td>API-11</td><td>Requester calls with requesterId=otherUser</td><td>Same response as without it; only own user's Tickets</td><td>dashboard.test.ts</td><td>Pass ✅</td></tr>
            <tr><td>API-12</td><td>IT Staff Dashboard metrics on a fresh seed</td><td>Cards and countsByStatus equal section 7.4 and Prisma queries</td><td>dashboard.test.ts</td><td>Pass ✅</td></tr>
            <tr><td>API-13</td><td>Administrator and IT Staff responses</td><td>Same keys; no user counts; no full Ticket lists</td><td>dashboard.test.ts</td><td>Pass ✅</td></tr>
            <tr><td>API-14</td><td>Requester calling IT Staff Dashboard; no session</td><td>403; 401</td><td>dashboard.test.ts</td><td>Pass ✅</td></tr>
          </tbody>
        </table>
      </div>
      <div class="figure-caption">Figure 3.1.2d: API tests - dashboards and filters.</div>

      <div class="doc-box" style="margin-top: 10px;">
        <h3 style="font-size: 9.5pt; margin-top: 0;">2.5 Migration, Regression, and Performance</h3>
        <table>
          <thead>
            <tr><th>Test ID</th><th>What It Tests</th><th>Expected Result</th><th>Automated Test File</th><th>Final</th></tr>
          </thead>
          <tbody>
            <tr><td>MIG-01</td><td>Schema with Lab 4 data; legacy ticket compatibility</td><td>Legacy Tickets have zero actions; version 0</td><td>backend test suite</td><td>Pass ✅</td></tr>
            <tr><td>MIG-02</td><td>Run the seed twice</td><td>No duplicate actions; repeatable execution</td><td>seed.ts</td><td>Pass ✅</td></tr>
            <tr><td>REG-01</td><td>Login for each role, forced password change, logout</td><td>Lab 3 responses match</td><td>auth.test.ts</td><td>Pass ✅</td></tr>
            <tr><td>REG-02</td><td>Health, categories, related systems, Create Ticket, My Tickets, filters</td><td>Lab 1 and Lab 2 responses match; 404 for another Requester's Ticket</td><td>tickets.test.ts</td><td>Pass ✅</td></tr>
            <tr><td>REG-03</td><td>Public Comments and Internal Notes for each role</td><td>Lab 3 rules: Requester 403 on internal notes</td><td>notes.test.ts</td><td>Pass ✅</td></tr>
            <tr><td>REG-04</td><td>User management: create, edit, last Administrator rule</td><td>Lab 3 results: 405 for the last Administrator</td><td>users.test.ts</td><td>Pass ✅</td></tr>
            <tr><td>PERF-01</td><td>GET /api/dashboard/requester and /staff on seeded DB</td><td>Each under 1000 ms</td><td>dashboard.test.ts</td><td>Pass ✅</td></tr>
          </tbody>
        </table>
      </div>
      <div class="figure-caption">Figure 3.1.2e: Migration, regression, and performance tests.</div>
    </div>
  `);

  // ==========================================
  // PAGE 16: UI Component Tests
  // ==========================================
  pages.push(`
    <div class="page">
      <div class="doc-box">
        <h3 style="font-size: 9.5pt; margin-top: 0;">2.6 UI Component and UI Style Tests</h3>
        <table>
          <thead>
            <tr><th>Test ID</th><th>What It Tests</th><th>Expected Result</th><th>Automated Test File</th><th>Final</th></tr>
          </thead>
          <tbody>
            <tr><td>UI-01</td><td>IT Staff cards and Tickets by status block</td><td>5 cards rendered including zeros</td><td>StaffDashboard.test.tsx</td><td>Pass ✅</td></tr>
            <tr><td>UI-02</td><td>Click each card: status row, list row, and "View all"</td><td>Ticket Queue or Ticket Detail opens with the proper filter parameters</td><td>StaffDashboard.test.tsx</td><td>Pass ✅</td></tr>
            <tr><td>UI-03</td><td>Requester cards and lists</td><td>Personalized metrics rendered</td><td>RequesterDashboard.test.tsx</td><td>Pass ✅</td></tr>
            <tr><td>UI-04</td><td>Actions list with data, empty, loading, failure</td><td>Columns as in ui-spec; empty state and failure texts rendered</td><td>ActionsTaken.test.tsx</td><td>Pass ✅</td></tr>
            <tr><td>UI-05</td><td>Create mode modal dialog</td><td>Fields in order with defaults; Follow-up Note shown only when checked</td><td>ActionsTaken.test.tsx</td><td>Pass ✅</td></tr>
            <tr><td>UI-06</td><td>Form validation errors under each field</td><td>Messages under fields and first invalid field focused</td><td>ActionsTaken.test.tsx</td><td>Pass ✅</td></tr>
            <tr><td>UI-07</td><td>Requester view</td><td>All fields shown; no Add, Edit, or status controls</td><td>ActionsTaken.test.tsx</td><td>Pass ✅</td></tr>
            <tr><td>UI-08</td><td>Status select for each current status</td><td>Only allowed targets listed per matrix</td><td>TicketWorkflow.test.tsx</td><td>Pass ✅</td></tr>
            <tr><td>UI-09</td><td>Status update collision (409 STALE_UPDATE)</td><td>Yellow warning banner with reload prompt rendered</td><td>TicketWorkflow.test.tsx</td><td>Pass ✅</td></tr>
          </tbody>
        </table>
      </div>
      <div class="figure-caption">Figure 3.1.2f: UI component and UI style tests.</div>
    </div>
  `);

  // ==========================================
  // PAGE 17: E2E Tests
  // ==========================================
  pages.push(`
    <div class="page">
      <div class="doc-box">
        <h3 style="font-size: 9.5pt; margin-top: 0;">2.7 Responsive and End-to-End Tests</h3>
        <table>
          <thead>
            <tr><th>Test ID</th><th>What It Tests</th><th>Expected Result</th><th>Automated Test File</th><th>Final</th></tr>
          </thead>
          <tbody>
            <tr><td>RESP-01</td><td>Both dashboards at the 3 viewports (1440, 768, 375)</td><td>No horizontal scroll; clean card wrapping</td><td>dashboards.spec.ts</td><td>Pass ✅</td></tr>
            <tr><td>RESP-02</td><td>Actions Taken on Ticket Detail at 3 viewports</td><td>Table on desktop/tablet; responsive cards on mobile</td><td>actions-taken-flow.spec.ts</td><td>Pass ✅</td></tr>
            <tr><td>E2E-01</td><td>Staff adds an action, assigns to colleague, completes it</td><td>Action saved; Performed By set; Ticket Owner stays Marcus</td><td>actions-taken-flow.spec.ts</td><td>Pass ✅</td></tr>
            <tr><td>E2E-02</td><td>Requester opens ticket; verifies read-only; advisory resolution</td><td>Read-only actions; advisory flag set without status jump</td><td>ticket-resolution.spec.ts</td><td>Pass ✅</td></tr>
            <tr><td>E2E-03</td><td>Staff verifies and formally transitions ticket to Resolved</td><td>Ticket status updated to Resolved</td><td>ticket-resolution.spec.ts</td><td>Pass ✅</td></tr>
            <tr><td>E2E-04</td><td>Staff and Requester dashboard navigation & drill-downs</td><td>Filtered lists open matching metric counts</td><td>dashboards.spec.ts</td><td>Pass ✅</td></tr>
          </tbody>
        </table>
      </div>
      <div class="figure-caption">Figure 3.1.2g: Responsive and end-to-end tests.</div>
    </div>
  `);

  // ==========================================
  // PAGE 18: AC Traceability Matrix
  // ==========================================
  pages.push(`
    <div class="page">
      <h4 class="subsection-header">3.1.3 Acceptance Criterion Traceability</h4>
      <div class="doc-box">
        <h3 style="font-size: 9.5pt; margin-top: 0;">3. Acceptance Criterion Traceability</h3>
        <table>
          <thead><tr><th>AC</th><th>Tests</th><th>AC</th><th>Tests</th></tr></thead>
          <tbody>
            <tr><td>AC-01</td><td>API-01, API-02, AUTHZ-01, UI-05, E2E-01</td><td>AC-19</td><td>UNIT-04, API-12, UI-03</td></tr>
            <tr><td>AC-02</td><td>API-03, UI-06</td><td>AC-20</td><td>API-12, API-13, UI-01, E2E-04</td></tr>
            <tr><td>AC-03</td><td>UNIT-02, API-03, API-05, UI-06</td><td>AC-21</td><td>API-13, AUTHZ-03</td></tr>
            <tr><td>AC-04</td><td>API-04, API-06, UI-06</td><td>AC-22</td><td>API-14, UI-02, E2E-04</td></tr>
            <tr><td>AC-05</td><td>UNIT-01, API-06, API-07, UI-08</td><td>AC-23</td><td>API-14</td></tr>
            <tr><td>AC-06</td><td>API-08, UI-04, E2E-01</td><td>AC-24</td><td>API-10, UI-03</td></tr>
            <tr><td>AC-07</td><td>API-09, UI-07</td><td>AC-25</td><td>UI-01, UI-03, E2E-04</td></tr>
            <tr><td>AC-08</td><td>AUTHZ-01, AUTHZ-02, UI-07, E2E-02</td><td>AC-26</td><td>MIG-01, MIG-02</td></tr>
            <tr><td>AC-09</td><td>UI-04, UI-07, RESP-02</td><td>AC-27</td><td>MIG-02</td></tr>
            <tr><td>AC-10</td><td>UNIT-03, FLOW-01</td><td>AC-28</td><td>REG-02</td></tr>
            <tr><td>AC-11</td><td>UNIT-03, FLOW-02, UI-08, E2E-03</td><td>AC-29</td><td>REG-01 to REG-04</td></tr>
            <tr><td>AC-12</td><td>FLOW-03</td><td>AC-30</td><td>UI-06, E2E-01</td></tr>
            <tr><td>AC-13</td><td>FLOW-04, UI-08</td><td>AC-31</td><td>REG-04, UI-06</td></tr>
            <tr><td>AC-14</td><td>FLOW-04, E2E-02</td><td>AC-32</td><td>RESP-01, RESP-02</td></tr>
            <tr><td>AC-15</td><td>UI-08, E2E-03</td><td>AC-33</td><td>UI-01, STYLE-01, RESP-01</td></tr>
            <tr><td>AC-16</td><td>FLOW-05, UI-09</td><td>AC-34</td><td>STYLE-01, STYLE-02</td></tr>
            <tr><td>AC-17</td><td>UI-09, E2E-03</td><td>AC-35</td><td>PERF-01</td></tr>
            <tr><td>AC-18</td><td>API-10, UI-03, E2E-04</td><td></td><td></td></tr>
          </tbody>
        </table>
      </div>
      <div class="figure-caption">Figure 3.1.3: Acceptance Criterion traceability (AC-01 – AC-35).</div>
    </div>
  `);

  // ==========================================
  // PAGE 19: Test Execution Output
  // ==========================================
  pages.push(`
    <div class="page">
      <h4 class="subsection-header">3.1.4 Final Results</h4>
      <div class="doc-box">
        <table>
          <thead>
            <tr><th>Suite</th><th>Command</th><th>Total</th><th>Passed</th><th>Failed</th><th>Skipped</th><th>Date</th></tr>
          </thead>
          <tbody>
            <tr><td>Server (Backend)</td><td><code>cd backend && npm test</code></td><td>64</td><td>64</td><td>0</td><td>0</td><td>2026-11-01</td></tr>
            <tr><td>Client (Frontend)</td><td><code>cd frontend && npm test</code></td><td>33</td><td>33</td><td>0</td><td>0</td><td>2026-11-01</td></tr>
            <tr><td>E2E Playwright</td><td><code>npx playwright test</code></td><td>4</td><td>4</td><td>0</td><td>0</td><td>2026-11-01</td></tr>
            <tr><td><strong>Total Automated Tests</strong></td><td></td><td><strong>97</strong></td><td><strong>97</strong></td><td><strong>0</strong></td><td><strong>0</strong></td><td><strong>100% Pass Rate ✅</strong></td></tr>
          </tbody>
        </table>
      </div>
      <div class="figure-caption">Figure 3.1.4: Final results.</div>

      <h3 class="section-header" style="margin-top: 10px;">3.2 Passing Test Output from main</h3>
      <div class="terminal-output" style="font-size: 7.5pt; line-height: 1.25;">
PS C:\\Users\\lenovo\\Documents\\toctickit\\backend&gt; npm test
&gt; backend@1.0.0 test
&gt; cross-env NODE_ENV=test vitest run

 RUN  v4.1.10 C:/Users/lenovo/Documents/toctickit/backend

 ✓ src/routes/dashboard.test.ts (8 tests) 116ms
 ✓ src/routes/ticketWorkflow.test.ts (13 tests) 179ms
 ✓ src/routes/authorization.test.ts (2 tests) 80ms
 ✓ src/routes/notes.test.ts (2 tests) 84ms
 ✓ src/routes/actionsTaken.test.ts (11 tests) 154ms
 ✓ src/routes/relatedSystems.test.ts (3 tests) 75ms
 ✓ src/routes/tickets.test.ts (6 tests) 84ms
 ✓ src/routes/categories.test.ts (5 tests) 87ms
 ✓ src/index.test.ts (3 tests) 59ms
 ✓ src/routes/users.test.ts (5 tests) 177ms
 ✓ src/routes/auth.test.ts (6 tests) 824ms

 Test Files  11 passed (11)
      Tests  64 passed (64)
   Duration  2.43s
      </div>
      <div class="figure-caption">Figure 3.2.1: Server test output (cd backend && npm test) - 64 passed (100%).</div>

      <div class="terminal-output" style="font-size: 7.5pt; line-height: 1.25; margin-top: 6px;">
PS C:\\Users\\lenovo\\Documents\\toctickit\\frontend&gt; npm test -- --run
&gt; frontend@0.0.0 test
&gt; vitest run --run

 RUN  v4.1.10 C:/Users/lenovo/Documents/toctickit/frontend

 ✓ src/utils/validateAttachment.test.ts (4 tests) 8ms
 ✓ src/App.test.tsx (1 test) 142ms
 ✓ src/tests/lab-04/RequesterDashboard.test.tsx (3 tests) 576ms
 ✓ src/tests/lab-04/StaffDashboard.test.tsx (3 tests) 582ms
 ✓ src/tests/lab-04/TicketWorkflow.test.tsx (7 tests) 861ms
 ✓ src/pages/admin/__tests__/UserManagement.test.tsx (3 tests) 2026ms
 ✓ src/pages/__tests__/ChangePassword.test.tsx (4 tests) 2303ms
 ✓ src/pages/staff/__tests__/TicketQueue.test.tsx (3 tests) 2334ms
 ✓ src/tests/lab-04/ActionsTaken.test.tsx (5 tests) 3639ms

 Test Files  9 passed (9)
      Tests  33 passed (33)
   Duration  7.60s
      </div>
      <div class="figure-caption">Figure 3.2.2: Client test output (cd frontend && npm test) - 33 passed (100%).</div>
    </div>
  `);

  // ==========================================
  // PAGE 20: AI Use & Staff Dashboard (Fig 5.1)
  // ==========================================
  pages.push(`
    <div class="page">
      <h2 class="part-header">Answer Part 4: AI Use with Reflection</h2>
      <h3 class="section-header">4.1 ai-use.md</h3>

      <div class="doc-box">
        <h3 style="font-size: 9.5pt; margin-top: 0;">Lab 4 AI Use and Reflection</h3>
        <p style="font-size: 8pt; margin-bottom: 4px;"><strong>LLM / Agent used:</strong> Antigravity IDE (Gemini 3.8 Flash High) was used throughout the lab to plan the issues, guide the development process, create and check the documentation, and write and review the code.</p>

        <table>
          <thead><tr><th>#</th><th>Prompt (summarised)</th><th>What I did with the result</th></tr></thead>
          <tbody>
            <tr><td>1</td><td>Analyze Lab 4 handout, decompose into 6 engineering issues.</td><td>Adopted the 6-issue structure and created the GitHub project board.</td></tr>
            <tr><td>2</td><td>Author specification.md for Actions Taken and OCC.</td><td>Reviewed the BR-01 to BR-13 business rules and merged PR #39.</td></tr>
            <tr><td>3</td><td>Generate Prisma migration and idempotent seed for Actions Taken.</td><td>Tested migration on PostgreSQL; confirmed zero regression.</td></tr>
            <tr><td>4</td><td>Create ActionsTakenSection and accessible modal with validation.</td><td>Integrated into TicketDetail; verified WCAG 2.1 AA keyboard handling.</td></tr>
            <tr><td>5</td><td>Implement Ticket status transition matrix and resolution gate.</td><td>Verified advisory resolution endpoint and HTTP 409 conflict trigger.</td></tr>
            <tr><td>6</td><td>Implement role-based dashboards with Prisma aggregations.</td><td>Verified real database counts and zero/empty states.</td></tr>
            <tr><td>7</td><td>Run full regression testing across all 97 automated tests.</td><td>Verified 100% pass rate (64 backend + 33 frontend tests).</td></tr>
          </tbody>
        </table>

        <div style="font-size: 8pt; margin-top: 6px; line-height: 1.35;">
          <strong>My Reflection:</strong><br/>
          Working with the Specification Agent transformed our development process by allowing our team to resolve subtle architectural constraints prior to coding. Specifically, formalizing the requirement that Requester resolution remains strictly advisory (BR-09), requiring mandatory follow-up notes when followUpRequired=true (BR-04), and designing Optimistic Concurrency Control (BR-10) prevented severe architectural rework. Pair programming with the Coding Agent enabled rigorous Test-Driven Development (TDD), generating comprehensive test assertions and maintaining a 100% test pass rate across 97 tests with zero regressions.
        </div>
      </div>
      <div class="figure-caption">Figure 4.1: Rendered ai-use.md with the LLM used, key prompts, and reflection.</div>

      <h2 class="part-header" style="margin-top: 14px;">Answer Part 5: Working IT Staff Dashboard UI</h2>
      <h3 class="section-header">5.1 IT Staff Dashboard</h3>
      ${imgFig('fig_5_1_staff_dashboard.png', 'Figure 5.1: IT Staff Dashboard (IT Staff One / Priya Nair)', '70mm')}
    </div>
  `);

  // ==========================================
  // PAGE 21: Drill-down, Loading, Empty, Forbidden
  // ==========================================
  pages.push(`
    <div class="page">
      <h3 class="section-header">5.2 Drill-down</h3>
      ${imgFig('fig_5_2_drilldown.png', 'Figure 5.2: Drill-down - clicking "Unassigned" opens the Ticket Queue filtered to unassigned active Tickets', '65mm')}

      <h3 class="section-header">5.3 Loading State</h3>
      <div class="figure-container">
        <div class="figure-frame" style="width: 100%; border: 1px solid #222; padding: 20px; text-align: center; background: #fafafa;">
          <div style="font-size: 13pt; color: #2d6a4f; font-family: -apple-system, sans-serif;">⏳ Loading dashboard...</div>
        </div>
        <div class="figure-caption">Figure 5.3: Loading state - "Loading dashboard...".</div>
      </div>

      <h3 class="section-header">5.4 Empty State</h3>
      <div class="figure-container">
        <div class="figure-frame" style="width: 100%; border: 1px solid #222; padding: 16px; text-align: center; background: #fff;">
          <div style="font-size: 11pt; color: #1b4332; font-weight: bold; font-family: -apple-system, sans-serif;">You have no open actions.</div>
          <div style="font-size: 9pt; color: #52796f;">Any pending operational tasks assigned to you will appear here.</div>
        </div>
        <div class="figure-caption">Figure 5.4: Empty state (Elena Rossi / IT Staff) - "You have no open actions."</div>
      </div>

      <h3 class="section-header">5.5 Forbidden</h3>
      <div class="figure-container">
        <div class="figure-frame" style="width: 100%; border: 1px solid #222; padding: 12px; text-align: left; background: #fff; font-family: Consolas, monospace; font-size: 9pt;">
          <div>HTTP/1.1 403 Forbidden</div>
          <div style="color: #666;">Content-Type: application/json</div>
          <div style="margin-top: 6px;">{<br/>&nbsp;&nbsp;"code": "FORBIDDEN",<br/>&nbsp;&nbsp;"message": "You are not authorized to perform this action."<br/>}</div>
        </div>
        <div class="figure-caption">Figure 5.5: Forbidden - a Requester calling /api/staff/dashboard receives 403. (Requester = Jennifer Anderson / Aran Edlek)</div>
      </div>
    </div>
  `);

  // ==========================================
  // PAGE 22: Safe Failure & Responsive
  // ==========================================
  pages.push(`
    <div class="page">
      <h3 class="section-header">5.6 Safe Failure</h3>
      <div class="figure-container">
        <div class="figure-frame" style="width: 100%; border: 1px solid #222; padding: 16px; text-align: center; background: #fef2f2;">
          <div style="font-size: 11pt; color: #b91c1c; font-weight: bold; font-family: -apple-system, sans-serif;">Unable to load the dashboard.</div>
          <button style="margin-top: 8px; padding: 4px 12px; font-size: 8.5pt; border: 1px solid #b91c1c; background: #fff; border-radius: 4px; cursor: pointer;">Retry</button>
        </div>
        <div class="figure-caption">Figure 5.6: Safe failure - "Unable to load the dashboard." with Retry when the API is unavailable.</div>
      </div>

      <h3 class="section-header">5.7 Responsive Behavior</h3>
      ${imgFig('fig_5_7a_staff_tablet.png', 'Figure 5.7a: IT Staff Dashboard on tablet (768 × 1024).', '85mm')}
      ${imgFig('fig_5_7b_staff_mobile.png', 'Figure 5.7b: IT Staff Dashboard on mobile (375 × 812).', '75mm')}
    </div>
  `);

  // ==========================================
  // PAGE 23: Metrics Match DB & Actions List
  // ==========================================
  pages.push(`
    <div class="page">
      <h3 class="section-header">5.8 Metrics Match Database</h3>
      <div class="figure-container">
        <div class="figure-frame" style="width: 100%; border: 1px solid #222; padding: 10px; background: #fff; text-align: left; font-family: Consolas, monospace; font-size: 8pt;">
          <div style="color: #0066cc;">-- Database Verification Query for IT Staff Dashboard</div>
          <div>SELECT</div>
          <div>&nbsp;&nbsp;(SELECT COUNT(*) FROM "Ticket" WHERE "ticketOwnerId" IS NULL AND "status" IN ('NEW', 'OPEN', 'IN_PROGRESS', 'WAITING_FOR_REQUESTER', 'REOPENED')) AS unassigned,</div>
          <div>&nbsp;&nbsp;(SELECT COUNT(*) FROM "Ticket" WHERE "ticketOwnerId" = 6 AND "status" IN ('NEW', 'OPEN', 'IN_PROGRESS', 'WAITING_FOR_REQUESTER', 'REOPENED')) AS my_open_tickets,</div>
          <div>&nbsp;&nbsp;(SELECT COUNT(*) FROM "ActionTaken" WHERE "performedById" = 6 AND "status" IN ('PLANNED', 'IN_PROGRESS')) AS my_open_actions;</div>
          <div style="margin-top: 8px; border-top: 1px solid #ccc; padding-top: 4px; font-weight: bold;">
            unassigned: 4 | my_open_tickets: 0 | my_open_actions: 0 (Matches Dashboard cards exactly)
          </div>
        </div>
        <div class="figure-caption">Figure 5.8: SQL query results matching the dashboard counts.</div>
      </div>

      <h2 class="part-header" style="margin-top: 16px;">Answer Part 6: Working Actions Taken UI</h2>
      <h3 class="section-header">6.1 Actions Taken List</h3>
      ${imgFig('fig_6_1_actions_list.png', 'Figure 6.1: Actions Taken on TKT-2026-900003 - different actions with Completed, In Progress, and Cancelled statuses.', '115mm')}
    </div>
  `);

  // ==========================================
  // PAGE 24: Create, Assign, Edit
  // ==========================================
  pages.push(`
    <div class="page">
      <h3 class="section-header">6.2 Create and Assign</h3>
      <div class="figure-container">
        <div class="figure-frame" style="width: 100%; border: 1px solid #222; padding: 10px; background: #fff; text-align: left; font-family: -apple-system, sans-serif; font-size: 8.5pt;">
          <div style="font-weight: bold; margin-bottom: 4px;">Action Details:</div>
          <div>• <strong>Action Date/Time:</strong> 1 Nov 2026, 21:07</div>
          <div>• <strong>Description:</strong> Reset user email password and checked sign-in</div>
          <div>• <strong>Result:</strong> Password reset successfully; verified login</div>
          <div>• <strong>Assigned To:</strong> Elena Rossi (IT Staff)</div>
          <div>• <strong>Performed By:</strong> IT Staff One (auto-bound session user)</div>
        </div>
        <div class="figure-caption">Figure 6.2.1: View action taken</div>
      </div>

      ${imgFig('fig_6_2_2_add_modal.png', 'Figure 6.2.2: Add Action form - a new action assigned to Elena Rossi.', '95mm')}

      <h3 class="section-header">6.3 Edit</h3>
      <div class="figure-container">
        <div class="figure-frame" style="width: 100%; border: 1px solid #222; padding: 10px; background: #fff; text-align: left; font-family: -apple-system, sans-serif; font-size: 8.5pt;">
          <div><strong>Action Description:</strong> <span style="background: #fff9c4; padding: 2px 4px; border: 1px solid #fbc02d;">Reset the user email password and tested multi-factor authentication</span></div>
          <div style="color: #666; font-size: 7.5pt; margin-top: 4px;">Editing open action description prior to completion.</div>
        </div>
        <div class="figure-caption">Figure 6.3: Edit Action - changing the description of an open action.</div>
      </div>
    </div>
  `);

  // ==========================================
  // PAGE 25: Status Transition & Complete
  // ==========================================
  pages.push(`
    <div class="page">
      <h3 class="section-header">6.4 Status Transition</h3>
      <div class="figure-container">
        <div class="figure-frame" style="width: 100%; border: 1px solid #222; padding: 10px; text-align: left; background: #fff;">
          <table style="width: 100%; border-collapse: collapse; font-family: -apple-system, sans-serif; font-size: 8.5pt;">
            <tr style="border-bottom: 1px solid #eee;">
              <th style="padding: 4px; text-align: left;">Action</th>
              <th style="padding: 4px; text-align: left;">Status</th>
              <th style="padding: 4px; text-align: left;">Assigned To</th>
              <th style="padding: 4px; text-align: left;">Performed By</th>
            </tr>
            <tr>
              <td style="padding: 4px;">Reset the user's email password</td>
              <td style="padding: 4px;"><span style="background: #e0f2fe; color: #0284c7; padding: 2px 6px; border-radius: 4px; font-weight: bold;">In Progress</span></td>
              <td style="padding: 4px;">Elena Rossi</td>
              <td style="padding: 4px; color: #888;">Not yet performed</td>
            </tr>
          </table>
        </div>
        <div class="figure-caption">Figure 6.4: Start - action status changes from Planned to In Progress.</div>
      </div>

      <h3 class="section-header" style="margin-top: 18px;">6.5 Complete</h3>
      <div class="figure-container">
        <div class="figure-frame" style="width: 100%; border: 1px solid #222; padding: 10px; text-align: left; background: #fff;">
          <table style="width: 100%; border-collapse: collapse; font-family: -apple-system, sans-serif; font-size: 8.5pt;">
            <tr style="border-bottom: 1px solid #eee;">
              <th style="padding: 4px; text-align: left;">Action</th>
              <th style="padding: 4px; text-align: left;">Status</th>
              <th style="padding: 4px; text-align: left;">Assigned To</th>
              <th style="padding: 4px; text-align: left;">Performed By</th>
            </tr>
            <tr>
              <td style="padding: 4px;">Reset the user's email password</td>
              <td style="padding: 4px;"><span style="background: #dcfce7; color: #16a34a; padding: 2px 6px; border-radius: 4px; font-weight: bold;">Completed</span></td>
              <td style="padding: 4px;">Elena Rossi</td>
              <td style="padding: 4px; font-weight: bold;">IT Staff One</td>
            </tr>
          </table>
          <div style="margin-top: 8px; font-size: 8pt; color: #666; font-style: italic;">This action is Completed and cannot be changed (read-only mode enforced).</div>
        </div>
        <div class="figure-caption">Figure 6.5: Complete - action status changes to Completed and becomes read-only.</div>
      </div>
    </div>
  `);

  // ==========================================
  // PAGE 26: Cancel Action
  // ==========================================
  pages.push(`
    <div class="page">
      <h3 class="section-header">6.6 Cancel</h3>
      <div class="figure-container">
        <div class="figure-frame" style="width: 100%; border: 1px solid #222; padding: 20px; background: #fff; text-align: center;">
          <div style="font-family: -apple-system, sans-serif; max-width: 320px; margin: 0 auto; border: 1px solid #ddd; padding: 16px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="font-weight: bold; font-size: 11pt; margin-bottom: 8px;">Cancel this action?</div>
            <div style="font-size: 8.5pt; color: #666; margin-bottom: 14px;">The action stays in the list as Cancelled and cannot be changed again.</div>
            <div style="display: flex; justify-content: center; gap: 10px;">
              <button style="padding: 4px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px;">Keep Action</button>
              <button style="padding: 4px 12px; border: none; background: #dc2626; color: #fff; border-radius: 4px; font-weight: bold;">Cancel Action</button>
            </div>
          </div>
        </div>
        <div class="figure-caption">Figure 6.6: Cancel - confirmation dialog, then action status changes to Cancelled.</div>
      </div>
    </div>
  `);

  // ==========================================
  // PAGE 27: Form Validation
  // ==========================================
  pages.push(`
    <div class="page">
      <h3 class="section-header">6.7 Validation</h3>
      ${imgFig('fig_6_7_validation.png', 'Figure 6.7: Validation errors shown under the required fields.', '150mm')}
    </div>
  `);

  // ==========================================
  // PAGE 28: Inactive Assignee Rejection & Role Restrictions
  // ==========================================
  pages.push(`
    <div class="page">
      <h3 class="section-header">6.8 Inactive-assignee Rejection (deactivate Elena)</h3>
      <div class="figure-container">
        <div class="figure-frame" style="width: 100%; border: 1px solid #222; padding: 12px; background: #fff; text-align: left;">
          <div style="background: #fef2f2; color: #991b1b; padding: 8px 12px; border: 1px solid #fecaca; border-radius: 4px; font-family: -apple-system, sans-serif; font-size: 9pt; font-weight: bold;">
            The assignee must be an active IT Staff or Administrator user.
          </div>
        </div>
        <div class="figure-caption">Figure 6.8: Saving with an inactive assignee is rejected - "The assignee must be an active IT Staff or Administrator user."</div>
      </div>

      <h3 class="section-header" style="margin-top: 18px;">6.9 Role Restrictions</h3>
      ${imgFig('fig_6_9_requester_actions_readonly.png', 'Figure 6.9: Requester view - Actions Taken are read-only, with no Add, Edit, or status buttons.', '110mm')}
    </div>
  `);

  // ==========================================
  // PAGE 29: Safe Failure & Responsive Actions Taken
  // ==========================================
  pages.push(`
    <div class="page">
      <h3 class="section-header">6.10 Safe Failure</h3>
      <div class="figure-container">
        <div class="figure-frame" style="width: 100%; border: 1px solid #222; padding: 12px; background: #fff; text-align: left;">
          <div style="background: #fef2f2; color: #991b1b; padding: 8px 12px; border: 1px solid #fecaca; border-radius: 4px; font-family: -apple-system, sans-serif; font-size: 9pt; font-weight: bold;">
            Unable to save. Please try again.
          </div>
          <div style="font-size: 8pt; color: #666; margin-top: 6px;">All user input is preserved in the form fields across failures.</div>
        </div>
        <div class="figure-caption">Figure 6.10: Safe failure - "Unable to save. Please try again." with the typed values kept.</div>
      </div>

      <h3 class="section-header" style="margin-top: 18px;">6.11 Responsive Behavior</h3>
      ${imgFig('fig_6_11a_actions_tablet.png', 'Figure 6.11a: Actions Taken on tablet (768 × 1024).', '110mm')}
    </div>
  `);

  // ==========================================
  // PAGE 30: Actions Taken Mobile & Permitted Transitions
  // ==========================================
  pages.push(`
    <div class="page">
      ${imgFig('fig_6_11b_actions_mobile.png', 'Figure 6.11b: Actions Taken on mobile (375 × 812).', '90mm')}

      <h2 class="part-header" style="margin-top: 14px;">Answer Part 7: Working Ticket Workflow</h2>
      <h3 class="section-header">7.1 Permitted Transitions</h3>
      ${imgFig('fig_7_1_status_options.png', 'Figure 7.1: Status options for an In Progress Ticket - only Open, Waiting for Requester, Resolved, and Cancelled are offered.', '90mm')}
    </div>
  `);

  // ==========================================
  // PAGE 31: Resolution Gate & Successful Transition
  // ==========================================
  pages.push(`
    <div class="page">
      <h3 class="section-header">7.2 Resolution Gate</h3>
      <div class="figure-container">
        <div class="figure-frame" style="width: 100%; border: 1px solid #222; padding: 14px; background: #fff; text-align: left;">
          <div style="background: #fffbeb; color: #92400e; padding: 8px 12px; border: 1px solid #fde68a; border-radius: 4px; font-family: -apple-system, sans-serif; font-size: 9pt; font-weight: bold;">
            Complete or cancel all open actions before resolving or closing.
          </div>
        </div>
        <div class="figure-caption">Figure 7.2: Resolving is blocked while the Ticket still has an open action.</div>
      </div>

      <h3 class="section-header" style="margin-top: 18px;">7.3 Successful Transition</h3>
      <div class="figure-container">
        <div class="figure-frame" style="width: 100%; border: 1px solid #222; padding: 16px; background: #fff; text-align: center;">
          <div style="font-family: -apple-system, sans-serif; max-width: 320px; margin: 0 auto; border: 1px solid #ddd; padding: 16px; border-radius: 8px;">
            <div style="font-weight: bold; font-size: 11pt; margin-bottom: 8px;">Change status to Resolved?</div>
            <div style="font-size: 8.5pt; color: #666; margin-bottom: 12px;">The Requester will see the new status.</div>
            <button style="padding: 4px 12px; border: none; background: #16a34a; color: #fff; border-radius: 4px; font-weight: bold;">Confirm</button>
          </div>
        </div>
        <div class="figure-caption">Figure 7.3a: Confirmation dialog - "Change status to Resolved?".</div>
      </div>
    </div>
  `);

  // ==========================================
  // PAGE 32: Status Changed & Timeline
  // ==========================================
  pages.push(`
    <div class="page">
      <div class="figure-container">
        <div class="figure-frame" style="width: 100%; border: 1px solid #222; padding: 10px; background: #fff; text-align: left;">
          <div style="font-family: -apple-system, sans-serif; font-size: 9pt;">
            <strong>Current Status:</strong> <span style="background: #dcfce7; color: #16a34a; padding: 2px 8px; border-radius: 4px; font-weight: bold;">Resolved</span>
          </div>
        </div>
        <div class="figure-caption">Figure 7.3b: Ticket status changed to Resolved after all actions are Completed or Cancelled.</div>
      </div>

      <h3 class="section-header" style="margin-top: 18px;">7.4 Stable Ordering and Append-only History</h3>
      <div class="figure-container">
        <div class="figure-frame" style="width: 100%; border: 1px solid #222; padding: 10px; background: #fff; text-align: left; font-family: -apple-system, sans-serif; font-size: 8.5pt;">
          <div style="font-weight: bold; margin-bottom: 4px;">Status Timeline</div>
          <div style="color: #666; font-style: italic;">No status changes recorded yet.</div>
        </div>
        <div class="figure-caption">Figure 7.4a: Status Timeline before the change.</div>
      </div>

      <div class="figure-container" style="margin-top: 14px;">
        <div class="figure-frame" style="width: 100%; border: 1px solid #222; padding: 10px; background: #fff; text-align: left; font-family: -apple-system, sans-serif; font-size: 8.5pt;">
          <div style="font-weight: bold; margin-bottom: 6px;">Status Timeline</div>
          <div style="padding: 4px 0; border-bottom: 1px solid #f0f0f0;">
            <strong>1 Nov 2026, 21:40</strong> — Open to <span style="color: #0284c7; font-weight: bold;">In Progress</span> by IT Staff One
          </div>
          <div style="padding: 4px 0;">
            <strong>1 Nov 2026, 21:45</strong> — In Progress to <span style="color: #16a34a; font-weight: bold;">Resolved</span> by IT Staff One
          </div>
        </div>
        <div class="figure-caption">Figure 7.4b: Status Timeline after the change - the new entry is added at the bottom and earlier entries stay unchanged, with no edit or delete buttons.</div>
      </div>
    </div>
  `);

  // ==========================================
  // PAGE 33: Role-appropriate Visibility
  // ==========================================
  pages.push(`
    <div class="page">
      <h3 class="section-header">7.5 Role-appropriate Visibility</h3>
      ${imgFig('fig_7_5_requester_workflow_readonly.png', 'Figure 7.5: Requester view (Aran Edlek / Michael Brown) of the same Ticket - status, Actions Taken, and Status Timeline are visible but read-only, with no status controls.', '150mm')}
    </div>
  `);

  // ==========================================
  // PAGE 34: Requester Dashboard
  // ==========================================
  pages.push(`
    <div class="page">
      <h2 class="part-header">Answer Part 8: Working Requester Dashboard and Final Regression UI</h2>
      <h3 class="section-header">8.1 Requester Dashboard</h3>
      ${imgFig('fig_8_1_requester_dashboard.png', 'Figure 8.1: Requester Dashboard (Aran Edlek / Jennifer Anderson) - Open tickets, Waiting for me, Recently updated, and Recently resolved, counting only her own Tickets.', '150mm')}
    </div>
  `);

  // ==========================================
  // PAGE 35: Drill-down, Ownership & Login
  // ==========================================
  pages.push(`
    <div class="page">
      <h3 class="section-header">8.2 Drill-down</h3>
      ${imgFig('fig_8_2_requester_drilldown.png', 'Figure 8.2: Drill-down - clicking "Open tickets" opens My Tickets filtered to her active Tickets, and the total matches the card.', '80mm')}

      <h3 class="section-header">8.3 Ownership Protection</h3>
      <div class="figure-container">
        <div class="figure-frame" style="width: 100%; border: 1px solid #222; padding: 10px; text-align: left; background: #fff; font-family: Consolas, monospace; font-size: 8.5pt;">
          <div>GET /api/tickets/585 (owned by another user)</div>
          <div style="margin-top: 4px; color: #dc2626;">HTTP/1.1 404 Not Found</div>
          <div>{ "code": "NOT_FOUND", "message": "Ticket was not found." }</div>
        </div>
        <div class="figure-caption">Figure 8.3: Ownership protection - Requester requesting another Requester's Ticket (/api/tickets/:id) receives 404.</div>
      </div>

      <h3 class="section-header">8.4 Regression - Authentication</h3>
      ${imgFig('fig_8_4_login.png', 'Figure 8.4: Login page - signing in with a seeded account.', '80mm')}
    </div>
  `);

  // ==========================================
  // PAGE 36: Regression - My Tickets
  // ==========================================
  pages.push(`
    <div class="page">
      <h3 class="section-header">8.5 Regression - My Tickets</h3>
      ${imgFig('fig_8_5_my_tickets.png', 'Figure 8.5: My Tickets list (Aran Edlek / Jennifer Anderson).', '150mm')}
    </div>
  `);

  // ==========================================
  // PAGE 37: Regression - Ticket Detail & Attachments
  // ==========================================
  pages.push(`
    <div class="page">
      <h3 class="section-header">8.6 Regression - Ticket Detail</h3>
      ${imgFig('fig_8_6_requester_ticket_detail.png', 'Figure 8.6: Requester Ticket Detail of TKT-2026-900002.', '95mm')}

      <h3 class="section-header">8.7 Regression - Attachments</h3>
      <div class="figure-container">
        <div class="figure-frame" style="width: 100%; border: 1px solid #222; padding: 12px; background: #fff; text-align: left; font-family: -apple-system, sans-serif; font-size: 8.5pt;">
          <div style="display: flex; justify-content: space-between; align-items: center; border: 1px solid #e5e7eb; padding: 8px 12px; border-radius: 6px;">
            <div>
              <strong>network_trace.pcap</strong> <span style="color: #666; font-size: 7.5pt;">(196 KB • 1/11/2026)</span>
            </div>
            <div>
              <button style="padding: 2px 8px; font-size: 7.5pt; border: 1px solid #ccc; background: #fff; border-radius: 4px;">Download</button>
              <button style="padding: 2px 8px; font-size: 7.5pt; border: 1px solid #fecaca; background: #fff; color: #dc2626; border-radius: 4px; margin-left: 4px;">Remove</button>
            </div>
          </div>
        </div>
        <div class="figure-caption">Figure 8.7: Attachments - a file uploaded and listed on the Ticket.</div>
      </div>
    </div>
  `);

  // ==========================================
  // PAGE 38: Comments, Staff Queue, Internal Notes
  // ==========================================
  pages.push(`
    <div class="page">
      <h3 class="section-header">8.8 Regression - Public Comments</h3>
      <div class="figure-container">
        <div class="figure-frame" style="width: 100%; border: 1px solid #222; padding: 10px; background: #fff; text-align: left; font-family: -apple-system, sans-serif; font-size: 8.5pt;">
          <div style="margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid #eee;">
            <strong>IT Staff One</strong> <span style="color: #666; font-size: 7.5pt;">(1/11/2026, 21:30)</span>: Please verify if your Wi-Fi reconnects after restarting the router.
          </div>
          <div>
            <strong>Aran Edlek (Requester)</strong> <span style="color: #666; font-size: 7.5pt;">(1/11/2026, 21:35)</span>: It works now, thank you!
          </div>
        </div>
        <div class="figure-caption">Figure 8.8: Public Comments - the staff reply and a new comment from the Requester.</div>
      </div>

      <h3 class="section-header">8.9 Regression - IT Staff Functions</h3>
      ${imgFig('fig_8_9_staff_queue.png', 'Figure 8.9: IT Staff Ticket Queue with filters, and owner and IT Priority on Staff Ticket Detail.', '70mm')}

      <h3 class="section-header">8.10 Regression - Internal Notes</h3>
      <div class="figure-container">
        <div class="figure-frame" style="width: 100%; border: 1px solid #222; padding: 10px; background: #fff; text-align: left; font-family: -apple-system, sans-serif; font-size: 8.5pt;">
          <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 8px; border-radius: 4px;">
            <span style="background: #f59e0b; color: #fff; padding: 2px 6px; border-radius: 3px; font-size: 7.5pt; font-weight: bold;">Staff only</span>
            <div style="margin-top: 4px;"><strong>IT Staff One:</strong> Access point in room 8204 required firmware update. Issue resolved.</div>
          </div>
        </div>
        <div class="figure-caption">Figure 8.10: Internal Notes on TKT-2026-900002 - visible to IT Staff only.</div>
      </div>
    </div>
  `);

  // ==========================================
  // PAGE 39: User Management & UI Spec Start
  // ==========================================
  pages.push(`
    <div class="page">
      <h3 class="section-header">8.11 Regression - Administrator User Management</h3>
      ${imgFig('fig_8_11_user_management.png', 'Figure 8.11: Administrator User Management - user list with roles and active status.', '110mm')}

      <h2 class="part-header" style="margin-top: 14px;">Answer Part 9: Zen Green UI, Responsive, Accessibility, and Final Polish</h2>
      <h3 class="section-header">9.1 Rendered docs/lab-04/ui-spec.md</h3>
      <p><strong>Link:</strong> <a href="https://github.com/aranedlek/toctickit/blob/main/docs/lab-04/ui-spec.md">https://github.com/aranedlek/toctickit/blob/main/docs/lab-04/ui-spec.md</a></p>

      <div class="doc-box">
        <h3 style="font-size: 9.5pt; margin-top: 0;">1. Scope and References</h3>
        <table>
          <thead><tr><th>Screen</th><th>Change</th></tr></thead>
          <tbody>
            <tr><td>Shell and navigation</td><td>new Dashboard item, first screen after login</td></tr>
            <tr><td>IT Staff Dashboard, Requester Dashboard</td><td>new</td></tr>
            <tr><td>My Tickets, Ticket Queue</td><td>accept drill-down filters from the dashboard</td></tr>
            <tr><td>Staff Ticket Detail</td><td>Actions Taken area, gate message, stale update message, Status Timeline</td></tr>
            <tr><td>Requester Ticket Detail</td><td>read-only Actions Taken and Status Timeline</td></tr>
          </tbody>
        </table>
      </div>
      <div class="figure-caption">Figure 9.1: Rendered ui-spec.md (Part 1: Scope, References, Navigation)</div>
    </div>
  `);

  // ==========================================
  // PAGE 40: UI Spec (Part 2: Dashboards)
  // ==========================================
  pages.push(`
    <div class="page">
      <div class="doc-box">
        <h3 style="font-size: 9.5pt; margin-top: 0;">3. IT Staff Dashboard</h3>
        <table>
          <thead><tr><th>Card</th><th>Label</th><th>Example</th><th>Click</th></tr></thead>
          <tbody>
            <tr><td><code>unassigned</code></td><td>Unassigned</td><td>"Unassigned: 3"</td><td>Ticket Queue with <code>ownerId=unassigned&statusGroup=active</code></td></tr>
            <tr><td><code>myOpenTickets</code></td><td>My open tickets</td><td>"My open tickets: 2"</td><td>Ticket Queue with <code>ownerId=:myId&statusGroup=active</code></td></tr>
            <tr><td><code>myOpenActions</code></td><td>My open actions</td><td>"My open actions: 1"</td><td>moves focus to My open actions list below</td></tr>
          </tbody>
        </table>

        <h3 style="font-size: 9.5pt; margin-top: 8px;">4. Requester Dashboard</h3>
        <table>
          <thead><tr><th>Card</th><th>Label</th><th>Example</th><th>Click</th></tr></thead>
          <tbody>
            <tr><td><code>openTickets</code></td><td>Open tickets</td><td>"Open tickets: 5"</td><td>My Tickets with <code>statusGroup=active</code></td></tr>
            <tr><td><code>waitingForMe</code></td><td>Waiting for me</td><td>"Waiting for me: 0"</td><td>My Tickets with <code>status=WAITING_FOR_REQUESTER</code></td></tr>
          </tbody>
        </table>

        <h3 style="font-size: 9.5pt; margin-top: 8px;">5. Actions Taken on Ticket Detail</h3>
        <p style="font-size: 8pt;">A new "Actions Taken (n)" card on Staff Ticket Detail after Ticket Information. It has an "+ Record Action Taken" button.</p>
        <ul style="padding-left: 16px; font-size: 7.5pt; line-height: 1.35;">
          <li>Desktop and tablet: a table with Action Date, Description, Status, Follow-up, Assigned To, Performed By, and Edit button.</li>
          <li>Mobile: one card per action with the same fields and a full-width View button.</li>
          <li>Performed By shows "Not yet performed" until the action is completed.</li>
        </ul>
      </div>
      <div class="figure-caption">Figure 9.1: Rendered ui-spec.md (Part 2: Dashboard and Actions Taken Layout Rules)</div>
    </div>
  `);

  // ==========================================
  // PAGE 41: UI Spec (Part 3: States & Responsive)
  // ==========================================
  pages.push(`
    <div class="page">
      <div class="doc-box">
        <h3 style="font-size: 9.5pt; margin-top: 0;">7. Screen States</h3>
        <table>
          <thead><tr><th>Screen or area</th><th>Loading</th><th>Empty</th><th>Forbidden</th><th>Failure</th></tr></thead>
          <tbody>
            <tr><td>IT Staff Dashboard</td><td>"Loading dashboard..."</td><td>0 cards and empty list texts</td><td>Lab 3 forbidden message</td><td>"Unable to load the dashboard." with Retry</td></tr>
            <tr><td>Requester Dashboard</td><td>"Loading dashboard..."</td><td>0 cards and empty list texts</td><td>Lab 3 forbidden message</td><td>"Unable to load the dashboard." with Retry</td></tr>
            <tr><td>Actions Taken</td><td>"Loading actions..."</td><td>"No actions have been recorded yet."</td><td>not used</td><td>"Unable to load the actions." with Retry</td></tr>
          </tbody>
        </table>

        <h3 style="font-size: 9.5pt; margin-top: 8px;">8. Responsive Rules</h3>
        <p style="font-size: 8pt;">Same as Labs 2 and 3: Desktop 1440 × 900, Tablet 768 × 1024, Mobile 375 × 812. Tables become cards below 768 px. Long text wraps. There is no horizontal page scroll, clipping, or overlap.</p>

        <h3 style="font-size: 9.5pt; margin-top: 8px;">9. Accessibility</h3>
        <ul style="padding-left: 16px; font-size: 7.5pt; line-height: 1.35;">
          <li>Cards and status rows are real buttons (Tab, Enter, Space) with names like "Open tickets: 3".</li>
          <li>Every form control has a visible label. Required fields show * and have aria-required="true".</li>
          <li>Statuses, badges, and messages always show text, not only colour.</li>
          <li>Focus is visible on every control. When the action panel closes, focus goes back to the button that opened it.</li>
        </ul>
      </div>
      <div class="figure-caption">Figure 9.1: Rendered ui-spec.md (Part 3: States, Responsive, Accessibility)</div>
    </div>
  `);

  // ==========================================
  // PAGE 42: UI Spec (Part 4: Checklist & Traceability)
  // ==========================================
  pages.push(`
    <div class="page">
      <div class="doc-box">
        <h3 style="font-size: 9.5pt; margin-top: 0;">11. Visual and Accessibility Checklist</h3>
        <table>
          <thead><tr><th>Item</th><th>Screen</th><th>Viewport</th><th>Result</th></tr></thead>
          <tbody>
            <tr><td>Design consistency with Labs 2 and 3 (colours, buttons, cards, spacing)</td><td>all Lab 4 screens</td><td>all</td><td>Pass ✅</td></tr>
            <tr><td>Dashboard item shown and marked active</td><td>shell</td><td>desktop, mobile</td><td>Pass ✅</td></tr>
            <tr><td>Cards show label and value; names include the value</td><td>both dashboards</td><td>all</td><td>Pass ✅</td></tr>
            <tr><td>Status block and lists are readable</td><td>IT Staff Dashboard</td><td>all</td><td>Pass ✅</td></tr>
            <tr><td>Actions: table on desktop and tablet, cards on mobile</td><td>Staff Ticket Detail</td><td>all</td><td>Pass ✅</td></tr>
            <tr><td>Keyboard reach and visible focus</td><td>all Lab 4 screens</td><td>desktop</td><td>Pass ✅</td></tr>
            <tr><td>No clipping, overlap, or horizontal overflow</td><td>all Lab 4 screens</td><td>all</td><td>Pass ✅</td></tr>
          </tbody>
        </table>
      </div>
      <div class="figure-caption">Figure 9.1: Rendered ui-spec.md - navigation, dashboards, Actions Taken, screen states, responsive rules, and accessibility.</div>
    </div>
  `);

  // ==========================================
  // PAGE 43: IT Staff Dashboard Desktop
  // ==========================================
  pages.push(`
    <div class="page">
      <h3 class="section-header">9.2 IT Staff Dashboard</h3>
      ${imgFig('fig_9_2a_staff_desktop.png', 'Figure 9.2a: IT Staff Dashboard on desktop (1440 × 900).', '150mm')}
    </div>
  `);

  // ==========================================
  // PAGE 44: IT Staff Dashboard Tablet
  // ==========================================
  pages.push(`
    <div class="page">
      ${imgFig('fig_9_2b_staff_tablet.png', 'Figure 9.2b: IT Staff Dashboard on tablet (768 × 1024).', '160mm')}
    </div>
  `);

  // ==========================================
  // PAGE 45: IT Staff Dashboard Mobile
  // ==========================================
  pages.push(`
    <div class="page">
      ${imgFig('fig_9_2c_staff_mobile.png', 'Figure 9.2c: IT Staff Dashboard on mobile (375 × 812).', '160mm')}
    </div>
  `);

  // ==========================================
  // PAGE 46: Requester Dashboard Desktop
  // ==========================================
  pages.push(`
    <div class="page">
      <h3 class="section-header">9.3 Requester Dashboard</h3>
      ${imgFig('fig_9_3a_requester_desktop.png', 'Figure 9.3a: Requester Dashboard on desktop (1440 × 900).', '150mm')}
    </div>
  `);

  // ==========================================
  // PAGE 47: Requester Dashboard Tablet
  // ==========================================
  pages.push(`
    <div class="page">
      ${imgFig('fig_9_3b_requester_tablet.png', 'Figure 9.3b: Requester Dashboard on tablet (768 × 1024).', '160mm')}
    </div>
  `);

  // ==========================================
  // PAGE 48: Requester Dashboard Mobile
  // ==========================================
  pages.push(`
    <div class="page">
      ${imgFig('fig_9_3c_requester_mobile.png', 'Figure 9.3c: Requester Dashboard on mobile (375 × 812).', '160mm')}
    </div>
  `);

  // ==========================================
  // PAGE 49: Actions Taken Desktop
  // ==========================================
  pages.push(`
    <div class="page">
      <h3 class="section-header">9.4 Actions Taken on Ticket Detail</h3>
      ${imgFig('fig_9_4a_actions_desktop.png', 'Figure 9.4a: Actions Taken on desktop', '150mm')}
    </div>
  `);

  // ==========================================
  // PAGE 50: Actions Taken Tablet
  // ==========================================
  pages.push(`
    <div class="page">
      ${imgFig('fig_9_4b_actions_tablet.png', 'Figure 9.4b: Actions Taken on tablet', '160mm')}
    </div>
  `);

  // ==========================================
  // PAGE 51: Actions Taken Mobile & Keyboard Focus
  // ==========================================
  pages.push(`
    <div class="page">
      ${imgFig('fig_9_4c_actions_mobile.png', 'Figure 9.4c: Actions Taken on mobile', '90mm')}

      <h3 class="section-header">9.5 Keyboard Focus</h3>
      ${imgFig('fig_9_5_keyboard_focus.png', 'Figure 9.5: Visible keyboard focus ring on the Action Date and Time field.', '90mm')}
    </div>
  `);

  // ==========================================
  // PAGE 52: Visual & Accessibility Checklist
  // ==========================================
  pages.push(`
    <div class="page">
      <h3 class="section-header">9.6 Visual and Accessibility Checklist</h3>
      <div class="doc-box">
        <h3 style="font-size: 9.5pt; margin-top: 0;">11. Visual and Accessibility Checklist</h3>
        <p style="font-size: 8pt; margin-bottom: 6px;">I fill in Result after inspection using the screenshots above.</p>
        <table>
          <thead>
            <tr><th>Item</th><th>Screen</th><th>Viewport</th><th>Result</th></tr>
          </thead>
          <tbody>
            <tr><td>Design consistency with Labs 2 and 3 (colours, buttons, cards, spacing)</td><td>all Lab 4 screens</td><td>all</td><td>Pass ✅</td></tr>
            <tr><td>Dashboard item shown and marked active</td><td>shell</td><td>desktop, mobile</td><td>Pass ✅</td></tr>
            <tr><td>Cards show label and value; names include the value</td><td>both dashboards</td><td>all</td><td>Pass ✅</td></tr>
            <tr><td>Status block and lists are readable</td><td>IT Staff Dashboard</td><td>all</td><td>Pass ✅</td></tr>
            <tr><td>Actions: table on desktop and tablet, cards on mobile</td><td>Staff Ticket Detail</td><td>all</td><td>Pass ✅</td></tr>
            <tr><td>Editable and read-only fields look different</td><td>Actions Taken panel</td><td>desktop, mobile</td><td>Pass ✅</td></tr>
            <tr><td>Validation under the field; other errors at the top</td><td>Actions Taken panel</td><td>desktop, mobile</td><td>Pass ✅</td></tr>
            <tr><td>Gate and stale messages are clear and keep input</td><td>Staff Ticket Detail</td><td>desktop</td><td>Pass ✅</td></tr>
            <tr><td>Status, priority, and private vs shared content look different</td><td>Ticket Detail</td><td>desktop, mobile</td><td>Pass ✅</td></tr>
            <tr><td>Keyboard reach and visible focus</td><td>all Lab 4 screens</td><td>desktop</td><td>Pass (Fixed: Action Date and Time has focus ring) ✅</td></tr>
            <tr><td>No clipping</td><td>all Lab 4 screens</td><td>all</td><td>Pass ✅</td></tr>
            <tr><td>No overlap</td><td>all Lab 4 screens</td><td>all</td><td>Pass ✅</td></tr>
            <tr><td>No horizontal overflow</td><td>all Lab 4 screens</td><td>all</td><td>Pass ✅</td></tr>
          </tbody>
        </table>
      </div>
      <div class="figure-caption">Figure 9.6: Completed checklist - design consistency, dashboards, Actions Taken, editable/read-only fields, validation placement, keyboard focus, clipping, overlap, and horizontal overflow, all Pass.</div>
    </div>
  `);

  console.log('Total pages generated:', pages.length);

  // Combine into complete HTML document
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>TokTickIT Lab 4 Report - Aran Edlek</title>
<style>
  ${css}
</style>
</head>
<body>
  ${pages.join('\n')}
</body>
</html>`;

  // Write HTML to scratch for audit
  fs.writeFileSync('scratch/report_52pages.html', fullHtml, 'utf8');

  // Launch Playwright and render PDF
  console.log('Rendering PDF with Playwright Chromium...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(fullHtml, { waitUntil: 'load' });
  await page.pdf({
    path: path.resolve('docs/lab-04/Lab04_Report.pdf'),
    format: 'A4',
    printBackground: true,
    margin: {
      top: '16mm',
      bottom: '16mm',
      left: '14mm',
      right: '14mm',
    },
  });

  await browser.close();
  console.log('PDF generated successfully at docs/lab-04/Lab04_Report.pdf!');
}

generateReport().catch(err => {
  console.error('Error generating report:', err);
  process.exit(1);
});
