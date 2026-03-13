// ─── view/Sidebar.jsx ─────────────────────────────────────────────────────────
// Pure presentational component. Receives all data and callbacks via props.
// Contains zero business logic.

import { ROLES, PAGES } from "../model/constants.js";

const STUDENT_NAV = [
  { id: PAGES.HOME,      icon: "⌂", label: "Home" },
  { id: PAGES.QUIZ,      icon: "⚡", label: "Take Quiz" },
  { id: PAGES.ANALYTICS, icon: "▦", label: "Analytics" },
];

const TEACHER_NAV = [
  { id: PAGES.HOME,    icon: "⌂", label: "Dashboard" },
  { id: PAGES.REPORTS, icon: "✦", label: "AI Reports" },
];

export function Sidebar({ role, activePage, onRoleSwitch, onNavigate }) {
  const navItems = role === ROLES.TEACHER ? TEACHER_NAV : STUDENT_NAV;
  const userName  = role === ROLES.STUDENT ? "Aryan Mehta"   : "Sunita Patel";
  const userRole  = role === ROLES.STUDENT ? "Student · 10A" : "Maths Teacher";
  const initials  = role === ROLES.STUDENT ? "AM"             : "SP";

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-mark">
          <svg viewBox="0 0 14 14" fill="none">
            <path
              d="M2 7h10M7 2l5 5-5 5"
              stroke="#0e0e12"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span>
          QuizMind<span className="sidebar__logo-accent">AI</span>
        </span>
      </div>

      {/* Role toggle */}
      <div className="sidebar__role-toggle">
        <button
          className={`sidebar__role-btn${role === ROLES.STUDENT ? " sidebar__role-btn--active" : ""}`}
          onClick={() => onRoleSwitch(ROLES.STUDENT)}
        >
          Student
        </button>
        <button
          className={`sidebar__role-btn${role === ROLES.TEACHER ? " sidebar__role-btn--active" : ""}`}
          onClick={() => onRoleSwitch(ROLES.TEACHER)}
        >
          Teacher
        </button>
      </div>

      {/* Navigation */}
      <div className="sidebar__section-label">Menu</div>
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`sidebar__item${activePage === item.id ? " sidebar__item--active" : ""}`}
          onClick={() => onNavigate(item.id)}
        >
          <span className="sidebar__item-icon">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}

      {/* User footer */}
      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__avatar">{initials}</div>
          <div>
            <div className="sidebar__user-name">{userName}</div>
            <div className="sidebar__user-role">{userRole}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
