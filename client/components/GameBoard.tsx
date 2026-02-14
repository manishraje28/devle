'use client';
import { useGameStore } from '@/store/gameStore';
import { useRef, useEffect } from 'react';

export default function GameBoard() {
    const { guesses, currentAttempt, gameStatus, message } = useGameStore();
    const boardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (message && boardRef.current) {
            const row = boardRef.current.children[currentAttempt] as HTMLElement;
            if (row) {
                row.classList.add('animate-shake');
                const t = setTimeout(() => row.classList.remove('animate-shake'), 400);
                return () => clearTimeout(t);
            }
        }
    }, [message, currentAttempt]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {/* Error toast */}
            {message && (
                <div className="animate-bounce-down" style={{
                    position: 'absolute',
                    top: '-36px',
                    zIndex: 50,
                    padding: '6px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    background: 'rgba(255,59,59,0.15)',
                    border: '1px solid rgba(255,59,59,0.3)',
                    color: '#FF6B6B',
                    whiteSpace: 'nowrap' as const,
                }}>
                    {message}
                </div>
            )}

            {/* Tile Grid — compact sizing */}
            <div ref={boardRef} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {guesses.map((row, rowIdx) => (
                    <div key={rowIdx} style={{ display: 'flex', gap: '5px' }}>
                        {row.map((tile, colIdx) => {
                            const isRevealed = tile.status !== 'empty';
                            const isFilled = tile.letter !== '';
                            const isWinRow = gameStatus === 'won' && rowIdx === currentAttempt - 1;

                            // Determine tile color
                            let bg = 'rgba(28, 33, 40, 0.4)';
                            let borderColor = 'var(--grid-border)';
                            let textColor = 'var(--text-main)';
                            let shadow = 'none';
                            let cls = '';

                            if (isRevealed) {
                                if (tile.status === 'correct') {
                                    bg = 'var(--tile-correct)';
                                    borderColor = 'var(--tile-correct)';
                                    textColor = '#0D1117';
                                    shadow = '0 0 10px rgba(0,255,136,0.3)';
                                } else if (tile.status === 'present') {
                                    bg = 'var(--tile-present)';
                                    borderColor = 'var(--tile-present)';
                                    textColor = '#0D1117';
                                    shadow = '0 0 10px rgba(255,184,0,0.25)';
                                } else {
                                    bg = 'var(--tile-absent)';
                                    borderColor = 'rgba(48,54,61,0.8)';
                                    textColor = 'var(--text-dim)';
                                }
                                cls = 'tile-reveal';
                                if (isWinRow) cls += ' animate-win';
                            } else if (isFilled) {
                                borderColor = 'var(--text-muted)';
                                cls = 'animate-pop';
                            }

                            return (
                                <div
                                    key={colIdx}
                                    className={cls}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '56px',
                                        height: '56px',
                                        fontFamily: 'var(--font-mono)',
                                        fontWeight: 700,
                                        fontSize: '1.5rem',
                                        letterSpacing: '0.02em',
                                        textTransform: 'uppercase' as const,
                                        border: `2px solid ${borderColor}`,
                                        borderRadius: '8px',
                                        background: bg,
                                        color: textColor,
                                        boxShadow: shadow,
                                        userSelect: 'none' as const,
                                        transition: 'transform 0.15s ease',
                                        ...(isRevealed ? {
                                            animationDelay: `${colIdx * 120}ms`,
                                            animationFillMode: 'both' as const,
                                        } : {}),
                                    }}
                                >
                                    {tile.letter}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
