// ==================================================
// CareerLink - Jobseeker Dashboard
// ==================================================
// Candidate control center: recommendations, application tracking, resume parsing

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { JobCard } from '../components/JobCard';
import { 
  Sparkles, 
  FileText, 
  Clock, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Edit3, 
  Save, 
  Tag, 
  Building,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const SeekerDashboard = ({ onApplyJob, setSelectedJob, setCurrentView }) => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('recommendations'); // 'recommendations' | 'applications' | 'profile'
  
  // Data states
  const [recommendations, setRecommendations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile edit states
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [skillsStr, setSkillsStr] = useState((user?.skills || []).join(', '));
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Resume upload states
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Recommendations fetch karo
      const recRes = await api.getRecommendations();
      if (recRes.success) {
        setRecommendations(recRes.data?.recommendations || []);
      }

      // Applications fetch karo
      if (user?._id) {
        const appRes = await api.getUserApplications(user._id);
        if (appRes.success) {
          setApplications(appRes.data || []);
        }
      }

      // Parsed resume fetch karo agar available hai
      try {
        const parsedRes = await api.getParsedResume();
        if (parsedRes.success && parsedRes.data) {
          setParsedData(parsedRes.data.parsedData);
        }
      } catch (e) {
        // Resume not uploaded yet - safe to ignore
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?._id]);

  // Handle Profile Update
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess(false);

    try {
      const skillsArray = skillsStr
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s.length > 0);

      const res = await api.updateProfile({
        bio,
        location,
        skills: skillsArray,
      });

      if (res.success) {
        await refreshUser();
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
        // Refresh recommendations with new skills
        const recRes = await api.getRecommendations();
        if (recRes.success) {
          setRecommendations(recRes.data?.recommendations || []);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle Resume Upload & Extraction
  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;

    setUploadingResume(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);

      const res = await api.uploadResume(formData);
      if (res.success && res.data) {
        setUploadSuccess(true);
        setParsedData(res.data.parsedData);
        await refreshUser();
        setTimeout(() => setUploadSuccess(false), 4000);
      }
    } catch (err) {
      setUploadError(err.message || 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'shortlisted':
        return <span className="badge badge-success"><CheckCircle2 size={13} /> Shortlisted</span>;
      case 'accepted':
        return <span className="badge badge-success"><CheckCircle2 size={13} /> Offer Accepted</span>;
      case 'rejected':
        return <span className="badge badge-danger"><XCircle size={13} /> Rejected</span>;
      default:
        return <span className="badge badge-neutral"><Clock size={13} /> Under Review</span>;
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      {/* Candidate Profile Summary Header */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem', background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Candidate Portal</span>
            <h1 style={{ fontSize: '2rem', color: 'white', fontWeight: 800 }}>{user?.name}</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>{user?.email} • {user?.location || 'India'}</p>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ textAlign: 'center', background: 'rgba(255, 255, 255, 0.08)', padding: '0.8rem 1.4rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8' }}>{applications.length}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Applications</div>
            </div>

            <div style={{ textAlign: 'center', background: 'rgba(255, 255, 255, 0.08)', padding: '0.8rem 1.4rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#4ade80' }}>{recommendations.length}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Job Matches</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ maxWidth: '600px', marginBottom: '2rem' }}>
        <button
          className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          <Sparkles size={16} style={{ display: 'inline', marginRight: 6 }} />
          Smart Recommendations ({recommendations.length})
        </button>

        <button
          className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          <Clock size={16} style={{ display: 'inline', marginRight: 6 }} />
          My Applications ({applications.length})
        </button>

        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <FileText size={16} style={{ display: 'inline', marginRight: 6 }} />
          Resume & Profile
        </button>
      </div>

      {/* TAB 1: RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem' }}>Personalized Job Recommendations</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Algorithm computes intersection score between your profile competencies and employer job requisitions.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div className="spinner" style={{ borderTopColor: '#2563eb', margin: '0 auto' }} />
            </div>
          ) : recommendations.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
              <Sparkles size={36} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
              <h3>No skill matches found yet</h3>
              <p style={{ color: '#64748b', marginTop: '0.4rem' }}>
                Add more technologies to your profile in the <strong>Resume & Profile</strong> tab to unlock tailored opportunities!
              </p>
              <button className="btn btn-primary" onClick={() => setActiveTab('profile')} style={{ marginTop: '1rem' }}>
                Add Skills to Profile
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
              {recommendations.map((item) => (
                <div key={item.job._id} style={{ display: 'flex', flexDirection: 'column' }}>
                  <JobCard
                    job={item.job}
                    matchScore={item.matchPercentage}
                    onSelect={(j) => {
                      setSelectedJob(j);
                      setCurrentView('job-detail');
                    }}
                    onApply={(j) => onApplyJob(j)}
                    isApplied={applications.some((a) => (a.job?._id || a.job) === item.job._id)}
                  />
                  {/* Skill match breakdown explanation */}
                  <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 16px 16px', fontSize: '0.8rem', color: '#475569' }}>
                    <strong>Match Analysis:</strong> {item.explanation}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY APPLICATIONS */}
      {activeTab === 'applications' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem' }}>Application Submission Pipeline</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Real-time progression status of jobs you have applied for.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div className="spinner" style={{ borderTopColor: '#2563eb', margin: '0 auto' }} />
            </div>
          ) : applications.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
              <Clock size={36} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
              <h3>You have not applied to any positions yet</h3>
              <p style={{ color: '#64748b', marginTop: '0.4rem' }}>
                Browse the jobs catalog or smart recommendations to find your next role.
              </p>
              <button className="btn btn-primary" onClick={() => setCurrentView('jobs')} style={{ marginTop: '1rem' }}>
                Explore Jobs
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {applications.map((app) => (
                <div key={app._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem' }}>{app.job?.title || 'Job Opening'}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                      <Building size={16} />
                      <span>{app.job?.company || 'Company'}</span>
                      <span>•</span>
                      <span>Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>

                    {app.recruiterFeedback && (
                      <div style={{ marginTop: '0.6rem', background: '#eff6ff', borderLeft: '3px solid #2563eb', padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: '#1e40af' }}>
                        <strong>Recruiter Note:</strong> {app.recruiterFeedback}
                      </div>
                    )}
                  </div>

                  <div>
                    {getStatusBadge(app.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RESUME & PROFILE */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          {/* Profile Form */}
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Edit3 size={18} color="#2563eb" /> Candidate Profile Details
            </h3>

            {profileSuccess && (
              <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.6rem 0.9rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={16} /> Profile updated successfully!
              </div>
            )}

            <form onSubmit={handleProfileSave}>
              <div className="form-group">
                <label className="form-label">Professional Bio</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Tell employers about your technical background..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location / City</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Pune, India"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Technical Skills (Comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. javascript, node.js, react, mongodb, docker"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                />
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Used directly by the recommendation engine.
                </span>
              </div>

              <button type="submit" className="btn btn-primary" disabled={profileSaving}>
                {profileSaving ? <div className="spinner" /> : <><Save size={16} /> Save Profile</>}
              </button>
            </form>
          </div>

          {/* Resume Upload & Intelligence */}
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Upload size={18} color="#2563eb" /> Resume Upload & Parser
            </h3>

            {uploadSuccess && (
              <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.6rem 0.9rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={16} /> Resume uploaded and parsed successfully!
              </div>
            )}

            {uploadError && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.6rem 0.9rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertCircle size={16} /> {uploadError}
              </div>
            )}

            <form onSubmit={handleResumeUpload} style={{ marginBottom: '1.5rem' }}>
              <div style={{ border: '2px dashed #cbd5e1', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', background: '#f8fafc', marginBottom: '1rem' }}>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  id="dashboard-resume-file"
                  style={{ display: 'none' }}
                  onChange={(e) => setResumeFile(e.target.files[0])}
                />
                <label htmlFor="dashboard-resume-file" style={{ cursor: 'pointer' }}>
                  <FileText size={32} color="#2563eb" style={{ margin: '0 auto 0.5rem auto', display: 'block' }} />
                  <span style={{ fontSize: '0.95rem', color: '#2563eb', fontWeight: 600 }}>
                    {resumeFile ? resumeFile.name : 'Select PDF or DOCX Resume'}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                    Supports PDF and DOCX up to 5MB
                  </span>
                </label>
              </div>

              <button type="submit" className="btn btn-secondary" style={{ width: '100%' }} disabled={!resumeFile || uploadingResume}>
                {uploadingResume ? <div className="spinner" /> : 'Upload & Parse Resume'}
              </button>
            </form>

            {/* Parsed Resume Preview */}
            {parsedData && (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.2rem' }}>
                <h4 style={{ fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.6rem' }}>Extracted Resume Metadata</h4>
                <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div><strong>Name:</strong> {parsedData.extractedName || user.name}</div>
                  <div><strong>Email:</strong> {parsedData.extractedEmail || user.email}</div>
                  {parsedData.extractedPhone && <div><strong>Phone:</strong> {parsedData.extractedPhone}</div>}
                  <div>
                    <strong>Extracted Skills:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.4rem' }}>
                      {parsedData.extractedSkills && parsedData.extractedSkills.map((sk, i) => (
                        <span key={i} className="badge badge-primary" style={{ fontSize: '0.75rem' }}>{sk}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
