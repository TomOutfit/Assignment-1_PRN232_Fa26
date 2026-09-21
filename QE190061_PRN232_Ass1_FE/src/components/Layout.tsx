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
    { path: '/', label: 'Dashboard', icon: 'dashboard' },
    { path: '/tasks', label: 'Tasks', icon: 'tasks' },
    { path: '/projects', label: 'Projects', icon: 'projects' },
    { path: '/departments', label: 'Departments', icon: 'departments' },
    { path: '/tags', label: 'Tags', icon: 'tags' },
  ];

  const bottomNavItems = [
    { path: '#', label: 'Settings', icon: 'settings' },
    { path: '#', label: 'Logout', icon: 'logout' },
  ];

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar-new ${isExpanded ? 'expanded' : ''}`}>
        <div className="sidebar-logo-section">
          <div className="logo-container">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="white" fillOpacity="0.2"/>
              <path d="M8 12L14 18L24 8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="logo-text">TaskFlow</span>
        </div>
        
        <nav className="sidebar-nav-new">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item-new ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className={`nav-icon-new ${item.icon}`}>
                <NavIcon type={item.icon} />
              </span>
              <span className="nav-label-new">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">
          {bottomNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="nav-item-new"
            >
              <span className={`nav-icon-new ${item.icon}`}>
                <NavIcon type={item.icon} />
              </span>
              <span className="nav-label-new">{item.label}</span>
            </Link>
          ))}
          
          <div className="user-profile-new">
            <div className="user-avatar-new">
              <span>JD</span>
            </div>
            <div className="user-info">
              <span className="user-name-new">John Doe</span>
              <span className="user-role">Admin</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className={`main-wrapper-new ${isExpanded ? 'sidebar-expanded' : ''}`}>
        {/* Top Header */}
        <header className="top-header-new">
          <div className="header-left-new">
            <button className="menu-toggle" onClick={() => setIsExpanded(!isExpanded)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <h1 className="header-title-new">Dashboard</h1>
          </div>
          
          <div className="header-right-new">
            <div className="date-filter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>Sep 21, 2026</span>
            </div>
            
            <button className="notification-btn" aria-label="Notifications">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="notification-dot"></span>
            </button>
            
            <div className="header-divider"></div>
            
            <div className="user-header">
              <div className="user-header-avatar">JD</div>
              <div className="user-header-info">
                <span className="user-header-name">John Doe</span>
                <span className="user-header-role">Administrator</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content-new">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    dashboard: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="9" rx="1"/>
        <rect x="14" y="3" width="7" height="5" rx="1"/>
        <rect x="14" y="12" width="7" height="9" rx="1"/>
        <rect x="3" y="16" width="7" height="5" rx="1"/>
      </svg>
    ),
    tasks: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
    projects: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="9" y1="21" x2="9" y2="9"/>
      </svg>
    ),
    departments: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    tags: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
    ),
    settings: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
    logout: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
    ),
  };

  return icons[type] || null;
}
