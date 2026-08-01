import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Layouts
import AdminLayout from './components/layout/AdminLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Modules from './pages/Modules';
import AttachmentTypes from './pages/AttachmentTypes';
import Attachments from './pages/Attachments';
import QrGenerator from './pages/QrGenerator';
import ScanHistory from './pages/ScanHistory';
import PublicQRScan from './pages/PublicQRScan';

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Toast Notifications Provider */}
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'toast-custom',
            duration: 3000,
            style: {
              background: '#334155',
              color: '#fff',
            },
            success: {
              style: {
                background: '#16a34a',
              },
            },
            error: {
              style: {
                background: '#dc2626',
              },
            },
          }}
        />

        <Routes>
          {/* Public Route - QR Scanning for Workers */}
          <Route path="/qr/:qrId" element={<PublicQRScan />} />

          {/* Admin Login */}
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="modules" element={<Modules />} />
            <Route path="attachment-types" element={<AttachmentTypes />} />
            <Route path="attachments" element={<Attachments />} />
            <Route path="qr-generator" element={<QrGenerator />} />
            <Route path="scan-history" element={<ScanHistory />} />
          </Route>

          {/* Catch all redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
