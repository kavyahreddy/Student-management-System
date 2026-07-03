import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-navy/10 px-4 md:px-8 py-3 flex items-center justify-between">
      <button
        className="md:hidden text-navy text-2xl leading-none"
        onClick={onMenuClick}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      <div className="hidden md:block">
        <p className="text-sm text-navy/50">Welcome back,</p>
        <p className="font-display text-lg font-semibold text-navy">{user?.name}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-9 h-9 rounded-full bg-navy text-cream flex items-center justify-center font-display font-semibold text-sm">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
        <button onClick={handleLogout} className="text-sm text-navy/70 hover:text-gold-dark font-medium">
          Log out
        </button>
      </div>
    </header>
  );
};

export default Navbar;
