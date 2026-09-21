import { useState, useEffect } from 'react';
import { tagApi } from '../services/api';
import type { Tag, CreateTagDto, UpdateTagDto } from '../types';
import './TagList.css';

const TAG_COLORS = [
  '#667eea', '#22c55e', '#f97316', '#3b82f6',
  '#ec4899', '#06b6d4', '#f59e0b', '#8b5cf6',
  '#14b8a6', '#f43f5e', '#a855f7', '#64748b'
];

export default function TagList() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateTagDto>({ tagName: '', color: '#667eea' });
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
      setForm({ tagName: tag.tagName, color: tag.color || '#667eea' });
    } else {
      setEditingId(null);
      setForm({ tagName: '', color: '#667eea' });
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

  if (loading) {
    return (
      <div className="tag-loading">
        <div className="loading-spinner"></div>
        <p>Loading tags...</p>
      </div>
    );
  }

  return (
    <div className="tag-list-page">
      <div className="page-header">
        <div className="header-content">
          <h2>Tags</h2>
          <p className="page-subtitle">Organize tasks with colorful tags</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Tag
        </button>
      </div>

      {/* Tags Grid */}
      {tags.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
          </div>
          <h3>No tags found</h3>
          <p>Create a new tag to organize your tasks</p>
          <button className="btn btn-primary" onClick={() => openModal()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Tag
          </button>
        </div>
      ) : (
        <div className="tags-grid">
          {tags.map(tag => (
            <div key={tag.tagId} className="tag-card">
              <div className="tag-color-preview" style={{ backgroundColor: tag.color || '#667eea' }} />
              <div className="tag-content">
                <div className="tag-info">
                  <div 
                    className="tag-icon"
                    style={{ backgroundColor: `${tag.color || '#667eea'}20` }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tag.color || '#667eea'} strokeWidth="2">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                      <line x1="7" y1="7" x2="7.01" y2="7"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="tag-name">{tag.tagName}</h3>
                    <span className="tag-color-code">{tag.color || '#667eea'}</span>
                  </div>
                </div>
                <div className="tag-actions">
                  <button className="action-btn" onClick={() => openModal(tag)} title="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button className="action-btn delete" onClick={() => handleDelete(tag.tagId)} title="Delete">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
              <span 
                className="tag-preview-badge"
                style={{ backgroundColor: tag.color || '#667eea' }}
              >
                {tag.tagName}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Color Palette */}
      <div className="card color-palette-card">
        <div className="card-header">
          <h3 className="card-title">Available Colors</h3>
        </div>
        <div className="color-palette">
          {TAG_COLORS.map(color => (
            <div 
              key={color}
              className="color-swatch"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
                <h3>{editingId ? 'Edit Tag' : 'Create New Tag'}</h3>
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
                  <label>Tag Name</label>
                  <input
                    type="text"
                    value={form.tagName}
                    onChange={e => setForm({ ...form, tagName: e.target.value })}
                    placeholder="Enter tag name"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Color</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      value={form.color}
                      onChange={e => setForm({ ...form, color: e.target.value })}
                      className="color-picker"
                    />
                    <span className="color-code">{form.color}</span>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Quick Colors</label>
                  <div className="quick-colors">
                    {TAG_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setForm({ ...form, color })}
                        className={`quick-color-btn ${form.color === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Preview */}
                <div className="tag-preview-section">
                  <label>Preview</label>
                  <div className="preview-container">
                    <span 
                      className="tag-preview"
                      style={{ 
                        backgroundColor: form.color,
                        boxShadow: `0 4px 12px ${form.color}40`
                      }}
                    >
                      {form.tagName || 'Tag Name'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update Tag' : 'Create Tag'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
