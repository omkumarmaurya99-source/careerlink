// ==================================================
// CareerLink - Main Application Assembly
// ==================================================
// Coordinates routing, navigation, modals, and global state

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { JobsPage } from './pages/JobsPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { AuthPage } from './pages/AuthPage';
import { SeekerDashboard } from './pages/SeekerDashboard';
import { RecruiterDashboard } from './pages/RecruiterDashboard';
import { ApplyModal } from './components/ApplyModal';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

function AppContent() {
  const { user, isAuthenticated, isRecruiter, isJobseeker } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [selectedJob, setSelectedJob] = useState(null);
  const [initialFilters, setInitialFilters] = useState({});
  const [applyModalJob, setApplyModalJob] = useState(null);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  
  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleNavigate = (view, extra = {}) => {
    if (view === 'jobs' && extra.keyword) {
      setInitialFilters({ keyword: extra.keyword });
    } else {
      setInitialFilters({});
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyClick = (job) => {
    if (!isAuthenticated) {
      showToast('Please sign in or create an account to apply', 'info');
      setCurrentView('auth');
      return;
    }
    if (isRecruiter) {
      showToast('Recruiters cannot apply for jobs. Please use a Jobseeker account.', 'error');
      return;
    }
    setApplyModalJob(job);
  };

  const handleApplySuccess = (jobId) => {
    setAppliedJobIds((prev) => [...prev, jobId]);
    showToast('Application submitted successfully!', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar currentView={currentView} setCurrentView={handleNavigate} />

      <main style={{ flex: 1 }}>
        {currentView === 'home' && (
          <HomePage
            setCurrentView={handleNavigate}
            setSelectedJob={setSelectedJob}
            onApplyJob={handleApplyClick}
          />
        )}

        {currentView === 'jobs' && (
          <JobsPage
            initialFilters={initialFilters}
            setSelectedJob={setSelectedJob}
            setCurrentView={handleNavigate}
            onApplyJob={handleApplyClick}
          />
        )}

        {currentView === 'job-detail' && (
          <JobDetailPage
            job={selectedJob}
            onBack={() => handleNavigate('jobs')}
            onApply={handleApplyClick}
            isApplied={appliedJobIds.includes(selectedJob?._id)}
          />
        )}

        {currentView === 'auth' && (
          <AuthPage
            onSuccess={(targetView) => {
              showToast('Signed in successfully!', 'success');
              handleNavigate(targetView || 'home');
            }}
          />
        )}

        {currentView === 'seeker-dashboard' && (
          isAuthenticated && isJobseeker ? (
            <SeekerDashboard
              onApplyJob={handleApplyClick}
              setSelectedJob={setSelectedJob}
              setCurrentView={handleNavigate}
            />
          ) : (
            <AuthPage onSuccess={() => handleNavigate('seeker-dashboard')} />
          )
        )}

        {currentView === 'recruiter-dashboard' && (
          isAuthenticated && isRecruiter ? (
            <RecruiterDashboard />
          ) : (
            <AuthPage onSuccess={() => handleNavigate('recruiter-dashboard')} />
          )
        )}
      </main>

      {/* Apply Modal */}
      {applyModalJob && (
        <ApplyModal
          job={applyModalJob}
          onClose={() => setApplyModalJob(null)}
          onSuccess={handleApplySuccess}
        />
      )}

      {/* Floating Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'success' && <CheckCircle2 size={18} />}
            {toast.type === 'error' && <AlertCircle size={18} />}
            {toast.type === 'info' && <Info size={18} />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
