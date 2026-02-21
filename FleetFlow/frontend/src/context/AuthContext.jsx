/**
 * FleetFlow — Auth Context
 *
 * Provides global authentication state to the entire app.
 * Wraps login / logout logic and persists JWT in localStorage.
 *
 * Usage:
 *   const { user, token, login, logout, isLoading } = useAuth();
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '@/api/auth.api';

// ── Role → route map ──────────────────────────────────────────────────────────
export const ROLE_ROUTES = {
    FleetManager: '/manager-dashboard',
    Dispatcher: '/dispatcher-dashboard',
    SafetyOfficer: '/safety-dashboard',
    FinancialAnalyst: '/finance-dashboard',
};

const TOKEN_KEY = 'fleetflow_token';
const USER_KEY = 'fleetflow_user';

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem(USER_KEY)); }
        catch { return null; }
    });
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // ── Persist token + user whenever they change ─────────────────────────────
    useEffect(() => {
        if (token) {
            localStorage.setItem(TOKEN_KEY, token);
        } else {
            localStorage.removeItem(TOKEN_KEY);
        }
    }, [token]);

    useEffect(() => {
        if (user) {
            localStorage.setItem(USER_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(USER_KEY);
        }
    }, [user]);

    // ── login ─────────────────────────────────────────────────────────────────
    /**
     * Calls POST /api/auth/login, stores token + user, returns the role
     * so the caller can redirect.
     */
    const login = useCallback(async (email, password) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await authApi.login({ email, password });
            const { token: newToken, user: newUser } = response.data.data;

            setToken(newToken);
            setUser(newUser);

            return newUser.role;   // caller uses this for role-based redirect
        } catch (err) {
            const message = err.message || 'Login failed. Please try again.';
            setError(message);
            throw new Error(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ── logout ────────────────────────────────────────────────────────────────
    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        setError(null);
    }, []);

    // ── clearError ────────────────────────────────────────────────────────────
    const clearError = useCallback(() => setError(null), []);

    const value = { user, token, isLoading, error, login, logout, clearError, isAuthenticated: !!token };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}
