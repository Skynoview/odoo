/**
 * FleetFlow — Axios Instance (API Client)
 *
 * A pre-configured Axios instance that:
 *  - Points at the correct API base URL (reads from Vite env var or falls back to '/api')
 *  - Attaches Authorization header automatically when a token is present
 *  - Handles global 401 responses (token expiry / unauthorised)
 *  - Provides consistent error shape via the response interceptor
 */

import axios from 'axios';

// Vite exposes env vars prefixed with VITE_. In development, Vite proxies /api → :5000
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 15_000,                         // 15-second request timeout
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    withCredentials: true,                   // send cookies cross-origin if needed
});

// ── Request interceptor — attach auth token ───────────────────────────────────
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('fleetflow_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response interceptor — normalise errors ───────────────────────────────────
apiClient.interceptors.response.use(
    // Pass through successful responses unchanged
    (response) => response,

    (error) => {
        const { response } = error;

        if (response) {
            // 401 — clear stored credentials and redirect to login
            if (response.status === 401) {
                localStorage.removeItem('fleetflow_token');
                // Only redirect if not already on the login page
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }

            // Bubble up a consistent error object
            const message =
                response.data?.error?.message ||
                response.data?.message ||
                `Request failed with status ${response.status}`;

            const apiErr = new Error(message);
            apiErr.response = response; // Preserve the full response for detailed handling
            return Promise.reject(apiErr);
        }

        // Network error / no response received
        return Promise.reject(new Error('Network error — please check your connection.'));
    }
);

export default apiClient;
