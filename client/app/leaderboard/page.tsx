'use client';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface LeaderEntry {
    rank: number;
    username: string;
    attempts?: number;
    xp?: number;
    wins?: number;
    maxStreak?: number;
}

export default function LeaderboardPage() {
    const [tab, setTab] = useState<'daily' | 'alltime'>('daily');
    const [data, setData] = useState<LeaderEntry[]>([]);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const stored = localStorage.getItem('devle_user');
        if (stored) setUser(JSON.parse(stored));
    }, []);

    useEffect(() => {
        const endpoint = tab === 'daily' ? '/leaderboard/daily' : '/leaderboard/all-time';
        api.get(endpoint)
            .then(res => { if (res.data.success) setData(res.data.data); })
            .catch(console.error);
    }, [tab]);

    return (
        <div className="flex flex-col min-h-screen relative z-10">
            <Navbar username={user?.username} />
            <main className="flex-1 flex flex-col items-center px-4 py-8 max-w-2xl mx-auto w-full">
                <h1 className="text-3xl font-bold glow-text mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
                    LEADERBOARD
                </h1>

                <div className="flex gap-2 mb-6">
                    <button onClick={() => setTab('daily')} className={`mode-btn ${tab === 'daily' ? 'mode-btn-active' : ''}`}>
                        📅 TODAY
                    </button>
                    <button onClick={() => setTab('alltime')} className={`mode-btn ${tab === 'alltime' ? 'mode-btn-active' : ''}`}>
                        🏆 ALL TIME
                    </button>
                </div>

                <div className="glass-panel w-full overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--grid-border)]">
                                <th className="text-left text-xs font-mono text-[var(--text-muted)] p-3 tracking-wider">RANK</th>
                                <th className="text-left text-xs font-mono text-[var(--text-muted)] p-3 tracking-wider">USER</th>
                                {tab === 'daily' ? (
                                    <th className="text-right text-xs font-mono text-[var(--text-muted)] p-3 tracking-wider">ATTEMPTS</th>
                                ) : (
                                    <>
                                        <th className="text-right text-xs font-mono text-[var(--text-muted)] p-3 tracking-wider">XP</th>
                                        <th className="text-right text-xs font-mono text-[var(--text-muted)] p-3 tracking-wider">WINS</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((entry) => (
                                <tr key={entry.rank} className="border-b border-[var(--grid-border)]/30 hover:bg-white/[0.02] transition">
                                    <td className="p-3 font-mono text-sm text-[var(--text-muted)]">
                                        {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                                    </td>
                                    <td className="p-3 font-bold text-[var(--accent-primary)] text-sm">{entry.username}</td>
                                    {tab === 'daily' ? (
                                        <td className="p-3 text-right font-mono text-sm">{entry.attempts}/6</td>
                                    ) : (
                                        <>
                                            <td className="p-3 text-right font-mono text-sm text-[var(--accent-primary)]">{entry.xp}</td>
                                            <td className="p-3 text-right font-mono text-sm">{entry.wins}</td>
                                        </>
                                    )}
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-[var(--text-muted)] font-mono text-sm">
                    // no entries yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Link href="/" className="mt-8 text-[var(--text-muted)] hover:text-[var(--accent-primary)] font-mono text-sm transition no-underline">
                    ← BACK TO GAME
                </Link>
            </main>
        </div>
    );
}
