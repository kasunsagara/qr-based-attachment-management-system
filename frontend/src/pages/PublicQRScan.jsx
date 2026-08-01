import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios'; // Import pure axios, not our authenticated api instance
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineQrcode, HiOutlineCube, HiOutlinePuzzle } from 'react-icons/hi';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PublicQRScan = () => {
  const { qrId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // When component mounts, fetch the QR data from the public endpoint
    // This also automatically registers a scan history record on the backend
    fetchQRData();
  }, [qrId]);

  const fetchQRData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      // We use standard axios here because this route is public and doesn't need auth tokens
      const res = await axios.get(`${apiUrl}/qr/scan/${qrId}`);
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired QR code.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-100 flex flex-col items-center justify-center p-4">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-surface-600 font-medium animate-pulse">Loading attachment details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center border-t-4 border-danger-500 animate-slide-up">
          <HiOutlineXCircle className="text-danger-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-surface-900 mb-2">Scan Failed</h2>
          <p className="text-surface-600">{error}</p>
        </div>
      </div>
    );
  }

  const isActive = data.status === 'active';

  return (
    <div className="min-h-screen bg-surface-100 py-8 px-4 sm:px-6 flex justify-center items-start sm:items-center">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
        {/* Header */}
        <div className={`p-6 text-center ${isActive ? 'bg-success-600' : 'bg-danger-600'}`}>
          {isActive ? (
            <HiOutlineCheckCircle className="text-white text-6xl mx-auto mb-2" />
          ) : (
            <HiOutlineXCircle className="text-white text-6xl mx-auto mb-2" />
          )}
          <h2 className="text-2xl font-bold text-white mb-1">
            {isActive ? 'Active Attachment' : 'Inactive Attachment'}
          </h2>
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-white mt-2 font-mono text-sm backdrop-blur-sm">
            <HiOutlineQrcode className="text-lg" />
            {data.qrId}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Module Info */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-surface-50 border border-surface-100">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <HiOutlineCube className="text-primary-600 text-xl" />
            </div>
            <div>
              <p className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-1">Production Module</p>
              <p className="text-xl font-bold text-surface-900">Module {data.moduleNumber}</p>
              {data.moduleDescription && (
                <p className="text-sm text-surface-600 mt-1">{data.moduleDescription}</p>
              )}
            </div>
          </div>

          {/* Attachment Info */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-surface-50 border border-surface-100">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <HiOutlinePuzzle className="text-indigo-600 text-xl" />
            </div>
            <div>
              <p className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-1">Attachment Type</p>
              <p className="text-xl font-bold text-surface-900">{data.attachmentName}</p>
              {data.attachmentDescription && (
                <p className="text-sm text-surface-600 mt-1">{data.attachmentDescription}</p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-surface-100 text-center">
             <p className="text-xs text-surface-400">Scan recorded at {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicQRScan;
