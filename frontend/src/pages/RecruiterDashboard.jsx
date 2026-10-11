// ==================================================
// CareerLink - Recruiter Dashboard
// ==================================================
// Recruiter control center: job creation, editing, deletion, and candidate pipeline management

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Briefcase, 
  PlusCircle, 
  Users, 
  Trash2, 
  Edit, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  X,
  FileText,
  Mail,
  Phone
} from 'lucide-react';

export const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Job creation / edit form modal
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState(user?.company || '');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [description, setDescription] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [jobType, setJobType] = useState('full-time');
  const [experienceLevel, setExperienceLevel] = useState('mid');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // Applications view modal
  const [selectedJobForApps, setSelectedJobForApps] = useState(null);
  const [jobApplications, setJobApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [statusUpdateNote, setStatusUpdateNote] = useState({});

  const fetchMyJobs = async () => {
    setLoading(true);
    try {
      const res = await api.getMyJobs();
      if (res.success) {
        setMyJobs(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching recruiter jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const openCreateModal = () => {
    setEditingJobId(null);
    setTitle('');
    setCompany(user?.company || '');
    setLocation('');
    setSalary('');
    setDescription('');
    setSkillsStr('');
    setJobType('full-time');
    setExperienceLevel('mid');
    setFormError(null);
    setShowJobModal(true);
  };

  const openEditModal = (job) => {
    setEditingJobId(job._id);
    setTitle(job.title);
    setCompany(job.company);
    setLocation(job.location);
    setSalary(job.salary || '');
    setDescription(job.description);
    setSkillsStr((job.skills || []).join(', '));
    setJobType(job.jobType || 'full-time');
    setExperienceLevel(job.experienceLevel || 'mid');
    setFormError(null);
    setShowJobModal(true);
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      const skillsArray = skillsStr
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s.length > 0);

      const payload = {
        title,
        company,
        location,
        salary,
        description,
        skills: skillsArray,
        jobType,
        experienceLevel,
      };

      if (editingJobId) {
        await api.updateJob(editingJobId, payload);
      } else {
        await api.createJob(payload);
      }

      setShowJobModal(false);
      fetchMyJobs();
    } catch (err) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      return;
    }

    try {
      await api.deleteJob(jobId);
      setMyJobs((prev) => prev.filter((j) => j._id !== jobId));
    } catch (err) {
      alert(err.message || 'Failed to delete job');
    }
  };

  const viewApplicants = async (job) => {
    setSelectedJobForApps(job);
    setAppsLoading(true);
    try {
      const res = await api.getJobApplications(job._id);
      if (res.success) {
        setJobApplications(res.data || []);
      }
    } catch (err) {
      alert(err.message || 'Failed to fetch job applications');
    } finally {
      setAppsLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    const feedback = statusUpdateNote[appId] || '';
    try {
      const res = await api.updateApplicationStatus(appId, {
        status: newStatus,
        feedback,
      });

      if (res.success) {
        setJobApplications((prev) =>
          prev.map((a) => (a._id === appId ? { ...a, status: newStatus, recruiterFeedback: feedback } : a))
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to update application status');
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      {/* Recruiter Header */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem', background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Employer Portal</span>
            <h1 style={{ fontSize: '2rem', color: 'white', fontWeight: 800 }}>{user?.company || user?.name}</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Manage job requisitions and review applicant pipelines</p>
          </div>

          <button className="btn btn-primary btn-lg" onClick={openCreateModal}>
            <PlusCircle size={18} /> Post New Job
          </button>
        </div>
      </div>

      {/* Posted Jobs Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem' }}>Your Posted Positions ({myJobs.length})</h2>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner" style={{ borderTopColor: '#2563eb', margin: '0 auto' }} />
        </div>
      ) : myJobs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <Briefcase size={36} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
          <h3>No job requisitions created yet</h3>
          <p style={{ color: '#64748b', marginTop: '0.4rem' }}>
            Publish your first job opening to start receiving candidate applications!
          </p>
          <button className="btn btn-primary" onClick={openCreateModal} style={{ marginTop: '1rem' }}>
            <PlusCircle size={16} /> Post a Job
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {myJobs.map((job) => (
            <div key={job._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{job.title}</h3>
                <div style={{ display: 'flex', gap: '0.8rem', color: '#64748b', fontSize: '0.88rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                  <span>{job.location}</span>
                  <span>•</span>
                  <span>{job.salary || 'Competitive'}</span>
                  <span>•</span>
                  <span>{job.jobType}</span>
                  <span>•</span>
                  <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.6rem' }}>
                  {job.skills && job.skills.map((s, idx) => (
                    <span key={idx} className="badge badge-primary" style={{ fontSize: '0.75rem' }}>{s}</span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => viewApplicants(job)}
                >
                  <Users size={15} /> View Candidates
                </button>

                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => openEditModal(job)}
                  title="Edit Job"
                >
                  <Edit size={15} />
                </button>

                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteJob(job._id)}
                  title="Delete Job"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* JOB CREATION / EDIT MODAL */}
      {showJobModal && (
        <div className="modal-overlay" onClick={() => setShowJobModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>{editingJobId ? 'Edit Job Posting' : 'Create Job Opening'}</h2>
              <button onClick={() => setShowJobModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                <AlertCircle size={16} /> <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleJobSubmit}>
              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Senior Backend Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. TechCorp Solutions"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Bengaluru, India or Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Salary Range</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 15-22 LPA"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Job Type</label>
                  <select 
                    className="form-select"
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="internship">Internship</option>
                    <option value="contract">Contract</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Experience Level</label>
                  <select 
                    className="form-select"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                  >
                    <option value="fresher">Fresher</option>
                    <option value="junior">Junior</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Required Skills (Comma separated) *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. node.js, express, mongodb, docker"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Job Description (At least 20 characters) *</label>
                <textarea
                  className="form-textarea"
                  required
                  rows={4}
                  placeholder="Detailed description of responsibilities, technical expectations, and company culture..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowJobModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? <div className="spinner" /> : editingJobId ? 'Update Job' : 'Publish Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW CANDIDATES MODAL */}
      {selectedJobForApps && (
        <div className="modal-overlay" onClick={() => setSelectedJobForApps(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div>
                <h2>Applicants for {selectedJobForApps.title}</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{jobApplications.length} candidates applied</p>
              </div>
              <button onClick={() => setSelectedJobForApps(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {appsLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <div className="spinner" style={{ borderTopColor: '#2563eb', margin: '0 auto' }} />
              </div>
            ) : jobApplications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                No candidate has applied to this requisition yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxHeight: '60vh', overflowY: 'auto' }}>
                {jobApplications.map((app) => (
                  <div key={app._id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.2rem', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{app.applicant?.name || 'Applicant'}</h4>
                        <div style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Mail size={14} /> {app.applicant?.email}
                          </span>
                          {app.applicant?.phone && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Phone size={14} /> {app.applicant.phone}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <select
                          className="form-select"
                          value={app.status}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
                        >
                          <option value="applied">Applied (Reviewing)</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>

                    {app.coverLetter && (
                      <div style={{ background: 'white', padding: '0.8rem', borderRadius: '8px', fontSize: '0.88rem', color: '#334155', border: '1px solid #e2e8f0', marginBottom: '0.6rem' }}>
                        <strong>Pitch:</strong> {app.coverLetter}
                      </div>
                    )}

                    {/* Feedback Note Input */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Add note/feedback for candidate..."
                        value={statusUpdateNote[app._id] || app.recruiterFeedback || ''}
                        onChange={(e) => setStatusUpdateNote({ ...statusUpdateNote, [app._id]: e.target.value })}
                        style={{ padding: '0.4rem 0.7rem', fontSize: '0.85rem' }}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleStatusChange(app._id, app.status)}
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
