// ==================================================
// CareerLink - Footer Component
// ==================================================

import React from 'react';
import { Briefcase, Heart, Code, ExternalLink } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '3.5rem 0 2rem 0', marginTop: '4rem', borderTop: '1px solid #1e293b' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'white', fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.8rem' }}>
              <div style={{ background: '#2563eb', padding: '0.3rem 0.5rem', borderRadius: '6px' }}>
                <Briefcase size={18} color="white" />
              </div>
              <span>CareerLink</span>
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>
              Enterprise RESTful Job Portal Backend & Full-Stack System built with Node.js, Express, MongoDB, and Firebase Authentication.
            </p>
          </div>

          {/* Student & Academic Info */}
          <div>
            <h4 style={{ color: 'white', fontSize: '1rem', marginBottom: '0.8rem' }}>Academic Submission</h4>
            <ul style={{ listStyle: 'none', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li><strong style={{ color: '#e2e8f0' }}>Student:</strong> Om Maurya</li>
              <li><strong style={{ color: '#e2e8f0' }}>Roll No:</strong> 150096725208</li>
              <li><strong style={{ color: '#e2e8f0' }}>Program:</strong> B.Tech CSE (Cohort: Jeff Bezos)</li>
              <li><strong style={{ color: '#e2e8f0' }}>Institution:</strong> ITM Skills University</li>
            </ul>
          </div>

          {/* Developer Resources */}
          <div>
            <h4 style={{ color: 'white', fontSize: '1rem', marginBottom: '0.8rem' }}>Live Developer APIs</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
              <a 
                href="http://localhost:5000/api-docs" 
                target="_blank" 
                rel="noreferrer"
                style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                Interactive Swagger UI <ExternalLink size={14} />
              </a>
              <a 
                href="http://localhost:5000/health" 
                target="_blank" 
                rel="noreferrer"
                style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                Server Health Diagnostic <ExternalLink size={14} />
              </a>
              <span style={{ color: '#64748b' }}>
                Postman Collection: Ready to import
              </span>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.82rem', color: '#64748b' }}>
          CareerLink Job Portal Case Study © 2026. Built with precision and care for ITM Skills University.
        </div>
      </div>
    </footer>
  );
};
