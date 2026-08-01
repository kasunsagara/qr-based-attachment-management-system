import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  HiOutlineCube,
  HiOutlinePuzzle,
  HiOutlineQrcode,
  HiOutlineClock,
  HiOutlineLink,
} from 'react-icons/hi';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      setStats(res.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard statistics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Modules',
      value: stats?.totalModules || 0,
      icon: HiOutlineCube,
      color: 'text-primary-600',
      bg: 'bg-primary-50',
      link: '/admin/modules',
    },
    {
      title: 'Unique QR Codes',
      value: stats?.totalQRCodes || 0,
      icon: HiOutlineQrcode,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      link: '/admin/attachments',
    },
    {
      title: 'Physical Attachments',
      value: stats?.totalPhysicalAttachments || 0,
      icon: HiOutlineLink,
      color: 'text-success-600',
      bg: 'bg-success-50',
      link: '/admin/attachments',
    },
    {
      title: 'Total Scans',
      value: stats?.totalScans || 0,
      icon: HiOutlineClock,
      color: 'text-warning-600',
      bg: 'bg-warning-50',
      link: '/admin/scan-history',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-lg border border-surface-200 shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse"></span>
            <span className="text-sm font-medium text-surface-700">Today's Scans: {stats?.todayScans || 0}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <Link key={idx} to={card.link} className="block group">
            <div className="stat-card hover:-translate-y-1 transition-transform duration-200">
              <div className={`stat-icon ${card.bg} ${card.color} group-hover:scale-110 transition-transform duration-200`}>
                <card.icon />
              </div>
              <div>
                <p className="text-sm font-medium text-surface-500">{card.title}</p>
                <p className="text-2xl font-bold text-surface-900 mt-1">{card.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress & QR Status */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-5">
            <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider mb-4 border-b border-surface-100 pb-2">
              QR Generation Status
            </h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-surface-600">Generated</span>
              <span className="text-sm font-medium text-surface-900">
                {stats?.qrGenerated || 0} / {stats?.totalQRCodes || 0}
              </span>
            </div>
            <div className="w-full bg-surface-100 rounded-full h-2.5 mb-4">
              <div
                className="bg-primary-600 h-2.5 rounded-full transition-all duration-1000"
                style={{
                  width: `${
                    stats?.totalQRCodes > 0
                      ? Math.round((stats.qrGenerated / stats.totalQRCodes) * 100)
                      : 0
                  }%`,
                }}
              ></div>
            </div>
            
            <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider mt-6 mb-4 border-b border-surface-100 pb-2">
              Attachment Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-success-500"></span>
                  <span className="text-sm text-surface-600">Active</span>
                </div>
                <span className="text-sm font-medium">{stats?.activeAttachments || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-danger-500"></span>
                  <span className="text-sm text-surface-600">Inactive</span>
                </div>
                <span className="text-sm font-medium">{stats?.inactiveAttachments || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Scans */}
        <div className="lg:col-span-2 card flex flex-col">
          <div className="p-5 border-b border-surface-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider">
              Recent Scans
            </h3>
            <Link to="/admin/scan-history" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All
            </Link>
          </div>
          <div className="p-0 flex-1 overflow-auto">
            {stats?.recentScans && stats.recentScans.length > 0 ? (
              <div className="divide-y divide-surface-100">
                {stats.recentScans.map((scan) => (
                  <div key={scan._id} className="p-4 hover:bg-surface-50 transition-colors flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center flex-shrink-0">
                      <HiOutlineQrcode className="text-surface-500 text-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-surface-900 truncate">
                        {scan.qrId} - {scan.attachmentName}
                      </p>
                      <p className="text-xs text-surface-500 truncate">
                        Module: {scan.moduleNumber}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-medium text-surface-900">
                        {new Date(scan.scannedAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-surface-500">
                        {new Date(scan.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-surface-500">
                <HiOutlineClock className="mx-auto text-4xl text-surface-300 mb-2" />
                <p>No recent scans found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
