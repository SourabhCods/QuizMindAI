// ─── view/ReportsView.jsx ─────────────────────────────────────────────────────
// Pure view for the teacher AI Reports page.
// All state and callbacks come from ReportsPresenter.

import { Spinner, EmptyState } from "./primitives.jsx";

export function ReportsView({
  reportType,
  students,
  selectedStudentId,
  loading,
  report,
  error,
  onReportTypeChange,
  onStudentChange,
  onGenerate,
}) {
  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-header__title">AI Reports</h1>
          <p className="page-header__sub">
            Generate AI-powered insights for your class or individual students.
          </p>
        </div>
      </div>

      <div className="section">
        <div className="grid-2">

          {/* Controls */}
          <div className="card card--p">
            <h3 style={{ fontSize: "0.9rem", marginBottom: 16 }}>
              Configure Report
            </h3>

            {error && (
              <div
                className="info-banner info-banner--coral"
                style={{ marginBottom: 14 }}
              >
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Report Type</label>
              <select
                className="form-input form-select"
                value={reportType}
                onChange={(e) => onReportTypeChange(e.target.value)}
              >
                <option value="class">Full Class Report</option>
                <option value="student">Individual Student Report</option>
              </select>
            </div>

            {reportType === "student" && (
              <div style={{ marginBottom: 14 }}>
                <label className="form-label">Student</label>
                <select
                  className="form-input form-select"
                  value={selectedStudentId}
                  onChange={(e) => onStudentChange(+e.target.value)}
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.grade}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div
              className="info-banner info-banner--amber"
              style={{ marginBottom: 16 }}
            >
              <span>✦</span>
              <span>
                Claude will analyse student data and write a professional prose
                report with specific intervention recommendations.
              </span>
            </div>

            <button
              className="btn btn--amber btn--lg"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={onGenerate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner /> Generating report…
                </>
              ) : (
                "✦ Generate AI Report"
              )}
            </button>
          </div>

          {/* Report output */}
          <div className="card card--p" style={{ minHeight: 220 }}>
            <h3 style={{ fontSize: "0.9rem", marginBottom: 14 }}>
              {reportType === "class"
                ? "Class Report"
                : `Report: ${students.find((s) => s.id === selectedStudentId)?.name}`}
            </h3>

            {loading && (
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  color: "var(--c-text-sub)",
                  fontSize: "0.82rem",
                  marginTop: 12,
                }}
              >
                <Spinner />
                Claude is analysing student data…
              </div>
            )}

            {report && !loading && (
              <div
                style={{
                  fontSize: "0.8rem",
                  lineHeight: 1.8,
                  color: "var(--c-text-sub)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {report}
              </div>
            )}

            {!report && !loading && (
              <EmptyState
                icon="▣"
                title="No report generated yet"
                description='Configure the report type and click "Generate AI Report".'
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
