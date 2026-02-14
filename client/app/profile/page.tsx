'use client';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const stored = localStorage.getItem('devle_user');
        if (stored) {
            setUser(JSON.parse(stored));
            api.get('/user/stats')
                .then(res => { if (res.data.success) setStats(res.data.data); })
                .catch(console.error);
        }
    }, []);

    const winRate = stats && stats.totalGames > 0
        ? Math.round((stats.wins / stats.totalGames) * 100)
        : 0;

    return (
        <div className="flex flex-col min-h-screen relative z-10">
            <Navbar username={user?.username} />
            <main className="flex-1 flex flex-col items-center px-4 py-8 max-w-md mx-auto w-full gap-6">
                <div className="glass-panel p-8 w-full text-center">
                    <div className="w-20 h-20 rounded-full bg-[var(--accent-primary)]/20 border-2 border-[var(--accent-primary)] mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-[var(--accent-primary)]" style={{ fontFamily: 'var(--font-mono)' }}>
                        {user?.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <h2 className="text-2xl font-bold glow-text mb-1">{user?.username || 'Unknown'}</h2>
                    <p className="text-xs text-[var(--text-muted)] font-mono">{user?.role === 'admin' ? 'ADMIN' : 'DEVELOPER'}</p>
                </div>

                {stats && (
                    <div className="glass-panel p-6 w-full">
                        <h3 className="text-sm font-mono text-[var(--text-muted)] tracking-wider mb-4">STATISTICS</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Stat label="TOTAL GAMES" value={stats.totalGames} />
                            <Stat label="WINS" value={stats.wins} accent />
                            <Stat label="WIN RATE" value={`${winRate}%`} />
                            <Stat label="TOTAL XP" value={stats.xp} accent />
                            <Stat label="CURRENT STREAK" value={stats.currentStreak} accent />
                            <Stat label="MAX STREAK" value={stats.maxStreak} />
                        </div>
                    </div>
                )}

                <Link href="/" className="text-[var(--text-muted)] hover:text-[var(--accent-primary)] font-mono text-sm transition no-underline">
                    ← BACK TO GAME
                </Link>
            </main>
        </div>
    );
}

function Stat({ label, value, accent }: { label: string; value: any; accent?: boolean }) {
    return (
        <div className="text-center">
            <p className={`text-2xl font-bold font-mono ${accent ? 'text-[var(--accent-primary)]' : 'text-[var(--text-main)]'}`}>
                {value}
            </p>
            <p className="text-[10px] text-[var(--text-muted)] font-mono tracking-wider mt-1">{label}</p>
        </div>
    );
}
