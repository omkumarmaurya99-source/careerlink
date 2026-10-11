// ==================================================
// CareerLink - Job Detail Page
// ==================================================

import React from 'react';
import { ArrowLeft, Building, MapPin, DollarSign, Clock, Calendar, CheckCircle, Share2 } from 'lucide-react';

export const JobDetailPage = ({ job, onBack, onApply, isApplied }) => {
  if (!job) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>Job details not available</h2>
        <button className="btn btn-secondary" onClick={onBack} style={{ marginTop: '1rem' }}>
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '900px' }}>
      <button 
        className="btn btn-secondary btn-sm" 
        onClick={onBack}
        style={{ marginBottom: '1.5rem' }}
      >
        <ArrowLeft size={16} /> Back to Openings
      </button>

      <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a' }}>{job.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#475569', fontSize: '1.1rem', marginTop: '0.4rem' }}>
              <Building size={20} color="#2563eb" />
              <span style={{ fontWeight: 600 }}>{job.company}</span>
            </div>
          </div>

          <div>
            {isApplied ? (
              <button className="btn btn-secondary btn-lg" disabled style={{ opacity: 0.8, cursor: 'default' }}>
                <CheckCircle size={18} color="#10b981" /> Application Submitted
              </button>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={() => onApply(job)}>
                Apply for Position
              </button>
            )}
          </div>
        </div>

        {/* Badges / Meta row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', padding: '1.2rem', background: '#f8fafc', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}>
            <MapPin size={18} color="#64748b" />
            <span><strong>Location:</strong> {job.location}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}>
            <DollarSign size={18} color="#64748b" />
            <span><strong>Salary:</strong> {job.salary || 'Not Disclosed'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}>
            <Clock size={18} color="#64748b" />
            <span><strong>Type:</strong> {job.jobType || 'Full-time'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}>
            <Calendar size={18} color="#64748b" />
            <span><strong>Posted:</strong> {new Date(job.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Required Skills */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.8rem' }}>Required Competencies & Technologies</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {job.skills && job.skills.map((skill, index) => (
              <span key={index} className="badge badge-primary" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.8rem' }}>Role Description & Responsibilities</h3>
          <div style={{ color: '#334155', lineHeight: 1.8, fontSize: '1rem', whiteSpace: 'pre-line' }}>
            {job.description}
          </div>
        </div>

        {/* Recruiter Information */}
        {job.recruiter && (
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.9rem' }}>
            <div>
              <span>Posted by <strong>{job.recruiter.name || 'Recruiter'}</strong></span>
              {job.recruiter.company && <span> at {job.recruiter.company}</span>}
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                alert('Job link copied to clipboard!');
              }}
            >
              <Share2 size={14} /> Share Job
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
