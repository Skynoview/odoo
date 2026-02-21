/**
 * FleetFlow — ProtectedRoute
 *
 * Renders children only when the user is authenticated.
 * If not logged in → redirect to /login.
 * If roles provided and user role not in list → redirect to their own dashboard.
 *
 * Usage:
 *   <ProtectedRoute>                          // any logged-in user
 *   <ProtectedRoute roles={['FleetManager']}> // specific role(s) only
 */

import { Navigate } from 'react-router-dom';
import { useAuth, ROLE_ROUTES } from '@/context/AuthContext';

function ProtectedRoute({ children, roles }) {
    const { isAuthenticated, user } = useAuth();

    // Not logged in — go to login page
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Role restriction — send user to their own dashboard
    if (roles && user && !roles.includes(user.role)) {
        const ownDashboard = ROLE_ROUTES[user.role] || '/dashboard';
        return <Navigate to={ownDashboard} replace />;
    }

    return children;
}

export default ProtectedRoute;
