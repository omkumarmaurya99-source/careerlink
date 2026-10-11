# CareerLink - Database Design & Schema Documentation

**Project:** CareerLink – Job Portal  
**Student:** Om Maurya (Roll No: 150096725208)  
**Program:** B.Tech CSE (Cohort: Jeff Bezos)  
**Institution:** ITM Skills University  
**Database:** MongoDB with Mongoose ODM  

---

## 1. Architecture Overview

CareerLink uses **MongoDB**, a document-oriented NoSQL database, managed using the **Mongoose** Object Data Modeling (ODM) library in Node.js. 

### Why MongoDB + Mongoose?
1. **Flexible Schema with Strict Validation:** Mongoose schemas provide application-level type checking, required fields, and custom validators while preserving MongoDB's horizontal scalability.
2. **Denormalization vs Reference:** Hybrid modeling pattern:
   - References (`ObjectId` with `ref`) for relational joins (`Job.recruiter`, `Application.applicant`, `Application.job`).
   - Embedded sub-documents for fast read access without multi-collection lookups (`parsedResume` within `User`).
3. **Compound & Text Indexes:** High performance search using MongoDB `$text` and compound indexing for multi-attribute filtering.

---

## 2. Entity Relationship Diagram (ERD)

```
┌────────────────────────────────┐         1:N         ┌────────────────────────────────┐
│             User               │ ──────────────────< │              Job               │
│────────────────────────────────│                     │────────────────────────────────│
│ _id: ObjectId (PK)             │                     │ _id: ObjectId (PK)             │
│ name: String                   │                     │ title: String                  │
│ email: String (Unique)         │                     │ company: String                │
│ role: 'recruiter'|'jobseeker'  │                     │ description: String            │
│ firebaseUid: String            │                     │ location: String               │
│ skills: [String]               │                     │ salary: String                 │
│ resume: String                 │                     │ skills: [String]               │
│ parsedResume: SubDocument      │                     │ recruiter: ObjectId (FK->User) │
│ timestamps: createdAt/updatedAt│                     │ status: 'active'|'closed'      │
└────────────────────────────────┘                     │ timestamps: createdAt/updatedAt│
                │                                      └────────────────────────────────┘
                │                                                      │
                │ 1:N                                                  │ 1:N
                ▼                                                      ▼
    ┌──────────────────────────────────────────────────────────────────────┐
    │                             Application                              │
    │──────────────────────────────────────────────────────────────────────│
    │ _id: ObjectId (PK)                                                   │
    │ job: ObjectId (FK -> Job._id)                                        │
    │ applicant: ObjectId (FK -> User._id)                                 │
    │ status: 'applied' | 'shortlisted' | 'rejected' | 'accepted'          │
    │ resumeUrl: String                                                    │
    │ coverLetter: String                                                  │
    │ recruiterFeedback: String                                            │
    │ timestamps: createdAt/updatedAt                                      │
    │ UNIQUE COMPOUND INDEX: { job: 1, applicant: 1 }                      │
    └──────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Collections & Schema Specifications

### 3.1 `users` Collection (User Model)

Source: [`backend/src/models/User.js`](file:///Users/calmkao/Documents/Backend%20project/careerlink/backend/src/models/User.js)

| Field Name | Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Primary Key, Auto-generated | Unique identifier for user |
| `name` | `String` | Required, min: 2, max: 100, trim | Full legal name |
| `email` | `String` | Required, Unique, lowercase, trim, regex validated | Email address (login identifier) |
| `role` | `String` | Required, Enum: `['recruiter', 'jobseeker']` | Role-based authorization type |
| `firebaseUid` | `String` | Unique, Sparse | External Firebase Authentication ID |
| `skills` | `[String]` | Default: `[]`, normalized to lowercase | Array of candidate skills |
| `resume` | `String` | Default: `null` | Path or URL to uploaded PDF/DOCX file |
| `profilePhoto` | `String` | Default: `null` | URL/path to profile avatar |
| `phone` | `String` | Default: `null`, trim | Mobile phone contact |
| `bio` | `String` | Default: `""`, max: 500 | Professional summary/bio |
| `location` | `String` | Default: `""`, trim | City, Country |
| `company` | `String` | Default: `""`, trim | Recruiter's organization |
| `parsedResume` | `Object` | Subdocument | Extracted resume data (see below) |
| `createdAt` | `Date` | Managed by Mongoose `timestamps: true` | Account registration timestamp |
| `updatedAt` | `Date` | Managed by Mongoose `timestamps: true` | Last profile update timestamp |

#### Embedded `parsedResume` Sub-schema:
- `rawText`: `String` (First 5000 characters of extracted text)
- `extractedSkills`: `[String]` (Identified technical competencies)
- `extractedEmail`: `String` (Regex-extracted contact email)
- `extractedPhone`: `String` (Regex-extracted contact phone)
- `extractedName`: `String` (Extracted candidate name)
- `parsedAt`: `Date` (Timestamp of extraction)

#### User Indexes:
1. `{ email: 1 }` — Unique index for O(1) email lookups during authentication.
2. `{ firebaseUid: 1 }` — Sparse unique index for Firebase UID mapping.
3. `{ role: 1 }` — B-tree index for filtering candidates vs recruiters.
4. `{ skills: 1 }` — Multikey index for candidate matching queries.

---

### 3.2 `jobs` Collection (Job Model)

Source: [`backend/src/models/Job.js`](file:///Users/calmkao/Documents/Backend%20project/careerlink/backend/src/models/Job.js)

| Field Name | Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Primary Key, Auto-generated | Unique job posting ID |
| `title` | `String` | Required, min: 3, max: 200, trim | Job title (e.g. Senior Backend Dev) |
| `company` | `String` | Required, min: 2, max: 150, trim | Hiring company name |
| `description` | `String` | Required, min: 20, max: 5000, trim | Detailed job description & responsibilities |
| `location` | `String` | Required, trim | Work location or "Remote" |
| `salary` | `String` | Default: `'Not disclosed'`, trim | Compensation package / salary range |
| `skills` | `[String]` | Required (min 1 skill), lowercase | Required candidate skill set |
| `recruiter` | `ObjectId` | Required, `ref: 'User'` | Reference to the posting recruiter |
| `status` | `String` | Enum: `['active', 'closed']`, Default: `'active'` | Job lifecycle status |
| `jobType` | `String` | Enum: `['full-time', 'part-time', 'internship', 'contract', 'remote']`, Default: `'full-time'` | Employment arrangement |
| `experienceLevel`| `String` | Enum: `['fresher', 'junior', 'mid', 'senior', 'lead']`, Default: `'mid'` | Seniority requirement |
| `deadline` | `Date` | Default: `null` | Application expiry deadline |
| `applicationCount`| `Number` | Default: 0 | Denormalized count of applications |
| `createdAt` | `Date` | Managed by Mongoose `timestamps: true` | Job post creation timestamp |
| `updatedAt` | `Date` | Managed by Mongoose `timestamps: true` | Job post last modified |

#### Job Indexes:
1. Compound Text Index: `{ title: 'text', description: 'text', company: 'text', skills: 'text' }` — Supports high-performance text queries via `$text: { $search: keyword }`.
2. `{ status: 1 }` — Quickly filters active jobs.
3. `{ recruiter: 1 }` — Fast retrieval of jobs for a recruiter's management dashboard.
4. `{ skills: 1 }` — Multikey index for skill-matching recommendation queries.
5. `{ createdAt: -1 }` — Reverse chronological index for latest listings.
6. `{ location: 1 }` — Geographic filtering index.

---

### 3.3 `applications` Collection (Application Model)

Source: [`backend/src/models/Application.js`](file:///Users/calmkao/Documents/Backend%20project/careerlink/backend/src/models/Application.js)

| Field Name | Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Primary Key, Auto-generated | Unique application identifier |
| `job` | `ObjectId` | Required, `ref: 'Job'` | Target job posting reference |
| `applicant` | `ObjectId` | Required, `ref: 'User'` | Applicant candidate reference |
| `status` | `String` | Enum: `['applied', 'shortlisted', 'rejected', 'accepted']`, Default: `'applied'` | Application review pipeline state |
| `resumeUrl` | `String` | Default: `null` | Resume attached specifically to this application |
| `coverLetter` | `String` | Default: `""`, max: 2000 | Candidate pitch / cover note |
| `recruiterFeedback`| `String` | Default: `""`, max: 1000 | Notes provided by recruiter on status change |
| `createdAt` | `Date` | Managed by Mongoose `timestamps: true` | Application timestamp |
| `updatedAt` | `Date` | Managed by Mongoose `timestamps: true` | Status update timestamp |

#### Application Indexes:
1. **Compound Unique Index:** `{ job: 1, applicant: 1 }` with `{ unique: true }` — **Database-level guarantee preventing duplicate applications** by the same job seeker for the same job posting.
2. `{ applicant: 1 }` — Fast lookup for jobseeker's "My Applications" dashboard.
3. `{ job: 1 }` — Fast retrieval for recruiter's candidate list for a specific job.
4. `{ status: 1 }` — Filtering by pipeline state.
