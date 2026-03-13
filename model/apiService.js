// ─── model/apiService.js ──────────────────────────────────────────────────────
// All network calls to the Anthropic API are isolated here.
// Presenter calls these functions; Views never call them directly.

import { CLAUDE_MODEL, CLAUDE_MAX_TOKENS } from "./constants.js";

const API_PROXY_ENDPOINT = "http://localhost:3001/api/claude";

// ── Core fetch wrapper ────────────────────────────────────────────────────────

async function callClaude(systemPrompt, userPrompt) {
  try {
    console.log("🔄 Calling Claude API via proxy...", {
      model: CLAUDE_MODEL,
      endpoint: API_PROXY_ENDPOINT,
    });

    const response = await fetch(API_PROXY_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemPrompt: systemPrompt,
        userPrompt: userPrompt,
        model: CLAUDE_MODEL,
        maxTokens: CLAUDE_MAX_TOKENS,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("❌ Claude API Error:", {
        status: response.status,
        statusText: response.statusText,
        error: err,
      });
      throw new Error(
        `Claude API error ${response.status}: ${err.error || response.statusText}`,
      );
    }

    const data = await response.json();
    console.log("✅ Claude API Response received");
    return data.content?.map((b) => b.text || "").join("") || "";
  } catch (error) {
    console.error("💥 API Call Failed:", error.message);
    throw error;
  }
}

// ── Domain-level API calls ────────────────────────────────────────────────────

/**
 * Generate a quiz as a JSON array of question objects.
 * @returns {Array<{question, options, correct, explanation}>}
 */
export async function generateQuiz({ subject, topic, difficulty, numQ }) {
  const system = `You are a ${subject} test generator. Your job is to generate EXACTLY ${numQ} questions in the specified format. Output ONLY the questions, nothing else.`;

  const user = `GENERATE EXACTLY ${numQ} QUESTIONS. NOT 2, NOT 3. EXACTLY ${numQ} QUESTIONS ABOUT ${subject.toUpperCase()} ${topic.toUpperCase()}.

FORMAT - FOLLOW EXACTLY:
1. What is 5 + 7? (a) 10 (b) 12 (c) 15 (d) 18 Answer: b
2. What is 15 - 8? (a) 5 (b) 6 (c) 7 (d) 8 Answer: c
3. What is 12 × 3? (a) 30 (b) 36 (c) 40 (d) 45 Answer: b
4. What is 100 ÷ 5? (a) 15 (b) 18 (c) 20 (d) 25 Answer: c
5. What is 8 + 9? (a) 15 (b) 16 (c) 17 (d) 18 Answer: c

RULES - NO EXCEPTIONS:
- Generate EXACTLY ${numQ} questions (count them: 1, 2, 3, 4, 5...)
- ONLY numbers. NO variables (x, y, a, b, c)
- Format: "N. Question (a) answer (b) answer (c) answer (d) answer Answer: letter"
- Each question on its own line
- Include "Answer: a" or "Answer: b" or "Answer: c" or "Answer: d" at the end of each question
- After question ${numQ}, STOP. Do not add more.

NOW GENERATE ALL ${numQ} QUESTIONS:`;

  const raw = await callClaude(system, user);
  console.log("📝 Raw response from model:");
  console.log(raw);
  console.log("📝 Parsing quiz...");

  const questions = [];

  // Split by question numbers: "1. 2. 3." etc (not by newlines, they might be on one line)
  const questionBlocks = raw.split(/(?=\d+\.)/);
  console.log(`Split into ${questionBlocks.length} blocks`);

  for (let i = 0; i < questionBlocks.length; i++) {
    const block = questionBlocks[i];
    if (!block.trim()) continue;

    // Match: "1. Question (a) opt (b) opt (c) opt (d) opt Answer: b"
    // Use [^(]+ to match anything EXCEPT opening paren (prevents greedy matching across options)
    const match = block.match(
      /^\d+[:.]\s+(.+?)\s+\(a\)\s*([^(]+?)\s*\(b\)\s*([^(]+?)\s*\(c\)\s*([^(]+?)\s*\(d\)\s*([^(]+?)\s*[Aa]nswer:\s*([a-d])/i,
    );

    if (match) {
      const correctLetter = match[6].toLowerCase();
      const correctMap = { a: 0, b: 1, c: 2, d: 3 };
      const correctIndex = correctMap[correctLetter] || 0;

      const question = {
        question: match[1].trim(),
        options: [
          match[2].trim(),
          match[3].trim(),
          match[4].trim(),
          match[5].trim(),
        ],
        correct: correctIndex,
        explanation: "This is the correct answer.",
      };
      questions.push(question);
      console.log(
        `✓ Q${questions.length}: "${match[1].substring(0, 50)}..." Answer: ${correctLetter}`,
      );
    } else {
      console.log(
        `✗ Block ${i} failed to parse: "${block.substring(0, 150)}..."`,
      );
    }
  }

  if (questions.length === 0) {
    throw new Error(`No questions parsed. Got: ${raw.substring(0, 500)}`);
  }

  console.log(`✅ Parsed ${questions.length} questions with correct answers`);
  return questions;
  return questions;
}

/**
 * Generate a one-sentence AI explanation for a given answer event.
 */
export async function generateExplanation({
  question,
  correctOption,
  chosenOption,
}) {
  const system =
    "You are a concise, encouraging tutor. Explain in 2–3 sentences why the correct answer is right. Be direct and educational. Plain text only — no markdown, no bullet points.";

  const user = `Question: ${question}
Correct answer: ${correctOption}
Student chose: ${chosenOption}
Explain why the correct answer is right.`;

  return callClaude(system, user);
}

/**
 * Generate a prose AI report for a class or a single student.
 * @param {"class"|"student"} type
 * @param {object} payload  — class data or student data
 */
export async function generateReport(type, payload) {
  const system =
    "You are an expert educational analyst. Write clear, actionable, professional reports for teachers. Use flowing prose paragraphs — no markdown headers, no bullet points. Be empathetic, specific, and constructive.";

  let user;
  if (type === "class") {
    const studentLines = payload.students
      .map(
        (s) =>
          `${s.name} (avg: ${s.avg}%, weak: ${s.weakTopics.join(", ")}, trend: ${s.trend > 0 ? "+" : ""}${s.trend}%)`,
      )
      .join("; ");
    user = `Write a 3-paragraph class performance report for a teacher.
Class: ${payload.grade}
Students: ${studentLines}
Include: (1) overall class summary, (2) students needing urgent intervention and why, (3) recommended lesson-plan adjustments and teaching strategies.`;
  } else {
    const s = payload.student;
    user = `Write a 3-paragraph personalised student report for a teacher.
Student: ${s.name}, Grade ${s.grade}
Average score: ${s.avg}%
Trend: ${s.trend > 0 ? "+" : ""}${s.trend}%
Weak topics: ${s.weakTopics.join(", ")}
Include: (1) performance summary, (2) specific weak areas and root causes, (3) personalised study strategies (spaced repetition, concept maps, etc.) and next steps.`;
  }

  return callClaude(system, user);
}
