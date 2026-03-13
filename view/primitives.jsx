// ─── view/primitives.jsx ──────────────────────────────────────────────────────
// Small, reusable, stateless UI building blocks.
// No business logic. No API calls. Props only.

import { useState, useEffect } from "react";

// ── Toast notification ────────────────────────────────────────────────────────

export function Toast({ message, icon = "✓" }) {
  if (!message) return null;
  return (
    <div className="toast">
      <span>{icon}</span>
      {message}
    </div>
  );
}

// ── Loading spinner ───────────────────────────────────────────────────────────

export function Spinner({ size = "default" }) {
  return <div className={`spinner${size === "sm" ? " spinner--sm" : ""}`} />;
}

// ── Full-page loading state ───────────────────────────────────────────────────

export function LoadingPage({ title, subtitle }) {
  return (
    <div className="loading-page fade-in">
      <div className="loading-page__ring" />
      <div className="loading-page__title">{title}</div>
      {subtitle && <div className="loading-page__sub">{subtitle}</div>}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

export function EmptyState({ icon = "◇", title, description }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────

export function ProgressBar({ percent, color = "var(--c-teal)" }) {
  return (
    <div className="progress-wrap">
      <div
        className="progress-bar"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%`, background: color }}
      />
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

export function StatCard({ label, value, trend, trendDir = "flat", icon }) {
  const trendClass =
    trendDir === "up" ? "trend--up" : trendDir === "down" ? "trend--down" : "trend--flat";
  return (
    <div className="stat-card">
      <div className="stat-card__label">
        {icon && <span>{icon}</span>}
        {label}
      </div>
      <div className="stat-card__value">{value}</div>
      {trend && <div className={`stat-card__trend ${trendClass}`}>{trend}</div>}
    </div>
  );
}

// ── Info banner ───────────────────────────────────────────────────────────────

export function InfoBanner({ variant = "teal", icon, children }) {
  return (
    <div className={`info-banner info-banner--${variant}`}>
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </div>
  );
}

// ── Breakdown bar row ─────────────────────────────────────────────────────────

export function BreakdownRow({ topic, avg, attempts }) {
  const color =
    avg >= 75 ? "var(--c-teal)" : avg >= 50 ? "var(--c-amber)" : "var(--c-coral)";
  return (
    <div className="breakdown-row">
      <div className="breakdown-topic" title={topic}>{topic}</div>
      <div style={{ flex: 1 }}>
        <ProgressBar percent={avg} color={color} />
      </div>
      <div className="breakdown-pct" style={{ color }}>{avg}%</div>
      <span style={{ fontSize: "0.62rem", color: "var(--c-text-dim)", flexShrink: 0 }}>
        {attempts}×
      </span>
    </div>
  );
}

// ── Score sparkline SVG ───────────────────────────────────────────────────────

export function ScoreSparkline({ data }) {
  // data: [{ pct, topic }]
  if (!data || data.length < 2) {
    return (
      <div style={{ color: "var(--c-text-sub)", fontSize: "0.78rem", padding: "20px 0" }}>
        Take at least 2 quizzes to see your trend.
      </div>
    );
  }

  const W = 60;
  const H = 90;
  const pts = data.map((d, i) => ({ x: i * W + W / 2, y: H - (d.pct / 100) * H }));
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaD =
    pathD + ` L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z`;

  const viewW = data.length * W;

  return (
    <div>
      <svg
        viewBox={`0 0 ${viewW} ${H}`}
        className="chart-svg"
        style={{ height: 100 }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--c-teal)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--c-teal)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#sg)" />
        <path d={pathD} fill="none" stroke="var(--c-teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3.5" fill="var(--c-teal)" />
            <text x={p.x} y={p.y - 9} textAnchor="middle" fontSize="9" fill="var(--c-teal)" fontWeight="700" fontFamily="var(--font)">
              {data[i].pct}%
            </text>
          </g>
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        {data.map((d, i) => (
          <span key={i} style={{ fontSize: "0.6rem", color: "var(--c-text-dim)" }}>
            {d.topic.slice(0, 5)}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Weakness heatmap cells ────────────────────────────────────────────────────

export function WeaknessHeatmap({ topics, students }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${topics.length}, 1fr)`, gap: 10 }}>
      {topics.map((topic) => {
        const count = students.filter((s) => s.weakTopics.includes(topic)).length;
        const intensity = count / students.length;
        return (
          <div key={topic} style={{ textAlign: "center" }}>
            <div
              style={{
                height: 52,
                borderRadius: 8,
                background: `rgba(224,92,58,${0.08 + intensity * 0.82})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "1.05rem",
                color: intensity > 0.4 ? "#fff" : "var(--c-coral)",
                marginBottom: 5,
              }}
            >
              {count}
            </div>
            <div style={{ fontSize: "0.62rem", color: "var(--c-text-sub)", lineHeight: 1.3 }}>
              {topic}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── useToast hook (lives here since it's view-layer state) ────────────────────

export function useToast() {
  const [toast, setToast] = useState(null);
  const show = (msg, icon = "✓") => {
    setToast({ msg, icon });
    setTimeout(() => setToast(null), 3000);
  };
  return { toast, show };
}
