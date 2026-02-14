'use client';

const MODES = [
    { key: 'DAILY', label: 'Daily', icon: '📅' },
    { key: 'CLASSIC', label: 'Classic', icon: '🎯' },
    { key: 'CHILL', label: 'Chill', icon: '🧊' },
    { key: 'EXTREME', label: 'Extreme', icon: '🔥' },
    { key: 'STACK', label: 'Stack', icon: '📚' },
];

interface ModeSelectorProps {
    currentMode: string;
    onSelectMode: (mode: string) => void;
}

export default function ModeSelector({ currentMode, onSelectMode }: ModeSelectorProps) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            flexWrap: 'nowrap',
        }}>
            {MODES.map((m) => {
                const isActive = currentMode === m.key;
                return (
                    <button
                        key={m.key}
                        onClick={() => onSelectMode(m.key)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: `1px solid ${isActive ? 'var(--accent-primary)' : 'var(--grid-border)'}`,
                            background: isActive ? 'rgba(0,255,136,0.1)' : 'transparent',
                            color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            textTransform: 'uppercase' as const,
                            letterSpacing: '0.04em',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap' as const,
                            boxShadow: isActive ? '0 0 12px rgba(0,255,136,0.1)' : 'none',
                        }}
                    >
                        <span style={{ fontSize: '13px' }}>{m.icon}</span>
                        <span>{m.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
