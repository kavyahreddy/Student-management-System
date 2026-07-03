import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Loader from "../components/Loader";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "student",
  admissionNo: "",
  section: "",
  department: "",
};

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const isSuperAdmin = user.role === "superadmin";
  const creatableRoles = isSuperAdmin
    ? ["sectionadmin", "faculty", "student", "parent"]
    : ["faculty", "student", "parent"];

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/users");
      setUsers(data.users);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      await api.post("/users", form);
      setMessage("Account created successfully.");
      setForm(emptyForm);
      loadUsers();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to create account.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!isSuperAdmin) return;
    await api.delete(`/users/${id}`);
    loadUsers();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="section-title">Manage accounts</h2>
        <p className="text-navy/60 text-sm mt-1">
          {isSuperAdmin
            ? "Create section admins, faculty, students, and parents."
            : `Create faculty, student, and parent accounts within ${user.section}.`}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-navy mb-1">Full name</label>
          <input className="input-field" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1">Email</label>
          <input className="input-field" type="email" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1">Temporary password</label>
          <input className="input-field" type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1">Role</label>
          <select className="input-field" name="role" value={form.role} onChange={handleChange}>
            {creatableRoles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {form.role === "student" && (
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Admission number</label>
            <input className="input-field" name="admissionNo" value={form.admissionNo} onChange={handleChange} required />
          </div>
        )}

        {form.role === "sectionadmin" && (
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Section (e.g. CSE, Library, Hostel)</label>
            <input className="input-field" name="section" value={form.section} onChange={handleChange} required />
          </div>
        )}

        {["faculty", "student"].includes(form.role) && (
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Department</label>
            <input
              className="input-field"
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder={isSuperAdmin ? "e.g. CSE" : user.section}
            />
          </div>
        )}

        <div className="md:col-span-2 flex items-center gap-4">
          <button className="btn-accent" type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create account"}
          </button>
          {message && <span className="text-sm text-navy/70">{message}</span>}
        </div>
      </form>

      <div className="card">
        <h3 className="font-display text-lg text-navy mb-3">All accounts</h3>
        {loading ? (
          <Loader />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-navy/50 border-b border-navy/10">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Email / Admission No.</th>
                  <th className="py-2 pr-4">Dept / Section</th>
                  <th className="py-2 pr-4">Status</th>
                  {isSuperAdmin && <th className="py-2 pr-4">Action</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-navy/5">
                    <td className="py-2 pr-4">{u.name}</td>
                    <td className="py-2 pr-4 capitalize">{u.role}</td>
                    <td className="py-2 pr-4">{u.admissionNo || u.email}</td>
                    <td className="py-2 pr-4">{u.department || u.section || "—"}</td>
                    <td className="py-2 pr-4">
                      <span className={u.isActive ? "text-green-700" : "text-red-600"}>
                        {u.isActive ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    {isSuperAdmin && (
                      <td className="py-2 pr-4">
                        {u.isActive && (
                          <button onClick={() => handleDeactivate(u._id)} className="text-red-600 hover:underline">
                            Deactivate
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
