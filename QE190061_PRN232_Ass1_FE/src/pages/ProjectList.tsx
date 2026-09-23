import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Building2,
  Calendar,
  Edit2,
  Trash2,
  X,
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react';
import { projectApi, departmentApi } from '../services/api';
import type { Project, CreateProjectDto, UpdateProjectDto, Department } from '../types';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';
import './ProjectList.css';

const PROJECT_STATUS_OPTIONS = [
  { value: 0, label: 'Planning', color: '#64748b' },
  { value: 1, label: 'In Progress', color: '#3b82f6' },
  { value: 2, label: 'Completed', color: '#10b981' },
  { value: 3, label: 'On Hold', color: '#f59e0b' },
  { value: 4, label: 'Cancelled', color: '#ef4444' },
];

export default function ProjectList() {
  const toast = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'grid' | 'table'
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filters
  const [searchName, setSearchName] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<number | ''>('');
  const [filterStatus, setFilterStatus] = useState<number | ''>('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirm Modal
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<CreateProjectDto>({
    projectName: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: undefined,
    status: 0,
    departmentId: 0,
  });

  const fetchProjects = useCallback(async () => {
    try {
      const params: { name?: string; status?: number | ''; departmentId?: number | '' } = {};
      if (searchName.trim()) params.name = searchName.trim();
      if (filterStatus !== '') params.status = filterStatus;
      if (filterDepartment !== '') params.departmentId = filterDepartment;

      const data = await projectApi.getAll(Object.keys(params).length > 0 ? params : undefined);
      setProjects(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, [searchName, filterStatus, filterDepartment, toast]);

  useEffect(() => {
    departmentApi
      .getAll()
      .then(data => setDepartments(data))
      .catch(() => toast.error('Failed to load departments.'));
  }, [toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const openProjectModal = (proj?: Project) => {
    if (proj) {
      setEditingProject(proj);
      setFormData({
        projectName: proj.projectName,
        description: proj.description || '',
        startDate: proj.startDate ? proj.startDate.split('T')[0] : '',
        endDate: proj.endDate ? proj.endDate.split('T')[0] : undefined,
        status: proj.status,
        departmentId: proj.departmentId,
      });
    } else {
      setEditingProject(null);
      setFormData({
        projectName: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: undefined,
        status: 0,
        departmentId: departments[0]?.departmentId || 0,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectName.trim()) {
      toast.warning('Project name is required.');
      return;
    }
    if (!formData.departmentId) {
      toast.warning('Please select an owning department.');
      return;
    }
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.warning('Start date cannot be after end date.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingProject) {
        await projectApi.update(editingProject.projectId, formData as UpdateProjectDto);
        toast.success(`Project "${formData.projectName}" updated.`);
      } else {
        await projectApi.create(formData);
        toast.success(`Project "${formData.projectName}" created.`);
      }
      setShowModal(false);
      fetchProjects();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      await projectApi.delete(projectToDelete.projectId);
      toast.success(`Project "${projectToDelete.projectName}" deleted.`);
      setProjectToDelete(null);
      fetchProjects();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete project. Please check if tasks exist under this project.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: number, name?: string) => {
    const config = PROJECT_STATUS_OPTIONS.find(s => s.value === status);
    return <Badge label={name || config?.label || `Status ${status}`} color={config?.color} />;
  };

  return (
    <div className="projects-page">
      {/* Header */}
      <div className="projects-header-bar">
        <div>
          <h2 className="page-heading">Projects Directory</h2>
          <p className="page-desc">Oversee initiatives, milestones, and cross-departmental tasks.</p>
        </div>

        <div className="projects-action-group">
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

          <button className="btn btn-primary" onClick={() => openProjectModal()}>
            <Plus size={16} />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card filter-toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search projects by name..."
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
          />
          {searchName && (
            <button className="clear-search-btn" onClick={() => setSearchName('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filter-dropdowns">
          <select
            className="filter-select"
            value={filterDepartment}
            onChange={e => setFilterDepartment(e.target.value === '' ? '' : Number(e.target.value))}
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.departmentId} value={d.departmentId}>
                {d.departmentName}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value === '' ? '' : Number(e.target.value))}
          >
            <option value="">All Statuses</option>
            {PROJECT_STATUS_OPTIONS.map(s => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {(searchName || filterDepartment !== '' || filterStatus !== '') && (
            <button
              className="btn btn-ghost btn-sm reset-filter-btn"
              onClick={() => {
                setSearchName('');
                setFilterDepartment('');
                setFilterStatus('');
              }}
            >
              <X size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main View */}
      {loading ? (
        <div className="projects-grid">
          <Skeleton height="200px" borderRadius="var(--radius-xl)" />
          <Skeleton height="200px" borderRadius="var(--radius-xl)" />
          <Skeleton height="200px" borderRadius="var(--radius-xl)" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="Create your first project or adjust your search filters."
          actionText="Create Project"
          onAction={() => openProjectModal()}
        />
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="projects-grid">
          {projects.map(proj => {
            const taskCount = proj.tasks ? proj.tasks.length : 0;
            const completedTaskCount = proj.tasks ? proj.tasks.filter(t => t.status === 2).length : 0;
            const progress = taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0;

            return (
              <div key={proj.projectId} className="glass-card project-card">
                <div className="proj-card-header">
                  <div className="proj-dept-badge">
                    <Building2 size={12} />
                    <span>{proj.departmentName}</span>
                  </div>
                  <div className="proj-actions">
                    <button
                      className="btn-icon-sm btn-ghost"
                      onClick={() => openProjectModal(proj)}
                      title="Edit"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      className="btn-icon-sm btn-ghost text-danger"
                      onClick={() => setProjectToDelete(proj)}
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="proj-card-body">
                  <h3 className="proj-card-title">{proj.projectName}</h3>
                  {proj.description && <p className="proj-card-desc">{proj.description}</p>}
                </div>

                {/* Progress bar if tasks exist */}
                {taskCount > 0 && (
                  <div className="proj-progress-section">
                    <div className="proj-progress-header">
                      <span>Tasks Progress</span>
                      <span>
                        {completedTaskCount}/{taskCount} ({progress}%)
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${progress}%`, background: 'var(--primary)' }}
                      />
                    </div>
                  </div>
                )}

                <div className="proj-card-footer">
                  <div className="proj-dates">
                    <Calendar size={12} />
                    <span>
                      {new Date(proj.startDate).toLocaleDateString()}
                      {proj.endDate ? ` → ${new Date(proj.endDate).toLocaleDateString()}` : ' (Ongoing)'}
                    </span>
                  </div>
                  {getStatusBadge(proj.status, proj.statusName)}
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
                <th>Project Name</th>
                <th>Department</th>
                <th>Status</th>
                <th>Timeline</th>
                <th>Active</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(proj => (
                <tr key={proj.projectId}>
                  <td style={{ fontWeight: 600 }}>
                    <div>{proj.projectName}</div>
                    {proj.description && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {proj.description}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="table-project-tag">
                      <Building2 size={12} />
                      {proj.departmentName}
                    </span>
                  </td>
                  <td>{getStatusBadge(proj.status, proj.statusName)}</td>
                  <td>
                    <span className="table-date-cell">
                      <Calendar size={12} />
                      {new Date(proj.startDate).toLocaleDateString()}
                      {proj.endDate ? ` → ${new Date(proj.endDate).toLocaleDateString()}` : ''}
                    </span>
                  </td>
                  <td>
                    <Badge
                      label={proj.isActive ? 'Active' : 'Inactive'}
                      variant={proj.isActive ? 'success' : 'neutral'}
                      size="sm"
                    />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        className="btn-icon-sm btn-ghost"
                        onClick={() => openProjectModal(proj)}
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn-icon-sm btn-ghost text-danger"
                        onClick={() => setProjectToDelete(proj)}
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

      {/* Project Create / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProject ? 'Edit Project' : 'New Project'}
        subtitle={editingProject ? `Editing #${editingProject.projectId}` : 'Define project details'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Mobile App Redesign"
              value={formData.projectName}
              onChange={e => setFormData({ ...formData, projectName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              placeholder="Brief summary of project scope..."
              value={formData.description || ''}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                className="form-select"
                value={formData.departmentId}
                onChange={e => setFormData({ ...formData, departmentId: Number(e.target.value) })}
                required
              >
                <option value={0} disabled>
                  Select Department
                </option>
                {departments.map(d => (
                  <option key={d.departmentId} value={d.departmentId}>
                    {d.departmentName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}
              >
                {PROJECT_STATUS_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target End Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.endDate || ''}
                onChange={e =>
                  setFormData({ ...formData, endDate: e.target.value ? e.target.value : undefined })
                }
              />
            </div>
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
              {isSubmitting ? 'Saving...' : editingProject ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        message={`Are you sure you want to delete "${projectToDelete?.projectName}"? All tasks associated with this project may be affected.`}
        confirmText="Delete Project"
        isLoading={isDeleting}
      />
    </div>
  );
}
