import { useState, useEffect } from 'react';
import { tagApi } from '../services/api';
import type { Tag, CreateTagDto, UpdateTagDto } from '../types';

export default function TagList() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateTagDto>({ tagName: '', color: '#3498db' });
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
      setForm({ tagName: tag.tagName, color: tag.color || '#3498db' });
    } else {
      setEditingId(null);
      setForm({ tagName: '', color: '#3498db' });
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
    if (!confirm('Are you sure you want to delete this tag?')) return;
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

      {tags.length === 0 ? (
        <div className="empty">No tags found</div>
      ) : (
        <div className="grid grid-4">
          {tags.map(tag => (
            <div key={tag.tagId} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  backgroundColor: tag.color || '#3498db',
                }} />
                <span style={{ fontWeight: 500 }}>{tag.tagName}</span>
              </div>
              <div className="actions">
                <button className="btn btn-secondary btn-sm" onClick={() => openModal(tag)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(tag.tagId)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Tag' : 'Add Tag'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div style={{ color: '#e74c3c', marginBottom: '16px' }}>{error}</div>}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="color"
                      value={form.color || '#3498db'}
                      onChange={e => setForm({ ...form, color: e.target.value })}
                      style={{ width: '50px', height: '40px', padding: '2px', border: '1px solid #dde1e6', borderRadius: '4px' }}
                    />
                    <span style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>{form.color}</span>
                  </div>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Preview</label>
                  <span style={{
                    padding: '6px 16px',
                    borderRadius: '20px',
                    backgroundColor: form.color || '#3498db',
                    color: 'white',
                    fontSize: '0.9rem',
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
