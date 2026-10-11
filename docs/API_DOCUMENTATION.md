# CareerLink - REST API Specification & Documentation

**Project:** CareerLink – Job Portal Backend API  
**Student:** Om Maurya (Roll No: 150096725208)  
**Program:** B.Tech CSE (Cohort: Jeff Bezos)  
**College:** ITM Skills University  
**Base URL:** `http://localhost:5000`  
**API Prefix:** `/api`  
**Interactive Docs:** `http://localhost:5000/api-docs` (Swagger UI)  

---

## Overview Table of Endpoints

| Category | Method | Endpoint | Access / Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| **System** | `GET` | `/health` or `/api/health` | Public | System status, uptime, and memory |
| **Auth** | `POST` | `/api/auth/register` | Public | Register new recruiter or jobseeker |
| **Auth** | `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| **Auth** | `GET` | `/api/auth/profile` | Bearer Token (Any) | Fetch logged-in user profile |
| **Auth** | `PUT` | `/api/auth/profile` | Bearer Token (Any) | Update user profile details & skills |
| **Jobs** | `GET` | `/api/jobs` | Public | List all jobs with pagination & filters |
| **Jobs** | `GET` | `/api/jobs/search` | Public | Search jobs by keyword in title/desc/skills |
| **Jobs** | `GET` | `/api/jobs/:id` | Public | Retrieve single job by ObjectId |
| **Jobs** | `GET` | `/api/jobs/recruiter/my-jobs`| Bearer (`recruiter`) | Get jobs posted by current recruiter |
| **Jobs** | `POST` | `/api/jobs` | Bearer (`recruiter`) | Create a new job posting |
| **Jobs** | `PUT` | `/api/jobs/:id` | Bearer (`recruiter` owner) | Update existing job |
| **Jobs** | `DELETE`| `/api/jobs/:id` | Bearer (`recruiter` owner) | Delete job posting |
| **Applications** | `POST` | `/api/applications` | Bearer (`jobseeker`) | Apply to job (with optional resume) |
| **Applications** | `GET` | `/api/applications/user/:id` | Bearer Token | View applications of candidate |
| **Applications** | `GET` | `/api/applications/job/:jobId` | Bearer (`recruiter`) | View all applicants for a job |
| **Applications** | `PUT` | `/api/applications/:id/status`| Bearer (`recruiter` owner)| Update application status & feedback |
| **Resume** | `POST` | `/api/resume/upload` | Bearer Token | Upload PDF/DOCX resume & parse |
| **Resume** | `GET` | `/api/resume/parsed` | Bearer Token | Get parsed resume details |
| **Recommendations**| `GET`| `/api/recommendations` | Bearer (`jobseeker`) | Skill-based matching recommendations |

---

## 1. System Health

### `GET /health` or `GET /api/health`
- **Purpose:** Server heartbeat, uptime monitor, and process resource utilization.
- **Authentication:** None (Public)
- **Headers:** `Content-Type: application/json`
- **Successful Response (200 OK):**
```json
{
  "success": true,
  "message": "CareerLink API is running",
  "data": {
    "status": "OK",
    "timestamp": "2026-10-04T10:45:26.000Z",
    "uptime": "142 seconds",
    "environment": "development",
    "memoryUsage": {
      "heapUsed": "48MB",
      "heapTotal": "62MB"
    },
    "nodeVersion": "v20.x.x"
  }
}
```

---

## 2. Authentication Endpoints

### `POST /api/auth/register`
- **Purpose:** Registers a new user account with role selection.
- **Authentication:** None (Public)
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "name": "Om Maurya",
  "email": "om.maurya@example.com",
  "password": "SecurePassword123",
  "role": "jobseeker",
  "phone": "+919876543210",
  "skills": ["javascript", "node.js", "mongodb", "react"],
  "company": ""
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "6507f1f77bcf86cd79943901",
      "name": "Om Maurya",
      "email": "om.maurya@example.com",
      "role": "jobseeker",
      "skills": ["javascript", "node.js", "mongodb", "react"],
      "createdAt": "2026-10-04T10:45:26.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
- **Error Responses:**
  - `400 Bad Request`: Validation failure (missing name, invalid email, short password)
  - `409 Conflict`: User with email already exists

---

### `POST /api/auth/login`
- **Purpose:** Authenticate user and issue JWT bearer token.
- **Authentication:** None (Public)
- **Request Body:**
```json
{
  "email": "om.maurya@example.com",
  "password": "SecurePassword123"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "6507f1f77bcf86cd79943901",
      "name": "Om Maurya",
      "email": "om.maurya@example.com",
      "role": "jobseeker",
      "skills": ["javascript", "node.js", "mongodb", "react"]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
- **Error Responses:**
  - `401 Unauthorized`: Invalid email or password

---

### `GET /api/auth/profile`
- **Purpose:** Retrieve the currently logged-in user profile.
- **Authentication:** Bearer Token required
- **Headers:** `Authorization: Bearer <jwt_token>`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "user": {
      "_id": "6507f1f77bcf86cd79943901",
      "name": "Om Maurya",
      "email": "om.maurya@example.com",
      "role": "jobseeker",
      "skills": ["javascript", "node.js", "mongodb"],
      "bio": "B.Tech CSE student passionate about backend systems",
      "location": "Mumbai, India",
      "resume": null
    }
  }
}
```
- **Error Responses:**
  - `401 Unauthorized`: Missing or invalid token

---

## 3. Job Endpoints

### `POST /api/jobs`
- **Purpose:** Create a new job opening (recruiter role required).
- **Authentication:** Bearer Token (`recruiter`)
- **Headers:** `Authorization: Bearer <recruiter_token>`, `Content-Type: application/json`
- **Request Body:**
```json
{
  "title": "Backend Developer Node.js",
  "company": "Amazon AWS",
  "description": "We are seeking a developer with hands-on experience in Express, MongoDB, and REST APIs.",
  "location": "Bengaluru, India",
  "salary": "14-20 LPA",
  "skills": ["node.js", "express", "mongodb", "docker"],
  "jobType": "full-time",
  "experienceLevel": "mid"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Job created successfully",
  "data": {
    "job": {
      "_id": "6507f1f77bcf86cd79943909",
      "title": "Backend Developer Node.js",
      "company": "Amazon AWS",
      "description": "...",
      "location": "Bengaluru, India",
      "salary": "14-20 LPA",
      "skills": ["node.js", "express", "mongodb", "docker"],
      "recruiter": "6507f1f77bcf86cd79943901",
      "status": "active",
      "createdAt": "2026-10-04T10:45:26.000Z"
    }
  }
}
```
- **Error Responses:**
  - `403 Forbidden`: User is a jobseeker or unauthorized role
  - `400 Bad Request`: Validation failure on missing fields

---

### `GET /api/jobs`
- **Purpose:** List jobs with pagination, filtering, and sorting.
- **Authentication:** Public
- **Query Parameters:**
  - `page` (integer, default: 1)
  - `limit` (integer, default: 10)
  - `location` (string regex)
  - `skill` (string regex)
  - `jobType` (`full-time`, `part-time`, etc.)
  - `sortBy` (`createdAt`, `salary`, default: `createdAt`)
  - `order` (`asc`, `desc`, default: `desc`)
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Jobs fetched successfully",
  "data": [
    {
      "_id": "6507f1f77bcf86cd79943909",
      "title": "Backend Developer Node.js",
      "company": "Amazon AWS",
      "location": "Bengaluru, India",
      "salary": "14-20 LPA",
      "skills": ["node.js", "express", "mongodb"],
      "recruiter": {
        "_id": "6507f1f77bcf86cd79943901",
        "name": "Priya Sharma",
        "email": "priya@amazon.com"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### `GET /api/jobs/search`
- **Purpose:** Full-text search on title, description, company, and skills.
- **Authentication:** Public
- **Query Parameters:** `keyword` (string, required)
- **Example:** `GET /api/jobs/search?keyword=mongodb`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Search results for \"mongodb\"",
  "data": [ ... ],
  "pagination": { ... }
}
```

---

### `PUT /api/jobs/:id`
- **Purpose:** Update job details (owner recruiter only).
- **Authentication:** Bearer Token (`recruiter`)
- **Error Responses:**
  - `403 Forbidden`: If recruiter is not the owner who created this job

---

### `DELETE /api/jobs/:id`
- **Purpose:** Delete a job posting (owner recruiter only).
- **Authentication:** Bearer Token (`recruiter`)
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Job deleted successfully"
}
```

---

## 4. Application Endpoints

### `POST /api/applications`
- **Purpose:** Apply to an active job posting.
- **Authentication:** Bearer Token (`jobseeker`)
- **Body:** `multipart/form-data` or `application/json`
  - `jobId`: `ObjectId` (Required)
  - `coverLetter`: `String` (Optional)
  - `resume`: File attachment (PDF/DOC/DOCX, Optional)
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "application": {
      "_id": "6507f1f77bcf86cd79943920",
      "job": "6507f1f77bcf86cd79943909",
      "applicant": "6507f1f77bcf86cd79943901",
      "status": "applied",
      "coverLetter": "Excited to apply.",
      "createdAt": "2026-10-04T10:45:26.000Z"
    }
  }
}
```
- **Error Responses:**
  - `409 Conflict`: "You have already applied for this job" (Duplicate prevention)
  - `403 Forbidden`: Recruiters cannot apply for jobs

---

### `PUT /api/applications/:id/status`
- **Purpose:** Update candidate application status (job owner recruiter only).
- **Authentication:** Bearer Token (`recruiter`)
- **Body:**
```json
{
  "status": "shortlisted",
  "feedback": "Outstanding candidate profile. Inviting to Round 1."
}
```
- **Allowed Statuses:** `applied`, `shortlisted`, `rejected`, `accepted`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Application status updated successfully",
  "data": {
    "application": {
      "_id": "6507f1f77bcf86cd79943920",
      "status": "shortlisted",
      "recruiterFeedback": "Outstanding candidate profile. Inviting to Round 1."
    }
  }
}
```

---

## 5. Resume & Recommendation Endpoints

### `POST /api/resume/upload`
- **Purpose:** Upload resume (PDF/DOC/DOCX) and parse text with regex entity extraction.
- **Authentication:** Bearer Token
- **Body:** `multipart/form-data` with field `resume`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Resume uploaded and parsed successfully",
  "data": {
    "resume": {
      "fileName": "Om_Maurya_Resume.pdf",
      "filePath": "/uploads/1728038726-Om_Maurya_Resume.pdf",
      "fileSize": 128450
    },
    "parsedData": {
      "extractedSkills": ["javascript", "node.js", "mongodb", "docker", "express"],
      "extractedEmail": "om.maurya@example.com",
      "extractedPhone": "+91 98765 43210",
      "extractedName": "Om Maurya",
      "parsedAt": "2026-10-04T10:45:26.000Z"
    }
  }
}
```

---

### `GET /api/recommendations`
- **Purpose:** Computes skill-match score and ranks relevant jobs for the jobseeker.
- **Algorithm:**
  $$\text{Match Percentage} = \left(\frac{\text{Count}(\text{Candidate Skills} \cap \text{Job Skills})}{\text{Count}(\text{Job Skills})}\right) \times 100$$
- **Authentication:** Bearer Token (`jobseeker`)
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Job recommendations generated successfully",
  "data": {
    "recommendations": [
      {
        "job": {
          "_id": "6507f1f77bcf86cd79943909",
          "title": "Backend Developer Node.js",
          "skills": ["node.js", "mongodb", "express"]
        },
        "matchedSkills": ["node.js", "mongodb", "express"],
        "missingSkills": [],
        "matchPercentage": 100,
        "explanation": "3 out of 3 required skills matched (100%). Matched: [node.js, mongodb, express]"
      }
    ],
    "userSkills": ["node.js", "mongodb", "express", "react"],
    "algorithm": "skill-match-score"
  }
}
```
