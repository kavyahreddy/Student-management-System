import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Loader from "../components/Loader";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const Timetable = () => {
  const { user } = useAuth();
  const isAdmin = ["superadmin", "sectionadmin"].includes(user.role);
  const department = user.department || user.section || "";

  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [day, setDay] = useState("Monday");
  const [periods, setPeriods] = useState([{ subject: "", startTime: "", endTime: "" }]);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/timetable", { params: { department } });
      setTimetable(data.timetable);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (department) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department]);

  const updatePeriod = (index, field, value) => {
    const updated = [...periods];
    updated[index][field] = value;
    setPeriods(updated);
  };

  const addPeriodRow = () => setPeriods([...periods, { subject: "", startTime: "", endTime: "" }]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.post("/timetable", { department, day, periods });
      setMessage(`Timetable saved for ${day}.`);
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save timetable.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="section-title">Weekly timetable</h2>
        <p className="text-navy/60 text-sm mt-1">Department: {department || "—"}</p>
      </div>

      {isAdmin && (
        <form onSubmit={handleSave} className="card space-y-4">
          <h3 className="font-display text-lg text-navy">Set a day's schedule</h3>
          <select className="input-field max-w-xs" value={day} onChange={(e) => setDay(e.target.value)}>
            {days.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

          {periods.map((p, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-3">
              <input className="input-field" placeholder="Subject" value={p.subject}
                onChange={(e) => updatePeriod(idx, "subject", e.target.value)} required />
              <input className="input-field" type="time" value={p.startTime}
                onChange={(e) => updatePeriod(idx, "startTime", e.target.value)} required />
              <input className="input-field" type="time" value={p.endTime}
                onChange={(e) => updatePeriod(idx, "endTime", e.target.value)} required />
            </div>
          ))}
          <div className="flex items-center gap-4">
            <button type="button" onClick={addPeriodRow} className="text-sm text-gold-dark hover:underline">
              + Add another period
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button className="btn-accent" type="submit">Save timetable</button>
            {message && <span className="text-sm text-navy/70">{message}</span>}
          </div>
        </form>
      )}

      {loading ? (
        <Loader />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {timetable.map((entry) => (
            <div key={entry.day} className="card">
              <h3 className="font-display text-lg text-navy mb-3">{entry.day}</h3>
              {entry.periods.length === 0 ? (
                <p className="text-sm text-navy/50">No classes scheduled.</p>
              ) : (
                <ul className="space-y-2">
                  {entry.periods.map((p, i) => (
                    <li key={i} className="flex justify-between text-sm border-b border-navy/5 pb-2">
                      <span className="font-medium text-navy">{p.subject}</span>
                      <span className="text-navy/50">{p.startTime} – {p.endTime}</span>
                      {p.faculty?.name && <span className="text-navy/40">{p.faculty.name}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Timetable;
