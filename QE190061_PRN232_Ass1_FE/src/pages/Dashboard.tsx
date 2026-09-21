import { useState, useEffect } from 'react';
import { departmentApi, projectApi, taskApi, tagApi } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    departments: 0,
    projects: 0,
    tasks: 0,
    tags: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      departmentApi.getAll(),
      projectApi.getAll(),
      taskApi.getAll(),
      tagApi.getAll(),
    ]).then(([departments, projects, tasks, tags]) => {
      setStats({
        departments: departments.length,
        projects: projects.length,
        tasks: tasks.length,
        tags: tags.length,
      });
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
      </div>

      <div className="grid grid-4">
        <div className="stat-card">
          <div className="stat-value">🏢</div>
          <div className="stat-label">Departments</div>
          <div className="stat-value">{stats.departments}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">📁</div>
          <div className="stat-label">Projects</div>
          <div className="stat-value">{stats.projects}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">✅</div>
          <div className="stat-label">Tasks</div>
          <div className="stat-value">{stats.tasks}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">🏷️</div>
          <div className="stat-label">Tags</div>
          <div className="stat-value">{stats.tags}</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <span className="card-title">Welcome to TaskTrack</span>
        </div>
        <p style={{ color: '#7f8c8d', lineHeight: '1.6' }}>
          This is a Task Management System built with React and .NET Core.
          Use the navigation menu on the left to manage Departments, Projects, Tasks, and Tags.
        </p>
      </div>
    </div>
  );
}
