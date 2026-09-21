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
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      await departmentApi.delete(id);
      fetchDepartments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cannot delete department with linked projects');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Departments</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Add Department</button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search departments..."
          value={searchName}
          onChange={e => setSearchName(e.target.value)}
        />
      </div>

      {departments.length === 0 ? (
        <div className="empty">No departments found</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(dept => (
                <tr key={dept.departmentId}>
                  <td>{dept.departmentId}</td>
                  <td>{dept.departmentName}</td>
                  <td>{dept.departmentDescription || '-'}</td>
                  <td>
                    <span className={`badge ${dept.isActive ? 'badge-success' : 'badge-secondary'}`}>
                      {dept.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => openModal(dept)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(dept.departmentId)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Department' : 'Add Department'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div style={{ color: '#e74c3c', marginBottom: '16px' }}>{error}</div>}
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
                    rows={3}
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
