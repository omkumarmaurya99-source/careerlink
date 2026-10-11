// ==================================================
// CareerLink - Frontend API Service Layer
// ==================================================
// Backend REST API se communicate karne ke liye central client
// Automatically JWT Bearer token add karta hai authenticated calls mein

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('careerlink_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic fetch wrapper with standard error handling
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  // Agar FormData hai toh Content-Type browser ko khud set karne do
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.message || (data.errors && data.errors[0]?.message) || 'Something went wrong';
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // --- AUTH ---
  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    request('/auth/firebase-login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getProfile: () => request('/auth/profile'),

  updateProfile: (profileData) =>
    request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  // --- JOBS ---
  getJobs: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return request(`/jobs?${query.toString()}`);
  },

  searchJobs: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val) query.append(key, val);
    });
    return request(`/jobs/search?${query.toString()}`);
  },

  getJobById: (id) => request(`/jobs/${id}`),

  getMyJobs: () => request('/jobs/recruiter/my-jobs'),

  createJob: (jobData) =>
    request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    }),

  updateJob: (id, jobData) =>
    request(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    }),

  deleteJob: (id) =>
    request(`/jobs/${id}`, {
      method: 'DELETE',
    }),

  // --- APPLICATIONS ---
  applyJob: (formData) =>
    request('/applications', {
      method: 'POST',
      body: formData, // FormData instance
    }),

  getUserApplications: (userId) => request(`/applications/user/${userId}`),

  getJobApplications: (jobId) => request(`/applications/job/${jobId}`),

  updateApplicationStatus: (applicationId, statusData) =>
    request(`/applications/${applicationId}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    }),

  // --- RESUME & RECOMMENDATIONS ---
  uploadResume: (formData) =>
    request('/resume/upload', {
      method: 'POST',
      body: formData,
    }),

  getParsedResume: () => request('/resume/parsed'),

  getRecommendations: () => request('/recommendations'),

  // --- HEALTH ---
  getHealth: () => request('/health'),
};
