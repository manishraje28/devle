'use client';

interface StreakDisplayProps {
    currentStreak: number;
    maxStreak: number;
    xp: number;
    wins: number;
    totalGames: number;
}

export default function StreakDisplay({ currentStreak, maxStreak, xp, wins, totalGames }: StreakDisplayProps) {
    const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            padding: '10px 24px',
            background: 'rgba(22, 27, 34, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(48, 54, 61, 0.6)',
            borderRadius: '10px',
        }}>
            <StatBlock label="STREAK" value={currentStreak.toString()} accent />
            <StatBlock label="MAX" value={maxStreak.toString()} />
            <StatBlock label="WIN %" value={`${winRate}%`} />
            <StatBlock label="XP" value={xp.toString()} accent />
        </div>
    );
}

function StatBlock({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '18px',
                fontWeight: 700,
                color: accent ? 'var(--accent-primary)' : 'var(--text-main)',
                textShadow: accent ? '0 0 16px rgba(0,255,136,0.5)' : 'none',
            }}>
                {value}
            </div>
            <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
                marginTop: '2px',
            }}>
                {label}
            </div>
        </div>
    );
}
