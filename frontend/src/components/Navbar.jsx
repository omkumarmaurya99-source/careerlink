// ==================================================
// CareerLink - Navigation Bar
// ==================================================
// Top navbar with logo, public links, dynamic auth buttons, and role badges

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, User, LogOut, PlusCircle, Search, FileText } from 'lucide-react';

export const Navbar = ({ currentView, setCurrentView }) => {
  const { user, isAuthenticated, isRecruiter, isJobseeker, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="container nav-container">
        {/* Brand Logo */}
        <div 
          className="logo" 
          onClick={() => setCurrentView('home')} 
          style={{ cursor: 'pointer' }}
        >
          <div className="logo-badge">
            <Briefcase size={20} />
          </div>
          <span>CareerLink</span>
        </div>

        {/* Navigation Links */}
        <div className="nav-links">
          <button
            className={`nav-link ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentView('home')}
          >
            Home
          </button>
          
          <button
            className={`nav-link ${currentView === 'jobs' ? 'active' : ''}`}
            onClick={() => setCurrentView('jobs')}
          >
            Explore Jobs
          </button>

          {/* Recruiter Dashboard */}
          {isAuthenticated && isRecruiter && (
            <button
              className={`nav-link ${currentView === 'recruiter-dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('recruiter-dashboard')}
            >
              Recruiter Dashboard
            </button>
          )}

          {/* Jobseeker Dashboard */}
          {isAuthenticated && isJobseeker && (
            <button
              className={`nav-link ${currentView === 'seeker-dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('seeker-dashboard')}
            >
              My Dashboard
            </button>
          )}

          {/* External Links to Swagger */}
          <a
            href="http://localhost:5000/api-docs"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
            title="Interactive Swagger API Documentation"
          >
            <FileText size={16} style={{ display: 'inline', marginRight: 4 }} />
            API Docs
          </a>
        </div>

        {/* User Auth Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</div>
                <span className={`badge ${isRecruiter ? 'badge-primary' : 'badge-success'}`}>
                  {user.role}
                </span>
              </div>
              <button 
                onClick={logout} 
                className="btn btn-secondary btn-sm"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCurrentView('auth')}
              className="btn btn-primary"
            >
              <User size={16} />
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
