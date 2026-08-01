import { NavLink } from 'react-router-dom';
import {
  HiOutlineViewGrid,
  HiOutlineCube,
  HiOutlinePuzzle,
  HiOutlineLink,
  HiOutlineQrcode,
  HiOutlineClock,
  HiOutlineX,
} from 'react-icons/hi';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid },
  { to: '/admin/modules', label: 'Modules', icon: HiOutlineCube },
  { to: '/admin/attachment-types', label: 'Attachment Types', icon: HiOutlinePuzzle },
  { to: '/admin/attachments', label: 'Attachments', icon: HiOutlineLink },
  { to: '/admin/qr-generator', label: 'QR Generator', icon: HiOutlineQrcode },
  { to: '/admin/scan-history', label: 'Scan History', icon: HiOutlineClock },
];

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-surface-200 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo area */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-surface-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
              <HiOutlineQrcode className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-surface-900 leading-tight">QR Attach</h1>
              <p className="text-[10px] text-surface-400 font-medium uppercase tracking-wider">Manager</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-surface-100 text-surface-400"
          >
            <HiOutlineX className="text-xl" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                }`
              }
            >
              <item.icon className="text-lg flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-surface-100">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">GF</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-surface-700 truncate">Garment Factory</p>
              <p className="text-[10px] text-surface-400">Production System</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
