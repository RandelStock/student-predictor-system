"""
main.py — FastAPI backend for EE Licensure Predictor
Models loaded from ree_survey_model.pkl:
  - classifier     → Pass/Fail prediction
  - regressor_a    → PRC rating prediction (all features)
  - regressor_b    → PRC rating prediction (GWA + survey only)

Endpoints:
  POST /predict               → individual student prediction
  POST /ai-recommend          → Groq AI section recommendations
  GET  /analytics             → institutional dashboard data (merged 333 rows)
  GET  /model-info            → model evaluation metrics
  GET  /correlation           → Pearson correlation matrix
  GET  /admin/attempts        → paginated prediction attempts from DB
  GET  /admin/monthly-summary → monthly pass/fail summary from DB
  GET  /admin/pass-fail-by-year → yearly pass/fail from DB
  GET  /admin/trend-stats     → year-over-year trend stats from DB
  GET  /admin/trend-insights  → Groq AI summary of trends
  GET  /health                → health check
"""

from fastapi import FastAPI, HTTPException, status, Depends
from typing import Generator
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, Field, field_validator
from typing import Literal, Optional
import re
import joblib
import numpy as np
import pandas as pd
import os
from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from sqlalchemy import extract, func, case
from groq import Groq

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from database import init_db, save_prediction, get_database_url, get_session, User, PredictionAttempt, RecommendationsCache
import json

# ══════════════════════════════════════════════════════════════════════════════
# AUTH CONFIG
# ══════════════════════════════════════════════════════════════════════════════

SECRET_KEY = os.environ.get("EE_PREDICTOR_SECRET_KEY", "CHANGE_ME_TO_A_LONG_RANDOM_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI DB dependency that guarantees connections are released.
    The previous implementation returned a Session without closing it,
    which can exhaust the SQLAlchemy connection pool under load.
    """
    session = get_session()
    if session is None:
        raise HTTPException(status_code=500, detail="Database not configured")
    try:
        yield session
    finally:
        try:
            session.close()
        except Exception:
            pass


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: Optional[str] = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


app = FastAPI(title="EE Licensure Predictor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ══════════════════════════════════════════════════════════════════════════════
# LOAD MODEL BUNDLE
# ══════════════════════════════════════════════════════════════════════════════

try:
    bundle         = joblib.load("ree_survey_model.pkl")
    classifier     = bundle["classifier"]
    regressor_a    = bundle["regressor_a"]
    regressor_b    = bundle["regressor_b"]
    FEATURES_ALL   = bundle["features_all"]
    FEATURES_BASIC = bundle["features_basic"]
    FEATURES_NOSUB = bundle["features_nosub"]
    SUBJECT_COLS   = bundle["subject_cols"]
    PASSING_SCORE  = bundle["passing_score"]
    EVAL           = bundle["eval"]
    LABEL_ENCODERS = bundle.get("label_encoders", {})
    print("Model bundle loaded OK")
    print(f"  Classification accuracy:  {EVAL['clf_accuracy']*100:.2f}%")
    print(f"  Regression A R2:          {EVAL['reg_a_r2']:.4f}")
    print(f"  Regression B R2:          {EVAL['reg_b_r2']:.4f}")
    print(f"  Features (all):           {len(FEATURES_ALL)}")
    print(f"  Features (no subject):    {len(FEATURES_NOSUB)}")
except Exception as e:
    raise RuntimeError(f"Could not load ree_survey_model.pkl: {e}")

# ══════════════════════════════════════════════════════════════════════════════
# DATABASE
# ══════════════════════════════════════════════════════════════════════════════
if init_db():
    print("Database: connected (tables created/verified)")
else:
    print("Database: DATABASE_URL not set — predictions will not be persisted")

# ══════════════════════════════════════════════════════════════════════════════
# ANALYTICS FILE PATHS
# Data strategy:
#   DATA_SYSTEM (250 rows, 2022-2024) + DATA_TEST (83 rows, 2025) = 333 examinees
#   DATA_MODEL  (60 rows, 2022-2024) + DATA_TEST (83 rows, 2025)  = survey analyses
# ══════════════════════════════════════════════════════════════════════════════

FILE_MODEL  = "DATA_MODEL.xlsx"   # 60 rows, 2022-2024, full survey
FILE_SYSTEM = "DATA_SYSTEM.xlsx"  # 250 rows, 2022-2024, no survey
FILE_TEST   = "DATA_TEST.xlsx"    # 83 rows, 2025, full survey

COL_PASSED       = "PASSED / FAILED-RETAKE"
COL_TOTAL_RATING = "TOTAL RATING"
COL_YEAR         = "YEAR"
COL_GWA          = "GWA"
COL_STRAND       = "Senior High School Strand"
COL_REVIEW       = "I attended a formal board review program."
COL_DURATION     = "If YES, what was the duration of my board review?"

SURVEY_SECTIONS = {
    "Knowledge": [
        "1.  I have a strong foundation in mathematics required for Electrical Engineering.",
        "2.  I understand fundamental concepts in circuit analysis, including DC and AC circuits.",
        "3. I understand the principles of electrical machines such as transformers, motors, and generators.",
        "4. I have sufficient understanding of power systems, including generation, transmission, and distribution.",
        "5.  I understand basic concepts in electronics relevant to the EE licensure examination.",
        "6.  I am familiar with electrical laws and theories (e.g., Ohm's Law, Kirchhoff's Laws).",
        "7. I can recall important formulas and principles needed in the EE licensure examination.",
        "8.  My undergraduate Electrical Engineering subjects adequately covered the topics included in the licensure exam.",
        "9.   I understand how theoretical concepts are applied to real-world electrical engineering problems.",
        "10.  I am familiar with common terminologies and symbols used in Electrical Engineering problems.",
        "11.  I can interpret technical diagrams, schematics, and circuit layouts accurately.",
        "12.  I understand the scope and coverage of the Electrical Engineering Licensure Examination.",
    ],
    "Problem Solving": [
        "1.  I can analyze complex Electrical Engineering problems logically and systematically.",
        "2.  I can identify given data and required outputs in EE problem statements.",
        "3.  I can select the appropriate formula or method to solve Electrical Engineering problems.",
        "4.  I can apply engineering principles to unfamiliar or non-routine problems.",
        "5.  I can solve Electrical Engineering board-type problems within a limited time.",
        "6.  I can break down complex problems into simpler, manageable steps.",
        "7.  I can verify whether my computed answers are reasonable.",
        "8.  I can handle multi-step computational problems effectively.",
        "9.  I can solve problems accurately under time pressure.",
        "10.  I am confident in answering computational questions in the EE licensure examination.",
        "11.  I am confident in answering analytical and conceptual questions in the EE licensure examination.",
        "12. I can apply problem-solving strategies learned during review sessions and practice exams.",
    ],
    "Motivation": [
        "1.  I was strongly motivated to pass the Electrical Engineering Licensure Examination.",
        "2.  Becoming a licensed Electrical Engineer was one of my personal academic or career goals.",
        "3.  I set clear and realistic goals during my board examination preparation.",
        "4.  I consistently followed a planned study schedule throughout the review period.",
        "5.  I managed my daily study time effectively.",
        "6.  I remained disciplined in avoiding distractions while studying.",
        "7.  I monitored my progress and adjusted my study strategies when difficulties arose.",
        "8.  I remained committed to my review activities even when topics were challenging.",
    ],
    "Mental Health": [
        "1.  I was able to manage stress and anxiety during the review period.",
        "2.  I felt mentally prepared to take the Electrical Engineering Licensure Examination.",
        "3.  I remained calm when answering practice tests and mock examinations.",
        "4.  I maintained good physical health during my board exam preparation.",
        "5.  I had sufficient sleep while preparing for the licensure examination.",
        "6.  I was able to balance review, rest, and personal activities effectively.",
        "7.  I remained mentally focused during long study sessions.",
        "8.  I maintained a positive and confident mindset as the examination date approached.",
    ],
    "Support": [
        "1. I received emotional support from my family during my board exam preparation.",
        "2.  My family encouraged and motivated me to continue preparing for the EELE.",
        "3.  I received academic or moral support from peers or fellow reviewees.",
        "4.  Studying with peers positively influenced my motivation or understanding of topics.",
        "5.  I had access to sufficient financial resources during my review period.",
        "6.  I had access to necessary review materials and learning resources.",
        "7.  My study environment was quiet and conducive to effective learning.",
        "8.  I had reliable access to electricity, internet, and other essential study tools",
    ],
    "Curriculum": [
        "1.  The Electrical Engineering curriculum of SLSU is aligned with the content and scope of the Electrical Engineering Licensure Examination.",
        "2.  Core Electrical Engineering subjects adequately prepared me for licensure-type questions.",
        "3.  Course syllabi clearly reflected topics relevant to the EE licensure examination",
        "4.  Instruction in major Electrical Engineering subjects emphasized both theory and problem-solving.",
        "5.  The sequence of EE subjects in the curriculum supported progressive learning of licensure topics.",
    ],
    "Faculty": [
        "1.  Faculty members in the Electrical Engineering Department demonstrated strong mastery of the subjects they taught.",
        "2.  Instructors effectively explained complex Electrical Engineering concepts",
        "3.  Faculty members provided problem-solving techniques relevant to board examinations.",
        "4.  Instructors encouraged critical thinking and analytical skills in class.",
        "5.  Faculty members were accessible for academic consultation and clarification.",
    ],
    "Dept Review": [
        "1.  The Electrical Engineering Department provided review sessions or activities relevant to the EE licensure examination.",
        "2.  Department-organized reviews helped reinforce my understanding of major EE topics.",
        "3. Mock examinations or practice tests provided by the department reflected actual board exam difficulty.",
        "4.  Academic support activities (e.g., tutorials, refresher courses) contributed to my board exam readiness.",
        "5. The timing of departmental review activities was appropriate for board exam preparation.",
    ],
    "Facilities": [
        "1.  The department provided adequate learning resources (e.g., textbooks, reference materials, and laboratories).",
        "2.  Laboratory facilities supported my understanding of theoretical Electrical Engineering concepts.",
        "3. Access to computers, software, and technical tools enhanced my learning experience.",
        "4. The availability of departmental learning resources supported my licensure exam preparation.",
        "5. Department facilities were conducive to learning and academic engagement.",
    ],
    "Inst. Culture": [
        "1.  The Electrical Engineering Department promoted a culture of academic excellence and board exam readiness.",
        "2.  The department encouraged students to aim for high performance in the licensure examination.",
        "3. Faculty members motivated students to pursue professional licensure.",
        "4. The department provided guidance regarding the licensure examination process and requirements.",
        "5. The institutional support of the Electrical Engineering Department positively influenced my preparation for the EE licensure examination.",
    ],
}

QUESTION_SHORT_LABELS = {
    "1.  The Electrical Engineering curriculum of SLSU is aligned with the content and scope of the Electrical Engineering Licensure Examination.":
        ("CU1", "Curriculum aligned with EE licensure exam", "Curriculum"),
    "3.  Course syllabi clearly reflected topics relevant to the EE licensure examination":
        ("CU3", "Syllabi aligned with board exam", "Curriculum"),
    "1.  The Electrical Engineering Department provided review sessions or activities relevant to the EE licensure examination.":
        ("DR1", "Dept conducted review programs", "Dept Review"),
    "3. Mock examinations or practice tests provided by the department reflected actual board exam difficulty.":
        ("DR3", "Mock exams reflected actual board difficulty", "Dept Review"),
    "5. The timing of departmental review activities was appropriate for board exam preparation.":
        ("DR5", "Review conducted at right time before exam", "Dept Review"),
    "1.  The department provided adequate learning resources (e.g., textbooks, reference materials, and laboratories).":
        ("FA1", "Library had adequate review resources", "Facilities"),
    "2.  Laboratory facilities supported my understanding of theoretical Electrical Engineering concepts.":
        ("FA2", "Labs equipped for practical learning", "Facilities"),
    "4. The availability of departmental learning resources supported my licensure exam preparation.":
        ("FA4", "Dept resources supported exam prep", "Facilities"),
    "8.  My undergraduate Electrical Engineering subjects adequately covered the topics included in the licensure exam.":
        ("KN8", "Subjects covered board exam topics", "Knowledge"),
    "4. The department provided guidance regarding the licensure examination process and requirements.":
        ("IC4", "Institution provides career guidance", "Inst. Culture"),
}


# ══════════════════════════════════════════════════════════════════════════════
# DATA LOADING HELPERS
# ══════════════════════════════════════════════════════════════════════════════

def _normalise_year(df: pd.DataFrame) -> pd.DataFrame:
    """Extract 4-digit year from whatever format Excel stored it in."""
    col = next((c for c in ["YEAR", "Year", "year"] if c in df.columns), None)
    if col:
        df[col] = (
            df[col].astype(str)
            .str.extract(r"(\d{4})")[0]
        )
        df[col] = pd.to_numeric(df[col], errors="coerce")
        df = df[df[col].notna() & (df[col] > 0)]
        df[col] = df[col].astype(int)
        if col != COL_YEAR:
            df = df.rename(columns={col: COL_YEAR})
    return df


def _normalise_passed(df: pd.DataFrame) -> pd.DataFrame:
    if COL_PASSED in df.columns:
        df[COL_PASSED] = df[COL_PASSED].astype(str).str.strip().str.upper()
        df["passed"] = df[COL_PASSED].apply(lambda x: 1 if "PASS" in x else 0)
    return df


def _load_main_df() -> pd.DataFrame:
    """
    250 rows DATA_SYSTEM (2022-2024) + 83 rows DATA_TEST (2025) = 333 rows.
    Used for all overview/KPI/year-trend calculations.
    """
    frames = []
    for path, label in [(FILE_SYSTEM, "system"), (FILE_TEST, "test")]:
        try:
            d = pd.read_excel(path, sheet_name=0)
            d.columns = d.columns.str.strip()
            d["_source"] = label
            frames.append(d)
        except Exception as e:
            print(f"[analytics] Could not load {path}: {e}")
    if not frames:
        raise RuntimeError("No data files could be loaded for analytics.")
    df = pd.concat(frames, ignore_index=True, sort=False)
    df = _normalise_year(df)
    df = _normalise_passed(df)
    return df


def _load_survey_df() -> pd.DataFrame:
    """
    60 rows DATA_MODEL (2022-2024) + 83 rows DATA_TEST (2025) = 143 rows.
    Used only for survey-based analyses (section_scores, weakest_questions).
    """
    frames = []
    for path in [FILE_MODEL, FILE_TEST]:
        try:
            d = pd.read_excel(path, sheet_name=0)
            d.columns = d.columns.str.strip()
            frames.append(d)
        except Exception as e:
            print(f"[survey] Could not load {path}: {e}")
    if not frames:
        return pd.DataFrame()
    df = pd.concat(frames, ignore_index=True, sort=False)
    df = _normalise_year(df)
    df = _normalise_passed(df)
    return df


# ══════════════════════════════════════════════════════════════════════════════
# HELPERS
# ══════════════════════════════════════════════════════════════════════════════

def build_feature_vector(req, feature_list: list) -> np.ndarray:
    row = {}
    row["EE"]   = req.EE
    row["MATH"] = req.MATH
    row["ESAS"] = req.ESAS
    row["GWA"]  = req.GWA

    strand_map = {"STEM": 4, "TVL": 5, "GAS": 1, "HUMSS": 2, "ABM": 0}
    row["shs_strand_encoded"] = strand_map.get(req.Senior_High_School_Strand, 1)

    yes_no_map = {
        "My Senior High School background adequately prepared me for engineering subjects in college.":
            1 if req.SHS_Prepared == "Yes" else 0,
        "Electrical Engineering was my first choice of degree program.":
            1 if req.EE_First_Choice == "Yes" else 0,
        "My college education sufficiently prepare me for the EE licensure examination?":
            1 if req.College_Prepared == "Yes" else 0,
        "I attended a formal board review program.":
            1 if req.Review_Program == "Yes" else 0,
        "I followed a consistent and structured study schedule during my review period.":
            1 if req.Study_Schedule == "Yes" else 0,
        "I utilized various learning resources (review handouts, textbooks, online materials).":
            1 if req.Used_Resources == "Yes" else 0,
    }
    row.update(yes_no_map)

    row["My General Weighted Average (GWA) reflects my mastery of Electrical Engineering concepts. [RATE]"] = req.GWA_Reflection
    row["If YES, what was the duration of my board review?"] = req.Review_Duration

    survey_map = {
        "1.  I have a strong foundation in mathematics required for Electrical Engineering.": req.KN1,
        "2.  I understand fundamental concepts in circuit analysis, including DC and AC circuits.": req.KN2,
        "3. I understand the principles of electrical machines such as transformers, motors, and generators.": req.KN3,
        "4. I have sufficient understanding of power systems, including generation, transmission, and distribution.": req.KN4,
        "5.  I understand basic concepts in electronics relevant to the EE licensure examination.": req.KN5,
        "6.  I am familiar with electrical laws and theories (e.g., Ohm's Law, Kirchhoff's Laws).": req.KN6,
        "7. I can recall important formulas and principles needed in the EE licensure examination.": req.KN7,
        "8.  My undergraduate Electrical Engineering subjects adequately covered the topics included in the licensure exam.": req.KN8,
        "9.   I understand how theoretical concepts are applied to real-world electrical engineering problems.": req.KN9,
        "10.  I am familiar with common terminologies and symbols used in Electrical Engineering problems.": req.KN10,
        "11.  I can interpret technical diagrams, schematics, and circuit layouts accurately.": req.KN11,
        "12.  I understand the scope and coverage of the Electrical Engineering Licensure Examination.": req.KN12,
        "1.  I can analyze complex Electrical Engineering problems logically and systematically.": req.PS1,
        "2.  I can identify given data and required outputs in EE problem statements.": req.PS2,
        "3.  I can select the appropriate formula or method to solve Electrical Engineering problems.": req.PS3,
        "4.  I can apply engineering principles to unfamiliar or non-routine problems.": req.PS4,
        "5.  I can solve Electrical Engineering board-type problems within a limited time.": req.PS5,
        "6.  I can break down complex problems into simpler, manageable steps.": req.PS6,
        "7.  I can verify whether my computed answers are reasonable.": req.PS7,
        "8.  I can handle multi-step computational problems effectively.": req.PS8,
        "9.  I can solve problems accurately under time pressure.": req.PS9,
        "10.  I am confident in answering computational questions in the EE licensure examination.": req.PS10,
        "11.  I am confident in answering analytical and conceptual questions in the EE licensure examination.": req.PS11,
        "12. I can apply problem-solving strategies learned during review sessions and practice exams.": req.PS12,
        "1.  I was strongly motivated to pass the Electrical Engineering Licensure Examination.": req.MT1,
        "2.  Becoming a licensed Electrical Engineer was one of my personal academic or career goals.": req.MT2,
        "3.  I set clear and realistic goals during my board examination preparation.": req.MT3,
        "4.  I consistently followed a planned study schedule throughout the review period.": req.MT4,
        "5.  I managed my daily study time effectively.": req.MT5,
        "6.  I remained disciplined in avoiding distractions while studying.": req.MT6,
        "7.  I monitored my progress and adjusted my study strategies when difficulties arose.": req.MT7,
        "8.  I remained committed to my review activities even when topics were challenging.": req.MT8,
        "1.  I was able to manage stress and anxiety during the review period.": req.MH1,
        "2.  I felt mentally prepared to take the Electrical Engineering Licensure Examination.": req.MH2,
        "3.  I remained calm when answering practice tests and mock examinations.": req.MH3,
        "4.  I maintained good physical health during my board exam preparation.": req.MH4,
        "5.  I had sufficient sleep while preparing for the licensure examination.": req.MH5,
        "6.  I was able to balance review, rest, and personal activities effectively.": req.MH6,
        "7.  I remained mentally focused during long study sessions.": req.MH7,
        "8.  I maintained a positive and confident mindset as the examination date approached.": req.MH8,
        "1. I received emotional support from my family during my board exam preparation.": req.SS1,
        "2.  My family encouraged and motivated me to continue preparing for the EELE.": req.SS2,
        "3.  I received academic or moral support from peers or fellow reviewees.": req.SS3,
        "4.  Studying with peers positively influenced my motivation or understanding of topics.": req.SS4,
        "5.  I had access to sufficient financial resources during my review period.": req.SS5,
        "6.  I had access to necessary review materials and learning resources.": req.SS6,
        "7.  My study environment was quiet and conducive to effective learning.": req.SS7,
        "8.  I had reliable access to electricity, internet, and other essential study tools": req.SS8,
        "1.  The Electrical Engineering curriculum of SLSU is aligned with the content and scope of the Electrical Engineering Licensure Examination.": req.CU1,
        "2.  Core Electrical Engineering subjects adequately prepared me for licensure-type questions.": req.CU2,
        "3.  Course syllabi clearly reflected topics relevant to the EE licensure examination": req.CU3,
        "4.  Instruction in major Electrical Engineering subjects emphasized both theory and problem-solving.": req.CU4,
        "5.  The sequence of EE subjects in the curriculum supported progressive learning of licensure topics.": req.CU5,
        "1.  Faculty members in the Electrical Engineering Department demonstrated strong mastery of the subjects they taught.": req.FQ1,
        "2.  Instructors effectively explained complex Electrical Engineering concepts": req.FQ2,
        "3.  Faculty members provided problem-solving techniques relevant to board examinations.": req.FQ3,
        "4.  Instructors encouraged critical thinking and analytical skills in class.": req.FQ4,
        "5.  Faculty members were accessible for academic consultation and clarification.": req.FQ5,
        "1.  The Electrical Engineering Department provided review sessions or activities relevant to the EE licensure examination.": req.DR1,
        "2.  Department-organized reviews helped reinforce my understanding of major EE topics.": req.DR2,
        "3. Mock examinations or practice tests provided by the department reflected actual board exam difficulty.": req.DR3,
        "4.  Academic support activities (e.g., tutorials, refresher courses) contributed to my board exam readiness.": req.DR4,
        "5. The timing of departmental review activities was appropriate for board exam preparation.": req.DR5,
        "1.  The department provided adequate learning resources (e.g., textbooks, reference materials, and laboratories).": req.FA1,
        "2.  Laboratory facilities supported my understanding of theoretical Electrical Engineering concepts.": req.FA2,
        "3. Access to computers, software, and technical tools enhanced my learning experience.": req.FA3,
        "4. The availability of departmental learning resources supported my licensure exam preparation.": req.FA4,
        "5. Department facilities were conducive to learning and academic engagement.": req.FA5,
        "1.  The Electrical Engineering Department promoted a culture of academic excellence and board exam readiness.": req.IC1,
        "2.  The department encouraged students to aim for high performance in the licensure examination.": req.IC2,
        "3. Faculty members motivated students to pursue professional licensure.": req.IC3,
        "4. The department provided guidance regarding the licensure examination process and requirements.": req.IC4,
        "5. The institutional support of the Electrical Engineering Department positively influenced my preparation for the EE licensure examination.": req.IC5,
    }
    row.update(survey_map)

    vector = [float(row.get(feat, 0)) for feat in feature_list]
    return np.array([vector])


def compute_reliability(req: "PredictRequest") -> float:
    penalties = 0
    checks = 0
    pairs = [
        (req.KN1, req.PS1),
        (req.KN7, req.PS7),
        (req.MT4, req.PS5),
    ]
    for a, b in pairs:
        checks += 1
        if abs(a - b) >= 3:
            penalties += 1
    checks += 2
    if req.MT1 in (1, 2) and req.Study_Schedule == "No":
        penalties += 1
    if req.MT4 in (1, 2) and req.Review_Program == "No":
        penalties += 1
    if checks == 0:
        return 100.0
    raw = max(0.0, 1.0 - penalties / checks)
    return round(raw * 100.0, 1)


def _reliability_category(score: Optional[float]) -> Optional[str]:
    """
    Categorizes reliability score into human-readable behavior labels.
    Must match the thresholds shown in the frontend.
    """
    if score is None:
        return None
    if score >= 80:
        return "Highly consistent answers"
    if score >= 60:
        return "Moderate consistency"
    return "Potential random responses"


# ══════════════════════════════════════════════════════════════════════════════
# REQUEST MODELS
# ══════════════════════════════════════════════════════════════════════════════

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: Literal["student", "professor"]
    student_id: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    name: str


class PredictRequest(BaseModel):
    name:           str     = Field(..., min_length=1, max_length=256)
    age:            int     = Field(..., ge=15, le=80)
    sex:            Literal["Male", "Female", "Prefer not to say"] = "Male"
    year_taking_exam: int = Field(..., ge=2020, le=2040)
    score_type:    Literal["prc", "mock"] = "prc"

    EE:   float = Field(..., ge=0, le=100)
    MATH: float = Field(..., ge=0, le=100)
    ESAS: float = Field(..., ge=0, le=100)
    GWA:  float = Field(..., ge=1.0, le=5.0)

    Senior_High_School_Strand: Literal["STEM", "GAS", "TVL", "HUMSS", "ABM"]
    SHS_Prepared:     Literal["Yes", "No"]
    EE_First_Choice:  Literal["Yes", "No"]
    College_Prepared: Literal["Yes", "No"]
    Review_Program:   Literal["Yes", "No"]
    Study_Schedule:   Literal["Yes", "No"]
    Used_Resources:   Literal["Yes", "No"]
    GWA_Reflection:   int = Field(..., ge=1, le=5)
    Review_Duration:  int = Field(..., ge=0, le=2)

    KN1: int; KN2: int; KN3: int; KN4: int
    KN5: int; KN6: int; KN7: int; KN8: int
    KN9: int; KN10: int; KN11: int; KN12: int

    PS1: int; PS2: int; PS3: int; PS4: int
    PS5: int; PS6: int; PS7: int; PS8: int
    PS9: int; PS10: int; PS11: int; PS12: int

    MT1: int; MT2: int; MT3: int; MT4: int
    MT5: int; MT6: int; MT7: int; MT8: int

    MH1: int; MH2: int; MH3: int; MH4: int
    MH5: int; MH6: int; MH7: int; MH8: int

    SS1: int; SS2: int; SS3: int; SS4: int
    SS5: int; SS6: int; SS7: int; SS8: int

    CU1: int; CU2: int; CU3: int; CU4: int; CU5: int
    FQ1: int; FQ2: int; FQ3: int; FQ4: int; FQ5: int
    DR1: int; DR2: int; DR3: int; DR4: int; DR5: int
    FA1: int; FA2: int; FA3: int; FA4: int; FA5: int
    IC1: int; IC2: int; IC3: int; IC4: int; IC5: int

    @field_validator(
        "KN1","KN2","KN3","KN4","KN5","KN6","KN7","KN8",
        "KN9","KN10","KN11","KN12",
        "PS1","PS2","PS3","PS4","PS5","PS6","PS7","PS8",
        "PS9","PS10","PS11","PS12",
        "MT1","MT2","MT3","MT4","MT5","MT6","MT7","MT8",
        "MH1","MH2","MH3","MH4","MH5","MH6","MH7","MH8",
        "SS1","SS2","SS3","SS4","SS5","SS6","SS7","SS8",
        "CU1","CU2","CU3","CU4","CU5",
        "FQ1","FQ2","FQ3","FQ4","FQ5",
        "DR1","DR2","DR3","DR4","DR5",
        "FA1","FA2","FA3","FA4","FA5",
        "IC1","IC2","IC3","IC4","IC5",
        mode="before"
    )
    @classmethod
    def check_likert(cls, v):
        if int(v) not in (1, 2, 3, 4):
            raise ValueError("Likert value must be 1, 2, 3, or 4")
        return v


# ══════════════════════════════════════════════════════════════════════════════
# AUTH ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/auth/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    email = req.email.strip().lower()
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered.")

    user = User(
        name=req.name.strip(),
        email=email,
        student_id=req.student_id if req.role == "student" else None,
        password_hash=hash_password(req.password),
        role=req.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "role": user.role})
    return TokenResponse(access_token=token, role=user.role, name=user.name or "")


@app.post("/auth/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    email = req.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token({"sub": user.id, "role": user.role})
    return TokenResponse(access_token=token, role=user.role, name=user.name or "")


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINT: POST /predict
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/predict")
def predict(req: PredictRequest, current_user: User = Depends(get_current_user)):
    X_all = build_feature_vector(req, FEATURES_ALL)
    pred  = int(classifier.predict(X_all)[0])
    proba = classifier.predict_proba(X_all)[0]

    X_basic        = build_feature_vector(req, FEATURES_BASIC)
    pred_rating_a  = round(float(np.clip(regressor_a.predict(X_basic)[0], 0, 100)), 2)

    X_nosub       = build_feature_vector(req, FEATURES_NOSUB)
    pred_rating_b = round(float(np.clip(regressor_b.predict(X_nosub)[0], 0, 100)), 2)

    reliability_score = compute_reliability(req)

    label     = "PASSED" if pred == 1 else "FAILED"
    prob_pass = round(float(proba[1]), 4)
    prob_fail = round(float(proba[0]), 4)

    attempt_id = None
    try:
        attempt_id = save_prediction(
            prediction=pred,
            label=label,
            probability_pass=prob_pass,
            probability_fail=prob_fail,
            predicted_rating_a=pred_rating_a,
            predicted_rating_b=pred_rating_b,
            passing_score=PASSING_SCORE,
            input_json=req.model_dump_json(),
            user_id=current_user.id,
            name=req.name,
            age=req.age,
            sex=req.sex,
            year_taking_exam=req.year_taking_exam,
        )
    except Exception as e:
        print(f"DB save warning: {e}")

    return {
        "prediction":         pred,
        "label":              label,
        "probability_pass":   prob_pass,
        "probability_fail":   prob_fail,
        "predicted_rating_a": pred_rating_a,
        "predicted_rating_b": pred_rating_b,
        "passing_score":      PASSING_SCORE,
        "score_type":        req.score_type,
        "rating_label_a":     _rating_label(pred_rating_a),
        "rating_label_b":     _rating_label(pred_rating_b),
        "subject_status": {
            "EE":   {"score": req.EE,   "passed": req.EE   >= PASSING_SCORE, "type": req.score_type},
            "MATH": {"score": req.MATH, "passed": req.MATH >= PASSING_SCORE, "type": req.score_type},
            "ESAS": {"score": req.ESAS, "passed": req.ESAS >= PASSING_SCORE, "type": req.score_type},
        },
        "reliability_score": reliability_score,
        "reliability_category": _reliability_category(reliability_score),
        "attempt_id": attempt_id,
    }


# ══════════════════════════════════════════════════════════════════════════════
# STUDENT DB HISTORY (Phase 5 — DB-based student module)
# ══════════════════════════════════════════════════════════════════════
@app.get("/student/attempts")
def student_attempts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    page: int = 1,
    page_size: int = 20,
):
    q = (
        db.query(PredictionAttempt)
        .filter(PredictionAttempt.user_id == current_user.id)
        .order_by(PredictionAttempt.created_at.desc())
    )
    total = q.count()
    rows = q.offset((page - 1) * page_size).limit(page_size).all()

    items = []
    for r in rows:
        answers = {}
        reliability_score = None
        subject_status = None
        score_type = None
        try:
            if r.input_json:
                answers = json.loads(r.input_json)
                # Recompute reliability using the original request fields
                req_obj = PredictRequest(**answers)
                reliability_score = compute_reliability(req_obj)
                score_type = req_obj.score_type
                subject_status = {
                    "EE": {"score": req_obj.EE, "passed": req_obj.EE >= PASSING_SCORE, "type": req_obj.score_type},
                    "MATH": {"score": req_obj.MATH, "passed": req_obj.MATH >= PASSING_SCORE, "type": req_obj.score_type},
                    "ESAS": {"score": req_obj.ESAS, "passed": req_obj.ESAS >= PASSING_SCORE, "type": req_obj.score_type},
                }
        except Exception:
            # DB rows might predate Phase 5; still return core prediction fields.
            pass

        items.append(
            {
                "attempt_id": r.id,
                "prediction": r.prediction,
                "label": r.label,
                "probability_pass": r.probability_pass,
                "probability_fail": r.probability_fail,
                "predicted_rating_a": r.predicted_rating_a,
                "predicted_rating_b": r.predicted_rating_b,
                "rating_label_a": _rating_label(r.predicted_rating_a) if r.predicted_rating_a is not None else None,
                "rating_label_b": _rating_label(r.predicted_rating_b) if r.predicted_rating_b is not None else None,
                "passing_score": r.passing_score,
                "score_type": score_type,
                "subject_status": subject_status,
                "reliability_score": reliability_score,
                "reliability_category": _reliability_category(reliability_score),
                "answers": answers,
                "date": r.created_at.isoformat() if r.created_at else None,
                "name": r.name,
                "age": r.age,
                "sex": r.sex,
                "year_taking_exam": r.year_taking_exam,
            }
        )

    return {"total": total, "page": page, "page_size": page_size, "items": items}


def _rating_label(score: float) -> str:
    if score >= 85: return "Excellent"
    if score >= 78: return "Very Good"
    if score >= 70: return "Passing"
    if score >= 60: return "At Risk"
    return "Critical"


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINT: GET /model-info
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/model-info")
def model_info():
    return {
        "dataset_size":   bundle["dataset_size"],
        "pass_count":     bundle["pass_count"],
        "fail_count":     bundle["fail_count"],
        "passing_score":  PASSING_SCORE,
        "classification": {
            "accuracy":  round(EVAL["clf_accuracy"], 4),
            "precision": round(EVAL["clf_precision"], 4),
            "recall":    round(EVAL["clf_recall"], 4),
            "f1":        round(EVAL["clf_f1"], 4),
            "cv_acc":    round(EVAL["clf_cv_acc_mean"], 4),
            "cv_f1":     round(EVAL["clf_cv_f1_mean"], 4),
        },
        "regression_a": {
            "description": "All features including subject scores",
            "mae":  round(EVAL["reg_a_mae"], 4),
            "rmse": round(EVAL["reg_a_rmse"], 4),
            "mse":  round(float(EVAL["reg_a_rmse"]) ** 2, 4),
            "r2":   round(EVAL["reg_a_r2"], 4),
        },
        "regression_b": {
            "description": "GWA + survey features only (no subject scores)",
            "mae":  round(EVAL["reg_b_mae"], 4),
            "rmse": round(EVAL["reg_b_rmse"], 4),
            "mse":  round(float(EVAL["reg_b_rmse"]) ** 2, 4),
            "r2":   round(EVAL["reg_b_r2"], 4),
        },
    }


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINT: POST /ai-recommend
# ══════════════════════════════════════════════════════════════════════════════

LIKERT_LABELS = {1: "Strongly Agree", 2: "Agree", 3: "Disagree", 4: "Strongly Disagree"}

class QuestionAnswer(BaseModel):
    key:   str
    label: str
    value: int

class AIRecommendRequest(BaseModel):
    section_label: str
    score:         int
    passed:        bool
    questions:     list[QuestionAnswer]
    attempt_id: Optional[str] = None

@app.post("/ai-recommend")
async def ai_recommend(
    req: AIRecommendRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    question_breakdown = "\n".join(
        f'- "{q.label}": {LIKERT_LABELS.get(q.value, "?")} ({q.value}/4)'
        for q in req.questions
    )

    # Cache: only for known attempts owned by the current user (student privacy)
    attempt_ok = False
    if req.attempt_id:
        try:
            attempt_ok = (
                db.query(PredictionAttempt)
                .filter(PredictionAttempt.user_id == current_user.id, PredictionAttempt.id == req.attempt_id)
                .first()
                is not None
            )
        except Exception:
            attempt_ok = False

    if req.attempt_id and attempt_ok:
        try:
            cached = (
                db.query(RecommendationsCache)
                .filter(
                    RecommendationsCache.user_id == current_user.id,
                    RecommendationsCache.attempt_id == req.attempt_id,
                    RecommendationsCache.section_label == req.section_label,
                )
                .first()
            )
            if cached:
                return {"recommendation": cached.recommendation_text, "cached": True}
        except Exception:
            pass

    prompt = f"""You are an expert academic advisor helping an Electrical Engineering board exam examinee at Southern Luzon State University (SLSU), Philippines.

The student completed a survey. Here is their self-assessment for the "{req.section_label}" section:

{question_breakdown}

Their overall score for this section is {req.score}/100 (100 = best).
The model predicted they will {"PASS" if req.passed else "FAIL"} the board exam.

Provide SPECIFIC, ACTIONABLE, PERSONALIZED recommendations based on their answers.

RULES:
1. Reference questions answered poorly (3 or 4 = Disagree/Strongly Disagree) by name
2. Affirm questions answered well (1 or 2)
3. Give 3-5 concrete action steps for weak spots
4. Tone: encouraging but honest, like a mentor
5. If score is 80+, advise how to go from good to excellent
6. Under 200 words, plain text only, numbered action steps

Start with a 1-sentence overall assessment, then list action steps."""

    api_key = os.environ.get("GROQ_API_KEY", "")
    if not api_key:
        return {"recommendation": "No GROQ_API_KEY set. Please add it as an environment variable and restart."}

    try:
        client = Groq(api_key=api_key)
        chat = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=400,
        )
        recommendation_text = chat.choices[0].message.content

        # Store cache (only if attempt_id belongs to this user)
        if req.attempt_id and attempt_ok:
            try:
                db.add(
                    RecommendationsCache(
                        user_id=current_user.id,
                        attempt_id=req.attempt_id,
                        section_label=req.section_label,
                        recommendation_text=recommendation_text,
                    )
                )
                db.commit()
            except Exception:
                db.rollback()

        return {"recommendation": recommendation_text, "cached": False}
    except Exception as e:
        print(f"Groq error: {e}")
        return {"recommendation": "AI service temporarily unavailable. Please try again."}


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINT: GET /analytics
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/analytics")
def analytics():
    # ── main dataframe: 333 rows (250 system 2022-2024 + 83 test 2025) ───────
    try:
        df = _load_main_df()
    except Exception as e:
        return {"error": f"Could not load dataset: {e}"}

    # ── survey dataframe: 143 rows (60 model + 83 test) ──────────────────────
    try:
        df_survey = _load_survey_df()
    except Exception:
        df_survey = pd.DataFrame()

    passers = df[df["passed"] == 1]
    failers = df[df["passed"] == 0]

    # ── pass/fail totals per year for the badge breakdown ────────────────────
    year_breakdown = {}
    if COL_YEAR in df.columns:
        for yr, grp in df.groupby(COL_YEAR):
            p = int(grp["passed"].sum())
            f = int((grp["passed"] == 0).sum())
            year_breakdown[int(yr)] = {
                "passers": p,
                "failers": f,
                "pass_rate": round((p / len(grp)) * 100, 1) if len(grp) else 0,
                "total": len(grp),
            }

    overview = {
        "total_students":     len(df),
        "total_passers":      int(df["passed"].sum()),
        "total_failers":      int((df["passed"] == 0).sum()),
        "overall_pass_rate":  round(df["passed"].mean() * 100, 2),
        "avg_gwa_passers":    round(float(passers[COL_GWA].mean()), 3) if COL_GWA in df.columns and len(passers) else None,
        "avg_gwa_failers":    round(float(failers[COL_GWA].mean()), 3) if COL_GWA in df.columns and len(failers) else None,
        "avg_rating_passers": round(float(passers[COL_TOTAL_RATING].mean()), 2) if COL_TOTAL_RATING in df.columns and len(passers) else None,
        "avg_rating_failers": round(float(failers[COL_TOTAL_RATING].mean()), 2) if COL_TOTAL_RATING in df.columns and len(failers) else None,
        "passing_score":      70,
        "year_breakdown":     year_breakdown,   # ← new: per-year pass/fail counts
        "data_sources": {
            "system_rows": int((df["_source"] == "system").sum()) if "_source" in df.columns else 0,
            "test_rows":   int((df["_source"] == "test").sum())   if "_source" in df.columns else 0,
        },
    }

    # ── pass rate by year ─────────────────────────────────────────────────────
    pass_rate_by_year = []
    if COL_YEAR in df.columns:
        for yr, grp in df.groupby(COL_YEAR):
            pass_rate_by_year.append({
                "label":      str(yr),
                "pass_rate":  round(grp["passed"].mean() * 100, 2),
                "total":      len(grp),
                "passers":    int(grp["passed"].sum()),
                "failers":    int((grp["passed"] == 0).sum()),
            })
        pass_rate_by_year.sort(key=lambda x: x["label"])

    # ── subject trends by year ────────────────────────────────────────────────
    subject_trends_by_year = []
    if COL_YEAR in df.columns and all(col in df.columns for col in ["EE", "MATH", "ESAS"]):
        for yr, grp in df.groupby(COL_YEAR):
            subject_trends_by_year.append({
                "year":     int(yr),
                "EE_avg":   round(float(grp["EE"].mean()), 2),
                "MATH_avg": round(float(grp["MATH"].mean()), 2),
                "ESAS_avg": round(float(grp["ESAS"].mean()), 2),
            })
        subject_trends_by_year.sort(key=lambda x: x["year"])
        for i in range(1, len(subject_trends_by_year)):
            prev = subject_trends_by_year[i - 1]
            cur  = subject_trends_by_year[i]
            cur["EE_delta"]   = round(cur["EE_avg"]   - prev["EE_avg"],   2)
            cur["MATH_delta"] = round(cur["MATH_avg"] - prev["MATH_avg"], 2)
            cur["ESAS_delta"] = round(cur["ESAS_avg"] - prev["ESAS_avg"], 2)

    # ── strand / review / duration (from df_survey which has those cols) ──────
    df_strand = df_survey if (COL_STRAND in (df_survey.columns if not df_survey.empty else [])) else df

    pass_rate_by_strand = []
    if COL_STRAND in df_strand.columns and not df_strand.empty:
        df_strand = df_strand.copy()
        df_strand[COL_STRAND] = df_strand[COL_STRAND].astype(str).str.strip().str.upper()
        for strand, grp in df_strand.groupby(COL_STRAND):
            pass_rate_by_strand.append({
                "label":     strand,
                "pass_rate": round(grp["passed"].mean() * 100, 2),
                "total":     len(grp),
            })
        pass_rate_by_strand.sort(key=lambda x: -x["pass_rate"])

    pass_rate_by_review = []
    df_rev = df_survey if (COL_REVIEW in (df_survey.columns if not df_survey.empty else [])) else df
    if COL_REVIEW in df_rev.columns and not df_rev.empty:
        df_rev = df_rev.copy()
        df_rev["review_norm"] = (
            df_rev[COL_REVIEW].astype(str).str.strip().str.upper()
            .apply(lambda x: "Yes" if x in ["YES", "Y", "1"] else "No")
        )
        for rev, grp in df_rev.groupby("review_norm"):
            pass_rate_by_review.append({
                "label":     "Attended Review" if rev == "Yes" else "No Formal Review",
                "pass_rate": round(grp["passed"].mean() * 100, 2),
                "total":     len(grp),
            })
        pass_rate_by_review.sort(key=lambda x: -x["pass_rate"])

    pass_rate_by_duration = []
    df_dur = df_survey if (COL_DURATION in (df_survey.columns if not df_survey.empty else [])) else df
    if COL_DURATION in df_dur.columns and not df_dur.empty:
        df_dur = df_dur.copy()
        dur_map = {
            "NONE": "No Review", "0": "No Review",
            "3": "~3 Months",    "3 MONTHS": "~3 Months",
            "6": "~6 Months",    "6 MONTHS": "~6 Months",
        }
        df_dur["dur_norm"] = (
            df_dur[COL_DURATION].astype(str).str.strip().str.upper()
            .apply(lambda x: next((v for k, v in dur_map.items() if k in x), "No Review"))
        )
        dur_order = ["No Review", "~3 Months", "~6 Months"]
        for dur, grp in df_dur.groupby("dur_norm"):
            pass_rate_by_duration.append({
                "label":     dur,
                "pass_rate": round(grp["passed"].mean() * 100, 2),
                "total":     len(grp),
            })
        pass_rate_by_duration.sort(
            key=lambda x: dur_order.index(x["label"]) if x["label"] in dur_order else 99
        )

    # ── GWA comparison ────────────────────────────────────────────────────────
    gwa_comparison = {}
    if COL_GWA in df.columns:
        gwa_comparison = {
            "passers":     round(float(passers[COL_GWA].mean()), 3),
            "failers":     round(float(failers[COL_GWA].mean()), 3),
            "passers_std": round(float(passers[COL_GWA].std()),  3),
            "failers_std": round(float(failers[COL_GWA].std()),  3),
        }

    # ── feature importance ────────────────────────────────────────────────────
    feature_importance = []
    try:
        importances = classifier.feature_importances_
        indices     = importances.argsort()[::-1][:10]
        for i in indices:
            name  = FEATURES_ALL[i]
            short = (name[:52] + "…") if len(name) > 52 else name
            feature_importance.append({
                "label": short,
                "value": round(float(importances[i]), 5),
            })
    except Exception:
        pass

    # ── section scores (from survey df) ──────────────────────────────────────
    section_scores = []
    if not df_survey.empty:
        sv_passers = df_survey[df_survey["passed"] == 1]
        sv_failers = df_survey[df_survey["passed"] == 0]
        for section, cols in SURVEY_SECTIONS.items():
            valid_cols = [c for c in cols if c in df_survey.columns]
            if not valid_cols:
                continue

            def _section_score(sub_df, vcols):
                vals = sub_df[vcols].apply(pd.to_numeric, errors="coerce").values.flatten()
                vals = vals[~np.isnan(vals)]
                if len(vals) == 0:
                    return 0.0
                return round(((4 - vals.mean()) / 3) * 100, 2)

            section_scores.append({
                "label": section,
                "pass":  _section_score(sv_passers, valid_cols),
                "fail":  _section_score(sv_failers, valid_cols),
            })

    # ── weakest questions (from survey df) ───────────────────────────────────
    weakest_questions = []
    if not df_survey.empty:
        all_survey_cols = [
            c for sect_cols in SURVEY_SECTIONS.values()
            for c in sect_cols if c in df_survey.columns
        ]
        question_avgs = []
        for col in all_survey_cols:
            vals = pd.to_numeric(df_survey[col], errors="coerce").dropna()
            if len(vals) == 0:
                continue
            avg = float(vals.mean())
            if col in QUESTION_SHORT_LABELS:
                key, short_label, section = QUESTION_SHORT_LABELS[col]
            else:
                key         = col[:4].upper().replace(" ", "").replace(".", "")
                short_label = (col[:57] + "…") if len(col) > 57 else col
                section     = next(
                    (s for s, sc in SURVEY_SECTIONS.items() if col in sc), "Other"
                )
            question_avgs.append({
                "key":     key,
                "label":   short_label,
                "section": section,
                "avg":     round(avg, 3),
            })
        question_avgs.sort(key=lambda x: -x["avg"])
        weakest_questions = question_avgs[:10]

    return {
        "overview":               overview,
        "pass_rate_by_year":      pass_rate_by_year,
        "pass_rate_by_strand":    pass_rate_by_strand,
        "pass_rate_by_review":    pass_rate_by_review,
        "pass_rate_by_duration":  pass_rate_by_duration,
        "gwa_comparison":         gwa_comparison,
        "feature_importance":     feature_importance,
        "section_scores":         section_scores,
        "weakest_questions":      weakest_questions,
        "subject_trends_by_year": subject_trends_by_year,
    }


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINT: GET /correlation
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/correlation")
def correlation():
    try:
        df = _load_main_df()
    except Exception as e:
        return {"error": f"Could not load dataset: {e}"}

    numeric_cols = [c for c in ["GWA", "EE", "MATH", "ESAS", COL_TOTAL_RATING] if c in df.columns]

    if COL_PASSED in df.columns:
        df["passed_bin"] = (
            df[COL_PASSED].astype(str).str.strip().str.upper().str.contains("PASS").astype(int)
        )
        numeric_cols.append("passed_bin")

    if not numeric_cols:
        return {"error": "No numeric columns available for correlation."}

    corr = df[numeric_cols].corr()

    matrix = []
    for row_name in numeric_cols:
        row = {"row": row_name}
        for col_name in numeric_cols:
            row[col_name] = round(float(corr.loc[row_name, col_name]), 3)
        matrix.append(row)

    return {"columns": numeric_cols, "matrix": matrix}


# ══════════════════════════════════════════════════════════════════════════════
# PHASE 4 — ADMIN / DB-BASED ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/admin/attempts")
def admin_attempts(
    year: Optional[int] = None,
    month: Optional[int] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
):
    q = db.query(PredictionAttempt)
    if year is not None:
        q = q.filter(extract("year", PredictionAttempt.created_at) == year)
    if month is not None:
        q = q.filter(extract("month", PredictionAttempt.created_at) == month)
    total = q.count()
    rows = (
        q.order_by(PredictionAttempt.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [
            {
                "id":                r.id,
                "user_id":           r.user_id,
                "label":             r.label,
                "probability_pass":  r.probability_pass,
                "predicted_rating_a": r.predicted_rating_a,
                "created_at":        r.created_at.isoformat(),
            }
            for r in rows
        ],
    }


@app.get("/admin/monthly-summary")
def admin_monthly_summary(year: int, db: Session = Depends(get_db)):
    rows = (
        db.query(
            extract("month", PredictionAttempt.created_at).label("month"),
            func.count().label("total"),
            func.sum(
                case(
                    (PredictionAttempt.prediction == 1, 1),
                    else_=0
                )
            ).label("pass_count"),
        )
        .filter(extract("year", PredictionAttempt.created_at) == year)
        .group_by("month")
        .order_by("month")
        .all()
    )
    out = []
    for r in rows:
        pass_count = int(r.pass_count or 0)
        total      = int(r.total or 0)
        out.append({
            "month":      int(r.month),
            "total":      total,
            "pass_count": pass_count,
            "fail_count": total - pass_count,
        })
    return out


@app.get("/admin/pass-fail-by-year")
def admin_pass_fail_by_year(db: Session = Depends(get_db)):
    rows = (
        db.query(
            extract("year", PredictionAttempt.created_at).label("year"),
            func.count().label("total"),
            func.sum(
                case(
                    (PredictionAttempt.prediction == 1, 1),
                    else_=0
                )
            ).label("pass_count"),
        )
        .group_by("year")
        .order_by("year")
        .all()
    )
    out = []
    for r in rows:
        pass_count = int(r.pass_count or 0)
        total      = int(r.total or 0)
        out.append({
            "year":       int(r.year),
            "pass_count": pass_count,
            "fail_count": total - pass_count,
        })
    return out


@app.get("/admin/trend-stats")
def admin_trend_stats(db: Session = Depends(get_db)):
    rows = (
        db.query(
            extract("year", PredictionAttempt.created_at).label("year"),
            func.count().label("total"),
            func.sum(
                case(
                    (PredictionAttempt.prediction == 1, 1),
                    else_=0
                )
            ).label("pass_count"),
            func.avg(PredictionAttempt.predicted_rating_a).label("avg_rating"),
        )
        .group_by("year")
        .order_by("year")
        .all()
    )
    years = []
    for r in rows:
        total      = int(r.total or 0)
        pass_count = int(r.pass_count or 0)
        pass_rate  = (pass_count / total) * 100 if total else 0.0
        years.append({
            "year":       int(r.year),
            "total":      total,
            "pass_rate":  round(pass_rate, 2),
            "avg_rating": round(float(r.avg_rating or 0.0), 2),
        })
    changes = []
    for i in range(1, len(years)):
        prev, cur = years[i - 1], years[i]
        changes.append({
            "from":               prev["year"],
            "to":                 cur["year"],
            "pass_rate_change":   round(cur["pass_rate"]  - prev["pass_rate"],  2),
            "avg_rating_change":  round(cur["avg_rating"] - prev["avg_rating"], 2),
        })
    return {"years": years, "changes": changes}


@app.get("/admin/trend-insights")
async def admin_trend_insights(db: Session = Depends(get_db)):
    api_key = os.environ.get("GROQ_API_KEY", "")
    stats   = admin_trend_stats(db=db)

    if not api_key:
        return {"stats": stats, "summary": "No GROQ_API_KEY set. See numeric trends above."}

    years = stats.get("years", []) or []
    changes = stats.get("changes", []) or []

    best_year = max(years, key=lambda y: y.get("pass_rate", 0.0), default=None)
    worst_year = min(years, key=lambda y: y.get("pass_rate", 0.0), default=None)

    biggest_up = max(changes, key=lambda c: c.get("pass_rate_change", 0.0), default=None)
    biggest_down = min(changes, key=lambda c: c.get("pass_rate_change", 0.0), default=None)

    first_to_last = None
    if len(years) >= 2:
        first_to_last = {
            "from": years[0]["year"],
            "to": years[-1]["year"],
            "pass_rate_change_total": round(float(years[-1].get("pass_rate", 0.0) - years[0].get("pass_rate", 0.0)), 2),
            "avg_rating_change_total": round(float(years[-1].get("avg_rating", 0.0) - years[0].get("avg_rating", 0.0)), 2),
        }

    patterns = {
        "best_year": best_year,
        "worst_year": worst_year,
        "biggest_pass_rate_increase": biggest_up,
        "biggest_pass_rate_decrease": biggest_down,
        "first_to_last": first_to_last,
    }

    # Pull curriculum gap signals from the analytics pipeline (weakest survey items + weak sections).
    # This makes the AI recommendation evidence-linked rather than generic.
    curriculum = {}
    try:
        analytics_payload = analytics()
        section_scores = analytics_payload.get("section_scores") or []
        # Weakest sections = lowest average "pass" values on the dashboard.
        weak_sections = sorted(
            list(section_scores),
            key=lambda x: float(x.get("pass", 0.0)),
        )[:3]
        curriculum = {
            "weakest_questions": (analytics_payload.get("weakest_questions") or [])[:5],
            "weak_sections": weak_sections,
        }
    except Exception:
        curriculum = {}

    prompt = f"""You are summarizing year-over-year trends in predicted EE licensure performance for faculty at Southern Luzon State University (SLSU), Philippines.

Use ONLY the numeric patterns provided below (derived from the live prediction DB and dashboard analytics).

Numeric patterns (JSON):
{{
"year_stats": {stats},
"key_patterns": {patterns},
"curriculum_gaps": {curriculum},
"note": "Dashboard uses first-attempt outcomes only; FAILED-RETAKE is treated as an outcome label, not a second attempt."
}}

Write a tight faculty-facing report in 4 short sentences (plain text only, no bullets, no headings):
1) Identify the best and worst years for predicted pass rate.
2) State the biggest pass-rate jump/drop between consecutive years.
3) Describe the direction of average predicted ratings (improving/declining) and quantify if available.
4) Give one neutral, actionable recommendation that explicitly references at least one weak section and one weak survey item key (when available), connecting gaps to review/curriculum planning.

Keep under 120 words."""

    try:
        client = Groq(api_key=api_key)
        chat   = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=180,
        )
        return {"stats": stats, "summary": chat.choices[0].message.content}
    except Exception as e:
        print(f"Groq trend-insights error: {e}")
        return {"stats": stats, "summary": "AI summary unavailable. See numeric trends above."}


@app.get("/admin/usage-summary")
def admin_usage_summary(days: int = 30, db: Session = Depends(get_db)):
    """
    System usage + user activity summary derived from prediction attempts.
    This avoids adding extra tracking tables while still supporting thesis reporting.
    """
    if days < 1:
        days = 1

    since = datetime.utcnow() - timedelta(days=days)

    total_predictions = db.query(func.count(PredictionAttempt.id)).scalar() or 0

    active_users = (
        db.query(func.count(func.distinct(PredictionAttempt.user_id)))
        .filter(PredictionAttempt.user_id.isnot(None))
        .scalar()
        or 0
    )

    # Predictions volume per day (last N days)
    day_rows = (
        db.query(
            func.date(PredictionAttempt.created_at).label("day"),
            func.count(PredictionAttempt.id).label("total"),
            func.sum(case((PredictionAttempt.prediction == 1, 1), else_=0)).label("pass_count"),
        )
        .filter(PredictionAttempt.created_at >= since)
        .group_by(func.date(PredictionAttempt.created_at))
        .order_by(func.date(PredictionAttempt.created_at))
        .all()
    )

    predictions_by_day = []
    for r in day_rows:
        total = int(r.total or 0)
        pass_count = int(r.pass_count or 0)
        predictions_by_day.append({
            "day": r.day.isoformat() if r.day is not None else None,
            "total": total,
            "pass_count": pass_count,
            "fail_count": total - pass_count,
        })

    # Most active users by attempt count
    top_users = (
        db.query(
            PredictionAttempt.user_id.label("user_id"),
            func.max(PredictionAttempt.name).label("name"),
            func.count(PredictionAttempt.id).label("attempts"),
            func.max(PredictionAttempt.created_at).label("last_at"),
        )
        .filter(PredictionAttempt.user_id.isnot(None))
        .group_by(PredictionAttempt.user_id)
        .order_by(func.max(PredictionAttempt.created_at).desc())
        .limit(6)
        .all()
    )

    active_users_recent = [
        {
            "user_id": u.user_id,
            "name": u.name,
            "attempts": int(u.attempts or 0),
            "last_at": u.last_at.isoformat() if u.last_at is not None else None,
        }
        for u in top_users
    ]

    return {
        "days": days,
        "total_predictions": int(total_predictions),
        "active_users": int(active_users),
        "predictions_by_day": predictions_by_day,
        "active_users_recent": active_users_recent,
    }


@app.get("/admin/performance-report")
def admin_performance_report(year: Optional[int] = None, days: int = 30, db: Session = Depends(get_db)):
    """
    Export-friendly performance report for the admin thesis dashboard.
    Returns JSON containing:
      - analytics KPIs (overview, pass rates, survey weakest items, subject trends)
      - model evaluation metrics (MAE/MSE/RMSE/R²)
      - DB-based pass/fail summaries and system usage
    """
    report = {
        "generated_at": datetime.utcnow().isoformat(),
        "year": year,
        "days": days,
        "analytics": {},
        "model_info": {},
        "correlation": {},
        "admin_db": {},
    }

    try:
        report["analytics"] = analytics()
    except Exception as e:
        report["analytics"] = {"error": str(e)}

    try:
        report["model_info"] = model_info()
    except Exception as e:
        report["model_info"] = {"error": str(e)}

    try:
        report["correlation"] = correlation()
    except Exception as e:
        report["correlation"] = {"error": str(e)}

    try:
        report["admin_db"]["pass_fail_by_year"] = admin_pass_fail_by_year(db=db)
    except Exception as e:
        report["admin_db"]["pass_fail_by_year"] = {"error": str(e)}

    try:
        report["admin_db"]["monthly_summary"] = admin_monthly_summary(year=year, db=db) if year else []
    except Exception as e:
        report["admin_db"]["monthly_summary"] = {"error": str(e)}

    try:
        report["admin_db"]["trend_stats"] = admin_trend_stats(db=db)
    except Exception as e:
        report["admin_db"]["trend_stats"] = {"error": str(e)}

    try:
        report["admin_db"]["usage_summary"] = admin_usage_summary(days=days, db=db)
    except Exception as e:
        report["admin_db"]["usage_summary"] = {"error": str(e)}

    return report


# ══════════════════════════════════════════════════════════════════════════════
# DEFENSE / FINAL DEMO ENDPOINT (2025 test metrics)
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/defense/test-2025")
def defense_test_2025():
    report_path = os.path.join(os.path.dirname(__file__), "evaluation_report.txt")
    if not os.path.exists(report_path):
        return {"error": "evaluation_report.txt not found. Run train_model.py first."}

    text = open(report_path, "r", encoding="utf-8").read()

    def _search_float(pattern: str):
        m = re.search(pattern, text, flags=re.IGNORECASE | re.MULTILINE)
        return float(m.group(1)) if m else None

    clf_accuracy     = _search_float(r"Accuracy\s*:\s*([0-9.]+)\s*\(")
    clf_precision    = _search_float(r"Precision\s*:\s*([0-9.]+)")
    clf_recall       = _search_float(r"Recall\s*:\s*([0-9.]+)")
    clf_f1           = _search_float(r"F1-Score\s*:\s*([0-9.]+)")
    clf_cv_acc_mean  = _search_float(r"5-Fold CV Accuracy:\s*([0-9.]+)")
    clf_cv_f1_mean   = _search_float(r"5-Fold CV F1\s*:\s*([0-9.]+)")

    reg_a_mae  = _search_float(r"MODEL 2A: REGRESSION.*?MAE\s*:\s*([0-9.]+)\s*pts")
    reg_a_rmse = _search_float(r"MODEL 2A: REGRESSION.*?RMSE\s*:\s*([0-9.]+)")
    reg_a_r2   = _search_float(r"MODEL 2A: REGRESSION.*?R2\s*:\s*([0-9.]+)")

    reg_b_mae  = _search_float(r"MODEL 2B: REGRESSION.*?MAE\s*:\s*([0-9.]+)\s*pts")
    reg_b_rmse = _search_float(r"MODEL 2B: REGRESSION.*?RMSE\s*:\s*([0-9.]+)")
    reg_b_r2   = _search_float(r"MODEL 2B: REGRESSION.*?R2\s*:\s*([0-9.]+)")

    reg_a_mse = (reg_a_rmse ** 2) if reg_a_rmse is not None else None
    reg_b_mse = (reg_b_rmse ** 2) if reg_b_rmse is not None else None

    m_fail = re.search(r"Actual FAIL\s+(\d+)\s+(\d+)", text, flags=re.MULTILINE)
    m_pass = re.search(r"Actual PASS\s+(\d+)\s+(\d+)", text, flags=re.MULTILINE)
    confusion_matrix = None
    if m_fail and m_pass:
        confusion_matrix = {
            "actual_fail": {"pred_fail": int(m_fail.group(1)), "pred_pass": int(m_fail.group(2))},
            "actual_pass": {"pred_fail": int(m_pass.group(1)), "pred_pass": int(m_pass.group(2))},
        }

    return {
        "test_year": 2025,
        "classification": {
            "accuracy": clf_accuracy,
            "precision": clf_precision,
            "recall": clf_recall,
            "f1": clf_f1,
            "cv_accuracy_mean": clf_cv_acc_mean,
            "cv_f1_mean": clf_cv_f1_mean,
        },
        "regression": {
            "a": {"mae": reg_a_mae, "rmse": reg_a_rmse, "mse": reg_a_mse, "r2": reg_a_r2},
            "b": {"mae": reg_b_mae, "rmse": reg_b_rmse, "mse": reg_b_mse, "r2": reg_b_r2},
        },
        "confusion_matrix": confusion_matrix,
    }


TEST_FILE = "DATA_TEST.xlsx"
_TEST_CACHE = {"df": None}

def _load_encoded_test_df():
    if _TEST_CACHE["df"] is not None:
        return _TEST_CACHE["df"]

    path = os.path.join(os.path.dirname(__file__), TEST_FILE)
    if not os.path.exists(path):
        raise FileNotFoundError(f"{TEST_FILE} not found in backend folder.")

    df = pd.read_excel(path, sheet_name=0)
    df.columns = df.columns.str.strip()

    if "Senior High School Strand" in df.columns and "shs_strand" in LABEL_ENCODERS:
        le = LABEL_ENCODERS["shs_strand"]
        def _safe_transform(v):
            try:
                return int(le.transform([str(v).strip()])[0])
            except Exception:
                return 0
        df["shs_strand_encoded"] = df["Senior High School Strand"].apply(_safe_transform)

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

    gwa_col = "My General Weighted Average (GWA) reflects my mastery of Electrical Engineering concepts. [RATE]"
    gwa_map = {"STRONGLY AGREE": 1, "AGREE": 2, "NEUTRAL": 3, "DISAGREE": 4, "STRONGLY DISAGREE": 5}
    if gwa_col in df.columns:
        df[gwa_col] = (
            df[gwa_col].fillna("NEUTRAL").astype(str).str.strip().str.upper()
            .map(lambda x: gwa_map.get(x, 3))
        )

    dur_col = "If YES, what was the duration of my board review?"
    if dur_col in df.columns:
        def _dur(v):
            s = str(v).upper()
            if "6" in s: return 2
            if "3" in s: return 1
            return 0
        df[dur_col] = df[dur_col].apply(_dur)

    _TEST_CACHE["df"] = df
    return df


def _get_float(row, key):
    if key not in row:
        return 0.0
    v = row[key]
    if v is None:
        return 0.0
    try:
        if pd.isna(v):
            return 0.0
    except Exception:
        pass
    try:
        return float(v)
    except Exception:
        return 0.0


@app.get("/defense/test-2025-records")
def defense_test_2025_records():
    df = _load_encoded_test_df()
    items = []

    if COL_PASSED not in df.columns or COL_TOTAL_RATING not in df.columns:
        return {"error": f"{COL_PASSED} and/or {COL_TOTAL_RATING} columns missing in {TEST_FILE}"}

    for i in range(len(df)):
        passed_raw = str(df.iloc[i][COL_PASSED]).strip().upper()
        label = "PASSED" if passed_raw == "PASSED" else "FAILED"
        try:
            rating = float(df.iloc[i][COL_TOTAL_RATING])
        except Exception:
            rating = None
        items.append({"idx": i, "label": label, "rating": rating})

    return {"count": len(items), "items": items}


@app.get("/defense/test-2025-predict")
def defense_test_2025_predict(idx: int):
    """
    Predicts for a single DATA_TEST row using the trained models.
    Returns:
      - actual/predicted outcomes
      - raw_answers (short key -> Likert int 1-4)
      - name (if name column exists)
    """
    # Survey question column → short key mapping (matches ExamineeDetailPanel keys)
    _SURVEY_COL_TO_KEY = {
        "1.  I have a strong foundation in mathematics required for Electrical Engineering.": "KN1",
        "2.  I understand fundamental concepts in circuit analysis, including DC and AC circuits.": "KN2",
        "3. I understand the principles of electrical machines such as transformers, motors, and generators.": "KN3",
        "4. I have sufficient understanding of power systems, including generation, transmission, and distribution.": "KN4",
        "5.  I understand basic concepts in electronics relevant to the EE licensure examination.": "KN5",
        "6.  I am familiar with electrical laws and theories (e.g., Ohm's Law, Kirchhoff's Laws).": "KN6",
        "7. I can recall important formulas and principles needed in the EE licensure examination.": "KN7",
        "8.  My undergraduate Electrical Engineering subjects adequately covered the topics included in the licensure exam.": "KN8",
        "9.   I understand how theoretical concepts are applied to real-world electrical engineering problems.": "KN9",
        "10.  I am familiar with common terminologies and symbols used in Electrical Engineering problems.": "KN10",
        "11.  I can interpret technical diagrams, schematics, and circuit layouts accurately.": "KN11",
        "12.  I understand the scope and coverage of the Electrical Engineering Licensure Examination.": "KN12",
        "1.  I can analyze complex Electrical Engineering problems logically and systematically.": "PS1",
        "2.  I can identify given data and required outputs in EE problem statements.": "PS2",
        "3.  I can select the appropriate formula or method to solve Electrical Engineering problems.": "PS3",
        "4.  I can apply engineering principles to unfamiliar or non-routine problems.": "PS4",
        "5.  I can solve Electrical Engineering board-type problems within a limited time.": "PS5",
        "6.  I can break down complex problems into simpler, manageable steps.": "PS6",
        "7.  I can verify whether my computed answers are reasonable.": "PS7",
        "8.  I can handle multi-step computational problems effectively.": "PS8",
        "9.  I can solve problems accurately under time pressure.": "PS9",
        "10.  I am confident in answering computational questions in the EE licensure examination.": "PS10",
        "11.  I am confident in answering analytical and conceptual questions in the EE licensure examination.": "PS11",
        "12. I can apply problem-solving strategies learned during review sessions and practice exams.": "PS12",
        "1.  I was strongly motivated to pass the Electrical Engineering Licensure Examination.": "MT1",
        "2.  Becoming a licensed Electrical Engineer was one of my personal academic or career goals.": "MT2",
        "3.  I set clear and realistic goals during my board examination preparation.": "MT3",
        "4.  I consistently followed a planned study schedule throughout the review period.": "MT4",
        "5.  I managed my daily study time effectively.": "MT5",
        "6.  I remained disciplined in avoiding distractions while studying.": "MT6",
        "7.  I monitored my progress and adjusted my study strategies when difficulties arose.": "MT7",
        "8.  I remained committed to my review activities even when topics were challenging.": "MT8",
        "1.  I was able to manage stress and anxiety during the review period.": "MH1",
        "2.  I felt mentally prepared to take the Electrical Engineering Licensure Examination.": "MH2",
        "3.  I remained calm when answering practice tests and mock examinations.": "MH3",
        "4.  I maintained good physical health during my board exam preparation.": "MH4",
        "5.  I had sufficient sleep while preparing for the EE licensure examination.": "MH5",
        "6.  I was able to balance review, rest, and personal activities effectively.": "MH6",
        "7.  I remained mentally focused during long study sessions.": "MH7",
        "8.  I maintained a positive and confident mindset as the examination date approached.": "MH8",
        "1. I received emotional support from my family during my board exam preparation.": "SS1",
        "2.  My family encouraged and motivated me to continue preparing for the EELE.": "SS2",
        "3.  I received academic or moral support from peers or fellow reviewees.": "SS3",
        "4.  Studying with peers positively influenced my motivation or understanding of topics.": "SS4",
        "5.  I had access to sufficient financial resources during my review period.": "SS5",
        "6.  I had access to necessary review materials and learning resources.": "SS6",
        "7.  My study environment was quiet and conducive to effective learning.": "SS7",
        "8.  I had reliable access to electricity, internet, and other essential study tools": "SS8",
        "1.  The Electrical Engineering curriculum of SLSU is aligned with the content and scope of the Electrical Engineering Licensure Examination.": "CU1",
        "2.  Core Electrical Engineering subjects adequately prepared me for licensure-type questions.": "CU2",
        "3.  Course syllabi clearly reflected topics relevant to the EE licensure examination": "CU3",
        "4.  Instruction in major Electrical Engineering subjects emphasized both theory and problem-solving.": "CU4",
        "5.  The sequence of EE subjects in the curriculum supported progressive learning of licensure topics.": "CU5",
        "1.  Faculty members in the Electrical Engineering Department demonstrated strong mastery of the subjects they taught.": "FQ1",
        "2.  Instructors effectively explained complex Electrical Engineering concepts": "FQ2",
        "3.  Faculty members provided problem-solving techniques relevant to board examinations.": "FQ3",
        "4.  Instructors encouraged critical thinking and analytical skills in class.": "FQ4",
        "5.  Faculty members were accessible for academic consultation and clarification.": "FQ5",
        "1.  The Electrical Engineering Department provided review sessions or activities relevant to the EE licensure examination.": "DR1",
        "2.  Department-organized reviews helped reinforce my understanding of major EE topics.": "DR2",
        "3. Mock examinations or practice tests provided by the department reflected actual board exam difficulty.": "DR3",
        "4.  Academic support activities (e.g., tutorials, refresher courses) contributed to my board exam readiness.": "DR4",
        "5. The timing of departmental review activities was appropriate for board exam preparation.": "DR5",
        "1.  The department provided adequate learning resources (e.g., textbooks, reference materials, and laboratories).": "FA1",
        "2.  Laboratory facilities supported my understanding of theoretical Electrical Engineering concepts.": "FA2",
        "3. Access to computers, software, and technical tools enhanced my learning experience.": "FA3",
        "4.  The availability of departmental learning resources supported my licensure exam preparation." : "FA4",
        "5. Department facilities were conducive to learning and academic engagement.": "FA5",
        "1.  The Electrical Engineering Department promoted a culture of academic excellence and board exam readiness.": "IC1",
        "2.  The department encouraged students to aim for high performance in the licensure examination.": "IC2",
        "3. Faculty members motivated students to pursue professional licensure.": "IC3",
        "4.  The department provided guidance regarding the licensure examination process and requirements.": "IC4",
        "5.  The institutional support of the Electrical Engineering Department positively influenced my preparation for the EE licensure examination.": "IC5",
    }

    _NAME_COLS = ["Name", "NAME", "Full Name", "FULL NAME", "Respondent", "RESPONDENT", "Student Name", "STUDENT NAME"]

    # ── encoded DF for ML features ───────────────────────────────────────────
    df = _load_encoded_test_df()
    if idx < 0 or idx >= len(df):
        return {"error": "idx out of range"}

    row = df.iloc[idx]

    passed_raw   = str(row[COL_PASSED]).strip().upper() if COL_PASSED in df.columns else ""
    actual_label = "PASSED" if passed_raw == "PASSED" else "FAILED"
    actual_rating = None
    if COL_TOTAL_RATING in df.columns:
        try:
            actual_rating = float(row[COL_TOTAL_RATING])
        except Exception:
            actual_rating = None

    # ── model prediction ────────────────────────────────────────────────────
    X_all   = np.array([[ _get_float(row, f) for f in FEATURES_ALL   ]], dtype=float)
    X_basic = np.array([[ _get_float(row, f) for f in FEATURES_BASIC ]], dtype=float)
    X_nosub = np.array([[ _get_float(row, f) for f in FEATURES_NOSUB ]], dtype=float)

    pred        = int(classifier.predict(X_all)[0])
    proba       = classifier.predict_proba(X_all)[0]
    pred_label  = "PASSED" if pred == 1 else "FAILED"

    pred_rating_a = round(float(np.clip(regressor_a.predict(X_basic)[0], 0, 100)), 2)
    pred_rating_b = round(float(np.clip(regressor_b.predict(X_nosub)[0], 0, 100)), 2)

    # ── raw answers (original 1–4 values) + name ───────────────────────────
    raw_answers = {}
    name = None
    try:
        raw_path = os.path.join(os.path.dirname(__file__), TEST_FILE)
        raw_df = pd.read_excel(raw_path, sheet_name=0)
        raw_df.columns = raw_df.columns.str.strip()
        raw_row = raw_df.iloc[idx]

        for col_name, short_key in _SURVEY_COL_TO_KEY.items():
            if col_name in raw_df.columns:
                val = raw_row[col_name]
                try:
                    ival = int(float(val))
                    if 1 <= ival <= 4:
                        raw_answers[short_key] = ival
                except Exception:
                    pass

        for col_candidate in _NAME_COLS:
            if col_candidate in raw_df.columns:
                v = str(raw_df.iloc[idx][col_candidate]).strip()
                if v and v.lower() not in ("nan", "none", ""):
                    name = v
                    break
    except Exception as e:
        print(f"[defense_test_2025_predict] Could not extract raw answers/name: {e}")

    return {
        "idx": idx,
        "name": name,
        "actual": {"label": actual_label, "rating": actual_rating},
        "predicted": {
            "label":              pred_label,
            "probability_pass":   round(float(proba[1]), 6),
            "probability_fail":   round(float(proba[0]), 6),
            "predicted_rating_a": pred_rating_a,
            "predicted_rating_b": pred_rating_b,
        },
        "raw_answers": raw_answers,
    }


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINT: GET /health
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/health")
def health():
    return {
        "status":         "ok",
        "models_loaded":  3,
        "features_all":   len(FEATURES_ALL),
        "features_nosub": len(FEATURES_NOSUB),
        "features_basic": len(FEATURES_BASIC),
        "passing_score":  PASSING_SCORE,
        "database":       "connected" if get_database_url() else "not_configured",
    }