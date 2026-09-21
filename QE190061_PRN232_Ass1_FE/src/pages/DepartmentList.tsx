import { useState, useEffect } from 'react';
import { departmentApi } from '../services/api';
import type { Department, CreateDepartmentDto, UpdateDepartmentDto } from '../types';
import './DepartmentList.css';

const DEPARTMENT_COLORS = [
  { bg: 'rgba(102, 126, 234, 0.1)', color: '#667eea', icon: 'building' },
  { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', icon: 'briefcase' },
  { bg: 'rgba(249, 115, 22, 0.1)', color: '#f97316', icon: 'construction' },
  { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', icon: 'science' },
  { bg: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', icon: 'design' },
  { bg: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', icon: 'settings' },
];

export default function DepartmentList() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchName, setSearchName] = useState('');
  const [form, setForm] = useState<CreateDepartmentDto>({ departmentName: '', departmentDescription: '' });
  const [error, setError] = useState('');

  const fetchDepartments = async () => {
    try {
      const data = searchName 
        ? await departmentApi.search(searchName)
        : await departmentApi.getAll();
      setDepartments(data);
    } catch (err) {
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [searchName]);

  const openModal = (dept?: Department) => {
    if (dept) {
      setEditingId(dept.departmentId);
      setForm({ departmentName: dept.departmentName, departmentDescription: dept.departmentDescription });
    } else {
      setEditingId(null);
      setForm({ departmentName: '', departmentDescription: '' });
    }
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.departmentName.trim()) {
      setError('Department name is required');
      return;
    }
    try {
      if (editingId) {
        await departmentApi.update(editingId, form as UpdateDepartmentDto);
      } else {
        await departmentApi.create(form);
      }
      setShowModal(false);
      fetchDepartments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this department? This will fail if there are linked projects.')) return;
    try {
      await departmentApi.delete(id);
      fetchDepartments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cannot delete department with linked projects');
    }
  };

  const getDepartmentStyle = (index: number) => {
    return DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length];
  };

  if (loading) {
    return (
      <div className="department-loading">
        <div className="loading-spinner"></div>
        <p>Loading departments...</p>
      </div>
    );
  }

  return (
    <div className="department-list-page">
      <div className="page-header">
        <div className="header-content">
          <h2>Departments</h2>
          <p className="page-subtitle">Organize your teams by department</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Department
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-card">
        <div className="search-input-wrapper">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search departments..."
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Departments Grid */}
      {departments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <h3>No departments found</h3>
          <p>Create a new department to get started</p>
          <button className="btn btn-primary" onClick={() => openModal()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Department
          </button>
        </div>
      ) : (
        <div className="departments-grid">
          {departments.map((dept, index) => {
            const style = getDepartmentStyle(index);
            return (
              <div key={dept.departmentId} className="department-card">
                <div 
                  className="department-accent"
                  style={{ backgroundColor: style.color }}
                />
                
                <div className="department-content">
                  <div className="department-header">
                    <div 
                      className="department-icon"
                      style={{ backgroundColor: style.bg }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={style.color} strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                    </div>
                    <div className="department-status">
                      <span className={`status-indicator ${dept.isActive ? 'active' : 'inactive'}`}>
                        {dept.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="department-name">{dept.departmentName}</h3>
                  
                  {dept.departmentDescription && (
                    <p className="department-description">{dept.departmentDescription}</p>
                  )}
                  
                  <div className="department-stats">
                    <div className="stat-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <line x1="3" y1="9" x2="21" y2="9"/>
                      </svg>
                      <span><strong>{dept.projects?.length || 0}</strong> Projects</span>
                    </div>
                  </div>
                  
                  <div className="department-actions">
                    <button className="action-btn" onClick={() => openModal(dept)} title="Edit">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(dept.departmentId)} title="Delete">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <h3>{editingId ? 'Edit Department' : 'Create New Department'}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="modal-close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div className="error-message">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {error}
                  </div>
                )}
                
                <div className="form-group">
                  <label>Department Name</label>
                  <input
                    type="text"
                    value={form.departmentName}
                    onChange={e => setForm({ ...form, departmentName: e.target.value })}
                    placeholder="Enter department name"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={form.departmentDescription}
                    onChange={e => setForm({ ...form, departmentDescription: e.target.value })}
                    placeholder="Enter description"
                    rows={4}
                    className="form-textarea"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
