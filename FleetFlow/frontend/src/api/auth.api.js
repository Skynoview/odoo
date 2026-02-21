/**
 * FleetFlow — Auth API Service
 * Wraps all /api/auth endpoints.
 */

import apiClient from './apiClient';

export const authApi = {
    /**
     * POST /api/auth/login
     * @param {{ email: string, password: string }} credentials
     */
    login: (credentials) => apiClient.post('/auth/login', credentials),

    /**
     * POST /api/auth/register
     * @param {{ name: string, email: string, password: string, role?: string }} data
     */
    register: (data) => apiClient.post('/auth/register', data),

    /**
     * GET /api/auth/me  — verify token + get current user from server
     */
    me: () => apiClient.get('/auth/me'),
};
