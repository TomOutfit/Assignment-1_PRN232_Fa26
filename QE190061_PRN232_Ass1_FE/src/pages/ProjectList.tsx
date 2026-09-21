import { useState, useEffect } from 'react';
import { projectApi, departmentApi } from '../services/api';
import type { Project, CreateProjectDto, UpdateProjectDto, Department } from '../types';
import './ProjectList.css';

const STATUS_OPTIONS = [
  { value: 0, label: 'Not Started', color: '#94a3b8', bg: '#f1f5f9' },
  { value: 1, label: 'In Progress', color: '#667eea', bg: 'rgba(102, 126, 234, 0.1)' },
  { value: 2, label: 'Completed', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
  { value: 3, label: 'On Hold', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
];

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filters, setFilters] = useState({ 
    name: '', 
    status: '' as number | '', 
    departmentId: '' as number | '' 
  });
  const [form, setForm] = useState<CreateProjectDto>({
    projectName: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: undefined,
    status: 0,
    departmentId: 0,
  });
  const [error, setError] = useState('');

  const fetchProjects = async () => {
    try {
      const params: { name?: string; status?: number; departmentId?: number } = {};
      if (filters.name) params.name = filters.name;
      if (filters.status !== '') params.status = filters.status;
      if (filters.departmentId !== '') params.departmentId = filters.departmentId;
      
      const data = await projectApi.getAll(Object.keys(params).length > 0 ? params : undefined);
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  useEffect(() => {
    departmentApi.getAll().then(setDepartments);
  }, []);

  const openModal = (proj?: Project) => {
    if (proj) {
      setEditingId(proj.projectId);
      setForm({
        projectName: proj.projectName,
        description: proj.description || '',
        startDate: proj.startDate,
        endDate: proj.endDate || undefined,
        status: proj.status,
        departmentId: proj.departmentId,
      });
    } else {
      setEditingId(null);
      setForm({
        projectName: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: undefined,
        status: 0,
        departmentId: departments[0]?.departmentId || 0,
      });
    }
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectName.trim()) {
      setError('Project name is required');
      return;
    }
    if (!form.departmentId) {
      setError('Please select a department');
      return;
    }
    try {
      if (editingId) {
        await projectApi.update(editingId, form as UpdateProjectDto);
      } else {
        await projectApi.create(form);
      }
      setShowModal(false);
      fetchProjects();
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await projectApi.delete(id);
      fetchProjects();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cannot delete project with linked tasks');
    }
  };

  const getStatusBadge = (status: number) => {
    const opt = STATUS_OPTIONS[status];
    return (
      <span 
        className="project-status-badge"
        style={{ 
          backgroundColor: opt.bg,
          color: opt.color
        }}
      >
        <span className="status-dot" style={{ backgroundColor: opt.color }} />
        {opt.label}
      </span>
    );
  };

  const clearFilters = () => {
    setFilters({ name: '', status: '', departmentId: '' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getProjectColor = (id: number): string => {
    const colors = ['#667eea', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    return colors[id % colors.length];
  };

  if (loading) {
    return (
      <div className="project-loading">
        <div className="loading-spinner"></div>
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="project-list-page">
      <div className="page-header">
        <div className="header-content">
          <h2>Projects</h2>
          <p className="page-subtitle">Manage your team projects</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Project
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-card">
        <div className="filter-row">
          <div className="search-input-wrapper">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search projects..."
              value={filters.name}
              onChange={e => setFilters({ ...filters, name: e.target.value })}
              className="search-input"
            />
          </div>
          <select 
            className="filter-select"
            value={filters.status} 
            onChange={e => setFilters({ ...filters, status: e.target.value ? Number(e.target.value) : '' })}
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <select 
            className="filter-select"
            value={filters.departmentId} 
            onChange={e => setFilters({ ...filters, departmentId: e.target.value ? Number(e.target.value) : '' })}
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>)}
          </select>
          {Object.values(filters).some(v => v !== '') && (
            <button className="btn btn-secondary clear-btn" onClick={clearFilters}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
          </div>
          <h3>No projects found</h3>
          <p>Create a new project to get started</p>
          <button className="btn btn-primary" onClick={() => openModal()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <div key={project.projectId} className="project-card">
              <div 
                className="project-color-bar"
                style={{ backgroundColor: getProjectColor(project.projectId) }}
              />
              
              <div className="project-card-content">
                <div className="project-header">
                  <div className="project-title-row">
                    <div 
                      className="project-avatar"
                      style={{ backgroundColor: getProjectColor(project.projectId) }}
                    >
                      {project.projectName.charAt(0)}
                    </div>
                    <div className="project-info">
                      <h3 className="project-title">{project.projectName}</h3>
                      <div className="project-department">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        </svg>
                        {project.departmentName}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(project.status)}
                </div>
                
                {project.description && (
                  <p className="project-description">{project.description}</p>
                )}
                
                <div className="project-dates">
                  <div className="date-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span>Start: <strong>{formatDate(project.startDate)}</strong></span>
                  </div>
                  {project.endDate && (
                    <div className="date-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span>End: <strong>{formatDate(project.endDate)}</strong></span>
                    </div>
                  )}
                </div>
                
                <div className="project-footer">
                  <div className="avatar-group">
                    {['JD', 'MK', 'AS'].slice(0, 3).map((initials, i) => (
                      <div 
                        key={i} 
                        className="avatar" 
                        style={{ 
                          background: ['#667eea', '#22c55e', '#f59e0b'][i]
                        }}
                      >
                        {initials}
                      </div>
                    ))}
                  </div>
                  <div className="project-actions">
                    <button className="action-btn" onClick={() => openModal(project)} title="Edit">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(project.projectId)} title="Delete">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="3" y1="9" x2="21" y2="9"/>
                  <line x1="9" y1="21" x2="9" y2="9"/>
                </svg>
                <h3>{editingId ? 'Edit Project' : 'Create New Project'}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="modal-close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div className="error-message">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {error}
                  </div>
                )}
                
                <div className="form-group">
                  <label>Project Name</label>
                  <input
                    type="text"
                    value={form.projectName}
                    onChange={e => setForm({ ...form, projectName: e.target.value })}
                    placeholder="Enter project name"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Department</label>
                  <select
                    value={form.departmentId}
                    onChange={e => setForm({ ...form, departmentId: Number(e.target.value) })}
                    className="form-select"
                  >
                    <option value={0}>Select department</option>
                    {departments.map(d => <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>)}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Enter description"
                    rows={3}
                    className="form-textarea"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={e => setForm({ ...form, startDate: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={form.endDate || ''}
                      onChange={e => setForm({ ...form, endDate: e.target.value || undefined })}
                      className="form-input"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: Number(e.target.value) })}
                    className="form-select"
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
