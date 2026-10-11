// ==================================================
// CareerLink - Apply Modal Dialog
// ==================================================
// Modal window for submitting a job application with cover letter and resume

import React, { useState } from 'react';
import { api } from '../services/api';
import { X, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

export const ApplyModal = ({ job, onClose, onSuccess }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('jobId', job._id);
      if (coverLetter) {
        formData.append('coverLetter', coverLetter);
      }
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      const res = await api.applyJob(formData);
      if (res.success) {
        onSuccess(job._id);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem' }}>Apply for Position</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{job.title} at {job.company}</p>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Cover Letter / Pitch</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Why are you a great fit for this position? Mention your key achievements and relevant project experience..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Attach Specific Resume (Optional)</label>
            <div style={{ border: '2px dashed #cbd5e1', padding: '1.2rem', borderRadius: '8px', textAlign: 'center', background: '#f8fafc' }}>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                id="modal-resume-file"
                style={{ display: 'none' }}
                onChange={(e) => setResumeFile(e.target.files[0])}
              />
              <label htmlFor="modal-resume-file" style={{ cursor: 'pointer' }}>
                <Upload size={24} color="#64748b" style={{ margin: '0 auto 0.5rem auto', display: 'block' }} />
                <span style={{ fontSize: '0.9rem', color: '#2563eb', fontWeight: 600 }}>
                  {resumeFile ? resumeFile.name : 'Click to select PDF or DOCX file'}
                </span>
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                  Max 5MB. If left blank, your profile resume will be referenced.
                </span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <div className="spinner" /> : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
