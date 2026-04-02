# REE Licensure Prediction System — Comprehensive Guide

This document explains the full system: technologies, architecture, data flow, core functions, API endpoints, and user workflows.

---

## 1) System Purpose

The system predicts EE licensure outcomes for students and provides:

- Pass/Fail prediction and probabilities
- Predicted rating (two regression variants)
- Reliability score of questionnaire responses
- AI-generated recommendations per section
- Professor analytics dashboard (institutional trends, model metrics, monitoring)

---

## 2) Materials and Technologies Used

The system is built using a modern full-stack architecture, integrating machine learning, AI, and a robust database for analytics and persistence.

### **Programming Languages**
- **Python (Backend):** Used for the API, machine learning pipeline, and data processing.
- **JavaScript (Frontend):** Used for the React-based user interface and data visualization.
- **SQL:** Used for database schema definition and complex analytical queries.

### **Backend Frameworks and Libraries**
- **FastAPI:** High-performance web framework for building the REST API.
- **Uvicorn:** ASGI server for running the FastAPI application.
- **Pydantic:** Data validation and settings management using Python type annotations.
- **SQLAlchemy:** SQL Toolkit and Object-Relational Mapper (ORM) for database interactions.
- **Psycopg2-binary:** PostgreSQL database adapter for Python.
- **Python-jose (JWT):** JavaScript Object Signing and Encryption for secure authentication.
- **Passlib (Bcrypt):** Password hashing library for secure user credentials.
- **Python-multipart:** Support for parsing multi-part form data (e.g., file uploads).
- **Python-dotenv:** Loads environment variables from a `.env` file.

### **Machine Learning and Data Science**
- **Scikit-learn:** Core library for machine learning (Random Forest Classifier, Linear Regression).
- **Pandas:** Data manipulation and analysis library for handling Excel/CSV datasets.
- **NumPy:** Numerical computing library for array operations and mathematical functions.
- **Joblib:** Used for serializing and loading the trained machine learning models (`.pkl`).
- **Matplotlib & Seaborn:** Used during the training phase for generating visualizations (e.g., confusion matrices, feature importance plots).
- **Openpyxl:** Engine for reading and writing Excel (`.xlsx`) files.

### **Artificial Intelligence (AI)**
- **Groq SDK:** Integration with the Groq Cloud API for high-speed inference.
- **Llama 3 (via Groq):** Large Language Model used for generating personalized student recommendations and professor trend insights.

### **Frontend Frameworks and Libraries**
- **React 19:** Modern library for building component-based user interfaces.
- **Recharts:** Composable charting library for data visualization in the dashboards.
- **Tailwind CSS (v3.4+):** Utility-first CSS framework for responsive and modern UI design.
- **PostCSS & Autoprefixer:** CSS processing tools for cross-browser compatibility.
- **React Hooks:** `useState`, `useEffect`, and custom hooks (`useApiCall`) for state and side-effect management.

### **Database and Storage**
- **PostgreSQL:** Primary relational database for storing users, prediction attempts, and AI caches.
- **Excel (.xlsx) / CSV:** Used as the source for institutional analytics and model training data.

### **Infrastructure and Deployment**
- **Render:** Hosting platform for the Python backend and PostgreSQL database.
- **Vercel / Netlify:** Hosting platforms for the React frontend application.
- **Git:** Version control for managing the codebase.

---

## 3) High-Level Architecture

- **Frontend (`frontend/`)**
  - Role-based app shell: landing, login, student page, professor page
  - Calls backend via REST (`API_BASE_URL`)
  - Stores JWT token and role in `localStorage`

- **Backend (`backend/`)**
  - Loads trained model bundle (`ree_survey_model.pkl`).
  - Exposes prediction, recommendation, analytics, and admin endpoints.
  - Persists prediction attempts and AI recommendations to a PostgreSQL database.
  - Uses `FACULTY_CODE` to gate professor registration.
  - **Single Source of Truth for Institutional Analytics:** `DATA_UPCOMING.xlsx` (333 rows, 2022–2025).
  - **Training Data:** `DATA_MODEL.xlsx` (with survey answers) and `DATA_ALL.xlsx`.
  - **Evaluation Data:** `DATA_EVALUATION.xlsx` for held-out testing.

- **Database (`backend/database.py`)**
  - Managed by SQLAlchemy.
  - Tables:
    - `users`: User authentication and role management.
    - `prediction_attempts`: History of all student predictions and inputs.
    - `recommendations_cache`: AI recommendations linked to specific attempts.

---

## 4) Repository Structure (Core)

- `backend/main.py` — Main FastAPI application and business logic.
- `backend/train_model.py` — Pipeline for training the classification and regression models.
- `backend/database.py` — SQLAlchemy models and database connection helpers.
- `backend/cache.py` — Caching logic for optimizing data retrieval.
- `frontend/src/App.jsx` — Main React component and role-based routing.
- `frontend/src/api-service.js` — Shared service for API calls and authentication management.
- `frontend/src/components/PredictorForm.jsx` — Student input wizard with multi-step survey.
- `frontend/src/components/ResultCard.jsx` — UI for displaying predictions and AI recommendations.
- `frontend/src/components/StudentPage.jsx` — Student-facing dashboard and history.
- `frontend/src/components/ProfessorPage.jsx` — Main professor analytics portal.
- `frontend/src/components/professor/*` — Modular dashboards for model metrics, trends, and monitoring.

---

## 5) Runtime Configuration

## Frontend API target

- `frontend/src/apiBase.js` currently points to:
  - `https://ee-predictor-backend.onrender.com`

## Backend environment

- `DATABASE_URL` — enables DB persistence
- `GROQ_API_KEY` — enables AI recommendations and trend insights
- `EE_PREDICTOR_SECRET_KEY` — JWT signing key (falls back to default if not set)
- `FACULTY_CODE` — invite code required to register a professor account (default: `IIEE-SLSU-2025`)

---

## 6) Authentication and Authorization Flow

1. User registers/logs in (`/auth/register`, `/auth/login`)
2. Backend returns JWT (`access_token`) and role
3. Frontend stores token in `localStorage`
4. Protected endpoints require `Authorization: Bearer <token>`
5. Backend resolves current user via JWT (`get_current_user`)
6. Professor registration requires a valid faculty invite code (`FACULTY_CODE`)

---

## 7) Data Model (Database)

## `users`

- `id` (UUID)
- `student_id` (optional for students)
- `name`, `email`, `password_hash`, `role`
- `created_at`

## `prediction_attempts`

- `id` (attempt UUID)
- `user_id`
- Personal fields: `name`, `age`, `sex`, `year_taking_exam`
- Outputs: `prediction`, `label`, `probability_pass/fail`, `predicted_rating_a/b`, `passing_score`
- `input_json` (full request payload snapshot)
- `created_at`

## `recommendations_cache`

- `user_id`, `attempt_id`, `section_label`
- `recommendation_text`
- unique constraint per user+attempt+section

---

## 8) End-to-End System Flow

## Student prediction flow

1. Student logs in
2. Fills predictor form (scores + survey + profile)
3. Frontend sends `POST /predict`
4. Backend:
  - builds feature vectors
  - runs classifier + regressor A + regressor B
  - computes reliability score
  - stores attempt in DB
5. Frontend shows `ResultCard`
6. Per section, frontend requests `POST /ai-recommend` (with `attempt_id`)
7. Backend returns cached or new AI recommendation
8. Student history fetched via `GET /student/attempts`

## Professor analytics flow

1. Professor logs in
2. Dashboard loads:
  - static/institutional analytics (`/analytics`)
  - model metrics (`/model-info`)
  - correlation matrix (`/correlation`)
3. Trends/admin tabs load DB-based monitoring:
  - attempts, monthly summary, yearly pass/fail, usage, review analysis, timing analysis, trend insights
4. Optional export via `/admin/performance-report`

---

## 9) API Endpoint Guide

### **Authentication**
- `POST /auth/register` — Create account (student/professor) and return JWT.
- `POST /auth/login` — Authenticate credentials and return JWT with role.

### **Student Prediction and Recommendations**
- `POST /predict` — Main prediction endpoint. Processes inputs and returns probabilities, ratings, and `attempt_id`.
- `GET /student/attempts` — Returns paginated prediction history for the authenticated student.
- `POST /ai-recommend` — Generates and caches AI recommendations per section based on performance.

### **Institutional Analytics (Professor Dashboard)**
- `GET /analytics` — Core analytical payload derived from `DATA_UPCOMING.xlsx`.
- `GET /model-info` — Metrics for the trained models (accuracy, R2, etc.).
- `GET /correlation` — Returns the correlation matrix for key numeric features.

### **Monitoring and Trends (DB-driven)**
- `GET /admin/attempts` — Fetches a log of all prediction attempts.
- `GET /admin/monthly-summary` — Summarizes pass/fail counts by month.
- `GET /admin/pass-fail-by-year` — Summarizes pass/fail counts by year.
- `GET /admin/trend-stats` — Returns year-over-year performance trends.
- `GET /admin/trend-insights` — AI-generated summary of trends and patterns.
- `GET /admin/review-analysis` — Aggregated analysis of student review habits.
- `GET /admin/timing-analysis` — Analysis of prediction activity over time.
- `GET /admin/performance-report` — Generates a downloadable performance report.

### **System Health**
- `GET /health` — Simple health check to verify backend and database connectivity.

---

## 10) Machine Learning Flow

Implemented in `backend/train_model.py` using a multi-model approach:

### **Classification Model**
- **Algorithm:** `RandomForestClassifier`
- **Purpose:** Predicts binary Pass/Fail outcomes.
- **Training Data:** `DATA_MODEL.xlsx` (with full survey responses).
- **Features:** All available features (Subject scores, GWA, and Survey).

### **Regression Model A (Full Profile)**
- **Algorithm:** `RandomForestRegressor`
- **Purpose:** Predicts the expected PRC board rating using all basic metrics.
- **Training Data:** Combined `DATA_MODEL.xlsx` and `DATA_SYSTEM.xlsx` (2022–2024 slice).
- **Features:** `EE`, `MATH`, `ESAS`, and `GWA`.

### **Regression Model B (GWA & Survey Only)**
- **Algorithm:** `RandomForestRegressor`
- **Purpose:** Predicts rating based on academic standing and behavioral profile (no board subject scores).
- **Training Data:** `DATA_MODEL.xlsx`.
- **Features:** `GWA` and all survey/behavioral profile questions.

### **Model Persistence**
The models are bundled into `ree_survey_model.pkl` along with:
- Feature lists (`FEATURES_ALL`, `FEATURES_BASIC`, `FEATURES_NOSUB`).
- Label encoders for categorical survey answers.
- Evaluation metrics (Accuracy, R2 Score, MAE).

---

## 11) Data Files and Their Roles

| File Name | Rows | Features | Role in System |
|-----------|------|----------|----------------|
| `DATA_ALL.xlsx` | ~350 | Full Profile | The master dataset containing all historical records from 2022 to 2025. |
| `DATA_MODEL.xlsx` | 123 | Survey + Scores | Primary training set for models requiring survey responses (2022-2024). |
| `DATA_UPCOMING.xlsx` | 333 | Scores + GWA | Single source of truth for all **institutional analytics** and dashboards. |
| `DATA_EVALUATION.xlsx` | 36 | Survey + Scores | Held-out dataset (2025) used to verify model performance and accuracy. |
| `DATA_SYSTEM.xlsx` | 333 | Scores Only | Used specifically for Regression Model A training to increase sample size. |

---

## 12) Frontend Module Function Guide

### **Application Routing (`App.jsx`)**
- Manages role-based access control (RBAC).
- Routes: `landing`, `login`, `student`, and `professor`.
- Persists authentication state via JWT tokens in `localStorage`.

### **Authentication (`LoginPage.jsx`)**
- Handles user registration and login for both Students and Professors.
- Faculty registration requires a unique `FACULTY_CODE`.
- Securely stores user identity and session tokens.

### **Student Dashboard (`StudentPage.jsx`)**
- Displays personalized prediction history fetched from the database.
- Provides entry point to the predictor wizard.
- Includes fallback local storage mechanism for offline resilience.

### **Predictor Wizard (`PredictorForm.jsx`)**
- Multi-step form for collecting academic scores, GWA, and behavioral survey responses.
- Includes real-time validation for input ranges.
- Captures `question_timings` to analyze student engagement and response reliability.

### **Result Visualization (`ResultCard.jsx`)**
- Displays Pass/Fail probabilities and predicted PRC ratings.
- Renders performance breakdowns for EE, Mathematics, and ESAS.
- Triggers AI-driven recommendations based on the student's weakest areas.

### **Professor Portal (`ProfessorPage.jsx`)**
- Institutional-level analytics dashboard for faculty and administrators.
- Features multiple specialized views:
  - **Overview:** High-level KPIs and institutional performance.
  - **Performance:** Detailed trends in passing rates and subject scores.
  - **Intelligence:** AI-driven trend analysis and curriculum gap identification.
  - **Model Metrics:** Technical performance data for the prediction engine.
  - **Monitoring:** Real-time log of prediction attempts and usage statistics.

---

## 13) User Guide

### **Student User Workflow**
1. **Access:** Open the application and select the **Student** portal.
2. **Auth:** Register a new account or log in with existing credentials.
3. **Predictor:** Navigate to the Predictor section and complete the three-part form:
   - **Board Subject Scores:** Mathematics, EE, and ESAS.
   - **Academic Background:** GWA and personal profile.
   - **Behavioral Survey:** Multi-section questionnaire regarding study habits and preparation.
4. **Analysis:** Submit the form to generate the prediction.
5. **Review:** Analyze the results, including pass/fail probability, predicted ratings, and AI-generated study recommendations.

### **Professor User Workflow**
1. **Access:** Open the application and select the **Faculty/Professor** portal.
2. **Auth:** Register using the institutional `FACULTY_CODE` or log in.
3. **Dashboard:** Access the multi-tabbed analytics suite to view:
   - **Institutional Trends:** Historical passing rates and subject performance.
   - **Curriculum Gaps:** Identification of weakest areas across the student body.
   - **Model Performance:** Real-time metrics on the prediction engine's accuracy.
   - **Student Monitoring:** Log of all recent prediction attempts and reliability scores.
4. **Reporting:** Apply filters (Year, Month, Review Center) and export performance reports as needed.

---

## 14) Data Flow and Operational Logic

- **Input Sources:**
  - Student real-time inputs (Form entries).
  - Historical institutional data (`DATA_UPCOMING.xlsx`).
  - Persistent prediction history (PostgreSQL database).
- **Core Processing:**
  - **ML Inference:** Feature vector assembly followed by Classifier and Regressor execution.
  - **Reliability Logic:** Analysis of response consistency and timing.
  - **AI Synthesis:** Groq-powered Llama 3 generates context-aware text for recommendations.
- **Storage Strategy:**
  - Prediction attempts and user data are persisted in PostgreSQL.
  - AI recommendations are cached to reduce API costs and latency.
- **Environment Dependencies:**
  - `DATABASE_URL`: Enables history tracking and professor monitoring.
  - `GROQ_API_KEY`: Enables AI-driven recommendations and trend insights.
  - `EE_PREDICTOR_SECRET_KEY`: Secures JWT authentication.

---

## 15) Quick Start Guide

### **Backend Setup**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### **Frontend Setup**
```bash
cd frontend
npm install
npm start
```

### **Model Training**
```bash
cd backend
python train_model.py
```

---
