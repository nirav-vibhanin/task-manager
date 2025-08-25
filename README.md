# Project & Task Management
## Setup (do this first)

### Prerequisites
- Node.js 18+
- MongoDB connection (local or Atlas)

### Backend (Node/Express/TypeScript)
1. Go to `cd back-end/`
2. Copy `env.example` to `.env`;
3. Install and run:
   - `npm install`
   - Dev: `npm run dev`
   - Build: `npm run build`
   - Start: `npm start`
4. API base URL: `http://localhost:5000/api`
5. API Swagger URL: `http://localhost:5000/api-docs`

### Frontend (React/Vite/TypeScript)
1. Go to `cd front-end/`
2. Copy `.env.example` to `.env`;
3. Install and run:
   - `npm install`
   - `npm run dev`
4. App URL (dev): usually `http://localhost:5173`
---

## What I completed
- Auth
  - Register and Login endpoints with JWT.
  - Auth middleware to protect routes and attach `req.user`.
- Projects
  - CRUD controller and listing with basic search/filter.
- Tasks
  - Create, get by id, list by project, update, delete.
- Shared utilities
  - Consistent API responses and message strings.
- Frontend base
  - RTK Query setup with `VITE_API_URL` env and auth header handling.
- API docs
  - OpenAPI spec (swagger) file included.

## What is pending (from my side) 
- All functionality is completed
## How to run (quick)
- Start backend: `npm run dev` in `back-end/`
- Start frontend: `npm run dev` in `front-end/`

## Quick verification steps
1. Register: POST `/api/auth/register` with `{ name, email, password, gender }`
2. Login: POST `/api/auth/login` and copy the returned `token`
3. Use the token in `Authorization: Bearer <token>`
4. Projects:
   - Create: POST `/api/projects`
   - List: GET `/api/projects?q=...&status=...&page=1&limit=20`
   - Get/Update/Delete: `/api/projects/:id`
5. Tasks:
   - Create: POST `/api/tasks` (include `project`, `title`, `status`)
   - List by project: GET `/api/tasks/project/:projectId`
   - Get/Update/Delete: `/api/tasks/:id`
