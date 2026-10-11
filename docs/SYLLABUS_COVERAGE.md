# CareerLink - Complete Syllabus Coverage & Concept Mapping

**Student:** Om Maurya (Roll No: 150096725208)  
**Program:** B.Tech Computer Science & Engineering (Cohort: Jeff Bezos)  
**Institution:** ITM Skills University  
**Subject:** Backend Web Development with Node.js, Express, MongoDB & Firebase  

---

## 1. Syllabus Concepts Mapping Matrix

| # | Syllabus Concept | Where Implemented | File / Symbol | Technical Explanation & Implementation Detail | Concrete Evidence / Test Status |
|---|---|---|---|---|---|
| **1** | **Node.js Runtime** | Project core engine | `backend/src/server.js`, `package.json` | Non-blocking, event-driven JavaScript runtime executing server architecture. | `node -v`, `npm start` |
| **2** | **npm & Dependencies** | Package management | `backend/package.json` | Manages runtime (`express`, `mongoose`, `jsonwebtoken`) & dev (`jest`, `supertest`) dependencies. | `npm list`, lockfile verified |
| **3** | **CommonJS Modules** | File modularity | All files (`module.exports`, `require`) | Encapsulates logic across config, controllers, models, routes, services, and middleware. | Working imports in all 7 test suites |
| **4** | **Async / Await** | Asynchronous control flow | Controllers & Services | Clean promise consumption without callback hell for DB calls, external auth, and file I/O. | All Mongoose and file queries use `async/await` |
| **5** | **Promises** | Non-blocking async | `src/config/db.js`, `services/*` | Native ES6 Promises used for MongoDB connect, token verification, and file parsing. | Verified in DB connection lifecycle |
| **6** | **File System (`fs`)** | Disk I/O operations | `src/services/resumeParserService.js`, `src/app.js` | Uses `fs.readFileSync`, `fs.existsSync`, and `fs.mkdirSync` for file existence and buffer streaming. | Verified in `tests/resume.test.js` |
| **7** | **HTTP Protocol** | Request/Response lifecycle | `src/app.js`, `src/server.js` | Standard HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`), status codes (`200`, `201`, `400`, `401`, `403`, `404`, `409`). | 53 Jest HTTP assertions passed |
| **8** | **Express.js Framework** | HTTP Web server | `src/app.js` | High-performance minimalist web framework structuring middleware pipeline and REST endpoints. | Express application mounts in `app.js` |
| **9** | **Express Routing** | Modular URI Routing | `src/routes/*.js` | Separate `express.Router()` instances for `/api/auth`, `/api/jobs`, `/api/applications`, `/api/resume`, `/api/recommendations`. | Router endpoints tested across 7 suites |
| **10** | **Built-in Middleware** | Body parsing | `src/app.js:36-39` | `express.json({ limit: '10mb' })` and `express.urlencoded({ extended: true })`. | Tested in JSON payloads in tests |
| **11** | **Custom Middleware** | Request interception | `src/middleware/authenticate.js`, `authorize.js` | Custom middleware functions extracting tokens, verifying permissions, and passing request via `next()`. | Tested in `tests/security.test.js` |
| **12** | **REST Architecture** | API Design | `src/routes/jobRoutes.js`, `applicationRoutes.js` | Stateless, resource-oriented URIs using plural nouns with appropriate HTTP action semantics. | Swagger OpenAPI 3.0 specification |
| **13** | **JSON Processing** | Data exchange | `src/utils/responseHelper.js` | Standardized JSON envelopes `{ success: true, message: ..., data: ... }` for all responses. | Validated in Postman & Jest |
| **14** | **CORS** | Cross-Origin Sharing | `src/app.js:7-13` | Configured with `cors()` middleware allowing origins, credentials, and custom headers. | Prevents browser cross-origin blocks |
| **15** | **Request Validation** | Data integrity | `src/validators/*.js`, `src/middleware/validate.js` | `express-validator` rules validating emails, passwords, roles, ObjectIds, strings, arrays. | Rejects malformed requests with `400 Bad Request` |
| **16** | **Centralized Error Handling** | Exception management | `src/middleware/errorHandler.js`, `src/utils/errors.js` | 4-parameter error middleware formatting operational errors (`AppError`, `ValidationError`, `CastError`, duplicate keys). | Rejects bad queries gracefully |
| **17** | **MongoDB NoSQL** | Document database | `src/config/db.js` | Document-oriented flexible data store storing JSON-like documents with dynamic typing. | Local & Atlas MongoDB connection verified |
| **18** | **Mongoose ODM** | Object Modeling | `src/models/User.js`, `Job.js`, `Application.js` | Schemas, typed attributes, defaults, custom setters, indexes, virtuals, and hooks. | Schemas active and tested |
| **19** | **Database Schema Design** | Data architecture | `docs/DATABASE_SCHEMA.md` | Models 3 primary entities (`User`, `Job`, `Application`) with relational foreign keys and embedded subdocuments. | Detailed ER diagram in docs |
| **20** | **Database CRUD Operations**| Data manipulation | `src/services/jobService.js`, `applicationService.js` | Complete Create (`create()`), Read (`find()`, `findById()`), Update (`findByIdAndUpdate()`), Delete (`findByIdAndDelete()`). | Passed in `tests/jobs.test.js` |
| **21** | **Mongoose Populate** | Relational Joins | `src/services/jobService.js`, `applicationService.js` | Multi-collection population (`.populate('recruiter', 'name email company')`, `.populate('applicant')`). | Returned in job & application APIs |
| **22** | **Firebase Authentication**| External Identity | `src/config/firebase.js`, `src/middleware/authenticateFirebaseUser.js`, `frontend/src/config/firebase.js` | Firebase Admin SDK verifying client ID tokens; client SDK on React frontend; test mode mock verifier. | Verified via test suite and client integration |
| **23** | **JWT (JSON Web Tokens)** | Stateless Auth | `src/services/authService.js`, `src/middleware/authenticate.js` | Signs tokens with `userId` and `role`, verifies Bearer token on protected routes, handles expiry. | Passed in `tests/auth.test.js` |
| **24** | **Protected Routes** | Security boundary | `src/routes/jobRoutes.js`, `applicationRoutes.js` | Enforces `authenticate` middleware before executing controller logic. | Rejects missing/bad token with `401` |
| **25** | **RBAC (Role-Based Access)**| Authorization | `src/middleware/authorize.js` | Restricts operations by role (`recruiter` can post jobs; `jobseeker` can apply; recruiters cannot apply). | Passed in `tests/security.test.js` |
| **26** | **Resource Ownership** | Authorization guard | `src/services/jobService.js:145`, `applicationService.js:125`| Ensures recruiters can only modify or delete jobs and applications belonging to their own account. | Passed in `tests/jobs.test.js` |
| **27** | **Duplicate Prevention** | Business logic constraint| `src/models/Application.js:65`, `applicationService.js:32` | Compound unique index `{ job: 1, applicant: 1 }` prevents double applications with `409 Conflict`. | Passed in `tests/applications.test.js` |
| **28** | **File Upload (Multer)** | Binary multipart data | `src/middleware/upload.js` | Multer disk storage, 5MB file size limit, extension filter (`.pdf`, `.doc`, `.docx`), timestamp naming. | Passed in `tests/resume.test.js` |
| **29** | **Resume Parsing** | Advanced processing | `src/services/resumeParserService.js` | Multi-format text extraction (`pdf-parse`, `mammoth`) with regex pattern extraction of skills, email, phone, name. | Passed in `tests/resume.test.js` |
| **30** | **Skill Recommendation** | Algorithmic logic | `src/services/recommendationService.js` | Deterministic set intersection score: $\text{Match} = (\text{Matched Skills} / \text{Job Skills}) \times 100$. | Passed in `tests/recommendations.test.js` |
| **31** | **Database Indexing & Search** | Query optimization | `src/models/Job.js:118`, `src/services/jobService.js:95` | Full-text index (`$text: { $search: keyword }`) and single/compound indexes on `email`, `role`, `status`, `createdAt`. | Verified in job search tests |
| **32** | **Pagination & Sorting** | Big data handling | `src/services/jobService.js:68` | Mongoose `.skip()` and `.limit()` with calculated page count, hasNextPage, and totalItems. | Verified in `tests/jobs.test.js` |
| **33** | **Security (Helmet)** | HTTP Header hardening | `src/app.js:20` | Sets headers (`X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `X-DNS-Prefetch-Control`). | Passed in `tests/security.test.js` |
| **34** | **Rate Limiting** | DoS / Brute force guard| `src/app.js:17-29` | `express-rate-limit` window configuration (100 req / 15 min per IP) with 429 response. | Active on all `/api/*` endpoints |
| **35** | **Structured Logging** | Observability | `src/utils/logger.js`, `src/app.js:47-51` | Winston logger with combined file, error file, and Morgan console stream with timestamps. | Active in `logs/` directory |
| **36** | **Health Endpoint** | Liveness check | `src/app.js:122-140` | `/health` and `/api/health` providing uptime, memory usage, environment, and accurate DB health status. | Passed in `tests/health.test.js` |
| **37** | **Automated Testing** | QA & Regression | `backend/tests/*.test.js` | Jest test runner + Supertest integration testing all endpoints across 7 test suites. | **57/57 tests passed (100% pass rate)** |
| **38** | **Swagger / OpenAPI** | API Documentation | `backend/swagger.yaml`, `src/app.js:98-115` | Complete OpenAPI 3.0 specification covering 16 endpoints served interactively at `/api-docs` via `swagger-ui-express`. | Interactive at `http://localhost:5001/api-docs` |
| **39** | **Postman Collection** | API Testing | `CareerLink.postman_collection.json` | Complete Postman collection covering health, authentication, jobs, applications, resume upload/parsing, recommendations and authorization workflows (23 requests). | Ready to import in Postman |
| **40** | **Docker & Containerization** | DevOps | `Dockerfile`, `docker-compose.yml` | Node.js 20 Alpine image, environment interpolation (`${JWT_SECRET}`), persistent volumes, and healthchecks. | Docker compose config complete |
| **41** | **Cloud Deployment** | Production setup | `render.yaml` | Infrastructure as code configuration for zero-downtime cloud hosting on Render/Railway. | Ready for git push deployment |
