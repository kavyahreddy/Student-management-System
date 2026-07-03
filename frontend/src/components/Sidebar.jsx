import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linksByRole = {
  superadmin: [
    { to: "/dashboard", label: "Overview", icon: "🏛" },
    { to: "/users", label: "Manage Accounts", icon: "👥" },
    { to: "/library", label: "Library", icon: "📚" },
    { to: "/hostel", label: "Hostel", icon: "🏠" },
    { to: "/attendance", label: "Attendance", icon: "🗓" },
    { to: "/grades", label: "Grades", icon: "📊" },
    { to: "/documents", label: "Documents (OCR)", icon: "🧾" },
    { to: "/timetable", label: "Timetable", icon: "⏰" },
    { to: "/events", label: "Events & Holidays", icon: "🎉" },
  ],
  sectionadmin: [
    { to: "/dashboard", label: "Overview", icon: "🏛" },
    { to: "/users", label: "Manage Accounts", icon: "👥" },
    { to: "/library", label: "Library", icon: "📚" },
    { to: "/hostel", label: "Hostel", icon: "🏠" },
    { to: "/attendance", label: "Attendance", icon: "🗓" },
    { to: "/grades", label: "Grades", icon: "📊" },
    { to: "/documents", label: "Documents (OCR)", icon: "🧾" },
    { to: "/timetable", label: "Timetable", icon: "⏰" },
    { to: "/events", label: "Events & Holidays", icon: "🎉" },
  ],
  faculty: [
    { to: "/dashboard", label: "Overview", icon: "🏛" },
    { to: "/attendance", label: "Attendance", icon: "🗓" },
    { to: "/grades", label: "Grades", icon: "📊" },
    { to: "/timetable", label: "Timetable", icon: "⏰" },
    { to: "/events", label: "Events & Holidays", icon: "🎉" },
  ],
  student: [
    { to: "/dashboard", label: "Overview", icon: "🏛" },
    { to: "/library", label: "Library", icon: "📚" },
    { to: "/hostel", label: "Hostel", icon: "🏠" },
    { to: "/attendance", label: "Attendance", icon: "🗓" },
    { to: "/grades", label: "Grades", icon: "📊" },
    { to: "/documents", label: "Documents (OCR)", icon: "🧾" },
    { to: "/timetable", label: "Timetable", icon: "⏰" },
    { to: "/events", label: "Events & Holidays", icon: "🎉" },
  ],
  parent: [
    { to: "/dashboard", label: "Overview", icon: "🏛" },
    { to: "/attendance", label: "Attendance", icon: "🗓" },
    { to: "/grades", label: "Grades", icon: "📊" },
    { to: "/events", label: "Events & Holidays", icon: "🎉" },
  ],
};

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();
  const links = linksByRole[user?.role] || [];

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-navy text-cream z-40 transform transition-transform duration-200 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 flex flex-col`}
      >
        <div className="px-6 py-5 border-b border-cream/10">
          <h1 className="font-display text-xl font-semibold tracking-wide">Campusly</h1>
          <p className="text-xs text-cream/50 mt-1 capitalize">{user?.role?.replace("admin", " admin")} panel</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? "bg-gold text-navy font-medium" : "text-cream/80 hover:bg-navy-light"
                }`
              }
            >
              <span aria-hidden>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-cream/10 text-xs text-cream/40">
          {user?.section && <p>Section: {user.section}</p>}
          {user?.department && <p>Department: {user.department}</p>}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
