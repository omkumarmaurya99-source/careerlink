// ==================================================
// CareerLink - Job Card Component
// ==================================================
// Clean, interactive job card displaying essential parameters and action buttons

import React from 'react';
import { MapPin, DollarSign, Clock, Building, CheckCircle2 } from 'lucide-react';

export const JobCard = ({ job, onSelect, onApply, isApplied, matchScore }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>{job.title}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            <Building size={16} />
            <span>{job.company}</span>
          </div>
        </div>

        {matchScore !== undefined && (
          <div 
            className="badge" 
            style={{ 
              background: matchScore >= 70 ? '#dcfce7' : matchScore >= 40 ? '#fef3c7' : '#f1f5f9',
              color: matchScore >= 70 ? '#15803d' : matchScore >= 40 ? '#b45309' : '#475569',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            {matchScore}% Match
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', fontSize: '0.85rem', color: '#475569' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <MapPin size={15} color="#64748b" />
          <span>{job.location}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <DollarSign size={15} color="#64748b" />
          <span>{job.salary || 'Competitive'}</span>
        </div>

        <div className="badge badge-neutral">
          {job.jobType || 'Full-time'}
        </div>

        <div className="badge badge-neutral">
          {job.experienceLevel || 'Mid'}
        </div>
      </div>

      <p style={{ color: '#475569', fontSize: '0.9rem', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {job.description}
      </p>

      {/* Skills Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {job.skills && job.skills.map((skill, index) => (
          <span 
            key={index} 
            className="badge badge-primary" 
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Card Footer Actions */}
      <div style={{ marginTop: 'auto', paddingTop: '0.8rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          Posted {new Date(job.createdAt).toLocaleDateString()}
        </span>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {onSelect && (
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => onSelect(job)}
            >
              Details
            </button>
          )}

          {onApply && (
            isApplied ? (
              <button className="btn btn-secondary btn-sm" disabled style={{ opacity: 0.7, cursor: 'default' }}>
                <CheckCircle2 size={14} color="#10b981" /> Applied
              </button>
            ) : (
              <button 
                className="btn btn-primary btn-sm" 
                onClick={() => onApply(job)}
              >
                Apply Now
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
