import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Loader from "../components/Loader";
import StatCard from "../components/StatCard";

const gradeColor = {
  "A+": "text-green-700", A: "text-green-600", B: "text-blue-600",
  C: "text-amber-600", D: "text-orange-600", F: "text-red-600",
};

const Grades = () => {
  const { user } = useAuth();
  const canRecord = ["faculty", "sectionadmin", "superadmin"].includes(user.role);

  const [grades, setGrades] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    student: "", subject: "", examType: "assignment", marksObtained: "", maxMarks: "", remarks: "",
  });

  const loadGrades = async () => {
    setLoading(true);
    try {
      const studentId = user.role === "parent" ? user.children?.[0] : undefined;
      const { data } = await api.get(`/grades/student/${studentId || ""}`);
      setGrades(data.grades);
      setSummary(data.summary);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canRecord) loadGrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/grades", form);
      setMessage("Grade recorded.");
      setForm({ student: "", subject: "", examType: "assignment", marksObtained: "", maxMarks: "", remarks: "" });
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to record grade.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="section-title">Grades & performance</h2>
        <p className="text-navy/60 text-sm mt-1">
          {canRecord ? "Record marks for assignments and exams." : "Your academic performance across subjects."}
        </p>
      </div>

      {canRecord && (
        <form onSubmit={handleSubmit} className="card grid md:grid-cols-3 gap-4">
          <input className="input-field" placeholder="Student ID" value={form.student}
            onChange={(e) => setForm({ ...form, student: e.target.value })} required />
          <input className="input-field" placeholder="Subject" value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
          <select className="input-field" value={form.examType}
            onChange={(e) => setForm({ ...form, examType: e.target.value })}>
            <option value="assignment">Assignment</option>
            <option value="quiz">Quiz</option>
            <option value="midterm">Midterm</option>
            <option value="final">Final</option>
          </select>
          <input className="input-field" type="number" placeholder="Marks obtained" value={form.marksObtained}
            onChange={(e) => setForm({ ...form, marksObtained: e.target.value })} required />
          <input className="input-field" type="number" placeholder="Max marks" value={form.maxMarks}
            onChange={(e) => setForm({ ...form, maxMarks: e.target.value })} required />
          <input className="input-field" placeholder="Remarks (optional)" value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
          <div className="md:col-span-3 flex items-center gap-4">
            <button className="btn-accent" type="submit">Save grade</button>
            {message && <span className="text-sm text-navy/70">{message}</span>}
          </div>
        </form>
      )}

      {!canRecord && (
        loading ? (
          <Loader />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Overall percentage" value={`${summary?.overallPercentage ?? 0}%`} accent />
              <StatCard label="Subjects recorded" value={summary?.subjectsRecorded ?? 0} />
            </div>
            <div className="card">
              <h3 className="font-display text-lg text-navy mb-3">Marks breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-navy/50 border-b border-navy/10">
                      <th className="py-2 pr-4">Subject</th>
                      <th className="py-2 pr-4">Exam</th>
                      <th className="py-2 pr-4">Marks</th>
                      <th className="py-2 pr-4">Grade</th>
                      <th className="py-2 pr-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((g) => (
                      <tr key={g._id} className="border-b border-navy/5">
                        <td className="py-2 pr-4">{g.subject}</td>
                        <td className="py-2 pr-4 capitalize">{g.examType}</td>
                        <td className="py-2 pr-4">{g.marksObtained}/{g.maxMarks}</td>
                        <td className={`py-2 pr-4 font-semibold ${gradeColor[g.grade] || ""}`}>{g.grade}</td>
                        <td className="py-2 pr-4 text-navy/60">{g.remarks || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
};

export default Grades;
