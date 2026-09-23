import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Building2,
  Tag,
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

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare },
    { path: '/projects', label: 'Projects', icon: FolderKanban },
    { path: '/departments', label: 'Departments', icon: Building2 },
    { path: '/tags', label: 'Tags', icon: Tag },
  ];

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard Overview';
      case '/tasks':
        return 'Task Management';
      case '/projects':
        return 'Projects & Initiatives';
      case '/departments':
        return 'Department Directory';
      case '/tags':
        return 'Tag Taxonomy';
      default:
        return 'TaskTrack Hub';
    }
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
                <span className="brand-badge">PRO</span>
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
          <div className="nav-section-label">{!collapsed && 'NAVIGATION'}</div>
          {navItems.map(item => {
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
                  <Icon size={19} />
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
                <span className="status-text">System Active</span>
              </div>
              <div className="status-sub">Assignment 1 • PRN232</div>
            </div>
          ) : (
            <div className="collapsed-status-dot" title="System Active" />
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
            <div className="workspace-badge desktop-only">
              <Sparkles size={14} className="sparkle-icon" />
              <span>Enterprise Workspace</span>
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
