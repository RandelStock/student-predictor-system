// Centralized API base URL for the frontend.
// CRA reads environment variables that start with `REACT_APP_`.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

export default API_BASE_URL;

