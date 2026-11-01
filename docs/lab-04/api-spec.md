# Lab 04 – REST API Specification

**Base URL:** `/api`  
**Content-Type:** `application/json`  
**Authentication:** Cookie-based session (`token` HTTP-only JWT)

---

## 1. Actions Taken Endpoints

### 1.1 GET /api/tickets/:id/actions
Retrieves all Actions Taken records associated with a specific ticket in chronological order.

**Authorization:**
- `REQUESTER`: Permitted **only** if the authenticated user is the ticket requester (`requesterId == user.id`).
- `IT_STAFF`, `ADMINISTRATOR`: Permitted for all accessible tickets.

**Parameters:**
- `id` (path, required): Ticket integer ID.

**Response 200 OK:**
```json
[
  {
    "id": 1,
    "ticketId": 10,
    "actionDateTime": "2026-05-12T10:15:00.000Z",
    "actionDescription": "Inspected workstation hardware; discovered faulty RAM stick in slot 2.",
    "result": "Replaced 8GB DDR4 RAM module with tested spare. POST and diagnostics passed.",
    "performedById": 2,
    "performedBy": {
      "id": 2,
      "name": "Michael IT",
      "email": "michael.it@example.com",
      "role": "IT_STAFF"
    },
    "followUpRequired": true,
    "followUpNote": "Monitor memory dump logs after 24 hours of normal user operation.",
    "attachmentNotes": "ram-test-results.log, photo-motherboard.jpg",
    "createdAt": "2026-05-12T10:20:00.000Z",
    "updatedAt": "2026-05-12T10:20:00.000Z"
  }
]
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated.
- `403 Forbidden`: Requester attempting to view actions for another user's ticket.
- `404 Not Found`: Ticket not found.

---

### 1.2 POST /api/tickets/:id/actions
Creates a new Action Taken record under the specified ticket. The `performedById` is automatically bound to the authenticated user.

**Authorization:**
- `IT_STAFF`, `ADMINISTRATOR`: Permitted.
- `REQUESTER`: **Forbidden (403)**.

**Request Body:**
```json
{
  "actionDateTime": "2026-05-12T10:15:00.000Z",
  "actionDescription": "Replaced network patch cable connecting wall jack to desk switch.",
  "result": "Gigabit link established; packet loss reduced to 0%.",
  "followUpRequired": true,
  "followUpNote": "Check with user tomorrow morning to ensure connection stability.",
  "attachmentNotes": "speedtest-results.png"
}
```

**Validation Rules:**
- `actionDescription`: Required, string, min length 5.
- `result`: Required, string, min length 3.
- `followUpRequired`: Required, boolean.
- `followUpNote`: **Mandatory** if `followUpRequired === true` (min length 3). Must be null/empty if `followUpRequired === false`.
- `actionDateTime`: Optional, ISO 8601 string (defaults to `now()` if omitted).
- `attachmentNotes`: Optional, string, max 255 characters.

**Response 201 Created:**
```json
{
  "id": 2,
  "ticketId": 10,
  "actionDateTime": "2026-05-12T10:15:00.000Z",
  "actionDescription": "Replaced network patch cable connecting wall jack to desk switch.",
  "result": "Gigabit link established; packet loss reduced to 0%.",
  "performedById": 2,
  "performedBy": {
    "id": 2,
    "name": "Michael IT",
    "email": "michael.it@example.com",
    "role": "IT_STAFF"
  },
  "followUpRequired": true,
  "followUpNote": "Check with user tomorrow morning to ensure connection stability.",
  "attachmentNotes": "speedtest-results.png",
  "createdAt": "2026-05-12T10:25:00.000Z",
  "updatedAt": "2026-05-12T10:25:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request`: Validation failure (e.g. `followUpRequired` is true but `followUpNote` is missing).
- `401 Unauthorized`: Not authenticated.
- `403 Forbidden`: Authenticated user is a `REQUESTER`.
- `404 Not Found`: Ticket not found.

---

### 1.3 PATCH /api/tickets/:id/actions/:actionId
Updates an existing Action Taken record. The original `performedById` and `actionDateTime` remain immutable to preserve audit integrity.

**Authorization:**
- `IT_STAFF`, `ADMINISTRATOR`: Permitted.
- `REQUESTER`: **Forbidden (403)**.

**Request Body:**
```json
{
  "actionDescription": "Updated action description with detailed model number.",
  "result": "Workstation running smoothly.",
  "followUpRequired": false,
  "followUpNote": null,
  "attachmentNotes": "updated-notes.txt"
}
```

**Response 200 OK:**
Returns the updated Action Taken object.

**Error Responses:**
- `400 Bad Request`: Invalid validation data.
- `401 Unauthorized`: Not authenticated.
- `403 Forbidden`: Requester role.
- `404 Not Found`: Ticket or Action not found.

---

## 2. Ticket Status Lifecycle & Concurrency Endpoints

### 2.1 PATCH /api/tickets/:id/status
Updates the ticket's lifecycle status while verifying authorized role transitions and enforcing Optimistic Concurrency Control (OCC).

**Authorization:**
- `IT_STAFF`, `ADMINISTRATOR`: Permitted according to BR-08 transition matrix.
- `REQUESTER`: Permitted **only** to request advisory transition or reply. Direct transition to `RESOLVED` or `CLOSED` returns **403 Forbidden**.

**Request Body:**
```json
{
  "status": "RESOLVED",
  "version": 1,
  "resolutionNote": "Replaced RAM module and passed memory diagnostics test suite."
}
```

**Concurrency Control (Version Checking):**
- The client must include the current `version` integer of the Ticket.
- If the ticket in the database has `version !== payload.version`, the update is aborted and returns **409 Conflict**.
- Upon successful update, the database increments `version = version + 1`.

**Response 200 OK:**
```json
{
  "id": 10,
  "number": "TKT-2026-00010",
  "title": "Workstation crashing with blue screen",
  "status": "RESOLVED",
  "version": 2,
  "updatedAt": "2026-05-12T10:30:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request`: Missing target status or invalid status enum.
- `403 Forbidden`: Requester attempting to set `RESOLVED` or unauthorized transition.
- `409 Conflict`:
```json
{
  "error": "CONFLICT",
  "message": "This ticket was modified by another user while you were editing. Please refresh and review before retrying.",
  "currentVersion": 2
}
```
- `422 Unprocessable Entity`: Illegal state transition (e.g. attempting to jump from `NEW` directly to `RESOLVED`).

---

### 2.2 POST /api/tickets/:id/resolve-advisory
Enables a Requester to indicate that their issue appears resolved from their point of view.

**Authorization:**
- `REQUESTER`: Permitted only for owned tickets in active state (`WAITING_FOR_REQUESTER` or `IN_PROGRESS`).

**Request Body:**
```json
{
  "note": "The internet connection is working fast again, thank you!"
}
```

**Behavior:**
- Automatically appends a public comment and records the requester's resolution advisory flag.
- The ticket status is **not** set to `RESOLVED`; it transitions to or remains in a staff-reviewable state (`WAITING_FOR_REQUESTER` or `OPEN`) for IT Staff verification.

**Response 200 OK:**
```json
{
  "message": "Advisory resolution recorded. IT Staff will review and formally close the ticket.",
  "ticketId": 10,
  "status": "WAITING_FOR_REQUESTER"
}
```

---

## 3. Authoritative Dashboard Endpoints

### 3.1 GET /api/dashboard/staff
Computes authoritative operational metrics for the IT Staff Dashboard.

**Authorization:** `IT_STAFF`, `ADMINISTRATOR`

**Response 200 OK:**
```json
{
  "metrics": {
    "unassignedCount": 14,
    "openCount": 23,
    "inProgressCount": 18,
    "waitingForRequesterCount": 7,
    "assignedToMeCount": 16,
    "totalActiveTickets": 62
  },
  "priorityBreakdown": {
    "URGENT": 4,
    "HIGH": 12,
    "MEDIUM": 31,
    "LOW": 15
  },
  "recentTickets": [
    {
      "id": 14,
      "number": "TKT-2026-00014",
      "title": "Laptop battery drains quickly",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "itPriority": "URGENT",
      "ticketOwner": {
        "id": 2,
        "name": "Michael IT"
      },
      "updatedAt": "2026-05-12T09:14:00.000Z"
    }
  ]
}
```

---

### 3.2 GET /api/dashboard/requester
Computes authoritative personal metrics for the logged-in Requester. All calculations strictly filter by `requesterId = req.user.id`.

**Authorization:** `REQUESTER`

**Response 200 OK:**
```json
{
  "metrics": {
    "myOpenTicketsCount": 3,
    "inProgressCount": 2,
    "waitingForRequesterCount": 1,
    "resolvedCount": 5,
    "closedCount": 12
  },
  "recentTickets": [
    {
      "id": 24,
      "number": "TKT-2026-00024",
      "title": "Laptop battery drains quickly",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "updatedAt": "2026-05-12T09:14:00.000Z"
    }
  ]
}
```

---

### 3.3 GET /api/dashboard/admin
Extends the staff operational metrics with high-level user administration counts.

**Authorization:** `ADMINISTRATOR`

**Response 200 OK:**
```json
{
  "staffMetrics": {
    "unassignedCount": 14,
    "openCount": 23,
    "inProgressCount": 18,
    "waitingForRequesterCount": 7,
    "assignedToMeCount": 16
  },
  "userMetrics": {
    "totalUsers": 28,
    "activeUsers": 26,
    "inactiveUsers": 2,
    "roleCounts": {
      "REQUESTER": 20,
      "IT_STAFF": 6,
      "ADMINISTRATOR": 2
    }
  }
}
```

---

## 4. Standardized Error Response Format

All error responses adhere to the standard envelope:
```json
{
  "error": "ERROR_CODE",
  "message": "Human readable, safe explanation of the error.",
  "details": [
    {
      "field": "followUpNote",
      "message": "Follow-up note is required when followUpRequired is true."
    }
  ]
}
```

### HTTP Status Code Conventions
- `200 OK`: Request succeeded.
- `201 Created`: Entity created successfully.
- `400 Bad Request`: Input validation failed.
- `401 Unauthorized`: Session cookie missing or expired.
- `403 Forbidden`: User role lacks permission for the endpoint.
- `404 Not Found`: Requested resource does not exist.
- `409 Conflict`: Optimistic concurrency violation.
- `422 Unprocessable Entity`: Business logic or transition matrix violation.
- `500 Internal Server Error`: Unexpected server exception.
