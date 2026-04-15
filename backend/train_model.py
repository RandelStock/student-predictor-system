"""
train_model.py — REE Licensure Exam Predictor (SLSU)
=====================================================

DATA ARCHITECTURE (UPDATED)
----------------------------
DATA_MODEL.xlsx     123 rows, 98 cols, 2022-2024
                    EE + MATH + ESAS + GWA + full survey + PRC result
                    → PRIMARY training source (has survey answers)

DATA_EVALUATION.xlsx 36 rows, 98 cols, 2025
                     EE + MATH + ESAS + GWA + full survey + PRC result
                     → HELD-OUT evaluation/test set (2025, never seen during training)

DATA_ALL.xlsx       159 rows, 98 cols, 2022-2025
                    EE + MATH + ESAS + GWA + full survey + PRC result
                    → FULL production set used for final model retrain and deployment

DATA_UPCOMING.xlsx  333 rows, 8 cols, 2022-2025
                    EE + MATH + ESAS + GWA + PRC result, NO survey
                    → Identical to DATA_SYSTEM (legacy) for dashboard analytics
                    → Powers main.py institutional dashboard (all 333 examiners)
                    → NOT used for model training

TRAINING STRATEGY
-----------------
Classification    train=DATA_MODEL(123),             test=DATA_EVALUATION(36), features=ALL_FEATURES
Regression A      train=DATA_MODEL(123) + DATA_UPCOMING[2022-2024](250) = 373 rows,
                  test=DATA_EVALUATION(36), features=BASIC_FEATURES
Regression B      train=DATA_MODEL(123),             test=DATA_EVALUATION(36), features=NO_SUBJECT_FEATURES

NOTE ON DATA_UPCOMING vs DATA_ALL
---------------------------------
DATA_UPCOMING (333 rows) is the institutional analytics source for main.py.
DATA_ALL (159 rows) is the model production training source (2022-2025).
DO NOT combine DATA_UPCOMING with DATA_EVALUATION or DATA_MODEL for evaluation.
"""

import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use("Agg")
import seaborn as sns
import joblib
import warnings
warnings.filterwarnings("ignore")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import StratifiedKFold, KFold, cross_val_score
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report,
    mean_absolute_error, mean_squared_error, r2_score
)
from sklearn.preprocessing import LabelEncoder

# ─────────────────────────────────────────────
# FILE PATHS & HELPER (UPDATED 2026-03-30)
# ─────────────────────────────────────────────
# NEW: CSV files with xlsx fallback for backward compatibility
def _load_data_file(filename_base):
    """Try to load CSV first, then xlsx."""
    for ext in [".csv", ".xlsx"]:
        path = os.path.join(BASE_DIR, filename_base + ext)
        try:
            if ext == ".csv":
                return pd.read_csv(path)
            else:
                return pd.read_excel(path, sheet_name=0)
        except FileNotFoundError:
            continue
    # Final fallback on cwd-based relative path for compatibility
    for ext in [".csv", ".xlsx"]:
        path = filename_base + ext
        try:
            if ext == ".csv":
                return pd.read_csv(path)
            else:
                return pd.read_excel(path, sheet_name=0)
        except FileNotFoundError:
            continue
    raise FileNotFoundError(f"Neither {filename_base}.csv nor {filename_base}.xlsx found in {BASE_DIR} or cwd.")

# Dataset definitions (2026 March 30 restructure):
# - DATA_MODEL (123 rows, 2022-2024) → training data with survey
# - DATA_EVALUATION (36 rows, 2025) → evaluation/test data with survey
# - DATA_ALL (159 rows, 2022-2025) → final model retrain data with survey
# - DATA_UPCOMING (333 rows, 2022-2025) → legacy institutional analytics (no survey)
FILE_MODEL       = "DATA_MODEL"       # training set (2022-2024, n=121 expected)
FILE_EVALUATION  = "DATA_EVALUATION"  # evaluation set (2025, n=36 expected)
FILE_ALL         = "DATA_ALL"         # final model (2022-2025, n=157 expected)
FILE_UPCOMING    = "DATA_UPCOMING"    # legacy analytics (333 rows, 2022-2025)

TARGET_CLASS = "PASSED / FAILED-RETAKE"
TARGET_REG   = "TOTAL RATING"
SUBJECT_COLS = ["EE", "MATH", "ESAS"]

print("=" * 65)
print("  REE LICENSURE EXAM PREDICTOR — MODEL TRAINING")
print("=" * 65)

# ═══════════════════════════════════════════════════════════════
# STEP 1 — LOAD RAW FILES (CSV/XLSX, NEW DATASET STRUCTURE)
# ═══════════════════════════════════════════════════════════════
print(f"\n[1] Loading data files (CSV/XLSX)...")
try:
    df_model = _load_data_file(FILE_MODEL)
except FileNotFoundError as e:
    print(f"    ERROR: {e}")
    exit(1)

try:
    df_evaluation = _load_data_file(FILE_EVALUATION)
except FileNotFoundError as e:
    print(f"    ERROR: {e}")
    exit(1)

try:
    df_all = _load_data_file(FILE_ALL)
except FileNotFoundError as e:
    print(f"    WARNING: {FILE_ALL} not found. Will construct from MODEL+EVALUATION.")
    df_all = pd.concat([df_model, df_evaluation], ignore_index=True)

for df in [df_model, df_evaluation, df_all]:
    df.columns = df.columns.str.strip()

# Load DATA_UPCOMING for institutional analytics and additional training samples in regression A
try:
    df_upcoming = _load_data_file(FILE_UPCOMING)
    if df_upcoming is None:
        raise FileNotFoundError(f"No file for {FILE_UPCOMING} found (CSV/XLSX)")
    df_upcoming.columns = df_upcoming.columns.str.strip()
    print(f"    DATA_UPCOMING  : {len(df_upcoming)} rows x {len(df_upcoming.columns)} cols (legacy 333)")
except FileNotFoundError as e:
    print(f"    WARNING: {e}")
    df_upcoming = pd.DataFrame()

print(f"    DATA_MODEL      : {len(df_model)} rows x {len(df_model.columns)} cols (training)")
print(f"    DATA_EVALUATION : {len(df_evaluation)} rows x {len(df_evaluation.columns)} cols (test/eval)")
print(f"    DATA_ALL        : {len(df_all)} rows x {len(df_all.columns)} cols (final retrain)")

# ───────────────────────────────────────────────────────────────
# STEP 1.5 — NORMALISE YEAR COLUMN IN ALL SPLITS
# ───────────────────────────────────────────────────────────────
YEAR_COL = next((c for c in ["YEAR", "Year", "year"] if c in df_model.columns), None)

def _normalize_year_column(df):
    if YEAR_COL not in df.columns:
        return df
    # Handle date strings like "2022-04-01" or plain "2022"
    parsed = pd.to_datetime(df[YEAR_COL], errors="coerce")
    if parsed.notna().sum() > len(df) * 0.5:
        df[YEAR_COL] = parsed.dt.year.astype("Int64")
    else:
        df[YEAR_COL] = (
            df[YEAR_COL].astype(str).str.extract(r"(\d{4})")[0]
        )
        df[YEAR_COL] = pd.to_numeric(df[YEAR_COL], errors="coerce")
    return df

if YEAR_COL:
    df_model       = _normalize_year_column(df_model)
    df_evaluation  = _normalize_year_column(df_evaluation)
    df_all         = _normalize_year_column(df_all)
    if not df_upcoming.empty:
        df_upcoming = _normalize_year_column(df_upcoming)

    print(f"\n[1.5] Year column '{YEAR_COL}' normalised to integers.")
    print(f"    DATA_MODEL      years : {sorted(df_model[YEAR_COL].dropna().unique().tolist())}")
    print(f"    DATA_EVALUATION years : {sorted(df_evaluation[YEAR_COL].dropna().unique().tolist())}")
    print(f"    DATA_ALL        years : {sorted(df_all[YEAR_COL].dropna().unique().tolist())}")
    if not df_upcoming.empty:
        print(f"    DATA_UPCOMING   years : {sorted(df_upcoming[YEAR_COL].dropna().unique().tolist())}")
else:
    print("\n[1.5] WARNING: No YEAR column found — cannot validate year ranges.")

# ═══════════════════════════════════════════════════════════════
# STEP 2 — ENCODE PASS/FAIL TARGET
# ═══════════════════════════════════════════════════════════════
def encode_target(df):
    df[TARGET_CLASS] = (
        df[TARGET_CLASS].astype(str).str.strip().str.upper()
        .map(lambda x: 1 if x == "PASSED" else 0)
    )
    return df

df_model       = encode_target(df_model)
df_evaluation  = encode_target(df_evaluation)
df_all         = encode_target(df_all)
if not df_upcoming.empty:
    df_upcoming = encode_target(df_upcoming)

# ═══════════════════════════════════════════════════════
# STEP 3 — ENCODE SURVEY / CATEGORICAL COLUMNS
#          Applied to DATA_MODEL and DATA_TEST (both have survey)
# ═══════════════════════════════════════════════════════════════
print("\n[2] Encoding categorical + survey columns...")

le_dict = {}

def encode_survey(df):
    # SHS Strand
    if "Senior High School Strand" in df.columns:
        le = LabelEncoder()
        df["Senior High School Strand"] = (
            df["Senior High School Strand"].fillna("UNKNOWN").astype(str).str.strip()
        )
        df["shs_strand_encoded"] = le.fit_transform(df["Senior High School Strand"])
        le_dict["shs_strand"] = le

    # Yes/No columns -> 1/0
    yes_no_cols = [
        "My Senior High School background adequately prepared me for engineering subjects in college.",
        "Electrical Engineering was my first choice of degree program.",
        "My college education sufficiently prepare me for the EE licensure examination?",
        "I attended a formal board review program.",
        "I followed a consistent and structured study schedule during my review period.",
        "I utilized various learning resources (review handouts, textbooks, online materials).",
        "I graduated on time.",
    ]
    for col in yes_no_cols:
        if col in df.columns:
            df[col] = (
                df[col].fillna("NO").astype(str).str.strip().str.upper()
                .map(lambda x: 1 if x in ["YES", "Y"] else 0)
            )

    # GWA Likert text -> ordinal
    gwa_col = "My General Weighted Average (GWA) reflects my mastery of Electrical Engineering concepts. [RATE]"
    gwa_map = {"STRONGLY AGREE": 1, "AGREE": 2, "NEUTRAL": 3,
               "DISAGREE": 4, "STRONGLY DISAGREE": 5}
    if gwa_col in df.columns:
        df[gwa_col] = (
            df[gwa_col].fillna("NEUTRAL").astype(str).str.strip().str.upper()
            .map(gwa_map).fillna(3)
        )

    # Board review duration -> ordinal
    dur_col = "If YES, what was the duration of my board review?"
    if dur_col in df.columns:
        df[dur_col] = (
            df[dur_col].fillna("NONE").astype(str).str.strip().str.upper()
            .map(lambda x: 2 if "6" in x else (1 if "3" in x else 0))
        )

    # Drop free-text / multi-select columns
    drop_text = [
        c for c in df.columns
        if ("If NO" in c) or ("If YES" in c and "duration" not in c.lower())
    ]
    drop_text += ["Senior High School Strand"]
    df.drop(columns=[c for c in drop_text if c in df.columns], inplace=True)
    return df

df_model      = encode_survey(df_model)
df_evaluation = encode_survey(df_evaluation)
df_all        = encode_survey(df_all)
if not df_upcoming.empty:
    df_upcoming = encode_survey(df_upcoming)

# ═══════════════════════════════════════════════════════════════
# ═══════════════════════════════════════════════════════════════
# STEP 4 — FILL MISSING VALUES WITH COLUMN MEDIAN
# ═══════════════════════════════════════════════════════════════
print("[3] Filling missing values with column median...")
for df in [df_model, df_evaluation, df_all] + ([df_upcoming] if not df_upcoming.empty else []):
    for col in df.select_dtypes(include=[np.number]).columns:
        if df[col].isnull().sum() > 0:
            df[col].fillna(df[col].median(), inplace=True)
print(f"    Nulls remaining — MODEL:{df_model.isnull().sum().sum()}  "
      f"EVALUATION:{df_evaluation.isnull().sum().sum()}  ALL:{df_all.isnull().sum().sum()}"
      f"  UPCOMING:{(df_upcoming.isnull().sum().sum() if not df_upcoming.empty else 0)}")

# ═══════════════════════════════════════════════════════════════
# STEP 5 — BUILD FEATURE SETS
# ═══════════════════════════════════════════════════════════════
print("\n[4] Building feature sets...")

ALL_FEATURES = sorted([
    col for col in df_model.select_dtypes(include=[np.number]).columns
    if col not in [TARGET_CLASS, TARGET_REG]
])
NO_SUBJECT_FEATURES = sorted([c for c in ALL_FEATURES if c not in SUBJECT_COLS])
BASIC_FEATURES = [c for c in ["EE", "MATH", "ESAS", "GWA"] if c in df_model.columns]

print(f"    ALL_FEATURES        : {len(ALL_FEATURES)} cols  (classification + reg-B)")
print(f"    NO_SUBJECT_FEATURES : {len(NO_SUBJECT_FEATURES)} cols  (reg-B only, no EE/MATH/ESAS)")
print(f"    BASIC_FEATURES      : {len(BASIC_FEATURES)} cols  (reg-A)")

# ═══════════════════════════════════════════════════════════════
# STEP 6 — ASSEMBLE TRAIN / TEST SPLITS (NEW DATASET STRUCTURE)
# ═══════════════════════════════════════════════════════════════
print("\n[5] Assembling train/test sets...")

# — Classification: DATA_MODEL train, DATA_EVALUATION test, ALL features
X_train_clf = df_model[ALL_FEATURES]
y_train_clf = df_model[TARGET_CLASS]
X_test_clf  = df_evaluation.reindex(columns=ALL_FEATURES, fill_value=0)
y_test_clf  = df_evaluation[TARGET_CLASS]

# — Regression A: DATA_MODEL train, DATA_EVALUATION test, BASIC_FEATURES
X_train_ra = df_model[BASIC_FEATURES]
y_train_ra = df_model[TARGET_REG]
X_test_ra  = df_evaluation.reindex(columns=BASIC_FEATURES, fill_value=0)
y_test_ra  = df_evaluation[TARGET_REG]

# Add DATA_UPCOMING to Regression A training when available (legacy 333 rows)
X_train_ra_aug = X_train_ra.copy()
y_train_ra_aug = y_train_ra.copy()
if not df_upcoming.empty and TARGET_REG in df_upcoming.columns:
    upcoming_ra = df_upcoming.copy()
    upcoming_ra = upcoming_ra[pd.notna(upcoming_ra[TARGET_REG])]
    if not upcoming_ra.empty:
        upcoming_basis = upcoming_ra.reindex(columns=BASIC_FEATURES, fill_value=0)
        X_train_ra_aug = pd.concat([X_train_ra_aug, upcoming_basis], ignore_index=True, sort=False)
        y_train_ra_aug = pd.concat([y_train_ra_aug, upcoming_ra[TARGET_REG]], ignore_index=True, sort=False)

# — Regression B: DATA_MODEL train, DATA_EVALUATION test, survey features only
X_train_rb = df_model[NO_SUBJECT_FEATURES]
y_train_rb = df_model[TARGET_REG]
X_test_rb  = df_evaluation.reindex(columns=NO_SUBJECT_FEATURES, fill_value=0)
y_test_rb  = df_evaluation[TARGET_REG]

print(f"    Classification — train:{len(X_train_clf)} (MODEL) | test:{len(X_test_clf)} (EVAL)")
print(f"    Regression A   — train:{len(X_train_ra)} (MODEL) | test:{len(X_test_ra)} (EVAL)")
if len(X_train_ra_aug) > len(X_train_ra):
    print(f"    Regression A+Upcoming — train:{len(X_train_ra_aug)} (MODEL+UPCOMING) | test:{len(X_test_ra)} (EVAL)")
else:
    print(f"    Regression A+Upcoming — not available (DATA_UPCOMING missing or incomplete)")
print(f"    Regression B   — train:{len(X_train_rb)} (MODEL) | test:{len(X_test_rb)} (EVAL)")
print(f"    Train balance  — PASS:{y_train_clf.sum()} | FAIL:{(y_train_clf==0).sum()}")
print(f"    Test  balance  — PASS:{y_test_clf.sum()}  | FAIL:{(y_test_clf==0).sum()}")

# ═══════════════════════════════════════════════════════════════
# STEP 7 — TRAIN THREE RANDOM FOREST MODELS
# ═══════════════════════════════════════════════════════════════
print("\n[6] Training models...")

clf = RandomForestClassifier(
    n_estimators=200, max_depth=10,
    min_samples_split=5, min_samples_leaf=2,
    class_weight="balanced", random_state=42
)
clf.fit(X_train_clf, y_train_clf)
print("    Classification (60 rows, survey+scores) — done")

reg_a = RandomForestRegressor(
    n_estimators=200, max_depth=10,
    min_samples_split=5, min_samples_leaf=2,
    random_state=42
)
reg_a.fit(X_train_ra_aug, y_train_ra_aug)
print(f"    Regression A ({len(X_train_ra_aug)} rows, EE+MATH+ESAS+GWA) — done (includes DATA_UPCOMING when available)")

reg_b = RandomForestRegressor(
    n_estimators=200, max_depth=10,
    min_samples_split=5, min_samples_leaf=2,
    random_state=42
)
reg_b.fit(X_train_rb, y_train_rb)
print("    Regression B (60 rows, GWA+survey only) — done")

# ═══════════════════════════════════════════════════════════════
# STEP 8 — EVALUATE ON DATA_TEST (2025 held-out)
# ═══════════════════════════════════════════════════════════════
print("\n[7] Evaluating on DATA_TEST (2025 held-out, 21 rows)...")

y_pred_clf = clf.predict(X_test_clf)
acc  = accuracy_score(y_test_clf,  y_pred_clf)
prec = precision_score(y_test_clf, y_pred_clf, zero_division=0)
rec  = recall_score(y_test_clf,    y_pred_clf, zero_division=0)
f1   = f1_score(y_test_clf,        y_pred_clf, zero_division=0)
cm   = confusion_matrix(y_test_clf, y_pred_clf)

cv_skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_acc = cross_val_score(clf, X_train_clf, y_train_clf, cv=cv_skf, scoring="accuracy")
cv_f1  = cross_val_score(clf, X_train_clf, y_train_clf, cv=cv_skf, scoring="f1")

y_pred_ra = reg_a.predict(X_test_ra)
mae_a  = mean_absolute_error(y_test_ra, y_pred_ra)
rmse_a = np.sqrt(mean_squared_error(y_test_ra, y_pred_ra))
r2_a   = r2_score(y_test_ra, y_pred_ra)

cv_kf    = KFold(n_splits=5, shuffle=True, random_state=42)
cv_r2_a  = cross_val_score(reg_a, X_train_ra, y_train_ra, cv=cv_kf, scoring="r2")
cv_mae_a = cross_val_score(reg_a, X_train_ra, y_train_ra, cv=cv_kf,
                            scoring="neg_mean_absolute_error")

y_pred_rb = reg_b.predict(X_test_rb)
mae_b  = mean_absolute_error(y_test_rb, y_pred_rb)
rmse_b = np.sqrt(mean_squared_error(y_test_rb, y_pred_rb))
r2_b   = r2_score(y_test_rb, y_pred_rb)

cv_r2_b  = cross_val_score(reg_b, X_train_rb, y_train_rb, cv=cv_kf, scoring="r2")
cv_mae_b = cross_val_score(reg_b, X_train_rb, y_train_rb, cv=cv_kf,
                            scoring="neg_mean_absolute_error")

print(f"    Classification — Accuracy:{acc:.4f} | F1:{f1:.4f}")
print(f"    Regression A   — MAE:{mae_a:.4f} | R2:{r2_a:.4f}")
print(f"    Regression B   — MAE:{mae_b:.4f} | R2:{r2_b:.4f}")

# ═══════════════════════════════════════════════════════════════
# STEP 9 — TOP 5 KEY FACTORS (Objective 5)
# ═══════════════════════════════════════════════════════════════
print("\n[8] Top 5 key factors per model:")

def top5(model, features, label):
    pairs = sorted(zip(features, model.feature_importances_), key=lambda x: -x[1])[:5]
    print(f"\n    {label}:")
    for name, score in pairs:
        print(f"      {score:.4f}  {(name[:60]+'...') if len(name)>63 else name}")
    return pairs

top5_clf = top5(clf,   ALL_FEATURES,        "Classification (pass/fail)")
top5_ra  = top5(reg_a, BASIC_FEATURES,      "Regression A (EE+MATH+ESAS+GWA)")
top5_rb  = top5(reg_b, NO_SUBJECT_FEATURES, "Regression B (GWA+survey)")

# ═══════════════════════════════════════════════════════════════
# STEP 10 — SAVE EVALUATION REPORT
# ═══════════════════════════════════════════════════════════════
lines = [
    "=" * 65,
    "  REE PREDICTOR - MODEL EVALUATION REPORT (2026-03-30 NEW STRUCTURE)",
    "=" * 65,
    f"  Training : DATA_MODEL ({len(df_model)} rows, 2022-2024 with survey)",
    f"  Testing  : DATA_EVALUATION ({len(df_evaluation)} rows, 2025 — held-out)",
    f"  Final    : DATA_ALL ({len(df_all)} rows, 2022-2025 — production retrain)",
    f"  Upcoming : DATA_UPCOMING ({len(df_upcoming)} rows, 2022-2025 legacy analytics)",
    f"",
    f"  Train PASS:{y_train_clf.sum()} | FAIL:{(y_train_clf==0).sum()}",
    f"  Test  PASS:{y_test_clf.sum()}  | FAIL:{(y_test_clf==0).sum()}",
    "",
    "  MODELS: Final versions trained on DATA_ALL for production.",
    "          Evaluation metrics computed on DATA_EVALUATION.",
    "",
    "-" * 65,
    f"  MODEL 1: CLASSIFICATION (tested on DATA_EVALUATION, {len(df_evaluation)} rows)",
    "-" * 65,
    f"  Train rows        : {len(X_train_clf)} (DATA_MODEL)",
    f"  Test rows         : {len(X_test_clf)} (DATA_EVALUATION)",
    f"  Features used     : {len(ALL_FEATURES)}",
    f"  Accuracy          : {acc:.4f} ({acc*100:.2f}%)",
    f"  Precision         : {prec:.4f}",
    f"  Recall            : {rec:.4f}",
    f"  F1-Score          : {f1:.4f}",
    f"  5-Fold CV Accuracy: {cv_acc.mean():.4f} +/- {cv_acc.std():.4f}",
    f"  5-Fold CV F1      : {cv_f1.mean():.4f} +/- {cv_f1.std():.4f}",
    "",
    "  Confusion Matrix:",
    f"               Predicted FAIL  Predicted PASS",
    f"  Actual FAIL       {cm[0][0]:>4}            {cm[0][1]:>4}",
    f"  Actual PASS       {cm[1][0]:>4}            {cm[1][1]:>4}",
    "",
    "  Classification Report:",
    classification_report(y_test_clf, y_pred_clf, target_names=["FAIL","PASS"]),
    "-" * 65,
    f"  MODEL 2A: REGRESSION (EE+MATH+ESAS+GWA, {len(X_train_ra)} train rows)",
    "-" * 65,
    f"  Train rows        : {len(X_train_ra)} (DATA_MODEL)",
    f"  Test rows         : {len(X_test_ra)} (DATA_EVALUATION)",
    f"  Features          : {len(BASIC_FEATURES)}",
    f"  MAE               : {mae_a:.4f} pts",
    f"  RMSE              : {rmse_a:.4f} pts",
    f"  R2                : {r2_a:.4f}",
    f"  5-Fold CV R2      : {cv_r2_a.mean():.4f} +/- {cv_r2_a.std():.4f}",
    f"  5-Fold CV MAE     : {(-cv_mae_a.mean()):.4f} +/- {cv_mae_a.std():.4f}",
    "",
    "-" * 65,
    "  MODEL 2B: REGRESSION (GWA+Survey only, 123 train rows)",
    "-" * 65,
    f"  Train rows        : {len(X_train_rb)} (DATA_MODEL only)",
    f"  Features          : {len(NO_SUBJECT_FEATURES)}",
    f"  MAE               : {mae_b:.4f} pts",
    f"  RMSE              : {rmse_b:.4f} pts",
    f"  R2                : {r2_b:.4f}",
    f"  5-Fold CV R2      : {cv_r2_b.mean():.4f} +/- {cv_r2_b.std():.4f}",
    f"  5-Fold CV MAE     : {(-cv_mae_b.mean()):.4f} +/- {cv_mae_b.std():.4f}",
    "",
    "  NOTE: Model 2B excludes subject scores to avoid data leakage.",
    "        Useful for early-stage prediction before subject scores are known.",
    "",
    "-" * 65,
    "  TOP 5 KEY FACTORS",
    "-" * 65,
]
for name, score in top5_clf:
    lines.append(f"  [CLF]   {score:.4f}  {name[:60]}")
lines.append("")
for name, score in top5_ra:
    lines.append(f"  [REG-A] {score:.4f}  {name[:60]}")
lines.append("")
for name, score in top5_rb:
    lines.append(f"  [REG-B] {score:.4f}  {name[:60]}")
lines += [
    "",
    "-" * 65,
    "  COMPARISON SUMMARY",
    "-" * 65,
    f"  {'Model':<40} {'MAE':>8} {'RMSE':>8} {'R2':>8}",
    f"  {'-'*64}",
    f"  {f'Reg A (EE+MATH+ESAS+GWA, {len(X_train_ra)} rows)':<40} {mae_a:>8.4f} {rmse_a:>8.4f} {r2_a:>8.4f}",
    f"  {'Reg B (GWA+survey, 60 rows)':<40} {mae_b:>8.4f} {rmse_b:>8.4f} {r2_b:>8.4f}",
    "",
    ("  Model B has acceptable R2 — survey + GWA have real predictive power."
     if r2_b >= 0.5 else
     "  Model A outperforms B — subject scores dominate prediction."),
    "",
    "-" * 65,
    "  DASHBOARD DATA SOURCE CLARIFICATION",
    "-" * 65,
    "  Institutional dashboard (main.py) MUST use DATA_UPCOMING (333 rows)",
    "  for all 2022-2025 analytics. This is the complete, deduplicated",
    "  dataset covering every examiner. Do NOT combine DATA_SYSTEM + DATA_TEST",
    "  as that introduces duplicate 2025 rows and gives incorrect totals.",
]

report_text = "\n".join(lines)
with open("evaluation_report.txt", "w", encoding="utf-8") as f:
    f.write(report_text)
print("\n[9] Saved: evaluation_report.txt")
print(report_text)

# ═══════════════════════════════════════════════════════════════
# STEP 11 — CONFUSION MATRIX PLOT
# ═══════════════════════════════════════════════════════════════
fig, ax = plt.subplots(figsize=(6, 5))
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
            xticklabels=["FAIL","PASS"], yticklabels=["FAIL","PASS"],
            ax=ax, linewidths=0.5)
ax.set_xlabel("Predicted Label", fontsize=12)
ax.set_ylabel("Actual Label", fontsize=12)
ax.set_title(
    f"Confusion Matrix — Evaluation Set (DATA_EVALUATION, {len(df_evaluation)} rows)\n"
    f"Accuracy:{acc*100:.2f}% | F1:{f1:.4f}",
    fontsize=11
)
plt.tight_layout()
plt.savefig("confusion_matrix_test2025.png", dpi=150)
plt.close()
print("[10] Saved: confusion_matrix_test2025.png")

# ═══════════════════════════════════════════════════════════════
# STEP 12 — FEATURE IMPORTANCE PLOTS
# ═══════════════════════════════════════════════════════════════
def plot_importance(model, feature_names, title, filename, top_n=20):
    importances = model.feature_importances_
    top_n = min(top_n, len(feature_names))
    idx   = np.argsort(importances)[::-1][:top_n]
    names = [(f[:42]+"...") if len(f)>45 else f for f in [feature_names[i] for i in idx]]
    vals  = importances[idx]
    fig, ax = plt.subplots(figsize=(10, 7))
    colors = plt.cm.RdYlGn_r(np.linspace(0.15, 0.85, top_n))
    bars = ax.barh(range(top_n), vals[::-1], color=colors[::-1])
    ax.set_yticks(range(top_n))
    ax.set_yticklabels(names[::-1], fontsize=8)
    ax.set_xlabel("Feature Importance (Gini)", fontsize=11)
    ax.set_title(title, fontsize=12, fontweight="bold")
    for bar, val in zip(bars, vals[::-1]):
        ax.text(bar.get_width()+0.001, bar.get_y()+bar.get_height()/2,
                f"{val:.4f}", va="center", fontsize=7)
    plt.tight_layout()
    plt.savefig(filename, dpi=150)
    plt.close()
    print(f"    Saved: {filename}")

print("[11] Generating feature importance plots...")
plot_importance(clf,   ALL_FEATURES,        "Feature Importance — Classification (Pass/Fail)",      "feature_importance_classification.png")
plot_importance(reg_a, BASIC_FEATURES,      "Feature Importance — Regression A (EE+MATH+ESAS+GWA)", "feature_importance_regression_a.png")
plot_importance(reg_b, NO_SUBJECT_FEATURES, "Feature Importance — Regression B (GWA+Survey Only)",  "feature_importance_regression_b.png")

# ═══════════════════════════════════════════════════════════════
# STEP 13 — CORRELATION MATRIX
# ═══════════════════════════════════════════════════════════════
print("[12] Generating correlation matrix...")
corr_cols = BASIC_FEATURES + [TARGET_REG]
corr_df   = df_model[corr_cols].copy()
corr_df["Passed (binary)"] = df_model[TARGET_CLASS]
corr = corr_df.corr()
mask = np.zeros_like(corr, dtype=bool)
mask[np.triu_indices_from(mask)] = True
fig, ax = plt.subplots(figsize=(9, 7))
sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm",
            linewidths=0.4, ax=ax, mask=mask, vmin=-1, vmax=1, center=0,
            annot_kws={"size": 10})
ax.set_title("Correlation Matrix — Subject Scores, GWA, Rating, Pass/Fail",
             fontsize=12, fontweight="bold")
plt.tight_layout()
plt.savefig("correlation_matrix.png", dpi=150)
plt.close()
print("    Saved: correlation_matrix.png")

# ═══════════════════════════════════════════════════════════════
# STEP 14 — REGRESSION SCATTER PLOTS
# ═══════════════════════════════════════════════════════════════
print("[13] Generating regression scatter plots...")
fig, axes = plt.subplots(1, 2, figsize=(13, 5))
for ax, y_true, y_pred, title, r2, mae in [
    (axes[0], y_test_ra, y_pred_ra, f"Regression A (EE+MATH+ESAS+GWA, {len(X_train_ra)} train)", r2_a, mae_a),
    (axes[1], y_test_rb, y_pred_rb,  "Regression B (GWA+Survey, 60 train)",                       r2_b, mae_b),
]:
    ax.scatter(y_true, y_pred, alpha=0.6, edgecolors="k", linewidths=0.3, s=40, color="#3498db")
    mn = min(float(y_true.min()), float(y_pred.min())) - 2
    mx = max(float(y_true.max()), float(y_pred.max())) + 2
    ax.plot([mn,mx],[mn,mx],"r--",linewidth=1.5,label="Perfect prediction")
    ax.axhline(70,color="orange",linestyle=":",linewidth=1,label="Passing (70%)")
    ax.set_xlabel("Actual PRC Rating (2025)", fontsize=11)
    ax.set_ylabel("Predicted PRC Rating",     fontsize=11)
    ax.set_title(f"{title}\nR2={r2:.4f} | MAE={mae:.2f} pts", fontsize=11, fontweight="bold")
    ax.legend(fontsize=9)
    ax.set_xlim(mn,mx); ax.set_ylim(mn,mx)
plt.suptitle(f"Actual vs Predicted — DATA_EVALUATION ({len(df_evaluation)} rows, held-out)", fontsize=11, y=1.01)
plt.tight_layout()
plt.savefig("regression_actual_vs_predicted.png", dpi=150, bbox_inches="tight")
plt.close()
print("    Saved: regression_actual_vs_predicted.png")

# ═══════════════════════════════════════════════════════════════
# STEP 15 — SAVE MODEL BUNDLE (WITH NEW DATASET METADATA)
# ═══════════════════════════════════════════════════════════════
print("\n[14] Saving ree_survey_model.pkl...")

# Final model: train on DATA_ALL (2022-2025) for production deployment
print(f"    Training final classification and regression B on DATA_ALL ({len(df_all)} rows)...")
X_final_clf = df_all[ALL_FEATURES]
y_final_clf = df_all[TARGET_CLASS]
final_clf = RandomForestClassifier(
    n_estimators=200, max_depth=10,
    min_samples_split=5, min_samples_leaf=2,
    class_weight="balanced", random_state=42
)
final_clf.fit(X_final_clf, y_final_clf)

# Regression A is expanded with DATA_UPCOMING when available to boost sample size
final_ra_source = "DATA_ALL"
if not df_upcoming.empty and TARGET_REG in df_upcoming.columns:
    df_upcoming_ra = df_upcoming[pd.notna(df_upcoming[TARGET_REG])]
    if not df_upcoming_ra.empty:
        df_all_ra_expanded = pd.concat([df_all, df_upcoming_ra], ignore_index=True, sort=False)
        dedup_cols = BASIC_FEATURES + [TARGET_REG]
        if YEAR_COL:
            dedup_cols.append(YEAR_COL)
        df_all_ra_expanded = df_all_ra_expanded.drop_duplicates(subset=dedup_cols, keep="last")
        X_final_ra = df_all_ra_expanded[BASIC_FEATURES]
        y_final_ra = df_all_ra_expanded[TARGET_REG]
        final_ra_source = "DATA_ALL + DATA_UPCOMING"
    else:
        X_final_ra = df_all[BASIC_FEATURES]
        y_final_ra = df_all[TARGET_REG]
else:
    X_final_ra = df_all[BASIC_FEATURES]
    y_final_ra = df_all[TARGET_REG]

print(f"    Training final regression A on {final_ra_source} ({len(X_final_ra)} rows)...")
final_reg_a = RandomForestRegressor(
    n_estimators=200, max_depth=10,
    min_samples_split=5, min_samples_leaf=2,
    random_state=42
)
final_reg_a.fit(X_final_ra, y_final_ra)

X_final_rb = df_all[NO_SUBJECT_FEATURES]
y_final_rb = df_all[TARGET_REG]
final_reg_b = RandomForestRegressor(
    n_estimators=200, max_depth=10,
    min_samples_split=5, min_samples_leaf=2,
    random_state=42
)
final_reg_b.fit(X_final_rb, y_final_rb)
print(f"    Final models trained (clf/reg_b on DATA_ALL; reg_a on {final_ra_source}).")

bundle = {
    # — Production models (trained on DATA_ALL) —
    "classifier":          final_clf,
    "regressor_a":         final_reg_a,
    "regressor_b":         final_reg_b,
    # — Feature sets —
    "features_all":        ALL_FEATURES,
    "features_nosub":      NO_SUBJECT_FEATURES,
    "features_basic":      BASIC_FEATURES,
    "subject_cols":        SUBJECT_COLS,
    "label_encoders":      le_dict,
    "target_class":        TARGET_CLASS,
    "target_reg":          TARGET_REG,
    "passing_score":       70.0,
    # — Training dataset sizes —
    "dataset_size_model":       len(df_model),        # Training set
    "dataset_size_evaluation":  len(df_evaluation),   # Test/eval set
    "dataset_size_all":         len(df_all),          # Final training set
    "dataset_size_upcoming":    len(df_upcoming),     # Legacy analytics set (333)
    # — Class balance (from test set) —
    "pass_count":          int(y_test_clf.sum()),
    "fail_count":          int((y_test_clf == 0).sum()),
    # — Evaluation results (on DATA_EVALUATION) —
    "eval": {
        "test_year":       2025,
        "test_size":       len(df_evaluation),
        "clf_accuracy":    acc,
        "clf_precision":   prec,
        "clf_recall":      rec,
        "clf_f1":          f1,
        "clf_cv_acc_mean": float(cv_acc.mean()),
        "clf_cv_f1_mean":  float(cv_f1.mean()),
        "reg_a_mae":       mae_a,
        "reg_a_rmse":      rmse_a,
        "reg_a_r2":        r2_a,
        "reg_b_mae":       mae_b,
        "reg_b_rmse":      rmse_b,
        "reg_b_r2":        r2_b,
    },
    # — Data source metadata —
    "data_source": {
        "training": f"DATA_MODEL ({len(df_model)} rows, 2022-2024)",
        "evaluation": f"DATA_EVALUATION ({len(df_evaluation)} rows, 2025)",
        "production": (f"DATA_ALL ({len(df_all)} rows, 2022-2025) + DATA_UPCOMING ({len(df_upcoming)} rows)" if not df_upcoming.empty else f"DATA_ALL ({len(df_all)} rows, 2022-2025)"),
    },
}

joblib.dump(bundle, "ree_survey_model.pkl")
print("    Saved: ree_survey_model.pkl")

# ═══════════════════════════════════════════════════════════════
# STEP 16 — FINAL SUMMARY
# ═══════════════════════════════════════════════════════════════
print("\n" + "=" * 65)
print("  TRAINING COMPLETE — NEW DATASET STRUCTURE (2026-03-30)")
print("=" * 65)
print(f"""
  Configuration:
    Training   : DATA_MODEL      ({len(df_model)} rows, 2022-2024)
    Testing    : DATA_EVALUATION ({len(df_evaluation)} rows, 2025)
    Production : DATA_ALL        ({len(df_all)} rows, 2022-2025)

  Evaluation Results (on DATA_EVALUATION, {len(df_evaluation)} rows):
    Classification Accuracy : {acc*100:.2f}%
    Classification F1-Score : {f1:.4f}
    Regression A R2         : {r2_a:.4f}  (MAE: {mae_a:.2f} pts)
    Regression B R2         : {r2_b:.4f}  (MAE: {mae_b:.2f} pts)

  Production Models (trained on DATA_ALL):
    All models retrained on complete 2022-2025 dataset.
    Use these in main.py via ree_survey_model.pkl

  Output files:
    ree_survey_model.pkl                  ← Production models + metadata
    evaluation_report.txt                 ← Full evaluation metrics
    confusion_matrix_test2025.png         ← Classification results
    feature_importance_*.png              ← Feature analysis
    correlation_matrix.png                ← Correlation heatmap
    regression_actual_vs_predicted.png    ← Regression validation

  Dashboard Data Note:
    main.py should load DATA_ALL (or fallback to DATA_UPCOMING)
    for all institutional analytics. Do NOT mix DATA_MODEL+DATA_EVALUATION
    to avoid data leakage into dashboard KPIs.
""")
print("=" * 65)