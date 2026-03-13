// ─── presenter/ReportsPresenter.jsx ──────────────────────────────────────────
// Manages all state for the AI reports feature.
// Calls model/apiService to generate reports via Claude.
// Passes everything to ReportsView as props.

import { useState } from "react";
import { generateReport } from "../model/apiService.js";
import { SAMPLE_STUDENTS } from "../model/constants.js";
import { ReportsView } from "../view/ReportsView.jsx";
import { Toast, useToast } from "../view/primitives.jsx";

export function ReportsPresenter() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [reportType,         setReportType]         = useState("class");
  const [selectedStudentId,  setSelectedStudentId]  = useState(SAMPLE_STUDENTS[0].id);
  const [loading,            setLoading]            = useState(false);
  const [report,             setReport]             = useState("");
  const [error,              setError]              = useState("");

  const { toast, show } = useToast();

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleReportTypeChange = (type) => {
    setReportType(type);
    setReport("");
    setError("");
  };

  const handleStudentChange = (id) => {
    setSelectedStudentId(id);
    setReport("");
    setError("");
  };

  const handleGenerate = async () => {
    setLoading(true);
    setReport("");
    setError("");

    try {
      let result;
      if (reportType === "class") {
        result = await generateReport("class", {
          grade: "Class 10",
          students: SAMPLE_STUDENTS,
        });
      } else {
        const student = SAMPLE_STUDENTS.find((s) => s.id === selectedStudentId);
        result = await generateReport("student", { student });
      }
      setReport(result);
      show("Report generated ✦", "✦");
    } catch {
      setError("Failed to generate report. Please try again.");
    }

    setLoading(false);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <ReportsView
        reportType={reportType}
        students={SAMPLE_STUDENTS}
        selectedStudentId={selectedStudentId}
        loading={loading}
        report={report}
        error={error}
        onReportTypeChange={handleReportTypeChange}
        onStudentChange={handleStudentChange}
        onGenerate={handleGenerate}
      />
      <Toast message={toast?.msg} icon={toast?.icon} />
    </>
  );
}
