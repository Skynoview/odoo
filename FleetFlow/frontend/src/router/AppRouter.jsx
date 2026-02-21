import { Routes, Route, Navigate } from 'react-router-dom';

// Auth
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ProtectedRoute from '@/components/common/ProtectedRoute';

// Public
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';

// Role dashboards
import ManagerDashboard from '@/pages/dashboards/CommandCenter';
import DispatcherDashboard from '@/pages/dashboards/DispatcherDashboard';
import SafetyDashboard from '@/pages/dashboards/SafetyDashboard';
import FinanceDashboard from '@/pages/dashboards/FinanceDashboard';

function AppRouter() {
    return (
        <Routes>
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Public */}
            <Route path="/dashboard" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Role-based protected dashboards */}
            <Route
                path="/manager-dashboard"
                element={
                    <ProtectedRoute roles={['FleetManager']}>
                        <ManagerDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/dispatcher-dashboard"
                element={
                    <ProtectedRoute roles={['Dispatcher']}>
                        <DispatcherDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/safety-dashboard"
                element={
                    <ProtectedRoute roles={['SafetyOfficer']}>
                        <SafetyDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/finance-dashboard"
                element={
                    <ProtectedRoute roles={['FinancialAnalyst']}>
                        <FinanceDashboard />
                    </ProtectedRoute>
                }
            />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

export default AppRouter;
