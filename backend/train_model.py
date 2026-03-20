"""
train_model.py — REE Licensure Exam Predictor (SLSU)
=====================================================

DATA ARCHITECTURE
-----------------
DATA_MODEL.xlsx   60 rows, 98 cols, 2022-2025
                  EE + MATH + ESAS + GWA + full survey + PRC result
                  → PRIMARY training source (has survey answers)

DATA_SYSTEM.xlsx  250 rows, 8 cols, 2022-2024
                  EE + MATH + ESAS + GWA + PRC result, NO survey
                  → Boosts Regression A to 310 training rows
                  → Powers professor dashboard analytics (main.py)

DATA_TEST.xlsx    83 rows, 96 cols, 2025 only
                  EE + MATH + ESAS + GWA + full survey + PRC result
                  → HELD-OUT evaluation set (never seen during training)

DATA_UPCOMING.xlsx  276 rows, survey only, NO subject scores yet
                  → Used by /predict for 2026 students at runtime
                  → NOT used here in training

TRAINING STRATEGY
-----------------
Classification    train=DATA_MODEL(60),  test=DATA_TEST(83), features=ALL_FEATURES
Regression A      train=DATA_MODEL+DATA_SYSTEM(310), test=DATA_TEST(83), features=BASIC_FEATURES
Regression B      train=DATA_MODEL(60),  test=DATA_TEST(83), features=NO_SUBJECT_FEATURES
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use("Agg")
import seaborn as sns
import joblib
import warnings
warnings.filterwarnings("ignore")

from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import StratifiedKFold, KFold, cross_val_score
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report,
    mean_absolute_error, mean_squared_error, r2_score
)
from sklearn.preprocessing import LabelEncoder

# ─────────────────────────────────────────────
# FILE PATHS
# ─────────────────────────────────────────────
FILE_MODEL  = "DATA_MODEL.xlsx"
FILE_SYSTEM = "DATA_SYSTEM.xlsx"
FILE_TEST   = "DATA_TEST.xlsx"

TARGET_CLASS = "PASSED / FAILED-RETAKE"
TARGET_REG   = "TOTAL RATING"
SUBJECT_COLS = ["EE", "MATH", "ESAS"]

print("=" * 65)
print("  REE LICENSURE EXAM PREDICTOR — MODEL TRAINING")
print("=" * 65)

# ═══════════════════════════════════════════════════════════════
# STEP 1 — LOAD RAW FILES
# ═══════════════════════════════════════════════════════════════
print(f"\n[1] Loading data files...")
df_model  = pd.read_excel(FILE_MODEL,  sheet_name=0)
df_system = pd.read_excel(FILE_SYSTEM, sheet_name=0)
df_test   = pd.read_excel(FILE_TEST,   sheet_name=0)

for df in [df_model, df_system, df_test]:
    df.columns = df.columns.str.strip()

print(f"    DATA_MODEL  : {len(df_model)} rows x {len(df_model.columns)} cols")
print(f"    DATA_SYSTEM : {len(df_system)} rows x {len(df_system.columns)} cols")
print(f"    DATA_TEST   : {len(df_test)} rows x {len(df_test.columns)} cols  <- eval only")

# ───────────────────────────────────────────────────────────────
# STEP 1.5 — EXCLUDE 2025 ROWS FROM DATA_MODEL (train only on 2022–2024)
# ───────────────────────────────────────────────────────────────
# We assume DATA_MODEL contains a YEAR column (e.g., "YEAR").
YEAR_COL = next((c for c in ["YEAR", "Year", "year"] if c in df_model.columns), None)
if YEAR_COL:
    def _normalize_year_column(df):
        # Robustly extract a 4-digit year from whatever formatting Excel used.
        if YEAR_COL not in df.columns:
            return df
        df[YEAR_COL] = (
            df[YEAR_COL]
            .astype(str)
            .str.extract(r"(\d{4})")[0]
        )
        df[YEAR_COL] = pd.to_numeric(df[YEAR_COL], errors="coerce")
        return df

    # Ensure YEAR column is numeric in all splits (prevents sklearn dtype issues)
    df_model = _normalize_year_column(df_model)
    df_system = _normalize_year_column(df_system)
    df_test = _normalize_year_column(df_test)

    before = len(df_model)
    df_model = df_model[df_model[YEAR_COL] != 2025]
    print(f"\n[1.5] Excluding 2025 rows from DATA_MODEL using column '{YEAR_COL}'...")
    print(f"    DATA_MODEL rows: {before} -> {len(df_model)} (removed: {before - len(df_model)})")
else:
    print("\n[1.5] WARNING: No YEAR column found in DATA_MODEL; cannot exclude 2025 rows.")

# ═══════════════════════════════════════════════════════════════
# STEP 2 — ENCODE PASS/FAIL TARGET
# ═══════════════════════════════════════════════════════════════
def encode_target(df):
    df[TARGET_CLASS] = (
        df[TARGET_CLASS].astype(str).str.strip().str.upper()
        .map(lambda x: 1 if x == "PASSED" else 0)
    )
    return df

df_model  = encode_target(df_model)
df_system = encode_target(df_system)
df_test   = encode_target(df_test)

# ═══════════════════════════════════════════════════════════════
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

df_model = encode_survey(df_model)
df_test  = encode_survey(df_test)
# DATA_SYSTEM has no survey columns — skip

# ═══════════════════════════════════════════════════════════════
# STEP 4 — FILL MISSING VALUES WITH COLUMN MEDIAN
# ═══════════════════════════════════════════════════════════════
print("[3] Filling missing values with column median...")
for df in [df_model, df_system, df_test]:
    for col in df.select_dtypes(include=[np.number]).columns:
        if df[col].isnull().sum() > 0:
            df[col].fillna(df[col].median(), inplace=True)
print(f"    Nulls remaining — MODEL:{df_model.isnull().sum().sum()}  "
      f"SYSTEM:{df_system.isnull().sum().sum()}  TEST:{df_test.isnull().sum().sum()}")

# ═══════════════════════════════════════════════════════════════
# STEP 5 — BUILD FEATURE SETS
# ═══════════════════════════════════════════════════════════════
print("\n[4] Building feature sets...")

ALL_FEATURES = [
    col for col in df_model.select_dtypes(include=[np.number]).columns
    if col not in [TARGET_CLASS, TARGET_REG]
]
NO_SUBJECT_FEATURES = [c for c in ALL_FEATURES if c not in SUBJECT_COLS]
BASIC_FEATURES = [c for c in ["EE", "MATH", "ESAS", "GWA"] if c in df_model.columns]

print(f"    ALL_FEATURES        : {len(ALL_FEATURES)} cols  (clf + reg-b)")
print(f"    NO_SUBJECT_FEATURES : {len(NO_SUBJECT_FEATURES)} cols  (reg-b only)")
print(f"    BASIC_FEATURES      : {len(BASIC_FEATURES)} cols  (reg-a, combined dataset)")

# ═══════════════════════════════════════════════════════════════
# STEP 6 — ASSEMBLE TRAIN / TEST SPLITS
# ═══════════════════════════════════════════════════════════════
print("\n[5] Assembling train/test sets...")

X_train_clf = df_model[ALL_FEATURES]
y_train_clf = df_model[TARGET_CLASS]
# IMPORTANT: do NOT use df_test[ALL_FEATURES] (strict). Some encoded survey columns
# may exist in DATA_MODEL but not in DATA_TEST, so we align features via reindex.
X_test_clf  = df_test.reindex(columns=ALL_FEATURES, fill_value=0)
y_test_clf  = df_test[TARGET_CLASS]

df_combined = pd.concat(
    [df_model[BASIC_FEATURES + [TARGET_REG]],
     df_system[BASIC_FEATURES + [TARGET_REG]]],
    ignore_index=True
)
X_train_ra = df_combined[BASIC_FEATURES]
y_train_ra = df_combined[TARGET_REG]
# Align features for Regression A as well.
X_test_ra  = df_test.reindex(columns=BASIC_FEATURES, fill_value=0)
y_test_ra  = df_test[TARGET_REG]

X_train_rb = df_model[NO_SUBJECT_FEATURES]
y_train_rb = df_model[TARGET_REG]
# Align features for Regression B.
X_test_rb  = df_test.reindex(columns=NO_SUBJECT_FEATURES, fill_value=0)
y_test_rb  = df_test[TARGET_REG]

print(f"    Classification — train:{len(X_train_clf)} | test:{len(X_test_clf)}")
print(f"    Regression A   — train:{len(X_train_ra)} | test:{len(X_test_ra)}")
print(f"    Regression B   — train:{len(X_train_rb)} | test:{len(X_test_rb)}")
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
print("    Classification — done")

reg_a = RandomForestRegressor(
    n_estimators=200, max_depth=10,
    min_samples_split=5, min_samples_leaf=2,
    random_state=42
)
reg_a.fit(X_train_ra, y_train_ra)
print("    Regression A (310 rows, basic features) — done")

reg_b = RandomForestRegressor(
    n_estimators=200, max_depth=10,
    min_samples_split=5, min_samples_leaf=2,
    random_state=42
)
reg_b.fit(X_train_rb, y_train_rb)
print("    Regression B (60 rows, GWA+survey) — done")

# ═══════════════════════════════════════════════════════════════
# STEP 8 — EVALUATE ON DATA_TEST (2025 held-out)
# ═══════════════════════════════════════════════════════════════
print("\n[7] Evaluating on DATA_TEST (2025 held-out)...")

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
    "  REE PREDICTOR - MODEL EVALUATION REPORT",
    "=" * 65,
    f"  Training : DATA_MODEL ({len(df_model)} rows) + DATA_SYSTEM ({len(df_system)} rows, reg-A)",
    f"  Testing  : DATA_TEST ({len(df_test)} rows, 2025 - completely held out)",
    f"  Train PASS:{y_train_clf.sum()} | FAIL:{(y_train_clf==0).sum()}",
    f"  Test  PASS:{y_test_clf.sum()}  | FAIL:{(y_test_clf==0).sum()}",
    "",
    "-" * 65,
    "  MODEL 1: CLASSIFICATION (tested on 2025 DATA_TEST)",
    "-" * 65,
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
    "  MODEL 2A: REGRESSION (EE+MATH+ESAS+GWA, 310 train rows)",
    "-" * 65,
    f"  Features          : {len(BASIC_FEATURES)}",
    f"  MAE               : {mae_a:.4f} pts",
    f"  RMSE              : {rmse_a:.4f} pts",
    f"  R2                : {r2_a:.4f}",
    f"  5-Fold CV R2      : {cv_r2_a.mean():.4f} +/- {cv_r2_a.std():.4f}",
    f"  5-Fold CV MAE     : {(-cv_mae_a.mean()):.4f} +/- {cv_mae_a.std():.4f}",
    "",
    "-" * 65,
    "  MODEL 2B: REGRESSION (GWA+Survey only, 60 train rows)",
    "-" * 65,
    f"  Features          : {len(NO_SUBJECT_FEATURES)}",
    f"  MAE               : {mae_b:.4f} pts",
    f"  RMSE              : {rmse_b:.4f} pts",
    f"  R2                : {r2_b:.4f}",
    f"  5-Fold CV R2      : {cv_r2_b.mean():.4f} +/- {cv_r2_b.std():.4f}",
    f"  5-Fold CV MAE     : {(-cv_mae_b.mean()):.4f} +/- {cv_mae_b.std():.4f}",
    "",
    "  NOTE: Model 2B excludes subject scores to avoid data leakage.",
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
    f"  {'Model':<35} {'MAE':>8} {'RMSE':>8} {'R2':>8}",
    f"  {'-'*59}",
    f"  {'Reg A (EE+MATH+ESAS+GWA, 310 rows)':<35} {mae_a:>8.4f} {rmse_a:>8.4f} {r2_a:>8.4f}",
    f"  {'Reg B (GWA+survey, 60 rows)':<35} {mae_b:>8.4f} {rmse_b:>8.4f} {r2_b:>8.4f}",
    "",
    ("  Model B has acceptable R2 - survey + GWA have real predictive power."
     if r2_b >= 0.5 else
     "  Model A outperforms B - subject scores dominate prediction."),
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
ax.set_title(f"Confusion Matrix - 2025 Test Set (DATA_TEST)\nAccuracy:{acc*100:.2f}% | F1:{f1:.4f}", fontsize=11)
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
plot_importance(clf,   ALL_FEATURES,        "Feature Importance - Classification (Pass/Fail)",      "feature_importance_classification.png")
plot_importance(reg_a, BASIC_FEATURES,      "Feature Importance - Regression A (EE+MATH+ESAS+GWA)", "feature_importance_regression_a.png")
plot_importance(reg_b, NO_SUBJECT_FEATURES, "Feature Importance - Regression B (GWA+Survey Only)",  "feature_importance_regression_b.png")

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
ax.set_title("Correlation Matrix - Subject Scores, GWA, Rating, Pass/Fail",
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
    (axes[0], y_test_ra, y_pred_ra, "Regression A (EE+MATH+ESAS+GWA)", r2_a, mae_a),
    (axes[1], y_test_rb, y_pred_rb, "Regression B (GWA+Survey)",        r2_b, mae_b),
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
plt.suptitle("Actual vs Predicted - DATA_TEST 2025 (held-out)", fontsize=11, y=1.01)
plt.tight_layout()
plt.savefig("regression_actual_vs_predicted.png", dpi=150, bbox_inches="tight")
plt.close()
print("    Saved: regression_actual_vs_predicted.png")

# ═══════════════════════════════════════════════════════════════
# STEP 15 — SAVE MODEL BUNDLE
# ═══════════════════════════════════════════════════════════════
print("\n[14] Saving ree_survey_model.pkl...")

bundle = {
    "classifier":          clf,
    "regressor_a":         reg_a,
    "regressor_b":         reg_b,
    "features_all":        ALL_FEATURES,
    "features_nosub":      NO_SUBJECT_FEATURES,
    "features_basic":      BASIC_FEATURES,
    "subject_cols":        SUBJECT_COLS,
    "label_encoders":      le_dict,
    "target_class":        TARGET_CLASS,
    "target_reg":          TARGET_REG,
    "passing_score":       70.0,
    "dataset_size":        len(df_model),
    "dataset_size_system": len(df_system),
    "dataset_size_test":   len(df_test),
    "pass_count":          int(y_train_clf.sum()),
    "fail_count":          int((y_train_clf == 0).sum()),
    "eval": {
        "test_year":       2025,
        "test_size":       len(df_test),
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
    }
}

joblib.dump(bundle, "ree_survey_model.pkl")
print("    Saved: ree_survey_model.pkl")

# ═══════════════════════════════════════════════════════════════
# STEP 16 — FINAL SUMMARY
# ═══════════════════════════════════════════════════════════════
print("\n" + "=" * 65)
print("  TRAINING COMPLETE")
print("=" * 65)
print(f"""
  Train : DATA_MODEL ({len(df_model)} rows) + DATA_SYSTEM ({len(df_system)} rows for reg-A)
  Test  : DATA_TEST  ({len(df_test)} rows, 2025 - completely held out)

  Classification  Accuracy : {acc*100:.2f}%
  Classification  F1-Score : {f1:.4f}
  Regression A    R2       : {r2_a:.4f}  (MAE: {mae_a:.2f} pts)
  Regression B    R2       : {r2_b:.4f}  (MAE: {mae_b:.2f} pts)

  Output files:
    ree_survey_model.pkl                 <- loaded by main.py at startup
    evaluation_report.txt                <- Chapter 4 thesis metrics
    confusion_matrix_test2025.png        <- Chapter 4 figure
    feature_importance_classification.png
    feature_importance_regression_a.png
    feature_importance_regression_b.png
    correlation_matrix.png               <- Objectives 4 and 5
    regression_actual_vs_predicted.png

  NOTE: DATA_UPCOMING (2026 students) is NOT used here.
  Those students fill out the survey and send it to /predict at runtime.
""")
print("=" * 65)