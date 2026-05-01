# PM App Backend

Backend API for a project management application built with NestJS, Prisma, and PostgreSQL.

The service handles:

- authentication with JWT
- email confirmation and password recovery
- project creation and membership management
- sprint planning
- issue and backlog management
- Kanban board updates
- release planning and release issue tracking

## What the backend does

This backend powers the main collaboration flows of the PM App:

- users can register, verify their email, log in, and recover passwords
- authenticated users can create projects and invite teammates by email
- project owners and admins can manage team roles, sprints, and releases
- teams can create issues, assign work, move issues into sprints, and update issue statuses
- releases can group issues and be filtered by status, assignee, and search

## Tech stack

- [NestJS](https://nestjs.com/) for the API framework
- [Prisma ORM](https://www.prisma.io/) for database access
- [PostgreSQL](https://www.postgresql.org/) as the main database
- [JWT](https://jwt.io/) for authentication
- [Passport](https://www.passportjs.org/) for auth strategies
- [Argon2](https://github.com/ranisalt/node-argon2) for password hashing
- [Nodemailer](https://nodemailer.com/) for email delivery
- TypeScript throughout the project

## Main modules

- `auth` - login, registration, profile, email confirmation, password reset
- `users` - user creation, update, verification, lookup helpers
- `projects` - projects, memberships, roles
- `issues` - issues, backlog, board, moving issues to sprint
- `sprints` - sprint creation, updates, active sprint handling
- `releases` - release creation, listing, issue filtering inside releases
- `email` - SMTP email sending

## Data model overview

Main entities in the database:

- `User`
- `Project`
- `ProjectMember`
- `Sprint`
- `Issue`
- `Release`
- `ConfirmEmailToken`
- `PasswordRecoveryToken`

Enums used by the API:

- project roles: `OWNER`, `ADMIN`, `MEMBER`
- issue types: `BUG`, `TASK`, `STORY`
- issue priorities: `LOW`, `MEDIUM`, `HIGH`
- issue statuses: `TODO`, `IN_PROGRESS`, `CODE_REVIEW`, `DONE`
- release statuses: `UNRELEASED`, `RELEASED`

## API base URL

The app starts with the global prefix `api`, so local endpoints are served from:

```text
http://localhost:5555/api
```

## Main routes

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/change-password`
- `GET /api/auth/profile`
- `GET /api/auth/confirm/:token`

### Projects

- `POST /api/projects`
- `GET /api/projects`
- `GET /api/projects/:projectId`
- `PATCH /api/projects/:projectId`
- `GET /api/projects/:projectId/members`
- `POST /api/projects/:projectId/members/add-by-email`

### Issues, backlog, and board

- `POST /api/projects/:projectId/issues`
- `GET /api/projects/:projectId/issues`
- `GET /api/projects/:projectId/issues/:issueId`
- `PATCH /api/projects/:projectId/issues/:issueId`
- `DELETE /api/projects/:projectId/issues/:issueId`
- `GET /api/projects/:projectId/backlog`
- `GET /api/projects/:projectId/board`
- `POST /api/projects/:projectId/issues/:issueId/move-to-sprint`

### Sprints

- `POST /api/projects/:projectId/sprints`
- `PATCH /api/projects/:projectId/sprints/:sprintId`
- `GET /api/projects/:projectId/sprints`
- `GET /api/projects/:projectId/sprints/active`

### Releases

- `POST /api/projects/:projectId/releases`
- `GET /api/projects/:projectId/releases`
- `GET /api/projects/:projectId/releases/:releaseId`

### Email utility

- `POST /api/email/send`

## Environment variables

Create a `.env` file in `pm-server` with values similar to these:

```env
PORT=5555
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pm_db
JWT_SECRET=replace_with_a_secure_secret
CLIENT_URL=http://localhost:3000
API_URL=http://localhost:5555/api

EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=example@example.com
EMAIL_PASS=your_password
```

Notes:

- `CLIENT_URL` is used for CORS and frontend redirects after email confirmation
- `API_URL` is used when generating confirmation links sent by email
- email-related variables are required if you want registration confirmation and password recovery to work

## Run locally without Docker

### 1. Install dependencies

```bash
npm install
```

### 2. Create the database

Make sure PostgreSQL is running locally and a database named `pm_db` exists.

### 3. Configure environment variables

Create `.env` in `pm-server` using the example above.

### 4. Apply database migrations

```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Start the backend

```bash
# development
npm run start:dev

# regular start
npm run start

# production build
npm run build
npm run start:prod
```

After startup, the API is available at:

```text
http://localhost:5555/api
```

## Run with Docker

The included `docker-compose.yml` starts:

- PostgreSQL
- the NestJS backend
- pgAdmin

### 1. Configure environment variables

Create a `.env` file in `pm-server` from the example above.

For Docker, `DATABASE_URL` is provided by `docker-compose.yml`, so the local
`localhost` database URL in `.env` is not used by the app container.

### 2. Start everything

```bash
docker compose up --build
```

You can also run it in the background:

```bash
docker compose up --build -d
```

### 3. Apply database migrations

If this is the first run for a fresh database, apply migrations inside the app
container:

```bash
docker compose exec app npx prisma migrate deploy
```

Run this command again after pulling changes that add new Prisma migrations.

Useful URLs:

- API: `http://localhost:5555/api`
- pgAdmin: `http://localhost:5050`

### Start existing containers again

```bash
docker compose up
```

### Stop and remove containers

```bash
docker compose down
```

### Stop and remove containers with database volume data

```bash
docker compose down -v
```

This deletes the local Docker database volume. Use it only when you want a fresh
empty database.

## pgAdmin connection

After opening pgAdmin, register the PostgreSQL server with these values:

### General tab

- Name: `pm-postgres`

### Connection tab

| Field             | Value       |
| :---------------- | :---------- |
| Host name/address | `pm-postgres` |
| Port              | `5432` |
| Username          | `postgres` |
| Password          | `postgres` |

## Scripts

```bash
npm run build
npm run format
npm run start
npm run start:dev
npm run start:debug
npm run start:prod
npm run lint
npm run test
npm run test:watch
npm run test:cov
npm run test:e2e
```

## Authorization notes

- most project-related endpoints require a Bearer token
- JWT-protected routes use the NestJS `JwtAuthGuard`
- project management actions such as sprint creation or adding members are limited by project role

## Current Docker setup note

`docker-compose.yml` in this folder covers the backend stack only. If you are running the frontend locally, point it to this API with:

```env
NEXT_PUBLIC_API_URL=http://localhost:5555/api
```
