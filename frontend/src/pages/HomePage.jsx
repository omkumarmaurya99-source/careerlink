// ==================================================
// CareerLink - Home Page
// ==================================================

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { JobCard } from '../components/JobCard';
import { Search, Sparkles, Building2, Users, ShieldCheck, ArrowRight } from 'lucide-react';

export const HomePage = ({ setCurrentView, setSelectedJob, onApplyJob }) => {
  const [keyword, setKeyword] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.getJobs({ limit: 6 });
        if (res.success && res.data) {
          setFeaturedJobs(res.data);
        }
      } catch (err) {
        console.error('Failed to load featured jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      setCurrentView('jobs', { keyword });
    } else {
      setCurrentView('jobs');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{ 
        background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)', 
        padding: '5rem 0 4rem 0',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '850px' }}>
          <div className="badge badge-primary" style={{ marginBottom: '1.2rem', padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}>
            <Sparkles size={14} /> Next-Gen Job Discovery & Recruitment Engine
          </div>

          <h1 style={{ fontSize: '3.2rem', lineHeight: 1.15, fontWeight: 800, marginBottom: '1.2rem', color: '#0f172a' }}>
            Find Your Dream Career with <span style={{ color: '#2563eb' }}>Intelligent Matching</span>
          </h1>

          <p style={{ fontSize: '1.15rem', color: '#64748b', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Connect directly with verified tech companies. Upload your resume for deterministic skill analysis and receive personalized opportunities matched to your exact competencies.
          </p>

          {/* Quick Search Bar */}
          <form 
            onSubmit={handleSearchSubmit} 
            style={{ 
              display: 'flex', 
              gap: '0.6rem', 
              background: 'white', 
              padding: '0.6rem', 
              borderRadius: '16px', 
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid #cbd5e1'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flex: 1, paddingLeft: '0.8rem' }}>
              <Search size={22} color="#64748b" />
              <input
                type="text"
                placeholder="Job title, technology skill, or keywords (e.g., Node.js, React, MongoDB)..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '1rem', background: 'transparent' }}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg">
              Search Jobs
            </button>
          </form>

          {/* Quick Skill Tags */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
            <span>Popular searches:</span>
            {['Node.js', 'React', 'MongoDB', 'Full Stack', 'DevOps', 'Python'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setCurrentView('jobs', { keyword: tag })}
                style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', color: '#334155' }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights / Stats */}
      <section style={{ padding: '3.5rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            <div className="card" style={{ textAlign: 'center', padding: '1.8rem' }}>
              <div style={{ background: '#eff6ff', color: '#2563eb', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <Building2 size={24} />
              </div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>500+</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Verified Employers</p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '1.8rem' }}>
              <div style={{ background: '#f5f3ff', color: '#8b5cf6', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <Users size={24} />
              </div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>10,000+</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Active Tech Candidates</p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '1.8rem' }}>
              <div style={{ background: '#dcfce7', color: '#16a34a', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>100% Secure</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Role-Based Access & JWT</p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '1.8rem' }}>
              <div style={{ background: '#fef3c7', color: '#d97706', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <Sparkles size={24} />
              </div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Instant</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Resume Skill Extraction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section style={{ padding: '2rem 0 4rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Latest Job Opportunities</h2>
              <p style={{ color: '#64748b', marginTop: '0.2rem' }}>Explore newly published openings across top engineering teams</p>
            </div>
            <button 
              className="btn btn-secondary"
              onClick={() => setCurrentView('jobs')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              Browse All Jobs <ArrowRight size={16} />
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div className="spinner" style={{ borderTopColor: '#2563eb', margin: '0 auto' }} />
              <p style={{ color: '#64748b', marginTop: '1rem' }}>Loading live jobs from API...</p>
            </div>
          ) : featuredJobs.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <h3>No jobs posted yet</h3>
              <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Sign in as a recruiter to post the first job requisition!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
              {featuredJobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  onSelect={(j) => {
                    setSelectedJob(j);
                    setCurrentView('job-detail');
                  }}
                  onApply={(j) => onApplyJob(j)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
