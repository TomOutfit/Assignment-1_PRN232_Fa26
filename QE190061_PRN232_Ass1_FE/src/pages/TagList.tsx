import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Palette,
  Check,
} from 'lucide-react';
import { tagApi } from '../services/api';
import type { Tag, CreateTagDto, UpdateTagDto } from '../types';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';
import './TagList.css';

const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#64748b', // Slate
];

export default function TagList() {
  const toast = useToast();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<CreateTagDto>({
    tagName: '',
    color: '#6366f1',
  });

  const fetchTags = useCallback(async () => {
    try {
      const data = await tagApi.getAll();
      setTags(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load tags.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const openTagModal = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag);
      setFormData({
        tagName: tag.tagName,
        color: tag.color || '#6366f1',
      });
    } else {
      setEditingTag(null);
      setFormData({
        tagName: '',
        color: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)],
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tagName.trim()) {
      toast.warning('Tag name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTag) {
        await tagApi.update(editingTag.tagId, formData as UpdateTagDto);
        toast.success(`Tag "#${formData.tagName}" updated.`);
      } else {
        await tagApi.create(formData);
        toast.success(`Tag "#${formData.tagName}" created.`);
      }
      setShowModal(false);
      fetchTags();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save tag.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!tagToDelete) return;
    setIsDeleting(true);
    try {
      await tagApi.delete(tagToDelete.tagId);
      toast.success(`Tag "#${tagToDelete.tagName}" deleted.`);
      setTagToDelete(null);
      fetchTags();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete tag.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="tags-page">
      {/* Header */}
      <div className="tags-header-bar">
        <div>
          <h2 className="page-heading">Tags & Taxonomy</h2>
          <p className="page-desc">Label and organize work items across your entire workspace.</p>
        </div>

        <button className="btn btn-primary" onClick={() => openTagModal()}>
          <Plus size={16} />
          <span>New Tag</span>
        </button>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="tags-grid">
          <Skeleton height="140px" borderRadius="var(--radius-xl)" />
          <Skeleton height="140px" borderRadius="var(--radius-xl)" />
          <Skeleton height="140px" borderRadius="var(--radius-xl)" />
        </div>
      ) : tags.length === 0 ? (
        <EmptyState
          title="No tags created yet"
          description="Create custom labels to categorize and filter your team tasks."
          actionText="Create Tag"
          onAction={() => openTagModal()}
        />
      ) : (
        <div className="tags-grid">
          {tags.map(tag => (
            <div key={tag.tagId} className="glass-card tag-card">
              <div className="tag-card-top">
                <Badge
                  label={`#${tag.tagName}`}
                  color={tag.color}
                  size="md"
                />
                <div className="tag-actions">
                  <button
                    className="btn-icon-sm btn-ghost"
                    onClick={() => openTagModal(tag)}
                    title="Edit"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    className="btn-icon-sm btn-ghost text-danger"
                    onClick={() => setTagToDelete(tag)}
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="tag-card-details">
                <div className="tag-color-preview">
                  <span
                    className="color-sample"
                    style={{ backgroundColor: tag.color || '#6366f1' }}
                  />
                  <span className="color-hex">{tag.color || '#6366f1'}</span>
                </div>
                <span className="tag-id-pill">ID #{tag.tagId}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tag Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingTag ? 'Edit Tag' : 'Create Tag'}
        subtitle={editingTag ? `Editing #${editingTag.tagId}` : 'Define label name and theme color'}
        maxWidth="sm"
      >
        <form onSubmit={handleSubmit}>
          {/* Live Preview */}
          <div className="tag-live-preview-box">
            <span className="preview-label">Live Preview:</span>
            <Badge
              label={`#${formData.tagName || 'PreviewTag'}`}
              color={formData.color}
              size="md"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tag Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Frontend, Bug, HighPriority"
              value={formData.tagName}
              onChange={e => setFormData({ ...formData, tagName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Palette size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Choose Color Preset
            </label>
            <div className="preset-colors-grid">
              {PRESET_COLORS.map(c => {
                const isSelected = formData.color?.toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={c}
                    type="button"
                    className="preset-color-dot"
                    style={{ backgroundColor: c }}
                    onClick={() => setFormData({ ...formData, color: c })}
                  >
                    {isSelected && <Check size={14} color="#ffffff" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Custom Hex Code</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="color"
                value={formData.color || '#6366f1'}
                onChange={e => setFormData({ ...formData, color: e.target.value })}
                style={{ width: '40px', height: '40px', padding: 0, borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
              />
              <input
                type="text"
                className="form-input"
                value={formData.color || ''}
                onChange={e => setFormData({ ...formData, color: e.target.value })}
                placeholder="#6366f1"
              />
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '24px -24px -24px -24px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingTag ? 'Save Changes' : 'Create Tag'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!tagToDelete}
        onClose={() => setTagToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Tag"
        message={`Are you sure you want to delete tag "#${tagToDelete?.tagName}"? Tasks with this tag will be detached.`}
        confirmText="Delete Tag"
        isLoading={isDeleting}
      />
    </div>
  );
}
