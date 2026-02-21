import { Link } from 'react-router-dom';

function NotFoundPage() {
    return (
        <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10">
                <div className="text-9xl font-black text-white/5 mb-[-4rem] select-none">404</div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                    Page Not Found
                </h1>
                <p className="text-slate-400 text-lg max-w-md mx-auto mb-10 leading-relaxed">
                    The route you&apos;re looking for doesn&apos;t exist yet — we&apos;re currently expanding the FleetFlow network!
                </p>
                <Link
                    to="/dashboard"
                    className="ff-btn-primary inline-flex"
                >
                    ← Back to Dashboard
                </Link>
            </div>
        </main>
    );
}

export default NotFoundPage;
