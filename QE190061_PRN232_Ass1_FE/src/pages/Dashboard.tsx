import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  CheckCircle2,
  FolderKanban,
  Building2,
  AlertCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { taskApi, projectApi, departmentApi } from '../services/api';
import type { Task, Project, Department } from '../types';
import { StatCard } from '../components/ui/StatCard';
import { TaskStatusBadge, PriorityBadge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import './Dashboard.css';

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksData, projectsData, deptsData] = await Promise.all([
          taskApi.getAll(),
          projectApi.getAll(),
          departmentApi.getAll(),
        ]);
        setTasks(tasksData);
        setProjects(projectsData);
        setDepartments(deptsData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 2).length;
  const inProgressTasks = tasks.filter(t => t.status === 1).length;
  const todoTasks = tasks.filter(t => t.status === 0).length;
  const cancelledTasks = tasks.filter(t => t.status === 3).length;
  
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Overdue / Urgent Tasks
  const now = new Date();
  const upcomingTasks = tasks
    .filter(t => t.status !== 2 && t.status !== 3)
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 5);

  const overdueCount = tasks.filter(t => {
    if (!t.dueDate || t.status === 2 || t.status === 3) return false;
    return new Date(t.dueDate) < now;
  }).length;

  // Priority counts
  const lowPriority = tasks.filter(t => t.priority === 0).length;
  const medPriority = tasks.filter(t => t.priority === 1).length;
  const highPriority = tasks.filter(t => t.priority === 2).length;
  const criticalPriority = tasks.filter(t => t.priority === 3).length;

  // Donut chart calculations
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const doneOffset = circumference - (completedTasks / (totalTasks || 1)) * circumference;
  const inProgressOffset = circumference - (inProgressTasks / (totalTasks || 1)) * circumference;
  const todoOffset = circumference - (todoTasks / (totalTasks || 1)) * circumference;

  return (
    <div className="dashboard-page">
      {/* Welcome & Quick Action Bar */}
      <div className="dashboard-header-banner">
        <div>
          <h2 className="banner-title">Welcome back to TaskTrack</h2>
          <p className="banner-subtitle">
            Here is an overview of your organization's workload, projects, and execution health.
          </p>
        </div>
        <div className="banner-actions">
          <Link to="/tasks" className="btn btn-primary">
            <Plus size={16} />
            <span>Manage Tasks</span>
          </Link>
          <Link to="/projects" className="btn btn-secondary">
            <FolderKanban size={16} />
            <span>View Projects</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Tasks"
          value={loading ? '...' : totalTasks}
          subtitle={`${inProgressTasks} currently in progress`}
          icon={<CheckSquare size={22} />}
          colorScheme="primary"
          trend={{ value: `${completionRate}% Done`, isPositive: completionRate >= 50 }}
        />
        <StatCard
          title="Completed Tasks"
          value={loading ? '...' : completedTasks}
          subtitle="Resolved work items"
          icon={<CheckCircle2 size={22} />}
          colorScheme="emerald"
          trend={{ value: `${completedTasks}/${totalTasks}`, isPositive: true }}
        />
        <StatCard
          title="Active Projects"
          value={loading ? '...' : projects.length}
          subtitle={`Across ${departments.length} departments`}
          icon={<FolderKanban size={22} />}
          colorScheme="purple"
        />
        <StatCard
          title="Attention Needed"
          value={loading ? '...' : overdueCount}
          subtitle="Tasks past due date"
          icon={<AlertCircle size={22} />}
          colorScheme={overdueCount > 0 ? 'rose' : 'cyan'}
          trend={{ value: overdueCount > 0 ? 'Overdue' : 'All Clear', isPositive: overdueCount === 0 }}
        />
      </div>

      {/* Analytics & Breakdown Section */}
      <div className="dashboard-grid-2">
        {/* Status Breakdown Donut Chart */}
        <div className="glass-card chart-card">
          <div className="card-header-flex">
            <div>
              <h3 className="section-title">Task Distribution</h3>
              <p className="section-subtitle">Real-time status breakdown</p>
            </div>
            <div className="badge-pill">{totalTasks} Total</div>
          </div>

          {loading ? (
            <div style={{ padding: '30px', display: 'flex', justifyContent: 'center' }}>
              <Skeleton width="180px" height="180px" borderRadius="50%" />
            </div>
          ) : totalTasks === 0 ? (
            <div className="chart-empty-state">No tasks created yet.</div>
          ) : (
            <div className="donut-chart-container">
              <div className="svg-donut-wrapper">
                <svg viewBox="0 0 160 160" className="donut-svg">
                  {/* Background Track */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    className="donut-track"
                  />
                  {/* To Do (Slate) */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="#64748b"
                    strokeWidth="16"
                    strokeDasharray={circumference}
                    strokeDashoffset={todoOffset}
                    className="donut-segment"
                  />
                  {/* In Progress (Blue) */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="#3b82f6"
                    strokeWidth="16"
                    strokeDasharray={circumference}
                    strokeDashoffset={inProgressOffset}
                    className="donut-segment"
                  />
                  {/* Done (Emerald) */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="#10b981"
                    strokeWidth="16"
                    strokeDasharray={circumference}
                    strokeDashoffset={doneOffset}
                    className="donut-segment"
                  />
                </svg>
                <div className="donut-center-info">
                  <span className="donut-center-value">{completionRate}%</span>
                  <span className="donut-center-label">Completed</span>
                </div>
              </div>

              <div className="donut-legend">
                <div className="legend-row">
                  <span className="legend-dot" style={{ background: '#10b981' }} />
                  <span className="legend-name">Done</span>
                  <span className="legend-count">{completedTasks}</span>
                </div>
                <div className="legend-row">
                  <span className="legend-dot" style={{ background: '#3b82f6' }} />
                  <span className="legend-name">In Progress</span>
                  <span className="legend-count">{inProgressTasks}</span>
                </div>
                <div className="legend-row">
                  <span className="legend-dot" style={{ background: '#64748b' }} />
                  <span className="legend-name">To Do</span>
                  <span className="legend-count">{todoTasks}</span>
                </div>
                {cancelledTasks > 0 && (
                  <div className="legend-row">
                    <span className="legend-dot" style={{ background: '#ef4444' }} />
                    <span className="legend-name">Cancelled</span>
                    <span className="legend-count">{cancelledTasks}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Priority Breakdown Progress */}
        <div className="glass-card chart-card">
          <div className="card-header-flex">
            <div>
              <h3 className="section-title">Priority Breakdown</h3>
              <p className="section-subtitle">Workload distribution by urgency</p>
            </div>
            <TrendingUp size={18} className="header-icon-muted" />
          </div>

          <div className="priority-bars-container">
            <div className="priority-item">
              <div className="priority-info">
                <span className="priority-name">Critical Priority</span>
                <span className="priority-val">{criticalPriority} tasks</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${totalTasks ? (criticalPriority / totalTasks) * 100 : 0}%`,
                    background: '#ef4444',
                  }}
                />
              </div>
            </div>

            <div className="priority-item">
              <div className="priority-info">
                <span className="priority-name">High Priority</span>
                <span className="priority-val">{highPriority} tasks</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${totalTasks ? (highPriority / totalTasks) * 100 : 0}%`,
                    background: '#f97316',
                  }}
                />
              </div>
            </div>

            <div className="priority-item">
              <div className="priority-info">
                <span className="priority-name">Medium Priority</span>
                <span className="priority-val">{medPriority} tasks</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${totalTasks ? (medPriority / totalTasks) * 100 : 0}%`,
                    background: '#f59e0b',
                  }}
                />
              </div>
            </div>

            <div className="priority-item">
              <div className="priority-info">
                <span className="priority-name">Low Priority</span>
                <span className="priority-val">{lowPriority} tasks</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${totalTasks ? (lowPriority / totalTasks) * 100 : 0}%`,
                    background: '#10b981',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Urgent Deadlines & Project Overview */}
      <div className="dashboard-grid-2" style={{ marginTop: '24px' }}>
        {/* Urgent Deadlines Widget */}
        <div className="glass-card recent-card">
          <div className="card-header-flex">
            <div>
              <h3 className="section-title">Upcoming Deadlines</h3>
              <p className="section-subtitle">Prioritized pending tasks</p>
            </div>
            <Link to="/tasks" className="view-all-link">
              <span>View all</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="task-mini-list">
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
                <Skeleton height="36px" />
                <Skeleton height="36px" />
                <Skeleton height="36px" />
              </div>
            ) : upcomingTasks.length === 0 ? (
              <div className="empty-mini-state">
                <CheckCircle2 size={24} color="#10b981" />
                <span>No pending upcoming tasks!</span>
              </div>
            ) : (
              upcomingTasks.map(task => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < now;
                return (
                  <div key={task.taskId} className="task-mini-item">
                    <div className="task-mini-left">
                      <span className="task-mini-title">{task.title}</span>
                      <div className="task-mini-meta">
                        {task.projectName && <span className="meta-project">{task.projectName}</span>}
                        {task.dueDate && (
                          <span className={`meta-date ${isOverdue ? 'date-overdue' : ''}`}>
                            <Calendar size={12} />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="task-mini-right">
                      <PriorityBadge priority={task.priority} priorityName={task.priorityName} />
                      <TaskStatusBadge status={task.status} statusName={task.statusName} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Projects Health Widget */}
        <div className="glass-card recent-card">
          <div className="card-header-flex">
            <div>
              <h3 className="section-title">Projects Snapshot</h3>
              <p className="section-subtitle">Active initiatives & departments</p>
            </div>
            <Link to="/projects" className="view-all-link">
              <span>View all</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="projects-mini-list">
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
                <Skeleton height="36px" />
                <Skeleton height="36px" />
                <Skeleton height="36px" />
              </div>
            ) : projects.length === 0 ? (
              <div className="empty-mini-state">
                <FolderKanban size={24} color="var(--primary)" />
                <span>No active projects found.</span>
              </div>
            ) : (
              projects.slice(0, 5).map(proj => (
                <div key={proj.projectId} className="project-mini-item">
                  <div className="project-mini-info">
                    <span className="project-mini-name">{proj.projectName}</span>
                    <span className="project-mini-dept">
                      <Building2 size={12} />
                      {proj.departmentName}
                    </span>
                  </div>
                  <div className="project-mini-status">
                    <span className="project-date-tag">
                      {new Date(proj.startDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
