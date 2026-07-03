import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Loader from "../components/Loader";

const Events = () => {
  const { user } = useAuth();
  const isAdmin = ["superadmin", "sectionadmin"].includes(user.role);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", type: "event", date: "", department: "All" });
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/events");
      setEvents(data.events);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/events", form);
      setMessage("Added to the calendar.");
      setForm({ title: "", description: "", type: "event", date: "", department: "All" });
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to add.");
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/events/${id}`);
    load();
  };

  const upcoming = events.filter((e) => new Date(e.date) >= new Date());
  const past = events.filter((e) => new Date(e.date) < new Date());

  return (
    <div className="space-y-8">
      <div>
        <h2 className="section-title">Events & holidays</h2>
        <p className="text-navy/60 text-sm mt-1">College-wide calendar of events and holidays.</p>
      </div>

      {isAdmin && (
        <form onSubmit={handleSubmit} className="card grid md:grid-cols-2 gap-4">
          <input className="input-field" placeholder="Title" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="event">Event</option>
            <option value="holiday">Holiday</option>
          </select>
          <input className="input-field" type="date" value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          <input className="input-field" placeholder="Department (or 'All')" value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })} />
          <textarea className="input-field md:col-span-2" placeholder="Description (optional)" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          <div className="md:col-span-2 flex items-center gap-4">
            <button className="btn-accent" type="submit">Add to calendar</button>
            {message && <span className="text-sm text-navy/70">{message}</span>}
          </div>
        </form>
      )}

      {loading ? (
        <Loader />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="font-display text-lg text-navy mb-3">Upcoming</h3>
            <ul className="space-y-3">
              {upcoming.length === 0 && <p className="text-sm text-navy/50">Nothing upcoming.</p>}
              {upcoming.map((e) => (
                <li key={e._id} className="border-b border-navy/5 pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-navy">{e.title}</p>
                      <p className="text-xs text-navy/50">
                        {new Date(e.date).toLocaleDateString()} · {e.type === "holiday" ? "Holiday" : "Event"} · {e.department}
                      </p>
                      {e.description && <p className="text-sm text-navy/60 mt-1">{e.description}</p>}
                    </div>
                    {isAdmin && (
                      <button onClick={() => handleDelete(e._id)} className="text-xs text-red-600 hover:underline">
                        Remove
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h3 className="font-display text-lg text-navy mb-3">Past</h3>
            <ul className="space-y-3">
              {past.length === 0 && <p className="text-sm text-navy/50">No past records.</p>}
              {past.slice(0, 10).map((e) => (
                <li key={e._id} className="border-b border-navy/5 pb-3 text-sm text-navy/50">
                  {e.title} — {new Date(e.date).toLocaleDateString()}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
