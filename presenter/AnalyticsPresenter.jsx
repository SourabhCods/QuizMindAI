// ─── presenter/AnalyticsPresenter.jsx ────────────────────────────────────────
// Reads raw session data from the model, transforms it for the view,
// then passes clean props to AnalyticsView.

import { getHistory, getTopicEntries, getRecentHistory } from "../model/sessionStore.js";
import { AnalyticsView } from "../view/AnalyticsView.jsx";

export function AnalyticsPresenter() {
  // ── Read from model ────────────────────────────────────────────────────────
  const history      = getHistory();
  const topicEntries = getTopicEntries().sort((a, b) => a.avg - b.avg);

  // Chart data: last 8 quizzes in chronological order, mapped to { pct, topic }
  const chartData = getRecentHistory(8).map((h) => ({
    pct:   h.pct,
    topic: h.topic,
  }));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AnalyticsView
      history={history}
      topicEntries={topicEntries}
      chartData={chartData}
    />
  );
}
