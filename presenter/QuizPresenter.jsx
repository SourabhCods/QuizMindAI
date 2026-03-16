import { useState, useEffect, useRef, useCallback } from "react";
import {
  apiGenerateQuiz,
  apiGenerateExplanation,
} from "../model/apiService.js";
import { recordQuizResult } from "../model/sessionStore.js";
import QuizSetupView, {
  QuizPlayView,
  QuizResultView,
} from "../view/QuizView.jsx";
import { TOPICS } from "../model/constants.js";
import { LoadingPage } from "../view/primitives.jsx";

const DIFFICULTY_ORDER = ["Easy", "Medium", "Hard"];

export default function QuizPresenter({ onBack }) {
  // ── Config — passed as single object to QuizSetupView ─────────────────────
  const [config, setConfig] = useState({
    subject: "Mathematics",
    topic: "Algebra",
    difficulty: "Medium",
    numQ: 5,
    timePerQ: 30,
  });

  // ── Quiz runtime state ─────────────────────────────────────────────────────
  const [phase, setPhase] = useState("setup");
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null); // 0-3 or null
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState([]); // [{ correct, selected, timedOut }]
  const [explanation, setExplanation] = useState("");
  const [loadingExpl, setLoadingExpl] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [streak, setStreak] = useState(0);
  const [error, setError] = useState("");

  const timerRef = useRef(null);

  // ── Config change handler — resets topic when subject changes ──────────────
  function handleConfigChange(partial) {
    setConfig((prev) => {
      const next = { ...prev, ...partial };
      if (partial.subject && partial.subject !== prev.subject) {
        next.topic = (TOPICS[partial.subject] || [])[0] || "";
      }
      return next;
    });
  }

  // ── Timer ──────────────────────────────────────────────────────────────────
  const startTimer = useCallback((seconds) => {
    clearInterval(timerRef.current);
    setTimeLeft(seconds);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSelect(null, true); // timed out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (phase === "playing") startTimer(config.timePerQ);
    return () => clearInterval(timerRef.current);
  }, [phase, currentIdx]); // eslint-disable-line

  // ── Generate quiz ──────────────────────────────────────────────────────────
  async function handleGenerate() {
    setError("");
    setPhase("loading");
    try {
      const qs = await apiGenerateQuiz({
        subject: config.subject,
        topic: config.topic,
        difficulty: config.difficulty,
        numQuestions: config.numQ,
      });
      setQuestions(qs);
      setCurrentIdx(0);
      setAnswers([]);
      setSelectedIdx(null);
      setAnswered(false);
      setExplanation("");
      setStreak(0);
      setPhase("playing");
    } catch (err) {
      setError(
        err.message ||
          "Failed to generate quiz. Check your API key and try again.",
      );
      setPhase("setup");
    }
  }

  // ── Select an answer ───────────────────────────────────────────────────────
  async function handleSelect(idx, timedOut = false) {
    if (answered) return;
    clearInterval(timerRef.current);

    setSelectedIdx(idx);
    setAnswered(true);

    const q = questions[currentIdx];
    const isCorrect = !timedOut && idx === q.correct;

    // Adaptive difficulty
    const newStreak = isCorrect ? streak + 1 : 0;
    setStreak(newStreak);
    if (newStreak >= 3) {
      const di = DIFFICULTY_ORDER.indexOf(config.difficulty);
      if (di < DIFFICULTY_ORDER.length - 1) {
        handleConfigChange({ difficulty: DIFFICULTY_ORDER[di + 1] });
      }
      setStreak(0);
    } else if (!isCorrect && streak === 0) {
      const di = DIFFICULTY_ORDER.indexOf(config.difficulty);
      if (di > 0) handleConfigChange({ difficulty: DIFFICULTY_ORDER[di - 1] });
    }

    // Store answer — shape matches what QuizResultView reads
    setAnswers((prev) => [
      ...prev,
      { correct: isCorrect, selected: idx, timedOut },
    ]);

    // Fetch AI explanation (non-fatal if fails)
    setLoadingExpl(true);
    try {
      const expl = await apiGenerateExplanation({
        question: q.question,
        options: q.options,
        correctIndex: q.correct,
        chosenIndex: idx,
      });
      setExplanation(expl);
    } catch {
      setExplanation("");
    } finally {
      setLoadingExpl(false);
    }
  }

  // ── Next question ──────────────────────────────────────────────────────────
  function handleNext() {
    if (currentIdx + 1 >= questions.length) {
      const finalScore = answers.filter((a) => a.correct).length;
      recordQuizResult(
        config.subject,
        config.topic,
        config.difficulty,
        finalScore,
        questions.length,
      );
      setPhase("result");
    } else {
      setCurrentIdx((i) => i + 1);
      setSelectedIdx(null);
      setAnswered(false);
      setExplanation("");
    }
  }

  // ── Retry same topic ───────────────────────────────────────────────────────
  function handleRetry() {
    setAnswers([]);
    setSelectedIdx(null);
    setAnswered(false);
    setExplanation("");
    setError("");
    setStreak(0);
    handleGenerate();
  }

  // ── New quiz (back to setup) ───────────────────────────────────────────────
  function handleNewQuiz() {
    setPhase("setup");
    setQuestions([]);
    setAnswers([]);
    setSelectedIdx(null);
    setAnswered(false);
    setExplanation("");
    setError("");
    setStreak(0);
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const score = answers.filter((a) => a.correct).length;
  const pct = questions.length
    ? Math.round((score / questions.length) * 100)
    : 0;

  // ── Render by phase ────────────────────────────────────────────────────────
  if (phase === "loading") {
    return <LoadingPage message="Generating quiz with AI…" />;
  }

  if (phase === "setup") {
    return (
      <QuizSetupView
        config={config}
        onConfigChange={handleConfigChange}
        onGenerate={handleGenerate}
        loading={false}
        error={error}
      />
    );
  }

  if (phase === "playing") {
    const q = questions[currentIdx];
    return (
      <QuizPlayView
        question={q.question}
        options={q.options}
        correctIndex={answered ? q.correct : null}
        currentIdx={currentIdx}
        total={questions.length}
        difficulty={config.difficulty}
        topic={config.topic}
        timeLeft={timeLeft}
        timeMax={config.timePerQ}
        streak={streak}
        answered={answered}
        selectedIdx={selectedIdx}
        explanation={explanation}
        loadingExplanation={loadingExpl}
        onSelect={handleSelect}
        onNext={handleNext}
      />
    );
  }

  if (phase === "result") {
    return (
      <QuizResultView
        score={score}
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
    );
  }

  return null;
}
