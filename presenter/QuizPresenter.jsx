// ─── presenter/QuizPresenter.jsx ─────────────────────────────────────────────
// Owns all quiz state machine logic.
// Calls model/apiService for AI generation & explanations.
// Calls model/sessionStore to persist results.
// Passes computed props to QuizSetupView / QuizPlayView / QuizResultView.

import { useState, useEffect, useRef, useCallback } from "react";
import { generateQuiz, generateExplanation } from "../model/apiService.js";
import { recordQuizResult } from "../model/sessionStore.js";
import { SUBJECTS, TOPICS, ADAPTIVE_STREAK_THRESHOLD } from "../model/constants.js";
import { QuizSetupView, QuizPlayView, QuizResultView } from "../view/QuizView.jsx";
import { Toast, useToast } from "../view/primitives.jsx";

// Quiz phases (internal state machine)
const PHASE = {
  SETUP:   "setup",
  LOADING: "loading",
  PLAYING: "playing",
  RESULT:  "result",
};

const DEFAULT_CONFIG = {
  subject:    "Mathematics",
  topic:      "Algebra",
  difficulty: "Medium",
  numQ:       5,
  timePerQ:   30,
};

export function QuizPresenter({ initialConfig = {}, onNavigate }) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [phase,      setPhase]      = useState(PHASE.SETUP);
  const [config,     setConfig]     = useState({ ...DEFAULT_CONFIG, ...initialConfig });
  const [questions,  setQuestions]  = useState([]);
  const [current,    setCurrent]    = useState(0);
  const [answers,    setAnswers]    = useState([]);   // [{ selected, correct, timedOut }]
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [answered,   setAnswered]   = useState(false);
  const [timeLeft,   setTimeLeft]   = useState(DEFAULT_CONFIG.timePerQ);
  const [explanation, setExplanation] = useState("");
  const [loadingExp, setLoadingExp] = useState(false);
  const [error,      setError]      = useState("");
  const [streak,     setStreak]     = useState(0);

  const timerRef = useRef(null);
  const { toast, show } = useToast();

  // ── Adaptive difficulty ────────────────────────────────────────────────────
  // Returns adjusted difficulty label based on recent performance.
  const adaptiveDifficulty = useCallback(() => {
    const base = config.difficulty;
    if (streak >= ADAPTIVE_STREAK_THRESHOLD) {
      if (base === "Easy")   return "Medium";
      if (base === "Medium") return "Hard";
    }
    const last3 = answers.slice(-3);
    if (last3.length === 3 && last3.every((a) => !a.correct)) {
      if (base === "Hard")   return "Medium";
      if (base === "Medium") return "Easy";
    }
    return base;
  }, [streak, answers, config.difficulty]);

  // ── Timer management ───────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== PHASE.PLAYING || answered) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase, current, answered]);

  // ── Generate quiz (calls API) ──────────────────────────────────────────────
  const handleGenerate = async () => {
    setPhase(PHASE.LOADING);
    setError("");
    try {
      const qs = await generateQuiz(config);
      setQuestions(qs);
      setAnswers([]);
      setCurrent(0);
      setSelectedIdx(null);
      setAnswered(false);
      setExplanation("");
      setTimeLeft(config.timePerQ);
      setStreak(0);
      setPhase(PHASE.PLAYING);
    } catch (e) {
      console.error("Quiz generation failed:", e);
      setError(`Failed to generate quiz: ${e.message}`);
      setPhase(PHASE.SETUP);
    }
  };

  // ── Handle answer timeout ──────────────────────────────────────────────────
  const handleTimeout = () => {
    clearInterval(timerRef.current);
    setAnswered(true);
    setStreak(0);
    setAnswers((prev) => [...prev, { selected: -1, correct: false, timedOut: true }]);
    show("⏰ Time's up!", "⏰");
    // No explanation on timeout
    setExplanation("You ran out of time. " + (questions[current]?.explanation || ""));
  };

  // ── Handle option select ───────────────────────────────────────────────────
  const handleSelect = async (idx) => {
    if (answered) return;
    clearInterval(timerRef.current);

    const q = questions[current];
    const isCorrect = idx === q.correct;

    setSelectedIdx(idx);
    setAnswered(true);
    setAnswers((prev) => [...prev, { selected: idx, correct: isCorrect, timedOut: false }]);

    if (isCorrect) {
      setStreak((s) => s + 1);
      show("Correct! ✦", "✓");
    } else {
      setStreak(0);
      show("Not quite. See explanation below.", "✗");
    }

    // Fetch AI explanation
    setLoadingExp(true);
    try {
      const exp = await generateExplanation({
        question: q.question,
        correctOption: q.options[q.correct],
        chosenOption: q.options[idx],
      });
      setExplanation(exp);
    } catch {
      setExplanation(q.explanation || "");
    }
    setLoadingExp(false);
  };

  // ── Advance to next question or results ────────────────────────────────────
  const handleNext = () => {
    if (current + 1 >= questions.length) {
      // Save to store
      const finalScore = answers.filter((a) => a.correct).length;
      recordQuizResult(
        config.subject,
        config.topic,
        config.difficulty,
        finalScore,
        questions.length
      );
      setPhase(PHASE.RESULT);
    } else {
      setCurrent((c) => c + 1);
      setSelectedIdx(null);
      setAnswered(false);
      setExplanation("");
      setTimeLeft(config.timePerQ);
    }
  };

  // ── Config change (from setup form) ───────────────────────────────────────
  const handleConfigChange = (patch) => {
    setConfig((c) => ({ ...c, ...patch }));
  };

  // ── Result actions ─────────────────────────────────────────────────────────
  const handleNewQuiz = () => {
    setPhase(PHASE.SETUP);
    setQuestions([]);
    setAnswers([]);
    setError("");
  };

  const handleRetry = () => {
    handleGenerate();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (phase === PHASE.SETUP) {
    return (
      <>
        <QuizSetupView
          config={config}
          onConfigChange={handleConfigChange}
          onGenerate={handleGenerate}
          loading={false}
          error={error}
        />
        <Toast message={toast?.msg} icon={toast?.icon} />
      </>
    );
  }

  if (phase === PHASE.LOADING) {
    return (
      <div className="loading-page fade-in">
        <div className="loading-page__ring" />
        <div className="loading-page__title">Generating your quiz…</div>
        <div className="loading-page__sub">
          Claude is crafting {config.numQ} questions on {config.topic}
        </div>
      </div>
    );
  }

  if (phase === PHASE.PLAYING) {
    const q = questions[current];
    return (
      <>
        <QuizPlayView
          question={q.question}
          options={q.options}
          correctIndex={q.correct}
          currentIdx={current}
          total={questions.length}
          difficulty={adaptiveDifficulty()}
          topic={config.topic}
          timeLeft={timeLeft}
          timeMax={config.timePerQ}
          streak={streak}
          answered={answered}
          selectedIdx={selectedIdx}
          explanation={explanation}
          loadingExplanation={loadingExp}
          onSelect={handleSelect}
          onNext={handleNext}
        />
        <Toast message={toast?.msg} icon={toast?.icon} />
      </>
    );
  }

  if (phase === PHASE.RESULT) {
    const finalScore = answers.filter((a) => a.correct).length;
    const pct = Math.round((finalScore / questions.length) * 100);
    return (
      <>
        <QuizResultView
          score={finalScore}
          total={questions.length}
          pct={pct}
          subject={config.subject}
          topic={config.topic}
          difficulty={config.difficulty}
          questions={questions}
          answers={answers}
          onRetry={handleRetry}
          onNewQuiz={handleNewQuiz}
        />
        <Toast message={toast?.msg} icon={toast?.icon} />
      </>
    );
  }

  return null;
}
