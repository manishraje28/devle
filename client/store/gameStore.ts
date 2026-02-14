import { create } from 'zustand';

type TileStatus = 'correct' | 'present' | 'absent' | 'empty';

interface Tile { letter: string; status: TileStatus; }

interface GameState {
    gameId: string | null;
    gameToken: string | null; // JWT token for guest mode (contains target wordId)
    mode: string;
    guesses: Tile[][];
    currentAttempt: number;
    currentGuess: string;
    gameStatus: 'idle' | 'playing' | 'won' | 'lost';
    maxAttempts: number;
    keyboardStatus: Record<string, TileStatus>;
    message: string;

    setGameId: (id: string) => void;
    setGameToken: (token: string) => void;
    setMode: (mode: string) => void;
    setMaxAttempts: (n: number) => void;
    setMessage: (msg: string) => void;
    addLetter: (letter: string) => void;
    removeLetter: () => void;
    applyGuessResult: (result: { letter: string; status: TileStatus }[]) => void;
    loadPreviousGuesses: (guesses: { letter: string; status: TileStatus }[][]) => void;
    setGameOver: (status: 'won' | 'lost') => void;
    resetGame: () => void;
}

function createEmptyGrid(rows: number): Tile[][] {
    return Array.from({ length: rows }, () =>
        Array.from({ length: 5 }, () => ({ letter: '', status: 'empty' as TileStatus }))
    );
}

// Keyboard priority: correct > present > absent
function upgradeKeyStatus(current: TileStatus | undefined, incoming: TileStatus): TileStatus {
    if (current === 'correct') return 'correct';
    if (incoming === 'correct') return 'correct';
    if (current === 'present') return 'present';
    if (incoming === 'present') return 'present';
    return 'absent';
}

export const useGameStore = create<GameState>()((set, get) => ({
    gameId: null,
    gameToken: null,
    mode: 'DAILY',
    guesses: createEmptyGrid(6),
    currentAttempt: 0,
    currentGuess: '',
    gameStatus: 'idle',
    maxAttempts: 6,
    keyboardStatus: {},
    message: '',

    setGameId: (id) => set({ gameId: id, gameStatus: 'playing' }),
    setGameToken: (token) => set({ gameToken: token }),
    setMode: (mode) => set({ mode }),
    setMaxAttempts: (n) => set({ maxAttempts: n, guesses: createEmptyGrid(n) }),
    setMessage: (msg) => set({ message: msg }),

    addLetter: (letter) => {
        const { currentGuess, gameStatus, currentAttempt, guesses } = get();
        if (gameStatus !== 'playing' || currentGuess.length >= 5) return;

        const newGuesses = guesses.map(r => r.map(t => ({ ...t })));
        newGuesses[currentAttempt][currentGuess.length] = { letter, status: 'empty' };
        set({ currentGuess: currentGuess + letter, guesses: newGuesses });
    },

    removeLetter: () => {
        const { currentGuess, gameStatus, currentAttempt, guesses } = get();
        if (gameStatus !== 'playing' || currentGuess.length === 0) return;

        const newGuesses = guesses.map(r => r.map(t => ({ ...t })));
        newGuesses[currentAttempt][currentGuess.length - 1] = { letter: '', status: 'empty' };
        set({ currentGuess: currentGuess.slice(0, -1), guesses: newGuesses });
    },

    applyGuessResult: (result) => {
        set((state) => {
            const newGuesses = state.guesses.map(r => r.map(t => ({ ...t })));
            const newKeyboard = { ...state.keyboardStatus };

            result.forEach((r, i) => {
                newGuesses[state.currentAttempt][i] = { letter: r.letter, status: r.status };
                newKeyboard[r.letter] = upgradeKeyStatus(newKeyboard[r.letter], r.status);
            });

            const won = result.every(r => r.status === 'correct');
            const newAttempt = state.currentAttempt + 1;
            let gameStatus = state.gameStatus;
            if (won) gameStatus = 'won';
            else if (newAttempt >= state.maxAttempts) gameStatus = 'lost';

            return {
                guesses: newGuesses,
                currentAttempt: newAttempt,
                currentGuess: '',
                gameStatus,
                keyboardStatus: newKeyboard,
            };
        });
    },

    loadPreviousGuesses: (guesses) => {
        set((state) => {
            const newGrid = createEmptyGrid(state.maxAttempts);
            const newKeyboard: Record<string, TileStatus> = {};

            guesses.forEach((row, rowIdx) => {
                row.forEach((tile, colIdx) => {
                    newGrid[rowIdx][colIdx] = tile;
                    if (tile.status !== 'empty') {
                        newKeyboard[tile.letter] = upgradeKeyStatus(newKeyboard[tile.letter], tile.status);
                    }
                });
            });

            return {
                guesses: newGrid,
                currentAttempt: guesses.length,
                keyboardStatus: newKeyboard,
                gameStatus: 'playing',
            };
        });
    },

    setGameOver: (status) => set({ gameStatus: status }),

    resetGame: () => set({
        gameId: null,
        gameToken: null,
        guesses: createEmptyGrid(get().maxAttempts),
        currentAttempt: 0,
        currentGuess: '',
        gameStatus: 'idle',
        keyboardStatus: {},
        message: '',
    }),
}));
