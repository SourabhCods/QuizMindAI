// ─── view/QuizView.jsx ────────────────────────────────────────────────────────
// Pure view for the quiz feature: three distinct screens rendered by phase.
// Zero business logic — all decisions come from QuizPresenter via props.

import {
  LoadingPage,
  Spinner,
  InfoBanner,
  ProgressBar,
  EmptyState,
} from "./primitives.jsx";
import {
  SUBJECTS,
  DIFFICULTIES,
  TOPICS,
  QUIZ_LENGTHS,
  TIME_PER_Q_MIN,
  TIME_PER_Q_MAX,
  TIME_PER_Q_STEP,
} from "../model/constants.js";

// ── Setup screen ──────────────────────────────────────────────────────────────

export default function QuizSetupView({
  config,
  onConfigChange,
  onGenerate,
  loading,
  error,
}) {
  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-header__title">New Quiz</h1>
          <p className="page-header__sub">
            Configure below — Claude AI will generate questions for you.
          </p>
        </div>
      </div>

      <div className="section">
        <div className="card card--p" style={{ maxWidth: 540 }}>
          {/* Error */}
          {error && (
            <div
              className="info-banner info-banner--coral"
              style={{ marginBottom: 14 }}
            >
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Subject + Topic */}
          <div className="grid-2" style={{ marginBottom: 14 }}>
            <div>
              <label className="form-label">Subject</label>
              <select
                className="form-input form-select"
                value={config.subject}
                onChange={(e) =>
                  onConfigChange({
                    subject: e.target.value,
                    topic: TOPICS[e.target.value][0],
                  })
                }
              >
                {SUBJECTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Topic</label>
              <select
                className="form-input form-select"
                value={config.topic}
                onChange={(e) => onConfigChange({ topic: e.target.value })}
              >
                {(TOPICS[config.subject] || []).map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Difficulty + Questions */}
          <div className="grid-2" style={{ marginBottom: 14 }}>
            <div>
              <label className="form-label">Difficulty</label>
              <select
                className="form-input form-select"
                value={config.difficulty}
                onChange={(e) => onConfigChange({ difficulty: e.target.value })}
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">No. of Questions</label>
              <select
                className="form-input form-select"
                value={config.numQ}
                onChange={(e) => onConfigChange({ numQ: +e.target.value })}
              >
                {QUIZ_LENGTHS.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Timer */}
          <div style={{ marginBottom: 20 }}>
            <label className="form-label">
              Time per question —{" "}
              <span style={{ color: "var(--c-amber)", fontWeight: 800 }}>
                {config.timePerQ}s
              </span>
            </label>
            <input
              type="range"
              min={TIME_PER_Q_MIN}
              max={TIME_PER_Q_MAX}
              step={TIME_PER_Q_STEP}
              value={config.timePerQ}
              onChange={(e) => onConfigChange({ timePerQ: +e.target.value })}
              style={{
                width: "100%",
                accentColor: "var(--c-teal)",
                marginBottom: 4,
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.62rem",
                color: "var(--c-text-dim)",
              }}
            >
              <span>{TIME_PER_Q_MIN}s</span>
              <span>{TIME_PER_Q_MAX}s</span>
            </div>
          </div>

          <InfoBanner variant="teal" icon="⬡">
            <strong>Adaptive difficulty is ON.</strong> Questions get harder as
            you build a correct-answer streak.
          </InfoBanner>

          <button
            className="btn btn--amber btn--lg"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={onGenerate}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner /> Generating…
              </>
            ) : (
              "⚡ Generate Quiz with AI"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Playing screen ────────────────────────────────────────────────────────────

export function QuizPlayView({
  question,
  options,
  correctIndex,
  currentIdx,
  total,
  difficulty,
  topic,
  timeLeft,
  timeMax,
  streak,
  answered,
  selectedIdx,
  explanation,
  loadingExplanation,
  onSelect,
  onNext,
}) {
  const timerPct = (timeLeft / timeMax) * 100;
  const timerColor =
    timerPct > 50
      ? "var(--c-teal)"
      : timerPct > 25
        ? "var(--c-amber)"
        : "var(--c-coral)";

  const getOptionClass = (i) => {
    let cls = "quiz__option";
    if (!answered) {
      if (i === selectedIdx) cls += " quiz__option--selected";
    } else {
      if (i === correctIndex) cls += " quiz__option--correct";
      else if (i === selectedIdx) cls += " quiz__option--wrong";
    }
    return cls;
  };

  return (
    <div className="fade-in">
      {/* Timer strip */}
      <div className="quiz__timer-strip">
        <div
          className="quiz__timer-fill"
          style={{ width: `${timerPct}%`, background: timerColor }}
        />
      </div>

      <div className="quiz-wrap">
        {/* Meta */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 20,
          }}
        >
          <div>
            <div className="quiz__q-meta">
              Question {currentIdx + 1} / {total}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 5 }}>
              <span className={`diff-${difficulty.toLowerCase()}`}>
                {difficulty}
              </span>
              <span className="chip chip--gray">{topic}</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontWeight: 800,
                fontSize: "1.2rem",
                letterSpacing: "-0.02em",
                color: timerColor,
              }}
            >
              {timeLeft}s
            </div>
            <div style={{ fontSize: "0.62rem", color: "var(--c-text-sub)" }}>
              🔥 streak: {streak}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 24 }}>
          <ProgressBar
            percent={(currentIdx / total) * 100}
            color="var(--c-teal)"
          />
        </div>

        {/* Question text */}
        <div className="quiz__question">{question}</div>

        {/* Options */}
        {options.map((opt, i) => (
          <button
            key={i}
            className={getOptionClass(i)}
            disabled={answered}
            onClick={() => onSelect(i)}
          >
            <span className="quiz__option-key">{["A", "B", "C", "D"][i]}</span>
            {opt}
          </button>
        ))}

        {/* Explanation */}
        {answered && (
          <div className="quiz__explanation fade-in">
            <div className="quiz__explanation-label">✦ AI Explanation</div>
            {loadingExplanation ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "var(--c-text-sub)",
                  fontSize: "0.78rem",
                }}
              >
                <Spinner size="sm" /> Generating explanation…
              </div>
            ) : (
              explanation
            )}
          </div>
        )}

        {/* Next button */}
        {answered && (
          <div
            style={{
              marginTop: 18,
              display: "flex",
              justifyContent: "flex-end",
            }}
            className="fade-in"
          >
            <button className="btn btn--primary" onClick={onNext}>
              {currentIdx + 1 >= total ? "See Results →" : "Next →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Result screen ─────────────────────────────────────────────────────────────

export function QuizResultView({
  score,
  total,
  pct,
  subject,
  topic,
  difficulty,
  questions,
  answers,
  onRetry,
  onNewQuiz,
}) {
  const ringColor =
    pct >= 75
      ? "var(--c-teal)"
      : pct >= 50
        ? "var(--c-amber)"
        : "var(--c-coral)";

  const headline =
    pct >= 90
      ? "Outstanding ✦"
      : pct >= 75
        ? "Great work ⬡"
        : pct >= 50
          ? "Good effort ▣"
          : "Keep practising △";

  return (
    <div className="fade-in quiz-wrap">
      {/* Score ring */}
      <div
        className="card card--p"
        style={{ textAlign: "center", marginBottom: 18 }}
      >
        <div className="quiz__result-ring" style={{ borderColor: ringColor }}>
          <div className="quiz__result-pct" style={{ color: ringColor }}>
            {pct}%
          </div>
          <div className="quiz__result-label">
            {score}/{total} correct
          </div>
        </div>
        <h2 style={{ fontSize: "1.15rem", marginBottom: 5 }}>{headline}</h2>
        <p
          style={{
            color: "var(--c-text-sub)",
            fontSize: "0.78rem",
            marginBottom: 20,
          }}
        >
          {topic} · {difficulty} · {subject}
        </p>
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button className="btn btn--amber" onClick={onNewQuiz}>
            New Quiz
          </button>
          <button className="btn btn--teal" onClick={onRetry}>
            Retry Same Topic
          </button>
        </div>
      </div>

      {/* Per-question breakdown */}
      <div className="card card--p">
        <h3 style={{ fontSize: "0.9rem", marginBottom: 16 }}>
          Question Breakdown
        </h3>
        {questions.map((q, i) => {
          const ans = answers[i];
          const correct = ans?.correct;
          return (
            <div
              key={i}
              style={{
                marginBottom: 16,
                paddingBottom: 16,
                borderBottom:
                  i < questions.length - 1
                    ? "1px solid var(--c-border)"
                    : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  marginBottom: 7,
                }}
              >
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: correct ? "var(--c-teal)" : "var(--c-coral)",
                    color: "var(--c-bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.6rem",
                    fontWeight: 800,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {correct ? "✓" : "✗"}
                </span>
                <span
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 500,
                    lineHeight: 1.5,
                  }}
                >
                  {q.question}
                </span>
              </div>
              <div style={{ paddingLeft: 30, fontSize: "0.75rem" }}>
                <div style={{ color: "var(--c-teal)", marginBottom: 2 }}>
                  ✓ {q.options[q.correct]}
                </div>
                {!correct && ans?.selected >= 0 && (
                  <div style={{ color: "var(--c-coral)" }}>
                    ✗ Your answer: {q.options[ans.selected]}
                  </div>
                )}
                {ans?.timedOut && (
                  <div style={{ color: "var(--c-text-dim)" }}>⏰ Timed out</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
