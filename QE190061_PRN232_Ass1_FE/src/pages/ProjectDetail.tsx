import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FolderKanban,
  Building2,
  Calendar,
  ArrowLeft,
  CheckSquare,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { projectApi } from '../services/api';
import type { Project } from '../types';
import { Badge, TaskStatusBadge, PriorityBadge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import './DetailPages.css';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      projectApi
        .getById(Number(id))
        .then(data => setProject(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="detail-page-container">
        <Skeleton height="200px" borderRadius="var(--radius-xl)" />
        <div style={{ marginTop: '24px' }}>
          <Skeleton height="300px" borderRadius="var(--radius-xl)" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="detail-page-container">
        <EmptyState
          title="Project Not Found"
          description="The project you are looking for does not exist or has been removed."
          actionText="Back to Projects"
          onAction={() => window.history.back()}
        />
      </div>
    );
  }

  const tasks = project.tasks || [];
  const completedCount = tasks.filter(t => t.status === 2).length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="detail-page-container animate-fade-in">
      {/* Back navigation */}
      <Link to="/projects" className="back-link">
        <ArrowLeft size={16} />
        <span>Back to Projects</span>
      </Link>

      {/* Project Hero Card */}
      <div className="glass-card detail-hero-card">
        <div className="detail-hero-header">
          <div className="detail-hero-icon proj-hero-icon">
            <FolderKanban size={32} />
          </div>
          <div className="detail-hero-meta">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 className="detail-title">{project.projectName}</h1>
              <Badge
                label={project.statusName || (project.status === 2 ? 'Completed' : 'In Progress')}
                variant={project.status === 2 ? 'success' : 'info'}
              />
            </div>
            <p className="detail-desc">
              {project.description || 'No detailed description provided.'}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        {tasks.length > 0 && (
          <div className="hero-progress-box">
            <div className="hero-progress-labels">
              <span>Overall Completion</span>
              <span>
                {completedCount}/{tasks.length} Tasks ({progressPct}%)
              </span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progressPct}%`, background: 'var(--primary)' }}
              />
            </div>
          </div>
        )}

        <div className="detail-hero-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link
              to={`/departments/${project.departmentId}`}
              className="detail-stat-pill clickable-pill"
            >
              <Building2 size={14} />
              <span>{project.departmentName}</span>
            </Link>
            <div className="detail-stat-pill">
              <Calendar size={14} />
              <span>
                {new Date(project.startDate).toLocaleDateString()}
                {project.endDate ? ` → ${new Date(project.endDate).toLocaleDateString()}` : ' (Ongoing)'}
              </span>
            </div>
          </div>

          <Link to="/projects/manage" className="btn btn-secondary btn-sm">
            Manage Project
          </Link>
        </div>
      </div>

      {/* Linked Tasks Section */}
      <div className="detail-section">
        <div className="section-header-row">
          <h2 className="detail-section-title">Associated Tasks</h2>
          <span className="badge-pill">{tasks.length} Tasks</span>
        </div>

        {tasks.length === 0 ? (
          <EmptyState
            title="No tasks in this project"
            description="Create tasks to organize sprints and assign deliverables."
            actionText="Create Task"
            onAction={() => {}}
          />
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Tags</th>
                  <th>Due Date</th>
                  <th style={{ textAlign: 'right' }}>View</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.taskId}>
                    <td style={{ fontWeight: 600 }}>
                      <Link to={`/tasks/${task.taskId}`} className="table-task-link">
                        <CheckSquare size={16} className="task-row-icon" />
                        <span>{task.title}</span>
                      </Link>
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
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {task.dueDate ? (
                        <span className="table-date-cell">
                          <Clock size={12} />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/tasks/${task.taskId}`} className="btn-icon-sm btn-ghost">
                        <ExternalLink size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
