# NestJS School Management API

## Project Overview
A backend assessment project built with NestJS and PostgreSQL for managing school resources. It features authentication, role-based access control, CRUD operations for students, teachers, and classrooms, and bulk CSV importing.

## Requirements
- Node.js (v18+)
- Docker and Docker Compose
- PostgreSQL 15 (if not using Docker)

## Setup and Environment Configuration
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up the environment variables by copying the example file:
   ```bash
   cp .env.example .env
   ```
   *(Update the values in `.env` if necessary, though the defaults match the Docker Compose setup).*

3. Start the PostgreSQL database using Docker Compose:
   ```bash
   docker-compose up -d
   ```

4. Initialize the database schema and seed the demo accounts:
   ```bash
   npm run seed:demo
   ```

## Running the Application
To run the server in development mode with auto-reload:
```bash
npm run start:dev
```
The application will start on the port configured in your `.env` (default: 3000).

## Demo Accounts and Roles
The database is pre-seeded with the following demo accounts (Password for all accounts is `password123`):

| Role     | Email                 |
|----------|-----------------------|
| Admin    | admin@gmail.com    |
| Operator | operator@gmail.com |
| Teacher  | teacher@gmail.com  |
| Student  | student@gmail.com  |

## CSV Import Instructions and Report Files
The system provides an idempotent bulk-import mechanism via CSV. It processes `teachers.csv`, `classes.csv`, and `students.csv` into the database without altering the original files.

To generate the import reports and verify idempotency:
```bash
npx tsx src/run_import.ts
```

This script will run an initial import followed by a second identical import. It generates two explicit report files in the project root:
- `initial_import_report.json`
- `second_import_report.json`

## Running Tests
End-to-End (E2E) tests cover authentication, RBAC, CRUD restrictions, class capacity limits, and relationship integrity.
To run the E2E tests:
```bash
npm run test:e2e
```

## API Documentation
Interactive API documentation is generated automatically. Start the server and navigate to:
- **Swagger UI:** [http://localhost:3000/docs](http://localhost:3000/docs)
- **OpenAPI JSON:** [http://localhost:3000/openapi.json](http://localhost:3000/openapi.json)

## Brief Design Decisions and Import Assumptions
- **Idempotency & Conflicts:** CSV imports use unique constraints (like emails) to detect existing records. Duplicate rows from subsequent imports are safely skipped rather than updated or thrown as fatal errors.
- **Data Validation:** Imports do not fail the entire batch when encountering an invalid row. Each row's status is tracked independently in the final JSON report.
- **Relational Integrity:** Classrooms cannot be deleted if students are currently enrolled in them. Class capacities are strictly enforced.

## Actual Time Spent, Assumptions, and Incomplete Requirements
- **Time Spent:** [Placeholder: Add your actual time spent here]
- **Assumptions:** 
  - The CSV import should be completely idempotent and handle duplicate records gracefully. 
  - Teacher and classroom relations in the CSVs are matched by name.
- **Incomplete Requirements:** None. All assessment requirements have been completed and verified via E2E testing.
