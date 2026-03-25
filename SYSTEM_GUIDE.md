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

  ## 2) Languages, Frameworks, and Libraries

  ## Backend

  - **Language:** Python
  - **Framework:** FastAPI
  - **Server:** Uvicorn
  - **Validation:** Pydantic
  - **ML/Data:** scikit-learn, pandas, numpy, joblib
  - **Visualization tooling in training:** matplotlib, seaborn
  - **Excel support:** openpyxl
  - **Auth/Security:** python-jose (JWT), passlib (password hashing)
  - **DB ORM:** SQLAlchemy
  - **DB driver:** psycopg2-binary
  - **Env config:** python-dotenv
  - **AI service:** Groq SDK
- **Multipart:** python-multipart

  ## Frontend

  - **Language:** JavaScript
  - **Framework:** React (Create React App)
  - **Charts:** Recharts
  - **Styling:** Tailwind CSS + custom inline styles
  - **Build tooling:** react-scripts, postcss, autoprefixer

  ---

  ## 3) High-Level Architecture

  - **Frontend (`frontend/`)**
    - Role-based app shell: landing, login, student page, professor page
    - Calls backend via REST (`API_BASE_URL`)
    - Stores JWT token and role in `localStorage`

  - **Backend (`backend/`)**
    - Loads trained model bundle (`ree_survey_model.pkl`)
    - Exposes prediction, recommendation, analytics, admin, and defense endpoints
    - Persists prediction attempts to DB (if `DATABASE_URL` is configured)
  - Uses `FACULTY_CODE` to gate professor registration
  - Institutional analytics source of truth: `DATA_UPCOMING.xlsx` (333 rows, 2022–2025)

  - **Database (`backend/database.py`)**
    - Tables:
      - `users`
      - `prediction_attempts`
      - `recommendations_cache`

  ---

  ## 4) Repository Structure (Core)

  - `backend/main.py` — main API and business logic
  - `backend/train_model.py` — model training pipeline
  - `backend/database.py` — DB models and persistence helpers
  - `frontend/src/App.jsx` — role/page routing
  - `frontend/src/components/PredictorForm.jsx` — student input wizard
  - `frontend/src/components/ResultCard.jsx` — result + AI recommendation UI
  - `frontend/src/components/StudentPage.jsx` — student dashboard/history
  - `frontend/src/components/ProfessorPage.jsx` — professor dashboard
  - `frontend/src/components/professor/*` — modular professor UI components

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

  ## Auth

  - `POST /auth/register`
    - create account + return JWT
  - `POST /auth/login`
    - authenticate + return JWT

  ## Student

  - `POST /predict`
    - main prediction endpoint
    - returns prediction, probabilities, ratings, reliability, `attempt_id`
  - `GET /student/attempts`
    - paginated student-specific history (from DB)
  - `POST /ai-recommend`
    - AI recommendation per section (privacy-aware cache)

  ## Model and institutional analytics

  - `GET /model-info`
    - dataset/model metrics (classification + regression)
  - `GET /analytics`
    - institution-level analytics payload for professor dashboard
  - `GET /correlation`
    - correlation matrix for key numeric variables

  ## Admin/monitoring (DB-based)

  - `GET /admin/attempts`
  - `GET /admin/monthly-summary`
  - `GET /admin/pass-fail-by-year`
  - `GET /admin/review-analysis`
  - `GET /admin/timing-analysis`
  - `GET /admin/attempt-timings`
  - `GET /admin/trend-stats`
  - `GET /admin/trend-insights`
  - `GET /admin/usage-summary`
  - `GET /admin/performance-report`

  ## Defense/testing

  - `GET /defense/test-2025`
  - `GET /defense/test-2025-records`
  - `GET /defense/test-2025-predict`

  ## Health

  - `GET /health`

  ---

  ## 10) Machine Learning Flow

Implemented in `backend/train_model.py` (updated data architecture and training strategy):

  - **Classification**
    - RandomForestClassifier
  - train: `DATA_MODEL.xlsx` (60 rows, with survey)
  - test: `DATA_TEST.xlsx` (21 rows, 2025 held-out, with survey)
  - predicts pass/fail (uses `ALL_FEATURES`)
  - **Regression A**
    - RandomForestRegressor
  - train: `DATA_MODEL.xlsx` (60 with survey) + `DATA_SYSTEM.xlsx` slice 2022–2024 (~250 rows, no survey) = ~310 rows
  - test: `DATA_TEST.xlsx` (21)
  - uses BASIC feature set: `EE`, `MATH`, `ESAS`, `GWA`
  - **Regression B**
    - RandomForestRegressor
  - train: `DATA_MODEL.xlsx` (60), test: `DATA_TEST.xlsx` (21)
  - excludes subject score features (GWA + survey profile only; `NO_SUBJECT_FEATURES`)

  Model bundle exports:

  - trained models
  - feature lists (`FEATURES_ALL`, `FEATURES_BASIC`, `FEATURES_NOSUB`)
  - encoders
  - evaluation metrics

  Runtime inference (`/predict`) reconstructs those feature vectors in `build_feature_vector()`.

### Data Files and Roles

- `DATA_MODEL.xlsx` — 60 rows, 98 columns (2022–2025). With survey. Primary training source.
- `DATA_SYSTEM.xlsx` — 333 rows, 8 columns (2022–2025). No survey. Used only for Regression A training (2022–2024 slice) to avoid leakage.
- `DATA_TEST.xlsx` — 21 rows (2025 Apr+Aug). With survey. Held-out evaluation set.
- `DATA_UPCOMING.xlsx` — 333 rows (2022–2025). No survey. Single source of truth for institutional analytics in the dashboard.

  ---

  ## 11) Frontend Module Function Guide

  ## App routing (`App.jsx`)

  - local state-based routing:
    - `landing`
    - `login`
    - `student`
    - `professor`

  ## Login (`LoginPage.jsx`)

  - register/login mode
  - role-aware payloads
  - stores `token`, `role`, and name in `localStorage`

  ## Student page (`StudentPage.jsx`)

  - dashboard view + predictor view + result view
  - fetches DB history from `/student/attempts`
  - fallback local history in browser storage if DB fetch fails

  ## Predictor form (`PredictorForm.jsx`)

  - multi-step survey flow
  - validation for scores and GWA
  - question timing capture (`question_timings`) for reliability/timing analytics

  ## Result card (`ResultCard.jsx`)

  - renders prediction/rating outputs
  - section-level scores
  - fetches AI recommendations (`/ai-recommend`) per section

  ## Professor dashboard (`ProfessorPage.jsx` + `components/professor/*`)

  - modularized shared UI, tab nav, timing modal, and model overview module
  - consumes analytics/model/admin endpoints

  ---

  ## 12) User Guide

  ## Student user guide

  1. Open app and choose Student
  2. Register or log in
  3. Click predictor and complete:
    - exam scores
    - background details
    - questionnaire sections
  4. Submit prediction
  5. Review:
    - pass/fail result
    - probabilities
    - predicted ratings A/B
    - reliability score
    - AI recommendations by section
  6. Check history for previous attempts

  ## Professor user guide

  1. Open app and choose Faculty/Professor
2. Register (requires `FACULTY_CODE`) or log in
  3. Use dashboard tabs to view:
    - overview/performance/features/curriculum
    - classification/regression/correlation
    - trends & monitoring
    - model overview dashboard
  4. Apply filters (year/month/review/subject)
  5. Export report when needed (`performance report`)

  ---

  ## 13) Data Flow Summary (Plain)

  - **Input data origin**
    - student form entries
    - historical Excel datasets for institutional analytics
    - DB attempts for live monitoring

  - **Processing**
    - feature vector assembly
    - ML inference (classifier + 2 regressors)
    - reliability computation
    - optional AI text generation (Groq)

  - **Storage**
    - prediction results + input snapshot in DB
    - recommendation cache in DB

  - **Output**
    - student-focused prediction result
    - professor-focused aggregate dashboards and trend reports

  ---

  ## 14) Important Operational Notes

  - If `DATABASE_URL` is missing:
    - prediction can still run
    - persistence/history monitoring becomes limited

  - If `GROQ_API_KEY` is missing:
    - AI recommendation and AI trend summary endpoints return fallback text

  - Frontend uses a fixed production API URL unless changed in `apiBase.js`.
- Institutional analytics in the professor dashboard use `DATA_UPCOMING.xlsx` (333 rows, 2022–2025) as the single source of truth.

  ---

  ## 15) Quick Run Guide

  ## Backend

  ```bash
  cd backend
  pip install -r requirements.txt
  uvicorn main:app --reload
  ```

  ## Frontend

  ```bash
  cd frontend
  npm install
  npm start
  ```

  ## Train model

  ```bash
  cd backend
  python train_model.py
  ```

  ---

*** End of File

