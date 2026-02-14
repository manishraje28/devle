'use client';

interface ResultModalProps {
    show: boolean;
    won: boolean;
    attempts: number;
    maxAttempts: number;
    mode: string;
    onNewGame: () => void;
    onShare: () => void;
}

export default function ResultModal({ show, won, attempts, maxAttempts, mode, onNewGame, onShare }: ResultModalProps) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
            <div
                className={`glass-panel p-8 max-w-xs w-[90%] text-center animate-slide-up ${won ? 'glow-border' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-5xl mb-3">{won ? '🎉' : '💀'}</div>
                <h2 className={`text-2xl font-bold mb-1 ${won ? 'glow-text' : 'text-[var(--accent-danger)]'}`}
                    style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
                    {won ? 'SOLVED!' : 'FAILED'}
                </h2>
                <p className="text-[var(--text-muted)] font-mono text-xs mb-0.5">
                    {won ? `${attempts}/${maxAttempts} attempts` : 'Better luck tomorrow'}
                </p>
                <p className="text-[10px] text-[var(--text-dim)] font-mono mb-6 tracking-wider">{mode}</p>

                <div className="flex gap-2.5 justify-center">
                    <button onClick={onShare}
                        className="flex-1 py-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--grid-border)] text-[var(--text-main)] font-mono text-xs hover:border-[var(--accent-primary)] transition cursor-pointer">
                        📋 SHARE
                    </button>
                    {mode !== 'DAILY' && (
                        <button onClick={onNewGame}
                            className="flex-1 py-2.5 rounded-lg bg-[var(--accent-primary)] text-[#0D1117] font-bold font-mono text-xs hover:brightness-110 transition cursor-pointer border-none">
                            AGAIN →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
