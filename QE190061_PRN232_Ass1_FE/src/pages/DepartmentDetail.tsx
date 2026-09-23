import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  FolderKanban,
  ArrowLeft,
  Calendar,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { departmentApi } from '../services/api';
import type { Department } from '../types';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import './DetailPages.css';

export default function DepartmentDetail() {
  const { id } = useParams<{ id: string }>();
  const [dept, setDept] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      departmentApi
        .getById(Number(id))
        .then(data => setDept(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="detail-page-container">
        <Skeleton height="200px" borderRadius="var(--radius-xl)" />
        <div style={{ marginTop: '24px' }}>
          <Skeleton height="300px" borderRadius="var(--radius-xl)" />
        </div>
      </div>
    );
  }

  if (!dept) {
    return (
      <div className="detail-page-container">
        <EmptyState
          title="Department Not Found"
          description="The department you are looking for does not exist or has been removed."
          actionText="Back to Departments"
          onAction={() => window.history.back()}
        />
      </div>
    );
  }

  return (
    <div className="detail-page-container animate-fade-in">
      {/* Back button */}
      <Link to="/departments" className="back-link">
        <ArrowLeft size={16} />
        <span>Back to Departments</span>
      </Link>

      {/* Header card */}
      <div className="glass-card detail-hero-card">
        <div className="detail-hero-header">
          <div className="detail-hero-icon">
            <Building2 size={32} />
          </div>
          <div className="detail-hero-meta">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 className="detail-title">{dept.departmentName}</h1>
              <Badge
                label={dept.isActive ? 'Active' : 'Inactive'}
                variant={dept.isActive ? 'success' : 'neutral'}
              />
            </div>
            <p className="detail-desc">
              {dept.departmentDescription || 'No description provided for this department.'}
            </p>
          </div>
        </div>

        <div className="detail-hero-footer">
          <div className="detail-stat-pill">
            <Layers size={14} />
            <span>{dept.projects ? dept.projects.length : 0} Linked Projects</span>
          </div>
          <Link to="/departments/manage" className="btn btn-secondary btn-sm">
            Manage Department
          </Link>
        </div>
      </div>

      {/* Projects Section */}
      <div className="detail-section">
        <div className="section-header-row">
          <h2 className="detail-section-title">Department Projects</h2>
          <span className="badge-pill">{dept.projects ? dept.projects.length : 0} Projects</span>
        </div>

        {!dept.projects || dept.projects.length === 0 ? (
          <EmptyState
            title="No projects linked yet"
            description="There are currently no active projects assigned to this department."
            actionText="Create Project"
            onAction={() => {}}
          />
        ) : (
          <div className="detail-cards-grid">
            {dept.projects.map(proj => (
              <Link
                key={proj.projectId}
                to={`/projects/${proj.projectId}`}
                className="glass-card detail-sub-card"
              >
                <div className="sub-card-top">
                  <div className="sub-card-title-group">
                    <FolderKanban size={18} className="sub-card-icon" />
                    <h3 className="sub-card-title">{proj.projectName}</h3>
                  </div>
                  <ExternalLink size={14} className="external-icon" />
                </div>

                {proj.description && <p className="sub-card-desc">{proj.description}</p>}

                <div className="sub-card-bottom">
                  <div className="sub-card-date">
                    <Calendar size={12} />
                    <span>{new Date(proj.startDate).toLocaleDateString()}</span>
                  </div>
                  <Badge
                    label={proj.statusName || (proj.status === 2 ? 'Completed' : 'In Progress')}
                    variant={proj.status === 2 ? 'success' : 'info'}
                    size="sm"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
