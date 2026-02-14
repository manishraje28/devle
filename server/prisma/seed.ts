import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ── Words organized by difficulty ──
// EASY: common, everyday dev words (Chill mode)
// MEDIUM: standard tech terms (Daily/Classic modes)
// HARD: obscure/advanced terms (Extreme mode)

const words = [
    // ═══ EASY (Chill mode) ═══
    { text: 'ARRAY', category: 'GENERAL', difficulty: 'EASY' },
    { text: 'CLASS', category: 'GENERAL', difficulty: 'EASY' },
    { text: 'CLICK', category: 'FRONTEND', difficulty: 'EASY' },
    { text: 'COLOR', category: 'FRONTEND', difficulty: 'EASY' },
    { text: 'COUNT', category: 'GENERAL', difficulty: 'EASY' },
    { text: 'DEBUG', category: 'GENERAL', difficulty: 'EASY' },
    { text: 'EMAIL', category: 'GENERAL', difficulty: 'EASY' },
    { text: 'ERROR', category: 'GENERAL', difficulty: 'EASY' },
    { text: 'EVENT', category: 'FRONTEND', difficulty: 'EASY' },
    { text: 'FETCH', category: 'FRONTEND', difficulty: 'EASY' },
    { text: 'FLOAT', category: 'GENERAL', difficulty: 'EASY' },
    { text: 'FRAME', category: 'FRONTEND', difficulty: 'EASY' },
    { text: 'IMAGE', category: 'FRONTEND', difficulty: 'EASY' },
    { text: 'INDEX', category: 'GENERAL', difficulty: 'EASY' },
    { text: 'INPUT', category: 'FRONTEND', difficulty: 'EASY' },
    { text: 'LABEL', category: 'FRONTEND', difficulty: 'EASY' },
    { text: 'LAYER', category: 'GENERAL', difficulty: 'EASY' },
    { text: 'LEVEL', category: 'GENERAL', difficulty: 'EASY' },
    { text: 'LOGIC', category: 'GENERAL', difficulty: 'EASY' },
    { text: 'LOGIN', category: 'GENERAL', difficulty: 'EASY' },
    { text: 'MODAL', category: 'FRONTEND', difficulty: 'EASY' },
    { text: 'MOUSE', category: 'FRONTEND', difficulty: 'EASY' },
    { text: 'PANEL', category: 'FRONTEND', difficulty: 'EASY' },
    { text: 'PIXEL', category: 'FRONTEND', difficulty: 'EASY' },
    { text: 'PRINT', category: 'GENERAL', difficulty: 'EASY' },
    { text: 'QUERY', category: 'BACKEND', difficulty: 'EASY' },
    { text: 'REACT', category: 'FRONTEND', difficulty: 'EASY' },
    { text: 'RESET', category: 'GENERAL', difficulty: 'EASY' },
    { text: 'ROUTE', category: 'BACKEND', difficulty: 'EASY' },
    { text: 'SCALE', category: 'GENERAL', difficulty: 'EASY' },
    { text: 'SCOPE', category: 'GENERAL', difficulty: 'EASY' },
    { text: 'STACK', category: 'GENERAL', difficulty: 'EASY' },
    { text: 'STATE', category: 'FRONTEND', difficulty: 'EASY' },
    { text: 'STORE', category: 'GENERAL', difficulty: 'EASY' },
    { text: 'STYLE', category: 'FRONTEND', difficulty: 'EASY' },
    { text: 'TABLE', category: 'BACKEND', difficulty: 'EASY' },
    { text: 'TOKEN', category: 'BACKEND', difficulty: 'EASY' },
    { text: 'VALUE', category: 'GENERAL', difficulty: 'EASY' },
    { text: 'VIDEO', category: 'FRONTEND', difficulty: 'EASY' },

    // ═══ MEDIUM (Daily / Classic modes) ═══
    { text: 'AGENT', category: 'AI', difficulty: 'MEDIUM' },
    { text: 'ASYNC', category: 'GENERAL', difficulty: 'MEDIUM' },
    { text: 'AWAIT', category: 'GENERAL', difficulty: 'MEDIUM' },
    { text: 'BATCH', category: 'BACKEND', difficulty: 'MEDIUM' },
    { text: 'BUILD', category: 'DEVOPS', difficulty: 'MEDIUM' },
    { text: 'CACHE', category: 'BACKEND', difficulty: 'MEDIUM' },
    { text: 'CLONE', category: 'GENERAL', difficulty: 'MEDIUM' },
    { text: 'CLOUD', category: 'DEVOPS', difficulty: 'MEDIUM' },
    { text: 'CRATE', category: 'GENERAL', difficulty: 'MEDIUM' },
    { text: 'GRAPH', category: 'GENERAL', difficulty: 'MEDIUM' },
    { text: 'GUARD', category: 'BACKEND', difficulty: 'MEDIUM' },
    { text: 'HOOKS', category: 'FRONTEND', difficulty: 'MEDIUM' },
    { text: 'MERGE', category: 'DEVOPS', difficulty: 'MEDIUM' },
    { text: 'MIXIN', category: 'FRONTEND', difficulty: 'MEDIUM' },
    { text: 'MUTEX', category: 'BACKEND', difficulty: 'MEDIUM' },
    { text: 'NEXUS', category: 'BACKEND', difficulty: 'MEDIUM' },
    { text: 'NODES', category: 'BACKEND', difficulty: 'MEDIUM' },
    { text: 'PARSE', category: 'GENERAL', difficulty: 'MEDIUM' },
    { text: 'PATCH', category: 'BACKEND', difficulty: 'MEDIUM' },
    { text: 'PROXY', category: 'BACKEND', difficulty: 'MEDIUM' },
    { text: 'PULSE', category: 'DEVOPS', difficulty: 'MEDIUM' },
    { text: 'REDIS', category: 'BACKEND', difficulty: 'MEDIUM' },
    { text: 'REGEX', category: 'GENERAL', difficulty: 'MEDIUM' },
    { text: 'SEEDS', category: 'BACKEND', difficulty: 'MEDIUM' },
    { text: 'SHELL', category: 'DEVOPS', difficulty: 'MEDIUM' },
    { text: 'SLACK', category: 'DEVOPS', difficulty: 'MEDIUM' },
    { text: 'SPAWN', category: 'GENERAL', difficulty: 'MEDIUM' },
    { text: 'TRAIT', category: 'GENERAL', difficulty: 'MEDIUM' },
    { text: 'TYPED', category: 'GENERAL', difficulty: 'MEDIUM' },
    { text: 'UNION', category: 'GENERAL', difficulty: 'MEDIUM' },
    { text: 'YIELD', category: 'GENERAL', difficulty: 'MEDIUM' },

    // ═══ HARD (Extreme mode) ═══
    { text: 'BOUND', category: 'GENERAL', difficulty: 'HARD' },
    { text: 'CODEC', category: 'GENERAL', difficulty: 'HARD' },
    { text: 'DEPTH', category: 'GENERAL', difficulty: 'HARD' },
    { text: 'DYLIB', category: 'DEVOPS', difficulty: 'HARD' },
    { text: 'EPOCH', category: 'GENERAL', difficulty: 'HARD' },
    { text: 'FIBER', category: 'BACKEND', difficulty: 'HARD' },
    { text: 'GLOBS', category: 'DEVOPS', difficulty: 'HARD' },
    { text: 'HEAPS', category: 'GENERAL', difficulty: 'HARD' },
    { text: 'INFIX', category: 'GENERAL', difficulty: 'HARD' },
    { text: 'LLAMA', category: 'AI', difficulty: 'HARD' },
    { text: 'MONAD', category: 'GENERAL', difficulty: 'HARD' },
    { text: 'NONCE', category: 'BACKEND', difficulty: 'HARD' },
    { text: 'OPTIC', category: 'GENERAL', difficulty: 'HARD' },
    { text: 'PIVOT', category: 'BACKEND', difficulty: 'HARD' },
    { text: 'QUBIT', category: 'AI', difficulty: 'HARD' },
    { text: 'REIFY', category: 'GENERAL', difficulty: 'HARD' },
    { text: 'SHARD', category: 'BACKEND', difficulty: 'HARD' },
    { text: 'THUNK', category: 'GENERAL', difficulty: 'HARD' },
    { text: 'TRAPS', category: 'DEVOPS', difficulty: 'HARD' },
    { text: 'VOXEL', category: 'GENERAL', difficulty: 'HARD' },
    { text: 'WASM', category: 'GENERAL', difficulty: 'HARD' },
    { text: 'XENON', category: 'DEVOPS', difficulty: 'HARD' },
    { text: 'ZEROS', category: 'GENERAL', difficulty: 'HARD' },
] as const;

async function seed() {
    console.log('🌱 Seeding DEVLE database...');

    const wordData = words.map(w => ({
        text: w.text,
        category: w.category as any,
        difficulty: w.difficulty,
        isActive: true,
    }));

    console.log(`   Inserting ${wordData.length} words (${wordData.filter(w => w.difficulty === 'EASY').length} easy, ${wordData.filter(w => w.difficulty === 'MEDIUM').length} medium, ${wordData.filter(w => w.difficulty === 'HARD').length} hard)...`);

    let count = 0;
    for (const w of wordData) {
        await prisma.word.upsert({
            where: { text: w.text },
            update: { category: w.category, difficulty: w.difficulty },
            create: w,
        });
        count++;
    }
    console.log(`   ✅ ${count} words processed.`);

    // Set today's daily word (MEDIUM difficulty)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const existing = await prisma.dailyWord.findFirst({ where: { date: today } });
    if (!existing) {
        const dailyWord = await prisma.word.findFirst({ where: { isActive: true, difficulty: 'MEDIUM' } });
        if (dailyWord) {
            await prisma.dailyWord.create({ data: { wordId: dailyWord.id, date: today } });
            console.log(`   📅 Daily word set: ${dailyWord.text}`);
        }
    } else {
        const word = await prisma.word.findUnique({ where: { id: existing.wordId } });
        console.log(`   📅 Daily word already set: ${word?.text}`);
    }

    console.log('🎉 Seeding complete!');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
