// model/apiService.js — QuizMind AI
// All API calls go through the Express backend at /api

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// ── Internal fetch helper ──────────────────────────────────────────────────
async function post(endpoint, body) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || `Server error ${res.status}`);
  }

  return data;
}

// ── Generate Quiz ──────────────────────────────────────────────────────────
export async function apiGenerateQuiz({
  subject,
  topic,
  difficulty,
  numQuestions,
}) {
  if (!subject || !topic || !difficulty || !numQuestions) {
    throw new Error(
      "subject, topic, difficulty, and numQuestions are required",
    );
  }

  const { questions } = await post("/api/generate-quiz", {
    subject,
    topic,
    difficulty,
    numQuestions: Math.min(Math.max(parseInt(numQuestions), 1), 10),
  });

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("No questions returned from AI");
  }

  // Validate shape
  questions.forEach((q, i) => {
    if (!q.question)
      throw new Error(`Question ${i + 1} missing "question" field`);
    if (!Array.isArray(q.options) || q.options.length !== 4)
      throw new Error(`Question ${i + 1} must have exactly 4 options`);
    if (typeof q.correct !== "number" || q.correct < 0 || q.correct > 3)
      throw new Error(`Question ${i + 1} has invalid "correct" index`);
  });

  return questions;
}

// ── Get Per-Answer Explanation ─────────────────────────────────────────────
export async function apiGenerateExplanation({
  question,
  options,
  correctIndex,
  chosenIndex,
}) {
  const { explanation } = await post("/api/explain", {
    question,
    options,
    correctIndex,
    chosenIndex,
  });
  return explanation;
}

// ── Generate Teacher Report ────────────────────────────────────────────────
// FIX: now forwards extraContext for class-level reports
export async function apiGenerateReport({
  studentName,
  subject,
  score,
  totalQuestions,
  weakTopics,
  extraContext,
}) {
  const { report } = await post("/api/report", {
    studentName,
    subject,
    score,
    totalQuestions,
    weakTopics,
    extraContext,
  });
  return report;
}
