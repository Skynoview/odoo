import { useAuth } from '@/context/AuthContext';
import DashboardShell from './DashboardShell';

function DispatcherDashboard() {
    const { user } = useAuth();
    return (
        <DashboardShell
            role="Dispatcher"
            emoji="📡"
            color="#22c55e"
            title="Dispatcher Dashboard"
            description="Coordinate live dispatch operations, assign drivers, and monitor routes."
            user={user}
            modules={[
                { icon: '🗺️', name: 'Live Map', desc: 'Real-time vehicle tracking' },
                { icon: '📋', name: 'Assignments', desc: 'Assign drivers to trips' },
                { icon: '🚦', name: 'Trip Status', desc: 'Monitor active trips' },
                { icon: '📞', name: 'Comms', desc: 'Driver communication' },
            ]}
        />
    );
}
export default DispatcherDashboard;
