"""
migrations/001_create_indexes.py

Database migration to add performance indexes to Neon PostgreSQL.

This migration should be run once in production after deploying updated code.

BEFORE deployment:
  1. Backup database in Neon console
  2. Run this migration locally first to test

RUN IN NEON:
  1. Go to Neon console → SQL Editor
  2. Copy each SQL statement below
  3. Execute them one by one
  4. Verify with: SELECT * FROM pg_indexes WHERE tablename IN ('users', 'prediction_attempts', 'recommendations_cache');

Alternative CLI:
  psql "postgres://..." -f migrations/001_create_indexes.sql
"""

# SQLAlchemy migrations approach (optional, if using Alembic)
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    # User indexes
    op.create_index('idx_user_email', 'users', ['email'], unique=False)
    op.create_index('idx_user_role', 'users', ['role'], unique=False)
    op.create_index('idx_user_created_at', 'users', ['created_at'], unique=False)
    
    # PredictionAttempt indexes
    op.create_index('idx_attempt_user_id', 'prediction_attempts', ['user_id'], unique=False)
    op.create_index('idx_attempt_user_date', 'prediction_attempts', ['user_id', 'created_at'], unique=False)
    op.create_index('idx_attempt_created_at', 'prediction_attempts', ['created_at'], unique=False)
    op.create_index('idx_attempt_year', 'prediction_attempts', ['user_id', 'year_taking_exam'], unique=False)
    op.create_index('idx_attempt_prediction', 'prediction_attempts', ['prediction'], unique=False)
    
    # RecommendationsCache indexes
    op.create_index('idx_rec_user_id', 'recommendations_cache', ['user_id'], unique=False)
    op.create_index('idx_rec_attempt_id', 'recommendations_cache', ['attempt_id'], unique=False)
    op.create_index('idx_rec_user_attempt', 'recommendations_cache', ['user_id', 'attempt_id'], unique=False)

def downgrade():
    op.drop_index('idx_user_email')
    op.drop_index('idx_user_role')
    op.drop_index('idx_user_created_at')
    op.drop_index('idx_attempt_user_id')
    op.drop_index('idx_attempt_user_date')
    op.drop_index('idx_attempt_created_at')
    op.drop_index('idx_attempt_year')
    op.drop_index('idx_attempt_prediction')
    op.drop_index('idx_rec_user_id')
    op.drop_index('idx_rec_attempt_id')
    op.drop_index('idx_rec_user_attempt')
"""

# Raw SQL for manual execution
SQL_STATEMENTS = """
-- Migration 001: Create Performance Indexes
-- Created: 2026-04-02
-- ===== USERS TABLE INDEXES =====

-- Fast lookups by email (for login)
CREATE INDEX idx_user_email ON users(email);

-- Filter by role (professor vs student)
CREATE INDEX idx_user_role ON users(role);

-- Find recent registrations
CREATE INDEX idx_user_created_at ON users(created_at DESC);

-- ===== PREDICTION ATTEMPTS TABLE INDEXES =====

-- Most common query: Get attempts for a specific user
CREATE INDEX idx_attempt_user_id ON prediction_attempts(user_id);

-- Combination: Get user's attempts in date range
CREATE INDEX idx_attempt_user_date ON prediction_attempts(user_id, created_at DESC);

-- Global time-based queries
CREATE INDEX idx_attempt_created_at ON prediction_attempts(created_at DESC);

-- Find by academic year
CREATE INDEX idx_attempt_year ON prediction_attempts(year_taking_exam);

-- Filter by pass/fail
CREATE INDEX idx_attempt_prediction ON prediction_attempts(prediction);

-- ===== RECOMMENDATIONS CACHE TABLE INDEXES =====

-- Get cached recommendations for a user
CREATE INDEX idx_rec_user_id ON recommendations_cache(user_id);

-- Get cached recommendations for an attempt
CREATE INDEX idx_rec_attempt_id ON recommendations_cache(attempt_id);

-- Most common: Get specific recommendation for user + attempt
CREATE INDEX idx_rec_user_attempt_section ON recommendations_cache(user_id, attempt_id, section_label);

-- ===== STATS QUERIES =====

-- Verify indexes were created
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check index sizes
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_indexes
JOIN pg_class ON pg_class.relname = indexname
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
"""

if __name__ == "__main__":
    import sys
    print("Database Migration: 001_create_indexes.py")
    print("=" * 60)
    print()
    print("SQL Statements to execute in Neon:")
    print()
    print(SQL_STATEMENTS)
    print()
    print("=" * 60)
    print("To run this migration:")
    print("  1. Copy SQL statements above")
    print("  2. Go to Neon console → SQL Editor")
    print("  3. Paste and execute each statement")
    print("  4. Or: psql <connection_string> -f migrations/001_create_indexes.sql")
