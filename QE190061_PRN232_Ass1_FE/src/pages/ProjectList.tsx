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
  const [filters, setFilters] = useState({ name: '', status: '' as number | '', departmentId: '' as number | '' });
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
    const badges = ['badge-secondary', 'badge-info', 'badge-success', 'badge-warning'];
    const labels = ['Not Started', 'In Progress', 'Completed', 'On Hold'];
    return <span className={`badge ${badges[status]}`}>{labels[status]}</span>;
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Projects</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Add Project</button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name..."
          value={filters.name}
          onChange={e => setFilters({ ...filters, name: e.target.value })}
        />
        <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value ? Number(e.target.value) : '' })}>
          <option value="">All Status</option>
          {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <select value={filters.departmentId} onChange={e => setFilters({ ...filters, departmentId: e.target.value ? Number(e.target.value) : '' })}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>)}
        </select>
      </div>

      {projects.length === 0 ? (
        <div className="empty">No projects found</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(proj => (
                <tr key={proj.projectId}>
                  <td>{proj.projectId}</td>
                  <td>{proj.projectName}</td>
                  <td>{proj.departmentName}</td>
                  <td>{proj.startDate}</td>
                  <td>{proj.endDate || '-'}</td>
                  <td>{getStatusBadge(proj.status)}</td>
                  <td className="actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => openModal(proj)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(proj.projectId)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Project' : 'Add Project'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div style={{ color: '#e74c3c', marginBottom: '16px' }}>{error}</div>}
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
