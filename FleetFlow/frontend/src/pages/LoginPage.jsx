import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, ROLE_ROUTES } from '@/context/AuthContext';

// ── Field-level validation ────────────────────────────────────────────────────
function validate(fields) {
    const errs = {};
    if (!fields.email.trim()) {
        errs.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
        errs.email = 'Please enter a valid email address.';
    }
    if (!fields.password) {
        errs.password = 'Password is required.';
    } else if (fields.password.length < 8) {
        errs.password = 'Password must be at least 8 characters.';
    }
    return errs;
}

// ── Component ─────────────────────────────────────────────────────────────────
function LoginPage() {
    const navigate = useNavigate();
    const { login, isLoading, error, clearError, isAuthenticated, user } = useAuth();

    const [fields, setFields] = useState({ email: '', password: '' });
    const [fieldErrs, setFieldErrs] = useState({});
    const [showPass, setShowPass] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Already logged in — redirect immediately
    useEffect(() => {
        if (isAuthenticated && user) {
            navigate(ROLE_ROUTES[user.role] || '/dashboard', { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    // Clear server error when user types
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFields((prev) => ({ ...prev, [name]: value }));
        if (error) clearError();
        if (submitted) {
            setFieldErrs((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);

        const errs = validate(fields);
        if (Object.keys(errs).length > 0) {
            setFieldErrs(errs);
            return;
        }

        try {
            const role = await login(fields.email.trim(), fields.password);
            navigate(ROLE_ROUTES[role] || '/dashboard', { replace: true });
        } catch {
            // error already set in AuthContext — just show it
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-950">

            {/* ── Animated background orbs ────────────────────────────── */}
            <div className="absolute w-[480px] h-[480px] -top-40 -left-40 rounded-full blur-[80px] pointer-events-none z-0 bg-indigo-500/10 animate-drift" aria-hidden="true" />
            <div className="absolute w-[360px] h-[360px] -bottom-32 -right-32 rounded-full blur-[80px] pointer-events-none z-0 bg-violet-600/10 animate-drift-reverse" aria-hidden="true" />

            <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-2xl animate-slide-up">

                {/* Logo */}
                <div className="flex flex-col items-center gap-2 mb-8">
                    <div className="drop-shadow-[0_6px_20px_rgba(99,102,241,0.45)]">
                        <svg className="w-16 h-16" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                            <rect width="48" height="48" rx="14" fill="url(#lg)" />
                            <path d="M10 30l8-14h12l8 14H10z" fill="white" fillOpacity=".92" />
                            <circle cx="16" cy="33" r="3" fill="white" />
                            <circle cx="32" cy="33" r="3" fill="white" />
                            <defs>
                                <linearGradient id="lg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#6366f1" />
                                    <stop offset="1" stopColor="#8b5cf6" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
                        FleetFlow
                    </h1>
                    <p className="text-slate-400 text-sm">Sign in to your account</p>
                </div>

                {/* Server error banner */}
                {error && (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-6 text-sm text-red-400 animate-shake" role="alert">
                        <span className="text-lg flex-shrink-0">⚠️</span>
                        <span className="flex-1">{error}</span>
                        <button
                            className="text-red-400 text-xl leading-none opacity-70 hover:opacity-100 px-1"
                            onClick={clearError}
                            aria-label="Dismiss error"
                        >×</button>
                    </div>
                )}

                {/* Form */}
                <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                            Email address
                        </label>
                        <div className="relative group">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" aria-hidden="true">
                                <svg viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                            </span>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className={`w-full bg-slate-800/50 border ${fieldErrs.email ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'} rounded-xl py-3 px-11 text-slate-100 placeholder-slate-500 transition-all outline-none`}
                                placeholder="you@company.com"
                                value={fields.email}
                                onChange={handleChange}
                                autoComplete="email"
                                autoFocus
                            />
                        </div>
                        {fieldErrs.email && (
                            <p className="text-[11px] text-red-500 ml-1 animate-fadeIn" role="alert">{fieldErrs.email}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="password" className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                            Password
                        </label>
                        <div className="relative group">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" aria-hidden="true">
                                <svg viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                            </span>
                            <input
                                id="password"
                                name="password"
                                type={showPass ? 'text' : 'password'}
                                className={`w-full bg-slate-800/50 border ${fieldErrs.password ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'} rounded-xl py-3 px-11 text-slate-100 placeholder-slate-500 transition-all outline-none`}
                                placeholder="••••••••"
                                value={fields.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                onClick={() => setShowPass((v) => !v)}
                            >
                                {showPass ? (
                                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {fieldErrs.password && (
                            <p className="text-[11px] text-red-500 ml-1 animate-fadeIn" role="alert">{fieldErrs.password}</p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="mt-2 flex items-center justify-center gap-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-xl py-3.5 font-bold shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.01] hover:shadow-indigo-500/40 active:scale-100 disabled:opacity-60"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Signing in…
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>

                </form>

                {/* Role chips */}
                <div className="mt-8 pt-6 border-t border-slate-800">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center mb-3">Available roles</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {['FleetManager', 'Dispatcher', 'SafetyOfficer', 'FinancialAnalyst'].map((r) => (
                            <span key={r} className="text-[11px] font-bold px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                                {r}
                            </span>
                        ))}
                    </div>
                </div>

                <p className="text-center text-[11px] text-slate-500 mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
                        Sign up here
                    </Link>
                </p>

                <p className="text-center text-[11px] text-slate-500 mt-2">
                    FleetFlow &copy; {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
