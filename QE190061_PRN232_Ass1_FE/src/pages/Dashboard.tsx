import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { departmentApi, projectApi, taskApi, tagApi } from '../services/api';
import type { Project, Task } from '../types';

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
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ departments: 0, projects: 0, tasks: 0, tags: 0 });
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallProgress, setOverallProgress] = useState(75);

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
      setProjects(projectsData.slice(0, 5)); // Show first 5 projects
      setTasks(tasksData);
      
      // Calculate overall progress (completed tasks / total tasks)
      const completedTasks = tasksData.filter(t => t.status === 2).length;
      const progress = tasksData.length > 0 ? Math.round((completedTasks / tasksData.length) * 100) : 0;
      setOverallProgress(progress);
      
      setLoading(false);
    });
  }, []);

  // Generate sample activities from real data
  const activities: Activity[] = [
    { id: 1, type: 'add', text: 'New project added: Mobile App Development', time: '2 hours ago' },
    { id: 2, type: 'update', text: 'Task "API Integration" marked as Done', time: '4 hours ago' },
    { id: 3, type: 'update', text: 'Project "Website Redesign" is 75% complete', time: '5 hours ago' },
    { id: 4, type: 'add', text: 'New task created: Testing Phase', time: '6 hours ago' },
    { id: 5, type: 'update', text: 'Department "Engineering" updated', time: '1 day ago' },
  ];

  const getStatusLabel = (status: number): string => {
    const labels = ['Not Started', 'In Progress', 'Completed', 'On Hold'];
    return labels[status] || 'Unknown';
  };

  const getStatusBadgeClass = (status: number): string => {
    const classes = ['badge-not-started', 'badge-in-progress', 'badge-completed', 'badge-on-hold'];
    return classes[status] || 'badge-secondary';
  };

  const getProjectProgress = (projectId: number): number => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter(t => t.status === 2).length;
    return Math.round((completed / projectTasks.length) * 100);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <Link to="/tasks" className="btn btn-primary">+ New Task</Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-4" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon department">🏢</div>
          <div className="stat-info">
            <div className="stat-value">{stats.departments}</div>
            <div className="stat-label">Departments</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon project">📁</div>
          <div className="stat-info">
            <div className="stat-value">{stats.projects}</div>
            <div className="stat-label">Projects</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon task">✅</div>
          <div className="stat-info">
            <div className="stat-value">{stats.tasks}</div>
            <div className="stat-label">Tasks</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon tag">🏷️</div>
          <div className="stat-info">
            <div className="stat-value">{stats.tags}</div>
            <div className="stat-label">Tags</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px' }}>
        {/* Left Column */}
        <div>
          {/* Project Schedules */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">📅 Project Schedules</div>
                <div className="card-subtitle">Track your project timelines</div>
              </div>
              <Link to="/projects" className="btn btn-secondary btn-sm">View All</Link>
            </div>
            
            {/* Timeline Header */}
            <div style={{ 
              display: 'flex', 
              borderBottom: '2px solid #f1f3f4', 
              padding: '12px 0',
              marginBottom: '16px'
            }}>
              <div style={{ flex: 2, fontWeight: 600, color: '#636e72', fontSize: '0.85rem' }}>PROJECT</div>
              <div style={{ flex: 1, fontWeight: 600, color: '#636e72', fontSize: '0.85rem' }}>TEAM</div>
              <div style={{ flex: 1, fontWeight: 600, color: '#636e72', fontSize: '0.85rem' }}>STATUS</div>
              <div style={{ flex: 1, fontWeight: 600, color: '#636e72', fontSize: '0.85rem' }}>PROGRESS</div>
            </div>

            {/* Project Rows */}
            {projects.map((project, index) => (
              <div 
                key={project.projectId} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  padding: '16px 0',
                  borderBottom: index < projects.length - 1 ? '1px solid #f1f3f4' : 'none'
                }}
              >
                <div style={{ flex: 2 }}>
                  <div style={{ fontWeight: 600, color: '#2d3436', marginBottom: '4px' }}>
                    {project.projectName}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#a0a0a0' }}>
                    {project.departmentName}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="avatar-group">
                    {['JD', 'MK', 'AS'].slice(0, (index % 3) + 1).map(( initials, i) => (
                      <div 
                        key={i} 
                        className="avatar" 
                        style={{ 
                          background: ['#6c5ce7', '#00b894', '#e17055'][i],
                          marginLeft: i > 0 ? '-8px' : '0'
                        }}
                      >
                        {initials}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <span className={`badge ${getStatusBadgeClass(project.status)}`}>
                    {getStatusLabel(project.status)}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="progress-bar" style={{ flex: 1 }}>
                      <div 
                        className="progress-fill primary" 
                        style={{ width: `${getProjectProgress(project.projectId)}%` }}
                      />
                    </div>
                    <span style={{ fontWeight: 600, color: '#6c5ce7', minWidth: '40px' }}>
                      {getProjectProgress(project.projectId)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Projects Cards */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">📊 Projects Overview</div>
                <div className="card-subtitle">All active projects</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {projects.map(project => (
                <div 
                  key={project.projectId}
                  style={{
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    padding: '16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span className={`badge ${getStatusBadgeClass(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#a0a0a0' }}>
                      {getProjectProgress(project.projectId)}%
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#2d3436', fontSize: '1rem' }}>
                    {project.projectName}
                  </h4>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.8rem', color: '#a0a0a0' }}>
                    {project.departmentName}
                  </p>
                  <div className="progress-bar">
                    <div 
                      className={`progress-fill ${getProjectProgress(project.projectId) === 100 ? 'success' : 'primary'}`}
                      style={{ width: `${getProjectProgress(project.projectId)}%` }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                    <div className="avatar-group">
                      {['JD', 'MK'].map((initials, i) => (
                        <div 
                          key={i} 
                          className="avatar" 
                          style={{ 
                            width: '24px',
                            height: '24px',
                            fontSize: '0.65rem',
                            background: ['#6c5ce7', '#00b894'][i]
                          }}
                        >
                          {initials}
                        </div>
                      ))}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#a0a0a0' }}>
                      {project.startDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Overall Progress */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="card-title" style={{ marginBottom: '20px' }}>🎯 Overall Progress</div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div className="circular-progress">
                <svg width="120" height="120">
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6c5ce7" />
                      <stop offset="100%" stopColor="#a29bfe" />
                    </linearGradient>
                  </defs>
                  <circle
                    className="circular-progress-circle-bg"
                    cx="60"
                    cy="60"
                    r="52"
                  />
                  <circle
                    className="circular-progress-circle"
                    cx="60"
                    cy="60"
                    r="52"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    strokeDashoffset={`${2 * Math.PI * 52 * (1 - overallProgress / 100)}`}
                  />
                </svg>
                <div className="circular-progress-text">
                  <div className="circular-progress-value">{overallProgress}%</div>
                  <div className="circular-progress-label">Complete</div>
                </div>
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#a0a0a0' }}>
              {tasks.filter(t => t.status === 2).length} of {tasks.length} tasks completed
            </div>
          </div>

          {/* Recent Activities */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">📋 Recent Activities</div>
            </div>
            {activities.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className={`activity-icon ${activity.type}`}>
                  {activity.type === 'add' && '+'}
                  {activity.type === 'update' && '↻'}
                  {activity.type === 'delete' && '×'}
                </div>
                <div className="activity-content">
                  <div className="activity-text">{activity.text}</div>
                  <div className="activity-time">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: '16px' }}>📈 Quick Stats</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px',
                background: 'rgba(46, 213, 115, 0.1)',
                borderRadius: '10px'
              }}>
                <span style={{ color: '#00b894', fontWeight: 500 }}>✅ Completed Tasks</span>
                <span style={{ fontWeight: 700, color: '#00b894' }}>
                  {tasks.filter(t => t.status === 2).length}
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px',
                background: 'rgba(108, 92, 231, 0.1)',
                borderRadius: '10px'
              }}>
                <span style={{ color: '#6c5ce7', fontWeight: 500 }}>🔄 In Progress</span>
                <span style={{ fontWeight: 700, color: '#6c5ce7' }}>
                  {tasks.filter(t => t.status === 1).length}
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px',
                background: 'rgba(149, 165, 166, 0.1)',
                borderRadius: '10px'
              }}>
                <span style={{ color: '#636e72', fontWeight: 500 }}>📋 To Do</span>
                <span style={{ fontWeight: 700, color: '#636e72' }}>
                  {tasks.filter(t => t.status === 0).length}
                </span>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: '16px' }}>👥 Team Members</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { name: 'John Doe', role: 'Project Manager', color: '#6c5ce7' },
                { name: 'Maria Kim', role: 'Developer', color: '#00b894' },
                { name: 'Alex Smith', role: 'Designer', color: '#e17055' },
                { name: 'Sarah Lee', role: 'QA Engineer', color: '#0984e3' },
              ].map((member, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div 
                    className="avatar" 
                    style={{ 
                      width: '40px',
                      height: '40px',
                      fontSize: '0.9rem',
                      background: member.color,
                      marginLeft: '0'
                    }}
                  >
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#2d3436', fontSize: '0.9rem' }}>
                      {member.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#a0a0a0' }}>
                      {member.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
