import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

function DashboardShell({ role, emoji, color, title, description, user, modules, children }) {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
            {/* Top nav */}
            <header className="flex items-center justify-between px-8 py-4 bg-slate-900/50 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md">
                <div className="flex items-center gap-2.5 font-bold text-lg">
                    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                        <rect width="32" height="32" rx="8" fill="url(#dg)" />
                        <path d="M6 20l5-9h8l5 9H6z" fill="white" fillOpacity=".9" />
                        <circle cx="11" cy="22" r="2" fill="white" />
                        <circle cx="21" cy="22" r="2" fill="white" />
                        <defs>
                            <linearGradient id="dg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#6366f1" /><stop offset="1" stopColor="#8b5cf6" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">FleetFlow</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-9 h-9 rounded-full border border-opacity-30 flex items-center justify-center font-bold text-sm"
                            style={{ backgroundColor: `${color}11`, borderColor: `${color}44` }}
                        >
                            <span style={{ color }}>{user?.name?.[0]?.toUpperCase() ?? '?'}</span>
                        </div>
                        <div className="hidden sm:flex flex-col leading-tight">
                            <strong className="text-sm font-semibold">{user?.name}</strong>
                            <span className="text-[11px] font-bold opacity-80" style={{ color }}>{user?.role}</span>
                        </div>
                    </div>
                    <button
                        id="logout-btn"
                        className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all hover:bg-red-500/20 active:scale-95"
                        onClick={handleLogout}
                    >
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h7a1 1 0 100-2H4V5h6a1 1 0 100-2H3zm11.707 4.293a1 1 0 010 1.414L13.414 10l1.293 1.293a1 1 0 01-1.414 1.414l-2-2a1 1 0 010-1.414l2-2a1 1 0 011.414 0z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M13 10a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="hidden xs:inline">Sign out</span>
                    </button>
                </div>
            </header>

            {/* Hero banner */}
            <section className="relative overflow-hidden px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at 15% 50%, ${color}15 0%, transparent 70%)` }}
                />
                <div className="relative flex items-center gap-5 text-center md:text-left">
                    <span className="text-5xl md:text-6xl drop-shadow-lg">{emoji}</span>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-1.5 tracking-tight">{title}</h1>
                        <p className="text-slate-400 text-sm md:text-base max-w-xl">{description}</p>
                    </div>
                </div>
                <div
                    className="relative px-4 py-1.5 rounded-full border text-[11px] font-black tracking-widest uppercase transition-colors"
                    style={{ backgroundColor: `${color}15`, borderColor: `${color}30`, color }}
                >
                    {role}
                </div>
            </section>

            {/* Main Content */}
            <main className="p-8 flex-1">
                {children ? (
                    children
                ) : (
                    <>
                        <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-6 rounded-full" style={{ backgroundColor: color }} />
                            Available Operations
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {modules?.map(({ icon, name, desc }) => (
                                <div
                                    key={name}
                                    className="group relative flex flex-col gap-2 p-6 bg-slate-900 border border-slate-800 rounded-2xl cursor-default transition-all hover:border-slate-700 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black"
                                >
                                    <div
                                        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                                        style={{ backgroundColor: color }}
                                    />
                                    <span className="text-3xl mb-1">{icon}</span>
                                    <strong className="text-base font-bold text-slate-100">{name}</strong>
                                    <p className="text-sm text-slate-400 line-clamp-2">{desc}</p>
                                    <div className="mt-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 w-fit">
                                        Coming soon
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default DashboardShell;
