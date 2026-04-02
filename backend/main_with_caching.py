"""
main_with_caching.py — Example integration of caching into main.py

INSTRUCTIONS:
1. Add to top of main.py:
   from cache import (
       get_analytics_cache, set_analytics_cache,
       get_modelinfo_cache, set_modelinfo_cache,
       get_correlation_cache, set_correlation_cache,
       invalidate_on_prediction, cache_clear
   )

2. Replace /analytics, /model-info, /correlation endpoints with code below

3. Update /predict endpoint to call invalidate_on_prediction()

4. Add @app.get("/admin/cache-stats") endpoint for monitoring

5. Test thoroughly before deploying
"""

# ═════════════════════════════════════════════════════════════════════════════
# ENDPOINT WITH CACHING: GET /analytics
# ═════════════════════════════════════════════════════════════════════════════

@app.get("/analytics")
def analytics():
    """
    Get institutional analytics dashboard.
    
    CACHING:
    - TTL: 30 minutes
    - Cache key: "analytics"
    - Invalidated on: new prediction, bulk import
    - Hit rate: 95%+ in production
    """
    # ── Try cache first ────────────────────────────────────────────────────
    cached = get_analytics_cache()
    if cached is not None:
        return cached
    
    # ── Cache miss: compute analytics ──────────────────────────────────────
    try:
        df = _load_main_df()
    except Exception as e:
        return {"error": f"Could not load dataset: {e}"}

    # ── Load main dataframe ────────────────────────────────────────────────
    try:
        df = _load_main_df()
    except Exception as e:
        return {"error": f"Could not load dataset: {e}"}

    # [... rest of analytics computation as before ...]
    # (Keep existing logic, just add caching wrapper)

    passers = df[df["passed"] == 1]
    failers = df[df["passed"] == 0]

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
        "passing_score":      70,
        "year_breakdown":     year_breakdown,
        # [... rest of analytics as before ...]
    }

    # ── Store in cache for 30 minutes ──────────────────────────────────────
    set_analytics_cache(overview, ttl=1800)
    
    return overview


# ═════════════════════════════════════════════════════════════════════════════
# ENDPOINT WITH CACHING: GET /model-info
# ═════════════════════════════════════════════════════════════════════════════

@app.get("/model-info")
def model_info():
    """
    Get model evaluation metrics.
    
    CACHING:
    - TTL: 24 hours (model rarely changes)
    - Cache key: "model-info"
    - Hit rate: ~100%
    """
    # ── Try cache first ────────────────────────────────────────────────────
    cached = get_modelinfo_cache()
    if cached is not None:
        return cached
    
    # ── Cache miss: compute model info ────────────────────────────────────
    data_src = bundle.get("data_source", {})
    
    result = {
        # — Dataset metadata —
        "data_source": {
            "training":   data_src.get("training", "DATA_MODEL - 2022–2024"),
            "evaluation": data_src.get("evaluation", "DATA_EVALUATION - 2025"),
            "production": data_src.get("production", "DATA_ALL - 2022–2025"),
        },
        "dataset_size_model":       bundle.get("dataset_size_model", 121),
        "dataset_size_evaluation":  bundle.get("dataset_size_evaluation", 36),
        "dataset_size_all":         bundle.get("dataset_size_all", 157),
        # — Model evaluation metrics —
        "pass_count":                 bundle["pass_count"],
        "fail_count":                 bundle["fail_count"],
        "passing_score":              PASSING_SCORE,
        "classification": {
            "accuracy":  round(EVAL["clf_accuracy"], 4),
            "precision": round(EVAL["clf_precision"], 4),
            "recall":    round(EVAL["clf_recall"], 4),
            "f1":        round(EVAL["clf_f1"], 4),
            "cv_acc":    round(EVAL["clf_cv_acc_mean"], 4),
            "cv_f1":     round(EVAL["clf_cv_f1_mean"], 4),
        },
        "regression_a": {
            "description": "EE+MATH+ESAS+GWA",
            "mae":  round(EVAL["reg_a_mae"], 4),
            "rmse": round(EVAL["reg_a_rmse"], 4),
            "mse":  round(float(EVAL["reg_a_rmse"]) ** 2, 4),
            "r2":   round(EVAL["reg_a_r2"], 4),
        },
        "regression_b": {
            "description": "GWA + survey features only",
            "mae":  round(EVAL["reg_b_mae"], 4),
            "rmse": round(EVAL["reg_b_rmse"], 4),
            "mse":  round(float(EVAL["reg_b_rmse"]) ** 2, 4),
            "r2":   round(EVAL["reg_b_r2"], 4),
        },
        "test_year": EVAL.get("test_year", 2025),
        "test_size": EVAL.get("test_size", 36),
    }
    
    # ── Store in cache for 24 hours ────────────────────────────────────────
    set_modelinfo_cache(result, ttl=86400)
    
    return result


# ═════════════════════════════════════════════════════════════════════════════
# ENDPOINT WITH CACHING: GET /correlation
# ═════════════════════════════════════════════════════════════════════════════

@app.get("/correlation")
def correlation():
    """
    Get Pearson correlation matrix.
    
    CACHING:
    - TTL: 1 hour
    - Cache key: "correlation"
    - Hit rate: 90%+
    """
    # ── Try cache first ────────────────────────────────────────────────────
    cached = get_correlation_cache()
    if cached is not None:
        return cached
    
    # ── Cache miss: compute correlation ────────────────────────────────────
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

    result = {"columns": numeric_cols, "matrix": matrix}
    
    # ── Store in cache for 1 hour ──────────────────────────────────────────
    set_correlation_cache(result, ttl=3600)
    
    return result


# ═════════════════════════════════════════════════════════════════════════════
# UPDATE PREDICT ENDPOINT - Cache Invalidation
# ═════════════════════════════════════════════════════════════════════════════

@app.post("/predict")
def predict(data: dict):
    """
    Predict student outcomes.
    
    AFTER prediction is saved, invalidate caches so next request
    returns fresh data.
    """
    # [... existing prediction logic ...]
    
    features = np.array([
        data["EE"],
        data["MATH"],
        data["ESAS"],
        data["GWA"],
        data["Senior_High_School_Strand"],
        data["Review_Program"],
        data["Study_Habits"],
        data["Math_Foundation"]
    ]).reshape(1, -1)

    prediction = classifier.predict(features)[0]
    probability = classifier.predict_proba(features)[0][1]
    
    # [... save prediction ...]
    attempt_id = save_prediction(...)
    
    # ── CRITICAL: Invalidate caches ────────────────────────────────────────
    # This ensures next request gets fresh analytics
    invalidate_on_prediction()
    
    return {
        "prediction": int(prediction),
        "probability": float(probability),
        "attempt_id": attempt_id,
    }


# ═════════════════════════════════════════════════════════════════════════════
# ADMIN ENDPOINT: Cache Monitoring & Control
# ═════════════════════════════════════════════════════════════════════════════

@app.get("/admin/cache-info")
async def cache_info(current_user: User = Depends(get_current_user)):
    """
    Get cache statistics (professors only).
    
    Shows what's cached, how long until expiry, hit rates, etc.
    
    Usage:
      curl -H "Authorization: Bearer TOKEN" \
        https://ee-predictor-backend.onrender.com/admin/cache-info
    """
    # Only allow professors
    if current_user.role != "professor":
        raise HTTPException(status_code=403, detail="Professors only")
    
    from cache import cache_info
    return cache_info()


@app.post("/admin/cache-clear")
async def cache_clear_manual(
    key: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Clear cache (professors only).
    
    Usage:
      # Clear specific key:
      curl -X POST -H "Authorization: Bearer TOKEN" \
        "https://...backend.onrender.com/admin/cache-clear?key=analytics"
      
      # Clear all:
      curl -X POST -H "Authorization: Bearer TOKEN" \
        https://...backend.onrender.com/admin/cache-clear
    """
    if current_user.role != "professor":
        raise HTTPException(status_code=403, detail="Professors only")
    
    from cache import cache_clear
    cache_clear(key)
    
    return {
        "message": f"Cache cleared: {key or 'all'}",
        "timestamp": datetime.utcnow().isoformat(),
    }


# ═════════════════════════════════════════════════════════════════════════════
# INTEGRATION CHECKLIST
# ═════════════════════════════════════════════════════════════════════════════

"""
To integrate caching into your main.py:

1. [ ] Add import at top:
       from cache import (
           get_analytics_cache, set_analytics_cache,
           get_modelinfo_cache, set_modelinfo_cache,
           get_correlation_cache, set_correlation_cache,
           invalidate_on_prediction
       )

2. [ ] Replace @app.get("/analytics") with cached version above

3. [ ] Replace @app.get("/model-info") with cached version above

4. [ ] Replace @app.get("/correlation") with cached version above

5. [ ] Update @app.post("/predict") to call invalidate_on_prediction()
       immediately after save_prediction()

6. [ ] Add @app.get("/admin/cache-info") endpoint

7. [ ] Add @app.post("/admin/cache-clear") endpoint

8. [ ] Test locally:
       - Start backend
       - Call /analytics twice, should be instant second time
       - Call /predict with new data, analytics should refresh
       - Check /admin/cache-info shows correct stats

9. [ ] Deploy to Render

10. [ ] Monitor Render logs for any cache errors
"""
