import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Kanban,
  Table as TableIcon,
  Calendar,
  Edit2,
  Trash2,
  Folder,
  Tag as TagIcon,
  X,
  Clock,
  CheckCircle2,
  PlayCircle,
  XCircle,
} from 'lucide-react';
import { taskApi, projectApi, tagApi } from '../services/api';
import type { Task, CreateTaskDto, UpdateTaskDto, Project, Tag } from '../types';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Badge, TaskStatusBadge, PriorityBadge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';
import './TaskList.css';

const STATUS_COLUMNS = [
  { id: 0, title: 'To Do', icon: Clock, color: '#64748b' },
  { id: 1, title: 'In Progress', icon: PlayCircle, color: '#3b82f6' },
  { id: 2, title: 'Completed', icon: CheckCircle2, color: '#10b981' },
  { id: 3, title: 'Cancelled', icon: XCircle, color: '#94a3b8' },
];

const PRIORITY_OPTIONS = [
  { value: 0, label: 'Low', color: '#10b981' },
  { value: 1, label: 'Medium', color: '#f59e0b' },
  { value: 2, label: 'High', color: '#f97316' },
  { value: 3, label: 'Critical', color: '#ef4444' },
];

export default function TaskList() {
  const toast = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'kanban' | 'table'
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Filters
  const [searchTitle, setSearchTitle] = useState('');
  const [filterProject, setFilterProject] = useState<number | ''>('');
  const [filterStatus, setFilterStatus] = useState<number | ''>('');
  const [filterPriority, setFilterPriority] = useState<number | ''>('');
  const [filterTag, setFilterTag] = useState<number | ''>('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirm Modal
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<CreateTaskDto>({
    title: '',
    description: '',
    status: 0,
    priority: 1,
    dueDate: undefined,
    projectId: 0,
    tagIds: [],
  });

  // Fetch Tasks
  const fetchTasks = useCallback(async () => {
    try {
      const params: {
        title?: string;
        status?: number | '';
        priority?: number | '';
        projectId?: number | '';
        tagId?: number | '';
      } = {};

      if (searchTitle.trim()) params.title = searchTitle.trim();
      if (filterStatus !== '') params.status = filterStatus;
      if (filterPriority !== '') params.priority = filterPriority;
      if (filterProject !== '') params.projectId = filterProject;
      if (filterTag !== '') params.tagId = filterTag;

      const data = await taskApi.getAll(Object.keys(params).length > 0 ? params : undefined);
      setTasks(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  }, [searchTitle, filterStatus, filterPriority, filterProject, filterTag, toast]);

  // Fetch Auxiliary Data
  useEffect(() => {
    Promise.all([projectApi.getAll(), tagApi.getAll()])
      .then(([projs, tgs]) => {
        setProjects(projs);
        setTags(tgs);
      })
      .catch(() => {
        toast.error('Failed to load project & tag metadata.');
      });
  }, [toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Open Modal (New or Edit)
  const openTaskModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : undefined,
        projectId: task.projectId,
        tagIds: task.tags?.map(t => t.tagId) || [],
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        status: 0,
        priority: 1,
        dueDate: undefined,
        projectId: projects[0]?.projectId || 0,
        tagIds: [],
      });
    }
    setShowModal(true);
  };

  // Handle Form Submit (Create or Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.warning('Task title is required.');
      return;
    }
    if (!formData.projectId) {
      toast.warning('Please select an associated project.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTask) {
        await taskApi.update(editingTask.taskId, formData as UpdateTaskDto);
        toast.success(`Task "${formData.title}" updated successfully.`);
      } else {
        await taskApi.create(formData);
        toast.success(`Task "${formData.title}" created successfully.`);
      }
      setShowModal(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while saving the task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Quick Status Move in Kanban
  const handleQuickStatusChange = async (task: Task, newStatus: number) => {
    try {
      await taskApi.update(task.taskId, {
        title: task.title,
        description: task.description,
        status: newStatus,
        priority: task.priority,
        dueDate: task.dueDate,
        projectId: task.projectId,
        tagIds: task.tags?.map(t => t.tagId) || [],
      });
      toast.success(`Moved "${task.title}" to ${STATUS_COLUMNS.find(c => c.id === newStatus)?.title}.`);
      fetchTasks();
    } catch (err) {
      console.error(err);
      toast.error('Failed to change task status.');
    }
  };

  // Handle Delete Task
  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await taskApi.delete(taskToDelete.taskId);
      toast.success(`Task "${taskToDelete.title}" deleted.`);
      setTaskToDelete(null);
      fetchTasks();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete task.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle Tag in Form
  const toggleTagSelection = (tagId: number) => {
    setFormData(prev => {
      const exists = prev.tagIds?.includes(tagId);
      const newTagIds = exists
        ? prev.tagIds?.filter(id => id !== tagId)
        : [...(prev.tagIds || []), tagId];
      return { ...prev, tagIds: newTagIds };
    });
  };

  // Reset Filters
  const resetFilters = () => {
    setSearchTitle('');
    setFilterProject('');
    setFilterStatus('');
    setFilterPriority('');
    setFilterTag('');
  };

  const hasActiveFilters =
    searchTitle || filterProject !== '' || filterStatus !== '' || filterPriority !== '' || filterTag !== '';

  return (
    <div className="tasks-page">
      {/* Top Header & Actions */}
      <div className="tasks-header-bar">
        <div>
          <h2 className="page-heading">Tasks Hub</h2>
          <p className="page-desc">Track, organize, and prioritize team initiatives seamlessly.</p>
        </div>

        <div className="tasks-action-group">
          {/* View Switcher */}
          <div className="view-toggle-container">
            <button
              className={`view-toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
              title="Kanban Board View"
            >
              <Kanban size={16} />
              <span>Board</span>
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Data Table View"
            >
              <TableIcon size={16} />
              <span>Table</span>
            </button>
          </div>

          <button className="btn btn-primary" onClick={() => openTaskModal()}>
            <Plus size={16} />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="glass-card filter-toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks by title..."
            value={searchTitle}
            onChange={e => setSearchTitle(e.target.value)}
          />
          {searchTitle && (
            <button className="clear-search-btn" onClick={() => setSearchTitle('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filter-dropdowns">
          {/* Project Filter */}
          <select
            className="filter-select"
            value={filterProject}
            onChange={e => setFilterProject(e.target.value === '' ? '' : Number(e.target.value))}
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p.projectId} value={p.projectId}>
                {p.projectName}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="filter-select"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value === '' ? '' : Number(e.target.value))}
          >
            <option value="">All Statuses</option>
            {STATUS_COLUMNS.map(s => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            className="filter-select"
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value === '' ? '' : Number(e.target.value))}
          >
            <option value="">All Priorities</option>
            {PRIORITY_OPTIONS.map(p => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          {/* Tag Filter */}
          <select
            className="filter-select"
            value={filterTag}
            onChange={e => setFilterTag(e.target.value === '' ? '' : Number(e.target.value))}
          >
            <option value="">All Tags</option>
            {tags.map(t => (
              <option key={t.tagId} value={t.tagId}>
                #{t.tagName}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button className="btn btn-ghost btn-sm reset-filter-btn" onClick={resetFilters}>
              <X size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Kanban or Table */}
      {loading ? (
        <div className="kanban-board-loading">
          <Skeleton height="350px" borderRadius="var(--radius-xl)" />
          <Skeleton height="350px" borderRadius="var(--radius-xl)" />
          <Skeleton height="350px" borderRadius="var(--radius-xl)" />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks match your criteria"
          description="Try modifying your filters or create a new task to get started."
          actionText="Create New Task"
          onAction={() => openTaskModal()}
        />
      ) : viewMode === 'kanban' ? (
        /* ==================== KANBAN BOARD ==================== */
        <div className="kanban-board">
          {STATUS_COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id);
            const ColIcon = col.icon;
            return (
              <div key={col.id} className="kanban-column">
                <div className="kanban-column-header">
                  <div className="col-header-left">
                    <ColIcon size={16} style={{ color: col.color }} />
                    <span className="col-title">{col.title}</span>
                  </div>
                  <span className="col-count-pill">{colTasks.length}</span>
                </div>

                <div className="kanban-cards-stack">
                  {colTasks.length === 0 ? (
                    <div className="kanban-empty-col">No tasks in {col.title}</div>
                  ) : (
                    colTasks.map(task => {
                      const isOverdue =
                        task.dueDate &&
                        new Date(task.dueDate) < new Date() &&
                        task.status !== 2 &&
                        task.status !== 3;

                      return (
                        <div key={task.taskId} className="glass-card kanban-card">
                          <div className="card-top-row">
                            <span className="card-project-tag">
                              <Folder size={12} />
                              {task.projectName || 'General'}
                            </span>
                            <div className="card-actions">
                              <button
                                className="btn-icon-sm btn-ghost"
                                onClick={() => openTaskModal(task)}
                                title="Edit Task"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                className="btn-icon-sm btn-ghost text-danger"
                                onClick={() => setTaskToDelete(task)}
                                title="Delete Task"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <Link to={`/tasks/${task.taskId}`} className="card-task-title-link">
                            <h4 className="card-task-title">{task.title}</h4>
                          </Link>
                          {task.description && (
                            <p className="card-task-desc">{task.description}</p>
                          )}

                          {/* Tags */}
                          {task.tags && task.tags.length > 0 && (
                            <div className="card-tags-list">
                              {task.tags.map(t => (
                                <Badge
                                  key={t.tagId}
                                  label={`#${t.tagName}`}
                                  color={t.color}
                                  size="sm"
                                />
                              ))}
                            </div>
                          )}

                          <div className="card-bottom-row">
                            <PriorityBadge
                              priority={task.priority}
                              priorityName={task.priorityName}
                            />
                            {task.dueDate && (
                              <span
                                className={`card-due-date ${isOverdue ? 'due-overdue' : ''}`}
                              >
                                <Calendar size={12} />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          {/* Quick Move Footer */}
                          <div className="card-quick-move">
                            <span className="move-label">Move to:</span>
                            <div className="move-buttons">
                              {STATUS_COLUMNS.filter(c => c.id !== task.status).map(targetCol => (
                                <button
                                  key={targetCol.id}
                                  className="quick-move-btn"
                                  onClick={() => handleQuickStatusChange(task, targetCol.id)}
                                  title={`Move to ${targetCol.title}`}
                                >
                                  {targetCol.title}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ==================== DATA TABLE VIEW ==================== */
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Task Title</th>
                <th>Project</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Tags</th>
                <th>Due Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => {
                const isOverdue =
                  task.dueDate &&
                  new Date(task.dueDate) < new Date() &&
                  task.status !== 2 &&
                  task.status !== 3;

                return (
                  <tr key={task.taskId}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      <div>{task.title}</div>
                      {task.description && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {task.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="table-project-tag">
                        <Folder size={12} />
                        {task.projectName || '—'}
                      </span>
                    </td>
                    <td>
                      <PriorityBadge
                        priority={task.priority}
                        priorityName={task.priorityName}
                      />
                    </td>
                    <td>
                      <TaskStatusBadge
                        status={task.status}
                        statusName={task.statusName}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {task.tags && task.tags.length > 0 ? (
                          task.tags.map(t => (
                            <Badge
                              key={t.tagId}
                              label={t.tagName}
                              color={t.color}
                              size="sm"
                            />
                          ))
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {task.dueDate ? (
                        <span className={`table-date-cell ${isOverdue ? 'due-overdue' : ''}`}>
                          <Calendar size={12} />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          className="btn-icon-sm btn-ghost"
                          onClick={() => openTaskModal(task)}
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn-icon-sm btn-ghost text-danger"
                          onClick={() => setTaskToDelete(task)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Create / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
        subtitle={editingTask ? `Updating taskId: #${editingTask.taskId}` : 'Fill in task details below'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Implement authentication flow"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              placeholder="Provide context or acceptance criteria..."
              value={formData.description || ''}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Project *</label>
              <select
                className="form-select"
                value={formData.projectId}
                onChange={e => setFormData({ ...formData, projectId: Number(e.target.value) })}
                required
              >
                <option value={0} disabled>
                  Select a Project
                </option>
                {projects.map(p => (
                  <option key={p.projectId} value={p.projectId}>
                    {p.projectName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.dueDate || ''}
                onChange={e =>
                  setFormData({ ...formData, dueDate: e.target.value ? e.target.value : undefined })
                }
              />
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="quick-move-btn"
                  onClick={() => {
                    const d = new Date();
                    setFormData({ ...formData, dueDate: d.toISOString().split('T')[0] });
                  }}
                >
                  Today
                </button>
                <button
                  type="button"
                  className="quick-move-btn"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 1);
                    setFormData({ ...formData, dueDate: d.toISOString().split('T')[0] });
                  }}
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  className="quick-move-btn"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 7);
                    setFormData({ ...formData, dueDate: d.toISOString().split('T')[0] });
                  }}
                >
                  +1 Week
                </button>
                <button
                  type="button"
                  className="quick-move-btn"
                  onClick={() => {
                    const d = new Date();
                    d.setMonth(d.getMonth() + 1);
                    setFormData({ ...formData, dueDate: d.toISOString().split('T')[0] });
                  }}
                >
                  +1 Month
                </button>
              </div>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}
              >
                {STATUS_COLUMNS.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: Number(e.target.value) })}
              >
                {PRIORITY_OPTIONS.map(p => (
                  <option key={p.value} value={p.value}>
                    {p.label} Priority
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tag Selection */}
          <div className="form-group">
            <label className="form-label">Attach Tags</label>
            <div className="tag-selector-chips">
              {tags.map(t => {
                const isSelected = formData.tagIds?.includes(t.tagId);
                return (
                  <button
                    key={t.tagId}
                    type="button"
                    className={`tag-chip ${isSelected ? 'tag-chip-active' : ''}`}
                    onClick={() => toggleTagSelection(t.tagId)}
                    style={{
                      borderColor: isSelected ? t.color || 'var(--primary)' : 'var(--border-base)',
                      backgroundColor: isSelected ? `${t.color || '#6366f1'}22` : 'var(--bg-secondary)',
                      color: isSelected ? t.color || 'var(--primary)' : 'var(--text-secondary)',
                    }}
                  >
                    <TagIcon size={12} />
                    <span>{t.tagName}</span>
                  </button>
                );
              })}
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
              {isSubmitting ? 'Saving...' : editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete task "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete Task"
        isLoading={isDeleting}
      />
    </div>
  );
}
