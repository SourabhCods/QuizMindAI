// ─── presenter/ReportsPresenter.jsx ──────────────────────────────────────────
import { useState } from "react";
import { apiGenerateReport } from "../model/apiService.js"; // FIX 1: was generateReport
import { SAMPLE_STUDENTS } from "../model/constants.js";
import { ReportsView } from "../view/ReportsView.jsx";
import { Toast, useToast } from "../view/primitives.jsx";

export function ReportsPresenter() {
  const [reportType, setReportType] = useState("individual");
  const [selectedStudentId, setSelectedStudentId] = useState(
    SAMPLE_STUDENTS[0].id,
  );
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState("");
  const [error, setError] = useState("");

  const { toast, show } = useToast();

  const handleReportTypeChange = (type) => {
    setReportType(type);
    setReport("");
    setError("");
  };

  const handleStudentChange = (id) => {
    setSelectedStudentId(+id); // ensure number, not string
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
        // Class report — summarise all students
        const classData = SAMPLE_STUDENTS.map(
          (s) =>
            `${s.name} (${s.grade}): avg ${s.avg}%, ${s.quizzes} quizzes, weak: ${s.weakTopics.join(", ")}`,
        ).join("\n");

        result = await apiGenerateReport({
          studentName: "Class Overview",
          subject: "All Subjects",
          score: Math.round(
            SAMPLE_STUDENTS.reduce((a, s) => a + s.avg, 0) /
              SAMPLE_STUDENTS.length,
          ),
          totalQuestions: 100, // treat avg as a percentage out of 100
          weakTopics: [
            ...new Set(SAMPLE_STUDENTS.flatMap((s) => s.weakTopics)),
          ],
          extraContext: `Full class data:\n${classData}`,
        });
      } else {
        // FIX 2: was passing { student } — now maps to correct field names
        const student = SAMPLE_STUDENTS.find((s) => s.id === selectedStudentId);

        result = await apiGenerateReport({
          studentName: student.name, // was student.name inside an object
          subject: "Overall Performance", // constants has no per-subject, use overall
          score: student.avg, // avg is the percentage score
          totalQuestions: 100, // treat avg as out of 100
          weakTopics: student.weakTopics, // array already
        });
      }

      setReport(result);
      show("Report generated ✦", "✦");
    } catch (err) {
      setError("Failed to generate report. Please try again.");
      console.error(err);
    }

    setLoading(false);
  };

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
