import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import { useAuth, ROLE_ROUTES } from '@/context/AuthContext';

function RegisterPage() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const [fields, setFields] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Dispatcher' // Default role
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated && user) {
            navigate(ROLE_ROUTES[user.role] || '/dashboard', { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    const validate = () => {
        const errs = {};
        if (!fields.name.trim()) errs.name = 'Full name is required';
        if (!fields.email.trim()) {
            errs.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
            errs.email = 'Invalid email format';
        }
        if (!fields.password) {
            errs.password = 'Password is required';
        } else if (fields.password.length < 8) {
            errs.password = 'Password must be at least 8 characters';
        } else if (!/[A-Z]/.test(fields.password)) {
            errs.password = 'Must contain at least one uppercase letter';
        } else if (!/[0-9]/.test(fields.password)) {
            errs.password = 'Must contain at least one number';
        }
        if (fields.password !== fields.confirmPassword) {
            errs.confirmPassword = 'Passwords do not match';
        }
        return errs;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFields(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
        if (serverError) setServerError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const valErrs = validate();
        if (Object.keys(valErrs).length > 0) {
            setErrors(valErrs);
            return;
        }

        setIsLoading(true);
        try {
            await authApi.register({
                name: fields.name,
                email: fields.email,
                password: fields.password,
                role: fields.role
            });
            setSuccess(true);
            // Auto redirect to login after 2 seconds
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            console.error('Registration error:', err.response?.data);
            const apiError = err.response?.data?.error;

            if (apiError?.code === 'VALIDATION_ERROR' && apiError.details) {
                // Map validation details to field errors
                const newFieldErrs = {};
                apiError.details.forEach(d => {
                    newFieldErrs[d.field] = d.message;
                });
                setErrors(newFieldErrs);
                setServerError('Please fix the validation errors below.');
            } else {
                setServerError(apiError?.message || err.message || 'Registration failed');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-950">
            {/* Background Orbs */}
            <div className="absolute w-[500px] h-[500px] -top-40 -right-40 rounded-full blur-[100px] pointer-events-none z-0 bg-indigo-500/10 animate-drift" />
            <div className="absolute w-[400px] h-[400px] -bottom-32 -left-32 rounded-full blur-[100px] pointer-events-none z-0 bg-violet-600/10 animate-drift-reverse" />

            <div className="relative z-10 w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-10 shadow-2xl animate-slide-up">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent mb-2">
                        Create Account
                    </h1>
                    <p className="text-slate-400 text-sm">Join the FleetFlow management network</p>
                </div>

                {success ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center animate-fadeIn">
                        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Registration Successful!</h2>
                        <p className="text-emerald-400/80 text-sm">Redirecting you to the login page...</p>
                    </div>
                ) : (
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {serverError && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-400 animate-shake">
                                ⚠️ {serverError}
                            </div>
                        )}

                        {/* Name */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                            <input
                                name="name"
                                value={fields.name}
                                onChange={handleChange}
                                className={`ff-input ${errors.name ? 'border-red-500 ring-2 ring-red-500/10' : ''}`}
                                placeholder="John Doe"
                            />
                            {errors.name && <p className="text-[10px] text-red-500 ml-1">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                value={fields.email}
                                onChange={handleChange}
                                className={`ff-input ${errors.email ? 'border-red-500 ring-2 ring-red-500/10' : ''}`}
                                placeholder="john@company.com"
                            />
                            {errors.email && <p className="text-[10px] text-red-500 ml-1">{errors.email}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Password */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                                <input
                                    name="password"
                                    type="password"
                                    value={fields.password}
                                    onChange={handleChange}
                                    className={`ff-input ${errors.password ? 'border-red-500 ring-2 ring-red-500/10' : ''}`}
                                    placeholder="••••••••"
                                />
                                {errors.password && <p className="text-[10px] text-red-500 ml-1">{errors.password}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm</label>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    value={fields.confirmPassword}
                                    onChange={handleChange}
                                    className={`ff-input ${errors.confirmPassword ? 'border-red-500 ring-2 ring-red-500/10' : ''}`}
                                    placeholder="••••••••"
                                />
                                {errors.confirmPassword && <p className="text-[10px] text-red-500 ml-1">{errors.confirmPassword}</p>}
                            </div>
                        </div>

                        {/* Role Selection */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Assigned Role</label>
                            <select
                                name="role"
                                value={fields.role}
                                onChange={handleChange}
                                className="ff-input appearance-none bg-slate-800/50"
                            >
                                <option value="FleetManager">Fleet Manager</option>
                                <option value="Dispatcher">Dispatcher</option>
                                <option value="SafetyOfficer">Safety Officer</option>
                                <option value="FinancialAnalyst">Financial Analyst</option>
                            </select>
                            <p className="text-[9px] text-slate-500 ml-1 italic">* Roles determine your dashboard accessibility.</p>
                        </div>

                        <button type="submit" disabled={isLoading} className="ff-btn-primary w-full mt-4">
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : 'Register Account'}
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center text-sm">
                    <p className="text-slate-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
