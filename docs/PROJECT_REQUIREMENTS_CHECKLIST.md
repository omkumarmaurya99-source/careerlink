# CareerLink - Project Requirements Checklist

**Project:** CareerLink – Job Portal  
**Student:** Om Maurya (Roll No: 150096725208)  
**Program:** B.Tech CSE (Cohort: Jeff Bezos)  
**Institution:** ITM Skills University  

### Status Definitions:
- **PASS:** Fully implemented and verified through actual automated test suites or local verified build.
- **PARTIAL:** Implemented in part or functional with limited format/feature scope.
- **PENDING MANUAL VERIFICATION:** Fully implemented in code, but requires external student private credentials (e.g., Firebase private service account key, MongoDB Atlas cloud cluster credentials, hosting platform login).
- **NOT IMPLEMENTED:** Not implemented or omitted.

---

## Requirements Verification Matrix

| # | College Case Study / PS Requirement | Implementation Detail | File / Route | Status | Verified Evidence |
|---|---|---|---|---|---|
| **1** | **User Registration (Recruiter & Jobseeker)** | Dedicated endpoints with input validation, role checks, and JWT token issuance. | `POST /api/auth/register`<br>`backend/src/controllers/authController.js` | **PASS** | Verified in `tests/auth.test.js` (Status 201 verified, JWT issued) |
| **2** | **User Login & Token Generation** | Validates credentials, issues 7-day signed JWT token with role claims. Strictly rejects email-only logins. | `POST /api/auth/login`<br>`backend/src/services/authService.js` | **PASS** | Verified in `tests/auth.test.js` (Status 200, JWT returned; email-only rejected 400) |
| **3** | **Firebase Authentication Integration** | Firebase Admin SDK verifies incoming Firebase ID tokens; client SDK handles frontend auth; test mode supports deterministic verification. | `backend/src/config/firebase.js`<br>`backend/src/middleware/authenticateFirebaseUser.js`<br>`frontend/src/config/firebase.js` | **PENDING MANUAL VERIFICATION** | Implementation verified locally with test suite (mock verification passes); live runtime verification requires student Firebase Console private key. |
| **4** | **JWT Authentication** | Signs and verifies stateless JWT tokens on all protected endpoints via Bearer header. | `backend/src/middleware/authenticate.js` | **PASS** | Verified in `tests/auth.test.js` & `tests/security.test.js` (Valid 200, Missing/tampered 401) |
| **5** | **Role-Based Access Control (RBAC)** | Restricts actions by role (`jobseeker` can apply; `recruiter` can post/edit/delete jobs). | `backend/src/middleware/authorize.js` | **PASS** | Verified in `tests/jobs.test.js` & `tests/security.test.js` (Status 403 verified) |
| **6** | **Job Posting (Create Job)** | Recruiters can create jobs with title, description, skills, salary, location, jobType. | `POST /api/jobs`<br>`backend/src/controllers/jobController.js` | **PASS** | Verified in `tests/jobs.test.js` (Status 201 verified) |
| **7** | **Job Listing with Pagination & Filters** | Public job catalog supporting pagination (`page`, `limit`) and filters (`location`, `skill`, `jobType`). | `GET /api/jobs`<br>`backend/src/services/jobService.js` | **PASS** | Verified in `tests/jobs.test.js` (Pagination metadata verified) |
| **8** | **Job Search (Keyword Search)** | Full-text MongoDB text index search across `title`, `description`, `company`, and `skills`. | `GET /api/jobs/search`<br>`backend/src/services/jobService.js` | **PASS** | Verified in `tests/jobs.test.js` (Keyword search verified) |
| **9** | **Get Single Job Details** | Fetches full job specifications by MongoDB ObjectId with populated recruiter details. | `GET /api/jobs/:id`<br>`backend/src/controllers/jobController.js` | **PASS** | Verified in `tests/jobs.test.js` (Status 200 & 404 verified) |
| **10** | **Update Job & Ownership Verification** | Only the recruiter who originally posted the job can modify its details. | `PUT /api/jobs/:id`<br>`backend/src/services/jobService.js` | **PASS** | Verified in `tests/jobs.test.js` (Owner 200, Non-owner 403) |
| **11** | **Delete Job & Ownership Verification** | Only the recruiter who posted the job can delete it from the portal. | `DELETE /api/jobs/:id`<br>`backend/src/services/jobService.js` | **PASS** | Verified in `tests/jobs.test.js` (Owner 200, Non-owner 403) |
| **12** | **Job Application Submission** | Jobseekers can apply to any active job with an optional cover letter and resume. | `POST /api/applications`<br>`backend/src/controllers/applicationController.js`| **PASS** | Verified in `tests/applications.test.js` (Status 201 verified) |
| **13** | **Duplicate Application Prevention** | Compound unique index `{ job: 1, applicant: 1 }` prevents multiple submissions for the same job. | `backend/src/models/Application.js`<br>`backend/src/services/applicationService.js` | **PASS** | Verified in `tests/applications.test.js` (Status 409 verified) |
| **14** | **Candidate Application History** | Authenticated jobseekers can view their personal submission history and statuses. | `GET /api/applications/user/:id`<br>`backend/src/controllers/applicationController.js`| **PASS** | Verified in `tests/applications.test.js` (Status 200 verified) |
| **15** | **Recruiter Application Management** | Recruiters can view all candidates who applied for their specific job openings. | `GET /api/applications/job/:jobId`<br>`backend/src/controllers/applicationController.js`| **PASS** | Verified in `tests/applications.test.js` (Status 200 verified) |
| **16** | **Application Status Update** | Recruiters can update applicant stage (`applied` → `shortlisted` / `rejected` / `accepted`) with notes. | `PUT /api/applications/:id/status`<br>`backend/src/services/applicationService.js` | **PASS** | Verified in `tests/applications.test.js` (Status 200 verified) |
| **17** | **Resume File Upload (Multer)** | Handles multipart form uploads for PDF and DOCX files up to 5MB with sanitized disk storage. | `POST /api/resume/upload`<br>`backend/src/middleware/upload.js` | **PASS** | Verified in `tests/resume.test.js` (Upload & extension checks verified) |
| **18** | **Resume Text Extraction & Parsing** | Deterministic regex entity extraction parsing email, phone number, candidate name, and technical skills from PDF & DOCX. | `backend/src/services/resumeParserService.js` | **PASS** | Verified in `tests/resume.test.js` (Unit test & API test verified) |
| **19** | **Skill-Based Job Recommendation** | Computes match percentage based on candidate profile skills vs required job skills with clear explanations. | `GET /api/recommendations`<br>`backend/src/services/recommendationService.js` | **PASS** | Verified in `tests/recommendations.test.js` (Strong, partial, and empty match verified) |
| **20** | **Input Request Validation** | `express-validator` middleware rules for all routes returning structured `400 Bad Request` messages. | `backend/src/validators/*.js`<br>`backend/src/middleware/validate.js` | **PASS** | Verified across all 7 test suites (Validation failures verified) |
| **21** | **Centralized Error Handling** | Global 4-argument error handler intercepting AppErrors, Mongoose validation, CastErrors, and 404s. | `backend/src/middleware/errorHandler.js`<br>`backend/src/utils/errors.js` | **PASS** | Verified in `tests/health.test.js`, `tests/security.test.js` |
| **22** | **Security Hardening (Helmet, Rate Limit)**| Helmet security headers, rate limiting (100 req/15 min), and cross-origin controls. | `backend/src/app.js` | **PASS** | Verified in `tests/security.test.js` (Headers verified) |
| **23** | **Health & Uptime Monitoring** | Dedicated `/health` and `/api/health` endpoints returning process uptime, memory, and database connection status. | `GET /health`<br>`backend/src/app.js` | **PASS** | Verified in `tests/health.test.js` (Status 200 & accurate DB status verified) |
| **24** | **Swagger / OpenAPI Documentation** | OpenAPI 3.0 specification covering 16 endpoints, parameters, schemas, and security schemes. | `backend/swagger.yaml`<br>`http://localhost:5001/api-docs` | **PASS** | Verified syntax via YAML parser, mounted via `swagger-ui-express` |
| **25** | **Automated Postman Collection** | Complete Postman collection covering health, authentication, jobs, applications, resume upload/parsing, recommendations and authorization workflows (23 requests). | `CareerLink.postman_collection.json` | **PASS** | Verified JSON schema syntax and request chain |
| **26** | **Automated Jest + Supertest Suite** | 7 test suites testing health, auth, jobs, applications, recommendations, resume, and security. | `backend/tests/*.test.js` | **PASS** | **57/57 tests passed (100% pass rate in 1.73s)** |
| **27** | **Docker & Container Setup** | Production-ready Dockerfile and docker-compose.yml linking Node backend with MongoDB using environment interpolation (`${JWT_SECRET}`). | `Dockerfile`<br>`docker-compose.yml` | **PASS** | Static configuration validated; secrets properly externalized |
| **28** | **Cloud Deployment Configuration** | Production infrastructure manifests for deployment to Render/Railway. | `render.yaml` | **PENDING MANUAL VERIFICATION** | Manifest complete; live deployment requires student hosting account and live MongoDB Atlas URL. |
| **29** | **Professional Frontend / UI** | Polished React 19 + Vite web application for both Jobseeker and Recruiter workflows. | `careerlink/frontend/` | **PASS** | Verified clean build (`npm run build` succeeds with 0 errors in 184ms) |
| **30** | **College Project Report (DOCX)** | Comprehensive, university-ready project report with truthful metrics and syllabus mapping. | `CareerLink_Backend_Project_Report.docx` | **PASS** | DOCX document generated and formatted for submission |
