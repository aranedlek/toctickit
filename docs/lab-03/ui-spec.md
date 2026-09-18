# Lab 03 – UI Specification

## 1. Design Theme: Zen Green
*Continuing from Lab 2*

The Zen Green design language remains unchanged. All existing tokens, colors, typography, cards, badges, and spacing rules must be reused for consistency.

### 1.1 Global Shell Update
- **Navbar (Top):**
  - Left: "TokTickIT" Logo
  - Right: Authenticated User's Name and Role (e.g., "Anya Suphan (Requester)").
  - Profile Dropdown: Contains actions for "Change Password" and "Logout".

## 2. Screen Specifications

### 2.1 Login Screen
**Route:** `/login`

**Layout:**
- Centered card on a `--color-surface` background.
- Title: "Sign in to your account".
- Form Fields:
  - Email (Input type email).
  - Password (Input type password, with toggle visibility icon).
- Feedback Area: Reserved space below inputs for validation errors (e.g., "Invalid email or password" in `--color-error` box).
- Action: "Sign In" button (Full width, `--color-primary`).

### 2.2 Change Password Screen
**Route:** `/change-password`

**Layout:**
- Centered card, similar to Login.
- Message: "You must change your password to continue." (If triggered by initial password).
- Form Fields:
  - Current Password.
  - New Password.
  - Confirm New Password.
- Password Rules Checklist (updates dynamically):
  - [x] At least 8 characters
  - [x] Include upper and lower case letters
  - [x] Include a number and a special character
- Action: "Continue" / "Save Password" button.

### 2.3 IT Staff Ticket Queue
**Route:** `/staff/tickets` (or similar authenticated route)

**Layout:**
- Top Action Bar:
  - Search Input (Search by ticket number or summary).
  - "Filters" button (Opens a dropdown or drawer for Status, IT Priority).
- Data Table:
  - Columns: Ticket No, Created Date, Summary, Category, Req. Priority (Badge), IT Priority (Badge), Status (Badge), Owner (Text or Avatar).
  - Sorting headers (up/down arrows).
- Footer:
  - Pagination controls (Prev, 1, 2, 3, ..., Next).
- **Responsive Behavior:** On mobile, rows convert to individual cards stacking vertically.

### 2.4 IT Staff Ticket Detail
**Route:** `/staff/tickets/:id`

**Layout:**
- Top Bar: Back button to Queue.
- Header Information: Ticket No, Category, Related System.
- Requester Info: Requester Name, Requested Priority, Current Status (Badge).
- Operational Controls (Editable for IT Staff):
  - Ticket Owner (Dropdown: Unassigned, [IT Staff Names]).
  - IT Priority (Dropdown).
  - Status (Dropdown, transitions based on allowed rules).
- Main Content: Summary, Description.
- Activity Area (Tabs or Stacked):
  - **Public Comments:** Visible to everyone. Background standard.
  - **Internal Notes:** Visible to IT/Admin only. Background tinted (e.g., `--color-warning` light shade) to indicate privacy.
  - Input field with "Post Comment" / "Add Note" button.
- Attachments: Same UI as Lab 2.

### 2.5 Administrator User Management
**Route:** `/admin/users`

**Layout:**
- Top Action Bar:
  - Search Input (Name or Email).
  - "Filters" (By Role).
  - "+ Create User" Button.
- Data Table:
  - Columns: Name, Role (Badge), Status (Active/Inactive Badge).
  - Row Click / Action: Opens "Edit" sidebar or modal.
- Create / Edit User Modal:
  - Fields: Full Name, Email Address, Role (Dropdown: Requester, IT Staff, Admin).
  - Toggle: "Active" (Switch component).
  - Initial Password Area: Checkbox for "Set initial password", input field for the temp password.
  - Actions: "Save User", "Cancel". (In edit mode: "Deactivate User" in red if applicable).

## 3. Feedback and States
- **Loading:** Use skeleton screens for the queue and ticket details; spinner icons on buttons during API calls.
- **Empty States:** Clear illustrations or icons indicating no tickets found in queue, or no users match search.
- **Success:** Green toast notifications (e.g., "User updated successfully").
- **Error:** Red toast notifications for API failures (e.g., "Failed to claim ticket").
