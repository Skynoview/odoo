import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { maintenanceApi } from '@/api/maintenance.api';
import { vehicleApi } from '@/api/vehicle.api';
import DashboardShell from './DashboardShell';

const initialFormState = {
    vehicle_id: '',
    service_type: '',
    description: '',
    cost: '',
    service_date: new Date().toISOString().slice(0, 16),
    status: 'Scheduled',
    next_service_due: ''
};

function MaintenanceLogs() {
    const { user } = useAuth();

    // Data State
    const [records, setRecords] = useState([]);
    const [vehicles, setVehicles] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form Modal State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    const [formError, setFormError] = useState('');
    const [processing, setProcessing] = useState(false);

    // Status Confirmation Modal State
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [targetRecord, setTargetRecord] = useState(null);
    const [targetStatus, setTargetStatus] = useState('');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [logsRes, vehiclesRes] = await Promise.all([
                maintenanceApi.getMaintenanceRecords(),
                vehicleApi.getVehicles()
            ]);

            setRecords(logsRes.data.data || []);
            setVehicles(vehiclesRes.data.data || []);
        } catch (err) {
            setError('Failed to fetch maintenance data.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const activeVehicles = useMemo(() => vehicles.filter(v => v.status !== 'Out of Service'), [vehicles]);

    // "In Shop" vehicles summary
    const inShopVehiclesCount = useMemo(() => vehicles.filter(v => v.status === 'In Shop').length, [vehicles]);

    const totalCost = useMemo(() => {
        return records.reduce((sum, r) => sum + parseFloat(r.cost || 0), 0);
    }, [records]);

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
        setFormError('');
    };

    const validateForm = () => {
        if (!formData.vehicle_id || !formData.service_type || !formData.service_date) {
            setFormError('Vehicle, Service Type, and Service Date are required.');
            return false;
        }

        if (formData.cost) {
            const parsedCost = parseFloat(formData.cost);
            if (isNaN(parsedCost) || parsedCost < 0) {
                setFormError('Cost must be a valid positive number.');
                return false;
            }
        }
        return true;
    };

    const handleCreateRecord = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setProcessing(true);
        setFormError('');
        try {
            const payload = {
                ...formData,
                vehicle_id: parseInt(formData.vehicle_id),
                cost: formData.cost ? parseFloat(formData.cost) : 0,
                // Make sure dates are proper UTC ISO. HTML datetime-local uses local time.
                service_date: new Date(formData.service_date).toISOString(),
                next_service_due: formData.next_service_due ? new Date(formData.next_service_due).toISOString() : null
            };

            await maintenanceApi.createMaintenanceRecord(payload);
            await fetchData();
            handleCloseForm();
        } catch (err) {
            setFormError(err.response?.data?.error?.message || 'Failed to create log.');
        } finally {
            setProcessing(false);
        }
    };

    // Status Interactions
    const confirmStatusChange = (record, newStatus) => {
        setTargetRecord(record);
        setTargetStatus(newStatus);
        setIsStatusModalOpen(true);
    };

    const executeStatusChange = async () => {
        setProcessing(true);
        try {
            await maintenanceApi.updateMaintenanceStatus(targetRecord.id, targetStatus);
            await fetchData(); // refresh to update UI and vehicle status
            setIsStatusModalOpen(false);
            setTargetRecord(null);
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
            case 'Scheduled': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
            case 'In Progress': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'Completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    return (
        <DashboardShell
            role="FleetManager"
            emoji="🔧"
            color="#ec4899"
            title="Service & Maintenance"
            description="Manage repair logs, schedule preventative service, and monitor repair costs."
            user={user}
        >
            <div className="space-y-6 animate-fadeIn">
                {/* Header Actions */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-900/40 border border-slate-800 p-4 rounded-3xl shadow-lg backdrop-blur-sm">
                    <div className="flex gap-4 items-center">
                        <Link to="/manager-dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold mr-4">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Back
                        </Link>
                        <div className="text-sm font-bold text-slate-400 px-4 py-2 bg-slate-950 rounded-xl border border-slate-800 inline-flex items-center gap-2">
                            <div className="text-amber-500 font-black">!</div>
                            In Shop: <span className="text-white">{inShopVehiclesCount}</span>
                        </div>
                        <div className="text-sm font-bold text-slate-400 px-4 py-2 bg-slate-950 rounded-xl border border-slate-800 inline-flex items-center gap-2 hidden sm:flex">
                            <div className="text-emerald-500 font-black">$</div>
                            Total Cost: <span className="text-white text-emerald-400">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleOpenForm}
                        className="bg-pink-600 hover:bg-pink-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-pink-500/25 active:scale-95 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Log Service Event
                    </button>
                </div>

                {/* Main Dashboard Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
                    {isLoading && records.length === 0 ? (
                        <div className="p-20 flex flex-col items-center justify-center gap-4">
                            <div className="w-10 h-10 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
                            <span className="text-slate-500 font-bold text-sm tracking-widest uppercase animate-pulse">Scanning Service Bays...</span>
                        </div>
                    ) : error ? (
                        <div className="p-10 text-center text-rose-400 font-bold">{error}</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead>
                                    <tr className="bg-slate-950/50 border-b border-slate-800 text-slate-400 uppercase tracking-widest text-[10px] font-black">
                                        <th className="px-6 py-5">Record ID</th>
                                        <th className="px-6 py-5">Vehicle Identity</th>
                                        <th className="px-6 py-5">Service Overview</th>
                                        <th className="px-6 py-5">Invoice Date / Cost</th>
                                        <th className="px-6 py-5">Current Phase</th>
                                        <th className="px-6 py-5 text-right">Mechanic Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {records.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center py-10 text-slate-500">No service logs on record.</td></tr>
                                    ) : (
                                        records.map(record => (
                                            <tr key={record.id} className={`hover:bg-slate-800/30 transition-colors group ${record.vehicle_status === 'In Shop' ? 'bg-amber-900/10' : ''}`}>
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-slate-300 font-bold text-xs">SRV-{String(record.id).padStart(4, '0')}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-white font-bold">{record.vehicle_name}</div>
                                                    <div className="text-slate-400 text-[11px] font-mono">{record.license_plate}</div>
                                                </td>
                                                <td className="px-6 py-4 min-w-[200px] whitespace-normal">
                                                    <div className="text-white font-medium">{record.service_type}</div>
                                                    <div className="text-slate-500 text-[11px] line-clamp-1 h-4">{record.description || 'No notes provided'}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-slate-300 text-xs">{new Date(record.service_date).toLocaleDateString()}</div>
                                                    <div className="text-emerald-400 font-bold text-[11px]">${parseFloat(record.cost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(record.status)}`}>
                                                        {record.status}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {record.status === 'Scheduled' && (
                                                        <button
                                                            onClick={() => confirmStatusChange(record, 'In Progress')}
                                                            className="px-3 py-1.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white rounded-lg font-bold text-xs transition-colors border border-amber-500/20 ml-2 shadow-sm"
                                                        >
                                                            Start Work
                                                        </button>
                                                    )}
                                                    {record.status === 'In Progress' && (
                                                        <button
                                                            onClick={() => confirmStatusChange(record, 'Completed')}
                                                            className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg font-bold text-xs transition-colors border border-emerald-500/20 ml-2 shadow-sm"
                                                        >
                                                            Complete Job
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

            {/* Create form modal */}
            {isFormModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseForm} />
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden relative shadow-2xl animate-fadeIn">
                        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="p-1.5 bg-pink-500/10 text-pink-400 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg></span>
                                Add Service Log
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
                            <form onSubmit={handleCreateRecord} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                                    <div className="space-y-1.5 sm:col-span-2 border-b border-slate-800 pb-2">
                                        <label className="text-xs font-bold text-pink-400 uppercase tracking-widest">Diagnostics & Target</label>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Vehicle</label>
                                        <select required name="vehicle_id" value={formData.vehicle_id} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-medium appearance-none">
                                            <option value="">-- Choose Asset --</option>
                                            {activeVehicles.map(v => (
                                                <option key={v.id} value={v.id}>{v.name} ({v.license_plate}) [{v.status}]</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Service Classification</label>
                                        <input required name="service_type" value={formData.service_type} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-medium" placeholder="E.g. Oil Change, Tire Mount" />
                                    </div>

                                    <div className="space-y-1.5 sm:col-span-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mechanic Notes / Description</label>
                                        <textarea name="description" value={formData.description} onChange={handleChange} rows={2} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-medium resize-none shadow-inner" placeholder="Detailed findings..." />
                                    </div>

                                    <div className="space-y-1.5 sm:col-span-2 border-b border-slate-800 pb-2 mt-2">
                                        <label className="text-xs font-bold text-pink-400 uppercase tracking-widest">Logistics & Billing</label>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Service Date & Time</label>
                                        <input required type="datetime-local" name="service_date" value={formData.service_date} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-medium" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Projected Cost ($)</label>
                                        <input type="number" step="0.01" min="0" name="cost" value={formData.cost} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-medium" placeholder="250.00" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Initial Status</label>
                                        <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-medium appearance-none">
                                            <option value="Scheduled">Scheduled</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Next Service Due (Optional)</label>
                                        <input type="datetime-local" name="next_service_due" value={formData.next_service_due} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-medium" />
                                    </div>

                                </div>
                                <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-800">
                                    <button type="button" onClick={handleCloseForm} className="px-5 py-2.5 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                                        Discard
                                    </button>
                                    <button type="submit" disabled={processing} className="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-pink-500/25 disabled:opacity-50 flex items-center gap-2">
                                        {processing && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                                        Save Record
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Status confirmation */}
            {isStatusModalOpen && targetRecord && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsStatusModalOpen(false)} />
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 relative shadow-2xl animate-fadeIn text-center">
                        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${targetStatus === 'In Progress' ? 'bg-amber-500/10 text-amber-500' :
                                'bg-emerald-500/10 text-emerald-500'
                            }`}>
                            {targetStatus === 'In Progress' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            {targetStatus === 'Completed' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Advance Service Phase?</h3>
                        <p className="text-slate-400 text-sm mb-6">
                            Mark ticket SRV-{String(targetRecord.id).padStart(4, '0')} for {targetRecord.vehicle_name} as <strong className="text-white">{targetStatus}</strong>?
                            {targetStatus === 'In Progress' && ' (This will place the vehicle Into the Shop)'}
                            {targetStatus === 'Completed' && ' (This will release the vehicle back to Idle pool)'}
                        </p>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setIsStatusModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-300 hover:bg-slate-800 transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={executeStatusChange}
                                disabled={processing}
                                className={`flex-1 px-4 py-2.5 rounded-xl font-bold transition-colors shadow-lg ${targetStatus === 'In Progress' ? 'bg-amber-600 hover:bg-amber-500 text-white' :
                                        'bg-emerald-600 hover:bg-emerald-500 text-white'
                                    }`}
                            >
                                {processing ? 'Updating...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardShell>
    );
}

export default MaintenanceLogs;
