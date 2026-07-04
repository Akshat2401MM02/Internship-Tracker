import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, LogOut, LayoutDashboard, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-800 bg-gray-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-primary-400">
          <Briefcase className="h-6 w-6" />
          Internship Tracker
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="hidden items-center gap-1 text-sm font-medium text-gray-400 hover:text-primary-400 sm:flex"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              to="/ai-resume"
              className="hidden items-center gap-1 text-sm font-medium text-gray-400 hover:text-primary-400 sm:flex"
            >
              <Sparkles className="h-4 w-4" />
              AI Resume
            </Link>
            <span className="hidden text-sm text-gray-400 sm:inline">Hi, {user.name}</span>
            <button onClick={handleLogout} className="btn-secondary">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
