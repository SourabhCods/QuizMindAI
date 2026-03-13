// ─── view/StudentHomeView.jsx ─────────────────────────────────────────────────
// Pure view for the student home/dashboard page.
// All data arrives as props from the StudentHomePresenter.

import { StatCard, ProgressBar, EmptyState, BreakdownRow } from "./primitives.jsx";

export function StudentHomeView({
  totalQuizzes,
  avgScore,
  weekDone,
  weeklyGoal,
  weakTopics,
  recentHistory,
  onStartQuiz,
  onViewAnalytics,
  onPracticeWeak,
}) {
  const avgColor =
    avgScore >= 75
      ? "var(--c-teal)"
      : avgScore >= 50
      ? "var(--c-amber)"
      : "var(--c-coral)";

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Good morning ✦</h1>
          <p className="page-header__sub">Your learning snapshot for today.</p>
        </div>
        <button className="btn btn--amber btn--lg" onClick={onStartQuiz}>
          ⚡ Start Quiz
        </button>
      </div>

      {/* Stat row */}
      <div className="stat-grid">
        <StatCard
          icon="▣"
          label="Total Quizzes"
          value={totalQuizzes}
          trend="This session"
          trendDir="flat"
        />
        <StatCard
          icon="◎"
          label="Avg Score"
          value={
            totalQuizzes ? (
              <span style={{ color: avgColor }}>{avgScore}%</span>
            ) : (
              "—"
            )
          }
          trend={totalQuizzes ? "Across all subjects" : "Take a quiz first"}
          trendDir="flat"
        />
        <StatCard
          icon="⬡"
          label="Weekly Goal"
          value={`${weekDone}/${weeklyGoal}`}
          trend={
            <ProgressBar
              percent={(weekDone / weeklyGoal) * 100}
              color="var(--c-amber)"
            />
          }
        />
        <StatCard
          icon="△"
          label="Weak Topics"
          value={
            <span style={{ color: weakTopics.length ? "var(--c-coral)" : "var(--c-teal)" }}>
              {weakTopics.length}
            </span>
          }
          trend={weakTopics.length ? "Need attention" : "All clear"}
          trendDir={weakTopics.length ? "down" : "up"}
        />
      </div>

      {/* Body */}
      <div className="section">
        <div className="grid-2">

          {/* Recent quizzes */}
          <div className="card card--p">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: "0.92rem" }}>Recent Quizzes</h3>
              <button className="btn btn--ghost btn--sm" onClick={onViewAnalytics}>
                All →
              </button>
            </div>

            {recentHistory.length === 0 ? (
              <EmptyState icon="▣" title="No quizzes yet" description="Start a quiz to see results here." />
            ) : (
              <div className="scroll-inner">
                {recentHistory.slice(0, 7).map((h, i) => {
                  const color =
                    h.pct >= 75
                      ? "var(--c-teal)"
                      : h.pct >= 50
                      ? "var(--c-amber)"
                      : "var(--c-coral)";
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "9px 0",
                        borderBottom:
                          i < recentHistory.length - 1
                            ? "1px solid var(--c-border)"
                            : "none",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: "0.82rem", marginBottom: 2 }}>
                          {h.topic}
                        </div>
                        <div style={{ fontSize: "0.68rem", color: "var(--c-text-sub)" }}>
                          {h.subject} · <span className={`diff-${h.difficulty.toLowerCase()}`}>{h.difficulty}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: "1.05rem", color, letterSpacing: "-0.02em" }}>
                          {h.pct}%
                        </div>
                        <div style={{ fontSize: "0.62rem", color: "var(--c-text-dim)" }}>
                          {h.score}/{h.total}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Weak topics */}
          <div className="card card--p">
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: "0.92rem", marginBottom: 2 }}>Areas to Improve</h3>
              <p style={{ fontSize: "0.72rem", color: "var(--c-text-sub)" }}>
                Topics scoring below 70%
              </p>
            </div>

            {weakTopics.length === 0 ? (
              <EmptyState
                icon="✦"
                title={totalQuizzes ? "No weak topics!" : "Nothing yet"}
                description={
                  totalQuizzes
                    ? "Your scores look solid across the board."
                    : "Complete quizzes to see your weak areas."
                }
              />
            ) : (
              weakTopics.map((t, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <BreakdownRow topic={t.topic} avg={t.avg} attempts={t.attempts} />
                  <button
                    className="btn btn--ghost btn--sm"
                    style={{ marginTop: 5 }}
                    onClick={() => onPracticeWeak(t.subject, t.topic)}
                  >
                    Practice →
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
