import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Folder,
  Calendar,
  Clock,
  ArrowLeft,
  Edit2,
} from 'lucide-react';
import { taskApi } from '../services/api';
import type { Task } from '../types';
import { Badge, TaskStatusBadge, PriorityBadge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import './DetailPages.css';

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      taskApi
        .getById(Number(id))
        .then(data => setTask(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="detail-page-container">
        <Skeleton height="260px" borderRadius="var(--radius-xl)" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="detail-page-container">
        <EmptyState
          title="Task Not Found"
          description="The task you requested could not be located."
          actionText="Back to Tasks"
          onAction={() => window.history.back()}
        />
      </div>
    );
  }

  return (
    <div className="detail-page-container animate-fade-in">
      <Link to="/tasks" className="back-link">
        <ArrowLeft size={16} />
        <span>Back to Tasks</span>
      </Link>

      <div className="glass-card task-detail-card">
        <div className="task-detail-top">
          <div className="task-id-badge">TASK #{task.taskId}</div>
          <div className="task-detail-badges">
            <PriorityBadge priority={task.priority} priorityName={task.priorityName} />
            <TaskStatusBadge status={task.status} statusName={task.statusName} />
          </div>
        </div>

        <h1 className="task-detail-title">{task.title}</h1>

        <div className="task-detail-meta-grid">
          <div className="meta-box">
            <span className="meta-box-label">Associated Project</span>
            <Link to={`/projects/${task.projectId}`} className="meta-box-link">
              <Folder size={14} />
              <span>{task.projectName || 'General Project'}</span>
            </Link>
          </div>

          <div className="meta-box">
            <span className="meta-box-label">Due Date</span>
            <div className="meta-box-value">
              <Calendar size={14} />
              <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}</span>
            </div>
          </div>

          <div className="meta-box">
            <span className="meta-box-label">Created Date</span>
            <div className="meta-box-value">
              <Clock size={14} />
              <span>{new Date(task.createdDate).toLocaleString()}</span>
            </div>
          </div>

          {task.modifiedDate && (
            <div className="meta-box">
              <span className="meta-box-label">Last Modified</span>
              <div className="meta-box-value">
                <Clock size={14} />
                <span>{new Date(task.modifiedDate).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        <div className="task-detail-section">
          <h3 className="section-subheading">Description & Acceptance Criteria</h3>
          <div className="task-description-box">
            {task.description ? (
              <p>{task.description}</p>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>No additional description provided.</span>
            )}
          </div>
        </div>

        <div className="task-detail-section">
          <h3 className="section-subheading">Attached Tags</h3>
          <div className="tags-flex-wrap">
            {task.tags && task.tags.length > 0 ? (
              task.tags.map(t => (
                <Badge
                  key={t.tagId}
                  label={`#${t.tagName}`}
                  color={t.color}
                  size="md"
                />
              ))
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No tags attached to this task.</span>
            )}
          </div>
        </div>

        <div className="task-detail-footer">
          <Link to="/tasks/manage" className="btn btn-primary">
            <Edit2 size={16} />
            <span>Open in Task Manager</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
