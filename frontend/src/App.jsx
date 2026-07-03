import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Library from "./pages/Library";
import Hostel from "./pages/Hostel";
import Attendance from "./pages/Attendance";
import Grades from "./pages/Grades";
import Documents from "./pages/Documents";
import Timetable from "./pages/Timetable";
import Events from "./pages/Events";

const ADMIN_ROLES = ["superadmin", "sectionadmin"];

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><Users /></ProtectedRoute>} />
        <Route path="/library" element={<Library />} />
        <Route path="/hostel" element={<Hostel />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/grades" element={<Grades />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/events" element={<Events />} />
      </Route>

      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default App;
