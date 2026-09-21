import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { departmentApi, projectApi, taskApi, tagApi } from '../services/api';
import type { Project, Task } from '../types';
import './Dashboard.css';

interface Stats {
  departments: number;
  projects: number;
  tasks: number;
  tags: number;
}

interface Activity {
  id: number;
  type: 'add' | 'update' | 'delete';
  text: string;
  time: string;
  color: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ departments: 0, projects: 0, tasks: 0, tags: 0 });
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');

  useEffect(() => {
    Promise.all([
      departmentApi.getAll(),
      projectApi.getAll(),
      taskApi.getAll(),
      tagApi.getAll(),
    ]).then(([departments, projectsData, tasksData, tags]) => {
      setStats({
        departments: departments.length,
        projects: projectsData.length,
        tasks: tasksData.length,
        tags: tags.length,
      });
      setProjects(projectsData.slice(0, 6));
      setTasks(tasksData);
      setLoading(false);
    });
  }, []);

  // Calculate task statistics
  const completedTasks = tasks.filter(t => t.status === 2).length;
  const inProgressTasks = tasks.filter(t => t.status === 1).length;
  const pendingTasks = tasks.filter(t => t.status === 0).length;
  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    return new Date(t.dueDate) < new Date() && t.status !== 2;
  }).length;

  // Sample activities - Neon colors
  const activities: Activity[] = [
    { id: 1, type: 'update', text: 'Task "API Integration" marked as Done', time: '2 min ago', color: '#30d158' },
    { id: 2, type: 'add', text: 'New task created: Testing Phase', time: '15 min ago', color: '#00f5d4' },
    { id: 3, type: 'update', text: 'Project "Website Redesign" updated', time: '1 hour ago', color: '#ff9500' },
    { id: 4, type: 'add', text: 'New project added: Mobile App', time: '2 hours ago', color: '#bf5af2' },
    { id: 5, type: 'delete', text: 'Task "Legacy Code" removed', time: '3 hours ago', color: '#ff453a' },
  ];

  const getStatusLabel = (status: number): string => {
    const labels = ['To Do', 'In Progress', 'Done', 'Cancelled'];
    return labels[status] || 'Unknown';
  };

  const getStatusBadgeClass = (status: number): string => {
    const classes = ['badge-to-do', 'badge-in-progress', 'badge-done', 'badge-cancelled'];
    return classes[status] || 'badge-secondary';
  };

  const getPriorityLabel = (priority: number): string => {
    const labels = ['Low', 'Medium', 'High', 'Critical'];
    return labels[priority] || 'Unknown';
  };

  const getPriorityBadgeClass = (priority: number): string => {
    const classes = ['badge-low', 'badge-medium', 'badge-high', 'badge-critical'];
    return classes[priority] || 'badge-secondary';
  };

  const getProjectProgress = (projectId: number): number => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter(t => t.status === 2).length;
    return Math.round((completed / projectTasks.length) * 100);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Stats Cards - Neon Theme */}
      <div className="stats-grid">
        <div className="stat-card-new gradient-cyan">
          <div className="stat-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className="stat-card-content">
            <span className="stat-card-value">{completedTasks}</span>
            <span className="stat-card-label">Completed Tasks</span>
          </div>
          <div className="stat-card-trend up">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
            <span>+12%</span>
          </div>
        </div>

        <div className="stat-card-new gradient-blue">
          <div className="stat-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="stat-card-content">
            <span className="stat-card-value">{inProgressTasks}</span>
            <span className="stat-card-label">In Progress</span>
          </div>
          <div className="stat-card-trend up">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
            <span>+8%</span>
          </div>
        </div>

        <div className="stat-card-new gradient-orange">
          <div className="stat-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div className="stat-card-content">
            <span className="stat-card-value">{pendingTasks}</span>
            <span className="stat-card-label">Pending Tasks</span>
          </div>
          <div className="stat-card-trend down">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
              <polyline points="17 18 23 18 23 12"/>
            </svg>
            <span>-5%</span>
          </div>
        </div>

        <div className="stat-card-new gradient-pink">
          <div className="stat-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div className="stat-card-content">
            <span className="stat-card-value">{overdueTasks}</span>
            <span className="stat-card-label">Overdue Tasks</span>
          </div>
          <div className="stat-card-trend down">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
              <polyline points="17 18 23 18 23 12"/>
            </svg>
            <span>-3%</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="dashboard-main">
          {/* Task Overview Chart */}
          <div className="card chart-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Task Overview</h3>
                <p className="card-subtitle">Track your productivity over time</p>
              </div>
              <div className="chart-tabs">
                {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((period) => (
                  <button
                    key={period}
                    className={`chart-tab ${chartPeriod === period ? 'active' : ''}`}
                    onClick={() => setChartPeriod(period)}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="chart-container">
              <div className="chart-svg">
                <LineChart period={chartPeriod} />
              </div>
              <div className="chart-stats">
                <div className="chart-stat">
                  <span className="chart-stat-value">${(completedTasks * 125).toLocaleString()}</span>
                  <span className="chart-stat-label">Total Productivity</span>
                  <span className="chart-stat-trend positive">+24%</span>
                </div>
                <div className="chart-stat">
                  <span className="chart-stat-value">{completedTasks + inProgressTasks}</span>
                  <span className="chart-stat-label">Active Tasks</span>
                  <span className="chart-stat-trend positive">+15%</span>
                </div>
                <div className="chart-stat">
                  <span className="chart-stat-value">{stats.projects}</span>
                  <span className="chart-stat-label">Projects</span>
                  <span className="chart-stat-trend positive">+8%</span>
                </div>
                <div className="chart-stat">
                  <span className="chart-stat-value">{stats.departments}</span>
                  <span className="chart-stat-label">Departments</span>
                  <span className="chart-stat-trend neutral">0%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Task Distribution */}
          <div className="card distribution-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Task Distribution</h3>
                <p className="card-subtitle">See how tasks are distributed</p>
              </div>
            </div>
            <div className="distribution-content">
              <div className="donut-container">
                <DonutChart 
                  completed={completedTasks}
                  inProgress={inProgressTasks}
                  pending={pendingTasks}
                />
              </div>
              <div className="distribution-legend">
                <div className="legend-item" style={{ '--legend-color': '#30d158', '--legend-glow': 'rgba(48, 209, 88, 0.3)' } as React.CSSProperties}>
                  <div className="legend-dot" style={{ background: '#30d158' }}></div>
                  <div className="legend-info">
                    <span className="legend-label">Completed</span>
                    <span className="legend-value">{completedTasks} tasks</span>
                  </div>
                  <span className="legend-percent">{tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%</span>
                </div>
                <div className="legend-item" style={{ '--legend-color': '#00f5d4', '--legend-glow': 'rgba(0, 245, 212, 0.3)' } as React.CSSProperties}>
                  <div className="legend-dot" style={{ background: '#00f5d4' }}></div>
                  <div className="legend-info">
                    <span className="legend-label">In Progress</span>
                    <span className="legend-value">{inProgressTasks} tasks</span>
                  </div>
                  <span className="legend-percent">{tasks.length > 0 ? Math.round((inProgressTasks / tasks.length) * 100) : 0}%</span>
                </div>
                <div className="legend-item" style={{ '--legend-color': '#ff9500', '--legend-glow': 'rgba(255, 149, 0, 0.3)' } as React.CSSProperties}>
                  <div className="legend-dot" style={{ background: '#ff9500' }}></div>
                  <div className="legend-info">
                    <span className="legend-label">Pending</span>
                    <span className="legend-value">{pendingTasks} tasks</span>
                  </div>
                  <span className="legend-percent">{tasks.length > 0 ? Math.round((pendingTasks / tasks.length) * 100) : 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-sidebar">
          {/* Recent Activities */}
          <div className="card activities-card">
            <div className="card-header">
              <h3 className="card-title">Recent Activities</h3>
              <button className="view-all-btn">View All</button>
            </div>
            <div className="activities-list">
              {activities.map((activity) => (
                <div key={activity.id} className="activity-item-new">
                  <div 
                    className="activity-dot"
                    style={{ background: activity.color, '--activity-color': activity.color } as React.CSSProperties}
                  ></div>
                  <div className="activity-content">
                    <p className="activity-text">{activity.text}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card quick-stats-card">
            <div className="card-header">
              <h3 className="card-title">Quick Stats</h3>
            </div>
            <div className="quick-stats-list">
              <div className="quick-stat-item" style={{ '--stat-color': '#00f5d4', '--stat-glow': 'rgba(0, 245, 212, 0.3)' } as React.CSSProperties}>
                <div className="quick-stat-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00f5d4" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <div className="quick-stat-info">
                  <span className="quick-stat-label">Total Tasks</span>
                  <span className="quick-stat-value">{stats.tasks}</span>
                </div>
              </div>
              <div className="quick-stat-item" style={{ '--stat-color': '#3a86ff', '--stat-glow': 'rgba(58, 134, 255, 0.3)' } as React.CSSProperties}>
                <div className="quick-stat-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3a86ff" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="3" y1="9" x2="21" y2="9"/>
                    <line x1="9" y1="21" x2="9" y2="9"/>
                  </svg>
                </div>
                <div className="quick-stat-info">
                  <span className="quick-stat-label">Active Projects</span>
                  <span className="quick-stat-value">{stats.projects}</span>
                </div>
              </div>
              <div className="quick-stat-item" style={{ '--stat-color': '#30d158', '--stat-glow': 'rgba(48, 209, 88, 0.3)' } as React.CSSProperties}>
                <div className="quick-stat-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#30d158" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div className="quick-stat-info">
                  <span className="quick-stat-label">Departments</span>
                  <span className="quick-stat-value">{stats.departments}</span>
                </div>
              </div>
              <div className="quick-stat-item" style={{ '--stat-color': '#ff9500', '--stat-glow': 'rgba(255, 149, 0, 0.3)' } as React.CSSProperties}>
                <div className="quick-stat-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff9500" strokeWidth="2">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                    <line x1="7" y1="7" x2="7.01" y2="7"/>
                  </svg>
                </div>
                <div className="quick-stat-info">
                  <span className="quick-stat-label">Tags</span>
                  <span className="quick-stat-value">{stats.tags}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="card projects-section">
        <div className="card-header">
          <div>
            <h3 className="card-title">Active Projects</h3>
            <p className="card-subtitle">Track your project progress</p>
          </div>
          <Link to="/projects" className="btn btn-secondary btn-sm">View All</Link>
        </div>
        <div className="projects-grid">
          {projects.map((project) => (
            <div 
              key={project.projectId} 
              className="project-card"
              style={{ 
                '--project-color': getProjectColor(project.projectId),
                '--project-glow': getProjectColor(project.projectId) + '40'
              } as React.CSSProperties}
            >
              <div className="project-header">
                <div 
                  className="project-avatar"
                  style={{ background: getProjectColor(project.projectId) }}
                >
                  {project.projectName.charAt(0)}
                </div>
                <span className={`badge ${getStatusBadgeClass(project.status)}`}>
                  {getStatusLabel(project.status)}
                </span>
              </div>
              <h4 className="project-name">{project.projectName}</h4>
              <p className="project-department">{project.departmentName}</p>
              <div className="project-progress">
                <div className="progress-header">
                  <span>Progress</span>
                  <span className="progress-value">{getProjectProgress(project.projectId)}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill primary" 
                    style={{ width: `${getProjectProgress(project.projectId)}%` }}
                  />
                </div>
              </div>
              <div className="project-footer">
                <div className="project-dates">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>{project.startDate}</span>
                </div>
                <div className="avatar-group">
                  {['JD', 'MK', 'AS'].slice(0, (project.projectId % 3) + 1).map((initials, i) => (
                    <div 
                      key={i} 
                      className="avatar" 
                      style={{ 
                        background: ['#00f5d4', '#30d158', '#ff9500'][i],
                        marginLeft: i > 0 ? '-10px' : '0'
                      }}
                    >
                      {initials}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Tasks Table */}
      <div className="card tasks-section">
        <div className="card-header">
          <div>
            <h3 className="card-title">Recent Tasks</h3>
            <p className="card-subtitle">Latest tasks from your projects</p>
          </div>
          <Link to="/tasks" className="btn btn-primary btn-sm">+ Add Task</Link>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {tasks.slice(0, 5).map((task) => (
                <tr key={task.taskId}>
                  <td>
                    <div className="task-info">
                      <span className="task-title">{task.title}</span>
                      {task.description && (
                        <span className="task-desc">{task.description.slice(0, 50)}...</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="project-badge">
                      <span 
                        className="project-dot"
                        style={{ background: getProjectColor(task.projectId) }}
                      />
                      {task.projectName}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(task.status)}`}>
                      {getStatusLabel(task.status)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
                      {getPriorityLabel(task.priority)}
                    </span>
                  </td>
                  <td>
                    <span className={`due-date ${isOverdue(task.dueDate) ? 'overdue' : ''}`}>
                      {task.dueDate || 'No due date'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Line Chart Component - Neon Style
function LineChart({ period }: { period: string }) {
  const data = {
    daily: [30, 45, 35, 50, 40, 60, 55],
    weekly: [120, 150, 130, 180, 160, 200, 190, 220, 210, 250],
    monthly: [400, 450, 420, 500, 480, 550, 520, 600, 580, 650],
    yearly: [5000, 5500, 5200, 6000, 5800, 6500, 6200, 7000],
  };

  const labels = {
    daily: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    weekly: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10'],
    monthly: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    yearly: ['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'],
  };

  const currentData = data[period as keyof typeof data] || data.weekly;
  const currentLabels = labels[period as keyof typeof labels] || labels.weekly;
  const maxValue = Math.max(...currentData);
  const minValue = Math.min(...currentData);
  const range = maxValue - minValue;

  const width = 600;
  const height = 200;
  const padding = 40;

  const points = currentData.map((value, index) => {
    const x = padding + (index / (currentData.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - minValue) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="line-chart-svg">
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00f5d4" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#00f5d4" stopOpacity="0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Grid lines */}
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={i}
          x1={padding}
          y1={padding + (i * (height - padding * 2)) / 4}
          x2={width - padding}
          y2={padding + (i * (height - padding * 2)) / 4}
          stroke="#27272a"
          strokeDasharray="4,4"
        />
      ))}
      
      {/* Area */}
      <polygon points={areaPoints} fill="url(#lineGradient)" />
      
      {/* Line */}
      <polyline 
        points={points} 
        fill="none" 
        stroke="#00f5d4" 
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
      />
      
      {/* Points */}
      {currentData.map((value, index) => {
        const x = padding + (index / (currentData.length - 1)) * (width - padding * 2);
        const y = height - padding - ((value - minValue) / range) * (height - padding * 2);
        return (
          <g key={index}>
            <circle cx={x} cy={y} r="4" fill="#00f5d4" filter="url(#glow)" />
            <circle cx={x} cy={y} r="8" fill="rgba(0, 245, 212, 0.2)" className="chart-point" />
          </g>
        );
      })}
      
      {/* Labels */}
      {currentLabels.map((label, index) => {
        const x = padding + (index / (currentLabels.length - 1)) * (width - padding * 2);
        return (
          <text
            key={index}
            x={x}
            y={height - 10}
            textAnchor="middle"
            className="chart-label"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

// Donut Chart Component - Neon Style
function DonutChart({ completed, inProgress, pending }: { completed: number; inProgress: number; pending: number }) {
  const total = completed + inProgress + pending || 1;
  const radius = 70;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;
  
  const completedPercent = (completed / total) * 100;
  const inProgressPercent = (inProgress / total) * 100;
  const pendingPercent = (pending / total) * 100;

  const completedOffset = circumference - (completedPercent / 100) * circumference;
  const inProgressOffset = circumference - (inProgressPercent / 100) * circumference;
  const pendingOffset = circumference - (pendingPercent / 100) * circumference;

  return (
    <svg viewBox="0 0 200 200" className="donut-chart-svg">
      <defs>
        <filter id="donutGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Background circle */}
      <circle
        cx="100"
        cy="100"
        r={radius}
        fill="none"
        stroke="#27272a"
        strokeWidth={strokeWidth}
      />
      
      {/* Completed segment */}
      <circle
        cx="100"
        cy="100"
        r={radius}
        fill="none"
        stroke="#30d158"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={completedOffset}
        strokeLinecap="round"
        transform="rotate(-90 100 100)"
        filter="url(#donutGlow)"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      
      {/* In Progress segment */}
      <circle
        cx="100"
        cy="100"
        r={radius}
        fill="none"
        stroke="#00f5d4"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={inProgressOffset}
        strokeLinecap="round"
        transform={`rotate(${-90 + completedPercent * 3.6} 100 100)`}
        filter="url(#donutGlow)"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      
      {/* Pending segment */}
      <circle
        cx="100"
        cy="100"
        r={radius}
        fill="none"
        stroke="#ff9500"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={pendingOffset}
        strokeLinecap="round"
        transform={`rotate(${-90 + (completedPercent + inProgressPercent) * 3.6} 100 100)`}
        filter="url(#donutGlow)"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      
      {/* Center text */}
      <text x="100" y="95" textAnchor="middle" className="donut-total">
        {completed + inProgress + pending}
      </text>
      <text x="100" y="115" textAnchor="middle" className="donut-label">
        Total
      </text>
    </svg>
  );
}

function getProjectColor(id: number): string {
  const colors = ['#00f5d4', '#30d158', '#ff9500', '#ff006e', '#bf5af2', '#3a86ff'];
  return colors[id % colors.length];
}

function isOverdue(dueDate?: string): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}
