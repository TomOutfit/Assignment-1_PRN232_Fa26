import { useState, useEffect } from 'react';
import { taskApi, projectApi, tagApi } from '../services/api';
import type { Task, CreateTaskDto, UpdateTaskDto, Project, Tag } from '../types';
import './TaskList.css';

const STATUS_OPTIONS = [
  { value: 0, label: 'To Do', color: '#64748b', bg: '#f1f5f9' },
  { value: 1, label: 'In Progress', color: '#667eea', bg: 'rgba(102, 126, 234, 0.1)' },
  { value: 2, label: 'Done', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
  { value: 3, label: 'Cancelled', color: '#94a3b8', bg: '#f1f5f9' },
];

const PRIORITY_OPTIONS = [
  { value: 0, label: 'Low', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
  { value: 1, label: 'Medium', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  { value: 2, label: 'High', color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)' },
  { value: 3, label: 'Critical', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
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
    const opt = STATUS_OPTIONS[status];
    return (
      <span 
        className="status-badge"
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

  const getPriorityBadge = (priority: number) => {
    const opt = PRIORITY_OPTIONS[priority];
    return (
      <span 
        className="priority-badge"
        style={{ 
          backgroundColor: opt.bg,
          color: opt.color
        }}
      >
        {opt.label}
      </span>
    );
  };

  const clearFilters = () => {
    setFilters({
      title: '',
      status: '',
      priority: '',
      projectId: '',
      tagId: '',
    });
  };

  const getProjectColor = (id: number): string => {
    const colors = ['#667eea', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    return colors[id % colors.length];
  };

  if (loading) {
    return (
      <div className="task-loading">
        <div className="loading-spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="task-list-page">
      <div className="page-header">
        <div className="header-content">
          <h2>Tasks</h2>
          <p className="page-subtitle">Manage and track all your tasks</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Task
        </button>
      </div>

      {/* Quick Status Filter Tabs */}
      <div className="status-filter-tabs">
        <button
          type="button"
          onClick={() => setFilters({ ...filters, status: '' })}
          className={`status-tab ${filters.status === '' ? 'active' : ''}`}
        >
          <span className="tab-count">{tasks.length}</span>
          <span className="tab-label">All</span>
        </button>
        {STATUS_OPTIONS.map(opt => {
          const count = tasks.filter(t => t.status === opt.value).length;
          const isActive = filters.status === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilters({ ...filters, status: isActive ? '' : opt.value })}
              className={`status-tab ${isActive ? 'active' : ''}`}
              style={isActive ? { 
                '--tab-color': opt.color,
                '--tab-bg': opt.bg
              } as React.CSSProperties : undefined}
            >
              <span className="tab-count">{count}</span>
              <span className="tab-label">{opt.label}</span>
            </button>
          );
        })}
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
              placeholder="Search tasks..."
              value={filters.title}
              onChange={e => setFilters({ ...filters, title: e.target.value })}
              className="search-input"
            />
          </div>
          <select 
            className="filter-select"
            value={filters.status} 
            onChange={e => setFilters({ ...filters, status: e.target.value ? Number(e.target.value) : '' })}
          >
            <option value="">Status</option>
            {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <select 
            className="filter-select"
            value={filters.priority} 
            onChange={e => setFilters({ ...filters, priority: e.target.value ? Number(e.target.value) : '' })}
          >
            <option value="">Priority</option>
            {PRIORITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <select 
            className="filter-select"
            value={filters.projectId} 
            onChange={e => setFilters({ ...filters, projectId: e.target.value ? Number(e.target.value) : '' })}
          >
            <option value="">Project</option>
            {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.projectName}</option>)}
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

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <h3>No tasks found</h3>
          <p>Create a new task to get started</p>
          <button className="btn btn-primary" onClick={() => openModal()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Task
          </button>
        </div>
      ) : (
        <div className="tasks-grid">
          {tasks.map(task => (
            <div key={task.taskId} className="task-card">
              <div className="task-card-header">
                <div 
                  className="task-project-badge"
                  style={{ backgroundColor: `${getProjectColor(task.projectId)}15` }}
                >
                  <span 
                    className="project-dot"
                    style={{ backgroundColor: getProjectColor(task.projectId) }}
                  />
                  {task.projectName}
                </div>
                <div className="task-actions">
                  <button className="action-btn" onClick={() => openModal(task)} title="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button className="action-btn delete" onClick={() => handleDelete(task.taskId)} title="Delete">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              <h3 className="task-title">{task.title}</h3>
              {task.description && (
                <p className="task-description">{task.description}</p>
              )}
              
              <div className="task-badges">
                {getStatusBadge(task.status)}
                {getPriorityBadge(task.priority)}
              </div>
              
              {task.tags && task.tags.length > 0 && (
                <div className="task-tags">
                  {task.tags.map(tag => (
                    <span 
                      key={tag.tagId} 
                      className="task-tag"
                      style={{ 
                        backgroundColor: `${tag.color || '#667eea'}15`,
                        color: tag.color || '#667eea'
                      }}
                    >
                      {tag.tagName}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="task-card-footer">
                <div className="task-due-date">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  }) : 'No due date'}
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
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
                <h3>{editingId ? 'Edit Task' : 'Create New Task'}</h3>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="modal-close"
              >
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
                  <label>Task Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="Enter task title"
                    className="form-input"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Project</label>
                    <select
                      value={form.projectId}
                      onChange={e => setForm({ ...form, projectId: Number(e.target.value) })}
                      className="form-select"
                    >
                      <option value={0}>Select project</option>
                      {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.projectName}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Due Date</label>
                    <input
                      type="date"
                      value={form.dueDate || ''}
                      onChange={e => setForm({ ...form, dueDate: e.target.value || undefined })}
                      className="form-input"
                    />
                  </div>
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
                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={form.priority}
                      onChange={e => setForm({ ...form, priority: Number(e.target.value) })}
                      className="form-select"
                    >
                      {PRIORITY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Tags</label>
                  <div className="tags-container">
                    {tags.map(tag => (
                      <button
                        key={tag.tagId}
                        type="button"
                        onClick={() => toggleTag(tag.tagId)}
                        className={`tag-toggle ${(form.tagIds || []).includes(tag.tagId) ? 'active' : ''}`}
                        style={{
                          '--tag-color': tag.color || '#667eea'
                        } as React.CSSProperties}
                      >
                        {tag.tagName}
                      </button>
                    ))}
                    {tags.length === 0 && (
                      <span className="no-tags">No tags available</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
