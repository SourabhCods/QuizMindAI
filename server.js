// server.js — QuizMind AI Backend
// AI Provider: Groq (free forever) — console.groq.com

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

// ── Startup validation ─────────────────────────────────────────────────────
if (!process.env.GROQ_API_KEY) {
  console.error("❌  GROQ_API_KEY is missing from .env");
  console.error("    Get your free key at: https://console.groq.com");
  process.exit(1);
}

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] }));
app.use(express.json());

// ── Groq API helper ────────────────────────────────────────────────────────
async function callGroq(prompt, maxTokens = 2048) {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: maxTokens,
        temperature: 0.1, // very low = factually consistent
        messages: [{ role: "user", content: prompt }],
      }),
    },
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      `Groq API error ${response.status}: ${err?.error?.message || "unknown"}`,
    );
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// ── Safe JSON extractor ────────────────────────────────────────────────────
function extractJSON(raw) {
  const cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1)
    throw new Error("No JSON array found in response");

  return JSON.parse(cleaned.slice(start, end + 1));
}

// ── Answer verifier ────────────────────────────────────────────────────────
// After generation, send each question back to the model and ask it to
// confirm the correct index. If it disagrees, use the verified index.
async function verifyAnswers(questions) {
  const verified = [];

  for (const q of questions) {
    try {
      const prompt = `Question: ${q.question}
Options:
0 (A): ${q.options[0]}
1 (B): ${q.options[1]}
2 (C): ${q.options[2]}
3 (D): ${q.options[3]}

Which option index (0, 1, 2, or 3) is the single correct answer?
Solve step by step, then reply with ONLY a single digit: 0, 1, 2, or 3.
No explanation, no text, just the digit.`;

      const raw = await callGroq(prompt, 50);
      const digit = raw.trim().replace(/[^0-3]/g, "")[0]; // extract first 0-3 digit
      const verifiedIndex = parseInt(digit);

      if (!isNaN(verifiedIndex) && verifiedIndex >= 0 && verifiedIndex <= 3) {
        if (verifiedIndex !== q.correct) {
          console.log(
            `  ⚠ Corrected answer for: "${q.question.slice(0, 50)}..." → was ${q.correct}, now ${verifiedIndex}`,
          );
          q.correct = verifiedIndex;
        }
      }
    } catch {
      // verification failed for this question — keep original
    }
    verified.push(q);
  }

  return verified;
}

// ── POST /api/generate-quiz ────────────────────────────────────────────────
app.post("/api/generate-quiz", async (req, res) => {
  const { subject, topic, difficulty, numQuestions } = req.body;

  if (!subject || !topic || !difficulty || !numQuestions) {
    return res
      .status(400)
      .json({
        error: "subject, topic, difficulty, numQuestions are all required",
      });
  }
  const count = Math.min(Math.max(parseInt(numQuestions) || 5, 1), 10);

  const difficultyGuide = {
    Easy: `EASY LEVEL RULES:
- Test direct recall and basic definitions only.
- Questions must be solvable in under 10 seconds.
- Use simple numbers (single digits, round numbers).
- Wrong options must be clearly wrong to anyone who knows the topic.
- Example: "What is 6 x 7?", "What does photosynthesis produce?"`,

    Medium: `MEDIUM LEVEL RULES:
- Test application of concepts, not just recall.
- Require 2-3 steps of reasoning or calculation.
- Use realistic numbers that require actual working (fractions, decimals, multi-step).
- Wrong options must be plausible — common mistakes students make.
- Example: "If a train travels 240km in 3 hours, what is its speed in m/s?"`,

    Hard: `HARD LEVEL RULES — FOLLOW STRICTLY:
- Questions MUST require multi-step reasoning or combining multiple concepts.
- Maths: use quadratics, simultaneous equations, complex word problems, or proofs.
- Science: require applying multiple formulas together or interpreting data.
- English/History: require inference, critical analysis, or evaluation — never recall.
- Wrong options must be highly plausible — sophisticated mistakes, not obvious errors.
- A student who only partially understands the topic WILL get this wrong.
- NEVER generate a question that could pass as Easy or Medium.
- Hard Maths example: "The sum of roots of 2x^2 - 5x + k = 0 is 3. Find the product of roots."
- Hard Science example: "A gas compressed isothermally from 4L to 1L at 300K with initial pressure 1atm. Find the work done."`,
  };

  const prompt = `Generate exactly ${count} multiple-choice quiz questions about "${topic}" (subject: ${subject}).

DIFFICULTY LEVEL: ${difficulty}
${difficultyGuide[difficulty] || difficultyGuide.Medium}

STRICT FORMAT RULES:
- Return ONLY a valid JSON array. No explanation, no markdown, no text before or after.
- Each question must have exactly 4 options labeled A, B, C, D.
- "correct" is the 0-based index of the correct option (0=A, 1=B, 2=C, 3=D).
- "explanation" is exactly 1-2 sentences max. Be concise.
- Solve and verify every answer is 100% correct before returning.

Return exactly this JSON shape (${count} items):
[
  {
    "question": "Question text?",
    "options": ["A. option", "B. option", "C. option", "D. option"],
    "correct": 0,
    "explanation": "One or two sentences max."
  }
]`;

  try {
    console.log(
      `→ Generating ${count} ${difficulty} questions on ${subject} / ${topic}`,
    );
    const raw = await callGroq(prompt, 2048);
    let questions = extractJSON(raw);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Model returned empty or invalid question array");
    }

    // Second pass — verify each answer independently
    console.log(`  Verifying ${questions.length} answers...`);
    questions = await verifyAnswers(questions);

    console.log(`✓ Done — ${questions.length} questions verified`);
    res.json({ questions });
  } catch (err) {
    console.error("Quiz generation error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/explain ──────────────────────────────────────────────────────
app.post("/api/explain", async (req, res) => {
  const { question, options, correctIndex, chosenIndex } = req.body;

  if (!question || !options || correctIndex === undefined) {
    return res
      .status(400)
      .json({ error: "question, options, correctIndex required" });
  }

  const correct = options[correctIndex];
  const chosen = options[chosenIndex] || "not answered";
  const wasRight = correctIndex === chosenIndex;

  const prompt = `Quiz question: ${question}
Correct answer: ${correct}
Student chose: ${chosen}

Write EXACTLY 2 sentences — no more:
- Sentence 1: Explain why "${correct}" is correct (show the working if math).
${
  !wasRight
    ? `- Sentence 2: Briefly explain why "${chosen}" is wrong.`
    : `- Sentence 2: Give one tip to remember this concept.`
}
Plain text only. No bullet points. No markdown. Maximum 60 words total.`;

  try {
    const explanation = await callGroq(prompt, 150);
    res.json({ explanation: explanation.trim() });
  } catch (err) {
    console.error("Explanation error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/report ───────────────────────────────────────────────────────
app.post("/api/report", async (req, res) => {
  const {
    studentName,
    subject,
    score,
    totalQuestions,
    weakTopics,
    extraContext,
  } = req.body;

  // score is sent as a percentage (avg) — handle both cases
  const pct =
    totalQuestions && totalQuestions !== 100
      ? Math.round((score / totalQuestions) * 100)
      : score;

  const prompt = `Write a professional teacher performance report.
Student/Group: ${studentName || "Student"}
Subject: ${subject}
Score: ${pct}%
Weak topics: ${weakTopics?.join(", ") || "none identified"}
${extraContext ? `\nAdditional data:\n${extraContext}` : ""}

Write exactly 3 sentences: performance summary, highlight weak areas, suggest one specific improvement action.
Plain text only. No markdown. No bullet points.`;

  try {
    const report = await callGroq(prompt, 200);
    res.json({ report: report.trim() });
  } catch (err) {
    console.error("Report error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Health check ───────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    provider: "Groq",
    model: "llama-3.3-70b-versatile",
  });
});

// ── Start ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  QuizMind AI server running on http://localhost:${PORT}`);
  console.log(`    AI Provider: Groq (llama-3.3-70b-versatile) — Free forever`);
});
