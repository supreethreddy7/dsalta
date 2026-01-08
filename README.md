# DSALTA-Style Compliance Tasks & Evidence API

Simple multi-tenant backend for **Tasks** and **Evidence** scoped by `organizationId`.

## Tech Stack
- Node.js + TypeScript
- TSOA (controllers + OpenAPI/Swagger)
- PostgreSQL
- Prisma ORM
- Docker & docker-compose

## Quick Start (Docker)
```bash
# from the repo root
cp .env.example .env

docker-compose up --build
```

API:
- Health: `http://localhost:3000/health`
- Swagger docs: `http://localhost:3000/docs`

### Seed sample data (optional)
In a new terminal:
```bash
docker-compose exec api npm run seed
```
The seed command prints a sample `organizationId`, `controlId`, and `taskId` you can use in Swagger or curl.

## Multi-tenancy / Org scoping
All reads/writes are scoped by `organizationId`. If a `taskId` (or evidence) does not belong to the given `organizationId`, the API returns **404**.

## Endpoints
Base path: `/v1`

### Tasks
- `POST /v1/organizations/{organizationId}/tasks`
- `GET /v1/organizations/{organizationId}/tasks` (pagination + filtering)
- `GET /v1/organizations/{organizationId}/tasks/{taskId}` (details + evidence)
- `PATCH /v1/organizations/{organizationId}/tasks/{taskId}`
- `DELETE /v1/organizations/{organizationId}/tasks/{taskId}`

### Evidence
- `POST /v1/organizations/{organizationId}/tasks/{taskId}/evidence`
- `DELETE /v1/organizations/{organizationId}/tasks/{taskId}/evidence/{evidenceId}`

## Example curl
```bash
# Create a task
curl -X POST "http://localhost:3000/v1/organizations/<ORG_ID>/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "controlId": "<CONTROL_ID>",
    "name": "Enable MFA for admin accounts",
    "description": "Require MFA on admin accounts across SaaS tools",
    "category": "ACCESS_CONTROL",
    "status": "OPEN"
  }'

# List tasks
curl "http://localhost:3000/v1/organizations/<ORG_ID>/tasks?limit=20&offset=0&status=OPEN"
```

## Local Dev (no Docker)
```bash
npm install
npm run dev
```
You still need a Postgres DB and `DATABASE_URL` in `.env`.

## Notes / Index suggestions
Schema includes indexes for common patterns:
- `(organizationId, status)`
- `(organizationId, category)`
- `(organizationId, controlId)`
