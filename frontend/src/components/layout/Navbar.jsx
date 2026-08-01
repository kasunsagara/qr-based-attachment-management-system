import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineMenu,
  HiOutlineLogout,
  HiOutlineUser,
} from 'react-icons/hi';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-surface-100 text-surface-600 transition-colors"
          id="menu-toggle"
        >
          <HiOutlineMenu className="text-xl" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* User info */}
        <div className="flex items-center gap-3 pl-3 border-l border-surface-200">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-surface-800">{user?.username}</p>
            <p className="text-[10px] text-surface-400 uppercase tracking-wider">{user?.role}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm">
            <HiOutlineUser className="text-white text-sm" />
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-danger-50 text-surface-400 hover:text-danger-600 transition-all duration-200"
            title="Logout"
            id="logout-btn"
          >
            <HiOutlineLogout className="text-lg" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
