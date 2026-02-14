'use client';
import { useGameStore } from '@/store/gameStore';
import { useEffect, useState, useCallback } from 'react';
import api from '@/services/api';

const ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
];

interface KeyboardProps {
    isGuest: boolean;
}

export default function Keyboard({ isGuest }: KeyboardProps) {
    const {
        addLetter, removeLetter, applyGuessResult,
        currentGuess, gameId, gameToken, gameStatus, keyboardStatus, setMessage,
    } = useGameStore();
    const [submitting, setSubmitting] = useState(false);

    const handleKey = useCallback(async (key: string) => {
        if (submitting || gameStatus !== 'playing') return;

        if (key === 'ENTER') {
            if (currentGuess.length !== 5) {
                setMessage('Not enough letters');
                setTimeout(() => setMessage(''), 1500);
                return;
            }
            setSubmitting(true);
            try {
                if (isGuest) {
                    const res = await api.post('/game/guest/guess', { guess: currentGuess, gameToken });
                    if (res.data.success) { applyGuessResult(res.data.data.result); setMessage(''); }
                } else {
                    if (!gameId) return;
                    const res = await api.post('/game/guess', { gameId, guess: currentGuess });
                    if (res.data.success) { applyGuessResult(res.data.data.result); setMessage(''); }
                }
            } catch (e: any) {
                setMessage(e.response?.data?.error || 'Not in word list');
                setTimeout(() => setMessage(''), 2000);
            } finally { setSubmitting(false); }
        } else if (key === '⌫' || key === 'BACKSPACE') {
            removeLetter();
        } else if (/^[A-Z]$/.test(key)) {
            addLetter(key);
        }
    }, [submitting, gameStatus, currentGuess, gameId, gameToken, isGuest, addLetter, removeLetter, applyGuessResult, setMessage]);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            const key = e.key.toUpperCase();
            if (key === 'ENTER') handleKey('ENTER');
            else if (key === 'BACKSPACE') handleKey('⌫');
            else if (/^[A-Z]$/.test(key)) handleKey(key);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [handleKey]);

    const getKeyColor = (key: string): { bg: string; color: string } => {
        if (key === 'ENTER' || key === '⌫') return { bg: 'var(--bg-elevated)', color: 'var(--text-main)' };
        const status = keyboardStatus[key];
        if (status === 'correct') return { bg: 'var(--tile-correct)', color: '#0D1117' };
        if (status === 'present') return { bg: 'var(--tile-present)', color: '#0D1117' };
        if (status === 'absent') return { bg: 'rgba(33,38,45,0.8)', color: 'var(--text-dim)' };
        return { bg: 'var(--bg-elevated)', color: 'var(--text-main)' };
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '5px',
            width: '100%',
            maxWidth: '480px',
            margin: '0 auto',
        }}>
            {ROWS.map((row, i) => (
                <div key={i} style={{ display: 'flex', gap: '4px', justifyContent: 'center', width: '100%' }}>
                    {row.map((key) => {
                        const colors = getKeyColor(key);
                        const isWide = key === 'ENTER' || key === '⌫';
                        return (
                            <button
                                key={key}
                                onClick={() => handleKey(key)}
                                disabled={submitting || gameStatus !== 'playing'}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '46px',
                                    minWidth: isWide ? '52px' : '30px',
                                    flex: isWide ? '1.5' : '1',
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: 600,
                                    fontSize: isWide ? '10px' : '12px',
                                    borderRadius: '7px',
                                    border: 'none',
                                    cursor: submitting ? 'wait' : 'pointer',
                                    userSelect: 'none' as const,
                                    transition: 'all 0.12s ease',
                                    opacity: submitting ? 0.5 : 1,
                                    background: colors.bg,
                                    color: colors.color,
                                }}
                            >
                                {key}
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
