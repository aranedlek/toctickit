# TokTickIT - Full Stack Ticketing App

This is the repository for the TokTickIT lab series. 

## Requirements
- Node.js (v18+)
- PostgreSQL

## Getting Started

### Backend Setup
1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env` and set `DATABASE_URL`
4. Run `npx prisma db push` or `npx prisma migrate dev`
5. Run `npx prisma db seed`
6. `npm run dev`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`

### Testing
- Backend: `cd backend` -> `npm test`
- Frontend: `cd frontend` -> `npm test`
