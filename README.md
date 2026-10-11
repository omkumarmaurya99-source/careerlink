# CareerLink – Complete Job Portal Backend & Full Stack Application

**Author:** Om Maurya (Roll No: 150096725208)  
**Program:** B.Tech Computer Science & Engineering (Cohort: Jeff Bezos)  
**Institution:** ITM Skills University  
**Case Study:** Backend Development – Job Portal  

---

## 1. Problem Statement & Case Study Overview

Modern job portals must handle complex interactions between two distinct classes of actors: **Job Seekers** looking for tailored opportunities matching their competencies, and **Recruiters** publishing job requisitions, screening candidates, and advancing applicants through hiring stages.

Traditional monolithic portals often suffer from:
- Inefficient search and retrieval performance on large job datasets.
- Weak authorization checks where unauthorized users can alter job postings or candidate records.
- Cumbersome resume parsing requiring manual candidate data entry.
- Unstructured error handling and vulnerable REST endpoints.

**CareerLink** solves these challenges by implementing an enterprise-grade RESTful architecture using **Node.js, Express.js, MongoDB (Mongoose), and Firebase Authentication**, supplemented with **stateless JWT tokens, Role-Based Access Control (RBAC), deterministic resume parsing, and skill-match recommendation algorithms**.

---

## 2. Project Objectives

1. **Robust REST Architecture:** Design stateless, predictable RESTful endpoints following HTTP specifications and standard status codes.
2. **Dual-Layer Security:** Combine Google Firebase identity management with local cryptographic JSON Web Tokens (JWT) and granular RBAC.
3. **Optimized Data Pipeline:** Implement compound unique constraints to prevent duplicate applications and text indexes for rapid search.
4. **Automated Document Intelligence:** Parse resume documents (`.pdf`, `.docx`) into structured candidate profiles without relying on brittle third-party paid AI services.
5. **Transparency in Job Recommendations:** Build a deterministic scoring model matching job requirements to candidate competencies.
6. **100% Verified Testing:** Provide automated integration and regression suites using Jest and Supertest.

---

## 3. Technology Stack

- **Runtime Environment:** Node.js (v18+ / v20 LTS)
- **Web Framework:** Express.js (v4.x)
- **Database & ODM:** MongoDB (v8.x) with Mongoose (v8.x)
- **Authentication & Identity:** Firebase Admin SDK (v12.x) + JSON Web Tokens (`jsonwebtoken` v9.x)
- **Security Middleware:** Helmet (HTTP header protection), express-rate-limit (Brute-force protection), CORS
- **Validation Engine:** `express-validator` (v7.x)
- **Multipart / File Upload:** Multer (disk storage engine with MIME validation)
- **File Parsers:** `pdf-parse` (PDF binary extraction) & `mammoth` (DOCX extraction)
- **Logging & Diagnostics:** Winston logger + Morgan HTTP request logger
- **API Documentation:** Swagger UI (`swagger-ui-express` + OpenAPI 3.0 YAML)
- **Test Automation:** Jest (v29.x) + Supertest (v7.x)
- **DevOps & Containerization:** Docker, Docker Compose, Alpine Linux
- **Frontend / Client UI:** Modern interactive web interface connected to backend APIs

---

## 4. System Architecture

```
                                  [ Browser / Postman Client / Frontend UI ]
                                                     │
                                                     ▼
                                       ┌───────────────────────────┐
                                       │    Reverse Proxy / CORS   │
                                       └─────────────┬─────────────┘
                                                     │
                      ┌──────────────────────────────┴──────────────────────────────┐
                      ▼                                                             ▼
         ┌─────────────────────────┐                                   ┌─────────────────────────┐
         │     Security Layer      │                                   │      Static Assets      │
         │ - Helmet HTTP Headers   │                                   │ - Swagger UI (/api-docs)│
         │ - Rate Limiting         │                                   │ - Resume Uploads        │
         └────────────┬────────────┘                                   └─────────────────────────┘
                      │
                      ▼
         ┌─────────────────────────┐
         │    Middleware Chain     │
         │ - express.json()        │
         │ - Morgan / Winston      │
         │ - JWT Authenticate      │
         │ - Role Authorize (RBAC) │
         │ - express-validator     │
         └────────────┬────────────┘
                      │
         ┌────────────┴──────────────────────────────────────────┐
         ▼                           ▼                           ▼
┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
│  Auth Controller │        │  Job Controller  │        │ App Controller   │
└────────┬─────────┘        └────────┬─────────┘        └────────┬─────────┘
         │                           │                           │
         ▼                           ▼                           ▼
┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
│   Auth Service   │        │   Job Service    │        │App / Resume Serv │
└────────┬─────────┘        └────────┬─────────┘        └────────┬─────────┘
         │                           │                           │
         └───────────────────────────┼───────────────────────────┘
                                     ▼
                      ┌─────────────────────────────┐
                      │    Mongoose Models (ODM)    │
                      │  User | Job | Application   │
                      └──────────────┬──────────────┘
                                     ▼
                      ┌─────────────────────────────┐
                      │     MongoDB Local/Atlas     │
                      └─────────────────────────────┘
```

---

## 5. Folder Structure

```
careerlink/
├── backend/
│   ├── src/
│   │   ├── config/             # DB & Firebase configuration
│   │   │   ├── db.js
│   │   │   └── firebase.js
│   │   ├── controllers/        # Request handling & HTTP response coordination
│   │   │   ├── authController.js
│   │   │   ├── jobController.js
│   │   │   ├── applicationController.js
│   │   │   ├── resumeController.js
│   │   │   └── recommendationController.js
│   │   ├── middleware/         # Security, Auth, RBAC, Validation & Errors
│   │   │   ├── authenticate.js
│   │   │   ├── authorize.js
│   │   │   ├── errorHandler.js
│   │   │   ├── upload.js
│   │   │   └── validate.js
│   │   ├── models/             # Mongoose schemas & indexes
│   │   │   ├── User.js
│   │   │   ├── Job.js
│   │   │   └── Application.js
│   │   ├── routes/             # Express route modules
│   │   │   ├── authRoutes.js
│   │   │   ├── jobRoutes.js
│   │   │   ├── applicationRoutes.js
│   │   │   ├── resumeRoutes.js
│   │   │   └── recommendationRoutes.js
│   │   ├── services/           # Business logic & algorithms
│   │   │   ├── authService.js
│   │   │   ├── jobService.js
│   │   │   ├── applicationService.js
│   │   │   ├── resumeParserService.js
│   │   │   └── recommendationService.js
│   │   ├── utils/              # Winston logger, error classes, response helper
│   │   ├── validators/         # express-validator schemas
│   │   ├── app.js              # Express application assembly
│   │   └── server.js           # Server process bootstrap
│   ├── tests/                  # Automated Jest + Supertest suites (57 tests)
│   ├── uploads/                # Local resume storage directory
│   ├── logs/                   # System & error logs
│   ├── swagger.yaml            # OpenAPI 3.0 specification
│   ├── Dockerfile              # Backend containerization
│   └── package.json            # Node.js dependencies & scripts
├── frontend/                   # Client application
├── docs/                       # Comprehensive documentation & reports
│   ├── DATABASE_SCHEMA.md
│   ├── API_DOCUMENTATION.md
│   ├── SYLLABUS_COVERAGE.md
│   ├── PROJECT_REQUIREMENTS_CHECKLIST.md
│   └── STUDENT_ACTION_REQUIRED.md
├── docker-compose.yml          # Multi-container service definitions
├── render.yaml                 # Cloud deployment infrastructure manifest
├── CareerLink.postman_collection.json # 23 automated Postman requests
└── README.md                   # Primary documentation
```

---

## 6. Installation & Local Setup

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- MongoDB Community Server running locally on `localhost:27017` OR a MongoDB Atlas cluster URI

### Step-by-Step Instructions

1. **Clone or Navigate to the Workspace:**
   ```bash
   cd "/Users/calmkao/Documents/Backend project/careerlink"
   ```

2. **Backend Dependencies Installation:**
   ```bash
   cd backend
   npm install
   ```

3. **Environment Configuration:**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Inspect `backend/.env`:
   ```env
   # Default port is 5001 on macOS (as Port 5000 is occupied by ControlCenter/AirPlay)
   PORT=5001
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/careerlink
   JWT_SECRET=replace_with_a_unique_random_secret_before_deployment
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=http://localhost:5173
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX=100
   ```

4. **Start MongoDB Service (if not already running):**
   ```bash
   brew services start mongodb-community@8.0
   ```

5. **Start the Backend Server:**
   ```bash
   npm run dev
   # or for production mode:
   npm start
   ```
   The backend will start on `http://localhost:5001` (or `http://localhost:5000` in Docker).

6. **Verify Health Endpoint:**
   ```bash
   curl http://localhost:5001/health
   ```

---

## 7. Running Automated Test Suite

All 7 test suites can be executed via Jest in one command:

```bash
cd backend
npm test -- --runInBand
```

**Verified Test Execution Results:**
- Total Test Suites: **7 passed, 7 total**
- Total Tests: **57 passed, 57 total (100% pass rate in ~1.73s)**
- Suites verified:
  1. `tests/health.test.js` (3 tests) - Server and MongoDB database health monitoring
  2. `tests/auth.test.js` (17 tests) - Registration, login, Firebase ID token verification, profile, and email-only rejection
  3. `tests/jobs.test.js` (16 tests) - CRUD, pagination, search, filters, ownership enforcement
  4. `tests/applications.test.js` (7 tests) - Application submission, duplicate prevention, status updates
  5. `tests/recommendations.test.js` (3 tests) - Deterministic skill match scoring, partial match, empty cases
  6. `tests/resume.test.js` (6 tests) - Regex entity extraction, upload validation, format limits
  7. `tests/security.test.js` (5 tests) - Helmet headers, RBAC jobseeker vs recruiter, NoSQL injection protection

---

## 8. API Documentation (Swagger & Postman)

### Interactive Swagger UI
Access the complete interactive OpenAPI documentation at:
**`http://localhost:5001/api-docs`** (or `http://localhost:5000/api-docs` in Docker)

Features:
- Live request testing ("Try it out")
- Authorization modal (inject JWT token)
- Full schemas for `User`, `Job`, `Application`, and error models covering 16 endpoints

### Automated Postman Collection
Import [`CareerLink.postman_collection.json`](CareerLink.postman_collection.json) into Postman.
- Complete Postman collection covering health, authentication, jobs, applications, resume upload/parsing, recommendations and authorization workflows (23 requests).
- Automatic token capture into collection variables.
- Dynamic timestamps (`{{recruiterEmail}}`, `{{jobseekerEmail}}`) preventing duplicate email conflicts.
- Real `multipart/form-data` request for resume upload.
- Automatic `jobId` and `applicationId` chaining.
- Status code, response shape, and business logic assertions on every request.

---

## 9. Docker Deployment

To build and run CareerLink and MongoDB in isolated Docker containers:

```bash
cd "/Users/calmkao/Documents/Backend project/careerlink"
docker compose up -d --build
```

To verify running containers:
```bash
docker compose ps
```

To stop containers:
```bash
docker compose down
```

---

## 10. Student & Academic Information

- **Student Name:** Om Maurya
- **Roll Number:** 150096725208
- **Course:** B.Tech Computer Science & Engineering
- **Batch:** 2025–2029
- **Cohort:** Jeff Bezos
- **University:** ITM Skills University
- **Instructor / Evaluator Review Date:** October 2026
