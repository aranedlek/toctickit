# Lab 03 – API Specification

**Base URL:** `/api`
**Content-Type:** `application/json`

## 1. Authentication

### POST /api/auth/login
Authenticates a user and establishes a session (sets HTTP-only cookie).

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 200 OK**
```json
{
  "user": {
    "id": 1,
    "name": "Anya Suphan",
    "email": "anya@example.com",
    "role": "Requester",
    "requiresPasswordChange": false
  }
}
```
*Note: Sets JWT in `Set-Cookie` header.*

**Error Responses**
- `401 Unauthorized`: Invalid credentials or inactive account.

### POST /api/auth/logout
Destroys the current session.

**Response 200 OK**
```json
{ "message": "Logged out successfully" }
```
*Note: Clears the auth cookie.*

### GET /api/auth/me
Returns the currently authenticated user.

**Response 200 OK** (Same as user object in login response)
**Error Responses**
- `401 Unauthorized`: Not logged in.

### POST /api/auth/change-password
Changes password, primarily for mandatory first-login change.

**Request Body**
```json
{
  "currentPassword": "old-password",
  "newPassword": "NewStrongPassword1!"
}
```

**Response 200 OK**
```json
{ "message": "Password updated successfully" }
```

## 2. Tickets (Requester & IT Staff)

### GET /api/tickets
Returns a paginated, filterable list of tickets.
- **Requester:** Implicitly only returns their own tickets.
- **IT Staff/Admin:** Returns tickets matching filters.

**Query Parameters**
- `search`: Partial title match.
- `status`: Filter by status.
- `priority`: Filter by requested priority.
- `itPriority`: Filter by IT priority.
- `ownerId`: Filter by ticket owner (IT Staff only).
- `page`, `limit`: Pagination.

**Response 200 OK**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Cannot access email",
      "status": "OPEN",
      "priority": "HIGH",
      "itPriority": "HIGH",
      "ticketOwnerId": null,
      "createdAt": "2026-09-01T00:00:00Z"
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 10
}
```

### GET /api/tickets/:id
Returns full details of a single ticket.
- **Requester:** 403 Forbidden if they do not own the ticket.
- **IT Staff/Admin:** Full access, including Internal Notes.

**Response 200 OK**
```json
{
  "id": 1,
  "title": "Cannot access email",
  "description": "...",
  "status": "OPEN",
  "priority": "HIGH",
  "itPriority": "HIGH",
  "requester": { "id": 1, "name": "Anya Suphan" },
  "ticketOwner": null,
  "publicComments": [
    { "id": 1, "content": "Looking into this.", "author": { "name": "IT Bob" }, "createdAt": "..." }
  ],
  "internalNotes": [
    { "id": 1, "content": "Maybe DNS issue.", "author": { "name": "IT Bob" }, "createdAt": "..." }
  ]
}
```
*(Note: `internalNotes` array is omitted if the requester is calling).*

### PATCH /api/tickets/:id
Updates operational fields on a ticket (IT Staff/Admin only).

**Request Body**
```json
{
  "status": "IN_PROGRESS",
  "itPriority": "HIGH",
  "ticketOwnerId": 2
}
```
**Response 200 OK**

### PATCH /api/tickets/:id/resolve
Allows a Requester to indicate the problem appears resolved.

**Request Body**: `{}`
**Response 200 OK** (Changes status to a designated state like 'Resolved' depending on transition matrix).

## 3. Comments and Notes

### POST /api/tickets/:id/public-comments
Adds a public comment visible to everyone on the ticket.

**Request Body**
```json
{ "content": "Thank you for the update." }
```
**Response 201 Created**

### POST /api/tickets/:id/internal-notes
Adds an internal note (IT Staff/Admin only).

**Request Body**
```json
{ "content": "Escalated to network team." }
```
**Response 201 Created**
**Error Responses**
- `403 Forbidden`: If called by a Requester.

## 4. User Management (Administrator Only)

### GET /api/users
Returns a list of users.

**Query Parameters**
- `search`: Name or email.
- `role`: Filter by role.

**Response 200 OK**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Admin Alice",
      "email": "alice@admin.com",
      "role": "Administrator",
      "isActive": true
    }
  ]
}
```

### POST /api/users
Creates a new user account.

**Request Body**
```json
{
  "name": "New User",
  "email": "new@example.com",
  "role": "IT Staff",
  "isActive": true,
  "initialPassword": "TempPassword123!"
}
```
**Response 201 Created**
- Will automatically set `requiresPasswordChange = true`.

### PATCH /api/users/:id
Updates an existing user.

**Request Body** (All fields optional)
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "IT Staff",
  "isActive": false,
  "initialPassword": "NewTempPassword1!"
}
```
**Response 200 OK**
**Error Responses**
- `400 Bad Request`: If updating email to one that already exists, or if Admin tries to deactivate themselves.
