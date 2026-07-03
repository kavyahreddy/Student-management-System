import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Loader from "../components/Loader";
import StatCard from "../components/StatCard";

const Attendance = () => {
  const { user } = useAuth();
  const canMark = ["faculty", "sectionadmin", "superadmin"].includes(user.role);

  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Marking form (faculty/admin)
  const [subject, setSubject] = useState("");
  const [department, setDepartment] = useState(user.department || user.section || "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [studentIds, setStudentIds] = useState(""); // comma separated for a minimal demo UI
  const [status, setStatus] = useState("present");
  const [message, setMessage] = useState("");

  const loadStudentView = async () => {
    const studentId = user.role === "parent" ? user.children?.[0] : undefined;
    const { data } = await api.get(`/attendance/student/${studentId || ""}`);
    setSummary(data.summary);
    setRecords(data.records);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (!canMark) await loadStudentView();
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMark = async (e) => {
    e.preventDefault();
    const ids = studentIds.split(",").map((s) => s.trim()).filter(Boolean);
    const recordsPayload = ids.map((student) => ({ student, department, subject, date, status }));
    try {
      await api.post("/attendance/mark", { records: recordsPayload });
      setMessage(`Attendance marked for ${ids.length} student(s).`);
      setStudentIds("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to mark attendance.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="section-title">Attendance</h2>
        <p className="text-navy/60 text-sm mt-1">
          {canMark ? "Mark attendance for your class." : "Track attendance history and percentage."}
        </p>
      </div>

      {canMark && (
        <form onSubmit={handleMark} className="card grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Subject</label>
            <input className="input-field" value={subject} onChange={(e) => setSubject(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Department</label>
            <input className="input-field" value={department} onChange={(e) => setDepartment(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Date</label>
            <input className="input-field" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Status</label>
            <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="leave">Leave</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-navy mb-1">
              Student IDs (comma-separated — demo input, replace with a roster picker in production)
            </label>
            <input className="input-field" value={studentIds} onChange={(e) => setStudentIds(e.target.value)} required />
          </div>
          <div className="md:col-span-2 flex items-center gap-4">
            <button className="btn-accent" type="submit">Mark attendance</button>
            {message && <span className="text-sm text-navy/70">{message}</span>}
          </div>
        </form>
      )}

      {!canMark && (
        loading ? (
          <Loader />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="Attendance %" value={`${summary?.percentage ?? 0}%`} accent />
              <StatCard label="Present" value={summary?.present ?? 0} />
              <StatCard label="Absent" value={summary?.absent ?? 0} />
            </div>
            <div className="card">
              <h3 className="font-display text-lg text-navy mb-3">Recent records</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-navy/50 border-b border-navy/10">
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Subject</th>
                      <th className="py-2 pr-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r) => (
                      <tr key={r._id} className="border-b border-navy/5">
                        <td className="py-2 pr-4">{new Date(r.date).toLocaleDateString()}</td>
                        <td className="py-2 pr-4">{r.subject}</td>
                        <td className="py-2 pr-4 capitalize">{r.status}</td>
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

export default Attendance;
