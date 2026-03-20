# Phase 1 Setup: Data + PostgreSQL

Follow these steps to run Phase 1 (real data training + database persistence). You already have pgAdmin installed.

---

## 1. Install Python dependencies

From the project folder, activate the venv and install:

```bash
cd venv
pip install -r requirements.txt
```

Or install the new packages manually:

```bash
pip install openpyxl sqlalchemy psycopg2-binary python-dotenv
```

---

## 2. Create the database in pgAdmin

1. Open **pgAdmin** and connect to your PostgreSQL server (e.g. localhost).
2. Right-click **Databases** → **Create** → **Database**.
3. Set **Database** name: `ree_predictor` (or any name you prefer).
4. Click **Save**.

Note the **username** and **password** you use for PostgreSQL (often `postgres` / your password). You will need them for the connection URL.

---

## 3. Configure `.env`

1. In the `venv` folder, copy `.env.example` to `.env`:

   ```bash
   copy .env.example .env
   ```

2. Edit `.env` and set your PostgreSQL URL:

   ```
   DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/ree_predictor
   ```

   Replace `USER` and `PASSWORD` with your PostgreSQL user and password. Example:

   ```
   DATABASE_URL=postgresql://postgres:MyPass123@localhost:5432/ree_predictor
   ```

3. (Optional) Add your Groq API key for AI recommendations:

   ```
   GROQ_API_KEY=your_groq_key_here
   ```

---

## 4. Train the model with real data

The trainer now reads from **data_for_system.xlsx** by default.

1. Ensure `data_for_system.xlsx` is in the `venv` folder (it already is).
2. If your Excel has different column names than the mock CSV, you may need to rename columns to match (e.g. `PASSED / FAILED-RETAKE`, `TOTAL RATING`, `EE`, `MATH`, `ESAS`, `GWA`, and the survey question text exactly as in `train_model.py`).
3. Run training:

   ```bash
   cd venv
   python train_model.py
   ```

4. Check that `ree_survey_model.pkl`, `evaluation_report.txt`, and the PNG plots were updated. Keep a copy of the report for your thesis (Chapter 4).

**Optional:** To use a dedicated test set (e.g. `data_for_testing.xlsx`), open `train_model.py` and set:

```python
TEST_DATA_FILE = "data_for_testing.xlsx"
``` 

Then run `python train_model.py` again.

---

## 5. Start the backend

1. From the `venv` folder:

   ```bash
   uvicorn main:app --reload
   ```

2. On startup you should see:
   - `Model bundle loaded OK`
   - `Database: connected (tables created/verified)`  
     If you see `Database: DATABASE_URL not set`, check that `.env` exists and contains `DATABASE_URL`.

3. In pgAdmin, refresh **ree_predictor** → **Schemas** → **public** → **Tables**. You should see:
   - **users**
   - **prediction_attempts**

---

## 6. Verify persistence

1. Open the frontend (e.g. `npm start` in `frontend`) and submit a prediction as a student.
2. Check the API response: it should include `"attempt_id": "<uuid>"` when the database is connected.
3. In pgAdmin, right-click **prediction_attempts** → **View/Edit Data** → **All Rows**. You should see one row per prediction with the new UUID and the stored outputs.

---

## Troubleshooting

| Issue | What to do |
|-------|------------|
| `ModuleNotFoundError: openpyxl` | Run `pip install openpyxl` inside the venv. |
| `ModuleNotFoundError: sqlalchemy` or `psycopg2` | Run `pip install -r requirements.txt` from the `venv` folder. |
| `Could not load ree_survey_model.pkl` | Run `python train_model.py` from the `venv` folder first. |
| `data_for_system.xlsx` has different columns | Either rename columns in Excel to match the CSV (see `train_model.py` for exact names), or add a column-mapping step in `train_model.py` for your Excel. |
| `Database: DATABASE_URL not set` | Create `.env` in the `venv` folder with `DATABASE_URL=postgresql://...`. |
| Connection refused to PostgreSQL | Ensure PostgreSQL is running (e.g. from Windows Services or pgAdmin). |
| Tables not created | Ensure the user in `DATABASE_URL` has permission to create tables. Run the backend once; `init_db()` creates tables on startup. |

---

## Summary

- **Phase 1.1:** `train_model.py` now uses `data_for_system.xlsx` (and optionally `data_for_testing.xlsx`).
- **Phase 1.2:** `database.py` defines `users` and `prediction_attempts`; tables are created when the backend starts with `DATABASE_URL` set.
- **Phase 1.3:** Every successful `/predict` is saved to `prediction_attempts` and the response includes `attempt_id`.

Next you can add analytics endpoints that read from `prediction_attempts` (e.g. pass/fail by year/month) and wire the professor dashboard to them.
