import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import StatCard from "../components/StatCard";
import Loader from "../components/Loader";

const AdminOverview = () => {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ faculty: 0, students: 0, parents: 0 });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [facultyRes, studentRes, parentRes, eventsRes] = await Promise.all([
          api.get("/users", { params: { role: "faculty" } }),
          api.get("/users", { params: { role: "student" } }),
          api.get("/users", { params: { role: "parent" } }),
          api.get("/events", { params: { upcoming: "true" } }),
        ]);
        setCounts({
          faculty: facultyRes.data.users.length,
          students: studentRes.data.users.length,
          parents: parentRes.data.users.length,
        });
        setEvents(eventsRes.data.events.slice(0, 5));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader label="Loading overview..." />;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="section-title">
          {user.role === "superadmin" ? "Institution overview" : `${user.section} section overview`}
        </h2>
        <p className="text-navy/60 text-sm mt-1">
          {user.role === "superadmin"
            ? "Full visibility across every section, department and module."
            : `Scoped to accounts and records within ${user.section}.`}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Faculty members" value={counts.faculty} />
        <StatCard label="Students" value={counts.students} />
        <StatCard label="Parent accounts" value={counts.parents} accent />
      </div>

      <div className="card">
        <h3 className="font-display text-lg text-navy mb-3">Upcoming on the calendar</h3>
        {events.length === 0 ? (
          <p className="text-sm text-navy/50">Nothing scheduled yet. Add an event or holiday to get started.</p>
        ) : (
          <ul className="divide-y divide-navy/10">
            {events.map((e) => (
              <li key={e._id} className="py-2.5 flex justify-between text-sm">
                <span className="font-medium text-navy">{e.title}</span>
                <span className="text-navy/50">
                  {new Date(e.date).toLocaleDateString()} · {e.type === "holiday" ? "Holiday" : "Event"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const StudentOverview = ({ studentId, title = "Your overview" }) => {
  const [attendance, setAttendance] = useState(null);
  const [grades, setGrades] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [attRes, gradeRes] = await Promise.all([
          api.get(`/attendance/student/${studentId || ""}`),
          api.get(`/grades/student/${studentId || ""}`),
        ]);
        setAttendance(attRes.data.summary);
        setGrades(gradeRes.data.summary);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studentId]);

  if (loading) return <Loader label="Loading your records..." />;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="section-title">{title}</h2>
        <p className="text-navy/60 text-sm mt-1">Attendance and academic performance at a glance.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Attendance" value={`${attendance?.percentage ?? 0}%`} accent />
        <StatCard label="Classes present" value={attendance?.present ?? 0} />
        <StatCard label="Classes absent" value={attendance?.absent ?? 0} />
        <StatCard label="Overall marks %" value={`${grades?.overallPercentage ?? 0}%`} />
      </div>
    </div>
  );
};

const FacultyOverview = () => {
  const { user } = useAuth();
  return (
    <div className="space-y-8">
      <div>
        <h2 className="section-title">Welcome, {user.name}</h2>
        <p className="text-navy/60 text-sm mt-1">
          Department: {user.department || "—"}. Use the sidebar to mark attendance, record grades, or check the
          weekly timetable.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <a href="/attendance" className="card hover:border-gold transition-colors">
          <p className="font-display text-lg text-navy">Mark attendance</p>
          <p className="text-sm text-navy/50 mt-1">Record today's class attendance</p>
        </a>
        <a href="/grades" className="card hover:border-gold transition-colors">
          <p className="font-display text-lg text-navy">Enter grades</p>
          <p className="text-sm text-navy/50 mt-1">Add marks for assignments & exams</p>
        </a>
        <a href="/timetable" className="card hover:border-gold transition-colors">
          <p className="font-display text-lg text-navy">View timetable</p>
          <p className="text-sm text-navy/50 mt-1">Check your weekly schedule</p>
        </a>
      </div>
    </div>
  );
};

const ParentOverview = () => {
  const { user } = useAuth();
  const child = user.children?.[0];

  if (!child) {
    return (
      <div className="card">
        <p className="text-navy/60 text-sm">
          No student is linked to your account yet. Please contact the section admin.
        </p>
      </div>
    );
  }

  return <StudentOverview studentId={typeof child === "string" ? child : child._id} title="Your ward's overview" />;
};

const Dashboard = () => {
  const { user } = useAuth();

  if (user.role === "superadmin" || user.role === "sectionadmin") return <AdminOverview />;
  if (user.role === "faculty") return <FacultyOverview />;
  if (user.role === "student") return <StudentOverview />;
  if (user.role === "parent") return <ParentOverview />;
  return null;
};

export default Dashboard;
