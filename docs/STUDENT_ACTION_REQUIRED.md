# CareerLink - Student Action Required Guide

**Student:** Om Maurya (Roll No: 150096725208)  
**Program:** B.Tech CSE (Cohort: Jeff Bezos)  
**College:** ITM Skills University  
**Project:** CareerLink – Job Portal  

> **Note:** All backend code, models, controllers, services, middleware, tests, frontend UI, Swagger docs, Postman collections, and Docker manifests have been **completely built and verified**. You do NOT need to write any code. The items below are external services that require your personal account credentials or manual demonstration steps.

---

## 1. Firebase Authentication Setup (Optional for Local Tests, Required for Live Firebase)

The project includes complete integration for both Firebase Client SDK (frontend) and Firebase Admin SDK (backend). For automated unit and integration tests (`npm test`), mock verification is active so tests execute without external network dependencies.

To enable live Firebase Authentication on your deployment:

### A. Backend Firebase Admin SDK
1. Open [Firebase Console](https://console.firebase.google.com/) and create a project (e.g. `careerlink-portal`).
2. Go to **Build > Authentication > Sign-in method** and enable **Email/Password**.
3. Go to **Project Settings > Service Accounts**.
4. Click **Generate New Private Key** to download the JSON service account file.
5. In `careerlink/backend/.env`, configure:
   - **Method 1 (Recommended for Cloud/Docker):**
     ```env
     FIREBASE_PROJECT_ID=your-project-id
     FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
     FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
     ```
   - **Method 2 (Local file):**
     ```env
     FIREBASE_SERVICE_ACCOUNT_PATH=./src/config/firebase-service-account.json
     ```

### B. Frontend Firebase Client SDK
1. In Firebase Console, go to **Project Settings > General > Your apps > Web app (</>)**.
2. Register your web app to view the `firebaseConfig` object.
3. In `careerlink/frontend/.env`, set:
   ```env
   VITE_API_URL=http://localhost:5001/api
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=careerlink-portal.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=careerlink-portal
   VITE_FIREBASE_STORAGE_BUCKET=careerlink-portal.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef...
   ```

---

## 2. MongoDB Atlas (For Cloud Production Deployment)

For local development and testing, your local MongoDB server is already active and verified. For deploying to the cloud:

1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free M0 Shared Cluster.
3. In **Database Access**, create a user (e.g., `om_maurya`) with a strong password.
4. In **Network Access**, click **Add IP Address** and select **Allow Access from Anywhere (`0.0.0.0/0`)**.
5. Click **Connect > Drivers (Node.js)** and copy the connection string.
6. Replace `MONGODB_URI` in `backend/.env` or in your cloud deployment environment variables:
   ```env
   MONGODB_URI=mongodb+srv://om_maurya:<password>@cluster0.xxxxx.mongodb.net/careerlink?retryWrites=true&w=majority
   ```

---

## 3. Postman Collection Verification & Screenshot Capture

The automated Postman collection is generated and located at:
[`careerlink/CareerLink.postman_collection.json`](file:///Users/calmkao/Documents/Backend%20project/careerlink/CareerLink.postman_collection.json)

1. Open Postman desktop app or web agent.
2. Click **Import** in the top left and select `CareerLink.postman_collection.json`.
3. Ensure your local backend server is running (`npm start` in `backend/`).
4. Click on the collection name **CareerLink Job Portal API** and click **Run collection**.
5. Click **Run CareerLink Job Portal API**. All 23 requests across 6 workflow folders will execute, automatically saving tokens and IDs with assertions passing.
6. **Action:** Take a screenshot of the Postman test runner window to replace the placeholder `[INSERT REAL SCREENSHOT — Postman]` in your project report.

---

## 4. Swagger UI Demonstration & Screenshot Capture

1. Start the backend: `npm start` inside `careerlink/backend/`.
2. Open your browser and navigate to: [http://localhost:5001/api-docs](http://localhost:5001/api-docs) (or `http://localhost:5000/api-docs` if running in Docker).
3. The interactive Swagger UI documentation will display all 16 endpoints with schemas and authorize button.
4. **Action:** Capture a screenshot of the Swagger UI to replace `[INSERT REAL SCREENSHOT — Swagger]` in your report.

---

## 5. MongoDB Database Evidence Screenshot

1. Open MongoDB Compass or run `mongosh`.
2. Connect to `mongodb://localhost:27017/careerlink`.
3. Open the `careerlink` database and view collections: `users`, `jobs`, `applications`.
4. **Action:** Capture a screenshot showing the documents to replace `[INSERT REAL SCREENSHOT — MongoDB]`.

---

## 6. GitHub Repository Push

The project is fully prepared with a strict `.gitignore` ignoring secrets and `node_modules`.

1. Initialize git and commit:
   ```bash
   cd "/Users/calmkao/Documents/Backend project/careerlink"
   git init
   git add .
   git commit -m "feat: complete CareerLink job portal backend, tests, frontend, and docs"
   ```
2. Create a new repository on your GitHub account (`https://github.com/new`).
3. Link and push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/careerlink.git
   git branch -M main
   git push -u origin main
   ```

---

## 7. Cloud Deployment (Render / Railway)

1. Create a free account on [Render.com](https://render.com/).
2. Click **New + > Web Service** and connect your GitHub repository.
3. Render will automatically detect `render.yaml` or you can configure:
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
4. Under **Environment Variables**, provide your `MONGODB_URI` (Atlas connection string) and `JWT_SECRET`.
5. Click **Deploy Web Service**. Once live, your API will be available at your custom Render URL (e.g., `https://careerlink-api.onrender.com`).
