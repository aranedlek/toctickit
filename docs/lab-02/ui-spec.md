# Lab 02 – UI Specification

## 1. Design Theme: Zen Green

### 1.1 Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#2D6A4F` | Primary buttons, active states, links |
| `--color-primary-light` | `#52B788` | Hover states, badges, highlights |
| `--color-primary-pale` | `#D8F3DC` | Background accents, chip backgrounds |
| `--color-secondary` | `#1B4332` | Dark headings, sidebar background |
| `--color-surface` | `#F8FAF9` | Page background |
| `--color-card` | `#FFFFFF` | Card and form backgrounds |
| `--color-border` | `#B7E4C7` | Input borders, dividers |
| `--color-text-primary` | `#1B1F1E` | Main body text |
| `--color-text-secondary` | `#4A6057` | Subtext, labels, captions |
| `--color-text-disabled` | `#A0B5AD` | Disabled field text |
| `--color-error` | `#C0392B` | Validation errors, danger alerts |
| `--color-warning` | `#D4860B` | Warning messages |
| `--color-success` | `#27AE60` | Success toasts, confirmed states |

---

### 1.2 Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Page Title (h1) | Inter | 24px | 700 |
| Section Heading (h2) | Inter | 18px | 600 |
| Card Title (h3) | Inter | 16px | 600 |
| Body Text | Inter | 14px | 400 |
| Caption / Label | Inter | 12px | 400 |
| Button | Inter | 14px | 500 |

> Import via Google Fonts: `Inter` (weights 400, 500, 600, 700)

---

### 1.3 Spacing System

Using 4px base unit: `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 px`

---

### 1.4 Border Radius

| Component | Radius |
|-----------|--------|
| Cards | `12px` |
| Buttons | `8px` |
| Inputs | `8px` |
| Chips / Badges | `20px` (pill) |
| Avatars | `50%` (circle) |

---

### 1.5 Shadows

```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.10);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
```

---

## 2. Layout System

### 2.1 Global Shell

```
┌─────────────────────────────────────────────────┐
│  NAVBAR  [Logo: TokTickIT]          [User Badge] │
├─────────────────────────────────────────────────┤
│                                                 │
│              PAGE CONTENT                       │
│              (max-width: 1200px, centered)      │
│                                                 │
└─────────────────────────────────────────────────┘
```

- Navbar height: `60px`
- Sticky top navbar
- Content area has `padding: 24px 16px`

---

### 2.2 Responsive Breakpoints

| Name | Min Width | Layout |
|------|-----------|--------|
| Mobile | — (default) | 1-column, stacked |
| Tablet | 768px | 2-column grid where applicable |
| Desktop | 1024px | Full layout, sidebar if needed |

---

## 3. Screen Specifications

### 3.1 Requester Selection Screen

**Route:** `/` or `/select-requester`

**Purpose:** Simulated login — user picks who they are

**Layout:**
```
┌──────────────────────────────────────┐
│         TokTickIT                    │
│    "Who are you today?"              │
│                                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│  │Avatar│ │Avatar│ │Avatar│ │Avatar││
│  │Anya  │ │Ben   │ │Chanya│ │Dome  ││
│  └──────┘ └──────┘ └──────┘ └──────┘│
└──────────────────────────────────────┘
```

**Components:**
- Centered card grid (2 columns on mobile, 4 on desktop)
- Each Requester card:
  - Circular avatar with initials (colored with pastel from name hash)
  - Name (h3) and email (caption)
  - Subtle border, hover lifts card with shadow
  - Click → save to localStorage → navigate to `/my-tickets`

**States:**
- Hover: `box-shadow: var(--shadow-md)`, border color `--color-primary-light`
- Active/pressed: slight scale down `scale(0.97)`

---

### 3.2 Create Ticket Screen

**Route:** `/tickets/new`

**Purpose:** Requester submits a new ticket

**Layout:**
```
┌──────────────────────────────────────┐
│ ← Back   Create New Ticket           │
├──────────────────────────────────────┤
│ Title *                              │
│ [________________________]           │
│                                      │
│ Description *                        │
│ [________________________]           │
│ [________________________]           │
│                                      │
│ Category *         Priority          │
│ [Dropdown     ▾]   [Dropdown     ▾]  │
│                                      │
│ Related System (optional)            │
│ [Dropdown                ▾]          │
│                                      │
│ Attachments                          │
│ ┌────────────────────────────────┐   │
│ │  ☁ Drag & drop or click       │   │
│ │  JPG, PNG, WEBP, PDF · Max 5MB│   │
│ └────────────────────────────────┘   │
│ [file1.jpg ×] [file2.pdf ×]          │
│                                      │
│              [ Submit Ticket ]       │
└──────────────────────────────────────┘
```

**Form Fields:**

| Field | Type | Validation |
|-------|------|-----------|
| Title | Text input | Required, max 200 chars |
| Description | Textarea (min 3 rows) | Required |
| Category | Select dropdown | Required |
| Priority | Select dropdown | Default: MEDIUM |
| Related System | Select dropdown | Optional |
| Attachments | File dropzone | Optional, max 5 files, 5MB each, JPG/PNG/WEBP/PDF only |

**Validation States:**
- Invalid fields: red border `--color-error`, error message below input
- Submit button: disabled + greyed if required fields empty

**Attachment Dropzone States:**
- Default: dashed border `--color-border`, light `--color-primary-pale` background
- Drag-over: solid border `--color-primary`, slightly darker background
- File preview: small chip with filename, size, and `×` remove button

---

### 3.3 My Tickets Screen

**Route:** `/my-tickets`

**Purpose:** Requester views all their own tickets with filtering and pagination

**Layout:**
```
┌──────────────────────────────────────┐
│ My Tickets               [+ New]     │
├──────────────────────────────────────┤
│ [🔍 Search by title...  ]            │
│ Status: [All ▾]  Priority: [All ▾]   │
│ Sort: [Newest ▾]                     │
├──────────────────────────────────────┤
│ ┌────────────────────────────────┐   │
│ │ #1  Cannot access email        │   │
│ │     IT Support · HIGH          │   │
│ │     OPEN · 1 Sep 2026          │   │
│ └────────────────────────────────┘   │
│  ... more ticket cards ...           │
├──────────────────────────────────────┤
│  ← 1  2  3 →        10 per page     │
└──────────────────────────────────────┘
```

**Ticket Card Design:**
- Left accent bar: color-coded by status
  - OPEN → `--color-primary`
  - IN_PROGRESS → `--color-warning`
  - RESOLVED → `--color-success`
  - CLOSED → `--color-text-disabled`
- Shows: Ticket ID, Title, Category, Priority badge, Status badge, Created date
- Click → navigate to `/tickets/:id`

**Priority Badge Colors:**
| Priority | Background | Text |
|----------|-----------|------|
| LOW | `#EBF5FB` | `#1A5276` |
| MEDIUM | `#FEF9E7` | `#7D6608` |
| HIGH | `#FDEBD0` | `#784212` |
| URGENT | `#FDEDEC` | `#922B21` |

**Empty State:**
- Centered illustration (or icon) + message "No tickets found"
- If search/filter active: show "Try adjusting your filters" + Clear button

---

### 3.4 Ticket Detail Screen

**Route:** `/tickets/:id`

**Purpose:** Read-only view of a single ticket

**Layout:**
```
┌──────────────────────────────────────┐
│ ← My Tickets                         │
│                                      │
│ [OPEN] [HIGH]   Ticket #1            │
│ Cannot access email                  │
├──────────────────────────────────────┤
│ Description                          │
│ I cannot access my email since...    │
├──────────────────────────────────────┤
│ Details                              │
│  Category: IT Support                │
│  Related System: Microsoft 365       │
│  Created: 1 Sep 2026, 09:32          │
│  Last Updated: 1 Sep 2026, 09:32     │
├──────────────────────────────────────┤
│ Attachments (2)                      │
│  📄 screenshot.png  (1.2 MB) ↓       │
│  📄 error_log.pdf   (0.4 MB) ↓       │
└──────────────────────────────────────┘
```

**Rules:**
- No edit button, no status-change controls
- Attachments show filename, size, and download button
- Soft-deleted attachments are never rendered

---

## 4. Shared Components

### 4.1 Navbar
- Logo: "TokTickIT" in `--color-primary`, font-weight 700
- Right: Current requester's avatar (initials circle) + name
- On mobile: hamburger menu or simplified layout

### 4.2 Status Badge

```
┌─────────┐
│  OPEN   │    ← pill shape, bg = pale color, text = dark color
└─────────┘
```

| Status | Background | Text |
|--------|-----------|------|
| OPEN | `#D8F3DC` | `#1B4332` |
| IN_PROGRESS | `#FEF3CD` | `#856404` |
| RESOLVED | `#D1ECF1` | `#0C5460` |
| CLOSED | `#E2E3E5` | `#383D41` |

### 4.3 Toast Notification
- Appears top-right, auto-dismiss after 3 seconds
- Success: green left border
- Error: red left border

### 4.4 Loading State
- Skeleton shimmer animation on ticket cards
- Spinner on submit button while API call in progress

---

## 5. Animation & Interaction

| Interaction | Animation |
|-------------|-----------|
| Page transition | Fade-in `opacity 0→1`, 200ms |
| Card hover | `transform: translateY(-2px)`, shadow increase, 150ms |
| Button click | `scale(0.97)`, 100ms |
| Dropzone drag-over | Border color transition, 150ms |
| Toast appear | Slide-in from right, 250ms |
| Skeleton shimmer | `background-position` animation, 1.5s loop |
