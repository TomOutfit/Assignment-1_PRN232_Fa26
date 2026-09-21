import { useState, useEffect } from 'react';
import { tagApi } from '../services/api';
import type { Tag, CreateTagDto, UpdateTagDto } from '../types';

export default function TagList() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateTagDto>({ tagName: '', color: '#6c5ce7' });
  const [error, setError] = useState('');

  const fetchTags = async () => {
    try {
      const data = await tagApi.getAll();
      setTags(data);
    } catch (err) {
      console.error('Error fetching tags:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const openModal = (tag?: Tag) => {
    if (tag) {
      setEditingId(tag.tagId);
      setForm({ tagName: tag.tagName, color: tag.color || '#6c5ce7' });
    } else {
      setEditingId(null);
      setForm({ tagName: '', color: '#6c5ce7' });
    }
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tagName.trim()) {
      setError('Tag name is required');
      return;
    }
    try {
      if (editingId) {
        await tagApi.update(editingId, form as UpdateTagDto);
      } else {
        await tagApi.create(form);
      }
      setShowModal(false);
      fetchTags();
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tag? This will fail if the tag is used by any task.')) return;
    try {
      await tagApi.delete(id);
      fetchTags();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cannot delete tag used by tasks');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Tags</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Add Tag</button>
      </div>

      {/* Tags Grid */}
      {tags.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🏷️</div>
          <h3>No tags found</h3>
          <p>Create a new tag to organize your tasks</p>
          <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => openModal()}>
            + Add Tag
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {tags.map(tag => (
            <div key={tag.tagId} className="card" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: tag.color || '#6c5ce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 12px ${tag.color || '#6c5ce7'}40`
                }}>
                  <span style={{ fontSize: '1.2rem' }}>🏷️</span>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#2d3436', fontSize: '1rem' }}>
                    {tag.tagName}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#a0a0a0', marginTop: '4px' }}>
                    {tag.color || '#6c5ce7'}
                  </div>
                </div>
              </div>
              <div className="actions">
                <button className="btn btn-secondary btn-sm" onClick={() => openModal(tag)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(tag.tagId)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Color Picker */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <div className="card-title">🎨 Available Colors</div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>
          {[
            '#6c5ce7', '#a29bfe', '#00b894', '#55efc4', 
            '#e17055', '#fab1a0', '#0984e3', '#74b9ff',
            '#fdcb6e', '#ffeaa7', '#e84393', '#fd79a8',
            '#00cec9', '#81ecec', '#636e72', '#b2bec3'
          ].map(color => (
            <div 
              key={color}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: color,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: `0 2px 8px ${color}40`
              }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? '✏️ Edit Tag' : '➕ Add Tag'}</h3>
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
                  <label>Tag Name *</label>
                  <input
                    type="text"
                    value={form.tagName}
                    onChange={e => setForm({ ...form, tagName: e.target.value })}
                    placeholder="Enter tag name"
                  />
                </div>
                <div className="form-group">
                  <label>Color</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <input
                      type="color"
                      value={form.color || '#6c5ce7'}
                      onChange={e => setForm({ ...form, color: e.target.value })}
                      style={{ 
                        width: '60px', 
                        height: '50px', 
                        padding: '4px', 
                        border: '2px solid #f1f3f4', 
                        borderRadius: '10px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ color: '#636e72', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                      {form.color}
                    </span>
                  </div>
                </div>
                
                {/* Quick Colors */}
                <div className="form-group">
                  <label>Quick Colors</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                    {[
                      '#6c5ce7', '#00b894', '#e17055', '#0984e3',
                      '#fdcb6e', '#e84393', '#00cec9', '#636e72'
                    ].map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setForm({ ...form, color })}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          border: `3px solid ${form.color === color ? '#2d3436' : 'transparent'}`,
                          backgroundColor: color,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Preview */}
                <div style={{ 
                  marginTop: '20px', 
                  padding: '16px',
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '12px', 
                    fontWeight: 600,
                    color: '#636e72',
                    fontSize: '0.85rem'
                  }}>
                    Preview
                  </label>
                  <span style={{
                    padding: '8px 20px',
                    borderRadius: '20px',
                    backgroundColor: form.color || '#6c5ce7',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    boxShadow: `0 4px 12px ${form.color || '#6c5ce7'}40`
                  }}>
                    {form.tagName || 'Tag Name'}
                  </span>
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
