import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Building2,
  Edit2,
  Trash2,
  X,
  Layers,
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react';
import { departmentApi } from '../services/api';
import type { Department, CreateDepartmentDto, UpdateDepartmentDto } from '../types';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';
import './DepartmentList.css';

export default function DepartmentList() {
  const toast = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchName, setSearchName] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete
  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<CreateDepartmentDto>({
    departmentName: '',
    departmentDescription: '',
  });

  const fetchDepartments = useCallback(async () => {
    try {
      let data: Department[];
      if (searchName.trim()) {
        data = await departmentApi.search(searchName.trim());
      } else {
        data = await departmentApi.getAll();
      }
      setDepartments(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch departments.');
    } finally {
      setLoading(false);
    }
  }, [searchName, toast]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const openDeptModal = (dept?: Department) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({
        departmentName: dept.departmentName,
        departmentDescription: dept.departmentDescription || '',
      });
    } else {
      setEditingDept(null);
      setFormData({
        departmentName: '',
        departmentDescription: '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.departmentName.trim()) {
      toast.warning('Department name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingDept) {
        await departmentApi.update(editingDept.departmentId, formData as UpdateDepartmentDto);
        toast.success(`Department "${formData.departmentName}" updated.`);
      } else {
        await departmentApi.create(formData);
        toast.success(`Department "${formData.departmentName}" created.`);
      }
      setShowModal(false);
      fetchDepartments();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save department.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deptToDelete) return;
    setIsDeleting(true);
    try {
      await departmentApi.delete(deptToDelete.departmentId);
      toast.success(`Department "${deptToDelete.departmentName}" deleted.`);
      setDeptToDelete(null);
      fetchDepartments();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete department. Please make sure no projects are linked to it.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="departments-page">
      {/* Header */}
      <div className="departments-header-bar">
        <div>
          <h2 className="page-heading">Departments Directory</h2>
          <p className="page-desc">Structure organizational units and strategic departments.</p>
        </div>

        <div className="departments-action-group">
          <div className="view-toggle-container">
            <button
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid Cards View"
            >
              <LayoutGrid size={16} />
              <span>Grid</span>
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <TableIcon size={16} />
              <span>Table</span>
            </button>
          </div>

          <button className="btn btn-primary" onClick={() => openDeptModal()}>
            <Plus size={16} />
            <span>Add Department</span>
          </button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="glass-card filter-toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search departments by name..."
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
          />
          {searchName && (
            <button className="clear-search-btn" onClick={() => setSearchName('')}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="departments-grid">
          <Skeleton height="180px" borderRadius="var(--radius-xl)" />
          <Skeleton height="180px" borderRadius="var(--radius-xl)" />
          <Skeleton height="180px" borderRadius="var(--radius-xl)" />
        </div>
      ) : departments.length === 0 ? (
        <EmptyState
          title="No departments found"
          description="Create your first department to start assigning projects."
          actionText="Add Department"
          onAction={() => openDeptModal()}
        />
      ) : viewMode === 'grid' ? (
        /* Grid Cards */
        <div className="departments-grid">
          {departments.map(dept => {
            const projectCount = dept.projects ? dept.projects.length : 0;
            return (
              <div key={dept.departmentId} className="glass-card dept-card">
                <div className="dept-card-header">
                  <div className="dept-icon-box">
                    <Building2 size={20} />
                  </div>
                  <div className="dept-actions">
                    <button
                      className="btn-icon-sm btn-ghost"
                      onClick={() => openDeptModal(dept)}
                      title="Edit"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      className="btn-icon-sm btn-ghost text-danger"
                      onClick={() => setDeptToDelete(dept)}
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="dept-card-body">
                  <h3 className="dept-card-title">{dept.departmentName}</h3>
                  <p className="dept-card-desc">
                    {dept.departmentDescription || 'No description provided.'}
                  </p>
                </div>

                <div className="dept-card-footer">
                  <div className="dept-projects-count">
                    <Layers size={13} />
                    <span>{projectCount} Projects</span>
                  </div>
                  <Badge
                    label={dept.isActive ? 'Active' : 'Inactive'}
                    variant={dept.isActive ? 'success' : 'neutral'}
                    size="sm"
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Description</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(dept => (
                <tr key={dept.departmentId}>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Building2 size={16} color="var(--primary)" />
                      <span>{dept.departmentName}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                      {dept.departmentDescription || '—'}
                    </span>
                  </td>
                  <td>
                    <Badge
                      label={dept.isActive ? 'Active' : 'Inactive'}
                      variant={dept.isActive ? 'success' : 'neutral'}
                      size="sm"
                    />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        className="btn-icon-sm btn-ghost"
                        onClick={() => openDeptModal(dept)}
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn-icon-sm btn-ghost text-danger"
                        onClick={() => setDeptToDelete(dept)}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Department Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingDept ? 'Edit Department' : 'Add Department'}
        subtitle={editingDept ? `Editing #${editingDept.departmentId}` : 'Create a new organizational unit'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Department Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Engineering, Marketing, Operations"
              value={formData.departmentName}
              onChange={e => setFormData({ ...formData, departmentName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              placeholder="Department responsibilities and purpose..."
              value={formData.departmentDescription}
              onChange={e => setFormData({ ...formData, departmentDescription: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ margin: '24px -24px -24px -24px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingDept ? 'Save Changes' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deptToDelete}
        onClose={() => setDeptToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Department"
        message={`Are you sure you want to delete "${deptToDelete?.departmentName}"? Projects assigned to this department might be affected.`}
        confirmText="Delete Department"
        isLoading={isDeleting}
      />
    </div>
  );
}
