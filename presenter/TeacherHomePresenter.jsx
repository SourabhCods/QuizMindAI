// ─── presenter/TeacherHomePresenter.jsx ──────────────────────────────────────
// Computes derived teacher-dashboard data from the model's SAMPLE_STUDENTS
// and passes it to TeacherHomeView.

import { SAMPLE_STUDENTS, PAGES } from "../model/constants.js";
import { TeacherHomeView } from "../view/TeacherHomeView.jsx";

export function TeacherHomePresenter({ onNavigate }) {
  // ── Derive metrics from model data ─────────────────────────────────────────
  const students = SAMPLE_STUDENTS;

  const classAvg = Math.round(
    students.reduce((sum, s) => sum + s.avg, 0) / students.length
  );

  const atRiskStudents = students.filter(
    (s) => s.avg < 65 || s.trend < 0
  );

  // Simulated weekly quiz count (would come from a real DB in production)
  const totalQuizzes = 47;

  // ── Event handlers ─────────────────────────────────────────────────────────
  const handleOpenReports = () => onNavigate(PAGES.REPORTS);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <TeacherHomeView
      students={students}
      classAvg={classAvg}
      atRiskStudents={atRiskStudents}
      totalQuizzes={totalQuizzes}
      onOpenReports={handleOpenReports}
    />
  );
}
