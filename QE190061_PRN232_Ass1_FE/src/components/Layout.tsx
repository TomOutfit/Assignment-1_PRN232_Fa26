import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/departments', label: 'Departments', icon: '🏢' },
    { path: '/projects', label: 'Projects', icon: '📁' },
    { path: '/tasks', label: 'Tasks', icon: '✅' },
    { path: '/tags', label: 'Tags', icon: '🏷️' },
  ];

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${isExpanded ? 'expanded' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">📋</div>
          <span className="sidebar-title">TaskTrack</span>
        </div>
        
        <button 
          className="sidebar-toggle" 
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          ◀
        </button>
        
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Wrapper */}
      <div className={`main-wrapper ${isExpanded ? 'sidebar-expanded' : ''}`}>
        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            <h1 className="header-title">Task Management</h1>
          </div>
          
          <div className="header-right">
            <div className="header-search">
              <span className="header-search-icon">🔍</span>
              <input type="text" placeholder="Search tasks, projects..." />
            </div>
            
            <button className="header-icon-btn" aria-label="Notifications">
              🔔
              <span className="notification-badge"></span>
            </button>
            
            <div className="user-profile">
              <div className="user-avatar">A</div>
              <span className="user-name">Admin</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
