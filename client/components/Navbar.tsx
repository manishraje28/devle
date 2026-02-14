'use client';
import Link from 'next/link';

interface NavbarProps {
    username?: string | null;
    onLogout?: () => void;
}

export default function Navbar({ username, onLogout }: NavbarProps) {
    return (
        <header style={{
            width: '100%',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--grid-border)',
            background: 'rgba(13, 17, 23, 0.95)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            flexShrink: 0,
        }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
                <span style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '20px',
                    fontWeight: 700,
                    letterSpacing: '-0.03em',
                    color: 'var(--accent-primary)',
                    textShadow: '0 0 16px rgba(0,255,136,0.5), 0 0 48px rgba(0,255,136,0.15)',
                }}>
                    {'<'}DEVLE{' />'}
                </span>
            </Link>

            <nav style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link href="/leaderboard" style={{
                    fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)',
                    textDecoration: 'none', padding: '4px 8px', letterSpacing: '0.05em',
                }}>
                    RANKS
                </Link>
                {username ? (
                    <>
                        <Link href="/profile" style={{
                            fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-primary)',
                            textDecoration: 'none', padding: '4px 8px',
                        }}>
                            {username.toUpperCase()}
                        </Link>
                        <button onClick={onLogout} style={{
                            fontFamily: 'var(--font-mono)', fontSize: '10px', padding: '4px 10px',
                            borderRadius: '6px', border: '1px solid var(--grid-border)', color: 'var(--text-dim)',
                            background: 'transparent', cursor: 'pointer',
                        }}>
                            EXIT
                        </button>
                    </>
                ) : (
                    <Link href="/login" style={{
                        fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '5px 14px',
                        borderRadius: '6px', background: 'rgba(0,255,136,0.1)', color: 'var(--accent-primary)',
                        border: '1px solid rgba(0,255,136,0.25)', textDecoration: 'none', fontWeight: 600,
                    }}>
                        LOGIN
                    </Link>
                )}
            </nav>
        </header>
    );
}
