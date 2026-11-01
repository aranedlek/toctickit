# Lab 04 – UI Specification

## 1. Design System & Theme: Zen Green
*Continuing and refining the design language from Labs 2 and 3.*

The application strictly adheres to the **Zen Green** design language, emphasizing tranquil forest greens, crisp mint surfaces, subtle borders, accessible contrast ratios, and modern micro-interactions.

### 1.1 Color Tokens
- **Primary Brand:** `--color-primary: #2D6A4F` (Forest Green)
- **Primary Hover:** `--color-primary-hover: #1B4332` (Deep Forest)
- **Primary Light / Highlight:** `--color-primary-light: #D8F3DC` (Pale Mint)
- **Neutral Surface / Background:** `--color-surface: #F0F7F4` (Light Mint Gray)
- **Card Background:** `--color-card: #FFFFFF` (Pure White)
- **Border Subtle:** `--color-border: #D8F3DC` / `--color-border-dark: #B7E4C7`
- **Text Primary:** `--color-text: #1B4332`
- **Text Secondary / Muted:** `--color-text-muted: #52796F`

### 1.2 Status Pill Badges
| Status | Background | Text Color | Border | Accessibility Icon / Text |
| :--- | :--- | :--- | :--- | :--- |
| `NEW` | `#E0F2FE` | `#0369A1` | `#BAE6FD` | 🔵 New |
| `OPEN` | `#E0E7FF` | `#4338CA` | `#C7D2FE` | 🔷 Open |
| `IN_PROGRESS` | `#FEF3C7` | `#B45309` | `#FDE68A` | ⏳ In Progress |
| `WAITING_FOR_REQUESTER` | `#FEE2E2` | `#B91C1C` | `#FECACA` | ⚠️ Waiting |
| `RESOLVED` | `#D1FAE5` | `#065F46` | `#A7F3D0` | ✅ Resolved |
| `CLOSED` | `#F3F4F6` | `#4B5563` | `#E5E7EB` | 🔒 Closed |
| `REOPENED` | `#FDE68A` | `#92400E` | `#FCD34D` | 🔄 Reopened |
| `CANCELLED` | `#F1F5F9` | `#64748B` | `#CBD5E1` | ❌ Cancelled |

---

## 2. Navigation & Global Shell

### 2.1 Top Navbar
- **Brand Identity (Left):** "TokTickIT" logo and service-desk badge.
- **Role-Appropriate Links (Center):**
  - **Requester:**
    - `Dashboard` (`/requester/dashboard`) — *Primary landing view*
    - `My Tickets` (`/tickets`)
    - `Create Ticket` (`/tickets/new`)
  - **IT Staff & Administrator:**
    - `Dashboard` (`/staff/dashboard`) — *Primary operational landing view*
    - `Ticket Queue` (`/staff/tickets`)
    - `User Management` (`/admin/users`) *(Visible only to Administrators)*
- **User Profile Area (Right):**
  - Display name with Role Badge (e.g., "Michael IT (IT Staff)")
  - Dropdown menu: "Change Password", "Sign Out"

---

## 3. Screen Specifications

### 3.1 IT Staff Dashboard (`/staff/dashboard`)

#### Header Area
- **Welcome Banner:** "Welcome back, {User.name}!" with current date and subtitle: "Here's what's happening with your queue today."
- **Refresh Action:** Clean button with refresh icon updating authoritative metric counters.

#### Operational Metric Cards (Summary Row)
Displays 5 concise metric cards in a responsive grid:
1. **New / Unassigned:** Count of unassigned tickets needing triage. (Clickable drill-down: `/staff/tickets?status=NEW&assigned=unassigned`)
2. **Open:** Count of all open tickets. (Drill-down: `/staff/tickets?status=OPEN`)
3. **In Progress:** Count of tickets actively being worked on. (Drill-down: `/staff/tickets?status=IN_PROGRESS`)
4. **Waiting for Requester:** Count of tickets pending user reply. (Drill-down: `/staff/tickets?status=WAITING_FOR_REQUESTER`)
5. **My Assigned:** Count of tickets owned by the current staff member. (Drill-down: `/staff/tickets?assigned=me`)

*Each card contains: large bold numerical value, descriptive label, status color accent bar, and accessible "View all →" button.*

#### Operational Content Grid (2-Column Layout)
- **Left Column (2/3 width) – My Recent Tickets:**
  - Table showing the 5 most recently active tickets assigned to or handled by the user.
  - Columns: Ticket No (clickable), Title, Status Badge, Updated Time.
  - Action link: "View All Tickets →" in the table header.
  - Empty state: Clean card stating "No tickets found matching your queue."
- **Right Column (1/3 width) – Quick Actions & Queue Shortcuts:**
  - Quick Action cards:
    - ➕ **Create Ticket:** Jump directly to ticket creation modal/page.
    - 🔍 **Search Tickets:** Focus directly on queue search input.
    - 📋 **My Queue:** Direct link to tickets assigned to me.

---

### 3.2 Requester Dashboard (`/requester/dashboard`)

#### Header Area
- **Greeting Banner:** "Welcome, {User.name}!" with subtitle: "Here's the latest on your support requests."

#### Requester Metric Cards
1. **My Open Tickets:** Total tickets in `NEW`, `OPEN`, `IN_PROGRESS`, or `WAITING_FOR_REQUESTER`. (Drill-down: `/tickets?filter=open`)
2. **In Progress:** Tickets currently being worked on by IT Staff. (Drill-down: `/tickets?filter=in_progress`)
3. **Waiting on Me:** Tickets where IT Staff requested additional info. (Drill-down: `/tickets?filter=waiting`)
4. **Resolved:** Resolved requests awaiting confirmation or closure. (Drill-down: `/tickets?filter=resolved`)

#### Requester Content Layout
- **My Recent Tickets:**
  - Shows top 5 active tickets owned by the authenticated Requester.
  - Direct links to ticket detail view.
- **Quick Action Bar:**
  - "Submit a New Request" prominent button (`--color-primary`).
  - "View All My Tickets" secondary link.

---

### 3.3 Actions Taken on Ticket Detail Screen (`/staff/tickets/:id` & `/tickets/:id`)

The Actions Taken module is embedded prominently on the Ticket Detail screen directly beneath the Ticket metadata card and above the communications panel.

#### Layout & Table Structure
- **Section Header:**
  - Title: "Actions Taken" with item counter badge (e.g., `Actions Taken (3)`).
  - Action Button (IT Staff & Admin only): "+ Record Action Taken" in Zen Green theme.
- **Actions Taken Data Table:**
  - **Date / Time:** Formatted timestamp (e.g., `May 12, 2026, 10:15 AM`).
  - **Action Description:** Complete summary of the physical or technical work done.
  - **Result:** Outcome of the action (e.g., "Replaced RAM module; diagnostic test passed").
  - **Performed By:** Name and role badge of the staff member who executed the action.
  - **Follow-Up Required:**
    - If `Yes`: Highlighted amber badge with "Follow-up Required" and expandable Follow-up Note.
    - If `No`: Subtle "None" badge.
  - **Attachment Notes:** Descriptive file reference (e.g., `diagnostic-log.txt`, `ram-benchmark.png`) with link or document icon.
  - **Actions Column (IT Staff/Admin only):** "Edit" button to modify details.

#### Requester View of Actions Taken
- Requesters see all entries in the table for complete transparency.
- The "+ Record Action Taken" and "Edit" buttons are completely hidden from the UI (and secured by backend 403 enforcement).

---

### 3.4 "Record / Edit Action Taken" Modal Dialog

When "+ Record Action Taken" or "Edit" is clicked, an accessible modal dialog opens:
- **Title:** "Record Action Taken" or "Edit Action Taken"
- **Form Fields:**
  1. **Action Date & Time:** Input type `datetime-local` (defaults to current local time; editable).
  2. **Action Description:** Textarea, min 5 characters (mandatory, validation message below field).
  3. **Result:** Textarea, min 3 characters (mandatory, validation message below field).
  4. **Performed By:** Auto-filled display input (read-only, showing current user's name).
  5. **Follow-Up Required?:** Toggle switch or checkbox.
  6. **Follow-Up Note:** Textarea.
     - *Dynamic validation:* If toggle is ON, field displays required red asterisk and validates that content is non-empty. If OFF, field is optional or disabled.
  7. **Attachment Notes:** Text input (placeholder: "e.g., photo_motherboard.jpg, network_trace.pcap").
- **Modal Actions:**
  - "Cancel" button (secondary outline).
  - "Save Action Taken" button (primary Zen Green, includes loading spinner during save).
- **Safe Failure & Conflict Handling:**
  - Inline error alert box if submission fails.
  - Form preserves entered input upon network error so user data is never lost.

---

### 3.5 Ticket Status Workflow & Resolution Gate Controls

#### IT Staff Status Controls
- Positioned in the Ticket Details header action bar.
- Shows current status with a dropdown or action buttons containing **only permitted next statuses** according to the BR-08 transition matrix.
- When changing status, the request payload includes `version: ticket.version` for concurrency safety.

#### Requester Advisory Resolution Control
- If the ticket is in `WAITING_FOR_REQUESTER` or `IN_PROGRESS`, the Requester sees an advisory button:
  - Button text: "I Confirm the Problem Appears Resolved" (with checkmark icon).
  - When clicked, a confirmation dialog appears explaining: *"This notifies the IT Staff that your issue is resolved. An IT specialist will review and formally close the ticket."*
  - The backend stores this advisory state without illegally setting status to `RESOLVED`.

---

## 4. Responsive Design & Accessibility (WCAG 2.1 AA)

### 4.1 Responsive Viewport Breakpoints
- **Desktop (≥ 1024px):** Full multi-column dashboard grid; data tables render all columns with generous padding.
- **Tablet (768px – 1023px):** Dashboard metric cards flow into a 2x2 or 3-column wrap. Tables maintain horizontal alignment or allow subtle container scrolling with fixed headers.
- **Mobile (< 768px):**
  - Metric cards stack in 2 columns or 1 column.
  - Data tables automatically reflow into stacked cards with clear field-value labeling.
  - Modal dialogs expand to full-screen sheet with sticky header and footer buttons.
  - Zero accidental horizontal scrolling (`overflow-x: hidden` on viewport level).

### 4.2 Accessibility Checklist
- **Keyboard Navigation:** Every actionable element (drill-down links, buttons, modal triggers) is reachable via `Tab` with a high-contrast visible focus ring (`outline: 2px solid #2D6A4F; outline-offset: 2px`).
- **Semantic HTML & ARIA:** Modals use `role="dialog"` with `aria-modal="true"` and `aria-labelledby`. Status badges include hidden screen-reader text in addition to icons.
- **Non-Color Indicators:** Status and priority cues never rely solely on color; each includes distinct icons and text labels.
