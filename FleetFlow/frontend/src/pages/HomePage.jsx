import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { healthApi } from '@/api/health.api';

function HomePage() {
    const navigate = useNavigate();
    const [apiStatus, setApiStatus] = useState('checking');
    const [dbStatus, setDbStatus] = useState('checking');

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const apiRes = await healthApi.check();
                setApiStatus(apiRes.status === 200 ? 'online' : 'error');
            } catch { setApiStatus('error'); }

            try {
                const dbRes = await healthApi.checkDb();
                setDbStatus(dbRes.data?.data?.connected ? 'online' : 'error');
            } catch { setDbStatus('error'); }
        };
        checkHealth();
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col relative overflow-hidden">
            {/* Background orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[100px] animate-pulse pointer-events-none" />

            {/* Nav */}
            <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">FleetFlow</span>
                </div>
                <button
                    onClick={() => navigate('/login')}
                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95 backdrop-blur-md"
                >
                    Sign In
                </button>
            </nav>

            {/* Hero */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-5xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8 animate-bounce">
                    ✨ System Status: {apiStatus === 'online' && dbStatus === 'online' ? 'All Systems Go' : 'Monitoring Active'}
                </div>

                <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[1.1]">
                    Modern Logistics<br />
                    <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">Streamlined & Secure</span>
                </h1>

                <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
                    The all-in-one platform for fleet management, real-time dispatching,
                    and financial analytics. Built for scale, designed for simplicity.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-20">
                    <button
                        onClick={() => navigate('/login')}
                        className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-violet-700 rounded-2xl font-black text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:-translate-y-1 active:scale-95"
                    >
                        Launch Dashboard
                    </button>
                    <button className="px-10 py-4 bg-slate-900 border border-slate-800 rounded-2xl font-black text-slate-200 hover:bg-slate-800 transition-all active:scale-95">
                        Documentation
                    </button>
                </div>

                {/* Status Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
                    <div className="flex items-center justify-between p-6 bg-slate-900/50 border border-slate-800 rounded-3xl backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full animate-pulse ${apiStatus === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <div className="text-left">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">API Engine</div>
                                <div className="font-bold text-slate-200">{apiStatus === 'online' ? 'Connected' : 'Syncing...'}</div>
                            </div>
                        </div>
                        <div className="text-[10px] font-black px-2 py-1 rounded bg-slate-800 text-slate-400 uppercase tracking-widest">Port 5000</div>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-slate-900/50 border border-slate-800 rounded-3xl backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full animate-pulse ${dbStatus === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <div className="text-left">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Database</div>
                                <div className="font-bold text-slate-200">{dbStatus === 'online' ? 'Stable' : 'Connecting...'}</div>
                            </div>
                        </div>
                        <div className="text-[10px] font-black px-2 py-1 rounded bg-slate-800 text-slate-400 uppercase tracking-widest">MySQL v8</div>
                    </div>
                </div>
            </main>

            <footer className="relative z-10 p-8 text-center text-slate-500 text-sm font-medium border-t border-slate-900 mt-20">
                &copy; {new Date().getFullYear()} FleetFlow Full-Stack Pro. All rights reserved.
            </footer>
        </div>
    );
}

export default HomePage;
