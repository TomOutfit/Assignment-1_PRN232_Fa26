import { useState, useEffect } from 'react';
import { departmentApi } from '../services/api';
import type { Department, CreateDepartmentDto, UpdateDepartmentDto } from '../types';

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

  const getDepartmentIcon = (index: number): string => {
    const icons = ['🏢', '💼', '🏗️', '🔬', '💻', '📊', '🎨', '⚙️'];
    return icons[index % icons.length];
  };

  const getDepartmentColor = (index: number): string => {
    const colors = ['#6c5ce7', '#00b894', '#e17055', '#0984e3', '#fdcb6e', '#00cec9', '#e84393', '#636e72'];
    return colors[index % colors.length];
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Departments</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Add Department</button>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <span style={{ 
            position: 'absolute', 
            left: '16px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            fontSize: '1rem'
          }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Search departments..."
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 48px',
              border: '2px solid #f1f3f4',
              borderRadius: '10px',
              fontSize: '0.95rem',
              transition: 'all 0.2s'
            }}
          />
        </div>
      </div>

      {/* Departments Grid */}
      {departments.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🏢</div>
          <h3>No departments found</h3>
          <p>Create a new department to get started</p>
          <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => openModal()}>
            + Add Department
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {departments.map((dept, index) => (
            <div key={dept.departmentId} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
              {/* Color accent */}
              <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '4px', 
                height: '100%',
                background: getDepartmentColor(index)
              }} />
              
              <div style={{ paddingLeft: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: `${getDepartmentColor(index)}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem'
                    }}>
                      {getDepartmentIcon(index)}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, color: '#2d3436', fontSize: '1.1rem' }}>
                        {dept.departmentName}
                      </h3>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: dept.isActive ? '#00b894' : '#636e72'
                      }}>
                        {dept.isActive ? '● Active' : '○ Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {dept.departmentDescription && (
                  <p style={{ 
                    color: '#636e72', 
                    fontSize: '0.9rem', 
                    margin: '0 0 16px 0', 
                    lineHeight: '1.6',
                    minHeight: '44px'
                  }}>
                    {dept.departmentDescription.length > 80 
                      ? dept.departmentDescription.substring(0, 80) + '...' 
                      : dept.departmentDescription}
                  </p>
                )}
                
                {/* Stats */}
                <div style={{ 
                  display: 'flex', 
                  gap: '24px', 
                  padding: '12px 0',
                  borderTop: '1px solid #f1f3f4',
                  marginBottom: '16px'
                }}>
                  <div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#2d3436' }}>
                      {dept.projects?.length || 0}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#a0a0a0' }}>Projects</div>
                  </div>
                </div>
                
                <div className="actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => openModal(dept)}>
                    ✏️ Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(dept.departmentId)}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? '✏️ Edit Department' : '➕ Add Department'}</h3>
              <button 
                onClick={() => setShowModal(false)} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '1.5rem', 
                  cursor: 'pointer',
                  color: '#636e72'
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div style={{ 
                    background: 'rgba(231, 76, 60, 0.1)', 
                    color: '#e74c3c', 
                    padding: '12px', 
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }}>
                    {error}
                  </div>
                )}
                <div className="form-group">
                  <label>Department Name *</label>
                  <input
                    type="text"
                    value={form.departmentName}
                    onChange={e => setForm({ ...form, departmentName: e.target.value })}
                    placeholder="Enter department name"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={form.departmentDescription}
                    onChange={e => setForm({ ...form, departmentDescription: e.target.value })}
                    placeholder="Enter description"
                    rows={4}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
