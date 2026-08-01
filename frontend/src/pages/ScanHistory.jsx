import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { HiOutlineSearch, HiOutlineClock, HiOutlineQrcode, HiOutlineDeviceMobile } from 'react-icons/hi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';

const ScanHistory = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchScans();
  }, [page, searchTerm]);

  const fetchScans = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/scans?page=${page}&limit=15&search=${searchTerm}`);
      setScans(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error('Failed to load scan history');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchScans();
  };

  // Helper to detect device type from user agent string
  const getDeviceIcon = (userAgent) => {
    if (!userAgent) return <HiOutlineDeviceMobile className="text-surface-400" />;
    
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <HiOutlineDeviceMobile className="text-primary-500" title="Mobile Device" />;
    }
    return <HiOutlineDeviceMobile className="text-surface-400" />; // Fallback icon
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Scan History</h1>
          <p className="page-subtitle">Log of all QR codes scanned by workers</p>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-surface-200 bg-surface-50 rounded-t-xl">
          <form onSubmit={handleSearch} className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiOutlineSearch className="text-surface-400 text-lg" />
            </div>
            <input
              type="text"
              placeholder="Search by QR ID, Module, or Attachment..."
              className="input pl-10 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <div className="table-container border-none rounded-none">
              <table className="table">
                <thead>
                  <tr>
                    <th>Scan Details</th>
                    <th>Module</th>
                    <th>Attachment Name</th>
                    <th>Device Info</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {scans.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-12 text-surface-500">
                        <HiOutlineClock className="mx-auto text-4xl text-surface-300 mb-3" />
                        <p>No scan history found.</p>
                      </td>
                    </tr>
                  ) : (
                    scans.map((scan) => (
                      <tr key={scan._id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                              <HiOutlineQrcode className="text-primary-600" />
                            </div>
                            <span className="font-mono font-semibold text-primary-700">
                              {scan.qrId}
                            </span>
                          </div>
                        </td>
                        <td className="font-medium text-surface-900">
                          Module {scan.moduleNumber}
                        </td>
                        <td>{scan.attachmentName}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(scan.deviceInfo)}
                            <span className="text-xs text-surface-500 max-w-[150px] truncate" title={scan.deviceInfo}>
                              {scan.deviceInfo || 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div>
                            <p className="font-medium text-surface-900">
                              {new Date(scan.scannedAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-surface-500">
                              {new Date(scan.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
};

export default ScanHistory;
