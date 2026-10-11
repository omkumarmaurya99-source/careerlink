// ==================================================
// CareerLink - Authentication Page (Login & Register)
// ==================================================

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, User, Mail, Lock, Building, Phone, Sparkles, AlertCircle } from 'lucide-react';

export const AuthPage = ({ onSuccess }) => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('jobseeker'); // 'jobseeker' | 'recruiter'

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const user = await login(email, password);
        onSuccess(user.role === 'recruiter' ? 'recruiter-dashboard' : 'seeker-dashboard');
      } else {
        const skillsArray = skillsInput
          .split(',')
          .map((s) => s.trim().toLowerCase())
          .filter((s) => s.length > 0);

        const payload = {
          name,
          email,
          password,
          role,
          phone: phone || undefined,
          company: role === 'recruiter' ? company : undefined,
          skills: role === 'jobseeker' ? skillsArray : undefined,
        };

        const user = await register(payload);
        onSuccess(user.role === 'recruiter' ? 'recruiter-dashboard' : 'seeker-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '520px' }}>
      <div className="card" style={{ padding: '2.5rem', boxShadow: 'var(--shadow-xl)' }}>
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #2563eb, #8b5cf6)', 
            width: 52, 
            height: 52, 
            borderRadius: 14, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1rem auto' 
          }}>
            <Briefcase size={26} color="white" />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            {isLogin ? 'Welcome Back' : 'Join CareerLink'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '0.3rem' }}>
            {isLogin 
              ? 'Enter your credentials to access your portal' 
              : 'Create your account to apply or hire talent'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="tabs">
          <button
            type="button"
            className={`tab-btn ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setError(null); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`tab-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setError(null); }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div style={{ 
            background: '#fee2e2', 
            color: '#b91c1c', 
            padding: '0.8rem 1rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontSize: '0.88rem' 
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Registration Role Selection */}
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">I am joining as a:</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <button
                  type="button"
                  onClick={() => setRole('jobseeker')}
                  className={`btn ${role === 'jobseeker' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.6rem' }}
                >
                  <User size={16} /> Job Seeker
                </button>
                <button
                  type="button"
                  onClick={() => setRole('recruiter')}
                  className={`btn ${role === 'recruiter' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.6rem' }}
                >
                  <Building size={16} /> Recruiter
                </button>
              </div>
            </div>
          )}

          {/* Name field (Register only) */}
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. Om Maurya"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              required
              placeholder="e.g. om.maurya@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              required
              minLength={6}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Conditional Fields for Registration */}
          {!isLogin && role === 'recruiter' && (
            <div className="form-group">
              <label className="form-label">Company / Organization</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. Amazon AWS, Google, TechCorp"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          )}

          {!isLogin && role === 'jobseeker' && (
            <div className="form-group">
              <label className="form-label">Technical Skills (Comma separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. JavaScript, Node.js, React, MongoDB"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
              />
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Used for instant skill-matching recommendations
              </span>
            </div>
          )}

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Phone Number (Optional)</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? <div className="spinner" /> : isLogin ? 'Sign In to Portal' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
