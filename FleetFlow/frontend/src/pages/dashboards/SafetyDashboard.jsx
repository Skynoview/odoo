import { useAuth } from '@/context/AuthContext';
import DashboardShell from './DashboardShell';

function SafetyDashboard() {
    const { user } = useAuth();
    return (
        <DashboardShell
            role="SafetyOfficer"
            emoji="🛡️"
            color="#f59e0b"
            title="Safety Officer Dashboard"
            description="Monitor compliance, incidents, inspections, and driver safety scores."
            user={user}
            modules={[
                { icon: '🚨', name: 'Incidents', desc: 'Log & review incidents' },
                { icon: '✅', name: 'Inspections', desc: 'Vehicle inspection records' },
                { icon: '📈', name: 'Safety Score', desc: 'Driver safety analytics' },
                { icon: '📄', name: 'Compliance', desc: 'Regulatory compliance' },
            ]}
        />
    );
}
export default SafetyDashboard;
