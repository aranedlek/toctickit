# Lab 02 – API Specification

**Base URL:** `http://localhost:3000/api`  
**Content-Type:** `application/json` (all requests and responses)

---

## 1. Requesters

### GET /requesters

Returns all **active** requesters (used for the Requester Selection screen).

**Query Parameters:** None

**Response 200 OK**
```json
[
  {
    "id": 1,
    "name": "Anya Suphan",
    "email": "anya@example.com",
    "isActive": true,
    "createdAt": "2026-09-01T00:00:00.000Z"
  }
]
```

> Only requesters where `isActive = true` are returned.

---

## 2. Categories

### GET /categories

Returns all ticket categories (for dropdown on Create Ticket form).

**Response 200 OK**
```json
[
  { "id": 1, "name": "IT Support" },
  { "id": 2, "name": "HR Request" },
  { "id": 3, "name": "Finance" },
  { "id": 4, "name": "Facilities" }
]
```

---

## 3. Related Systems

### GET /related-systems

Returns all related systems (for optional dropdown on Create Ticket form).

**Response 200 OK**
```json
[
  { "id": 1, "name": "SAP ERP" },
  { "id": 2, "name": "Microsoft 365" },
  { "id": 3, "name": "Slack" },
  { "id": 4, "name": "Google Workspace" },
  { "id": 5, "name": "Jira" },
  { "id": 6, "name": "Confluence" }
]
```

---

## 4. Tickets

### POST /tickets

Create a new ticket.

**Request Body**
```json
{
  "title": "Cannot access email",
  "description": "I have been unable to log into my email since this morning.",
  "categoryId": 1,
  "priority": "HIGH",
  "requesterId": 1,
  "relatedSystemId": 2
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | ✅ | Max 200 characters |
| `description` | string | ✅ | — |
| `categoryId` | integer | ✅ | Must reference an existing category |
| `priority` | string | ❌ | Defaults to `"MEDIUM"` if omitted. Values: `LOW`, `MEDIUM`, `HIGH`, `URGENT` |
| `requesterId` | integer | ✅ | Must reference an active requester |
| `relatedSystemId` | integer | ❌ | Optional. Must reference an existing related system |

**Response 201 Created**
```json
{
  "id": 42,
  "title": "Cannot access email",
  "description": "I have been unable to log into my email since this morning.",
  "status": "OPEN",
  "priority": "HIGH",
  "requesterId": 1,
  "categoryId": 1,
  "relatedSystemId": 2,
  "createdAt": "2026-09-03T07:30:00.000Z",
  "updatedAt": "2026-09-03T07:30:00.000Z"
}
```

**Error Responses**

| Status | Condition | Body |
|--------|-----------|------|
| 400 | Missing `title` | `{ "error": "Title is required" }` |
| 400 | Missing `description` | `{ "error": "Description is required" }` |
| 400 | Missing `categoryId` | `{ "error": "Category is required" }` |
| 400 | Invalid `priority` value | `{ "error": "Invalid priority value" }` |
| 404 | `requesterId` not found or inactive | `{ "error": "Requester not found" }` |
| 404 | `categoryId` not found | `{ "error": "Category not found" }` |

---

### GET /tickets

Returns a paginated, filterable list of tickets for a specific requester.

**Query Parameters**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `requesterId` | integer | ✅ | — | Filter tickets by requester |
| `search` | string | ❌ | — | Case-insensitive partial match on `title` |
| `status` | string | ❌ | — | Filter by status: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED` |
| `priority` | string | ❌ | — | Filter by priority: `LOW`, `MEDIUM`, `HIGH`, `URGENT` |
| `sortBy` | string | ❌ | `createdAt` | Sort field: `createdAt`, `priority` |
| `order` | string | ❌ | `desc` | Sort direction: `asc`, `desc` |
| `page` | integer | ❌ | `1` | Page number (1-indexed) |
| `limit` | integer | ❌ | `10` | Items per page |

**Response 200 OK**
```json
{
  "data": [
    {
      "id": 42,
      "title": "Cannot access email",
      "status": "OPEN",
      "priority": "HIGH",
      "category": { "id": 1, "name": "IT Support" },
      "createdAt": "2026-09-03T07:30:00.000Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

**Error Responses**

| Status | Condition | Body |
|--------|-----------|------|
| 400 | Missing `requesterId` | `{ "error": "requesterId is required" }` |

---

### GET /tickets/:id

Returns full detail of a single ticket, including non-deleted attachments.

**Response 200 OK**
```json
{
  "id": 42,
  "title": "Cannot access email",
  "description": "I have been unable to log into my email since this morning.",
  "status": "OPEN",
  "priority": "HIGH",
  "requesterId": 1,
  "category": {
    "id": 1,
    "name": "IT Support"
  },
  "relatedSystem": {
    "id": 2,
    "name": "Microsoft 365"
  },
  "attachments": [
    {
      "id": 5,
      "filename": "screenshot.png",
      "mimeType": "image/png",
      "sizeBytes": 1258291,
      "uploadedAt": "2026-09-03T07:30:05.000Z"
    }
  ],
  "createdAt": "2026-09-03T07:30:00.000Z",
  "updatedAt": "2026-09-03T07:30:00.000Z"
}
```

> Only attachments where `deletedAt IS NULL` are included in the response.

**Error Responses**

| Status | Condition | Body |
|--------|-----------|------|
| 404 | Ticket not found | `{ "error": "Ticket not found" }` |

---

## 5. Attachments

### POST /tickets/:id/attachments

Upload an attachment to an existing ticket.

**Request:** `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `file` | File | The file to upload |

**Allowed MIME types:** `image/jpeg`, `image/png`, `image/webp`, `application/pdf`  
**Max size per file:** 5 MB (5,242,880 bytes)  
**Max attachments per ticket:** 5 (non-deleted only)

**Response 201 Created**
```json
{
  "id": 5,
  "ticketId": 42,
  "filename": "screenshot.png",
  "mimeType": "image/png",
  "sizeBytes": 1258291,
  "uploadedAt": "2026-09-03T07:30:05.000Z"
}
```

**Error Responses**

| Status | Condition | Body |
|--------|-----------|------|
| 400 | No file uploaded | `{ "error": "No file provided" }` |
| 400 | Unsupported file type | `{ "error": "Unsupported file type. Allowed: JPG, PNG, WEBP, PDF" }` |
| 400 | File exceeds 5 MB | `{ "error": "File size exceeds the 5 MB limit" }` |
| 400 | Ticket already has 5 attachments | `{ "error": "Maximum of 5 attachments per ticket" }` |
| 404 | Ticket not found | `{ "error": "Ticket not found" }` |

---

### DELETE /attachments/:id

Soft-delete an attachment by setting `deletedAt` to the current timestamp. The file record remains in the database.

**Response 200 OK**
```json
{
  "id": 5,
  "deletedAt": "2026-09-03T09:15:00.000Z"
}
```

**Error Responses**

| Status | Condition | Body |
|--------|-----------|------|
| 404 | Attachment not found | `{ "error": "Attachment not found" }` |
| 400 | Attachment already deleted | `{ "error": "Attachment already deleted" }` |

---

## 6. Common Error Format

All error responses follow this structure:

```json
{
  "error": "Human-readable error message"
}
```

---

## 7. Status Code Summary

| Code | Meaning |
|------|---------|
| 200 | Success (GET, DELETE) |
| 201 | Created (POST) |
| 400 | Bad Request — validation error |
| 404 | Resource not found |
| 500 | Internal Server Error |
