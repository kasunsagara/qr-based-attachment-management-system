import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { HiOutlineQrcode, HiOutlineLockClosed, HiOutlineUser } from 'react-icons/hi';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please enter both username and password');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(username, password);
      toast.success('Login successful!');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-soft"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-500/30">
            <HiOutlineQrcode className="text-white text-3xl" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-surface-900 tracking-tight">
          Admin Portal
        </h2>
        <p className="mt-2 text-center text-sm text-surface-500 font-medium uppercase tracking-wider">
          QR Attachment System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-slide-up">
        <div className="bg-white py-8 px-4 shadow-xl shadow-surface-200/50 sm:rounded-2xl sm:px-10 border border-surface-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="label">
                Username
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiOutlineUser className="text-surface-400 text-lg" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input pl-10"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiOutlineLockClosed className="text-surface-400 text-lg" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary btn-lg shadow-lg shadow-primary-500/30"
              >
                {isSubmitting ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : null}
                Sign in
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
             <p className="text-xs text-surface-400">Garment Factory Management System &copy; {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
