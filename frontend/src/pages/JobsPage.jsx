// ==================================================
// CareerLink - Explore & Search Jobs Page
// ==================================================

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { JobCard } from '../components/JobCard';
import { Search, Filter, RotateCcw, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';

export const JobsPage = ({ initialFilters = {}, setSelectedJob, setCurrentView, onApplyJob }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });

  // Filter states
  const [keyword, setKeyword] = useState(initialFilters.keyword || '');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [skill, setSkill] = useState('');
  const [page, setPage] = useState(1);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      let res;
      if (keyword.trim()) {
        res = await api.searchJobs({
          keyword,
          page,
          limit: 9,
          location,
          jobType,
        });
      } else {
        res = await api.getJobs({
          page,
          limit: 9,
          location,
          jobType,
          experienceLevel,
          skill,
        });
      }

      if (res.success) {
        setJobs(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, location, jobType, experienceLevel, skill]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleResetFilters = () => {
    setKeyword('');
    setLocation('');
    setJobType('');
    setExperienceLevel('');
    setSkill('');
    setPage(1);
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a' }}>Explore Opportunities</h1>
        <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.3rem' }}>
          Discover and apply to top tech roles with transparent salary and skill expectations.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="card" style={{ marginBottom: '2.5rem', padding: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Keyword Search</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Title, company, skill..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  style={{ paddingLeft: '2.2rem' }}
                />
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 10, top: 12 }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Location</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Pune, Bengaluru, Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Job Type</label>
              <select 
                className="form-select"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
              >
                <option value="">All Job Types</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="internship">Internship</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Experience Level</label>
              <select 
                className="form-select"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
              >
                <option value="">All Experience Levels</option>
                <option value="fresher">Fresher</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead / Architect</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', alignItems: 'center' }}>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={handleResetFilters}
            >
              <RotateCcw size={14} /> Reset
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <Filter size={14} /> Apply Filters
            </button>
          </div>
        </form>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 600, color: '#334155' }}>
          Showing {jobs.length} of {pagination.totalItems || jobs.length} openings
        </div>
      </div>

      {/* Job Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <div className="spinner" style={{ borderTopColor: '#2563eb', margin: '0 auto' }} />
          <p style={{ color: '#64748b', marginTop: '1rem' }}>Querying MongoDB jobs catalog...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <Briefcase size={40} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.3rem' }}>No matching jobs found</h3>
          <p style={{ color: '#64748b', marginTop: '0.4rem' }}>Try clearing filters or searching for alternative keywords.</p>
          <button className="btn btn-secondary" onClick={handleResetFilters} style={{ marginTop: '1rem' }}>
            Clear All Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {jobs.map((job) => (
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

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '3rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft size={16} /> Previous
          </button>

          <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
            Page {pagination.currentPage || page} of {pagination.totalPages}
          </span>

          <button
            className="btn btn-secondary btn-sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
