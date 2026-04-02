/**
 * api-service.js — Centralized API layer with retry logic, timeout, and proper error handling
 * Solves: slow backend, connection timeouts, and missing retry logic
 */

import API_BASE_URL from "./apiBase";

// ─── Configuration ───────────────────────────────────────────────────────────
const CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,          // ms
  RETRY_BACKOFF: 1.5,         // exponential backoff multiplier
  REQUEST_TIMEOUT: 15000,     // 15 seconds
  HEALTH_CHECK_INTERVAL: 30000, // 30 seconds
};

// ─── Global State ───────────────────────────────────────────────────────────
let backendHealthy = true;
let lastHealthCheckTime = 0;
let requestQueue = [];
let isProcessingQueue = false;

// ─── Health Check (runs in background) ────────────────────────────────────
async function checkBackendHealth() {
  const now = Date.now();
  if (now - lastHealthCheckTime < CONFIG.HEALTH_CHECK_INTERVAL) {
    return backendHealthy;
  }
  lastHealthCheckTime = now;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    
    const res = await fetch(`${API_BASE_URL}/health`, {
      signal: controller.signal,
      method: "GET",
    });
    
    clearTimeout(timeout);
    backendHealthy = res.ok;
    return backendHealthy;
  } catch (err) {
    backendHealthy = false;
    return false;
  }
}

// ─── Fetch with Retry & Timeout ──────────────────────────────────────────
export async function apiCall(endpoint, options = {}) {
  const {
    method = "GET",
    headers = {},
    body = null,
    retries = CONFIG.MAX_RETRIES,
    timeout = CONFIG.REQUEST_TIMEOUT,
    noRetry = false, // skip retry for certain endpoints
  } = options;

  // Add auth token if available
  const token = localStorage.getItem("token");
  const finalHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };
  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  let lastError;
  let delay = CONFIG.RETRY_DELAY;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutHandle = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: finalHeaders,
        body: body ? JSON.stringify(body) : null,
        signal: controller.signal,
      });

      clearTimeout(timeoutHandle);

      // Handle 401 Unauthorized — clear token and redirect to login
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "/"; // Go back to landing
        throw new Error("Session expired. Please log in again.");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.detail || errorData.message || `HTTP ${response.status}`;
        throw new Error(message);
      }

      const data = await response.json();
      return { success: true, data, status: response.status };

    } catch (err) {
      lastError = err;

      // Don't retry on 4xx errors (client errors)
      if (err.message?.includes("HTTP 4")) {
        throw err;
      }

      // Don't retry if explicitly disabled
      if (noRetry || attempt === retries) {
        throw err;
      }

      // Network timeout or 5xx — retry with exponential backoff
      console.warn(
        `Request failed (attempt ${attempt + 1}/${retries + 1}): ${err.message}. Retrying in ${delay}ms...`
      );

      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= CONFIG.RETRY_BACKOFF;
    }
  }

  throw lastError || new Error("API request failed");
}

// ─── Specialized Endpoints ───────────────────────────────────────────────

/**
 * Authentication endpoints
 */
export async function apiLogin(email, password, role) {
  return apiCall("/auth/login", {
    method: "POST",
    body: { email, password },
    noRetry: true, // Don't retry login
  });
}

export async function apiRegister(payload) {
  return apiCall("/auth/register", {
    method: "POST",
    body: payload,
    noRetry: true,
  });
}

/**
 * Prediction endpoints
 */
export async function apiPredict(formData) {
  return apiCall("/predict", {
    method: "POST",
    body: formData,
  });
}

export async function apiRecommendations(payload) {
  return apiCall("/ai-recommend", {
    method: "POST",
    body: payload,
  });
}

/**
 * Student endpoints
 */
export async function apiStudentAttempts(pageSize = 50) {
  return apiCall(`/student/attempts?page_size=${pageSize}`, {
    method: "GET",
  });
}

/**
 * Professor/Admin endpoints
 */
export async function apiAdminAttempts(page = 1, pageSize = 20, filters = {}) {
  const yearParam = filters.year ? `&year=${filters.year}` : "";
  const monthParam = filters.month ? `&month=${filters.month}` : "";
  return apiCall(
    `/admin/attempts?page=${page}&page_size=${pageSize}${yearParam}${monthParam}`,
    { method: "GET" }
  );
}

export async function apiAnalytics() {
  return apiCall("/analytics", { method: "GET" });
}

export async function apiModelInfo() {
  return apiCall("/model-info", { method: "GET" });
}

export async function apiCorrelation() {
  return apiCall("/correlation", { method: "GET" });
}

export async function apiDashboard() {
  return apiCall("/dashboard", { method: "GET" });
}

export async function apiTrendInsights() {
  return apiCall("/admin/trend-insights", { method: "GET" });
}

export async function apiUsageSummary(days = 30) {
  return apiCall(`/admin/usage-summary?days=${days}`, { method: "GET" });
}

export async function apiReviewAnalysis() {
  return apiCall("/admin/review-analysis", { method: "GET" });
}

export async function apiTimingAnalysis(limit = 10) {
  return apiCall(`/admin/timing-analysis?limit=${limit}`, { method: "GET" });
}

export async function apiMonthlySummary(year) {
  return apiCall(`/admin/monthly-summary?year=${year}`, { method: "GET" });
}

export async function apiPassFailByYear() {
  return apiCall("/admin/pass-fail-by-year", { method: "GET" });
}

export async function apiPerformanceReport(year, days = 30) {
  return apiCall(
    `/admin/performance-report?year=${year}&days=${days}`,
    { method: "GET" }
  );
}

export async function apiAttemptTimings(attemptId) {
  return apiCall(
    `/admin/attempt-timings?attempt_id=${encodeURIComponent(attemptId)}`,
    { method: "GET" }
  );
}

export async function apiTest2025() {
  return apiCall("/defense/test-2025", { method: "GET" });
}

export async function apiTest2025Records() {
  return apiCall("/defense/test-2025-records", { method: "GET" });
}

export async function apiTest2025Predict(idx) {
  return apiCall(`/defense/test-2025-predict?idx=${idx}`, { method: "GET" });
}

export async function apiSpecificAttempt(attemptId) {
  return apiCall(`/admin/attempts/${encodeURIComponent(attemptId)}`, {
    method: "GET",
  });
}

// ─── Utility Functions ───────────────────────────────────────────────────

/**
 * Get backend status for UI feedback
 */
export async function getBackendStatus() {
  const isHealthy = await checkBackendHealth();
  return {
    healthy: isHealthy,
    url: API_BASE_URL,
    message: isHealthy
      ? "Backend is online"
      : "Backend is temporarily unavailable. Retrying...",
  };
}

/**
 * Auth token management
 */
export function setAuthToken(token, role, name) {
  if (token) {
    localStorage.setItem("token", token);
    if (role) localStorage.setItem("role", role);
    if (name) localStorage.setItem("name", name);
  }
}

export function getAuthToken() {
  return localStorage.getItem("token");
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("name");
}

export function isAuthenticated() {
  return !!getAuthToken();
}

export function getAuthRole() {
  return localStorage.getItem("role");
}
