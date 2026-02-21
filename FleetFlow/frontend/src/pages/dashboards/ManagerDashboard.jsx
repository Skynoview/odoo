import { useAuth } from '@/context/AuthContext';
import DashboardShell from './DashboardShell';

function ManagerDashboard() {
    const { user } = useAuth();
    return (
        <DashboardShell
            role="FleetManager"
            emoji="🚛"
            color="#6366f1"
            title="Fleet Manager Dashboard"
            description="Full operational control — vehicles, drivers, trips, and reports."
            user={user}
            modules={[
                { icon: '🚗', name: 'Vehicles', desc: 'Manage fleet inventory' },
                { icon: '👤', name: 'Drivers', desc: 'Driver profiles & status' },
                { icon: '🗺️', name: 'Trips', desc: 'Plan & track live trips' },
                { icon: '📊', name: 'Reports', desc: 'Full analytics suite' },
                { icon: '⚙️', name: 'Settings', desc: 'System configuration' },
                { icon: '👥', name: 'Users', desc: 'Manage team access' },
            ]}
        />
    );
}
export default ManagerDashboard;
