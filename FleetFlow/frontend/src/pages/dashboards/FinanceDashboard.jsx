import { useAuth } from '@/context/AuthContext';
import DashboardShell from './DashboardShell';

function FinanceDashboard() {
    const { user } = useAuth();
    return (
        <DashboardShell
            role="FinancialAnalyst"
            emoji="💰"
            color="#ec4899"
            title="Financial Analyst Dashboard"
            description="Track fleet costs, fuel expenses, maintenance budgets, and ROI reports."
            user={user}
            modules={[
                { icon: '💳', name: 'Expenses', desc: 'Track all fleet costs' },
                { icon: '⛽', name: 'Fuel Costs', desc: 'Fuel usage & spend' },
                { icon: '🔧', name: 'Maintenance', desc: 'Maintenance budgets' },
                { icon: '📊', name: 'ROI Reports', desc: 'Fleet return on investment' },
            ]}
        />
    );
}
export default FinanceDashboard;
