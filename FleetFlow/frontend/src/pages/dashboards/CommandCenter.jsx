import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
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

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    <Link to="/manager-dashboard/maintenance" className="h-64 group relative overflow-hidden bg-slate-900/40 backdrop-blur-sm border border-slate-800 hover:border-pink-500/50 rounded-3xl p-8 flex flex-col justify-end transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-t from-pink-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl group-hover:bg-pink-500/20 transition-colors" />

                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-pink-500/10 text-pink-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Service Bay</h3>
                            <p className="text-slate-400 text-sm">Monitor repair costs, schedule maintenance, and log active tickets.</p>
                        </div>
                    </Link>
                    <Link to="/manager-dashboard/finance" className="h-64 group relative overflow-hidden bg-slate-900/40 backdrop-blur-sm border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-8 flex flex-col justify-end transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors" />

                        <div className="relative z-10 w-full">
                            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Finance & Fuel</h3>
                            <p className="text-slate-400 text-sm">Analyze operational expenditures vs. trip revenues.</p>
                        </div>
                    </Link>
                    <Link to="/manager-dashboard/vehicles" className="h-64 group relative overflow-hidden bg-slate-900/40 backdrop-blur-sm border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-8 flex flex-col justify-end transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors" />

                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Vehicle Registry</h3>
                            <p className="text-slate-400 text-sm">Manage fleet assets, add new vehicles, and update configurations.</p>
                        </div>
                    </Link>
                    <Link to="/manager-dashboard/safety" className="h-64 group relative overflow-hidden bg-slate-900/40 backdrop-blur-sm border border-slate-800 hover:border-blue-500/50 rounded-3xl p-8 flex flex-col justify-end transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors" />

                        <div className="relative z-10 w-full">
                            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Driver Safety</h3>
                            <p className="text-slate-400 text-sm">Monitor incident reports and track completion rates.</p>
                        </div>
                    </Link>
                </div>
            </div>
        </DashboardShell>
    );
}

export default CommandCenter;
