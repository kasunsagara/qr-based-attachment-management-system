import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { HiOutlineSearch, HiOutlinePlus, HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';

const Modules = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [formData, setFormData] = useState({ moduleNumber: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });

  useEffect(() => {
    fetchModules();
  }, [page, searchTerm]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/modules?page=${page}&limit=10&search=${searchTerm}`);
      setModules(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error('Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchModules();
  };

  const openModal = (module = null) => {
    if (module) {
      setEditingModule(module);
      setFormData({ moduleNumber: module.moduleNumber, description: module.description || '' });
    } else {
      setEditingModule(null);
      setFormData({ moduleNumber: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingModule(null);
    setFormData({ moduleNumber: '', description: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingModule) {
        await api.put(`/modules/${editingModule._id}`, formData);
        toast.success('Module updated successfully');
      } else {
        await api.post('/modules', formData);
        toast.success('Module created successfully');
      }
      closeModal();
      fetchModules();
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
      await api.delete(`/modules/${deleteDialog.id}`);
      toast.success('Module deleted successfully');
      fetchModules();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete module');
    } finally {
      setDeleteDialog({ isOpen: false, id: null });
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Modules Management</h1>
          <p className="page-subtitle">Manage factory production modules</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <HiOutlinePlus className="text-lg" />
          Add Module
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
              placeholder="Search modules..."
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
                    <th>Module Number</th>
                    <th>Description</th>
                    <th>Created At</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {modules.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-surface-500">
                        No modules found.
                      </td>
                    </tr>
                  ) : (
                    modules.map((module) => (
                      <tr key={module._id}>
                        <td className="font-semibold text-surface-900">
                          {module.moduleNumber}
                        </td>
                        <td>{module.description || '-'}</td>
                        <td>{new Date(module.createdAt).toLocaleDateString()}</td>
                        <td className="text-right space-x-2">
                          <button
                            onClick={() => openModal(module)}
                            className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"
                            title="Edit"
                          >
                            <HiOutlinePencilAlt className="text-lg" />
                          </button>
                          <button
                            onClick={() => confirmDelete(module._id)}
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
                {editingModule ? 'Edit Module' : 'Add New Module'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Module Number</label>
                <input
                  type="number"
                  required
                  className="input"
                  value={formData.moduleNumber}
                  onChange={(e) => setFormData({ ...formData, moduleNumber: e.target.value })}
                  placeholder="e.g., 5"
                />
              </div>
              <div>
                <label className="label">Description (Optional)</label>
                <textarea
                  className="input min-h-[100px] resize-y"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Module details..."
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? <LoadingSpinner size="sm" /> : 'Save Module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Module"
        message="Are you sure you want to delete this module? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default Modules;
