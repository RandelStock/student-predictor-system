"""
cache.py — Caching layer for expensive endpoints
Implements in-memory caching with TTL (Time To Live)

Usage in main.py:
    from cache import cache_get, cache_set, cache_clear
    
    result = cache_get("analytics")
    if result is None:
        result = compute_expensive_analytics()
        cache_set("analytics", result, ttl=3600)  # 1 hour
"""

from datetime import datetime, timedelta
from threading import Lock
from typing import Any, Optional
import hashlib
import json

# Thread-safe cache dictionary
_cache = {}
_cache_lock = Lock()


class CachedValue:
    """Wrapper for cached values with TTL tracking"""
    def __init__(self, value: Any, ttl: int):
        self.value = value
        self.created_at = datetime.utcnow()
        self.ttl = ttl  # seconds
        self.expires_at = self.created_at + timedelta(seconds=ttl)
    
    def is_expired(self) -> bool:
        """Check if cache entry has expired"""
        return datetime.utcnow() >= self.expires_at
    
    def time_to_expiry(self) -> int:
        """Get seconds until expiry"""
        delta = self.expires_at - datetime.utcnow()
        return max(0, int(delta.total_seconds()))


def cache_get(key: str) -> Optional[Any]:
    """
    Retrieve value from cache if it exists and hasn't expired
    
    Args:
        key: Cache key
    
    Returns:
        Cached value or None if not found or expired
    """
    with _cache_lock:
        if key not in _cache:
            return None
        
        cached = _cache[key]
        if cached.is_expired():
            del _cache[key]
            return None
        
        return cached.value


def cache_set(key: str, value: Any, ttl: int = 3600) -> None:
    """
    Store value in cache with TTL
    
    Args:
        key: Cache key
        value: Value to cache (should be JSON-serializable)
        ttl: Time to live in seconds (default: 1 hour)
    """
    with _cache_lock:
        _cache[key] = CachedValue(value, ttl)


def cache_clear(key: Optional[str] = None) -> None:
    """
    Clear cache entry or entire cache
    
    Args:
        key: Specific key to clear, or None to clear all
    """
    with _cache_lock:
        if key is None:
            _cache.clear()
        elif key in _cache:
            del _cache[key]


def cache_info() -> dict:
    """Get cache statistics"""
    with _cache_lock:
        total = len(_cache)
        expired = sum(1 for v in _cache.values() if v.is_expired())
        active = total - expired
        
        return {
            "total_keys": total,
            "active_keys": active,
            "expired_keys": expired,
            "keys": {
                k: {
                    "ttl_remaining": _cache[k].time_to_expiry(),
                    "expires_at": _cache[k].expires_at.isoformat(),
                } 
                for k in _cache.keys()
            }
        }


# ─── Specific cache managers for common endpoints ────────────────────────────

def get_analytics_cache():
    """Get cached analytics or None"""
    return cache_get("analytics")

def set_analytics_cache(data: dict, ttl: int = 1800):
    """Cache analytics for 30 minutes"""
    cache_set("analytics", data, ttl)

def get_modelinfo_cache():
    """Get cached model info or None"""
    return cache_get("model-info")

def set_modelinfo_cache(data: dict, ttl: int = 86400):
    """Cache model info for 24 hours (rarely changes)"""
    cache_set("model-info", data, ttl)

def get_correlation_cache():
    """Get cached correlation matrix or None"""
    return cache_get("correlation")

def set_correlation_cache(data: dict, ttl: int = 3600):
    """Cache correlation for 1 hour"""
    cache_set("correlation", data, ttl)


# ─── Admin endpoint caching ───────────────────────────────────────────────────

def get_admin_cache(endpoint: str, **params) -> Optional[dict]:
    """Get cached admin query result"""
    cache_key = f"admin:{endpoint}:{json.dumps(params, sort_keys=True, default=str)}"
    return cache_get(cache_key)

def set_admin_cache(endpoint: str, data: dict, ttl: int = 300, **params) -> None:
    """Cache admin query result for 5 minutes"""
    cache_key = f"admin:{endpoint}:{json.dumps(params, sort_keys=True, default=str)}"
    cache_set(cache_key, data, ttl)

def clear_admin_caches() -> None:
    """Clear all admin caches (call after data changes)"""
    with _cache_lock:
        keys_to_delete = [k for k in _cache.keys() if k.startswith("admin:")]
        for k in keys_to_delete:
            del _cache[k]


# ─── Cache invalidation helpers ────────────────────────────────────────────────

def invalidate_on_prediction() -> None:
    """Call after new prediction is saved - invalidates affected caches"""
    cache_clear("analytics")
    cache_clear("correlation")
    clear_admin_caches()

def invalidate_on_data_import() -> None:
    """Call after bulk data import - invalidates all caches"""
    cache_clear()

def reset_all_caches() -> None:
    """Hard reset of all caches"""
    cache_clear()


# ─── Logging/Monitoring ───────────────────────────────────────────────────────

def log_cache_access(key: str, hit: bool) -> None:
    """Log cache hits/misses (optional, for monitoring)"""
    status = "HIT" if hit else "MISS"
    # In production, send to monitoring service
    # For now, just silent
    pass


# ─── Example usage in main.py ───────────────────────────────────────────────────
"""
# At the top of main.py:
from cache import (
    get_analytics_cache, set_analytics_cache,
    get_modelinfo_cache, set_modelinfo_cache,
    get_correlation_cache, set_correlation_cache,
    invalidate_on_prediction
)

# In /analytics endpoint:
@app.get("/analytics")
def analytics():
    # Try cache first
    cached = get_analytics_cache()
    if cached is not None:
        return cached
    
    # Compute as usual
    result = {
        "total_students": len(df),
        ...
    }
    
    # Store in cache for 30 minutes
    set_analytics_cache(result, ttl=1800)
    return result

# In /predict endpoint (after saving prediction):
@app.post("/predict")
def predict(data: dict):
    # ... prediction logic ...
    save_prediction(...)
    
    # Invalidate caches
    invalidate_on_prediction()
    
    return {...}
"""
