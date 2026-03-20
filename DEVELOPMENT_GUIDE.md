# REE Licensure Prediction System — Development Guide

This guide maps your **System Process Flow** and **System Pre-Objectives** to the current codebase and provides a step-by-step plan to continue development. Use it as a single reference for what is done, what is missing, and in what order to build it.

---

## Table of Contents

1. [Current State Summary](#1-current-state-summary)
2. [Database Recommendation & Setup](#2-database-recommendation--setup)
3. [Process Flow Mapping (10 Steps)](#3-process-flow-mapping-10-steps)
4. [System Pre-Objective Checklist](#4-system-pre-objective-checklist)
5. [Phased Execution Plan](#5-phased-execution-plan)
6. [Quick Reference: Run Order](#6-quick-reference-run-order)

---

## 1. Current State Summary

| Component | Location | Status |
|-----------|----------|--------|
| **Frontend** | `frontend/` (React, Tailwind) | Landing page, login, student predictor UI, professor dashboard |
| **Backend API** | `venv/main.py` (FastAPI) | `/predict`, `/ai-recommend`, `/analytics`, `/model-info`, `/health` |
| **Model training** | `venv/train_model.py` | Classification + Regression A/B, evaluation report, plots |
| **Trained model** | `venv/ree_survey_model.pkl` | Loaded by `main.py` |
| **Mock data (training)** | `venv/DATA_PRC_GWA_FINAL1.1.csv` (and 1.3, 1.4) | Used by `train_model.py` |
| **Real data** | `venv/data_for_system.xlsx`, `venv/data_for_testing.xlsx` | Not yet wired into training or analytics |
| **Database** | — | **Not implemented** (predictions not persisted, no user IDs) |

**Note:** `venv/app.py` is a simpler/older API; the active backend is `venv/main.py` (run with `uvicorn main:app --reload` from inside `venv`).

---

## 2. Database Recommendation & Setup

### Recommendation: **PostgreSQL**

For this system, **PostgreSQL** is a good fit because:

- **Structured data:** Users, prediction attempts, and admin analytics (year/month filters, aggregates) fit naturally into tables.
- **Reliability:** ACID transactions and strong consistency for recording every prediction attempt.
- **Query power:** Complex filters (by year, month, first-time takers), aggregations, and reporting are straightforward.
- **Ecosystem:** Works well with Python (e.g. `asyncpg`, `SQLAlchemy`, or `psycopg2`) and is widely used in production.
- **Thesis alignment:** “Traditional database” is satisfied; no need for a document store unless you prefer one.

**Alternatives (if you prefer):**

- **SQLite:** Easiest (single file, no server). Good for single-machine deployment or thesis demo; less ideal for multiple concurrent users or future scaling.
- **MySQL / MariaDB:** Also traditional and fine; use if your school or hosting already uses them.

**Suggested tables (high level):**

| Table | Purpose |
|-------|--------|
| `users` | Optional auth; at minimum: `id`, `student_id` or system-generated UUID, `name`, `role`, `created_at`. |
| `prediction_attempts` | One row per prediction: `id`, `user_id`, `input_json` (or normalized columns), `prediction_pass_fail`, `predicted_rating_a`, `predicted_rating_b`, `probability_pass`, `created_at`. |
| `recommendations_cache` | Optional: store AI recommendation text per attempt/section to avoid re-calling Groq. |

**Minimal setup steps (PostgreSQL):**

1. Install PostgreSQL (e.g. from [postgresql.org](https://www.postgresql.org/download/windows/)).
2. Create a database, e.g. `ree_predictor`.
3. In `venv`, install driver and ORM, e.g.:
   ```bash
   pip install sqlalchemy psycopg2-binary
   # or async: pip install sqlalchemy asyncpg
   ```
4. Add a `.env` (and `.gitignore` it) with:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/ree_predictor
   ```
5. In the backend, add a small module (e.g. `venv/database.py`) that:
   - Defines SQLAlchemy models for `users` and `prediction_attempts`.
   - Creates tables on startup (e.g. `Base.metadata.create_all(engine)`) or via a one-off script.
6. After each successful `/predict`, insert a row into `prediction_attempts` (and optionally link to `users` when you add auth).

This gives you **unique identifiers per attempt**, **full history**, and a base for **admin monitoring** and **year/month analytics** from real usage data.

---

## 3. Process Flow Mapping (10 Steps)

Each step of your **System Process Flow** is mapped to what exists and what remains.

---

### Step 1: Landing Page and System Introduction

| Requirement | Status | Where / What to do |
|-------------|--------|--------------------|
| Short description of system (predict likelihood of passing EE licensure, provide insights) | ✅ Done | `frontend/src/components/LandingPage.jsx` — hero and feature sections |
| Usage guidelines for **students** (how to enter info and generate predictions) | ⚠️ Partial | Add a clear “For Students” section with step-by-step instructions |
| Usage guidelines for **faculty/administrators** (how to access monitoring and analytics) | ⚠️ Partial | Add “For Faculty” section with link to professor dashboard and what they can see |
| Basic instructions for entering information and generating results | ⚠️ Partial | Add short bullet list or accordion on landing page |
| Administrator guidelines (access to monitoring tools and dashboards) | ⚠️ Partial | Same “For Faculty” section |
| **Disclaimer:** Results depend on accuracy and honesty of input; random/guessed responses may be unreliable | ❌ Missing | Add a visible disclaimer box/section on landing page and/or before submitting prediction |

**Action:** Extend `LandingPage.jsx` with explicit “For Students” and “For Faculty” guidelines and a prominent disclaimer.

---

### Step 2: User Data Entry and Identification

| Requirement | Status | Where / What to do |
|-------------|--------|--------------------|
| Input academic and examination-related records (GWA, subject ratings, board prep, cognitive, non-cognitive) | ✅ Done | `PredictorForm.jsx` + `main.py` `PredictRequest` and `build_feature_vector()` |
| Unique identifier per user/entry (student ID or system-generated ID) | ❌ Missing | Add when adding DB: generate UUID (or use student ID if provided) and store with each attempt |
| Allow users to repeat prediction multiple times; record every attempt | ⚠️ Partial | UI allows resubmission; **backend does not persist** — add DB and save each `/predict` call |

**Action:** Introduce `user_id` / `attempt_id` in backend and DB; return `attempt_id` in `/predict` response; optionally let user enter Student ID in form.

---

### Step 3: Questionnaire and Response Reliability Checking

| Requirement | Status | Where / What to do |
|-------------|--------|--------------------|
| Reliability checking (serious vs random answering) | ❌ Missing | Implement a small module that scores consistency (e.g. related-question pairs, control scenarios) |
| Controlled trial scenarios (e.g. outstanding/average/chill × proper/improper answering) | ❌ Missing | Define trial categories and expected response patterns; run checks before or after prediction |
| Percentage-based reliability result | ❌ Missing | Expose reliability score in API and optionally in UI (e.g. “Response reliability: 85%”) |
| Questions timely and relevant; clear fonts; logical connections between items | ✅ Largely done | Survey in `PredictorForm.jsx` and `main.py` sections |
| Analyze relationships between related questions to detect inconsistencies | ❌ Missing | Add correlation or rule-based checks between related items; feed into reliability score |

**Action:** Add `reliability.py` (or similar) that computes a 0–100% reliability score; call it from `main.py` before or after prediction; optionally block or warn when score is too low.

---

### Step 4: Data Processing and Prediction Model

| Requirement | Status | Where / What to do |
|-------------|--------|--------------------|
| Process data with AI-based prediction model | ✅ Done | `main.py` loads `ree_survey_model.pkl`; `build_feature_vector()` + classifier/regressors |
| Analyze relationship among variables (academic, cognitive, non-cognitive, board prep) | ✅ Done | Model uses all these; feature importance in bundle and `/analytics` |
| Correlation analysis of variables vs licensure performance | ⚠️ Partial | Feature importance present; add explicit correlation matrix (e.g. in training or analytics) |
| Administrators can view processed data and reports on how model generated predictions | ⚠️ Partial | `/model-info` and `/analytics`; add “model explanation” or feature-contribution view if needed |
| Model evaluation reports (performance metrics, prediction accuracy) | ✅ Done | `evaluation_report.txt`, `main.py` `/model-info`; can surface in faculty dashboard |

**Action:** (1) Switch training to use `data_for_system.xlsx` (and optionally `data_for_testing.xlsx` for validation). (2) Add correlation matrix generation in `train_model.py` or a separate script and expose via `/analytics` or a dedicated endpoint. (3) Optionally add a simple “explain prediction” (e.g. top features for this input) in API and professor UI.

---

### Step 5: Prediction Output and Result Generation

| Requirement | Status | Where / What to do |
|-------------|--------|--------------------|
| Generate AI-based predictions (likelihood of passing) | ✅ Done | `/predict` returns pass/fail, probabilities, predicted ratings |
| Save each prediction attempt in database | ❌ Missing | Add DB and persist after each `/predict` |
| Associate results with user unique identifier | ❌ Missing | Same as above; store `user_id` / `attempt_id` |

**Action:** Implement `prediction_attempts` table and save in `main.py` after successful prediction; return `attempt_id` (and optionally `user_id`) in response.

---

### Step 6: Personalized Recommendation System

| Requirement | Status | Where / What to do |
|-------------|--------|--------------------|
| Recommendations in: Board Exam Prep, Cognitive, Non-Cognitive | ✅ Done | `ResultCard.jsx` + `/ai-recommend` with section-based prompts; sections map to these categories |
| Visible only to the user who generated the prediction | ✅ Done | Recommendations are per-request and not shared |
| Highlight improvable areas; prioritize actionable/controllable factors | ✅ Done | Groq prompt in `main.py` asks for actionable steps and references weak answers |
| Exclude factors that cannot be significantly changed by user | ⚠️ Review | Prompt can explicitly say “focus on factors the student can control” |

**Action:** Optional: tighten Groq prompt to state “Do not recommend changing factors the student cannot control (e.g. institutional factors); focus on study habits, preparation, and mindset.”

---

### Step 7: Administrator Monitoring System

| Requirement | Status | Where / What to do |
|-------------|--------|--------------------|
| Separate admin dashboard for faculty | ✅ Done | `ProfessorPage.jsx` |
| Monitor all prediction records | ⚠️ Partial | Currently uses CSV-based `/analytics`; once DB exists, switch to querying `prediction_attempts` |
| Track which individuals used the system | ❌ Missing | Requires DB and `user_id` / identifiers; then list users and attempt counts |
| Summarized prediction results and statistics | ✅ Done | `/analytics` returns overview, pass rates by year/strand/review, etc. |
| Filter by time period (year, month) | ⚠️ Partial | Analytics can be extended to filter by `created_at` from DB |

**Action:** After DB is in place, add endpoints (e.g. `GET /admin/predictions`, `GET /admin/users`) with year/month filters and pagination; wire Professor dashboard to these.

---

### Step 8: Data Visualization and Analytics Dashboard

| Requirement | Status | Where / What to do |
|-------------|--------|--------------------|
| Graphical representations of prediction data | ✅ Done | `ProfessorPage.jsx` uses `/analytics` and renders bars, pass rates, etc. |
| Yearly statistics (predicted passers vs non-passers) | ✅ Done | `pass_rate_by_year` and overview |
| Pie charts for overall predicted results per year | ⚠️ Partial | Can add pie charts from existing `overview` / `pass_rate_by_year` |
| Monthly breakdown for selected year | ❌ Missing | Need DB with `created_at`; then aggregate by month and add to API + UI |
| Note: data represents first-time examinees only | ❌ Missing | Add “First-time takers only” note in UI; if your data has a first-taker flag, filter in backend |

**Action:** (1) Add monthly aggregation once predictions are stored with timestamps. (2) Add pie chart(s) for pass/fail per year. (3) Display “First-time examinees only” where applicable and filter by first-taker if data supports it.

---

### Step 9: Subject Performance Visualization

| Requirement | Status | Where / What to do |
|-------------|--------|--------------------|
| Compare average subject ratings across years (e.g. 2022, 2023, 2024) | ⚠️ Partial | Possible with current CSV; need to ensure data has subject columns and year; add endpoint and charts |
| Highlight subjects with increasing or decreasing trends | ❌ Missing | Compute year-over-year change; add to analytics API and professor UI |

**Action:** In training/analytics data, ensure EE, MATH, ESAS (and any other subject) and YEAR are available; add `subject_trends_by_year` (and optionally trend direction) to `/analytics` and a chart in Professor dashboard.

---

### Step 10: AI-Based Trend Insights

| Requirement | Status | Where / What to do |
|-------------|--------|--------------------|
| Comparisons of performance trends across years | ⚠️ Partial | Pass rate by year exists; can add narrative summary |
| Changes in predicted passing rates and rating percentages | ❌ Missing | Compute deltas year-over-year; expose in API |
| Identify years with higher/lower predicted passing rates for first-time takers | ❌ Missing | Combine first-taker filter (if available), pass rates, and optional AI summary |

**Action:** Add to `/analytics`: year-over-year change in pass rate and average rating; optional: call Groq with summary stats to generate 2–3 sentence “insight” for faculty and show in Professor dashboard.

---

## 4. System Pre-Objective Checklist

Aligned with your **System Pre-Objective** table:

| Area | Objective | Status |
|------|-----------|--------|
| **User Prediction (Student)** | Input general info (Name, Age, Sex, Year Graduated) | ⚠️ Add fields to form if required |
| | Input academic/exam records | ✅ |
| | Generate AI-based predictions | ✅ |
| | Repeat prediction multiple times | ✅ (persist once DB added) |
| | Record each attempt in DB | ❌ Add with DB |
| | Unique identifier per entry | ❌ Add with DB |
| | Individualized recommendations (Board Prep, Cognitive, Non-Cognitive) | ✅ |
| | Recommendations visible only to user | ✅ |
| | Guidance on improvable factors | ✅ |
| **Administrator (Faculty)** | Access to monitor all prediction records | ⚠️ After DB |
| | Track who used the system | ❌ After DB |
| | Summarized prediction data | ✅ |
| | Yearly statistics passers/non-passers | ✅ |
| | Pie charts and trend graphs | ⚠️ Add pie + trends |
| | Monthly breakdown per selected year | ❌ After DB |
| | Note: first-time examinees only | ❌ Add note + filter |
| | Comparative insights (e.g. 2022–2024) | ⚠️ Add YoY metrics |
| | Subject performance trends per year | ⚠️ Add |
| **Model Development** | Random Forest classification + regression | ✅ |
| | Classification: pass/fail | ✅ |
| | Regression: percentage rating | ✅ |
| | **Display evaluation metrics:** Classification (Accuracy, Precision, Recall, F1, Confusion Matrix) | ✅ In report + `/model-info`; expose in UI |
| | **Display evaluation metrics:** Regression (MAE, MSE, RMSE, R²) | ✅ In report + `/model-info`; expose in UI |
| **Visualization of Model Results (Faculty)** | Graphs of model results | ✅ Partial (feature importance, etc.) |
| | Performance graphs per year | ⚠️ After DB + time-series |
| | Return prediction output to front-end | ✅ |
| | Correlation analysis among variables | ⚠️ Add correlation matrix |
| | Present correlation (matrix or graph) | ❌ Add |
| **Landing Page** | Short, clear description of software | ✅ |
| | Separate usage guidelines (Students vs Faculty) | ⚠️ Expand |
| | Instructions for data input and prediction | ⚠️ Expand |
| | Instructions for admin monitoring | ⚠️ Expand |
| | Disclaimer (accuracy/honesty of data; no random guessing) | ❌ Add |

---

## 5. Phased Execution Plan

Execute in this order to avoid rework and to align with your thesis objectives.

### Phase 1: Data & Database (Foundation)

1. **Use real data in training**
   - Update `train_model.py` to read from `data_for_system.xlsx` (and optionally `data_for_testing.xlsx` for a dedicated test set).
   - Ensure column names and encodings match (same targets, same feature set). Re-run training and update `ree_survey_model.pkl`.
   - Keep a copy of evaluation report and plots for thesis (Chapter 4).

2. **Add PostgreSQL (or SQLite)**
   - Create DB and tables: `users` (minimal), `prediction_attempts` (with `user_id`, `attempt_id`, inputs, outputs, `created_at`).
   - In `main.py`, after a successful `/predict`, insert one row into `prediction_attempts`. Return `attempt_id` in the response.
   - Optionally: generate or accept a `user_id` (e.g. UUID or student ID) per session or form submission.

3. **Point analytics to DB (optional in Phase 1)**
   - Add endpoints that aggregate from `prediction_attempts` (e.g. pass/fail counts by year/month) so admin views use live prediction data instead of CSV. If you prefer to keep CSV for “historical” and DB for “new predictions,” you can do that and merge in the API.

### Phase 2: Landing Page & Disclaimer

4. **Landing page completion**
   - Add **“For Students”**: how to open predictor, fill form, submit, read results and recommendations.
   - Add **“For Faculty”**: how to log in as professor, access dashboard, what each chart means.
   - Add a clear **disclaimer** box: prediction quality depends on accuracy and honesty of input; random or guessed answers may give unreliable results and may not reflect actual readiness.

### Phase 3: Reliability & Model Transparency

5. **Questionnaire reliability**
   - Implement reliability scoring (e.g. related-question consistency, control scenarios). Expose a 0–100% score in API and optionally in UI; optionally warn or block if below threshold.

6. **Model evaluation in UI**
   - In professor dashboard (or a dedicated “Model” page), show metrics from `/model-info`: Accuracy, Precision, Recall, F1, Confusion Matrix link/text; MAE, RMSE, R² for both regressions. Optionally embed or link to confusion matrix and feature importance images.

7. **Correlation analysis**
   - Add correlation matrix computation (e.g. in `train_model.py` or analytics script) for key variables vs target. Expose via `/analytics` or new endpoint and show as matrix or heatmap in faculty dashboard.

### Phase 4: Admin & Time-Based Analytics

8. **Admin monitoring from DB**
   - List of users/attempts (who used the system), with filters by year/month.
   - Monthly breakdown of predictions for selected year; pie charts for pass/fail per year.
   - Add “First-time examinees only” note and filter if your data supports it.

9. **Subject performance and trends**
   - Subject averages (EE, MATH, ESAS) by year from data; year-over-year change; highlight improving/declining subjects in dashboard.

10. **AI trend insights**
    - Year-over-year change in pass rate and average rating; optional short Groq-generated summary for faculty (“This year’s predicted pass rate is X% higher than last year…”).

### Phase 5: Polish & Thesis Alignment

11. **Optional: Name, Age, Sex, Year Graduated**
    - If required by your objectives, add these fields to the student form and to `prediction_attempts` (or `users`).

12. **Documentation**
    - Update README with: how to run backend (train model, then uvicorn), frontend, DB setup, and env vars. Keep this DEVELOPMENT_GUIDE.md as the main development map.

---

## 6. Quick Reference: Run Order

- **Train model (after changing data source or code):**
  ```bash
  cd venv
  python train_model.py
  ```
- **Backend:**
  ```bash
  cd venv
  set GROQ_API_KEY=your_key
  uvicorn main:app --reload
  ```
- **Frontend:**
  ```bash
  cd frontend
  npm install
  npm start
  ```

After adding the database, set `DATABASE_URL` in `.env` and ensure the app creates or migrates tables on startup (or run a one-off migration script).

---

*This guide aligns with your **Main Objectives of the Study** (feature identification, Random Forest classification/regression, evaluation/validation, actionable insights) and your **System Pre-Objectives** table. Use the checklist in Section 4 to tick off items as you complete them.*
