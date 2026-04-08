import axios from "axios";

// ==============================
// AXIOS INSTANCE
// ==============================
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000",
  timeout: 10000, // increased for heavy strategic calculations
});

// ==============================
// GLOBAL ERROR HANDLING
// ==============================
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ API ERROR:", error?.response || error.message);
    return Promise.reject(error);
  }
);

// ==============================
// API CALLS
// ==============================
export const getEndangered = () => API.get("/endangered");
export const getStrategicInsights = () => API.get("/strategic-insights");

export const getStateRisk = () => API.get("/state-risk");

export const getMortalityDetails = () => API.get("/mortality-details");

export const getPerformance = () => API.get("/performance");

export const getPredictions = () => API.get("/predictions");

export const getComparativeAnalysis = () => API.get("/comparative-analysis");

// Dashboard
export const getDashboardData = () => API.get("/state-risk");

// ML Analytics
export const getMLStats = () => API.get("/ml-stats");

export const getAlerts = () => API.get("/alerts");

// ML Prediction
export const runPrediction = (data) => API.post("/predict", data);

// ==============================
// HEALTH CHECK (VERY USEFUL)
// ==============================
export const checkAPI = () => API.get("/");

export default API;