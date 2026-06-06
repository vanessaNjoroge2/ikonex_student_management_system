# Ikonex Academy Student Management System

Welcome to the **Ikonex Academy Student Management System**, a state-of-the-art administrative portal designed for schools to manage student profiles, academic streams, subjects, scores, and report card compilations.

The system is split into:
1. **Frontend**: A highly responsive, visual, and modern React + Vite dashboard styled with Tailwind CSS v4, dynamic animations via Motion (Framer Motion), and charts using Recharts.
2. **Backend**: A robust, secure Express + TypeScript REST API utilizing Prisma ORM with a PostgreSQL database, validated with Zod, and secured via JWT-based access and refresh token authentication.

---

## Key Features

* **Class Stream Management**: Admin dashboard allows full management of school streams, classroom room allocations, and teacher assignments.
* **Grading Scale Configuration**: System-wide dynamically configured grading thresholds (A+, A, B, etc.) that instantly recalculate report card grades and GPAs.
* **Strict Score Entry Validation**: Zod-based score constraints checked at runtime and middleware levels to prevent input errors where `score > maxScore`.
* **Relative Position & Rankings**: Auto-calculates subject-specific positions and overall class rankings for rosters and report cards.
* **Official PDF Export**: Print-ready, layout-perfect PDF downloads for individual student report cards and cohort performance summaries.
* **Refined Responsive Layout**: Optimized layouts for mobile, tablet, and desktop screens with smooth micro-interactions.

---

## Project Structure

Here is a high-level view of the project's folders and files:

```text
ikonex-student-management/
├── frontend/                              # React + Vite Client Application
│   ├── src/
│   │   ├── components/                    # View-specific React components
│   │   │   ├── DashboardView.tsx          # Analytics, summary stats, activity cards
│   │   │   ├── StudentsView.tsx           # Roster, profiles, enrollment, search/filters
│   │   │   ├── StreamsView.tsx            # Classroom cohorts, room info, grades
│   │   │   ├── SubjectsView.tsx           # Subject registry, teacher assignments
│   │   │   ├── ScoresView.tsx             # Score list, updates, rank leaderboard
│   │   │   ├── ReportsView.tsx            # Transcript viewer, PDF download
│   │   │   └── SettingsView.tsx           # System configs and info
│   │   ├── App.tsx                        # Main dashboard shell & navigation
│   │   ├── data.ts                        # Local storage / mock data baseline
│   │   ├── index.css                      # Global styles and tailwind directives
│   │   ├── main.tsx                       # React application bootstrapper
│   │   └── types.ts                       # Domain TypeScript interfaces
│   ├── index.html                         # Entry HTML file
│   ├── landing.html                       # Standalone rebuilt landing page HTML
│   ├── package.json                       # Frontend scripts & dependencies
│   └── vite.config.ts                     # Vite build and server config
│
├── backend/                               # Express + TypeScript Server Application
│   ├── prisma/
│   │   ├── schema.prisma                  # Prisma ORM Database Models
│   │   └── seed.ts                        # Seed script with default users & records
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts                      # Prisma client instantiation
│   │   │   └── env.ts                     # Environment config schema
│   │   ├── middleware/
│   │   │   ├── auth.ts                    # JWT authorization & permission checks
│   │   │   ├── errorHandler.ts            # Global HTTP response error catcher
│   │   │   └── validate.ts                # Zod request payload validator
│   │   ├── modules/                       # Feature-based domain folders
│   │   │   ├── auth/                      # Controllers, services, and login routes
│   │   │   ├── dashboard/                 # Controller/routes for summary activity
│   │   │   ├── reports/                   # Performance stats and PDF transcript builders
│   │   │   ├── scores/                    # Assessment grade logs and rankings
│   │   │   ├── streams/                   # Academic cohorts, rooms, and roster logic
│   │   │   ├── students/                  # Roster management, profiles, card details
│   │   │   └── subjects/                  # Syllabus mapping and stream linkages
│   │   ├── types/
│   │   │   └── express.d.ts               # Request type extension for authenticated user
│   │   ├── utils/
│   │   │   ├── grading.ts                 # Letter grade & GPA calculators
│   │   │   ├── pagination.ts              # Offset/Limit metadata generator
│   │   │   └── response.ts                # Standardized JSON response formatting
│   │   ├── app.ts                         # Express app declaration & routers mounting
│   │   └── server.ts                      # Server launcher & db connecter
│   ├── package.json                       # Backend scripts & NPM dependencies
│   └── tsconfig.json                      # TypeScript compiler configuration
└── README.md                              # Project documentation (this file)
```

For configuration files, refer directly to [backend/package.json](file:///c:/Users/user/OneDrive%20-%20Mount%20Kenya%20University/Desktop/Projects/ikonex-student-management/backend/package.json) and [frontend/package.json](file:///c:/Users/user/OneDrive%20-%20Mount%20Kenya%20University/Desktop/Projects/ikonex-student-management/frontend/package.json).

---

## Prerequisites

Before starting, ensure you have the following installed:
* **Node.js** (v18.x or higher)
* **npm** (v9.x or higher)
* **PostgreSQL Database Server** (running locally or in the cloud)

---

## Setup & Running Guide

### 1. Database Setup
Ensure your PostgreSQL database is running. By default, the application connects to a database named `vanessa_portfolio` via:
```text
postgresql://postgres:postgres@localhost:5432/vanessa_portfolio?schema=public
```

If your local database configuration (port, user, or password) differs:
1. Open [backend/.env](file:///c:/Users/user/OneDrive%20-%20Mount%20Kenya%20University/Desktop/Projects/ikonex-student-management/backend/.env).
2. Modify the `DATABASE_URL` value.

### 2. Backend Setup
Go to the `backend/` directory:
```bash
cd backend
```

Install NPM dependencies:
```bash
npm install
```

Generate Prisma Client and apply migrations:
```bash
npx prisma migrate dev --name init
```

Seed the database with default records:
```bash
npx prisma db seed
```

Start the backend server in development mode:
```bash
npm run dev
```
The backend server will run on **http://localhost:3000**.

### 3. Frontend Setup
Go to the `frontend/` directory:
```bash
cd ../frontend
```

Install NPM dependencies:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```
The frontend application will start on **http://localhost:5173** (or choose port 3000/3001 if selected).

---

## Authentication & Default Credentials

All core endpoints (except auth routes) require requests to include an `Authorization` header containing the JWT token.
```text
Authorization: Bearer <your_access_token>
```

The database includes the following seeded accounts:

| Name | Email / Username | Password | Role |
| :--- | :--- | :--- | :--- |
| **John Miller** | `j.miller@ikonex.edu` | `password123` | **ADMIN** |
| **Sarah Jenkins** | `s.jenkins@ikonex.edu` | `password123` | **TEACHER** |
| **Emily Bronte** | `e.bronte@ikonex.edu` | `password123` | **TEACHER** |
| **Alan Turing** | `a.turing@ikonex.edu` | `password123` | **TEACHER** |

---

## Grading Policy & Rules

Academic grades are computed using percentages of maximum marks (calculated as `(score / maxScore) * 100`) mapped dynamically through the [grading.ts utility](file:///c:/Users/user/OneDrive%20-%20Mount%20Kenya%20University/Desktop/Projects/ikonex-student-management/backend/src/utils/grading.ts):

* **A+** (`>= 95%`): *Outstanding comprehension and critical analyses.* (Pass)
* **A** (`90%` to `94.9%`): *Outstanding comprehension and critical analyses.* (Pass)
* **B+** (`85%` to `89.9%`): *Commendable effort. Solid application.* (Pass)
* **B** (`80%` to `84.9%`): *Commendable effort. Solid application.* (Pass)
* **C+** (`75%` to `79.9%`): *Consistent progress. Work on minor gaps.* (Pass)
* **C** (`70%` to `74.9%`): *Consistent progress. Work on minor gaps.* (Pass)
* **D** (`60%` to `69.9%`): *Requires targeted support and reviews.* (Pass)
* **F** (`< 60%`): *Action plan recommended for essential recovery.* (Fail)

---

## API Documentation

Below is the list of active REST API routes exposed by the backend server:

### 1. Authentication (`/api/auth`)
Mounted at [auth.routes.ts](file:///c:/Users/user/OneDrive%20-%20Mount%20Kenya%20University/Desktop/Projects/ikonex-student-management/backend/src/modules/auth/auth.routes.ts).

* `POST /login`: Authenticate and receive `accessToken` (valid for 15 mins) & `refreshToken` (valid for 7 days).
* `POST /refresh`: Refresh the current session access token.
* `POST /logout`: Revoke active credentials session.

### 2. Students (`/api/students`)
Mounted at [students.routes.ts](file:///c:/Users/user/OneDrive%20-%20Mount%20Kenya%20University/Desktop/Projects/ikonex-student-management/backend/src/modules/students/students.routes.ts).

* `GET /`: Retrieve a list of students with query pagination and stream/status filters.
* `GET /:id`: Retrieve a student's personal details.
* `POST /`: Add a new student record.
* `PUT /:id`: Edit a student record.
* `DELETE /:id`: Remove a student record.
* `GET /:id/scores`: Retrieve a student's graded assessment list.
* `GET /:id/report`: Retrieve report card grades and GPA statistics.

### 3. Streams & Classroom Cohorts (`/api/streams`)
Mounted at [streams.routes.ts](file:///c:/Users/user/OneDrive%20-%20Mount%20Kenya%20University/Desktop/Projects/ikonex-student-management/backend/src/modules/streams/streams.routes.ts).

* `GET /`: Retrieve all stream cohorts.
* `GET /:id`: Retrieve specific details of a stream.
* `GET /:id/students`: Retrieve a list of students in the stream.
* `GET /:id/performance`: Retrieve subject average grades for a stream.

### 4. Subjects & Syllabus (`/api/subjects`)
Mounted at [subjects.routes.ts](file:///c:/Users/user/OneDrive%20-%20Mount%20Kenya%20University/Desktop/Projects/ikonex-student-management/backend/src/modules/subjects/subjects.routes.ts).

* `GET /`: Retrieve list of subjects with assigned streams.
* `GET /:id`: Retrieve subject details.
* `POST /`: Create a new subject.
* `PUT /:id`: Edit subject name, code, or teacher.
* `DELETE /:id`: Delete a subject.
* `GET /:id/streams`: Retrieve list of streams assigned to the subject.
* `POST /:id/streams`: Link a stream to a subject.
* `DELETE /:id/streams/:streamId`: Remove link between subject and stream.

### 5. Scores & Assessments (`/api/scores`)
Mounted at [scores.routes.ts](file:///c:/Users/user/OneDrive%20-%20Mount%20Kenya%20University/Desktop/Projects/ikonex-student-management/backend/src/modules/scores/scores.routes.ts).

* `GET /`: Filter logged grades by student, subject, or term.
* `POST /`: Log a score. Returns `409 Conflict` if combination already exists.
* `PUT /:id`: Edit a score value.
* `DELETE /:id`: Remove a score log.
* `GET /class`: Return class rankings leaderboard (ranked by cumulative term performance).

### 6. Summary Reports (`/api/reports`)
Mounted at [reports.routes.ts](file:///c:/Users/user/OneDrive%20-%20Mount%20Kenya%20University/Desktop/Projects/ikonex-student-management/backend/src/modules/reports/reports.routes.ts).

* `GET /student/:id`: Grade report statistics for student profiles.
* `GET /class`: View overall class GPA and performance indicators.
* `GET /stream-comparison`: View breakdown comparing grade levels.
* `GET /grade-distribution`: Count of grades (A+, A, B+, B, C+, C, D, F) across the school.
* `GET /top-performers`: List of the top 10 students by GPA.
* `GET /term-trend`: Class average trend line over different school terms.

### 7. Dashboard Summaries (`/api/dashboard`)
Mounted at [dashboard.routes.ts](file:///c:/Users/user/OneDrive%20-%20Mount%20Kenya%20University/Desktop/Projects/ikonex-student-management/backend/src/modules/dashboard/dashboard.routes.ts).

* `GET /stats`: Retrieve summary stats (total students, streams, subjects, average performance).
* `GET /activity`: Retrieve a list of recent enrollment and grade updates.
