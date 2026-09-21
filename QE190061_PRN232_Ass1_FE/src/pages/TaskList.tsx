import { useState, useEffect } from 'react';
import { taskApi, projectApi, tagApi } from '../services/api';
import type { Task, CreateTaskDto, UpdateTaskDto, Project, Tag } from '../types';

const STATUS_OPTIONS = [
  { value: 0, label: 'To Do' },
  { value: 1, label: 'In Progress' },
  { value: 2, label: 'Done' },
  { value: 3, label: 'Cancelled' },
];

const PRIORITY_OPTIONS = [
  { value: 0, label: 'Low' },
  { value: 1, label: 'Medium' },
  { value: 2, label: 'High' },
  { value: 3, label: 'Critical' },
];

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    title: '',
    status: '' as number | '',
    priority: '' as number | '',
    projectId: '' as number | '',
    tagId: '' as number | '',
  });
  const [form, setForm] = useState<CreateTaskDto>({
    title: '',
    description: '',
    status: 0,
    priority: 1,
    dueDate: undefined,
    projectId: 0,
    tagIds: [],
  });
  const [error, setError] = useState('');

  const fetchTasks = async () => {
    try {
      const params: { title?: string; status?: number; priority?: number; projectId?: number; tagId?: number } = {};
      if (filters.title) params.title = filters.title;
      if (filters.status !== '') params.status = filters.status;
      if (filters.priority !== '') params.priority = filters.priority;
      if (filters.projectId !== '') params.projectId = filters.projectId;
      if (filters.tagId !== '') params.tagId = filters.tagId;
      
      const data = await taskApi.getAll(Object.keys(params).length > 0 ? params : undefined);
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  useEffect(() => {
    Promise.all([
      projectApi.getAll(),
      tagApi.getAll(),
    ]).then(([projectsData, tagsData]) => {
      setProjects(projectsData);
      setTags(tagsData);
    });
  }, []);

  const openModal = (task?: Task) => {
    if (task) {
      setEditingId(task.taskId);
      setForm({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate || undefined,
        projectId: task.projectId,
        tagIds: task.tags?.map(t => t.tagId) || [],
      });
    } else {
      setEditingId(null);
      setForm({
        title: '',
        description: '',
        status: 0,
        priority: 1,
        dueDate: undefined,
        projectId: projects[0]?.projectId || 0,
        tagIds: [],
      });
    }
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Task title is required');
      return;
    }
    if (!form.projectId) {
      setError('Please select a project');
      return;
    }
    try {
      if (editingId) {
        await taskApi.update(editingId, form as UpdateTaskDto);
      } else {
        await taskApi.create(form);
      }
      setShowModal(false);
      fetchTasks();
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskApi.delete(id);
      fetchTasks();
    } catch (err: any) {
      alert(err.response?.data?.message || 'An error occurred');
    }
  };

  const toggleTag = (tagId: number) => {
    const current = form.tagIds || [];
    const newTags = current.includes(tagId)
      ? current.filter(id => id !== tagId)
      : [...current, tagId];
    setForm({ ...form, tagIds: newTags });
  };

  const getStatusBadge = (status: number) => {
    const badges = ['badge-secondary', 'badge-info', 'badge-success', 'badge-danger'];
    return <span className={`badge ${badges[status]}`}>{STATUS_OPTIONS[status].label}</span>;
  };

  const getPriorityBadge = (priority: number) => {
    const badges = ['badge-secondary', 'badge-warning', 'badge-danger', 'badge-danger'];
    return <span className={`badge ${badges[priority]}`}>{PRIORITY_OPTIONS[priority].label}</span>;
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Tasks</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Add Task</button>
      </div>

      <div className="search-bar" style={{ flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by title..."
          value={filters.title}
          onChange={e => setFilters({ ...filters, title: e.target.value })}
          style={{ flexBasis: '200px' }}
        />
        <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value ? Number(e.target.value) : '' })}>
          <option value="">All Status</option>
          {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <select value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value ? Number(e.target.value) : '' })}>
          <option value="">All Priority</option>
          {PRIORITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <select value={filters.projectId} onChange={e => setFilters({ ...filters, projectId: e.target.value ? Number(e.target.value) : '' })}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.projectName}</option>)}
        </select>
      </div>

      {tasks.length === 0 ? (
        <div className="empty">No tasks found</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Project</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Tags</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.taskId}>
                  <td>{task.taskId}</td>
                  <td>{task.title}</td>
                  <td>{task.projectName}</td>
                  <td>{getPriorityBadge(task.priority)}</td>
                  <td>{getStatusBadge(task.status)}</td>
                  <td>{task.dueDate || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {task.tags?.map(tag => (
                        <span key={tag.tagId} className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                          {tag.tagName}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => openModal(task)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task.taskId)}>Delete</button>
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
              <h3>{editingId ? 'Edit Task' : 'Add Task'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div style={{ color: '#e74c3c', marginBottom: '16px' }}>{error}</div>}
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="Enter task title"
                  />
                </div>
                <div className="form-group">
                  <label>Project *</label>
                  <select
                    value={form.projectId}
                    onChange={e => setForm({ ...form, projectId: Number(e.target.value) })}
                  >
                    <option value={0}>Select project</option>
                    {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.projectName}</option>)}
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
                    <label>Status</label>
                    <select
                      value={form.status}
                      onChange={e => setForm({ ...form, status: Number(e.target.value) })}
                    >
                      {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={form.priority}
                      onChange={e => setForm({ ...form, priority: Number(e.target.value) })}
                    >
                      {PRIORITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate || ''}
                    onChange={e => setForm({ ...form, dueDate: e.target.value || undefined })}
                  />
                </div>
                <div className="form-group">
                  <label>Tags</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                    {tags.map(tag => (
                      <button
                        key={tag.tagId}
                        type="button"
                        onClick={() => toggleTag(tag.tagId)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          border: `2px solid ${(form.tagIds || []).includes(tag.tagId) ? '#3498db' : '#dde1e6'}`,
                          background: (form.tagIds || []).includes(tag.tagId) ? '#3498db' : 'white',
                          color: (form.tagIds || []).includes(tag.tagId) ? 'white' : '#2c3e50',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                        }}
                      >
                        {tag.tagName}
                      </button>
                    ))}
                  </div>
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
