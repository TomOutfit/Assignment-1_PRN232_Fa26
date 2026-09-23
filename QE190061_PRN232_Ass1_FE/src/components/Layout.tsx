import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Building2,
  Tag,
  Search,
  Settings2,
  Sliders,
  Sun,
  Moon,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const publicNavItems = [
    { path: '/', label: 'Home / Dashboard', icon: LayoutDashboard },
    { path: '/departments', label: 'Departments', icon: Building2 },
    { path: '/projects', label: 'Projects', icon: FolderKanban },
    { path: '/tasks', label: 'Tasks Board', icon: CheckSquare },
    { path: '/search', label: 'Search & Filter', icon: Search },
  ];

  const managementNavItems = [
    { path: '/tasks/manage', label: 'Manage Tasks', icon: Settings2 },
    { path: '/projects/manage', label: 'Manage Projects', icon: Sliders },
    { path: '/departments/manage', label: 'Manage Depts', icon: Building2 },
    { path: '/tags/manage', label: 'Manage Tags', icon: Tag },
  ];

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Dashboard Overview';
    if (location.pathname === '/search') return 'Search & Filter Hub';
    if (location.pathname.startsWith('/departments/manage')) return 'Department Management';
    if (location.pathname.startsWith('/departments/')) return 'Department Details';
    if (location.pathname === '/departments') return 'Departments Directory';
    if (location.pathname.startsWith('/projects/manage')) return 'Project Management';
    if (location.pathname.startsWith('/projects/')) return 'Project Details';
    if (location.pathname === '/projects') return 'Projects Directory';
    if (location.pathname.startsWith('/tasks/manage')) return 'Task Management Hub';
    if (location.pathname.startsWith('/tasks/')) return 'Task Details';
    if (location.pathname === '/tasks') return 'Tasks & Kanban Board';
    if (location.pathname.startsWith('/tags')) return 'Tag Taxonomy Management';
    return 'TaskTrack Enterprise';
  };

  return (
    <div className={`app-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div className="mobile-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`app-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-logo">
            <div className="brand-icon">
              <Layers size={22} />
            </div>
            {!collapsed && (
              <div className="brand-text">
                <span className="brand-name">TaskTrack</span>
                <span className="brand-badge">ENTERPRISE</span>
              </div>
            )}
          </div>
          <button
            className="sidebar-toggle-btn desktop-only"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <button
            className="sidebar-close-btn mobile-only"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">{!collapsed && 'PUBLIC PORTAL'}</div>
          {publicNavItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
                title={collapsed ? item.label : undefined}
                end={item.path === '/'}
              >
                <div className="nav-icon-wrapper">
                  <Icon size={18} />
                </div>
                {!collapsed && <span className="nav-label">{item.label}</span>}
                {isActive && <div className="active-glow-indicator" />}
              </NavLink>
            );
          })}

          <div className="nav-section-label" style={{ marginTop: '12px' }}>
            {!collapsed && 'MANAGEMENT (CRUD)'}
          </div>
          {managementNavItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <div className="nav-icon-wrapper">
                  <Icon size={18} />
                </div>
                {!collapsed && <span className="nav-label">{item.label}</span>}
                {isActive && <div className="active-glow-indicator" />}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {!collapsed ? (
            <div className="system-status-card">
              <div className="status-indicator">
                <span className="status-dot" />
                <span className="status-text">Backend & API Ready</span>
              </div>
              <div className="status-sub">PRN232 Assignment 1</div>
            </div>
          ) : (
            <div className="collapsed-status-dot" title="Backend & API Ready" />
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="app-main-wrapper">
        {/* Header Bar */}
        <header className="app-header">
          <div className="header-left">
            <button
              className="menu-btn mobile-only"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="page-breadcrumb">
              <h1 className="current-page-title">{getPageTitle()}</h1>
            </div>
          </div>

          <div className="header-right">
            <NavLink to="/search" className="header-quick-search desktop-only" title="Quick Search">
              <Search size={14} />
              <span>Search tasks, projects...</span>
              <span className="search-shortcut">⌘K</span>
            </NavLink>

            <div className="workspace-badge desktop-only">
              <Sparkles size={14} className="sparkle-icon" />
              <span>Public Access</span>
            </div>

            {/* Theme Switcher Button */}
            <button
              className="theme-switcher-btn btn-icon"
              onClick={toggleTheme}
              aria-label="Toggle theme mode"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun size={18} className="theme-icon sun-icon" />
              ) : (
                <Moon size={18} className="theme-icon moon-icon" />
              )}
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="app-content animate-fade-in">
          <div className="content-container">{children}</div>
        </main>
      </div>
    </div>
  );
}
