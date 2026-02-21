import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { vehicleApi } from '@/api/vehicle.api';
import DashboardShell from './DashboardShell';

const initialFormState = {
    name: '',
    model: '',
    license_plate: '',
    max_load_capacity: '',
    odometer: '',
    status: 'Idle',
    vehicle_type: 'Truck',
    region: ''
};

function VehicleRegistry() {
    const { user } = useAuth();

    const [vehicles, setVehicles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State definition
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Form and Target item state
    const [formData, setFormData] = useState(initialFormState);
    const [editingId, setEditingId] = useState(null);
    const [targetVehicle, setTargetVehicle] = useState(null);

    const [processing, setProcessing] = useState(false);
    const [formError, setFormError] = useState('');

    const fetchVehicles = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await vehicleApi.getVehicles();
            setVehicles(res.data.data || []);
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to fetch vehicles.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVehicles();
    }, [fetchVehicles]);

    // Form Interactions
    const handleOpenForm = (vehicle = null) => {
        if (vehicle) {
            setFormData({
                name: vehicle.name,
                model: vehicle.model,
                license_plate: vehicle.license_plate,
                max_load_capacity: vehicle.max_load_capacity,
                odometer: vehicle.odometer,
                status: vehicle.status,
                vehicle_type: vehicle.vehicle_type,
                region: vehicle.region
            });
            setEditingId(vehicle.id);
        } else {
            setFormData(initialFormState);
            setEditingId(null);
        }
        setFormError('');
        setIsFormModalOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormModalOpen(false);
        setFormData(initialFormState);
        setEditingId(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setProcessing(true);

        try {
            // Ensure numerics
            const payload = {
                ...formData,
                max_load_capacity: formData.max_load_capacity === '' ? 0 : parseFloat(formData.max_load_capacity),
                odometer: formData.odometer === '' ? 0 : parseInt(formData.odometer, 10),
            };

            if (editingId) {
                await vehicleApi.updateVehicle(editingId, payload);
            } else {
                await vehicleApi.createVehicle(payload);
            }
            fetchVehicles(); // refresh list
            handleCloseForm();
        } catch (err) {
            setFormError(err.response?.data?.error?.message || 'An error occurred while saving.');
        } finally {
            setProcessing(false);
        }
    };

    // Delete / Change Status interaction
    const handleToggleStatus = async (vehicle) => {
        setProcessing(true);
        try {
            if (vehicle.status !== 'Out of Service') {
                // Perform soft delete
                await vehicleApi.deleteVehicle(vehicle.id);
            } else {
                // Bring back into service by updating status
                await vehicleApi.updateVehicle(vehicle.id, { status: 'Idle' });
            }
            fetchVehicles();
        } catch (err) {
            console.error('Status Error:', err);
            alert('Failed to update vehicle status.');
        } finally {
            setProcessing(false);
            setIsDeleteModalOpen(false);
        }
    };

    const confirmToggleStatus = (vehicle) => {
        setTargetVehicle(vehicle);
        setIsDeleteModalOpen(true);
    };

    // Color helpers
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Idle': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'On Trip': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'In Shop': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'Out of Service': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    return (
        <DashboardShell
            role="FleetManager"
            emoji="🚛"
            color="#3b82f6"
            title="Vehicle Registry"
            description="Manage your entire fleet catalog. Add, update, or remove transport assets."
            user={user}
        >
            <div className="space-y-6 animate-fadeIn">

                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <Link to="/manager-dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Command Center
                    </Link>
                    <button
                        onClick={() => handleOpenForm()}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Register New Vehicle
                    </button>
                </div>

                {/* Main Table Container */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
                    {/* Inner Loader overlay if refreshing */}
                    {isLoading && vehicles.length === 0 ? (
                        <div className="p-20 flex flex-col items-center justify-center gap-4">
                            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                            <span className="text-slate-500 font-bold text-sm tracking-widest uppercase animate-pulse">Fetching Registry...</span>
                        </div>
                    ) : error ? (
                        <div className="p-10 text-center">
                            <div className="text-rose-400 font-bold mb-2">Error Loading Registry</div>
                            <div className="text-slate-500 text-sm">{error}</div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead>
                                    <tr className="bg-slate-950/50 border-b border-slate-800 text-slate-400 uppercase tracking-widest text-[10px] font-black">
                                        <th className="px-6 py-5">Vehicle Name</th>
                                        <th className="px-6 py-5">Plate ID</th>
                                        <th className="px-6 py-5">Type / Region</th>
                                        <th className="px-6 py-5">Max Load / Odometer</th>
                                        <th className="px-6 py-5">Status</th>
                                        <th className="px-6 py-5 text-right w-32">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {vehicles.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                                No vehicles found in the registry.
                                            </td>
                                        </tr>
                                    ) : (
                                        vehicles.map(vh => (
                                            <tr key={vh.id} className="hover:bg-slate-800/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="text-white font-bold">{vh.name}</div>
                                                    <div className="text-slate-500 text-[11px]">{vh.model}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded text-xs font-bold ring-1 ring-indigo-500/20">{vh.license_plate}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-slate-200">{vh.vehicle_type}</div>
                                                    <div className="text-slate-500 text-[11px] font-bold uppercase">{vh.region}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-slate-200">{parseFloat(vh.max_load_capacity).toLocaleString()} kg</div>
                                                    <div className="text-slate-500 text-[11px]">{parseInt(vh.odometer).toLocaleString()} miles</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(vh.status)}`}>
                                                        {vh.status}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleOpenForm(vh)}
                                                            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                                                            title="Edit Vehicle"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                        </button>
                                                        <button
                                                            onClick={() => confirmToggleStatus(vh)}
                                                            className={`p-2 rounded-lg transition-colors ${vh.status === 'Out of Service' ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-rose-500 hover:bg-rose-500/10'}`}
                                                            title={vh.status === 'Out of Service' ? "Return to Service" : "Set Out of Service"}
                                                        >
                                                            {vh.status === 'Out of Service' ? (
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                            ) : (
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            )}
                                                        </button>
                                                    </div>
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

            {/* Custom Modal for Form (Add/Edit) */}
            {isFormModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseForm} />
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden relative shadow-2xl animate-fadeIn">
                        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
                            <h3 className="text-lg font-bold text-white">{editingId ? 'Edit Vehicle' : 'Register New Vehicle'}</h3>
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
                            <form onSubmit={handleFormSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">General Name</label>
                                        <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium" placeholder="e.g. Titan Prime" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Model</label>
                                        <input required name="model" value={formData.model} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium" placeholder="e.g. Ford Transit" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">License Plate</label>
                                        <input required name="license_plate" value={formData.license_plate} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium font-mono" placeholder="FL-001" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Region</label>
                                        <input required name="region" value={formData.region} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium" placeholder="North, South, East, West" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Max Load (KG)</label>
                                        <input required type="number" step="0.01" min="0" name="max_load_capacity" value={formData.max_load_capacity} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium" placeholder="1000" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Odometer</label>
                                        <input required type="number" min="0" name="odometer" value={formData.odometer} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium" placeholder="12500" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vehicle Type</label>
                                        <select name="vehicle_type" value={formData.vehicle_type} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium appearance-none">
                                            <option value="Truck">Truck</option>
                                            <option value="Van">Van</option>
                                            <option value="Bike">Bike</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</label>
                                        <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium appearance-none">
                                            <option value="Idle">Idle</option>
                                            {editingId && (
                                                // Only allow these on edit normally, or let any?
                                                // It's a registry, they can set it to whatever.
                                                <>
                                                    <option value="On Trip">On Trip</option>
                                                    <option value="In Shop">In Shop</option>
                                                    <option value="Out of Service">Out of Service</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                </div>
                                <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-800">
                                    <button type="button" onClick={handleCloseForm} className="px-5 py-2.5 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={processing} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 flex items-center gap-2">
                                        {processing && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                                        {editingId ? 'Save Changes' : 'Register Vehicle'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Dialog for Soft Delete / Restore */}
            {isDeleteModalOpen && targetVehicle && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 relative shadow-2xl animate-fadeIn text-center">
                        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${targetVehicle.status === 'Out of Service' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {targetVehicle.status === 'Out of Service' ? (
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            ) : (
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            )}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            {targetVehicle.status === 'Out of Service' ? 'Restore Vehicle?' : 'Remove from Service?'}
                        </h3>
                        <p className="text-slate-400 text-sm mb-6">
                            {targetVehicle.status === 'Out of Service'
                                ? `Are you sure you want to bring "${targetVehicle.name}" back into active idle service?`
                                : `This will mark "${targetVehicle.name}" as Out of Service. It will no longer be available for dispatch.`}
                        </p>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-300 hover:bg-slate-800 transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={() => handleToggleStatus(targetVehicle)}
                                disabled={processing}
                                className={`flex-1 px-4 py-2.5 rounded-xl font-bold transition-colors ${targetVehicle.status === 'Out of Service' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-rose-600 hover:bg-rose-500 text-white'
                                    }`}
                            >
                                {processing ? 'Processing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardShell>
    );
}

export default VehicleRegistry;
