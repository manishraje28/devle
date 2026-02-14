'use client';
import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import GameBoard from '@/components/GameBoard';
import Keyboard from '@/components/Keyboard';
import ModeSelector from '@/components/ModeSelector';
import ResultModal from '@/components/ResultModal';
import StreakDisplay from '@/components/StreakDisplay';
import { useGameStore } from '@/store/gameStore';
import api from '@/services/api';

export default function Home() {
  const store = useGameStore();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const isGuest = !user;
  //this is a comment
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const stored = typeof window !== 'undefined' ? localStorage.getItem('devle_user') : null;
    if (stored) setUser(JSON.parse(stored));
  }, [mounted]);

  const fetchGame = useCallback(async () => {
    try {
      if (isGuest) {
        const res = await api.get(`/game/guest/daily?mode=${store.mode}`);
        if (res.data.success) {
          store.setMaxAttempts(res.data.data.maxAttempts);
          store.setGameToken(res.data.data.gameToken);
          store.setGameId('guest');
        }
      } else {
        const res = await api.get(`/game/daily?mode=${store.mode}`);
        if (res.data.success) {
          const g = res.data.data;
          store.setGameId(g.gameId);
          store.setMaxAttempts(g.maxAttempts);
          if (g.guesses && g.guesses.length > 0) store.loadPreviousGuesses(g.guesses);
          if (g.won) store.setGameOver('won');
          else if (g.completed) store.setGameOver('lost');
        }
        try {
          const statsRes = await api.get('/user/stats');
          if (statsRes.data.success) setStats(statsRes.data.data);
        } catch { }
      }
    } catch (e) {
      console.error('Failed to fetch game:', e);
    }
  }, [user, store.mode, isGuest]);

  useEffect(() => {
    if (mounted) {
      store.resetGame();
      fetchGame();
    }
  }, [mounted, user, store.mode]);

  useEffect(() => {
    if (store.gameStatus === 'won' || store.gameStatus === 'lost') {
      const timer = setTimeout(() => setShowResult(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [store.gameStatus]);

  const handleModeChange = (mode: string) => { store.setMode(mode); setShowResult(false); };
  const handleNewGame = async () => { setShowResult(false); store.resetGame(); fetchGame(); };
  const handleShare = () => {
    const emojiGrid = store.guesses.slice(0, store.currentAttempt)
      .map(row => row.map(t => t.status === 'correct' ? '🟩' : t.status === 'present' ? '🟨' : '⬛').join('')).join('\n');
    navigator.clipboard.writeText(`DEVLE ${store.mode} ${store.gameStatus === 'won' ? store.currentAttempt : 'X'}/${store.maxAttempts}\n\n${emojiGrid}`);
    store.setMessage('Copied!');
    setTimeout(() => store.setMessage(''), 1500);
  };
  const handleLogout = () => {
    localStorage.removeItem('devle_token');
    localStorage.removeItem('devle_refresh');
    localStorage.removeItem('devle_user');
    setUser(null); setStats(null); store.resetGame();
  };

  if (!mounted) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', position: 'relative', zIndex: 10, overflow: 'hidden' }}>
      <Navbar username={user?.username} onLogout={handleLogout} />

      {/* Game area — everything centered, fits viewport */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '8px 16px',
        overflow: 'hidden',
        minHeight: 0,
      }}>
        {/* Mode Selector */}
        <ModeSelector currentMode={store.mode} onSelectMode={handleModeChange} />

        {/* Stats (logged in) */}
        {stats && !isGuest && (
          <StreakDisplay currentStreak={stats.currentStreak} maxStreak={stats.maxStreak} xp={stats.xp} wins={stats.wins} totalGames={stats.totalGames} />
        )}

        {/* Guest badge */}
        {isGuest && (
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)',
            letterSpacing: '0.1em', margin: 0,
          }}>
            GUEST MODE · <a href="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>LOGIN</a> TO SAVE
          </p>
        )}

        {/* Game Board */}
        <GameBoard />

        {/* Keyboard */}
        <Keyboard isGuest={isGuest} />
      </main>

      <ResultModal
        show={showResult}
        won={store.gameStatus === 'won'}
        attempts={store.currentAttempt}
        maxAttempts={store.maxAttempts}
        mode={store.mode}
        onNewGame={handleNewGame}
        onShare={handleShare}
      />
    </div>
  );
}
