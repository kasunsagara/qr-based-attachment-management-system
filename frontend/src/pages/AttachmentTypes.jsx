import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { HiOutlineSearch, HiOutlinePlus, HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';

const AttachmentTypes = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({ attachmentName: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });

  useEffect(() => {
    fetchTypes();
  }, [page, searchTerm]);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/attachment-types?page=${page}&limit=10&search=${searchTerm}`);
      setTypes(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error('Failed to load attachment types');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTypes();
  };

  const openModal = (type = null) => {
    if (type) {
      setEditingType(type);
      setFormData({ attachmentName: type.attachmentName, description: type.description || '' });
    } else {
      setEditingType(null);
      setFormData({ attachmentName: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingType(null);
    setFormData({ attachmentName: '', description: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingType) {
        await api.put(`/attachment-types/${editingType._id}`, formData);
        toast.success('Attachment type updated successfully');
      } else {
        await api.post('/attachment-types', formData);
        toast.success('Attachment type created successfully');
      }
      closeModal();
      fetchTypes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (id) => {
    setDeleteDialog({ isOpen: true, id });
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/attachment-types/${deleteDialog.id}`);
      toast.success('Attachment type deleted successfully');
      fetchTypes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete attachment type');
    } finally {
      setDeleteDialog({ isOpen: false, id: null });
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Attachment Types</h1>
          <p className="page-subtitle">Manage machine attachment categories</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <HiOutlinePlus className="text-lg" />
          Add Type
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-surface-200">
          <form onSubmit={handleSearch} className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiOutlineSearch className="text-surface-400 text-lg" />
            </div>
            <input
              type="text"
              placeholder="Search attachment types..."
              className="input pl-10"
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
                    <th>Attachment Name</th>
                    <th>Description</th>
                    <th>Created At</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {types.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-surface-500">
                        No attachment types found.
                      </td>
                    </tr>
                  ) : (
                    types.map((type) => (
                      <tr key={type._id}>
                        <td className="font-semibold text-surface-900">
                          {type.attachmentName}
                        </td>
                        <td>{type.description || '-'}</td>
                        <td>{new Date(type.createdAt).toLocaleDateString()}</td>
                        <td className="text-right space-x-2">
                          <button
                            onClick={() => openModal(type)}
                            className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"
                            title="Edit"
                          >
                            <HiOutlinePencilAlt className="text-lg" />
                          </button>
                          <button
                            onClick={() => confirmDelete(type._id)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-surface-100">
              <h3 className="text-xl font-bold text-surface-900">
                {editingType ? 'Edit Attachment Type' : 'Add New Attachment Type'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Attachment Name</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.attachmentName}
                  onChange={(e) => setFormData({ ...formData, attachmentName: e.target.value })}
                  placeholder="e.g., Table"
                />
              </div>
              <div>
                <label className="label">Description (Optional)</label>
                <textarea
                  className="input min-h-[100px] resize-y"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Type details..."
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? <LoadingSpinner size="sm" /> : 'Save Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Attachment Type"
        message="Are you sure you want to delete this attachment type? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default AttachmentTypes;
