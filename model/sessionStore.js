// ─── model/sessionStore.js ────────────────────────────────────────────────────
// Single in-memory store for all runtime state.
// Presenter reads and writes this; Views never touch it directly.

const store = {
  quizHistory: [],   // [{ subject, topic, difficulty, score, total, pct, date }]
  topicScores: {},   // { "Subject::Topic": [pct, pct, ...] }
};

// ── Mutations ─────────────────────────────────────────────────────────────────

export function recordQuizResult(subject, topic, difficulty, score, total) {
  const pct = Math.round((score / total) * 100);
  const entry = {
    subject,
    topic,
    difficulty,
    score,
    total,
    pct,
    date: new Date().toISOString(),
  };
  store.quizHistory.unshift(entry);
  if (store.quizHistory.length > 30) store.quizHistory.pop();

  const key = buildTopicKey(subject, topic);
  if (!store.topicScores[key]) store.topicScores[key] = [];
  store.topicScores[key].push(pct);
}

// ── Queries ───────────────────────────────────────────────────────────────────

export function getHistory() {
  return [...store.quizHistory];
}

export function getTopicEntries() {
  return Object.entries(store.topicScores).map(([key, scores]) => {
    const [subject, topic] = key.split("::");
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    return { key, subject, topic, avg, attempts: scores.length };
  });
}

export function getWeakTopics(threshold = 70) {
  return getTopicEntries()
    .filter((t) => t.avg < threshold)
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 4);
}

export function getTotalQuizzes() {
  return store.quizHistory.length;
}

export function getOverallAvg() {
  if (!store.quizHistory.length) return 0;
  return Math.round(
    store.quizHistory.reduce((a, b) => a + b.pct, 0) / store.quizHistory.length
  );
}

export function getRecentHistory(n = 8) {
  return [...store.quizHistory].reverse().slice(0, n);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function buildTopicKey(subject, topic) {
  return `${subject}::${topic}`;
}
