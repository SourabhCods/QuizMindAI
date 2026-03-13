// ─── view/TeacherHomeView.jsx ─────────────────────────────────────────────────
// Pure view for the teacher dashboard page.
// All data and callbacks arrive as props from TeacherHomePresenter.

import { StatCard, WeaknessHeatmap, EmptyState } from "./primitives.jsx";
import { WEAKNESS_HEATMAP_TOPICS } from "../model/constants.js";

export function TeacherHomeView({
  students,
  classAvg,
  atRiskStudents,
  totalQuizzes,
  onOpenReports,
}) {
  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Teacher Dashboard</h1>
          <p className="page-header__sub">
            AI-powered insights across all your students.
          </p>
        </div>
        <button className="btn btn--amber btn--lg" onClick={onOpenReports}>
          ✦ Generate AI Report
        </button>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <StatCard
          icon="◎"
          label="Total Students"
          value={students.length}
          trend="Class 10A & 10B"
          trendDir="flat"
        />
        <StatCard
          icon="▲"
          label="Class Average"
          value={<span style={{ color: "var(--c-teal)" }}>{classAvg}%</span>}
          trend="↑ 4% this month"
          trendDir="up"
        />
        <StatCard
          icon="△"
          label="At-Risk Students"
          value={<span style={{ color: "var(--c-coral)" }}>{atRiskStudents.length}</span>}
          trend="Need intervention"
          trendDir="down"
        />
        <StatCard
          icon="▣"
          label="Quizzes This Week"
          value={<span style={{ color: "var(--c-amber)" }}>{totalQuizzes}</span>}
          trend="↑ 12 vs last week"
          trendDir="up"
        />
      </div>

      <div className="section">
        <div className="grid-2" style={{ marginBottom: 18 }}>

          {/* Student table */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div
              style={{
                padding: "18px 22px 12px",
                borderBottom: "1px solid var(--c-border)",
              }}
            >
              <h3 style={{ fontSize: "0.9rem" }}>All Students</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Grade</th>
                  <th>Avg</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const color =
                    s.avg >= 75
                      ? "var(--c-teal)"
                      : s.avg >= 60
                      ? "var(--c-amber)"
                      : "var(--c-coral)";
                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td>
                        <span className="chip chip--gray">{s.grade}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color, fontSize: "0.92rem" }}>
                          {s.avg}%
                        </span>
                      </td>
                      <td>
                        <span
                          className={s.trend > 0 ? "trend--up" : "trend--down"}
                          style={{ fontWeight: 700, fontSize: "0.78rem" }}
                        >
                          {s.trend > 0 ? "↑" : "↓"} {Math.abs(s.trend)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* At-risk panel */}
          <div className="card card--p">
            <h3 style={{ fontSize: "0.9rem", marginBottom: 4 }}>
              ⚠ At-Risk Alerts
            </h3>
            <p style={{ fontSize: "0.72rem", color: "var(--c-text-sub)", marginBottom: 14 }}>
              Students needing immediate attention.
            </p>

            {atRiskStudents.length === 0 ? (
              <EmptyState
                icon="✦"
                title="No at-risk students"
                description="All students are performing adequately."
              />
            ) : (
              atRiskStudents.map((s) => (
                <div key={s.id} className="alert-row">
                  <div className="alert-row__name">{s.name}</div>
                  <div className="alert-row__meta">
                    Avg: {s.avg}% · Weak: {s.weakTopics.join(", ")}
                  </div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    <span className="chip chip--coral">Needs Support</span>
                    {s.trend < 0 && (
                      <span className="chip chip--coral">Declining ↓</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Weakness heatmap */}
        <div className="card card--p">
          <h3 style={{ fontSize: "0.9rem", marginBottom: 4 }}>
            Class Weakness Heatmap
          </h3>
          <p
            style={{
              fontSize: "0.72rem",
              color: "var(--c-text-sub)",
              marginBottom: 16,
            }}
          >
            Number of students struggling per topic. Darker = more affected.
          </p>
          <WeaknessHeatmap topics={WEAKNESS_HEATMAP_TOPICS} students={students} />
        </div>
      </div>
    </div>
  );
}
