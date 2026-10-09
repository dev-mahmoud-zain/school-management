# NestJS Backend Assessment: Implementation Phases

This document provides a logical, step-by-step implementation plan for the NestJS school-management backend, designed to be completed within 8–10 hours. The phases are ordered by dependency to ensure a smooth development process. 

---

## Phase 1: Project Setup & Architecture (Estimate: 1 hour)
**What:** Initialize the NestJS project, set up PostgreSQL, configure environment variables, and establish the project structure.
**Why:** Provides the foundational architecture, ensures secrets are kept outside source code, and separates concerns.
**How:**
- Use Nest CLI to scaffold the project.
- Install TypeORM and PostgreSQL drivers. TypeORM is chosen for its native integration with NestJS.
- Use `@nestjs/config` for environment variables.
- Start a local PostgreSQL instance.

**Terminal Commands:**
Run these from your main workspace directory:
```bash
# Install Nest CLI globally if you don't have it
npm i -g @nestjs/cli

# Create the project (select npm when prompted)
nest new school-backend
cd school-backend

# Install TypeORM, Postgres driver, and Config module
npm install @nestjs/typeorm typeorm pg @nestjs/config

# Optional: Start a local PostgreSQL database using Docker
docker run --name school-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=school -p 5432:5432 -d postgres
```

**Testing:** 
Configure `.env` with your DB credentials, import `TypeOrmModule.forRootAsync` in `AppModule`, and run the app.
```bash
# From within school-backend directory:
npm run start:dev
```
Verify the application starts successfully and connects to the database.

**Interview prep:** 
- *Why TypeORM?* "It provides type safety, easy migrations, and integrates cleanly with NestJS out of the box."
- *Why separate services from controllers?* "To keep business logic reusable and testable independently of HTTP contexts."

---

## Phase 2: Database Schema & Relationships (Estimate: 1 hour)
**What:** Define the entities (Teacher, Class, Student) and their relations. Generate the boilerplate modules.
**Why:** Satisfies core requirements for data storage, generated identifiers, timestamps, and relationships.
**How:**
- Generate resources for Teacher, Class, and Student using the Nest CLI.
- Define TypeORM entities:
  - **Teacher:** `id` (UUID), `name` (String), `email` (String, Unique), `createdAt`, `updatedAt`.
  - **Class:** `id` (UUID), `name` (String, Unique), `capacity` (Int), `teacherId` (FK, Unique - 1:1 relation), `createdAt`, `updatedAt`.
  - **Student:** `id` (UUID), `name` (String), `email` (String, Unique), `classId` (FK - M:1 relation), `createdAt`, `updatedAt`.

**Terminal Commands:**
```bash
# From within school-backend directory:
nest g resource teacher --no-spec
nest g resource class --no-spec
nest g resource student --no-spec
# (Select REST API and 'Y' for CRUD entry points)
```

**Testing:** 
Since `synchronize: true` is commonly used in dev with TypeORM, just restarting the dev server will create the tables in PostgreSQL. Connect via a DB viewer (like DBeaver or pgAdmin) to inspect the tables.

**Interview prep:** 
- *Why UUIDs?* "They prevent ID enumeration and ensure global uniqueness, which is helpful if scaling."

---

## Phase 3: Core CRUD & Validation (Estimate: 1.5 hours)
**What:** Implement REST APIs (`GET`, `POST`, `PATCH`, `DELETE`) for all three entities with strict input validation.
**Why:** Covers the core API requirements and enforces data integrity.
**How:**
- Install validation packages.
- Add `ValidationPipe` globally in `main.ts`.
- Use `class-validator` decorators on your DTOs (e.g., `@IsEmail()`, `@IsString()`, `@Min(1)`).
- Handle standard CRUD in services.
- **Error Handling:** Catch database constraint violations (like duplicate emails) and throw `ConflictException` (409).

**Terminal Commands:**
```bash
# From within school-backend directory:
npm install class-validator class-transformer
```

**Testing:** Use Postman or cURL to test the endpoints.
```bash
# Example test:
curl -X POST http://localhost:3000/teacher \
  -H "Content-Type: application/json" \
  -d '{"name": "Ahmed Hassan", "email": "ahmed@example.com"}'
```

**Interview prep:**
- *How do you handle duplicate records here?* "By relying on the database unique constraints and catching the exception in the service to return a user-friendly 409 Conflict."

---

## Phase 4: Business Logic (Capacity & Deletion Rules) (Estimate: 1 hour)
**What:** Enforce class capacity and prevent deletion of records with dependents.
**Why:** Satisfies specific business rules in the assessment.
**How:**
- **Capacity Enforcement:** In `student.service.ts`, before adding/moving a student, count existing students in the target class. If `count >= capacity`, throw a `BadRequestException` (400).
- **Deletion Rules:** In `teacher.service.ts` and `class.service.ts`, before deleting, check if the record is used by a class or student respectively. Throw `ConflictException` (409) if dependents exist.

**Terminal Commands:**
No new dependencies needed. Just implement the logic in the generated service files.

**Testing:** 
Try to add a student to a full class using your API client. Try to delete a teacher who is assigned to a class.

**Interview prep:**
- *What about concurrency when checking capacity?* "In a real high-traffic app, I would use transactions with row-level locking (SELECT FOR UPDATE) to prevent race conditions during concurrent enrollments."

---

## Phase 5: Authentication & Authorization (Estimate: 1.5 hours)
**What:** Secure the endpoints with JWT authentication and Role-Based Access Control (RBAC). Create demo accounts.
**Why:** Fulfills access control requirements for Admin, Operator, Teacher, and Student roles.
**How:**
- Install Passport and JWT modules.
- Create an Auth module and a basic User entity/service (or hardcode demo accounts in the auth service).
- Roles: Admin (Full access, CSV import), Operator (Read, Create, Update - No Delete), Student/Teacher (Read-only).
- Implement `JwtAuthGuard` and a custom `RolesGuard`.

**Terminal Commands:**
```bash
# From within school-backend directory:
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install --save-dev @types/passport-jwt

nest g module auth
nest g controller auth
nest g service auth
```

**Testing:** 
Get a token via `/auth/login` and try to access restricted endpoints.
```bash
curl -X GET http://localhost:3000/teacher \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

**Interview prep:**
- *Why JWT?* "It's stateless, scalable, and easy to implement in NestJS. Since we don't strictly need session invalidation for this assessment, it's the simplest clean choice."

---

## Phase 6: CSV Import & Data Quality (Estimate: 2.5 hours)
**What:** Build the `/import` endpoint for Admin to upload the three CSV files, process them safely, and output a JSON report.
**Why:** Meets the data processing, deduplication, and reporting requirements.
**How:**
- Install CSV parsing and file upload types.
- Generate an Import module.
- Accept `multipart/form-data` with files using NestJS's built-in `FileInterceptor`.
- **Idempotency & Deduplication:** Normalize emails and names (lowercase, trimmed). Skip existing records.
- **Data Quality Logic:**
  - *Whitespace/Case:* Trim and lowercase.
  - *Missing/Invalid Data:* Reject rows missing names or having malformed emails.
  - *Duplicates:* Reject conflicting duplicates (same email, different name) inside the same file.
  - *Broken/Ambiguous Relationships:* Reject classes if the teacher email is missing, or if the teacher reference is ambiguous/not found.
  - *Capacity:* Process students sequentially. Reject students that exceed class capacity.
- **Processing Order:** Teachers -> Classes -> Students.

**Terminal Commands:**
```bash
# From within school-backend directory:
npm install csv-parser
npm install --save-dev @types/multer

nest g module import
nest g controller import
nest g service import
```

**Testing:** 
Use Postman or cURL to upload the CSV files to your import endpoint.
```bash
curl -X POST http://localhost:3000/import \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -F "teachers=@../Docs/teachers.csv" \
  -F "classes=@../Docs/classes.csv" \
  -F "students=@../Docs/students.csv"
```
Run it twice to verify idempotency (0 imported, all skipped on second run).

**Interview prep:**
- *Why not automatically fix ambiguous relationships?* "Guessing data logic leads to data corruption. It is safer to reject and flag for manual review."

---

## Phase 7: Swagger Documentation, Testing & Submission (Estimate: 1.5 hours)
**What:** Expose OpenAPI docs, write automated tests, and finalize the README.
**Why:** Required for API discovery, evaluation, and demonstrating code quality.
**How:**
- Install Swagger modules.
- Configure `DocumentBuilder` in `main.ts` with Bearer Auth enabled.
- Run unit and e2e tests provided by NestJS scaffolding, expanding them slightly for critical endpoints.
- Prepare `.env.example` and `README.md`.

**Terminal Commands:**
```bash
# From within school-backend directory:
npm install @nestjs/swagger swagger-ui-express

# Run tests
npm run test
npm run test:e2e
```

**Testing:** Open `http://localhost:3000/docs` in your browser. Authenticate using the demo accounts and test endpoints directly from the UI.

**Interview prep:**
- *What would you improve if you had more time?* "I'd add a queuing system (like BullMQ) for background processing of massive CSV files, instead of doing it synchronously in the HTTP request."

---

### Final Submission Checklist
- [ ] Source code and database ready.
- [ ] Tests pass (`npm run test`).
- [ ] `.env.example` included.
- [ ] Swagger UI at `/docs`.
- [ ] README with setup instructions (including the commands above), demo accounts, and design decisions.
- [ ] JSON report outputs from initial and duplicate imports saved.
