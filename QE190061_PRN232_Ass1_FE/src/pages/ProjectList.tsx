import { useState, useEffect } from 'react';
import { projectApi, departmentApi } from '../services/api';
import type { Project, CreateProjectDto, UpdateProjectDto, Department } from '../types';

const STATUS_OPTIONS = [
  { value: 0, label: 'Not Started' },
  { value: 1, label: 'In Progress' },
  { value: 2, label: 'Completed' },
  { value: 3, label: 'On Hold' },
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
    const classes = ['badge-not-started', 'badge-in-progress', 'badge-completed', 'badge-on-hold'];
    const labels = ['Not Started', 'In Progress', 'Completed', 'On Hold'];
    return <span className={`badge ${classes[status]}`}>{labels[status]}</span>;
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

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Projects</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Add Project</button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search by name..."
            value={filters.name}
            onChange={e => setFilters({ ...filters, name: e.target.value })}
          />
          <select 
            value={filters.status} 
            onChange={e => setFilters({ ...filters, status: e.target.value ? Number(e.target.value) : '' })}
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <select 
            value={filters.departmentId} 
            onChange={e => setFilters({ ...filters, departmentId: e.target.value ? Number(e.target.value) : '' })}
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>)}
          </select>
          <button className="btn btn-secondary" onClick={clearFilters}>Clear</button>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📁</div>
          <h3>No projects found</h3>
          <p>Create a new project to get started</p>
          <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => openModal()}>
            + Add Project
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {projects.map(project => (
            <div key={project.projectId} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
              {/* Status indicator */}
              <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                height: '4px',
                background: project.status === 2 ? '#00b894' : 
                           project.status === 1 ? '#6c5ce7' : 
                           project.status === 3 ? '#e17055' : '#dfe6e9'
              }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', color: '#2d3436', fontSize: '1.1rem' }}>
                    {project.projectName}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      background: '#6c5ce7',
                      display: 'inline-block'
                    }} />
                    <span style={{ color: '#636e72', fontSize: '0.9rem' }}>{project.departmentName}</span>
                  </div>
                </div>
                {getStatusBadge(project.status)}
              </div>
              
              {project.description && (
                <p style={{ color: '#636e72', fontSize: '0.9rem', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                  {project.description.length > 100 ? project.description.substring(0, 100) + '...' : project.description}
                </p>
              )}
              
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: '#a0a0a0' }}>Start: </span>
                  <span style={{ color: '#2d3436', fontWeight: 500 }}>{formatDate(project.startDate)}</span>
                </div>
                {project.endDate && (
                  <div>
                    <span style={{ color: '#a0a0a0' }}>End: </span>
                    <span style={{ color: '#2d3436', fontWeight: 500 }}>{formatDate(project.endDate)}</span>
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="avatar-group">
                  {['JD', 'MK', 'AS'].slice(0, 3).map((initials, i) => (
                    <div 
                      key={i} 
                      className="avatar" 
                      style={{ 
                        background: ['#6c5ce7', '#00b894', '#e17055'][i],
                        width: '28px',
                        height: '28px',
                        fontSize: '0.7rem'
                      }}
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <div className="actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => openModal(project)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(project.projectId)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? '✏️ Edit Project' : '➕ Add Project'}</h3>
              <button 
                onClick={() => setShowModal(false)} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '1.5rem', 
                  cursor: 'pointer',
                  color: '#636e72'
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div style={{ 
                    background: 'rgba(231, 76, 60, 0.1)', 
                    color: '#e74c3c', 
                    padding: '12px', 
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }}>
                    {error}
                  </div>
                )}
                <div className="form-group">
                  <label>Project Name *</label>
                  <input
                    type="text"
                    value={form.projectName}
                    onChange={e => setForm({ ...form, projectName: e.target.value })}
                    placeholder="Enter project name"
                  />
                </div>
                <div className="form-group">
                  <label>Department *</label>
                  <select
                    value={form.departmentId}
                    onChange={e => setForm({ ...form, departmentId: Number(e.target.value) })}
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
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={e => setForm({ ...form, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={form.endDate || ''}
                      onChange={e => setForm({ ...form, endDate: e.target.value || undefined })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: Number(e.target.value) })}
                  >
                    {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
