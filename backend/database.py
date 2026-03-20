"""
database.py — PostgreSQL (or SQLite) persistence for REE Predictor.
Creates tables: users (optional), prediction_attempts.
Set DATABASE_URL in .env; if unset, persistence is skipped and no DB is required.
"""

import os
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import create_engine, Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import sessionmaker, declarative_base, Session

Base = declarative_base()

# ─────────────────────────────────────────────
# MODELS
# ─────────────────────────────────────────────


class User(Base):
    """User account (student or professor) for authentication."""
    __tablename__ = "users"

    id            = Column(String(36),  primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id    = Column(String(64),  nullable=True, index=True)
    name          = Column(String(256), nullable=True)
    email         = Column(String(256), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role          = Column(String(32),  default="student")   # "student" | "professor"
    created_at    = Column(DateTime,    default=datetime.utcnow)


class PredictionAttempt(Base):
    """One row per prediction: personal info, inputs (JSON), and outputs."""
    __tablename__ = "prediction_attempts"

    id      = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)

    # ── Phase 5: personal info ────────────────────────────────────────────────
    name           = Column(String(256), nullable=True)
    age            = Column(Integer,     nullable=True)
    sex            = Column(String(32),  nullable=True)
    year_taking_exam = Column(Integer, nullable=True)

    # ── Prediction outputs ────────────────────────────────────────────────────
    prediction         = Column(Integer, nullable=False)   # 0 = FAIL, 1 = PASS
    label              = Column(String(16), nullable=False) # "PASSED" | "FAILED"
    probability_pass   = Column(Float, nullable=False)
    probability_fail   = Column(Float, nullable=False)
    predicted_rating_a = Column(Float, nullable=False)
    predicted_rating_b = Column(Float, nullable=False)
    passing_score      = Column(Float, nullable=False)

    # Full request JSON for analytics
    input_json = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class RecommendationsCache(Base):
    """
    Cached AI recommendations per user + prediction attempt + section.
    Ensures recommendations remain private per examinee.
    """
    __tablename__ = "recommendations_cache"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    attempt_id = Column(String(36), ForeignKey("prediction_attempts.id"), nullable=False, index=True)

    section_label = Column(String(128), nullable=False, index=True)
    recommendation_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    __table_args__ = (
        UniqueConstraint("user_id", "attempt_id", "section_label", name="uq_rec_user_attempt_section"),
    )


# ─────────────────────────────────────────────
# ENGINE & SESSION
# ─────────────────────────────────────────────

_engine = None
_SessionLocal: Optional[sessionmaker] = None


def get_database_url() -> Optional[str]:
    return os.environ.get("DATABASE_URL")


def get_engine():
    global _engine
    if _engine is not None:
        return _engine
    url = get_database_url()
    if not url:
        return None
    _engine = create_engine(url, pool_pre_ping=True)
    return _engine


def init_db() -> bool:
    engine = get_engine()
    if engine is None:
        return False
    Base.metadata.create_all(bind=engine)
    return True


def get_session() -> Optional[Session]:
    engine = get_engine()
    if engine is None:
        return None
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return _SessionLocal()


def save_prediction(
    prediction: int,
    label: str,
    probability_pass: float,
    probability_fail: float,
    predicted_rating_a: float,
    predicted_rating_b: float,
    passing_score: float,
    input_json: Optional[str] = None,
    user_id: Optional[str] = None,
    # Phase 5 personal info
    name: Optional[str] = None,
    age: Optional[int] = None,
    sex: Optional[str] = None,
    year_taking_exam: Optional[int] = None,
) -> Optional[str]:
    """
    Insert one prediction attempt. Returns attempt_id (UUID) or None if DB not configured.
    """
    session = get_session()
    if session is None:
        return None
    try:
        attempt = PredictionAttempt(
            user_id=user_id,
            name=name,
            age=age,
            sex=sex,
            year_taking_exam=year_taking_exam,
            prediction=prediction,
            label=label,
            probability_pass=probability_pass,
            probability_fail=probability_fail,
            predicted_rating_a=predicted_rating_a,
            predicted_rating_b=predicted_rating_b,
            passing_score=passing_score,
            input_json=input_json,
        )
        session.add(attempt)
        session.commit()
        return attempt.id
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()