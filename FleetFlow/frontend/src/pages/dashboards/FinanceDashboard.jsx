import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { vehicleApi } from '@/api/vehicle.api';
import { fuelApi } from '@/api/fuel.api';
import { financeApi } from '@/api/finance.api';
import DashboardShell from './DashboardShell';

const initialFormState = {
    vehicle_id: '',
    liters: '',
    cost: '',
    fuel_date: new Date().toISOString().slice(0, 16)
};

function FinanceDashboard() {
    const { user } = useAuth();

    // Data State
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicleId, setSelectedVehicleId] = useState('');

    // Selection State data
    const [fuelLogs, setFuelLogs] = useState([]);
    const [financeData, setFinanceData] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form Modal State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    const [formError, setFormError] = useState('');
    const [processing, setProcessing] = useState(false);

    // Initial Load - Get Vehicles
    useEffect(() => {
        const fetchVehicles = async () => {
            setIsLoading(true);
            try {
                const res = await vehicleApi.getVehicles();
                setVehicles(res.data.data || []);
            } catch (err) {
                setError('Failed to fetch vehicles.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchVehicles();
    }, []);

    // Load Specific Vehicle Data
    const loadVehicleData = useCallback(async (vid) => {
        if (!vid) {
            setFuelLogs([]);
            setFinanceData(null);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const [fuelRes, finRes] = await Promise.all([
                fuelApi.getFuelLogs(vid),
                financeApi.getVehicleCosts(vid)
            ]);
            setFuelLogs(fuelRes.data.data || []);
            setFinanceData(finRes.data.data);
        } catch (err) {
            setError('Failed to fetch analytics for this vehicle.');
            setFuelLogs([]);
            setFinanceData(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Trigger load when selection changes
    useEffect(() => {
        loadVehicleData(selectedVehicleId);
    }, [selectedVehicleId, loadVehicleData]);


    // Active vehicles for the dropdown
    const activeVehicles = useMemo(() => vehicles.filter(v => v.status !== 'Out of Service'), [vehicles]);

    // Form Handlers
    const handleOpenForm = () => {
        setFormData({
            ...initialFormState,
            vehicle_id: selectedVehicleId || ''
        });
        setFormError('');
        setIsFormModalOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormModalOpen(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFormError('');
    };

    const validateForm = () => {
        if (!formData.vehicle_id || !formData.liters || !formData.cost || !formData.fuel_date) {
            setFormError('All fields are required.');
            return false;
        }
        if (parseFloat(formData.liters) <= 0 || parseFloat(formData.cost) <= 0) {
            setFormError('Liters and Cost must be numbers greater than 0.');
            return false;
        }
        return true;
    };

    const handleCreateLog = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setProcessing(true);
        setFormError('');
        try {
            const payload = {
                vehicle_id: parseInt(formData.vehicle_id),
                liters: parseFloat(formData.liters),
                cost: parseFloat(formData.cost),
                // JS generates proper UTC string
                fuel_date: new Date(formData.fuel_date).toISOString()
            };

            await fuelApi.createFuelLog(payload);

            // If the vehicle we added for is currently selected, refresh UI
            if (parseInt(formData.vehicle_id) === parseInt(selectedVehicleId)) {
                await loadVehicleData(selectedVehicleId);
            }
            handleCloseForm();
        } catch (err) {
            setFormError(err.response?.data?.error?.message || 'Failed to submit log.');
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteLog = async (id) => {
        if (!window.confirm('Are you sure you want to delete this fuel record? This will impact analytics.')) return;

        try {
            await fuelApi.deleteFuelLog(id);
            await loadVehicleData(selectedVehicleId); // refresh totals
        } catch (err) {
            alert(err.response?.data?.error?.message || 'Failed to delete record.');
        }
    };

    // Rendering Helpers
    const formatCurrency = (amount) => {
        return `$${parseFloat(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <DashboardShell
            role={['FleetManager', 'FinancialAnalyst']}
            emoji="💵"
            color="#ec4899"
            title="Finance & Telemetry"
            description="Manage operational expenditures, analyze fuel efficiency, and track fleet profitability."
            user={user}
        >
            <div className="space-y-6 animate-fadeIn">

                {/* Top Control Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900/40 border border-slate-800 p-4 rounded-3xl shadow-lg backdrop-blur-sm gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <Link to="/manager-dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold mr-2 hidden sm:flex">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Back
                        </Link>
                        <select
                            value={selectedVehicleId}
                            onChange={(e) => setSelectedVehicleId(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-bold appearance-none w-full md:w-[300px] shadow-inner"
                        >
                            <option value="">-- Select Vehicle to Analyze --</option>
                            {vehicles.map(v => (
                                <option key={v.id} value={v.id}>{v.name} ({v.license_plate})</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleOpenForm}
                        className="bg-pink-600 hover:bg-pink-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-pink-500/25 active:scale-95 flex items-center gap-2 w-full md:w-auto justify-center"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Log Fuel Receipt
                    </button>
                </div>

                {/* Dashboard View State */}
                {!selectedVehicleId && !isLoading && (
                    <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl p-20 flex flex-col items-center justify-center text-center opacity-60">
                        <div className="w-20 h-20 bg-pink-500/10 text-pink-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2 tracking-wide">Select An Asset</h2>
                        <p className="text-slate-400 max-w-sm">Choose a vehicle from the dropdown above to load its comprehensive financial profile and operational costs.</p>
                    </div>
                )}

                {isLoading && selectedVehicleId && (
                    <div className="p-20 flex flex-col items-center justify-center gap-4 bg-slate-900 rounded-3xl border border-slate-800">
                        <div className="w-10 h-10 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
                        <span className="text-slate-500 font-bold text-sm tracking-widest uppercase animate-pulse">Running Ledgers...</span>
                    </div>
                )}

                {/* Selected Vehicle Data */}
                {selectedVehicleId && !isLoading && !error && financeData && (
                    <div className="space-y-6 animate-fadeIn">

                        {/* Summary Metrics Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                            {/* Trip Revenue */}
                            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><svg className="w-16 h-16 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                                <h4 className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Gross Rev / Completed</h4>
                                <div className="text-2xl font-black text-emerald-400">{formatCurrency(financeData.totalRevenue)}</div>
                            </div>

                            {/* Fuel Cost */}
                            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><svg className="w-16 h-16 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg></div>
                                <h4 className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Fuel Burn</h4>
                                <div className="text-2xl font-black text-amber-400">{formatCurrency(financeData.totalFuelCost)}</div>
                            </div>

                            {/* Maintenance Cost */}
                            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><svg className="w-16 h-16 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div>
                                <h4 className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Service & Fixes</h4>
                                <div className="text-2xl font-black text-sky-400">{formatCurrency(financeData.totalMaintenanceCost)}</div>
                            </div>

                            {/* Net Profit */}
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/5 to-transparent pointer-events-none group-hover:translate-x-full transition-transform duration-1000"></div>
                                <h4 className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Unit Net Profit</h4>
                                <div className={`text-3xl font-black ${financeData.netProfit >= 0 ? 'text-pink-400' : 'text-rose-500'}`}>
                                    {financeData.netProfit >= 0 ? '+' : ''}{formatCurrency(financeData.netProfit)}
                                </div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase mt-2">Revenue - (Fuel + Maint.)</div>
                            </div>

                        </div>

                        {/* Fuel Logs Table */}
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative mt-8">
                            <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white tracking-widest uppercase">Telemetry: Refueling History</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead>
                                        <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-widest text-[10px] font-black">
                                            <th className="px-6 py-5">Receipt ID</th>
                                            <th className="px-6 py-5">Date / Time (UTC)</th>
                                            <th className="px-6 py-5 text-right">Volume (Liters)</th>
                                            <th className="px-6 py-5 text-right">Cost</th>
                                            <th className="px-6 py-5 text-center">Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {fuelLogs.length === 0 ? (
                                            <tr><td colSpan="5" className="text-center py-10 text-slate-500 font-medium">No fuel logs for this asset.</td></tr>
                                        ) : (
                                            fuelLogs.map(log => (
                                                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className="font-mono text-slate-300 font-bold text-xs">RCPT-{String(log.id).padStart(5, '0')}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-300 font-medium">
                                                        {new Date(log.fuel_date).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-bold text-amber-500">
                                                        {parseFloat(log.liters).toLocaleString()} L
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-black text-emerald-400">
                                                        ${parseFloat(log.cost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => handleDeleteLog(log.id)}
                                                            className="text-slate-500 hover:text-rose-500 transition-colors p-2"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                )}
            </div>

            {/* Create form modal */}
            {isFormModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseForm} />
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden relative shadow-2xl animate-fadeIn">
                        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="p-1.5 bg-pink-500/10 text-pink-500 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg></span>
                                Log Fuel Expense
                            </h3>
                            <button onClick={handleCloseForm} className="text-slate-500 hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6">
                            {formError && (
                                <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-sm font-medium">
                                    {formError}
                                </div>
                            )}
                            <form onSubmit={handleCreateLog} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Target Asset</label>
                                    <select required name="vehicle_id" value={formData.vehicle_id} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-medium appearance-none">
                                        <option value="">-- Choose Assigned Vehicle --</option>
                                        {activeVehicles.map(v => (
                                            <option key={v.id} value={v.id}>{v.name} ({v.license_plate})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pump Volume (Liters)</label>
                                    <input required type="number" step="0.01" min="0.01" name="liters" value={formData.liters} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-medium" placeholder="45.5" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Receipt Amount ($)</label>
                                    <input required type="number" step="0.01" min="0.01" name="cost" value={formData.cost} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-medium" placeholder="120.00" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date / Time of Refuel</label>
                                    <input required type="datetime-local" name="fuel_date" value={formData.fuel_date} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-medium" />
                                </div>

                                <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-800">
                                    <button type="button" onClick={handleCloseForm} className="px-5 py-2.5 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={processing} className="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-pink-500/25 disabled:opacity-50 flex items-center gap-2">
                                        {processing && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                                        Save Document
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </DashboardShell>
    );
}

export default FinanceDashboard;
