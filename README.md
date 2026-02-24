# TaskMaster Enterprise (MERN Assessment)

Backend: Express + TypeScript + MongoDB (Mongoose)  
Auth: JWT access + refresh (hashed refresh token storage)  
Architecture: Controllers → Services → Repositories → Models  
Extras: RBAC, soft deletes, pagination/filter/sort, OpenAPI/Swagger, Jest/Supertest

## Requirements

- Node.js 18+ (20 recommended)
- MongoDB (local) OR Docker

## Environment

Create `backend/.env` (use `backend/.env.example` as reference).

Key vars:

- `MONGO_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `ACCESS_TOKEN_TTL`
- `REFRESH_TOKEN_TTL`
- `CORS_ORIGIN`
- `PORT`

## Run locally (without Docker)

```bash
cd backend
npm install
npm run dev
```
