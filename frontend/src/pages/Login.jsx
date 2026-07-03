import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roleHint = [
  { role: "Super Admin", note: "Full control across every section" },
  { role: "Section Admin", note: "Manages one department or module" },
  { role: "Faculty", note: "Attendance, grading, timetable" },
  { role: "Student", note: "Sign in with your admission number" },
  { role: "Parent", note: "View-only access to your ward" },
];

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(identifier, password);
      navigate("/dashboard");
    } catch {
      // error surfaced via context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left identity panel */}
      <div className="md:w-1/2 bg-navy text-cream flex flex-col justify-between p-8 md:p-14">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 rounded-full border-2 border-gold flex items-center justify-center font-display text-lg">
              C
            </div>
            <span className="font-display text-2xl tracking-wide">Campusly</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl leading-tight max-w-md">
            One campus.
            <br />
            Every record, in its right place.
          </h1>
          <p className="mt-5 text-cream/60 max-w-sm">
            A single system for admissions, academics, hostel, and the library —
            with every role seeing exactly what they need to.
          </p>
        </div>

        <div className="hidden md:block space-y-3 border-t border-cream/10 pt-6">
          {roleHint.map((r) => (
            <div key={r.role} className="flex justify-between text-sm">
              <span className="font-medium text-gold-light">{r.role}</span>
              <span className="text-cream/50">{r.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right login form */}
      <div className="md:w-1/2 flex items-center justify-center p-8 bg-cream">
        <div className="w-full max-w-sm">
          <h2 className="section-title mb-1">Sign in</h2>
          <p className="text-navy/60 text-sm mb-8">
            Use your email, or your admission number if you're a student.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Email / Admission No.</label>
              <input
                className="input-field"
                type="text"
                placeholder="you@college.edu or CSE2024001"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1">Password</label>
              <input
                className="input-field"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <button type="submit" disabled={submitting} className="btn-accent w-full mt-2">
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-xs text-navy/40 mt-8">
            Accounts are created by your Super Admin or Section Admin. Contact your
            administration office if you don't have credentials yet.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
