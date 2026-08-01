import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { HiOutlineSearch, HiOutlinePlus, HiOutlineTrash, HiOutlineQrcode, HiOutlineDownload, HiOutlinePencil, HiOutlineDocumentDownload } from 'react-icons/hi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';

const Attachments = () => {
  const [attachments, setAttachments] = useState([]);
  const [modules, setModules] = useState([]);
  const [attachmentTypes, setAttachmentTypes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ moduleId: '', attachmentTypeId: '', status: 'active', quantity: 1 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ id: '', quantity: 1, status: 'active' });

  // Delete State
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });

  // Selection & Print State
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchAttachments();
  }, [page, searchTerm, selectedModule, selectedType, selectedStatus]);

  const fetchFilters = async () => {
    try {
      const [modRes, typeRes] = await Promise.all([
        api.get('/modules?limit=100'),
        api.get('/attachment-types?limit=100')
      ]);
      setModules(modRes.data.data);
      setAttachmentTypes(typeRes.data.data);
    } catch (error) {
      toast.error('Failed to load filter options');
    }
  };

  const fetchAttachments = async () => {
    try {
      setLoading(true);
      let url = `/attachments?page=${page}&limit=10`;
      if (searchTerm) url += `&search=${searchTerm}`;
      if (selectedModule) url += `&moduleId=${selectedModule}`;
      if (selectedType) url += `&attachmentTypeId=${selectedType}`;
      if (selectedStatus) url += `&status=${selectedStatus}`;

      const res = await api.get(url);
      setAttachments(res.data.data);
      setPagination(res.data.pagination);
      setSelectedIds([]); // Reset selection when data changes
    } catch (error) {
      toast.error('Failed to load attachments');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAttachments();
  };

  const openModal = () => {
    setFormData({ moduleId: '', attachmentTypeId: '', status: 'active', quantity: 1 });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ moduleId: '', attachmentTypeId: '', status: 'active', quantity: 1 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post('/attachments', formData);
      toast.success('Attachment created successfully');
      closeModal();
      fetchAttachments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create attachment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (item) => {
    setEditFormData({ id: item._id, quantity: item.quantity || 1, status: item.status || 'active' });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditFormData({ id: '', quantity: 1, status: 'active' });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put(`/attachments/${editFormData.id}`, { 
        quantity: editFormData.quantity,
        status: editFormData.status
      });
      toast.success('Attachment updated successfully');
      closeEditModal();
      fetchAttachments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update quantity');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (id) => {
    setDeleteDialog({ isOpen: true, id });
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/attachments/${deleteDialog.id}`);
      toast.success('Attachment deleted successfully');
      fetchAttachments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete attachment');
    } finally {
      setDeleteDialog({ isOpen: false, id: null });
    }
  };

  const downloadQR = async (id, qrId) => {
    try {
      const res = await api.post('/qr/pdf', { attachmentIds: [id], ignoreQuantity: true }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${qrId}_Label.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      toast.error('Failed to download QR PDF');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(attachments.map(a => a._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (e, id) => {
    if (e.target.checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    }
  };

  const downloadSelectedPDF = async () => {
    if (selectedIds.length === 0) return;
    try {
      setIsDownloadingPdf(true);
      const res = await api.post('/qr/pdf', { attachmentIds: selectedIds }, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Selected_QR_Labels.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate PDF. Make sure selected items have generated QR codes.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Attachments Management</h1>
          <p className="page-subtitle">Manage combinations of modules and attachment types</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={downloadSelectedPDF}
            disabled={selectedIds.length === 0 || isDownloadingPdf}
            className="btn bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isDownloadingPdf ? <LoadingSpinner size="sm" className="mr-2" /> : <HiOutlineDocumentDownload className="text-lg mr-2" />}
            Print Selected ({selectedIds.length})
          </button>
          <button onClick={openModal} className="btn-primary">
            <HiOutlinePlus className="text-lg" />
            Create Record
          </button>
        </div>
      </div>

      <div className="card">
        {/* Filters */}
        <div className="p-4 border-b border-surface-200 bg-surface-50 rounded-t-xl grid grid-cols-1 md:grid-cols-4 gap-4">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiOutlineSearch className="text-surface-400 text-lg" />
            </div>
            <input
              type="text"
              placeholder="Search by QR ID..."
              className="input pl-10 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>

          <select
            className="select"
            value={selectedModule}
            onChange={(e) => { setSelectedModule(e.target.value); setPage(1); }}
          >
            <option value="">All Modules</option>
            {modules.map(m => (
              <option key={m._id} value={m._id}>Module {m.moduleNumber}</option>
            ))}
          </select>

          <select
            className="select"
            value={selectedType}
            onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
          >
            <option value="">All Attachment Types</option>
            {attachmentTypes.map(t => (
              <option key={t._id} value={t._id}>{t.attachmentName}</option>
            ))}
          </select>

          <select
            className="select"
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
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
                    <th className="w-12">
                      <input
                        type="checkbox"
                        className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                        onChange={handleSelectAll}
                        checked={attachments.length > 0 && selectedIds.length === attachments.length}
                      />
                    </th>
                    <th>QR ID</th>
                    <th>Module</th>
                    <th>Attachment Name</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>QR Code</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attachments.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-8 text-surface-500">
                        No attachments found.
                      </td>
                    </tr>
                  ) : (
                    attachments.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <input
                            type="checkbox"
                            className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                            checked={selectedIds.includes(item._id)}
                            onChange={(e) => handleSelectOne(e, item._id)}
                          />
                        </td>
                        <td className="font-mono font-semibold text-primary-600">
                          {item.qrId}
                        </td>
                        <td className="font-medium text-surface-900">
                          Module {item.moduleId?.moduleNumber}
                        </td>
                        <td>{item.attachmentTypeId?.attachmentName}</td>
                        <td className="font-medium">{item.quantity || 1}</td>
                        <td>
                          <span
                            className={item.status === 'active' ? 'badge-active' : 'badge-inactive'}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td>
                          {item.qrImage ? (
                            <div className="flex items-center gap-2">
                              <span className="badge-primary">Generated</span>
                              <button
                                onClick={() => downloadQR(item._id, item.qrId)}
                                className="p-1 text-surface-500 hover:text-primary-600 transition-colors"
                                title="Download QR"
                              >
                                <HiOutlineDownload className="text-lg" />
                              </button>
                            </div>
                          ) : (
                            <span className="badge bg-surface-100 text-surface-500">Pending</span>
                          )}
                        </td>
                        <td className="text-right flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"
                            title="Edit Quantity"
                          >
                            <HiOutlinePencil className="text-lg" />
                          </button>
                          <button
                            onClick={() => confirmDelete(item._id)}
                            className="p-1.5 rounded-lg text-danger-600 hover:bg-danger-50 transition-colors"
                            title="Delete"
                          >
                            <HiOutlineTrash className="text-lg" />
                          </button>
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

      {/* Create Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-surface-100">
              <h3 className="text-xl font-bold text-surface-900">
                Create New Attachment Record
              </h3>
              <p className="text-sm text-surface-500 mt-1">
                Link a module with an attachment type to generate a unique QR ID.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Select Module</label>
                <select
                  required
                  className="select"
                  value={formData.moduleId}
                  onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
                >
                  <option value="">-- Select Module --</option>
                  {modules.map(m => (
                    <option key={m._id} value={m._id}>Module {m.moduleNumber}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Select Attachment Type</label>
                <select
                  required
                  className="select"
                  value={formData.attachmentTypeId}
                  onChange={(e) => setFormData({ ...formData, attachmentTypeId: e.target.value })}
                >
                  <option value="">-- Select Attachment Type --</option>
                  {attachmentTypes.map(t => (
                    <option key={t._id} value={t._id}>{t.attachmentName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="input"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="label">Initial Status</label>
                <select
                  className="select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? <LoadingSpinner size="sm" /> : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-surface-100">
              <h3 className="text-xl font-bold text-surface-900">
                Update Attachment
              </h3>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="input"
                  value={editFormData.quantity}
                  onChange={(e) => setEditFormData({ ...editFormData, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="label">Status</label>
                <select
                  className="select"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={closeEditModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? <LoadingSpinner size="sm" /> : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Attachment"
        message="Are you sure you want to delete this attachment record? This will permanently remove its QR code and association."
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default Attachments;
