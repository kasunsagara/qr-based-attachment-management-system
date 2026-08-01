import { useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { HiOutlineQrcode, HiOutlineDocumentDownload, HiOutlineLightningBolt } from 'react-icons/hi';
import LoadingSpinner from '../components/common/LoadingSpinner';

const QrGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleBulkGenerate = async () => {
    try {
      setIsGenerating(true);
      const res = await api.post('/qr/bulk-generate');
      
      if (res.data.generated > 0) {
        toast.success(`Successfully generated ${res.data.generated} new QR codes!`);
      } else {
        toast.success('All attachments already have QR codes.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate QR codes');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAutoCreateAndGenerate = async () => {
    try {
      setIsCreating(true);
      const res = await api.post('/qr/bulk-create');
      
      toast.success(
        `Created ${res.data.created} new records and generated ${res.data.qrGenerated} QR codes!`
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to auto-create records');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      // Empty array means download all
      const res = await api.post('/qr/pdf', { attachmentIds: [] }, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'QR_Labels_All.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate PDF labels. Make sure QR codes are generated first.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">QR Code Generator</h1>
          <p className="page-subtitle">Generate and download QR code labels for factory attachments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bulk Generate Card */}
        <div className="card p-6 flex flex-col h-full">
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
            <HiOutlineQrcode className="text-primary-600 text-2xl" />
          </div>
          <h3 className="text-lg font-bold text-surface-900 mb-2">Generate Missing QRs</h3>
          <p className="text-surface-500 text-sm flex-1 mb-6">
            Scans through all existing attachment records and generates QR codes for any that are currently missing one. This is safe to run multiple times.
          </p>
          <button
            onClick={handleBulkGenerate}
            disabled={isGenerating || isCreating}
            className="btn-primary w-full shadow-lg shadow-primary-500/20"
          >
            {isGenerating ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : null}
            Generate Missing QR Codes
          </button>
        </div>

        {/* Auto Create Card */}
        <div className="card p-6 flex flex-col h-full">
          <div className="w-12 h-12 rounded-xl bg-warning-50 flex items-center justify-center mb-4">
            <HiOutlineLightningBolt className="text-warning-600 text-2xl" />
          </div>
          <h3 className="text-lg font-bold text-surface-900 mb-2">Auto-Create All Combinations</h3>
          <p className="text-surface-500 text-sm flex-1 mb-6">
            Automatically creates records for every possible combination of Modules and Attachment Types that don't exist yet, and generates their QR codes.
          </p>
          <button
            onClick={handleAutoCreateAndGenerate}
            disabled={isGenerating || isCreating}
            className="btn bg-warning-600 text-white hover:bg-warning-700 w-full shadow-lg shadow-warning-500/20"
          >
            {isCreating ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : null}
            Auto-Create & Generate
          </button>
        </div>
      </div>

      {/* Print PDF Card */}
      <div className="card p-6 mt-6 border-indigo-100 bg-gradient-to-br from-white to-indigo-50/50">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <HiOutlineDocumentDownload className="text-indigo-600 text-3xl" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-surface-900 mb-2">Download Printable Labels</h3>
            <p className="text-surface-600 text-sm max-w-2xl">
              Generates a ready-to-print A4 PDF document containing all generated QR codes formatted as labels. Each label includes the QR image, Module Number, and Attachment Name.
            </p>
          </div>
          <div className="flex-shrink-0 w-full md:w-auto mt-4 md:mt-0">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="btn bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 w-full md:w-auto px-8 py-3 text-base"
            >
              {isDownloading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <HiOutlineDocumentDownload className="text-lg mr-2" />
              )}
              Download PDF Labels
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrGenerator;
