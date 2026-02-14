// ============================================================
// WORDLE GUESS EVALUATION – TWO PASS ALGORITHM
// Handles duplicate letters correctly per official Wordle rules.
// ============================================================

export type TileStatus = 'correct' | 'present' | 'absent';

export interface TileResult {
    letter: string;
    status: TileStatus;
}

/**
 * Evaluates a 5-letter guess against a 5-letter target word.
 * 
 * Pass 1 (Green): Mark exact position matches.
 * Pass 2 (Yellow/Gray): Mark remaining letters as present or absent.
 * 
 * Duplicate letters are tracked via a frequency map that is
 * decremented on each match to prevent over-coloring.
 */
export function evaluateGuess(target: string, guess: string): TileResult[] {
    const t = target.toUpperCase().split('');
    const g = guess.toUpperCase().split('');
    const result: TileResult[] = Array(5).fill(null).map((_, i) => ({
        letter: g[i],
        status: 'absent' as TileStatus,
    }));

    // Build frequency map of target letters
    const freq: Record<string, number> = {};
    for (const ch of t) {
        freq[ch] = (freq[ch] || 0) + 1;
    }

    // ── Pass 1: Exact matches (Green) ──
    for (let i = 0; i < 5; i++) {
        if (g[i] === t[i]) {
            result[i].status = 'correct';
            freq[g[i]]--;
        }
    }

    // ── Pass 2: Wrong-position matches (Yellow) ──
    for (let i = 0; i < 5; i++) {
        if (result[i].status === 'correct') continue;
        if (freq[g[i]] && freq[g[i]] > 0) {
            result[i].status = 'present';
            freq[g[i]]--;
        }
    }

    return result;
}

/**
 * Returns the max attempts allowed for a given game mode.
 */
export function getMaxAttempts(mode: string): number {
    switch (mode) {
        case 'CHILL': return 8;
        case 'EXTREME': return 4;
        case 'CLASSIC':
        case 'DAILY':
        case 'STACK':
        default: return 6;
    }
}

/**
 * Calculate XP earned from a game.
 * Fewer attempts = more XP. Mode multipliers apply.
 */
export function calculateXP(mode: string, attempts: number, won: boolean): number {
    if (!won) return 5; // Participation XP
    const maxAttempts = getMaxAttempts(mode);
    const baseXP = 100;
    const efficiencyBonus = Math.max(0, (maxAttempts - attempts) * 20);

    let modeMultiplier = 1;
    if (mode === 'EXTREME') modeMultiplier = 2;
    if (mode === 'STACK') modeMultiplier = 1.5;

    return Math.round((baseXP + efficiencyBonus) * modeMultiplier);
}
