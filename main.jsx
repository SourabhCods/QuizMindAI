// ─── main.jsx ─────────────────────────────────────────────────────────────────
// Application entry point and root router.
//
// Responsibility:
//   • Import global styles
//   • Hold top-level navigation state (role + page)
//   • Render Sidebar and route to the correct Presenter
//
// This is the ONLY place that knows all Presenters exist.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";

// ── Styles ────────────────────────────────────────────────────────────────────
import "./styles/global.css";
import "./styles/components.css";

// ── View ──────────────────────────────────────────────────────────────────────
import { Sidebar } from "./view/Sidebar.jsx";

// ── Presenters ────────────────────────────────────────────────────────────────
import { StudentHomePresenter } from "./presenter/StudentHomePresenter.jsx";
import QuizPresenter from "./presenter/QuizPresenter.jsx";
import { AnalyticsPresenter } from "./presenter/AnalyticsPresenter.jsx";
import { TeacherHomePresenter } from "./presenter/TeacherHomePresenter.jsx";
import { ReportsPresenter } from "./presenter/ReportsPresenter.jsx";

// ── Constants ─────────────────────────────────────────────────────────────────
import { ROLES, PAGES } from "./model/constants.js";

// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [role, setRole] = useState(ROLES.STUDENT);
  const [page, setPage] = useState(PAGES.HOME);
  const [quizConfig, setQuizConfig] = useState({});

  // ── Navigation handler passed to all Presenters ───────────────────────────
  // Presenters call this to trigger a page change.
  const handleNavigate = useCallback((targetPage, config = {}) => {
    if (targetPage === PAGES.QUIZ) setQuizConfig(config);
    setPage(targetPage);
  }, []);

  // ── Role switch resets to home ─────────────────────────────────────────────
  const handleRoleSwitch = useCallback((newRole) => {
    setRole(newRole);
    setPage(PAGES.HOME);
    setQuizConfig({});
  }, []);

  // ── Route → Presenter ──────────────────────────────────────────────────────
  const renderPresenter = () => {
    if (role === ROLES.STUDENT) {
      switch (page) {
        case PAGES.HOME:
          return <StudentHomePresenter onNavigate={handleNavigate} />;

        case PAGES.QUIZ:
          // Key changes when quizConfig changes so QuizPresenter remounts fresh.
          return (
            <QuizPresenter
              key={JSON.stringify(quizConfig)}
              initialConfig={quizConfig}
              onNavigate={handleNavigate}
            />
          );

        case PAGES.ANALYTICS:
          return <AnalyticsPresenter />;

        default:
          return <StudentHomePresenter onNavigate={handleNavigate} />;
      }
    }

    if (role === ROLES.TEACHER) {
      switch (page) {
        case PAGES.HOME:
          return <TeacherHomePresenter onNavigate={handleNavigate} />;

        case PAGES.REPORTS:
          return <ReportsPresenter />;

        default:
          return <TeacherHomePresenter onNavigate={handleNavigate} />;
      }
    }

    return null;
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="app">
      <Sidebar
        role={role}
        activePage={page}
        onRoleSwitch={handleRoleSwitch}
        onNavigate={handleNavigate}
      />
      <main className="app__main">{renderPresenter()}</main>
    </div>
  );
}
