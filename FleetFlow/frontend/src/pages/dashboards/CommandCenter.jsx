import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dashboardApi } from '@/api/dashboard.api';
import DashboardShell from './DashboardShell';

function CommandCenter() {
    const { user } = useAuth();

    // State
    const [stats, setStats] = useState({
        activeFleet: 0,
        maintenanceAlerts: 0,
        utilizationRate: 0,
        pendingCargo: 0
    });
    const [filters, setFilters] = useState({
        vehicleType: '',
        status: '',
        region: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    // Data Fetching
    const fetchStats = useCallback(async (isAutoRefresh = false) => {
        if (!isAutoRefresh) setIsLoading(true);
        try {
            const response = await dashboardApi.getSummary(filters);
            setStats(response.data.data);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Failed to fetch dashboard summary:', err);
        } finally {
            if (!isAutoRefresh) setIsLoading(false);
        }
    }, [filters]);

    // Initial Fetch & Refresh Logic
    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchStats(true);
        }, 30000); // 30 seconds
        return () => clearInterval(interval);
    }, [fetchStats]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <DashboardShell
            role="FleetManager"
            emoji="🛰️"
            color="#8b5cf6"
            title="Command Center"
            description="Real-time operational overview. Systems are currently nominal."
            user={user}
        >
            <div className="space-y-8 animate-fadeIn">

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mr-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filters
                    </div>

                    <select
                        name="vehicleType"
                        value={filters.vehicleType}
                        onChange={handleFilterChange}
                        className="bg-slate-800 border-none rounded-lg text-sm px-4 py-2 text-slate-200 outline-none ring-1 ring-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                    >
                        <option value="">All Vehicle Types</option>
                        <option value="Truck">Trucks</option>
                        <option value="Van">Vans</option>
                        <option value="Bike">Bikes</option>
                    </select>

                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="bg-slate-800 border-none rounded-lg text-sm px-4 py-2 text-slate-200 outline-none ring-1 ring-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                    >
                        <option value="">All Statuses</option>
                        <option value="Idle">Idle</option>
                        <option value="On Trip">On Trip</option>
                        <option value="In Shop">In Shop</option>
                        <option value="Out of Service">Out of Service</option>
                    </select>

                    <select
                        name="region"
                        value={filters.region}
                        onChange={handleFilterChange}
                        className="bg-slate-800 border-none rounded-lg text-sm px-4 py-2 text-slate-200 outline-none ring-1 ring-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                    >
                        <option value="">All Regions</option>
                        <option value="North">North</option>
                        <option value="South">South</option>
                        <option value="East">East</option>
                        <option value="West">West</option>
                    </select>

                    <div className="ml-auto text-[10px] text-slate-500 font-medium">
                        Last sync: {lastUpdated.toLocaleTimeString()}
                    </div>
                </div>

                {/* KPI Grid */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                        <span className="text-slate-500 font-bold text-sm tracking-widest uppercase animate-pulse">Establishing Secure Link...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {/* Active Fleet */}
                        <div className="relative group overflow-hidden bg-slate-900/40 backdrop-blur-sm border border-slate-800 hover:border-indigo-500/50 rounded-[2rem] p-7 transition-all duration-500 shadow-2xl">
                            <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors" />

                            <div className="flex items-start justify-between mb-6">
                                <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform duration-500">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 00-1 1h1m5-1a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter">Live</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <span className="text-5xl font-black text-white tracking-tight leading-none">
                                    {stats.activeFleet}
                                </span>
                                <h3 className="text-slate-500 text-[11px] font-bold uppercase tracking-widest py-1">Active Fleet</h3>
                            </div>

                            <div className="mt-6 flex items-center gap-2 text-slate-400 text-[10px] font-medium">
                                <span className="text-emerald-400 font-bold">↑ 12%</span>
                                <span>vs last week</span>
                            </div>
                        </div>

                        {/* Maintenance */}
                        <div className="relative group overflow-hidden bg-slate-900/40 backdrop-blur-sm border border-slate-800 hover:border-amber-500/50 rounded-[2rem] p-7 transition-all duration-500 shadow-2xl">
                            <div className="absolute -right-4 -top-4 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors" />

                            <div className="flex items-start justify-between mb-6">
                                <div className={`p-3 rounded-2xl ${stats.maintenanceAlerts > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-500'} group-hover:scale-110 transition-transform duration-500`}>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                {stats.maintenanceAlerts > 0 && (
                                    <span className="text-[10px] bg-red-500 text-white font-black px-2 py-0.5 rounded-md uppercase tracking-tighter animate-bounce">Priority</span>
                                )}
                            </div>

                            <div className="space-y-1">
                                <span className={`text-5xl font-black tracking-tight leading-none ${stats.maintenanceAlerts > 0 ? 'text-amber-400' : 'text-white'}`}>
                                    {stats.maintenanceAlerts}
                                </span>
                                <h3 className="text-slate-500 text-[11px] font-bold uppercase tracking-widest py-1">Maintenance Alerts</h3>
                            </div>

                            <div className="mt-6 flex items-center gap-2 text-slate-400 text-[10px] font-medium">
                                <span className="text-amber-400 font-bold">⚠️ Urgent</span>
                                <span>Check schedule</span>
                            </div>
                        </div>

                        {/* Utilization */}
                        <div className="relative group overflow-hidden bg-slate-900/40 backdrop-blur-sm border border-slate-800 hover:border-blue-500/50 rounded-[2rem] p-7 transition-all duration-500 shadow-2xl">
                            <div className="absolute -right-4 -top-4 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />

                            <div className="flex items-start justify-between mb-6">
                                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform duration-500">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                                <div className="text-blue-400 font-black text-xl tracking-tighter">
                                    {stats.utilizationRate}%
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="w-full bg-slate-800/50 h-2 rounded-full overflow-hidden mb-3">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-1000 ease-out"
                                        style={{ width: `${stats.utilizationRate}%` }}
                                    />
                                </div>
                                <h3 className="text-slate-500 text-[11px] font-bold uppercase tracking-widest py-1">Utilization Rate</h3>
                            </div>

                            <div className="mt-4 flex items-center gap-2 text-slate-400 text-[10px] font-medium">
                                <span className="text-blue-400 font-bold">Stable</span>
                                <span>Optimization optimal</span>
                            </div>
                        </div>

                        {/* Pending Cargo */}
                        <div className="relative group overflow-hidden bg-slate-900/40 backdrop-blur-sm border border-slate-800 hover:border-rose-500/50 rounded-[2rem] p-7 transition-all duration-500 shadow-2xl">
                            <div className="absolute -right-4 -top-4 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl group-hover:bg-rose-500/10 transition-colors" />

                            <div className="flex items-start justify-between mb-6">
                                <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-400 group-hover:scale-110 transition-transform duration-500">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <div className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded text-[10px] text-rose-400 font-black tracking-tighter">
                                    UNASSIGNED
                                </div>
                            </div>

                            <div className="space-y-1">
                                <span className="text-5xl font-black text-white tracking-tight leading-none">
                                    {stats.pendingCargo}
                                </span>
                                <h3 className="text-slate-500 text-[11px] font-bold uppercase tracking-widest py-1">Pending Cargo</h3>
                            </div>

                            <div className="mt-6 flex items-center gap-2 text-slate-400 text-[10px] font-medium">
                                <span className="text-rose-400 font-bold">Action Needed</span>
                                <span>Dispatcher queue</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Extra space for more widgets later */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 opacity-40">
                    <div className="lg:col-span-2 h-64 bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl flex items-center justify-center">
                        <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Live Telemetry Map Incoming</span>
                    </div>
                    <div className="h-64 bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl flex items-center justify-center">
                        <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Driver Feed Syncing</span>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}

export default CommandCenter;
