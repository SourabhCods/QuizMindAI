// ─── view/AnalyticsView.jsx ───────────────────────────────────────────────────
// Pure view for the student analytics page.
// Receives pre-computed data from AnalyticsPresenter.

import { EmptyState, ScoreSparkline, BreakdownRow } from "./primitives.jsx";

export function AnalyticsView({ history, topicEntries, chartData }) {
  if (history.length === 0) {
    return (
      <div className="fade-in">
        <div className="page-header">
          <div>
            <h1 className="page-header__title">Analytics</h1>
            <p className="page-header__sub">Your performance across all topics.</p>
          </div>
        </div>
        <div className="section">
          <div className="card card--p">
            <EmptyState
              icon="▦"
              title="No data yet"
              description="Complete at least one quiz to see your analytics."
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Analytics</h1>
          <p className="page-header__sub">
            Your performance across all topics and quizzes.
          </p>
        </div>
      </div>

      <div className="section">
        <div className="grid-2" style={{ marginBottom: 18 }}>

          {/* Sparkline */}
          <div className="card card--p">
            <h3 style={{ fontSize: "0.9rem", marginBottom: 14 }}>Score Trend</h3>
            <ScoreSparkline data={chartData} />
          </div>

          {/* Topic performance */}
          <div className="card card--p">
            <h3 style={{ fontSize: "0.9rem", marginBottom: 14 }}>
              Topic Performance Map
            </h3>
            {topicEntries.length === 0 ? (
              <p style={{ fontSize: "0.78rem", color: "var(--c-text-sub)" }}>
                No topic data yet.
              </p>
            ) : (
              topicEntries
                .slice(0, 7)
                .map((t) => (
                  <BreakdownRow
                    key={t.key}
                    topic={t.topic}
                    avg={t.avg}
                    attempts={t.attempts}
                  />
                ))
            )}
          </div>
        </div>

        {/* History table */}
        <div className="card" style={{ overflow: "hidden" }}>
          <div
            style={{
              padding: "18px 22px 12px",
              borderBottom: "1px solid var(--c-border)",
            }}
          >
            <h3 style={{ fontSize: "0.9rem" }}>Quiz History</h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Topic</th>
                  <th>Difficulty</th>
                  <th>Score</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => {
                  const color =
                    h.pct >= 75
                      ? "var(--c-teal)"
                      : h.pct >= 50
                      ? "var(--c-amber)"
                      : "var(--c-coral)";
                  return (
                    <tr key={i}>
                      <td style={{ color: "var(--c-text-sub)" }}>{h.subject}</td>
                      <td style={{ fontWeight: 600 }}>{h.topic}</td>
                      <td>
                        <span className={`diff-${h.difficulty.toLowerCase()}`}>
                          {h.difficulty}
                        </span>
                      </td>
                      <td style={{ color: "var(--c-text-sub)" }}>
                        {h.score}/{h.total}
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: "0.9rem",
                            color,
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {h.pct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
