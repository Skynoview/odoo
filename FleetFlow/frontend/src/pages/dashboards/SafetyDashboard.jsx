import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { driverApi } from '@/api/driver.api';
import DashboardShell from './DashboardShell';

function SafetyDashboard() {
    const { user } = useAuth();

    // Data State
    const [drivers, setDrivers] = useState([]);
    const [selectedDriverId, setSelectedDriverId] = useState('');

    // Performance Data
    const [performanceData, setPerformanceData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusUpdating, setStatusUpdating] = useState(false);

    // Initial Load
    useEffect(() => {
        const fetchDrivers = async () => {
            setIsLoading(true);
            try {
                const res = await driverApi.getDrivers();
                setDrivers(res.data.data || []);
            } catch (err) {
                setError('Failed to fetch drivers catalog.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDrivers();
    }, []);

    const loadDriverData = useCallback(async (id) => {
        if (!id) {
            setPerformanceData(null);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const res = await driverApi.getDriverPerformance(id);
            setPerformanceData(res.data.data);
        } catch (err) {
            setError('Failed to load performance metrics.');
            setPerformanceData(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDriverData(selectedDriverId);
    }, [selectedDriverId, loadDriverData]);

    const handleStatusUpdate = async (newStatus) => {
        if (!selectedDriverId || !performanceData) return;
        setStatusUpdating(true);
        try {
            await driverApi.updateDriverStatus(selectedDriverId, newStatus);
            setPerformanceData(prev => ({ ...prev, status: newStatus }));
            // Also update the local list so dropdown displays correctly if it relied on it
            setDrivers(prev => prev.map(d => d.id === selectedDriverId ? { ...d, status: newStatus } : d));
        } catch (err) {
            alert(err.response?.data?.error?.message || 'Failed to update status.');
        } finally {
            setStatusUpdating(false);
        }
    };

    const isLicenceExpired = (expiryDate) => {
        if (!expiryDate) return true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiry = new Date(expiryDate);
        return expiry < today;
    };

    return (
        <DashboardShell
            role={['FleetManager', 'SafetyOfficer']}
            emoji="🛡️"
            color="#3b82f6"
            title="Safety & Performance"
            description="Monitor incident reports, track completion rates, and manage driver duty states."
            user={user}
        >
            <div className="space-y-6 animate-fadeIn">

                {/* Control Header */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900/40 border border-slate-800 p-4 rounded-3xl shadow-lg backdrop-blur-sm gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <Link to="/manager-dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold mr-2 hidden sm:flex">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Back
                        </Link>
                        <select
                            value={selectedDriverId}
                            onChange={(e) => setSelectedDriverId(parseInt(e.target.value))}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-bold appearance-none w-full md:w-[320px] shadow-inner"
                        >
                            <option value="">-- Select Courier / Driver --</option>
                            {drivers.map(d => (
                                <option key={d.id} value={d.id}>{d.name} ({d.license_number})</option>
                            ))}
                        </select>
                    </div>
                </div>

                {!selectedDriverId && !isLoading && (
                    <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl p-20 flex flex-col items-center justify-center text-center opacity-60">
                        <div className="w-20 h-20 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2 tracking-wide">Select Operator Profile</h2>
                        <p className="text-slate-400 max-w-sm">Choose a driver to load their risk indicators, historical incidents, and dispatch metrics.</p>
                    </div>
                )}

                {isLoading && selectedDriverId && (
                    <div className="p-20 flex flex-col items-center justify-center gap-4 bg-slate-900 rounded-3xl border border-slate-800">
                        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                        <span className="text-slate-500 font-bold text-sm tracking-widest uppercase animate-pulse">Scanning Databases...</span>
                    </div>
                )}

                {/* Main Profile Data */}
                {selectedDriverId && !isLoading && !error && performanceData && (
                    <div className="space-y-6 animate-fadeIn">

                        {/* Profile Header Card */}
                        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row gap-8 items-center md:items-start justify-between">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                            {/* Identity Base */}
                            <div className="flex gap-6 items-center w-full md:w-auto z-10">
                                <div className="w-20 h-20 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center shadow-inner relative overflow-hidden group">
                                    <svg className="w-10 h-10 text-slate-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    <div className={`absolute bottom-0 w-full h-1 ${performanceData.status === 'On Duty' ? 'bg-emerald-500' : performanceData.status === 'Suspended' ? 'bg-rose-500' : 'bg-slate-500'}`} />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-2xl font-black text-white">{performanceData.name}</h2>
                                    <div className="flex items-center gap-3 mt-1">
                                        <div className="text-slate-400 font-mono text-sm uppercase tracking-widest">{performanceData.license_number}</div>
                                        <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                                        <div className="text-slate-400 text-sm font-medium">{performanceData.region || 'Global'}</div>
                                    </div>
                                    <div className="mt-3 flex gap-2 w-full max-w-[200px]">
                                        <select
                                            value={performanceData.status}
                                            onChange={(e) => handleStatusUpdate(e.target.value)}
                                            disabled={statusUpdating}
                                            className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border outline-none appearance-none cursor-pointer transition-colors w-full
                                                ${performanceData.status === 'On Duty' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/50' :
                                                    performanceData.status === 'Suspended' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:border-rose-500/50' :
                                                        'bg-slate-500/10 text-slate-400 border-slate-500/20 hover:border-slate-500/50'}
                                                disabled:opacity-50`}
                                        >
                                            <option value="On Duty">On Duty</option>
                                            <option value="Off Duty">Off Duty</option>
                                            <option value="Suspended">Suspended</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Core Stats Row */}
                            <div className="flex gap-4 md:gap-8 w-full md:w-auto flex-wrap md:flex-nowrap z-10 border-t md:border-t-0 border-slate-800 pt-6 md:pt-0">

                                {/* License State */}
                                <div className="flex flex-col min-w-[120px]">
                                    <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-1">Licence Valid</span>
                                    {isLicenceExpired(performanceData.license_expiry) ? (
                                        <div className="flex items-center gap-2 text-rose-400 font-bold bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                            EXPIRED {performanceData.license_expiry ? `(${new Date(performanceData.license_expiry).toLocaleDateString()})` : ''}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-slate-300 font-medium px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
                                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {new Date(performanceData.license_expiry).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>

                                {/* Safety Score Radial/Bar */}
                                <div className="flex flex-col flex-1 min-w-[150px]">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Safety Score</span>
                                        <span className={`text-lg font-black ${performanceData.safetyScore >= 80 ? 'text-emerald-400' : performanceData.safetyScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                                            {performanceData.safetyScore}/100
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-950 rounded-full h-2.5 shadow-inner overflow-hidden border border-slate-800">
                                        <div className={`h-2.5 rounded-full transition-all duration-1000 ${performanceData.safetyScore >= 80 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : performanceData.safetyScore >= 50 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`} style={{ width: `${Math.max(0, Math.min(100, performanceData.safetyScore))}%` }}></div>
                                    </div>
                                </div>

                                {/* Completion Rate Bar */}
                                <div className="flex flex-col flex-1 min-w-[150px]">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Target Completion</span>
                                        <span className="text-lg font-black text-blue-400">
                                            {performanceData.completionRate}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-950 rounded-full h-2.5 shadow-inner overflow-hidden border border-slate-800">
                                        <div className="bg-blue-500 h-2.5 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000" style={{ width: `${performanceData.completionRate}%` }}></div>
                                    </div>
                                    <div className="text-right text-[10px] text-slate-500 font-bold mt-1 tracking-wider uppercase">{performanceData.completedTrips} / {performanceData.totalTrips} Trips</div>
                                </div>
                            </div>
                        </div>

                        {/* Split Data Tables */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                            {/* Trip History Box */}
                            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col h-[500px]">
                                <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between z-10">
                                    <h3 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2">
                                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        Logistics Ledger
                                    </h3>
                                    <span className="text-xs font-bold text-slate-500 bg-slate-900 px-3 py-1 rounded-full shadow-inner">{performanceData.totalTrips} Entries</span>
                                </div>
                                <div className="overflow-y-auto flex-1 custom-scrollbar">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="sticky top-0 bg-slate-900 shadow-md">
                                            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-widest text-[10px] font-black">
                                                <th className="px-6 py-4">Manifest</th>
                                                <th className="px-6 py-4">Route Info</th>
                                                <th className="px-6 py-4">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/50">
                                            {performanceData.tripHistory.length === 0 ? (
                                                <tr><td colSpan="3" className="text-center py-10 text-slate-600 font-medium">No logistical history recorded.</td></tr>
                                            ) : (
                                                performanceData.tripHistory.map(trip => (
                                                    <tr key={trip.id} className="hover:bg-slate-800/30 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-mono text-slate-300 font-bold text-xs">#{String(trip.id).padStart(5, '0')}</div>
                                                            <div className="text-[10px] text-slate-500 mt-0.5">{new Date(trip.created_at).toLocaleDateString()}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-white font-bold text-[11px] truncate max-w-[150px]">{trip.origin}</span>
                                                                <span className="text-slate-400 font-medium text-[11px] truncate max-w-[150px]">{trip.destination}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border
                                                                ${trip.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                                    trip.status === 'Dispatched' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                                        trip.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                                                            'bg-slate-500/10 text-slate-400 border-slate-500/20'}
                                                            `}>
                                                                {trip.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Incidents Box */}
                            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col h-[500px]">
                                <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between z-10">
                                    <h3 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2">
                                        <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        Safety Incidents
                                    </h3>
                                    <span className="text-xs font-bold text-slate-500 bg-slate-900 px-3 py-1 rounded-full shadow-inner">{performanceData.incidentCount} Alerts</span>
                                </div>
                                <div className="overflow-y-auto flex-1 custom-scrollbar">
                                    {performanceData.incidentHistory.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center p-10 opacity-60">
                                            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 flex items-center justify-center rounded-2xl mb-4 rotate-3"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                                            <span className="text-emerald-400 font-bold tracking-widest uppercase text-xs">Clean Record</span>
                                            <p className="text-slate-500 text-xs mt-2 text-center">No safety incidents or infractions reported for this driver.</p>
                                        </div>
                                    ) : (
                                        <div className="p-4 space-y-4">
                                            {performanceData.incidentHistory.map(inc => (
                                                <div key={inc.id} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex gap-4">
                                                    <div className="mt-1">
                                                        <div className="w-8 h-8 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center"><svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
                                                    </div>
                                                    <div>
                                                        <div className="text-slate-200 text-sm leading-relaxed">{inc.description}</div>
                                                        <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mt-3 pt-3 border-t border-slate-800">
                                                            Occurred: <span className="text-slate-400 font-mono">{new Date(inc.incident_date).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </DashboardShell>
    );
}

export default SafetyDashboard;
