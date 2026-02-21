import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { tripApi } from '@/api/trip.api';
import { vehicleApi } from '@/api/vehicle.api';
import { driverApi } from '@/api/driver.api';
import DashboardShell from './DashboardShell';

const initialFormState = {
    origin: '',
    destination: '',
    cargo_weight: '',
    vehicle_id: '',
    driver_id: '',
    revenue: ''
};

function DispatcherDashboard() {
    const { user } = useAuth();

    // Data State
    const [trips, setTrips] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form Modal State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    const [formError, setFormError] = useState('');
    const [processing, setProcessing] = useState(false);

    // Status Confirmation Modal State
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [targetTrip, setTargetTrip] = useState(null);
    const [targetStatus, setTargetStatus] = useState('');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
                tripApi.getTrips(),
                vehicleApi.getVehicles(),
                driverApi.getDrivers()
            ]);

            setTrips(tripsRes.data.data || []);
            setVehicles(vehiclesRes.data.data || []);
            setDrivers(driversRes.data.data || []);
        } catch (err) {
            setError('Failed to fetch dispatcher data. Please refresh.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const availableVehicles = useMemo(() => vehicles.filter(v => v.status === 'Idle'), [vehicles]);
    const availableDrivers = useMemo(() => drivers.filter(d => d.status === 'On Duty'), [drivers]);

    // Form Interactions
    const handleOpenForm = () => {
        setFormData(initialFormState);
        setFormError('');
        setIsFormModalOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormModalOpen(false);
        setFormData(initialFormState);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFormError(''); // clear error on change
    };

    const validateForm = () => {
        if (!formData.origin || !formData.destination || !formData.cargo_weight) {
            setFormError('Origin, Destination, and Cargo Weight are required.');
            return false;
        }

        const weight = parseFloat(formData.cargo_weight);
        if (isNaN(weight) || weight < 0) {
            setFormError('Cargo Weight must be a valid positive number.');
            return false;
        }

        if (formData.vehicle_id) {
            const selectedVehicle = vehicles.find(v => v.id.toString() === formData.vehicle_id);
            if (selectedVehicle && weight > parseFloat(selectedVehicle.max_load_capacity)) {
                setFormError(`Cargo weight (${weight} kg) exceeds ${selectedVehicle.name}'s max capacity (${selectedVehicle.max_load_capacity} kg).`);
                return false;
            }
        }

        return true;
    };

    const handleCreateTrip = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setProcessing(true);
        setFormError('');
        try {
            const payload = {
                ...formData,
                cargo_weight: parseFloat(formData.cargo_weight),
                revenue: formData.revenue ? parseFloat(formData.revenue) : null,
                vehicle_id: formData.vehicle_id ? parseInt(formData.vehicle_id) : null,
                driver_id: formData.driver_id ? parseInt(formData.driver_id) : null
            };

            await tripApi.createTrip(payload);
            await fetchData(); // Refresh data to get new trip, vehicles and drivers
            handleCloseForm();
        } catch (err) {
            setFormError(err.response?.data?.error?.message || 'Failed to create trip.');
        } finally {
            setProcessing(false);
        }
    };

    // Status Interactions
    const confirmStatusChange = (trip, newStatus) => {
        setTargetTrip(trip);
        setTargetStatus(newStatus);
        setIsStatusModalOpen(true);
    };

    const executeStatusChange = async () => {
        setProcessing(true);
        try {
            await tripApi.updateTripStatus(targetTrip.id, targetStatus);
            await fetchData(); // refresh entire layout to update trips & dropdowns
            setIsStatusModalOpen(false);
            setTargetTrip(null);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error?.message || 'Failed to update status.');
        } finally {
            setProcessing(false);
        }
    };

    // Styling helpers
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Draft': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
            case 'Dispatched': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'Completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'Cancelled': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    return (
        <DashboardShell
            role="Dispatcher"
            emoji="📡"
            color="#22c55e"
            title="Trip Dispatcher"
            description="Coordinate live dispatch operations, assign drivers, and monitor routes in real-time."
            user={user}
        >
            <div className="space-y-6 animate-fadeIn">
                {/* Header Actions */}
                <div className="flex justify-between items-center bg-slate-900/40 border border-slate-800 p-4 rounded-3xl shadow-lg backdrop-blur-sm">
                    <div className="flex gap-4 items-center">
                        <div className="text-sm font-bold text-slate-400 px-4 py-2 bg-slate-950 rounded-xl border border-slate-800 inline-flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            Available Drivers: <span className="text-white">{availableDrivers.length}</span>
                        </div>
                        <div className="text-sm font-bold text-slate-400 px-4 py-2 bg-slate-950 rounded-xl border border-slate-800 inline-flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            Available Vehicles: <span className="text-white">{availableVehicles.length}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleOpenForm}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-95 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Draft New Trip
                    </button>
                </div>

                {/* Main Dashboard Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
                    {isLoading && trips.length === 0 ? (
                        <div className="p-20 flex flex-col items-center justify-center gap-4">
                            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                            <span className="text-slate-500 font-bold text-sm tracking-widest uppercase animate-pulse">Syncing Dispatch...</span>
                        </div>
                    ) : error ? (
                        <div className="p-10 text-center text-rose-400 font-bold">{error}</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead>
                                    <tr className="bg-slate-950/50 border-b border-slate-800 text-slate-400 uppercase tracking-widest text-[10px] font-black">
                                        <th className="px-6 py-5">Trip ID</th>
                                        <th className="px-6 py-5">Route</th>
                                        <th className="px-6 py-5">Cargo / Rev</th>
                                        <th className="px-6 py-5">Assigned Asset</th>
                                        <th className="px-6 py-5">Status</th>
                                        <th className="px-6 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {trips?.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center py-10 text-slate-500">No trips recorded.</td></tr>
                                    ) : (
                                        trips?.map(trip => (
                                            <tr key={trip.id} className="hover:bg-slate-800/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-slate-300 font-bold">#{String(trip.id).padStart(5, '0')}</span>
                                                </td>
                                                <td className="px-6 py-4 min-w-[200px]">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex flex-col items-center justify-center gap-1 opacity-50">
                                                            <div className="w-2 h-2 rounded-full border border-slate-400"></div>
                                                            <div className="w-0.5 h-3 bg-slate-600"></div>
                                                            <div className="w-2 h-2 rounded-full border border-slate-400 bg-slate-400"></div>
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-white font-bold text-xs">{trip.origin}</span>
                                                            <span className="text-slate-300 font-medium text-xs">{trip.destination}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-slate-200 font-medium">{parseFloat(trip.cargo_weight).toLocaleString()} kg</div>
                                                    {trip.revenue && <div className="text-emerald-400 text-[11px] font-bold">${parseFloat(trip.revenue).toLocaleString()}</div>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {trip.vehicle_name ? (
                                                        <div>
                                                            <div className="text-emerald-300 font-bold">{trip.driver_name || 'No Driver'}</div>
                                                            <div className="text-slate-400 text-[11px]">{trip.vehicle_name} ({trip.license_plate})</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-600 italic">Unassigned</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(trip.status)}`}>
                                                        {trip.status}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {trip.status === 'Draft' && trip.vehicle_id && trip.driver_id && (
                                                        <button
                                                            onClick={() => confirmStatusChange(trip, 'Dispatched')}
                                                            className="px-3 py-1.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white rounded-lg font-bold text-xs transition-colors border border-amber-500/20 ml-2"
                                                        >
                                                            Dispatch
                                                        </button>
                                                    )}
                                                    {trip.status === 'Dispatched' && (
                                                        <button
                                                            onClick={() => confirmStatusChange(trip, 'Completed')}
                                                            className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg font-bold text-xs transition-colors border border-emerald-500/20 ml-2"
                                                        >
                                                            Complete
                                                        </button>
                                                    )}
                                                    {(trip.status === 'Draft' || trip.status === 'Dispatched') && (
                                                        <button
                                                            onClick={() => confirmStatusChange(trip, 'Cancelled')}
                                                            className="px-3 py-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg font-bold text-xs transition-colors border border-rose-500/20 ml-2"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Trip Form Modal */}
            {isFormModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseForm} />
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden relative shadow-2xl animate-fadeIn">
                        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg></span>
                                Draft New Trip
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
                            <form onSubmit={handleCreateTrip} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Origin Address</label>
                                        <input required name="origin" value={formData.origin} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium" placeholder="Warehouse A, City" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Destination Address</label>
                                        <input required name="destination" value={formData.destination} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium" placeholder="Store B, City" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Payload Weight (KG)</label>
                                        <input required type="number" step="0.01" min="0" name="cargo_weight" value={formData.cargo_weight} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium" placeholder="1050" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Expected Revenue ($)</label>
                                        <input type="number" step="0.01" min="0" name="revenue" value={formData.revenue} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium" placeholder="500.00" />
                                    </div>

                                    <div className="space-y-1.5 sm:col-span-2 pt-2 border-t border-slate-800">
                                        <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Asset Assignment</label>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Assign Vehicle</label>
                                        <select name="vehicle_id" value={formData.vehicle_id} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium appearance-none">
                                            <option value="">-- Leave Unassigned --</option>
                                            {availableVehicles.map(v => (
                                                <option key={v.id} value={v.id}>{v.name} ({v.license_plate}) - Cap: {v.max_load_capacity}kg</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Assign Driver</label>
                                        <select name="driver_id" value={formData.driver_id} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium appearance-none">
                                            <option value="">-- Leave Unassigned --</option>
                                            {availableDrivers.map(d => (
                                                <option key={d.id} value={d.id}>{d.name} ({d.license_number})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-800">
                                    <button type="button" onClick={handleCloseForm} className="px-5 py-2.5 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                                        Discard
                                    </button>
                                    <button type="submit" disabled={processing} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 flex items-center gap-2">
                                        {processing && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                                        Create Draft
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Change Confirmation Modal */}
            {isStatusModalOpen && targetTrip && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsStatusModalOpen(false)} />
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 relative shadow-2xl animate-fadeIn text-center">
                        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${targetStatus === 'Dispatched' ? 'bg-amber-500/10 text-amber-500' :
                            targetStatus === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' :
                                'bg-rose-500/10 text-rose-500'
                            }`}>
                            {targetStatus === 'Dispatched' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                            {targetStatus === 'Completed' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                            {targetStatus === 'Cancelled' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Confirm {targetStatus}</h3>
                        <p className="text-slate-400 text-sm mb-6">
                            Changing Trip <span className="text-white font-mono">#{String(targetTrip.id).padStart(5, '0')}</span> to {targetStatus}.
                            {targetStatus === 'Dispatched' && ' This will mark assets as On Trip/Assigned.'}
                            {(targetStatus === 'Completed' || targetStatus === 'Cancelled') && ' This will release assigned assets back to Available/Idle.'}
                        </p>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setIsStatusModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-300 hover:bg-slate-800 transition-colors">
                                Abort
                            </button>
                            <button
                                onClick={executeStatusChange}
                                disabled={processing}
                                className={`flex-1 px-4 py-2.5 rounded-xl font-bold transition-colors ${targetStatus === 'Dispatched' ? 'bg-amber-600 hover:bg-amber-500 text-white' :
                                    targetStatus === 'Completed' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' :
                                        'bg-rose-600 hover:bg-rose-500 text-white'
                                    }`}
                            >
                                {processing ? 'Running...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardShell>
    );
}

export default DispatcherDashboard;
