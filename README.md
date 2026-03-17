# QuizMind AI

An AI-powered quiz generation platform built for students, educators, and developers who believe intelligent learning tools should be free and open. QuizMind AI runs on Groq's inference API, which means you get LLaMA 3.3 70B — one of the most capable open-weight models available — at zero cost, with response speeds that feel instant. No subscriptions. No usage anxiety. Just a free API key and a codebase you fully control.

---

## What Makes This Different

Most AI quiz tools send a prompt, get a response, and trust it blindly. QuizMind AI does not. Every generated quiz goes through a two-pass verification pipeline. The first pass generates the questions. The second pass sends each question back to the model independently and asks it to re-solve and confirm the correct answer index. If the model disagrees with itself, the answer is corrected before the quiz ever reaches the user. This means the questions you answer are not just generated — they are verified.

The backend also exposes a dedicated explanation endpoint that produces a concise, student-focused breakdown of why the correct answer is right and, when applicable, why the student's chosen answer was wrong. A third endpoint generates structured teacher performance reports with weak topic identification and improvement recommendations.

---

## Tech Stack

**Frontend** — React 18 with Vite. Fast development loop, hot module replacement, and a clean component architecture split across view and presenter layers.

**Backend** — Express.js on Node.js. Handles all Groq API communication, prompt engineering, JSON extraction, answer verification, and error recovery. The frontend never calls Groq directly.

**AI Model** — LLaMA 3.3 70B Versatile via Groq's inference API. Accessed through Groq's OpenAI-compatible endpoint at `https://api.groq.com/openai/v1/chat/completions`. Free to use with a Groq account.

**Styling** — Custom CSS with a dark industrial theme. Responsive across desktop and tablet. Font sizes are tuned for extended reading sessions.

**Build Tool** — Vite with environment variable support via `.env` and API proxying during development.

---

## Architecture

```
quizmind-ai/
├── main.jsx                  React entry point
├── server.js                 Express backend — Groq integration, all AI logic
├── vite.config.js            Vite config and dev proxy
│
├── model/
│   ├── apiService.js         Frontend API client — post() helper, all three endpoints
│   ├── sessionStore.js       In-session progress and state management
│   └── constants.js          Subject, topic, and app-wide configuration
│
├── view/
│   ├── QuizView.jsx          Quiz-taking screen
│   ├── StudentHomeView.jsx   Home screen after login
│   └── ...                   Additional screen components
│
├── presenter/
│   ├── QuizPresenter.jsx     Quiz logic controller, bridges view and model layer
│   └── ...                   Additional presenter modules
│
└── styles/
    ├── global.css            Base styles and theming variables
    └── components.css        Component-level styles
```

The architecture follows a strict MVP pattern. Views handle rendering only. Presenters own logic and state transitions. The model layer handles all data and external communication. This separation means the AI provider can be swapped, the UI can be redesigned, or new quiz modes can be added without touching unrelated code.

---

## Prerequisites

**Node.js** — Any recent LTS version. Download from nodejs.org.

**Groq API Key** — Free forever. Create an account at console.groq.com and generate an API key. No credit card required.

---

## Setup

**Step 1 — Clone and install dependencies**

```
git clone https://github.com/SourabhCods/QuizMindAI.git
cd QuizMindAI
npm install
```

**Step 2 — Configure your environment**

Copy the example environment file and add your Groq API key:

```
cp .env.example .env
```

Open `.env` and set:

```
GROQ_API_KEY=your_key_here
```

The server will refuse to start if this key is missing. You will see a clear error message pointing you to console.groq.com if it is not set.

**Step 3 — Start the backend**

```
node server.js
```

When ready, the server confirms it is listening on port 3001 and identifies the active provider and model.

**Step 4 — Start the frontend**

In a new terminal:

```
npm run dev
```

Navigate to http://localhost:5173.

---

## How It Works

**Quiz generation pipeline**

When you request a quiz, the frontend calls `apiGenerateQuiz()` in `model/apiService.js`, which posts to `/api/generate-quiz` on the Express backend. The backend constructs a prompt that includes a full difficulty specification — Easy, Medium, and Hard each have their own rule set that controls question depth, required reasoning steps, and the plausibility of wrong options. The prompt instructs the model to return a strict JSON array with no surrounding text.

Once the model responds, `extractJSON()` strips any markdown formatting and pulls the raw JSON array from the response. The questions are then passed to the answer verification step.

**Two-pass answer verification**

`verifyAnswers()` loops through every question and sends each one back to the model in isolation with a direct instruction: re-solve the problem step by step, then return only the correct index as a single digit. If the verified index differs from the generated index, the answer is corrected and the change is logged to the server console. This two-pass approach catches the class of errors where a model generates a plausible-looking question but selects the wrong option — a failure mode that single-pass generation cannot detect.

**Answer explanations**

After completing a quiz, each question can be expanded to show an explanation. The frontend calls `apiGenerateExplanation()`, which posts to `/api/explain`. The backend sends a focused prompt asking the model to produce exactly two sentences: one explaining why the correct answer is right, and one explaining why the student's chosen answer was wrong (or a memory tip if they answered correctly). The response is capped at 150 tokens to enforce conciseness.

**Teacher reports**

`apiGenerateReport()` posts to `/api/report` with the student name, subject, score, and an array of identified weak topics. The model returns a three-sentence professional performance summary with a specific improvement recommendation. The endpoint also accepts an `extraContext` field for class-level aggregate data.

---

## API Reference

**POST /api/generate-quiz**

```json
{
  "subject": "Mathematics",
  "topic": "Quadratic Equations",
  "difficulty": "Hard",
  "numQuestions": 5
}
```

Returns an array of verified question objects, each with `question`, `options` (four items), `correct` (zero-based index), and `explanation`.

**POST /api/explain**

```json
{
  "question": "What is the sum of roots of 2x^2 - 5x + 3 = 0?",
  "options": ["A. 5/2", "B. 3/2", "C. 2/5", "D. -5/2"],
  "correctIndex": 0,
  "chosenIndex": 1
}
```

Returns a plain-text explanation in exactly two sentences.

**POST /api/report**

```json
{
  "studentName": "Rahul Sharma",
  "subject": "Physics",
  "score": 14,
  "totalQuestions": 20,
  "weakTopics": ["Thermodynamics", "Wave Optics"],
  "extraContext": ""
}
```

Returns a three-sentence plain-text performance report.

**GET /api/health**

Returns the server status, active provider, and model name.

---

## Difficulty Calibration

The difficulty system goes beyond labeling. Each level has explicit rules baked into the prompt that the model is instructed to follow strictly.

**Easy** — Direct recall and basic definitions. Questions must be answerable in under ten seconds. Wrong options are clearly wrong to anyone who knows the topic.

**Medium** — Application of concepts requiring two to three reasoning steps. Wrong options reflect common student mistakes, not random distractors.

**Hard** — Multi-step reasoning or the combination of multiple concepts. For mathematics this means quadratics, simultaneous equations, or complex word problems. For science this means applying multiple formulas together or interpreting data. Wrong options are sophisticated enough that a student with partial understanding will choose them confidently.

---

## Features

**Verified AI-generated quizzes** — two-pass generation ensures every answer has been independently confirmed before reaching the student.

**Subject and topic selection** — configurable in `model/constants.js`, picked up by the frontend automatically.

**Three difficulty levels** — each with a dedicated prompt specification that controls question complexity end-to-end.

**Per-answer explanations** — concise two-sentence breakdowns generated on demand, not pre-generated and cached.

**Teacher performance reports** — professional three-sentence summaries with weak topic identification and actionable improvement suggestions.

**Session analytics** — quiz progress tracked across the session and surfaced on the student home screen.

**Dark theme** — designed for long study sessions.

**MVP architecture** — clean separation between view, presenter, and model layers throughout the codebase.

---

## Environment Variables

| Variable     | Required | Description                                                                  |
| ------------ | -------- | ---------------------------------------------------------------------------- |
| GROQ_API_KEY | Yes      | Your Groq API key from console.groq.com                                      |
| PORT         | No       | Backend port, defaults to 3001                                               |
| VITE_API_URL | No       | Override the backend URL for the frontend, defaults to http://localhost:3001 |

---

## Troubleshooting

**Server exits immediately on start**

Your `GROQ_API_KEY` is missing from `.env`. The server validates this at startup and exits with a clear message. Get a free key at console.groq.com.

**Groq API error 429**

You have hit the free tier rate limit. Groq's free tier is generous but has per-minute token limits. Wait a moment and retry, or reduce the number of questions per request.

**Questions fewer than requested**

The JSON extraction step (`extractJSON`) may have failed to parse a partial response. Check the server console for parse errors. This is rare with LLaMA 3.3 70B since the model reliably follows structured output instructions.

**Explanation or report returns empty**

Both endpoints have token caps (150 and 200 respectively) to enforce conciseness. If the model returns nothing, check the server console for a Groq API error and verify your key is still valid.

---

## Roadmap

Multi-language quiz generation so students can learn in their native language.

Persistent accounts with cross-device progress sync.

PDF export for quizzes and reports, suitable for classroom distribution.

Teacher dashboard with the ability to build, assign, and track quiz sets across a student group.

Interactive question types including fill-in-the-blank and matching pairs.

Mobile application built on the same backend.

---

## About

**Version** — 1.0  
**Last Updated** — March 2026  
**Status** — Active development  
**AI Provider** — Groq (LLaMA 3.3 70B Versatile) — free forever

QuizMind AI was built on the conviction that a serious educational tool does not need to be expensive or opaque. The AI provider is free. The architecture is readable. The answer verification exists because getting questions right matters more than getting them fast. Every design decision in this codebase reflects that.
