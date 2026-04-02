/**
 * useApiCall.js — Custom hook for data fetching with loading & error states
 * Usage: Replaces useState/useEffect pattern with cleaner API call management
 */

import { useState, useCallback, useEffect } from "react";
import { apiCall } from "./api-service";

/**
 * useApiCall hook — Simplifies API calls with automatic loading/error handling
 * 
 * @param {string} endpoint - API endpoint (e.g. "/analytics")
 * @param {object} options - Configuration
 *   - method: "GET" or "POST" (default: "GET")
 *   - body: Request body for POST
 *   - retries: Number of retries (default: 3)
 *   - timeout: Request timeout in ms (default: 15000)
 *   - manual: If true, must call `refetch()` manually (default: false, auto-fetch on mount)
 *   - enabled: If false, don't fetch automatically (default: true)
 *   - onSuccess: Callback on success (data) => {}
 *   - onError: Callback on error (error) => {}
 * 
 * @returns {object}
 *   - data: Response data
 *   - loading: Is loading?
 *   - error: Error message or null
 *   - refetch: Function to manually refetch
 * 
 * Usage:
 * const { data: analytics, loading, error, refetch } = useApiCall("/analytics");
 * if (loading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error}</div>;
 * return <div>{analytics.total_attempts}</div>;
 */
export function useApiCall(endpoint, options = {}) {
  const {
    method = "GET",
    body = null,
    retries = 3,
    timeout = 15000,
    manual = false,
    enabled = true,
    onSuccess = null,
    onError = null,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!manual);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const result = await apiCall(endpoint, {
        method,
        body,
        retries,
        timeout,
      });

      if (result.success) {
        setData(result.data);
        if (onSuccess) onSuccess(result.data);
      } else {
        throw new Error("Request failed");
      }
    } catch (err) {
      const errorMsg = err.message || "An error occurred";
      setError(errorMsg);
      if (onError) onError(err);
      console.error(`API error for ${endpoint}:`, err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, method, body, retries, timeout, enabled, onSuccess, onError]);

  // Auto-fetch on mount unless manual
  useEffect(() => {
    if (!manual && enabled) {
      refetch();
    }
  }, [manual, enabled, refetch]);

  return { data, loading, error, refetch };
}

/**
 * useApiForm hook — For handling form submissions (POST/PUT)
 * 
 * @param {string} endpoint - API endpoint
 * @param {object} options - Same as useApiCall
 * 
 * @returns {object}
 *   - submit: Function to submit form await submit(formData)
 *   - loading: Is submitting?
 *   - error: Error message
 *   - success: Last success response
 * 
 * Usage:
 * const { submit, loading, error, success } = useApiForm("/auth/login");
 * const handleSubmit = async (e) => {
 *   e.preventDefault();
 *   const result = await submit({ email, password });
 *   if (result) { // Success
 *     redirect("/dashboard");
 *   }
 * };
 */
export function useApiForm(endpoint, options = {}) {
  const { retries = 1, timeout = 15000, onSuccess = null, onError = null } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const submit = useCallback(
    async (formData) => {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const result = await apiCall(endpoint, {
          method: "POST",
          body: formData,
          retries,
          timeout,
        });

        if (result.success) {
          setSuccess(result.data);
          if (onSuccess) onSuccess(result.data);
          return result.data;
        } else {
          throw new Error("Request failed");
        }
      } catch (err) {
        const errorMsg = err.message || "Submission failed";
        setError(errorMsg);
        if (onError) onError(err);
        console.error(`Form submission error for ${endpoint}:`, err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, retries, timeout, onSuccess, onError]
  );

  return { submit, loading, error, success };
}

/**
 * Example Usage 1: Simple data fetching
 * 
 * function AnalyticsDashboard() {
 *   const { data, loading, error, refetch } = useApiCall("/analytics");
 * 
 *   if (loading) return <Skeleton />;
 *   if (error) return <ErrorAlert message={error} onRetry={refetch} />;
 * 
 *   return (
 *     <div>
 *       <div>Total: {data?.total_attempts}</div>
 *       <button onClick={refetch}>Refresh</button>
 *     </div>
 *   );
 * }
 */

/**
 * Example Usage 2: Form submission
 * 
 * function LoginForm() {
 *   const [email, setEmail] = useState("");
 *   const [password, setPassword] = useState("");
 *   const { submit, loading, error } = useApiForm("/auth/login", {
 *     onSuccess: (data) => {
 *       localStorage.setItem("token", data.access_token);
 *       navigate("/dashboard");
 *     }
 *   });
 * 
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     await submit({ email, password });
 *   };
 * 
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input value={email} onChange={e => setEmail(e.target.value)} />
 *       <input value={password} onChange={e => setPassword(e.target.value)} />
 *       {error && <p style={{ color: "red" }}>{error}</p>}
 *       <button disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
 *     </form>
 *   );
 * }
 */

/**
 * Example Usage 3: Parallel requests
 * 
 * function Dashboard() {
 *   const analytics = useApiCall("/analytics");
 *   const model = useApiCall("/model-info");
 *   const correlation = useApiCall("/correlation");
 * 
 *   if (analytics.loading || model.loading) return <Loading />;
 *   if (analytics.error || model.error) return <Error />;
 * 
 *   return <DashboardContent data={{ analytics, model, correlation }} />;
 * }
 */

export default useApiCall;
