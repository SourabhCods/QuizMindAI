// ─── presenter/StudentHomePresenter.jsx ──────────────────────────────────────
// Reads data from the model layer, computes derived values,
// and passes everything to StudentHomeView as props.
// Handles navigation callbacks.

import {
  getTotalQuizzes,
  getOverallAvg,
  getWeakTopics,
  getHistory,
} from "../model/sessionStore.js";
import { StudentHomeView } from "../view/StudentHomeView.jsx";

const WEEKLY_GOAL = 5;

export function StudentHomePresenter({ onNavigate }) {
  // ── Read from model ────────────────────────────────────────────────────────
  const totalQuizzes = getTotalQuizzes();
  const avgScore     = getOverallAvg();
  const weakTopics   = getWeakTopics(70);
  const history      = getHistory();
  const weekDone     = Math.min(totalQuizzes, WEEKLY_GOAL);

  // ── Event handlers (business decisions) ───────────────────────────────────
  const handleStartQuiz = () => onNavigate("quiz", {});

  const handleViewAnalytics = () => onNavigate("analytics");

  const handlePracticeWeak = (subject, topic) =>
    onNavigate("quiz", { subject, topic });

  // ── Render view with computed props ───────────────────────────────────────
  return (
    <StudentHomeView
      totalQuizzes={totalQuizzes}
      avgScore={avgScore}
      weekDone={weekDone}
      weeklyGoal={WEEKLY_GOAL}
      weakTopics={weakTopics}
      recentHistory={history}
      onStartQuiz={handleStartQuiz}
      onViewAnalytics={handleViewAnalytics}
      onPracticeWeak={handlePracticeWeak}
    />
  );
}
